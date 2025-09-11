export interface ApiErrorShape {
  status: number | null
  code?: string
  message: string
  details?: unknown
}

export const parseApiError = (err: unknown): ApiErrorShape => {
  const fallback: ApiErrorShape = { status: null, message: 'Unexpected error' }
  if (!err || typeof err !== 'object') return fallback

  const anyErr = err as any
  const response = anyErr?.response
  if (response) {
    const status: number = response.status
    const data = response.data || {}
    const code: string | undefined = data.code
    const message: string = data.message || data.error || anyErr.message || 'Request failed'
    return { status, code, message, details: data }
  }

  const message: string = anyErr?.message || 'Network error'
  return { ...fallback, message }
}

