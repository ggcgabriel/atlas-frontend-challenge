<script setup lang="ts">
import { mdiArrowRight, mdiCheckDecagram, mdiFlash } from '@mdi/js'
import type { ProfessionalListItem } from '#shared/types/professional'

const props = defineProps<{
  professional: ProfessionalListItem
  priority?: boolean
}>()

const pro = computed(() => props.professional)

const chips = computed(() => pro.value.specialties.slice(0, 3))
</script>

<template>
  <article class="pro-card app-card">
    <div class="pro-card__head">
      <ProfessionalAvatar
        :id="pro.id"
        :name="pro.name"
        :avatar-url="pro.avatarUrl"
        :avatar-lqip="pro.avatarLqip"
        :alt="`Foto de ${pro.name}, ${pro.profession}`"
        :size="60"
        :priority="priority"
      />

      <div class="pro-card__identity">
        <p class="pro-card__title">
          <NuxtLink :to="`/profissionais/${pro.slug}`" class="pro-card__link">
            {{ pro.name }}
          </NuxtLink>

          <span v-if="pro.isVerified" class="pro-card__seal">
            <v-icon :icon="mdiCheckDecagram" size="12" aria-hidden="true" />
            Verificado
          </span>

          <span
            v-if="pro.acceptsUrgent"
            class="pro-card__seal pro-card__seal--urgent"
          >
            <v-icon :icon="mdiFlash" size="12" aria-hidden="true" />
            Atende urgência
          </span>
        </p>

        <p class="pro-card__meta">
          {{ pro.profession }} · {{ pro.city }}, {{ pro.state }}
        </p>

        <p class="pro-card__stats">
          <RatingStat :rating="pro.rating" :reviews-count="pro.reviewsCount" />
          <span class="pro-card__dot" aria-hidden="true">·</span>
          <span>
            {{ pro.experienceYears }}
            {{ pro.experienceYears === 1 ? 'ano' : 'anos' }} de experiência
          </span>
        </p>
      </div>

      <div class="pro-card__favorite">
        <FavoriteButton
          :professional-id="pro.id"
          :professional-name="pro.name"
        />
      </div>
    </div>

    <ul v-if="chips.length" class="pro-card__chips">
      <li v-for="chip in chips" :key="chip" class="pro-card__chip">
        {{ chip }}
      </li>
      <li v-if="pro.freeQuote" class="pro-card__chip pro-card__chip--perk">
        Orçamento grátis
      </li>
    </ul>

    <div class="pro-card__foot">
      <p class="pro-card__price">
        <strong>{{ formatBRL(pro.hourlyRateCents) }}</strong>
        <span class="pro-card__price-unit">por hora</span>
      </p>

      <span class="pro-card__cta" aria-hidden="true">
        Ver perfil
        <v-icon :icon="mdiArrowRight" size="15" />
      </span>
    </div>
  </article>
</template>

<style scoped>
.pro-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  transition:
    border-color 150ms ease,
    box-shadow 150ms ease,
    translate 150ms ease;
}

.pro-card:hover {
  border-color: rgb(20 22 26 / 20%);
  box-shadow: var(--card-shadow-hover);
  translate: 0 -1px;
}

.pro-card__head {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.pro-card__identity {
  min-inline-size: 0;
  flex: 1 1 auto;
}

.pro-card__title {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0 0 2px;
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.5rem;
}

.pro-card__link {
  color: inherit;
  text-decoration: none;
  min-inline-size: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pro-card__link::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
  border-radius: var(--card-radius);
}

.pro-card__link:focus-visible::after {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: 2px;
}

.pro-card__seal {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 7px;
  border-radius: 999px;
  background: var(--tint-sage);
  color: rgb(var(--v-theme-primary));
  font-size: 0.6875rem;
  font-weight: 600;
  line-height: 1rem;
  white-space: nowrap;
}

.pro-card__seal--urgent {
  background: var(--tint-peach);
  color: #8a3d15;
}

.pro-card__meta,
.pro-card__stats {
  margin: 0;
  font-size: 0.8125rem;
  line-height: 1.25rem;
  color: rgb(var(--v-theme-on-surface) / 62%);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pro-card__stats {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-block-start: 2px;
}

.pro-card__dot {
  color: rgb(var(--v-theme-on-surface) / 35%);
}

.pro-card__favorite {
  flex: 0 0 auto;
}

.pro-card__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  list-style: none;
  padding: 0;
  margin: 0;
}

.pro-card__chip {
  padding: 3px 10px;
  border-radius: 999px;
  background: var(--surface-muted);
  font-size: 0.6875rem;
  line-height: 1.125rem;
  color: rgb(var(--v-theme-on-surface) / 72%);
  white-space: nowrap;
}

.pro-card__chip--perk {
  background: var(--tint-sage);
  color: rgb(var(--v-theme-primary));
  font-weight: 600;
}

.pro-card__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-block-start: 12px;
  border-block-start: 1px solid rgb(20 22 26 / 8%);
}

.pro-card__price {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
  line-height: 1.5rem;
}

.pro-card__price-unit {
  margin-inline-start: 4px;
  font-size: 0.8125rem;
  font-weight: 400;
  color: rgb(var(--v-theme-on-surface) / 60%);
}

.pro-card__cta {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 7px 16px;
  border: 1px solid rgb(20 22 26 / 22%);
  border-radius: 999px;
  font-size: 0.8125rem;
  font-weight: 600;
  white-space: nowrap;
  transition:
    background-color 150ms ease,
    color 150ms ease;
}

.pro-card:hover .pro-card__cta {
  background: rgb(var(--v-theme-secondary));
  border-color: rgb(var(--v-theme-secondary));
  color: #fff;
}

@media (prefers-reduced-motion: reduce) {
  .pro-card,
  .pro-card__cta {
    transition: none;
  }

  .pro-card:hover {
    translate: none;
  }
}
</style>
