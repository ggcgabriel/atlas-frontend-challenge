import { asc, avg, desc, eq } from 'drizzle-orm'
import { z } from 'zod'
import {
  portfolioImages,
  professionals,
  professions,
  reviews,
  services,
} from '~~/server/database/schema'
import type { ProfessionalDetail } from '#shared/types/professional'

const paramsSchema = z.object({
  slug: z.string().trim().min(1).max(140),
})

export default defineEventHandler(
  async (event): Promise<ProfessionalDetail> => {
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
        avatarLqip: professionals.avatarLqip,
        profession: professions.name,
        professionSlug: professions.slug,
        professionCategory: professions.category,
        hourlyRateCents: professionals.hourlyRateCents,
        rating: professionals.rating,
        reviewsCount: professionals.reviewsCount,
        city: professionals.city,
        state: professionals.state,
        experienceYears: professionals.experienceYears,
        specialties: professionals.specialties,
        serviceRadiusKm: professionals.serviceRadiusKm,
        acceptsUrgent: professionals.acceptsUrgent,
        isVerified: professionals.isVerified,
        freeQuote: professionals.freeQuote,
        warrantyMonths: professionals.warrantyMonths,
        responseTimeHours: professionals.responseTimeHours,
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

    // Small indexed lookups in parallel rather than one row-multiplying join.
    const [professionalServices, professionalReviews, portfolio, [breakdown]] =
      await Promise.all([
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
        db
          .select({
            id: portfolioImages.id,
            url: portfolioImages.url,
            alt: portfolioImages.alt,
            width: portfolioImages.width,
            height: portfolioImages.height,
            lqip: portfolioImages.lqip,
          })
          .from(portfolioImages)
          .where(eq(portfolioImages.professionalId, professional.id))
          .orderBy(asc(portfolioImages.position)),
        // The profile's four bars are a real aggregate over the review rows, not a
        // number derived from the overall rating at render time.
        db
          .select({
            punctuality: avg(reviews.ratingPunctuality),
            finish: avg(reviews.ratingFinish),
            cleanliness: avg(reviews.ratingCleanliness),
            value: avg(reviews.ratingValue),
          })
          .from(reviews)
          .where(eq(reviews.professionalId, professional.id)),
      ])

    // avg() returns a string, and null when the professional has no reviews yet.
    const criterion = (value: string | null) =>
      value === null ? 0 : Math.round(Number(value) * 10) / 10

    return {
      ...professional,
      rating: Number(professional.rating),
      createdAt: professional.createdAt.toISOString(),
      ratingBreakdown: {
        punctuality: criterion(breakdown?.punctuality ?? null),
        finish: criterion(breakdown?.finish ?? null),
        cleanliness: criterion(breakdown?.cleanliness ?? null),
        value: criterion(breakdown?.value ?? null),
      },
      services: professionalServices,
      reviews: professionalReviews.map((review) => ({
        ...review,
        createdAt: review.createdAt.toISOString(),
      })),
      portfolio,
    }
  },
)
