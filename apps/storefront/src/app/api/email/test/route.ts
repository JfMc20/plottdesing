import { verifyEmailConnection } from '@/lib/email'
import { NextResponse } from 'next/server'

/**
 * Test email service connection
 * GET /api/email/test
 *
 * This endpoint verifies if the email service is properly configured
 * and can connect to the SMTP server.
 *
 * IMPORTANT: Only use in development. Consider adding authentication in production.
 */
export async function GET() {
   try {
      // Only allow in development
      if (process.env.NODE_ENV === 'production') {
         return NextResponse.json(
            { error: 'Not available in production' },
            { status: 403 }
         )
      }

      const isConnected = await verifyEmailConnection()

      if (isConnected) {
         return NextResponse.json({
            success: true,
            message: 'Email service is configured correctly',
            config: {
               host: process.env.MAIL_SMTP_HOST,
               port: process.env.MAIL_SMTP_PORT,
               from: `${process.env.MAIL_FROM_NAME} <${process.env.MAIL_FROM_EMAIL}>`,
            },
         })
      } else {
         return NextResponse.json(
            {
               success: false,
               message: 'Email service connection failed',
               error: 'Could not connect to SMTP server',
            },
            { status: 500 }
         )
      }
   } catch (error) {
      return NextResponse.json(
         {
            success: false,
            message: 'Email service test failed',
            error: error.message,
         },
         { status: 500 }
      )
   }
}
