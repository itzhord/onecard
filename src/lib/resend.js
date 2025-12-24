import { Resend } from 'resend';

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send an email using Resend
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} [options.from] - Sender email (defaults to EMAIL_FROM env var)
 * @param {string} [options.text] - Plain text content (optional)
 * @returns {Promise<Object>} - Resend API response
 */
export async function sendEmail({ to, subject, html, from, text }) {
  try {
    const fromEmail = from || process.env.EMAIL_FROM || 'noreply@1necard.co';
    
    const emailData = {
      from: fromEmail,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    };

    // Add text version if provided
    if (text) {
      emailData.text = text;
    }

    const { data, error } = await resend.emails.send(emailData);

    if (error) {
      console.error('Resend error:', error);
      throw new Error(error.message || 'Failed to send email');
    }

    return { success: true, data };
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
}

/**
 * Send a welcome email to new users
 */
export async function sendWelcomeEmail(userEmail, userName) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to OneCard! 🎉</h1>
          </div>
          <div class="content">
            <p>Hi ${userName || 'there'},</p>
            <p>Thank you for joining OneCard! We're excited to have you on board.</p>
            <p>With OneCard, you can create beautiful digital business cards and share them instantly with anyone, anywhere.</p>
            <p>Get started by creating your first card:</p>
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard" class="button">Go to Dashboard</a>
            <p>If you have any questions, feel free to reach out to our support team.</p>
            <p>Best regards,<br>The OneCard Team</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} OneCard. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: userEmail,
    subject: 'Welcome to OneCard!',
    html,
  });
}

/**
 * Send email verification
 */
export async function sendVerificationEmail(userEmail, verificationUrl) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Verify Your Email</h1>
          </div>
          <div class="content">
            <p>Please verify your email address by clicking the button below:</p>
            <a href="${verificationUrl}" class="button">Verify Email</a>
            <p>If you didn't create an account with OneCard, you can safely ignore this email.</p>
            <p>This link will expire in 24 hours.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} OneCard. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: userEmail,
    subject: 'Verify Your Email - OneCard',
    html,
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(userEmail, resetUrl) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Reset Your Password</h1>
          </div>
          <div class="content">
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <a href="${resetUrl}" class="button">Reset Password</a>
            <p>If you didn't request a password reset, you can safely ignore this email.</p>
            <p>This link will expire in 1 hour.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} OneCard. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: userEmail,
    subject: 'Reset Your Password - OneCard',
    html,
  });
}

export default resend;
