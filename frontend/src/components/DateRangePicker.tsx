import React, { useState, useRef, useEffect } from 'react'
import { CalendarIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface DateRangePickerProps {
  startDate: string
  endDate: string
  onStartDateChange: (date: string) => void
  onEndDateChange: (date: string) => void
  label?: string
  className?: string
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  label,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const formatDisplayDate = (date: string) => {
    if (!date) return ''
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getDisplayText = () => {
    if (startDate && endDate) {
      return `${formatDisplayDate(startDate)} - ${formatDisplayDate(endDate)}`
    } else if (startDate) {
      return `From ${formatDisplayDate(startDate)}`
    } else if (endDate) {
      return `Until ${formatDisplayDate(endDate)}`
    }
    return 'Select date range'
  }

  const clearDates = () => {
    onStartDateChange('')
    onEndDateChange('')
  }

  const setQuickRange = (days: number) => {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - days)
    
    onStartDateChange(start.toISOString().split('T')[0])
    onEndDateChange(end.toISOString().split('T')[0])
    setIsOpen(false)
  }

  const quickRanges = [
    { label: 'Last 7 days', days: 7 },
    { label: 'Last 30 days', days: 30 },
    { label: 'Last 90 days', days: 90 },
    { label: 'Last year', days: 365 }
  ]

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-left flex items-center justify-between"
      >
        <div className="flex items-center">
          <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
          <span className={startDate || endDate ? 'text-gray-900' : 'text-gray-500'}>
            {getDisplayText()}
          </span>
        </div>
        {(startDate || endDate) && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              clearDates()
            }}
            className="ml-2 p-1 hover:bg-gray-100 rounded"
          >
            <XMarkIcon className="h-3 w-3 text-gray-400" />
          </button>
        )}
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          <div className="p-4">
            {/* Quick Range Buttons */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Select</h4>
              <div className="grid grid-cols-2 gap-2">
                {quickRanges.map((range) => (
                  <button
                    key={range.days}
                    type="button"
                    onClick={() => setQuickRange(range.days)}
                    className="px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-md text-gray-700 transition-colors"
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Date Inputs */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Custom Range</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => onStartDateChange(e.target.value)}
                    max={endDate || undefined}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => onEndDateChange(e.target.value)}
                    min={startDate || undefined}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between mt-4 pt-3 border-t">
              <button
                type="button"
                onClick={clearDates}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DateRangePicker