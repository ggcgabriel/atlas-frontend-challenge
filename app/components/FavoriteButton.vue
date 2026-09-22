<script setup lang="ts">
import { mdiHeart, mdiHeartOutline } from '@mdi/js'

const props = defineProps<{
  professionalId: number
  professionalName: string
}>()

const favorites = useFavoritesStore()
const isFavorite = computed(() => favorites.isFavorite(props.professionalId))

const label = computed(() =>
  isFavorite.value
    ? `Remover ${props.professionalName} dos favoritos`
    : `Salvar ${props.professionalName} nos favoritos`,
)
</script>

<template>
  <button
    type="button"
    class="favorite-button"
    :aria-label="label"
    :aria-pressed="isFavorite"
    @click="favorites.toggle(professionalId)"
  >
    <v-icon
      :icon="isFavorite ? mdiHeart : mdiHeartOutline"
      size="19"
      :class="isFavorite ? 'text-error' : 'favorite-button__outline'"
      aria-hidden="true"
    />
  </button>
</template>

<style scoped>
.favorite-button {
  position: relative;
  z-index: 2;
  display: grid;
  place-items: center;
  inline-size: 34px;
  block-size: 34px;
  border: 1px solid rgb(20 22 26 / 14%);
  border-radius: 10px;
  background: rgb(var(--v-theme-surface));
  cursor: pointer;
  transition:
    transform 120ms ease,
    border-color 120ms ease;
}

.favorite-button:hover {
  transform: scale(1.06);
  border-color: rgb(20 22 26 / 32%);
}

.favorite-button:active {
  transform: scale(0.92);
}

.favorite-button:focus-visible {
  outline: 2px solid rgb(var(--v-theme-on-surface));
  outline-offset: 2px;
}

.favorite-button__outline {
  color: rgb(var(--v-theme-on-surface) / 70%);
}

@media (prefers-reduced-motion: reduce) {
  .favorite-button {
    transition: none;
  }

  .favorite-button:hover,
  .favorite-button:active {
    transform: none;
  }
}
</style>
