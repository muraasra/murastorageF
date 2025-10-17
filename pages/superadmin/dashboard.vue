<template>
  <div>
    <!-- Indicateur d'entrepôt sélectionné -->
    <div v-if="currentBoutique" class="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <svg class="h-5 w-5 text-green-600 dark:text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <div>
            <p class="text-sm font-medium text-green-900 dark:text-green-100">
              Entrepôt actuellement sélectionné: <span class="font-semibold">{{ currentBoutique.nom }}</span>
            </p>
            <p class="text-xs text-green-700 dark:text-green-300">{{ currentBoutique.ville }}</p>
          </div>
        </div>
        <button 
          @click="clearBoutiqueSelection" 
          class="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
        >
          Retour au dashboard global
        </button>
      </div>
    </div>

    <!-- Barre de recherche et raccourcis -->
    <div class="mb-6">
      <div class="flex items-center gap-3">
        <div class="flex items-center p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex-1">
          <svg class="h-5 w-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <input v-model="searchQuery" @input="onSearch" placeholder="Rechercher une fonctionnalité du dashboard (ex: paramètres, créer utilisateur, créer entrepôt)" class="flex-1 bg-transparent outline-none text-sm text-gray-700 dark:text-gray-200" />
        </div>
      </div>
    </div>

    <!-- Résultats de recherche (fonctionnalités du dashboard) -->
    <div v-if="searchResults.length" class="mb-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3">
      <div class="flex items-center justify-between mb-2">
        <p class="text-sm font-medium text-gray-800 dark:text-gray-200">Fonctionnalités disponibles</p>
        <button @click="clearSearch" class="text-xs text-gray-500 hover:underline">Effacer</button>
      </div>
      <ul class="divide-y divide-gray-200 dark:divide-gray-700">
        <li v-for="item in searchResults" :key="item.name" class="py-2 flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-900 dark:text-gray-100">{{ item.name }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">{{ item.description }}</p>
          </div>
          <button @click="item.action()" class="px-2.5 py-1.5 text-xs bg-green-600 text-white rounded-md hover:bg-green-700">Ouvrir</button>
        </li>
      </ul>
    </div>

    <!-- Barre de navigation -->
    <nav class="mb-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-2">
      <ul class="flex flex-wrap gap-2 text-sm">
        <li><NuxtLink to="/superadmin/dashboard" class="px-3 py-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">Dashboard</NuxtLink></li>
        <li><button @click="showSettings = true" class="px-3 py-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">Paramètres</button></li>
        <li><NuxtLink to="/facturation" class="px-3 py-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">Facturation</NuxtLink></li>
      </ul>
    </nav>

    <!-- Entreprise + Statistiques -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="md:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="h-14 w-14 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 cursor-pointer" @click="openLogoPreview">
                <img v-if="entrepriseData?.logo" :src="entrepriseData.logo" alt="Logo" class="h-full w-full object-contain p-1" />
              </div>
              <div class="ml-4">
                <p class="text-sm text-gray-500 dark:text-gray-400">Entreprise</p>
                <p class="text-lg font-semibold text-gray-900 dark:text-white">{{ entrepriseData?.nom || '—' }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">{{ entrepriseData?.ville }} • NUI: {{ entrepriseData?.numero_fiscal || 'N/A' }}</p>
              </div>
            </div>
            <button @click="showSettings = true" class="px-3 py-1.5 text-xs bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Modifier</button>
          </div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div class="flex items-center">
            <div class="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <svg class="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Entrepôts</p>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ stats.total_boutiques }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div class="flex items-center">
            <div class="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <svg class="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Utilisateurs</p>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ stats.total_utilisateurs }}</p>
            </div>
          </div>
        </div>

      </div>


      <!-- Actions principales retirées -->

      <!-- Statistiques détaillées par entrepôt -->
      <div v-if="(boutiques || []).length > 0" class="mb-8">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Statistiques par Entrepôt</h2>
        <div v-if="loadingBoutiquesStats" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <LoadingSkeleton v-for="i in 6" :key="i" type="card" />
        </div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="boutique in (boutiques || [])" :key="boutique.id" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ boutique.nom }}</h3>
              <button @click="accessBoutiqueDashboard(boutique)" class="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors">Accéder</button>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <p class="text-xs text-gray-500 dark:text-gray-400">Produits</p>
                <p class="text-base font-semibold text-gray-900 dark:text-white">{{ getBoutiqueStockCount(boutique.id) }}</p>
              </div>
              <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <p class="text-xs text-gray-500 dark:text-gray-400">Valeur stock</p>
                <p class="text-base font-semibold text-gray-900 dark:text-white">{{ formatFCFA(getBoutiqueStockValue(boutique.id)) }}</p>
              </div>
              <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <p class="text-xs text-gray-500 dark:text-gray-400">Ventes du jour</p>
                <p class="text-base font-semibold text-gray-900 dark:text-white">{{ formatFCFA(getBoutiqueSalesToday(boutique.id)) }}</p>
              </div>
              <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <p class="text-xs text-gray-500 dark:text-gray-400">Ruptures</p>
                <p class="text-base font-semibold text-gray-900 dark:text-white">{{ getBoutiqueRuptures(boutique.id) }}</p>
              </div>
            </div>
            <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
              <div class="flex justify-between"><span>Ville</span><span>{{ boutique.ville }}</span></div>
              <div class="flex justify-between mt-1"><span>Responsable</span><span>{{ getBoutiqueResponsibleName(boutique.id) }} <button @click="editBoutique(boutique)" class="ml-2 underline text-green-600 dark:text-green-400">Changer</button></span></div>
              <div class="flex justify-between mt-1"><span>Dernière activité</span><span>{{ formatDate(boutique.updated_at) }}</span></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Comparaison des entrepôts (bar chart interactif) et activité récente -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <div class="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Comparaison des entrepôts</h3>
            <div class="flex items-center gap-2 text-xs">
              <!-- toggles not needed with grouped bars -->
            </div>
          </div>
          <div class="relative h-64" @mousemove="onBarHover" @mouseleave="hideTooltip">
            <!-- Filtres entrepôts -->
            <div class="absolute right-0 -top-10 flex flex-wrap gap-2 text-xs">
              <label v-for="b in (boutiques || [])" :key="`f-${b.id}`" class="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-2 py-1 rounded">
                <input type="checkbox" class="mr-1" :value="b.id" v-model="selectedBoutiques" @change="rebuildBars" /> {{ (b.nom || '').substring(0,8) }}
              </label>
            </div>
            <svg :viewBox="`0 0 ${barWidth} ${barHeight}`" class="w-full h-full">
              <line :x1="barPadding" :y1="barHeight - barPadding" :x2="barWidth - barPadding" :y2="barHeight - barPadding" stroke="#9CA3AF" stroke-width="1" />
              <line :x1="barPadding" :y1="barPadding" :x2="barPadding" :y2="barHeight - barPadding" stroke="#9CA3AF" stroke-width="1" />
              <g v-for="(b, i) in barData" :key="b.id">
                <!-- valeur -->
                <rect :x="barPadding + i * (barBand) + barGap" :y="b.yValue" :width="barInner/2 - 2" :height="barHeight - barPadding - b.yValue" fill="#7C3AED" :data-index="i" class="cursor-pointer" />
                <!-- count -->
                <rect :x="barPadding + i * (barBand) + barGap + barInner/2 + 2" :y="b.yCount" :width="barInner/2 - 2" :height="barHeight - barPadding - b.yCount" fill="#10B981" :data-index="i" class="cursor-pointer" />
                <text :x="barPadding + i * (barBand) + barGap + barInner/2" :y="barHeight - 6" text-anchor="middle" font-size="9" fill="#6B7280">{{ b.label }}</text>
              </g>
            </svg>
            <div v-if="tooltip.visible" :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }" class="absolute z-10 bg-black text-white text-xs px-2 py-1 rounded pointer-events-none">
              <div class="font-semibold">{{ tooltip.title }}</div>
              <div>Valeur: {{ formatFCFA(tooltip.value) }}</div>
              <div>Produits: {{ tooltip.count }}</div>
            </div>
          </div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Activité récente</h3>
          <div v-if="recentActivities.length === 0" class="text-sm text-gray-500 dark:text-gray-400">Aucune activité récente</div>
          <ul v-else class="space-y-3">
            <li v-for="act in recentActivities" :key="act.id" class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-800 dark:text-gray-200">{{ act.title }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">{{ act.type }} • {{ act.subtitle }}</p>
              </div>
              <span class="text-xs text-gray-500">{{ act.date }}</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Actions rapides -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div @click="showSettings = true" class="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow text-left cursor-pointer">
          <div class="flex items-center">
            <div class="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <svg class="h-6 w-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Paramètres de l'entreprise</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">Modifier les informations et le logo</p>
            </div>
          </div>
        </div>
        <NuxtLink to="/superadmin/utilisateurs" class="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow text-left">
          <div class="flex items-center">
            <div class="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <svg class="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Gérer les Utilisateurs</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">Voir et gérer les utilisateurs de mon entreprise</p>
            </div>
          </div>
        </NuxtLink>

        <NuxtLink to="/superadmin/entrepots" class="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow text-left">
          <div class="flex items-center">
            <div class="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <svg class="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
              </svg>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Gérer les Entrepôts</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">Voir et gérer les entrepôts de mon entreprise</p>
            </div>
          </div>
        </NuxtLink>

      </div>
    <!-- Modales -->
    <CreateBoutiqueModal :isOpen="showCreateBoutique" @close="showCreateBoutique = false" @created="loadBoutiques" />
    <CreateUserModal :isOpen="showCreateUser" @close="showCreateUser = false" @created="loadUsers" />
    <EditBoutiqueModal :isOpen="showEditBoutique" :boutique="selectedBoutique" @close="showEditBoutique = false" @updated="loadBoutiques" />
    <EditEntrepriseModal :isOpen="showSettings" @close="showSettings = false" @updated="onEntrepriseUpdated" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useNotification } from '@/types/useNotification'
