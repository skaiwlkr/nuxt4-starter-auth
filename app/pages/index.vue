<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="bg-white shadow rounded-lg p-6">
        <h1 class="text-2xl font-bold text-gray-900 mb-4">
          Willkommen {{ user?.email }}!
        </h1>
        <p class="text-gray-600">
          Sie sind erfolgreich eingeloggt.
        </p>

        <p class="text-gray-600 mt-2">
          UUID: {{ user?.uuid }}
        </p>
        <p class="text-gray-600 mt-2">
          E-Mail: {{ user?.email }}
        </p>
        <p class="text-gray-600 mt-2">
          E-Mail verified at:
          {{ user?.email_verified ? new Date(user.email_verified).toLocaleString('de-DE', { timeZone: 'Europe/Berlin' }) : 'null' }}
        </p>
        <p class="text-gray-600 mt-2">
          First name: {{ user?.first_name || 'null' }}
        </p>
        <p class="text-gray-600 mt-2">
          Last name: {{ user?.last_name || 'null' }}
        </p>
        <p class="text-gray-600 mt-2">
          Flags: {{ user?.flags || 'null' }}
        </p>
        <p class="text-gray-600 mt-2">
          Created at: {{ user?.created_at ? new Date(user.created_at).toLocaleString('de-DE', { timeZone: 'Europe/Berlin' }) : 'null' }}
        </p>

        <div class="text-gray-600 mt-6">
          <p class="mb-2 font-bold">
            User information:
          </p>
          <p>
            {{ user }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'

definePageMeta({
  layout: 'default',
})

// Initialize auth and reactive variables
const { user } = useAuth()
</script>
