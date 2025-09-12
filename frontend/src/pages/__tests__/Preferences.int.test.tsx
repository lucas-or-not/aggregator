import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Preferences from '../Preferences'
import { AuthProvider } from '../../contexts/AuthContext'
import { ToastProvider } from '../../contexts/ToastContext'

const renderWithProviders = () => {
  const client = new QueryClient()
  return render(
    <MemoryRouter initialEntries={['/preferences']}>
      <QueryClientProvider client={client}>
        <ToastProvider>
          <AuthProvider>
            <Preferences />
          </AuthProvider>
        </ToastProvider>
      </QueryClientProvider>
    </MemoryRouter>
  )
}

describe('Preferences page (integration)', () => {
  it('renders and loads preferences', async () => {
    renderWithProviders()
    await waitFor(() => {
      expect(screen.getByText('Preferences')).toBeInTheDocument()
    })
  })
})


