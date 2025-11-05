// Import from shared auth package
import { getCurrentUser as getSupabaseUser } from '../../../../../packages/auth/src/utils/get-user'
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

    const avatarUrl = supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture || null

    // Find user by supabaseId
    let user = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
      include: {
        cart: true,
      },
    })

    // If not found by supabaseId, try to find by email and update supabaseId
    if (!user && supabaseUser.email) {
      user = await prisma.user.findUnique({
        where: { email: supabaseUser.email },
        include: {
          cart: true,
        },
      })

      // If found by email, update the supabaseId
      if (user) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            supabaseId: supabaseUser.id,
            ...(avatarUrl && { avatarUrl }),
          },
          include: {
            cart: true,
          },
        })
      }
    }

    // If still not found, create new user
    if (!user && supabaseUser.email) {
      // Use Supabase email verification status for all users
      const isEmailVerified = !!supabaseUser.email_confirmed_at

      user = await prisma.user.create({
        data: {
          supabaseId: supabaseUser.id,
          email: supabaseUser.email,
          name: supabaseUser.user_metadata?.full_name || supabaseUser.email,
          avatarUrl,
          isEmailVerified,
          cart: {
            create: {},
          },
        },
        include: {
          cart: true,
        },
      })
    }

    // Update avatar if user exists but avatar is missing and we have one from provider
    if (user && !user.avatarUrl && avatarUrl) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { avatarUrl },
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