import { useAuth } from '@/composables/useAuth'
import { useApi } from '@/stores/useApi'
import CreateBoutiqueModal from '@/components/superadmin/CreateBoutiqueModal.vue'
import CreateUserModal from '@/components/superadmin/CreateUserModal.vue'
import EditBoutiqueModal from '@/components/superadmin/EditBoutiqueModal.vue'
import EditEntrepriseModal from '@/components/superadmin/EditEntrepriseModal.vue'
import LoadingSkeleton from '@/components/LoadingSkeleton.vue'
import { API_BASE_URL } from '@/constants'

definePageMeta({
  layout: "superadmin",
})

const { error, success } = useNotification()
const { getAuthHeaders } = useAuth()

// État des données
const stats = reactive({
  total_boutiques: 0,
  total_utilisateurs: 0
})

const boutiques = ref<any[]>([])
const users = ref<any[]>([])
const boutiquesStats = ref<any[]>([])
const currentBoutique = ref<any>(null)
const entrepriseData = ref<any>(null)

// Initialisation sécurisée
const initializeData = () => {
  if (!boutiques.value) boutiques.value = []
  if (!users.value) users.value = []
  if (!boutiquesStats.value) boutiquesStats.value = []
}

// États de chargement
const loadingStats = ref(true)
const loadingBoutiques = ref(true)
const loadingUsers = ref(true)
const loadingBoutiquesStats = ref(true)

