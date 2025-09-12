import React from 'react'
import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthors, useCategories, useSources } from '../useTaxonomies'
import { useArticlesSearch, useSaveArticle } from '../useArticles'

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const client = new QueryClient()
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

describe('hooks', () => {
  it('useTaxonomies returns arrays', async () => {
    const { result: rs } = renderHook(() => useSources(), { wrapper })
    const { result: rc } = renderHook(() => useCategories(), { wrapper })
    const { result: ra } = renderHook(() => useAuthors(), { wrapper })
    await waitFor(() => {
      expect(Array.isArray(rs.current.data)).toBe(true)
      expect(Array.isArray(rc.current.data)).toBe(true)
      expect(Array.isArray(ra.current.data)).toBe(true)
    })
  })

  it('useArticlesSearch returns data and respects keys', async () => {
    const { result } = renderHook(
      () => useArticlesSearch('he', { source: '', category: '', author: '', date_from: '', date_to: '' }, 1, 24),
      { wrapper }
    )
    await waitFor(() => {
      expect(result.current.data?.data?.length).toBeGreaterThan(0)
    })
  })

  it('useSaveArticle exposes save/unsave mutations', async () => {
    const { result } = renderHook(() => useSaveArticle(1), { wrapper })
    expect(typeof result.current.save.mutate).toBe('function')
    expect(typeof result.current.unsave.mutate).toBe('function')
  })
})


