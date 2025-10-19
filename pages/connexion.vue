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
// Imports conditionnels pour éviter les erreurs SSR
const useNotification = () => {
  const showToast = (message: string, type: 'success' | 'error') => {
    if (process.client) {
      // Créer un élément toast
      const toast = document.createElement('div')
      toast.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out ${
        type === 'success' 
          ? 'bg-green-500 text-white' 
          : 'bg-red-500 text-white'
      }`
      
      // Icône selon le type
      const icon = type === 'success' ? '✅' : '❌'
      toast.innerHTML = `
        <div class="flex items-center space-x-2">
          <span class="text-lg">${icon}</span>
          <span class="font-medium">${message}</span>
          <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-white hover:text-gray-200">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
            </svg>
          </button>
        </div>
      `
      
      // Styles initiaux pour l'animation
      toast.style.transform = 'translateX(100%)'
      toast.style.opacity = '0'
      
      // Ajouter au DOM
      document.body.appendChild(toast)
      
      // Animation d'entrée
      setTimeout(() => {
        toast.style.transform = 'translateX(0)'
        toast.style.opacity = '1'
      }, 100)
      
      // Suppression automatique après 5 secondes
      setTimeout(() => {
        toast.style.transform = 'translateX(100%)'
        toast.style.opacity = '0'
        setTimeout(() => {
          if (toast.parentElement) {
            toast.remove()
          }
        }, 300)
      }, 5000)
    }
  }

  const error = (message: string) => {
    console.error(message)
    showToast(message, 'error')
  }
  
  const success = (message: string) => {
    console.log(message)
    showToast(message, 'success')
  }
  
  return { error, success }
}

const useAuthStore = () => {
  return {
    setToken: (token: string) => {
      if (process.client) {
        localStorage.setItem('access_token', token)
      }
    },
    setUser: (user: any) => {
      if (process.client) {
        localStorage.setItem('user', JSON.stringify(user))
      }
    }
  }
}

const API_BASE_URL = 'https://murastorage.pythonanywhere.com'

// Fonction de test de l'API - Test simple de connectivité
const testApiConnection = async () => {
  try {
    console.log('Test de connexion à l\'API...')
    // Test simple avec un endpoint qui existe probablement
    const response = await $fetch(`${API_BASE_URL}/api/auth/jwt/login/`, {
      method: 'OPTIONS', // Méthode OPTIONS pour tester la connectivité
      timeout: 5000
    })
    console.log('API accessible:', response)
    return true
  } catch (err: any) {
    // Si c'est une erreur 405 (Method Not Allowed), c'est bon signe - l'API répond
    if (err.statusCode === 405 || err.status === 405) {
      console.log('API accessible (405 Method Not Allowed est normal)')
      return true
    }
    console.error('API non accessible:', err)
    return false
  }
}

const useErrorHandler = () => {
  return {
    handleApiError: (err: any) => {
      console.error('API Error:', err)
    }
  }
}

const useTracking = () => {
  return {
    trackPage: () => {},
    trackLogin: () => {},
    trackButtonClick: () => {},
    trackError: () => {}
  }
}

definePageMeta({
  layout: "accueil",
})

const { error, success } = useNotification()
const auth = useAuthStore()
const { handleApiError } = useErrorHandler()
const { trackPage, trackLogin, trackButtonClick, trackError } = useTracking()

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
  
  // Tracking du début de connexion - Éviter les appels côté serveur
  if (process.client) {
    trackButtonClick('login_submit', 'connexion_page')
  }

  try {
    // Appel à l'API JWT - Éviter les appels côté serveur
    if (process.server) {
      error('Connexion non disponible pendant le pré-rendu')
      isLoading.value = false
      return
    }

    // Pas de test préalable - on va directement à la connexion

    // Préparer les données selon le type de connexion
    const loginData = {
      email: formData.email,
      password: formData.password,
      ...(loginType.value === 'user' && { entreprise_id: formData.entrepriseId })
    }

    console.log('Tentative de connexion avec:', loginData)
    console.log('URL API:', `${API_BASE_URL}/api/auth/jwt/login/`)
    
    const response = await $fetch<any>(`${API_BASE_URL}/api/auth/jwt/login/`, {
      method: 'POST',
      body: loginData,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'omit', // Éviter les problèmes CORS
      mode: 'cors'
    })

    // Sauvegarder le token dans le store auth
    auth.setToken(response.access)
    
    // Sauvegarder les informations utilisateur dans le store auth
    auth.setUser({
      id: response.user.id,
      username: response.user.username,
      email: response.user.email,
      role: response.user.role
    })

    // Sauvegarder les données supplémentaires dans localStorage
    if (process.client) {
      localStorage.setItem('user', JSON.stringify(response.user))
      localStorage.setItem('refresh_token', response.refresh)
      localStorage.setItem('entreprise', JSON.stringify(response.entreprise))
      
      // Ne sauvegarder la boutique que si elle existe
      if (response.boutique) {
        localStorage.setItem('boutique', JSON.stringify(response.boutique))
      } else {
        localStorage.removeItem('boutique')
      }
      
      localStorage.setItem('permissions', JSON.stringify(response.permissions))
      
      if (formData.rememberMe) {
        localStorage.setItem('remember_me', 'true')
      }
    }

    success('Connexion réussie !')
    
    // Tracking de la connexion réussie - Éviter les appels côté serveur
    if (process.client) {
      trackLogin(loginType.value)
    }

    // Redirection selon le rôle
    setTimeout(() => {
      const userRole = response.user.role
      if (userRole === 'superadmin') {
        navigateTo('/superadmin/dashboard')
      } else {
        // Pour admin/user, rediriger vers la racine - le middleware s'occupera de la redirection finale
        navigateTo('/')
      }
    }, 1000)

  } catch (err: any) {
    console.error('Erreur de connexion détaillée:', err)
    console.error('Type d\'erreur:', typeof err)
    console.error('Message:', err.message)
    console.error('Status:', err.status || err.statusCode)
    
    // Gestion d'erreur plus spécifique
    if (err.statusCode === 401 || err.status === 401) {
      error('Email ou mot de passe incorrect')
    } else if (err.statusCode === 400 || err.status === 400) {
      error('Données de connexion invalides')
    } else if (err.statusCode === 0 || err.status === 0 || err.message?.includes('fetch') || err.message?.includes('CORS')) {
      error('Problème de connexion au serveur. Vérifiez votre connexion internet.')
    } else if (err.statusCode >= 500 || err.status >= 500) {
      error('Erreur du serveur. Veuillez réessayer plus tard.')
    } else if (err.message?.includes('timeout')) {
      error('Connexion trop lente. Vérifiez votre connexion internet.')
    } else {
      error(`Erreur de connexion: ${err.message || 'Erreur inconnue'}`)
    }
    
    // Tracking de l'erreur générale - Éviter les appels côté serveur
    if (process.client) {
      trackError('login_exception', err.message || 'Unknown exception', 'connexion_page')
    }
  } finally {
    isLoading.value = false
  }
}

// Charger les données sauvegardées
onMounted(() => {
  // Tracking de la page de connexion - Éviter les appels côté serveur
  if (process.client) {
    trackPage('Connexion', '/connexion')
  }
  
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
    const entrepriseId = urlParams.get('entreprise_id')
    if (entrepriseId) {
      formData.entrepriseId = entrepriseId
      loginType.value = 'user'
    }
  }
})
</script>