// Recherche
const searchQuery = ref('')
const searchResults = ref<{ name: string, description: string, action: () => void }[]>([])
// Index des fonctionnalités du dashboard uniquement
const NAV_ITEMS: { name: string, description: string, action: () => void }[] = [
  { name: 'Paramètres de l\'entreprise', description: 'Modifier les informations de l\'entreprise et le logo', action: () => { showSettings.value = true } },
  { name: 'Créer un utilisateur', description: 'Ajouter un nouvel utilisateur à l\'entreprise', action: () => { showCreateUser.value = true } },
  { name: 'Créer un entrepôt', description: 'Ajouter un nouvel entrepôt', action: () => { showCreateBoutique.value = true } },
]

// État des modales
const showCreateBoutique = ref(false)
const showCreateUser = ref(false)
const showEditBoutique = ref(false)
const selectedBoutique = ref(null)
const showSettings = ref(false)


// Charger les statistiques
const loadStats = async () => {
  loadingStats.value = true
  try {
    // Récupérer l'ID de l'entreprise depuis le localStorage
    const entreprise = localStorage.getItem('entreprise')
    if (!entreprise) {
      error('Informations entreprise manquantes')
      return
    }
    
    const e = JSON.parse(entreprise)
    const entrepriseId = e.id
    // normaliser logo pour la carte entreprise
    if (e.logo && typeof e.logo === 'string') {
      const isAbs = /^https?:\/\//i.test(e.logo)
      e.logo = isAbs ? e.logo : `${API_BASE_URL}${e.logo.startsWith('/') ? e.logo : `/${e.logo}`}`
    }
    entrepriseData.value = e

    try {
      // Charger les statistiques de l'entreprise spécifique
      const { data: entrepriseData, error: entrepriseError } = await useApi(`${API_BASE_URL}/api/entreprises/${entrepriseId}/`, {
        method: 'GET',
        server: false,
        headers: getAuthHeaders() as any
      })
      
      if (entrepriseData.value) {
        // Les statistiques seront mises à jour par les autres fonctions loadBoutiques et loadUsers
        console.log('🔍 Données entreprise chargées:', entrepriseData.value)
      }
    } catch (apiError: any) {
      error('Erreur lors du chargement des statistiques: ' + (apiError.data?.message || apiError.message))
      return
    }
  } catch (err) {
    console.error('Erreur chargement stats:', err)
  } finally {
    loadingStats.value = false
  }
}

