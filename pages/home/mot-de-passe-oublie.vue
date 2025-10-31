<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-500 to-red-600 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 bg-white rounded-2xl shadow-2xl p-8">
      <!-- Logo et titre -->
      <div class="text-center">
        <div class="mx-auto h-16 w-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mb-4">
          <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
          </svg>
        </div>
        <h2 class="text-3xl font-bold text-gray-900">Mot de passe oublié ?</h2>
        <p class="mt-2 text-sm text-gray-600">Entrez votre email pour recevoir un lien de réinitialisation</p>
      </div>

      <!-- Formulaire -->
      <form @submit.prevent="handleSubmit" class="mt-8 space-y-6">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
            Adresse email
          </label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
            placeholder="votre@email.com"
            :disabled="isLoading"
          />
        </div>

        <!-- Message d'erreur -->
        <div v-if="errorMessage" class="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-sm text-red-600">{{ errorMessage }}</p>
        </div>

        <!-- Message de succès -->
        <div v-if="successMessage" class="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p class="text-sm text-green-600">{{ successMessage }}</p>
        </div>

        <!-- Bouton de soumission -->
        <button
          type="submit"
          :disabled="isLoading"
          class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <span v-if="isLoading" class="mr-2">
            <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </span>
          {{ isLoading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation' }}
        </button>

        <!-- Lien retour -->
        <div class="text-center">
          <button
            @click="navigateTo('/connexion')"
            class="text-sm text-gray-600 hover:text-gray-900 transition"
          >
            ← Retour à la connexion
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { API_BASE_URL } from '@/constants'

definePageMeta({
  layout: 'accueil'
})

const email = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const handleSubmit = async () => {
  if (!email.value) {
    errorMessage.value = 'Veuillez entrer votre adresse email'
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const response = await $fetch(`${API_BASE_URL}/api/password-reset/request/`, {
      method: 'POST',
      body: { email: email.value }
    })

    if (response.success) {
      successMessage.value = response.message
      email.value = ''
      
      // Rediriger vers la page de connexion après 3 secondes
      setTimeout(() => {
        navigateTo('/connexion')
      }, 3000)
    } else {
      errorMessage.value = response.error || 'Une erreur est survenue'
    }
  } catch (error: any) {
    console.error('Erreur:', error)
    errorMessage.value = error.data?.error || 'Erreur lors de l\'envoi de l\'email. Veuillez réessayer.'
  } finally {
    isLoading.value = false
  }
}
</script>




