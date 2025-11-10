import { getCurrentUser } from '@persepolis/auth/utils/get-user'
import prisma from '@/lib/prisma'
import { nanoid } from 'nanoid'

/**
 * Gets the current authenticated owner (admin) from the database
 * Links Supabase auth user to Prisma Owner model
 *
 * @returns Owner record or null if not found/authenticated
 */
export async function getCurrentOwner() {
  try {
    const user = await getCurrentUser()

    if (!user || !user.id) {
      return null
    }

    // Find owner by supabaseId
    const owner = await prisma.owner.findUnique({
      where: { supabaseId: user.id },
    })

    // If owner doesn't exist but user has admin email, create the owner
    if (!owner && user.email) {
      const adminEmails = process.env.ADMIN_EMAILS?.split(',').map((e) =>
        e.trim()
      ) || []

      if (adminEmails.includes(user.email)) {
        const newOwner = await prisma.owner.create({
          data: {
            id: nanoid(),
            supabaseId: user.id,
            email: user.email,
            name: user.user_metadata?.full_name || user.email,
            avatar: user.user_metadata?.avatar_url,
            updatedAt: new Date(),
          },
        })

        return newOwner
      }
    }

    return owner
  } catch (error) {
    console.error('Error getting current owner:', error)
    return null
  }
}
