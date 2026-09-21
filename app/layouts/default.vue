<script setup lang="ts">
import { mdiMagnify } from '@mdi/js'
</script>

<template>
  <v-app>
    <v-app-bar flat border="b" :height="64">
      <v-container class="d-flex align-center py-0">
        <NuxtLink to="/" class="text-decoration-none text-high-emphasis">
          <span class="text-h6 font-weight-bold">Atlas</span>
          <span class="text-h6 text-medium-emphasis">Pro</span>
        </NuxtLink>
        <v-spacer />
        <v-icon :icon="mdiMagnify" aria-hidden="true" />
      </v-container>
    </v-app-bar>

    <v-main>
      <slot />
    </v-main>

    <v-footer border="t" class="justify-center text-caption text-medium-emphasis">
      Atlas Technologies — desafio técnico front-end
    </v-footer>
  </v-app>
</template>
