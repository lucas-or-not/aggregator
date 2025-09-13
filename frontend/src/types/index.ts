export interface User {
  id: number
  name: string
  email: string
  created_at: string
  updated_at: string
}

export interface Article {
  id: number
  title: string
  slug: string
  excerpt?: string
  content: string
  url: string
  image_url?: string
  published_at: string
  scraped_at: string
  language: string
  source: Source
  author?: Author
  category?: Category
  is_saved?: boolean
}

export interface Source {
  id: number
  name: string
  api_slug: string
}

export interface Author {
  id: number
  name: string
  canonical_name: string
}

export interface Category {
  id: number
  name: string
  slug: string
}

export interface UserPreferences {
  id: number
  user_id: number
  preferred_sources: number[]
  preferred_categories: number[]
  preferred_authors: number[]
  created_at: string
  updated_at: string
}

export interface AuthResponse {
  data: {
    user: User
    token: string
  }
  message: string
}

export interface PaginatedResponse<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number
  to: number
}
