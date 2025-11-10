import { NextResponse } from 'next/server'

/**
 * Handles API errors consistently across all routes
 * Logs the error and returns a standardized error response
 * 
 * @param error - The error object
 * @param context - Context identifier (e.g., 'BRANDS_POST', 'ORDER_GET')
 * @returns NextResponse with 500 status
 */
export function handleApiError(error: unknown, context: string): NextResponse {
   console.error(`[${context}]`, error)
   return new NextResponse('Internal error', { status: 500 })
}
