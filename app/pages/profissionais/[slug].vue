<script setup lang="ts">
import {
  mdiArrowLeft,
  mdiCheckDecagram,
  mdiFileDocumentOutline,
  mdiFlash,
  mdiMapMarkerOutline,
} from '@mdi/js'
import type { ProfessionalDetail } from '#shared/types/professional'

/**
 * The professional's profile.
 *
 * A dedicated route rather than a modal: it is linkable, indexable and
 * server-rendered, which a dialog over the listing can be none of. The catalog
 * stays one history entry behind, so "Voltar ao catálogo" returns to the same
 * filtered result set the visitor arrived from.
 */
const route = useRoute()

const { data: pro, error } = await useFetch<ProfessionalDetail>(
  () => `/api/professionals/${route.params.slug}`,
)

if (error.value) {
  throw createError({
    statusCode: error.value.statusCode ?? 500,
    statusMessage: 'Profissional não encontrado',
    fatal: true,
  })
}

/** Specialties plus the perks worth a chip, in the order the mock reads them. */
const chips = computed(() => {
  if (!pro.value) return []
  const perks: string[] = []
  if (pro.value.warrantyMonths > 0) {
    perks.push(`Garantia de ${pro.value.warrantyMonths} meses`)
  }
  if (pro.value.freeQuote) perks.push('Orçamento gratuito')
  return [...pro.value.specialties, ...perks]
})

const REVIEW_PREVIEW = 4
const showAllReviews = ref(false)
const visibleReviews = computed(() =>
  showAllReviews.value
    ? (pro.value?.reviews ?? [])
    : (pro.value?.reviews ?? []).slice(0, REVIEW_PREVIEW),
)

/**
 * "Trabalhos recentes" — the services this professional actually offers, in the
 * city they work in.
 *
 * `portfolio_images` is modelled but deliberately unseeded (no licensed photo
 * source that matches the trade), so these are captioned tint tiles rather than
 * stock images that show a dragonfly for a gardener. Same shape, no fiction.
 */
const TILE_TINTS = [
  'var(--tint-sage)',
  'var(--tint-peach)',
  'var(--tint-sand)',
  'var(--tint-mist)',
]

const recentWork = computed(() =>
  (pro.value?.services ?? []).slice(0, 4).map((service, index) => ({
    id: service.id,
    caption: `${service.title} · ${pro.value?.city}`,
    tint: TILE_TINTS[index % TILE_TINTS.length],
  })),
)

useSeoMeta({
  title: () =>
    pro.value
      ? `${pro.value.name} — ${pro.value.profession} em ${pro.value.city} | AtlasHirePro`
      : 'AtlasHirePro',
  description: () =>
    pro.value
      ? `${pro.value.name}, ${pro.value.profession} em ${pro.value.city}. ${pro.value.experienceYears} anos de experiência, a partir de ${formatBRL(pro.value.hourlyRateCents)} por hora.`
      : '',
})

// Structured data: this is a local service listing, and the rating and price
// are exactly what a rich result wants to show.
useHead(() => ({
  script: pro.value
    ? [
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'LocalBusiness',
            name: pro.value.name,
            description: pro.value.bio,
            address: {
              '@type': 'PostalAddress',
              addressLocality: pro.value.city,
              addressRegion: pro.value.state,
              addressCountry: 'BR',
            },
            ...(pro.value.reviewsCount > 0 && {
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: pro.value.rating,
                reviewCount: pro.value.reviewsCount,
                bestRating: 5,
              },
            }),
          }),
        },
      ]
    : [],
}))
</script>

