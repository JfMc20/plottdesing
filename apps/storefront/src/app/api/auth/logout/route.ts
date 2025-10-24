import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
   const supabase = await createClient()
   await supabase.auth.signOut()

   const response = NextResponse.redirect(new URL(`/login`, req.url))

   // Clear all Supabase cookies
   response.cookies.delete('sb-access-token')
   response.cookies.delete('sb-refresh-token')

   return response
}

export async function POST() {
   try {
      const supabase = await createClient()
      const { error } = await supabase.auth.signOut({ scope: 'local' })

      if (error) {
         console.error('Error signing out:', error)
         return NextResponse.json(
            { error: 'Failed to sign out' },
            { status: 500 }
         )
      }

      // Clear cookies on the server side
      const cookieStore = await cookies()
      const allCookies = cookieStore.getAll()

      const response = NextResponse.json({ success: true })

      // Delete all Supabase-related cookies
      allCookies.forEach(cookie => {
         if (cookie.name.includes('sb-') || cookie.name.includes('supabase')) {
            response.cookies.delete(cookie.name)
         }
      })

      return response
   } catch (error) {
      console.error('Unexpected error during logout:', error)
      return NextResponse.json(
         { error: 'Unexpected error occurred' },
         { status: 500 }
      )
   }
}
