import type { createMemberSchema, loginSchema, registerSchema } from '@/schemas/Auth'
import type { User } from './User'
import type { z } from 'zod'

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface AuthActions {
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (email: string, password: string, name: string) => Promise<void>
  clearError: () => void
  setLoading: (loading: boolean) => void
  setAuth: (user: User, token: string, role?: string) => void
  setUser: (user: User) => void
}

export type AuthStore = AuthState & AuthActions

export interface LoginResponse {
  user: User
  token: string
  role?: string
  refreshToken: string
}

export interface RegisterResponse {
  user: User
  token: string
  refreshToken: string
}

export type RegisterFormData = z.infer<typeof registerSchema>
export type LoginFormData = z.infer<typeof loginSchema>
export type CreateMemberFormData = z.infer<typeof createMemberSchema>
