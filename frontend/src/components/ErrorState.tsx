import React from 'react'

interface ErrorStateProps {
  message?: string
}

const ErrorState: React.FC<ErrorStateProps> = ({ message = 'Something went wrong. Please try again later.' }) => {
  return (
    <div className="text-center py-12">
      <p className="text-red-600">{message}</p>
    </div>
  )
}

export default ErrorState


