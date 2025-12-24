import { NextResponse } from 'next/server'

// Email API Route Handler
export async function POST(request) {
  try {
    const { to, from, subject, html } = await request.json()

    // Validate required fields
    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, html' },
        { status: 400 }
      )
    }

    // Example integration with SendGrid
    if (process.env.SENDGRID_API_KEY) {
      const sgMail = require('@sendgrid/mail')
      sgMail.setApiKey(process.env.SENDGRID_API_KEY)

      const msg = {
        to: to,
        from: from || {
          email: process.env.FROM_EMAIL || 'noreply@1necard.co',
          name: process.env.FROM_NAME || 'Onecard'
        },
        subject: subject,
        html: html,
      }

      await sgMail.send(msg)
      return NextResponse.json({ success: true, message: 'Email sent successfully' })
    }

    // Example integration with Postmark
    if (process.env.POSTMARK_SERVER_TOKEN) {
      const postmark = require('postmark')
      const client = new postmark.ServerClient(process.env.POSTMARK_SERVER_TOKEN)

      await client.sendEmail({
        From: from?.email || process.env.FROM_EMAIL || 'noreply@1necard.co',
        To: to,
        Subject: subject,
        HtmlBody: html,
      })

      return NextResponse.json({ success: true, message: 'Email sent successfully' })
    }

    // Example integration with Resend
    if (process.env.RESEND_API_KEY) {
      const { Resend } = require('resend')
      const resend = new Resend(process.env.RESEND_API_KEY)

      await resend.emails.send({
        from: from?.email || 'noreply@1necard.co',
        to: to,
        subject: subject,
        html: html,
      })

      return NextResponse.json({ success: true, message: 'Email sent successfully' })
    }

    // Example integration with Mailgun
    if (process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN) {
      const formData = require('form-data')
      const Mailgun = require('mailgun.js')
      
      const mailgun = new Mailgun(formData)
      const mg = mailgun.client({
        username: 'api',
        key: process.env.MAILGUN_API_KEY,
      })

      await mg.messages.create(process.env.MAILGUN_DOMAIN, {
        from: from?.email || 'noreply@1necard.co',
        to: to,
        subject: subject,
        html: html,
      })

      return NextResponse.json({ success: true, message: 'Email sent successfully' })
    }

    // If no email service is configured, return error
    return NextResponse.json(
      { 
        error: 'No email service configured. Please set up SendGrid, Postmark, Resend, or Mailgun.',
        details: 'Add the appropriate API key to your environment variables'
      },
      { status: 500 }
    )

  } catch (error) {
    console.error('Email sending error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to send email',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

// GET endpoint for testing email service configuration
export async function GET() {
  const services = {
    sendgrid: !!process.env.SENDGRID_API_KEY,
    postmark: !!process.env.POSTMARK_SERVER_TOKEN,
    resend: !!process.env.RESEND_API_KEY,
    mailgun: !!(process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN)
  }

  const activeServices = Object.entries(services)
    .filter(([, configured]) => configured)
    .map(([service]) => service)

  return NextResponse.json({
    configured: activeServices.length > 0,
    activeServices,
    message: activeServices.length > 0 
      ? `Email service ready with: ${activeServices.join(', ')}` 
      : 'No email service configured'
  })
}