'use client'

import { Button } from '@/components/ui/button'
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

export function CreateAdminDialog() {
   const router = useRouter()
   const [open, setOpen] = useState(false)
   const [loading, setLoading] = useState(false)
   const [email, setEmail] = useState('')
   const [password, setPassword] = useState('')

   const onSubmit = async (e: React.FormEvent) => {
      e.preventDefault()

      try {
         setLoading(true)

         const response = await fetch('/api/admin-users', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
         })

         const data = await response.json()

         if (!response.ok) {
            throw new Error(data.error || 'Failed to create admin user')
         }

         toast.success('Admin user created successfully')
         setOpen(false)
         setEmail('')
         setPassword('')
         router.refresh()
      } catch (error: any) {
         console.error('Error creating admin:', error)
         toast.error(error.message || 'Failed to create admin user')
      } finally {
         setLoading(false)
      }
   }

   return (
      <Dialog open={open} onOpenChange={setOpen}>
         <DialogTrigger asChild>
            <Button>
               <Plus className="mr-2 h-4" /> Add Admin
            </Button>
         </DialogTrigger>
         <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={onSubmit}>
               <DialogHeader>
                  <DialogTitle>Create Admin User</DialogTitle>
                  <DialogDescription>
                     Create a new administrator account. They will be able to
                     access the admin panel.
                  </DialogDescription>
               </DialogHeader>
               <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                     <Label htmlFor="email">Email</Label>
                     <Input
                        id="email"
                        type="email"
                        placeholder="admin@plottdesign.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        required
                     />
                  </div>
                  <div className="grid gap-2">
                     <Label htmlFor="password">Password</Label>
                     <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        required
                        minLength={6}
                     />
                     <p className="text-xs text-muted-foreground">
                        At least 6 characters
                     </p>
                  </div>
               </div>
               <DialogFooter>
                  <Button
                     type="button"
                     variant="outline"
                     onClick={() => setOpen(false)}
                     disabled={loading}
                  >
                     Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                     {loading ? 'Creating...' : 'Create Admin'}
                  </Button>
               </DialogFooter>
            </form>
         </DialogContent>
      </Dialog>
   )
}
