<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-500 to-red-600 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 bg-white rounded-2xl shadow-2xl p-8">
      <!-- Logo et titre -->
      <div class="text-center">
        <div class="mx-auto h-16 w-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mb-4">
          <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
          </svg>
        </div>
        <h2 class="text-3xl font-bold text-gray-900">Nouveau mot de passe</h2>
        <p class="mt-2 text-sm text-gray-600">Choisissez un nouveau mot de passe sécurisé</p>
      </div>

      <!-- Formulaire -->
      <form @submit.prevent="handleSubmit" class="mt-8 space-y-6">
        <div>
          <label for="new_password" class="block text-sm font-medium text-gray-700 mb-2">
            Nouveau mot de passe *
          </label>
          <input
            id="new_password"
            v-model="formData.new_password"
            type="password"
            required
            minlength="8"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
            placeholder="Minimum 8 caractères"
            :disabled="isLoading"
          />
          <p class="mt-1 text-xs text-gray-500">Le mot de passe doit contenir au moins 8 caractères</p>
        </div>

        <div>
          <label for="confirm_password" class="block text-sm font-medium text-gray-700 mb-2">
            Confirmer le mot de passe *
          </label>
          <input
            id="confirm_password"
            v-model="formData.confirm_password"
            type="password"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
            placeholder="Confirmez votre mot de passe"
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
          {{ isLoading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe' }}
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
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { API_BASE_URL } from '@/constants'

definePageMeta({
  layout: 'accueil'
})

const route = useRoute()
const email = ref('')
const token = ref('')

const formData = ref({
  new_password: '',
  confirm_password: ''
})

const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

onMounted(() => {
  // Récupérer les paramètres de l'URL
  email.value = route.query.email as string || ''
  token.value = route.query.token as string || ''

  if (!email.value || !token.value) {
    errorMessage.value = 'Lien de réinitialisation invalide ou expiré'
  }
})

const handleSubmit = async () => {
  if (!token.value || !email.value) {
    errorMessage.value = 'Token ou email manquant'
    return
  }

  if (formData.value.new_password !== formData.value.confirm_password) {
    errorMessage.value = 'Les mots de passe ne correspondent pas'
    return
  }

  if (formData.value.new_password.length < 8) {
    errorMessage.value = 'Le mot de passe doit contenir au moins 8 caractères'
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const response = await $fetch(`${API_BASE_URL}/api/password-reset/confirm/`, {
      method: 'POST',
      body: {
        email: email.value,
        token: token.value,
        new_password: formData.value.new_password
      }
    })

    if (response.success) {
      successMessage.value = response.message
      
      // Rediriger vers la page de connexion après 3 secondes
      setTimeout(() => {
        navigateTo('/connexion')
      }, 3000)
    } else {
      errorMessage.value = response.error || 'Erreur lors de la réinitialisation'
    }
  } catch (error: any) {
    console.error('Erreur:', error)
    errorMessage.value = error.data?.error || 'Erreur lors de la réinitialisation du mot de passe.'
  } finally {
    isLoading.value = false
  }
}
</script>




