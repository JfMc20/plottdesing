'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { ImagePlus, Trash, Loader2, Upload } from 'lucide-react'
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
   const [isUploading, setIsUploading] = React.useState(false)
   const [isDragging, setIsDragging] = React.useState(false)
   const fileInputRef = React.useRef<HTMLInputElement>(null)

   React.useEffect(() => {
      setIsMounted(true)
   }, [])

   const uploadToCloudinary = async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', 'plottdesign')

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

      const response = await fetch(
         `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
         {
            method: 'POST',
            body: formData,
         }
      )

      if (!response.ok) {
         throw new Error('Upload failed')
      }

      const data = await response.json()
      return data.secure_url
   }

   const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      try {
         setIsUploading(true)
         const url = await uploadToCloudinary(file)
         onChange(url)
      } catch (error) {
         console.error('Upload error:', error)
      } finally {
         setIsUploading(false)
         if (fileInputRef.current) {
            fileInputRef.current.value = ''
         }
      }
   }

   const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)

      if (disabled || isUploading) return

      const file = e.dataTransfer.files?.[0]
      if (!file || !file.type.startsWith('image/')) return

      try {
         setIsUploading(true)
         const url = await uploadToCloudinary(file)
         onChange(url)
      } catch (error) {
         console.error('Upload error:', error)
      } finally {
         setIsUploading(false)
      }
   }

   const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      if (!disabled && !isUploading) {
         setIsDragging(true)
      }
   }

   const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)
   }

   if (!isMounted) {
      return null
   }

   const validUrls = value.filter(
      (url) => typeof url === 'string' && url.trim() !== ''
   )

   return (
      <div className={cn('w-full space-y-4', className)}>
         <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={cn(
               'border-2 border-dashed rounded-lg p-8 transition-colors',
               isDragging && 'border-primary bg-primary/5',
               !isDragging && 'border-border',
               (disabled || isUploading) && 'opacity-50 cursor-not-allowed'
            )}
         >
            <div className="flex flex-col items-center justify-center gap-4 text-center">
               <div className="rounded-full bg-muted p-4">
                  {isUploading ? (
                     <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  ) : (
                     <Upload className="h-8 w-8 text-muted-foreground" />
                  )}
               </div>
               <div className="space-y-2">
                  <p className="text-sm font-medium">
                     {isUploading
                        ? 'Uploading...'
                        : 'Drag and drop your image here'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                     or click the button below
                  </p>
               </div>
               <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={disabled || isUploading}
                  className="hidden"
               />
               <Button
                  type="button"
                  disabled={disabled || isUploading}
                  variant="secondary"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2"
               >
                  <ImagePlus className="h-4 w-4" />
                  Select Image
               </Button>
            </div>
         </div>

         {validUrls.length > 0 && (
            <div className="flex items-center gap-4 flex-wrap">
               {validUrls.map((url) => (
                  <div
                     key={url}
                     className="relative w-[200px] h-[200px] rounded-lg overflow-hidden border border-border bg-muted group"
                  >
                     <div className="z-10 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                           type="button"
                           onClick={() => onRemove(url)}
                           variant="destructive"
                           size="icon"
                           className="h-8 w-8"
                           disabled={disabled}
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
      </div>
   )
}

ImageUpload.displayName = 'ImageUpload'

export default ImageUpload
