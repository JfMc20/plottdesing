'use client'

import { Button } from '@/components/ui/button'
import { HelpTooltip } from '@/components/ui/help-tooltip'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Plus, Trash } from 'lucide-react'
import { UseFormReturn } from 'react-hook-form'

interface ZonesManagerProps {
   form: UseFormReturn<any>
   loading: boolean
}

export const ZonesManager: React.FC<ZonesManagerProps> = ({
   form,
   loading,
}) => {
   const zones = form.watch('zones') || []

   const addZone = () => {
      const currentZones = form.getValues('zones') || []
      form.setValue('zones', [
         ...currentZones,
         {
            name: '',
            code: '',
            displayOrder: currentZones.length,
            printSizes: [],
         },
      ])
   }

   const removeZone = (index: number) => {
      const currentZones = form.getValues('zones') || []
      form.setValue(
         'zones',
         currentZones.filter((_: any, i: number) => i !== index)
      )
   }

   const updateZone = (index: number, field: string, value: any) => {
      const currentZones = form.getValues('zones') || []
      currentZones[index][field] = value
      form.setValue('zones', [...currentZones])
   }

   const addPrintSize = (zoneIndex: number) => {
      const currentZones = form.getValues('zones') || []
      const zone = currentZones[zoneIndex]
      zone.printSizes = [
         ...(zone.printSizes || []),
         { name: '', width: 0, height: 0, reference: '', area: 0 },
      ]
      form.setValue('zones', [...currentZones])
   }

   const removePrintSize = (zoneIndex: number, printIndex: number) => {
      const currentZones = form.getValues('zones') || []
      const zone = currentZones[zoneIndex]
      zone.printSizes = zone.printSizes.filter(
         (_: any, i: number) => i !== printIndex
      )
      form.setValue('zones', [...currentZones])
   }

   const updatePrintSize = (
      zoneIndex: number,
      printIndex: number,
      field: string,
      value: any
   ) => {
      const currentZones = form.getValues('zones') || []
      const zone = currentZones[zoneIndex]
      zone.printSizes[printIndex][field] = value

      if (field === 'width' || field === 'height') {
         const width = parseFloat(zone.printSizes[printIndex].width) || 0
         const height = parseFloat(zone.printSizes[printIndex].height) || 0
         zone.printSizes[printIndex].area = width * height
      }

      form.setValue('zones', [...currentZones])
   }

   return (
      <div className="space-y-4">
         <div className="flex items-center justify-between">
            <div>
               <h3 className="text-lg font-medium">Print Zones</h3>
               <p className="text-sm text-muted-foreground">
                  Define printable areas and their sizes
               </p>
            </div>
            <Button
               type="button"
               variant="outline"
               size="sm"
               onClick={addZone}
               disabled={loading}
            >
               <Plus className="h-4 w-4 mr-2" />
               Add Zone
            </Button>
         </div>

         {zones.length > 0 && (
            <div className="space-y-4">
               {zones.map((zone: any, zoneIndex: number) => (
                  <div key={zoneIndex} className="border rounded-lg p-4 space-y-4">
                     <div className="flex items-end gap-4">
                        <div className="flex-1 grid grid-cols-3 gap-4">
                           <div>
                              <label className="text-sm font-medium">
                                 Zone Name
                              </label>
                              <Input
                                 disabled={loading}
                                 placeholder="e.g., Front"
                                 value={zone.name || ''}
                                 onChange={(e) =>
                                    updateZone(zoneIndex, 'name', e.target.value)
                                 }
                              />
                           </div>
                           <div>
                              <label className="text-sm font-medium">Code</label>
                              <Input
                                 disabled={loading}
                                 placeholder="e.g., FRONT"
                                 value={zone.code || ''}
                                 onChange={(e) =>
                                    updateZone(zoneIndex, 'code', e.target.value)
                                 }
                              />
                           </div>
                           <div>
                              <label className="text-sm font-medium">Order</label>
                              <Input
                                 type="number"
                                 disabled={loading}
                                 value={zone.displayOrder ?? zoneIndex}
                                 onChange={(e) =>
                                    updateZone(
                                       zoneIndex,
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
                           onClick={() => removeZone(zoneIndex)}
                           disabled={loading}
                        >
                           <Trash className="h-4 w-4" />
                        </Button>
                     </div>

                     <Separator />

                     <div className="space-y-2">
                        <div className="flex items-center justify-between">
                           <h4 className="text-sm font-medium">Print Sizes</h4>
                           <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => addPrintSize(zoneIndex)}
                              disabled={loading}
                           >
                              <Plus className="h-3 w-3 mr-1" />
                              Add Size
                           </Button>
                        </div>

                        {zone.printSizes?.length > 0 && (
                           <div className="space-y-2">
                              {zone.printSizes.map(
                                 (printSize: any, printIndex: number) => (
                                    <div
                                       key={printIndex}
                                       className="flex items-end gap-2 p-3 bg-muted/50 rounded"
                                    >
                                       <div className="flex-1 grid grid-cols-5 gap-2">
                                          <div>
                                             <label className="text-xs font-medium">
                                                Name
                                             </label>
                                             <Input
                                                disabled={loading}
                                                placeholder="Small"
                                                value={printSize.name || ''}
                                                onChange={(e) =>
                                                   updatePrintSize(
                                                      zoneIndex,
                                                      printIndex,
                                                      'name',
                                                      e.target.value
                                                   )
                                                }
                                             />
                                          </div>
                                          <div>
                                             <label className="text-xs font-medium">
                                                Width (cm)
                                             </label>
                                             <Input
                                                type="number"
                                                step="0.01"
                                                disabled={loading}
                                                value={printSize.width || ''}
                                                onChange={(e) =>
                                                   updatePrintSize(
                                                      zoneIndex,
                                                      printIndex,
                                                      'width',
                                                      e.target.value
                                                   )
                                                }
                                             />
                                          </div>
                                          <div>
                                             <label className="text-xs font-medium">
                                                Height (cm)
                                             </label>
                                             <Input
                                                type="number"
                                                step="0.01"
                                                disabled={loading}
                                                value={printSize.height || ''}
                                                onChange={(e) =>
                                                   updatePrintSize(
                                                      zoneIndex,
                                                      printIndex,
                                                      'height',
                                                      e.target.value
                                                   )
                                                }
                                             />
                                          </div>
                                          <div>
                                             <label className="text-xs font-medium">
                                                Reference
                                                <HelpTooltip content="Paper size reference (e.g., A4, Letter). Used to standardize print area calculations." />
                                             </label>
                                             <Input
                                                disabled={loading}
                                                placeholder="A4"
                                                value={printSize.reference || ''}
                                                onChange={(e) =>
                                                   updatePrintSize(
                                                      zoneIndex,
                                                      printIndex,
                                                      'reference',
                                                      e.target.value
                                                   )
                                                }
                                             />
                                          </div>
                                          <div>
                                             <label className="text-xs font-medium">
                                                Area (cm²)
                                                <HelpTooltip content="Automatically calculated from width × height. Used for pricing based on print area." />
                                             </label>
                                             <Input
                                                disabled
                                                value={
                                                   printSize.area?.toFixed(2) || '0'
                                                }
                                             />
                                          </div>
                                       </div>
                                       <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          onClick={() =>
                                             removePrintSize(zoneIndex, printIndex)
                                          }
                                          disabled={loading}
                                       >
                                          <Trash className="h-3 w-3" />
                                       </Button>
                                    </div>
                                 )
                              )}
                           </div>
                        )}
                     </div>
                  </div>
               ))}
            </div>
         )}
      </div>
   )
}
