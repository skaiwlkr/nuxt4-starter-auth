<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {{ registrationSuccess ? 'Fast geschafft!' : 'Registrieren' }}
        </h2>
      </div>
      <div v-if="registrationSuccess">
        <p class="mb-4">
          Wir haben dir eine E-Mail geschickt. Bitte klicke auf den Link in der E-Mail,
          um deinen Account zu verifizieren.
        </p>
        <button
          class="btn btn-primary"
          :disabled="isLoading"
          @click="resend"
        >
          E-Mail erneut senden
        </button>
        <p v-if="success" class="text-green-600 mt-2">
          {{ success }}
        </p>
        <p v-if="error" class="text-red-600 mt-2">
          {{ error }}
        </p>
      </div>
      <form v-else class="mt-8 space-y-6" @submit.prevent="handleRegister">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="email" class="sr-only">E-Mail</label>
            <input
              id="email"
              v-model="email"
              name="email"
              type="email"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 \
                border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none \
                focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="E-Mail"
              @input="handleEmailInput"
            >
          </div>
          <div>
            <label for="password" class="sr-only">Passwort</label>
            <input
              id="password"
              v-model="password"
              name="password"
              type="password"
              required
              class="appearance-none rounded-none relative block w-full \
                px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 \
                focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 \
                focus:z-10 sm:text-sm"
              placeholder="Passwort"
            >
          </div>
          <div>
            <label for="passwordConfirm" class="sr-only">Passwort bestätigen</label>
            <input
              id="passwordConfirm"
              v-model="passwordConfirm"
              name="passwordConfirm"
              type="password"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 \
                border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md \
                focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 \
                focus:z-10 sm:text-sm"
              placeholder="Passwort bestätigen"
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
        </div>

        <div>
          <button
            type="submit"
            :disabled="isLoading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent \
              text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 \
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 \
              disabled:opacity-50 disabled:cursor-not-allowed"
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
            {{ isLoading ? 'Registrierung läuft...' : 'Registrieren' }}
          </button>
        </div>
      </form>

      <div class="text-center">
        <NuxtLink to="/login" class="text-indigo-600 hover:text-indigo-500">
          Bereits ein Konto? Hier anmelden
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'
import { useTurnstile } from '~/composables/useTurnstile'

definePageMeta({
  layout: 'guest',
})

// Initialize auth composable
const { register } = useAuth()

// Turnstile Composable verwenden
const {
  turnstileContainer,
  turnstileToken,
  error: turnstileError,
} = useTurnstile()

// Reactive state variables für Form Handling und UI State
const email = ref('')
const password = ref('')
const passwordConfirm = ref('')
const error = computed(() => turnstileError.value || localError.value)
const isLoading = ref(false)
const registrationSuccess = ref(false)
const success = ref('')
const localError = ref('')

/**
 * Validates email format using regex pattern
 * @param email - The email address to validate
 * @returns boolean - True if email format is valid
 */
function validateEmail(email: string) {
  const emailRegex = /^[\w.%+-]+@[\w.-]+\.[a-z]{2,}$/i
  return emailRegex.test(email)
}

function handleEmailInput() {
  if (email.value && !validateEmail(email.value)) {
    localError.value = 'Bitte geben Sie eine gültige E-Mail-Adresse ein.'
  }
  else {
    localError.value = ''
  }
}

// Processes user creation
async function handleRegister() {
  try {
    if (!turnstileToken.value) {
      localError.value = 'Bitte bestätigen Sie, dass Sie kein Roboter sind.'
      return
    }
    localError.value = ''
    // Validate password match
    if (password.value !== passwordConfirm.value) {
      localError.value = 'Die Passwörter stimmen nicht überein'
      return
    }
    isLoading.value = true
    await register(email.value, password.value, turnstileToken.value)
    registrationSuccess.value = true
  }
  catch (err: any) {
    if (err?.data?.message?.includes('noch nicht verifiziert')) {
      localError.value = err.data.message
      registrationSuccess.value = true
    }
    else {
      localError.value = 'Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.'
    }
  }
  finally {
    isLoading.value = false
  }
}

// Handles resending of verification email
async function resend() {
  isLoading.value = true
  localError.value = ''
  success.value = ''
  try {
    await $fetch('/api/auth/verify-email/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${useAuth().token}`,
      },
    })
    success.value = 'E-Mail wurde erneut gesendet.'
  }
  catch (e: any) {
    localError.value = e?.data?.message || 'Fehler beim Senden der E-Mail.'
  }
  finally {
    isLoading.value = false
  }
}
</script>

<script lang="ts">
// TypeScript declaration for Turnstile global object:
// Extends Window interface to include Turnstile functionality
declare global {
  interface Window {
    turnstile: {
      render: (container: HTMLElement, options: any) => void
    }
  }
}
</script>
