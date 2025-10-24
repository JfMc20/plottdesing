import { sendEmail, VerificationEmail, OrderNotificationEmail } from '@/lib/email'
import { NextResponse } from 'next/server'

/**
 * Send test email
 * POST /api/email/send-test
 *
 * Body:
 * {
 *   "to": "your-email@example.com",
 *   "type": "verification" | "order"
 * }
 *
 * IMPORTANT: Only use in development
 */
export async function POST(req: Request) {
   try {
      // Only allow in development
      if (process.env.NODE_ENV === 'production') {
         return NextResponse.json(
            { error: 'Not available in production' },
            { status: 403 }
         )
      }

      const body = await req.json()
      const { to, type = 'verification' } = body

      if (!to) {
         return NextResponse.json(
            { error: 'Email address is required. Provide "to" in request body.' },
            { status: 400 }
         )
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(to)) {
         return NextResponse.json(
            { error: 'Invalid email address format' },
            { status: 400 }
         )
      }

      let result

      switch (type) {
         case 'verification':
            result = await sendEmail({
               to,
               subject: '[TEST] Verify your email - PlottDesign',
               template: VerificationEmail({
                  name: 'PlottDesign',
                  code: '123456',
               }),
            })
            break

         case 'order':
            result = await sendEmail({
               to,
               subject: '[TEST] New Order Created - PlottDesign',
               template: OrderNotificationEmail({
                  orderNum: '12345',
                  payable: '299.99',
                  id: 'test-order-id',
               }),
            })
            break

         default:
            return NextResponse.json(
               { error: `Unknown email type: ${type}. Use "verification" or "order"` },
               { status: 400 }
            )
      }

      return NextResponse.json({
         success: true,
         message: `Test ${type} email sent successfully to ${to}`,
         messageId: result.messageId,
         type,
         recipient: to,
      })
   } catch (error) {
      console.error('Failed to send test email:', error)
      return NextResponse.json(
         {
            success: false,
            error: error.message || 'Failed to send test email',
         },
         { status: 500 }
      )
   }
}

/**
 * GET endpoint for instructions
 */
export async function GET() {
   return NextResponse.json({
      message: 'Send test emails',
      usage: {
         method: 'POST',
         endpoint: '/api/email/send-test',
         body: {
            to: 'your-email@example.com',
            type: 'verification | order',
         },
      },
      examples: {
         verification: {
            curl: `curl -X POST http://localhost:7777/api/email/send-test \\
  -H "Content-Type: application/json" \\
  -d '{"to": "your-email@example.com", "type": "verification"}'`,
         },
         order: {
            curl: `curl -X POST http://localhost:7777/api/email/send-test \\
  -H "Content-Type: application/json" \\
  -d '{"to": "your-email@example.com", "type": "order"}'`,
         },
      },
      availableTypes: ['verification', 'order'],
      note: 'This endpoint is only available in development mode',
   })
}
