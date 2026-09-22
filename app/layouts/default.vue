<script setup lang="ts">
import { mdiHeartOutline, mdiTune } from '@mdi/js'

const ui = useUiStore()
const favorites = useFavoritesStore()

/**
 * Affordances the mockup shows but this challenge does not build (auth,
 * professional onboarding, help centre). They render disabled rather than as
 * links to nowhere — an inert control that says so is honest; a 404 is not.
 */
const OUT_OF_SCOPE = 'Fora do escopo deste desafio'

const FOOTER_LINKS = ['Como funciona', 'Seja um profissional', 'Ajuda']
</script>

<template>
  <v-app>
    <header class="site-header">
      <div class="site-header__inner app-shell">
        <AppBrand class="site-header__brand" />

        <div class="site-header__search">
          <AppSearchField />
        </div>

        <div class="site-header__actions">
          <!--
            The count only renders once favourites have hydrated from storage,
            otherwise the server would render 0 and the client a number.
          -->
          <v-btn
            to="/favoritos"
            variant="text"
            size="small"
            class="text-none site-header__link"
            :prepend-icon="mdiHeartOutline"
          >
            Favoritos
            <span v-if="favorites.isHydrated && favorites.count" class="ms-1">
              ({{ favorites.count }})
            </span>
          </v-btn>

          <v-btn
            variant="text"
            size="small"
            class="text-none site-header__link"
            disabled
            :title="OUT_OF_SCOPE"
          >
            Sou profissional
          </v-btn>

          <v-btn
            variant="outlined"
            size="small"
            rounded="pill"
            class="text-none px-5 site-header__link"
            disabled
            :title="OUT_OF_SCOPE"
          >
            Entrar
          </v-btn>

          <!-- The only way into the filters below 1280px, where the sidebar
               card is not rendered. -->
          <v-btn
            variant="outlined"
            size="small"
            rounded="pill"
            class="text-none site-header__filters"
            :prepend-icon="mdiTune"
            @click="ui.toggleFiltersDrawer()"
          >
            Filtros
          </v-btn>
        </div>
      </div>
    </header>

    <v-main>
      <slot />
    </v-main>

    <footer class="site-footer">
      <div class="site-footer__inner app-shell">
        <div>
          <span class="site-footer__brand">
            <span>Atlas</span><span class="site-footer__accent">HirePro</span>
          </span>
          <p class="site-footer__note">
            Atlas Technologies — desafio técnico front-end
          </p>
        </div>

        <ul class="site-footer__links">
          <li v-for="link in FOOTER_LINKS" :key="link">
            <button
              type="button"
              class="site-footer__link"
              disabled
              :title="OUT_OF_SCOPE"
            >
              {{ link }}
            </button>
          </li>
        </ul>
      </div>
    </footer>

    <AppBottomNav />
  </v-app>
</template>

<style scoped>
.site-header {
  position: sticky;
  inset-block-start: 0;
  z-index: 1005;
  background: rgb(var(--v-theme-surface));
  border-block-end: 1px solid rgb(20 22 26 / 8%);
}

/* Equal `1fr` side tracks put the middle one at the centre of the header,
   rather than wherever the wordmark happens to end. The middle track carries
   the pill's width cap, and `minmax(0, …)` lets it shrink — the grid gives up
   width there before it overflows on a narrow screen. */
.site-header__inner {
  display: grid;
  grid-template-columns: 1fr minmax(0, 420px) 1fr;
  align-items: center;
  gap: 16px;
  block-size: var(--app-header-h);
}

/* `min-inline-size: 0` is what lets the pill's label ellipsize instead of
   pushing the track wider. */
.site-header__search {
  min-inline-size: 0;
}

.site-header__brand {
  justify-self: start;
}

.site-header__actions {
  display: flex;
  align-items: center;
  gap: 4px;
  justify-self: end;
}

/* Below `md` the header is the logo, the pill and the filters button — the
   account links do not fit and the bottom nav covers that ground anyway. */
.site-header__link {
  display: none;
}

.site-header__filters {
  display: inline-flex;
}

@media (min-width: 960px) {
  .site-header__link {
    display: inline-flex;
  }

  .site-header__actions {
    gap: 8px;
  }
}

/* Above 1280px the filter panel is permanently on screen, so the button that
   opens the drawer has nothing left to do. */
@media (min-width: 1280px) {
  .site-header__filters {
    display: none;
  }
}

.site-footer {
  background: rgb(var(--v-theme-secondary));
  color: rgb(255 255 255 / 82%);
  /* Clears the fixed bottom nav on phones. */
  padding-block-end: var(--app-bottomnav-h);
}

@media (min-width: 960px) {
  .site-footer {
    padding-block-end: 0;
  }
}

.site-footer__inner {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-block: 28px;
}

@media (min-width: 600px) {
  .site-footer__inner {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.site-footer__brand {
  font-size: 0.9375rem;
  font-weight: 800;
  color: #fff;
}

.site-footer__accent {
  color: rgb(var(--v-theme-accent));
}

.site-footer__note {
  margin: 2px 0 0;
  font-size: 0.75rem;
  color: rgb(255 255 255 / 55%);
}

.site-footer__links {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  list-style: none;
  padding: 0;
  margin: 0;
}

.site-footer__link {
  font-size: 0.8125rem;
  color: rgb(255 255 255 / 55%);
  cursor: default;
  background: none;
}
</style>
