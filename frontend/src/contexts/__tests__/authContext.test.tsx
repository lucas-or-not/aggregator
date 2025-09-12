import React from 'react'
import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '../AuthContext'

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthProvider>{children}</AuthProvider>
)

describe('AuthContext', () => {
  it('login stores token and sets user', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    await act(async () => {
      await result.current.login('a@b.com', 'pass')
    })
    expect(localStorage.getItem('auth_token')).toBeTruthy()
    expect(result.current.user?.email).toBe('test@example.com')
  })

  it('register stores token and sets user', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    await act(async () => {
      await result.current.register('name', 'c@d.com', 'pass', 'pass')
    })
    expect(localStorage.getItem('auth_token')).toBeTruthy()
    expect(result.current.user?.email).toBe('new@example.com')
  })

  it('logout clears token and user', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    await act(async () => {
      await result.current.login('a@b.com', 'pass')
      result.current.logout()
    })
    expect(localStorage.getItem('auth_token')).toBeNull()
    expect(result.current.user).toBeNull()
  })
})


