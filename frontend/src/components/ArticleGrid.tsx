import React from 'react'
import type { Article } from '../types'
import ArticleCard from './ArticleCard.tsx'

interface ArticleGridProps {
  articles: Article[]
  emptyMessage?: string | React.ReactNode
}

const ArticleGrid: React.FC<ArticleGridProps> = ({ articles, emptyMessage = 'No articles found.' }) => {
  if (!articles || articles.length === 0) {
    return (
      <div className="text-center py-12">
        {typeof emptyMessage === 'string' ? (
          <p className="text-gray-500">{emptyMessage}</p>
        ) : (
          emptyMessage
        )}
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  )
}

export default ArticleGrid


