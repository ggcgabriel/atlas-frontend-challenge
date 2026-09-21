// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-09-21',
  devtools: { enabled: true },

  ssr: true,

  modules: [
    '@pinia/nuxt',
    'vuetify-nuxt-module',
    '@nuxt/image',
    '@nuxt/fonts',
    '@nuxt/eslint',
  ],

  typescript: {
    strict: true,
    // Type checking runs in `pnpm typecheck`, not on every dev rebuild.
    typeCheck: false,
  },

  runtimeConfig: {
    // Server-only. Override with NUXT_DATABASE_URL. Consumed in Stage 2.
    databaseUrl: '',
  },

  vuetify: {
    moduleOptions: {
      // Vuetify's `useLayout` collides with Nuxt's built-in of the same name.
      // Prefixing only that one keeps Nuxt's intact; Vuetify's is `useVLayout`.
      prefixComposables: ['useLayout'],
      // `mdi-svg` resolves icons from @mdi/js, so only the paths we actually
      // reference are bundled. The `mdi` font set would pull a ~1.2MB webfont
      // plus a render-blocking stylesheet for the sake of a handful of glyphs.
      styles: {
        // Vuetify's colors.css is ~40KB of `.bg-red-lighten-2`-style helpers we
        // never use — the theme tokens below cover our palette instead.
        colors: false,
        // utilities.css is ~240KB raw but carries the d-flex/ma-4/text-* classes
        // the components lean on. Revisit in the performance stage.
        utilities: true,
      },
      ssrClientHints: {
        reloadOnFirstRequest: false,
        viewportSize: true,
        prefersColorScheme: false,
      },
    },
    vuetifyOptions: {
      icons: {
        defaultSet: 'mdi-svg',
      },
      theme: {
        defaultTheme: 'atlasLight',
        themes: {
          atlasLight: {
            dark: false,
            colors: {
              'background': '#f7f8fa',
              'surface': '#ffffff',
              'primary': '#2f5bea',
              'secondary': '#0f172a',
              'success': '#12a150',
              'warning': '#f5a524',
              'error': '#e5484d',
              'info': '#0ea5e9',
              'on-background': '#0f172a',
              'on-surface': '#0f172a',
            },
          },
        },
      },
      defaults: {
        VBtn: { variant: 'flat' },
        VCard: { rounded: 'lg' },
        VTextField: { variant: 'outlined', density: 'comfortable' },
        VSelect: { variant: 'outlined', density: 'comfortable' },
      },
    },
  },

  image: {
    // Widths the professional cards and the detail avatar actually request.
    screens: { xs: 320, sm: 480, md: 768, lg: 1024, xl: 1280 },
    quality: 70,
    format: ['webp'],
  },

  app: {
    head: {
      htmlAttrs: { lang: 'pt-BR' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#2f5bea' },
      ],
    },
  },
})
