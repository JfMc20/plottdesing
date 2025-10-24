/**
 * Email Service - Centralized email handling
 *
 * This module exports all email-related functionality.
 * Use this instead of directly importing from Supabase or creating multiple email services.
 */

export { sendEmail, sendPlainEmail, verifyEmailConnection } from './service'

// Re-export email templates for convenience
export { default as VerificationEmail } from '@/emails/verify'
export { default as OrderNotificationEmail } from '@/emails/order_notification_owner'
