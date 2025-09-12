import { describe, it, expect } from 'vitest'
import api from '../api'
import { http, HttpResponse } from 'msw'
import { server } from '../../test/testServer'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

describe('401 handling', () => {
  it('removes auth_token from localStorage on 401', async () => {
    localStorage.setItem('auth_token', 'abc')
    server.use(
      http.get(`${API}/user`, () => HttpResponse.json({ message: 'unauthorized' }, { status: 401 }))
    )

    await expect(api.get('/user')).rejects.toBeTruthy()
    expect(localStorage.getItem('auth_token')).toBeNull()
  })
})


