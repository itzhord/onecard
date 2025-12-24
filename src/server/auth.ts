/**
 * Better Auth Configuration
 * Server-side authentication setup with Drizzle ORM
 */

import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { Resend } from "resend";
import { prisma } from "../lib/prisma";

// Initialize email client (only if API key is available)
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Startup log to confirm whether Resend is configured in the running process
console.log(`[Better Auth] auth module loaded - Resend configured: ${Boolean(resend)} (NODE_ENV=${process.env.NODE_ENV})`);

// Custom logger for development URLs
function logDevUrl(type: 'verification' | 'password-reset', email: string, url: string) {
  const timestamp = new Date().toLocaleTimeString();
  const separator = '='.repeat(80);

  console.group(`🚀 ${type.toUpperCase()} URL - ${timestamp}`);
  console.warn(`⚠️  Email not configured - Use this URL for ${type.replace('-', ' ')}`);
  console.log(separator);
  console.info(`📧 Email: ${email}`);
  console.log(`🔗 URL: ${url}`);
  console.log(separator);
  console.info(`💡 Copy the URL above and paste it into your browser`);
  console.groupEnd();
}

export const auth = betterAuth({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET || process.env.AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),


  // Enable email and password authentication
  emailAndPassword: {
    enabled: true,
    // Disable auto sign-in to require email verification
    autoSignIn: false,
    sendResetPassword: async ({ user, url, token }, request) => {
      // Always log that the reset handler ran; show token only in non-production
      console.log(`[Better Auth] sendResetPassword invoked - resend ${resend ? 'configured' : 'not configured'}`);
      if (process.env.NODE_ENV !== 'production') {
        try {
          console.table({ email: user.email, url, token, resend: Boolean(resend) });
        } catch (e) {
          console.log('Password reset details:', { email: user.email, url, token, resend: Boolean(resend) });
        }
        logDevUrl('password-reset', user.email, url);
      } else {
        console.log('[Better Auth] sendResetPassword executed (token hidden in production)');
      }

      try {
        const { error } = await resend.emails.send({
          from: process.env.EMAIL_FROM || "noreply@1necard.co",
          to: user.email,
          subject: "Reset your password - OneCard",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Password Reset Request</h2>
              <p>Hi ${user.name || "there"},</p>
              <p>We received a request to reset your password. Click the button below to create a new password:</p>
              <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px; margin: 20px 0;">
                Reset Password
              </a>
              <p>Or copy and paste this link into your browser:</p>
              <p style="color: #666; word-break: break-all;">${url}</p>
              <p>This link will expire in 1 hour.</p>
              <p>If you didn't request a password reset, you can safely ignore this email.</p>
            </div>
          `,
        });
        
        if (error) {
          console.error("❌ Resend API Error:", error);
          throw new Error(error.message);
        }

        console.log(`✅ Password reset email sent to ${user.email}`);
      } catch (error) {
        console.error("❌ Failed to send password reset email:", error);
        throw error;
      }
    },
  },

  // Email verification configuration
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }, request) => {
      // Always log that the verification handler ran; show token only in non-production
      console.log(`[Better Auth] sendVerificationEmail invoked - resend ${resend ? 'configured' : 'not configured'}`);
      if (process.env.NODE_ENV !== 'production') {
        try {
          console.table({ email: user.email, url, token, resend: Boolean(resend) });
        } catch (e) {
          console.log('Verification details:', { email: user.email, url, token, resend: Boolean(resend) });
        }
        logDevUrl('verification', user.email, url);
      } else {
        console.log('[Better Auth] sendVerificationEmail executed (token hidden in production)');
      }

   

      try {
        const { error } = await resend.emails.send({
          from: process.env.EMAIL_FROM || "noreply@1necard.co",
          to: user.email,
          subject: "Verify your email - OneCard",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Welcome to OneCard!</h2>
              <p>Hi ${user.name || "there"},</p>
              <p>Please verify your email address by clicking the button below:</p>
              <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px; margin: 20px 0;">
                Verify Email
              </a>
              <p>Or copy and paste this link into your browser:</p>
              <p style="color: #666; word-break: break-all;">${url}</p>
              <p>This link will expire in 24 hours.</p>
              <p>If you didn't create an account, you can safely ignore this email.</p>
            </div>
          `,
        });
        
        if (error) {
          console.error("❌ Resend API Error:", error);
          throw new Error(error.message);
        }

        console.log(`✅ Verification email sent to ${user.email}`);
      } catch (error) {
        console.error("❌ Failed to send verification email:", error);
        throw error;
      }
    },
  },

   // Social providers configuration
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },

  // User schema with additional fields (simplified)
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
        input: false,
      },
      phoneNumber: {
        type: "string",
        required: false,
      },
    },
  },

  // Admin plugin
  plugins: [admin()],

  // Database hooks for automatic profile creation
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          try {
            // Auto-create profile for new user
            // No need to manually handle timestamps - Better Auth handles them
            const username = await generateUsername(
              user.name || user.email,
            );

            await prisma.profile.create({
              data: {
                userId: user.id,
                username,
                email: user.email,
                firstName: extractFirstName(user.name),
                lastName: extractLastName(user.name),
                fullName: user.name || "",
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            });

            console.log(`✅ Profile created for user ${user.id}`);

            // Create email preferences
            await prisma.emailPreference.create({
              data: {
                userId: user.id,
                welcomeEmails: true,
                activityNotifications: true,
                weeklyReports: true,
                marketingEmails: false,
                paymentNotifications: true,
                securityAlerts: true,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            });

            console.log(`✅ Email preferences created for user ${user.id}`);
          } catch (error) {
            console.error("❌ Failed to create profile:", error);
            // Don't throw - we don't want to break user creation
          }
        },
      },
    },
  },
});

// Helper function to generate unique username
async function generateUsername(fullName: string): Promise<string> {
  let baseUsername = fullName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .substring(0, 20);

  if (baseUsername.length < 3) {
    baseUsername = `user${Date.now()}`;
  }

  let username = baseUsername;
  let counter = 1;

  while (true) {
    const existingProfile = await prisma.profile.findFirst({
      where: { username },
      select: { username: true },
    });

    if (!existingProfile) break;

    username = `${baseUsername}${counter}`;
    counter++;
  }

  return username;
}

// Helper function to extract first name
function extractFirstName(fullName?: string): string {
  if (!fullName) return "";
  return fullName.split(" ")[0] || "";
}

// Helper function to extract last name
function extractLastName(fullName?: string): string {
  if (!fullName) return "";
  const parts = fullName.split(" ");
  return parts.slice(1).join(" ") || "";
}
