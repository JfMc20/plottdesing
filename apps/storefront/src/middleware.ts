import { NextRequest, NextResponse } from 'next/server'
import { shouldBlockRequest, checkRateLimit } from './lib/security/ip-blocker'
import { updateSessionWithUser } from '../../../packages/auth/src/supabase/middleware'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Get client IP
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ||
             req.headers.get('x-real-ip') ||
             req.ip ||
             'unknown'

  const userAgent = req.headers.get('user-agent') || 'unknown'

  // Check if request should be blocked
  const blockCheck = shouldBlockRequest({ ip, userAgent, path: pathname })
  if (blockCheck.blocked) {
    console.log('🚫 BLOCKED REQUEST:', {
      ip,
      method: req.method,
      path: pathname,
      reason: blockCheck.reason,
      userAgent: userAgent.substring(0, 100),
      timestamp: new Date().toISOString(),
    })
    return new NextResponse('Forbidden', { status: 403 })
  }

  // Check rate limiting (only for non-static assets)
  if (!pathname.startsWith('/_next') && !pathname.startsWith('/static')) {
    const rateLimit = checkRateLimit(ip)
    if (!rateLimit.allowed) {
      console.log('⚠️ RATE LIMIT EXCEEDED:', {
        ip,
        path: pathname,
        timestamp: new Date().toISOString(),
      })
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
          'Retry-After': '60',
        },
      })
    }
  }

  // Log all requests (optional - puedes comentar esto si genera demasiados logs)
  if (process.env.NODE_ENV === 'development') {
    console.log(`📋 ${req.method} ${pathname} - IP: ${ip}`)
  }

  // Skip middleware for static files and images
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Protected routes that require authentication
  const protectedRoutes = ['/profile', '/cart', '/checkout', '/wishlist']
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )

  // Update session using shared auth utility
  const { response, user } = await updateSessionWithUser(req)

  // For protected routes, verify authentication
  if (isProtectedRoute && !user) {
    // No user - redirect to login
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
