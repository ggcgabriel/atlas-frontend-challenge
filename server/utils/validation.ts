import { z } from 'zod'
import { PROFESSIONAL_SORTS } from '#shared/types/professional'

/** Query params arrive as strings; coerce, then bound every numeric input. */
export const professionalQuerySchema = z.object({
  q: z.string().trim().min(1).max(80).optional(),
  profession: z.string().trim().max(80).optional(),
  category: z.string().trim().max(80).optional(),
  city: z.string().trim().max(120).optional(),
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().min(0).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  // "Atende até N km": the professional travels at least this far.
  minRadiusKm: z.coerce.number().int().min(0).max(500).optional(),
  minExperience: z.coerce.number().int().min(0).max(80).optional(),
  // `?urgentOnly` with no value, `=true` and `=1` all mean true.
  urgentOnly: z.coerce.boolean().optional(),
  verifiedOnly: z.coerce.boolean().optional(),
  freeQuoteOnly: z.coerce.boolean().optional(),
  // The favourites page asks for a specific set. Bounded at the page ceiling so
  // it cannot be used to request the whole table in one call.
  ids: z
    .string()
    .regex(/^\d+(,\d+)*$/, 'ids must be a comma-separated list of integers')
    .transform((value) => value.split(',').map(Number))
    .refine((list) => list.length <= 60, 'at most 60 ids')
    .optional(),
  sort: z.enum(PROFESSIONAL_SORTS).default('relevance'),
  page: z.coerce.number().int().min(1).default(1),
  // Capped: without a ceiling, `?limit=100000` is a free denial of service.
  limit: z.coerce.number().int().min(1).max(60).default(24),
})

export type ProfessionalQueryInput = z.infer<typeof professionalQuerySchema>
