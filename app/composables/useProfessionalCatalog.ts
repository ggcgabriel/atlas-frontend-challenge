import type {
  ProfessionalListItem,
  ProfessionalListResponse,
  ProfessionalQuery,
} from '#shared/types/professional'

export const CATALOG_PAGE_SIZE = 24

/**
 * How many pages the scroll sentinel may pull before the button takes over.
 *
 * Unbounded scrolling makes the footer unreachable — its links recede every
 * time you approach them — and lets the DOM grow without a ceiling.
 */
export const MAX_AUTO_LOADS = 4

export interface CatalogOptions {
  /** Overridable so a test can reach the handover without looping four times. */
  maxAutoLoads?: number
}

export function useProfessionalCatalog(
  query: MaybeRefOrGetter<ProfessionalQuery> = {},
  options: CatalogOptions = {},
) {
  const maxAutoLoads = options.maxAutoLoads ?? MAX_AUTO_LOADS

  const baseQuery = computed(() => ({
    limit: CATALOG_PAGE_SIZE,
    ...toValue(query),
  }))

  const extraItems = ref<ProfessionalListItem[]>([])
  const page = ref(1)
  const isLoadingMore = ref(false)
  const loadMoreError = ref<string | null>(null)
  const autoLoads = ref(0)

  function reset() {
    extraItems.value = []
    page.value = 1
    loadMoreError.value = null
    // Resetting the budget here rather than in a watcher is deliberate:
    // `reset()` runs from `onResponse`, which fires on a query change but not
    // on `loadMore` (that goes through `$fetch`) — exactly when a new result
    // set deserves a fresh budget.
    autoLoads.value = 0
  }

  const {
    data: firstPage,
    status,
    error,
    refresh,
  } = useFetch<ProfessionalListResponse>('/api/professionals', {
    query: baseQuery,
    watch: [baseQuery],
    onResponse: () => reset(),
  })

  const items = computed<ProfessionalListItem[]>(() => [
    ...(firstPage.value?.items ?? []),
    ...extraItems.value,
  ])

  const total = computed(() => firstPage.value?.total ?? 0)
  const hasMore = computed(() => items.value.length < total.value)
  /** True only for the very first load, so the grid shows skeletons once. */
  const isLoading = computed(() => status.value === 'pending')
  const isEmpty = computed(() => !isLoading.value && total.value === 0)

  async function loadMore() {
    if (isLoadingMore.value || !hasMore.value) return

    isLoadingMore.value = true
    loadMoreError.value = null
    const next = page.value + 1

    try {
      const response = await $fetch<ProfessionalListResponse>(
        '/api/professionals',
        { query: { ...baseQuery.value, page: next } },
      )
      extraItems.value.push(...response.items)
      page.value = next
    } catch {
      loadMoreError.value = 'Não foi possível carregar mais profissionais.'
    } finally {
      isLoadingMore.value = false
    }
  }

  /**
   * True while the scroll sentinel must stay quiet.
   *
   * `loadMoreError` is in here on purpose: the sentinel stays on screen after a
   * failure, so without this guard it would retry against a failing endpoint as
   * fast as the network allows.
   */
  const autoLoadPaused = computed(
    () =>
      isLoadingMore.value ||
      Boolean(loadMoreError.value) ||
      autoLoads.value >= maxAutoLoads,
  )

  /** Called by the scroll sentinel. Spends one unit of the budget. */
  async function loadMoreAuto() {
    // The observer can fire more than once before `disabled` reaches the DOM.
    // `loadMore()` already ignores re-entrant calls, but without this the
    // budget would be charged for a page that never loaded.
    if (autoLoadPaused.value || !hasMore.value) return
    autoLoads.value += 1
    await loadMore()
  }

  /** Called by the button. An explicit "keep going" refills the budget. */
  async function loadMoreManual() {
    autoLoads.value = 0
    await loadMore()
  }

  return {
    items,
    total,
    page,
    hasMore,
    isLoading,
    isLoadingMore,
    isEmpty,
    error,
    loadMoreError,
    loadMore,
    autoLoads,
    autoLoadPaused,
    loadMoreAuto,
    loadMoreManual,
    reset,
    refresh,
  }
}
