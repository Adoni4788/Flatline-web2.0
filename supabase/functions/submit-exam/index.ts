import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type Payload = {
  attemptId?: string;
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
    const attemptId = payload.attemptId?.trim();
    const answers = payload.answers || {};
    if (!attemptId) {
      return jsonResponse({ error: 'attemptId is required' }, 400);
    }

    const { data: attempt, error: attemptError } = await adminClient
      .from('exam_attempts')
      .select('id, exam_id, user_id, status')
      .eq('id', attemptId)
      .single();

    if (attemptError || !attempt) {
      return jsonResponse({ error: 'Exam attempt not found' }, 404);
    }
    if (attempt.user_id !== userId) {
      return jsonResponse({ error: 'You can only submit your own exam attempts' }, 403);
    }
    if (attempt.status !== 'in_progress') {
      return jsonResponse({ error: 'This attempt has already been submitted' }, 400);
    }

    const { data: exam, error: examError } = await adminClient
      .from('exams')
      .select('id, passing_score, questions')
      .eq('id', attempt.exam_id)
      .single();

    if (examError || !exam) {
      return jsonResponse({ error: 'Exam not found' }, 404);
    }

    let score = 0;
    let totalPoints = 0;

    const questions = Array.isArray(exam.questions) ? exam.questions : [];
    for (const question of questions) {
      const points = Number(question?.points) || 0;
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
    const passed = percentage >= (exam.passing_score ?? 70);
    const submittedAt = new Date().toISOString();

    const { error: updateError } = await adminClient
      .from('exam_attempts')
      .update({
        submitted_at: submittedAt,
        answers,
        score: percentage,
        passed,
        status: 'submitted',
      })
      .eq('id', attemptId);

    if (updateError) {
      return jsonResponse({ error: updateError.message }, 400);
    }

    return jsonResponse({ score: percentage, passed, submittedAt });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected server error';
    return jsonResponse({ error: message }, 500);
  }
});
