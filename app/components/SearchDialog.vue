<script setup lang="ts">
import { mdiClose, mdiMagnify } from '@mdi/js'

const open = defineModel<boolean>({ required: true })

const { query, commit } = useCatalogQuery()
const { data: filters } = useCatalogFilters()

const term = ref('')
const profession = ref<string | null>(null)
const city = ref<string | null>(null)

watch(open, (isOpen) => {
  if (!isOpen) return
  term.value = query.value.q ?? ''
  profession.value = query.value.profession ?? null
  city.value = query.value.city ?? null
})

const professionItems = computed(() =>
  (filters.value?.professions ?? []).map((p) => ({
    title: p.name,
    value: p.slug,
  })),
)

const cityItems = computed(() => filters.value?.cities ?? [])

function submit() {
  commit({
    q: term.value.trim() || undefined,
    profession: profession.value ?? undefined,
    city: city.value ?? undefined,
    category: profession.value ? undefined : query.value.category,
  })
  open.value = false
}

function clear() {
  term.value = ''
  profession.value = null
  city.value = null
}
</script>

<template>
  <v-dialog v-model="open" max-width="520" :fullscreen="$vuetify.display.xs">
    <v-card class="search-dialog" rounded="xl">
      <div class="search-dialog__head">
        <h2 class="text-h6 font-weight-bold">Buscar profissionais</h2>
        <v-btn
          :icon="mdiClose"
          variant="text"
          size="small"
          aria-label="Fechar busca"
          @click="open = false"
        />
      </div>

      <v-form class="search-dialog__body" @submit.prevent="submit">
        <v-text-field
          v-model="term"
          label="O que você precisa"
          placeholder="Ex.: pintor, vazamento, drywall"
          :prepend-inner-icon="mdiMagnify"
          rounded="lg"
          autofocus
          clearable
        />

        <v-select
          v-model="profession"
          :items="professionItems"
          label="Profissão"
          placeholder="Qualquer profissão"
          rounded="lg"
          clearable
        />

        <v-select
          v-model="city"
          :items="cityItems"
          label="Onde"
          placeholder="Todo o Brasil"
          rounded="lg"
          clearable
        />

        <div class="search-dialog__actions">
          <v-btn variant="text" class="text-none" @click="clear">Limpar</v-btn>
          <v-btn
            type="submit"
            color="primary"
            size="large"
            rounded="pill"
            class="text-none px-8"
            :prepend-icon="mdiMagnify"
          >
            Buscar
          </v-btn>
        </div>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.search-dialog__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 20px 20px 4px;
}

.search-dialog__body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px 20px 20px;
}

.search-dialog__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-block-start: 8px;
}
</style>
