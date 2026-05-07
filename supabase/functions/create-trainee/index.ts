import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type CreateTraineePayload = {
  firstName?: string;
  lastName?: string;
  email?: string;
  source?: string;
  password?: string;
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
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
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
      return jsonResponse({ error: 'Only active admins can create trainees' }, 403);
    }

    const payload = await req.json() as CreateTraineePayload;
    const firstName = payload.firstName?.trim();
    const lastName = payload.lastName?.trim();
    const email = payload.email?.trim().toLowerCase();
    const source = payload.source?.trim() || 'Direct';
    const password = payload.password || '';

    if (!firstName || !lastName || !email || !password) {
      return jsonResponse({ error: 'First name, last name, email, and password are required' }, 400);
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return jsonResponse({ error: 'A valid email address is required' }, 400);
    }

    const { data: createdAuthData, error: createAuthError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (createAuthError || !createdAuthData.user) {
      return jsonResponse({ error: createAuthError?.message || 'Failed to create auth user' }, 400);
    }

    const userId = createdAuthData.user.id;
    const profileRecord = {
      id: userId,
      first_name: firstName,
      last_name: lastName,
      email,
      role: 'user',
      status: 'active',
      source,
    };

    const { error: profileError } = await adminClient
      .from('users')
      .insert([profileRecord]);

    if (profileError) {
      await adminClient.auth.admin.deleteUser(userId);
      return jsonResponse({ error: profileError.message }, 400);
    }

    return jsonResponse({
      user: {
        id: userId,
        firstName,
        lastName,
        email,
        role: 'user',
        status: 'active',
        source,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected server error';
    return jsonResponse({ error: message }, 500);
  }
});
