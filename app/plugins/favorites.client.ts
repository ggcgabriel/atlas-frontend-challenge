/**
 * Loads favourites from localStorage after hydration.
 *
 * Client-only and deferred to `app:mounted` on purpose — see the comment in
 * stores/favorites.ts. Reading storage any earlier reintroduces the SSR/client
 * mismatch this indirection exists to avoid.
 */
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:mounted', () => {
    useFavoritesStore().hydrate()
  })
})
