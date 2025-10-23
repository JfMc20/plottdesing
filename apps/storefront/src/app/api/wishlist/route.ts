import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
   try {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
         return new NextResponse('Unauthorized', { status: 401 })
      }

      // Sync or get user from Prisma
      const prismaUser = await prisma.user.upsert({
         where: { supabaseId: user.id },
         update: {},
         create: {
            supabaseId: user.id,
            email: user.email,
         },
      })

      const userWithWishlist = await prisma.user.findUniqueOrThrow({
         where: { id: prismaUser.id },
         include: { wishlist: true },
      })

      return NextResponse.json(userWithWishlist.wishlist)
   } catch (error) {
      console.error('[WISHLIST_GET]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}

export async function POST(req: Request) {
   try {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
         return new NextResponse('Unauthorized', { status: 401 })
      }

      // Sync or get user from Prisma
      const prismaUser = await prisma.user.upsert({
         where: { supabaseId: user.id },
         update: {},
         create: {
            supabaseId: user.id,
            email: user.email,
         },
      })

      const { productId } = await req.json()

      const updatedUser = await prisma.user.update({
         where: { id: prismaUser.id },
         data: {
            wishlist: {
               connect: {
                  id: productId,
               },
            },
         },
         include: { wishlist: true },
      })

      return NextResponse.json(updatedUser.wishlist)
   } catch (error) {
      console.error('WISHLIST_POST]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}

export async function DELETE(req: Request) {
   try {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
         return new NextResponse('Unauthorized', { status: 401 })
      }

      // Sync or get user from Prisma
      const prismaUser = await prisma.user.upsert({
         where: { supabaseId: user.id },
         update: {},
         create: {
            supabaseId: user.id,
            email: user.email,
         },
      })

      const { productId } = await req.json()

      const updatedUser = await prisma.user.update({
         where: { id: prismaUser.id },
         data: {
            wishlist: {
               disconnect: {
                  id: productId,
               },
            },
         },
         include: { wishlist: true },
      })

      return NextResponse.json(updatedUser.wishlist)
   } catch (error) {
      console.error('WISHLIST_POST]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}
