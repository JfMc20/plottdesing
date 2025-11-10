import prisma from '@/lib/prisma'
import { validateAuth, isErrorResponse } from '@/lib/api/auth-helper'
import { handleApiError } from '@/lib/api/error-handler'
import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'
import { nanoid } from 'nanoid'

export async function POST(req: Request) {
   try {
      const auth = validateAuth(req)
      if (isErrorResponse(auth)) return auth

      const body = await req.json()
      const { title, description, color } = body

      if (!title) {
         return new NextResponse('Name is required', { status: 400 })
      }

      const brand = await prisma.brand.create({
         data: {
            id: nanoid(),
            title,
            description,
            color: color || '#3B82F6',
         },
      })

      revalidatePath('/brands')
      return NextResponse.json(brand)
   } catch (error) {
      return handleApiError(error, 'BRANDS_POST')
   }
}

export async function GET(req: Request) {
   try {
      const brands = await prisma.brand.findMany({})
      return NextResponse.json(brands)
   } catch (error) {
      return handleApiError(error, 'BRANDS_GET')
   }
}
