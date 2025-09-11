import React from 'react'
import SearchableSelect from './SearchableSelect'
import DateRangePicker from './DateRangePicker'

interface OptionLike {
  value: string
  label: string
}

interface FiltersBarProps {
  query: string
  onQueryChange: (value: string) => void
  filters: {
    source: string
    category: string
    author: string
    date_from: string
    date_to: string
  }
  onFilterChange: (key: keyof FiltersBarProps['filters'], value: string) => void
  sourceOptions: OptionLike[]
  categoryOptions: OptionLike[]
  authorOptions: OptionLike[]
}

const FiltersBar: React.FC<FiltersBarProps> = ({
  query,
  onQueryChange,
  filters,
  onFilterChange,
  sourceOptions,
  categoryOptions,
  authorOptions,
}) => {
  return (
    <div className="mb-8">
      <div className="mb-6">
        <div className="flex gap-4">
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search articles..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SearchableSelect
          label="Source"
          options={[{ value: '', label: 'All Sources' }, ...sourceOptions]}
          value={filters.source}
          onChange={(value) => onFilterChange('source', value)}
          placeholder="All Sources"
        />

        <SearchableSelect
          label="Category"
          options={[{ value: '', label: 'All Categories' }, ...categoryOptions]}
          value={filters.category}
          onChange={(value) => onFilterChange('category', value)}
          placeholder="All Categories"
        />

        <SearchableSelect
          label="Author"
          options={[{ value: '', label: 'All Authors' }, ...authorOptions]}
          value={filters.author}
          onChange={(value) => onFilterChange('author', value)}
          placeholder="All Authors"
        />

        <DateRangePicker
          label="Date Range"
          startDate={filters.date_from}
          endDate={filters.date_to}
          onStartDateChange={(date) => onFilterChange('date_from', date)}
          onEndDateChange={(date) => onFilterChange('date_to', date)}
        />
      </div>
    </div>
  )
}

export default FiltersBar


