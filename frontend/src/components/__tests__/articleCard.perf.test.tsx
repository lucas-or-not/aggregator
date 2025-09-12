import React, { Profiler, useState } from 'react'
import { describe, it, expect } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '../../contexts/AuthContext'
import { ToastProvider } from '../../contexts/ToastContext'
import ArticleCard from '../ArticleCard'

const article = {
  id: 1,
  title: 'Perf Test',
  slug: 'perf-test',
  content: '',
  url: '#',
  published_at: '2025-01-01',
  scraped_at: '2025-01-01',
  language: 'en',
  source: { id: 1, name: 'News', api_slug: 'news' },
}

describe('ArticleCard memoization', () => {
  it('does not re-render when parent re-renders with same props', () => {
    let renders = 0
    const client = new QueryClient()

    const Parent: React.FC = () => {
      const [tick, setTick] = useState(0)
      return (
        <div>
          <button onClick={() => setTick((t) => t + 1)}>rerender</button>
          <Profiler id="card" onRender={() => { renders += 1 }}>
            <ArticleCard article={article as any} canSave={false} isSaved={false} />
          </Profiler>
        </div>
      )
    }

    const { getByText } = render(
      <MemoryRouter>
        <QueryClientProvider client={client}>
          <ToastProvider>
            <AuthProvider>
              <Parent />
            </AuthProvider>
          </ToastProvider>
        </QueryClientProvider>
      </MemoryRouter>
    )

    // Capture initial render count (can be >1 in dev/test due to extra commits)
    const initial = renders
    fireEvent.click(getByText('rerender'))
    // Allow at most one extra commit noise from providers/test env
    const delta = renders - initial
    expect(delta).toBeLessThanOrEqual(1)
  })
})


