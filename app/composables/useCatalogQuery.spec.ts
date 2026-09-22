// @vitest-environment nuxt
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { useCatalogQuery } from './useCatalogQuery'

/**
 * The contract behind shareable filtered URLs.
 *
 * The URL is the source of truth for filter state, so these tests are really
 * about two things: garbage in the query string must never reach the API, and
 * what we write back must stay clean enough to paste into a message.
 */

const { routeQuery, replace, routerStub } = vi.hoisted(() => {
  const replace = vi.fn()
  return {
    routeQuery: { value: {} as Record<string, unknown> },
    replace,
    /**
     * Nuxt's own plugins call `afterEach` and `beforeResolve` on whatever
     * `useRouter()` returns, so a stub with only `replace` crashes the runtime
     * before a single test runs. These no-ops exist purely to satisfy them.
     */
    routerStub: {
      replace,
      push: vi.fn(),
      go: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      afterEach: vi.fn(),
      beforeEach: vi.fn(),
      beforeResolve: vi.fn(),
      onError: vi.fn(),
      isReady: vi.fn(() => Promise.resolve()),
      addRoute: vi.fn(),
      removeRoute: vi.fn(),
      hasRoute: vi.fn(() => false),
      getRoutes: vi.fn(() => []),
      resolve: vi.fn(() => ({ href: '/' })),
    },
  }
})

mockNuxtImport('useRoute', () => () => ({ query: routeQuery.value }) as never)
mockNuxtImport('useRouter', () => () => routerStub as never)

/** The query object handed to `router.replace`. */
const written = () => replace.mock.calls.at(-1)?.[0].query as Record<string, string>

beforeEach(() => {
  routeQuery.value = {}
  replace.mockClear()
})

describe('reading the URL', () => {
  it('passes clean values through', () => {
    routeQuery.value = { q: 'eletricista', city: 'São Paulo', minPrice: '9000' }
    const { query } = useCatalogQuery()
    expect(query.value.q).toBe('eletricista')
    expect(query.value.city).toBe('São Paulo')
    expect(query.value.minPrice).toBe(9000)
  })

  it('drops non-numeric, negative and fractional numbers', () => {
    // A hand-edited ?minPrice=banana should render the catalogue, not 400.
    routeQuery.value = { minPrice: 'banana', maxPrice: '-5', minRadiusKm: '1.5' }
    const { query } = useCatalogQuery()
    expect(query.value.minPrice).toBeUndefined()
    expect(query.value.maxPrice).toBeUndefined()
    expect(query.value.minRadiusKm).toBeUndefined()
  })

  it('accepts only "true" and "1" as true, and never produces false', () => {
    routeQuery.value = { verifiedOnly: 'true', urgentOnly: '1', freeQuoteOnly: 'false' }
    const { query } = useCatalogQuery()
    expect(query.value.verifiedOnly).toBe(true)
    expect(query.value.urgentOnly).toBe(true)
    // `false` would be written back to the URL as noise; undefined is the
    // absence we want.
    expect(query.value.freeQuoteOnly).toBeUndefined()
  })

  it('treats a whitespace-only value as absent', () => {
    routeQuery.value = { q: '   ' }
    expect(useCatalogQuery().query.value.q).toBeUndefined()
  })

  it('takes the first value when a param repeats', () => {
    routeQuery.value = { q: ['primeiro', 'segundo'] }
    expect(useCatalogQuery().query.value.q).toBe('primeiro')
  })

  it('falls back to relevance for an unknown sort', () => {
    routeQuery.value = { sort: 'nao-existe' }
    expect(useCatalogQuery().query.value.sort).toBe('relevance')
  })

  it('keeps a valid sort', () => {
    routeQuery.value = { sort: 'price_asc' }
    expect(useCatalogQuery().query.value.sort).toBe('price_asc')
  })

  it('reports only the filters actually set', () => {
    routeQuery.value = { category: 'Hidráulica', verifiedOnly: 'true' }
    const { activeKeys, hasFilters } = useCatalogQuery()
    expect([...activeKeys.value].sort()).toEqual(['category', 'verifiedOnly'])
    expect(hasFilters.value).toBe(true)
  })

  it('reports no filters when only a sort is present', () => {
    // Sort is not a filter — the chip row must stay empty for it.
    routeQuery.value = { sort: 'price_asc' }
    const { activeKeys, hasFilters } = useCatalogQuery()
    expect(activeKeys.value).toEqual([])
    expect(hasFilters.value).toBe(false)
  })
})

describe('writing the URL', () => {
  it('merges a patch into what is already committed', () => {
    routeQuery.value = { category: 'Hidráulica' }
    useCatalogQuery().commit({ city: 'Recife' })
    expect(written()).toMatchObject({ category: 'Hidráulica', city: 'Recife' })
  })

  it('omits undefined, false and empty string', () => {
    routeQuery.value = { q: 'pintor' }
    useCatalogQuery().commit({ q: undefined, verifiedOnly: false, city: '' })
    const out = written()
    expect(out).not.toHaveProperty('q')
    expect(out).not.toHaveProperty('verifiedOnly')
    expect(out).not.toHaveProperty('city')
  })

  it('never writes sort=relevance, since it is the API default', () => {
    routeQuery.value = {}
    useCatalogQuery().commit({ q: 'pintor' })
    expect(written()).not.toHaveProperty('sort')
  })

  it('does write a non-default sort', () => {
    routeQuery.value = {}
    useCatalogQuery().commit({ sort: 'rating_desc' })
    expect(written().sort).toBe('rating_desc')
  })

  it('stringifies numbers and booleans', () => {
    routeQuery.value = {}
    useCatalogQuery().commit({ minPrice: 9000, verifiedOnly: true })
    expect(written()).toMatchObject({ minPrice: '9000', verifiedOnly: 'true' })
  })

  it('remove() drops exactly one filter', () => {
    routeQuery.value = { category: 'Hidráulica', city: 'Recife' }
    useCatalogQuery().remove('city')
    const out = written()
    expect(out).not.toHaveProperty('city')
    expect(out.category).toBe('Hidráulica')
  })

  it('clearAll() drops every filter but keeps the sort', () => {
    // Clearing is not resetting: the chosen ordering is not a filter, and
    // losing it on "Limpar" is the regression this pins.
    routeQuery.value = {
      category: 'Hidráulica',
      city: 'Recife',
      verifiedOnly: 'true',
      sort: 'price_asc',
    }
    useCatalogQuery().clearAll()
    expect(written()).toEqual({ sort: 'price_asc' })
  })

  it('clearAll() leaves an empty query when the sort is the default', () => {
    routeQuery.value = { category: 'Hidráulica', sort: 'relevance' }
    useCatalogQuery().clearAll()
    expect(written()).toEqual({})
  })
})

describe('draft', () => {
  it('exposes only the panel fields', () => {
    routeQuery.value = { q: 'pintor', minPrice: '9000', verifiedOnly: 'true' }
    const { draft } = useCatalogQuery()
    expect(draft.value.minPrice).toBe(9000)
    expect(draft.value.verifiedOnly).toBe(true)
    // `q` belongs to the search dialog, not the filter panel.
    expect(draft.value).not.toHaveProperty('q')
  })
})
