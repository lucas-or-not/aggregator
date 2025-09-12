import React from 'react'
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import LoadingState from '../LoadingState'
import ErrorState from '../ErrorState'

describe('LoadingState and ErrorState', () => {
  it('renders spinner fallback with message', () => {
    const { getByText } = render(<LoadingState message="Loading..." />)
    expect(getByText('Loading...')).toBeInTheDocument()
  })

  it('renders home skeleton variant', () => {
    const { container } = render(<LoadingState variant="home" />)
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
  })

  it('renders grid skeleton variant', () => {
    const { container } = render(<LoadingState variant="grid" />)
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
  })

  it('renders ErrorState with message', () => {
    const { getByText } = render(<ErrorState message="Oops" />)
    expect(getByText('Oops')).toBeInTheDocument()
  })
})


