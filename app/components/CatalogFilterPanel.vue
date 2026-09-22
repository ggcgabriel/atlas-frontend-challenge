<script setup lang="ts">
/**
 * The filter form: price, service radius, seals, experience.
 *
 * Everything here edits the draft in `stores/catalog.ts` and only reaches the
 * URL on "Aplicar filtros". Live-committing would fire a request per slider
 * pixel, and inside the mobile drawer it would refetch behind a sheet the user
 * cannot see.
 */
const emit = defineEmits<{ applied: [] }>()

const catalog = useCatalogStore()
const { draft: committed, commit, clearAll, hasFilters } = useCatalogQuery()
const { data: filters } = useCatalogFilters()

// Seed the buffer from what is applied, and re-seed whenever that changes
// underneath us (a chip removed elsewhere, or the back button).
watch(committed, (value) => catalog.sync(value), {
  immediate: true,
  deep: true,
})

const priceFloor = computed(() =>
  Math.floor((filters.value?.priceRange.minCents ?? 0) / 100),
)
const priceCeil = computed(() =>
  Math.ceil((filters.value?.priceRange.maxCents ?? 50000) / 100),
)

/**
 * The slider works in whole BRL; the query and the API speak cents.
 *
 * A handle parked at either end means "no bound on this side", so it is written
 * back as `undefined` rather than as the current min or max — pinning the
 * boundary into the URL would filter out any professional a later reseed prices
 * outside today's range.
 */
const priceRange = computed<number[]>({
  get: () => [
    draftPrice(catalog.draft.minPrice, priceFloor.value),
    draftPrice(catalog.draft.maxPrice, priceCeil.value),
  ],
  set: (value) => {
    const [min = priceFloor.value, max = priceCeil.value] = value
    catalog.setPriceRange(
      min <= priceFloor.value ? undefined : min * 100,
      max >= priceCeil.value ? undefined : max * 100,
    )
  },
})

function draftPrice(cents: number | undefined, fallback: number): number {
  return cents === undefined ? fallback : Math.round(cents / 100)
}

/** Read-back labels under the slider, in cents for the shared formatter. */
const priceFromCents = computed(() => (priceRange.value[0] ?? 0) * 100)
const priceToCents = computed(() => (priceRange.value[1] ?? 0) * 100)

const RADIUS_OPTIONS = [
  { label: 'Atende até 10 km', value: 10 },
  { label: 'Atende até 20 km', value: 20 },
  { label: 'Atende até 30 km', value: 30 },
  { label: 'Qualquer distância', value: null },
]

const EXPERIENCE_OPTIONS = [
  { label: 'Mais de 5 anos', value: 5 },
  { label: 'Mais de 10 anos', value: 10 },
  { label: 'Mais de 20 anos', value: 20 },
  { label: 'Qualquer experiência', value: null },
]

// v-radio-group needs a concrete value; `null` is the "no filter" option.
const radius = computed({
  get: () => catalog.draft.minRadiusKm ?? null,
  set: (value: number | null) => catalog.set('minRadiusKm', value ?? undefined),
})

const experience = computed({
  get: () => catalog.draft.minExperience ?? null,
  set: (value: number | null) =>
    catalog.set('minExperience', value ?? undefined),
})

function seal(key: 'verifiedOnly' | 'urgentOnly' | 'freeQuoteOnly') {
  return computed({
    get: () => catalog.draft[key] ?? false,
    set: (value: boolean) => catalog.set(key, value || undefined),
  })
}

const verified = seal('verifiedOnly')
const urgent = seal('urgentOnly')
const freeQuote = seal('freeQuoteOnly')

function apply() {
  commit(catalog.draft)
  emit('applied')
}

function clear() {
  catalog.clear()
  clearAll()
  emit('applied')
}
</script>

