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
    console.log('   User ID:', data.user?.id)
    console.log('   Session ID:', data.session.access_token.substring(0, 20) + '...')
    console.log('   Expires at:', new Date(data.session.expires_at! * 1000).toLocaleString())
    console.log('   Created at:', data.user?.created_at)
    console.log('   Email verified:', data.user?.email_confirmed_at)
    console.log('   Provider:', data.user?.app_metadata?.provider)

    // Check if this is a new user (created in the last 10 seconds)
    const isNewUser = data.user?.created_at
      ? (Date.now() - new Date(data.user.created_at).getTime()) < 10000
      : false

    console.log('   Is new user?:', isNewUser)

    // Check if this is a new user signup or email confirmation
    if (type === 'signup' || requestUrl.searchParams.has('confirmation_url') || isNewUser) {
      console.log('🎉 New user detected - redirecting to welcome screen')
      response = NextResponse.redirect(`${origin}/auth/confirm`)
    } else {
      console.log('🏠 Existing user login - redirecting to', next)
      response = NextResponse.redirect(`${origin}${next}`)
    }

    return response
  }

  console.error('❌ No session created despite no error')
  return NextResponse.redirect(`${origin}/login?error=no_session`)
}
