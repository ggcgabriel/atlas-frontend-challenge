import { defineStore } from 'pinia'
import type { CatalogDraft } from '~/composables/useCatalogQuery'

/**
 * The filter panel's **draft** — what the user has ticked but not yet applied.
 *
 * The mock has an explicit "Aplicar filtros" button, so the panel is a form,
 * not a set of live controls: dragging a price slider must not fire a request
 * per pixel, and on mobile the same controls live in a drawer where applying on
 * every tap would refetch behind a sheet the user cannot see.
 *
 * Committed state lives in the URL (`useCatalogQuery`), never here. This store
 * holds no results and fetches nothing — it is the form buffer and that is all.
 * Chips, search and sort bypass it entirely and commit immediately, because
 * those are single decisions with nothing to batch.
 */
export const useCatalogStore = defineStore('catalog', () => {
  const draft = ref<CatalogDraft>({})

  /** Seeds the buffer from the committed query — call when the panel opens. */
  function sync(committed: CatalogDraft) {
    draft.value = { ...committed }
  }

  function set<K extends keyof CatalogDraft>(key: K, value: CatalogDraft[K]) {
    draft.value = { ...draft.value, [key]: value }
  }

  function setPriceRange(minCents?: number, maxCents?: number) {
    draft.value = { ...draft.value, minPrice: minCents, maxPrice: maxCents }
  }

  function clear() {
    draft.value = {}
  }

  /** True when the buffer differs from what is currently applied. */
  function isDirty(committed: CatalogDraft): boolean {
    const keys = new Set([
      ...Object.keys(committed),
      ...Object.keys(draft.value),
    ]) as Set<keyof CatalogDraft>

    for (const key of keys) {
      if ((committed[key] ?? undefined) !== (draft.value[key] ?? undefined)) {
        return true
      }
    }
    return false
  }

  return { draft, sync, set, setPriceRange, clear, isDirty }
})
