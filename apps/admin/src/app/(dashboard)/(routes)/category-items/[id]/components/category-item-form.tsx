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
import { HelpTooltip } from '@/components/ui/help-tooltip'
import { Input } from '@/components/ui/input'
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import { Category } from '@prisma/client'
import { Trash } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import * as z from 'zod'
import { AttributesManager } from './attributes-manager'
import { SizesManager } from './sizes-manager'
import { ZonesManager } from './zones-manager'

const formSchema = z.object({
   categoryId: z.string().min(1, 'Category is required'),
   name: z.string().min(2, 'Name must be at least 2 characters'),
   description: z.string().optional(),
   skuPattern: z.string().optional(),
   basePrice: z.coerce.number().min(0),
   sizes: z.array(z.any()).optional(),
   zones: z.array(z.any()).optional(),
   attributes: z.array(z.any()).optional(),
})

type CategoryItemFormValues = z.infer<typeof formSchema>

interface CategoryItemFormProps {
   initialData: any
   categories: Category[]
}

export const CategoryItemForm: React.FC<CategoryItemFormProps> = ({
   initialData,
   categories,
}) => {
   const params = useParams()
   const router = useRouter()

   const [open, setOpen] = useState(false)
   const [loading, setLoading] = useState(false)

   const title = initialData ? 'Edit category item' : 'Create category item'
   const description = initialData
      ? 'Edit a category item.'
      : 'Add a new category item'
   const toastMessage = initialData
      ? 'Category item updated.'
      : 'Category item created.'
   const action = initialData ? 'Save changes' : 'Create'

   const form = useForm<CategoryItemFormValues>({
      resolver: zodResolver(formSchema),
      defaultValues: initialData || {
         categoryId: '',
         name: '',
         description: '',
         skuPattern: '',
         basePrice: 0,
         sizes: [],
         zones: [],
         attributes: [],
      },
   })

   const onSubmit = async (data: CategoryItemFormValues) => {
      try {
         setLoading(true)
         if (initialData) {
            await fetch(`/api/category-items/${params.id}`, {
               method: 'PATCH',
               body: JSON.stringify(data),
               cache: 'no-store',
            })
         } else {
            await fetch(`/api/category-items`, {
               method: 'POST',
               body: JSON.stringify(data),
               cache: 'no-store',
            })
         }
         router.refresh()
         router.push(`/category-items`)
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

         await fetch(`/api/category-items/${params.id}`, {
            method: 'DELETE',
            cache: 'no-store',
         })

         router.refresh()
         router.push(`/category-items`)
         toast.success('Category item deleted.')
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
         <div className="flex items-center justify-between">
            <Heading title={title} description={description} />
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
                     name="categoryId"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Category</FormLabel>
                           <Select
                              disabled={loading}
                              onValueChange={field.onChange}
                              value={field.value}
                              defaultValue={field.value}
                           >
                              <FormControl>
                                 <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                 </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                 {categories.map((category) => (
                                    <SelectItem
                                       key={category.id}
                                       value={category.id}
                                    >
                                       {category.title}
                                    </SelectItem>
                                 ))}
                              </SelectContent>
                           </Select>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
                  <FormField
                     control={form.control}
                     name="name"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Name</FormLabel>
                           <FormControl>
                              <Input
                                 disabled={loading}
                                 placeholder="Item name"
                                 {...field}
                              />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
                  <FormField
                     control={form.control}
                     name="basePrice"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Base Price</FormLabel>
                           <FormControl>
                              <Input
                                 type="number"
                                 step="0.01"
                                 disabled={loading}
                                 placeholder="0.00"
                                 {...field}
                              />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
               </div>

               <div className="md:grid md:grid-cols-2 gap-8">
                  <FormField
                     control={form.control}
                     name="description"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Description</FormLabel>
                           <FormControl>
                              <Textarea
                                 disabled={loading}
                                 placeholder="Item description"
                                 {...field}
                              />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
                  <FormField
                     control={form.control}
                     name="skuPattern"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>
                              SKU Pattern
                              <HelpTooltip content="Template for generating product codes. Use {SIZE}, {COLOR}, etc. Example: TSHIRT-{SIZE}-{COLOR} generates TSHIRT-M-RED" />
                           </FormLabel>
                           <FormControl>
                              <Input
                                 disabled={loading}
                                 placeholder="e.g., TSHIRT-{SIZE}-{COLOR}"
                                 {...field}
                              />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
               </div>

               <Separator />
               <SizesManager form={form} loading={loading} />

               <Separator />
               <ZonesManager form={form} loading={loading} />

               <Separator />
               <AttributesManager form={form} loading={loading} />

               <Button disabled={loading} className="ml-auto" type="submit">
                  {action}
               </Button>
            </form>
         </Form>
      </>
   )
}
