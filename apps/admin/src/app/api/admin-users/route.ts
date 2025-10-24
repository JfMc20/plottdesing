import { createAdminClient } from '@/lib/auth-shared/supabase/admin'
import { NextResponse } from 'next/server'

/**
 * GET /api/admin-users
 * List all admin users (users in Supabase Auth)
 *
 * Note: Authentication and admin role verification is handled by middleware.
 * Only authenticated admins can reach this endpoint.
 */
export async function GET() {
  try {
    // Get all users using admin client
    // No need to check auth here - middleware already verified it
    const supabaseAdmin = createAdminClient()
    const { data, error } = await supabaseAdmin.auth.admin.listUsers()

    if (error) {
      console.error('Error listing users:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ users: data.users })
  } catch (error: any) {
    console.error('Error in GET /api/admin-users:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin-users
 * Create a new admin user
 *
 * Note: Authentication and admin role verification is handled by middleware.
 * Only authenticated admins can reach this endpoint.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Create user using admin client
    const supabaseAdmin = createAdminClient()
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email so they can login immediately
    })

    if (error) {
      console.error('Error creating user:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ user: data.user }, { status: 201 })
  } catch (error: any) {
    console.error('Error in POST /api/admin-users:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
