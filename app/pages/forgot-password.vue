<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Passwort zurücksetzen
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Geben Sie Ihre E-Mail-Adresse ein.
          Wir senden Ihnen einen Link zum Zurücksetzen Ihres Passworts.
        </p>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div>
          <label for="email" class="sr-only">E-Mail</label>
          <input
            id="email"
            v-model="email"
            name="email"
            type="email"
            required
            class="appearance-none rounded-md relative block w-full \
              px-3 py-2 border border-gray-300 placeholder-gray-500 \
              text-gray-900 focus:outline-none focus:ring-indigo-500 \
              focus:border-indigo-500 focus:z-10 sm:text-sm"
            placeholder="E-Mail"
          >
        </div>

        <div>
          <button
            type="submit"
            :disabled="isLoading"
            class="group relative w-full flex justify-center py-2 px-4 \
            border border-transparent text-sm font-medium rounded-md \
            text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none \
            focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 \
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
            {{ isLoading ? 'Wird gesendet...' : 'Link senden' }}
          </button>
        </div>

        <div
          v-if="message"
          class="text-center text-sm"
          :class="messageType === 'success' ? 'text-green-600' : 'text-red-600'"
        >
          {{ message }}
        </div>
      </form>

      <div class="text-center">
        <NuxtLink to="/login" class="text-indigo-600 hover:text-indigo-500">
          Zurück zum Login
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'guest',
})

// Reactive state variables
const email = ref('')
const isLoading = ref(false)
const message = ref('')
const messageType = ref<'success' | 'error'>('error')

// Handle form submission for password reset
function handleSubmit() {
  try {
    // Set loading state and clear any existing messages
    isLoading.value = true
    message.value = ''

    // Make API request to initiate password reset
    $fetch('/api/auth/password-reset/forgot-password', {
      method: 'POST',
      body: {
        email: email.value,
      },
    })

    // Show success message and clear email field
    message.value = 'Wenn ein Konto mit dieser E-Mail-Adresse existiert, haben wir Ihnen einen Link zum Zurücksetzen des Passworts gesendet.'
    messageType.value = 'success'
    email.value = ''
  }
  catch {
    // Handle error case
    message.value = 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.'
    messageType.value = 'error'
  }
  finally {
    // Reset loading state
    isLoading.value = false
  }
}
</script>
