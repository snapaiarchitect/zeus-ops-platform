import { api } from './api'
import type { User, LoginCredentials, RegisterData, AuthResponse } from '@/types/auth'

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', credentials)
    return data
  },

  async register(payload: RegisterData): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/register', payload)
    return data
  },

  async getCurrentUser(): Promise<User> {
    const { data } = await api.get<{ user: User }>('/auth/me')
    return data.user
  },

  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email })
  },

  async resetPassword(token: string, password: string): Promise<void> {
    await api.post('/auth/reset-password', { token, password })
  },
}
