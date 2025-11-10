import { NextResponse } from 'next/server'

/**
 * Validates that the request has a valid user ID from middleware
 * Returns the userId if valid, or an error response if not
 */
export function validateAuth(req: Request): { userId: string } | NextResponse {
   const userId = req.headers.get('X-USER-ID')
   
   if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
   }
   
   return { userId }
}

/**
 * Type guard to check if the result is an error response
 */
export function isErrorResponse(result: { userId: string } | NextResponse): result is NextResponse {
   return result instanceof NextResponse
}
