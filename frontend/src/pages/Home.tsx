import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { articlesApi, preferencesApi } from '../services/api'
// ArticleCard is used by ArticleGrid
import '../components/ArticleCard.tsx'
import Pagination from '../components/Pagination'
import ArticleGrid from '../components/ArticleGrid'
import ErrorState from '../components/ErrorState'
import LoadingState from '../components/LoadingState'
import type { PaginatedResponse, Article } from '../types'
import { DEFAULT_PAGE_SIZE } from '../config'
import { CATEGORY_PRESETS } from '../constants'

const Home: React.FC = () => {
  const { user } = useAuth()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [page, setPage] = useState(1)
  const perPage = DEFAULT_PAGE_SIZE

  // Use personalized feed if user is logged in, otherwise use search endpoint with filters
  const { data: articles, isLoading, error } = useQuery<PaginatedResponse<Article>>({
    queryKey: user ? ['feed', page, perPage] : ['search', '', selectedCategory, page, perPage],
    queryFn: () => {
      if (user) {
        return preferencesApi.getFeed({ page, per_page: perPage })
      } else {
        const params = {
          q: '', // Empty search query to get all articles
          ...(selectedCategory !== 'all' ? { category: selectedCategory } : {}),
          page,
          per_page: perPage
        }
        return articlesApi.search(params)
      }
    },
  })

  // Categories could be loaded via hook if needed for dynamic filters

  // Skeletons during loading
  if (isLoading) return <LoadingState message="Loading articles..." />

  if (error) return <ErrorState message="Error loading articles. Please try again later." />

  const categoryButtons = CATEGORY_PRESETS

  return (
    <div className="">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 mb-4">
              {user ? 'Your Personalized Feed' : 'Latest Stories'}
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              {user 
                ? 'Articles tailored to your preferences' 
                : 'Curated news from the world\'s most trusted sources'
              }
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Filters */}
        {!user && (
          <div className="mb-8">
            <div className="flex flex-wrap gap-3 justify-center">
              {categoryButtons.map((category) => (
                <button
                  key={category.id}
                  onClick={() => { setSelectedCategory(category.slug); setPage(1) }}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-colors border ${
                    selectedCategory === category.slug
                      ? 'bg-blue-700 text-white border-blue-700 shadow-sm'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Articles Grid */}
        <ArticleGrid articles={articles?.data || []} />

        {/* Pagination Controls */}
        {articles?.data && articles.total > 0 && (
          <Pagination
            currentPage={articles.current_page}
            lastPage={articles.last_page}
            onPageChange={(p) => setPage(p)}
          />
        )}
      </div>
    </div>
  )
}

export default Home
