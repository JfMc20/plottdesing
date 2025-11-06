import { checkAdminRole, updateSession } from '@/lib/auth-shared/supabase/middleware'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow access to login and auth routes
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/api/auth/')
  ) {
    return await updateSession(req)
  }

  // Get admin emails from environment
  const adminEmails =
    process.env.ADMIN_EMAILS?.split(',').map((email) => email.trim()) || []

  if (adminEmails.length === 0) {
    console.error(
      'ADMIN_EMAILS environment variable is not configured. Please add admin emails to .env'
    )
  }

  // Check if user is authenticated and has admin role
  const { isAdmin, user } = await checkAdminRole(req, adminEmails)

  if (!user) {
    // Not authenticated - redirect to login
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (!isAdmin) {
    // Authenticated but not admin - show unauthorized
    return NextResponse.json(
      { error: 'Unauthorized. Admin access required.' },
      { status: 403 }
    )
  }

  // User is authenticated and is admin - continue with session update and add user ID header
  const response = await updateSession(req)

  // Add user ID to request headers for API routes
  if (pathname.startsWith('/api/')) {
    response.headers.set('X-USER-ID', user.id)
  }

  return response
}

export const config = {
  matcher: [
    '/',
    '/products/:path*',
    '/banners/:path*',
    '/brands/:path*',
    '/orders/:path*',
    '/categories/:path*',
    '/category-items/:path*',
    '/payments/:path*',
    '/codes/:path*',
    '/users/:path*',
    '/admin-users/:path*',
    '/api/:path*',
  ],
}
