'use client'

import { AlertModal } from '@/components/modals/alert-modal'
import { Button } from '@/components/ui/button'
import {
   Form,
   FormControl,
   FormField,
   FormItem,
   FormLabel,
   FormMessage,
} from '@/components/ui/form'
import { Heading } from '@/components/ui/heading'
import { Input } from '@/components/ui/input'
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { zodResolver } from '@hookform/resolvers/zod'
import { Banner, Category } from '@prisma/client'
import { Archive, Trash } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import * as z from 'zod'

const formSchema = z.object({
   title: z.string().min(2),
   bannerId: z.string().min(1),
})

type CategoryFormValues = z.infer<typeof formSchema>

interface CategoryFormProps {
   initialData: Category | null
   banners: Banner[]
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
   initialData,
   banners,
}) => {
   const params = useParams()
   const router = useRouter()

   const [open, setOpen] = useState(false)
   const [archiveOpen, setArchiveOpen] = useState(false)
   const [loading, setLoading] = useState(false)

   const title = initialData ? 'Edit category' : 'Create category'
   const description = initialData ? 'Edit a category.' : 'Add a new category'
   const toastMessage = initialData ? 'Category updated.' : 'Category created.'
   const action = initialData ? 'Save changes' : 'Create'

   const form = useForm<CategoryFormValues>({
      resolver: zodResolver(formSchema),
      defaultValues: initialData || {
         title: '',
         bannerId: '',
      },
   })

   const onSubmit = async (data: CategoryFormValues) => {
      try {
         setLoading(true)
         if (initialData) {
            await fetch(`/api/categories/${params.categoryId}`, {
               method: 'PATCH',
               body: JSON.stringify(data),
               cache: 'no-store',
            })
         } else {
            await fetch(`/api/categories`, {
               method: 'POST',
               body: JSON.stringify(data),
               cache: 'no-store',
            })
         }
         router.refresh()
         router.push(`/categories`)
         toast.success(toastMessage)
      } catch (error: any) {
         toast.error('Something went wrong.')
      } finally {
         setLoading(false)
      }
   }

   const onArchive = async () => {
      try {
         setLoading(true)

         await fetch(`/api/categories/${params.categoryId}`, {
            method: 'PATCH',
            body: JSON.stringify({ isArchived: !initialData?.isArchived }),
            cache: 'no-store',
         })

         router.refresh()
         router.push(`/categories`)
         toast.success(initialData?.isArchived ? 'Category unarchived.' : 'Category archived.')
      } catch (error: any) {
         toast.error('Something went wrong.')
      } finally {
         setLoading(false)
         setArchiveOpen(false)
      }
   }

   const onDelete = async () => {
      try {
         setLoading(true)

         const response = await fetch(`/api/categories/${params.categoryId}`, {
            method: 'DELETE',
            cache: 'no-store',
         })

         if (!response.ok) {
            const errorText = await response.text()
            toast.error(errorText || 'Failed to delete category')
            return
         }

         router.refresh()
         router.push(`/categories`)
         toast.success('Category deleted.')
      } catch (error: any) {
         toast.error('Something went wrong.')
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
         <AlertModal
            isOpen={archiveOpen}
            onClose={() => setArchiveOpen(false)}
            onConfirm={onArchive}
            loading={loading}
            title={initialData?.isArchived ? "Unarchive Category" : "Archive Category"}
            description={initialData?.isArchived ? "This will make the category visible again." : "This will hide the category from the store."}
         />
         <div className="flex items-center justify-between">
            <Heading title={title} description={description} />
            {initialData && (
               <div className="flex gap-2">
                  <Button
                     disabled={loading}
                     variant="outline"
                     size="sm"
                     onClick={() => setArchiveOpen(true)}
                  >
                     <Archive className="h-4" />
                  </Button>
                  <Button
                     disabled={loading}
                     variant="destructive"
                     size="sm"
                     onClick={() => setOpen(true)}
                  >
                     <Trash className="h-4" />
                  </Button>
               </div>
            )}
         </div>
         <Separator />
         <Form {...form}>
            <form
               onSubmit={form.handleSubmit(onSubmit)}
               className="space-y-8 w-full"
            >
               <div className="md:grid md:grid-cols-3 gap-8">
                  <FormField
                     control={form.control}
                     name="title"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Name</FormLabel>
                           <FormControl>
                              <Input
                                 disabled={loading}
                                 placeholder="Category name"
                                 {...field}
                              />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
                  <FormField
                     control={form.control}
                     name="bannerId"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Banner</FormLabel>
                           <Select
                              disabled={loading}
                              onValueChange={field.onChange}
                              value={field.value}
                              defaultValue={field.value}
                           >
                              <FormControl>
                                 <SelectTrigger>
                                    <SelectValue
                                       defaultValue={field.value}
                                       placeholder="Select a banner"
                                    />
                                 </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                 {banners.map((banner) => (
                                    <SelectItem
                                       key={banner.id}
                                       value={banner.id}
                                    >
                                       {banner.label}
                                    </SelectItem>
                                 ))}
                              </SelectContent>
                           </Select>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
               </div>
               <Button disabled={loading} className="ml-auto" type="submit">
                  {action}
               </Button>
            </form>
         </Form>
      </>
   )
}