// Charger les entrepôts
const loadBoutiques = async () => {
  loadingBoutiques.value = true
  try {
    // Récupérer l'ID de l'entreprise depuis le localStorage
    const entreprise = localStorage.getItem('entreprise')
    if (!entreprise) {
      error('Informations entreprise manquantes')
      return
    }
    
    const entrepriseData = JSON.parse(entreprise)
    const entrepriseId = entrepriseData.id

    try {
      const { data: boutiquesData, error: boutiquesError } = await useApi(`${API_BASE_URL}/api/boutiques/?entreprise=${entrepriseId}`, {
        method: 'GET',
        server: false,
        headers: getAuthHeaders() as any
      })
      
      if (boutiquesData.value && typeof boutiquesData.value === 'object' && 'results' in boutiquesData.value) {
        boutiques.value = Array.isArray(boutiquesData.value.results) ? boutiquesData.value.results : []
      } else {
        boutiques.value = Array.isArray(boutiquesData.value) ? boutiquesData.value : []
      }
      
      // mettre à jour le compteur fiable
      stats.total_boutiques = boutiques.value.length
    } catch (apiError: any) {
      error('Erreur lors du chargement des entrepôts: ' + (apiError.data?.message || apiError.message))
      return
    }
  } catch (err) {
    console.error('Erreur chargement boutiques:', err)
  } finally {
    loadingBoutiques.value = false
  }
}

// Charger les utilisateurs
const loadUsers = async () => {
  loadingUsers.value = true
  try {
    // Récupérer l'ID de l'entreprise depuis le localStorage
    const entreprise = localStorage.getItem('entreprise')
    if (!entreprise) {
      error('Informations entreprise manquantes')
      return
    }
    
    const entrepriseData = JSON.parse(entreprise)
    const entrepriseId = entrepriseData.id

    try {
      const { data: usersData, error: usersError } = await useApi(`${API_BASE_URL}/api/users/?entreprise=${entrepriseId}`, {
        method: 'GET',
        server: false,
        headers: getAuthHeaders() as any
      })
      
      if (usersData.value && typeof usersData.value === 'object' && 'results' in usersData.value) {
        users.value = Array.isArray(usersData.value.results) ? usersData.value.results : []
      } else {
        users.value = Array.isArray(usersData.value) ? usersData.value : []
      }
      
      // mettre à jour le compteur fiable
      stats.total_utilisateurs = users.value.length
    } catch (apiError: any) {
      error('Erreur lors du chargement des utilisateurs: ' + (apiError.data?.message || apiError.message))
      return
    }
  } catch (err) {
    console.error('Erreur chargement users:', err)
  } finally {
    loadingUsers.value = false
  }
}

// Fonctions utilitaires
const getRoleBadgeClass = (role: string) => {
  switch (role) {
    case 'superadmin':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    case 'admin':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    case 'user':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
  }
}

// Trouver le nom du responsable d'un entrepôt à partir de la liste des utilisateurs
// duplicate removed below


