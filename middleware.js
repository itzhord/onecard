import { NextResponse } from 'next/server'
import { getSessionCookie } from 'better-auth/cookies'

export async function middleware(req) {
  const res = NextResponse.next()
  
  // Get session cookie from Better Auth
  const sessionCookie = getSessionCookie(req)
  
  const url = req.nextUrl.clone()
  
  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/profile/edit', '/admin']
  const adminRoutes = ['/admin']
  const authRoutes = ['/auth', '/auth/verify-email']
  
  const isProtectedRoute = protectedRoutes.some(route => 
    url.pathname.startsWith(route)
  )
  const isAdminRoute = adminRoutes.some(route => 
    url.pathname.startsWith(route)
  )
  const isAuthRoute = authRoutes.some(route => 
    url.pathname.startsWith(route)
  )

  // Redirect authenticated users away from auth pages
  if (sessionCookie && isAuthRoute) {
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Redirect unauthenticated users from protected routes
  if (!sessionCookie && isProtectedRoute) {
    url.pathname = '/auth'
    return NextResponse.redirect(url)
  }

  // Check admin access for admin routes
  if (sessionCookie && isAdminRoute) {
    try {
      // For admin checks, we need to get the full session
      // Since middleware can't easily make DB calls, we'll use a simpler approach
      // In production, you might want to use getCookieCache or make this check in the component
      // For now, we'll allow access if there's a session cookie
      // TODO: Implement proper admin role checking in middleware
    } catch (error) {
      console.error('Middleware admin check error:', error)
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}