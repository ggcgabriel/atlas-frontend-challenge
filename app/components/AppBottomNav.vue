<script setup lang="ts">
import {
  mdiAccountOutline,
  mdiClipboardTextOutline,
  mdiHeartOutline,
  mdiMagnify,
} from '@mdi/js'

/**
 * The phone-sized tab bar from the mockup.
 *
 * Buscar and Favoritos are real routes. Pedidos and Conta belong to a product
 * this challenge does not build (orders, auth), so they render as disabled
 * buttons rather than links to nowhere: a tab that navigates to a 404 is worse
 * than one that says it is not available.
 */
const route = useRoute()
const favorites = useFavoritesStore()

const items = [
  { label: 'Buscar', icon: mdiMagnify, to: '/' },
  { label: 'Favoritos', icon: mdiHeartOutline, to: '/favoritos' },
  { label: 'Pedidos', icon: mdiClipboardTextOutline, to: null },
  { label: 'Conta', icon: mdiAccountOutline, to: null },
]

function isCurrent(to: string | null): boolean {
  return to !== null && route.path === to
}
</script>

<template>
  <nav class="bottom-nav" aria-label="Navegação principal">
    <ul class="bottom-nav__list">
      <li v-for="item in items" :key="item.label" class="bottom-nav__cell">
        <NuxtLink
          v-if="item.to"
          :to="item.to"
          class="bottom-nav__item"
          :class="{ 'bottom-nav__item--active': isCurrent(item.to) }"
          :aria-current="isCurrent(item.to) ? 'page' : undefined"
        >
          <span class="bottom-nav__icon">
            <v-icon :icon="item.icon" size="21" aria-hidden="true" />
            <!--
              Gated on isHydrated: favourites are read from localStorage after
              mount, so rendering the count during SSR would print 0 and then
              change on the client — a hydration mismatch.
            -->
            <span
              v-if="
                item.to === '/favoritos' &&
                favorites.isHydrated &&
                favorites.count
              "
              class="bottom-nav__badge"
            >
              {{ favorites.count }}
            </span>
          </span>
          {{ item.label }}
        </NuxtLink>

        <button
          v-else
          type="button"
          class="bottom-nav__item bottom-nav__item--disabled"
          disabled
          title="Fora do escopo deste desafio"
        >
          <span class="bottom-nav__icon">
            <v-icon :icon="item.icon" size="21" aria-hidden="true" />
          </span>
          {{ item.label }}
        </button>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.bottom-nav {
  position: fixed;
  inset-inline: 0;
  inset-block-end: 0;
  z-index: 1006;
  background: rgb(var(--v-theme-surface));
  border-block-start: 1px solid rgb(20 22 26 / 10%);
  /* Clears the iOS home indicator. */
  padding-block-end: env(safe-area-inset-bottom, 0);
}

@media (min-width: 960px) {
  .bottom-nav {
    display: none;
  }
}

.bottom-nav__list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  list-style: none;
  padding: 0;
  margin: 0;
  block-size: var(--app-bottomnav-h);
}

.bottom-nav__cell {
  display: flex;
}

.bottom-nav__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  inline-size: 100%;
  font-size: 0.6875rem;
  font-weight: 600;
  text-decoration: none;
  color: rgb(var(--v-theme-on-surface) / 60%);
  background: none;
}

.bottom-nav__item--active {
  color: rgb(var(--v-theme-primary));
}

.bottom-nav__item--disabled {
  color: rgb(var(--v-theme-on-surface) / 32%);
  cursor: default;
}

.bottom-nav__item:focus-visible {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: -3px;
  border-radius: 8px;
}

.bottom-nav__icon {
  position: relative;
  display: grid;
  place-items: center;
}

.bottom-nav__badge {
  position: absolute;
  inset-block-start: -4px;
  inset-inline-start: 12px;
  min-inline-size: 16px;
  padding-inline: 4px;
  border-radius: 999px;
  background: rgb(var(--v-theme-accent));
  color: #fff;
  font-size: 0.625rem;
  line-height: 16px;
  text-align: center;
}
</style>
