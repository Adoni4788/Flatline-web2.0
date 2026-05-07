import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface ContactFormPayload {
  firstName: string
  lastName: string
  email: string
  subject: string
  message: string
}

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      console.error('RESEND_API_KEY is not set')
      return new Response(JSON.stringify({ error: 'Email service not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const body: ContactFormPayload = await req.json()
    const { firstName, lastName, email, subject, message } = body

    // Basic validation
    if (!firstName || !lastName || !email || !message) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!email.includes('@')) {
      return new Response(JSON.stringify({ error: 'Invalid email address' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const safeFirstName = escapeHtml(firstName)
    const safeFullName = escapeHtml(`${firstName} ${lastName}`)
    const safeEmail = escapeHtml(email)
    const safeSubjectLine = escapeHtml(subject || 'General Inquiry')
    const safeMessage = escapeHtml(message)
    const fullName = `${firstName} ${lastName}`
    const subjectLine = subject || 'General Inquiry'

    // Send notification email to the business
    const notifyResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Flatline Contact Form <noreply@fstsolutionsltd.com>',
        to: ['info@fstsolutionsltd.com'],
        reply_to: email,
        subject: `[Contact Form] ${subjectLine} — ${fullName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #030712; color: #ffffff; padding: 32px; border: 1px solid #1f2937;">
            <div style="border-left: 4px solid #dc2626; padding-left: 16px; margin-bottom: 24px;">
              <h1 style="margin: 0; font-size: 24px; color: #ffffff;">New Contact Form Submission</h1>
              <p style="margin: 4px 0 0; color: #9ca3af; font-size: 14px;">Flatline Security Training</p>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #1f2937; color: #9ca3af; width: 120px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Name</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #1f2937; color: #ffffff;">${safeFullName}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #1f2937; color: #9ca3af; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Email</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #1f2937; color: #ffffff;"><a href="mailto:${safeEmail}" style="color: #dc2626;">${safeEmail}</a></td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #1f2937; color: #9ca3af; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Subject</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #1f2937; color: #ffffff;">${safeSubjectLine}</td>
              </tr>
            </table>

            <div style="background: #0a0f1c; border: 1px solid #1f2937; padding: 20px; margin-bottom: 24px;">
              <p style="margin: 0 0 8px; color: #9ca3af; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Message</p>
              <p style="margin: 0; color: #ffffff; line-height: 1.6; white-space: pre-wrap;">${safeMessage}</p>
            </div>

            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              Reply directly to this email to respond to ${safeFirstName} at ${safeEmail}.
            </p>
          </div>
        `,
      }),
    })

    if (!notifyResponse.ok) {
      const errorData = await notifyResponse.json()
      console.error('Resend API error (notify):', errorData)
      return new Response(JSON.stringify({ error: 'Failed to send email' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Send auto-reply confirmation to the sender
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Flatline Security Training <noreply@fstsolutionsltd.com>',
        to: [email],
        subject: 'Message Received — Flatline Security Training',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #030712; color: #ffffff; padding: 32px; border: 1px solid #1f2937;">
            <div style="border-left: 4px solid #dc2626; padding-left: 16px; margin-bottom: 24px;">
              <h1 style="margin: 0; font-size: 24px; color: #ffffff;">Transmission Received</h1>
              <p style="margin: 4px 0 0; color: #9ca3af; font-size: 14px;">Flatline Security Training</p>
            </div>

            <p style="color: #d1d5db; line-height: 1.6;">Hi ${safeFirstName},</p>
            <p style="color: #d1d5db; line-height: 1.6;">
              Thank you for reaching out. We've received your message regarding <strong style="color: #ffffff;">${safeSubjectLine}</strong> and will get back to you within 1–2 business days.
            </p>
            <p style="color: #d1d5db; line-height: 1.6;">
              If your matter is urgent, please call our Operations Center directly at <strong style="color: #ffffff;">+1 (876) 555-2847</strong>, Mon–Fri, 0900–1800 EST.
            </p>

            <hr style="border: none; border-top: 1px solid #1f2937; margin: 24px 0;" />

            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              Flatline Security Training · 123 Security Blvd, Discovery Bay, St Ann, Jamaica<br />
              <a href="mailto:info@fstsolutionsltd.com" style="color: #dc2626;">info@fstsolutionsltd.com</a>
            </p>
          </div>
        `,
      }),
    })
    // We don't fail if the auto-reply errors — notification already sent

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Unexpected error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
