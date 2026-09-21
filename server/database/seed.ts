/**
 * Seeds the catalog with a reproducible dataset.
 *
 * Runs outside Nuxt (`tsx --env-file=.env`), so it builds its own client and
 * reads DATABASE_URL directly instead of going through runtimeConfig.
 *
 * `faker.seed(SEED)` is deliberate: every machine and every session gets byte
 * -identical data, so a screenshot, a test fixture and a bug report all refer to
 * the same professionals.
 */
import { faker } from '@faker-js/faker/locale/pt_BR'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { professionals, professions, reviews, services } from './schema'

const SEED = 42
const PROFESSIONAL_COUNT = 520

const PROFESSIONS = [
  { name: 'Eletricista', category: 'Reformas e Reparos' },
  { name: 'Encanador', category: 'Reformas e Reparos' },
  { name: 'Pintor', category: 'Reformas e Reparos' },
  { name: 'Pedreiro', category: 'Reformas e Reparos' },
  { name: 'Marceneiro', category: 'Reformas e Reparos' },
  { name: 'Chaveiro', category: 'Reformas e Reparos' },
  { name: 'Montador de Móveis', category: 'Reformas e Reparos' },
  { name: 'Técnico em Ar-Condicionado', category: 'Assistência Técnica' },
  { name: 'Técnico em Informática', category: 'Assistência Técnica' },
  { name: 'Técnico em Eletrodomésticos', category: 'Assistência Técnica' },
  { name: 'Diarista', category: 'Casa e Limpeza' },
  { name: 'Jardineiro', category: 'Casa e Limpeza' },
  { name: 'Cuidador de Idosos', category: 'Cuidados Pessoais' },
  { name: 'Personal Trainer', category: 'Saúde e Bem-estar' },
  { name: 'Fisioterapeuta', category: 'Saúde e Bem-estar' },
  { name: 'Nutricionista', category: 'Saúde e Bem-estar' },
  { name: 'Cabeleireiro', category: 'Beleza' },
  { name: 'Manicure', category: 'Beleza' },
  { name: 'Fotógrafo', category: 'Eventos' },
  { name: 'Professor Particular', category: 'Aulas' },
] as const

/** Real coordinates so a distance sort has something honest to work with. */
const CITIES = [
  { city: 'São Paulo', state: 'SP', lat: -23.5505, lng: -46.6333 },
  { city: 'Rio de Janeiro', state: 'RJ', lat: -22.9068, lng: -43.1729 },
  { city: 'Belo Horizonte', state: 'MG', lat: -19.9167, lng: -43.9345 },
  { city: 'Curitiba', state: 'PR', lat: -25.4284, lng: -49.2733 },
  { city: 'Porto Alegre', state: 'RS', lat: -30.0346, lng: -51.2177 },
  { city: 'Salvador', state: 'BA', lat: -12.9777, lng: -38.5016 },
  { city: 'Recife', state: 'PE', lat: -8.0476, lng: -34.877 },
  { city: 'Fortaleza', state: 'CE', lat: -3.7319, lng: -38.5267 },
  { city: 'Brasília', state: 'DF', lat: -15.7939, lng: -47.8828 },
  { city: 'Campinas', state: 'SP', lat: -22.9099, lng: -47.0626 },
] as const

const REVIEW_COMMENTS = [
  'Serviço impecável, chegou no horário combinado e deixou tudo limpo.',
  'Profissional atencioso e muito competente. Recomendo sem ressalvas.',
  'Resolveu em uma visita o que outros não conseguiram. Preço justo.',
  'Bom trabalho no geral, mas atrasou um pouco para chegar.',
  'Comunicação excelente do orçamento até a entrega.',
  'Caprichoso e honesto. Já contratei três vezes.',
  'Atendeu bem, porém o valor ficou acima do combinado inicialmente.',
  'Muito rápido e educado. Voltarei a chamar.',
]

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL is not set. Copy .env.example to .env.')
  }

  faker.seed(SEED)

  const client = postgres(url, { max: 1 })
  const db = drizzle(client)

  console.log('Clearing existing data…')
  // Order matters: children first, and TRUNCATE ... CASCADE resets the serials
  // so a re-seed produces the same ids as the first run.
  await client`TRUNCATE TABLE reviews, services, professionals, professions RESTART IDENTITY CASCADE`

  console.log(`Inserting ${PROFESSIONS.length} professions…`)
  const insertedProfessions = await db
    .insert(professions)
    .values(
      PROFESSIONS.map((p) => ({
        name: p.name,
        slug: slugify(p.name),
        category: p.category,
      })),
    )
    .returning()

  console.log(`Inserting ${PROFESSIONAL_COUNT} professionals…`)
  const usedSlugs = new Set<string>()
  const professionalRows = Array.from({ length: PROFESSIONAL_COUNT }, () => {
    const profession = faker.helpers.arrayElement(insertedProfessions)
    const location = faker.helpers.arrayElement(CITIES)
    const name = faker.person.fullName()

    // Slugs must be unique and faker will repeat a name across 520 draws.
    let slug = `${slugify(name)}-${slugify(profession.name)}`
    let suffix = 2
    while (usedSlugs.has(slug)) slug = `${slug}-${suffix++}`
    usedSlugs.add(slug)

    return {
      slug,
      name,
      // Deterministic avatar: same professional, same face, every run.
      avatarUrl: `https://i.pravatar.cc/400?u=${slug}`,
      professionId: profession.id,
      hourlyRateCents: faker.number.int({ min: 4000, max: 48000 }),
      city: location.city,
      state: location.state,
      // Jitter around the city centre so professionals aren't stacked on a point.
      lat: location.lat + faker.number.float({ min: -0.12, max: 0.12 }),
      lng: location.lng + faker.number.float({ min: -0.12, max: 0.12 }),
      bio: faker.lorem.paragraphs({ min: 2, max: 3 }, '\n\n'),
      isAvailable: faker.datatype.boolean({ probability: 0.75 }),
      createdAt: faker.date.past({ years: 3 }),
    }
  })

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
    const baseRate = professionalRows[index]!.hourlyRateCents

    for (let i = 0; i < faker.number.int({ min: 1, max: 5 }); i++) {
      serviceRows.push({
        professionalId: professional.id,
        title: faker.commerce.productName(),
        priceCents: Math.round(
          baseRate * faker.number.float({ min: 0.6, max: 3.5 }),
        ),
        durationMinutes: faker.helpers.arrayElement([30, 60, 90, 120, 180, 240]),
      })
    }

    const reviewCount = faker.number.int({ min: 0, max: 15 })
    let sum = 0
    for (let i = 0; i < reviewCount; i++) {
      // Weighted high: a real marketplace's rating distribution is left-skewed.
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
        comment: faker.helpers.arrayElement(REVIEW_COMMENTS),
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
  const values = [...aggregates.entries()].map(([id, { sum, count }]) => ({
    id,
    rating: count === 0 ? '0.0' : (Math.round((sum / count) * 10) / 10).toFixed(1),
    count,
  }))
  await client`
    UPDATE professionals AS p
    SET rating = v.rating::numeric(2,1), reviews_count = v.count::int
    FROM (VALUES ${client(values.map((v) => [v.id, v.rating, v.count]))})
      AS v(id, rating, count)
    WHERE p.id = v.id::int
  `

  const counted = await client<{ count: string }[]>`
    SELECT count(*)::text AS count FROM professionals
  `

  console.log(
    `Done. ${counted[0]?.count ?? 0} professionals, ${serviceRows.length} services, ${reviewRows.length} reviews.`,
  )
  await client.end()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
