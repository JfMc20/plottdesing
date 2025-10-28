'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from '@/components/ui/table'
import type { OrderWithIncludes } from '@/types/prisma'
import { Trash2 } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

interface OrderItemsListProps {
   order: OrderWithIncludes
}

export const OrderItemsList: React.FC<OrderItemsListProps> = ({ order }) => {
   const router = useRouter()
   const [loading, setLoading] = useState(false)
   const [editingItemId, setEditingItemId] = useState<string | null>(null)
   const [newCount, setNewCount] = useState<number>(1)

   const orderItems = order.orderItems || []

   const calculateItemSubtotal = (price: number, discount: number, count: number) => {
      return ((price - discount) * count).toFixed(2)
   }

   const handleUpdateCount = async (productId: string, count: number) => {
      if (count < 1) {
         toast.error('Quantity must be at least 1')
         return
      }

      try {
         setLoading(true)

         const response = await fetch(`/api/orders/${order.id}/items/${productId}`, {
            method: 'PATCH',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({ count }),
         })

         if (!response.ok) {
            throw new Error('Failed to update item')
         }

         toast.success('Item updated successfully')
         setEditingItemId(null)
         router.refresh()
      } catch (error) {
         toast.error('Failed to update item')
         console.error('[ORDER_ITEM_UPDATE]', error)
      } finally {
         setLoading(false)
      }
   }

   const handleRemoveItem = async (productId: string) => {
      if (!confirm('Are you sure you want to remove this item from the order?')) {
         return
      }

      try {
         setLoading(true)

         const response = await fetch(`/api/orders/${order.id}/items/${productId}`, {
            method: 'DELETE',
         })

         if (!response.ok) {
            throw new Error('Failed to remove item')
         }

         toast.success('Item removed successfully')
         router.refresh()
      } catch (error) {
         toast.error('Failed to remove item')
         console.error('[ORDER_ITEM_DELETE]', error)
      } finally {
         setLoading(false)
      }
   }

   const startEditing = (productId: string, currentCount: number) => {
      setEditingItemId(productId)
      setNewCount(currentCount)
   }

   const cancelEditing = () => {
      setEditingItemId(null)
      setNewCount(1)
   }

   if (orderItems.length === 0) {
      return (
         <div className="text-center py-8 text-muted-foreground">
            No items in this order
         </div>
      )
   }

   return (
      <div className="space-y-4">
         <Table>
            <TableHeader>
               <TableRow>
                  <TableHead className="w-[80px]">Image</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Discount</TableHead>
                  <TableHead className="text-center">Quantity</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                  <TableHead className="text-center w-[100px]">Actions</TableHead>
               </TableRow>
            </TableHeader>
            <TableBody>
               {orderItems.map((item) => (
                  <TableRow key={item.productId}>
                     <TableCell>
                        {item.product?.images?.[0] ? (
                           <Image
                              src={item.product.images[0]}
                              alt={item.product.title || 'Product'}
                              width={60}
                              height={60}
                              className="rounded-md object-cover"
                           />
                        ) : (
                           <div className="w-[60px] h-[60px] bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground">
                              No image
                           </div>
                        )}
                     </TableCell>
                     <TableCell>
                        <div>
                           <p className="font-medium">{item.product?.title || 'Unknown Product'}</p>
                           <p className="text-xs text-muted-foreground">
                              ID: {item.productId}
                           </p>
                        </div>
                     </TableCell>
                     <TableCell className="text-right">
                        ${item.price.toFixed(2)}
                     </TableCell>
                     <TableCell className="text-right">
                        ${item.discount.toFixed(2)}
                     </TableCell>
                     <TableCell className="text-center">
                        {editingItemId === item.productId ? (
                           <div className="flex items-center gap-2 justify-center">
                              <Input
                                 type="number"
                                 min="1"
                                 value={newCount}
                                 onChange={(e) => setNewCount(parseInt(e.target.value) || 1)}
                                 className="w-20"
                                 disabled={loading}
                              />
                              <Button
                                 size="sm"
                                 onClick={() => handleUpdateCount(item.productId, newCount)}
                                 disabled={loading}
                              >
                                 Save
                              </Button>
                              <Button
                                 size="sm"
                                 variant="outline"
                                 onClick={cancelEditing}
                                 disabled={loading}
                              >
                                 Cancel
                              </Button>
                           </div>
                        ) : (
                           <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEditing(item.productId, item.count)}
                              disabled={loading}
                           >
                              {item.count}
                           </Button>
                        )}
                     </TableCell>
                     <TableCell className="text-right font-medium">
                        ${calculateItemSubtotal(item.price, item.discount, item.count)}
                     </TableCell>
                     <TableCell className="text-center">
                        <Button
                           variant="destructive"
                           size="icon"
                           onClick={() => handleRemoveItem(item.productId)}
                           disabled={loading}
                        >
                           <Trash2 className="h-4 w-4" />
                        </Button>
                     </TableCell>
                  </TableRow>
               ))}
            </TableBody>
         </Table>

         <div className="flex justify-end pt-4 border-t">
            <div className="space-y-2">
               <div className="flex justify-between gap-8">
                  <span className="text-muted-foreground">Items Total:</span>
                  <span className="font-medium">
                     ${orderItems.reduce((sum, item) =>
                        sum + parseFloat(calculateItemSubtotal(item.price, item.discount, item.count))
                     , 0).toFixed(2)}
                  </span>
               </div>
               <div className="flex justify-between gap-8 text-sm text-muted-foreground">
                  <span>Total Items:</span>
                  <span>{orderItems.reduce((sum, item) => sum + item.count, 0)}</span>
               </div>
            </div>
         </div>
      </div>
   )
}
