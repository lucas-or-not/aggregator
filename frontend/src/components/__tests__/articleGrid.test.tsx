import React from 'react'
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import ArticleGrid from '../ArticleGrid'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '../../contexts/AuthContext'
import { ToastProvider } from '../../contexts/ToastContext'

const article = {
  id: 1,
  title: 'Hello',
  slug: 'hello',
  content: '',
  url: '#',
  published_at: '2025-01-01',
  scraped_at: '2025-01-01',
  language: 'en',
  source: { id: 1, name: 'News', api_slug: 'news' },
}

describe('ArticleGrid', () => {
  it('renders empty state when no items', () => {
    const client = new QueryClient()
    const { getByText } = render(
      <MemoryRouter>
        <QueryClientProvider client={client}>
          <ToastProvider>
            <AuthProvider>
              <ArticleGrid articles={[]} />
            </AuthProvider>
          </ToastProvider>
        </QueryClientProvider>
      </MemoryRouter>
    )
    expect(getByText('No articles found.')).toBeInTheDocument()
  })

  it('renders items when provided', () => {
    const client = new QueryClient()
    const { getByText } = render(
      <MemoryRouter>
        <QueryClientProvider client={client}>
          <ToastProvider>
            <AuthProvider>
              <ArticleGrid articles={[article as any]} />
            </AuthProvider>
          </ToastProvider>
        </QueryClientProvider>
      </MemoryRouter>
    )
    expect(getByText('Hello')).toBeInTheDocument()
  })
})


