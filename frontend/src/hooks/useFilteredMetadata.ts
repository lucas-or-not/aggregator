import { useQuery } from '@tanstack/react-query'
import { metadataApi } from '../services/api'

export const useFilteredMetadata = (searchQuery?: string, sourceSlug?: string, categorySlug?: string, authorName?: string) => {
  return useQuery({
    queryKey: ['filtered-metadata', searchQuery, sourceSlug, categorySlug, authorName],
    queryFn: async () => {
      const params: any = {}
      if (searchQuery) params.q = searchQuery
      if (sourceSlug) params.source = sourceSlug
      if (categorySlug) params.category = categorySlug
      if (authorName) params.author = authorName
      
      return await metadataApi.getFilteredMetadata(params)
    },
    enabled: !!(searchQuery || sourceSlug || categorySlug || authorName),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useFilteredCategories = (searchQuery?: string, sourceSlug?: string, authorName?: string) => {
  return useQuery({
    queryKey: ['filtered-categories', searchQuery, sourceSlug, authorName],
    queryFn: async () => {
      const params: any = {}
      if (searchQuery) params.q = searchQuery
      if (sourceSlug) params.source = sourceSlug
      if (authorName) params.author = authorName
      
      const response = await metadataApi.getFilteredMetadata(params)
      return response.categories
    },
    enabled: !!(searchQuery || sourceSlug || authorName),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Hook to get filtered authors based on selected source and category
export const useFilteredAuthors = (searchQuery?: string, source?: string, category?: string, author?: string) => {
  const { data, isLoading, error } = useFilteredMetadata(searchQuery, source, category, author)
  
  return {
    authors: data?.authors || [],
    isLoading,
    error,
    validation: data?.validation,
  }
}