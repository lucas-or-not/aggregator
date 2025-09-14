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
    
    // Handle Laravel validation errors (422 status with errors object)
    if (status === 422 && data.errors) {
      const errors = data.errors
      // Get the first error message from the first field
      const firstField = Object.keys(errors)[0]
      const firstError = errors[firstField]?.[0]
      const message = firstError || data.message || 'Validation failed'
      return { status, code, message, details: data }
    }
    
    const message: string = data.message || data.error || anyErr.message || 'Request failed'
    return { status, code, message, details: data }
  }

  const message: string = anyErr?.message || 'Network error'
  return { ...fallback, message }
}

