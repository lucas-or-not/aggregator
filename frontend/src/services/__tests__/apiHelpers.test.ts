import { describe, it, expect, vi, beforeEach } from 'vitest'
import api from '../api'

describe('api helpers basics', () => {
  beforeEach(() => {
    // Clear storage and interceptors side effects
    localStorage.clear()
  })

  it('returns response.data for GET', async () => {
    const resp = await api.get('/sources')
    expect(resp.status).toBe(200)
  })
})


