<script setup lang="ts">
import { mdiHeartOutline } from '@mdi/js'
import type { ProfessionalListResponse } from '#shared/types/professional'

/**
 * The favourites the visitor saved, resolved back into full cards.
 *
 * Deliberately **not** server-rendered: favourites live in localStorage and are
 * hydrated after mount (see `plugins/favorites.client.ts`), so the server has no
 * idea what to fetch. SSR'ing it would emit an empty list into the HTML and then
 * contradict itself on the client. `server: false` makes that explicit rather
 * than accidental.
 *
 * One request for the whole set via the `ids` param, not one request per card.
 */
const favorites = useFavoritesStore()

const { data, status, refresh } = await useFetch<ProfessionalListResponse>(
  '/api/professionals',
  {
    query: computed(() => ({
      ids: favorites.ids.join(','),
      limit: 60,
    })),
    // Nothing to ask for until the store has read the browser.
    immediate: false,
    server: false,
    watch: [() => favorites.ids],
  },
)

/**
 * Two ways in, both needed.
 *
 * On a cold load the store hydrates on `app:mounted` — after this component's
 * `onMounted` — and the watcher above catches the ids arriving. On a
 * client-side navigation the store is *already* hydrated, so nothing changes
 * and the watcher never fires; this kick covers that case.
 */
onMounted(() => {
  if (favorites.isHydrated && favorites.count > 0) refresh()
})

const items = computed(() => data.value?.items ?? [])
const isLoading = computed(
  () => !favorites.isHydrated || status.value === 'pending',
)
const isEmpty = computed(() => favorites.isHydrated && favorites.count === 0)

useSeoMeta({
  title: 'Seus favoritos | AtlasHirePro',
  // Personal, per-browser and empty to a crawler — there is nothing to index.
  robots: 'noindex',
})
</script>

<template>
  <div class="app-shell favorites">
    <h1 class="favorites__title">Seus favoritos</h1>
    <p class="favorites__subtitle">
      <template v-if="isEmpty">Nenhum profissional salvo ainda.</template>
      <template v-else-if="favorites.isHydrated">
        {{ formatCount(favorites.count) }}
        {{
          favorites.count === 1 ? 'profissional salvo' : 'profissionais salvos'
        }}
        neste navegador
      </template>
      <template v-else>Carregando…</template>
    </p>

    <div v-if="isEmpty" class="favorites__empty app-card">
      <v-icon
        :icon="mdiHeartOutline"
        size="36"
        class="text-medium-emphasis mb-3"
        aria-hidden="true"
      />
      <p class="text-h6 mb-1">Sua lista está vazia</p>
      <p class="text-body-2 text-medium-emphasis mb-4">
        Toque no coração de um profissional para salvá-lo aqui.
      </p>
      <v-btn to="/" color="primary" rounded="pill" class="text-none px-6">
        Ver o catálogo
      </v-btn>
    </div>

    <ProfessionalGrid
      v-else
      :items="items"
      :is-loading="isLoading"
      :skeleton-count="Math.min(favorites.count || 2, 6)"
    />
  </div>
</template>

<style scoped>
.favorites {
  padding-block: 28px 56px;
}

.favorites__title {
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.favorites__subtitle {
  margin: 4px 0 20px;
  font-size: 0.875rem;
  color: rgb(var(--v-theme-on-surface) / 62%);
}

.favorites__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 56px 16px;
}
</style>
