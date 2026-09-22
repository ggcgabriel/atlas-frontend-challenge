import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', () => {
  const filtersDrawerOpen = ref(false)

  function toggleFiltersDrawer(open?: boolean) {
    filtersDrawerOpen.value = open ?? !filtersDrawerOpen.value
  }

  return { filtersDrawerOpen, toggleFiltersDrawer }
})
