import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import '../components/ArticleCard'
import FiltersBar from '../components/FiltersBar'
import SearchResults from '../components/SearchResults'
import { useAuthors, useCategories, useSources } from '../hooks/useTaxonomies'
import { useSearchFilters } from '../hooks/useSearchFilters'
import { useSearchResults } from '../hooks/useSearchResults'

const Search: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')

  useEffect(() => {
    const urlQuery = searchParams.get('q')
    if (urlQuery) {
      setQuery(urlQuery)
    }
  }, [searchParams])

  // Use custom hooks for search logic
  const {
    filters,
    handleFilterChange,
    filteredCategories,
    filteredAuthors,
    isLoadingCategories,
    isLoadingAuthors,
    clearAllFilters
  } = useSearchFilters(query)

  const { articles, isLoading, error, handlePageChange } = useSearchResults(query, filters)

  // Get taxonomy data
  const { data: sources } = useSources()
  const { data: categories } = useCategories()
  const { data: authors } = useAuthors()

  const handleQueryChange = (val: string) => {
    setQuery(val)
    const t = val.trim()
    if (t) setSearchParams({ q: t, page: '1' })
    else setSearchParams({ page: '1' })
  }

  return (
    <div className="px-4 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Search Articles</h1>
        <p className="text-gray-600">Find articles using our powerful search engine</p>

        <FiltersBar
          query={query}
          onQueryChange={handleQueryChange}
          filters={filters}
          onFilterChange={handleFilterChange}
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

      <SearchResults
        articles={articles}
        isLoading={isLoading}
        error={error}
        query={query}
        filters={filters}
        sources={sources}
        categories={categories}
        authors={authors}
        onPageChange={handlePageChange}
        onClearFilters={clearAllFilters}
      />
    </div>
  )
}

export default Search
