import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
   try {
      const supabase = await createClient()
      const { data: { user: supabaseUser } } = await supabase.auth.getUser()

      if (!supabaseUser) {
         return new NextResponse('Unauthorized', { status: 401 })
      }

      // Sync or get user from Prisma
      const prismaUser = await prisma.user.upsert({
         where: { supabaseId: supabaseUser.id },
         update: {},
         create: {
            supabaseId: supabaseUser.id,
            email: supabaseUser.email,
         },
      })

      const user = await prisma.user.findUniqueOrThrow({
         where: { id: prismaUser.id },
         include: {
            cart: {
               include: {
                  items: {
                     include: {
                        product: true,
                     },
                  },
               },
            },
            addresses: true,
            wishlist: true,
         },
      })

      return NextResponse.json({
         phone: user.phone,
         email: user.email,
         name: user.name,
         birthday: user.birthday,
         addresses: user.addresses,
         wishlist: user.wishlist,
         cart: user.cart,
      })
   } catch (error) {
      console.error('[PROFILE_GET]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}
