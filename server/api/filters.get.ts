import { asc, sql } from 'drizzle-orm'
import { professionals, professions } from '~~/server/database/schema'
import type { CatalogFilters } from '#shared/types/professional'

/**
 * Everything the filter UI needs to render itself, in one request.
 *
 * The options come from the data rather than a hardcoded list, so a profession
 * with no professionals never shows up as a filter that returns nothing.
 */
export default defineEventHandler(async (event): Promise<CatalogFilters> => {
  const db = useDatabase()

  // Rarely changes and is identical for every visitor — worth a cache header.
  setResponseHeader(
    event,
    'Cache-Control',
    'public, max-age=60, stale-while-revalidate=300',
  )

  const [professionRows, cityRows, [range]] = await Promise.all([
    db
      .selectDistinct({
        id: professions.id,
        slug: professions.slug,
        name: professions.name,
        category: professions.category,
      })
      .from(professions)
      .innerJoin(
        professionals,
        sql`${professionals.professionId} = ${professions.id}`,
      )
      .orderBy(asc(professions.name)),
    db
      .selectDistinct({ city: professionals.city })
      .from(professionals)
      .orderBy(asc(professionals.city)),
    db
      .select({
        minCents: sql<number>`coalesce(min(${professionals.hourlyRateCents}), 0)::int`,
        maxCents: sql<number>`coalesce(max(${professionals.hourlyRateCents}), 0)::int`,
      })
      .from(professionals),
  ])

  return {
    professions: professionRows,
    cities: cityRows.map((row) => row.city),
    priceRange: {
      minCents: range?.minCents ?? 0,
      maxCents: range?.maxCents ?? 0,
    },
  }
})
