import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(
   req: Request,
   { params }: { params: { id: string } }
) {
   try {
      const categoryItem = await prisma.categoryItem.findUnique({
         where: { id: params.id },
         include: {
            ProductSize: {
               orderBy: { displayOrder: 'asc' },
            },
            ProductZone: {
               orderBy: { displayOrder: 'asc' },
            },
         },
      })

      if (!categoryItem) {
         return NextResponse.json(
            { error: 'Category item not found' },
            { status: 404 }
         )
      }

      return NextResponse.json(categoryItem)
   } catch (error) {
      console.error('Error fetching category item:', error)
      return NextResponse.json(
         { error: 'Internal server error' },
         { status: 500 }
      )
   }
}
