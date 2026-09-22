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
        // Measured: we use 18 of the 3011 utility classes this shipped. Dropping
        // it cut entry.css from 168KB to 20KB raw (26KB -> 3.4KB gzip) on a
        // render-blocking file. The 18 are re-declared in assets/styles/tokens.css.
        utilities: false,
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
  nitro: {
    // Ship .gz and .br next to every public asset. Nitro's node-server serves
    // them directly instead of compressing on each request; a CDN in front
    // (Vercel) will use them too rather than re-doing the work.
    compressPublicAssets: { gzip: true, brotli: true },
  },

  routeRules: {
    // A professional's profile changes rarely and is identical for everyone —
    // the favourite heart is hydrated from localStorage after load, so nothing
    // here is per-visitor. The listing is deliberately NOT cached: it varies by
    // query string and would fragment the cache into thousands of keys.
    '/profissionais/**': { swr: 300 },
  },

  // plus the type family, which @nuxt/fonts resolves and self-hosts from here.
  css: ['~/assets/styles/tokens.css'],

  fonts: {
    families: [
      {
        name: 'Plus Jakarta Sans',
        provider: 'google',
        // `weights` defaults to [400]. Our CSS uses 600/700/800 for every
        // heading, price and seal, so without these the browser was
        // synthesising bold from the regular face — smeared letterforms, and
        // nothing actually rendered in Plus Jakarta Sans Bold.
        weights: [400, 600, 700, 800],
        styles: ['normal'],
        // The default pulled cyrillic, greek and vietnamese too. The UI is
        // pt-BR; latin + latin-ext covers it.
        subsets: ['latin', 'latin-ext'],
        // Subsetted families are not preloaded by default, so the font was only
        // discovered after the CSS parsed. It is the page's only family.
        preload: true,
      },
    ],
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
