/**
 * Seeds the catalog with a reproducible dataset.
 *
 * Runs outside Nuxt (`tsx --env-file=.env`), so it builds its own client and
 * reads DATABASE_URL directly instead of going through runtimeConfig.
 *
 * `faker.seed(SEED)` is deliberate: every machine and every session gets
 * byte-identical data, so a screenshot, a test fixture and a bug report all
 * refer to the same professionals.
 *
 * Only names, cities, dates and numbers come from faker. Professions, services,
 * specialties and review text are hand-written in ./catalog-data.ts, and photos
 * come from ./image-manifest.json — both committed, so seeding needs no network.
 */
import { readFileSync } from 'node:fs'
import { faker } from '@faker-js/faker/locale/pt_BR'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import {
  BIO_CLOSING,
  BIO_FOCUS,
  BIO_OPENINGS,
  BIO_SERVICE,
  CITIES,
  PROFESSIONS,
  REVIEWS_BY_RATING,
} from './catalog-data'
import { professionals, professions, reviews, services } from './schema'

const SEED = 42
const PROFESSIONAL_COUNT = 520
const MANIFEST_PATH = new URL('./image-manifest.json', import.meta.url)

interface ManifestImage {
  url: string
  width: number
  height: number
  lqip: string
}

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function fill(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ''))
}

