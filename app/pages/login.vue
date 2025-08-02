<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Anmelden
        </h2>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div
          v-if="successMessage"
          class="text-center text-sm text-green-600 bg-green-50 p-3 rounded-md"
        >
          {{ successMessage }}
        </div>
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="email" class="sr-only">E-Mail</label>
            <input
              id="email"
              v-model="email"
              class="appearance-none rounded-none relative block w-full px-3 py-2 \
                border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md \
                focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 \
                focus:z-10 sm:text-sm"
              placeholder="E-Mail"
              name="email"
              type="email"
              required
              @input="handleEmailInput"
            >
          </div>
          <div>
            <label for="password" class="sr-only">Passwort</label>
            <input
              id="password"
              v-model="password"
              class="appearance-none rounded-none relative block w-full px-3 py-2 \
                border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md \
                focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 \
                focus:z-10 sm:text-sm"
              placeholder="Passwort"
              name="password"
              type="password"
              required
            >
          </div>
        </div>
        <div>
          <div class="text-left text-gray-400 text-sm mb-2">
            Zeige uns, dass Du ein menschlicher Benutzer bist
          </div>
          <div ref="turnstileContainer" style="display: block; flex-flow: row;" />
        </div>
        <div v-if="error" class="text-center text-sm text-red-600">
          {{ error }}
          <div v-if="isUnverifiedError" class="mt-2">
            <button
              class="text-indigo-600 hover:text-indigo-500 underline"
              :disabled="isLoading"
              @click="resendVerification"
            >
              Verifizierungs-E-Mail erneut senden
            </button>
          </div>
        </div>

        <div
          v-if="verificationSuccess"
          class="text-center text-sm text-green-600 bg-green-50 p-3 rounded-md"
        >
          {{ verificationSuccess }}
        </div>

        <div>
          <button
            type="submit"
            class="group relative w-full flex justify-center py-2 px-4 \
              border border-transparent text-sm font-medium rounded-md text-white \
              bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 \
              focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 \
              disabled:cursor-not-allowed"
            :disabled="isLoading"
          >
            <span v-if="isLoading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 \
                  5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </span>
            {{ isLoading ? 'Anmeldung läuft...' : 'Anmelden' }}
          </button>
        </div>
      </form>

      <div class="text-center">
        <NuxtLink to="/register" class="text-indigo-600 hover:text-indigo-500">
          Noch kein Konto? Hier registrieren
        </NuxtLink>
        <div class="mt-2">
          <NuxtLink to="/forgot-password" class="text-indigo-600 hover:text-indigo-500">
            Passwort vergessen?
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'
import { useTurnstile } from '~/composables/useTurnstile'

// Turnstile Composable verwenden
const {
  turnstileContainer,
  turnstileToken,
  error: turnstileError,
} = useTurnstile()

// Initialize composables and reactive state:
// These will be used throughout the component for state management
const route = useRoute()
const router = useRouter()
const { login } = useAuth()

// Form input fields and validation states
const email = ref('')
const password = ref('')
const isLoading = ref(false)
const isUnverifiedError = ref(false)
const verificationSuccess = ref('')
const localError = ref('')
const error = computed(() => turnstileError.value || localError.value)

definePageMeta({
  layout: 'guest',
})

// Computed property for success message after password reset:
// These will be used throughout the component for state management
const successMessage = computed(() => {
  if (route.query.message === 'password-reset-success') {
    return 'Ihr Passwort wurde erfolgreich zurückgesetzt. Sie können sich jetzt mit Ihrem neuen Passwort anmelden.'
  }
  return ''
})

// Ensures email format is valid before submission
function validateEmail(email: string) {
  const emailRegex = /^[\w.%+-]+@[\w.-]+\.[a-z]{2,}$/i
  return emailRegex.test(email)
}

// Shows error message if email format is invalid
function handleEmailInput() {
  if (email.value && !validateEmail(email.value)) {
    localError.value = 'Bitte geben Sie eine gültige E-Mail-Adresse ein.'
  }
  else {
    localError.value = ''
  }
}

// Processes user credentials and handles authentication
async function handleLogin() {
  try {
    // Validate CAPTCHA completion
    if (!turnstileToken.value) {
      localError.value = 'Bitte bestätigen Sie, dass Sie kein Roboter sind.'
      return
    }
    // Reset error states and show loading indicator
    localError.value = ''
    isUnverifiedError.value = false
    isLoading.value = true
    // Attempt to authenticate user
    await login(email.value, password.value, turnstileToken.value)
    // Redirect to home page after successful login
    router.push('/')
  }
  catch (err: any) {
    console.error('Login error:', err)
    // Handle specific error cases
    if (err?.data?.message === 'E-Mail-Adresse wurde noch nicht verifiziert'
      || err?.data?.message === 'Email not verified') {
      localError.value = 'Deine E-Mail-Adresse wurde noch nicht verifiziert. Bitte überprüfe deine E-Mails und klicke auf den Verifizierungslink.'
      isUnverifiedError.value = true
    }
    else if (err?.statusCode === 403) {
      localError.value = 'Deine E-Mail-Adresse wurde noch nicht verifiziert. Bitte überprüfe deine E-Mails und klicke auf den Verifizierungslink.'
      isUnverifiedError.value = true
    }
    else {
      localError.value = 'Anmeldung fehlgeschlagen. Bitte überprüfe deine Eingaben.'
    }
  }
  finally {
    isLoading.value = false
  }
}

// Allows users to request a new verification email
async function resendVerification() {
  try {
    // Reset states and show loading indicator
    isLoading.value = true
    localError.value = ''
    verificationSuccess.value = ''
    // Send verification email request to API
    await $fetch('/api/auth/verify-email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: email.value }),
    })
    // Show success message
    verificationSuccess.value = 'Eine neue Verifizierungs-E-Mail wurde gesendet. Bitte überprüfe deine E-Mails.'
    isUnverifiedError.value = false
  }
  catch (e: any) {
    console.error('Resend verification error:', e)
    localError.value = e?.data?.message || 'Fehler beim Senden der Verifizierungs-E-Mail.'
    verificationSuccess.value = ''
  }
  finally {
    isLoading.value = false
  }
}
</script>

<script lang="ts">
// TypeScript declaration for Turnstile global object:
// Defines the interface for the Turnstile widget
declare global {
  interface Window {
    turnstile: {
      render: (container: HTMLElement, options: any) => void
    }
  }
}
</script>
