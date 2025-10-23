import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Creates a Supabase client for use in Server Components and Route Handlers
 * This client runs on the server and manages session cookies
 *
 * IMPORTANT: Always use getUser() instead of getSession() in server code
 * for security - getUser() revalidates the auth token on every call
 *
 * @returns Supabase server client instance
 *
 * @example
 * ```tsx
 * import { createClient } from '@persepolis/auth'
 *
 * export async function UserProfile() {
 *   const supabase = createClient()
 *   const { data: { user } } = await supabase.auth.getUser()
 *
 *   if (!user) return <div>Not authenticated</div>
 *
 *   return <div>Welcome {user.email}</div>
 * }
 * ```
 */
export async function createClient() {
  const cookieStore = await cookies()

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
    )
  }

  return createServerClient(url, anonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch (error) {
          // This can happen in Server Components where cookies can't be set
          // It's safe to ignore as middleware will handle the cookie update
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: '', ...options })
        } catch (error) {
          // Same as above - safe to ignore
        }
      },
    },
  })
}
