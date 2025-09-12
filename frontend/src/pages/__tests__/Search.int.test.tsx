import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Search from '../Search'
import { AuthProvider } from '../../contexts/AuthContext'
import { ToastProvider } from '../../contexts/ToastContext'

const renderWithProviders = () => {
  const client = new QueryClient()
  return render(
    <MemoryRouter initialEntries={['/search']}>
      <QueryClientProvider client={client}>
        <ToastProvider>
          <AuthProvider>
            <Search />
          </AuthProvider>
        </ToastProvider>
      </QueryClientProvider>
    </MemoryRouter>
  )
}

describe('Search page (integration)', () => {
  it('shows grid after typing and also when clearing input (all articles)', async () => {
    renderWithProviders()
    const input = screen.getByPlaceholderText('Search articles...') as HTMLInputElement

    // Type 2+ chars triggers fetch
    fireEvent.change(input, { target: { value: 'he' } })
    await waitFor(() => {
      expect(screen.getByText(/Found/i)).toBeInTheDocument()
    })

    // Clear input should still show articles (all)
    fireEvent.change(input, { target: { value: '' } })
    await waitFor(() => {
      expect(screen.getByText(/Found/i)).toBeInTheDocument()
    })
  })
})


