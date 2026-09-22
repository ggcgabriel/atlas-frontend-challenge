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
  /** pt-BR plural, for the listing headline ("Pedreiros perto de você"). */
  namePlural: string
  category: string
}

/** Every avatar is produced by the image pipeline at this exact size. */
export const AVATAR_SIZE = 400

/** The shape a catalog card needs — deliberately narrower than the detail. */
export interface ProfessionalListItem {
  id: number
  slug: string
  name: string
  /** Empty when the professional has no photo — the UI renders initials. */
  avatarUrl: string
  /** Inline 16px WebP data URI, shown until the real avatar decodes. */
  avatarLqip: string
  profession: string
  professionSlug: string
  professionCategory: string
  hourlyRateCents: number
  rating: number
  reviewsCount: number
  city: string
  state: string
  experienceYears: number
  /** 2-3 of the profession's specialties, as chips on the card. */
  specialties: string[]
  serviceRadiusKm: number
  acceptsUrgent: boolean
  isVerified: boolean
  freeQuote: boolean
  /** Months of warranty on finished work; 0 means none advertised. */
  warrantyMonths: number
  isAvailable: boolean
}

export interface PortfolioImage {
  id: number
  url: string
  alt: string
  width: number
  height: number
  lqip: string
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

/** The four criteria the profile breaks the overall score down by. */
export interface RatingBreakdown {
  punctuality: number
  finish: number
  cleanliness: number
  value: number
}

export interface ProfessionalDetail extends ProfessionalListItem {
  bio: string
  lat: number
  lng: number
  createdAt: string
  /** Typical first reply, in hours. */
  responseTimeHours: number
  /** avg() over this professional's reviews. All zeros when there are none. */
  ratingBreakdown: RatingBreakdown
  services: ProfessionalService[]
  reviews: ProfessionalReview[]
  /** Empty until Stage 6 — the table exists, the photo source does not yet. */
  portfolio: PortfolioImage[]
}

export interface ProfessionalQuery {
  q?: string
  profession?: string
  category?: string
  city?: string
  minPrice?: number
  maxPrice?: number
  minRating?: number
  /** Travels at least this far — the sidebar's "raio de atendimento". */
  minRadiusKm?: number
  minExperience?: number
  urgentOnly?: boolean
  verifiedOnly?: boolean
  freeQuoteOnly?: boolean
  /** Comma-separated ids, for the favourites page. */
  ids?: string
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
  /** Distinct `profession.category` values, for the top-level filter chips. */
  categories: string[]
  cities: string[]
  priceRange: { minCents: number; maxCents: number }
}
