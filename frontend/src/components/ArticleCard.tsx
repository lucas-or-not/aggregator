import React from 'react'
import { Link } from 'react-router-dom'
import type { Article } from '../types'
import { useSaveArticle } from '../hooks/useArticles'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { formatDateShort } from '../utils/date'

interface ArticleCardProps {
  article: Article
  forceSaved?: boolean
  onToggleSave?: (article: Article) => void
  isSaved?: boolean
  canSave?: boolean
}

const ArticleCard: React.FC<ArticleCardProps> = React.memo(({ article, forceSaved, onToggleSave, isSaved, canSave }) => {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [feedback, setFeedback] = React.useState<string | null>(null)

  const { save: saveMutation, unsave: unsaveMutation } = useSaveArticle(article.id)

  const effectiveSaved = typeof isSaved === 'boolean' ? isSaved : (forceSaved ?? article.is_saved)
  const showSaveButton = typeof canSave === 'boolean' ? canSave : Boolean(user)

  const truncate = (value: string, max: number) => (value.length > max ? value.slice(0, max) + '…' : value)

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (onToggleSave) {
      onToggleSave(article)
      return
    }

    const currentlySaved = effectiveSaved
    if (currentlySaved) {
      unsaveMutation.mutate(undefined, {
        onSuccess: () => {
          showToast('success', 'Article Unsaved', 'Article has been removed from your saved list.')
          setFeedback('Removed from your list')
          setTimeout(() => setFeedback(null), 1500)
        },
        onError: () => {
          showToast('error', 'Unsave Failed', 'Failed to unsave the article. Please try again.')
        },
      })
    } else {
      saveMutation.mutate(undefined, {
        onSuccess: () => {
          showToast('success', 'Article Saved', 'Article has been added to your saved list.')
          setFeedback('Saved to your list')
          setTimeout(() => setFeedback(null), 1500)
        },
        onError: (error: any) => {
          const errorMessage = error?.response?.data?.message
          if (errorMessage === 'Article already saved') {
            showToast('info', 'Already Saved', 'This article is already in your saved list.')
            setFeedback('Already saved')
            setTimeout(() => setFeedback(null), 1500)
          } else {
            showToast('error', 'Save Failed', 'Failed to save the article. Please try again.')
          }
        },
      })
    }
  }

  const formatDate = formatDateShort

  return (
    <article className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
      <div className="relative overflow-hidden">
        <div className="w-full h-48 bg-gray-200">
          {article.image_url && (
            <img
              src={article.image_url}
              alt={article.title}
              className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
            />
          )}
        </div>
        {article.category && (
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-violet-600 text-white shadow-sm">
              {article.category.name}
            </span>
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 leading-tight">
          <Link to={`/article/${article.id}`} className="hover:text-blue-700 transition-colors">
            {article.title}
          </Link>
        </h3>

        {article.excerpt && (
          <p className="text-gray-600 mb-4 line-clamp-3 text-sm leading-relaxed">{article.excerpt}</p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            {article.author && (
              <span title={article.author.name}>{truncate(article.author.name, 24)}</span>
            )}
          </div>
          <div className="text-sm text-gray-400 ml-2 whitespace-nowrap">
            {formatDate(article.published_at)}
          </div>

          {showSaveButton && (
            <button
              onClick={handleSave}
              disabled={saveMutation.isPending || unsaveMutation.isPending}
              className={`p-2 rounded-full transition-colors ${
                effectiveSaved
                  ? 'text-red-600 hover:bg-red-50'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              }`}
              title={effectiveSaved ? 'Remove from saved' : 'Save article'}
            >
              <svg className="w-5 h-5" fill={effectiveSaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
          )}
        </div>

        {feedback && (
          <div className="mt-2 text-xs text-gray-500" aria-live="polite">{feedback}</div>
        )}
      </div>
    </article>
  )
})

export default ArticleCard
