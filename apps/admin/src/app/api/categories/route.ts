import prisma from '@/lib/prisma'
import { validateAuth, isErrorResponse } from '@/lib/api/auth-helper'
import { handleApiError } from '@/lib/api/error-handler'
import { NextResponse } from 'next/server'
import { nanoid } from 'nanoid'

export async function POST(req: Request) {
   try {
      const auth = validateAuth(req)
      if (isErrorResponse(auth)) return auth

      const body = await req.json()
      const { title, description, bannerId } = body

      if (!title) {
         return new NextResponse('Name is required', { status: 400 })
      }

      if (!bannerId) {
         return new NextResponse('Banner ID is required', { status: 400 })
      }

      const category = await prisma.category.create({
         data: {
            id: nanoid(),
            title,
            description,
            updatedAt: new Date(),
            banners: {
               connect: {
                  id: bannerId,
               },
            },
         },
      })

      return NextResponse.json(category)
   } catch (error) {
      return handleApiError(error, 'CATEGORIES_POST')
   }
}

export async function GET(req: Request) {
   try {
      const categories = await prisma.category.findMany()
      return NextResponse.json(categories)
   } catch (error) {
      return handleApiError(error, 'CATEGORIES_GET')
   }
}
