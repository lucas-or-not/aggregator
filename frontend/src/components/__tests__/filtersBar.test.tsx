import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import FiltersBar from '../FiltersBar'

describe('FiltersBar', () => {
  it('calls onQueryChange on input', () => {
    const onQueryChange = vi.fn()
    const onFilterChange = vi.fn()
    const { getByPlaceholderText } = render(
      <FiltersBar
        query=""
        onQueryChange={onQueryChange}
        filters={{ source: '', category: '', author: '', date_from: '', date_to: '' }}
        onFilterChange={onFilterChange}
        sourceOptions={[]}
        categoryOptions={[]}
        authorOptions={[]}
      />
    )
    fireEvent.change(getByPlaceholderText('Search articles...'), { target: { value: 'he' } })
    expect(onQueryChange).toHaveBeenCalledWith('he')
  })
})


