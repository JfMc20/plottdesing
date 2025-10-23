import { createAdminClient } from '@/lib/auth-shared/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * DELETE /api/admin-users/[userId]
 * Delete an admin user
 */
export async function DELETE(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    // Verify current user is admin
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || []
    if (!adminEmails.includes(user.email || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Prevent deleting yourself
    if (user.id === params.userId) {
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
