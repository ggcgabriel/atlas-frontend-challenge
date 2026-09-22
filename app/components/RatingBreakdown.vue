<script setup lang="ts">
import type { RatingBreakdown } from '#shared/types/professional'

/**
 * The four criteria the overall score breaks down into.
 *
 * Each number is an `avg()` over this professional's review rows (see
 * `server/api/professionals/[slug].get.ts`), not a decoration derived from the
 * headline rating.
 */
const props = defineProps<{
  rating: number
  reviewsCount: number
  breakdown: RatingBreakdown
}>()

const rows = computed(() => [
  { label: 'Pontualidade', value: props.breakdown.punctuality },
  { label: 'Acabamento', value: props.breakdown.finish },
  { label: 'Limpeza', value: props.breakdown.cleanliness },
  { label: 'Custo-benefício', value: props.breakdown.value },
])
</script>

<template>
  <div class="breakdown">
    <div class="breakdown__overall">
      <p class="breakdown__score">{{ formatRating(rating) }}</p>
      <p class="breakdown__count">
        {{ formatCount(reviewsCount) }}
        {{ reviewsCount === 1 ? 'avaliação' : 'avaliações' }}
      </p>
    </div>

    <!--
      A definition list, so the criterion and its score are associated for
      assistive tech instead of being two neighbouring strings. The bar is
      aria-hidden: the number beside it already says the same thing.
    -->
    <dl class="breakdown__rows">
      <template v-for="row in rows" :key="row.label">
        <dt class="breakdown__label">{{ row.label }}</dt>
        <dd class="breakdown__bar-cell">
          <span class="breakdown__track" aria-hidden="true">
            <span
              class="breakdown__fill"
              :style="{ inlineSize: `${(row.value / 5) * 100}%` }"
            />
          </span>
        </dd>
        <dd class="breakdown__value">{{ formatRating(row.value) }}</dd>
      </template>
    </dl>
  </div>
</template>

<style scoped>
.breakdown {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

@media (min-width: 600px) {
  .breakdown {
    flex-direction: row;
    align-items: center;
    gap: 28px;
  }
}

.breakdown__overall {
  flex: 0 0 auto;
  text-align: center;
}

@media (min-width: 600px) {
  .breakdown__overall {
    padding-inline-end: 28px;
    border-inline-end: 1px solid rgb(20 22 26 / 10%);
    text-align: start;
  }
}

.breakdown__score {
  margin: 0;
  font-size: 2.25rem;
  font-weight: 800;
  line-height: 2.5rem;
  letter-spacing: -0.03em;
}

.breakdown__count {
  margin: 2px 0 0;
  font-size: 0.75rem;
  color: rgb(var(--v-theme-on-surface) / 60%);
}

.breakdown__rows {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px 12px;
  flex: 1 1 auto;
  margin: 0;
}

.breakdown__label {
  font-size: 0.75rem;
  color: rgb(var(--v-theme-on-surface) / 70%);
}

.breakdown__bar-cell,
.breakdown__value {
  margin: 0;
}

.breakdown__track {
  display: block;
  block-size: 6px;
  border-radius: 999px;
  background: rgb(20 22 26 / 8%);
  overflow: hidden;
}

.breakdown__fill {
  display: block;
  block-size: 100%;
  border-radius: 999px;
  background: rgb(var(--v-theme-primary));
}

.breakdown__value {
  font-size: 0.75rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
</style>
