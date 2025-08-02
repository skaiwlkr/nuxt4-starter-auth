<template>
  <div class="flex flex-col items-center justify-center min-h-screen">
    <h1 class="text-2xl font-bold mb-4">
      Account verifizieren
    </h1>
    <p class="mb-4">
      Klicke auf den Button, um deinen Account zu verifizieren.
    </p>
    <button
      class="btn btn-primary"
      :disabled="loading || verified"
      @click="verify"
    >
      Account verifizieren
    </button>
    <div v-if="error" class="text-center text-sm text-red-600">
      {{ error }}
    </div>
    <div v-if="success" class="text-center text-sm text-green-600">
      {{ success }}
    </div>
    <div v-if="error" class="mt-4">
      <button
        class="w-full flex justify-center py-2 px-4 border border-transparent text-sm \
          font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 \
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 \
          disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="loading"
        @click="handleResend"
      >
        <span v-if="loading" class="absolute left-0 inset-y-0 flex items-center pl-3">
          <svg
            class="animate-spin h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 \
              3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </span>
        {{ loading ? 'Wird gesendet...' : 'Neuen Token anfordern' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

definePageMeta({
  layout: 'guest',
})

// Initialize reactive state variables
const route = useRoute()
const router = useRouter()
const loading = ref(false)
const success = ref('')
const error = ref('')
const verified = ref(false)

// Function to verify email with token
async function verify() {
  loading.value = true
  error.value = ''
  success.value = ''
  try {
    const token = route.query.token
    if (!token) {
      error.value = 'Kein Token gefunden.'
      loading.value = false
      return
    }
    await $fetch('/api/auth/verify-email/verify', {
      method: 'POST',
      body: { token },
    })
    success.value = 'Dein Account wurde erfolgreich verifiziert! Du kannst dich jetzt einloggen.'
    verified.value = true
    setTimeout(() => router.push('/login'), 3000)
  }
  catch (e: any) {
    error.value = e?.data?.message || 'Verifizierung fehlgeschlagen.'
  }
  loading.value = false
}

// Function to handle resending verification email
async function handleResend() {
  loading.value = true
  error.value = ''
  success.value = ''
  try {
    const email = route.query.email
    if (!email) {
      error.value = 'Keine E-Mail-Adresse gefunden.'
      loading.value = false
      return
    }
    await $fetch('/api/auth/verify-email/send', {
      method: 'POST',
      body: {
        email,
      },
    })
    success.value = 'E-Mail wurde erneut gesendet.'
  }
  catch (e: any) {
    error.value = e?.data?.message || 'Fehler beim Senden der E-Mail.'
  }
  loading.value = false
}
</script>
