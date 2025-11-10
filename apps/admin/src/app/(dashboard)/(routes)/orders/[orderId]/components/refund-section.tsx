'use client'

import {
   Accordion,
   AccordionContent,
   AccordionItem,
   AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { RefundModal } from '@/components/modals/refund-modal'
import type { OrderWithIncludes } from '@/types/prisma'
import { DollarSign } from 'lucide-react'
import { useState } from 'react'

interface RefundSectionProps {
   order: OrderWithIncludes
}

export const RefundSection: React.FC<RefundSectionProps> = ({ order }) => {
   const [isModalOpen, setIsModalOpen] = useState(false)

   const hasRefund = !!order.Refund
   const canRefund = !hasRefund && order.isPaid

   return (
      <>
         <Card className="my-4 p-2 bg-muted-foreground/5">
            <CardContent>
               <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-refund">
                     <AccordionTrigger>
                        <div className="block">
                           <h2 className="text-lg font-bold tracking-wider text-left">
                              REFUND
                           </h2>
                           <p className="text-sm font-light text-foreground/70">
                              {hasRefund
                                 ? 'Refund details for this order.'
                                 : 'Process a refund for this order.'}
                           </p>
                        </div>
                     </AccordionTrigger>
                     <AccordionContent>
                        {hasRefund ? (
                           <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                 <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">
                                       Refund Amount
                                    </h3>
                                    <p className="text-2xl font-bold">
                                       ${(order.Refund as any)?.amount?.toFixed(2) || '0.00'}
                                    </p>
                                 </div>
                                 <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">
                                       Refund Date
                                    </h3>
                                    <p className="text-sm">
                                       {order.Refund && new Date((order.Refund as any).createdAt).toLocaleDateString()}
                                    </p>
                                 </div>
                              </div>
                              <div>
                                 <h3 className="text-sm font-medium text-muted-foreground mb-2">
                                    Refund Reason
                                 </h3>
                                 <p className="text-sm bg-muted p-4 rounded-md">
                                    {(order.Refund as any)?.reason}
                                 </p>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                 <DollarSign className="h-4 w-4" />
                                 <span>
                                    Refund ID: {(order.Refund as any)?.id}
                                 </span>
                              </div>
                           </div>
                        ) : (
                           <div className="space-y-4">
                              {canRefund ? (
                                 <>
                                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                                       <div className="flex">
                                          <div className="ml-3">
                                             <p className="text-sm text-blue-700">
                                                This order is eligible for a refund. You can process a refund
                                                for up to ${order.payable.toFixed(2)}.
                                             </p>
                                          </div>
                                       </div>
                                    </div>
                                    <Button onClick={() => setIsModalOpen(true)}>
                                       Process Refund
                                    </Button>
                                 </>
                              ) : (
                                 <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                                    <div className="flex">
                                       <div className="ml-3">
                                          <p className="text-sm text-yellow-700">
                                             {!order.isPaid
                                                ? 'This order must be marked as paid before processing a refund.'
                                                : 'Refund not available for this order.'}
                                          </p>
                                       </div>
                                    </div>
                                 </div>
                              )}
                           </div>
                        )}
                     </AccordionContent>
                  </AccordionItem>
               </Accordion>
            </CardContent>
         </Card>

         <RefundModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            orderId={order.id}
            maxAmount={order.payable}
         />
      </>
   )
}
