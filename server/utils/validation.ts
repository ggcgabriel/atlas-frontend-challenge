import { z } from 'zod'
import { PROFESSIONAL_SORTS } from '#shared/types/professional'

/** Query params arrive as strings; coerce, then bound every numeric input. */
export const professionalQuerySchema = z.object({
  q: z.string().trim().min(1).max(80).optional(),
  profession: z.string().trim().max(80).optional(),
  city: z.string().trim().max(120).optional(),
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().min(0).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  sort: z.enum(PROFESSIONAL_SORTS).default('relevance'),
  page: z.coerce.number().int().min(1).default(1),
  // Capped: without a ceiling, `?limit=100000` is a free denial of service.
  limit: z.coerce.number().int().min(1).max(60).default(24),
})

export type ProfessionalQueryInput = z.infer<typeof professionalQuerySchema>
