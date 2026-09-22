<script setup lang="ts">
import { mdiClose } from '@mdi/js'
import type { CatalogFilterKey } from '~/composables/useCatalogQuery'

const { query, activeKeys, remove } = useCatalogQuery()
const { data: filters } = useCatalogFilters()

function labelFor(key: CatalogFilterKey): string {
  const value = query.value[key]

  switch (key) {
    case 'q':
      return `"${value}"`
    case 'profession': {
      const match = filters.value?.professions.find((p) => p.slug === value)
      return match?.name ?? String(value)
    }
    case 'category':
    case 'city':
      return String(value)
    case 'minPrice':
      return `A partir de ${formatBRL(Number(value))}`
    case 'maxPrice':
      return `Até ${formatBRL(Number(value))}`
    case 'minRadiusKm':
      return `Atende até ${value} km`
    case 'minExperience':
      return `Mais de ${value} anos`
    case 'verifiedOnly':
      return 'Documento verificado'
    case 'urgentOnly':
      return 'Atende urgência'
    case 'freeQuoteOnly':
      return 'Orçamento gratuito'
  }
}
</script>

<template>
  <ul v-if="activeKeys.length" class="active-filters">
    <li v-for="key in activeKeys" :key="key">
      <button type="button" class="active-filters__chip" @click="remove(key)">
        {{ labelFor(key) }}
        <v-icon :icon="mdiClose" size="14" aria-hidden="true" />
        <span class="visually-hidden">Remover filtro</span>
      </button>
    </li>
  </ul>
</template>

<style scoped>
.active-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  list-style: none;
  padding: 0;
  /*
    The gap below the chips lives here, not as an `mb-5` on the tag in the page.
    A scoped selector compiles to `.active-filters[data-v-…]`, which outranks a
    plain `.mb-5`, so the utility was silently losing and the chips sat flush
    against the grid.

    Owning it here is also more correct: the whole <ul> is behind a `v-if`, so
    the spacing disappears together with the chips instead of leaving a gap
    when no filter is active.
  */
  margin: 0 0 20px;
}

.active-filters__chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid rgb(20 22 26 / 14%);
  border-radius: 999px;
  background: rgb(var(--v-theme-surface));
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 150ms ease;
}

.active-filters__chip:hover {
  border-color: rgb(20 22 26 / 36%);
}

.active-filters__chip:focus-visible {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .active-filters__chip {
    transition: none;
  }
}
</style>