const deleteBoutique = async (id: number) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer cet entrepôt ?')) {
    try {
      const { error: apiError } = await useApi(`${API_BASE_URL}/api/boutiques/${id}/`, {
        method: 'DELETE',
        server: false
      })

      if (apiError.value) {
        error('Erreur lors de la suppression')
        return
      }

      // Invalider le cache des entrepôts
      invalidateCache('boutiques')
      
      success('Entrepôt supprimé avec succès')
      loadBoutiques()
    } catch (err) {
      console.error('Erreur suppression:', err)
      error('Erreur lors de la suppression')
    }
  }
}

const editUser = (user: any) => {
  // TODO: Implémenter l'édition d'utilisateur
  console.log('Éditer utilisateur:', user)
}

const deleteUser = async (id: number) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
    try {
      const { error: apiError } = await useApi(`${API_BASE_URL}/api/users/${id}/`, {
        method: 'DELETE',
        server: false
      })

      if (apiError.value) {
        error('Erreur lors de la suppression')
        return
      }

      success('Utilisateur supprimé avec succès')
      loadUsers()
    } catch (err) {
      console.error('Erreur suppression:', err)
      error('Erreur lors de la suppression')
    }
  }
}

const editBoutique = (boutique: any) => {
  selectedBoutique.value = boutique
  showEditBoutique.value = true
}

// Charger les statistiques des entrepôts
const loadBoutiquesStats = async () => {
  loadingBoutiquesStats.value = true
  try {
    // Vérifier que boutiques est bien un tableau
    if (!Array.isArray(boutiques.value) || boutiques.value.length === 0) {
      console.warn('Aucune boutique disponible pour charger les statistiques')
      return
    }
    
    const entreprise = localStorage.getItem('entreprise')
    if (!entreprise) return
    
    const entrepriseData = JSON.parse(entreprise)
    const entrepriseId = entrepriseData.id

    // Charger les statistiques pour chaque entrepôt
    const statsPromises = boutiques.value.map(async (boutique) => {
      try {
        // Récupérer les stocks de l'entrepôt
        const { data: stocksData } = await useApi(`${API_BASE_URL}/api/stocks/?entrepot=${boutique.id}`)
        
        if (stocksData.value && Array.isArray(stocksData.value)) {
          const stocksAvecQuantite = stocksData.value.filter((stock: any) => stock.quantite > 0)
          
          if (stocksAvecQuantite.length > 0) {
            const productIds = stocksAvecQuantite.map((stock: any) => stock.produit).join(',')
            const { data: productsData } = await useApi(`${API_BASE_URL}/api/produits/?id__in=${productIds}`)
            
            if (productsData.value && Array.isArray(productsData.value)) {
              const totalStock = stocksAvecQuantite.reduce((acc: number, stock: any) => acc + stock.quantite, 0)
              const totalValue = stocksAvecQuantite.reduce((acc: number, stock: any) => {
                const produit = (productsData.value as any[]).find((p: any) => p.id === stock.produit)
                const prix = produit?.prix_vente || produit?.prix || 0
                return acc + (stock.quantite * prix)
              }, 0)
              
              return {
                id: boutique.id,
                nom: boutique.nom,
                ville: boutique.ville,
                responsable: boutique.responsable,
                updated_at: boutique.updated_at,
                stockCount: totalStock,
                stockValue: totalValue
              }
            }
          }
        }
        
        return {
          id: boutique.id,
          nom: boutique.nom,
          ville: boutique.ville,
          responsable: boutique.responsable,
          updated_at: boutique.updated_at,
          stockCount: 0,
          stockValue: 0
        }
      } catch (error) {
        console.error(`Erreur chargement stats pour ${boutique.nom}:`, error)
        return {
          id: boutique.id,
          nom: boutique.nom,
          ville: boutique.ville,
          responsable: boutique.responsable,
          updated_at: boutique.updated_at,
          stockCount: 0,
          stockValue: 0
        }
      }
    })

    boutiquesStats.value = await Promise.all(statsPromises)
  } catch (err) {
    console.error('Erreur chargement stats boutiques:', err)
  } finally {
    loadingBoutiquesStats.value = false
  }
}

// Fonctions utilitaires pour les statistiques
const getBoutiqueStockCount = (boutiqueId: number) => {
  const boutiqueStat = boutiquesStats.value.find(stat => stat.id === boutiqueId)
  return boutiqueStat?.stockCount || 0
}

const getBoutiqueStockValue = (boutiqueId: number) => {
  const boutiqueStat = boutiquesStats.value.find(stat => stat.id === boutiqueId)
  return boutiqueStat?.stockValue || 0
}

