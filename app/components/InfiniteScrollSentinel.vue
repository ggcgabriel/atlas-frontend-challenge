<script setup lang="ts">

const props = withDefaults(
  defineProps<{
    disabled?: boolean
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
  if (typeof IntersectionObserver === 'undefined') return

  observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) emit('load')
    },
    { rootMargin: props.rootMargin },
  )
  observer.observe(root.value)
}

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
  <div ref="root" class="sentinel" aria-hidden="true" />
</template>

<style scoped>
.sentinel {
  block-size: 1px;
  inline-size: 100%;
}
</style>
