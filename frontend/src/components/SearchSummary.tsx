import React from 'react'
import type { Article, Source, Category, Author } from '../types'
import type { SearchFilters } from '../hooks/useSearchFilters'

interface SearchSummaryProps {
  articles: { total: number } | null
  query: string
  filters: SearchFilters
  sources: Source[] | null
  categories: Category[] | null
  authors: Author[] | null
  onClearFilters: () => void
}

export const SearchSummary: React.FC<SearchSummaryProps> = ({
  articles,
  query,
  filters,
  sources,
  categories,
  onClearFilters
}) => {
  const buildSearchSummary = () => {
    const total = articles?.total || 0
    const pluralSuffix = total !== 1 ? 's' : ''
    const activeFilters = []
    
    // Add search query if present
    if (query.trim()) {
      activeFilters.push(`"${query.trim()}"`)
    }
    
    // Add active filters
    if (filters.source) {
      const sourceName = sources?.find(s => s.api_slug === filters.source)?.name || filters.source
      activeFilters.push(`source: ${sourceName}`)
    }
    if (filters.category) {
      const categoryName = categories?.find(c => c.slug === filters.category)?.name || filters.category
      activeFilters.push(`category: ${categoryName}`)
    }
    if (filters.author) {
      activeFilters.push(`author: ${filters.author}`)
    }
    if (filters.date_from || filters.date_to) {
      const dateRange = []
      if (filters.date_from) dateRange.push(`from ${filters.date_from}`)
      if (filters.date_to) dateRange.push(`to ${filters.date_to}`)
      activeFilters.push(`date: ${dateRange.join(' ')}`)
    }
    
    if (activeFilters.length === 0) {
      return (
        <span>
          Found <strong>{total}</strong> article{pluralSuffix}
        </span>
      )
    }
    
    return (
      <span>
        Found <strong>{total}</strong> article{pluralSuffix} for <strong>{activeFilters.join(', ')}</strong>
      </span>
    )
  }

  const hasActiveFilters = query.trim() || filters.source || filters.category || filters.author || filters.date_from || filters.date_to

  return (
    <div className="mb-4 flex items-center justify-between">
      <p className="text-gray-600 italic">
        {buildSearchSummary()}
      </p>
      {hasActiveFilters && (
        <button
          onClick={onClearFilters}
          className="text-sm text-blue-600 hover:text-blue-800 underline ml-4 cursor-pointer"
        >
          Clear all filters
        </button>
      )}
    </div>
  )
}