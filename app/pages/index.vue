<script setup lang="ts">
import { mdiCheckDecagram, mdiFlash, mdiStar } from '@mdi/js'

// Stage 2 smoke test: proves SSR + Nitro + Postgres + the image pipeline all
// line up. The real catalog (grid, filters, infinite scroll) lands in Stage 3.
const { data, error } = await useFetch('/api/professionals', {
  query: { limit: 6, sort: 'rating_desc' },
})

const brl = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})
const formatRate = (cents: number) => `${brl.format(cents / 100)}/h`

useSeoMeta({
  title: 'Atlas Pro — profissionais de reforma e manutenção',
  description:
    'Encontre eletricistas, encanadores, pintores e marceneiros por preço, avaliação e região.',
})
</script>

<template>
  <v-container class="py-8">
    <h1 class="text-h4 font-weight-bold mb-2">Profissionais de reforma</h1>
    <p class="text-body-1 text-medium-emphasis mb-6">
      Etapa 2 concluída: {{ data?.total ?? 0 }} profissionais servidos pelo
      Postgres via Nitro.
    </p>

    <v-alert v-if="error" type="error" variant="tonal" class="mb-6">
      Falha ao carregar: {{ error.message }}
    </v-alert>

    <v-row>
      <v-col
        v-for="pro in data?.items ?? []"
        :key="pro.id"
        cols="12"
        sm="6"
        md="4"
      >
        <v-card border flat class="h-100">
          <div class="d-flex pa-4 ga-4">
            <!-- width/height are fixed and known, so the box never reflows -->
            <NuxtImg
              :src="pro.avatarUrl"
              :alt="`Foto de ${pro.name}`"
              width="72"
              height="72"
              sizes="72px"
              loading="lazy"
              class="rounded-lg flex-shrink-0"
              :style="{
                backgroundImage: `url(${pro.avatarLqip})`,
                backgroundSize: 'cover',
              }"
            />
            <div class="min-w-0">
              <div class="d-flex align-center ga-1">
                <span class="text-subtitle-1 font-weight-bold text-truncate">
                  {{ pro.name }}
                </span>
                <v-icon
                  v-if="pro.isVerified"
                  :icon="mdiCheckDecagram"
                  size="16"
                  color="primary"
                  :aria-label="`${pro.name} é verificado`"
                />
              </div>
              <div class="text-body-2 text-medium-emphasis">
                {{ pro.profession }} · {{ pro.city }}/{{ pro.state }}
              </div>
              <div class="d-flex align-center ga-1 mt-1">
                <v-icon :icon="mdiStar" size="14" color="warning" />
                <span class="text-body-2">
                  {{ pro.rating.toFixed(1) }}
                  <span class="text-medium-emphasis">
                    ({{ pro.reviewsCount }})
                  </span>
                </span>
                <v-icon
                  v-if="pro.acceptsUrgent"
                  :icon="mdiFlash"
                  size="14"
                  color="warning"
                  aria-label="Atende urgência"
                />
              </div>
              <div class="text-subtitle-2 font-weight-bold mt-2">
                {{ formatRate(pro.hourlyRateCents) }}
              </div>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
