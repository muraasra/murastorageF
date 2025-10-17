<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Sidebar -->
    <div class="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out" :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'">
      <!-- Logo -->
      <div class="flex items-center justify-center h-16 px-4 border-b border-gray-200 dark:border-gray-700">
        <div class="h-10 w-10 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg flex items-center justify-center mr-3 overflow-hidden shadow-sm cursor-pointer hover:shadow-lg transition-shadow" @click="showLogoModal = true">
          <img v-if="entrepriseData?.logo" :src="entrepriseData.logo" alt="Logo entreprise" class="h-full w-full object-contain p-1" @error="handleImageError" @load="handleImageLoad">
          <svg v-else class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
          </svg>
        </div>
        <div>
          <h1 class="text-lg font-semibold text-gray-900 dark:text-white">{{ entrepriseData?.nom || 'StoRage' }}</h1>
          <p class="text-xs text-gray-500 dark:text-gray-400">Super Admin</p>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="mt-8 px-4">
        <div class="space-y-2">
          <NuxtLink 
            to="/superadmin/dashboard" 
            class="flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors"
            active-class="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
            inactive-class="text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
          >
            <svg class="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z"></path>
            </svg>
            Dashboard
          </NuxtLink>

          <NuxtLink 
            to="/superadmin/utilisateurs" 
            class="flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors"
            active-class="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
            inactive-class="text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
          >
            <svg class="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
            Utilisateurs
          </NuxtLink>

          <NuxtLink 
            to="/superadmin/entrepots" 
            class="flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors"
            active-class="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
            inactive-class="text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
          >
            <svg class="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
            </svg>
            Entrepôts
          </NuxtLink>

          <NuxtLink 
            to="/superadmin/tarification" 
            class="flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors"
            active-class="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
            inactive-class="text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
          >
            <svg class="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
            </svg>
            Tarification
          </NuxtLink>

        </div>
      </nav>

      <!-- Informations utilisateur en bas -->
      <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
        <div class="flex items-center space-x-3">
          <div class="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span class="text-white font-semibold text-sm">{{ userData?.first_name?.charAt(0) || 'U' }}</span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ userData?.first_name || 'Utilisateur' }} {{ userData?.last_name || '' }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ entrepriseData?.nom || 'Entreprise' }}</p>
          </div>
          <div class="relative">
            <button @click="showUserMenu = !showUserMenu" class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
              </svg>
            </button>
            
            <!-- Menu dropdown -->
            <div v-if="showUserMenu" class="absolute bottom-full right-0 mb-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
              <button @click="showEditProfile = true; showUserMenu = false" class="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                Mon Profil
              </button>
              <button @click="showEditEntreprise = true; showUserMenu = false" class="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                Mon Entreprise
              </button>
              <hr class="my-1 border-gray-200 dark:border-gray-700">
              <button @click="logout" class="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Overlay mobile -->
    <div v-if="sidebarOpen" class="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden" @click="sidebarOpen = false"></div>

    <!-- Contenu principal -->
    <div class="lg:pl-64">
      <!-- Header mobile -->
      <div class="lg:hidden bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between px-4 py-3">
          <button @click="sidebarOpen = true" class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
          <h1 class="text-lg font-semibold text-gray-900 dark:text-white">{{ entrepriseData?.nom || 'StoRage' }}</h1>
          <div class="w-8"></div>
        </div>
      </div>

      <!-- Contenu -->
      <main class="p-6">
        <slot />
      </main>
    </div>

    <!-- Modales -->
    <EditProfileModal :isOpen="showEditProfile" @close="showEditProfile = false" @updated="loadUserData" />
    <EditEntrepriseModal :isOpen="showEditEntreprise" @close="showEditEntreprise = false" @updated="loadEntrepriseData" />
    
    <!-- Modal de visualisation du logo -->
    <div v-if="showLogoModal && entrepriseData?.logo" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <!-- Overlay -->
        <div class="fixed inset-0 bg-black bg-opacity-90 backdrop-blur-sm transition-opacity" @click="showLogoModal = false"></div>

        <!-- Modal -->
        <div class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <!-- Header -->
          <div class="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="h-10 w-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                </div>
                <div class="ml-4">
                  <h3 class="text-lg font-semibold text-white">Logo de l'entreprise</h3>
                  <p class="text-emerald-100 text-sm">{{ entrepriseData?.nom || 'Entreprise' }}</p>
                </div>
              </div>
              <button @click="showLogoModal = false" class="text-white hover:text-emerald-200 transition-colors">
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>

          <!-- Content -->
          <div class="px-6 py-6">
            <div class="flex justify-center">
              <div class="max-w-2xl w-full">
                <div class="bg-gray-100 dark:bg-gray-700 rounded-lg p-8 flex items-center justify-center">
                  <img :src="entrepriseData.logo" :alt="`Logo ${entrepriseData.nom}`" class="max-w-full max-h-96 object-contain">
                </div>
                <div class="mt-4 text-center">
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    Cliquez en dehors de l'image ou sur la croix pour fermer
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useNotification } from '@/types/useNotification'
import EditProfileModal from '@/components/superadmin/EditProfileModal.vue'
import EditEntrepriseModal from '@/components/superadmin/EditEntrepriseModal.vue'

const { error, success } = useNotification()

// État des données
const userData = ref(null)
const entrepriseData = ref(null)
const showUserMenu = ref(false)
const showEditProfile = ref(false)
const showEditEntreprise = ref(false)
const showLogoModal = ref(false)
const sidebarOpen = ref(false)

// Charger les données utilisateur
const loadUserData = async () => {
  if (process.client) {
    const user = localStorage.getItem('user')
    const entreprise = localStorage.getItem('entreprise')
    
    if (user) userData.value = JSON.parse(user)
    if (entreprise) {
      entrepriseData.value = JSON.parse(entreprise)
    }
  }
}

const loadEntrepriseData = async () => {
  if (process.client) {
    const entreprise = localStorage.getItem('entreprise')
    if (entreprise) {
      entrepriseData.value = JSON.parse(entreprise)
    }
  }
}

// Fonctions de debug pour les images
const handleImageError = (event: Event) => {
  console.error('Erreur de chargement du logo:', (event.target as HTMLImageElement)?.src)
}

const handleImageLoad = (event: Event) => {
  console.log('Logo chargé avec succès')
}

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

// Fermer le menu au clic extérieur
onMounted(() => {
  loadUserData()
  loadEntrepriseData()
  
  if (process.client) {
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.relative')) {
        showUserMenu.value = false
      }
    })
  }
})
</script>
