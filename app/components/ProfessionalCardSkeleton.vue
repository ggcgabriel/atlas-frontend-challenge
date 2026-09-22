<template>
  <div class="skeleton app-card" aria-hidden="true">
    <div class="skeleton__head">
      <div class="skeleton__avatar shimmer" />
      <div class="skeleton__identity">
        <div class="skeleton__line shimmer" style="inline-size: 62%" />
        <div class="skeleton__line shimmer" style="inline-size: 80%" />
        <div class="skeleton__line shimmer" style="inline-size: 70%" />
      </div>
    </div>

    <div class="skeleton__chips">
      <div class="skeleton__chip shimmer" style="inline-size: 84px" />
      <div class="skeleton__chip shimmer" style="inline-size: 110px" />
    </div>

    <div class="skeleton__foot">
      <div class="skeleton__line shimmer" style="inline-size: 120px" />
      <div class="skeleton__cta shimmer" />
    </div>
  </div>
</template>

<style scoped>
.skeleton {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
}

.skeleton__head {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.skeleton__avatar {
  inline-size: 60px;
  block-size: 60px;
  border-radius: 14px;
  flex: 0 0 auto;
}

.skeleton__identity {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-inline-size: 0;
}

.skeleton__line {
  block-size: 1.125rem;
  border-radius: 4px;
}

.skeleton__chips {
  display: flex;
  gap: 6px;
}

.skeleton__chip {
  block-size: 1.5rem;
  border-radius: 999px;
}

.skeleton__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-block-start: 12px;
  border-block-start: 1px solid rgb(20 22 26 / 8%);
}

.skeleton__cta {
  inline-size: 104px;
  block-size: 2.125rem;
  border-radius: 999px;
}

.shimmer {
  background: linear-gradient(
    90deg,
    rgb(var(--v-theme-on-surface) / 6%) 25%,
    rgb(var(--v-theme-on-surface) / 11%) 37%,
    rgb(var(--v-theme-on-surface) / 6%) 63%
  );
  background-size: 400% 100%;
  animation: shimmer 1.4s ease infinite;
}

@keyframes shimmer {
  from {
    background-position: 100% 50%;
  }

  to {
    background-position: 0 50%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .shimmer {
    animation: none;
  }
}
</style>
