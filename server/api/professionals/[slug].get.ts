import { asc, desc, eq } from 'drizzle-orm'
import { z } from 'zod'
import {
  professionals,
  professions,
  reviews,
  services,
} from '~~/server/database/schema'
import type { ProfessionalDetail } from '#shared/types/professional'

const paramsSchema = z.object({
  slug: z.string().trim().min(1).max(140),
})

export default defineEventHandler(async (event): Promise<ProfessionalDetail> => {
  const { slug } = await getValidatedRouterParams(event, (p) =>
    paramsSchema.parse(p),
  )
  const db = useDatabase()

  const [professional] = await db
    .select({
      id: professionals.id,
      slug: professionals.slug,
      name: professionals.name,
      avatarUrl: professionals.avatarUrl,
      profession: professions.name,
      professionSlug: professions.slug,
      hourlyRateCents: professionals.hourlyRateCents,
      rating: professionals.rating,
      reviewsCount: professionals.reviewsCount,
      city: professionals.city,
      state: professionals.state,
      isAvailable: professionals.isAvailable,
      bio: professionals.bio,
      lat: professionals.lat,
      lng: professionals.lng,
      createdAt: professionals.createdAt,
    })
    .from(professionals)
    .innerJoin(professions, eq(professions.id, professionals.professionId))
    .where(eq(professionals.slug, slug))
    .limit(1)

  if (!professional) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Professional not found',
    })
  }

  // Two small indexed lookups in parallel rather than one row-multiplying join.
  const [professionalServices, professionalReviews] = await Promise.all([
    db
      .select({
        id: services.id,
        title: services.title,
        priceCents: services.priceCents,
        durationMinutes: services.durationMinutes,
      })
      .from(services)
      .where(eq(services.professionalId, professional.id))
      .orderBy(asc(services.priceCents)),
    db
      .select({
        id: reviews.id,
        authorName: reviews.authorName,
        rating: reviews.rating,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
      })
      .from(reviews)
      .where(eq(reviews.professionalId, professional.id))
      .orderBy(desc(reviews.createdAt)),
  ])

  return {
    ...professional,
    rating: Number(professional.rating),
    createdAt: professional.createdAt.toISOString(),
    services: professionalServices,
    reviews: professionalReviews.map((review) => ({
      ...review,
      createdAt: review.createdAt.toISOString(),
    })),
  }
})
