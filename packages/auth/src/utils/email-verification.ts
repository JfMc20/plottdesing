import { createClient } from '../supabase/server'

/**
 * Resends email verification for signup
 * Server-side only function
 *
 * @param email - Email address to resend verification to
 * @returns Object with success boolean and optional error
 *
 * @example
 * ```tsx
 * import { resendEmailVerification } from '@persepolis/auth/utils/email-verification'
 *
 * const result = await resendEmailVerification('user@example.com')
 * if (!result.success) {
 *   console.error('Failed to resend:', result.error)
 * }
 * ```
 */
export async function resendEmailVerification(email: string) {
  try {
    const supabase = await createClient()

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error resending verification email:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
