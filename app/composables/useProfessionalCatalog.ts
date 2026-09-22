import type {
  ProfessionalListItem,
  ProfessionalListResponse,
  ProfessionalQuery,
} from '#shared/types/professional'

export const CATALOG_PAGE_SIZE = 24

export function useProfessionalCatalog(
  query: MaybeRefOrGetter<ProfessionalQuery> = {},
) {
  const baseQuery = computed(() => ({
    limit: CATALOG_PAGE_SIZE,
    ...toValue(query),
  }))

  const extraItems = ref<ProfessionalListItem[]>([])
  const page = ref(1)
  const isLoadingMore = ref(false)
  const loadMoreError = ref<string | null>(null)

  function reset() {
    extraItems.value = []
    page.value = 1
    loadMoreError.value = null
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
    reset,
    refresh,
  }
}
