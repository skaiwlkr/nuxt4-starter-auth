// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
  ],
  css: [
    '~/assets/css/main.css',
  ],
  runtimeConfig: {
    public: {
      turnstileSiteKey: process.env.NUXT_TURNSTILE_SITE_KEY,
    },
    turnstileSecretKey: process.env.NUXT_TURNSTILE_SECRET_KEY,
  },
  app: {
    head: {
      script: [
        {
          'src': 'https://challenges.cloudflare.com/turnstile/v0/api.js',
          'async': true,
          'defer': true,
          'data-sitekey': process.env.NUXT_TURNSTILE_SITE_KEY,
          'data-theme': 'light',
          'data-language': 'de',
        },
      ],
    },
  },
})
