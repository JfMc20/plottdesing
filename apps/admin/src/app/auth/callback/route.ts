import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { cookies } from 'next/headers'

/**
 * Auth callback route handler
 * Exchanges the auth code for a session after OAuth or magic link authentication
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = process.env.NEXT_PUBLIC_URL || requestUrl.origin

  if (!code) {
    console.error('No code provided in callback')
    return NextResponse.redirect(`${origin}/login?error=no_code`)
  }

  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options) {
          cookieStore.set(name, value, options)
        },
        remove(name: string, options) {
          cookieStore.delete(name)
        },
      },
    }
  )

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('Error exchanging code for session:', error)
    return NextResponse.redirect(`${origin}/login?error=auth_failed`)
  }

  if (data.session) {
    console.log('✅ Session created successfully for user:', data.user?.email)
    console.log('Session expires at:', data.session.expires_at)

    // Create response and redirect to home
    const response = NextResponse.redirect(`${origin}/`)

    return response
  }

  console.error('No session created despite no error')
  return NextResponse.redirect(`${origin}/login?error=no_session`)
}
