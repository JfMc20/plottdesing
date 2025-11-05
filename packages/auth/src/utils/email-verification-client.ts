/**
 * Client-side version of email verification resend
 * Use this in client components
 *
 * @param supabaseClient - Supabase client instance (from createClient())
 * @param email - Email address to resend verification to
 * @returns Object with success boolean and optional error
 *
 * @example
 * ```tsx
 * 'use client'
 * import { createClient } from '@persepolis/auth'
 * import { resendEmailVerificationClient } from '@persepolis/auth/utils/email-verification-client'
 *
 * function Component() {
 *   const supabase = createClient()
 *
 *   const handleResend = async () => {
 *     const result = await resendEmailVerificationClient(supabase, 'user@example.com')
 *     if (result.success) {
 *       alert('Verification email sent!')
 *     }
 *   }
 * }
 * ```
 */
export async function resendEmailVerificationClient(
  supabaseClient: any,
  email: string
) {
  try {
    const { error } = await supabaseClient.auth.resend({
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
