<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Debug Authentification</h1>
        <p class="mt-2 text-gray-600">
          Vérification de l'état de l'authentification et des middlewares
        </p>
      </div>
      
      <!-- État de l'authentification -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4">État de l'authentification</h2>
        
        <div class="space-y-4">
          <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <span class="font-medium">Token d'accès:</span>
            <span :class="hasToken ? 'text-green-600' : 'text-red-600'">
              {{ hasToken ? 'Présent' : 'Absent' }}
            </span>
          </div>
          
          <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <span class="font-medium">Données utilisateur:</span>
            <span :class="hasUser ? 'text-green-600' : 'text-red-600'">
              {{ hasUser ? 'Présent' : 'Absent' }}
            </span>
          </div>
          
          <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <span class="font-medium">Rôle utilisateur:</span>
            <span :class="userRole ? 'text-green-600' : 'text-red-600'">
              {{ userRole || 'Non défini' }}
            </span>
          </div>
          
          <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <span class="font-medium">Boutique sélectionnée:</span>
            <span :class="hasBoutique ? 'text-green-600' : 'text-orange-600'">
              {{ hasBoutique ? 'Présente' : 'Absente' }}
            </span>
          </div>
        </div>
      </div>
      
      <!-- Détails utilisateur -->
      <div v-if="userData" class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Détails utilisateur</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span class="font-medium text-gray-700">ID:</span>
            <span class="ml-2">{{ userData.id }}</span>
          </div>
          <div>
            <span class="font-medium text-gray-700">Email:</span>
            <span class="ml-2">{{ userData.email }}</span>
          </div>
          <div>
            <span class="font-medium text-gray-700">Rôle:</span>
            <span class="ml-2">{{ userData.role }}</span>
          </div>
          <div>
            <span class="font-medium text-gray-700">Entreprise:</span>
            <span class="ml-2">{{ userData.entreprise || 'Non définie' }}</span>
          </div>
        </div>
      </div>
      
      <!-- Détails boutique -->
      <div v-if="boutiqueData" class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Détails boutique</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span class="font-medium text-gray-700">ID:</span>
            <span class="ml-2">{{ boutiqueData.id }}</span>
          </div>
          <div>
            <span class="font-medium text-gray-700">Nom:</span>
            <span class="ml-2">{{ boutiqueData.nom }}</span>
          </div>
          <div>
            <span class="font-medium text-gray-700">Adresse:</span>
            <span class="ml-2">{{ boutiqueData.adresse || 'Non définie' }}</span>
          </div>
        </div>
      </div>
      
      <!-- Test de navigation -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Test de navigation</h2>
        
        <div class="space-y-4">
          <div class="p-4 bg-gray-50 rounded-lg">
            <h3 class="font-medium mb-2">Accès à /superadmin/tarification:</h3>
            <p :class="canAccessTarification ? 'text-green-600' : 'text-red-600'">
              {{ canAccessTarification ? '✅ Accès autorisé' : '❌ Accès refusé' }}
            </p>
            <p class="text-sm text-gray-600 mt-1">
              {{ accessTarificationReason }}
            </p>
          </div>
          
          <div class="p-4 bg-gray-50 rounded-lg">
            <h3 class="font-medium mb-2">Accès à /superadmin:</h3>
            <p :class="canAccessSuperadmin ? 'text-green-600' : 'text-red-600'">
              {{ canAccessSuperadmin ? '✅ Accès autorisé' : '❌ Accès refusé' }}
            </p>
            <p class="text-sm text-gray-600 mt-1">
              {{ accessSuperadminReason }}
            </p>
          </div>
        </div>
      </div>
      
      <!-- Actions -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Actions</h2>
        
        <div class="flex flex-wrap gap-4">
          <button 
            @click="refreshData"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Actualiser les données
          </button>
          
          <button 
            v-if="canAccessTarification"
            @click="goToTarification"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Aller à Tarification
          </button>
          
          <button 
            v-if="!hasToken"
            @click="goToLogin"
            class="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            Se connecter
          </button>
          
          <button 
            @click="clearStorage"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Effacer le stockage
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

definePageMeta({
  layout: 'default'
})

// État réactif
const hasToken = ref(false)
const hasUser = ref(false)
const hasBoutique = ref(false)
const userData = ref<any>(null)
const boutiqueData = ref<any>(null)
const userRole = ref<string>('')

// Computed properties
const canAccessTarification = computed(() => {
  return hasToken.value && hasUser.value && userRole.value === 'superadmin'
})

const canAccessSuperadmin = computed(() => {
  return hasToken.value && hasUser.value && userRole.value === 'superadmin'
})

const accessTarificationReason = computed(() => {
  if (!hasToken.value) return 'Token d\'accès manquant'
  if (!hasUser.value) return 'Données utilisateur manquantes'
  if (userRole.value !== 'superadmin') return `Rôle insuffisant: ${userRole.value} (requis: superadmin)`
  return 'Toutes les conditions sont remplies'
})

const accessSuperadminReason = computed(() => {
  if (!hasToken.value) return 'Token d\'accès manquant'
  if (!hasUser.value) return 'Données utilisateur manquantes'
  if (userRole.value !== 'superadmin') return `Rôle insuffisant: ${userRole.value} (requis: superadmin)`
  return 'Toutes les conditions sont remplies'
})

// Methods
function refreshData() {
  if (process.client) {
    hasToken.value = !!localStorage.getItem('access_token')
    hasUser.value = !!localStorage.getItem('user')
    hasBoutique.value = !!localStorage.getItem('boutique')
    
    // Parser les données utilisateur
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        userData.value = JSON.parse(userStr)
        userRole.value = userData.value.role || ''
      } catch (e) {
        userData.value = null
        userRole.value = ''
      }
    } else {
      userData.value = null
      userRole.value = ''
    }
    
    // Parser les données boutique
    const boutiqueStr = localStorage.getItem('boutique')
    if (boutiqueStr) {
      try {
        boutiqueData.value = JSON.parse(boutiqueStr)
      } catch (e) {
        boutiqueData.value = null
      }
    } else {
      boutiqueData.value = null
    }
  }
}

function goToTarification() {
  navigateTo('/superadmin/tarification')
}

function goToLogin() {
  navigateTo('/connexion')
}

function clearStorage() {
  if (process.client) {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    localStorage.removeItem('boutique')
    refreshData()
  }
}

// Initialiser les données au montage
onMounted(() => {
  refreshData()
})
</script>














