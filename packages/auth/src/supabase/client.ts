import { createBrowserClient } from '@supabase/ssr'

/**
 * Creates a Supabase client for use in Client Components
 * This client runs in the browser and can access cookies
 *
 * @returns Supabase browser client instance
 *
 * @example
 * ```tsx
 * 'use client'
 * import { createClient } from '@persepolis/auth'
 *
 * export function LoginButton() {
 *   const supabase = createClient()
 *
 *   const handleLogin = async () => {
 *     await supabase.auth.signInWithOAuth({ provider: 'google' })
 *   }
 *
 *   return <button onClick={handleLogin}>Sign In</button>
 * }
 * ```
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
    )
  }

  return createBrowserClient(url, anonKey)
}
