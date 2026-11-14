export type UserRole = 'client' | 'operator' | 'admin'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  avatar?: string
  company?: string
  phone?: string
  isActive?: boolean
  createdAt: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  firstName: string
  lastName: string
  email: string
  password: string
  company?: string
}

export interface AuthResponse {
  user: User
  token: string
}
