<script setup lang="ts">
const { query, commit, clearAll } = useCatalogQuery()

const { data: filters } = useCatalogFilters()

const {
  items,
  total,
  hasMore,
  isLoading,
  isLoadingMore,
  isEmpty,
  error,
  loadMoreError,
  autoLoadPaused,
  loadMoreAuto,
  loadMoreManual,
} = useProfessionalCatalog(query)

const liveCount = computed(() =>
  isLoading.value
    ? ''
    : `Mostrando ${formatCount(items.value.length)} de ${formatCount(total.value)} profissionais.`,
)

const category = computed({
  get: () => query.value.category ?? null,
  set: (value: string | null) =>
    commit({ category: value ?? undefined, profession: undefined }),
})

const heading = computed(() => {
  const selected = filters.value?.professions.find(
    (p) => p.slug === query.value.profession,
  )
  if (selected) return `${selected.namePlural} perto de você`
  if (query.value.category) return `${query.value.category} perto de você`
  return 'Profissionais de reforma e manutenção'
})

const subtitle = computed(() => {
  if (isLoading.value) return 'Carregando profissionais…'
  const noun =
    total.value === 1 ? 'profissional disponível' : 'profissionais disponíveis'
  const where = query.value.city
    ? `em ${query.value.city} e cidades vizinhas`
    : 'em todo o Brasil'
  return `${formatCount(total.value)} ${noun} ${where}`
})

useSeoMeta({
  title: 'AtlasHirePro — profissionais de reforma e manutenção',
  description:
    'Encontre eletricistas, encanadores, pintores, marceneiros e mais. Compare preço, avaliação, experiência e região.',
})
</script>

<template>
  <div class="page">
    <div class="page__categories">
      <div class="app-shell">
        <CategoryChips
          v-model="category"
          :categories="filters?.categories ?? []"
        />
      </div>
    </div>

    <div class="app-shell page__body">
      <CatalogSidebar />

      <div class="page__results">
        <div class="page__heading">
          <div class="page__heading-text">
            <h1 class="page__title">{{ heading }}</h1>
            <p class="page__subtitle">{{ subtitle }}</p>
          </div>

          <CatalogSortSelect class="page__sort" />
        </div>

        <ActiveFilterChips />

        <v-alert v-if="error" type="error" variant="tonal" class="mb-6">
          Não foi possível carregar o catálogo. {{ error.message }}
        </v-alert>

        <ProfessionalGrid
          :items="items"
          :is-loading="isLoading"
          :is-empty="isEmpty"
          @clear="clearAll"
        />

        <p class="visually-hidden" role="status" aria-live="polite">
          {{ liveCount }}
        </p>

        <div v-if="hasMore" class="page__more">
          <InfiniteScrollSentinel
            :disabled="autoLoadPaused"
            @load="loadMoreAuto"
          />

          <p class="text-body-2 text-medium-emphasis mb-3">
            {{ formatCount(items.length) }} de {{ formatCount(total) }}
          </p>

          <v-alert
            v-if="loadMoreError"
            type="error"
            variant="tonal"
            density="compact"
            class="mb-3"
          >
            {{ loadMoreError }}
          </v-alert>

          <v-btn
            variant="outlined"
            size="large"
            rounded="pill"
            class="text-none px-8"
            :loading="isLoadingMore"
            @click="loadMoreManual"
          >
            {{ loadMoreError ? 'Tentar novamente' : 'Carregar mais profissionais' }}
          </v-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page__categories {
  position: sticky;
  inset-block-start: var(--app-header-h);
  z-index: 1004;
  background: rgb(var(--v-theme-background));
  border-block-end: 1px solid rgb(20 22 26 / 8%);
}

.page__body {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 24px;
  padding-block: 24px 56px;
}

@media (min-width: 1280px) {
  .page__body {
    grid-template-columns: 280px minmax(0, 1fr);
    gap: 32px;
  }
}

.page__results {
  min-inline-size: 0;
}

.page__heading {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-block-end: 16px;
}

@media (min-width: 720px) {
  .page__heading {
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
  }
}

.page__title {
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 2rem;
}

@media (min-width: 960px) {
  .page__title {
    font-size: 1.875rem;
    line-height: 2.375rem;
  }
}

.page__subtitle {
  margin: 4px 0 0;
  font-size: 0.875rem;
  color: rgb(var(--v-theme-on-surface) / 62%);
}

.page__sort {
  flex: 0 0 auto;
}

.page__more {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-block-start: 40px;
}
</style>
