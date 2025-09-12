import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Article from '../Article'
import { AuthProvider } from '../../contexts/AuthContext'
import { ToastProvider } from '../../contexts/ToastContext'

const renderWithProviders = () => {
  const client = new QueryClient()
  return render(
    <MemoryRouter initialEntries={['/article/1']}>
      <QueryClientProvider client={client}>
        <ToastProvider>
          <AuthProvider>
            <Routes>
              <Route path="/article/:id" element={<Article />} />
            </Routes>
          </AuthProvider>
        </ToastProvider>
      </QueryClientProvider>
    </MemoryRouter>
  )
}

describe('Article page (integration)', () => {
  it('renders article content', async () => {
    renderWithProviders()
    await waitFor(() => {
      expect(screen.getByText('A')).toBeInTheDocument()
    })
  })
})


