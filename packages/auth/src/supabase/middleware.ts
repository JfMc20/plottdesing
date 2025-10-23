import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Updates the user session in middleware
 * This function refreshes the auth token and passes it to both
 * Server Components and the browser
 *
 * @param request - Next.js request object
 * @returns NextResponse with updated cookies
 *
 * @example
 * ```ts
 * import { updateSession } from '@persepolis/auth'
 *
 * export async function middleware(request: NextRequest) {
 *   return await updateSession(request)
 * }
 * ```
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    console.error(
      'Missing Supabase environment variables in middleware'
    )
    return response
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        // Set cookie on the request for Server Components
        request.cookies.set({
          name,
          value,
          ...options,
        })
        // Create new response to update cookies
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        })
        // Set cookie on the response for the browser
        response.cookies.set({
          name,
          value,
          ...options,
        })
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({
          name,
          value: '',
          ...options,
        })
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        })
        response.cookies.set({
          name,
          value: '',
          ...options,
        })
      },
    },
  })

  // Refresh session - this is crucial for keeping sessions alive
  // IMPORTANT: Use getUser() not getSession() for security
  await supabase.auth.getUser()

  return response
}

/**
 * Checks if the authenticated user has admin role
 * Used specifically for admin panel authentication
 *
 * @param request - Next.js request object
 * @param adminEmails - List of emails that have admin access
 * @returns Object with isAdmin boolean and user data
 *
 * @example
 * ```ts
 * import { checkAdminRole } from '@persepolis/auth'
 *
 * export async function middleware(request: NextRequest) {
 *   const { isAdmin, user } = await checkAdminRole(request, [
 *     'admin@example.com'
 *   ])
 *
 *   if (!isAdmin) {
 *     return NextResponse.redirect(new URL('/unauthorized', request.url))
 *   }
 *
 *   return NextResponse.next()
 * }
 * ```
 */
export async function checkAdminRole(
  request: NextRequest,
  adminEmails: string[]
) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    return { isAdmin: false, user: null }
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value
      },
      set() {},
      remove() {},
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !user.email) {
    return { isAdmin: false, user: null }
  }

  const isAdmin = adminEmails.includes(user.email)

  return { isAdmin, user }
}
