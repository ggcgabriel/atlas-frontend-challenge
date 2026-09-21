<script setup lang="ts">
import { mdiViewGridOutline, mdiViewListOutline } from '@mdi/js'

// Stage 1 smoke test: proves Vuetify SSR + theme, Pinia and the shared
// `shared/types` contract all resolve. Replaced by the real catalog in Stage 3.
const ui = useUiStore()

const placeholder: ProfessionalListItem = {
  id: 0,
  slug: 'exemplo',
  name: 'Catálogo em construção',
  avatarUrl: '',
  profession: 'Aguardando a Etapa 2',
  professionSlug: 'placeholder',
  hourlyRateCents: 0,
  rating: 0,
  reviewsCount: 0,
  city: 'São Paulo',
  state: 'SP',
  isAvailable: false,
}

useSeoMeta({
  title: 'Atlas Pro — catálogo de profissionais',
  description:
    'Encontre profissionais autônomos por especialidade, preço e avaliação.',
})
</script>

<template>
  <v-container class="py-8">
    <h1 class="text-h4 font-weight-bold mb-2">Catálogo de profissionais</h1>
    <p class="text-body-1 text-medium-emphasis mb-6">
      Etapa 1 concluída: Nuxt, Vuetify e Pinia rodando com SSR.
    </p>

    <v-btn-toggle
      :model-value="ui.viewMode"
      mandatory
      density="comfortable"
      variant="outlined"
      class="mb-6"
      @update:model-value="ui.setViewMode($event)"
    >
      <v-btn value="grid" :prepend-icon="mdiViewGridOutline">Grade</v-btn>
      <v-btn value="list" :prepend-icon="mdiViewListOutline">Lista</v-btn>
    </v-btn-toggle>

    <v-card max-width="420" border flat>
      <v-card-item>
        <v-card-title>{{ placeholder.name }}</v-card-title>
        <v-card-subtitle>{{ placeholder.profession }}</v-card-subtitle>
      </v-card-item>
      <v-card-text class="text-medium-emphasis">
        Modo de visualização atual: <strong>{{ ui.viewMode }}</strong>
      </v-card-text>
    </v-card>
  </v-container>
</template>
