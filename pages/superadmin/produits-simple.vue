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
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ valeurStock }} XAF</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="mb-6 flex space-x-3">
      <UButton color="blue" @click="showCreateModal = true">
        <UIcon name="i-heroicons-plus" class="mr-2" />
        Ajouter un produit
      </UButton>
      
      <UButton color="green" @click="handleImport">
        <UIcon name="i-heroicons-arrow-up-tray" class="mr-2" />
        Importer
      </UButton>
      
      <UButton color="blue" @click="handleExport">
        <UIcon name="i-heroicons-arrow-down-tray" class="mr-2" />
        Exporter
      </UButton>
    </div>

    <!-- Liste des produits -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Liste des Produits</h3>
          <div class="flex space-x-3">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher un produit..."
              class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white"
            />
            <UButton @click="loadProduits" color="emerald">
              <UIcon name="i-heroicons-arrow-path" class="mr-2" />
              Actualiser
            </UButton>
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
                    <p class="text-sm text-gray-500 dark:text-gray-400">{{ produit.category }} • {{ produit.reference }}</p>
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
                <UButton variant="ghost" size="sm" @click="viewProduit(produit)" title="Voir les détails">
                  <UIcon name="i-heroicons-eye" />
                </UButton>
                <UButton variant="ghost" size="sm" @click="editProduit(produit)" title="Modifier">
                  <UIcon name="i-heroicons-pencil" />
                </UButton>
                <UButton variant="ghost" size="sm" color="red" @click="deleteProduit(produit.id)" title="Supprimer">
                  <UIcon name="i-heroicons-trash" />
                </UButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de création/modification -->
    <UModal v-model="showCreateModal">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">Créer un nouveau produit</h3>
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-x-mark-20-solid"
              @click="showCreateModal = false"
            />
          </div>
        </template>

        <UForm :state="formState" class="space-y-4" @submit="createProduit">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormGroup label="Nom du produit *" name="nom">
              <UInput v-model="formState.nom" placeholder="Nom du produit" />
            </UFormGroup>
            
            <UFormGroup label="Référence" name="reference">
              <UInput v-model="formState.reference" placeholder="Référence produit" />
            </UFormGroup>
          </div>
          
          <UFormGroup label="Description" name="description">
            <UTextarea v-model="formState.description" placeholder="Description du produit" />
          </UFormGroup>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <UFormGroup label="Prix d'achat *" name="prix_achat">
              <UInput type="number" v-model="formState.prix_achat" placeholder="0" />
            </UFormGroup>
            
            <UFormGroup label="Prix de vente *" name="prix_vente">
              <UInput type="number" v-model="formState.prix_vente" placeholder="0" />
            </UFormGroup>
            
            <UFormGroup label="Stock actuel *" name="quantite">
              <UInput type="number" v-model="formState.quantite" placeholder="0" />
            </UFormGroup>
          </div>
          
          <UFormGroup label="Catégorie" name="category">
            <USelect v-model="formState.category" :options="categoryOptions" placeholder="Sélectionner une catégorie" />
          </UFormGroup>

          <div class="flex justify-end space-x-3 pt-4 border-t">
            <UButton type="button" color="gray" variant="outline" @click="showCreateModal = false">
              Annuler
            </UButton>
            <UButton type="submit" color="blue" :loading="loading">
              Créer
            </UButton>
          </div>
        </UForm>
      </UCard>
    </UModal>

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
              <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Référence</label>
              <p class="text-gray-900 dark:text-white">{{ selectedProduit.reference || 'N/A' }}</p>
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

definePageMeta({
  layout: "superadmin",
})

const { error, success } = useNotification()

// État des données
const produits = ref([])
const searchQuery = ref('')
const loading = ref(false)

// État des modales
const showCreateModal = ref(false)
const showDetailModal = ref(false)
const selectedProduit = ref(null)

// État du formulaire
const formState = ref({
  nom: "",
  description: "",
  prix_achat: 0,
  prix_vente: 0,
  quantite: 0,
  reference: "",
  category: "",
})

