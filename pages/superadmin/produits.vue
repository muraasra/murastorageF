<template>
  <div>
    <!-- Header de la page -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Gestion des Produits</h1>
      <p class="mt-2 text-gray-600 dark:text-gray-400">Gérez les produits de votre entreprise</p>
    </div>

    <!-- Statistiques -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div class="flex items-center">
          <div class="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
            <svg class="h-6 w-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Produits</p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ produits.length }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div class="flex items-center">
          <div class="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <svg class="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Catégories</p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ uniqueCategories }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div class="flex items-center">
          <div class="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <svg class="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Stock Total</p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ totalStock }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div class="flex items-center">
          <div class="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <svg class="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Valeur Stock</p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ valeurStock }} FCFA</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Liste des produits -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Liste des Produits</h3>
          <div class="flex space-x-3">
            <!-- Composant Import/Export -->
            <ImportExportSimple @imported="loadProduits" @exported="loadProduits" />
            
            <select v-model="categoryFilter" class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white">
              <option value="">Toutes les catégories</option>
              <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
            </select>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher un produit..."
              class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white"
            />
            <button @click="loadProduits" class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
              <svg class="h-4 w-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              Actualiser
            </button>
          </div>
        </div>
      </div>

      <div class="p-6">
        <div v-if="produits.length === 0" class="text-center py-8">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
          </svg>
          <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">Aucun produit trouvé</p>
        </div>

        <div v-else class="space-y-4">
          <div v-for="produit in filteredProduits" :key="produit.id" class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="flex items-center space-x-3">
                  <div class="h-10 w-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                    <span class="text-white font-semibold text-sm">{{ produit.nom.charAt(0) }}</span>
                  </div>
                  <div>
                    <h4 class="text-lg font-semibold text-gray-900 dark:text-white">{{ produit.nom }}</h4>
                    <p class="text-sm text-gray-500 dark:text-gray-400">{{ produit.category }} • {{ produit.boutique?.nom || 'Entrepôt inconnu' }}</p>
                  </div>
                </div>
                
                <div class="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span class="text-gray-500 dark:text-gray-400">Prix de vente:</span>
                    <span class="ml-1 font-medium text-gray-900 dark:text-white">{{ produit.prix_vente || produit.prix }} XAF</span>
                  </div>
                  <div>
                    <span class="text-gray-500 dark:text-gray-400">Stock actuel:</span>
                    <span class="ml-1 font-medium text-gray-900 dark:text-white">{{ produit.quantite || 0 }}</span>
                  </div>
                  <div>
                    <span class="text-gray-500 dark:text-gray-400">Prix d'achat:</span>
                    <span class="ml-1 font-medium text-gray-900 dark:text-white">{{ produit.prix_achat || 0 }} XAF</span>
                  </div>
                  <div>
                    <span class="text-gray-500 dark:text-gray-400">Marge:</span>
                    <span class="ml-1 font-medium text-gray-900 dark:text-white">{{ margeProduit(produit) }}%</span>
                  </div>
                </div>
              </div>
              
              <div class="flex space-x-2">
                <button @click="viewProduit(produit)" class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" title="Voir les détails">
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                </button>
                <button @click="editProduit(produit)" class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" title="Modifier">
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                </button>
                <button @click="deleteProduit(produit.id)" class="p-2 text-red-400 hover:text-red-600" title="Supprimer">
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

    <!-- Bouton Ajouter Produit -->
    <div class="fixed bottom-6 right-6">
      <UButton 
        color="blue" 
        size="lg" 
        icon="i-heroicons-plus"
        @click="showCreateModal = true"
        class="shadow-lg"
      >
        Ajouter un produit
      </UButton>
    </div>

    <!-- Modales -->
    <ProduitFormSimple
      :is-open="showCreateModal"
      :mode="'create'"
      @close="showCreateModal = false"
      @saved="handleProductSaved"
    />

    <ProduitFormSimple
      :is-open="showEditModal"
      :mode="'edit'"
      :produit="selectedProduit"
      @close="showEditModal = false"
      @saved="handleProductSaved"
    />

    <!-- Modal de détails -->
    <UModal v-model="showDetailModal">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">Détails du produit</h3>
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-x-mark-20-solid"
              @click="showDetailModal = false"
            />
          </div>
        </template>

        <div v-if="selectedProduit" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Nom</label>
              <p class="text-gray-900 dark:text-white">{{ selectedProduit.nom }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500 dark:text-gray-400">SKU</label>
              <p class="text-gray-900 dark:text-white">{{ selectedProduit.sku || 'N/A' }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Prix d'achat</label>
              <p class="text-gray-900 dark:text-white">{{ selectedProduit.prix_achat }} XAF</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Prix de vente</label>
              <p class="text-gray-900 dark:text-white">{{ selectedProduit.prix_vente }} XAF</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Stock actuel</label>
              <p class="text-gray-900 dark:text-white">{{ selectedProduit.quantite }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Marge</label>
              <p class="text-gray-900 dark:text-white">{{ margeProduit(selectedProduit) }}%</p>
            </div>
          </div>
          
          <div v-if="selectedProduit.description">
            <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Description</label>
            <p class="text-gray-900 dark:text-white">{{ selectedProduit.description }}</p>
          </div>
        </div>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useNotification } from '@/types/useNotification'
import ProduitFormSimple from '@/components/produits/ProduitFormSimple.vue'
import ImportExportSimple from '@/components/produits/ImportExportSimple.vue'
import { API_BASE_URL } from '@/constants'

definePageMeta({
  layout: "superadmin",
})

const { error, success } = useNotification()

// État des données
const produits = ref([])
const searchQuery = ref('')
const categoryFilter = ref('')

// État des modales
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDetailModal = ref(false)
const selectedProduit = ref(null)

// Statistiques calculées
const uniqueCategories = computed(() => {
  const categories = new Set(produits.value.map(p => p.category))
  return categories.size
})

const totalStock = computed(() => {
  return produits.value.reduce((total, produit) => total + (produit.quantite || 0), 0)
})

const valeurStock = computed(() => {
  return produits.value.reduce((total, produit) => total + (produit.prix * produit.quantite || 0), 0)
})

const categories = computed(() => {
  const categoriesSet = new Set(produits.value.map(p => p.category))
  return Array.from(categoriesSet).sort()
})

// Produits filtrés
const filteredProduits = computed(() => {
  let filtered = produits.value

  if (categoryFilter.value) {
    filtered = filtered.filter(produit => produit.category === categoryFilter.value)
  }

  if (searchQuery.value) {
    filtered = filtered.filter(produit =>
      produit.nom.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      produit.description?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      produit.category.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  return filtered
})

// Fonctions utilitaires
const margeProduit = (produit: any) => {
  const prixAchat = produit.prix_achat || 0
  const prixVente = produit.prix_vente || produit.prix || 0
  
  if (!prixAchat || prixAchat === 0) return 0
  const marge = ((prixVente - prixAchat) / prixAchat) * 100
  return Math.round(marge * 100) / 100
}

// Charger les produits de l'entreprise
const loadProduits = async () => {
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
      const data = await $fetch(`${API_BASE_URL}/api/produits/?entreprise=${entrepriseId}`)
      produits.value = data || []
      console.log('Produits chargés:', produits.value.length)
    } catch (apiError: any) {
      console.error('Erreur API:', apiError)
      // En cas d'erreur API, utiliser des données de test
      produits.value = [
        {
          id: 1,
          nom: "iPhone 13",
          prix_achat: 450000,
          prix_vente: 550000,
          quantite: 5,
          category: "telephone",
          description: "Smartphone Apple",
          reference: "IPH13-001"
        },
        {
          id: 2,
          nom: "MacBook Pro",
          prix_achat: 1200000,
          prix_vente: 1500000,
          quantite: 3,
          category: "ordinateur",
          description: "Ordinateur portable Apple",
          reference: "MBP-001"
        }
      ]
      error('Mode démo activé - Connexion API échouée')
    }
  } catch (err) {
    console.error('Erreur chargement produits:', err)
    error('Une erreur est survenue')
  }
}

// Actions
const viewProduit = (produit: any) => {
  selectedProduit.value = produit
  showDetailModal.value = true
}

const editProduit = (produit: any) => {
  selectedProduit.value = produit
  showEditModal.value = true
}

const handleProductSaved = () => {
  loadProduits()
}

const deleteProduit = async (id: number) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.')) {
    try {
      const { error: apiError } = await useApi(`${API_BASE_URL}/api/produits/${id}/`, {
        method: 'DELETE',
        server: false
      })

      if (apiError.value) {
        error('Erreur lors de la suppression')
        return
      }

      success('Produit supprimé avec succès')
      loadProduits()
    } catch (err) {
      console.error('Erreur suppression:', err)
      error('Erreur lors de la suppression')
    }
  }
}

// Charger les données au montage
onMounted(() => {
  loadProduits()
})
</script>
