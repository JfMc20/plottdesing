'use client'

import { Button } from '@/components/ui/button'
import { Mail, ArrowRight, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import * as React from 'react'

interface VerificationSuccessProps {
   email: string
   onResend?: () => Promise<void>
}

export function VerificationSuccess({ email, onResend }: VerificationSuccessProps) {
   const router = useRouter()
   const [isResending, setIsResending] = React.useState(false)
   const [resendMessage, setResendMessage] = React.useState('')

   const handleResend = async () => {
      if (!onResend) return

      setIsResending(true)
      setResendMessage('')

      try {
         await onResend()
         setResendMessage('Verification email sent successfully!')
      } catch (error) {
         setResendMessage('Failed to resend. Please try again.')
      } finally {
         setIsResending(false)
      }
   }

   return (
      <div className="grid gap-6">
         {/* Success Icon */}
         <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-10 w-10 text-primary" />
         </div>

         {/* Title */}
         <div className="space-y-2 text-center">
            <h2 className="text-2xl font-semibold tracking-tight">
               Check your email
            </h2>
            <p className="text-sm text-muted-foreground">
               We've sent a verification link to
            </p>
            <p className="font-medium text-foreground">{email}</p>
         </div>

         {/* Instructions */}
         <div className="rounded-lg border bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground mb-3">
               To complete your registration:
            </p>
            <ol className="space-y-2 text-sm text-muted-foreground">
               <li className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-medium text-primary">
                     1
                  </span>
                  <span>Open the email from PlottDesign</span>
               </li>
               <li className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-medium text-primary">
                     2
                  </span>
                  <span>Click the verification link</span>
               </li>
               <li className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-medium text-primary">
                     3
                  </span>
                  <span>You'll be redirected to start shopping</span>
               </li>
            </ol>
         </div>

         {/* Resend message */}
         {resendMessage && (
            <div className={`rounded-md p-3 text-sm ${
               resendMessage.includes('successfully')
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
               {resendMessage}
            </div>
         )}

         {/* Actions */}
         <div className="grid gap-3">
            <Button
               onClick={() => router.push('/login')}
               className="w-full"
            >
               Go to Login
               <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            {onResend && (
               <Button
                  onClick={handleResend}
                  variant="outline"
                  className="w-full"
                  disabled={isResending}
               >
                  {isResending ? (
                     <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Resending...
                     </>
                  ) : (
                     <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Resend verification email
                     </>
                  )}
               </Button>
            )}
         </div>

         {/* Help text */}
         <div className="text-center">
            <p className="text-xs text-muted-foreground">
               Didn't receive the email? Check your spam folder or{' '}
               <button
                  onClick={handleResend}
                  disabled={isResending}
                  className="font-medium text-primary hover:underline disabled:opacity-50"
               >
                  resend it
               </button>
            </p>
         </div>
      </div>
   )
}
