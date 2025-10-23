import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { cookies } from 'next/headers'

/**
 * Auth callback route handler
 * Exchanges the auth code for a session after OAuth or email confirmation
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const type = requestUrl.searchParams.get('type')
  const next = requestUrl.searchParams.get('next') || '/'
  const origin = process.env.NEXT_PUBLIC_URL || requestUrl.origin

  console.log('🔍 Callback received:', {
    code: code ? 'present' : 'missing',
    type,
    next,
    origin,
    fullUrl: request.url
  })

  if (!code) {
    console.error('❌ No code provided in callback')
    return NextResponse.redirect(`${origin}/login?error=no_code`)
  }

  const cookieStore = await cookies()

  // Create response first to ensure cookies are set properly
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

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
          // Also set on response
          response.cookies.set(name, value, options)
        },
        remove(name: string, options) {
          cookieStore.delete(name)
          response.cookies.delete(name)
        },
      },
    }
  )

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('❌ Error exchanging code for session:', error)
    return NextResponse.redirect(`${origin}/login?error=auth_failed&message=${encodeURIComponent(error.message)}`)
  }

  if (data.session) {
    console.log('✅ Session created successfully!')
    console.log('   User:', data.user?.email)
    console.log('   Session ID:', data.session.access_token.substring(0, 20) + '...')
    console.log('   Expires at:', new Date(data.session.expires_at! * 1000).toLocaleString())

    // Check if this is an email confirmation (signup)
    if (type === 'signup' || requestUrl.searchParams.has('confirmation_url')) {
      console.log('📧 Email confirmation detected, redirecting to /auth/confirm')
      response = NextResponse.redirect(`${origin}/auth/confirm`)
    } else {
      console.log('🏠 Regular login, redirecting to', next)
      response = NextResponse.redirect(`${origin}${next}`)
    }

    return response
  }

  console.error('❌ No session created despite no error')
  return NextResponse.redirect(`${origin}/login?error=no_session`)
}
