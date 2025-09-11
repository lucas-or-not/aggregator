import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { articlesApi } from '../services/api'
import '../components/ArticleCard'
import LoadingState from '../components/LoadingState'
import ErrorState from '../components/ErrorState'
import FiltersBar from '../components/FiltersBar'
import type { PaginatedResponse, Article } from '../types'
import { DEFAULT_PAGE_SIZE } from '../config'
import { useAuthors, useCategories, useSources } from '../hooks/useTaxonomies'
import Pagination from '../components/Pagination'
import ArticleGrid from '../components/ArticleGrid'

const Search: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [page, setPage] = useState(Number(searchParams.get('page') || 1))
  const perPage = DEFAULT_PAGE_SIZE
  const [filters, setFilters] = useState({
    source: '',
    category: '',
    author: '',
    date_from: '',
    date_to: '',
  })

  useEffect(() => {
    const urlQuery = searchParams.get('q')
    if (urlQuery) {
      setQuery(urlQuery)
    }
  }, [searchParams])

  const { data: articles, isLoading, error } = useQuery<PaginatedResponse<Article>>({
    queryKey: ['search', query, filters, page, perPage],
    queryFn: () => articlesApi.search({ q: query, ...filters, page, per_page: perPage }),
    enabled: query.length >= 2 || Object.values(filters).some(filter => filter !== ''),
  })

  const { data: sources } = useSources()
  const { data: categories } = useCategories()
  const { data: authors } = useAuthors()

  const handleSearch = () => {
    if (query.trim()) {
      setPage(1)
      setSearchParams({ q: query.trim(), page: '1' })
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="px-4 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Search Articles</h1>
        <p className="text-gray-600">Find articles using our powerful search engine</p>

        <FiltersBar
          query={query}
          onQueryChange={setQuery}
          onSubmit={handleSearch}
          filters={filters}
          onFilterChange={(k, v) => handleFilterChange(k, v)}
          sourceOptions={(sources?.map((s) => ({ value: s.api_slug, label: s.name })) || [])}
          categoryOptions={(categories?.map((c) => ({ value: c.slug, label: c.name })) || [])}
          authorOptions={(authors?.map((a) => ({ value: a.name, label: a.name })) || [])}
        />
      </div>

      {isLoading && <LoadingState message="Searching articles..." />}

      {error && <ErrorState message="Error searching articles. Please try again." />}

      {articles && !isLoading && (
        <>
          <div className="mb-4">
            <p className="text-gray-600">
              Found {articles?.total || 0} article{(articles?.total || 0) !== 1 ? 's' : ''} for "{query}"
            </p>
          </div>

          {articles?.data && articles.data.length > 0 ? (
            <>
              <ArticleGrid articles={articles.data} />
              <Pagination
                currentPage={articles.current_page}
                lastPage={articles.last_page}
                onPageChange={(p) => { setPage(p); setSearchParams({ q: query, page: String(p) }) }}
              />
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No articles found matching your search.</p>
            </div>
          )}
        </>
      )}

      {!query && !isLoading && (
        <div className="text-center py-12">
          <p className="text-gray-500">Enter a search term to find articles.</p>
        </div>
      )}
    </div>
  )
}

export default Search
