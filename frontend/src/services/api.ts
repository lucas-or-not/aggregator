import axios from 'axios'
import type { AuthResponse, User, Article, Source, Category, Author, UserPreferences, PaginatedResponse } from '../types'
import { API_BASE_URL, API_TIMEOUT_MS } from '../config'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url: string = error.config?.url || ''

      if (url.endsWith('/user')) {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
      }
    }
    return Promise.reject(error)
  }
)

// Typed helpers to always return response.data
const get = async <T>(url: string, config?: Parameters<typeof api.get>[1]): Promise<T> => {
  const res = await api.get<T>(url, config)
  return res.data as T
}

const post = async <T>(url: string, data?: unknown, config?: Parameters<typeof api.post>[2]): Promise<T> => {
  const res = await api.post<T>(url, data, config)
  return res.data as T
}

const put = async <T>(url: string, data?: unknown, config?: Parameters<typeof api.put>[2]): Promise<T> => {
  const res = await api.put<T>(url, data, config)
  return res.data as T
}

const del = async <T = void>(url: string, config?: Parameters<typeof api.delete>[1]): Promise<T> => {
  const res = await api.delete<T>(url, config)
  return res.data as T
}

export const authApi = {
  register: (data: { name: string; email: string; password: string; password_confirmation: string }) =>
    post<AuthResponse>('/register', data),
  
  login: (data: { email: string; password: string }) =>
    post<AuthResponse>('/login', data),
  
  logout: () => post<void>('/logout'),
  
  getUser: () => get<User>('/user'),
}

export const articlesApi = {
  getArticle: (id: number) =>
    get<{ success: boolean; data: { article: Article; is_saved: boolean } }>(`/articles/${id}`).then((r) => r.data),
  
  search: (params: {
    q: string
    source?: string
    category?: string
    author?: string
    date_from?: string
    date_to?: string
    page?: number
    per_page?: number
  }) =>
    get<PaginatedResponse<Article>>('/articles/search', { params }),
  
  save: (id: number) =>
    post<void>(`/articles/${id}/save`),
  
  unsave: (id: number) =>
    del<void>(`/articles/${id}/save`),
  
  getSaved: (params?: { page?: number; per_page?: number }) =>
    get<PaginatedResponse<Article>>('/articles/saved', { params }),
}

export const sourcesApi = {
  getSources: () =>
    get<{ success: boolean; data: Source[] }>('/sources').then((r) => r.data),
}

export const categoriesApi = {
  getCategories: () =>
    get<{ success: boolean; data: Category[] }>('/categories').then((r) => r.data),
}

export const authorsApi = {
  getAuthors: () =>
    get<{ success: boolean; data: Author[] }>('/authors').then((r) => r.data),
}

export const metadataApi = {
  getFilteredMetadata: (params?: { q?: string; source?: string; category?: string; author?: string }) =>
    get<{ success: boolean; data: { categories: Array<{ value: string; label: string; count: number }>; authors: Array<{ value: string; label: string; count: number }>; validation: { categoryExists: boolean; authorExists: boolean } } }>('/metadata/filtered', { params }).then((r) => r.data),
}

export const preferencesApi = {
  getPreferences: () =>
    get<UserPreferences>('/user/preferences'),
  
  updatePreferences: (data: {
    preferred_sources?: number[]
    preferred_categories?: number[]
    preferred_authors?: number[]
  }) =>
    put<UserPreferences>('/user/preferences', data),
  
  getFeed: (params?: { page?: number; per_page?: number }) =>
    get<PaginatedResponse<Article>>('/user/feed', { params }),
}

export default api
