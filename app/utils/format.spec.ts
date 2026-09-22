import { describe, expect, it } from 'vitest'
import {
  formatBRL,
  formatBRLExact,
  formatCount,
  formatDuration,
  formatMonthYear,
  formatRating,
} from './format'

/**
 * `Intl` separates the currency symbol from the number with a NON-BREAKING
 * space (U+00A0), not a regular one. `toBe('R$ 140')` typed normally fails with
 * a diff no one can see.
 *
 * Every currency assertion below goes through this, so the tests read in plain
 * spaces and still compare what `Intl` really produced.
 */
const spaces = (value: string) => value.replace(/\u00a0/g, ' ')

describe('formatBRL', () => {
  it('renders cents as whole reais', () => {
    expect(spaces(formatBRL(14000))).toBe('R$ 140')
  })

  it('rounds away the centavos rather than truncating', () => {
    expect(spaces(formatBRL(14090))).toBe('R$ 141')
    expect(spaces(formatBRL(14040))).toBe('R$ 140')
  })

  it('groups thousands with a dot, as pt-BR does', () => {
    expect(spaces(formatBRL(1234500))).toBe('R$ 12.345')
  })

  it('handles zero', () => {
    expect(spaces(formatBRL(0))).toBe('R$ 0')
  })

  it('really does emit a non-breaking space', () => {
    // Pinning the assumption the helper above is built on.
    expect(formatBRL(14000)).toContain('\u00a0')
  })
})

describe('formatBRLExact', () => {
  it('keeps the centavos, unlike formatBRL', () => {
    expect(spaces(formatBRLExact(14050))).toBe('R$ 140,50')
  })

  it('pads a single trailing digit', () => {
    expect(spaces(formatBRLExact(14000))).toBe('R$ 140,00')
  })
})

describe('formatRating', () => {
  it('uses a comma decimal and always one place', () => {
    expect(formatRating(4.8)).toBe('4,8')
    expect(formatRating(5)).toBe('5,0')
    expect(formatRating(0)).toBe('0,0')
  })

  it('rounds to one decimal place', () => {
    expect(formatRating(4.86)).toBe('4,9')
  })
})

describe('formatCount', () => {
  it('groups thousands with a dot', () => {
    expect(formatCount(1841)).toBe('1.841')
    expect(formatCount(520)).toBe('520')
  })
})

describe('formatMonthYear', () => {
  it('renders month and year in pt-BR with a capitalised month', () => {
    // Intl gives "janeiro de 2026"; the function upper-cases the first letter.
    expect(formatMonthYear('2026-01-15T12:00:00Z')).toBe('Janeiro de 2026')
  })

  it('capitalises an accented month correctly', () => {
    expect(formatMonthYear('2026-03-15T12:00:00Z')).toBe('Março de 2026')
  })
})

describe('formatDuration', () => {
  it('shows minutes below an hour', () => {
    expect(formatDuration(45)).toBe('45min')
    expect(formatDuration(30)).toBe('30min')
  })

  it('drops the minutes when the hour is exact', () => {
    // The `rest === 0` branch — the one that regresses into "1h0".
    expect(formatDuration(60)).toBe('1h')
    expect(formatDuration(240)).toBe('4h')
  })

  it('shows hours and minutes together otherwise', () => {
    expect(formatDuration(90)).toBe('1h30')
    expect(formatDuration(185)).toBe('3h5')
  })
})
