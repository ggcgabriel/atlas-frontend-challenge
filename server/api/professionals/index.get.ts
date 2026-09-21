import { and, asc, desc, eq, gte, ilike, lte, or, sql } from 'drizzle-orm'
import type { SQL } from 'drizzle-orm'
import { professionals, professions } from '~~/server/database/schema'
import type {
  ProfessionalListItem,
  ProfessionalListResponse,
  ProfessionalSort,
} from '#shared/types/professional'

export default defineEventHandler(
  async (event): Promise<ProfessionalListResponse> => {
    const query = await getValidatedQuery(event, (q) =>
      professionalQuerySchema.parse(q),
    )
    const db = useDatabase()

    // Every predicate is pushed into SQL. Fetching 520 rows and filtering in JS
    // would work at this size and stop working at the next order of magnitude.
    const conditions = [
      query.q
        ? or(
            ilike(professionals.name, `%${query.q}%`),
            ilike(professions.name, `%${query.q}%`),
          )
        : undefined,
      query.profession ? eq(professions.slug, query.profession) : undefined,
      query.city ? eq(professionals.city, query.city) : undefined,
      query.minPrice !== undefined
        ? gte(professionals.hourlyRateCents, query.minPrice)
        : undefined,
      query.maxPrice !== undefined
        ? lte(professionals.hourlyRateCents, query.maxPrice)
        : undefined,
      query.minRating !== undefined
        ? gte(professionals.rating, String(query.minRating))
        : undefined,
    ].filter(Boolean)

    const where = conditions.length ? and(...conditions) : undefined

    const orderByBySort: Record<ProfessionalSort, SQL[]> = {
      price_asc: [asc(professionals.hourlyRateCents)],
      price_desc: [desc(professionals.hourlyRateCents)],
      rating_desc: [
        desc(professionals.rating),
        desc(professionals.reviewsCount),
      ],
      recent: [desc(professionals.createdAt)],
      // No query text means "relevance" has nothing to rank on, so fall back to
      // the best-reviewed — with reviewsCount breaking ties, otherwise a single
      // 5-star review outranks a hundred.
      relevance: query.q
        ? [
            desc(sql`similarity(${professionals.name}, ${query.q})`),
            desc(professionals.rating),
          ]
        : [desc(professionals.rating), desc(professionals.reviewsCount)],
    }
    const orderBy = orderByBySort[query.sort]

    const offset = (query.page - 1) * query.limit

    const [rows, [counted]] = await Promise.all([
      db
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
        })
        .from(professionals)
        .innerJoin(professions, eq(professions.id, professionals.professionId))
        .where(where)
        // `id` last so paging is stable when the sort key ties.
        .orderBy(...orderBy, asc(professionals.id))
        .limit(query.limit)
        .offset(offset),
      db
        .select({ total: sql<number>`count(*)::int` })
        .from(professionals)
        .innerJoin(professions, eq(professions.id, professionals.professionId))
        .where(where),
    ])

    const items: ProfessionalListItem[] = rows.map((row) => ({
      ...row,
      // numeric(2,1) comes back as a string from postgres.js.
      rating: Number(row.rating),
    }))

    const total = counted?.total ?? 0

    return {
      items,
      total,
      page: query.page,
      limit: query.limit,
      hasMore: offset + items.length < total,
    }
  },
)
