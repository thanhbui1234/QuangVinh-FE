import type { UserRole } from '@/constants'

// API Request types
export interface GetAllUsersRequest {
  getAll: boolean
}

// API Response types
export interface PersonnelUser {
  id: number
  email: string
  name: string
  phone: string
  avatar: string
  roles: UserRole[]
  createdTime: number
  updatedTime: number
}

export interface GetAllUsersResponse {
  getAll: boolean
  totalUsers: number
  users: PersonnelUser[]
}
