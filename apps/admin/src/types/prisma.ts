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
      Address: true
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
      Address: true
      DiscountCode: true
      User: {
         include: {
            Address: true
            Payment: true
            orders: true
         }
      }
      Payment: {
         include: {
            PaymentProvider: true
         }
      }
      OrderItem: { include: { Product: true } }
      Refund: true
   }
}>
