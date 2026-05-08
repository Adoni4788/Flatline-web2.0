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

    // Send welcome email with credentials — non-blocking, don't fail account creation if this errors
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (resendApiKey) {
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
            subject: 'Your Flatline Security Training Account',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #030712; color: #ffffff; padding: 32px; border: 1px solid #1f2937;">
                <div style="border-left: 4px solid #dc2626; padding-left: 16px; margin-bottom: 24px;">
                  <h1 style="margin: 0; font-size: 24px; color: #ffffff;">Welcome to Flatline Security Training</h1>
                  <p style="margin: 4px 0 0; color: #9ca3af; font-size: 14px;">Your account is ready</p>
                </div>

                <p style="color: #d1d5db; line-height: 1.6;">Hi ${firstName},</p>
                <p style="color: #d1d5db; line-height: 1.6;">
                  Your training portal account has been created. Use the credentials below to log in and begin your training.
                </p>

                <div style="background: #0a0f1c; border: 1px solid #1f2937; padding: 20px; margin: 24px 0;">
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 10px 0; border-bottom: 1px solid #1f2937; color: #9ca3af; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; width: 100px;">Portal</td>
                      <td style="padding: 10px 0; border-bottom: 1px solid #1f2937;"><a href="https://www.fstsolutionsltd.com" style="color: #dc2626;">https://www.fstsolutionsltd.com</a></td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 0; border-bottom: 1px solid #1f2937; color: #9ca3af; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Email</td>
                      <td style="padding: 10px 0; border-bottom: 1px solid #1f2937; color: #ffffff;">${email}</td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 0; color: #9ca3af; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Password</td>
                      <td style="padding: 10px 0; color: #ffffff; font-family: monospace; font-size: 15px; letter-spacing: 0.05em;">${password}</td>
                    </tr>
                  </table>
                </div>

                <p style="color: #d1d5db; line-height: 1.6;">
                  For security, we recommend changing your password after your first login.
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
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected server error';
    return jsonResponse({ error: message }, 500);
  }
});
