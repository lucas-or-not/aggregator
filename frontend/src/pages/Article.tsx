import React from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { articlesApi } from '../services/api'
import type { Article as ArticleType } from '../types'
import LoadingState from '../components/LoadingState'
import ErrorState from '../components/ErrorState'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { useSaveArticle } from '../hooks/useArticles'
import { formatDateLong } from '../utils/date'

const Article: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { showToast } = useToast()

  const { data, isLoading, error } = useQuery<{ article: ArticleType; is_saved: boolean }>({
    queryKey: ['article', id],
    queryFn: () => articlesApi.getArticle(Number(id)),
  })

  const { save: saveMutation, unsave: unsaveMutation } = useSaveArticle(Number(id))

  const handleSave = () => {
    if (data?.is_saved) {
      unsaveMutation.mutate(undefined, {
        onSuccess: () => {
          showToast('success', 'Article Unsaved', 'Article has been removed from your saved list.')
        },
        onError: () => {
          showToast('error', 'Unsave Failed', 'Failed to unsave the article. Please try again.')
        },
      })
    } else {
      saveMutation.mutate(undefined, {
        onSuccess: () => {
          showToast('success', 'Article Saved', 'Article has been added to your saved list.')
        },
        onError: (error: any) => {
          const errorMessage = error?.response?.data?.message
          if (errorMessage === 'Article already saved') {
            showToast('info', 'Already Saved', 'This article is already in your saved list.')
          } else {
            showToast('error', 'Save Failed', 'Failed to save the article. Please try again.')
          }
        },
      })
    }
  }

  if (isLoading) return <LoadingState message="Loading article..." />

  if (error || !data) return <ErrorState message="Article not found." />

  const { article } = data

  const formatDate = formatDateLong

  return (
    <div className="max-w-4xl mx-auto">
      <article className="bg-white shadow-lg rounded-lg overflow-hidden">
        {article.image_url && (
          <div className="aspect-w-16 aspect-h-9">
            <img
              src={article.image_url}
              alt={article.title}
              className="w-full h-64 md:h-96 object-cover"
            />
          </div>
        )}
        
        <div className="p-6 md:p-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>{article.source.name}</span>
              <span>•</span>
              <span>{formatDate(article.published_at)}</span>
              {article.author && (
                <>
                  <span>•</span>
                  <span>By {article.author.name}</span>
                </>
              )}
            </div>
            
            {user && (
              <button
                onClick={handleSave}
                disabled={saveMutation.isPending || unsaveMutation.isPending}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  article.is_saved
                    ? 'bg-red-100 text-red-800 hover:bg-red-200'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {article.is_saved ? 'Saved' : 'Save Article'}
              </button>
            )}
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {article.title}
          </h1>
          
          {article.excerpt && (
            <p className="text-xl text-gray-600 mb-6 leading-relaxed">
              {article.excerpt}
            </p>
          )}
          
          <div className="prose prose-lg max-w-none">
            <div dangerouslySetInnerHTML={{ __html: article.content }} />
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              Read original article
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </article>
    </div>
  )
}

export default Article
