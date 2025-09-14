import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { articlesApi } from '../services/api'
import { DEFAULT_PAGE_SIZE } from '../config'
import type { PaginatedResponse, Article } from '../types'
import type { SearchFilters } from './useSearchFilters'

export const useSearchResults = (query: string, filters: SearchFilters) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [page, setPage] = useState(Number(searchParams.get('page') || 1))
  const perPage = DEFAULT_PAGE_SIZE

  useEffect(() => {
    const urlQuery = searchParams.get('q')
    if (urlQuery) {
      // Query is managed by parent component
    }
  }, [searchParams])

  const { data: articles, isLoading, error } = useQuery<PaginatedResponse<Article>>({
    queryKey: ['search', query, filters, page, perPage],
    queryFn: () => {
      const q = query.trim()
      return articlesApi.search({ q: q || '', ...filters, page, per_page: perPage })
    },
  })

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    setSearchParams({ q: query, page: String(newPage) })
  }

  return {
    articles,
    isLoading,
    error,
    page,
    handlePageChange
  }
}