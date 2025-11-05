// Re-export from shared auth package
// Import directly from the server module to avoid bundling in client
export { createClient } from '../../../../../packages/auth/src/supabase/server'
