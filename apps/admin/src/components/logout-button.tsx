'use client'

import { Button } from '@/components/ui/button'
import { LogOutIcon } from 'lucide-react'

export function LogoutButton() {
   function onLogout() {
      window.location.href = '/api/auth/logout'
   }

   return (
      <Button variant="outline" size="icon" onClick={onLogout}>
         <LogOutIcon className="h-4" />
      </Button>
   )
}
