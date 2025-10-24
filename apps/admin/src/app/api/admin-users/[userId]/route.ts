import { createAdminClient } from '@/lib/auth-shared/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * DELETE /api/admin-users/[userId]
 * Delete an admin user
 *
 * Note: Authentication and admin role verification is handled by middleware.
 * Only authenticated admins can reach this endpoint.
 */
export async function DELETE(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    // Get current user to prevent self-deletion
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Prevent deleting yourself
    if (user && user.id === params.userId) {
      return NextResponse.json(
        { error: 'You cannot delete your own account' },
        { status: 400 }
      )
    }

    // Delete user using admin client
    const supabaseAdmin = createAdminClient()
    const { error } = await supabaseAdmin.auth.admin.deleteUser(params.userId)

    if (error) {
      console.error('Error deleting user:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error: any) {
    console.error('Error in DELETE /api/admin-users/[userId]:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
