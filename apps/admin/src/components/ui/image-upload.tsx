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

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

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

   const validateFile = (file: File): string | null => {
      if (!ALLOWED_TYPES.includes(file.type)) {
         return `Invalid file type: ${file.type}. Allowed: JPG, PNG, WEBP`
      }
      if (file.size > MAX_FILE_SIZE) {
         return 'File too large. Maximum size: 10MB'
      }
      return null
   }

   const uploadFiles = async (files: File[]) => {
      const formData = new FormData()
      files.forEach(file => formData.append('files', file))
      formData.append('isAdmin', 'true')

      const response = await fetch('/api/upload', {
         method: 'POST',
         body: formData,
      })

      if (!response.ok) {
         const error = await response.json()
         throw new Error(error.error || 'Upload failed')
      }

      const data = await response.json()
      return data.urls
   }

   const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || [])
      if (files.length === 0) return

      // Validate all files
      for (const file of files) {
         const error = validateFile(file)
         if (error) {
            alert(error)
            return
         }
      }

      try {
         setIsUploading(true)
         const urls = await uploadFiles(files)
         urls.forEach((url: string) => onChange(url))
      } catch (error) {
         console.error('Upload error:', error)
         alert(error instanceof Error ? error.message : 'Upload failed')
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

      const files = Array.from(e.dataTransfer.files).filter(file => 
         file.type.startsWith('image/')
      )
      
      if (files.length === 0) return

      // Validate all files
      for (const file of files) {
         const error = validateFile(file)
         if (error) {
            alert(error)
            return
         }
      }

      try {
         setIsUploading(true)
         const urls = await uploadFiles(files)
         urls.forEach((url: string) => onChange(url))
      } catch (error) {
         console.error('Upload error:', error)
         alert(error instanceof Error ? error.message : 'Upload failed')
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
                        : 'Drag and drop your images here'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                     or click the button below (multiple files supported)
                  </p>
                  <p className="text-xs text-muted-foreground">
                     JPG, PNG, WEBP up to 10MB each
                  </p>
               </div>
               <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  multiple
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
                  Select Images
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

