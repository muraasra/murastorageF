<template>
  <div>
    <!-- Header de la page -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Gestion des Factures</h1>
      <p class="mt-2 text-gray-600 dark:text-gray-400">Gérez les factures de votre entreprise</p>
    </div>

    <!-- Statistiques -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div class="flex items-center">
          <div class="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <svg class="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Factures</p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ factures.length }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div class="flex items-center">
          <div class="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <svg class="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Chiffre d'Affaires</p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ chiffreAffaires }} FCFA</p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div class="flex items-center">
          <div class="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <svg class="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Clients Uniques</p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ clientsUniques }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div class="flex items-center">
          <div class="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
            <svg class="h-6 w-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Moyenne Facture</p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ moyenneFacture }} FCFA</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Liste des factures -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Liste des Factures</h3>
          <div class="flex space-x-3">
            <select v-model="statusFilter" class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white">
              <option value="">Tous les statuts</option>
              <option value="payee">Payée</option>
              <option value="en_attente">En attente</option>
              <option value="annulee">Annulée</option>
            </select>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher une facture..."
              class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white"
            />
            <button @click="loadFactures" class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
              <svg class="h-4 w-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              Actualiser
            </button>
          </div>
        </div>
      </div>

      <div class="p-6">
        <div v-if="factures.length === 0" class="text-center py-8">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">Aucune facture trouvée</p>
        </div>

        <div v-else class="space-y-4">
          <div v-for="facture in filteredFactures" :key="facture.id" class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="flex items-center space-x-3">
                  <div class="h-10 w-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <span class="text-white font-semibold text-sm">F</span>
                  </div>
                  <div>
                    <h4 class="text-lg font-semibold text-gray-900 dark:text-white">{{ facture.nom_facture }}</h4>
                    <p class="text-sm text-gray-500 dark:text-gray-400">{{ facture.client?.nom || 'Client inconnu' }} • {{ formatDate(facture.date_facture) }}</p>
                  </div>
                </div>
                
                <div class="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span class="text-gray-500 dark:text-gray-400">Montant:</span>
                    <span class="ml-1 font-medium text-gray-900 dark:text-white">{{ facture.montant_total }} FCFA</span>
                  </div>
                  <div>
                    <span class="text-gray-500 dark:text-gray-400">Statut:</span>
                    <span class="ml-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="getStatusBadgeClass(facture.statut)">
                      {{ facture.statut }}
                    </span>
                  </div>
                  <div>
                    <span class="text-gray-500 dark:text-gray-400">Entrepôt:</span>
                    <span class="ml-1 font-medium text-gray-900 dark:text-white">{{ facture.boutique?.nom || 'Non assigné' }}</span>
                  </div>
                  <div>
                    <span class="text-gray-500 dark:text-gray-400">Articles:</span>
                    <span class="ml-1 font-medium text-gray-900 dark:text-white">{{ facture.items?.length || 0 }}</span>
                  </div>
                </div>
              </div>
              
              <div class="flex space-x-2">
                <button @click="viewFacture(facture)" class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                </button>
                <button @click="editFacture(facture)" class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                </button>
                <button @click="deleteFacture(facture.id)" class="p-2 text-red-400 hover:text-red-600">
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useNotification } from '@/types/useNotification'
import { API_BASE_URL } from '@/constants'

definePageMeta({
  layout: "superadmin",
})

const { error, success } = useNotification()

// État des données
const factures = ref([])
const searchQuery = ref('')
const statusFilter = ref('')

// Statistiques calculées
const chiffreAffaires = computed(() => {
  return factures.value.reduce((total, facture) => total + (facture.montant_total || 0), 0)
})

const clientsUniques = computed(() => {
  const clients = new Set(factures.value.map(f => f.client?.id).filter(Boolean))
  return clients.size
})

const moyenneFacture = computed(() => {
  if (factures.value.length === 0) return 0
  return Math.round(chiffreAffaires.value / factures.value.length)
})

// Factures filtrées
const filteredFactures = computed(() => {
  let filtered = factures.value

  if (statusFilter.value) {
    filtered = filtered.filter(facture => facture.statut === statusFilter.value)
  }

  if (searchQuery.value) {
    filtered = filtered.filter(facture =>
      facture.nom_facture?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      facture.client?.nom?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      facture.boutique?.nom?.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  return filtered
})

// Fonctions utilitaires
const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'payee':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    case 'en_attente':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
    case 'annulee':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
  }
}

const formatDate = (date: string) => {
  if (!date) return 'Date inconnue'
  return new Date(date).toLocaleDateString('fr-FR')
}

// Charger les factures de l'entreprise
const loadFactures = async () => {
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
      const data = await $fetch(`${API_BASE_URL}/api/factures/?entreprise=${entrepriseId}`)
      factures.value = data || []
    } catch (apiError: any) {
      error('Erreur lors du chargement des factures: ' + (apiError.data?.message || apiError.message))
      return
    }
  } catch (err) {
    console.error('Erreur chargement factures:', err)
    error('Une erreur est survenue')
  }
}

// Actions
const viewFacture = (facture: any) => {
  // TODO: Implémenter la vue détaillée d'une facture
  console.log('Voir facture:', facture)
}

const editFacture = (facture: any) => {
  // TODO: Implémenter l'édition de facture
  console.log('Éditer facture:', facture)
}

const deleteFacture = async (id: number) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer cette facture ? Cette action est irréversible.')) {
    try {
      const { error: apiError } = await useApi(`${API_BASE_URL}/api/factures/${id}/`, {
        method: 'DELETE',
        server: false
      })

      if (apiError.value) {
        error('Erreur lors de la suppression')
        return
      }

      success('Facture supprimée avec succès')
      loadFactures()
    } catch (err) {
      console.error('Erreur suppression:', err)
      error('Erreur lors de la suppression')
    }
  }
}

// Charger les données au montage
onMounted(() => {
  loadFactures()
})
</script>
