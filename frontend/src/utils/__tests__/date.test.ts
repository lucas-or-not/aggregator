import { describe, it, expect } from 'vitest'
import { formatDateShort, formatDateLong } from '../date'

describe('date utils', () => {
  it('formats short date', () => {
    const s = formatDateShort('2025-01-05')
    expect(s).toContain('2025')
    // en-US short month
    expect(/Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/.test(s)).toBe(true)
  })

  it('formats long date', () => {
    const s = formatDateLong('2025-01-05')
    expect(s).toContain('2025')
    expect(s).toContain('January')
  })
})


