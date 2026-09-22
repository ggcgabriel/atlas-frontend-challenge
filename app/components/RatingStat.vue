<script setup lang="ts">
import { mdiStar } from '@mdi/js'

const props = defineProps<{
  rating: number
  reviewsCount: number
  compact?: boolean
}>()

const hasReviews = computed(() => props.reviewsCount > 0)

const label = computed(() =>
  hasReviews.value
    ? `Avaliação ${formatRating(props.rating)} de 5, ${formatCount(props.reviewsCount)} avaliações`
    : 'Ainda sem avaliações',
)
</script>

<template>
  <span class="rating-stat" :aria-label="label">
    <template v-if="hasReviews">
      <v-icon
        :icon="mdiStar"
        size="13"
        class="rating-stat__star"
        aria-hidden="true"
      />
      <span class="rating-stat__value" aria-hidden="true">
        {{ formatRating(rating) }}
      </span>
      <span v-if="!compact" aria-hidden="true">
        · {{ formatCount(reviewsCount) }}
        {{ reviewsCount === 1 ? 'avaliação' : 'avaliações' }}
      </span>
    </template>
    <span v-else class="text-medium-emphasis" aria-hidden="true">Novo</span>
  </span>
</template>

<style scoped>
.rating-stat {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 0.8125rem;
  line-height: 1.25rem;
  white-space: nowrap;
}

.rating-stat__star {
  color: rgb(var(--v-theme-accent));
}

.rating-stat__value {
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
}
</style>
