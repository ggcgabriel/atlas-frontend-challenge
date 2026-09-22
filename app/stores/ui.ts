import { defineStore } from 'pinia'

/**
 * Presentation-only preferences that outlive a single page.
 *
 * Kept separate from the catalog store (Stage 4): this state never touches the
 * API and must not invalidate a result set when it changes.
 */
export const useUiStore = defineStore('ui', () => {
  const filtersDrawerOpen = ref(false)

  function toggleFiltersDrawer(open?: boolean) {
    filtersDrawerOpen.value = open ?? !filtersDrawerOpen.value
  }

  return { filtersDrawerOpen, toggleFiltersDrawer }
})
