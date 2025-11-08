import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { productId, sizeId } = await req.json()

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        categoryItem: {
          include: {
            ProductSize: true
          }
        }
      }
    })

    if (!product) {
      return NextResponse.json(
        { available: false, stock: 0, unlimited: false },
        { status: 404 }
      )
    }

    // Print on Demand = Stock ilimitado
    if (product.isPrintOnDemand) {
      return NextResponse.json({
        available: true,
        stock: 999999,
        unlimited: true
      })
    }

    // Tiene tallas = Verificar stock de la talla
    if (product.categoryItem?.ProductSize && product.categoryItem.ProductSize.length > 0) {
      if (!sizeId) {
        return NextResponse.json({
          available: false,
          stock: 0,
          unlimited: false,
          message: 'Debe seleccionar una talla'
        })
      }

      const size = product.categoryItem.ProductSize.find(s => s.id === sizeId)
      return NextResponse.json({
        available: (size?.stock || 0) > 0,
        stock: size?.stock || 0,
        unlimited: false
      })
    }

    // Sin tallas = Stock general del producto
    return NextResponse.json({
      available: product.stock > 0,
      stock: product.stock,
      unlimited: false
    })

  } catch (error) {
    console.error('Error checking stock:', error)
    return NextResponse.json(
      { available: false, stock: 0, unlimited: false },
      { status: 500 }
    )
  }
}
