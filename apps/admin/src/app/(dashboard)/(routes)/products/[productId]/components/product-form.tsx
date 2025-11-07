'use client'

import { AlertModal } from '@/components/modals/alert-modal'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
   Form,
   FormControl,
   FormDescription,
   FormField,
   FormItem,
   FormLabel,
   FormMessage,
} from '@/components/ui/form'
import { Heading } from '@/components/ui/heading'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { HelpTooltip } from '@/components/ui/help-tooltip'
import dynamic from 'next/dynamic'

// Import ImageUpload dynamically to avoid hydration errors
const ImageUpload = dynamic(() => import('@/components/ui/image-upload'), {
   ssr: false,
})
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import type { ProductWithIncludes } from '@/types/prisma'
import { zodResolver } from '@hookform/resolvers/zod'
import { Category } from '@prisma/client'
import { Archive, Trash } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import * as z from 'zod'

const formSchema = z.object({
   title: z.string().min(1),
   description: z.string().optional(),
   images: z.string().array(),
   price: z.coerce.number().min(1),
   discount: z.coerce.number().min(0),
   stock: z.coerce.number().min(0),
   weight: z.coerce.number().min(0).optional(),
   width: z.coerce.number().min(0).optional(),
   height: z.coerce.number().min(0).optional(),
   length: z.coerce.number().min(0).optional(),
   categoryId: z.string().min(1),
   brandId: z.string().min(1),
   categoryItemId: z.string().optional(),
   productType: z.enum(['normal', 'customizable', 'print-on-demand']).default('normal'),
   isFeatured: z.boolean().default(false).optional(),
   isAvailable: z.boolean().default(false).optional(),
})

type ProductFormValues = z.infer<typeof formSchema>

interface ProductFormProps {
   initialData: ProductWithIncludes | null
   categories: Category[]
   brands: { id: string; title: string }[]
   categoryItems: { id: string; name: string; categoryId: string }[]
}

