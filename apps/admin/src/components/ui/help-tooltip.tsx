'use client'

import { HelpCircle } from 'lucide-react'
import {
   Tooltip,
   TooltipContent,
   TooltipProvider,
   TooltipTrigger,
} from '@/components/ui/tooltip'

interface HelpTooltipProps {
   content: string | React.ReactNode
   side?: 'top' | 'right' | 'bottom' | 'left'
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({ 
   content, 
   side = 'right' 
}) => {
   return (
      <TooltipProvider>
         <Tooltip>
            <TooltipTrigger asChild>
               <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help inline-block ml-1" />
            </TooltipTrigger>
            <TooltipContent side={side} className="max-w-xs">
               <div className="text-sm">{content}</div>
            </TooltipContent>
         </Tooltip>
      </TooltipProvider>
   )
}
