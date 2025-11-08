'use client'

import { cn } from '@/lib/utils'
import Autoplay from 'embla-carousel-autoplay'
import useEmblaCarousel from 'embla-carousel-react'
import { ImageIcon } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

type Banner = {
   id: string
   image: string
   categoryId: string | null
}

export default function Carousel({ banners }: { banners: Banner[] }) {
   const router = useRouter()
   const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay()])
   const [selectedIndex, setSelectedIndex] = useState(0)
   const [imageErrors, setImageErrors] = useState<Set<number>>(new Set())

   useEffect(() => {
      function selectHandler() {
         const index = emblaApi?.selectedScrollSnap()
         setSelectedIndex(index || 0)
      }

      emblaApi?.on('select', selectHandler)

      return () => {
         emblaApi?.off('select', selectHandler)
      }
   }, [emblaApi])

   const handleImageError = (index: number) => {
      setImageErrors((prev) => new Set(prev).add(index))
   }

   const handleBannerClick = (banner: Banner) => {
      if (banner.categoryId) {
         router.push(`/category/${banner.categoryId}`)
      }
   }

   // If no banners or all failed, show placeholder
   if (!banners || banners.length === 0 || imageErrors.size === banners.length) {
      return (
         <div className="flex h-96 items-center justify-center rounded-lg bg-muted">
            <div className="text-center text-muted-foreground">
               <ImageIcon className="mx-auto h-16 w-16 mb-2" />
               <p className="text-sm">No image available</p>
            </div>
         </div>
      )
   }

   return (
      <>
         <div className="overflow-hidden rounded-lg" ref={emblaRef}>
            <div className="flex">
               {banners.map((banner, i) => (
                  <div 
                     className={cn(
                        "relative h-96 flex-[0_0_100%]",
                        banner.categoryId && "cursor-pointer"
                     )}
                     key={banner.id}
                     onClick={() => handleBannerClick(banner)}
                  >
                     {imageErrors.has(i) ? (
                        <div className="flex h-full items-center justify-center bg-muted">
                           <div className="text-center text-muted-foreground">
                              <ImageIcon className="mx-auto h-12 w-12 mb-2" />
                              <p className="text-xs">Image unavailable</p>
                           </div>
                        </div>
                     ) : (
                        <Image
                           src={banner.image}
                           fill
                           className="object-cover"
                           alt=""
                           priority={i === 0}
                           loading={i === 0 ? 'eager' : 'lazy'}
                           sizes="100vw"
                           onError={() => handleImageError(i)}
                        />
                     )}
                  </div>
               ))}
            </div>
         </div>
         <Dots itemsLength={banners.length} selectedIndex={selectedIndex} />
      </>
   )
}

type Props = {
   itemsLength: number
   selectedIndex: number
}
const Dots = ({ itemsLength, selectedIndex }: Props) => {
   const arr = new Array(itemsLength).fill(0)
   return (
      <div className="flex gap-1 justify-center -translate-y-8">
         {arr.map((_, index) => {
            const selected = index === selectedIndex
            return (
               <div
                  className={cn({
                     'h-3 w-3 rounded-full transition-all duration-300 bg-primary-foreground':
                        true,
                     // tune down the opacity if slide is not selected
                     'h-3 w-3 opacity-50': !selected,
                  })}
                  key={index}
               />
            )
         })}
      </div>
   )
}