<template>
  <div v-if="pro" class="profile">
    <div class="app-shell">
      <nav class="profile__breadcrumb" aria-label="Você está em">
        <NuxtLink to="/" class="profile__back">
          <v-icon :icon="mdiArrowLeft" size="15" aria-hidden="true" />
          Voltar ao catálogo
        </NuxtLink>
        <span class="profile__crumb-sep" aria-hidden="true">/</span>
        <NuxtLink
          :to="{ path: '/', query: { category: pro.professionCategory } }"
          class="profile__crumb"
        >
          {{ pro.professionCategory }}
        </NuxtLink>
        <span class="profile__crumb-sep" aria-hidden="true">/</span>
        <span class="profile__crumb profile__crumb--current">
          {{ pro.name }}
        </span>
      </nav>

      <div class="profile__grid">
        <div class="profile__main">
          <section class="profile__block app-card profile__hero">
            <ProfessionalAvatar
              :id="pro.id"
              :name="pro.name"
              :avatar-url="pro.avatarUrl"
              :avatar-lqip="pro.avatarLqip"
              :alt="`Foto de ${pro.name}, ${pro.profession}`"
              :size="112"
              priority
            />

            <div class="profile__identity">
              <div class="profile__seals">
                <span v-if="pro.isVerified" class="profile__seal">
                  <v-icon
                    :icon="mdiCheckDecagram"
                    size="13"
                    aria-hidden="true"
                  />
                  Documento verificado
                </span>
                <span
                  v-if="pro.acceptsUrgent"
                  class="profile__seal profile__seal--urgent"
                >
                  <v-icon :icon="mdiFlash" size="13" aria-hidden="true" />
                  Atende urgência
                </span>
                <span
                  v-if="pro.freeQuote"
                  class="profile__seal profile__seal--quote"
                >
                  <v-icon
                    :icon="mdiFileDocumentOutline"
                    size="13"
                    aria-hidden="true"
                  />
                  Orçamento gratuito
                </span>
              </div>

              <h1 class="profile__name">{{ pro.name }}</h1>
              <p class="profile__role">
                {{ pro.profession }} · {{ pro.professionCategory }}
              </p>

              <p class="profile__meta">
                <span class="profile__meta-item">
                  <v-icon
                    :icon="mdiMapMarkerOutline"
                    size="15"
                    aria-hidden="true"
                  />
                  {{ pro.city }}, {{ pro.state }} · atende até
                  {{ pro.serviceRadiusKm }} km
                </span>
                <span class="profile__meta-item">
                  <RatingStat
                    :rating="pro.rating"
                    :reviews-count="pro.reviewsCount"
                  />
                </span>
                <span class="profile__meta-item">
                  {{ pro.experienceYears }}
                  {{ pro.experienceYears === 1 ? 'ano' : 'anos' }} de
                  experiência
                </span>
              </p>

              <ul v-if="chips.length" class="profile__chips">
                <li v-for="chip in chips" :key="chip" class="profile__chip">
                  {{ chip }}
                </li>
              </ul>
            </div>
          </section>

          <section class="profile__block app-card">
            <h2 class="profile__block-title">Sobre o trabalho</h2>
            <p class="profile__bio">{{ pro.bio }}</p>
          </section>

          <section
            v-if="pro.services.length"
            class="profile__block app-card"
            aria-labelledby="profile-services"
          >
            <h2 id="profile-services" class="profile__block-title">
              Serviços e valores
            </h2>

            <ul class="profile__services">
              <li
                v-for="service in pro.services"
                :key="service.id"
                class="profile__service"
              >
                <div class="profile__service-text">
                  <p class="profile__service-title">{{ service.title }}</p>
                  <p class="profile__service-note">
                    {{ formatDuration(service.durationMinutes) }} de trabalho
                  </p>
                </div>
                <p class="profile__service-price">
                  {{ formatBRLExact(service.priceCents) }}
                </p>
              </li>
            </ul>
          </section>

          <section
            class="profile__block app-card"
            aria-labelledby="profile-reviews"
          >
            <div class="profile__block-head">
              <h2 id="profile-reviews" class="profile__block-title">
                Avaliações de clientes
              </h2>
              <button
                v-if="pro.reviews.length > REVIEW_PREVIEW"
                type="button"
                class="profile__link-button"
                @click="showAllReviews = !showAllReviews"
              >
                {{
                  showAllReviews
                    ? 'Mostrar menos'
                    : `Ver todas as ${formatCount(pro.reviews.length)}`
                }}
              </button>
            </div>

            <template v-if="pro.reviewsCount > 0">
              <RatingBreakdown
                :rating="pro.rating"
                :reviews-count="pro.reviewsCount"
                :breakdown="pro.ratingBreakdown"
                class="mb-5"
              />

              <ul class="profile__reviews">
                <li v-for="review in visibleReviews" :key="review.id">
                  <ReviewCard :review="review" />
                </li>
              </ul>
            </template>

            <p v-else class="profile__empty">
              Este profissional ainda não recebeu avaliações.
            </p>
          </section>

          <section
            v-if="recentWork.length"
            class="profile__block app-card"
            aria-labelledby="profile-work"
          >
            <h2 id="profile-work" class="profile__block-title">
              Trabalhos recentes
            </h2>

            <ul class="profile__work">
              <li
                v-for="tile in recentWork"
                :key="tile.id"
                class="profile__tile"
                :style="{ backgroundColor: tile.tint }"
              >
                <span class="profile__tile-caption">{{ tile.caption }}</span>
              </li>
            </ul>
          </section>
        </div>

        <div class="profile__aside">
          <QuoteRequestCard :professional="pro" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile {
  padding-block: 16px 56px;
}

.profile__breadcrumb {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-block-end: 16px;
  font-size: 0.8125rem;
}

.profile__back {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-weight: 600;
  color: inherit;
  text-decoration: none;
}

