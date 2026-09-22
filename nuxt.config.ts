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
      // Sampled from the AtlasHirePro mockups in docs/context/layout/ rather
      // than eyeballed: a warm cream canvas, dark-teal primary, rust accent.
      theme: {
        defaultTheme: 'atlasLight',
        themes: {
          atlasLight: {
            dark: false,
            colors: {
              // White canvas: the cards carry the separation themselves, via
              // the hairline + shadow in tokens.css. The cream the mockups used
              // here survives as `--surface-muted` on small inner surfaces.
              background: '#ffffff',
              surface: '#ffffff',
              primary: '#0f3d3e',
              secondary: '#14161a',
              // The "HirePro" in the wordmark and the rating star.
              accent: '#c05621',
              success: '#1f7a5a',
              warning: '#b45309',
              error: '#b3261e',
              info: '#0f3d3e',
              'on-background': '#14161a',
              'on-surface': '#14161a',
              'on-accent': '#ffffff',
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

  // Design tokens Vuetify's theme does not cover (tints, radii, chrome heights)
  // plus the type family, which @nuxt/fonts resolves and self-hosts from here.
  css: ['~/assets/styles/tokens.css'],

  fonts: {
    families: [{ name: 'Plus Jakarta Sans', provider: 'google' }],
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
        { name: 'theme-color', content: '#0f3d3e' },
      ],
      link: [
        // `sizes="any"` on the .ico plus a typed SVG is the pattern that makes
        // a browser prefer the vector where it can and fall back where it
        // cannot, without either one winning by declaration order.
        { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      ],
    },
  },
})
