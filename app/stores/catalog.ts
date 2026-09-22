import { defineStore } from 'pinia'
import type { CatalogDraft } from '~/composables/useCatalogQuery'

export const useCatalogStore = defineStore('catalog', () => {
  const draft = ref<CatalogDraft>({})

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
