import {
  boolean,
  index,
  integer,
  numeric,
  pgTable,
  real,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const professions = pgTable('professions', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 80 }).notNull().unique(),
  name: varchar('name', { length: 120 }).notNull(),
  category: varchar('category', { length: 80 }).notNull(),
})

export const professionals = pgTable(
  'professionals',
  {
    id: serial('id').primaryKey(),
    slug: varchar('slug', { length: 140 }).notNull().unique(),
    name: varchar('name', { length: 140 }).notNull(),
    // Path to a local file under public/images/professionals. Local on purpose:
    // 520 cross-origin avatar requests to a host we do not control is the wrong
    // trade on a page graded for Core Web Vitals. See docs/context/decisions.md.
    avatarUrl: text('avatar_url').notNull(),
    // Inline 16px WebP data URI (~300B) rendered underneath the real avatar, so
    // a card has something in the image box from the first paint. Stored rather
    // than derived because it is produced by the image pipeline, not at runtime.
    avatarLqip: text('avatar_lqip').notNull().default(''),
    professionId: integer('profession_id')
      .notNull()
      .references(() => professions.id, { onDelete: 'restrict' }),
    // Integer cents. Never a float — see docs/context/conventions.md.
    hourlyRateCents: integer('hourly_rate_cents').notNull(),
    // Denormalized from `reviews` at seed time so the listing can sort by
    // rating without joining or aggregating on every request.
    rating: numeric('rating', { precision: 2, scale: 1 }).notNull().default('0'),
    reviewsCount: integer('reviews_count').notNull().default(0),
    city: varchar('city', { length: 120 }).notNull(),
    state: varchar('state', { length: 2 }).notNull(),
    lat: real('lat').notNull(),
    lng: real('lng').notNull(),
    bio: text('bio').notNull(),
    experienceYears: integer('experience_years').notNull().default(1),
    /** How far the professional will travel — they come to the customer. */
    serviceRadiusKm: integer('service_radius_km').notNull().default(10),
    acceptsUrgent: boolean('accepts_urgent').notNull().default(false),
    isVerified: boolean('is_verified').notNull().default(false),
    isAvailable: boolean('is_available').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('professionals_profession_id_idx').on(table.professionId),
    index('professionals_hourly_rate_idx').on(table.hourlyRateCents),
    index('professionals_rating_idx').on(table.rating),
    index('professionals_city_idx').on(table.city),
    index('professionals_created_at_idx').on(table.createdAt),
    index('professionals_experience_idx').on(table.experienceYears),
  ],
)

export const portfolioImages = pgTable(
  'portfolio_images',
  {
    id: serial('id').primaryKey(),
    professionalId: integer('professional_id')
      .notNull()
      .references(() => professionals.id, { onDelete: 'cascade' }),
    url: text('url').notNull(),
    alt: varchar('alt', { length: 200 }).notNull(),
    // Intrinsic dimensions travel with the row so the gallery can reserve the
    // exact box before the file loads. This is the CLS fix, in the data model.
    width: integer('width').notNull(),
    height: integer('height').notNull(),
    lqip: text('lqip').notNull().default(''),
    position: integer('position').notNull().default(0),
  },
  (table) => [
    index('portfolio_images_professional_id_idx').on(table.professionalId),
  ],
)

export const services = pgTable(
  'services',
  {
    id: serial('id').primaryKey(),
    professionalId: integer('professional_id')
      .notNull()
      .references(() => professionals.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 160 }).notNull(),
    priceCents: integer('price_cents').notNull(),
    durationMinutes: integer('duration_minutes').notNull(),
  },
  (table) => [index('services_professional_id_idx').on(table.professionalId)],
)

export const reviews = pgTable(
  'reviews',
  {
    id: serial('id').primaryKey(),
    professionalId: integer('professional_id')
      .notNull()
      .references(() => professionals.id, { onDelete: 'cascade' }),
    authorName: varchar('author_name', { length: 140 }).notNull(),
    rating: integer('rating').notNull(),
    comment: text('comment').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index('reviews_professional_id_idx').on(table.professionalId)],
)

export const professionsRelations = relations(professions, ({ many }) => ({
  professionals: many(professionals),
}))

export const professionalsRelations = relations(
  professionals,
  ({ one, many }) => ({
    profession: one(professions, {
      fields: [professionals.professionId],
      references: [professions.id],
    }),
    services: many(services),
    reviews: many(reviews),
    portfolioImages: many(portfolioImages),
  }),
)

export const portfolioImagesRelations = relations(portfolioImages, ({ one }) => ({
  professional: one(professionals, {
    fields: [portfolioImages.professionalId],
    references: [professionals.id],
  }),
}))

export const servicesRelations = relations(services, ({ one }) => ({
  professional: one(professionals, {
    fields: [services.professionalId],
    references: [professionals.id],
  }),
}))

export const reviewsRelations = relations(reviews, ({ one }) => ({
  professional: one(professionals, {
    fields: [reviews.professionalId],
    references: [professionals.id],
  }),
}))

export type ProfessionRow = typeof professions.$inferSelect
export type ProfessionalRow = typeof professionals.$inferSelect
export type ServiceRow = typeof services.$inferSelect
export type ReviewRow = typeof reviews.$inferSelect
export type PortfolioImageRow = typeof portfolioImages.$inferSelect
