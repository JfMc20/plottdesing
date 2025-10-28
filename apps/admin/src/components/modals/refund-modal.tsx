'use client'

import { Button } from '@/components/ui/button'
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
import { Modal } from '@/components/ui/modal'
import { Textarea } from '@/components/ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import * as z from 'zod'

const formSchema = z.object({
   amount: z.coerce.number().min(0.01, 'Amount must be greater than 0'),
   reason: z.string().min(10, 'Reason must be at least 10 characters'),
})

type RefundFormValues = z.infer<typeof formSchema>

interface RefundModalProps {
   isOpen: boolean
   onClose: () => void
   orderId: string
   maxAmount: number
}

export const RefundModal: React.FC<RefundModalProps> = ({
   isOpen,
   onClose,
   orderId,
   maxAmount,
}) => {
   const router = useRouter()
   const [isMounted, setIsMounted] = useState(false)
   const [loading, setLoading] = useState(false)

   const form = useForm<RefundFormValues>({
      resolver: zodResolver(formSchema),
      defaultValues: {
         amount: maxAmount,
         reason: '',
      },
   })

   useEffect(() => {
      setIsMounted(true)
   }, [])

   useEffect(() => {
      if (isOpen) {
         form.reset({
            amount: maxAmount,
            reason: '',
         })
      }
   }, [isOpen, maxAmount, form])

   if (!isMounted) {
      return null
   }

   const onSubmit = async (data: RefundFormValues) => {
      try {
         setLoading(true)

         const response = await fetch(`/api/orders/${orderId}/refund`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
         })

         if (!response.ok) {
            const error = await response.text()
            throw new Error(error)
         }

         toast.success('Refund processed successfully')
         router.refresh()
         onClose()
      } catch (error: any) {
         toast.error(error.message || 'Failed to process refund')
         console.error('[REFUND_SUBMIT]', error)
      } finally {
         setLoading(false)
      }
   }

   return (
      <Modal
         title="Process Refund"
         description="Issue a refund for this order. This action will update the order status."
         isOpen={isOpen}
         onClose={onClose}
      >
         <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
               <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                     <FormItem>
                        <FormLabel>Refund Amount</FormLabel>
                        <FormControl>
                           <Input
                              type="number"
                              step="0.01"
                              disabled={loading}
                              placeholder="0.00"
                              {...field}
                           />
                        </FormControl>
                        <FormDescription>
                           Maximum refundable amount: ${maxAmount.toFixed(2)}
                        </FormDescription>
                        <FormMessage />
                     </FormItem>
                  )}
               />
               <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                     <FormItem>
                        <FormLabel>Refund Reason</FormLabel>
                        <FormControl>
                           <Textarea
                              disabled={loading}
                              placeholder="Explain the reason for this refund..."
                              className="resize-none"
                              rows={4}
                              {...field}
                           />
                        </FormControl>
                        <FormDescription>
                           Provide a detailed explanation for the refund
                        </FormDescription>
                        <FormMessage />
                     </FormItem>
                  )}
               />
               <div className="pt-6 space-x-2 flex items-center justify-end w-full">
                  <Button
                     disabled={loading}
                     variant="outline"
                     onClick={onClose}
                     type="button"
                  >
                     Cancel
                  </Button>
                  <Button disabled={loading} variant="destructive" type="submit">
                     Process Refund
                  </Button>
               </div>
            </form>
         </Form>
      </Modal>
   )
}
