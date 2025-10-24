/**
 * Unified Email Service
 *
 * This service provides a centralized way to send emails using Brevo SMTP.
 * It follows DRY principles by having a single source of truth for email configuration.
 */

import nodemailer from 'nodemailer'
import { render } from '@react-email/render'
import { ReactElement } from 'react'

// Email configuration from environment variables
const SMTP_CONFIG = {
   host: process.env.MAIL_SMTP_HOST,
   port: parseInt(process.env.MAIL_SMTP_PORT || '587'),
   secure: false, // true for 465, false for other ports
   auth: {
      user: process.env.MAIL_SMTP_USER,
      pass: process.env.MAIL_SMTP_PASS,
   },
}

const FROM_EMAIL = {
   email: process.env.MAIL_FROM_EMAIL || 'noreply@plottdesign.com',
   name: process.env.MAIL_FROM_NAME || 'PlottDesign',
}

// Create reusable transporter
let transporter: nodemailer.Transporter | null = null

/**
 * Get or create email transporter
 */
function getTransporter() {
   if (!transporter) {
      // Validate required environment variables
      if (!SMTP_CONFIG.host || !SMTP_CONFIG.auth.user || !SMTP_CONFIG.auth.pass) {
         throw new Error(
            'Missing email configuration. Please check MAIL_SMTP_HOST, MAIL_SMTP_USER, and MAIL_SMTP_PASS environment variables.'
         )
      }

      transporter = nodemailer.createTransport(SMTP_CONFIG)
   }

   return transporter
}

/**
 * Send email using React Email template
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
      const html = await render(template)
      const text = await render(template, { plainText: true })

      const transporter = getTransporter()

      const info = await transporter.sendMail({
         from: `${FROM_EMAIL.name} <${FROM_EMAIL.email}>`,
         to,
         subject,
         text,
         html,
         replyTo: replyTo || FROM_EMAIL.email,
      })

      console.log('📧 Email sent successfully:', {
         to,
         subject,
         messageId: info.messageId,
      })

      return { success: true, messageId: info.messageId }
   } catch (error) {
      console.error('❌ Failed to send email:', error)
      throw new Error(`Failed to send email: ${error.message}`)
   }
}

/**
 * Send plain text email without template
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
      const transporter = getTransporter()

      const info = await transporter.sendMail({
         from: `${FROM_EMAIL.name} <${FROM_EMAIL.email}>`,
         to,
         subject,
         text,
         html: html || text,
         replyTo: replyTo || FROM_EMAIL.email,
      })

      console.log('📧 Plain email sent successfully:', {
         to,
         subject,
         messageId: info.messageId,
      })

      return { success: true, messageId: info.messageId }
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
      const transporter = getTransporter()
      await transporter.verify()
      console.log('✅ Email service is ready')
      return true
   } catch (error) {
      console.error('❌ Email service verification failed:', error)
      return false
   }
}
