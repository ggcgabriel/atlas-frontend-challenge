<script setup lang="ts">
import { AVATAR_SIZE } from '#shared/types/professional'

const props = withDefaults(
  defineProps<{
    id: number
    name: string
    avatarUrl?: string
    avatarLqip?: string
    size?: number
    priority?: boolean
    alt?: string
  }>(),
  { size: 56, avatarUrl: '', avatarLqip: '', priority: false, alt: '' },
)

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

const renderedWidth = computed(() => Math.min(props.size * 2, AVATAR_SIZE))
</script>

<template>
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
