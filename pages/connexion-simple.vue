<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Logo et titre -->
      <div class="text-center">
        <div class="mx-auto h-16 w-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl flex items-center justify-center mb-4">
          <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
          </svg>
        </div>
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white">
          Connexion à StoRage
        </h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Gérez votre entreprise et vos stocks efficacement
        </p>
      </div>

      <!-- Formulaire de connexion -->
      <div class="bg-white dark:bg-gray-800 py-8 px-6 shadow-xl rounded-xl border border-gray-200 dark:border-gray-700">
        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- Type de connexion -->
          <div class="space-y-4">
            <div class="flex space-x-4">
              <button
                type="button"
                @click="loginType = 'superadmin'"
                :class="[
                  'flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200',
                  loginType === 'superadmin'
                    ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-600'
                    : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
                ]"
              >
                <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
                Super Admin
              </button>
              <button
                type="button"
                @click="loginType = 'user'"
                :class="[
                  'flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200',
                  loginType === 'user'
                    ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-600'
                    : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
                ]"
              >
                <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                Utilisateur
              </button>
            </div>
          </div>

          <!-- Champ Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Adresse e-mail
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path>
                </svg>
              </div>
              <input
                id="email"
                v-model="formData.email"
                type="email"
                autocomplete="email"
                required
                class="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                placeholder="votre@email.com"
                :class="{ 'border-red-500 focus:border-red-500 focus:ring-red-500': errors.email }"
              />
            </div>
            <p v-if="errors.email" class="mt-1 text-sm text-red-600 dark:text-red-400">
              {{ errors.email }}
            </p>
          </div>

          <!-- Champ Mot de passe -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mot de passe
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
              </div>
              <input
                id="password"
                v-model="formData.password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                required
                class="block w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                placeholder="Votre mot de passe"
                :class="{ 'border-red-500 focus:border-red-500 focus:ring-red-500': errors.password }"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg v-if="showPassword" class="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
                </svg>
                <svg v-else class="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
              </button>
            </div>
            <p v-if="errors.password" class="mt-1 text-sm text-red-600 dark:text-red-400">
              {{ errors.password }}
            </p>
          </div>

          <!-- Champ ID Entreprise (pour utilisateurs) -->
          <div v-if="loginType === 'user'">
            <label for="entrepriseId" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ID de l'entreprise
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
              </div>
              <input
                id="entrepriseId"
                v-model="formData.entrepriseId"
                type="text"
                class="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                placeholder="ID de votre entreprise"
                :class="{ 'border-red-500 focus:border-red-500 focus:ring-red-500': errors.entrepriseId }"
              />
            </div>
            <p v-if="errors.entrepriseId" class="mt-1 text-sm text-red-600 dark:text-red-400">
              {{ errors.entrepriseId }}
            </p>
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Cet ID vous a été fourni par votre administrateur
            </p>
          </div>

          <!-- Options supplémentaires -->
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input
                id="remember-me"
                v-model="formData.rememberMe"
                type="checkbox"
                class="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
              />
              <label for="remember-me" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Se souvenir de moi
              </label>
            </div>
            <div class="text-sm">
              <a href="#" class="font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300">
                Mot de passe oublié ?
              </a>
            </div>
          </div>

          <!-- Bouton de connexion -->
          <div>
            <button
              type="submit"
              :disabled="isLoading"
              class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <span v-if="!isLoading" class="absolute left-0 inset-y-0 flex items-center pl-3">
                <svg class="h-5 w-5 text-emerald-500 group-hover:text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"></path>
                </svg>
              </span>
              <span v-if="isLoading" class="absolute left-0 inset-y-0 flex items-center pl-3">
                <svg class="animate-spin h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
              {{ isLoading ? 'Connexion en cours...' : 'Se connecter' }}
            </button>
          </div>

          <!-- Lien vers inscription -->
          <div class="text-center">
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Pas encore de compte ?
              <NuxtLink to="/home/inscription" class="font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300">
                Créer une entreprise
              </NuxtLink>
            </p>
          </div>
        </form>
      </div>

      <!-- Informations de sécurité -->
      <div class="text-center">
        <p class="text-xs text-gray-500 dark:text-gray-400">
          Connexion sécurisée avec chiffrement SSL/TLS
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'

definePageMeta({
  layout: "accueil",
})

// État du formulaire
const loginType = ref<'superadmin' | 'user'>('superadmin')
const isLoading = ref(false)
const showPassword = ref(false)

const formData = reactive({
  email: '',
  password: '',
  entrepriseId: '',
  rememberMe: false
})

const errors = reactive({
  email: '',
  password: '',
  entrepriseId: ''
})

// Fonctions de notification simples
const showNotification = (message: string, type: 'success' | 'error' = 'error') => {
  if (process.client) {
    const notification = document.createElement('div')
    notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-full ${
      type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
    }`
    notification.innerHTML = `
      <div class="flex items-center">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          ${type === 'success' 
            ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>'
            : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>'
          }
        </svg>
        ${message}
      </div>
    `
    
    document.body.appendChild(notification)
    
    // Animer l'entrée
    setTimeout(() => {
      notification.classList.remove('translate-x-full')
    }, 100)
    
    // Supprimer après 5 secondes
    setTimeout(() => {
      notification.classList.add('translate-x-full')
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification)
        }
      }, 300)
    }, 5000)
  }
}

// Validation du formulaire
const validateForm = () => {
  // Reset errors
  errors.email = ''
  errors.password = ''
  errors.entrepriseId = ''

  let isValid = true

  // Validation email
  if (!formData.email) {
    errors.email = 'L\'adresse e-mail est requise'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'Format d\'e-mail invalide'
    isValid = false
  }

  // Validation mot de passe
  if (!formData.password) {
    errors.password = 'Le mot de passe est requis'
    isValid = false
  } else if (formData.password.length < 6) {
    errors.password = 'Le mot de passe doit contenir au moins 6 caractères'
    isValid = false
  }

  // Validation ID entreprise pour les utilisateurs
  if (loginType.value === 'user' && !formData.entrepriseId) {
    errors.entrepriseId = 'L\'ID de l\'entreprise est requis'
    isValid = false
  }

  return isValid
}

// Gestion de la connexion
const handleLogin = async () => {
  if (!validateForm()) return

  isLoading.value = true

  try {
    // Préparer les données selon le type de connexion
    const loginData = {
      email: formData.email,
      password: formData.password,
      ...(loginType.value === 'user' && { entreprise_id: formData.entrepriseId })
    }

    // Simulation d'une connexion réussie pour le test
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    showNotification('Connexion réussie !', 'success')
    
    // Redirection selon le type
    setTimeout(() => {
      if (loginType.value === 'superadmin') {
        navigateTo('/superadmin/dashboard')
      } else {
        navigateTo('/')
      }
    }, 1000)

  } catch (err) {
    console.error('Erreur de connexion:', err)
    showNotification('Identifiant de connexion incorrect')
  } finally {
    isLoading.value = false
  }
}

// Charger les données sauvegardées
onMounted(() => {
  if (process.client) {
    const rememberMe = localStorage.getItem('remember_me')
    if (rememberMe === 'true') {
      const savedUser = localStorage.getItem('user')
      if (savedUser) {
        const user = JSON.parse(savedUser)
        formData.email = user.email
        formData.rememberMe = true
      }
    }

    // Vérifier s'il y a un ID d'entreprise dans l'URL
    const urlParams = new URLSearchParams(window.location.search)
    const entrepriseId = urlParams.get('entreprise')
    if (entrepriseId) {
      formData.entrepriseId = entrepriseId
      loginType.value = 'user'
    }
  }
})
</script>
