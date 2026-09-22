<script setup lang="ts">
import { mdiMagnify } from '@mdi/js'

/**
 * The header's search pill: a labelled summary of the current search that opens
 * the real form in a dialog.
 *
 * It is a <button> rather than a styled <div> so it is one tab stop with a
 * native activation, and the dialog it opens is where the actual inputs live —
 * two always-visible inputs in a 64px header cost more room than they earn on
 * a phone, which is the breakpoint the mock is drawn at.
 */
const { query } = useCatalogQuery()
const { data: filters } = useCatalogFilters()

const open = ref(false)

const serviceLabel = computed(() => {
  const { q, profession, category } = query.value
  if (q) return q
  if (profession) {
    const match = filters.value?.professions.find((p) => p.slug === profession)
    if (match) return match.name
  }
  return category ?? 'Qualquer serviço'
})

const whereLabel = computed(() => query.value.city ?? 'Todo o Brasil')
</script>

<template>
  <div class="search-field">
    <button
      type="button"
      class="pill"
      :aria-label="`Buscar. Serviço: ${serviceLabel}. Onde: ${whereLabel}. Abrir busca`"
      @click="open = true"
    >
      <span class="pill__text">
        <span class="pill__label" aria-hidden="true">Serviço · Onde</span>
        <span class="pill__value" aria-hidden="true">
          {{ serviceLabel }} · {{ whereLabel }}
        </span>
      </span>
      <!--
        No `color="white"` on the icon: that emits `text-white`, which lives in
        Vuetify's colors.css — the 40KB file Stage 1 deliberately dropped
        (`styles.colors: false`). The class has no rule behind it, so the icon
        fell back to currentColor and rendered ink-on-teal. The circle owns the
        colour instead, and the icon inherits it.
      -->
      <span class="pill__icon" aria-hidden="true">
        <v-icon :icon="mdiMagnify" size="18" />
      </span>
    </button>

    <SearchDialog v-model="open" />
  </div>
</template>

<style scoped>
.search-field {
  min-inline-size: 0;
}

.pill {
  display: flex;
  align-items: center;
  gap: 10px;
  inline-size: 100%;
  padding: 7px 7px 7px 16px;
  border-radius: 999px;
  background: var(--surface-muted);
  cursor: pointer;
  text-align: start;
  transition: background-color 150ms ease;
}

/* A warmer step down rather than a grey overlay — a black wash over the cream
   fill turns it muddy. */
.pill:hover {
  background: #efeade;
}

.pill:focus-visible {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: 2px;
}

.pill__text {
  display: flex;
  flex-direction: column;
  min-inline-size: 0;
  flex: 1 1 auto;
}

.pill__label {
  font-size: 0.625rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  line-height: 0.875rem;
  color: rgb(var(--v-theme-on-surface) / 55%);
}

.pill__value {
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: rgb(var(--v-theme-on-surface));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pill__icon {
  display: grid;
  place-items: center;
  inline-size: 34px;
  block-size: 34px;
  border-radius: 50%;
  background: rgb(var(--v-theme-primary));
  /* The glyph inherits this via currentColor — see the note in the template. */
  color: #fff;
  flex: 0 0 auto;
}

@media (prefers-reduced-motion: reduce) {
  .pill {
    transition: none;
  }
}
</style>
