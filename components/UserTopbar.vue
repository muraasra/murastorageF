<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import EditProfileModal from '@/components/superadmin/EditProfileModal.vue'
import { useAuthStore } from '@/stores/auth'
import { API_BASE_URL } from '@/constants'

const auth = useAuthStore()
const boutiqueData = ref<any>(null)
const entrepriseData = ref<any>(null)
const showEditProfile = ref(false)

const isSuperAdmin = computed(() => auth.user?.role === 'superadmin')

onMounted(() => {
  if (!process.client) return
  const entreprise = localStorage.getItem('entreprise')
  const boutique = localStorage.getItem('boutique')
  if (entreprise) {
    const e = JSON.parse(entreprise)
    if (e?.logo && typeof e.logo === 'string' && !/^https?:\/\//i.test(e.logo)) {
      e.logo = `${API_BASE_URL}${e.logo.startsWith('/') ? e.logo : '/' + e.logo}`
    }
    entrepriseData.value = e
  }
  if (boutique) boutiqueData.value = JSON.parse(boutique)
})

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
      <div class="flex justify-between items-center py-3 gap-3">

        <!-- Gauche : logo boutique + nom -->
        <div class="flex items-center min-w-0">
          <div
            class="h-10 w-10 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg flex items-center justify-center mr-3 overflow-hidden shadow-sm cursor-pointer flex-shrink-0"
            @click="openLogoPreview"
          >
            <img v-if="entrepriseData?.logo" :src="entrepriseData.logo" alt="Logo" class="h-full w-full object-contain p-1" />
            <svg v-else class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div class="min-w-0 hidden sm:block">
            <p class="text-sm font-semibold text-gray-900 dark:text-white truncate">{{ boutiqueData?.nom || 'Entrepôt' }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ entrepriseData?.nom || 'Entreprise' }}</p>
          </div>
        </div>

        <!-- Droite : logo MuRa + profil dropdown -->
        <div class="flex items-center gap-2 flex-shrink-0">
          <NuxtLink to="/" class="hidden md:flex items-center mr-1">
            <img src="/img/logo-mura-storage.png" alt="MuRa StoRage" class="h-8 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity" />
          </NuxtLink>

          <button
            v-if="isSuperAdmin"
            @click="navigateTo('/superadmin/dashboard')"
            class="hidden sm:block px-3 py-1.5 text-xs bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Retour superadmin
          </button>

          <!-- Profile dropdown (thème + langue + profil + déconnexion) -->
          <UserProfileDropdown @open-profile="showEditProfile = true" />
        </div>

      </div>
    </div>
  </div>

  <EditProfileModal :isOpen="showEditProfile" @close="showEditProfile = false" />
</template>