// Options pour les catégories
const categoryOptions = [
  { value: 'telephone', label: 'Téléphone' },
  { value: 'ordinateur', label: 'Ordinateur' },
  { value: 'accessoire', label: 'Accessoire' },
  { value: 'autre', label: 'Autre' },
]

// Statistiques calculées
const uniqueCategories = computed(() => {
  const categories = new Set(produits.value.map(p => p.category))
  return categories.size
})

const totalStock = computed(() => {
  return produits.value.reduce((total, produit) => total + (produit.quantite || 0), 0)
})

const valeurStock = computed(() => {
  return produits.value.reduce((total, produit) => total + ((produit.prix_vente || produit.prix || 0) * (produit.quantite || 0)), 0)
})

// Produits filtrés
const filteredProduits = computed(() => {
  let filtered = produits.value

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

// Charger les produits
const loadProduits = async () => {
  try {
    // Données de démonstration
    produits.value = [
      {
        id: 1,
        nom: "iPhone 13",
        prix_achat: 450000,
        prix_vente: 550000,
        prix: 550000,
        quantite: 5,
        category: "telephone",
        description: "Smartphone Apple avec écran Super Retina XDR",
        reference: "IPH13-001"
      },
      {
        id: 2,
        nom: "MacBook Pro",
        prix_achat: 1200000,
        prix_vente: 1500000,
        prix: 1500000,
        quantite: 3,
        category: "ordinateur",
        description: "Ordinateur portable Apple avec puce M1",
        reference: "MBP-001"
      },
      {
        id: 3,
        nom: "AirPods Pro",
        prix_achat: 150000,
        prix_vente: 200000,
        prix: 200000,
        quantite: 10,
        category: "accessoire",
        description: "Écouteurs sans fil avec réduction de bruit active",
        reference: "AIRPODS-001"
      }
    ]
    console.log('Produits chargés:', produits.value.length)
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
  // Pour l'instant, on affiche juste les détails
  showDetailModal.value = true
}

const deleteProduit = async (id: number) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.')) {
    try {
      produits.value = produits.value.filter(p => p.id !== id)
      success('Produit supprimé avec succès')
    } catch (err) {
      console.error('Erreur suppression:', err)
      error('Erreur lors de la suppression')
    }
  }
}

const createProduit = async () => {
  if (!formState.value.nom) {
    error('Le nom du produit est requis')
    return
  }
  
  if (!formState.value.prix_achat || formState.value.prix_achat <= 0) {
    error('Le prix d\'achat doit être supérieur à 0')
    return
  }
  
  if (!formState.value.prix_vente || formState.value.prix_vente <= 0) {
    error('Le prix de vente doit être supérieur à 0')
    return
  }
  
  if (!formState.value.quantite || formState.value.quantite < 0) {
    error('La quantité doit être positive ou nulle')
    return
  }

  loading.value = true
  
  try {
    const nouveauProduit = {
      id: Date.now(), // ID temporaire
      ...formState.value,
      prix: formState.value.prix_vente, // Compatibilité
    }
    
    produits.value.push(nouveauProduit)
    success('Produit créé avec succès!')
    showCreateModal.value = false
    
    // Réinitialiser le formulaire
    formState.value = {
      nom: "",
      description: "",
      prix_achat: 0,
      prix_vente: 0,
      quantite: 0,
      reference: "",
      category: "",
    }
  } catch (err) {
    console.error('Erreur:', err)
    error('Une erreur est survenue')
  } finally {
    loading.value = false
  }
}

const handleImport = () => {
  success('Fonctionnalité d\'import en cours de développement')
}

const handleExport = () => {
  // Créer un CSV simple
  const csvContent = `Nom,Référence,Description,Prix d'achat,Prix de vente,Stock actuel,Catégorie
${produits.value.map(p => `${p.nom},${p.reference},${p.description},${p.prix_achat},${p.prix_vente},${p.quantite},${p.category}`).join('\n')}`
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `produits_export_${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
  
  success('Export réussi! Le fichier a été téléchargé.')
}

// Charger les données au montage
onMounted(() => {
  loadProduits()
})
</script>
