<script setup lang="ts">
import {
  mdiCheck,
  mdiHeart,
  mdiHeartOutline,
  mdiMessageTextOutline,
} from '@mdi/js'
import type { ProfessionalDetail } from '#shared/types/professional'

/**
 * The profile's sticky action card.
 *
 * The form is deliberately local: there is no quotes endpoint in this challenge
 * and inventing one would be scope the brief does not ask for. Submitting
 * confirms inline so the interaction is complete and obviously client-side,
 * rather than posting into a void.
 */
const props = defineProps<{ professional: ProfessionalDetail }>()

const favorites = useFavoritesStore()

const message = ref('')
const sent = ref(false)

const isFavorite = computed(() => favorites.isFavorite(props.professional.id))

const guarantees = computed(() => [
  props.professional.freeQuote
    ? 'Orçamento gratuito e sem compromisso'
    : 'Orçamento enviado em até 24 horas',
  props.professional.warrantyMonths > 0
    ? `Garantia de ${props.professional.warrantyMonths} meses sobre o serviço`
    : 'Serviço combinado e registrado antes de começar',
  'Pagamento liberado só após a sua aprovação',
])

const responseLabel = computed(() => {
  const hours = props.professional.responseTimeHours
  if (hours <= 1) return 'Responde em cerca de 1 hora'
  if (hours < 24) return `Responde em cerca de ${hours} horas`
  return 'Responde em até 1 dia'
})

function submit() {
  sent.value = true
}
</script>

<template>
  <div class="quote">
    <div class="quote__card app-card">
      <p class="quote__price">
        <strong>{{ formatBRL(professional.hourlyRateCents) }}</strong>
        <span class="quote__price-unit">por hora</span>
      </p>

      <v-form @submit.prevent="submit">
        <label for="quote-message" class="quote__label">
          O que você precisa
        </label>
        <v-textarea
          id="quote-message"
          v-model="message"
          placeholder="Ex.: contrapiso em 40 m²"
          rows="2"
          auto-grow
          variant="solo-filled"
          flat
          rounded="lg"
          hide-details
          class="quote__input"
        />

        <v-btn
          type="submit"
          color="primary"
          size="large"
          block
          rounded="lg"
          class="text-none mt-3"
        >
          Solicitar orçamento
        </v-btn>
      </v-form>

      <v-btn
        variant="outlined"
        size="large"
        block
        rounded="lg"
        class="text-none mt-2"
        :prepend-icon="mdiMessageTextOutline"
        disabled
        title="Fora do escopo deste desafio"
      >
        Enviar mensagem
      </v-btn>

      <v-alert
        v-if="sent"
        type="success"
        variant="tonal"
        density="compact"
        class="mt-3 text-body-2"
      >
        Pedido registrado nesta sessão. O envio real de orçamentos está fora do
        escopo do desafio.
      </v-alert>

      <ul class="quote__guarantees">
        <li v-for="item in guarantees" :key="item">
          <v-icon :icon="mdiCheck" size="14" aria-hidden="true" />
          {{ item }}
        </li>
      </ul>
    </div>

    <div class="quote__response">
      <p class="quote__response-title">{{ responseLabel }}</p>
      <p class="quote__response-note">
        {{
          professional.isVerified
            ? 'Documento e endereço conferidos pela equipe AtlasHirePro.'
            : 'Perfil ainda sem selo de verificação de documento.'
        }}
      </p>
    </div>

    <v-btn
      variant="outlined"
      size="large"
      block
      rounded="lg"
      class="text-none mt-3"
      :prepend-icon="isFavorite ? mdiHeart : mdiHeartOutline"
      :aria-pressed="isFavorite"
      @click="favorites.toggle(professional.id)"
    >
      {{ isFavorite ? 'Salvo nos favoritos' : 'Salvar nos favoritos' }}
    </v-btn>
  </div>
</template>

<style scoped>
/* Follows the reader down the long left column, but only where there is room
   beside it — stacked on a phone it would cover the content it belongs to. */
@media (min-width: 1000px) {
  .quote {
    position: sticky;
    inset-block-start: calc(var(--app-header-h) + 20px);
  }
}

.quote__card {
  padding: 20px;
}

/* Vuetify derives `solo-filled` from the surface colour, which is now white —
   the field would vanish into the card. Pinned to the same fill the other
   inputs use. */
.quote__input :deep(.v-field) {
  background: var(--surface-muted);
}

.quote__price {
  margin: 0 0 14px;
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.quote__price-unit {
  margin-inline-start: 6px;
  font-size: 0.8125rem;
  font-weight: 400;
  color: rgb(var(--v-theme-on-surface) / 60%);
}

.quote__label {
  display: block;
  margin-block-end: 6px;
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgb(var(--v-theme-on-surface) / 55%);
}

.quote__guarantees {
  display: flex;
  flex-direction: column;
  gap: 8px;
  list-style: none;
  padding: 16px 0 0;
  margin: 16px 0 0;
  border-block-start: 1px solid rgb(20 22 26 / 8%);
  font-size: 0.75rem;
  line-height: 1.125rem;
  color: rgb(var(--v-theme-on-surface) / 72%);
}

.quote__guarantees li {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.quote__guarantees :deep(.v-icon) {
  color: rgb(var(--v-theme-success));
  margin-block-start: 1px;
}

.quote__response {
  margin-block-start: 12px;
  padding: 16px 18px;
  border-radius: var(--card-radius);
  background: rgb(var(--v-theme-secondary));
  color: #fff;
}

.quote__response-title {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 700;
}

.quote__response-note {
  margin: 6px 0 0;
  font-size: 0.75rem;
  line-height: 1.125rem;
  color: rgb(255 255 255 / 62%);
}
</style>
