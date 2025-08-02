import { useRuntimeConfig } from '#app'
import { onMounted, ref } from 'vue'

export function useTurnstile() {
  const turnstileContainer = ref<HTMLElement | null>(null)
  const turnstileToken = ref('')
  const turnstileLoaded = ref(false)
  const error = ref('')
  const config = useRuntimeConfig()

  function initializeTurnstile() {
    if (!turnstileContainer.value) {
      return
    }
    const siteKey = process.env.NODE_ENV === 'development'
      ? '1x00000000000000000000AA'
      : config.public.turnstileSiteKey
    if (!siteKey) {
      console.error('Turnstile site key is missing')
      error.value = 'Fehler beim Laden des Captchas. Bitte laden Sie die Seite neu.'
      return
    }
    try {
      window.turnstile.render(turnstileContainer.value, {
        'sitekey': siteKey,
        'theme': 'light',
        'size': 'flexible',
        'refresh_expired': 'auto',
        'language': 'de',
        'callback': (token: string) => {
          turnstileToken.value = token
          turnstileLoaded.value = true
        },
        'expired-callback': () => {
          turnstileToken.value = ''
        },
        'error-callback': () => {
          turnstileToken.value = ''
          error.value = 'Fehler beim Laden des Captchas. Bitte laden Sie die Seite neu.'
        },
      })
    }
    catch (err) {
      console.error('Error initializing Turnstile:', err)
      error.value = 'Fehler beim Laden des Captchas. Bitte laden Sie die Seite neu.'
    }
  }

  onMounted(() => {
    const checkTurnstile = setInterval(() => {
      if (window.turnstile && turnstileContainer.value && !turnstileLoaded.value) {
        clearInterval(checkTurnstile)
        initializeTurnstile()
      }
    }, 100)
    setTimeout(() => {
      clearInterval(checkTurnstile)
      if (!turnstileLoaded.value) {
        error.value = 'Fehler beim Laden des Captchas. Bitte laden Sie die Seite neu.'
      }
    }, 10000)
  })

  return {
    turnstileContainer,
    turnstileToken,
    turnstileLoaded,
    error,
    initializeTurnstile,
  }
}
