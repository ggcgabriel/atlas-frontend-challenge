<script setup lang="ts">
import { AVATAR_SIZE } from '#shared/types/professional'

/**
 * A professional's photo, or their initials when there is none.
 *
 * The catalog is mocked and most professionals have a portrait, so the fallback
 * exists for two real cases: rows seeded without a photo (every 20th, on
 * purpose — see server/database/seed.ts) and an image that fails to load at
 * runtime. Both render the same tinted monogram, chosen deterministically from
 * the id so it never changes between server and client.
 */
const props = withDefaults(
  defineProps<{
    id: number
    name: string
    avatarUrl?: string
    avatarLqip?: string
    /** Rendered box, in px. Also drives the `sizes` hint. */
    size?: number
    /** Above the fold: loads eagerly and preloads instead of lazily. */
    priority?: boolean
    alt?: string
  }>(),
  { size: 56, avatarUrl: '', avatarLqip: '', priority: false, alt: '' },
)

/** Flips to true if the file 404s or decodes badly — then initials take over. */
const failed = ref(false)
watch(
  () => props.avatarUrl,
  () => {
    failed.value = false
  },
)

const showPhoto = computed(() => Boolean(props.avatarUrl) && !failed.value)
const tint = computed(() => tintFor(props.id))
const initials = computed(() => initialsOf(props.name))

// Retina at the rendered box, capped at the 400px source: asking IPX for more
// than exists just wastes a transform.
const renderedWidth = computed(() => Math.min(props.size * 2, AVATAR_SIZE))
</script>

<template>
  <!--
    The box is fixed in CSS and the image carries explicit width/height, so the
    avatar reserves its space whichever branch renders. Swapping a photo for
    initials on error cannot shift the card.
  -->
  <span
    class="avatar"
    :style="{ inlineSize: `${size}px`, blockSize: `${size}px` }"
  >
    <NuxtImg
      v-if="showPhoto"
      :src="avatarUrl"
      :alt="alt || `Foto de ${name}`"
      :width="renderedWidth"
      :height="renderedWidth"
      :sizes="`${size}px`"
      :loading="priority ? 'eager' : 'lazy'"
      :preload="priority"
      :fetchpriority="priority ? 'high' : 'auto'"
      class="avatar__img"
      :style="
        avatarLqip ? { backgroundImage: `url(${avatarLqip})` } : undefined
      "
      @error="failed = true"
    />

    <!--
      aria-hidden: the initials are a decorative stand-in for a photo. The name
      is already text next to every avatar, so announcing "OB" adds noise.
    -->
    <span
      v-else
      class="avatar__initials"
      :style="{
        backgroundColor: tint.background,
        color: tint.text,
        fontSize: `${Math.round(size * 0.34)}px`,
      }"
      aria-hidden="true"
    >
      {{ initials }}
    </span>
  </span>
</template>

<style scoped>
.avatar {
  display: block;
  flex: 0 0 auto;
  border-radius: 14px;
  overflow: hidden;
  background: var(--tint-sand);
}

.avatar__img {
  inline-size: 100%;
  block-size: 100%;
  object-fit: cover;
  display: block;
  /* The 192-byte LQIP paints the box before the file arrives. */
  background-size: cover;
  background-position: center;
}

.avatar__initials {
  display: grid;
  place-items: center;
  inline-size: 100%;
  block-size: 100%;
  font-weight: 700;
  letter-spacing: 0.01em;
  user-select: none;
}
</style>
