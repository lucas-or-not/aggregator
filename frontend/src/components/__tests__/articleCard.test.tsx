import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import ArticleCard from '../ArticleCard'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '../../contexts/AuthContext'
import { ToastProvider } from '../../contexts/ToastContext'
import { MemoryRouter } from 'react-router-dom'

const baseArticle = {
  id: 1,
  title: 'T',
  slug: 't',
  content: '',
  url: '#',
  published_at: '2025-01-01',
  scraped_at: '2025-01-01',
  language: 'en',
  source: { id: 1, name: 'S', api_slug: 's' },
}

describe('ArticleCard', () => {
  it('calls onToggleSave when provided', () => {
    const onToggleSave = vi.fn()
    const client = new QueryClient()
    const { getByTitle } = render(
      <MemoryRouter>
        <QueryClientProvider client={client}>
          <ToastProvider>
            <AuthProvider>
              <ArticleCard article={baseArticle as any} canSave isSaved={false} onToggleSave={onToggleSave} />
            </AuthProvider>
          </ToastProvider>
        </QueryClientProvider>
      </MemoryRouter>
    )
    fireEvent.click(getByTitle('Save article'))
    expect(onToggleSave).toHaveBeenCalled()
  })
})


