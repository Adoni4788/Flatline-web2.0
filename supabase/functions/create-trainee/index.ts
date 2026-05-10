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

    // Pre-flight: clean up any orphans from prior incomplete deletions before creating.
    // Orphans can exist in auth.users (auth user lingered after delete), in public.users
    // (profile lingered), or both. A genuine active user has matching rows in both tables.
    const { data: existingProfile } = await adminClient
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    const { data: usersList } = await adminClient.auth.admin.listUsers({ perPage: 1000 });
    const existingAuth = usersList?.users.find((u) => u.email?.toLowerCase() === email) ?? null;

    // Both rows exist and reference the same id → real active user, refuse
    if (existingProfile && existingAuth && existingProfile.id === existingAuth.id) {
      return jsonResponse({ error: 'A user with this email already exists' }, 400);
    }

    // Orphaned profile row → delete its dependent rows then the profile itself
    if (existingProfile) {
      await adminClient.from('enrollments').delete().eq('user_id', existingProfile.id);
      await adminClient.from('exam_attempts').delete().eq('user_id', existingProfile.id);
      await adminClient.from('users').delete().eq('id', existingProfile.id);
    }

    // Orphaned auth user (or one with a mismatched id) → delete it
    if (existingAuth && existingAuth.id !== existingProfile?.id) {
      await adminClient.auth.admin.deleteUser(existingAuth.id);
    }

    const { data: createdAuthData, error: createAuthError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

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

    // Generate a one-time activation code (and link as fallback). We extract the
    // email_otp from the link response — that's the 6-digit code the trainee will
    // enter on /activate. Codes are scanner-proof, unlike clickable links.
    let setupLink: string | null = null;
    let activationCode: string | null = null;
    const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: {
        redirectTo: 'https://www.fstsolutionsltd.com',
      },
    });

    if (linkError) {
      console.error('Failed to generate activation code:', linkError);
    } else {
      setupLink = linkData?.properties?.action_link ?? null;
      activationCode = (linkData?.properties as { email_otp?: string })?.email_otp ?? null;
    }

    // Send welcome email with setup link — non-blocking, don't fail account creation if this errors
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    let emailSent = false;
    let emailError: string | null = null;
    if (!resendApiKey) {
      emailError = 'RESEND_API_KEY not configured';
    } else if (!activationCode) {
      emailError = linkError?.message || 'Activation code could not be generated';
    } else {
      try {
        const resendResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Flatline Security Training <noreply@fstsolutionsltd.com>',
            to: [email],
            subject: 'Your Flatline Security Training activation code',
            text: `Hi ${firstName} ${lastName},\n\nYour training portal account is ready. Use the code below to activate it and set your password.\n\nActivation code: ${activationCode}\n\nQuick activation link: https://www.fstsolutionsltd.com/#/activate?email=${encodeURIComponent(email)}&code=${activationCode}\n\nOr go to https://www.fstsolutionsltd.com/#/activate manually and enter your email and the code above.\n\nThis code expires in 24 hours.\n\nIf you didn't expect this email, you can safely ignore it.\n\nFlatline Security Training & Solutions Ltd\ninfo@fstsolutionsltd.com`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #030712; color: #ffffff; padding: 32px; border: 1px solid #1f2937;">
                <div style="border-left: 4px solid #dc2626; padding-left: 16px; margin-bottom: 24px;">
                  <h1 style="margin: 0; font-size: 24px; color: #ffffff;">Welcome to Flatline Security Training</h1>
                  <p style="margin: 4px 0 0; color: #9ca3af; font-size: 14px;">Activate your account to get started</p>
                </div>

                <p style="color: #d1d5db; line-height: 1.6;">Hi ${firstName} ${lastName},</p>
                <p style="color: #d1d5db; line-height: 1.6;">
                  Your training portal account is ready. Use the activation code below to set your password and access your courses.
                </p>

                <div style="text-align: center; margin: 32px 0;">
                  <p style="margin: 0 0 12px; color: #9ca3af; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em;">Your activation code</p>
                  <div style="display: inline-block; background: #0a0f1c; border: 1px solid #dc2626; padding: 20px 32px; font-family: 'Courier New', monospace; font-size: 32px; font-weight: 700; color: #ffffff; letter-spacing: 0.3em;">
                    ${activationCode}
                  </div>
                </div>

                <div style="text-align: center; margin: 32px 0;">
                  <a href="https://www.fstsolutionsltd.com/#/activate?email=${encodeURIComponent(email)}&code=${activationCode}" style="display: inline-block; background: #dc2626; color: #ffffff; padding: 14px 28px; text-decoration: none; font-weight: 600; letter-spacing: 0.05em;">Activate My Account</a>
                  <p style="margin: 12px 0 0; color: #6b7280; font-size: 12px;">One-click activation — opens the form with your code pre-filled</p>
                </div>

                <div style="background: #0a0f1c; border: 1px solid #1f2937; padding: 20px; margin-bottom: 24px;">
                  <p style="margin: 0 0 8px; color: #9ca3af; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Or activate manually</p>
                  <ol style="margin: 0; padding-left: 20px; color: #d1d5db; line-height: 1.8;">
                    <li>Go to <a href="https://www.fstsolutionsltd.com/#/activate" style="color: #dc2626;">www.fstsolutionsltd.com/activate</a></li>
                    <li>Enter your email: <strong style="color: #ffffff;">${email}</strong></li>
                    <li>Enter the code above</li>
                    <li>Choose your password</li>
                  </ol>
                </div>

                <p style="color: #9ca3af; font-size: 13px; line-height: 1.6;">
                  This code expires in 24 hours. Once your password is set, you can sign in any time at <a href="https://www.fstsolutionsltd.com" style="color: #dc2626;">www.fstsolutionsltd.com</a>.
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
        if (resendResponse.ok) {
          emailSent = true;
        } else {
          let detail = `${resendResponse.status}`;
          try {
            const body = await resendResponse.json();
            detail = body?.message || body?.error || JSON.stringify(body);
          } catch (_) { /* ignore parse error */ }
          emailError = `Resend rejected the email: ${detail}`;
          console.error('Resend rejected the email:', detail);
        }
      } catch (emailErr) {
        emailError = emailErr instanceof Error ? emailErr.message : 'Unknown email error';
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
      activationCode,
      emailSent,
      emailError,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected server error';
    return jsonResponse({ error: message }, 500);
  }
});
