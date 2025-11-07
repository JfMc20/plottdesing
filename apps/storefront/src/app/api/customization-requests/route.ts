import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
   try {
      const body = await req.json()
      const { productId, zoneId, sizeId, designImages, notes } = body

      // Validate required fields
      if (!productId || !zoneId || !sizeId || !designImages || !Array.isArray(designImages) || designImages.length === 0) {
         return NextResponse.json(
            { error: 'Missing required fields' },
            { status: 400 }
         )
      }

      // Validate max images
      if (designImages.length > 3) {
         return NextResponse.json(
            { error: 'Maximum 3 images allowed' },
            { status: 400 }
         )
      }

      // Validate image URLs
      for (const url of designImages) {
         if (typeof url !== 'string' || !url.startsWith('https://')) {
            return NextResponse.json(
               { error: 'Invalid image URL' },
               { status: 400 }
            )
         }
      }

      // TODO: Get user from session
      // For now, we'll create a notification for admin
      
      const customizationRequest = {
         productId,
         zoneId,
         sizeId,
         designImages,
         notes: notes || '',
         createdAt: new Date(),
      }

      // Fetch related data for notification
      const product = await prisma.product.findUnique({
         where: { id: productId },
         include: { brand: true, categories: true },
      })

      const zone = await prisma.productZone.findUnique({
         where: { id: zoneId },
      })

      const size = await prisma.productSize.findUnique({
         where: { id: sizeId },
      })

      // Create notification content
      const notificationContent = `New customization request:
Product: ${product?.title}
Zone: ${zone?.name}
Size: ${size?.name}
Design Images: ${designImages.length} image(s)
${designImages.map((url, i) => `Image ${i + 1}: ${url}`).join('\n')}
${notes ? `Notes: ${notes}` : ''}`

      // TODO: Send email to admin or create proper notification
      console.log('Customization Request:', customizationRequest)
      console.log('Notification:', notificationContent)

      return NextResponse.json({
         success: true,
         message: 'Customization request received',
         data: customizationRequest,
      })
   } catch (error) {
      console.error('Error processing customization request:', error)
      return NextResponse.json(
         { error: 'Internal server error' },
         { status: 500 }
      )
   }
}
