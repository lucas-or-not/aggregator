import React, { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { User } from '../types'
import { authApi } from '../services/api'
import type { AuthResponse } from '../types'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, passwordConfirmation: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('auth_token')
      if (token) {
        try {
          const user = await authApi.getUser()
          setUser(user)
        } catch (error) {
          localStorage.removeItem('auth_token')
        }
      }
      setLoading(false)
    }

    initAuth()
  }, [])

  const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password })
    const { user, token } = response as AuthResponse
    localStorage.setItem('auth_token', token)
    setUser(user)
  }

  const register = async (name: string, email: string, password: string, passwordConfirmation: string) => {
    const response = await authApi.register({ name, email, password, password_confirmation: passwordConfirmation })
    const { user, token } = response as AuthResponse
    localStorage.setItem('auth_token', token)
    setUser(user)
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } catch (_) {
      // Ignore logout API errors; proceed to clear client state
    } finally {
      localStorage.removeItem('auth_token')
      setUser(null)
      // Always redirect to homepage after logging out
      if (typeof window !== 'undefined') {
        window.location.assign('/')
      }
    }
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