const getBoutiqueResponsibleName = (boutiqueId: number) => {
  // Heuristic: find an admin/superadmin attached to the boutique
  const u = (users.value || []).find((usr: any) => usr.boutique?.id === boutiqueId && (usr.role === 'admin' || usr.role === 'superadmin'))
  if (!u) return 'Non assigné'
  return `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.username || 'Non assigné'
}

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// Formats
const formatFCFA = (n: number) => `${Math.round(n).toLocaleString()} FCFA`

// KPIs supplémentaires
const salesTodayByBoutique = ref<Record<number, number>>({})
const rupturesByBoutique = ref<Record<number, number>>({})
const getBoutiqueSalesToday = (boutiqueId: number) => {
  return salesTodayByBoutique.value[boutiqueId] || 0
}
const getBoutiqueRuptures = (boutiqueId: number) => {
  return rupturesByBoutique.value[boutiqueId] || 0
}
const loadSalesToday = async () => {
  try {
    const headers = getAuthHeaders() as any
    const today = new Date()
    const yyyy = today.getFullYear()
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const dd = String(today.getDate()).padStart(2, '0')
    const todayStr = `${yyyy}-${mm}-${dd}`
    for (const b of boutiques.value) {
      try {
        const factures: any[] = await $fetch(`${API_BASE_URL}/api/factures/?boutique=${b.id}`, { headers })
        const todays = (Array.isArray(factures) ? factures : []).filter((f: any) => {
          const d = new Date(f.created_at || f.date || f.updated_at || 0)
          const dStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
          return dStr === todayStr
        })
        const sum = todays.reduce((acc, f: any) => acc + Number(f.total || 0), 0)
        salesTodayByBoutique.value = { ...salesTodayByBoutique.value, [b.id]: sum }
      } catch (e) {
        // ignore boutique errors
      }
    }
  } catch (e) {
    // ignore global errors
  }
}

const loadRuptures = async () => {
  try {
    const headers = getAuthHeaders() as any
    for (const b of boutiques.value) {
      try {
        const stocks: any[] = await $fetch(`${API_BASE_URL}/api/stocks/?entrepot=${b.id}`, { headers })
        const ruptureCount = (Array.isArray(stocks) ? stocks : []).filter((s: any) => Number(s.quantite || 0) <= 0).length
        rupturesByBoutique.value = { ...rupturesByBoutique.value, [b.id]: ruptureCount }
      } catch (e) {
        // ignore errors per entrepôt
      }
    }
  } catch (e) {
    // ignore global errors
  }
}

// Rafraîchir les données après mise à jour de l'entreprise
const onEntrepriseUpdated = async () => {
  await loadStats()
}

// Fonction pour accéder au dashboard d'un entrepôt
const accessBoutiqueDashboard = async (boutique: any) => {
  try {
    // Sauvegarder l'entrepôt sélectionné dans le localStorage
    localStorage.setItem('boutique', JSON.stringify(boutique))
    
    // Mettre à jour l'entrepôt actuel
    currentBoutique.value = boutique
    
    // Afficher une notification de confirmation
    success(`Accès au dashboard de l'entrepôt "${boutique.nom}"`)
    
    // Rediriger vers l'espace entrepôt (menus visibles)
    await navigateTo('/user')
  } catch (err) {
    console.error('Erreur accès dashboard:', err)
    error('Erreur lors de l\'accès au dashboard de l\'entrepôt')
  }
}

// Fonction pour effacer la sélection d'entrepôt
const clearBoutiqueSelection = () => {
  localStorage.removeItem('boutique')
  currentBoutique.value = null
  success('Retour au dashboard global')
}

// Charger les données au montage
onMounted(async () => {
  // Initialiser les données de manière sécurisée
  initializeData()
  
  // Vérifier si un entrepôt est déjà sélectionné
  const boutique = localStorage.getItem('boutique')
  if (boutique) {
    try {
      currentBoutique.value = JSON.parse(boutique)
    } catch (e) {
      console.warn('Erreur parsing boutique:', e)
      localStorage.removeItem('boutique')
    }
  }
  
  // Précharger les données importantes en parallèle
  await Promise.all([
    loadStats(),
    loadBoutiques(),
    loadUsers()
  ])
  
  // Charger les données dépendantes après les données de base
  await loadBoutiquesStats()
  buildCharts()
  computeRecentActivities()
  await Promise.all([
    loadSalesToday(),
    loadRuptures()
  ])
})

