import React from 'react'
import LoadingSpinner from './LoadingSpinner'

interface LoadingStateProps {
  message?: string
  variant?: 'grid' | 'home'
  count?: number
}

const renderGridSkeleton = (count: number) => (
  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="h-48 w-full bg-gray-200 animate-pulse" />
        <div className="p-6 space-y-3">
          <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
          <div className="h-6 w-full bg-gray-200 rounded animate-pulse" />
          <div className="h-6 w-2/3 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    ))}
  </div>
)

const LoadingState: React.FC<LoadingStateProps> = ({ message, variant, count = 6 }) => {
  if (variant === 'home') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center mb-8">
          <div className="h-10 w-72 mx-auto bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-5 w-96 mx-auto mt-4 bg-gray-200 rounded-lg animate-pulse" />
        </div>
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-9 w-28 bg-gray-200 rounded-full animate-pulse" />
          ))}
        </div>
        {renderGridSkeleton(count)}
      </div>
    )
  }

  if (variant === 'grid') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderGridSkeleton(count)}
      </div>
    )
  }

  return (
    <div className="py-12 text-center">
      <LoadingSpinner />
      {message && <p className="mt-2 text-gray-500">{message}</p>}
    </div>
  )
}

export default LoadingState


