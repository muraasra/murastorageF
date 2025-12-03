<template>
  <div>
    <!-- Header de la page -->
    <div class="mb-6 md:mb-8 px-4 md:px-0">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Gestion des Entrepôts</h1>
          <p class="mt-2 text-sm md:text-base text-gray-600 dark:text-gray-400">Gérez les entrepôts de votre entreprise</p>
        </div>
        <button @click="showCreateBoutique = true" class="px-4 py-2 text-sm md:text-base bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center w-full sm:w-auto">
          <svg class="h-4 w-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Nouvel Entrepôt
        </button>
      </div>
    </div>

    <!-- Statistiques -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8 px-4 md:px-0">
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div class="flex items-center">
          <div class="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <svg class="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Entrepôts</p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ boutiques.length }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div class="flex items-center">
          <div class="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <svg class="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Villes</p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ uniqueVilles }}</p>
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
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Avec Responsable</p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ avecResponsable }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div class="flex items-center">
          <div class="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
            <svg class="h-6 w-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Produits</p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ totalProduits }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Liste des entrepôts -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mx-4 md:mx-0">
      <div class="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Liste des Entrepôts</h3>
          <div class="flex flex-col sm:flex-row gap-2 sm:space-x-3">
            <select v-model="villeFilter" class="px-3 py-2 text-sm md:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white w-full sm:w-auto">
              <option value="">Toutes les villes</option>
              <option v-for="ville in villes" :key="ville" :value="ville">{{ ville }}</option>
            </select>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher un entrepôt..."
              class="px-3 py-2 text-sm md:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white w-full sm:w-auto"
            />
            <button @click="loadBoutiques" class="px-4 py-2 text-sm md:text-base bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center w-full sm:w-auto">
              <svg class="h-4 w-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              Actualiser
            </button>
          </div>
        </div>
      </div>

      <div class="p-4 md:p-6">
        <div v-if="boutiques.length === 0" class="text-center py-8">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
          </svg>
          <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">Aucun entrepôt trouvé</p>
        </div>

        <div v-else class="space-y-4">
          <div v-for="boutique in filteredBoutiques" :key="boutique.id" class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 md:p-6 hover:shadow-md transition-shadow">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div class="flex-1 min-w-0">
                <div class="flex items-center space-x-3 mb-3">
                  <div class="h-10 w-10 flex-shrink-0 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <span class="text-white font-semibold text-sm">{{ boutique.nom.charAt(0) }}</span>
                  </div>
                  <div class="min-w-0 flex-1">
                    <h4 class="text-base md:text-lg font-semibold text-gray-900 dark:text-white truncate">{{ boutique.nom }}</h4>
                    <p class="text-xs md:text-sm text-gray-500 dark:text-gray-400">{{ boutique.ville }}</p>
                  </div>
                </div>
                
                <div class="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 text-xs md:text-sm">
                  <div>
                    <span class="text-gray-500 dark:text-gray-400">ID:</span>
                    <span class="ml-1 font-medium text-gray-900 dark:text-white">{{ boutique.id }}</span>
                  </div>
                  <div>
                    <span class="text-gray-500 dark:text-gray-400">Responsable:</span>
                    <span class="ml-1 font-medium text-gray-900 dark:text-white break-words">{{ boutique.responsable || 'Non assigné' }}</span>
                  </div>
                  <div>
                    <span class="text-gray-500 dark:text-gray-400">Téléphone:</span>
                    <span class="ml-1 font-medium text-gray-900 dark:text-white break-words">{{ boutique.telephone || 'Non renseigné' }}</span>
                  </div>
                  <div>
                    <span class="text-gray-500 dark:text-gray-400">Entreprise:</span>
                    <span class="ml-1 font-medium text-gray-900 dark:text-white break-words">{{ boutique.entreprise?.nom || 'Non assignée' }}</span>
                  </div>
                </div>
              </div>
              
              <div class="flex space-x-2 sm:flex-col sm:space-x-0 sm:space-y-2 justify-end sm:justify-start">
                <button @click="viewBoutique(boutique)" class="p-2 text-sm md:text-base text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" title="Voir">
                  <svg class="h-4 w-4 md:h-5 md:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                </button>
                <button @click="editBoutique(boutique)" class="p-2 text-sm md:text-base text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" title="Modifier">
                  <svg class="h-4 w-4 md:h-5 md:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                </button>
                <button @click="deleteBoutique(boutique.id)" class="p-2 text-sm md:text-base text-red-400 hover:text-red-600 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Supprimer">
                  <svg class="h-4 w-4 md:h-5 md:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modales -->
    <CreateBoutiqueModal :isOpen="showCreateBoutique" @close="showCreateBoutique = false" @created="loadBoutiques" />
    <EditBoutiqueModal :isOpen="showEditBoutique" :boutique="selectedBoutique" @close="showEditBoutique = false" @updated="loadBoutiques" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useNotification } from '@/types/useNotification'