<template>
  <div class="filters">
    <div class="filters__head">
      <h2 class="filters__title">Filtros</h2>
      <button
        type="button"
        class="filters__clear"
        :disabled="!hasFilters"
        @click="clear"
      >
        Limpar
      </button>
    </div>

    <!--
      Real fieldsets: each group needs one accessible name, and without them a
      screen reader reads "Até 10 km" with no idea what it qualifies. The legend
      is visually hidden because the styled heading above it is already the
      label sighted users read.
    -->
    <fieldset class="filters__group">
      <legend class="visually-hidden">Valor por hora</legend>
      <p class="filters__label" aria-hidden="true">Valor por hora</p>

      <v-range-slider
        v-model="priceRange"
        :min="priceFloor"
        :max="priceCeil"
        :step="5"
        color="primary"
        track-color="rgb(20 22 26 / 12%)"
        hide-details
        class="filters__slider"
        aria-label="Faixa de valor por hora, em reais"
      />

      <div class="filters__range">
        <span class="filters__range-item">
          <span class="filters__range-label">De</span>
          <output class="filters__range-value">
            {{ formatBRL(priceFromCents) }}
          </output>
        </span>
        <span class="filters__range-item">
          <span class="filters__range-label">Até</span>
          <output class="filters__range-value">
            {{ formatBRL(priceToCents) }}
          </output>
        </span>
      </div>
    </fieldset>

    <v-divider class="filters__divider" />

    <fieldset class="filters__group">
      <legend class="visually-hidden">Raio de atendimento</legend>
      <p class="filters__label" aria-hidden="true">Raio de atendimento</p>

      <v-radio-group v-model="radius" hide-details density="compact">
        <v-radio
          v-for="option in RADIUS_OPTIONS"
          :key="option.label"
          :label="option.label"
          :value="option.value"
          color="primary"
        />
      </v-radio-group>
    </fieldset>

    <v-divider class="filters__divider" />

    <fieldset class="filters__group">
      <legend class="visually-hidden">Selos e garantias</legend>
      <p class="filters__label" aria-hidden="true">Selos e garantias</p>

      <v-checkbox
        v-model="verified"
        label="Documento verificado"
        color="primary"
        density="compact"
        hide-details
      />
      <v-checkbox
        v-model="urgent"
        label="Atende urgência"
        color="primary"
        density="compact"
        hide-details
      />
      <v-checkbox
        v-model="freeQuote"
        label="Orçamento gratuito"
        color="primary"
        density="compact"
        hide-details
      />
    </fieldset>

    <v-divider class="filters__divider" />

    <fieldset class="filters__group">
      <legend class="visually-hidden">Experiência</legend>
      <p class="filters__label" aria-hidden="true">Experiência</p>

      <v-radio-group v-model="experience" hide-details density="compact">
        <v-radio
          v-for="option in EXPERIENCE_OPTIONS"
          :key="option.label"
          :label="option.label"
          :value="option.value"
          color="primary"
        />
      </v-radio-group>
    </fieldset>

    <v-btn
      color="primary"
      size="large"
      block
      rounded="lg"
      class="text-none mt-4"
      @click="apply"
    >
      Aplicar filtros
    </v-btn>
  </div>
</template>

<style scoped>
.filters {
  padding: 20px;
}

.filters__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-block-end: 8px;
}

.filters__title {
  font-size: 1rem;
  font-weight: 700;
}

.filters__clear {
  font-size: 0.8125rem;
  font-weight: 600;
  color: rgb(var(--v-theme-accent));
  cursor: pointer;
}

.filters__clear:disabled {
  color: rgb(var(--v-theme-on-surface) / 32%);
  cursor: default;
}

.filters__clear:focus-visible {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: 2px;
  border-radius: 4px;
}

.filters__group {
  border: 0;
  padding: 0;
  margin-block: 16px 0;
}

.filters__label {
  margin: 0 0 4px;
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgb(var(--v-theme-on-surface) / 55%);
}

.filters__slider {
  margin-block: 4px 0;
}

.filters__range {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.filters__range-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.filters__range-label {
  font-size: 0.75rem;
  color: rgb(var(--v-theme-on-surface) / 55%);
}

.filters__range-value {
  padding: 9px 12px;
  border-radius: var(--control-radius);
  background: var(--surface-muted);
  font-size: 0.875rem;
  font-weight: 600;
}

.filters__divider {
  margin-block-start: 16px;
  opacity: 0.6;
}

.filters :deep(.v-selection-control__wrapper) {
  margin-inline-start: -4px;
}

.filters :deep(.v-label) {
  font-size: 0.875rem;
  opacity: 1;
}
</style>
