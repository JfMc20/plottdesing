'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export function useAuthenticated() {
   const [authenticated, setAuthenticated] = useState<boolean>(false)
   const [loading, setLoading] = useState<boolean>(true)
   const supabase = createClient()

   useEffect(() => {
      // Check initial session
      const checkSession = async () => {
         try {
            const { data: { session } } = await supabase.auth.getSession()
            setAuthenticated(!!session)
            setLoading(false)
         } catch (error) {
            console.error('Error checking session:', error)
            setAuthenticated(false)
            setLoading(false)
         }
      }

      checkSession()

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
         setAuthenticated(!!session)
         setLoading(false)
      })

      return () => {
         subscription.unsubscribe()
      }
   }, [])

   return { authenticated, loading }
}
