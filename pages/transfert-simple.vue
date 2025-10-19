<script setup lang="ts">
import { ref, onMounted } from 'vue'

// État simple
const loading = ref(false)
const error = ref('')
const currentEnterprise = ref<any>(null)
const currentUser = ref<any>(null)

// Obtenir l'entreprise de l'utilisateur connecté
const getCurrentEnterprise = () => {
  if (process.client) {
    const enterpriseData = localStorage.getItem('entreprise')
    if (enterpriseData) {
      try {
        return JSON.parse(enterpriseData)
      } catch (e) {
        console.error('Erreur parsing entreprise:', e)
      }
    }
  }
  return null
}

// Obtenir l'utilisateur connecté
const getCurrentUser = () => {
  if (process.client) {
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        return JSON.parse(userData)
      } catch (e) {
        console.error('Erreur parsing user:', e)
      }
    }
  }
  return null
}

// Chargement initial
onMounted(() => {
  console.log('🚀 Page transfert chargée')
  
  const user = getCurrentUser()
  const enterprise = getCurrentEnterprise()
  
  if (!user) {
    error.value = 'Utilisateur non connecté'
    console.error('❌ Utilisateur non connecté')
    return
  }
  
  if (!enterprise) {
    error.value = 'Entreprise non définie'
    console.error('❌ Entreprise non définie')
    return
  }
  
  currentUser.value = user
  currentEnterprise.value = enterprise
  
  console.log('✅ Utilisateur connecté:', user.prenom, user.nom)
  console.log('✅ Entreprise connectée:', enterprise.name)
})
</script>

<template>
  <section class="mt-5 px-6">
    <!-- En-tête simple -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-blue-400 mb-2">📦 Transferts de Stock</h1>
          <p class="text-gray-600 dark:text-gray-400">Gérez les transferts entre entrepôts de votre entreprise</p>
          <div v-if="currentEnterprise" class="mt-2">
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              <UIcon name="i-heroicons-building-office" class="h-4 w-4 mr-1" />
              {{ currentEnterprise.name }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Messages d'erreur -->
    <div v-if="error" class="mb-6 p-4 bg-red-50 dark:bg-red-900 rounded-lg border border-red-200 dark:border-red-700">
      <div class="flex items-center">
        <UIcon name="i-heroicons-exclamation-triangle" class="h-5 w-5 text-red-600 mr-2" />
        <span class="text-red-800 dark:text-red-200">{{ error }}</span>
      </div>
    </div>

    <!-- Contenu principal -->
    <div v-if="!error && currentEnterprise" class="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      <h2 class="text-xl font-semibold mb-4">Système de Transfert de Stock</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Informations utilisateur -->
        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 class="font-semibold mb-2">👤 Utilisateur Connecté</h3>
          <p><strong>Nom:</strong> {{ currentUser?.prenom }} {{ currentUser?.nom }}</p>
          <p><strong>Email:</strong> {{ currentUser?.email }}</p>
          <p><strong>Rôle:</strong> {{ currentUser?.role }}</p>
        </div>

        <!-- Informations entreprise -->
        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 class="font-semibold mb-2">🏢 Entreprise</h3>
          <p><strong>Nom:</strong> {{ currentEnterprise?.name }}</p>
          <p><strong>ID:</strong> {{ currentEnterprise?.id }}</p>
          <p><strong>Statut:</strong> Actif</p>
        </div>
      </div>

      <!-- Actions -->
      <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
        <h3 class="font-semibold mb-4">Actions Disponibles</h3>
        <div class="flex space-x-4">
          <UButton color="blue" icon="i-heroicons-plus">
            Nouveau Transfert
          </UButton>
          <UButton color="green" icon="i-heroicons-list-bullet">
            Voir les Transferts
          </UButton>
          <UButton color="gray" icon="i-heroicons-arrow-path">
            Actualiser
          </UButton>
        </div>
      </div>
    </div>

    <!-- Message de chargement -->
    <div v-if="loading" class="text-center py-8">
      <UIcon name="i-heroicons-arrow-path" class="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
      <p>Chargement...</p>
    </div>
  </section>
</template>



















