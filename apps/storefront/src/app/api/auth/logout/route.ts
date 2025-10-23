import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
   const supabase = await createClient()
   await supabase.auth.signOut()

   const response = NextResponse.redirect(new URL(`/login`, req.url))
   return response
}

export async function POST() {
   try {
      const supabase = await createClient()
      const { error } = await supabase.auth.signOut()

      if (error) {
         console.error('Error signing out:', error)
         return NextResponse.json(
            { error: 'Failed to sign out' },
            { status: 500 }
         )
      }

      return NextResponse.json({ success: true })
   } catch (error) {
      console.error('Unexpected error during logout:', error)
      return NextResponse.json(
         { error: 'Unexpected error occurred' },
         { status: 500 }
      )
   }
}