export const ProductForm: React.FC<ProductFormProps> = ({
   initialData,
   categories,
   brands,
   categoryItems,
}) => {
   const params = useParams()
   const router = useRouter()

   const [open, setOpen] = useState(false)
   const [archiveOpen, setArchiveOpen] = useState(false)
   const [loading, setLoading] = useState(false)
   const [selectedCategoryId, setSelectedCategoryId] = useState(
      initialData?.categories?.[0]?.id || ''
   )

   // Filter category items based on selected category
   const filteredCategoryItems = categoryItems.filter(
      item => item.categoryId === selectedCategoryId
   )

   const title = initialData ? 'Edit product' : 'Create product'
   const description = initialData ? 'Edit a product.' : 'Add a new product'
   const toastMessage = initialData ? 'Product updated.' : 'Product created.'
   const action = initialData ? 'Save changes' : 'Create'

   const defaultValues = initialData
      ? {
           ...initialData,
           description: initialData.description || '',
           price: parseFloat(String(initialData?.price.toFixed(2))),
           discount: parseFloat(String(initialData?.discount.toFixed(2))),
           weight: initialData.weight || undefined,
           width: initialData.width || undefined,
           height: initialData.height || undefined,
           length: initialData.length || undefined,
           categoryId: initialData.categories?.[0]?.id || '',
           brandId: initialData.brandId,
           categoryItemId: initialData.categoryItemId || '',
           productType: initialData.isPrintOnDemand 
              ? 'print-on-demand' as const
              : initialData.isCustomizable 
                 ? 'customizable' as const
                 : 'normal' as const,
        }
      : {
           title: '',
           description: '',
           images: [],
           price: 0,
           discount: 0,
           stock: 0,
           weight: undefined,
           width: undefined,
           height: undefined,
           length: undefined,
           categoryId: '',
           brandId: '',
           categoryItemId: '',
           productType: 'normal' as const,
           isFeatured: false,
           isAvailable: false,
        }

   const form = useForm<ProductFormValues>({
      resolver: zodResolver(formSchema),
      defaultValues,
   })

   const onSubmit = async (data: ProductFormValues) => {
      try {
         setLoading(true)

         // Convert productType to booleans
         const submitData = {
            ...data,
            isCustomizable: data.productType === 'customizable',
            isPrintOnDemand: data.productType === 'print-on-demand',
         }

         if (initialData) {
            await fetch(`/api/products/${params.productId}`, {
               method: 'PATCH',
               body: JSON.stringify(submitData),
               cache: 'no-store',
            })
         } else {
            await fetch(`/api/products`, {
               method: 'POST',
               body: JSON.stringify(submitData),
               cache: 'no-store',
            })
         }

         router.refresh()
         router.push(`/products`)
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

         await fetch(`/api/products/${params.productId}`, {
            method: 'PATCH',
            body: JSON.stringify({ isArchived: !initialData?.isArchived }),
            cache: 'no-store',
         })

         router.refresh()
         router.push(`/products`)
         toast.success(initialData?.isArchived ? 'Product unarchived.' : 'Product archived.')
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

         await fetch(`/api/products/${params.productId}`, {
            method: 'DELETE',
            cache: 'no-store',
         })

         router.refresh()
         router.push(`/products`)
         toast.success('Product deleted.')
      } catch (error: any) {
         toast.error('Something went wrong.')
      } finally {
         setLoading(false)
         setOpen(false)
      }
   }

   const hasOrders = initialData?.orders && initialData.orders.length > 0

   return (
      <>
         <AlertModal
            isOpen={open}
            onClose={() => setOpen(false)}
            onConfirm={onDelete}
            loading={loading}
            title="Delete Product"
            description="This action cannot be undone."
         />
         <AlertModal
            isOpen={archiveOpen}
            onClose={() => setArchiveOpen(false)}
            onConfirm={onArchive}
            loading={loading}
            title={initialData?.isArchived ? "Unarchive Product" : "Archive Product"}
            description={initialData?.isArchived ? "This will make the product visible again." : "This will hide the product from the store."}
         />
         <div className="flex items-center justify-between">
            <Heading title={title} description={description} />
            <div className="flex gap-2">
               {initialData && (
                  <>
                     <Button
                        disabled={loading}
                        variant="outline"
                        size="sm"
                        onClick={() => setArchiveOpen(true)}
                     >
                        <Archive className="h-4" />
                     </Button>
                     {!hasOrders && (
                        <Button
                           disabled={loading}
                           variant="destructive"
                           size="sm"
                           onClick={() => setOpen(true)}
                        >
                           <Trash className="h-4" />
                        </Button>
                     )}
                  </>
               )}
               <Button
                  disabled={loading}
                  type="submit"
                  form="product-form"
               >
                  {action}
               </Button>
            </div>
         </div>
         <Separator />
         <Form {...form}>
            <form
               id="product-form"
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
                                 placeholder="Product title"
                                 {...field}
                              />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
                  <FormField
                     control={form.control}
                     name="description"
                     render={({ field }) => (
                        <FormItem className="md:col-span-2">
                           <FormLabel>Description</FormLabel>
                           <FormControl>
                              <Textarea
                                 disabled={loading}
                                 placeholder="Product description"
                                 rows={3}
                                 {...field}
                              />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
                  <FormField
                     control={form.control}
                     name="price"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Price</FormLabel>
                           <FormControl>
                              <Input
                                 type="number"
                                 disabled={loading}
                                 placeholder="9.99"
                                 {...field}
                              />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
                  <FormField
                     control={form.control}
                     name="discount"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>
                              Discount
                              <HelpTooltip content="Descuento en el precio del producto. Se resta del precio base." />
                           </FormLabel>
                           <FormControl>
                              <Input
                                 type="number"
                                 disabled={loading}
                                 placeholder="9.99"
                                 {...field}
                              />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
                  <FormField
                     control={form.control}
                     name="stock"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>
                              Stock
                              <HelpTooltip content="Cantidad disponible del producto en inventario." />
                           </FormLabel>
                           <FormControl>
                              <Input
                                 type="number"
                                 disabled={loading}
                                 placeholder="10"
                                 {...field}
                              />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
                  <FormField
                     control={form.control}
                     name="weight"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>
                              Weight (kg)
                              <HelpTooltip content="Peso del producto para calcular costos de envío." />
                           </FormLabel>
                           <FormControl>
                              <Input
                                 type="number"
                                 step="0.01"
                                 disabled={loading}
                                 placeholder="0.5"
                                 {...field}
                              />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
                  <FormField
                     control={form.control}
                     name="width"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>
                              Width (cm)
                              <HelpTooltip content="Ancho del paquete para calcular costos de envío." />
                           </FormLabel>
                           <FormControl>
                              <Input
                                 type="number"
                                 step="0.1"
                                 disabled={loading}
                                 placeholder="10"
                                 {...field}
                              />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
                  <FormField
                     control={form.control}
                     name="height"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>
                              Height (cm)
                              <HelpTooltip content="Alto del paquete para calcular costos de envío." />
                           </FormLabel>
                           <FormControl>
                              <Input
                                 type="number"
                                 step="0.1"
                                 disabled={loading}
                                 placeholder="10"
                                 {...field}
                              />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
                  <FormField
                     control={form.control}
                     name="length"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>
                              Length (cm)
                              <HelpTooltip content="Largo del paquete para calcular costos de envío." />
                           </FormLabel>
                           <FormControl>
                              <Input
                                 type="number"
                                 step="0.1"
                                 disabled={loading}
                                 placeholder="10"
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
                           <FormLabel>Category</FormLabel>
                           <Select
                              disabled={loading}
                              onValueChange={(value) => {
                                 field.onChange(value)
                                 setSelectedCategoryId(value)
                                 // Reset categoryItemId when category changes
                                 form.setValue('categoryItemId', '')
                              }}
                              value={field.value}
                              defaultValue={field.value}
                           >
                              <FormControl>
                                 <SelectTrigger>
                                    <SelectValue
                                       defaultValue={field.value}
                                       placeholder="Select a category"
                                    />
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
                     name="categoryItemId"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>
                              Category Item
                              <HelpTooltip content="Tipo específico de producto dentro de la categoría seleccionada." />
                           </FormLabel>
                           <Select
                              disabled={loading || !selectedCategoryId}
                              onValueChange={field.onChange}
                              value={field.value}
                              defaultValue={field.value}
                           >
                              <FormControl>
                                 <SelectTrigger>
                                    <SelectValue
                                       defaultValue={field.value}
                                       placeholder={selectedCategoryId ? "Select a category item" : "Select category first"}
                                    />
                                 </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                 {filteredCategoryItems.map((item) => (
                                    <SelectItem
                                       key={item.id}
                                       value={item.id}
                                    >
                                       {item.name}
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
                     name="brandId"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Brand</FormLabel>
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
                                       placeholder="Select a brand"
                                    />
                                 </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                 {brands.map((brand) => (
                                    <SelectItem
                                       key={brand.id}
                                       value={brand.id}
                                    >
                                       {brand.title}
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
                     name="productType"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>
                              Product Type
                              <HelpTooltip content="Normal: Regular product with stock. Customizable: Customer can personalize. Print on Demand: Unlimited stock." />
                           </FormLabel>
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
                                       placeholder="Select product type"
                                    />
                                 </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                 <SelectItem value="normal">
                                    Normal Product
                                 </SelectItem>
                                 <SelectItem value="customizable">
                                    Customizable Product
                                 </SelectItem>
                                 <SelectItem value="print-on-demand">
                                    Print on Demand
                                 </SelectItem>
                              </SelectContent>
                           </Select>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
                  <FormField
                     control={form.control}
                     name="isFeatured"
                     render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                           <FormControl>
                              <Checkbox
                                 checked={field.value}
                                 onCheckedChange={field.onChange}
                              />
                           </FormControl>
                           <div className="space-y-1 leading-none">
                              <FormLabel>Featured</FormLabel>
                              <FormDescription>
                                 This product will appear on the home page
                              </FormDescription>
                           </div>
                        </FormItem>
                     )}
                  />
                  <FormField
                     control={form.control}
                     name="isAvailable"
                     render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                           <FormControl>
                              <Checkbox
                                 checked={field.value}
                                 onCheckedChange={field.onChange}
                              />
                           </FormControl>
                           <div className="space-y-1 leading-none">
                              <FormLabel>Available</FormLabel>
                              <FormDescription>
                                 This product will appear in the store.
                              </FormDescription>
                           </div>
                        </FormItem>
                     )}
                  />
               </div>
               <Separator />
               <FormField
                  control={form.control}
                  name="images"
                  render={({ field }) => (
                     <FormItem>
                        <FormLabel>
                           Product Images
                           <HelpTooltip content="Arrastra y suelta imágenes o haz clic para seleccionar. Las imágenes se suben automáticamente a Cloudinary." />
                        </FormLabel>
                        <FormControl>
                           <ImageUpload
                              value={field.value}
                              disabled={loading}
                              onChange={(url) =>
                                 field.onChange([...field.value, url])
                              }
                              onRemove={(url) =>
                                 field.onChange([
                                    ...field.value.filter(
                                       (current) => current !== url
                                    ),
                                 ])
                              }
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
