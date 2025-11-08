'use client'

import * as z from 'zod'
import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { Trash } from 'lucide-react'
import { Banner } from '@prisma/client'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
   Form,
   FormControl,
   FormField,
   FormItem,
   FormLabel,
   FormMessage,
} from '@/components/ui/form'
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Heading } from '@/components/ui/heading'
import { AlertModal } from '@/components/modals/alert-modal'

// Import ImageUpload dynamically to avoid hydration errors
const ImageUpload = dynamic(() => import('@/components/ui/image-upload'), {
   ssr: false,
})

const formSchema = z.object({
   label: z.string().min(1),
   image: z.string().min(1),
   categoryId: z.string().optional(),
})

type BannerFormValues = z.infer<typeof formSchema>

interface BannerFormProps {
   initialData: Banner | null
   categories: { id: string; title: string }[]
}

export const BannerForm: React.FC<BannerFormProps> = ({ initialData, categories }) => {
   const params = useParams()
   const router = useRouter()

   const [open, setOpen] = useState(false)
   const [loading, setLoading] = useState(false)

   const title = initialData ? 'Edit banner' : 'Create banner'
   const description = initialData ? 'Edit a banner.' : 'Add a new banner'
   const toastMessage = initialData ? 'Banner updated.' : 'Banner created.'
   const action = initialData ? 'Save changes' : 'Create'

   const form = useForm<BannerFormValues>({
      resolver: zodResolver(formSchema),
      defaultValues: initialData || {
         label: '',
         image: '',
         categoryId: '',
      },
   })

   const onSubmit = async (data: BannerFormValues) => {
      try {
         setLoading(true)
         if (initialData) {
            await fetch(`/api/banners/${params.bannerId}`, {
               method: 'PATCH',
               body: JSON.stringify(data),
               cache: 'no-store',
            })
         } else {
            await fetch(`/api/banners`, {
               method: 'POST',
               body: JSON.stringify(data),
               cache: 'no-store',
            })
         }
         router.refresh()
         router.push(`/banners`)
         toast.success(toastMessage)
      } catch (error: any) {
         toast.error('Something went wrong.')
      } finally {
         setLoading(false)
      }
   }

   const onDelete = async () => {
      try {
         setLoading(true)

         await fetch(`/api/banners/${params.bannerId}`, {
            method: 'DELETE',
            cache: 'no-store',
         })

         router.refresh()
         router.push(`/banners`)
         toast.success('Banner deleted.')
      } catch (error: any) {
         toast.error(
            'Make sure you removed all categories using this banner first.'
         )
      } finally {
         setLoading(false)
         setOpen(false)
      }
   }

   return (
      <>
         <AlertModal
            isOpen={open}
            onClose={() => setOpen(false)}
            onConfirm={onDelete}
            loading={loading}
         />
         <div className="flex items-center justify-between">
            <Heading title={title} description={description} />
            <div className="flex gap-2">
               {initialData && (
                  <Button
                     disabled={loading}
                     variant="destructive"
                     size="sm"
                     onClick={() => setOpen(true)}
                  >
                     <Trash className="h-4" />
                  </Button>
               )}
               <Button
                  disabled={loading}
                  type="submit"
                  form="banner-form"
               >
                  {action}
               </Button>
            </div>
         </div>
         <Separator />
         <Form {...form}>
            <form
               id="banner-form"
               onSubmit={form.handleSubmit(onSubmit)}
               className="space-y-8 w-full"
            >
               <div className="md:grid md:grid-cols-3 gap-8">
                  <FormField
                     control={form.control}
                     name="label"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Label</FormLabel>
                           <FormControl>
                              <Input
                                 disabled={loading}
                                 placeholder="Banner label"
                                 {...field}
                              />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
                  <FormField
                     control={form.control}
                     name="categoryId"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Category (Optional)</FormLabel>
                           <Select
                              disabled={loading}
                              onValueChange={(value) => field.onChange(value === 'none' ? undefined : value)}
                              value={field.value || 'none'}
                              defaultValue={field.value || 'none'}
                           >
                              <FormControl>
                                 <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                 </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                 <SelectItem value="none">None</SelectItem>
                                 {categories.map((category) => (
                                    <SelectItem key={category.id} value={category.id}>
                                       {category.title}
                                    </SelectItem>
                                 ))}
                              </SelectContent>
                           </Select>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
               </div>
               <Separator />
               <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                     <FormItem>
                        <FormLabel>Banner Image</FormLabel>
                        <FormControl>
                           <ImageUpload
                              value={field.value ? [field.value] : []}
                              disabled={loading}
                              onChange={(url) => field.onChange(url)}
                              onRemove={() => field.onChange('')}
                           />
                        </FormControl>
                        <FormMessage />
                     </FormItem>
                  )}
               />
            </form>
         </Form>
      </>
   )
}
