// Supabase clients - import separately to avoid bundling server code in client
export { createClient } from './supabase/client'

// Client-side utilities
export { resendEmailVerificationClient } from './utils/email-verification-client'

// Types
export type { UserRole, AuthUser, SupabaseEnv } from './types'

// NOTE: Server-side utilities should be imported directly:
// import { createClient } from '@persepolis/auth/supabase/server'
// import { createAdminClient } from '@persepolis/auth/supabase/admin'
// import { updateSession, updateSessionWithUser, checkAdminRole } from '@persepolis/auth/supabase/middleware'
// import { getCurrentUser, checkIsAdmin } from '@persepolis/auth/utils/get-user'
// import { resendEmailVerification } from '@persepolis/auth/utils/email-verification'
