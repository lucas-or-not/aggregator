import { describe, it, expect } from 'vitest'
import { sourcesApi, authorsApi, categoriesApi, articlesApi } from '../api'

describe('API envelope unwrapping', () => {
  it('unwraps taxonomy arrays', async () => {
    const sources = await sourcesApi.getSources()
    const categories = await categoriesApi.getCategories()
    const authors = await authorsApi.getAuthors()
    expect(Array.isArray(sources)).toBe(true)
    expect(Array.isArray(categories)).toBe(true)
    expect(Array.isArray(authors)).toBe(true)
  })

  it('unwraps article payload', async () => {
    const res = await articlesApi.getArticle(1)
    expect(res.article.id).toBe(1)
    expect(typeof res.is_saved).toBe('boolean')
  })
})


