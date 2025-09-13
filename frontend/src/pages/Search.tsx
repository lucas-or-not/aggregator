import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { articlesApi } from '../services/api'
import '../components/ArticleCard'
import LoadingState from '../components/LoadingState'
import ArticlesLoadingState from '../components/ArticlesLoadingState'
import FiltersBar from '../components/FiltersBar'
import type { PaginatedResponse, Article } from '../types'
import { DEFAULT_PAGE_SIZE } from '../config'
import { useAuthors, useCategories, useSources } from '../hooks/useTaxonomies'
import { useFilteredCategories, useFilteredAuthors } from '../hooks/useFilteredMetadata'
import Pagination from '../components/Pagination'
import ArticleGrid from '../components/ArticleGrid'
import { useToast } from '../contexts/ToastContext'

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
  const { showToast } = useToast()

  useEffect(() => {
    const urlQuery = searchParams.get('q')
    if (urlQuery) {
      setQuery(urlQuery)
    }
  }, [searchParams])

  const { data: articles, isLoading, error } = useQuery<PaginatedResponse<Article>>({
    queryKey: ['search', query, filters, page, perPage],
    queryFn: () => {
      const q = query.trim()
      return articlesApi.search({ q: q || '', ...filters, page, per_page: perPage })
    },
  })

  const { data: sources } = useSources()
  const { data: categories } = useCategories()
  const { data: authors } = useAuthors()

  // Get filtered metadata based on current selections
  const { data: filteredCategories, isLoading: isLoadingCategories } = useFilteredCategories(
    query || undefined,
    filters.source || undefined,
    filters.author || undefined
  )
  const { authors: filteredAuthors, isLoading: isLoadingAuthors, validation } = useFilteredAuthors(
    query || undefined,
    filters.source || undefined,
    filters.category || undefined,
    filters.author || undefined
  )

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value }
      
      return newFilters
    })
    setPage(1) // Reset to first page when filters change
  }
  
  // Effect to handle smart filter clearing based on validation
  const lastToastRef = React.useRef<string>('')
  const [resetFiltersToShow, setResetFiltersToShow] = React.useState<string[]>([])
  
  React.useEffect(() => {
    if (validation && (filters.source || filters.author || filters.category)) {
      setFilters(prev => {
        const newFilters = { ...prev }
        let changed = false
        const resetFilters: string[] = []
        
        // Reset category to 'all' if it doesn't exist for the current filters
        if (prev.category && !validation.categoryExists) {
          newFilters.category = ''
          changed = true
          resetFilters.push('category')
        }
        
        // Reset author to 'all' if it doesn't exist for the current filters
        if (prev.author && !validation.authorExists) {
          newFilters.author = ''
          changed = true
          resetFilters.push('author')
        }
        
        if (changed && resetFilters.length > 0) {
          setResetFiltersToShow(resetFilters)
        }
        
        return changed ? newFilters : prev
      })
    }
  }, [validation, filters.source, filters.author, filters.category])
  
  // Separate effect to show toast after state update
  React.useEffect(() => {
    if (resetFiltersToShow.length > 0) {
      const toastKey = resetFiltersToShow.sort().join('-')
      if (lastToastRef.current !== toastKey) {
        lastToastRef.current = toastKey
        showToast('info', 'Filters Reset', `${resetFiltersToShow.join(' and ')} filter${resetFiltersToShow.length > 1 ? 's' : ''} reset to 'all': incompatible with current source/category!`)
        // Reset the ref after a short delay to allow future toasts
        setTimeout(() => { lastToastRef.current = '' }, 1000)
      }
      setResetFiltersToShow([])
    }
  }, [resetFiltersToShow, showToast])
  


  return (
    <div className="px-4 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Search Articles</h1>
        <p className="text-gray-600">Find articles using our powerful search engine</p>

        <FiltersBar
          query={query}
          onQueryChange={(val) => {
            setQuery(val)
            setPage(1)
            const t = val.trim()
            if (t) setSearchParams({ q: t, page: '1' })
            else setSearchParams({ page: '1' })
          }}
          filters={filters}
          onFilterChange={(k, v) => handleFilterChange(k, v)}
          sourceOptions={(sources?.map((s) => ({ value: s.api_slug, label: s.name })) || [])}
          categoryOptions={(filters.source || filters.author) ? 
            (filteredCategories || []).map((c) => ({ value: c.value, label: c.label })) : 
            (categories?.map((c) => ({ value: c.slug, label: c.name })) || [])
          }
          authorOptions={(filters.source || filters.category) ? 
            filteredAuthors.map((a) => ({ value: a.value, label: a.label })) : 
            (authors?.map((a) => ({ value: a.name, label: a.name })) || [])
          }
          isLoadingCategories={(filters.source || filters.author) ? isLoadingCategories : false}
          isLoadingAuthors={(filters.source || filters.category) ? isLoadingAuthors : false}
        />
      </div>

      {isLoading && <LoadingState variant="grid" />}

      {error && <ArticlesLoadingState onRefresh={() => window.location.reload()} />}

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
    </div>
  )
}

export default Search
