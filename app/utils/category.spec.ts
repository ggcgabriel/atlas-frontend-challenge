import { describe, expect, it } from 'vitest'
import { categoryColor, categoryIcon } from './category'

/** The exact strings the seed writes — see server/database/catalog-data.ts. */
const CATEGORIES = [
  'Elétrica e Climatização',
  'Hidráulica',
  'Alvenaria e Acabamento',
  'Marcenaria e Esquadrias',
  'Segurança e Áreas Externas',
]

describe('categoryIcon', () => {
  it('maps every seeded category to a distinct icon', () => {
    const icons = CATEGORIES.map(categoryIcon)
    expect(icons.every(Boolean)).toBe(true)
    expect(new Set(icons).size).toBe(CATEGORIES.length)
  })

  it('falls back instead of returning undefined for an unknown category', () => {
    // The point of the fallback: a category added to the seed later must never
    // render an empty box in the chip row.
    const fallback = categoryIcon('Categoria Que Não Existe')
    expect(fallback).toBeTruthy()
    expect(CATEGORIES.map(categoryIcon)).not.toContain(fallback)
  })

  it('is exact, not fuzzy, about the key', () => {
    // Accents and case are part of the key; a near-miss must take the fallback
    // rather than silently matching.
    expect(categoryIcon('hidráulica')).toBe(categoryIcon('qualquer coisa'))
    expect(categoryIcon('Hidraulica')).toBe(categoryIcon('qualquer coisa'))
  })
})

describe('categoryColor', () => {
  it('maps every seeded category to a distinct colour', () => {
    const colors = CATEGORIES.map(categoryColor)
    expect(new Set(colors).size).toBe(CATEGORIES.length)
    for (const color of colors) expect(color).toMatch(/^#[0-9a-f]{6}$/i)
  })

  it('falls back to a neutral grey for an unknown category', () => {
    const fallback = categoryColor('Categoria Que Não Existe')
    expect(fallback).toMatch(/^#[0-9a-f]{6}$/i)
    expect(CATEGORIES.map(categoryColor)).not.toContain(fallback)
  })
})
