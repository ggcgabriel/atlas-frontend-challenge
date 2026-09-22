<script setup lang="ts">
import type { ProfessionalSort } from '#shared/types/professional'
import { PROFESSIONAL_SORTS } from '#shared/types/professional'

/**
 * Ordering. Commits straight to the URL — one decision, nothing to batch.
 *
 * The options are derived from `PROFESSIONAL_SORTS`, the same const the zod
 * enum on the server reads, so the select cannot offer an order the API would
 * reject with a 400.
 */
const { query, commit } = useCatalogQuery()

const SORT_LABELS: Record<ProfessionalSort, string> = {
  relevance: 'Mais relevantes',
  rating_desc: 'Melhor avaliados',
  price_asc: 'Menor preço',
  price_desc: 'Maior preço',
  recent: 'Mais recentes',
}

const items = PROFESSIONAL_SORTS.map((value) => ({
  title: SORT_LABELS[value],
  value,
}))

const sort = computed({
  get: () => query.value.sort ?? 'relevance',
  set: (value: ProfessionalSort) => commit({ sort: value }),
})
</script>

<template>
  <div class="sort">
    <label for="catalog-sort" class="sort__label">Ordenar por</label>
    <v-select
      id="catalog-sort"
      v-model="sort"
      :items="items"
      density="compact"
      variant="outlined"
      hide-details
      rounded="lg"
      class="sort__select"
    />
  </div>
</template>

<style scoped>
.sort {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sort__label {
  font-size: 0.8125rem;
  color: rgb(var(--v-theme-on-surface) / 62%);
  white-space: nowrap;
}

.sort__select {
  inline-size: 190px;
  background: rgb(var(--v-theme-surface));
  border-radius: var(--control-radius);
}
</style>
