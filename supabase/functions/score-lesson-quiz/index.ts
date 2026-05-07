import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type Payload = {
  lessonId?: string;
  courseId?: string;
  answers?: Record<string, string[]>;
};

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceRoleKey) {
      return jsonResponse({ error: 'Server is missing Supabase function configuration' }, 500);
    }

    const authHeader = req.headers.get('Authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (!token) {
      return jsonResponse({ error: 'Missing authorization token' }, 401);
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: authUserData, error: authUserError } = await adminClient.auth.getUser(token);
    if (authUserError || !authUserData.user) {
      return jsonResponse({ error: 'Invalid authorization token' }, 401);
    }
    const userId = authUserData.user.id;

    const payload = await req.json() as Payload;
    const lessonId = payload.lessonId?.trim();
    const courseId = payload.courseId?.trim();
    const answers = payload.answers || {};
    if (!lessonId || !courseId) {
      return jsonResponse({ error: 'lessonId and courseId are required' }, 400);
    }

    const { data: lesson, error: lessonError } = await adminClient
      .from('lessons')
      .select('id, type, passing_score, questions, module_id')
      .eq('id', lessonId)
      .single();

    if (lessonError || !lesson) {
      return jsonResponse({ error: 'Lesson not found' }, 404);
    }
    if (lesson.type !== 'quiz') {
      return jsonResponse({ error: 'Lesson is not a quiz' }, 400);
    }

    const { data: enrollment, error: enrollmentError } = await adminClient
      .from('enrollments')
      .select('id, completed_lessons, progress, status')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();

    if (enrollmentError || !enrollment) {
      return jsonResponse({ error: 'You are not enrolled in this course' }, 403);
    }

    let score = 0;
    let totalPoints = 0;
    const questions = Array.isArray(lesson.questions) ? lesson.questions : [];
    for (const question of questions) {
      const points = Number(question?.points) || 1;
      totalPoints += points;
      const userAnswers = Array.isArray(answers[question.id]) ? answers[question.id] : [];
      const correctAnswers = (Array.isArray(question?.options) ? question.options : [])
        .filter((o: any) => o?.isCorrect)
        .map((o: any) => o.id);

      if (question?.type === 'single_choice') {
        if (userAnswers.length === 1 && correctAnswers.includes(userAnswers[0])) {
          score += points;
        }
      } else {
        const isCorrect =
          userAnswers.length === correctAnswers.length &&
          userAnswers.every((a: string) => correctAnswers.includes(a));
        if (isCorrect) score += points;
      }
    }

    const percentage = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;
    const passingScore = lesson.passing_score ?? 70;
    const passed = percentage >= passingScore;

    if (!passed) {
      return jsonResponse({ score: percentage, passed, passingScore });
    }

    const completed: string[] = Array.isArray(enrollment.completed_lessons) ? enrollment.completed_lessons : [];
    if (!completed.includes(lessonId)) {
      const newCompleted = [...completed, lessonId];

      const { data: courseModules } = await adminClient
        .from('modules')
        .select('id')
        .eq('course_id', courseId);
      const moduleIds = (courseModules || []).map((m: any) => m.id);

      let totalLessons = 0;
      if (moduleIds.length > 0) {
        const { data: courseLessons } = await adminClient
          .from('lessons')
          .select('id')
          .in('module_id', moduleIds);
        totalLessons = courseLessons?.length || 0;
      }

      const newProgress = totalLessons > 0 ? Math.round((newCompleted.length / totalLessons) * 100) : 0;
      const newStatus = newProgress === 100 ? 'completed' : 'active';

      const { error: updateErr } = await adminClient
        .from('enrollments')
        .update({
          completed_lessons: newCompleted,
          progress: newProgress,
          status: newStatus,
          completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
        })
        .eq('id', enrollment.id);

      if (updateErr) {
        return jsonResponse({ error: updateErr.message }, 400);
      }
    }

    return jsonResponse({ score: percentage, passed, passingScore });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected server error';
    return jsonResponse({ error: message }, 500);
  }
});
