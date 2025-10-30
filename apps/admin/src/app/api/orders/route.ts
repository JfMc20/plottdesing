import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
   try {
      const userId = req.headers.get('X-USER-ID')

      if (!userId) {
         return new NextResponse('Unauthorized', { status: 401 })
      }

      const { searchParams } = new URL(req.url)

      // Support filtering by userId, status, isPaid, isCompleted
      const filterUserId = searchParams.get('userId') || undefined
      const status = searchParams.get('status') || undefined
      const isPaid = searchParams.get('isPaid')
      const isCompleted = searchParams.get('isCompleted')

      const orders = await prisma.order.findMany({
         where: {
            ...(filterUserId && { userId: filterUserId }),
            ...(status && { status: status as any }),
            ...(isPaid !== null && isPaid !== undefined && { isPaid: isPaid === 'true' }),
            ...(isCompleted !== null && isCompleted !== undefined && { isCompleted: isCompleted === 'true' }),
         },
         include: {
            user: {
               select: {
                  id: true,
                  email: true,
                  phone: true,
                  name: true,
               },
            },
            address: true,
            orderItems: {
               include: {
                  product: {
                     select: {
                        id: true,
                        title: true,
                        images: true,
                        price: true,
                        discount: true,
                     },
                  },
               },
            },
         },
         orderBy: {
            createdAt: 'desc',
         },
      })

      return NextResponse.json(orders)
   } catch (error) {
      console.error('[ORDERS_GET]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}
