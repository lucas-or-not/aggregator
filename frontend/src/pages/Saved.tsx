import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { articlesApi } from '../services/api'
// ArticleCard is used by ArticleGrid
import '../components/ArticleCard'
import LoadingState from '../components/LoadingState'
import ErrorState from '../components/ErrorState'
import ArticlesLoadingState from '../components/ArticlesLoadingState'
import ArticleGrid from '../components/ArticleGrid'

const Saved: React.FC = () => {
  const { data: articles, isLoading, error } = useQuery({
    queryKey: ['saved-articles'],
    queryFn: () => articlesApi.getSaved(),
  })

  if (isLoading) return <LoadingState message="Loading saved articles..." />

  if (error) return <ArticlesLoadingState onRefresh={() => window.location.reload()} />

  return (
    <div className="px-4 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Saved Articles</h1>
        <p className="mt-2 text-gray-600">
          Your collection of saved articles
        </p>
      </div>

      {articles?.data && articles.data.length > 0 ? (
        <ArticleGrid articles={articles.data.map((a) => ({ ...a, is_saved: true }))} />
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No saved articles yet.</p>
          <p className="text-gray-400 mt-2">Save articles by clicking the "Save" button on any article.</p>
        </div>
      )}
    </div>
  )
}

export default Saved
