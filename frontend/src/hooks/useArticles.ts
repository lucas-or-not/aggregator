import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { articlesApi } from '../services/api'

export interface ArticleSearchFilters {
  source?: string
  category?: string
  author?: string
  date_from?: string
  date_to?: string
}

export const useArticlesSearch = (
  q: string,
  filters: ArticleSearchFilters,
  page: number,
  perPage: number
) => {
  return useQuery({
    queryKey: ['search', q, filters, page, perPage],
    queryFn: () =>
      articlesApi.search({
        q,
        ...filters,
        page,
        per_page: perPage,
      }),
    enabled: q.length >= 2 || Object.values(filters).some((v) => v !== ''),
  })
}

export const useSaveArticle = (articleId: number) => {
  const queryClient = useQueryClient()

  const save = useMutation({
    mutationFn: () => articlesApi.save(articleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['article', String(articleId)] })
      queryClient.invalidateQueries({ queryKey: ['saved-articles'] })
    },
  })

  const unsave = useMutation({
    mutationFn: () => articlesApi.unsave(articleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['article', String(articleId)] })
      queryClient.invalidateQueries({ queryKey: ['saved-articles'] })
    },
  })

  return { save, unsave }
}


