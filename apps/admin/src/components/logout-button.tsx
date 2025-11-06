'use client'

import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

interface LogoutButtonProps {
   variant?: 'default' | 'outline' | 'ghost'
   size?: 'default' | 'sm' | 'lg' | 'icon'
   className?: string
   showIcon?: boolean
   showText?: boolean
}

export function LogoutButton({ 
   variant = 'outline', 
   size = 'icon',
   className = '',
   showIcon = true,
   showText = false
}: LogoutButtonProps) {
   function onLogout() {
      window.location.href = '/api/auth/logout'
   }

   return (
      <Button 
         variant={variant} 
         size={size} 
         onClick={onLogout}
         className={className}
      >
         {showIcon && <LogOut className={showText ? "mr-2 h-4 w-4" : "h-4 w-4"} />}
         {showText && <span>Log out</span>}
      </Button>
   )
}
