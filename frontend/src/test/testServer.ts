import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export const handlers = [
  http.get(`${API}/user`, () => {
    return HttpResponse.json({ id: 1, name: 'Test User', email: 'test@example.com', created_at: '2025-01-01', updated_at: '2025-01-01' })
  }),
  http.post(`${API}/login`, async () => {
    return HttpResponse.json({ user: { id: 1, name: 'Test User', email: 'test@example.com', created_at: '2025-01-01', updated_at: '2025-01-01' }, token: 'token123' })
  }),
  http.post(`${API}/register`, async () => {
    return HttpResponse.json({ user: { id: 2, name: 'New User', email: 'new@example.com', created_at: '2025-01-01', updated_at: '2025-01-01' }, token: 'token456' })
  }),
  http.post(`${API}/logout`, async () => HttpResponse.json({ success: true })),
  http.get(`${API}/sources`, () => {
    return HttpResponse.json({ success: true, data: [
      { id: 1, name: 'NewsAPI', api_slug: 'newsapi' },
    ]})
  }),
  http.get(`${API}/categories`, () => {
    return HttpResponse.json({ success: true, data: [
      { id: 1, name: 'Technology', slug: 'technology' },
    ]})
  }),
  http.get(`${API}/authors`, () => {
    return HttpResponse.json({ success: true, data: [
      { id: 1, name: 'Ada Lovelace', canonical_name: 'ada-lovelace' },
    ]})
  }),
  http.get(`${API}/articles/search`, ({ request }) => {
    return HttpResponse.json({
      data: [
        { id: 1, title: 'Hello', slug: 'hello', content: '', url: '#', published_at: '2025-01-01', scraped_at: '2025-01-01', language: 'en', source: { id:1, name:'NewsAPI', api_slug:'newsapi' } },
      ],
      current_page: 1,
      last_page: 1,
      per_page: 24,
      total: 1,
      from: 1,
      to: 1,
    })
  }),
  http.get(`${API}/articles/:id`, ({ params }) => {
    return HttpResponse.json({ success: true, data: {
      article: { id: Number(params.id), title: 'A', slug: 'a', content: '', url: '#', published_at: '2025-01-01', scraped_at: '2025-01-01', language: 'en', source: { id:1, name:'NewsAPI', api_slug:'newsapi' } },
      is_saved: false,
    }})
  }),
  http.post(`${API}/articles/:id/save`, () => HttpResponse.json({ success: true })),
  http.delete(`${API}/articles/:id/save`, () => HttpResponse.json({ success: true })),
]

export const server = setupServer(...handlers)


