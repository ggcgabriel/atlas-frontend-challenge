import { describe, expect, it } from 'vitest'
import { initialsOf, tintFor } from './avatar'

describe('initialsOf', () => {
  it('takes the first and LAST word, not the first two', () => {
    // The distinction that matters: a three-part name must not read "MS".
    expect(initialsOf('Marina Silva Carvalho')).toBe('MC')
    expect(initialsOf('Marina Carvalho')).toBe('MC')
  })

  it('returns a single letter for a single word', () => {
    expect(initialsOf('Marina')).toBe('M')
  })

  it('falls back to "?" when there is no name', () => {
    // Avoids rendering an empty tile, which reads as a broken image.
    expect(initialsOf('')).toBe('?')
    expect(initialsOf('   ')).toBe('?')
    expect(initialsOf('\n\t')).toBe('?')
  })

  it('collapses stray whitespace instead of counting it as words', () => {
    expect(initialsOf('  Marina   Carvalho  ')).toBe('MC')
  })

  it('upper-cases accented letters under pt-BR', () => {
    expect(initialsOf('Ígor Souza')).toBe('ÍS')
    expect(initialsOf('ângela ândrade')).toBe('ÂÂ')
  })
})

describe('tintFor', () => {
  it('is deterministic for a given id', () => {
    // Same professional, same colour on every render and every machine.
    expect(tintFor(7)).toEqual(tintFor(7))
  })

  it('cycles through the four tints', () => {
    const cycle = [0, 1, 2, 3].map((id) => tintFor(id).background)
    expect(new Set(cycle).size).toBe(4)
    expect(tintFor(4)).toEqual(tintFor(0))
    expect(tintFor(9)).toEqual(tintFor(1))
  })

  it('survives a negative id', () => {
    // tintFor asserts non-null on the lookup; that is only safe because the
    // modulo can never go out of range, which Math.abs is what guarantees.
    expect(tintFor(-1)).toEqual(tintFor(1))
    expect(tintFor(-4)).toEqual(tintFor(0))
  })

  it('always returns both a background and a text colour', () => {
    for (const id of [0, 1, 2, 3, 17, -6]) {
      const tint = tintFor(id)
      expect(tint.background).toBeTruthy()
      expect(tint.text).toBeTruthy()
    }
  })
})
