<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Neues Passwort festlegen
        </h2>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="password" class="sr-only">Neues Passwort</label>
            <input
              id="password"
              v-model="password"
              name="password"
              type="password"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border \
                border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none \
                focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Neues Passwort"
            >
          </div>
          <div>
            <label for="passwordConfirmation" class="sr-only">Passwort bestätigen</label>
            <input
              id="passwordConfirmation"
              v-model="passwordConfirmation"
              name="passwordConfirmation"
              type="password"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border \
                border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none \
                focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Passwort bestätigen"
            >
          </div>
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
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 \
                    3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </span>
            {{ isLoading ? 'Wird gespeichert...' : 'Passwort ändern' }}
          </button>
        </div>

        <div v-if="error" class="text-center text-sm text-red-600">
          {{ error }}
          <div v-if="error === 'Ungültiger oder abgelaufener Token'" class="mt-2">
            <NuxtLink to="/forgot-password" class="text-indigo-600 hover:text-indigo-500">
              Neuen Token anfordern
            </NuxtLink>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'guest',
})

// Get route and router instances for navigation
const route = useRoute()
const router = useRouter()
const token = route.query.token as string

// Redirect to login if no token is provided
if (!token) {
  router.push('/login')
}

// Reactive state variables for form handling
const password = ref('')
const passwordConfirmation = ref('')
const isLoading = ref(false)
const error = ref('')

// Validates the password and password confirmation
function validatePassword() {
  const errors: string[] = []

  // Check if password is provided and meets minimum length requirement
  if (!password.value) {
    errors.push('Bitte geben Sie ein Passwort ein')
  }
  else if (password.value.length < 8) {
    errors.push('Das Passwort muss mindestens 8 Zeichen lang sein')
  }

  // Verify password confirmation matches
  if (!passwordConfirmation.value) {
    errors.push('Bitte bestätigen Sie Ihr Passwort')
  }
  else if (password.value !== passwordConfirmation.value) {
    errors.push('Die Passwörter stimmen nicht überein')
  }

  if (errors.length > 0) {
    error.value = errors.join('. ')
    return false
  }

  return true
}

// Handles the form submission for password reset
async function handleSubmit() {
  if (!validatePassword()) {
    return
  }

  try {
    isLoading.value = true
    error.value = ''

    // Make API call to reset password
    await $fetch('/api/auth/password-reset/reset-password', {
      method: 'POST',
      body: {
        token,
        password: password.value,
      },
    })

    // Redirect to login page with success message
    router.push('/login?message=password-reset-success')
  }
  catch (err: any) {
    // Handle API errors
    if (err.data?.message) {
      error.value = err.data.message
    }
    else {
      error.value = 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.'
    }
  }
  finally {
    isLoading.value = false
  }
}
</script>
