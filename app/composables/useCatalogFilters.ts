import type { CatalogFilters } from '#shared/types/professional'

/**
 * The filter options (professions, categories, cities, price range).
 *
 * The explicit `key` matters: every caller shares one request and one payload
 * instead of refetching. The endpoint already sends
 * `Cache-Control: public, max-age=60, stale-while-revalidate=300`.
 */
export function useCatalogFilters() {
  return useFetch<CatalogFilters>('/api/filters', {
    key: 'catalog-filters',
    default: () => ({
      professions: [],
      categories: [],
      cities: [],
      priceRange: { minCents: 0, maxCents: 0 },
    }),
  })
}
