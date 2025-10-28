'use client'

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
import { Input } from '@/components/ui/input'
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from '@/components/ui/select'
import type { OrderWithIncludes } from '@/types/prisma'
import { zodResolver } from '@hookform/resolvers/zod'
import { OrderStatusEnum } from '@prisma/client'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import * as z from 'zod'

const formSchema = z.object({
   status: z.string().min(1),
   total: z.coerce.number().min(0),
   shipping: z.coerce.number().min(0),
   tax: z.coerce.number().min(0),
   payable: z.coerce.number().min(0),
   discount: z.coerce.number().min(0),
   isPaid: z.boolean().default(false).optional(),
   isCompleted: z.boolean().default(false).optional(),
})

type ProductFormValues = z.infer<typeof formSchema>

interface ProductFormProps {
   initialData: OrderWithIncludes | null
}

export const OrderForm: React.FC<ProductFormProps> = ({ initialData }) => {
   const params = useParams()
   const router = useRouter()

   const [loading, setLoading] = useState(false)

   const toastMessage = 'Order updated.'
   const action = 'Save changes'

   const defaultValues = initialData
      ? {
           ...initialData,
        }
      : {
           status: 'Processing',
           total: 0,
           shipping: 0,
           tax: 0,
           payable: 0,
           discount: 0,
           isPaid: false,
           isCompleted: false,
        }

   const form = useForm<ProductFormValues>({
      resolver: zodResolver(formSchema),
      defaultValues,
   })

   const onSubmit = async (data: ProductFormValues) => {
      try {
         setLoading(true)

         if (initialData) {
            await fetch(`/api/orders/${params.orderId}`, {
               method: 'PATCH',
               headers: {
                  'Content-Type': 'application/json',
               },
               body: JSON.stringify(data),
               cache: 'no-store',
            })
         } else {
            await fetch(`/api/orders`, {
               method: 'POST',
               headers: {
                  'Content-Type': 'application/json',
               },
               body: JSON.stringify(data),
               cache: 'no-store',
            })
         }

         router.refresh()
         router.push(`/orders`)
         toast.success(toastMessage)
      } catch (error: any) {
         toast.error('Something went wrong.')
      } finally {
         setLoading(false)
      }
   }

   return (
      <Form {...form}>
         <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="block space-y-2 w-full"
         >
            <FormField
               control={form.control}
               name="status"
               render={({ field }) => (
                  <FormItem>
                     <FormLabel>Order Status</FormLabel>
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
                                 placeholder="Select a status"
                              />
                           </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                           {Object.values(OrderStatusEnum).map((status) => (
                              <SelectItem key={status} value={status}>
                                 {status}
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
               name="total"
               render={({ field }) => (
                  <FormItem>
                     <FormLabel>Order Total</FormLabel>
                     <FormControl>
                        <Input
                           type="number"
                           disabled={loading}
                           placeholder="0.00"
                           {...field}
                        />
                     </FormControl>
                     <FormDescription>
                        Subtotal before shipping, tax, and discount
                     </FormDescription>
                     <FormMessage />
                  </FormItem>
               )}
            />
            <FormField
               control={form.control}
               name="shipping"
               render={({ field }) => (
                  <FormItem>
                     <FormLabel>Shipping Cost</FormLabel>
                     <FormControl>
                        <Input
                           type="number"
                           disabled={loading}
                           placeholder="0.00"
                           {...field}
                        />
                     </FormControl>
                     <FormDescription>
                        Shipping and handling charges
                     </FormDescription>
                     <FormMessage />
                  </FormItem>
               )}
            />
            <FormField
               control={form.control}
               name="tax"
               render={({ field }) => (
                  <FormItem>
                     <FormLabel>Tax Amount</FormLabel>
                     <FormControl>
                        <Input
                           type="number"
                           disabled={loading}
                           placeholder="0.00"
                           {...field}
                        />
                     </FormControl>
                     <FormDescription>
                        Tax applied to this order
                     </FormDescription>
                     <FormMessage />
                  </FormItem>
               )}
            />
            <FormField
               control={form.control}
               name="payable"
               render={({ field }) => (
                  <FormItem>
                     <FormLabel>Total Payable</FormLabel>
                     <FormControl>
                        <Input
                           type="number"
                           disabled={loading}
                           placeholder="0.00"
                           {...field}
                        />
                     </FormControl>
                     <FormDescription>
                        Final amount to be paid (total + shipping + tax - discount)
                     </FormDescription>
                     <FormMessage />
                  </FormItem>
               )}
            />
            <FormField
               control={form.control}
               name="discount"
               render={({ field }) => (
                  <FormItem>
                     <FormLabel>Discount Amount</FormLabel>
                     <FormControl>
                        <Input
                           type="number"
                           disabled={loading}
                           placeholder="0.00"
                           {...field}
                        />
                     </FormControl>
                     <FormDescription>
                        Total discount applied to this order
                     </FormDescription>
                     <FormMessage />
                  </FormItem>
               )}
            />
            <FormField
               control={form.control}
               name="isPaid"
               render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                     <FormControl>
                        <Checkbox
                           checked={field.value}
                           onCheckedChange={field.onChange}
                        />
                     </FormControl>
                     <div className="space-y-1 leading-none">
                        <FormLabel>Paid</FormLabel>
                        <FormDescription>
                           Mark this order as paid
                        </FormDescription>
                     </div>
                  </FormItem>
               )}
            />
            <FormField
               control={form.control}
               name="isCompleted"
               render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                     <FormControl>
                        <Checkbox
                           checked={field.value}
                           onCheckedChange={field.onChange}
                        />
                     </FormControl>
                     <div className="space-y-1 leading-none">
                        <FormLabel>Completed</FormLabel>
                        <FormDescription>
                           Mark this order as completed
                        </FormDescription>
                     </div>
                  </FormItem>
               )}
            />
            <Button disabled={loading} className="ml-auto" type="submit">
               {action}
            </Button>
         </form>
      </Form>
   )
}
