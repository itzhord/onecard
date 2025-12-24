import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token || !email) {
      return NextResponse.redirect(
        new URL('/auth/verify-email?error=invalid_link', request.url)
      );
    }

    // Find the verification token
    const verification = await prisma.verification.findFirst({
      where: {
        identifier: email,
        value: token,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!verification) {
      return NextResponse.redirect(
        new URL('/auth/verify-email?error=expired_link', request.url)
      );
    }

    // Find the user
    const user = await prisma.user.findFirst({
      where: { email },
    });

    if (!user) {
      return NextResponse.redirect(
        new URL('/auth/verify-email?error=user_not_found', request.url)
      );
    }

    // Update user's email verification status
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        updatedAt: new Date(),
      },
    });

    // Delete the used verification token
    await prisma.verification.delete({
      where: { id: verification.id },
    });

    console.log(`✅ Email verified for user: ${email}`);

    // Redirect to success page
    return NextResponse.redirect(
      new URL('/auth/verify-email?verified=true', request.url)
    );
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.redirect(
      new URL('/auth/verify-email?error=verification_failed', request.url)
    );
  }
}