/** A per-criterion score within one point of the review's overall rating. */
function nearRating(rating: number): number {
  return Math.min(
    5,
    Math.max(1, rating + faker.number.int({ min: -1, max: 1 })),
  )
}

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL is not set. Copy .env.example to .env.')
  }

  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8')) as {
    portraits: ManifestImage[]
  }
  if (manifest.portraits.length < PROFESSIONAL_COUNT) {
    throw new Error(
      `image-manifest.json has ${manifest.portraits.length} portraits, need ${PROFESSIONAL_COUNT}. Run: pnpm images:build`,
    )
  }

  faker.seed(SEED)

  const client = postgres(url, { max: 1 })
  const db = drizzle(client)

  console.log('Clearing existing data…')
  // Children first; RESTART IDENTITY resets the serials so a re-seed produces
  // the same ids as the first run.
  await client`TRUNCATE TABLE portfolio_images, reviews, services, professionals, professions RESTART IDENTITY CASCADE`

  console.log(`Inserting ${PROFESSIONS.length} professions…`)
  const insertedProfessions = await db
    .insert(professions)
    .values(
      PROFESSIONS.map((p) => ({
        name: p.name,
        namePlural: p.namePlural,
        slug: p.slug,
        category: p.category,
      })),
    )
    .returning()

  // profession.id -> the hand-written seed entry behind it
  const professionSeedById = new Map(
    insertedProfessions.map((row) => [
      row.id,
      PROFESSIONS.find((p) => p.slug === row.slug)!,
    ]),
  )

  const cityPool = CITIES.flatMap((c) => Array<typeof c>(c.weight).fill(c))

  console.log(`Inserting ${PROFESSIONAL_COUNT} professionals…`)
  const usedSlugs = new Set<string>()
  const professionalRows = Array.from(
    { length: PROFESSIONAL_COUNT },
    (_, i) => {
      const professionRow = faker.helpers.arrayElement(insertedProfessions)
      const profession = professionSeedById.get(professionRow.id)!
      const location = faker.helpers.arrayElement(cityPool)
      // firstName + lastName rather than fullName(): the pt_BR locale sprinkles
      // "Sr." / "Sra." prefixes into fullName, which no one puts on a profile.
      const name = `${faker.person.firstName()} ${faker.person.lastName()}`

      // Slugs must be unique and faker repeats names across 520 draws.
      let slug = `${slugify(name)}-${profession.slug}`
      let suffix = 2
      while (usedSlugs.has(slug)) slug = `${slug}-${suffix++}`
      usedSlugs.add(slug)

      const experienceYears = faker.number.int({ min: 1, max: 30 })
      const serviceRadiusKm = faker.helpers.arrayElement([
        5, 10, 15, 20, 30, 50,
      ])
      const shuffledSpecialties = faker.helpers.shuffle([
        ...profession.specialties,
      ])
      const [s1, s2] = shuffledSpecialties
      const specialties = shuffledSpecialties.slice(
        0,
        faker.number.int({ min: 2, max: 3 }),
      )
      // Advertised in the bio too, so the profile's chip and its prose agree.
      const warrantyMonths = faker.helpers.arrayElement([0, 3, 6, 12])

      // One portrait per professional — no face is ever reused in the catalog.
      const portrait = manifest.portraits[i]!
      // Every 20th professional is seeded without a photo (26 of 520). The
      // catalog is mocked, so the initials fallback would otherwise never render;
      // this keeps that path exercised in real data instead of only on an <img>
      // error nobody triggers.
      const hasPhoto = (i + 1) % 20 !== 0

      const bio = [
        fill(faker.helpers.arrayElement(BIO_OPENINGS), {
          category: profession.category.toLowerCase(),
          years: experienceYears,
        }),
        fill(faker.helpers.arrayElement(BIO_FOCUS), { s1: s1!, s2: s2! }),
        fill(faker.helpers.arrayElement(BIO_SERVICE), {
          city: location.city,
          radius: serviceRadiusKm,
        }),
        fill(faker.helpers.arrayElement(BIO_CLOSING), {
          warranty: warrantyMonths || 3,
        }),
      ].join(' ')

      return {
        slug,
        name,
        avatarUrl: hasPhoto ? portrait.url : '',
        avatarLqip: hasPhoto ? portrait.lqip : '',
        professionId: professionRow.id,
        // Rate is drawn inside the profession's own realistic band, so sorting by
        // price tells you something true about the trade instead of being noise.
        hourlyRateCents: faker.number.int({
          min: profession.rateCents[0],
          max: profession.rateCents[1],
        }),
        city: location.city,
        state: location.state,
        // Jitter around the city centre so professionals aren't stacked on a point.
        lat: location.lat + faker.number.float({ min: -0.12, max: 0.12 }),
        lng: location.lng + faker.number.float({ min: -0.12, max: 0.12 }),
        bio,
        experienceYears,
        serviceRadiusKm,
        specialties,
        warrantyMonths,
        acceptsUrgent: faker.datatype.boolean({ probability: 0.35 }),
        isVerified: faker.datatype.boolean({ probability: 0.4 }),
        freeQuote: faker.datatype.boolean({ probability: 0.6 }),
        responseTimeHours: faker.helpers.weightedArrayElement([
          { weight: 20, value: 1 },
          { weight: 35, value: 2 },
          { weight: 25, value: 4 },
          { weight: 15, value: 12 },
          { weight: 5, value: 24 },
        ]),
        isAvailable: faker.datatype.boolean({ probability: 0.75 }),
        createdAt: faker.date.past({ years: 3 }),
      }
    },
  )

  const insertedProfessionals = await db
    .insert(professionals)
    .values(professionalRows)
    .returning({ id: professionals.id })

  console.log('Inserting services and reviews…')
  const serviceRows: (typeof services.$inferInsert)[] = []
  const reviewRows: (typeof reviews.$inferInsert)[] = []
  // rating/reviewsCount are denormalized onto `professionals`, so they are
  // computed here from the rows we just generated.
  const aggregates = new Map<number, { sum: number; count: number }>()

  for (const [index, professional] of insertedProfessionals.entries()) {
    const row = professionalRows[index]!
    const profession = professionSeedById.get(row.professionId)!
    const rate = row.hourlyRateCents

    const offered = faker.helpers.arrayElements(
      profession.services,
      faker.number.int({
        min: 2,
        max: Math.min(5, profession.services.length),
      }),
    )
    for (const service of offered) {
      serviceRows.push({
        professionalId: professional.id,
        title: service.title,
        priceCents:
          Math.round(
            (rate *
              faker.number.float({
                min: service.rateMultiplier[0],
                max: service.rateMultiplier[1],
              })) /
              100,
          ) * 100,
        durationMinutes: service.durationMinutes,
      })
    }

    const reviewCount = faker.number.int({ min: 0, max: 15 })
    let sum = 0
    for (let i = 0; i < reviewCount; i++) {
      // Left-skewed, like a real marketplace.
      const rating = faker.helpers.weightedArrayElement([
        { weight: 1, value: 1 },
        { weight: 2, value: 2 },
        { weight: 6, value: 3 },
        { weight: 25, value: 4 },
        { weight: 46, value: 5 },
      ])
      sum += rating
      reviewRows.push({
        professionalId: professional.id,
        authorName: faker.person.firstName(),
        rating,
        // The criteria vary around the score the reviewer actually gave, never
        // independently of it: nobody rates a job 2 stars overall and 5 on
        // every criterion. The profile averages these into its four bars.
        ratingPunctuality: nearRating(rating),
        ratingFinish: nearRating(rating),
        ratingCleanliness: nearRating(rating),
        ratingValue: nearRating(rating),
        // Comment matches the score. Drawing at random would let a one-star
        // review read "Serviço impecável".
        comment: faker.helpers.arrayElement(REVIEWS_BY_RATING[rating]!),
        createdAt: faker.date.past({ years: 2 }),
      })
    }
    aggregates.set(professional.id, { sum, count: reviewCount })
  }

  // Chunked: a single 2000-row multi-VALUES insert blows past Postgres'
  // bind-parameter ceiling (65535).
  const CHUNK = 500
  for (let i = 0; i < serviceRows.length; i += CHUNK) {
    await db.insert(services).values(serviceRows.slice(i, i + CHUNK))
  }
  for (let i = 0; i < reviewRows.length; i += CHUNK) {
    await db.insert(reviews).values(reviewRows.slice(i, i + CHUNK))
  }

  console.log('Denormalizing rating and reviews_count…')
  // One UPDATE ... FROM (VALUES ...) instead of 520 round trips.
  const values = [...aggregates.entries()].map(([id, { sum, count }]) => [
    id,
    count === 0 ? '0.0' : (Math.round((sum / count) * 10) / 10).toFixed(1),
    count,
  ])
  await client`
    UPDATE professionals AS p
    SET rating = v.rating::numeric(2,1), reviews_count = v.count::int
    FROM (VALUES ${client(values)}) AS v(id, rating, count)
    WHERE p.id = v.id::int
  `

  const counted = await client<{ count: string }[]>`
    SELECT count(*)::text AS count FROM professionals
  `

  console.log(
    `Done. ${counted[0]?.count ?? 0} professionals, ${serviceRows.length} services, ${reviewRows.length} reviews.`,
  )
  console.log(
    'Portfolio gallery intentionally not seeded — see docs/context/stage-02-server-db.md.',
  )
  await client.end()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
