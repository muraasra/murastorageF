<script setup lang="ts">
import { ref, onMounted } from 'vue'

definePageMeta({
  layout: "default"
})

const userData = ref<any>(null)
const entrepriseData = ref<any>(null)

onMounted(() => {
  if (process.client) {
    const user = localStorage.getItem('user')
    const entreprise = localStorage.getItem('entreprise')
    
    if (user) {
      userData.value = JSON.parse(user)
    } else {
      // Si pas d'utilisateur connecté, rediriger vers la page d'accueil publique
      navigateTo('/home/accueil')
      return
    }
    
    if (entreprise) entrepriseData.value = JSON.parse(entreprise)
  }
})

const logout = () => {
  if (process.client) {
    localStorage.removeItem('user')
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('entreprise')
    localStorage.removeItem('boutique')
    localStorage.removeItem('permissions')
  }
  navigateTo('/connexion')
}

const refreshPage = () => {
  if (process.client) {
    window.location.reload()
  }
}

// État de la vérification
const isChecking = ref(false)
const checkMessage = ref('')
const checkSuccess = ref(false)

// Vérifier manuellement si l'utilisateur a été assigné à une boutique
const checkBoutiqueAssignment = async () => {
  if (!process.client) return
  
  isChecking.value = true
  checkMessage.value = 'Vérification en cours...'
  checkSuccess.value = false
  
  try {
    const token = localStorage.getItem('access_token')
    const user = localStorage.getItem('user')
    
    if (!token || !user) {
      checkMessage.value = 'Erreur: Token ou utilisateur manquant'
      return
    }
    
    const userData = JSON.parse(user)
    
    // Recharger les données utilisateur depuis le serveur
    const { useApi } = await import('@/stores/useApi')
    console.log('[Boutique Check] Appel API pour utilisateur ID:', userData.id)
    const { data, error } = await useApi(`http://127.0.0.1:8000/api/users/${userData.id}/`)
    
    console.log('[Boutique Check] Réponse API:', { data: data.value, error: error.value })
    
    if (error.value) {
      console.error('[Boutique Check] Erreur API:', error.value)
      checkMessage.value = 'Erreur lors de la vérification: ' + (error.value.message || 'Erreur inconnue')
      return
    }
    
    if (data.value) {
      const updatedUser = data.value as any
      console.log('[Boutique Check] Données utilisateur:', updatedUser)
      console.log('[Boutique Check] Boutique dans les données:', updatedUser.boutique)
      
      // Vérifier si l'utilisateur a maintenant une boutique
      if (updatedUser.boutique_data && updatedUser.boutique_data.id) {
        console.log('[Boutique Check] Utilisateur assigné à une boutique:', updatedUser.boutique_data)
        
        checkMessage.value = '✅ Boutique assignée! Redirection en cours...'
        checkSuccess.value = true
        
        // Sauvegarder les nouvelles données
        localStorage.setItem('user', JSON.stringify(updatedUser))
        localStorage.setItem('boutique', JSON.stringify(updatedUser.boutique_data))
        
        // Attendre un peu pour que l'utilisateur voie le message
        setTimeout(() => {
          window.location.href = '/user'
        }, 1500)
      } else {
        console.log('[Boutique Check] Pas de boutique assignée')
        checkMessage.value = '❌ Aucune boutique assignée pour le moment'
        checkSuccess.value = false
      }
    } else {
      console.log('[Boutique Check] Aucune donnée retournée')
      checkMessage.value = '❌ Aucune donnée retournée par le serveur'
      checkSuccess.value = false
    }
  } catch (err) {
    console.error('[Boutique Check] Erreur lors de la vérification:', err)
    checkMessage.value = 'Erreur lors de la vérification: ' + (err as Error).message
    checkSuccess.value = false
  } finally {
    isChecking.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-2xl w-full space-y-8">
      <!-- Header -->
      <div class="text-center">
        <div class="mx-auto h-20 w-20 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center mb-6">
          <svg class="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
        </div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Accès en attente
        </h1>
        <p class="text-lg text-gray-600 dark:text-gray-400">
          Votre compte n'est pas encore associé à un entrepôt
        </p>
      </div>

      <!-- Contenu principal -->
      <div class="bg-white dark:bg-gray-800 py-8 px-6 shadow-xl rounded-xl border border-gray-200 dark:border-gray-700">
        <div class="space-y-6">
          <!-- Informations utilisateur -->
          <div class="text-center">
            <div class="h-16 w-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-white font-semibold text-xl">
                {{ userData?.first_name?.charAt(0) || 'U' }}
              </span>
            </div>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
              {{ userData?.first_name || 'Utilisateur' }} {{ userData?.last_name || '' }}
            </h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ userData?.role === 'admin' ? 'Administrateur' : 'Utilisateur' }} • {{ entrepriseData?.nom || 'Entreprise' }}
            </p>
          </div>

          <!-- Message d'information -->
          <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <div class="flex items-start">
              <div class="flex-shrink-0">
                <svg class="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Que se passe-t-il ?
                </h3>
                <div class="mt-2 text-sm text-blue-700 dark:text-blue-300">
                  <p>
                    Votre compte a été créé avec succès, mais votre administrateur doit encore vous assigner à un entrepôt spécifique pour que vous puissiez accéder au système de gestion.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Instructions -->
          <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Prochaines étapes
            </h3>
            <div class="space-y-3">
              <div class="flex items-start">
                <div class="flex-shrink-0">
                  <div class="h-6 w-6 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center">
                    <span class="text-emerald-600 dark:text-emerald-400 text-sm font-medium">1</span>
                  </div>
                </div>
                <div class="ml-3">
                  <p class="text-sm text-gray-700 dark:text-gray-300">
                    Contactez votre administrateur système ou votre responsable
                  </p>
                </div>
              </div>
              <div class="flex items-start">
                <div class="flex-shrink-0">
                  <div class="h-6 w-6 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center">
                    <span class="text-emerald-600 dark:text-emerald-400 text-sm font-medium">2</span>
                  </div>
                </div>
                <div class="ml-3">
                  <p class="text-sm text-gray-700 dark:text-gray-300">
                    Demandez-lui de vous assigner à l'entrepôt approprié
                  </p>
                </div>
              </div>
              <div class="flex items-start">
                <div class="flex-shrink-0">
                  <div class="h-6 w-6 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center">
                    <span class="text-emerald-600 dark:text-emerald-400 text-sm font-medium">3</span>
                  </div>
                </div>
                <div class="ml-3">
                  <p class="text-sm text-gray-700 dark:text-gray-300">
                    Une fois assigné, vous aurez accès à votre dashboard personnalisé
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Message de statut -->
          <div v-if="checkMessage" class="mt-4 p-4 rounded-lg" :class="checkSuccess ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg v-if="checkSuccess" class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <svg v-else class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium">{{ checkMessage }}</p>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-col sm:flex-row gap-4">
            <button @click="logout" class="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Se déconnecter
            </button>
            <button @click="refreshPage" class="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
              Actualiser la page
            </button>
            <button 
              @click="checkBoutiqueAssignment" 
              :disabled="isChecking"
              class="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <svg v-if="isChecking" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isChecking ? 'Vérification...' : 'Vérifier l\'assignation' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="text-center">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Si vous pensez qu'il s'agit d'une erreur, contactez le support technique
        </p>
      </div>
    </div>
  </div>
</template>
