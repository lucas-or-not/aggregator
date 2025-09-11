import React from 'react'
import LoadingSpinner from './LoadingSpinner'

interface LoadingStateProps {
  message?: string
}

const LoadingState: React.FC<LoadingStateProps> = ({ message }) => {
  return (
    <div className="py-12 text-center">
      <LoadingSpinner />
      {message && <p className="mt-2 text-gray-500">{message}</p>}
    </div>
  )
}

export default LoadingState


