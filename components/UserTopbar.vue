<script setup lang="ts">
import { ref, onMounted } from 'vue'
import EditProfileModal from '@/components/superadmin/EditProfileModal.vue'
import ThemeSwitcher from '@/components/blocks/ThemeSwitcher.vue'
import { API_BASE_URL } from '@/constants'
import { useAuthStore } from '@/stores/auth'
const authStore = useAuthStore()

const userData = ref<any>(null)
const entrepriseData = ref<any>(null)
const boutiqueData = ref<any>(null)
const showEditProfile = ref(false)

onMounted(() => {
  if (process.client) {
    const user = localStorage.getItem('user')
    const entreprise = localStorage.getItem('entreprise')
    const boutique = localStorage.getItem('boutique')
    if (user) userData.value = JSON.parse(user)
    if (entreprise) {
      const e = JSON.parse(entreprise)
      // Normaliser URL du logo: si non absolu, préfixer API_BASE_URL
      if (e && e.logo && typeof e.logo === 'string') {
        const logo: string = e.logo
        const isAbsolute = /^https?:\/\//i.test(logo)
        if (!isAbsolute) {
          const cleanPath = logo.startsWith('/') ? logo : `/${logo}`
          e.logo = `${API_BASE_URL}${cleanPath}`
        }
      }
      entrepriseData.value = e
    }
    if (boutique) boutiqueData.value = JSON.parse(boutique)
  }
})

const logout = () => authStore.logout()

const openLogoPreview = () => {
  if (!entrepriseData.value?.logo) return
  const w = window.open('', '_blank', 'width=640,height=480')
  if (!w) return
  w.document.write(`<html><head><title>Logo</title></head><body style="margin:0;background:#111;display:flex;align-items:center;justify-content:center;height:100vh;"><img src="${entrepriseData.value.logo}" style="max-width:90%;max-height:90%;object-fit:contain"/></body></html>`)
}
</script>

<template>
  <div class="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-700">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center py-3">
        <div class="flex items-center">
          <div class="h-10 w-10 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg flex items-center justify-center mr-3 overflow-hidden shadow-sm cursor-pointer" @click="openLogoPreview">
            <img v-if="entrepriseData?.logo" :src="entrepriseData.logo" alt="Logo entreprise" class="h-full w-full object-contain p-1" title="Agrandir le logo">
            <svg v-else class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
            </svg>
          </div>
          <div>
            <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ boutiqueData?.nom || 'Entrepôt' }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">{{ entrepriseData?.nom || 'Entreprise' }}</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <!-- Logo MuRa StoRage -->
          <NuxtLink to="/" class="hidden md:flex items-center mr-1">
            <img src="/img/logo-mura-storage.png" alt="MuRa StoRage" class="h-8 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity" />
          </NuxtLink>
          <ThemeSwitcher />
          <button v-if="userData?.role === 'superadmin'" @click="navigateTo('/superadmin/dashboard')" class="px-3 py-1.5 text-xs sm:text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
            Retour superadmin
          </button>
          <div class="hidden sm:block text-right">
            <button @click="showEditProfile = true" class="text-sm font-medium text-gray-900 dark:text-white hover:underline">
              {{ userData?.first_name || 'Utilisateur' }} {{ userData?.last_name || '' }}
            </button>
            <p class="text-xs text-gray-500 dark:text-gray-400">{{ userData?.role === 'admin' ? 'Admin' : (userData?.role === 'superadmin' ? 'SuperAdmin' : 'Utilisateur') }}</p>
          </div>
          <button @click="logout" title="Se déconnecter" class="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <UIcon name="i-heroicons-arrow-right-on-rectangle" class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  </div>

  <EditProfileModal :isOpen="showEditProfile" @close="showEditProfile = false" />
</template>

<style scoped>
</style>


