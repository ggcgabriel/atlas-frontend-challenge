<script setup lang="ts">
/**
 * The catalog listing.
 *
 * Filter state lives in the URL (`useCatalogQuery`), so this page renders
 * filtered on the server: a shared link arrives at the same result set its
 * author saw, with no client-side re-fetch flashing the unfiltered list first.
 */
const { query, commit, clearAll } = useCatalogQuery()

// Neither call is awaited: Nuxt resolves pending asyncData before it renders on
// the server anyway, so leaving them unawaited lets the two requests run in
// parallel instead of filters-then-professionals.
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
  loadMore,
} = useProfessionalCatalog(query)

/**
 * Infinite scroll, with a budget.
 *
 * Auto-loading stops after `MAX_AUTO_LOADS` consecutive pages and hands back to
 * the button. Two reasons, both real: an unbounded scroll makes the footer
 * unreachable (its links recede every time you approach them), and 520 cards in
 * the DOM is a cost nobody asked for. Pressing the button is an explicit "keep
 * going", so it refills the budget.
 */
const MAX_AUTO_LOADS = 4
const autoLoads = ref(0)

/**
 * Pausing on `loadMoreError` is what stops a failed request becoming a hot
 * loop: the sentinel stays on screen after a failure, so without this it would
 * retry against a failing endpoint as fast as the network allows.
 */
const autoLoadPaused = computed(
  () =>
    isLoadingMore.value ||
    Boolean(loadMoreError.value) ||
    autoLoads.value >= MAX_AUTO_LOADS,
)

async function loadMoreAuto() {
  // The observer can fire more than once before `disabled` reaches the DOM.
  // `loadMore()` already ignores re-entrant calls, but without this guard the
  // budget would still be charged for a page that never loaded.
  if (autoLoadPaused.value || !hasMore.value) return
  autoLoads.value += 1
  await loadMore()
}

async function loadMoreManual() {
  autoLoads.value = 0
  await loadMore()
}

// A new query is a new result set; the previous budget has nothing to do with it.
watch(query, () => {
  autoLoads.value = 0
})

const liveCount = computed(() =>
  isLoading.value
    ? ''
    : `Mostrando ${formatCount(items.value.length)} de ${formatCount(total.value)} profissionais.`,
)

const category = computed({
  get: () => query.value.category ?? null,
  // Picking a category clears a profession filter — the narrower one would
  // otherwise silently win and the chips would contradict each other.
  set: (value: string | null) =>
    commit({ category: value ?? undefined, profession: undefined }),
})

/** "Pedreiros perto de você" when a profession is selected, else the segment. */
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

        <ActiveFilterChips class="mb-5" />

        <v-alert v-if="error" type="error" variant="tonal" class="mb-6">
          Não foi possível carregar o catálogo. {{ error.message }}
        </v-alert>

        <ProfessionalGrid
          :items="items"
          :is-loading="isLoading"
          :is-empty="isEmpty"
          @clear="clearAll"
        />

        <!--
          Announces the new count after each page. `role="status"` stays quiet
          on first render and only speaks on change, which is exactly the
          "24 more results arrived" signal a scroll-driven list otherwise hides
          from anyone not watching the screen.
        -->
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

          <!--
            Kept, and not merely as a fallback for browsers without an observer:
            it is the only way to continue for keyboard and screen-reader users,
            the retry after a failed page, and the control that resumes
            auto-loading once the budget below runs out.
          -->
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
/* Sits directly under the sticky header — see --app-header-h in tokens.css. */
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

/* The sidebar only earns a column where one fits beside two cards. */
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

/* The sort control is secondary on a phone; it drops below the heading and
   aligns left rather than competing with the h1 for the same row. */
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
