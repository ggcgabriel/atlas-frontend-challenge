<script setup lang="ts">
import { mdiStar, mdiStarOutline } from '@mdi/js'
import type { ProfessionalReview } from '#shared/types/professional'

const props = defineProps<{ review: ProfessionalReview }>()

// Reviewers are seeded with a first name only, so the avatar has one initial
// and the id keeps the tint stable between renders.
const tint = computed(() => tintFor(props.review.id))
const initials = computed(() => initialsOf(props.review.authorName))
</script>

<template>
  <article class="review">
    <header class="review__head">
      <span
        class="review__avatar"
        :style="{ backgroundColor: tint.background, color: tint.text }"
        aria-hidden="true"
      >
        {{ initials }}
      </span>

      <div class="review__who">
        <p class="review__author">{{ review.authorName }}</p>
        <p class="review__date">{{ formatMonthYear(review.createdAt) }}</p>
      </div>

      <span
        class="review__stars"
        :aria-label="`Avaliação ${review.rating} de 5`"
      >
        <v-icon
          v-for="n in 5"
          :key="n"
          :icon="n <= review.rating ? mdiStar : mdiStarOutline"
          size="12"
          class="review__star"
          aria-hidden="true"
        />
      </span>
    </header>

    <p class="review__comment">{{ review.comment }}</p>
  </article>
</template>

<style scoped>
.review {
  padding: 14px 16px;
  border-radius: var(--control-radius);
  background: var(--surface-muted);
}

.review__head {
  display: flex;
  align-items: center;
  gap: 10px;
}

.review__avatar {
  display: grid;
  place-items: center;
  inline-size: 32px;
  block-size: 32px;
  border-radius: 50%;
  font-size: 0.6875rem;
  font-weight: 700;
  flex: 0 0 auto;
}

.review__who {
  min-inline-size: 0;
  flex: 1 1 auto;
}

.review__author {
  margin: 0;
  font-size: 0.8125rem;
  font-weight: 700;
  line-height: 1.125rem;
}

.review__date {
  margin: 0;
  font-size: 0.6875rem;
  color: rgb(var(--v-theme-on-surface) / 58%);
}

.review__stars {
  display: inline-flex;
  gap: 1px;
  flex: 0 0 auto;
}

.review__star {
  color: rgb(var(--v-theme-accent));
}

.review__comment {
  margin: 10px 0 0;
  font-size: 0.8125rem;
  line-height: 1.375rem;
  color: rgb(var(--v-theme-on-surface) / 80%);
}
</style>
