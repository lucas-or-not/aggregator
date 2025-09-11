import React from 'react'

interface PaginationProps {
  currentPage: number
  lastPage: number
  onPageChange: (page: number) => void
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, lastPage, onPageChange }) => {
  return (
    <div className="mt-10 flex items-center justify-center gap-4">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage <= 1}
        className={`px-4 py-2 rounded-md border text-sm ${
          currentPage <= 1
            ? 'text-gray-400 border-gray-200 cursor-not-allowed'
            : 'text-gray-700 border-gray-300 hover:bg-gray-50'
        }`}
      >
        Previous
      </button>
      <span className="text-sm text-gray-600">
        Page {currentPage} of {lastPage}
      </span>
      <button
        onClick={() => onPageChange(Math.min(lastPage, currentPage + 1))}
        disabled={currentPage >= lastPage}
        className={`px-4 py-2 rounded-md border text-sm ${
          currentPage >= lastPage
            ? 'text-gray-400 border-gray-200 cursor-not-allowed'
            : 'text-gray-700 border-gray-300 hover:bg-gray-50'
        }`}
      >
        Next
      </button>
    </div>
  )
}

export default Pagination


