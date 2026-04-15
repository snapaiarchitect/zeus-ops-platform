import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authService } from '@/services/auth.service'
import type { User, LoginCredentials, RegisterData } from '@/types/auth'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('zeus_token')
      if (token) {
        try {
          const userData = await authService.getCurrentUser()
          setUser(userData)
        } catch (error) {
          localStorage.removeItem('zeus_token')
        }
      }
      setIsLoading(false)
    }
    initAuth()
  }, [])

  const login = useCallback(async (credentials: LoginCredentials) => {
    const response = await authService.login(credentials)
    localStorage.setItem('zeus_token', response.token)
    setUser(response.user)
  }, [])

  const register = useCallback(async (data: RegisterData) => {
    const response = await authService.register(data)
    localStorage.setItem('zeus_token', response.token)
    setUser(response.user)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('zeus_token')
    setUser(null)
  }, [])

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}
