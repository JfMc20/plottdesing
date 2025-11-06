import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'

/**
 * Auth callback route handler
 * Exchanges the auth code for a session after OAuth or magic link authentication
 * Auto-creates Owner record for admin users
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

  if (data.session && data.user) {
    console.log('✅ Session created successfully for user:', data.user.email)

    // Check if user is admin and create Owner record if needed
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map((e) => e.trim()) || []
    
    if (data.user.email && adminEmails.includes(data.user.email)) {
      try {
        // Check if Owner already exists
        const existingOwner = await prisma.owner.findUnique({
          where: { supabaseId: data.user.id },
        })

        if (!existingOwner) {
          // Create Owner record for admin user
          await prisma.owner.create({
            data: {
              supabaseId: data.user.id,
              email: data.user.email,
              name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || data.user.email,
              avatar: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture,
            },
          })
          console.log('✅ Owner record created for admin:', data.user.email)
        } else {
          // Update avatar if it changed (useful for Google OAuth)
          const newAvatar = data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture
          if (newAvatar && existingOwner.avatar !== newAvatar) {
            await prisma.owner.update({
              where: { supabaseId: data.user.id },
              data: { avatar: newAvatar },
            })
            console.log('✅ Owner avatar updated for:', data.user.email)
          }
        }
      } catch (dbError) {
        console.error('Error creating/updating Owner record:', dbError)
        // Don't block login if Owner creation fails
      }
    }

    const response = NextResponse.redirect(`${origin}/`)
    return response
  }

  console.error('No session created despite no error')
  return NextResponse.redirect(`${origin}/login?error=no_session`)
}