import { useAuth } from '@/composables/useAuth'
import { useErrorHandler } from '@/composables/useErrorHandler'
import CreateBoutiqueModal from '@/components/superadmin/CreateBoutiqueModal.vue'
import EditBoutiqueModal from '@/components/superadmin/EditBoutiqueModal.vue'
import { API_BASE_URL } from '@/constants'

definePageMeta({
  layout: "superadmin",
})

const { error, success } = useNotification()
const { getAuthHeaders } = useAuth()
const { getErrorMessage } = useErrorHandler()

// Types
interface Boutique {
  id: number
  nom: string
  ville: string
  adresse?: string
  telephone?: string
  email?: string
  responsable?: string
  entreprise?: { nom: string }
  produits?: any[]
}

// État des données
const boutiques = ref<Boutique[]>([])
const searchQuery = ref('')
const villeFilter = ref('')
const showCreateBoutique = ref(false)
const showEditBoutique = ref(false)
const selectedBoutique = ref<Boutique | null>(null)

// Statistiques calculées
const uniqueVilles = computed(() => {
  const villes = new Set(boutiques.value.map(b => b.ville))
  return villes.size
})

const avecResponsable = computed(() => {
  return boutiques.value.filter(b => b.responsable).length
})

const totalProduits = computed(() => {
  return boutiques.value.reduce((total, boutique) => total + (boutique.produits?.length || 0), 0)
})

const villes = computed(() => {
  const villesSet = new Set(boutiques.value.map(b => b.ville))
  return Array.from(villesSet).sort()
})

// Entrepôts filtrés
const filteredBoutiques = computed(() => {
  let filtered = boutiques.value

  if (villeFilter.value) {
    filtered = filtered.filter(boutique => boutique.ville === villeFilter.value)
  }

  if (searchQuery.value) {
    filtered = filtered.filter(boutique =>
      boutique.nom.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      boutique.ville.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      boutique.responsable?.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  return filtered
})

// Charger les entrepôts de l'entreprise
const loadBoutiques = async () => {
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
      const headers = getAuthHeaders()
      const data = await $fetch<Boutique[]>(`${API_BASE_URL}/api/boutiques/?entreprise=${entrepriseId}`, {
        headers
      })
      boutiques.value = data || []
    } catch (apiError: any) {
      const errorMessage = getErrorMessage(apiError)
      error(errorMessage)
      return
    }
  } catch (err: any) {
    const errorMessage = getErrorMessage(err)
    error(errorMessage)
  }
}

// Actions
const viewBoutique = (boutique: Boutique) => {
  selectedBoutique.value = boutique
  showEditBoutique.value = true
}

const editBoutique = (boutique: Boutique) => {
  selectedBoutique.value = boutique
  showEditBoutique.value = true
}

const deleteBoutique = async (id: number) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer cet entrepôt ? Cette action est irréversible.')) {
    try {
      try {
        const headers = getAuthHeaders()
        await $fetch(`${API_BASE_URL}/api/boutiques/${id}/`, {
          method: 'DELETE',
          headers
        })
      } catch (apiError: any) {
        const errorMessage = getErrorMessage(apiError)
        error(errorMessage)
        return
      }

      success('Entrepôt supprimé avec succès')
      loadBoutiques()
    } catch (err: any) {
      const errorMessage = getErrorMessage(err)
      error(errorMessage)
    }
  }
}

// Charger les données au montage
onMounted(() => {
  loadBoutiques()
})
</script>
