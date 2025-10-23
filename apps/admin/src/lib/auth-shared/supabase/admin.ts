import { createClient } from '@supabase/supabase-js'

/**
 * Creates a Supabase Admin client with service_role privileges
 *
 * ⚠️ SECURITY WARNING:
 * - ONLY use this client on the server side (API routes, server actions)
 * - NEVER expose this client or service_role key to the browser
 * - This client bypasses Row Level Security (RLS)
 *
 * Use cases:
 * - Creating/deleting users from admin panel
 * - Performing admin operations that require elevated privileges
 * - Bypassing RLS for legitimate admin operations
 *
 * @returns Supabase client with admin privileges
 *
 * @example
 * ```ts
 * // In an API route (apps/admin/src/app/api/admin/users/route.ts)
 * import { createAdminClient } from '@/lib/auth-shared/supabase/admin'
 *
 * export async function POST(req: Request) {
 *   const supabaseAdmin = createAdminClient()
 *
 *   const { data, error } = await supabaseAdmin.auth.admin.createUser({
 *     email: 'newadmin@example.com',
 *     password: 'securepassword',
 *     email_confirm: true
 *   })
 *
 *   return Response.json(data)
 * }
 * ```
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Missing Supabase environment variables for admin client. ' +
      'Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.'
    )
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
