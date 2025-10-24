import config from '@/config/site'
import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { sendEmail, OrderNotificationEmail } from '@/lib/email'
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

      const orders = await prisma.order.findMany({
         where: {
            userId: prismaUser.id,
         },
         include: {
            address: true,
            payments: true,
            refund: true,
            orderItems: true,
         },
      })

      return NextResponse.json(orders)
   } catch (error) {
      console.error('[ORDERS_GET]', error)
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

      const { addressId, discountCode } = await req.json()

      if (discountCode) {
         await prisma.discountCode.findUniqueOrThrow({
            where: {
               code: discountCode,
               stock: {
                  gte: 1,
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

      const { tax, total, discount, payable } = calculateCosts({ cart })

      const order = await prisma.order.create({
         data: {
            user: {
               connect: {
                  id: prismaUser.id,
               },
            },
            status: 'Processing',
            total,
            tax,
            payable,
            discount,
            shipping: 0,
            address: {
               connect: { id: addressId },
            },
            orderItems: {
               create: cart?.items.map((orderItem) => ({
                  count: orderItem.count,
                  price: orderItem.product.price,
                  discount: orderItem.product.discount,
                  product: {
                     connect: {
                        id: orderItem.productId,
                     },
                  },
               })),
            },
         },
      })

      const owners = await prisma.owner.findMany()

      const notifications = await prisma.notification.createMany({
         data: owners.map((owner) => ({
            userId: owner.id,
            content: `Order #${order.number} was created was created with a value of $${payable}.`,
         })),
      })

      for (const owner of owners) {
         await sendEmail({
            to: owner.email,
            subject: 'An order was created.',
            template: OrderNotificationEmail({
               id: order.id,
               payable: payable.toFixed(2),
               orderNum: order.number.toString(),
            }),
         })
      }

      return NextResponse.json(order)
   } catch (error) {
      console.error('[ORDER_POST]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}

function calculateCosts({ cart }) {
   let total = 0,
      discount = 0

   for (const item of cart?.items) {
      total += item?.count * item?.product?.price
      discount += item?.count * item?.product?.discount
   }

   const afterDiscount = total - discount
   const tax = afterDiscount * 0.09
   const payable = afterDiscount + tax

   return {
      total: parseFloat(total.toFixed(2)),
      discount: parseFloat(discount.toFixed(2)),
      afterDiscount: parseFloat(afterDiscount.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      payable: parseFloat(payable.toFixed(2)),
   }
}
