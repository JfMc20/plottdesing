'use client'

import { ImageSkeleton } from '@/components/native/icons'
import { Badge } from '@/components/ui/badge'
import {
   Card,
   CardContent,
   CardFooter,
   CardHeader,
} from '@/components/ui/card'
import { ProductWithIncludes } from '@/types/prisma'
import Image from 'next/image'
import { useState } from 'react'
import { Paintbrush } from 'lucide-react'
import { CustomizeModal } from './CustomizeModal'

export const CustomizableProductGrid = ({
   products,
}: {
   products: ProductWithIncludes[]
}) => {
   return (
      <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
         {products.map((product) => (
            <CustomizableProduct product={product} key={product.id} />
         ))}
      </div>
   )
}

export const CustomizableProduct = ({ product }: { product: ProductWithIncludes }) => {
   const [imgError, setImgError] = useState(false)
   const [showCustomizeModal, setShowCustomizeModal] = useState(false)

   function Price() {
      if (product?.discount > 0) {
         const price = product?.price - product?.discount
         const percentage = (product?.discount / product?.price) * 100
         return (
            <div className="flex gap-2 items-center">
               <Badge className="flex gap-4" variant="destructive">
                  <div className="line-through">${product?.price}</div>
                  <div>%{percentage.toFixed(2)}</div>
               </Badge>
               <h2 className="">${price.toFixed(2)}</h2>
            </div>
         )
      }

      return <h2>${product?.price}</h2>
   }

   return (
      <>
         <Card 
            className="h-full hover:shadow-lg transition-shadow cursor-pointer border-2 border-primary/20"
            onClick={() => setShowCustomizeModal(true)}
         >
            <CardHeader className="p-0">
               <div className="relative h-60 w-full bg-neutral-100 dark:bg-neutral-800">
                  {imgError ? (
                     <div className="flex h-full w-full items-center justify-center">
                        <ImageSkeleton />
                     </div>
                  ) : (
                     <Image
                        className="rounded-t-lg"
                        src={product?.images[0]}
                        alt={product?.title || 'product image'}
                        fill
                        sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
                        style={{ objectFit: 'cover' }}
                        loading="lazy"
                        placeholder="blur"
                        blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
                        onError={() => setImgError(true)}
                     />
                  )}
                  <Badge className="absolute top-2 right-2 bg-primary" variant="default">
                     <Paintbrush className="w-3 h-3 mr-1" />
                     Customizable
                  </Badge>
                  {product.images.length > 1 && (
                     <Badge className="absolute bottom-2 left-2" variant="outline">
                        +{product.images.length - 1} photos
                     </Badge>
                  )}
               </div>
            </CardHeader>
            <CardContent className="grid gap-1 p-4">
               <div className="flex gap-2 items-center flex-wrap">
                  <Badge variant="outline" className="text-neutral-500">
                     {product?.categories[0]?.title}
                  </Badge>
                  {product?.brand && (
                     <Badge variant="secondary">{product.brand.title}</Badge>
                  )}
               </div>

               <h2 className="mt-2 font-semibold">{product.title}</h2>
               <p className="text-xs text-neutral-500 text-justify line-clamp-2">
                  {product.description}
               </p>
               
               <p className="text-xs text-primary font-medium mt-2">
                  Click to customize your design
               </p>
            </CardContent>
            <CardFooter>
               {product?.isAvailable ? (
                  <div className="flex justify-between items-center w-full">
                     <Price />
                     <span className="text-xs text-muted-foreground">+ design</span>
                  </div>
               ) : (
                  <Badge variant="secondary">Out of stock</Badge>
               )}
            </CardFooter>
         </Card>

         <CustomizeModal
            product={product}
            open={showCustomizeModal}
            onClose={() => setShowCustomizeModal(false)}
         />
      </>
   )
}
