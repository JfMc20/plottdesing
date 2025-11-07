import { Prisma } from '@prisma/client'

export type CartItemWithProduct = Prisma.CartItemGetPayload<{
   include: {
      Product: {
         include: {
            brand: true
            categories: true
         }
      }
   }
}>

export type ProductWithIncludes = Prisma.ProductGetPayload<{
   include: {
      brand: true
      categories: true
      orders: true
      categoryItem: true
   }
}>

export type UserWithIncludes = Prisma.UserGetPayload<{
   include: {
      addresses: true
      orders: {
         include: {
            OrderItem: {
               include: {
                  Product: true
               }
            }
         }
      }
   }
}>

export type OrderWithIncludes = Prisma.OrderGetPayload<{
   include: {
      address: true
      discountCode: true
      user: {
         include: {
            addresses: true
            payments: true
            orders: true
         }
      }
      payments: {
         include: {
            provider: true
         }
      }
      OrderItem: { include: { Product: true } }
      refund: true
   }
}>
