import { defineStore } from 'pinia'

export type CatalogViewMode = 'grid' | 'list'

/**
 * Presentation-only preferences that outlive a single page.
 *
 * Kept separate from the catalog store (Stage 4): this state never touches the
 * API and must not invalidate a result set when it changes.
 */
export const useUiStore = defineStore('ui', () => {
  const viewMode = ref<CatalogViewMode>('grid')
  const filtersDrawerOpen = ref(false)

  function setViewMode(mode: CatalogViewMode) {
    viewMode.value = mode
  }

  function toggleFiltersDrawer(open?: boolean) {
    filtersDrawerOpen.value = open ?? !filtersDrawerOpen.value
  }

  return { viewMode, filtersDrawerOpen, setViewMode, toggleFiltersDrawer }
})
