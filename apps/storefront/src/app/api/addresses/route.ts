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

      const addresses = await prisma.address.findMany({
         where: {
            userId: prismaUser.id,
         },
      })

      return NextResponse.json(addresses)
   } catch (error) {
      console.error('[ADDRESSES_GET]', error)
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

      const { address, city, phone, postalCode } = await req.json()

      const object = await prisma.address.create({
         data: {
            user: {
               connect: {
                  id: prismaUser.id,
               },
            },
            city,
            address,
            phone,
            postalCode,
         },
      })

      return NextResponse.json(object)
   } catch (error) {
      console.error('[ADDRESS_POST]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}
