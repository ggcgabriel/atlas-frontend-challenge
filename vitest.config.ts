import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    include: ['app/**/*.spec.ts'],
    // Default to plain Node: the utils are pure functions and booting a Nuxt
    // environment for them costs seconds for nothing. The composable specs opt
    // in per file with a `// @vitest-environment nuxt` docblock, because they
    // need useRoute/useFetch and the `#shared` alias.
    environment: 'node',
    env: {
      // formatMonthYear does `new Date(iso)`, so a UTC-midnight date renders the
      // previous month in any negative offset. Pinning the zone keeps the suite
      // from depending on where it runs.
      TZ: 'America/Sao_Paulo',
    },
  },
})
