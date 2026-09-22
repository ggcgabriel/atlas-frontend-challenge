// @vitest-environment nuxt
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { mockNuxtImport, registerEndpoint } from '@nuxt/test-utils/runtime'
import type {
  ProfessionalListItem,
  ProfessionalListResponse,
} from '#shared/types/professional'
import { useProfessionalCatalog } from './useProfessionalCatalog'

/**
 * `useFetch` is mocked rather than served, because the unit under test is our
 * accumulation and budget logic — not Nuxt's fetching. The holder lets each
 * test drive what "page 1" currently is.
 *
 * `holder.options` captures what the composable passed to `useFetch`, so a test
 * can fire its `onResponse` by hand and assert the reset wiring without a real
 * request.
 */
const holder = vi.hoisted(() => ({
  data: null as never,
  status: null as never,
  error: null as never,
  options: null as never,
}))

mockNuxtImport('useFetch', () => (_url: string, options: never) => {
  holder.options = options
  return {
    data: holder.data,
    status: holder.status,
    error: holder.error,
    refresh: vi.fn(),
  } as never
})

/**
 * `loadMore` uses `$fetch`, which Nuxt auto-imports from a virtual module
 * rather than reading off `globalThis` — so `vi.stubGlobal('$fetch', …)` does
 * nothing here. `registerEndpoint` is the supported interception point.
 */
const server = vi.hoisted(() => ({
  paths: [] as string[],
  reply: null as null | (() => unknown),
}))

registerEndpoint('/api/professionals', (event: { path?: string }) => {
  server.paths.push(event?.path ?? '')
  if (!server.reply) throw new Error('no reply configured for this test')
  return server.reply()
})

function item(id: number): ProfessionalListItem {
  return { id, slug: `pro-${id}`, name: `Pro ${id}` } as ProfessionalListItem
}

function pageOf(ids: number[], total: number): ProfessionalListResponse {
  return {
    items: ids.map(item),
    total,
    page: 1,
    limit: 24,
    hasMore: ids.length < total,
  }
}

/** What the next `$fetch` for page 2+ should return. */
function nextPage(response: ProfessionalListResponse) {
  server.reply = () => response
}

/** Make the next `$fetch` fail, as a dropped connection would. */
function nextPageFails() {
  server.reply = () => {
    throw new Error('network')
  }
}

/** Seeds what `useFetch` currently holds for page 1. */
function seed(firstPage: ProfessionalListResponse | null, status = 'success') {
  holder.data = ref(firstPage) as never
  holder.status = ref(status) as never
  holder.error = ref(null) as never
}

beforeEach(() => {
  server.paths.length = 0
  server.reply = null
  seed(pageOf([1, 2, 3], 9))
})

describe('accumulation', () => {
  it('starts with just the server-rendered first page', () => {
    const { items, total } = useProfessionalCatalog()
    expect(items.value.map((i) => i.id)).toEqual([1, 2, 3])
    expect(total.value).toBe(9)
  })

  it('appends later pages after the first, in order', async () => {
    nextPage(pageOf([4, 5, 6], 9))
    const { items, loadMore, page } = useProfessionalCatalog()

    await loadMore()

    expect(items.value.map((i) => i.id)).toEqual([1, 2, 3, 4, 5, 6])
    expect(page.value).toBe(2)
    // The request really did ask for page 2, not page 1 again.
    expect(server.paths.at(-1)).toContain('page=2')
  })

  it('reports an empty result set only once loading has finished', () => {
    seed(pageOf([], 0), 'pending')
    expect(useProfessionalCatalog().isEmpty.value).toBe(false)

    seed(pageOf([], 0), 'success')
    expect(useProfessionalCatalog().isEmpty.value).toBe(true)
  })

  it('survives a null first page', () => {
    // SSR failure or an error response: the grid must render, not throw.
    seed(null)
    const { items, total, hasMore } = useProfessionalCatalog()
    expect(items.value).toEqual([])
    expect(total.value).toBe(0)
    expect(hasMore.value).toBe(false)
  })
})

describe('hasMore', () => {
  it('is true while fewer items are loaded than the total', () => {
    expect(useProfessionalCatalog().hasMore.value).toBe(true)
  })

  it('is false once the loaded count reaches the total', async () => {
    seed(pageOf([1, 2, 3], 6))
    nextPage(pageOf([4, 5, 6], 6))
    const { hasMore, loadMore } = useProfessionalCatalog()

    await loadMore()

    expect(hasMore.value).toBe(false)
  })

  it('stops loadMore from firing at the end of the set', async () => {
    seed(pageOf([1, 2, 3], 3))
    const { loadMore } = useProfessionalCatalog()

    await loadMore()

    expect(server.paths).toHaveLength(0)
  })
})

