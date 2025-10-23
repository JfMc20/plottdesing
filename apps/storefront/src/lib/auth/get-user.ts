import { getCurrentUser as getSupabaseUser } from '@/lib/auth-shared/utils/get-user'
import prisma from '@/lib/prisma'

/**
 * Gets the current authenticated user from the database
 * Links Supabase auth user to Prisma User model
 * Automatically creates user record if it doesn't exist
 *
 * @returns User record or null if not authenticated
 */
export async function getCurrentUser() {
  try {
    const supabaseUser = await getSupabaseUser()

    if (!supabaseUser || !supabaseUser.id) {
      return null
    }

    // Find user by supabaseId
    let user = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
      include: {
        cart: true,
      },
    })

    // If user doesn't exist, create them
    if (!user && supabaseUser.email) {
      user = await prisma.user.create({
        data: {
          supabaseId: supabaseUser.id,
          email: supabaseUser.email,
          name: supabaseUser.user_metadata?.full_name || supabaseUser.email,
          isEmailVerified: true,
          cart: {
            create: {},
          },
        },
        include: {
          cart: true,
        },
      })
    }

    return user
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}
