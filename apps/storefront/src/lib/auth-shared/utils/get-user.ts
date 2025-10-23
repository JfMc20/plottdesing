import { createClient } from '../supabase/server'

/**
 * Gets the current authenticated user from Supabase
 * This is a server-side only function
 *
 * SECURITY: This uses getUser() which revalidates the auth token
 * on every call - never use getSession() in server code
 *
 * @returns The authenticated user or null
 *
 * @example
 * ```tsx
 * import { getCurrentUser } from '@persepolis/auth'
 *
 * export async function DashboardPage() {
 *   const user = await getCurrentUser()
 *
 *   if (!user) {
 *     redirect('/login')
 *   }
 *
 *   return <div>Welcome {user.email}</div>
 * }
 * ```
 */
export async function getCurrentUser() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return null
    }

    return user
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

/**
 * Checks if the current user has admin privileges
 *
 * @param adminEmails - Array of emails that have admin access
 * @returns Object with isAdmin boolean and user data
 *
 * @example
 * ```tsx
 * import { checkIsAdmin } from '@persepolis/auth'
 *
 * export async function AdminPanel() {
 *   const { isAdmin, user } = await checkIsAdmin([
 *     'admin@example.com'
 *   ])
 *
 *   if (!isAdmin) {
 *     return <div>Unauthorized</div>
 *   }
 *
 *   return <div>Admin Panel for {user?.email}</div>
 * }
 * ```
 */
export async function checkIsAdmin(adminEmails: string[]) {
  const user = await getCurrentUser()

  if (!user || !user.email) {
    return { isAdmin: false, user: null }
  }

  const isAdmin = adminEmails.includes(user.email)

  return { isAdmin, user }
}
