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
import Link from 'next/link'
import { useState } from 'react'
import { Paintbrush } from 'lucide-react'

export const ProductGrid = ({
   products,
}: {
   products: ProductWithIncludes[]
}) => {
   return (
      <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
         {products.map((product) => (
            <Product product={product} key={product.id} />
         ))}
      </div>
   )
}

export const ProductSkeletonGrid = () => {
   return (
      <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
         {[...Array(12)].map(() => (
            <ProductSkeleton key={Math.random()} />
         ))}
      </div>
   )
}

export const Product = ({ product }: { product: ProductWithIncludes }) => {
   const [imgError, setImgError] = useState(false)
   const [currentImageIndex, setCurrentImageIndex] = useState(0)

   const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (product.images.length <= 1) return
      
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const sectionWidth = rect.width / product.images.length
      const index = Math.floor(x / sectionWidth)
      
      setCurrentImageIndex(Math.min(index, product.images.length - 1))
   }

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
      <Link className="" href={`/products/${product.id}`}>
         <Card className="h-full hover:shadow-lg transition-shadow group">
            <CardHeader className="p-0">
               <div 
                  className="relative h-60 w-full bg-neutral-100 dark:bg-neutral-800"
                  onMouseMove={handleMouseMove}
                  onMouseLeave={() => setCurrentImageIndex(0)}
               >
                  {imgError ? (
                     <div className="flex h-full w-full items-center justify-center">
                        <ImageSkeleton />
                     </div>
                  ) : (
                     <Image
                        className="rounded-t-lg"
                        src={product?.images[currentImageIndex] || product?.images[0]}
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
                  {product.isCustomizable && (
                     <Badge className="absolute top-2 right-2 bg-primary" variant="default">
                        <Paintbrush className="w-3 h-3 mr-1" />
                        Customizable
                     </Badge>
                  )}
                  
                  {/* Image dots on hover */}
                  {product.images.length > 1 && (
                     <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {product.images.map((_, idx) => (
                           <div
                              key={idx}
                              className={`w-2 h-2 rounded-full transition-all ${
                                 idx === currentImageIndex 
                                    ? 'bg-white w-4' 
                                    : 'bg-white/50'
                              }`}
                           />
                        ))}
                     </div>
                  )}
               </div>
            </CardHeader>
            <CardContent className="grid gap-1 p-4">
               <div className="flex gap-2 items-center flex-wrap">
                  <Badge variant="outline" className="text-neutral-500">
                     {product?.categories[0]?.title}
                  </Badge>
                  {product?.brand && (
                     <Badge 
                        variant="secondary"
                        style={{ 
                          backgroundColor: product.brand.color || '#3B82F6',
                          color: '#ffffff'
                        }}
                     >
                        {product.brand.title}
                     </Badge>
                  )}
               </div>

               <h2 className="mt-2 font-semibold">{product.title}</h2>
               <p className="text-xs text-neutral-500 text-justify line-clamp-2">
                  {product.description}
               </p>
               
               {product.stock > 0 && product.stock <= 10 && (
                  <p className="text-xs text-orange-500 mt-1">
                     Only {product.stock} left
                  </p>
               )}
            </CardContent>
            <CardFooter>
               {product?.isAvailable ? (
                  <Price />
               ) : (
                  <Badge variant="secondary">Out of stock</Badge>
               )}
            </CardFooter>
         </Card>
      </Link>
   )
}

export function ProductSkeleton() {
   return (
      <Link href="#">
         <div className="animate-pulse rounded-lg border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800">
            <div className="relative h-full w-full">
               <div className="flex h-40 w-full items-center justify-center rounded bg-neutral-300 dark:bg-neutral-700 ">
                  <ImageSkeleton />
               </div>
            </div>
            <div className="p-5">
               <div className="w-full">
                  <div className="mb-4 h-2.5 w-48 rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
                  <div className="mb-2.5 h-2 max-w-[480px] rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
                  <div className="mb-2.5 h-2 rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
                  <div className="mb-2.5 h-2 max-w-[440px] rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
                  <div className="mb-2.5 h-2 max-w-[460px] rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
                  <div className="h-2 max-w-[360px] rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
               </div>
            </div>
         </div>
      </Link>
   )
}




