import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import Pagination from '../Pagination'

describe('Pagination', () => {
  it('disables prev on first page and next on last page', () => {
    const onPageChange = vi.fn()
    const { getByText } = render(
      <Pagination currentPage={1} lastPage={1} onPageChange={onPageChange} />
    )
    expect(getByText('Previous')).toBeDisabled()
    expect(getByText('Next')).toBeDisabled()
  })

  it('calls onPageChange when clicking next/prev', () => {
    const onPageChange = vi.fn()
    const { getByText } = render(
      <Pagination currentPage={2} lastPage={3} onPageChange={onPageChange} />
    )
    fireEvent.click(getByText('Previous'))
    fireEvent.click(getByText('Next'))
    expect(onPageChange).toHaveBeenCalledWith(1)
    expect(onPageChange).toHaveBeenCalledWith(3)
  })
})


