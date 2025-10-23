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

      const cart = await prisma.cart.findUniqueOrThrow({
         where: { userId: prismaUser.id },
         include: {
            items: {
               include: {
                  product: {
                     include: {
                        brand: true,
                        categories: true,
                     },
                  },
               },
            },
         },
      })

      return NextResponse.json(cart)
   } catch (error) {
      console.error('[GET_CART]', error)
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

      const { productId, count } = await req.json()

      if (count < 1) {
         await prisma.cartItem.delete({
            where: { UniqueCartItem: { cartId: prismaUser.id, productId } },
         })
      } else {
         await prisma.cart.upsert({
            where: {
               userId: prismaUser.id,
            },
            create: {
               user: {
                  connect: {
                     id: prismaUser.id,
                  },
               },
            },
            update: {
               items: {
                  upsert: {
                     where: {
                        UniqueCartItem: {
                           cartId: prismaUser.id,
                           productId,
                        },
                     },
                     update: {
                        count,
                     },
                     create: {
                        productId,
                        count,
                     },
                  },
               },
            },
         })
      }

      const cart = await prisma.cart.findUniqueOrThrow({
         where: {
            userId: prismaUser.id,
         },
         include: {
            items: {
               include: {
                  product: true,
               },
            },
         },
      })

      return NextResponse.json(cart)
   } catch (error) {
      console.error('[PRODUCT_DELETE]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}
