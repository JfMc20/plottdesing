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
import { useState, useEffect } from 'react'
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
}).refine((data) => {
   // Require categoryItemId for customizable and print-on-demand products
   if ((data.productType === 'customizable' || data.productType === 'print-on-demand') && !data.categoryItemId) {
      return false
   }
   return true
}, {
   message: "Category Item is required for Customizable and Print on Demand products",
   path: ["categoryItemId"]
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
   const [selectedCategoryItemId, setSelectedCategoryItemId] = useState(
      initialData?.categoryItemId || ''
   )
   const [categoryItemStock, setCategoryItemStock] = useState<number | null>(null)

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

   // Fetch category item stock when selected
   useEffect(() => {
      const fetchCategoryItemStock = async () => {
         if (!selectedCategoryItemId) {
            setCategoryItemStock(null)
            return
         }

         try {
            const res = await fetch(`/api/category-items/${selectedCategoryItemId}`)
            const data = await res.json()
            
            // Calculate total stock from all sizes
            const totalStock = data.ProductSize?.reduce((sum: number, size: any) => {
               return sum + (size.stock || 0)
            }, 0) || 0
            
            setCategoryItemStock(totalStock)
         } catch (error) {
            console.error('Error fetching category item stock:', error)
            setCategoryItemStock(null)
         }
      }

      fetchCategoryItemStock()
   }, [selectedCategoryItemId])

   const productType = form.watch('productType')
   const isCustomizableOrPOD = productType === 'customizable' || productType === 'print-on-demand'

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

   const hasOrders = initialData?.orders && (initialData.orders as any[]).length > 0

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
               {/* SECTION 1: BASIC INFO */}
               <div className="space-y-4">
                  <h3 className="text-lg font-medium">Basic Information</h3>
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
                        name="categoryId"
                        render={({ field }) => (
                           <FormItem className="md:col-span-2">
                              <FormLabel>Category</FormLabel>
                              <Select
                                 disabled={loading}
                                 onValueChange={(value) => {
                                    field.onChange(value)
                                    setSelectedCategoryId(value)
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
                  </div>
               </div>

               <Separator />

               {/* SECTION 2: PRODUCT TYPE */}
               <div className="space-y-4">
                  <h3 className="text-lg font-medium">Product Type</h3>
                  <div className="md:grid md:grid-cols-3 gap-8">
                     <FormField
                        control={form.control}
                        name="categoryItemId"
                        render={({ field }) => (
                           <FormItem>
                              <FormLabel>
                                 Category Item (Optional)
                                 <HelpTooltip content="Select if this is a customizable product. Leave empty for normal or print-on-demand products." />
                              </FormLabel>
                              <Select
                                 disabled={loading || !selectedCategoryId}
                                 onValueChange={(value) => {
                                    field.onChange(value === 'none' ? '' : value)
                                    setSelectedCategoryItemId(value === 'none' ? '' : value)
                                    // Auto-set to customizable if category item selected
                                    if (value && value !== 'none') {
                                       form.setValue('productType', 'customizable')
                                    }
                                 }}
                                 value={field.value || 'none'}
                                 defaultValue={field.value || 'none'}
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
                                    <SelectItem value="none">None (Normal/POD Product)</SelectItem>
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
                        name="productType"
                        render={({ field }) => (
                           <FormItem className="md:col-span-2">
                              <FormLabel>
                                 Type
                                 <HelpTooltip content="Customizable: Uses Category Item (price calculated). Normal/POD: Set your own price." />
                              </FormLabel>
                              <Select
                                 disabled={loading || !!selectedCategoryItemId}
                                 onValueChange={field.onChange}
                                 value={selectedCategoryItemId ? 'customizable' : field.value}
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
                                    <SelectItem value="customizable" disabled={!selectedCategoryItemId}>
                                       Customizable Product {!selectedCategoryItemId && '(Select Category Item first)'}
                                    </SelectItem>
                                    <SelectItem value="print-on-demand">
                                       Print on Demand
                                    </SelectItem>
                                 </SelectContent>
                              </Select>
                              {selectedCategoryItemId && (
                                 <p className="text-xs text-muted-foreground">
                                    Automatically set to Customizable when Category Item is selected.
                                 </p>
                              )}
                              <FormMessage />
                           </FormItem>
                        )}
                     />
                  </div>
               </div>

               <Separator />

               {/* SECTION 3: PRICING & STOCK */}
               <div className="space-y-4">
                  <h3 className="text-lg font-medium">Pricing & Stock</h3>
                  <div className="md:grid md:grid-cols-3 gap-8">
                     {/* Only show Price for Normal and Print-on-Demand */}
                     {!selectedCategoryItemId && (
                        <>
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
                                          placeholder="0"
                                          {...field}
                                       />
                                    </FormControl>
                                    <FormMessage />
                                 </FormItem>
                              )}
                           />
                        </>
                     )}
                     {selectedCategoryItemId && (
                        <div className="md:col-span-2 p-4 bg-muted rounded-md">
                           <p className="text-sm font-medium mb-2">Customizable Product Pricing</p>
                           <p className="text-xs text-muted-foreground">
                              Price is calculated dynamically based on Category Item base price + printing costs selected by customer.
                           </p>
                        </div>
                     )}
                     <FormField
                        control={form.control}
                        name="stock"
                        render={({ field }) => (
                           <FormItem>
                              <FormLabel>
                                 Stock
                                 <HelpTooltip content={
                                    selectedCategoryItemId
                                       ? "Stock is managed in Category Item sizes. This shows the total."
                                       : productType === 'print-on-demand'
                                          ? "Print on Demand products have unlimited stock."
                                          : "Cantidad disponible del producto en inventario."
                                 } />
                              </FormLabel>
                              <FormControl>
                                 <Input
                                    type="number"
                                    disabled={loading || !!selectedCategoryItemId || productType === 'print-on-demand'}
                                    placeholder={productType === 'print-on-demand' ? 'Unlimited' : '10'}
                                    value={
                                       productType === 'print-on-demand' 
                                          ? '∞' 
                                          : selectedCategoryItemId && categoryItemStock !== null
                                             ? categoryItemStock
                                             : field.value
                                    }
                                    onChange={field.onChange}
                                    className={selectedCategoryItemId || productType === 'print-on-demand' ? 'bg-muted' : ''}
                                 />
                              </FormControl>
                              {selectedCategoryItemId && categoryItemStock !== null && (
                                 <p className="text-xs text-muted-foreground">
                                    Total: {categoryItemStock} units from Category Item sizes.
                                 </p>
                              )}
                              {productType === 'print-on-demand' && (
                                 <p className="text-xs text-muted-foreground">
                                    Produced when ordered.
                                 </p>
                              )}
                              <FormMessage />
                           </FormItem>
                        )}
                     />
                  </div>
               </div>

               <Separator />

               {/* SECTION 4: DIMENSIONS */}
               <div className="space-y-4">
                  <h3 className="text-lg font-medium">Dimensions & Shipping</h3>
                  <div className="md:grid md:grid-cols-4 gap-8">
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
                                 step="0.1"
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
               </div>
               </div>

               <Separator />

               {/* SECTION 5: VISIBILITY */}
               <div className="space-y-4">
                  <h3 className="text-lg font-medium">Visibility</h3>
                  <div className="md:grid md:grid-cols-2 gap-8">
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
               </div>

               <Separator />

               {/* SECTION 6: IMAGES */}
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
