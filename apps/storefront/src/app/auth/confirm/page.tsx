import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function ConfirmPage() {
   return (
      <div className="container flex h-screen w-screen flex-col items-center justify-center">
         <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
            <div className="flex flex-col space-y-2 text-center">
               <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <svg
                     className="h-8 w-8 text-green-600"
                     fill="none"
                     strokeLinecap="round"
                     strokeLinejoin="round"
                     strokeWidth="2"
                     viewBox="0 0 24 24"
                     stroke="currentColor"
                  >
                     <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
               </div>
               <h1 className="text-2xl font-semibold tracking-tight">
                  Email Confirmed!
               </h1>
               <p className="text-sm text-muted-foreground">
                  Your email has been successfully verified. You can now log in to your account.
               </p>
            </div>
            <div className="grid gap-2">
               <Link href="/login">
                  <Button className="w-full">
                     Go to Login
                  </Button>
               </Link>
               <Link href="/">
                  <Button variant="outline" className="w-full">
                     Back to Home
                  </Button>
               </Link>
            </div>
         </div>
      </div>
   )
}
