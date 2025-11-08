import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
   try {
      const body = await req.json()
      const { productId, zoneId, sizeId, quantity, designImages, notes } = body

      // Validate required fields
      if (!productId || !zoneId || !designImages || !Array.isArray(designImages) || designImages.length === 0) {
         return NextResponse.json(
            { error: 'Missing required fields' },
            { status: 400 }
         )
      }

      // Validate quantity
      if (!quantity || quantity < 1) {
         return NextResponse.json(
            { error: 'Invalid quantity' },
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

      // Get product with category item and sizes
      const product = await prisma.product.findUnique({
         where: { id: productId },
         include: {
            brand: true,
            categories: true,
            categoryItem: {
               include: {
                  ProductSize: true
               }
            }
         },
      })

      if (!product) {
         return NextResponse.json(
            { error: 'Product not found' },
            { status: 404 }
         )
      }

      // Verify stock availability
      if (!product.isPrintOnDemand) {
         const hasSizes = product.categoryItem?.ProductSize && product.categoryItem.ProductSize.length > 0
         
         if (hasSizes) {
            // Verify stock by size
            if (!sizeId) {
               return NextResponse.json(
                  { error: 'Size is required for this product' },
                  { status: 400 }
               )
            }

            const size = product.categoryItem.ProductSize.find(s => s.id === sizeId)
            if (!size || size.stock < quantity) {
               return NextResponse.json(
                  { error: `Only ${size?.stock || 0} units available in this size` },
                  { status: 400 }
               )
            }

            // Reduce stock for this size
            await prisma.productSize.update({
               where: { id: sizeId },
               data: { stock: { decrement: quantity } }
            })
         } else {
            // Verify general stock
            if (product.stock < quantity) {
               return NextResponse.json(
                  { error: `Only ${product.stock} units available` },
                  { status: 400 }
               )
            }

            // Reduce general stock
            await prisma.product.update({
               where: { id: productId },
               data: { stock: { decrement: quantity } }
            })
         }
      }

      // Create customization request in database
      const customizationRequest = await prisma.customizationRequest.create({
         data: {
            productId,
            zoneId,
            sizeId: sizeId || null,
            quantity,
            designImages,
            notes: notes || null,
            status: 'pending',
         },
         include: {
            product: {
               include: {
                  brand: true,
                  categories: true
               }
            }
         }
      })

      // Get zone info for notification
      const zone = await prisma.productZone.findUnique({
         where: { id: zoneId },
      })

      const size = sizeId ? await prisma.productSize.findUnique({
         where: { id: sizeId },
      }) : null

      console.log('✅ Customization Request Created:', {
         id: customizationRequest.id,
         product: product.title,
         zone: zone?.name,
         size: size?.name,
         quantity,
         images: designImages.length
      })

      return NextResponse.json({
         success: true,
         message: 'Customization request received successfully',
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
