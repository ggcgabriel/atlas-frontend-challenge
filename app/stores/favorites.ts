import { defineStore } from 'pinia'

const STORAGE_KEY = 'atlas:favorites'

export const useFavoritesStore = defineStore('favorites', () => {
  const ids = ref<number[]>([])
  /** False until the browser has been read, so the UI can avoid flicker. */
  const isHydrated = ref(false)

  const count = computed(() => ids.value.length)

  function isFavorite(id: number): boolean {
    return ids.value.includes(id)
  }

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids.value))
    } catch {
      // Storage unavailable — favourites stay in memory for this session.
    }
  }

  function toggle(id: number) {
    const index = ids.value.indexOf(id)
    if (index === -1) ids.value.push(id)
    else ids.value.splice(index, 1)
    persist()
  }

  function hydrate() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed: unknown = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          ids.value = parsed.filter((v): v is number => typeof v === 'number')
        }
      }
    } catch {
      // Unreadable or corrupt — start clean rather than crashing the app.
    }
    isHydrated.value = true
  }

  return { ids, isHydrated, count, isFavorite, toggle, hydrate }
})
