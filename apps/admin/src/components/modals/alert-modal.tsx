'use client'

import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { useEffect, useState } from 'react'

interface AlertModalProps {
   isOpen: boolean
   onClose: () => void
   onConfirm: () => void
   loading: boolean
   title?: string
   description?: string
   warning?: string
}

export const AlertModal: React.FC<AlertModalProps> = ({
   isOpen,
   onClose,
   onConfirm,
   loading,
   title = "Are you sure?",
   description = "This action cannot be undone.",
   warning,
}) => {
   const [isMounted, setIsMounted] = useState(false)

   useEffect(() => {
      setIsMounted(true)
   }, [])

   if (!isMounted) {
      return null
   }

   return (
      <Modal
         title={title}
         description={description}
         isOpen={isOpen}
         onClose={onClose}
      >
         {warning && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
               <div className="flex">
                  <div className="flex-shrink-0">
                     <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                     </svg>
                  </div>
                  <div className="ml-3">
                     <p className="text-sm text-yellow-700">{warning}</p>
                  </div>
               </div>
            </div>
         )}
         <div className="pt-6 space-x-2 flex items-center justify-end w-full">
            <Button disabled={loading} variant="outline" onClick={onClose}>
               Cancel
            </Button>
            <Button
               disabled={loading}
               variant="destructive"
               onClick={onConfirm}
            >
               Continue
            </Button>
         </div>
      </Modal>
   )
}
