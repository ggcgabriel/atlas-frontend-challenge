<script setup lang="ts">
import { mdiChevronLeft, mdiChevronRight } from '@mdi/js'

const props = defineProps<{
  categories: string[]
  modelValue?: string | null
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string | null] }>()

const scroller = ref<HTMLElement | null>(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)

function updateArrows() {
  const el = scroller.value
  if (!el) return
  canScrollLeft.value = el.scrollLeft > 4
  canScrollRight.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 4
}

function scrollBy(direction: 1 | -1) {
  scroller.value?.scrollBy({
    left: direction * Math.round(scroller.value.clientWidth * 0.8),
    behavior: 'smooth',
  })
}

const items = computed(() => [
  { value: null, label: 'Todos os serviços' },
  ...props.categories.map((category) => ({ value: category, label: category })),
])

onMounted(() => {
  updateArrows()
  window.addEventListener('resize', updateArrows, { passive: true })
})
onBeforeUnmount(() => window.removeEventListener('resize', updateArrows))
</script>

<template>
  <div class="chips">
    <button
      v-show="canScrollLeft"
      type="button"
      class="chips__arrow chips__arrow--start"
      aria-label="Rolar categorias para a esquerda"
      @click="scrollBy(-1)"
    >
      <v-icon :icon="mdiChevronLeft" size="18" aria-hidden="true" />
    </button>

    <div
      ref="scroller"
      class="chips__scroller"
      role="group"
      aria-label="Filtrar por categoria"
      tabindex="0"
      @scroll.passive="updateArrows"
    >
      <button
        v-for="item in items"
        :key="item.label"
        type="button"
        class="chips__item"
        :class="{ 'chips__item--active': modelValue === item.value }"
        :aria-pressed="modelValue === item.value"
        @click="emit('update:modelValue', item.value)"
      >
        <span
          v-if="item.value"
          class="chips__dot"
          :style="{ backgroundColor: categoryColor(item.value) }"
          aria-hidden="true"
        />
        {{ item.label }}
      </button>
    </div>

    <button
      v-show="canScrollRight"
      type="button"
      class="chips__arrow chips__arrow--end"
      aria-label="Rolar categorias para a direita"
      @click="scrollBy(1)"
    >
      <v-icon :icon="mdiChevronRight" size="18" aria-hidden="true" />
    </button>
  </div>
</template>

<style scoped>
.chips {
  position: relative;
}

.chips__scroller {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-block: 12px;
  scroll-behavior: smooth;
  scrollbar-width: none;
  /* Snap so a flick never leaves a chip half-cut. */
  scroll-snap-type: x proximity;
}

.chips__scroller::-webkit-scrollbar {
  display: none;
}

.chips__scroller:focus-visible {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: 2px;
  border-radius: 8px;
}

.chips__item {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  flex: 0 0 auto;
  padding: 8px 16px;
  border: 1px solid rgb(20 22 26 / 12%);
  border-radius: 999px;
  background: var(--surface-muted);
  font-size: 0.8125rem;
  font-weight: 600;
  white-space: nowrap;
  scroll-snap-align: start;
  cursor: pointer;
  transition:
    background-color 150ms ease,
    color 150ms ease,
    border-color 150ms ease;
}

.chips__item:hover {
  border-color: rgb(20 22 26 / 32%);
}

.chips__item--active {
  background: rgb(var(--v-theme-secondary));
  border-color: rgb(var(--v-theme-secondary));
  color: #fff;
}

.chips__item:focus-visible {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: 2px;
}

.chips__dot {
  inline-size: 6px;
  block-size: 6px;
  border-radius: 50%;
  flex: 0 0 auto;
}

.chips__arrow {
  position: absolute;
  inset-block-start: 50%;
  translate: 0 -50%;
  z-index: 2;
  display: grid;
  place-items: center;
  inline-size: 30px;
  block-size: 30px;
  border-radius: 50%;
  border: 1px solid rgb(20 22 26 / 18%);
  background: rgb(var(--v-theme-surface));
  cursor: pointer;
  box-shadow: 0 2px 6px rgb(0 0 0 / 12%);
}

.chips__arrow--start {
  inset-inline-start: -6px;
}

.chips__arrow--end {
  inset-inline-end: -6px;
}

.chips__arrow:focus-visible {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .chips__scroller {
    scroll-behavior: auto;
  }

  .chips__item {
    transition: none;
  }
}
</style>
