// User roles

import type { UserRole } from '@/constants'

// User-related types
export interface User {
  id: string | number
  email: string
  name: string
  phone: string
  roles?: string[]
  avatar?: string
  createdAt?: string
  updatedAt?: string
}

// User API response types
export interface UserResponse {
  id: string
  email: string
  name: string
  roles?: UserRole[]
  avatar?: string
  createdAt: string
  updatedAt: string
}
