import type { CatalogFilters } from '#shared/types/professional'

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
