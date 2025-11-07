'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from '@/components/ui/select'
import { Loader2, Upload, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { Separator } from '@/components/native/separator'

interface CategoryItemData {
   id: string
   name: string
   ProductSize: { id: string; name: string; code: string }[]
   ProductZone: { id: string; name: string; code: string }[]
}

const MAX_IMAGES = 3

export const CustomizationForm = ({ product }: { product: any }) => {
   const [loading, setLoading] = useState(false)
   const [categoryItem, setCategoryItem] = useState<CategoryItemData | null>(null)
   const [selectedZone, setSelectedZone] = useState('')
   const [selectedSize, setSelectedSize] = useState('')
   const [uploadedImages, setUploadedImages] = useState<string[]>([])
   const [notes, setNotes] = useState('')
   const [uploading, setUploading] = useState(false)

   useEffect(() => {
      if (product.categoryItemId) {
         fetchCategoryItem()
      }
   }, [product.categoryItemId])

   const fetchCategoryItem = async () => {
      try {
         const res = await fetch(`/api/category-items/${product.categoryItemId}`)
         const data = await res.json()
         setCategoryItem(data)
      } catch (error) {
         console.error('Error fetching category item:', error)
      }
   }

   const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || [])
      if (files.length === 0) return

      const remainingSlots = MAX_IMAGES - uploadedImages.length
      if (files.length > remainingSlots) {
         alert(`You can only upload ${remainingSlots} more image(s)`)
         return
      }

      setUploading(true)
      const formData = new FormData()
      files.forEach(file => formData.append('files', file))
      formData.append('isAdmin', 'false')

      try {
         const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
         })
         const data = await res.json()
         
         if (res.ok) {
            setUploadedImages(prev => [...prev, ...data.urls])
         } else {
            alert(data.error || 'Upload failed')
         }
      } catch (error) {
         console.error('Error uploading images:', error)
         alert('Upload failed')
      } finally {
         setUploading(false)
      }
   }

   const removeImage = (index: number) => {
      setUploadedImages(prev => prev.filter((_, i) => i !== index))
   }

   const handleSubmit = async () => {
      if (!selectedZone || !selectedSize || uploadedImages.length === 0) {
         alert('Please complete all required fields')
         return
      }

      setLoading(true)
      try {
         const res = await fetch('/api/customization-requests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               productId: product.id,
               zoneId: selectedZone,
               sizeId: selectedSize,
               designImages: uploadedImages,
               notes,
            }),
         })

         if (res.ok) {
            alert('Customization request sent successfully!')
            // Reset form
            setUploadedImages([])
            setSelectedZone('')
            setSelectedSize('')
            setNotes('')
         }
      } catch (error) {
         console.error('Error submitting customization:', error)
         alert('Error sending request')
      } finally {
         setLoading(false)
      }
   }

   return (
      <div className="space-y-6">
         <Separator />
         <h3 className="text-lg font-semibold">Customize Your Product</h3>

         {/* Print Zone Selection */}
         <div className="space-y-2">
            <Label htmlFor="zone">Print Zone *</Label>
            <Select value={selectedZone} onValueChange={setSelectedZone}>
               <SelectTrigger id="zone">
                  <SelectValue placeholder="Select where to print" />
               </SelectTrigger>
               <SelectContent>
                  {categoryItem?.ProductZone.map((zone) => (
                     <SelectItem key={zone.id} value={zone.id}>
                        {zone.name}
                     </SelectItem>
                  ))}
               </SelectContent>
            </Select>
         </div>

         {/* Size Selection */}
         <div className="space-y-2">
            <Label htmlFor="size">Size *</Label>
            <Select value={selectedSize} onValueChange={setSelectedSize}>
               <SelectTrigger id="size">
                  <SelectValue placeholder="Select size" />
               </SelectTrigger>
               <SelectContent>
                  {categoryItem?.ProductSize.map((size) => (
                     <SelectItem key={size.id} value={size.id}>
                        {size.name} {size.code && `(${size.code})`}
                     </SelectItem>
                  ))}
               </SelectContent>
            </Select>
         </div>

         {/* Design Upload */}
         <div className="space-y-2">
            <Label htmlFor="design">
               Your Design * ({uploadedImages.length}/{MAX_IMAGES})
            </Label>
            
            {/* Uploaded Images Grid */}
            {uploadedImages.length > 0 && (
               <div className="grid grid-cols-3 gap-2 mb-4">
                  {uploadedImages.map((url, index) => (
                     <div key={index} className="relative aspect-square">
                        <Image
                           src={url}
                           alt={`Design ${index + 1}`}
                           fill
                           className="object-cover rounded-lg"
                        />
                        <Button
                           variant="destructive"
                           size="icon"
                           className="absolute top-1 right-1 h-6 w-6"
                           onClick={() => removeImage(index)}
                        >
                           <Trash2 className="h-3 w-3" />
                        </Button>
                     </div>
                  ))}
               </div>
            )}

            {/* Upload Area */}
            {uploadedImages.length < MAX_IMAGES && (
               <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <label className="cursor-pointer">
                     <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        multiple
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={uploading}
                     />
                     <div className="flex flex-col items-center gap-2">
                        {uploading ? (
                           <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
                        ) : (
                           <Upload className="h-12 w-12 text-muted-foreground" />
                        )}
                        <p className="text-sm text-muted-foreground">
                           {uploading ? 'Uploading...' : 'Click to upload your designs'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                           JPG, PNG, WEBP up to 10MB each (max {MAX_IMAGES} images)
                        </p>
                     </div>
                  </label>
               </div>
            )}
         </div>

         {/* Additional Notes */}
         <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
               id="notes"
               placeholder="Add any special instructions or details..."
               value={notes}
               onChange={(e) => setNotes(e.target.value)}
               rows={4}
            />
         </div>

         {/* Submit Button */}
         <Button
            onClick={handleSubmit}
            className="w-full"
            size="lg"
            disabled={loading || !selectedZone || !selectedSize || uploadedImages.length === 0}
         >
            {loading ? (
               <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Request...
               </>
            ) : (
               'Send Customization Request'
            )}
         </Button>
      </div>
   )
}
