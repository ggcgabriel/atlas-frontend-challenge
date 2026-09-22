<script setup lang="ts">
import { mdiClose } from '@mdi/js'

/**
 * One filter panel, two containers: a sticky card on wide screens and a drawer
 * below them. The panel itself knows nothing about either — the state lives in
 * the store, so opening the drawer does not reset what the card had.
 */
const ui = useUiStore()

// Focus goes back to whatever opened the drawer. Without this it lands on
// <body> and a keyboard user restarts from the top of the page.
const opener = ref<HTMLElement | null>(null)

watch(
  () => ui.filtersDrawerOpen,
  (open) => {
    if (open) {
      opener.value = document.activeElement as HTMLElement | null
    } else {
      opener.value?.focus?.()
      opener.value = null
    }
  },
)
</script>

<template>
  <aside class="sidebar" aria-label="Filtros do catálogo">
    <div class="sidebar__card app-card">
      <CatalogFilterPanel />
    </div>

    <v-navigation-drawer
      v-model="ui.filtersDrawerOpen"
      temporary
      location="start"
      width="340"
      class="sidebar__drawer"
    >
      <div class="sidebar__drawer-head">
        <span class="text-subtitle-2 font-weight-bold">Filtrar resultados</span>
        <v-btn
          :icon="mdiClose"
          variant="text"
          size="small"
          aria-label="Fechar filtros"
          @click="ui.toggleFiltersDrawer(false)"
        />
      </div>

      <CatalogFilterPanel @applied="ui.toggleFiltersDrawer(false)" />
    </v-navigation-drawer>
  </aside>
</template>

<style scoped>
/* The sticky card only exists where there is room for a column beside the
   results; everywhere else the drawer is the only entry point. */
.sidebar__card {
  display: none;
}

@media (min-width: 1280px) {
  .sidebar__card {
    display: block;
    position: sticky;
    /* Clears the header and the category bar that sticks under it. */
    inset-block-start: calc(var(--app-header-h) + 76px);
  }

  .sidebar__drawer {
    display: none;
  }
}

.sidebar__drawer-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 12px 0 20px;
}
</style>
