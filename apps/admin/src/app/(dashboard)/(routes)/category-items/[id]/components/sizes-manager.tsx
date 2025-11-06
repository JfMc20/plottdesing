'use client'

import { Button } from '@/components/ui/button'
import { HelpTooltip } from '@/components/ui/help-tooltip'
import { Input } from '@/components/ui/input'
import { Plus, Trash } from 'lucide-react'
import { UseFormReturn } from 'react-hook-form'

interface SizesManagerProps {
   form: UseFormReturn<any>
   loading: boolean
}

export const SizesManager: React.FC<SizesManagerProps> = ({
   form,
   loading,
}) => {
   const sizes = form.watch('sizes') || []

   const addSize = () => {
      const currentSizes = form.getValues('sizes') || []
      form.setValue('sizes', [
         ...currentSizes,
         { name: '', code: '', displayOrder: currentSizes.length },
      ])
   }

   const removeSize = (index: number) => {
      const currentSizes = form.getValues('sizes') || []
      form.setValue(
         'sizes',
         currentSizes.filter((_: any, i: number) => i !== index)
      )
   }

   const updateSize = (index: number, field: string, value: any) => {
      const currentSizes = form.getValues('sizes') || []
      currentSizes[index][field] = value
      form.setValue('sizes', [...currentSizes])
   }

   return (
      <div className="space-y-4">
         <div className="flex items-center justify-between">
            <div>
               <h3 className="text-lg font-medium">Product Sizes</h3>
               <p className="text-sm text-muted-foreground">
                  Configure available sizes for this item
               </p>
            </div>
            <Button
               type="button"
               variant="outline"
               size="sm"
               onClick={addSize}
               disabled={loading}
            >
               <Plus className="h-4 w-4 mr-2" />
               Add Size
            </Button>
         </div>

         {sizes.length > 0 && (
            <div className="space-y-2">
               {sizes.map((size: any, index: number) => (
                  <div
                     key={index}
                     className="flex items-end gap-4 p-4 border rounded-lg"
                  >
                     <div className="flex-1 grid grid-cols-3 gap-4">
                        <div>
                           <label className="text-sm font-medium">Name</label>
                           <Input
                              disabled={loading}
                              placeholder="e.g., Small"
                              value={size.name || ''}
                              onChange={(e) =>
                                 updateSize(index, 'name', e.target.value)
                              }
                           />
                        </div>
                        <div>
                           <label className="text-sm font-medium">Code</label>
                           <Input
                              disabled={loading}
                              placeholder="e.g., S"
                              value={size.code || ''}
                              onChange={(e) =>
                                 updateSize(index, 'code', e.target.value)
                              }
                           />
                        </div>
                        <div>
                           <label className="text-sm font-medium">
                              Display Order
                              <HelpTooltip content="Order in which sizes appear (1=first, 2=second, etc.)" />
                           </label>
                           <Input
                              type="number"
                              disabled={loading}
                              value={size.displayOrder ?? index}
                              onChange={(e) =>
                                 updateSize(
                                    index,
                                    'displayOrder',
                                    parseInt(e.target.value)
                                 )
                              }
                           />
                        </div>
                     </div>
                     <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => removeSize(index)}
                        disabled={loading}
                     >
                        <Trash className="h-4 w-4" />
                     </Button>
                  </div>
               ))}
            </div>
         )}
      </div>
   )
}
