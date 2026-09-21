import { defineConfig } from 'drizzle-kit'

// drizzle-kit runs outside Nuxt, so it reads DATABASE_URL directly rather than
// going through runtimeConfig. See .env.example.
export default defineConfig({
  dialect: 'postgresql',
  schema: './server/database/schema.ts',
  out: './server/database/migrations',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
})
