'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { ImagePlus, Trash } from 'lucide-react'
import { CldUploadWidget } from 'next-cloudinary'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
   disabled?: boolean
   onChange: (value: string) => void
   onRemove: (value: string) => void
   value: string[]
   className?: string
}

const ImageUpload: React.FC<ImageUploadProps> = ({
   disabled,
   onChange,
   onRemove,
   value,
   className,
}) => {
   const [isMounted, setIsMounted] = React.useState(false)

   React.useEffect(() => {
      setIsMounted(true)
   }, [])

   const onSuccess = React.useCallback(
      (result: any) => {
         if (result?.info?.secure_url) {
            onChange(result.info.secure_url)
         }
      },
      [onChange]
   )

   const handleRemove = React.useCallback(
      (url: string) => {
         onRemove(url)
      },
      [onRemove]
   )

   if (!isMounted) {
      return null
   }

   // Filter valid URLs and ensure they are strings
   const validUrls = value.filter(
      (url) => typeof url === 'string' && url.trim() !== ''
   )

   return (
      <div className={cn('w-full', className)}>
         {validUrls.length > 0 && (
            <div className="mb-4 flex items-center gap-4 flex-wrap">
               {validUrls.map((url) => (
                  <div
                     key={url}
                     className="relative w-[200px] h-[200px] rounded-lg overflow-hidden border border-border bg-muted"
                  >
                     <div className="z-10 absolute top-2 right-2">
                        <Button
                           type="button"
                           onClick={() => handleRemove(url)}
                           variant="destructive"
                           size="icon"
                           className="h-8 w-8"
                        >
                           <Trash className="h-4 w-4" />
                        </Button>
                     </div>
                     <Image
                        fill
                        sizes="(min-width: 1000px) 30vw, 50vw"
                        className="object-cover"
                        alt="Uploaded image"
                        src={url}
                        priority={false}
                     />
                  </div>
               ))}
            </div>
         )}
         <CldUploadWidget onSuccess={onSuccess} uploadPreset="plottdesign">
            {({ open }) => (
               <Button
                  type="button"
                  disabled={disabled}
                  variant="secondary"
                  onClick={() => open?.()}
                  className="gap-2"
               >
                  <ImagePlus className="h-4 w-4" />
                  Upload an Image
               </Button>
            )}
         </CldUploadWidget>
      </div>
   )
}

ImageUpload.displayName = 'ImageUpload'

export default ImageUpload
