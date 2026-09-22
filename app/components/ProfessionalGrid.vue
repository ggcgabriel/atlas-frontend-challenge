<script setup lang="ts">
import { mdiMagnifyClose } from '@mdi/js'
import type { ProfessionalListItem } from '#shared/types/professional'

withDefaults(
  defineProps<{
    items: ProfessionalListItem[]
    isLoading?: boolean
    isEmpty?: boolean
    priorityCount?: number
    skeletonCount?: number
  }>(),
  { priorityCount: 4, skeletonCount: 6 },
)

defineEmits<{ clear: [] }>()
</script>

<template>
  <div>
    <div v-if="isLoading" class="pro-grid">
      <ProfessionalCardSkeleton v-for="n in skeletonCount" :key="n" />
    </div>

    <div v-else-if="isEmpty" class="pro-grid__empty app-card">
      <v-icon
        :icon="mdiMagnifyClose"
        size="36"
        class="text-medium-emphasis mb-3"
        aria-hidden="true"
      />
      <p class="text-h6 mb-1">Nenhum profissional encontrado</p>
      <p class="text-body-2 text-medium-emphasis mb-4">
        Tente outro termo de busca ou remova alguns filtros.
      </p>
      <v-btn variant="outlined" class="text-none" @click="$emit('clear')">
        Limpar filtros
      </v-btn>
    </div>

    <!-- A <ul> so assistive tech announces how many results there are. -->
    <ul v-else class="pro-grid pro-grid--list">
      <li v-for="(pro, index) in items" :key="pro.id">
        <ProfessionalCard
          :professional="pro"
          :priority="index < priorityCount"
        />
      </li>
    </ul>
  </div>
</template>

<style scoped>
.pro-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 12px;
}

.pro-grid--list {
  list-style: none;
  padding: 0;
  margin: 0;
}

@media (min-width: 960px) {
  .pro-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }
}

.pro-grid__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 56px 16px;
}
</style>
