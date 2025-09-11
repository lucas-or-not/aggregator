import { useQuery } from '@tanstack/react-query'
import { authorsApi, categoriesApi, sourcesApi } from '../services/api'

export const useSources = () =>
  useQuery({ queryKey: ['sources'], queryFn: () => sourcesApi.getSources() })

export const useCategories = () =>
  useQuery({ queryKey: ['categories'], queryFn: () => categoriesApi.getCategories() })

export const useAuthors = () =>
  useQuery({ queryKey: ['authors'], queryFn: () => authorsApi.getAuthors() })


