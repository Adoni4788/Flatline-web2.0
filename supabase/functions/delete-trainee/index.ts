import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type DeleteTraineePayload = {
  userId?: string;
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

    const { data: adminProfile, error: adminProfileError } = await adminClient
      .from('users')
      .select('id, role, status')
      .eq('id', authUserData.user.id)
      .single();

    if (adminProfileError || !adminProfile || adminProfile.role !== 'admin' || adminProfile.status !== 'active') {
      return jsonResponse({ error: 'Only active admins can delete trainees' }, 403);
    }

    const payload = await req.json() as DeleteTraineePayload;
    const userId = payload.userId?.trim();

    if (!userId) {
      return jsonResponse({ error: 'userId is required' }, 400);
    }

    if (userId === adminProfile.id) {
      return jsonResponse({ error: 'You cannot delete your own account' }, 400);
    }

    // Clean up child rows first so nothing blocks the auth deletion cascade
    await adminClient.from('enrollments').delete().eq('user_id', userId);
    await adminClient.from('exam_attempts').delete().eq('user_id', userId);

    const { error: profileError } = await adminClient.from('users').delete().eq('id', userId);
    if (profileError) {
      return jsonResponse({ error: profileError.message }, 400);
    }

    const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(userId);
    if (authDeleteError) {
      return jsonResponse({
        error: `Profile deleted but auth user cleanup failed: ${authDeleteError.message}. The email may still be locked in auth — please contact support.`,
        partial: true,
      }, 207);
    }

    // Verify the auth user is actually gone (defensive check — sometimes the delete
    // call returns success but the user lingers due to FK constraints or replication delay)
    const { data: stillExists } = await adminClient.auth.admin.getUserById(userId);
    if (stillExists?.user) {
      return jsonResponse({
        error: 'Auth user deletion did not complete. Please retry or contact support.',
        partial: true,
      }, 207);
    }

    return jsonResponse({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected server error';
    return jsonResponse({ error: message }, 500);
  }
});
