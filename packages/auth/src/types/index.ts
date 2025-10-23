export type UserRole = 'admin' | 'user'

export interface AuthUser {
  id: string
  email?: string
  role?: UserRole
}

export interface SupabaseEnv {
  url: string
  anonKey: string
  serviceRoleKey?: string
}
