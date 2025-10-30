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
      const avatarUrl = supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture || null

      // First, try to find by supabaseId
      let prismaUser = await prisma.user.findUnique({
         where: { supabaseId: supabaseUser.id },
      })

      // If not found by supabaseId, try to find by email and update supabaseId
      if (!prismaUser && supabaseUser.email) {
         prismaUser = await prisma.user.findUnique({
            where: { email: supabaseUser.email },
         })

         // If found by email, update the supabaseId
         if (prismaUser) {
            prismaUser = await prisma.user.update({
               where: { id: prismaUser.id },
               data: {
                  supabaseId: supabaseUser.id,
                  ...(avatarUrl && { avatarUrl }),
               },
            })
         }
      }

      // If still not found, create new user
      if (!prismaUser) {
         prismaUser = await prisma.user.create({
            data: {
               supabaseId: supabaseUser.id,
               email: supabaseUser.email,
               name: supabaseUser.user_metadata?.full_name || supabaseUser.email,
               avatarUrl,
            },
         })
      } else {
         // Update existing user with avatar if needed
         if (avatarUrl && !prismaUser.avatarUrl) {
            prismaUser = await prisma.user.update({
               where: { id: prismaUser.id },
               data: { avatarUrl },
            })
         }
      }

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
         id: user.id,
         phone: user.phone,
         email: user.email,
         name: user.name,
         birthday: user.birthday,
         avatarUrl: user.avatarUrl,
         addresses: user.addresses,
         wishlist: user.wishlist,
         cart: user.cart,
      })
   } catch (error) {
      console.error('[PROFILE_GET]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}
