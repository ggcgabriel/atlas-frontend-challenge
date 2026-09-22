import type {
  ProfessionalQuery,
  ProfessionalSort,
} from '#shared/types/professional'
import { PROFESSIONAL_SORTS } from '#shared/types/professional'

export interface CatalogDraft {
  minPrice?: number
  maxPrice?: number
  minRadiusKm?: number
  minExperience?: number
  verifiedOnly?: boolean
  urgentOnly?: boolean
  freeQuoteOnly?: boolean
}

export const FILTER_KEYS = [
  'q',
  'profession',
  'category',
  'city',
  'minPrice',
  'maxPrice',
  'minRadiusKm',
  'minExperience',
  'verifiedOnly',
  'urgentOnly',
  'freeQuoteOnly',
] as const

export type CatalogFilterKey = (typeof FILTER_KEYS)[number]

type QueryValue = string | number | boolean | undefined

function readString(value: unknown): string | undefined {
  const first = Array.isArray(value) ? value[0] : value
  if (typeof first !== 'string') return undefined
  const trimmed = first.trim()
  return trimmed.length ? trimmed : undefined
}

function readInt(value: unknown): number | undefined {
  const raw = readString(value)
  if (raw === undefined) return undefined
  const parsed = Number(raw)
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : undefined
}

function readBool(value: unknown): boolean | undefined {
  const raw = readString(value)
  if (raw === undefined) return undefined
  return raw === 'true' || raw === '1' ? true : undefined
}

function readSort(value: unknown): ProfessionalSort | undefined {
  const raw = readString(value)
  return PROFESSIONAL_SORTS.includes(raw as ProfessionalSort)
    ? (raw as ProfessionalSort)
    : undefined
}

export function useCatalogQuery() {
  const route = useRoute()
  const router = useRouter()

  const query = computed<ProfessionalQuery>(() => {
    const q = route.query
    return {
      q: readString(q.q),
      profession: readString(q.profession),
      category: readString(q.category),
      city: readString(q.city),
      minPrice: readInt(q.minPrice),
      maxPrice: readInt(q.maxPrice),
      minRadiusKm: readInt(q.minRadiusKm),
      minExperience: readInt(q.minExperience),
      verifiedOnly: readBool(q.verifiedOnly),
      urgentOnly: readBool(q.urgentOnly),
      freeQuoteOnly: readBool(q.freeQuoteOnly),
      sort: readSort(q.sort) ?? 'relevance',
    }
  })

  /** Just the panel's fields, for seeding the draft. */
  const draft = computed<CatalogDraft>(() => ({
    minPrice: query.value.minPrice,
    maxPrice: query.value.maxPrice,
    minRadiusKm: query.value.minRadiusKm,
    minExperience: query.value.minExperience,
    verifiedOnly: query.value.verifiedOnly,
    urgentOnly: query.value.urgentOnly,
    freeQuoteOnly: query.value.freeQuoteOnly,
  }))

  const activeKeys = computed(() =>
    FILTER_KEYS.filter((key) => query.value[key] !== undefined),
  )

  const hasFilters = computed(() => activeKeys.value.length > 0)

  function write(next: Record<string, QueryValue>) {
    const cleaned: Record<string, string> = {}
    for (const [key, value] of Object.entries(next)) {
      // `undefined`, `false` and `''` all mean "not filtering by this", and an
      // empty param in a shared URL is noise.
      if (value === undefined || value === false || value === '') continue
      cleaned[key] = String(value)
    }
    // 'relevance' is the API default; spelling it out in the URL adds nothing.
    if (cleaned.sort === 'relevance') delete cleaned.sort

    return router.replace({ query: cleaned })
  }

  /** Merge a patch into the committed query. */
  function commit(patch: Partial<ProfessionalQuery>) {
    return write({ ...query.value, ...patch })
  }

  function remove(key: CatalogFilterKey) {
    return commit({ [key]: undefined })
  }

  /** Drops every filter but keeps the chosen sort — clearing is not resetting. */
  function clearAll() {
    return write({ sort: query.value.sort })
  }

  return { query, draft, activeKeys, hasFilters, commit, remove, clearAll }
}
