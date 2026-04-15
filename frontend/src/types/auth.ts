export interface User {
  id: string
  email: string
  name: string
  role: 'client' | 'admin'
  avatar?: string
  company?: string
  phone?: string
  createdAt: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  company?: string
}

export interface AuthResponse {
  user: User
  token: string
}
