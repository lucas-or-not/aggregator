import React from 'react'
import type { PaginatedResponse, Article } from '../types'
import LoadingState from './LoadingState'
import ArticlesLoadingState from './ArticlesLoadingState'
import ArticleGrid from './ArticleGrid'
import Pagination from './Pagination'
import { SearchSummary } from './SearchSummary'
import type { SearchFilters } from '../hooks/useSearchFilters'
import type { Source, Category, Author } from '../types'

interface SearchResultsProps {
  articles: PaginatedResponse<Article> | undefined
  isLoading: boolean
  error: any
  query: string
  filters: SearchFilters
  sources: Source[] | undefined
  categories: Category[] | undefined
  authors: Author[] | undefined
  onPageChange: (page: number) => void
  onClearFilters: () => void
}

const SearchResults: React.FC<SearchResultsProps> = ({
  articles,
  isLoading,
  error,
  query,
  filters,
  sources,
  categories,
  authors,
  onPageChange,
  onClearFilters
}) => {
  if (isLoading) {
    return <LoadingState variant="grid" />
  }

  if (error) {
    return <ArticlesLoadingState onRefresh={() => window.location.reload()} />
  }

  if (!articles) {
    return null
  }

  return (
    <>
      <SearchSummary
            articles={articles}
            query={query}
            filters={filters}
            sources={sources || null}
            categories={categories || null}
            authors={authors || null}
            onClearFilters={onClearFilters}
          />

      {articles.data && articles.data.length > 0 ? (
        <>
          <ArticleGrid articles={articles.data} />
          <Pagination
            currentPage={articles.current_page}
            lastPage={articles.last_page}
            onPageChange={onPageChange}
          />
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No articles found matching your search.</p>
        </div>
      )}
    </>
  )
}

export default SearchResults