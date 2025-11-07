import { Separator } from '@/components/native/separator'
import { Badge } from '@/components/ui/badge'
import type { ProductWithIncludes } from '@/types/prisma'
import Link from 'next/link'
import { Paintbrush, Package2, Ruler, Weight } from 'lucide-react'

import CartButton from './cart_button'
import WishlistButton from './wishlist_button'
import { CustomizationForm } from './customization-form'

export const DataSection = async ({
   product,
}: {
   product: ProductWithIncludes
}) => {
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

   const hasPhysicalDetails = product.weight || product.width || product.height || product.length

   return (
      <div className="col-span-2 w-full rounded-lg bg-neutral-100 p-6 dark:bg-neutral-900">
         <div className="flex items-center gap-2 mb-4">
            <h3 className="text-xl font-medium">{product.title}</h3>
            {product.isCustomizable && (
               <Badge className="bg-primary" variant="default">
                  <Paintbrush className="w-3 h-3 mr-1" />
                  Customizable
               </Badge>
            )}
            {product.isPrintOnDemand && (
               <Badge variant="outline">
                  Print on Demand
               </Badge>
            )}
         </div>
         
         <Separator />
         
         <div className="flex gap-2 mb-2 items-center">
            <p className="text-sm">Brand:</p>
            <Link href={`/products?brand=${product?.brand?.title}`}>
               <Badge variant="outline">{product?.brand?.title}</Badge>
            </Link>
         </div>
         
         <div className="flex gap-2 items-center">
            <p className="text-sm">Categories:</p>
            {product.categories.map(({ title }, index) => (
               <Link key={index} href={`/products?categories=${title}`}>
                  <Badge variant="outline">{title}</Badge>
               </Link>
            ))}
         </div>
         
         <Separator />
         
         {product.description && product.description.trim() !== '' && (
            <>
               <div className="py-2">
                  <p className="text-sm leading-relaxed">{product.description}</p>
               </div>
               <Separator />
            </>
         )}

         {hasPhysicalDetails && (
            <>
               <div className="grid grid-cols-2 gap-4 text-sm">
                  {product.weight && (
                     <div className="flex items-center gap-2">
                        <Weight className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Weight:</span>
                        <span className="font-medium">{product.weight} kg</span>
                     </div>
                  )}
                  {(product.width || product.height || product.length) && (
                     <div className="flex items-center gap-2">
                        <Ruler className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Dimensions:</span>
                        <span className="font-medium">
                           {product.width && `${product.width}cm`}
                           {product.height && ` × ${product.height}cm`}
                           {product.length && ` × ${product.length}cm`}
                        </span>
                     </div>
                  )}
               </div>
               <Separator />
            </>
         )}
         
         <div className="block space-y-4">
            <Price />
            
            {product.isCustomizable ? (
               <CustomizationForm product={product} />
            ) : (
               <div className="flex gap-2">
                  <CartButton product={product} />
                  <WishlistButton product={product} />
               </div>
            )}
         </div>
      </div>
   )
}