describe('failure handling', () => {
  it('surfaces a message and does not advance the page', async () => {
    nextPageFails()
    const { loadMore, loadMoreError, page, items } = useProfessionalCatalog()

    await loadMore()

    expect(loadMoreError.value).toBe(
      'Não foi possível carregar mais profissionais.',
    )
    // The page must not advance, or a retry would silently skip a page.
    expect(page.value).toBe(1)
    expect(items.value).toHaveLength(3)
  })

  it('clears the previous error when a retry succeeds', async () => {
    nextPageFails()
    const catalog = useProfessionalCatalog()
    await catalog.loadMore()
    expect(catalog.loadMoreError.value).not.toBeNull()

    nextPage(pageOf([4, 5, 6], 9))
    await catalog.loadMore()

    expect(catalog.loadMoreError.value).toBeNull()
    expect(catalog.page.value).toBe(2)
  })
})

describe('reset', () => {
  it('drops accumulated pages, the page counter, the error and the budget', async () => {
    nextPage(pageOf([4, 5, 6], 9))
    const catalog = useProfessionalCatalog()
    await catalog.loadMoreAuto()
    expect(catalog.items.value).toHaveLength(6)
    expect(catalog.autoLoads.value).toBe(1)

    catalog.reset()

    expect(catalog.items.value.map((i) => i.id)).toEqual([1, 2, 3])
    expect(catalog.page.value).toBe(1)
    expect(catalog.loadMoreError.value).toBeNull()
    expect(catalog.autoLoads.value).toBe(0)
  })

  it('is wired to useFetch onResponse, so a new query starts clean', async () => {
    nextPage(pageOf([4, 5, 6], 9))
    const catalog = useProfessionalCatalog()
    await catalog.loadMore()
    expect(catalog.page.value).toBe(2)

    // Simulate the response that arrives when the query changes.
    ;(holder.options as { onResponse: () => void }).onResponse()

    expect(catalog.page.value).toBe(1)
    expect(catalog.items.value).toHaveLength(3)
  })
})

describe('auto-load budget', () => {
  it('spends one unit per automatic page', async () => {
    nextPage(pageOf([4, 5, 6], 99))
    const { loadMoreAuto, autoLoads } = useProfessionalCatalog()

    await loadMoreAuto()
    await loadMoreAuto()

    expect(autoLoads.value).toBe(2)
  })

  it('hands over to the button once the budget runs out', async () => {
    nextPage(pageOf([4, 5, 6], 99))
    const { loadMoreAuto, autoLoadPaused } = useProfessionalCatalog(
      {},
      { maxAutoLoads: 2 },
    )

    await loadMoreAuto()
    expect(autoLoadPaused.value).toBe(false)
    await loadMoreAuto()

    expect(autoLoadPaused.value).toBe(true)

    server.paths.length = 0
    await loadMoreAuto()
    expect(server.paths).toHaveLength(0)
  })

  it('pauses on error, so a failed page cannot become a retry loop', async () => {
    // The sentinel stays on screen after a failure; without this guard it would
    // hammer a failing endpoint as fast as the network allows.
    nextPageFails()
    const { loadMoreAuto, autoLoadPaused } = useProfessionalCatalog()

    await loadMoreAuto()

    expect(autoLoadPaused.value).toBe(true)
  })

  it('does not charge the budget for a page that never loaded', async () => {
    // The observer can fire twice before `disabled` reaches the DOM.
    seed(pageOf([1, 2, 3], 3))
    const { loadMoreAuto, autoLoads } = useProfessionalCatalog()

    await loadMoreAuto()

    expect(autoLoads.value).toBe(0)
  })

  it('refills the budget on an explicit manual load', async () => {
    nextPage(pageOf([4, 5, 6], 99))
    const catalog = useProfessionalCatalog({}, { maxAutoLoads: 1 })

    await catalog.loadMoreAuto()
    expect(catalog.autoLoadPaused.value).toBe(true)

    await catalog.loadMoreManual()

    expect(catalog.autoLoads.value).toBe(0)
    expect(catalog.autoLoadPaused.value).toBe(false)
  })
})
