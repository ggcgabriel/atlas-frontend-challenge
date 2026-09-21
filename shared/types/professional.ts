/**
 * The API contract between the Nitro handlers (`server/`) and the UI (`app/`).
 *
 * Nuxt auto-imports everything under `shared/` on both sides, so the listing
 * page and the endpoint that feeds it cannot drift apart without a type error.
 *
 * Money is always an integer number of cents — never a float.
 */

/** Single source of truth: the zod enum and the UI's sort select both read this. */
export const PROFESSIONAL_SORTS = [
  'relevance',
  'price_asc',
  'price_desc',
  'rating_desc',
  'recent',
] as const

export type ProfessionalSort = (typeof PROFESSIONAL_SORTS)[number]

export interface Profession {
  id: number
  slug: string
  name: string
  category: string
}

/** The shape a catalog card needs — deliberately narrower than the detail. */
export interface ProfessionalListItem {
  id: number
  slug: string
  name: string
  avatarUrl: string
  profession: string
  professionSlug: string
  hourlyRateCents: number
  rating: number
  reviewsCount: number
  city: string
  state: string
  isAvailable: boolean
}

export interface ProfessionalService {
  id: number
  title: string
  priceCents: number
  durationMinutes: number
}

export interface ProfessionalReview {
  id: number
  authorName: string
  rating: number
  comment: string
  createdAt: string
}

export interface ProfessionalDetail extends ProfessionalListItem {
  bio: string
  lat: number
  lng: number
  createdAt: string
  services: ProfessionalService[]
  reviews: ProfessionalReview[]
}

export interface ProfessionalQuery {
  q?: string
  profession?: string
  city?: string
  minPrice?: number
  maxPrice?: number
  minRating?: number
  sort?: ProfessionalSort
  page?: number
  limit?: number
}

export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export type ProfessionalListResponse = Paginated<ProfessionalListItem>

export interface CatalogFilters {
  professions: Profession[]
  cities: string[]
  priceRange: { minCents: number; maxCents: number }
}