.profile__back:hover,
.profile__crumb:hover {
  text-decoration: underline;
}

.profile__crumb {
  color: rgb(var(--v-theme-on-surface) / 62%);
  text-decoration: none;
}

.profile__crumb--current {
  color: rgb(var(--v-theme-on-surface));
  font-weight: 600;
}

.profile__crumb-sep {
  color: rgb(var(--v-theme-on-surface) / 35%);
}

.profile__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 16px;
}

@media (min-width: 1000px) {
  .profile__grid {
    grid-template-columns: minmax(0, 1fr) 320px;
    gap: 24px;
    align-items: start;
  }
}

.profile__main {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-inline-size: 0;
}

.profile__block {
  padding: 20px;
}

@media (min-width: 600px) {
  .profile__block {
    padding: 24px;
  }
}

.profile__hero {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

@media (min-width: 600px) {
  .profile__hero {
    flex-direction: row;
    align-items: flex-start;
    gap: 20px;
  }
}

.profile__identity {
  min-inline-size: 0;
}

.profile__seals {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-block-end: 10px;
}

.profile__seal {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 9px;
  border-radius: 999px;
  background: var(--tint-sage);
  color: rgb(var(--v-theme-primary));
  font-size: 0.6875rem;
  font-weight: 600;
  line-height: 1.125rem;
}

.profile__seal--urgent {
  background: var(--tint-peach);
  color: #8a3d15;
}

.profile__seal--quote {
  background: var(--tint-sand);
  color: #4a4436;
}

.profile__name {
  font-size: 1.625rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 2.125rem;
}

@media (min-width: 600px) {
  .profile__name {
    font-size: 2rem;
    line-height: 2.5rem;
  }
}

.profile__role {
  margin: 2px 0 0;
  font-size: 0.9375rem;
  color: rgb(var(--v-theme-on-surface) / 70%);
}

.profile__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 16px;
  margin: 12px 0 0;
  font-size: 0.8125rem;
  color: rgb(var(--v-theme-on-surface) / 68%);
}

.profile__meta-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.profile__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  list-style: none;
  padding: 0;
  margin: 14px 0 0;
}

.profile__chip {
  padding: 4px 11px;
  border-radius: 999px;
  background: var(--surface-muted);
  font-size: 0.6875rem;
  line-height: 1.125rem;
  color: rgb(var(--v-theme-on-surface) / 72%);
}

.profile__block-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.profile__block-title {
  font-size: 1.0625rem;
  font-weight: 700;
  margin-block-end: 14px;
}

.profile__block-head .profile__block-title {
  margin-block-end: 14px;
}

.profile__link-button {
  font-size: 0.8125rem;
  font-weight: 600;
  color: rgb(var(--v-theme-accent));
  cursor: pointer;
}

.profile__link-button:focus-visible {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: 2px;
  border-radius: 4px;
}

.profile__bio {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.5rem;
  color: rgb(var(--v-theme-on-surface) / 82%);
  white-space: pre-line;
}

.profile__services {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 10px;
  list-style: none;
  padding: 0;
  margin: 0;
}

@media (min-width: 720px) {
  .profile__services {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px 16px;
  }
}

.profile__service {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border-radius: var(--control-radius);
  background: var(--surface-muted);
}

.profile__service-text {
  min-inline-size: 0;
}

.profile__service-title {
  margin: 0;
  font-size: 0.8125rem;
  font-weight: 600;
  line-height: 1.25rem;
}

.profile__service-note {
  margin: 0;
  font-size: 0.6875rem;
  color: rgb(var(--v-theme-on-surface) / 58%);
}

.profile__service-price {
  margin: 0;
  font-size: 0.8125rem;
  font-weight: 700;
  white-space: nowrap;
  color: rgb(var(--v-theme-accent));
}

.profile__reviews {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 10px;
  list-style: none;
  padding: 0;
  margin: 0;
}

@media (min-width: 720px) {
  .profile__reviews {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.profile__empty {
  margin: 0;
  font-size: 0.875rem;
  color: rgb(var(--v-theme-on-surface) / 60%);
}

.profile__work {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  list-style: none;
  padding: 0;
  margin: 0;
}

@media (min-width: 720px) {
  .profile__work {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

/* A fixed ratio so the row reserves its height before anything paints. */
.profile__tile {
  position: relative;
  aspect-ratio: 4 / 3;
  border-radius: var(--control-radius);
  overflow: hidden;
}

.profile__tile-caption {
  position: absolute;
  inset-inline: 10px;
  inset-block-end: 8px;
  font-size: 0.625rem;
  line-height: 0.875rem;
  color: rgb(20 22 26 / 72%);
}

.profile__aside {
  min-inline-size: 0;
}
</style>
