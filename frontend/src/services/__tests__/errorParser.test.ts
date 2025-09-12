import { describe, it, expect } from 'vitest'
import { parseApiError } from '../apiError'

describe('parseApiError', () => {
  it('parses axios error response', () => {
    const err = { response: { status: 400, data: { code: 'BAD', message: 'Oops' } } }
    const r = parseApiError(err)
    expect(r.status).toBe(400)
    expect(r.code).toBe('BAD')
    expect(r.message).toBe('Oops')
  })

  it('handles network error', () => {
    const err = { message: 'Network Error' }
    const r = parseApiError(err)
    expect(r.status).toBeNull()
    expect(r.message).toContain('Network')
  })
})