// UI helpers
const openLogoPreview = () => {
  if (!entrepriseData.value?.logo) return
  const w = window.open('', '_blank', 'width=640,height=480')
  if (!w) return
  w.document.write(`<html><head><title>Logo</title></head><body style="margin:0;background:#111;display:flex;align-items:center;justify-content:center;height:100vh;"><img src="${entrepriseData.value.logo}" style="max-width:90%;max-height:90%;object-fit:contain"/></body></html>`)
}

const onSearch = () => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) { searchResults.value = []; return }
  searchResults.value = NAV_ITEMS.filter(i => i.name.toLowerCase().includes(q))
}
const clearSearch = () => { searchQuery.value = ''; searchResults.value = [] }

// Activité récente (simple: dernières entités)
const recentActivities = ref<any[]>([])
const computeRecentActivities = () => {
  const acts: any[] = []
  ;(users.value || []).slice(0, 5).forEach((u: any) => {
    acts.push({ id: `u-${u.id}`, title: `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.username, subtitle: u.email || '—', type: 'Utilisateur créé/modifié', date: formatDate(u.updated_at || u.created_at) })
  })
  ;(boutiques.value || []).slice(0, 5).forEach((b: any) => {
    acts.push({ id: `b-${b.id}`, title: b.nom, subtitle: b.ville || '—', type: 'Entrepôt créé/modifié', date: formatDate(b.updated_at || b.created_at) })
  })
  recentActivities.value = acts.slice(0, 8)
}

// Bar chart interactif pour comparer les entrepôts
const currentMetric = ref<'value' | 'count'>('value')
const barWidth = 600
const barHeight = 240
const barPadding = 28
const barGap = 10
const barBand = ref(40)
const barInner = ref(20)
const barData = ref<any[]>([])
const tooltip = ref<{ visible: boolean, x: number, y: number, title: string, value: number, count: number }>({ visible: false, x: 0, y: 0, title: '', value: 0, count: 0 })
const selectedBoutiques = ref<number[]>([])

const rebuildBars = () => {
  // Vérifier que boutiques est bien un tableau
  if (!Array.isArray(boutiques.value)) {
    console.warn('boutiques.value n\'est pas un tableau:', boutiques.value)
    barData.value = []
    return
  }
  
  const source = boutiques.value.filter((b: any) => selectedBoutiques.value.length === 0 || selectedBoutiques.value.includes(b.id))
  const items = source.map((b: any) => {
    const stat = (boutiquesStats.value || []).find((s: any) => s.id === b.id)
    return {
      id: b.id,
      label: (b.nom || '').toString().substring(0, 8),
      value: Number(stat?.stockValue || 0),
      count: Number(stat?.stockCount || 0)
    }
  })
  const values = items.map(i => Math.max(i.value, i.count))
  const maxVal = Math.max(1, ...values)
  const usableWidth = barWidth - barPadding * 2
  const n = Math.max(1, items.length)
  barBand.value = Math.max(40, Math.floor(usableWidth / n))
  barInner.value = Math.max(16, barBand.value - barGap * 2)
  barData.value = items.map((i) => {
    const yValue = (barHeight - barPadding) - (i.value / maxVal) * (barHeight - barPadding * 2)
    const yCount = (barHeight - barPadding) - (i.count / maxVal) * (barHeight - barPadding * 2)
    return { ...i, yValue, yCount }
  })
}

const onBarHover = (e: MouseEvent) => {
  const svg = (e.currentTarget as HTMLElement).querySelector('svg') as SVGSVGElement
  if (!svg) return
  const rect = svg.getBoundingClientRect()
  const x = e.clientX - rect.left
  const idx = Math.floor((x - barPadding) / barBand.value)
  const data = barData.value[idx]
  if (!data) { tooltip.value.visible = false; return }
  tooltip.value = {
    visible: true,
    x: e.clientX - rect.left + 10,
    y: e.clientY - rect.top - 10,
    title: data.label,
    value: data.value,
    count: data.count
  }
}
const hideTooltip = () => { tooltip.value.visible = false }

const buildCharts = () => {
  rebuildBars()
}

// end script
</script>

