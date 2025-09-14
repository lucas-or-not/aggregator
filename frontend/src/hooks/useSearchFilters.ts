import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useToast } from '../contexts/ToastContext'
import { useFilteredCategories, useFilteredAuthors } from './useFilteredMetadata'

export interface SearchFilters {
  source: string
  category: string
  author: string
  date_from: string
  date_to: string
}

export const useSearchFilters = (query: string) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filters, setFilters] = useState<SearchFilters>({
    source: '',
    category: '',
    author: '',
    date_from: '',
    date_to: '',
  })
  const { showToast } = useToast()

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

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  // Smart filter clearing logic
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

  const clearAllFilters = () => {
    setFilters({
      source: '',
      category: '',
      author: '',
      date_from: '',
      date_to: ''
    })
  }

  return {
    filters,
    handleFilterChange,
    filteredCategories,
    filteredAuthors,
    isLoadingCategories,
    isLoadingAuthors,
    validation,
    clearAllFilters
  }
}