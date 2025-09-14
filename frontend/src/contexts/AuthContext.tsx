import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
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

  const mountedRef = useRef(true)
  const initGuardRef = useRef(false)

  useEffect(() => {
    if (initGuardRef.current) return
    initGuardRef.current = true

    let cancelled = false

    const initAuth = async () => {
      const token = localStorage.getItem('auth_token')

      // If there is no token, clear user
      if (!token) {
        localStorage.removeItem('auth_user')
        if (!cancelled && mountedRef.current) {
          setUser(null)
          setLoading(false)
        }
        return
      }

      const cached = localStorage.getItem('auth_user')
      if (cached) {
        try {
          const parsed = JSON.parse(cached) as User
          if (!cancelled && mountedRef.current) {
            setUser(parsed)
          }
        } catch (_ignored) {
          localStorage.removeItem('auth_user')
        }
      }

      try {
        const fresh = await authApi.getUser()
        if (!cancelled && mountedRef.current) {
          setUser(fresh)
          localStorage.setItem('auth_user', JSON.stringify(fresh))
        }
      } catch (error: any) {
        const status = error?.response?.status
        if (status === 401) {
          // Token invalid, clear everything
          localStorage.removeItem('auth_token')
          localStorage.removeItem('auth_user')
          if (!cancelled && mountedRef.current) {
            setUser(null)
          }
        } 
      } finally {
        if (!cancelled && mountedRef.current) {
          setLoading(false)
        }
      }
    }

    initAuth()

    return () => {
      cancelled = true
      mountedRef.current = false
    }
  }, [])

  const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password })
    const { user, token } = response.data as AuthResponse['data']
    localStorage.setItem('auth_token', token)
    setUser(user)
    localStorage.setItem('auth_user', JSON.stringify(user))
  }

  const register = async (name: string, email: string, password: string, passwordConfirmation: string) => {
    const response = await authApi.register({ name, email, password, password_confirmation: passwordConfirmation })
    const { user, token } = response.data as AuthResponse['data']
    localStorage.setItem('auth_token', token)
    setUser(user)
    localStorage.setItem('auth_user', JSON.stringify(user))
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } catch (_) {
      // Ignore logout API errors; proceed to clear client state
    } finally {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
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
