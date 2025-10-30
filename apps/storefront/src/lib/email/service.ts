/**
 * Unified Email Service
 *
 * This service provides a centralized way to send emails using Brevo API.
 * It follows DRY principles by having a single source of truth for email configuration.
 */

import { render } from '@react-email/render'
import { ReactElement } from 'react'

// Email configuration from environment variables
const BREVO_API_KEY = process.env.BREVO_API_KEY
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email'

const FROM_EMAIL = {
   email: process.env.MAIL_FROM_EMAIL || 'noreply@plottdesign.com',
   name: process.env.MAIL_FROM_NAME || 'PlottDesign',
}

/**
 * Send email using React Email template with Brevo API
 *
 * @param to - Recipient email address
 * @param subject - Email subject
 * @param template - React Email component
 * @returns Promise with send result
 *
 * @example
 * ```ts
 * import { Verification } from '@/emails/verify'
 *
 * await sendEmail({
 *   to: 'user@example.com',
 *   subject: 'Verify your email',
 *   template: <Verification name="User" code="123456" />
 * })
 * ```
 */
export async function sendEmail({
   to,
   subject,
   template,
   replyTo,
}: {
   to: string
   subject: string
   template: ReactElement
   replyTo?: string
}) {
   try {
      if (!BREVO_API_KEY) {
         throw new Error(
            'Missing Brevo API key. Please check BREVO_API_KEY environment variable.'
         )
      }

      const html = await render(template)
      const text = await render(template, { plainText: true })

      const response = await fetch(BREVO_API_URL, {
         method: 'POST',
         headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'api-key': BREVO_API_KEY,
         },
         body: JSON.stringify({
            sender: {
               name: FROM_EMAIL.name,
               email: FROM_EMAIL.email,
            },
            to: [{ email: to }],
            subject,
            htmlContent: html,
            textContent: text,
            replyTo: replyTo ? { email: replyTo } : { email: FROM_EMAIL.email },
         }),
      })

      if (!response.ok) {
         const error = await response.json()
         throw new Error(`Brevo API error: ${error.message || response.statusText}`)
      }

      const result = await response.json()

      console.log('📧 Email sent successfully:', {
         to,
         subject,
         messageId: result.messageId,
      })

      return { success: true, messageId: result.messageId }
   } catch (error) {
      console.error('❌ Failed to send email:', error)
      throw new Error(`Failed to send email: ${error.message}`)
   }
}

/**
 * Send plain text email without template using Brevo API
 *
 * @param to - Recipient email address
 * @param subject - Email subject
 * @param text - Plain text content
 * @param html - Optional HTML content
 * @returns Promise with send result
 */
export async function sendPlainEmail({
   to,
   subject,
   text,
   html,
   replyTo,
}: {
   to: string
   subject: string
   text: string
   html?: string
   replyTo?: string
}) {
   try {
      if (!BREVO_API_KEY) {
         throw new Error(
            'Missing Brevo API key. Please check BREVO_API_KEY environment variable.'
         )
      }

      const response = await fetch(BREVO_API_URL, {
         method: 'POST',
         headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'api-key': BREVO_API_KEY,
         },
         body: JSON.stringify({
            sender: {
               name: FROM_EMAIL.name,
               email: FROM_EMAIL.email,
            },
            to: [{ email: to }],
            subject,
            htmlContent: html || text,
            textContent: text,
            replyTo: replyTo ? { email: replyTo } : { email: FROM_EMAIL.email },
         }),
      })

      if (!response.ok) {
         const error = await response.json()
         throw new Error(`Brevo API error: ${error.message || response.statusText}`)
      }

      const result = await response.json()

      console.log('📧 Plain email sent successfully:', {
         to,
         subject,
         messageId: result.messageId,
      })

      return { success: true, messageId: result.messageId }
   } catch (error) {
      console.error('❌ Failed to send plain email:', error)
      throw new Error(`Failed to send plain email: ${error.message}`)
   }
}

/**
 * Verify email connection
 * Use this to test if email service is configured correctly
 */
export async function verifyEmailConnection() {
   try {
      if (!BREVO_API_KEY) {
         throw new Error(
            'Missing Brevo API key. Please check BREVO_API_KEY environment variable.'
         )
      }

      // Test connection by calling Brevo account endpoint
      const response = await fetch('https://api.brevo.com/v3/account', {
         method: 'GET',
         headers: {
            'Accept': 'application/json',
            'api-key': BREVO_API_KEY,
         },
      })

      if (!response.ok) {
         throw new Error(`Brevo API error: ${response.statusText}`)
      }

      console.log('✅ Email service is ready')
      return true
   } catch (error) {
      console.error('❌ Email service verification failed:', error)
      return false
   }
}
