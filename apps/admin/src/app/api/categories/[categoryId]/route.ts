import prisma from '@/lib/prisma'
import { validateAuth, isErrorResponse } from '@/lib/api/auth-helper'
import { handleApiError } from '@/lib/api/error-handler'
import { NextResponse } from 'next/server'

export async function GET(
   req: Request,
   { params }: { params: { categoryId: string } }
) {
   try {
      const auth = validateAuth(req)
      if (isErrorResponse(auth)) return auth

      if (!params.categoryId) {
         return new NextResponse('Category id is required', { status: 400 })
      }

      const category = await prisma.category.findUnique({
         where: {
            id: params.categoryId,
         },
      })

      return NextResponse.json(category)
   } catch (error) {
      return handleApiError(error, 'CATEGORY_GET')
   }
}

export async function DELETE(
   req: Request,
   { params }: { params: { categoryId: string } }
) {
   try {
      const auth = validateAuth(req)
      if (isErrorResponse(auth)) return auth

      if (!params.categoryId) {
         return new NextResponse('Category id is required', { status: 400 })
      }

      const categoryItemsCount = await prisma.categoryItem.count({
         where: {
            categoryId: params.categoryId,
         },
      })

      if (categoryItemsCount > 0) {
         return new NextResponse(
            'Cannot delete category with associated items. Please remove all category items first.',
            { status: 400 }
         )
      }

      const category = await prisma.category.delete({
         where: {
            id: params.categoryId,
         },
      })

      return NextResponse.json(category)
   } catch (error) {
      return handleApiError(error, 'CATEGORY_DELETE')
   }
}

export async function PATCH(
   req: Request,
   { params }: { params: { categoryId: string } }
) {
   try {
      const auth = validateAuth(req)
      if (isErrorResponse(auth)) return auth

      const body = await req.json()
      const { title, description, bannerId, isArchived } = body

      if (!params.categoryId) {
         return new NextResponse('Category id is required', { status: 400 })
      }

      const updateData: any = {}
      
      if (title !== undefined) updateData.title = title
      if (description !== undefined) updateData.description = description
      if (isArchived !== undefined) updateData.isArchived = isArchived
      
      if (bannerId) {
         updateData.banners = {
            connect: {
               id: bannerId,
            },
         }
      }

      const updatedCategory = await prisma.category.update({
         where: {
            id: params.categoryId,
         },
         data: updateData,
      })

      return NextResponse.json(updatedCategory)
   } catch (error) {
      return handleApiError(error, 'CATEGORY_PATCH')
   }
}
