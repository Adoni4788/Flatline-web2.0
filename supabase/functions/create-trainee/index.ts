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

    let { data: createdAuthData, error: createAuthError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    // If the email is already taken at the auth level, check whether it's an orphan
    // (auth user exists but no profile in public.users — happens if a prior delete
    // didn't clean up auth). If orphan, remove it and retry. Otherwise, real duplicate.
    if (createAuthError && /already|registered|exists|duplicate/i.test(createAuthError.message)) {
      const { data: usersList } = await adminClient.auth.admin.listUsers({ perPage: 1000 });
      const existingAuth = usersList?.users.find((u) => u.email?.toLowerCase() === email);

      if (existingAuth) {
        const { data: existingProfile } = await adminClient
          .from('users')
          .select('id')
          .eq('id', existingAuth.id)
          .maybeSingle();

        if (!existingProfile) {
          await adminClient.auth.admin.deleteUser(existingAuth.id);
          const retry = await adminClient.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
          });
          createdAuthData = retry.data;
          createAuthError = retry.error;
        } else {
          return jsonResponse({ error: 'A user with this email already exists' }, 400);
        }
      }
    }

    if (createAuthError || !createdAuthData?.user) {
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

    // Generate a one-time setup link so the trainee can set their own password
    let setupLink: string | null = null;
    const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: {
        redirectTo: 'https://www.fstsolutionsltd.com/reset-password',
      },
    });

    if (linkError) {
      console.error('Failed to generate setup link:', linkError);
    } else {
      setupLink = linkData?.properties?.action_link ?? null;
    }

    // Send welcome email with setup link — non-blocking, don't fail account creation if this errors
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (resendApiKey && setupLink) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Flatline Security Training <noreply@fstsolutionsltd.com>',
            to: [email],
            subject: 'Set up your Flatline Security Training account',
            text: `Hi ${firstName},\n\nYour training portal account has been created. To get started, set your password using the link below:\n\n${setupLink}\n\nThis link expires in 1 hour. Once you've set your password, you can sign in any time at https://www.fstsolutionsltd.com.\n\nIf you didn't expect this email, you can safely ignore it.\n\nFlatline Security Training & Solutions Ltd\ninfo@fstsolutionsltd.com`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #030712; color: #ffffff; padding: 32px; border: 1px solid #1f2937;">
                <div style="border-left: 4px solid #dc2626; padding-left: 16px; margin-bottom: 24px;">
                  <h1 style="margin: 0; font-size: 24px; color: #ffffff;">Welcome to Flatline Security Training</h1>
                  <p style="margin: 4px 0 0; color: #9ca3af; font-size: 14px;">Set up your account to get started</p>
                </div>

                <p style="color: #d1d5db; line-height: 1.6;">Hi ${firstName},</p>
                <p style="color: #d1d5db; line-height: 1.6;">
                  Your training portal account has been created. Click the button below to set your password and access your courses.
                </p>

                <div style="text-align: center; margin: 32px 0;">
                  <a href="${setupLink}" style="display: inline-block; background: #dc2626; color: #ffffff; padding: 14px 28px; text-decoration: none; font-weight: 600; letter-spacing: 0.05em;">Set Up My Account</a>
                </div>

                <p style="color: #9ca3af; font-size: 13px; line-height: 1.6;">
                  If the button doesn't work, copy and paste this link into your browser:<br />
                  <span style="color: #d1d5db; word-break: break-all;">${setupLink}</span>
                </p>

                <p style="color: #9ca3af; font-size: 13px; line-height: 1.6;">
                  This link will expire in 1 hour. Once your password is set, you can sign in any time at <a href="https://www.fstsolutionsltd.com" style="color: #dc2626;">www.fstsolutionsltd.com</a>.
                </p>

                <hr style="border: none; border-top: 1px solid #1f2937; margin: 24px 0;" />

                <p style="color: #6b7280; font-size: 12px; margin: 0;">
                  Flatline Security Training &amp; Solutions Ltd<br />
                  <a href="mailto:info@fstsolutionsltd.com" style="color: #dc2626;">info@fstsolutionsltd.com</a>
                </p>
              </div>
            `,
          }),
        });
      } catch (emailErr) {
        console.error('Welcome email failed (account still created):', emailErr);
      }
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
      setupLink,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected server error';
    return jsonResponse({ error: message }, 500);
  }
});
