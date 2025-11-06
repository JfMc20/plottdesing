'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash } from 'lucide-react'
import { UseFormReturn } from 'react-hook-form'

interface AttributesManagerProps {
   form: UseFormReturn<any>
   loading: boolean
}

export const AttributesManager: React.FC<AttributesManagerProps> = ({
   form,
   loading,
}) => {
   const attributes = form.watch('attributes') || []

   const addAttribute = () => {
      const currentAttributes = form.getValues('attributes') || []
      form.setValue('attributes', [
         ...currentAttributes,
         { name: '', type: 'text', required: false, options: null },
      ])
   }

   const removeAttribute = (index: number) => {
      const currentAttributes = form.getValues('attributes') || []
      form.setValue(
         'attributes',
         currentAttributes.filter((_: any, i: number) => i !== index)
      )
   }

   const updateAttribute = (index: number, field: string, value: any) => {
      const currentAttributes = form.getValues('attributes') || []
      currentAttributes[index][field] = value

      if (field === 'type' && value !== 'select') {
         currentAttributes[index].options = null
      }

      form.setValue('attributes', [...currentAttributes])
   }

   const updateOptions = (index: number, optionsText: string) => {
      const currentAttributes = form.getValues('attributes') || []
      const options = optionsText
         .split('\n')
         .map((line) => line.trim())
         .filter((line) => line.length > 0)
      currentAttributes[index].options = options
      form.setValue('attributes', [...currentAttributes])
   }

   return (
      <div className="space-y-4">
         <div className="flex items-center justify-between">
            <div>
               <h3 className="text-lg font-medium">Product Attributes</h3>
               <p className="text-sm text-muted-foreground">
                  Add custom fields for product customization
               </p>
            </div>
            <Button
               type="button"
               variant="outline"
               size="sm"
               onClick={addAttribute}
               disabled={loading}
            >
               <Plus className="h-4 w-4 mr-2" />
               Add Attribute
            </Button>
         </div>

         {attributes.length > 0 && (
            <div className="space-y-4">
               {attributes.map((attribute: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4 space-y-4">
                     <div className="flex items-start gap-4">
                        <div className="flex-1 space-y-4">
                           <div className="grid grid-cols-2 gap-4">
                              <div>
                                 <label className="text-sm font-medium">
                                    Attribute Name
                                 </label>
                                 <Input
                                    disabled={loading}
                                    placeholder="e.g., Color"
                                    value={attribute.name || ''}
                                    onChange={(e) =>
                                       updateAttribute(
                                          index,
                                          'name',
                                          e.target.value
                                       )
                                    }
                                 />
                              </div>
                              <div>
                                 <label className="text-sm font-medium">Type</label>
                                 <Select
                                    disabled={loading}
                                    value={attribute.type || 'text'}
                                    onValueChange={(value) =>
                                       updateAttribute(index, 'type', value)
                                    }
                                 >
                                    <SelectTrigger>
                                       <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                       <SelectItem value="text">Text</SelectItem>
                                       <SelectItem value="color">Color</SelectItem>
                                       <SelectItem value="select">
                                          Select
                                       </SelectItem>
                                       <SelectItem value="image">Image</SelectItem>
                                    </SelectContent>
                                 </Select>
                              </div>
                           </div>

                           <div className="flex items-center space-x-2">
                              <Checkbox
                                 disabled={loading}
                                 checked={attribute.required || false}
                                 onCheckedChange={(checked) =>
                                    updateAttribute(index, 'required', checked)
                                 }
                              />
                              <label className="text-sm font-medium">
                                 Required field
                              </label>
                           </div>

                           {attribute.type === 'select' && (
                              <div>
                                 <label className="text-sm font-medium">
                                    Options (one per line)
                                 </label>
                                 <Textarea
                                    disabled={loading}
                                    placeholder="Red&#10;Blue&#10;Green"
                                    value={
                                       Array.isArray(attribute.options)
                                          ? attribute.options.join('\n')
                                          : ''
                                    }
                                    onChange={(e) =>
                                       updateOptions(index, e.target.value)
                                    }
                                    rows={4}
                                 />
                              </div>
                           )}
                        </div>
                        <Button
                           type="button"
                           variant="destructive"
                           size="icon"
                           onClick={() => removeAttribute(index)}
                           disabled={loading}
                        >
                           <Trash className="h-4 w-4" />
                        </Button>
                     </div>
                  </div>
               ))}
            </div>
         )}
      </div>
   )
}
