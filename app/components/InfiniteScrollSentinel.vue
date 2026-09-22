<script setup lang="ts">
/**
 * Emits `load` when it scrolls into view.
 *
 * Pure mechanism — it owns no paging state. The parent decides *whether* more
 * should load (via `disabled`) and *what* loading means; this only reports
 * "the bottom is near".
 *
 * Client-only by construction: the observer is created in `onMounted`, so the
 * server render is an empty div and nothing here can break SSR.
 */
const props = withDefaults(
  defineProps<{
    /** While true, no observer exists and nothing is emitted. */
    disabled?: boolean
    /**
     * Start loading before the sentinel is actually visible, so the next page
     * is usually already in the DOM by the time the user reaches the end.
     */
    rootMargin?: string
  }>(),
  { disabled: false, rootMargin: '800px 0px' },
)

const emit = defineEmits<{ load: [] }>()

const root = useTemplateRef<HTMLElement>('root')
let observer: IntersectionObserver | null = null

function disconnect() {
  observer?.disconnect()
  observer = null
}

function observe() {
  disconnect()
  if (props.disabled || !root.value) return
  // Ancient browsers and some test environments have no IntersectionObserver.
  // Bailing leaves the parent's "Carregar mais" button as the only path, which
  // is exactly the intended fallback.
  if (typeof IntersectionObserver === 'undefined') return

  observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) emit('load')
    },
    { rootMargin: props.rootMargin },
  )
  observer.observe(root.value)
}

/**
 * Rebuild the observer whenever loading finishes.
 *
 * IntersectionObserver reports *transitions*, not states. On a tall viewport
 * the sentinel is often still on screen after the new cards render, so it never
 * crosses the boundary again and would never fire a second time. Tearing it
 * down and re-creating it forces a fresh evaluation of where it is now.
 */
watch(
  () => props.disabled,
  async (disabled) => {
    if (disabled) {
      disconnect()
      return
    }
    await nextTick()
    observe()
  },
)

onMounted(observe)
onBeforeUnmount(disconnect)
</script>

<template>
  <!-- Decorative: the live region in the parent is what announces new results. -->
  <div ref="root" class="sentinel" aria-hidden="true" />
</template>

<style scoped>
.sentinel {
  /* Needs a box to be observable at all — a zero-height element never
     intersects in some engines. */
  block-size: 1px;
  inline-size: 100%;
}
</style>
