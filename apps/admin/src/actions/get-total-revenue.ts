import prisma from '@/lib/prisma'

export const getTotalRevenue = async () => {
   const paidOrders = await prisma.order.findMany({
      where: {
         isPaid: true,
      },
      include: {
         OrderItem: {
            include: {
               Product: { include: { categories: true } },
            },
         },
      },
   })

   const totalRevenue = paidOrders.reduce((total, order) => {
      const orderTotal = order.OrderItem.reduce((orderSum, item) => {
         return orderSum + item.price
      }, 0)
      return total + orderTotal
   }, 0)

   return totalRevenue
}
