import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Saved from '../Saved'
import { AuthProvider } from '../../contexts/AuthContext'
import { ToastProvider } from '../../contexts/ToastContext'

const renderWithProviders = () => {
  const client = new QueryClient()
  return render(
    <MemoryRouter initialEntries={['/saved']}>
      <QueryClientProvider client={client}>
        <ToastProvider>
          <AuthProvider>
            <Saved />
          </AuthProvider>
        </ToastProvider>
      </QueryClientProvider>
    </MemoryRouter>
  )
}

describe('Saved page (integration)', () => {
  it('renders saved list', async () => {
    renderWithProviders()
    await waitFor(() => {
      expect(screen.getByText('Saved One')).toBeInTheDocument()
    })
  })
})


