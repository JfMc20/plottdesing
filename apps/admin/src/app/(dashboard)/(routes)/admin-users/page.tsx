import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import { createAdminClient } from '@/lib/auth-shared/supabase/admin'
import { Plus } from 'lucide-react'

import { AdminUsersClient, AdminUserColumn } from './components/client'
import { CreateAdminDialog } from './components/create-admin-dialog'

export default async function AdminUsersPage() {
   const supabaseAdmin = createAdminClient()
   const { data, error } = await supabaseAdmin.auth.admin.listUsers()

   if (error) {
      console.error('Error fetching admin users:', error)
      return <div>Error loading users</div>
   }

   const formattedUsers: AdminUserColumn[] = data.users.map((user) => ({
      id: user.id,
      email: user.email || '',
      createdAt: new Date(user.created_at).toLocaleDateString(),
      lastSignIn: user.last_sign_in_at
         ? new Date(user.last_sign_in_at).toLocaleDateString()
         : 'Never',
   }))

   return (
      <div className="my-6 block space-y-4">
         <div className="flex items-center justify-between">
            <Heading
               title={`Admin Users (${data.users.length})`}
               description="Manage administrator accounts"
            />
            <CreateAdminDialog />
         </div>
         <Separator />
         <AdminUsersClient data={formattedUsers} />
      </div>
   )
}
