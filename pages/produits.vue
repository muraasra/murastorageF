<script setup lang="ts">
import { useSeo } from '@/composables/useSeo'

// Page privée - Noindex
useSeo({
  title: 'Produits - Mura Storage',
  description: 'Gestion des produits et inventaire',
  noindex: true
});
</script>

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
      <UButton color="blue" :disabled="!canCreateProduitUI" @click="handleCreateProduitClick">
        <UIcon name="i-heroicons-plus" class="mr-2" />
        Ajouter un produit
      </UButton>
      
      <UButton color="purple" @click="showCategoriesModal = true">
        <UIcon name="i-heroicons-tag" class="mr-2" />
        Gérer les catégories
      </UButton>
      
      <UButton color="green" @click="showFournisseursModal = true">
        <UIcon name="i-heroicons-building-office-2" class="mr-2" />
        Gérer les fournisseurs
      </UButton>
      
      <UButton color="orange" :disabled="!canImportCSVUI" @click="handleImport">
        <UIcon name="i-heroicons-arrow-up-tray" class="mr-2" />
        Importer
      </UButton>
      
      <UButton color="blue" @click="handleExport">
        <UIcon name="i-heroicons-arrow-down-tray" class="mr-2" />
        Exporter
      </UButton>
      
      <UButton color="purple" @click="openBulkCodeModal">
        <UIcon name="i-heroicons-qr-code" class="mr-2" />
        Générer QR Codes
      </UButton>
      
      <UButton color="gray" @click="testDataLoading" variant="outline">
        <UIcon name="i-heroicons-bug-ant" class="mr-2" />
        Test Debug
      </UButton>
    </div>

    <!-- Liste des produits -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Liste des Produits</h3>
            <UButton @click="loadProduits" color="emerald">
              <UIcon name="i-heroicons-arrow-path" class="mr-2" />
              Actualiser
            </UButton>
        </div>
        
        <!-- Barre de recherche et filtres -->
        <div class="space-y-3">
          <!-- Recherche principale et filtres essentiels -->
          <div class="flex flex-wrap gap-3 items-center">
            <div class="flex-1 min-w-64">
              <UInput
                v-model="searchQuery"
                placeholder="Rechercher par nom, référence..."
                icon="i-heroicons-magnifying-glass"
                size="lg"
              />
            </div>
            
            <!-- Filtres compacts -->
            <USelect
              v-model="filters.category"
              :options="categoryFilterOptions"
              placeholder="Catégorie"
              icon="i-heroicons-tag"
              size="sm"
              class="w-40"
            />
            
            <USelect
              v-model="filters.stockStatus"
              :options="stockStatusOptions"
              placeholder="Stock"
              icon="i-heroicons-cube"
              size="sm"
              class="w-32"
            />
            
            <USelect
              v-model="sortBy"
              :options="sortOptions"
              placeholder="Trier"
              icon="i-heroicons-bars-3"
              size="sm"
              class="w-36"
            />
            
            <UButton @click="clearFilters" variant="outline" color="gray" size="sm">
              <UIcon name="i-heroicons-x-mark" class="mr-1" />
              Effacer
            </UButton>
          </div>
          
          <!-- Filtres avancés (collapsibles) -->
          <div class="border-t border-gray-200 dark:border-gray-700 pt-3">
            <UButton 
              @click="showAdvancedFilters = !showAdvancedFilters" 
              variant="ghost" 
              size="sm"
              class="text-gray-600 dark:text-gray-400"
            >
              <UIcon :name="showAdvancedFilters ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'" class="mr-1" />
              Filtres avancés
            </UButton>
            
            <div v-if="showAdvancedFilters" class="mt-3 space-y-3">
              <!-- Filtres par nom -->
              <div class="flex gap-3">
                <USelect
                  v-model="filters.nameFilterType"
                  :options="nameFilterTypeOptions"
                  placeholder="Type de filtre nom"
                  size="sm"
                  class="w-40"
                />
                <UInput
                  v-model="filters.nameFilterValue"
                  placeholder="Valeur du filtre nom"
                  size="sm"
                  class="w-48"
                />
              </div>
              
              <!-- Filtres par référence et marque -->
              <div class="flex gap-3">
                <UInput
                  v-model="filters.reference"
                  placeholder="Référence..."
                  icon="i-heroicons-hashtag"
                  size="sm"
                  class="w-40"
                />
                <UInput
                  v-model="filters.marque"
                  placeholder="Marque..."
                  icon="i-heroicons-building-office"
                  size="sm"
                  class="w-40"
                />
              </div>
              
              <!-- Plages de prix et stock -->
              <div class="flex gap-3">
                <div class="flex gap-2">
                  <UInput
                    v-model="filters.priceMin"
                    placeholder="Prix min"
                    type="number"
                    size="sm"
                    class="w-24"
                  />
                  <UInput
                    v-model="filters.priceMax"
                    placeholder="Prix max"
                    type="number"
                    size="sm"
                    class="w-24"
                  />
                </div>
                <div class="flex gap-2">
                  <UInput
                    v-model="filters.stockMin"
                    placeholder="Stock min"
                    type="number"
                    size="sm"
                    class="w-24"
                  />
                  <UInput
                    v-model="filters.stockMax"
                    placeholder="Stock max"
                    type="number"
                    size="sm"
                    class="w-24"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <!-- Résultats de recherche -->
          <div class="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>{{ filteredProduits.length }} produit(s) trouvé(s)</span>
            <div class="flex items-center space-x-2">
              <span>Afficher:</span>
              <USelect
                v-model="itemsPerPage"
                :options="itemsPerPageOptions"
                size="sm"
                class="w-20"
              />
            </div>
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

        <!-- Tableau des produits -->
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <div class="flex items-center space-x-2">
                    <UIcon name="i-heroicons-cube" class="h-4 w-4" />
                    <span>Produit</span>
                  </div>
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <div class="flex items-center space-x-2">
                    <UIcon name="i-heroicons-tag" class="h-4 w-4" />
                    <span>Catégorie</span>
                  </div>
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <div class="flex items-center space-x-2">
                    <UIcon name="i-heroicons-currency-dollar" class="h-4 w-4" />
                    <span>Prix d'achat</span>
                  </div>
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <div class="flex items-center space-x-2">
                    <UIcon name="i-heroicons-currency-dollar" class="h-4 w-4" />
                    <span>Prix de vente</span>
                  </div>
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <div class="flex items-center space-x-2">
                    <UIcon name="i-heroicons-cube" class="h-4 w-4" />
                    <span>Stock</span>
                  </div>
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <div class="flex items-center space-x-2">
                    <UIcon name="i-heroicons-cog-6-tooth" class="h-4 w-4" />
                    <span>Actions</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="produit in paginatedProduits" :key="produit.id" class="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                <!-- Produit -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="h-10 w-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center mr-3">
                      <span class="text-white font-semibold text-sm">{{ produit.nom.charAt(0) }}</span>
                    </div>
                    <div>
                      <div class="text-sm font-medium text-gray-900 dark:text-white">{{ produit.nom }}</div>
                      <div class="text-sm text-gray-500 dark:text-gray-400">{{ produit.reference || 'Sans référence' }}</div>
                    </div>
                  </div>
                </td>
                
                <!-- Catégorie -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {{ getCategoryLabel(produit.categorie || produit.category || produit.categorie_nom) }}
                  </span>
                </td>
                
                <!-- Prix d'achat -->
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {{ formatNumber(produit.prix_achat || 0) }} XAF
                </td>
                
                <!-- Prix de vente -->
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {{ formatNumber(produit.prix_vente || produit.prix || 0) }} XAF
                </td>
                
                <!-- Stock -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center space-x-2">
                    <!-- Affichage du stock -->
                    <div class="flex items-center">
                      <span :class="getStockClass(produit.quantite || 0)" class="text-sm font-medium">
                        {{ produit.quantite || 0 }}
                      </span>
                      <span class="text-xs text-gray-500 dark:text-gray-400 ml-1">
                        {{ getUniteLabel(produit.unite_mesure) }}
                      </span>
                      <div v-if="produit.quantite <= (produit.stock_minimum || 0)" class="ml-2">
                        <UIcon name="i-heroicons-exclamation-triangle" class="h-4 w-4 text-red-500" />
                      </div>
                    </div>
                    
                    <!-- Bouton d'édition du stock -->
                    <UButton 
                      variant="ghost" 
                      size="xs" 
                      @click="editStock(produit)"
                      title="Modifier le stock"
                      class="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <UIcon name="i-heroicons-pencil-square" class="h-3 w-3" />
                    </UButton>
                  </div>
                  
                  <!-- Indicateur de seuil -->
                  <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Min: {{ produit.stock_minimum || 0 }}
                    <span v-if="produit.stock_low" class="text-red-500 ml-2">
                      ⚠️ Stock faible
                    </span>
                  </div>
                </td>
                
                <!-- Actions -->
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex space-x-2">
                    <UButton variant="ghost" size="sm" @click="viewProduit(produit)" title="Voir les détails">
                      <UIcon name="i-heroicons-eye" />
                    </UButton>
                    <UButton variant="ghost" size="sm" @click="editProduit(produit)" title="Modifier">
                      <UIcon name="i-heroicons-pencil" />
                    </UButton>
                    <UButton variant="ghost" size="sm" @click="generateCodes(produit)" title="Générer QR Code">
                      <UIcon name="i-heroicons-qr-code" />
                    </UButton>
                    <UButton variant="ghost" size="sm" color="red" @click="deleteProduit(produit.id)" title="Supprimer">
                      <UIcon name="i-heroicons-trash" />
                    </UButton>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Pagination -->
        <div v-if="totalPages > 1" class="mt-6 flex items-center justify-between">
          <div class="text-sm text-gray-500 dark:text-gray-400">
            Affichage de {{ (currentPage - 1) * itemsPerPage + 1 }} à {{ Math.min(currentPage * itemsPerPage, filteredProduits.length) }} 
            sur {{ filteredProduits.length }} produit(s)
          </div>
          
          <div class="flex space-x-2">
            <UButton
              @click="currentPage = Math.max(1, currentPage - 1)"
              :disabled="currentPage === 1"
              variant="outline"
              size="sm"
            >
              <UIcon name="i-heroicons-chevron-left" />
            </UButton>
            
            <div class="flex space-x-1">
              <UButton
                v-for="page in Math.min(5, totalPages)"
                :key="page"
                @click="currentPage = page"
                :color="currentPage === page ? 'blue' : 'gray'"
                variant="outline"
                size="sm"
              >
                {{ page }}
              </UButton>
            </div>
            
            <UButton
              @click="currentPage = Math.min(totalPages, currentPage + 1)"
              :disabled="currentPage === totalPages"
              variant="outline"
              size="sm"
            >
              <UIcon name="i-heroicons-chevron-right" />
            </UButton>
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
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormGroup label="Prix d'achat *" name="prix_achat">
              <UInput type="number" v-model="formState.prix_achat" placeholder="0" />
            </UFormGroup>
            
            <UFormGroup label="Prix de vente *" name="prix_vente">
              <UInput type="number" v-model="formState.prix_vente" placeholder="0" />
            </UFormGroup>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormGroup label="Stock minimal *" name="stock_minimum">
              <UInput type="number" v-model="formState.stock_minimum" placeholder="0" />
              <template #help>
                <span class="text-xs text-gray-500">Seuil d'alerte pour réapprovisionnement</span>
              </template>
            </UFormGroup>
            
            <UFormGroup label="Stock maximal" name="stock_maximum">
              <UInput type="number" v-model="formState.stock_maximum" placeholder="1000" />
              <template #help>
                <span class="text-xs text-gray-500">Stock maximum recommandé</span>
              </template>
            </UFormGroup>
          </div>
          
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UFormGroup label="Catégorie" name="categorie">
                <div class="flex gap-2">
                  <USelect v-model="formState.categorie" :options="categories.map(c => ({ label: c.nom, value: c.id }))" placeholder="Sélectionner une catégorie" class="flex-1" />
                  <UButton @click="showCategoriesModal = true" variant="outline" size="sm" icon="i-heroicons-plus" title="Ajouter une catégorie" />
                </div>
              </UFormGroup>
              
              <UFormGroup label="Fournisseur" name="fournisseur_principal">
                <div class="flex gap-2">
                  <USelect v-model="formState.fournisseur_principal" :options="fournisseurs.map(f => ({ label: f.nom, value: f.id }))" placeholder="Sélectionner un fournisseur" class="flex-1" />
                  <UButton @click="showFournisseursModal = true" variant="outline" size="sm" icon="i-heroicons-plus" title="Ajouter un fournisseur" />
                </div>
              </UFormGroup>
            </div>
            
            <UFormGroup label="Emplacement" name="emplacement">
              <UInput v-model="formState.emplacement" placeholder="Ex: Étagère A3, Palier 2..." />
              <template #help>
                <span class="text-xs text-gray-500">Emplacement physique du produit dans l'entrepôt</span>
              </template>
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

    <!-- Modal de modification -->
    <UModal v-model="showEditModal">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">Modifier le produit</h3>
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-x-mark-20-solid"
              @click="closeEditModal"
            />
          </div>
        </template>
        
        <UForm @submit="saveProduit">
          <div class="space-y-4">
            <UFormGroup label="Nom du produit *" name="nom">
              <UInput v-model="editFormState.nom" placeholder="Nom du produit" />
            </UFormGroup>
            
            <UFormGroup label="Référence" name="reference">
              <UInput v-model="editFormState.reference" placeholder="Référence du produit" />
            </UFormGroup>
            
            <UFormGroup label="Description" name="description">
              <UTextarea v-model="editFormState.description" placeholder="Description du produit" />
            </UFormGroup>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UFormGroup label="Prix d'achat *" name="prix_achat">
                <UInput type="number" v-model="editFormState.prix_achat" placeholder="0" />
              </UFormGroup>
              
              <UFormGroup label="Prix de vente *" name="prix_vente">
                <UInput type="number" v-model="editFormState.prix_vente" placeholder="0" />
              </UFormGroup>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UFormGroup label="Stock minimal *" name="stock_minimum">
                <UInput type="number" v-model="editFormState.stock_minimum" placeholder="0" />
                <template #help>
                  <span class="text-xs text-gray-500">Seuil d'alerte pour réapprovisionnement</span>
                </template>
              </UFormGroup>
              
              <UFormGroup label="Stock maximal" name="stock_maximum">
                <UInput type="number" v-model="editFormState.stock_maximum" placeholder="1000" />
                <template #help>
                  <span class="text-xs text-gray-500">Stock maximum recommandé</span>
                </template>
              </UFormGroup>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UFormGroup label="Catégorie" name="categorie">
                <div class="flex gap-2">
                  <USelect v-model="editFormState.categorie" :options="categories.map(c => ({ label: c.nom, value: c.id }))" placeholder="Sélectionner une catégorie" class="flex-1" />
                  <UButton @click="showCategoriesModal = true" variant="outline" size="sm" icon="i-heroicons-plus" title="Ajouter une catégorie" />
                </div>
              </UFormGroup>
              
              <UFormGroup label="Fournisseur principal" name="fournisseur_principal">
                <div class="flex gap-2">
                  <USelect v-model="editFormState.fournisseur_principal" :options="fournisseurs.map(f => ({ label: f.nom, value: f.id }))" placeholder="Sélectionner un fournisseur" class="flex-1" />
                  <UButton @click="showFournisseursModal = true" variant="outline" size="sm" icon="i-heroicons-plus" title="Ajouter un fournisseur" />
                </div>
              </UFormGroup>
            </div>
            
            <UFormGroup label="Emplacement" name="emplacement">
              <UInput v-model="editFormState.emplacement" placeholder="Ex: Étagère A3, Palier 2..." />
              <template #help>
                <span class="text-xs text-gray-500">Emplacement physique du produit dans l'entrepôt</span>
              </template>
            </UFormGroup>
            
            <!-- Boutons de validation -->
            <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <UButton color="gray" variant="ghost" @click="closeEditModal">
                Annuler
              </UButton>
              <UButton type="submit" :loading="loading">
                Sauvegarder
              </UButton>
            </div>
          </div>
        </UForm>
      </UCard>
    </UModal>

    <!-- Modal de modification du stock -->
    <UModal v-model="showStockModal">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">Modifier le stock</h3>
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-x-mark-20-solid"
              @click="showStockModal = false"
            />
          </div>
        </template>

        <div v-if="selectedProduit" class="space-y-6">
          <!-- Informations du produit -->
          <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h4 class="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
              <UIcon name="i-heroicons-cube" class="h-5 w-5 mr-2" />
              Produit
            </h4>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom</label>
                <p class="text-sm text-gray-900 dark:text-white">{{ selectedProduit.nom }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Référence</label>
                <p class="text-sm text-gray-900 dark:text-white">{{ selectedProduit.reference || 'N/A' }}</p>
              </div>
            </div>
          </div>

          <!-- Formulaire de modification du stock -->
          <UForm :state="stockForm" @submit="updateStock" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <UFormGroup label="Stock actuel" name="stockActuel">
                <UInput 
                  :model-value="selectedProduit.quantite || 0" 
                  disabled 
                  class="bg-gray-100 dark:bg-gray-700"
                />
              </UFormGroup>
              
                  <UFormGroup label="Quantité" name="nouveauStock" required>
                    <UInput
                      v-model="stockForm.nouveauStock"
                      type="number"
                      min="0"
                      placeholder="Entrez la quantité"
                    />
                  </UFormGroup>
            </div>

            <UFormGroup label="Type de mouvement" name="typeMouvement" required>
              <USelect
                v-model="stockForm.typeMouvement"
                :options="stockMovementOptions"
                placeholder="Sélectionnez le type de mouvement"
              />
            </UFormGroup>

            <UFormGroup label="Motif" name="motif">
              <UTextarea 
                v-model="stockForm.motif" 
                placeholder="Raison du changement de stock (optionnel)"
                rows="3"
              />
            </UFormGroup>

            <div class="flex justify-end space-x-3 pt-4">
              <UButton 
                color="gray" 
                variant="outline" 
                @click="showStockModal = false"
              >
                Annuler
              </UButton>
              <UButton 
                type="submit" 
                color="blue"
                :loading="stockUpdating"
              >
                Mettre à jour le stock
              </UButton>
            </div>
          </UForm>
        </div>
      </UCard>
    </UModal>

    <!-- Modal de confirmation -->
    <UModal v-model="showConfirmModal">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">Confirmation</h3>
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-x-mark-20-solid"
              @click="cancelAction"
            />
          </div>
        </template>

        <div class="space-y-4">
          <div class="flex items-center space-x-3">
            <UIcon name="i-heroicons-exclamation-triangle" class="h-8 w-8 text-yellow-500" />
            <p class="text-gray-700 dark:text-gray-300">{{ confirmMessage }}</p>
          </div>

          <div class="flex justify-end space-x-3 pt-4">
            <UButton
              color="gray"
              variant="outline"
              @click="cancelAction"
            >
              Annuler
            </UButton>
            <UButton
              color="blue"
              @click="confirmActionHandler"
            >
              Confirmer
            </UButton>
          </div>
        </div>
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

        <div v-if="selectedProduit" class="space-y-6">
          <!-- Informations générales -->
          <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h4 class="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
              <UIcon name="i-heroicons-cube" class="h-5 w-5 mr-2" />
              Informations générales
            </h4>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Nom</label>
                <p class="text-gray-900 dark:text-white font-medium">{{ selectedProduit.nom }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Référence</label>
                <p class="text-gray-900 dark:text-white">{{ selectedProduit.reference || 'N/A' }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Catégorie</label>
                <p class="text-gray-900 dark:text-white">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {{ getCategoryLabel(selectedProduit.category || selectedProduit.categorie_nom || 'autre') }}
                  </span>
                </p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Statut</label>
                <p class="text-gray-900 dark:text-white">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    {{ selectedProduit.actif ? 'Actif' : 'Inactif' }}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <!-- Informations financières -->
          <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h4 class="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
              <UIcon name="i-heroicons-currency-dollar" class="h-5 w-5 mr-2" />
              Informations financières
            </h4>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Prix d'achat</label>
                <p class="text-gray-900 dark:text-white font-medium">{{ formatNumber(selectedProduit.prix_achat) }} XAF</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Prix de vente</label>
                <p class="text-gray-900 dark:text-white font-medium">{{ formatNumber(selectedProduit.prix_vente) }} XAF</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Marge</label>
                <p class="text-gray-900 dark:text-white font-medium">
                  <span :class="getMargeClass(selectedProduit.marge || margeProduit(selectedProduit))">
                    {{ selectedProduit.marge || margeProduit(selectedProduit) }}%
                  </span>
                </p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Devise</label>
                <p class="text-gray-900 dark:text-white">{{ selectedProduit.devise || 'XAF' }}</p>
              </div>
            </div>
          </div>

          <!-- Informations stock et entrepôt -->
          <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h4 class="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
              <UIcon name="i-heroicons-home" class="h-5 w-5 mr-2" />
              Stock et entrepôt
            </h4>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Stock actuel</label>
                <p class="text-gray-900 dark:text-white font-medium">
                  <span :class="getStockClass(selectedProduit.quantite)">
                    {{ selectedProduit.quantite }} {{ getUniteLabel(selectedProduit.unite_mesure) }}
                  </span>
                </p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Entrepôt</label>
                <p class="text-gray-900 dark:text-white">{{ selectedProduit.entrepot_nom }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Seuil minimum</label>
                <p class="text-gray-900 dark:text-white">{{ selectedProduit.stock_minimum || 0 }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Seuil maximum</label>
                <p class="text-gray-900 dark:text-white">{{ selectedProduit.stock_maximum || 0 }}</p>
              </div>
            </div>
          </div>

          <!-- Informations entreprise -->
          <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h4 class="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
              <UIcon name="i-heroicons-building-office" class="h-5 w-5 mr-2" />
              Entreprise
            </h4>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Nom de l'entreprise</label>
                <p class="text-gray-900 dark:text-white font-medium">{{ selectedProduit.entreprise_nom }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Fournisseur</label>
                <p class="text-gray-900 dark:text-white">{{ selectedProduit.fournisseur_nom || 'N/A' }}</p>
              </div>
            </div>
          </div>

          <!-- Informations techniques -->
          <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h4 class="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
              <UIcon name="i-heroicons-cog-6-tooth" class="h-5 w-5 mr-2" />
              Informations techniques
            </h4>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Marque</label>
                <p class="text-gray-900 dark:text-white">{{ selectedProduit.marque || 'N/A' }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Modèle</label>
                <p class="text-gray-900 dark:text-white">{{ selectedProduit.modele || 'N/A' }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500 dark:text-gray-400">État du produit</label>
                <p class="text-gray-900 dark:text-white">{{ selectedProduit.etat_produit || 'neuf' }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Code-barre</label>
                <p class="text-gray-900 dark:text-white font-mono">{{ selectedProduit.code_barres || 'N/A' }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Unité de mesure</label>
                <p class="text-gray-900 dark:text-white">{{ getUniteLabel(selectedProduit.unite_mesure) }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500 dark:text-gray-400">SKU</label>
                <p class="text-gray-900 dark:text-white font-mono">{{ selectedProduit.sku || 'N/A' }}</p>
              </div>
            </div>
          </div>
          
          <!-- Description -->
          <div v-if="selectedProduit.description" class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h4 class="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
              <UIcon name="i-heroicons-document-text" class="h-5 w-5 mr-2" />
              Description
            </h4>
            <p class="text-gray-900 dark:text-white">{{ selectedProduit.description }}</p>
          </div>

          <!-- Dates -->
          <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h4 class="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
              <UIcon name="i-heroicons-calendar" class="h-5 w-5 mr-2" />
              Dates
            </h4>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Date de création</label>
                <p class="text-gray-900 dark:text-white">{{ selectedProduit.created_at || 'N/A' }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Dernière modification</label>
                <p class="text-gray-900 dark:text-white">{{ selectedProduit.updated_at || 'N/A' }}</p>
              </div>
            </div>
          </div>
        </div>
      </UCard>
    </UModal>

    <!-- Modal d'importation -->
    <UModal v-model="showImportModal">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">Importer des produits</h3>
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-x-mark-20-solid"
              @click="showImportModal = false"
            />
          </div>
        </template>

        <div class="space-y-6">
          <!-- Instructions -->
          <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 class="font-medium text-blue-900 dark:text-blue-100 mb-2">Instructions d'importation</h4>
            <div class="text-sm text-blue-800 dark:text-blue-200 space-y-2">
              <p><strong>Formats acceptés :</strong></p>
              <ul class="space-y-1 ml-4">
                <li>• <strong>CSV :</strong> .csv, .txt, .tsv (recommandé)</li>
                <li>• <strong>Excel simple :</strong> .xlsx, .xls (fichiers Excel basiques uniquement)</li>
                <li>• <strong>Colonnes requises :</strong> nom, prix_achat, prix_vente, quantite</li>
                <li>• <strong>Colonnes optionnelles :</strong> reference, description, categorie, code_barre, unite, stock_minimum, stock_maximum, fournisseur_nom, marque, modele, etat_produit, devise, sku</li>
                <li>• <strong>Encodage :</strong> UTF-8 recommandé</li>
                <li>• <strong>Séparateur CSV :</strong> Virgule (,), point-virgule (;) ou tabulation</li>
                <li>• <strong>Décimales :</strong> Point (.) pour les prix</li>
              </ul>
              <div class="mt-3 p-2 bg-yellow-100 dark:bg-yellow-800 rounded">
                <p class="font-medium text-yellow-800 dark:text-yellow-200">⚠️ Important pour Excel :</p>
                <p class="text-xs text-yellow-700 dark:text-yellow-300">Les fichiers Excel complexes (avec formules, graphiques, macros) ne sont pas supportés. Pour les fichiers Excel complexes, convertissez-les d'abord en CSV.</p>
              </div>
              <div class="mt-3 p-2 bg-blue-100 dark:bg-blue-800 rounded">
                <p class="font-medium">Exemple de format :</p>
                <code class="text-xs">nom,prix_achat,prix_vente,quantite,reference,categorie,code_barre,unite,fournisseur_nom,marque</code>
              </div>
            </div>
          </div>

          <!-- Zone de téléchargement -->
          <div class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
            <input
              ref="fileInput"
              type="file"
              accept=".csv,.txt,.tsv,.xlsx,.xls,text/csv,text/plain,application/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              @change="handleFileSelect"
              class="hidden"
            />
            <div v-if="!importFile" @click="openFileDialog" class="cursor-pointer">
              <UIcon name="i-heroicons-cloud-arrow-up" class="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p class="text-gray-600 dark:text-gray-400 mb-2">Cliquez pour sélectionner un fichier Excel ou CSV</p>
              <p class="text-sm text-gray-500 dark:text-gray-500">ou glissez-déposez le fichier ici</p>
            </div>
            <div v-else class="space-y-2">
              <UIcon name="i-heroicons-document-text" class="h-8 w-8 text-green-500 mx-auto" />
              <p class="font-medium text-gray-900 dark:text-white">{{ importFile.name }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ formatFileSize(importFile.size) }}</p>
              <UButton @click="clearImportFile" variant="outline" size="sm" color="red">
                Supprimer
              </UButton>
            </div>
          </div>

          <!-- Prévisualisation -->
          <div v-if="importPreview.length > 0" class="space-y-4">
            <div class="flex items-center justify-between">
              <h4 class="font-medium text-gray-900 dark:text-white">Prévisualisation ({{ importPreview.length }} produits)</h4>
              <div class="text-sm text-gray-500 dark:text-gray-400">
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  ✓ Prêt pour l'importation
                </span>
              </div>
            </div>
            
            <div class="max-h-80 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
              <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead class="bg-gray-50 dark:bg-gray-800 sticky top-0">
                  <tr>
                    <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nom</th>
                    <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Référence</th>
                    <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Prix Achat</th>
                    <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Prix Vente</th>
                    <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Stock</th>
                    <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Catégorie</th>
                    <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Unité</th>
                  </tr>
                </thead>
                <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  <tr v-for="(item, index) in importPreview.slice(0, 15)" :key="index" class="text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td class="px-3 py-2 text-gray-900 dark:text-white font-medium">{{ item.nom }}</td>
                    <td class="px-3 py-2 text-gray-900 dark:text-white">{{ item.reference || '-' }}</td>
                    <td class="px-3 py-2 text-gray-900 dark:text-white">{{ formatNumber(item.prix_achat) }} XAF</td>
                    <td class="px-3 py-2 text-gray-900 dark:text-white">{{ formatNumber(item.prix_vente) }} XAF</td>
                    <td class="px-3 py-2 text-gray-900 dark:text-white">
                      <span :class="getStockClass(item.quantite)">
                        {{ item.quantite }}
                      </span>
                    </td>
                    <td class="px-3 py-2 text-gray-900 dark:text-white">
                      <span class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {{ getCategoryLabel(item.category || 'autre') }}
                      </span>
                    </td>
                    <td class="px-3 py-2 text-gray-900 dark:text-white">{{ item.unite_mesure || 'unité' }}</td>
                  </tr>
                </tbody>
              </table>
              <div v-if="importPreview.length > 15" class="p-3 text-center text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800">
                ... et {{ importPreview.length - 15 }} autres produits
              </div>
            </div>
            
            <!-- Statistiques de l'importation -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div class="text-center">
                <div class="text-lg font-semibold text-gray-900 dark:text-white">{{ importPreview.length }}</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">Produits</div>
              </div>
              <div class="text-center">
                <div class="text-lg font-semibold text-gray-900 dark:text-white">{{ uniqueCategoriesInImport }}</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">Catégories</div>
              </div>
              <div class="text-center">
                <div class="text-lg font-semibold text-gray-900 dark:text-white">{{ totalStockInImport }}</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">Stock total</div>
              </div>
              <div class="text-center">
                <div class="text-lg font-semibold text-gray-900 dark:text-white">{{ formatNumber(totalValueInImport) }} XAF</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">Valeur totale</div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-end space-x-3 pt-4 border-t">
            <UButton type="button" color="gray" variant="outline" @click="showImportModal = false">
              Annuler
            </UButton>
            <UButton 
              type="button" 
              color="blue" 
              :loading="importing"
              :disabled="!importFile || importPreview.length === 0"
              @click="processImport"
            >
              Importer {{ importPreview.length }} produit(s)
            </UButton>
          </div>
        </div>
      </UCard>
    </UModal>

    <!-- Modal d'affichage des erreurs d'importation -->
    <UModal v-model="showErrorModal">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-red-600 dark:text-red-400">
              <UIcon name="i-heroicons-exclamation-triangle" class="mr-2" />
              Erreurs d'importation détectées
            </h3>
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-x-mark-20-solid"
              @click="showErrorModal = false"
            />
          </div>
        </template>

        <div class="space-y-4">
          <!-- Résumé des erreurs -->
          <div class="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <div class="flex items-center">
              <UIcon name="i-heroicons-exclamation-triangle" class="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
              <div>
                <p class="font-medium text-red-900 dark:text-red-100">
                  {{ importErrors.length }} erreur(s) détectée(s)
                </p>
                <p class="text-sm text-red-800 dark:text-red-200">
                  Corrigez ces erreurs avant de pouvoir importer les produits
                </p>
              </div>
            </div>
          </div>

          <!-- Liste des erreurs -->
          <div class="max-h-96 overflow-y-auto">
            <div class="space-y-2">
              <div 
                v-for="(error, index) in importErrors" 
                :key="index"
                class="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                    <span class="text-xs font-bold text-red-600 dark:text-red-400">{{ error.ligne }}</span>
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center space-x-2 mb-1">
                    <span class="text-sm font-medium text-gray-900 dark:text-white">
                      Ligne {{ error.ligne }}
                    </span>
                    <span class="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                      {{ error.champ }}
                    </span>
                  </div>
                  <p class="text-sm text-red-600 dark:text-red-400 mb-1">
                    {{ error.message }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-900 p-2 rounded">
                    Valeur: "{{ error.valeur }}"
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Instructions de correction -->
          <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 class="font-medium text-blue-900 dark:text-blue-100 mb-2">
              <UIcon name="i-heroicons-light-bulb" class="mr-2" />
              Comment corriger ces erreurs
            </h4>
            <div class="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <p>• <strong>Nom manquant :</strong> Ajoutez un nom pour chaque produit</p>
              <p>• <strong>Prix invalide :</strong> Utilisez des nombres positifs (ex: 100.50)</p>
              <p>• <strong>Prix de vente ≤ prix d'achat :</strong> Le prix de vente doit être supérieur</p>
              <p>• <strong>Quantité invalide :</strong> Utilisez des nombres entiers positifs ou zéro</p>
              <p>• <strong>En-têtes manquants :</strong> Vérifiez que les colonnes requises sont présentes</p>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end space-x-3 pt-4 border-t">
          <UButton type="button" color="gray" variant="outline" @click="showErrorModal = false">
            Fermer
          </UButton>
          <UButton 
            type="button" 
            color="blue" 
            @click="downloadErrorReport"
          >
            <UIcon name="i-heroicons-document-arrow-down" class="mr-2" />
            Télécharger le rapport d'erreurs
          </UButton>
        </div>
      </UCard>
    </UModal>

    <!-- Modal de génération de codes-barres/QR -->
    <UModal v-model="showCodeModal">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">Générer des QR codes</h3>
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-x-mark-20-solid"
              @click="showCodeModal = false"
            />
          </div>
        </template>

        <div class="space-y-6">
          <!-- Informations du produit -->
          <div v-if="selectedCodeProduit" class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h4 class="font-medium text-gray-900 dark:text-white mb-2">{{ selectedCodeProduit.nom }}</h4>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-gray-500 dark:text-gray-400">Référence:</span>
                <span class="ml-1 font-medium">{{ selectedCodeProduit.reference || 'N/A' }}</span>
              </div>
              <div>
                <span class="text-gray-500 dark:text-gray-400">Code-barre:</span>
                <span class="ml-1 font-medium">{{ selectedCodeProduit.code_barres || 'Non défini' }}</span>
              </div>
            </div>
          </div>

          <!-- Options de génération -->
          <div class="space-y-4">
            <h4 class="font-medium text-gray-900 dark:text-white">Options de génération</h4>
            
            <!-- Type de code -->
            <div class="grid grid-cols-2 gap-4">
              <UFormGroup label="Type de code" name="codeType">
                <USelect v-model="codeOptions.type" :options="codeTypeOptions" />
              </UFormGroup>
              
              <UFormGroup label="Format" name="format">
                <USelect v-model="codeOptions.format" :options="formatOptions" />
              </UFormGroup>
            </div>

            <!-- Contenu du code -->
            <UFormGroup label="Contenu du code" name="content">
              <USelect v-model="codeOptions.content" :options="contentOptions" />
            </UFormGroup>

            <!-- Taille -->
            <div class="grid grid-cols-2 gap-4">
              <UFormGroup label="Largeur (px)" name="width">
                <UInput type="number" v-model="codeOptions.width" placeholder="300" />
              </UFormGroup>
              
              <UFormGroup label="Hauteur (px)" name="height">
                <UInput type="number" v-model="codeOptions.height" placeholder="100" />
              </UFormGroup>
            </div>

            <!-- Options avancées -->
            <div class="space-y-3">
              <UCheckbox v-model="codeOptions.includeText" label="Inclure le texte sous le code" />
              <UCheckbox v-model="codeOptions.includeProductName" label="Inclure le nom du produit" />
              <UCheckbox v-model="codeOptions.includePrice" label="Inclure le prix" />
            </div>
          </div>

          <!-- Prévisualisation -->
          <div v-if="generatedCode" class="space-y-4">
            <h4 class="font-medium text-gray-900 dark:text-white">Prévisualisation</h4>
            <div class="flex justify-center p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              <img :src="generatedCode" :alt="`Code ${codeOptions.type}`" class="max-w-full h-auto" />
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-end space-x-3 pt-4 border-t">
            <UButton type="button" color="gray" variant="outline" @click="showCodeModal = false">
              Annuler
            </UButton>
            <UButton 
              type="button" 
              color="blue" 
              :loading="generatingCode"
              @click="generateCode"
            >
              Générer et télécharger
            </UButton>
          </div>
        </div>
      </UCard>
    </UModal>

    <!-- Modal de génération en masse -->
    <UModal v-model="showBulkCodeModal">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">Générer des QR codes en masse</h3>
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-x-mark-20-solid"
              @click="showBulkCodeModal = false"
            />
          </div>
        </template>

        <div class="space-y-6">
          <!-- Sélection des produits -->
          <div class="space-y-4">
            <h4 class="font-medium text-gray-900 dark:text-white">Sélectionner les produits</h4>
            
            <div class="space-y-2">
              <UCheckbox 
                v-model="selectAllProducts" 
                @change="toggleAllProducts"
                label="Sélectionner tous les produits"
              />
              
              <div class="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div v-for="produit in produits" :key="produit.id" class="flex items-center space-x-3 py-2">
                  <UCheckbox 
                    v-model="selectedProductsForBulk" 
                    :value="produit.id"
                  />
                  <div class="flex-1">
                    <span class="font-medium">{{ produit.nom }}</span>
                    <span class="text-sm text-gray-500 dark:text-gray-400 ml-2">
                      ({{ produit.reference || 'Sans référence' }})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Options de génération -->
          <div class="space-y-4">
            <h4 class="font-medium text-gray-900 dark:text-white">Options de génération</h4>
            
            <div class="grid grid-cols-2 gap-4">
              <UFormGroup label="Type de code" name="bulkCodeType">
                <USelect v-model="bulkCodeOptions.type" :options="codeTypeOptions" />
              </UFormGroup>
              
              <UFormGroup label="Format" name="bulkFormat">
                <USelect v-model="bulkCodeOptions.format" :options="formatOptions" />
              </UFormGroup>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <UFormGroup label="Largeur (px)" name="bulkWidth">
                <UInput type="number" v-model="bulkCodeOptions.width" placeholder="300" />
              </UFormGroup>
              
              <UFormGroup label="Hauteur (px)" name="bulkHeight">
                <UInput type="number" v-model="bulkCodeOptions.height" placeholder="100" />
              </UFormGroup>
            </div>

            <div class="space-y-3">
              <UCheckbox v-model="bulkCodeOptions.includeText" label="Inclure le texte sous le code" />
              <UCheckbox v-model="bulkCodeOptions.includeProductName" label="Inclure le nom du produit" />
              <UCheckbox v-model="bulkCodeOptions.generateZip" label="Créer un fichier ZIP" />
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-end space-x-3 pt-4 border-t">
            <UButton type="button" color="gray" variant="outline" @click="showBulkCodeModal = false">
              Annuler
            </UButton>
            <UButton 
              type="button" 
              color="purple" 
              :loading="generatingBulkCodes"
              :disabled="selectedProductsForBulk.length === 0"
              @click="generateBulkCodesAction"
            >
              Générer {{ selectedProductsForBulk.length }} code(s)
            </UButton>
          </div>
        </div>
      </UCard>
    </UModal>

    <!-- Modal d'export -->
    <UModal v-model="showExportModal">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">Exporter les produits</h3>
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-x-mark-20-solid"
              @click="showExportModal = false"
            />
          </div>
        </template>

        <div class="space-y-6">
          <!-- Informations sur l'export -->
          <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h4 class="font-medium text-gray-900 dark:text-white mb-2">Informations sur l'export</h4>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              <p>• <strong>{{ produits.length }}</strong> produit(s) seront exportés</p>
              <p>• Toutes les colonnes disponibles seront incluses</p>
              <p>• Le fichier sera téléchargé automatiquement</p>
            </div>
          </div>

          <!-- Options d'export -->
          <div class="space-y-4">
            <h4 class="font-medium text-gray-900 dark:text-white">Choisir le format d'export</h4>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer" @click="exportToCSV">
                <div class="flex items-center space-x-3">
                  <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <UIcon name="i-heroicons-document-text" class="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h5 class="font-medium text-gray-900 dark:text-white">Export CSV</h5>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Fichier texte séparé par virgules</p>
                  </div>
                </div>
              </div>

              <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer" @click="exportToExcel">
                <div class="flex items-center space-x-3">
                  <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <UIcon name="i-heroicons-table-cells" class="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h5 class="font-medium text-gray-900 dark:text-white">Export Excel</h5>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Fichier Excel (.xlsx)</p>
                  </div>
                </div>
              </div>

              <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer" @click="testExcelGeneration">
                <div class="flex items-center space-x-3">
                  <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <UIcon name="i-heroicons-beaker" class="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h5 class="font-medium text-gray-900 dark:text-white">Test Excel</h5>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Tester avec données d'exemple</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Colonnes incluses -->
          <div class="space-y-4">
            <h4 class="font-medium text-gray-900 dark:text-white">Colonnes incluses dans l'export</h4>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
              <div class="flex items-center space-x-2">
                <UIcon name="i-heroicons-check" class="h-4 w-4 text-green-500" />
                <span>Nom</span>
              </div>
              <div class="flex items-center space-x-2">
                <UIcon name="i-heroicons-check" class="h-4 w-4 text-green-500" />
                <span>Référence</span>
              </div>
              <div class="flex items-center space-x-2">
                <UIcon name="i-heroicons-check" class="h-4 w-4 text-green-500" />
                <span>Description</span>
              </div>
              <div class="flex items-center space-x-2">
                <UIcon name="i-heroicons-check" class="h-4 w-4 text-green-500" />
                <span>Prix d'achat</span>
              </div>
              <div class="flex items-center space-x-2">
                <UIcon name="i-heroicons-check" class="h-4 w-4 text-green-500" />
                <span>Prix de vente</span>
              </div>
              <div class="flex items-center space-x-2">
                <UIcon name="i-heroicons-check" class="h-4 w-4 text-green-500" />
                <span>Stock</span>
              </div>
              <div class="flex items-center space-x-2">
                <UIcon name="i-heroicons-check" class="h-4 w-4 text-green-500" />
                <span>Catégorie</span>
              </div>
              <div class="flex items-center space-x-2">
                <UIcon name="i-heroicons-check" class="h-4 w-4 text-green-500" />
                <span>Code-barre</span>
              </div>
              <div class="flex items-center space-x-2">
                <UIcon name="i-heroicons-check" class="h-4 w-4 text-green-500" />
                <span>Fournisseur</span>
              </div>
              <div class="flex items-center space-x-2">
                <UIcon name="i-heroicons-check" class="h-4 w-4 text-green-500" />
                <span>Marque</span>
              </div>
              <div class="flex items-center space-x-2">
                <UIcon name="i-heroicons-check" class="h-4 w-4 text-green-500" />
                <span>Modèle</span>
              </div>
              <div class="flex items-center space-x-2">
                <UIcon name="i-heroicons-check" class="h-4 w-4 text-green-500" />
                <span>Et plus...</span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-end space-x-3 pt-4 border-t">
            <UButton type="button" color="gray" variant="outline" @click="showExportModal = false">
              Annuler
            </UButton>
          </div>
        </div>
      </UCard>
    </UModal>

    <!-- Modal de gestion des catégories -->
    <UModal v-model="showCategoriesModal">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Gérer les catégories
            </h3>
            <UButton @click="showCategoriesModal = false" variant="ghost" icon="i-heroicons-x-mark" />
          </div>
        </template>

        <div class="space-y-6">
          <!-- Liste des catégories existantes -->
          <div>
            <h4 class="text-md font-medium text-gray-900 dark:text-white mb-3">
              Catégories existantes ({{ categories.length }})
            </h4>
            <div class="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
              <div v-for="categorie in categories" :key="categorie.id" 
                   class="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                <div class="flex items-center space-x-2">
                  <div class="w-4 h-4 rounded" :style="{ backgroundColor: categorie.couleur }"></div>
                  <UIcon v-if="categorie.icone" :name="categorie.icone" class="h-4 w-4" />
                  <span class="text-sm text-gray-900 dark:text-white">{{ categorie.nom }}</span>
                </div>
                <div class="flex gap-2">
                  <UButton @click="editCategorie(categorie)" variant="ghost" size="xs" icon="i-heroicons-pencil" />
                  <UButton @click="deleteCategorie(categorie.id)" variant="ghost" size="xs" color="red" icon="i-heroicons-trash" />
                </div>
              </div>
            </div>
          </div>

          <!-- Formulaire de création -->
          <div class="border-t pt-4">
            <h4 class="text-md font-medium text-gray-900 dark:text-white mb-3">
              Créer une nouvelle catégorie
            </h4>
            <div class="space-y-4">
              <UFormGroup label="Nom de la catégorie" required>
                <UInput v-model="newCategorie.nom" placeholder="Ex: Électronique" />
              </UFormGroup>
              
              <UFormGroup label="Description">
                <UTextarea v-model="newCategorie.description" placeholder="Description de la catégorie" />
              </UFormGroup>
              
              <UFormGroup label="Icône">
                <div class="space-y-2">
                  <div class="grid grid-cols-5 gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded max-h-32 overflow-y-auto">
                    <button
                      v-for="icon in availableIcons"
                      :key="icon.name"
                      @click="newCategorie.icone = icon.name"
                      :class="[
                        'p-2 rounded border-2 transition-all',
                        newCategorie.icone === icon.name 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900' 
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      ]"
                      :title="icon.label"
                    >
                      <UIcon :name="icon.name" class="h-5 w-5" />
                    </button>
                  </div>
                  <UInput v-model="newCategorie.icone" placeholder="Ou saisir manuellement" />
                </div>
              </UFormGroup>
              
              <UFormGroup label="Couleur">
                <div class="flex items-center space-x-3">
                  <input type="color" v-model="newCategorie.couleur" class="w-12 h-8 rounded border" />
                  <UInput v-model="newCategorie.couleur" placeholder="#3B82F6" />
                </div>
              </UFormGroup>
            </div>
          </div>
        </div>

        <template #footer>
          <div class="flex justify-end space-x-3">
            <UButton @click="showCategoriesModal = false" variant="outline">
              Annuler
            </UButton>
            <UButton @click="createCategorie" color="primary" :disabled="!newCategorie.nom">
              Créer la catégorie
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>

    <!-- Modal de gestion des fournisseurs -->
    <UModal v-model="showFournisseursModal">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Gérer les fournisseurs
            </h3>
            <UButton @click="showFournisseursModal = false" variant="ghost" icon="i-heroicons-x-mark" />
          </div>
        </template>

        <div class="space-y-6">
          <!-- Liste des fournisseurs existants -->
          <div>
            <h4 class="text-md font-medium text-gray-900 dark:text-white mb-3">
              Fournisseurs existants ({{ fournisseurs.length }})
            </h4>
            <div class="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
              <div v-for="fournisseur in fournisseurs" :key="fournisseur.id" 
                   class="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                <div class="flex items-center space-x-2">
                  <UIcon name="i-heroicons-building-office-2" class="h-4 w-4 text-blue-500" />
                  <span class="text-sm text-gray-900 dark:text-white">{{ fournisseur.nom }}</span>
                  <span class="text-xs text-gray-500">{{ fournisseur.code_fournisseur }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-xs text-gray-500">{{ fournisseur.email }}</span>
                  <UButton @click="editFournisseur(fournisseur)" variant="ghost" size="xs" icon="i-heroicons-pencil" />
                  <UButton @click="deleteFournisseur(fournisseur.id)" variant="ghost" size="xs" color="red" icon="i-heroicons-trash" />
                </div>
              </div>
            </div>
          </div>

          <!-- Formulaire de création -->
          <div class="border-t pt-4">
            <h4 class="text-md font-medium text-gray-900 dark:text-white mb-3">
              Créer un nouveau fournisseur
            </h4>
            <div class="grid grid-cols-2 gap-4">
              <UFormGroup label="Nom du fournisseur" required>
                <UInput v-model="newFournisseur.nom" placeholder="Ex: Samsung Electronics" />
              </UFormGroup>
              
              <UFormGroup label="Code fournisseur">
                <UInput v-model="newFournisseur.code_fournisseur" placeholder="Ex: SAM001" />
              </UFormGroup>
              
              <UFormGroup label="Email">
                <UInput v-model="newFournisseur.email" type="email" placeholder="contact@fournisseur.com" />
              </UFormGroup>
              
              <UFormGroup label="Téléphone">
                <UInput v-model="newFournisseur.telephone" placeholder="+237 6XX XX XX XX" />
              </UFormGroup>
              
              <UFormGroup label="Adresse" class="col-span-2">
                <UInput v-model="newFournisseur.adresse" placeholder="Adresse complète" />
              </UFormGroup>
              
              <UFormGroup label="Ville">
                <UInput v-model="newFournisseur.ville" placeholder="Ex: Douala" />
              </UFormGroup>
              
              <UFormGroup label="Pays">
                <UInput v-model="newFournisseur.pays" placeholder="Ex: Cameroun" />
              </UFormGroup>
              
              <UFormGroup label="Site web">
                <UInput v-model="newFournisseur.site_web" placeholder="https://www.fournisseur.com" />
              </UFormGroup>
              
              <UFormGroup label="Contact principal">
                <UInput v-model="newFournisseur.contact_principal" placeholder="Nom du contact" />
              </UFormGroup>
              
              <UFormGroup label="Notes" class="col-span-2">
                <UTextarea v-model="newFournisseur.notes" placeholder="Notes supplémentaires" />
              </UFormGroup>
            </div>
          </div>
        </div>

        <template #footer>
          <div class="flex justify-end space-x-3">
            <UButton @click="showFournisseursModal = false" variant="outline">
              Annuler
            </UButton>
            <UButton @click="createFournisseur" color="primary" :disabled="!newFournisseur.nom">
              Créer le fournisseur
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>

    <!-- Modal d'édition de catégorie -->
    <UModal v-model="showEditCategorieModal">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Modifier la catégorie
            </h3>
            <UButton @click="showEditCategorieModal = false" variant="ghost" icon="i-heroicons-x-mark" />
          </div>
        </template>

        <div class="space-y-4" v-if="editingCategorie">
          <UFormGroup label="Nom de la catégorie" required>
            <UInput v-model="editingCategorie.nom" placeholder="Ex: Électronique" />
          </UFormGroup>
          
          <UFormGroup label="Description">
            <UTextarea v-model="editingCategorie.description" placeholder="Description de la catégorie" />
          </UFormGroup>
          
          <UFormGroup label="Icône">
            <div class="space-y-2">
              <div class="grid grid-cols-5 gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded max-h-32 overflow-y-auto">
                <button
                  v-for="icon in availableIcons"
                  :key="icon.name"
                  @click="editingCategorie.icone = icon.name"
                  :class="[
                    'p-2 rounded border-2 transition-all',
                    editingCategorie.icone === icon.name 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  ]"
                  :title="icon.label"
                >
                  <UIcon :name="icon.name" class="h-5 w-5" />
                </button>
              </div>
              <UInput v-model="editingCategorie.icone" placeholder="Ou saisir manuellement" />
            </div>
          </UFormGroup>
          
          <UFormGroup label="Couleur">
            <div class="flex items-center space-x-3">
              <input type="color" v-model="editingCategorie.couleur" class="w-12 h-8 rounded border" />
              <UInput v-model="editingCategorie.couleur" placeholder="#3B82F6" />
            </div>
          </UFormGroup>
        </div>

        <template #footer>
          <div class="flex justify-end space-x-3">
            <UButton @click="showEditCategorieModal = false" variant="outline">
              Annuler
            </UButton>
            <UButton @click="updateCategorie" color="primary" :disabled="!editingCategorie?.nom">
              Enregistrer
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>

    <!-- Modal d'édition de fournisseur -->
    <UModal v-model="showEditFournisseurModal">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Modifier le fournisseur
            </h3>
            <UButton @click="showEditFournisseurModal = false" variant="ghost" icon="i-heroicons-x-mark" />
          </div>
        </template>

        <div class="space-y-4" v-if="editingFournisseur">
          <div class="grid grid-cols-2 gap-4">
            <UFormGroup label="Nom du fournisseur" required>
              <UInput v-model="editingFournisseur.nom" placeholder="Ex: Samsung Electronics" />
            </UFormGroup>
            
            <UFormGroup label="Code fournisseur">
              <UInput v-model="editingFournisseur.code_fournisseur" placeholder="Ex: SAM001" />
            </UFormGroup>
            
            <UFormGroup label="Email">
              <UInput v-model="editingFournisseur.email" type="email" placeholder="contact@fournisseur.com" />
            </UFormGroup>
            
            <UFormGroup label="Téléphone">
              <UInput v-model="editingFournisseur.telephone" placeholder="+237 6XX XX XX XX" />
            </UFormGroup>
            
            <UFormGroup label="Adresse" class="col-span-2">
              <UInput v-model="editingFournisseur.adresse" placeholder="Adresse complète" />
            </UFormGroup>
            
            <UFormGroup label="Ville">
              <UInput v-model="editingFournisseur.ville" placeholder="Ex: Douala" />
            </UFormGroup>
            
            <UFormGroup label="Pays">
              <UInput v-model="editingFournisseur.pays" placeholder="Ex: Cameroun" />
            </UFormGroup>
            
            <UFormGroup label="Site web">
              <UInput v-model="editingFournisseur.site_web" placeholder="https://www.fournisseur.com" />
            </UFormGroup>
            
            <UFormGroup label="Contact principal">
              <UInput v-model="editingFournisseur.contact_principal" placeholder="Nom du contact" />
            </UFormGroup>
            
            <UFormGroup label="Notes" class="col-span-2">
              <UTextarea v-model="editingFournisseur.notes" placeholder="Notes supplémentaires" />
            </UFormGroup>
          </div>
        </div>

        <template #footer>
          <div class="flex justify-end space-x-3">
            <UButton @click="showEditFournisseurModal = false" variant="outline">
              Annuler
            </UButton>
            <UButton @click="updateFournisseur" color="primary" :disabled="!editingFournisseur?.nom">
              Enregistrer
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSubscription } from '@/composables/useSubscription'

const { canCreateResource } = useSubscription()
const canCreateProduitUI = computed(() => canCreateResource('produits'))
const canImportCSVUI = computed(() => canCreateResource('produits'))

function handleCreateProduitClick() {
  if (!canCreateProduitUI.value) {
    alert('Limite de produits atteinte. Passez à un plan supérieur pour créer plus de produits.')
    return
  }
  // ouvrir le modal existant
  // @ts-ignore
  showCreateModal.value = true
}
import { ref, computed, onMounted } from 'vue'
import { useNotification } from '@/types/useNotification'
import { useBarcodeGenerator } from '@/composables/useBarcodeGenerator'
import { useImportExport } from '@/composables/useImportExport'
import { API_BASE_URL } from '@/constants'

// Utiliser le composable pour la génération de codes
const { generateAndDownloadProductCodes, generateBulkCodes: generateBulkCodesUtil } = useBarcodeGenerator()

// Interface pour les produits (adaptée au modèle backend)
// Interface temporaire pour l'import (permet les chaînes)
interface ProduitImport {
  id?: number
  sku?: string
  nom: string
  description?: string
  code_barres?: string
  prix_achat: number | string
  prix_vente: number | string
  prix_gros?: number
  prix?: number | string
  quantite: number | string
  reference?: string
  category?: string
  // Relations
  categorie?: number
  categorie_nom?: string
  entreprise?: number
  entreprise_nom?: string
  fournisseur_principal?: number
  fournisseur_nom?: string
  // Informations commerciales
  devise: string
  unite_mesure: string
  stock_minimum: number
  stock_maximum: number
  etat_produit: string
  actif: boolean
  // Métadonnées
  created_at?: string
  updated_at?: string
  // Champs supplémentaires
  marque?: string
  modele?: string
  couleur?: string
  poids?: string
  dimensions?: string
  garantie?: string
  localisation?: string
  tva?: string
  statut?: string
}

interface Produit {
  id: number
  sku?: string
  nom: string
  description?: string
  code_barres?: string
  prix_achat: number
  prix_vente: number
  prix_gros?: number
  prix?: number // compatibilité
  quantite: number
  reference?: string
  category?: string // compatibilité
  // Relations
  categorie?: number
  categorie_nom?: string
  entreprise?: number
  entreprise_nom?: string
  fournisseur_principal?: number
  fournisseur_nom?: string
  // Informations commerciales
  devise: string
  unite_mesure: string
  stock_minimum: number
  stock_maximum: number
  etat_produit: string
  actif: boolean
  // Métadonnées
  created_at?: string
  updated_at?: string
  // Champs de compatibilité et spécifiques
  marque?: string
  modele?: string
  specifications?: any
  image?: string
  // Stocks par entrepôt
  stocks?: any[]
  // Informations d'entrepôt pour l'affichage
  entrepot_nom?: string
  // Calculs automatiques
  marge?: number
  marge_absolue?: number
  stock_low?: boolean
  stock_high?: boolean
  // Nouveaux champs
  emplacement?: string
  details?: any
}

definePageMeta({
  layout: "default",
})

const { error, success, warning } = useNotification()

// État des données
const produits = ref<Produit[]>([])
const entreprises = ref<any[]>([])
const entrepots = ref<any[]>([])
const categories = ref<any[]>([])
const fournisseurs = ref<any[]>([])
const stocks = ref<any[]>([])
const searchQuery = ref('')
const loading = ref(false)

// Interface pour les erreurs d'importation
interface ImportError {
  ligne: number
  champ: string
  valeur: string
  message: string
}

// État pour les erreurs d'importation
const importErrors = ref<ImportError[]>([])
const showErrorModal = ref(false)

// État des modales
const showCreateModal = ref(false)
const showDetailModal = ref(false)
const showEditModal = ref(false)
const showStockModal = ref(false)
const showImportModal = ref(false)
const showExportModal = ref(false)
const showQRModal = ref(false)
const showCategoriesModal = ref(false)
const showFournisseursModal = ref(false)
const selectedProduit = ref<Produit | null>(null)

// État des filtres avancés
const showAdvancedFilters = ref(false)

// État des modals de confirmation
const showConfirmModal = ref(false)
const confirmAction = ref<(() => void) | null>(null)
const confirmMessage = ref('')

// État des filtres
const filters = ref({
  category: '',
  priceRange: '',
  stockStatus: '',
  nameFilterType: '',
  nameFilterValue: '',
  reference: '',
  marque: '',
  priceMin: '',
  priceMax: '',
  stockMin: '',
  stockMax: ''
})

// État pour les nouvelles entités
const newCategorie = ref({
  nom: '',
  description: '',
  icone: '',
  couleur: '#3B82F6'
})

// État pour l'édition de catégorie
const editingCategorie = ref<any>(null)
const showEditCategorieModal = ref(false)

// État pour l'édition de fournisseur
const editingFournisseur = ref<any>(null)
const showEditFournisseurModal = ref(false)

// Liste d'icônes disponibles pour les catégories
const availableIcons = [
  { name: 'i-heroicons-device-phone-mobile', label: 'Téléphone' },
  { name: 'i-heroicons-computer-desktop', label: 'Ordinateur' },
  { name: 'i-heroicons-cube', label: 'Produit' },
  { name: 'i-heroicons-tag', label: 'Tag' },
  { name: 'i-heroicons-shopping-bag', label: 'Sac' },
  { name: 'i-heroicons-gift', label: 'Cadeau' },
  { name: 'i-heroicons-bolt', label: 'Électronique' },
  { name: 'i-heroicons-wrench-screwdriver', label: 'Outils' },
  { name: 'i-heroicons-home', label: 'Maison' },
  { name: 'i-heroicons-building-office-2', label: 'Bureau' },
  { name: 'i-heroicons-truck', label: 'Transport' },
  { name: 'i-heroicons-camera', label: 'Photo' },
  { name: 'i-heroicons-musical-note', label: 'Musique' },
  { name: 'i-heroicons-book', label: 'Livre' },
  { name: 'i-heroicons-heart', label: 'Santé' }
]

const newFournisseur = ref({
  nom: '',
  code_fournisseur: '',
  email: '',
  telephone: '',
  adresse: '',
  ville: '',
  pays: '',
  site_web: '',
  contact_principal: '',
  notes: ''
})

const sortBy = ref('')
const itemsPerPage = ref(10)
const currentPage = ref(1)

// État de l'importation
const importFile = ref<File | null>(null)
const importPreview = ref<Produit[]>([])
const importing = ref(false)

// État de la génération de codes
const showCodeModal = ref(false)
const showBulkCodeModal = ref(false)
const selectedCodeProduit = ref<Produit | null>(null)
const generatedCode = ref('')
const generatingCode = ref(false)
const generatingBulkCodes = ref(false)
const selectedProductsForBulk = ref<number[]>([])
const selectAllProducts = ref(false)

// État du formulaire de modification
const editFormState = ref({
  nom: "",
  description: "",
  prix_achat: 0,
  prix_vente: 0,
  reference: "",
  categorie: undefined as number | undefined,
  fournisseur_principal: undefined as number | undefined,
  stock_minimum: 0,
  stock_maximum: 1000,
  emplacement: "",  // Nouveau champ
  details: {} as any  // Nouveau champ JSON
})

// État du formulaire de modification du stock
const stockForm = ref({
  nouveauStock: 0,
  typeMouvement: '',
  motif: ''
})

const stockUpdating = ref(false)

// Options pour les types de mouvement de stock
const stockMovementOptions = [
  { label: 'Ajustement', value: 'ajustement' },
  { label: 'Entrée', value: 'entree' },
  { label: 'Sortie', value: 'sortie' },
  { label: 'Transfert', value: 'transfert' },
  { label: 'Perte', value: 'perte' },
  { label: 'Retour', value: 'retour' }
]

// État du formulaire de création
const formState = ref({
  nom: "",
  description: "",
  prix_achat: 0,
  prix_vente: 0,
  quantite: 0,
  reference: "",
  categorie: undefined as number | undefined,
  fournisseur_principal: undefined as number | undefined,
  stock_minimum: 0,
  stock_maximum: 1000,
  emplacement: "",  // Nouveau champ
  details: {} as any  // Nouveau champ JSON
})

// Options pour les catégories
const categoryOptions = [
  { value: 'telephone', label: 'Téléphone' },
  { value: 'ordinateur', label: 'Ordinateur' },
  { value: 'accessoire', label: 'Accessoire' },
  { value: 'autre', label: 'Autre' },
]

// Options pour les filtres
const categoryFilterOptions = computed(() => [
  { value: '', label: 'Toutes les catégories' },
  ...categoryOptions
])

const priceRangeOptions = [
  { value: '', label: 'Tous les prix' },
  { value: '0-100000', label: '0 - 100,000 XAF' },
  { value: '100000-500000', label: '100,000 - 500,000 XAF' },
  { value: '500000-1000000', label: '500,000 - 1,000,000 XAF' },
  { value: '1000000+', label: 'Plus de 1,000,000 XAF' }
]

const stockStatusOptions = [
  { value: '', label: 'Tous les stocks' },
  { value: 'in-stock', label: 'En stock' },
  { value: 'low-stock', label: 'Stock faible' },
  { value: 'out-of-stock', label: 'Rupture de stock' }
]

const sortOptions = [
  { value: '', label: 'Trier par...' },
  { value: 'nom-asc', label: 'Nom (A-Z)' },
  { value: 'nom-desc', label: 'Nom (Z-A)' },
  { value: 'prix-asc', label: 'Prix croissant' },
  { value: 'prix-desc', label: 'Prix décroissant' },
  { value: 'stock-asc', label: 'Stock croissant' },
  { value: 'stock-desc', label: 'Stock décroissant' }
]

// Options pour les filtres de nom
const nameFilterTypeOptions = [
  { value: '', label: 'Type de filtre' },
  { value: 'contains', label: 'Contient' },
  { value: 'starts-with', label: 'Commence par' },
  { value: 'ends-with', label: 'Finit par' },
  { value: 'exact', label: 'Exact' },
  { value: 'regex', label: 'Expression régulière' }
]

const itemsPerPageOptions = [
  { value: 10, label: '10' },
  { value: 25, label: '25' },
  { value: 50, label: '50' },
  { value: 100, label: '100' }
]

// Options pour la génération de codes
const codeTypeOptions = [
  { value: 'qr', label: 'QR Code' },
  { value: 'qr_small', label: 'QR Code (petit)' },
  { value: 'qr_large', label: 'QR Code (grand)' },
  { value: 'qr_custom', label: 'QR Code (personnalisé)' }
]

const formatOptions = [
  { value: 'png', label: 'PNG' },
  { value: 'svg', label: 'SVG' },
  { value: 'jpg', label: 'JPG' }
]

const contentOptions = [
  { value: 'reference', label: 'Référence du produit' },
  { value: 'barcode', label: 'Code-barre existant' },
  { value: 'id', label: 'ID du produit' },
  { value: 'url', label: 'URL du produit' },
  { value: 'json', label: 'Données complètes (JSON)' },
  { value: 'custom', label: 'Texte personnalisé' }
]

// Configuration des options de génération
const codeOptions = ref({
  type: 'qr',
  format: 'png',
  content: 'reference',
  width: 300,
  height: 300,
  includeText: true,
  includeProductName: true,
  includePrice: false
})

const bulkCodeOptions = ref({
  type: 'qr',
  format: 'png',
  width: 300,
  height: 300,
  includeText: true,
  includeProductName: true,
  generateZip: true
})

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

// Produits filtrés et triés
const filteredProduits = computed(() => {
  let filtered = produits.value

  // Recherche textuelle générale
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(produit =>
      produit.nom.toLowerCase().includes(query) ||
      produit.description?.toLowerCase().includes(query) ||
      (produit.category || '').toLowerCase().includes(query) ||
      produit.reference?.toLowerCase().includes(query)
    )
  }

  // Filtre par nom avec type spécifique
  if (filters.value.nameFilterType && filters.value.nameFilterValue) {
    const value = filters.value.nameFilterValue.toLowerCase()
    filtered = filtered.filter(produit => {
      const nom = produit.nom.toLowerCase()
      switch (filters.value.nameFilterType) {
        case 'contains': return nom.includes(value)
        case 'starts-with': return nom.startsWith(value)
        case 'ends-with': return nom.endsWith(value)
        case 'exact': return nom === value
        case 'regex': 
          try {
            const regex = new RegExp(value, 'i')
            return regex.test(produit.nom)
          } catch {
            return false
          }
        default: return true
      }
    })
  }

  // Filtre par référence
  if (filters.value.reference) {
    const ref = filters.value.reference.toLowerCase()
    filtered = filtered.filter(produit => 
      produit.reference?.toLowerCase().includes(ref)
    )
  }

  // Filtre par marque
  if (filters.value.marque) {
    const marque = filters.value.marque.toLowerCase()
    filtered = filtered.filter(produit => 
      produit.marque?.toLowerCase().includes(marque)
    )
  }

  // Filtre par catégorie
  if (filters.value.category) {
    filtered = filtered.filter(produit => produit.category === filters.value.category)
  }

  // Filtre par prix (plage prédéfinie)
  if (filters.value.priceRange) {
    const [min, max] = filters.value.priceRange.split('-').map(Number)
    filtered = filtered.filter(produit => {
      const prix = produit.prix_vente || produit.prix || 0
      if (filters.value.priceRange === '1000000+') {
        return prix >= 1000000
      }
      return prix >= min && prix <= max
    })
  }

  // Filtre par plage de prix personnalisée
  if (filters.value.priceMin || filters.value.priceMax) {
    const minPrice = filters.value.priceMin ? parseFloat(filters.value.priceMin) : 0
    const maxPrice = filters.value.priceMax ? parseFloat(filters.value.priceMax) : Infinity
    filtered = filtered.filter(produit => {
      const prix = produit.prix_vente || produit.prix || 0
      return prix >= minPrice && prix <= maxPrice
    })
  }

  // Filtre par stock (statut prédéfini)
  if (filters.value.stockStatus) {
    filtered = filtered.filter(produit => {
      const stock = produit.quantite || 0
      switch (filters.value.stockStatus) {
        case 'in-stock': return stock > 10
        case 'low-stock': return stock > 0 && stock <= 10
        case 'out-of-stock': return stock === 0
        default: return true
      }
    })
  }

  // Filtre par plage de stock personnalisée
  if (filters.value.stockMin || filters.value.stockMax) {
    const minStock = filters.value.stockMin ? parseInt(filters.value.stockMin) : 0
    const maxStock = filters.value.stockMax ? parseInt(filters.value.stockMax) : Infinity
    filtered = filtered.filter(produit => {
      const stock = produit.quantite || 0
      return stock >= minStock && stock <= maxStock
    })
  }

  // Tri
  if (sortBy.value) {
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy.value) {
        case 'nom-asc': return a.nom.localeCompare(b.nom)
        case 'nom-desc': return b.nom.localeCompare(a.nom)
        case 'prix-asc': return (a.prix_vente || a.prix || 0) - (b.prix_vente || b.prix || 0)
        case 'prix-desc': return (b.prix_vente || b.prix || 0) - (a.prix_vente || a.prix || 0)
        case 'stock-asc': return (a.quantite || 0) - (b.quantite || 0)
        case 'stock-desc': return (b.quantite || 0) - (a.quantite || 0)
        default: return 0
      }
    })
  }

  return filtered
})

// Produits paginés
const paginatedProduits = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredProduits.value.slice(start, end)
})

// Nombre total de pages
const totalPages = computed(() => {
  return Math.ceil(filteredProduits.value.length / itemsPerPage.value)
})

// Fonctions utilitaires
const margeProduit = (produit: Produit) => {
  const prixAchat = produit.prix_achat || 0
  const prixVente = produit.prix_vente || produit.prix || 0
  
  if (!prixAchat || prixAchat === 0) return 0
  const marge = ((prixVente - prixAchat) / prixAchat) * 100
  return Math.round(marge * 100) / 100
}

import { useApi } from '@/stores/useApi'
import { API_BASE_URL } from '@/constants'

// Charger les données depuis l'API backend
const isLoadingRequest = ref(false)
const loadData = async () => {
  try {
    if (isLoadingRequest.value) return
    isLoadingRequest.value = true
    loading.value = true
    
    // Récupérer le token d'authentification
    const token = process.client ? localStorage.getItem('access_token') : null
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    // Récupérer l'entreprise et l'entrepôt de l'utilisateur connecté
    const entreprise = process.client ? localStorage.getItem('entreprise') : null
    const boutique = process.client ? localStorage.getItem('boutique') : null
    
    let entrepriseId = null
    let entrepotId = null
    
    if (entreprise) {
      try {
        const entrepriseData = JSON.parse(entreprise)
        entrepriseId = entrepriseData.id
      } catch (e) {
        console.error('Erreur parsing entreprise:', e)
      }
    }
    
    if (boutique) {
      try {
        const boutiqueData = JSON.parse(boutique)
        entrepotId = boutiqueData.id
      } catch (e) {
        console.error('Erreur parsing boutique:', e)
      }
    }
    
    console.log('IDs récupérés:', { entrepriseId, entrepotId })
    
    // Charger toutes les données en parallèle (filtrées par entreprise côté backend)
    const promises = [
      useApi<any[]>(`${API_BASE_URL}/api/entreprises/`, { method: 'GET', server: false, headers, cacheTTL: 10 * 60 * 1000 }),
      useApi<any[]>(`${API_BASE_URL}/api/boutiques/`, { method: 'GET', server: false, headers, cacheTTL: 10 * 60 * 1000 }),
      useApi<any[]>(`${API_BASE_URL}/api/categories/`, { method: 'GET', server: false, headers, cacheTTL: 10 * 60 * 1000 }),
      useApi<any[]>(`${API_BASE_URL}/api/fournisseurs/`, { method: 'GET', server: false, headers, cacheTTL: 10 * 60 * 1000 }),
      useApi<any[]>(`${API_BASE_URL}/api/produits/`, { method: 'GET', server: false, headers, cacheTTL: 10 * 60 * 1000 })
    ] as const
    
    // Ajouter la requête des stocks seulement si on a un entrepôt
    let stocksResponse: any[] = []
    if (entrepotId) {
      const { data: stocksData } = await useApi<any[]>(`${API_BASE_URL}/api/stocks/?entrepot=${entrepotId}`, { method: 'GET', server: false, headers, cacheTTL: 5 * 60 * 1000 })
      stocksResponse = (stocksData.value as any[]) || []
    }

    const [entRes, entpRes, catRes, fourRes, prodRes] = await Promise.all(promises)
    const entreprisesResponse = (entRes.data.value as any[]) || []
    const entrepotsResponse = (entpRes.data.value as any[]) || []
    const categoriesResponse = (catRes.data.value as any[]) || []
    const fournisseursResponse = (fourRes.data.value as any[]) || []
    const produitsResponse = (prodRes.data.value as any[]) || []
    
    entreprises.value = entreprisesResponse
    entrepots.value = entrepotsResponse
    // Filtrer la catégorie "elec" par défaut
    categories.value = categoriesResponse.filter((c: any) => c.nom?.toLowerCase() !== 'elec')
    fournisseurs.value = fournisseursResponse
    stocks.value = stocksResponse
    
    // Debug: Afficher les premières données
    console.log('=== DEBUG DONNÉES ===')
    console.log('Premier produit brut:', produitsResponse[0])
    console.log('Première entreprise:', entreprisesResponse[0])
    console.log('Premier entrepôt:', entrepotsResponse[0])
    console.log('Première catégorie:', categoriesResponse[0])
    console.log('Premier fournisseur:', fournisseursResponse[0])
    console.log('Premier stock:', stocksResponse[0])
    console.log('====================')
    
    // Adapter les données de l'API au format frontend avec les relations complètes
    // Filtrer les produits par entreprise et afficher tous les produits de l'entreprise
    let produitsFiltres = produitsResponse
    
    // Filtrer par entreprise si disponible
    if (entrepriseId) {
      produitsFiltres = produitsResponse.filter((item: any) => item.entreprise === entrepriseId)
    }
    
    console.log(`Produits trouvés: ${produitsResponse.length}, après filtrage entreprise: ${produitsFiltres.length}`)
    
    produits.value = produitsFiltres.map((item: any) => {
      // Trouver l'entreprise correspondante
      const entreprise = entreprises.value.find(e => e.id === item.entreprise)
      
      // Trouver la catégorie correspondante
      const categorie = categories.value.find(c => c.id === item.categorie)
      
      // Trouver le fournisseur correspondant
      const fournisseur = fournisseurs.value.find(f => f.id === item.fournisseur_principal)
      
      // Gestion des stocks par entrepôt - utiliser le stock de l'entrepôt de l'utilisateur
      let stockTotal = 0
      let stockParEntrepot: any[] = []
      let entrepotPrincipal = null
      
      // Chercher le stock spécifique à l'entrepôt de l'utilisateur
      const stockEntrepotUtilisateur = entrepotId ? stocks.value.find(stock => 
        stock.produit === item.id && stock.entrepot === entrepotId
      ) : null
      
      if (stockEntrepotUtilisateur) {
        stockTotal = stockEntrepotUtilisateur.quantite || 0
        const entrepot = entrepots.value.find(e => e.id === stockEntrepotUtilisateur.entrepot)
        entrepotPrincipal = {
          ...stockEntrepotUtilisateur,
          entrepot_nom: entrepot?.nom || 'Entrepôt Principal',
          entrepot_id: stockEntrepotUtilisateur.entrepot
        }
        stockParEntrepot = [entrepotPrincipal]
      } else {
        // Si pas de stock dans cet entrepôt ou pas d'entrepôt, afficher 0
        stockTotal = 0
        if (entrepotId) {
          const entrepot = entrepots.value.find(e => e.id === entrepotId)
          entrepotPrincipal = {
            produit: item.id,
            entrepot: entrepotId,
            quantite: 0,
            quantite_reservee: 0,
            emplacement: '',
            entrepot_nom: entrepot?.nom || 'Entrepôt Principal',
            entrepot_id: entrepotId
          }
        } else {
          entrepotPrincipal = {
            produit: item.id,
            entrepot: null,
            quantite: 0,
            quantite_reservee: 0,
            emplacement: '',
            entrepot_nom: 'Aucun entrepôt',
            entrepot_id: null
          }
        }
        stockParEntrepot = [entrepotPrincipal]
      }
      
      console.log(`Produit ${item.nom}:`, {
        quantite_directe: item.quantite,
        stocks_detaille: item.stocks,
        stock_total_calcule: stockTotal,
        entreprise_id: item.entreprise,
        entreprise_trouvee: entreprise?.nom,
        categorie_id: item.categorie,
        categorie_trouvee: categorie?.nom,
        fournisseur_id: item.fournisseur_principal,
        fournisseur_trouve: fournisseur?.nom,
        entrepot_principal: entrepotPrincipal?.entrepot_nom
      })
      
      return {
        id: item.id,
        sku: item.sku,
        nom: item.nom,
        description: item.description,
        code_barres: item.code_barres,
        prix_achat: parseFloat(item.prix_achat) || 0,
        prix_vente: parseFloat(item.prix_vente) || 0,
        prix_gros: item.prix_gros ? parseFloat(item.prix_gros) : undefined,
        prix: parseFloat(item.prix_vente) || 0, // compatibilité
        quantite: stockTotal, // Utiliser le stock calculé
        reference: item.reference,
        category: item.category || item.categorie_nom, // compatibilité
        // Relations complètes
        categorie: item.categorie,
        categorie_nom: categorie?.nom || item.categorie_nom || 'Catégorie inconnue',
        entreprise: item.entreprise,
        entreprise_nom: entreprise?.nom || item.entreprise_nom || 'Entreprise inconnue',
        fournisseur_principal: item.fournisseur_principal,
        fournisseur_nom: fournisseur?.nom || item.fournisseur_nom || 'Fournisseur inconnu',
        // Informations commerciales
        devise: item.devise || 'XAF',
        unite_mesure: item.unite_mesure || 'piece',
        stock_minimum: item.stock_minimum || 0,
        stock_maximum: item.stock_maximum || 1000,
        etat_produit: item.etat_produit || 'neuf',
        actif: item.actif !== false,
        // Métadonnées
        created_at: item.created_at,
        updated_at: item.updated_at,
        // Champs spécifiques
        marque: item.marque,
        modele: item.modele,
        specifications: item.specifications,
        image: item.image,
        // Stocks par entrepôt avec informations complètes
        stocks: stockParEntrepot,
        // Calculs automatiques
        marge: item.marge,
        marge_absolue: item.marge_absolue,
        stock_low: item.stock_low,
        stock_high: item.stock_high,
        // Informations d'entrepôt pour l'affichage
        entrepot_nom: entrepotPrincipal?.entrepot_nom || 'Entrepôt principal',
        entrepot_id: entrepotPrincipal?.entrepot_id
      }
    })
    
    console.log('Données chargées depuis l\'API:', {
      produits: produits.value.length,
      entreprises: entreprises.value.length,
      entrepots: entrepots.value.length,
      categories: categories.value.length,
      fournisseurs: fournisseurs.value.length,
      stocks: stocks.value.length
    })
    
    // Vérifier que les catégories et fournisseurs appartiennent à l'entreprise
    console.log('Catégories chargées:', categories.value.map(c => ({ id: c.id, nom: c.nom, entreprise: c.entreprise })))
    console.log('Fournisseurs chargés:', fournisseurs.value.map(f => ({ id: f.id, nom: f.nom, entreprise: f.entreprise })))
    
    if (produits.value.length === 0) {
      if (entrepriseId) {
        warning('Aucun produit trouvé pour votre entreprise')
      } else {
        warning('Aucune entreprise associée à votre compte')
      }
    } else {
      success(`${produits.value.length} produit(s) chargé(s) avec ${entreprises.value.length} entreprise(s), ${entrepots.value.length} entrepôt(s), ${categories.value.length} catégorie(s) et ${fournisseurs.value.length} fournisseur(s)`)
    }
    
  } catch (err: any) {
    console.error('Erreur chargement données:', err)
    
    // Gestion des erreurs spécifiques
    if (err.status === 401) {
      error('Session expirée. Veuillez vous reconnecter.')
      // Ne pas rediriger automatiquement, laisser l'utilisateur décider
      // if (process.client) {
      //   navigateTo('/connexion')
      // }
    } else if (err.status === 403) {
      error('Accès refusé. Vous n\'avez pas les permissions nécessaires.')
    } else if (err.status === 404) {
      error('Endpoint API non trouvé. Vérifiez la configuration.')
    } else {
      error('Erreur lors du chargement des données: ' + (err.data?.message || err.message || 'Erreur inconnue'))
    }
  } finally {
    loading.value = false
    isLoadingRequest.value = false
  }
}

// Fonction de chargement des produits (pour compatibilité)
const loadProduits = loadData

// Fonctions pour recharger uniquement les catégories (sans fermer la popup produit)
const fetchCategories = async () => {
  try {
    const token = process.client ? localStorage.getItem('access_token') : null
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    const { data: catRes } = await useApi<any[]>(`${API_BASE_URL}/api/categories/`, { 
      method: 'GET', 
      server: false, 
      headers, 
      cacheTTL: 0 // Pas de cache pour forcer le rechargement
    })
    const categoriesResponse = (catRes.value as any[]) || []
    // Filtrer la catégorie "elec" par défaut
    categories.value = categoriesResponse.filter((c: any) => c.nom?.toLowerCase() !== 'elec')
    console.log('Catégories rechargées:', categories.value.length)
  } catch (err: any) {
    console.error('Erreur lors du rechargement des catégories:', err)
  }
}

// Fonctions pour recharger uniquement les fournisseurs (sans fermer la popup produit)
const fetchFournisseurs = async () => {
  try {
    const token = process.client ? localStorage.getItem('access_token') : null
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    const { data: fourRes } = await useApi<any[]>(`${API_BASE_URL}/api/fournisseurs/`, { 
      method: 'GET', 
      server: false, 
      headers, 
      cacheTTL: 0 // Pas de cache pour forcer le rechargement
    })
    const fournisseursResponse = (fourRes.value as any[]) || []
    fournisseurs.value = fournisseursResponse
    console.log('Fournisseurs rechargés:', fournisseurs.value.length)
  } catch (err: any) {
    console.error('Erreur lors du rechargement des fournisseurs:', err)
  }
}

// Fonctions pour gérer les catégories
const createCategorie = async () => {
  try {
    const token = process.client ? localStorage.getItem('access_token') : null
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    // Récupérer l'entreprise de l'utilisateur connecté
    const entreprise = process.client ? localStorage.getItem('entreprise') : null
    let entrepriseId = null
    if (entreprise) {
      try {
        const entrepriseData = JSON.parse(entreprise)
        entrepriseId = entrepriseData.id
      } catch (e) {
        console.error('Erreur parsing entreprise:', e)
      }
    }
    
    if (!entrepriseId) {
      error('Aucune entreprise associée à votre compte')
      return
    }
    
    // Préparer les données avec les champs requis
    const categorieData = {
      nom: newCategorie.value.nom,
      description: newCategorie.value.description || '',
      icone: newCategorie.value.icone || '',
      couleur: newCategorie.value.couleur,
      entreprise: entrepriseId, // Ajouter l'ID de l'entreprise
      actif: true
    }
    
    console.log('Données envoyées pour la catégorie:', categorieData)
    
    const response = await $fetch(`${API_BASE_URL}/api/categories/`, {
      method: 'POST',
      headers,
      body: categorieData
    })
    
    success('Catégorie créée avec succès!')
    // Ne pas fermer la popup, juste vider le formulaire
    newCategorie.value = { nom: '', description: '', icone: '', couleur: '#3B82F6' }
    
    // Invalider le cache et recharger uniquement les catégories (sans fermer la popup produit)
    const nuxtApp = useNuxtApp()
    if (nuxtApp.$invalidateCacheByPattern) {
      nuxtApp.$invalidateCacheByPattern('/api/categories')
      nuxtApp.$invalidateCacheByPattern('/api/produits')
    }
    // Recharger uniquement les catégories sans fermer la popup produit
    await fetchCategories()
  } catch (err: any) {
    console.error('Erreur création catégorie:', err)
    console.error('Détails de l\'erreur:', err.data)
    error('Erreur lors de la création de la catégorie: ' + (err.data?.message || err.message || 'Erreur inconnue'))
  }
}

// Fonctions pour éditer et supprimer les catégories
const editCategorie = (categorie: any) => {
  editingCategorie.value = { ...categorie }
  showEditCategorieModal.value = true
}

const updateCategorie = async () => {
  if (!editingCategorie.value) return
  
  try {
    const token = process.client ? localStorage.getItem('access_token') : null
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    // Récupérer l'entreprise de l'utilisateur connecté
    const entreprise = process.client ? localStorage.getItem('entreprise') : null
    let entrepriseId = null
    if (entreprise) {
      try {
        const entrepriseData = JSON.parse(entreprise)
        entrepriseId = entrepriseData.id
      } catch (e) {
        console.error('Erreur parsing entreprise:', e)
      }
    }
    
    const categorieData = {
      nom: editingCategorie.value.nom,
      description: editingCategorie.value.description || '',
      icone: editingCategorie.value.icone || '',
      couleur: editingCategorie.value.couleur,
      actif: editingCategorie.value.actif !== false,
      ...(entrepriseId && { entreprise: entrepriseId })
    }
    
    console.log('Données envoyées pour la modification de catégorie:', categorieData)
    
    await $fetch(`${API_BASE_URL}/api/categories/${editingCategorie.value.id}/`, {
      method: 'PUT',
      headers,
      body: categorieData
    })
    
    success('Catégorie modifiée avec succès!')
    showEditCategorieModal.value = false
    editingCategorie.value = null
    
    // Invalider le cache et recharger les données
    const nuxtApp = useNuxtApp()
    if (nuxtApp.$invalidateCacheByPattern) {
      nuxtApp.$invalidateCacheByPattern('/api/categories')
      nuxtApp.$invalidateCacheByPattern('/api/produits')
    }
    await loadData()
  } catch (err: any) {
    console.error('Erreur modification catégorie:', err)
    error('Erreur lors de la modification de la catégorie: ' + (err.data?.message || err.message || 'Erreur inconnue'))
  }
}

const deleteCategorie = async (id: number) => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ? Cette action est irréversible.')) return
  
  try {
    const token = process.client ? localStorage.getItem('access_token') : null
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    await $fetch(`${API_BASE_URL}/api/categories/${id}/`, {
      method: 'DELETE',
      headers
    })
    
    success('Catégorie supprimée avec succès!')
    loadData()
  } catch (err: any) {
    console.error('Erreur suppression catégorie:', err)
    error('Erreur lors de la suppression de la catégorie: ' + (err.data?.message || err.message || 'Erreur inconnue'))
  }
}

// Fonctions pour gérer les fournisseurs
const createFournisseur = async () => {
  try {
    const token = process.client ? localStorage.getItem('access_token') : null
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    // Récupérer l'entreprise de l'utilisateur connecté
    const entreprise = process.client ? localStorage.getItem('entreprise') : null
    let entrepriseId = null
    if (entreprise) {
      try {
        const entrepriseData = JSON.parse(entreprise)
        entrepriseId = entrepriseData.id
      } catch (e) {
        console.error('Erreur parsing entreprise:', e)
      }
    }
    
    if (!entrepriseId) {
      error('Aucune entreprise associée à votre compte')
      return
    }
    
    // Préparer les données avec les champs requis
    const fournisseurData = {
      nom: newFournisseur.value.nom,
      code_fournisseur: newFournisseur.value.code_fournisseur || `FOUR${Date.now()}`,
      description: newFournisseur.value.notes || '',
      email: newFournisseur.value.email || 'contact@fournisseur.com',
      telephone: newFournisseur.value.telephone || '+237 6XX XX XX XX',
      adresse: newFournisseur.value.adresse || 'Adresse non spécifiée',
      ville: newFournisseur.value.ville || 'Ville non spécifiée',
      pays: newFournisseur.value.pays || 'Cameroun',
      entreprise: entrepriseId, // Ajouter l'ID de l'entreprise
      actif: true
    }
    
    console.log('Données envoyées pour le fournisseur:', fournisseurData)
    
    const response = await $fetch(`${API_BASE_URL}/api/fournisseurs/`, {
      method: 'POST',
      headers,
      body: fournisseurData
    })
    
    success('Fournisseur créé avec succès!')
    // Ne pas fermer la popup, juste vider le formulaire
    newFournisseur.value = { nom: '', code_fournisseur: '', email: '', telephone: '', adresse: '', ville: '', pays: '', site_web: '', contact_principal: '', notes: '' }
    
    // Invalider le cache et recharger uniquement les fournisseurs (sans fermer la popup produit)
    const nuxtApp = useNuxtApp()
    if (nuxtApp.$invalidateCacheByPattern) {
      nuxtApp.$invalidateCacheByPattern('/api/fournisseurs')
      nuxtApp.$invalidateCacheByPattern('/api/produits')
    }
    // Recharger uniquement les fournisseurs sans fermer la popup produit
    await fetchFournisseurs()
  } catch (err: any) {
    console.error('Erreur création fournisseur:', err)
    console.error('Détails de l\'erreur:', err.data)
    error('Erreur lors de la création du fournisseur: ' + (err.data?.message || err.message || 'Erreur inconnue'))
  }
}

// Fonctions pour éditer et supprimer les fournisseurs
const editFournisseur = (fournisseur: any) => {
  editingFournisseur.value = { ...fournisseur }
  showEditFournisseurModal.value = true
}

const updateFournisseur = async () => {
  if (!editingFournisseur.value) return
  
  try {
    const token = process.client ? localStorage.getItem('access_token') : null
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    // Récupérer l'entreprise de l'utilisateur connecté
    const entreprise = process.client ? localStorage.getItem('entreprise') : null
    let entrepriseId = null
    if (entreprise) {
      try {
        const entrepriseData = JSON.parse(entreprise)
        entrepriseId = entrepriseData.id
      } catch (e) {
        console.error('Erreur parsing entreprise:', e)
      }
    }
    
    const fournisseurData = {
      nom: editingFournisseur.value.nom,
      code_fournisseur: editingFournisseur.value.code_fournisseur || `FOUR${Date.now()}`,
      description: editingFournisseur.value.notes || editingFournisseur.value.description || '',
      email: editingFournisseur.value.email || '',
      telephone: editingFournisseur.value.telephone || '',
      adresse: editingFournisseur.value.adresse || '',
      ville: editingFournisseur.value.ville || '',
      pays: editingFournisseur.value.pays || 'Cameroun',
      actif: editingFournisseur.value.actif !== false,
      ...(entrepriseId && { entreprise: entrepriseId })
    }
    
    console.log('Données envoyées pour la modification de fournisseur:', fournisseurData)
    
    await $fetch(`${API_BASE_URL}/api/fournisseurs/${editingFournisseur.value.id}/`, {
      method: 'PUT',
      headers,
      body: fournisseurData
    })
    
    success('Fournisseur modifié avec succès!')
    showEditFournisseurModal.value = false
    editingFournisseur.value = null
    
    // Invalider le cache et recharger les données
    const nuxtApp = useNuxtApp()
    if (nuxtApp.$invalidateCacheByPattern) {
      nuxtApp.$invalidateCacheByPattern('/api/fournisseurs')
      nuxtApp.$invalidateCacheByPattern('/api/produits')
    }
    await loadData()
  } catch (err: any) {
    console.error('Erreur modification fournisseur:', err)
    error('Erreur lors de la modification du fournisseur: ' + (err.data?.message || err.message || 'Erreur inconnue'))
  }
}

const deleteFournisseur = async (id: number) => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer ce fournisseur ? Cette action est irréversible.')) return
  
  try {
    const token = process.client ? localStorage.getItem('access_token') : null
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    await $fetch(`${API_BASE_URL}/api/fournisseurs/${id}/`, {
      method: 'DELETE',
      headers
    })
    
    success('Fournisseur supprimé avec succès!')
    loadData()
  } catch (err: any) {
    console.error('Erreur suppression fournisseur:', err)
    error('Erreur lors de la suppression du fournisseur: ' + (err.data?.message || err.message || 'Erreur inconnue'))
  }
}

// Actions
const viewProduit = (produit: Produit) => {
  selectedProduit.value = produit
  showDetailModal.value = true
}

const deleteProduit = async (id: number) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.')) {
    try {
      // Récupérer le token d'authentification
      const token = process.client ? localStorage.getItem('access_token') : null
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      // Appel à l'API pour supprimer le produit
      await $fetch(`${API_BASE_URL}/api/produits/${id}/`, {
        method: 'DELETE',
        headers
      })
      
      // Mettre à jour la liste locale
      produits.value = produits.value.filter(p => p.id !== id)
      success('Produit supprimé avec succès')
    } catch (err: any) {
      console.error('Erreur suppression:', err)
      
      if (err.status === 401) {
        error('Session expirée. Veuillez vous reconnecter.')
        if (process.client) {
          navigateTo('/connexion')
        }
      } else if (err.status === 403) {
        error('Accès refusé. Vous n\'avez pas les permissions nécessaires.')
      } else {
        error('Erreur lors de la suppression: ' + (err.data?.message || err.message || 'Erreur inconnue'))
      }
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
  
  if (!formState.value.stock_minimum || formState.value.stock_minimum < 0) {
    error('Le stock minimal doit être défini et positif')
    return
  }
  
  if (formState.value.prix_vente <= formState.value.prix_achat) {
    error('Le prix de vente doit être supérieur au prix d\'achat')
    return
  }

  loading.value = true
  
  try {
    // Récupérer le token d'authentification
    const token = process.client ? localStorage.getItem('access_token') : null
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    // Résoudre l'entreprise de l'utilisateur (localStorage ou API)
    const resolveEntrepriseId = async (): Promise<number | null> => {
      // 1) Essayer localStorage
      const entrepriseLocal = process.client ? localStorage.getItem('entreprise') : null
      if (entrepriseLocal) {
        try {
          const parsed = JSON.parse(entrepriseLocal)
          if (parsed?.id) return parsed.id as number
        } catch (e) {
          console.error('Erreur parsing entreprise depuis localStorage:', e)
        }
      }
      // 2) Fallback: récupérer via /api/user/me/ puis déduire l'entreprise
      try {
        const token = process.client ? localStorage.getItem('access_token') : null
        const headers: Record<string, string> = { 'Content-Type': 'application/json' }
        if (token) headers['Authorization'] = `Bearer ${token}`
        const me: any = await $fetch(`${API_BASE_URL}/api/user/me/`, { method: 'GET', headers })
        // Chercher entreprise directe ou via boutique
        const entrepriseFromMe = me?.entreprise?.id || me?.entreprise || me?.boutique?.entreprise?.id
        if (entrepriseFromMe && process.client) {
          // Si on a des infos d'entreprise, normaliser et stocker
          const entrepriseObj = me?.entreprise || { id: entrepriseFromMe }
          localStorage.setItem('entreprise', JSON.stringify(entrepriseObj))
          return Number(entrepriseFromMe)
        }
      } catch (e) {
        console.error('Erreur résolution entreprise via /api/user/me/:', e)
      }
      return null
    }

    const entrepriseId = await resolveEntrepriseId()
    if (!entrepriseId) {
      error('Aucune entreprise associée. Veuillez sélectionner une entreprise.')
      return
    }
    
    // Préparer les données pour l'API avec tous les champs requis
    const produitData: any = {
      nom: formState.value.nom,
      description: formState.value.description || '',
      prix_achat: parseFloat(formState.value.prix_achat.toString()),
      prix_vente: parseFloat(formState.value.prix_vente.toString()),
      quantite: 0, // La quantité sera gérée via l'API de stock après création
      reference: formState.value.reference || '',
      categorie: formState.value.categorie || null,
      fournisseur_principal: formState.value.fournisseur_principal || null,
      entreprise: entrepriseId, // Champ requis
      // Gestion des stocks
      stock_minimum: parseInt(formState.value.stock_minimum.toString()) || 0,
      stock_maximum: parseInt(formState.value.stock_maximum.toString()) || 1000,
      // Nouveaux champs
      emplacement: formState.value.emplacement || '',
      details: formState.value.details || {},
      // Valeurs par défaut
      devise: 'XAF',
      unite_mesure: 'piece',
      etat_produit: 'neuf',
      actif: true
    }
    
    console.log('Données envoyées pour le produit:', produitData)
    
    // Appel à l'API pour créer le produit - utilise useApi pour l'invalidation automatique du cache
    const response = await $fetch<any>(`${API_BASE_URL}/api/produits/`, {
      method: 'POST',
      headers,
      body: produitData
    })
    
    // Invalidation automatique du cache via useApi (déjà fait dans useApi)
    
    // Ajouter le nouveau produit à la liste locale
    const nouveauProduit: Produit = {
      id: response.id,
      sku: response.sku,
      nom: response.nom,
      description: response.description,
      code_barres: response.code_barres,
      prix_achat: parseFloat(response.prix_achat) || 0,
      prix_vente: parseFloat(response.prix_vente) || 0,
      prix_gros: response.prix_gros ? parseFloat(response.prix_gros) : undefined,
      prix: parseFloat(response.prix_vente) || 0,
      quantite: response.quantite || 0,
      reference: response.reference,
      category: response.category || response.categorie_nom,
      categorie: response.categorie,
      categorie_nom: response.categorie_nom,
      entreprise: response.entreprise,
      entreprise_nom: response.entreprise_nom,
      fournisseur_principal: response.fournisseur_principal,
      fournisseur_nom: response.fournisseur_nom,
      devise: response.devise || 'XAF',
      unite_mesure: response.unite_mesure || 'piece',
      stock_minimum: response.stock_minimum || 0,
      stock_maximum: response.stock_maximum || 1000,
      etat_produit: response.etat_produit || 'neuf',
      actif: response.actif !== false,
      created_at: response.created_at,
      updated_at: response.updated_at,
      marque: response.marque,
      modele: response.modele,
      specifications: response.specifications,
      image: response.image,
      stocks: response.stocks || [],
      marge: response.marge,
      marge_absolue: response.marge_absolue,
      stock_low: response.stock_low,
      stock_high: response.stock_high
    }
    
    produits.value.push(nouveauProduit)
    
    // IMPORTANT: L'invalidation du cache est gérée automatiquement par useApi
    // lors de l'appel POST à /api/produits/
    
    success('Produit créé avec succès!')
    showCreateModal.value = false
    
    // Réinitialiser le formulaire
    formState.value = {
      nom: "",
      description: "",
      prix_achat: 0,
      prix_vente: 0,
      quantite: 0, // Toujours initialisé à 0 mais non affiché dans le formulaire
      reference: "",
      categorie: undefined,
      fournisseur_principal: undefined,
      stock_minimum: 0,
      stock_maximum: 1000,
      emplacement: "",  // Nouveau champ
      details: {}  // Nouveau champ
    }
  } catch (err: any) {
    console.error('Erreur création produit:', err)
    
    if (err.status === 401) {
      error('Session expirée. Veuillez vous reconnecter.')
      if (process.client) {
        navigateTo('/connexion')
      }
    } else if (err.status === 403) {
      error('Accès refusé. Vous n\'avez pas les permissions nécessaires.')
    } else if (err.status === 400) {
      error('Données invalides: ' + (err.data?.message || err.message || 'Vérifiez les champs'))
    } else {
      error('Erreur lors de la création: ' + (err.data?.message || err.message || 'Erreur inconnue'))
    }
  } finally {
    loading.value = false
  }
}

// Fonction pour ouvrir le formulaire de modification
const openEditModal = (produit: Produit) => {
  selectedProduit.value = produit
  
  // Pré-remplir le formulaire avec les données du produit
  editFormState.value = {
    nom: produit.nom || "",
    description: produit.description || "",
    prix_achat: produit.prix_achat || 0,
    prix_vente: produit.prix_vente || 0,
    reference: produit.reference || "",
    categorie: produit.categorie,
    fournisseur_principal: produit.fournisseur_principal,
    stock_minimum: produit.stock_minimum || 0,
    stock_maximum: produit.stock_maximum || 1000,
        emplacement: produit.emplacement || "",  // Nouveau champ
        details: produit.details || {}  // Nouveau champ
  }
  
  showEditModal.value = true
}

// Fonction pour sauvegarder les modifications
const saveProduit = async () => {
  if (!selectedProduit.value) return
  
  // Validation des champs requis
  if (!editFormState.value.nom.trim()) {
    error('Le nom du produit est requis')
    return
  }
  
  if (!editFormState.value.prix_achat || editFormState.value.prix_achat <= 0) {
    error('Le prix d\'achat doit être supérieur à 0')
    return
  }
  
  if (!editFormState.value.prix_vente || editFormState.value.prix_vente <= 0) {
    error('Le prix de vente doit être supérieur à 0')
    return
  }
  
  if (!editFormState.value.stock_minimum || editFormState.value.stock_minimum < 0) {
    error('Le stock minimal doit être défini et positif')
    return
  }
  
  if (editFormState.value.prix_vente <= editFormState.value.prix_achat) {
    error('Le prix de vente doit être supérieur au prix d\'achat')
    return
  }

  loading.value = true
  
  try {
    // Récupérer le token d'authentification
    const token = process.client ? localStorage.getItem('access_token') : null
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    // Résoudre l'entreprise de l'utilisateur (localStorage ou API)
    const resolveEntrepriseIdForUpdate = async (): Promise<number | null> => {
      const entrepriseLocal = process.client ? localStorage.getItem('entreprise') : null
      if (entrepriseLocal) {
        try {
          const parsed = JSON.parse(entrepriseLocal)
          if (parsed?.id) return parsed.id as number
        } catch (e) {
          console.error('Erreur parsing entreprise depuis localStorage:', e)
        }
      }
      try {
        const token = process.client ? localStorage.getItem('access_token') : null
        const headers: Record<string, string> = { 'Content-Type': 'application/json' }
        if (token) headers['Authorization'] = `Bearer ${token}`
        const me: any = await $fetch(`${API_BASE_URL}/api/user/me/`, { method: 'GET', headers })
        const entrepriseFromMe = me?.entreprise?.id || me?.entreprise || me?.boutique?.entreprise?.id
        if (entrepriseFromMe && process.client) {
          const entrepriseObj = me?.entreprise || { id: entrepriseFromMe }
          localStorage.setItem('entreprise', JSON.stringify(entrepriseObj))
          return Number(entrepriseFromMe)
        }
      } catch (e) {
        console.error('Erreur résolution entreprise via /api/user/me/:', e)
      }
      return null
    }

    const entrepriseId = await resolveEntrepriseIdForUpdate()
    if (!entrepriseId) {
      error('Aucune entreprise associée. Veuillez sélectionner une entreprise.')
      return
    }
    
    // Préparer les données pour l'API avec tous les champs requis
    const produitData: any = {
      nom: editFormState.value.nom,
      description: editFormState.value.description || '',
      prix_achat: parseFloat(editFormState.value.prix_achat.toString()),
      prix_vente: parseFloat(editFormState.value.prix_vente.toString()),
      reference: editFormState.value.reference || '',
      categorie: editFormState.value.categorie || null,
      fournisseur_principal: editFormState.value.fournisseur_principal || null,
      entreprise: entrepriseId, // Champ requis
      // Gestion des stocks
      stock_minimum: parseInt(editFormState.value.stock_minimum.toString()) || 0,
      stock_maximum: parseInt(editFormState.value.stock_maximum.toString()) || 1000,
      // Nouveaux champs
      emplacement: editFormState.value.emplacement || '',
      details: editFormState.value.details || {},
      // Valeurs par défaut
      devise: 'XAF',
      unite_mesure: 'piece',
      etat_produit: 'neuf',
      actif: true
    }
    
    // IMPORTANT: NE PAS ENVOYER LA QUANTITE - elle ne doit pas être modifiée via cette fonction
    // La quantité est gérée indépendamment via l'API de stock
    
    console.log('Données de modification envoyées:', produitData)
    
    // Appel à l'API pour modifier le produit
    const response = await $fetch<any>(`${API_BASE_URL}/api/produits/${selectedProduit.value.id}/`, {
      method: 'PUT',
      headers,
      body: produitData
    })
    
    // Mettre à jour le produit dans la liste locale
    // IMPORTANT: Conserver la quantité existante (ne pas la modifier)
    const index = produits.value.findIndex(p => p.id === selectedProduit.value!.id)
    if (index !== -1) {
      const ancienneQuantite = produits.value[index].quantite  // Conserver la quantité actuelle
      produits.value[index] = {
        ...produits.value[index],
        nom: response.nom,
        description: response.description,
        prix_achat: parseFloat(response.prix_achat) || 0,
        prix_vente: parseFloat(response.prix_vente) || 0,
        quantite: ancienneQuantite,  // NE PAS MODIFIER - garder la quantité existante
        reference: response.reference,
        categorie: response.categorie,
        fournisseur_principal: response.fournisseur_principal,
        stock_minimum: response.stock_minimum || 0,
        stock_maximum: response.stock_maximum || 1000,
        emplacement: (response as any).emplacement || '',
        details: (response as any).details || {},
        updated_at: response.updated_at
      }
    }
    
    // IMPORTANT: L'invalidation du cache est gérée automatiquement par useApi
    // lors de l'appel PUT à /api/produits/{id}/
    
    success('Produit modifié avec succès!')
    showEditModal.value = false
    
  } catch (err: any) {
    console.error('Erreur modification produit:', err)
    console.error('Détails de l\'erreur:', err.data)
    
    if (err.status === 401) {
      error('Session expirée. Veuillez vous reconnecter.')
    } else if (err.status === 403) {
      error('Accès refusé. Vous n\'avez pas les permissions nécessaires.')
    } else if (err.status === 400) {
      error('Données invalides: ' + (err.data?.message || 'Vérifiez tous les champs requis'))
    } else {
      error('Erreur lors de la modification du produit: ' + (err.data?.message || err.message || 'Erreur inconnue'))
    }
  } finally {
    loading.value = false
  }
}

// Fonction pour mettre à jour le stock d'un produit
const updateStock = async () => {
  if (!selectedProduit.value) return
  
  // Validation des champs requis
  if (!stockForm.value.nouveauStock && stockForm.value.nouveauStock !== 0) {
    error('La nouvelle quantité de stock est requise')
    return
  }
  
  if (!stockForm.value.typeMouvement) {
    error('Le type de mouvement est requis')
    return
  }
  
  if (stockForm.value.nouveauStock < 0) {
    error('La quantité de stock ne peut pas être négative')
    return
  }

  stockUpdating.value = true
  
  try {
    // Récupérer le token d'authentification
    const token = process.client ? localStorage.getItem('access_token') : null
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    // Récupérer l'entrepôt de l'utilisateur connecté
    const boutique = process.client ? localStorage.getItem('boutique') : null
    let entrepotId = null
    if (boutique) {
      const boutiqueData = JSON.parse(boutique)
      entrepotId = boutiqueData.id
    }
    
            if (!entrepotId) {
              error('Aucun entrepôt associé à votre compte')
              return
            }

            // Vérifier que le produit appartient à l'entreprise de l'utilisateur
            const entreprise = process.client ? localStorage.getItem('entreprise') : null
            let entrepriseId = null
            if (entreprise) {
              try {
                const entrepriseData = JSON.parse(entreprise)
                entrepriseId = entrepriseData.id
              } catch (e) {
                console.error('Erreur parsing entreprise:', e)
              }
            }

            if (!entrepriseId || selectedProduit.value.entreprise !== entrepriseId) {
              error('Ce produit n\'appartient pas à votre entreprise')
              return
            }
    
            // Calculer la différence de stock (ajout/soustraction)
            const ancienStock = selectedProduit.value.quantite || 0
            const quantiteModification = parseInt(stockForm.value.nouveauStock.toString())
            
            // Calculer le nouveau stock selon le type de mouvement
            let nouveauStock = ancienStock
            let difference = 0
            
            if (stockForm.value.typeMouvement === 'entree' || stockForm.value.typeMouvement === 'retour') {
              // Ajouter au stock existant
              nouveauStock = ancienStock + quantiteModification
              difference = quantiteModification
            } else if (stockForm.value.typeMouvement === 'sortie' || stockForm.value.typeMouvement === 'perte') {
              // Soustraire du stock existant
              nouveauStock = Math.max(0, ancienStock - quantiteModification)
              difference = -quantiteModification
            } else if (stockForm.value.typeMouvement === 'ajustement') {
              // Ajustement : définir directement la quantité
              nouveauStock = quantiteModification
              difference = quantiteModification - ancienStock
            } else if (stockForm.value.typeMouvement === 'transfert') {
              // Transfert : pour l'instant, traiter comme un ajustement
              nouveauStock = quantiteModification
              difference = quantiteModification - ancienStock
            }

            console.log('Calcul stock:', {
              ancienStock,
              quantiteModification,
              nouveauStock,
              difference,
              typeMouvement: stockForm.value.typeMouvement
            })

            // Préparer les données pour l'API
            const stockData = {
              produit: selectedProduit.value.id,
              entrepot: entrepotId,
              quantite: nouveauStock,
              quantite_reservee: 0, // Par défaut
              emplacement: '', // Peut être ajouté plus tard
            }
    
            console.log('Données de mise à jour du stock:', stockData)
            console.log('Entrepôt ID:', entrepotId)
            console.log('Produit ID:', selectedProduit.value.id)

            // Vérifier si un stock existe déjà pour ce produit dans cet entrepôt
            const existingStock = stocks.value.find(s =>
              s.produit === selectedProduit.value!.id && s.entrepot === entrepotId
            )

            console.log('Stock existant trouvé:', existingStock)

            let response
            if (existingStock) {
              console.log('Mise à jour du stock existant:', existingStock.id)
              // Mettre à jour le stock existant
              response = await $fetch<any>(`${API_BASE_URL}/api/stocks/${existingStock.id}/`, {
                method: 'PUT',
                headers,
                body: stockData
              })
            } else {
              console.log('Création d\'un nouveau stock')
              // Créer un nouveau stock
              response = await $fetch<any>(`${API_BASE_URL}/api/stocks/`, {
                method: 'POST',
                headers,
                body: stockData
              })
            }

            console.log('Réponse API stock:', response)
    
            // Créer un mouvement de stock pour tracer le changement
            if (difference !== 0) {
              const mouvementData = {
                produit: selectedProduit.value.id,
                entrepot: entrepotId,
                type_mouvement: stockForm.value.typeMouvement,
                quantite: Math.abs(difference),
                quantite_avant: ancienStock,
                quantite_apres: nouveauStock,
                motif: stockForm.value.motif || `Ajustement de stock`,
                reference_document: `Stock-${selectedProduit.value.id}-${Date.now()}`
              }

              console.log('Données mouvement:', mouvementData)

              await $fetch<any>(`${API_BASE_URL}/api/mouvements-stock/`, {
                method: 'POST',
                headers,
                body: mouvementData
              })
            }
    
    // Mettre à jour le produit dans la liste locale
    const index = produits.value.findIndex(p => p.id === selectedProduit.value!.id)
    if (index !== -1) {
      produits.value[index].quantite = nouveauStock
    }
    
    // Mettre à jour la liste des stocks
    await loadData()
    
    // IMPORTANT: Invalidation manuelle du cache pour les opérations de stock
    // car nous utilisons $fetch directement pour les mouvements de stock
    if (process.client) {
      const nuxtApp = useNuxtApp()
      const invalidateCache = nuxtApp.$invalidateCacheByPattern
      if (invalidateCache) {
        invalidateCache('/api/stocks')
        invalidateCache('/api/produits')
        invalidateCache('/api/mouvements-stock')
        console.log('[Cache] Cache invalidé après modification stock')
      }
    }
    
    success(`Stock mis à jour avec succès! Nouveau stock: ${nouveauStock}`)
    showStockModal.value = false
    
    // Réinitialiser le formulaire
    stockForm.value = {
      nouveauStock: 0,
      typeMouvement: '',
      motif: ''
    }
    
  } catch (err: any) {
    console.error('Erreur mise à jour stock:', err)
    console.error('Détails de l\'erreur:', err.data)
    
    if (err.status === 401) {
      error('Session expirée. Veuillez vous reconnecter.')
    } else if (err.status === 403) {
      error('Accès refusé. Vous n\'avez pas les permissions nécessaires.')
    } else if (err.status === 400) {
      error('Données invalides: ' + (err.data?.message || 'Vérifiez tous les champs requis'))
    } else {
      error('Erreur lors de la mise à jour du stock: ' + (err.data?.message || err.message || 'Erreur inconnue'))
    }
  } finally {
    stockUpdating.value = false
  }
}

// Fonction pour fermer le modal de modification
const closeEditModal = () => {
  showEditModal.value = false
  selectedProduit.value = null
}

// Fonction pour modifier un produit (alias pour openEditModal)
const editProduit = (produit: Produit) => {
  openEditModal(produit)
}

// Fonction pour modifier le stock d'un produit
const editStock = (produit: Produit) => {
  selectedProduit.value = produit
  showStockModal.value = true
}

const handleImport = () => {
  showImportModal.value = true
}

const openFileDialog = () => {
  const input = document.querySelector('input[type=file]') as HTMLInputElement
  input?.click()
}

// Fonctions pour l'importation
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) {
    error('Aucun fichier sélectionné')
    return
  }

  // Vérifier le type de fichier (plus flexible)
  const validTypes = [
    'text/csv',
    'text/plain',
    'application/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/tab-separated-values'
  ]
  
  const validExtensions = ['.csv', '.txt', '.tsv', '.xlsx', '.xls']
  const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
  
  if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
    error('Format de fichier non supporté. Veuillez sélectionner un fichier Excel (.xlsx, .xls) ou CSV (.csv, .txt, .tsv).')
    return
  }

  // Vérifier la taille du fichier (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    error('Le fichier est trop volumineux. Taille maximale autorisée : 10MB')
    return
  }

  importFile.value = file
  parseCSVFile(file)
}

const parseCSVFile = (file: File) => {
  console.log('=== PARSE CSV FILE ===')
  console.log('Fichier:', file.name)
  
  const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
  console.log('Extension:', fileExtension)
  
  if (fileExtension === '.xlsx' || fileExtension === '.xls') {
    console.log('→ Parsing Excel')
    parseExcelFile(file)
  } else {
    console.log('→ Parsing Text/CSV')
    parseTextFile(file)
  }
}

const parseExcelFile = (file: File) => {
  console.log('=== PARSING FICHIER EXCEL AVEC SHEETJS ===')
  console.log('Fichier:', file.name, 'Taille:', file.size, 'Type:', file.type)
  
  // Utiliser SheetJS pour parser les fichiers Excel
  import('xlsx').then((XLSX) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = e.target?.result
        if (!data) {
          error('Erreur lors de la lecture du fichier Excel')
          return
        }
        
        console.log('Données lues, parsing avec SheetJS...')
        
        // Parser le fichier Excel avec SheetJS
        const workbook = XLSX.read(data, { type: 'array' })
        console.log('Workbook parsé:', workbook.SheetNames)
        
        // Prendre la première feuille
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        
        if (!worksheet) {
          error('Aucune feuille trouvée dans le fichier Excel')
          return
        }
        
        console.log('Feuille sélectionnée:', firstSheetName)
        
        // Convertir la feuille en JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1, // Utiliser la première ligne comme en-têtes
          defval: '', // Valeur par défaut pour les cellules vides
          raw: false // Convertir les valeurs en texte
        })
        
        console.log('Données JSON:', jsonData.length, 'lignes')
        console.log('Première ligne (en-têtes):', jsonData[0])
        
        if (jsonData.length < 2) {
          error('Le fichier Excel ne contient pas assez de données (minimum 2 lignes : en-têtes + données)')
          return
        }
        
        // Traiter les données comme du CSV
        const csvText = jsonData.map((row: any) => Array.isArray(row) ? row.join(',') : String(row)).join('\n')
        console.log('CSV généré:', csvText.substring(0, 200) + '...')
        
        parseExcelAsCSV(csvText, file.name)
        
      } catch (err) {
        console.error('Erreur lors du parsing Excel avec SheetJS:', err)
        error(`Erreur lors du parsing du fichier Excel: ${err instanceof Error ? err.message : 'Erreur inconnue'}`)
      }
    }
    
    reader.onerror = () => {
      error('Erreur lors de la lecture du fichier')
    }
    
    reader.readAsArrayBuffer(file)
    
  }).catch((err) => {
    console.error('Erreur lors du chargement de SheetJS:', err)
    error('Erreur lors du chargement de la bibliothèque Excel. Veuillez convertir votre fichier en CSV.')
  })
}

const parseExcelAsCSV = (text: string, fileName: string) => {
  try {
    console.log('=== PARSING EXCEL COMME CSV ===')
    console.log('Texte reçu:', text.substring(0, 200) + '...')
    
    // Détecter le séparateur (virgule, point-virgule, tabulation)
    const separators = [',', ';', '\t']
    let separator = ','
    let maxColumns = 0
    
    for (const sep of separators) {
      const firstLine = text.split('\n')[0]
      const columns = firstLine.split(sep).length
      if (columns > maxColumns) {
        maxColumns = columns
        separator = sep
      }
    }

    console.log('Séparateur détecté pour Excel:', separator, 'Colonnes:', maxColumns)

    // Parser le contenu ligne par ligne
    const lines = text.split('\n').filter(line => line.trim())
    if (lines.length < 2) {
      error('Le fichier Excel doit contenir au moins une ligne d\'en-tête et une ligne de données')
      return
    }

    const headers = lines[0].split(separator).map(h => h.trim().toLowerCase().replace(/"/g, '').replace(/'/g, ''))
    console.log('En-têtes Excel détectés:', headers)

    // Créer un mapping des colonnes
    const columnMap = createColumnMapping(headers)
    console.log('Mapping des colonnes Excel:', columnMap)

    const preview: Produit[] = []
    const errors: ImportError[] = []

    // Valider les en-têtes requis en utilisant le mapping
    const requiredFields = ['nom', 'prix_achat', 'prix_vente', 'quantite']
    const missingFields = requiredFields.filter(field => columnMap[field] === undefined)
    
    if (missingFields.length > 0) {
      errors.push({
        ligne: 1,
        champ: 'en-têtes',
        valeur: missingFields.join(', '),
        message: `En-têtes manquants: ${missingFields.join(', ')}`
      })
    }

    for (let i = 1; i < lines.length && i <= 100; i++) {
      const line = lines[i].trim()
      if (!line) continue

      try {
        const values = parseCSVLine(line, separator)
        console.log(`Ligne ${i + 1} parsée:`, values.slice(0, 5), '...')
        
        // Valider chaque champ
        const ligneErrors = validateProduitData(values, columnMap, i + 1)
        errors.push(...ligneErrors)
        
        if (ligneErrors.length === 0) {
          const produitImport = createProduitFromValues(values, columnMap, i)
          const produit = convertProduitImportToProduit(produitImport)
          preview.push(produit)
        }
        
      } catch (err) {
        errors.push({
          ligne: i + 1,
          champ: 'parsing',
          valeur: line.substring(0, 50) + '...',
          message: `Erreur de parsing: ${err instanceof Error ? err.message : 'Erreur inconnue'}`
        })
      }
    }

    // Afficher les erreurs détaillées
    if (errors.length > 0) {
      console.warn('Erreurs détectées dans Excel:', errors)
      importErrors.value = errors
      showErrorModal.value = true
      
      // Message résumé
      const errorCount = errors.length
      const successCount = preview.length
      error(`${errorCount} erreur(s) détectée(s) sur ${errorCount + successCount} lignes. ${successCount} produit(s) valide(s).`)
    } else {
      importPreview.value = preview
      console.log('✅ Excel parsing réussi, importPreview rempli:', preview.length, 'produits')
      success(`${preview.length} produit(s) parsés avec succès depuis Excel`)
    }

    console.log(`${preview.length} produits parsés avec succès depuis Excel`)

  } catch (err) {
    console.error('Erreur parsing Excel comme CSV:', err)
    error('Erreur lors du parsing du fichier Excel')
  }
}

// Fonction pour valider les données d'un produit
const validateProduitData = (values: string[], columnMap: any, ligne: number): ImportError[] => {
  const errors: ImportError[] = []
  
  // Vérifier le nom
  const nom = values[columnMap.nom] || ''
  if (!nom || nom.trim() === '') {
    errors.push({
      ligne,
      champ: 'nom',
      valeur: nom,
      message: 'Le nom du produit est requis'
    })
  }
  
  // Vérifier le prix d'achat
  const prixAchatStr = values[columnMap.prix_achat] || ''
  const prixAchat = parseFloat(prixAchatStr)
  if (isNaN(prixAchat) || prixAchat <= 0) {
    errors.push({
      ligne,
      champ: 'prix_achat',
      valeur: prixAchatStr,
      message: 'Le prix d\'achat doit être un nombre positif'
    })
  }
  
  // Vérifier le prix de vente
  const prixVenteStr = values[columnMap.prix_vente] || ''
  const prixVente = parseFloat(prixVenteStr)
  if (isNaN(prixVente) || prixVente <= 0) {
    errors.push({
      ligne,
      champ: 'prix_vente',
      valeur: prixVenteStr,
      message: 'Le prix de vente doit être un nombre positif'
    })
  }
  
  // Vérifier que le prix de vente > prix d'achat
  if (!isNaN(prixAchat) && !isNaN(prixVente) && prixVente <= prixAchat) {
    errors.push({
      ligne,
      champ: 'prix_vente',
      valeur: prixVenteStr,
      message: 'Le prix de vente doit être supérieur au prix d\'achat'
    })
  }
  
  // Vérifier la quantité
  const quantiteStr = values[columnMap.quantite] || '0'
  const quantite = parseInt(quantiteStr)
  if (isNaN(quantite) || quantite < 0) {
    errors.push({
      ligne,
      champ: 'quantite',
      valeur: quantiteStr,
      message: 'La quantité doit être un nombre positif ou zéro'
    })
  }
  
  return errors
}

// Fonction pour télécharger le rapport d'erreurs
const downloadErrorReport = () => {
  try {
    console.log('=== GÉNÉRATION RAPPORT D\'ERREURS ===')
    
    // Créer le contenu du rapport
    const reportContent = [
      'RAPPORT D\'ERREURS D\'IMPORTATION',
      '================================',
      `Date: ${new Date().toLocaleString('fr-FR')}`,
      `Total d'erreurs: ${importErrors.value.length}`,
      '',
      'DÉTAIL DES ERREURS:',
      '==================',
      ''
    ]
    
    // Grouper les erreurs par ligne
    const errorsByLine = importErrors.value.reduce((acc, error) => {
      if (!acc[error.ligne]) {
        acc[error.ligne] = []
      }
      acc[error.ligne].push(error)
      return acc
    }, {} as Record<number, ImportError[]>)
    
    // Ajouter chaque ligne d'erreur
    Object.keys(errorsByLine).sort((a, b) => parseInt(a) - parseInt(b)).forEach(ligne => {
      const errors = errorsByLine[parseInt(ligne)]
      reportContent.push(`LIGNE ${ligne}:`)
      errors.forEach(error => {
        reportContent.push(`  - Champ: ${error.champ}`)
        reportContent.push(`  - Valeur: "${error.valeur}"`)
        reportContent.push(`  - Erreur: ${error.message}`)
        reportContent.push('')
      })
    })
    
    // Ajouter les instructions
    reportContent.push('INSTRUCTIONS DE CORRECTION:')
    reportContent.push('=========================')
    reportContent.push('• Nom manquant: Ajoutez un nom pour chaque produit')
    reportContent.push('• Prix invalide: Utilisez des nombres positifs (ex: 100.50)')
    reportContent.push('• Prix de vente ≤ prix d\'achat: Le prix de vente doit être supérieur')
    reportContent.push('• Quantité invalide: Utilisez des nombres entiers positifs ou zéro')
    reportContent.push('• En-têtes manquants: Vérifiez que les colonnes requises sont présentes')
    
    // Créer et télécharger le fichier
    const content = reportContent.join('\n')
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0]
    const filename = `rapport_erreurs_importation_${timestamp}.txt`
    
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    
    // Nettoyer
    setTimeout(() => {
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    }, 100)
    
    success(`Rapport d'erreurs téléchargé: ${filename}`)
    console.log('=== RAPPORT GÉNÉRÉ AVEC SUCCÈS ===')
    
  } catch (err) {
    console.error('Erreur lors de la génération du rapport:', err)
    error('Erreur lors de la génération du rapport d\'erreurs')
  }
}

const parseTextFile = (file: File) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const text = e.target?.result as string
      if (!text) {
        error('Le fichier est vide')
        return
      }

      // Détecter le séparateur
      const separators = [',', ';', '\t']
      let separator = ','
      let maxColumns = 0
      
      for (const sep of separators) {
        const firstLine = text.split('\n')[0]
        const columns = firstLine.split(sep).length
        if (columns > maxColumns) {
          maxColumns = columns
          separator = sep
        }
      }

      console.log('Séparateur détecté:', separator)

      // Parser le CSV ligne par ligne
      const lines = text.split('\n').filter(line => line.trim())
      if (lines.length < 2) {
        error('Le fichier doit contenir au moins une ligne d\'en-tête et une ligne de données')
        return
      }

      const headers = lines[0].split(separator).map(h => h.trim().toLowerCase().replace(/"/g, '').replace(/'/g, ''))
      console.log('En-têtes détectés:', headers)

      // Créer un mapping des colonnes
      const columnMap = createColumnMapping(headers)
      console.log('Mapping des colonnes:', columnMap)

      const preview: Produit[] = []
      const errors: string[] = []

      for (let i = 1; i < lines.length && i <= 100; i++) {
        const line = lines[i].trim()
        if (!line) continue

        try {
          const values = parseCSVLine(line, separator)
          const produit = createProduitFromValues(values, columnMap, i)
          
          if (produit.nom && produit.prix_achat > 0 && produit.prix_vente > 0) {
            preview.push(produit)
          } else {
            errors.push(`Ligne ${i + 1}: Données manquantes ou invalides`)
          }
        } catch (err) {
          errors.push(`Ligne ${i + 1}: Erreur de parsing - ${err}`)
        }
      }

      if (errors.length > 0) {
        console.warn('Erreurs détectées:', errors)
        error(`${errors.length} erreur(s) détectée(s). Vérifiez les données.`)
      }

      importPreview.value = preview
      console.log('✅ Text/CSV parsing réussi, importPreview rempli:', preview.length, 'produits')
      console.log(`${preview.length} produits parsés avec succès`)

    } catch (err) {
      console.error('Erreur parsing fichier:', err)
      error('Erreur lors du parsing du fichier')
    }
  }
  
  reader.onerror = () => {
    error('Erreur lors de la lecture du fichier')
  }
  
  reader.readAsText(file, 'UTF-8')
}

// Fonction pour créer le mapping des colonnes
const createColumnMapping = (headers: string[]) => {
  const mapping: Record<string, number> = {}
  
  headers.forEach((header, index) => {
    const cleanHeader = header.toLowerCase().trim()
    
        // Mapping flexible des colonnes - Support français et anglais
        if (cleanHeader.includes('nom') || cleanHeader.includes('name') || cleanHeader.includes('produit') || cleanHeader.includes('libelle')) {
          mapping.nom = index
        } else if (cleanHeader === 'prix_achat' || cleanHeader.includes('prix d\'achat') || cleanHeader.includes('prix_achat') || cleanHeader.includes('prix d achat') || cleanHeader.includes('achat') || cleanHeader.includes('cost')) {
          mapping.prix_achat = index
        } else if (cleanHeader === 'prix_vente' || cleanHeader.includes('prix de vente') || cleanHeader.includes('prix_vente') || cleanHeader.includes('prix d vente') || cleanHeader.includes('vente') || cleanHeader.includes('price') || cleanHeader.includes('prix')) {
          mapping.prix_vente = index
        } else if (cleanHeader === 'quantite' || cleanHeader.includes('stock actuel') || cleanHeader.includes('quantite') || cleanHeader.includes('stock') || cleanHeader.includes('quantity')) {
          mapping.quantite = index
        } else if (cleanHeader.includes('référence') || cleanHeader.includes('reference') || cleanHeader.includes('ref') || cleanHeader.includes('sku')) {
          mapping.reference = index
        } else if (cleanHeader.includes('description') || cleanHeader.includes('desc')) {
          mapping.description = index
        } else if (cleanHeader.includes('catégorie') || cleanHeader.includes('categorie') || cleanHeader.includes('category') || cleanHeader.includes('type')) {
          mapping.categorie = index
        } else if (cleanHeader.includes('code-barre') || cleanHeader.includes('code_barre') || cleanHeader.includes('code barre') || cleanHeader.includes('barcode') || cleanHeader.includes('ean')) {
          mapping.code_barre = index
        } else if (cleanHeader.includes('unité') || cleanHeader.includes('unite') || cleanHeader.includes('unit') || cleanHeader.includes('uom')) {
          mapping.unite_mesure = index
        } else if (cleanHeader.includes('stock minimum') || cleanHeader.includes('stock_minimum') || cleanHeader.includes('seuil_min') || cleanHeader.includes('min_stock')) {
          mapping.stock_minimum = index
        } else if (cleanHeader.includes('stock maximum') || cleanHeader.includes('stock_maximum') || cleanHeader.includes('seuil_max') || cleanHeader.includes('max_stock')) {
          mapping.stock_maximum = index
        } else if (cleanHeader.includes('fournisseur') || cleanHeader.includes('supplier') || cleanHeader.includes('vendor')) {
          mapping.fournisseur_nom = index
        } else if (cleanHeader.includes('marque') || cleanHeader.includes('brand') || cleanHeader.includes('fabricant')) {
          mapping.marque = index
        } else if (cleanHeader.includes('modèle') || cleanHeader.includes('modele') || cleanHeader.includes('model') || cleanHeader.includes('version')) {
          mapping.modele = index
        } else if (cleanHeader.includes('état') || cleanHeader.includes('etat') || cleanHeader.includes('condition') || cleanHeader.includes('state')) {
          mapping.etat_produit = index
        } else if (cleanHeader.includes('devise') || cleanHeader.includes('currency') || cleanHeader.includes('monnaie')) {
          mapping.devise = index
        } else if (cleanHeader.includes('sku') || cleanHeader.includes('code_sku') || cleanHeader.includes('reference_interne')) {
          mapping.sku = index
        } else if (cleanHeader.includes('couleur') || cleanHeader.includes('color')) {
          mapping.couleur = index
        } else if (cleanHeader.includes('poids') || cleanHeader.includes('weight')) {
          mapping.poids = index
        } else if (cleanHeader.includes('dimensions') || cleanHeader.includes('size')) {
          mapping.dimensions = index
        } else if (cleanHeader.includes('garantie') || cleanHeader.includes('warranty')) {
          mapping.garantie = index
        } else if (cleanHeader.includes('localisation') || cleanHeader.includes('location')) {
          mapping.localisation = index
        } else if (cleanHeader.includes('tva') || cleanHeader.includes('tax')) {
          mapping.tva = index
        } else if (cleanHeader.includes('statut') || cleanHeader.includes('status')) {
          mapping.statut = index
        }
  })
  
  return mapping
}

// Fonction pour parser une ligne CSV en gérant les guillemets et apostrophes
const parseCSVLine = (line: string, separator: string): string[] => {
  const values: string[] = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = i + 1 < line.length ? line[i + 1] : null
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Guillemet échappé (doublé) - ajouter un seul guillemet
        current += '"'
        i++ // Passer le guillemet suivant
      } else {
        // Début ou fin de guillemets
        inQuotes = !inQuotes
      }
    } else if (char === separator && !inQuotes) {
      // Séparateur trouvé en dehors des guillemets
      values.push(current.trim())
      current = ''
    } else {
      // Caractère normal (y compris apostrophes)
      current += char
    }
  }
  
  // Ajouter la dernière valeur
  values.push(current.trim())
  
  // Nettoyer les valeurs (supprimer les guillemets de début/fin si présents)
  return values.map(value => {
    if (value.startsWith('"') && value.endsWith('"') && value.length > 1) {
      return value.slice(1, -1)
    }
    return value
  })
}

// Fonction utilitaire pour nettoyer les valeurs CSV
const cleanCSVValue = (value: string | undefined): string => {
  if (!value) return ''
  // Supprimer les guillemets en début/fin et nettoyer
  return value.replace(/^["']|["']$/g, '').trim()
}

// Fonction pour créer un produit à partir des valeurs
const createProduitFromValues = (values: string[], mapping: Record<string, number>, lineNumber: number): ProduitImport => {
  const produit: ProduitImport = {
    id: Date.now() + lineNumber,
    nom: '',
    prix_achat: '0',
    prix_vente: '0',
    quantite: '0',
    category: 'autre',
    created_at: new Date().toISOString().split('T')[0],
    devise: 'XAF',
    unite_mesure: 'piece',
    stock_minimum: 0,
    stock_maximum: 1000,
    etat_produit: 'neuf',
    actif: true
  }

  // Remplir les champs selon le mapping
  if (mapping.nom !== undefined) {
    produit.nom = cleanCSVValue(values[mapping.nom])
  }
  
  if (mapping.prix_achat !== undefined) {
    produit.prix_achat = cleanCSVValue(values[mapping.prix_achat])
  }
  
  if (mapping.prix_vente !== undefined) {
    produit.prix_vente = cleanCSVValue(values[mapping.prix_vente])
    produit.prix = produit.prix_vente // Compatibilité
  }
  
  if (mapping.quantite !== undefined) {
    produit.quantite = cleanCSVValue(values[mapping.quantite])
  }
  
  if (mapping.reference !== undefined) {
    produit.reference = cleanCSVValue(values[mapping.reference])
  }
  
  if (mapping.description !== undefined) {
    produit.description = cleanCSVValue(values[mapping.description])
  }
  
  if (mapping.categorie !== undefined) {
    const categoryValue = cleanCSVValue(values[mapping.categorie])
    // Si c'est un ID numérique, l'utiliser directement
    if (/^\d+$/.test(categoryValue)) {
      produit.categorie = parseInt(categoryValue)
      produit.category = categories.value.find(c => c.id === produit.categorie)?.nom || 'autre'
    } else {
      // Sinon, chercher par nom
      const categorie = categories.value.find(c => c.nom.toLowerCase() === categoryValue.toLowerCase())
      produit.categorie = categorie?.id || null
      produit.category = categorie?.nom || 'autre'
    }
  }
  
  if (mapping.code_barre !== undefined) {
    produit.code_barres = cleanCSVValue(values[mapping.code_barre])
  }
  
  if (mapping.unite_mesure !== undefined) {
    produit.unite_mesure = cleanCSVValue(values[mapping.unite_mesure]) || 'piece'
  }
  
  if (mapping.stock_minimum !== undefined) {
    produit.stock_minimum = parseInt(cleanCSVValue(values[mapping.stock_minimum])?.replace(/[^\d]/g, '')) || 0
  }
  
  if (mapping.stock_maximum !== undefined) {
    produit.stock_maximum = parseInt(cleanCSVValue(values[mapping.stock_maximum])?.replace(/[^\d]/g, '')) || 0
  }
  
  if (mapping.fournisseur_nom !== undefined) {
    const fournisseurValue = cleanCSVValue(values[mapping.fournisseur_nom])
    // Si c'est un ID numérique, l'utiliser directement
    if (/^\d+$/.test(fournisseurValue)) {
      produit.fournisseur_principal = parseInt(fournisseurValue)
      produit.fournisseur_nom = fournisseurs.value.find(f => f.id === produit.fournisseur_principal)?.nom || ''
    } else {
      // Sinon, chercher par nom
      const fournisseur = fournisseurs.value.find(f => f.nom.toLowerCase() === fournisseurValue.toLowerCase())
      produit.fournisseur_principal = fournisseur?.id || null
      produit.fournisseur_nom = fournisseur?.nom || ''
    }
  }

  if (mapping.marque !== undefined) {
    produit.marque = cleanCSVValue(values[mapping.marque])
  }

  if (mapping.modele !== undefined) {
    produit.modele = cleanCSVValue(values[mapping.modele])
  }

  if (mapping.etat_produit !== undefined) {
    produit.etat_produit = cleanCSVValue(values[mapping.etat_produit]) || 'neuf'
  }

  if (mapping.devise !== undefined) {
    produit.devise = cleanCSVValue(values[mapping.devise]) || 'XAF'
  }

  if (mapping.sku !== undefined) {
    produit.sku = cleanCSVValue(values[mapping.sku])
  }

  // Champs non disponibles dans le nouveau modèle
  // if (mapping.couleur !== undefined) {
  //   produit.couleur = values[mapping.couleur]?.replace(/"/g, '') || ''
  // }

  // if (mapping.poids !== undefined) {
  //   produit.poids = parseFloat(values[mapping.poids]?.replace(/[^\d.,]/g, '').replace(',', '.')) || 0
  // }

  // if (mapping.dimensions !== undefined) {
  //   produit.dimensions = values[mapping.dimensions]?.replace(/"/g, '') || ''
  // }

  // if (mapping.garantie !== undefined) {
  //   produit.garantie = values[mapping.garantie]?.replace(/"/g, '') || ''
  // }

  // if (mapping.localisation !== undefined) {
  //   produit.localisation = values[mapping.localisation]?.replace(/"/g, '') || ''
  // }

  // if (mapping.tva !== undefined) {
  //   produit.tva = parseFloat(values[mapping.tva]?.replace(/[^\d.,]/g, '').replace(',', '.')) || 0
  // }

  if (mapping.statut !== undefined) {
    produit.actif = values[mapping.statut]?.replace(/"/g, '').toLowerCase() === 'actif'
  }

  return produit
}

// Fonction pour convertir ProduitImport vers Produit
const convertProduitImportToProduit = (produitImport: ProduitImport): Produit => {
  return {
    ...produitImport,
    prix_achat: typeof produitImport.prix_achat === 'string' ? parseFloat(produitImport.prix_achat.replace(/[^\d.,]/g, '').replace(',', '.')) || 0 : produitImport.prix_achat,
    prix_vente: typeof produitImport.prix_vente === 'string' ? parseFloat(produitImport.prix_vente.replace(/[^\d.,]/g, '').replace(',', '.')) || 0 : produitImport.prix_vente,
    quantite: typeof produitImport.quantite === 'string' ? parseInt(produitImport.quantite.replace(/[^\d]/g, '')) || 0 : produitImport.quantite,
    prix: typeof produitImport.prix === 'string' ? parseFloat(produitImport.prix.replace(/[^\d.,]/g, '').replace(',', '.')) || 0 : (produitImport.prix || 0)
  }
}

// Fonction pour mapper les catégories
const mapCategory = (category: string): string => {
  const categoryMap: Record<string, string> = {
    'telephone': 'telephone',
    'phone': 'telephone',
    'smartphone': 'telephone',
    'mobile': 'telephone',
    'ordinateur': 'ordinateur',
    'computer': 'ordinateur',
    'laptop': 'ordinateur',
    'pc': 'ordinateur',
    'accessoire': 'accessoire',
    'accessory': 'accessoire',
    'accessories': 'accessoire',
    'autre': 'autre',
    'other': 'autre',
    'divers': 'autre'
  }
  
  return categoryMap[category.toLowerCase()] || 'autre'
}

const clearImportFile = () => {
  importFile.value = null
  importPreview.value = []
}

const processImport = async () => {
  console.log('=== PROCESS IMPORT DÉBUT ===')
  console.log('importFile.value:', importFile.value)
  console.log('importPreview.value.length:', importPreview.value.length)
  console.log('importPreview.value:', importPreview.value)
  
  // Vérifier l'authentification
  const token = process.client ? localStorage.getItem('access_token') : null
  const user = process.client ? localStorage.getItem('user') : null
  console.log('🔐 Token:', token ? 'Présent' : 'Manquant')
  console.log('👤 User:', user ? 'Présent' : 'Manquant')
  
  if (!token || !user) {
    console.log('❌ Import annulé: utilisateur non authentifié')
    error('Vous devez être connecté pour importer des produits')
    return
  }
  
  if (!importFile.value || importPreview.value.length === 0) {
    console.log('❌ Import annulé: fichier ou preview manquant')
    error('Aucun fichier ou données à importer')
    return
  }
  
  console.log('✅ Conditions OK, démarrage de l\'import...')
  importing.value = true
  
  try {
    console.log('=== IMPORT VIA API BACKEND ===')
    console.log(`${importPreview.value.length} produits à importer`)
    
    // Préparer les données pour l'API
    const produitsToImport = importPreview.value.map((item) => {
      // Convertir les chaînes en nombres pour l'API
      const prixAchat = parseFloat(String(item.prix_achat).replace(/[^\d.,]/g, '').replace(',', '.')) || 0
      const prixVente = parseFloat(String(item.prix_vente).replace(/[^\d.,]/g, '').replace(',', '.')) || 0
      const quantite = parseInt(String(item.quantite).replace(/[^\d]/g, '')) || 0
      
      return {
        nom: item.nom,
        reference: item.reference || '',
        description: item.description || '',
        prix_achat: prixAchat,
        prix_vente: prixVente,
        quantite: quantite,
        categorie: item.categorie,
        code_barres: item.code_barres || '',
        unite_mesure: item.unite_mesure || 'piece',
        stock_minimum: item.stock_minimum || 0,
        stock_maximum: item.stock_maximum || 1000,
        fournisseur_principal: item.fournisseur_principal,
        marque: item.marque || '',
        modele: item.modele || '',
        etat_produit: item.etat_produit || 'neuf',
        devise: item.devise || 'XAF',
        sku: item.sku || '',
        actif: true
      }
    })
    
    console.log('Données préparées:', produitsToImport.slice(0, 2))
    
    // Envoyer les données au backend avec authentification
    console.log('🚀 Envoi de la requête API...')
    console.log('URL complète:', `${API_BASE_URL}/api/produits/import_produits/`)
    console.log('Headers:', {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token.substring(0, 20)}...`
    })
    console.log('Body produits count:', produitsToImport.length)
    
    const response = await $fetch(`${API_BASE_URL}/api/produits/import_produits/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: {
        produits: produitsToImport
      }
    }) as { success: boolean; imported_count: number; error?: string }
    
    console.log('✅ Réponse API reçue:', response)
    
    if (response.success) {
      success(`${response.imported_count} produit(s) importé(s) avec succès!`)
      
      // Recharger la liste des produits
      await loadProduits()
      
      // Fermer le modal et réinitialiser
      showImportModal.value = false
      clearImportFile()
    } else {
      error(`Erreur lors de l'import: ${response.error || 'Erreur inconnue'}`)
    }
    
  } catch (err: any) {
    console.error('❌ ERREUR IMPORTATION COMPLÈTE:', err)
    console.error('Type erreur:', typeof err)
    console.error('Erreur data:', err.data)
    console.error('Erreur message:', err.message)
    console.error('Erreur status:', err.status)
    console.error('Erreur statusCode:', err.statusCode)
    console.error('Erreur response:', err.response)
    console.error('Erreur stack:', err.stack)
    
    // Afficher l'erreur détaillée
    let errorMessage = 'Erreur inconnue'
    
    if (err.data?.error) {
      errorMessage = err.data.error
    } else if (err.data?.message) {
      errorMessage = err.data.message
    } else if (err.message) {
      errorMessage = err.message
    } else if (typeof err === 'string') {
      errorMessage = err
    }
    
    // Si l'API n'est pas disponible, fallback sur l'import local
    if (err.status === 404 || err.status === 500 || err.statusCode === 404 || err.statusCode === 500) {
      console.log('API non disponible, import local...')
      
      // Ajouter les produits importés localement
      const nouveauxProduits: Produit[] = importPreview.value.map((item, index) => {
        const prixVente = parseFloat(String(item.prix_vente).replace(/[^\d.,]/g, '').replace(',', '.')) || 0
        return {
          ...item,
          id: Date.now() + index,
          prix: prixVente,
          prix_vente: prixVente
        }
      })
      
      produits.value.push(...nouveauxProduits)
      success(`${importPreview.value.length} produit(s) importé(s) localement!`)
      
      // Fermer le modal et réinitialiser
      showImportModal.value = false
      clearImportFile()
    } else {
      error(`Erreur lors de l'import: ${errorMessage}`)
    }
  } finally {
    importing.value = false
  }
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Fonctions utilitaires pour l'importation
const formatNumber = (num: number) => {
  return new Intl.NumberFormat('fr-FR').format(num)
}

const getStockClass = (stock: number) => {
  if (stock === 0) return 'text-red-600 font-semibold'
  if (stock <= 10) return 'text-orange-600 font-semibold'
  return 'text-green-600 font-semibold'
}

const getCategoryLabel = (category: string | number | undefined) => {
  if (!category) return 'Non défini'
  
  // Si c'est un ID numérique, chercher dans les catégories
  if (typeof category === 'number') {
    const categorie = categories.value.find(c => c.id === category)
    return categorie?.nom || 'Catégorie inconnue'
  }
  
  // Si c'est une chaîne, chercher par nom
  if (typeof category === 'string') {
    const categorie = categories.value.find(c => c.nom.toLowerCase() === category.toLowerCase())
    return categorie?.nom || category || 'Autre'
  }
  
  return 'Autre'
}

// Fonction pour afficher une confirmation
const showConfirmation = (message: string, action: () => void) => {
  confirmMessage.value = message
  confirmAction.value = action
  showConfirmModal.value = true
}

// Fonction pour confirmer l'action
const confirmActionHandler = () => {
  if (confirmAction.value) {
    confirmAction.value()
  }
  showConfirmModal.value = false
  confirmAction.value = null
  confirmMessage.value = ''
}

// Fonction pour annuler l'action
const cancelAction = () => {
  showConfirmModal.value = false
  confirmAction.value = null
  confirmMessage.value = ''
}

// Fonction pour obtenir la classe CSS de la marge
const getMargeClass = (marge: number) => {
  if (marge < 10) return 'text-red-600 font-semibold'
  if (marge < 25) return 'text-orange-600 font-semibold'
  if (marge < 50) return 'text-yellow-600 font-semibold'
  return 'text-green-600 font-semibold'
}

// Fonction pour obtenir le label de l'unité de mesure
const getUniteLabel = (unite: string) => {
  const labels: Record<string, string> = {
    'piece': 'pièce',
    'kg': 'kg',
    'g': 'g',
    'l': 'L',
    'ml': 'ml',
    'm': 'm',
    'cm': 'cm',
    'carton': 'carton',
    'paquet': 'paquet'
  }
  return labels[unite] || unite || 'pièce'
}

// Statistiques pour l'importation
const uniqueCategoriesInImport = computed(() => {
  const categories = new Set(importPreview.value.map(p => p.category))
  return categories.size
})

const totalStockInImport = computed(() => {
  return importPreview.value.reduce((total, produit) => total + (produit.quantite || 0), 0)
})

const totalValueInImport = computed(() => {
  return importPreview.value.reduce((total, produit) => total + ((produit.prix_vente || 0) * (produit.quantite || 0)), 0)
})

// Fonctions pour la génération de codes-barres et QR codes
const generateCodes = async (produit: Produit) => {
  try {
    // Récupérer l'ID de l'entreprise
    const entreprise = process.client ? localStorage.getItem('entreprise') : null
    let entrepriseId = null
    if (entreprise) {
      try {
        const entrepriseData = JSON.parse(entreprise)
        entrepriseId = entrepriseData.id
      } catch (e) {
        console.error('Erreur parsing entreprise:', e)
      }
    }

    // Message de confirmation avec popup
    showConfirmation(
      `Voulez-vous générer et télécharger les codes barre et QR code pour le produit "${produit.nom}" ?`,
      async () => {
        await generateAndDownloadProductCodes(produit, entrepriseId)
        success(`Codes générés et téléchargés pour ${produit.nom}`)
      }
    )
  } catch (error: any) {
    console.error('Erreur génération codes:', error)
    error('Erreur lors de la génération des codes: ' + error.message)
  }
}

const generateBulkCodes = async () => {
  try {
    const selectedProducts = produits.value.filter(p => selectedProductsForBulk.value.includes(p.id))

    if (selectedProducts.length === 0) {
      error('Aucun produit sélectionné')
      return
    }

    // Récupérer l'ID de l'entreprise
    const entreprise = process.client ? localStorage.getItem('entreprise') : null
    let entrepriseId = null
    if (entreprise) {
      try {
        const entrepriseData = JSON.parse(entreprise)
        entrepriseId = entrepriseData.id
      } catch (e) {
        console.error('Erreur parsing entreprise:', e)
      }
    }

            // Message de confirmation avec popup
            showConfirmation(
              `Voulez-vous générer et télécharger les codes barre et QR code pour ${selectedProducts.length} produit(s) sélectionné(s) dans un fichier ZIP ?`,
              async () => {
                generatingBulkCodes.value = true

                try {
                  const result = await generateBulkCodesUtil(selectedProducts, entrepriseId)

                  if (result.successCount > 0) {
                    success(`${result.successCount} codes générés avec succès et téléchargés dans ${result.zipFilename}`)
                  }

                  if (result.errorCount > 0) {
                    warning(`${result.errorCount} erreurs lors de la génération de certains codes`)
                  }

                  showBulkCodeModal.value = false
                } catch (error: any) {
                  console.error('Erreur génération en masse:', error)
                  error('Erreur lors de la génération en masse: ' + error.message)
                } finally {
                  generatingBulkCodes.value = false
                }
              }
            )

  } catch (error: any) {
    console.error('Erreur génération en masse:', error)
    error('Erreur lors de la génération en masse: ' + error.message)
  }
}

const openBulkCodeModal = () => {
  selectedProductsForBulk.value = []
  selectAllProducts.value = false
  showBulkCodeModal.value = true
}

const toggleAllProducts = () => {
  if (selectAllProducts.value) {
    selectedProductsForBulk.value = produits.value.map(p => p.id)
  } else {
    selectedProductsForBulk.value = []
  }
}

const generateCode = async () => {
  if (!selectedCodeProduit.value) return
  
  generatingCode.value = true
  
  try {
    // Déterminer le contenu du code
    let content = ''
    switch (codeOptions.value.content) {
      case 'reference':
        content = selectedCodeProduit.value.reference || selectedCodeProduit.value.id.toString()
        break
      case 'barcode':
        content = selectedCodeProduit.value.code_barres || selectedCodeProduit.value.id.toString()
        break
      case 'id':
        content = selectedCodeProduit.value.id.toString()
        break
      case 'url':
        content = `${window.location.origin}/produits/${selectedCodeProduit.value.id}`
        break
      case 'json':
        content = JSON.stringify({
          id: selectedCodeProduit.value.id,
          nom: selectedCodeProduit.value.nom,
          reference: selectedCodeProduit.value.reference,
          prix_vente: selectedCodeProduit.value.prix_vente,
          category: selectedCodeProduit.value.category
        })
        break
      default:
        content = selectedCodeProduit.value.reference || selectedCodeProduit.value.id.toString()
    }
    
    // Générer l'URL du QR code
    const codeUrl = generateCodeUrl(content, codeOptions.value)
    generatedCode.value = codeUrl
    
    // Télécharger automatiquement
    await downloadCode()
    
    success('QR Code généré et téléchargé avec succès!')
  } catch (err) {
    console.error('Erreur génération code:', err)
    error('Erreur lors de la génération du code')
  } finally {
    generatingCode.value = false
  }
}

const generateCodeUrl = (content: string, options: any): string => {
  const { type, format, width, height, includeText, includeProductName, includePrice } = options
  
  // Déterminer la taille selon le type de QR code
  let qrSize = `${width}x${height}`
  
  switch (type) {
    case 'qr_small':
      qrSize = '200x200'
      break
    case 'qr_large':
      qrSize = '500x500'
      break
    case 'qr_custom':
      qrSize = `${width}x${height}`
      break
    default:
      qrSize = '300x300'
  }
  
  // Construire le contenu enrichi du QR code
  let qrContent = content
  
  // Ajouter des informations supplémentaires si demandées
  if (includeProductName && selectedCodeProduit.value) {
    const productInfo = `${selectedCodeProduit.value.nom}`
    if (includePrice) {
      const price = `${selectedCodeProduit.value.prix_vente} XAF`
      qrContent = `${content}\n${productInfo}\n${price}`
    } else {
      qrContent = `${content}\n${productInfo}`
    }
  }
  
  // Ajouter le texte sous le code si demandé
  if (includeText) {
    qrContent += `\n${content}`
  }
  
  // Générer l'URL du QR code
  const baseUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}&data=${encodeURIComponent(qrContent)}&format=${format}&bgcolor=255-255-255&color=0-0-0&margin=10&ecc=L`
  
  return baseUrl
}

const downloadCode = () => {
  if (!generatedCode.value || !selectedCodeProduit.value) return
  
  const link = document.createElement('a')
  link.href = generatedCode.value
  link.download = `${selectedCodeProduit.value.nom}_${codeOptions.value.type}.${codeOptions.value.format}`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  success('Code téléchargé avec succès!')
}

const generateBulkCodesAction = async () => {
  if (selectedProductsForBulk.value.length === 0) return
  
  generatingBulkCodes.value = true
  
  try {
    const selectedProducts = produits.value.filter(p => selectedProductsForBulk.value.includes(p.id))
    const codes: { product: Produit, url: string }[] = []
    
      // Générer les codes pour chaque produit sélectionné
      for (const produit of selectedProducts) {
        let content = ''
        switch (codeOptions.value.content) {
          case 'reference':
            content = produit.reference || produit.id.toString()
            break
      case 'barcode':
        content = produit.code_barres || produit.id.toString()
        break
          case 'id':
            content = produit.id.toString()
            break
          case 'url':
            content = `${window.location.origin}/produits/${produit.id}`
            break
          case 'json':
            content = JSON.stringify({
              id: produit.id,
              nom: produit.nom,
              reference: produit.reference,
              prix_vente: produit.prix_vente,
              category: produit.category
            })
            break
          default:
            content = produit.reference || produit.id.toString()
        }
      
      const codeUrl = generateCodeUrl(content, bulkCodeOptions.value)
      codes.push({ product: produit, url: codeUrl })
    }
    
    // Télécharger automatiquement tous les codes
    await downloadBulkCodesAsZip(codes)
    
    success(`${codes.length} code(s) généré(s) avec succès!`)
    showBulkCodeModal.value = false
    
  } catch (err) {
    console.error('Erreur génération codes en masse:', err)
    error('Erreur lors de la génération des codes')
  } finally {
    generatingBulkCodes.value = false
  }
}

const downloadBulkCodesAsZip = async (codes: { product: Produit, url: string }[]) => {
  // Pour une implémentation complète, il faudrait utiliser une bibliothèque comme JSZip
  // Pour l'instant, on télécharge les fichiers individuellement avec un délai
  success('Téléchargement des codes en cours...')
  
  for (let i = 0; i < codes.length; i++) {
    setTimeout(() => {
      const code = codes[i]
      const link = document.createElement('a')
      link.href = code.url
      link.download = `${code.product.nom}_${bulkCodeOptions.value.type}.${bulkCodeOptions.value.format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }, i * 200) // Délai de 200ms entre chaque téléchargement
  }
}

// Fonctions pour les filtres
const clearFilters = () => {
  searchQuery.value = ''
  filters.value = {
    category: '',
    priceRange: '',
    stockStatus: '',
    nameFilterType: '',
    nameFilterValue: '',
    reference: '',
    marque: '',
    priceMin: '',
    priceMax: '',
    stockMin: '',
    stockMax: ''
  }
  sortBy.value = ''
  currentPage.value = 1
}

const handleExport = () => {
  showExportModal.value = true
}

const exportToCSV = () => {
  // Fonction pour échapper les caractères spéciaux dans CSV
  const escapeCSVField = (field: any) => {
    if (field === null || field === undefined) return ''
    const str = String(field)
    // Échapper les guillemets doubles en les doublant
    const escaped = str.replace(/"/g, '""')
    // Entourer de guillemets si nécessaire
    if (escaped.includes(',') || escaped.includes('"') || escaped.includes('\n') || escaped.includes('\r')) {
      return `"${escaped}"`
    }
    return escaped
  }

    // Créer un CSV avec les en-têtes simples pour éviter les problèmes de reconnaissance
    const csvContent = `nom,prix_achat,prix_vente,quantite,reference,description,categorie,code_barre,unite,fournisseur,marque,modele,etat,devise,sku
${produits.value.map((p: Produit) => [
      escapeCSVField(p.nom),
      escapeCSVField(p.prix_achat),
      escapeCSVField(p.prix_vente),
      escapeCSVField(p.quantite),
      escapeCSVField(p.reference),
      escapeCSVField(p.description),
      escapeCSVField(p.categorie_nom),
      escapeCSVField(p.code_barres),
      escapeCSVField(p.unite_mesure),
      escapeCSVField(p.fournisseur_nom),
      escapeCSVField(p.marque),
      escapeCSVField(p.modele),
      escapeCSVField(p.etat_produit || 'actif'),
      escapeCSVField(p.devise || 'XAF'),
      escapeCSVField(p.sku)
    ].join(',')).join('\n')}`
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `produits_export_${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
  
  success('Export CSV réussi! Le fichier a été téléchargé.')
  showExportModal.value = false
}

// Fonction d'export Excel améliorée avec gestion d'erreurs
// Fonction de test pour la génération Excel avec SheetJS
const testExcelGeneration = () => {
  console.log('=== TEST GÉNÉRATION EXCEL AVEC SHEETJS ===')
  
  // Créer des données de test
  const testProduits: Produit[] = [
    {
      id: 1,
      nom: 'iPhone 15 Pro',
      reference: 'IPH15P-256',
      description: 'Smartphone Apple iPhone 15 Pro 256GB',
      prix_achat: 450000,
      prix_vente: 550000,
      prix: 550000,
      quantite: 25,
      category: 'telephones',
      categorie_nom: 'Téléphones',
      categorie: 1,
      entreprise_nom: 'Tech Store',
      entrepot_nom: 'Entrepôt Principal',
      code_barres: '1234567890123',
      unite_mesure: 'piece',
      stock_minimum: 5,
      stock_maximum: 50,
      fournisseur_principal: 1,
      fournisseur_nom: 'Apple Inc.',
      marque: 'Apple',
      modele: 'iPhone 15 Pro',
      etat_produit: 'neuf',
      devise: 'XAF',
      sku: 'IPH15P-256-001',
      actif: true,
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-20T14:45:00Z'
    },
    {
      id: 2,
      nom: 'MacBook Pro M3',
      reference: 'MBP-M3-512',
      description: 'Ordinateur portable Apple MacBook Pro M3 512GB',
      prix_achat: 1200000,
      prix_vente: 1450000,
      prix: 1450000,
      quantite: 8,
      category: 'ordinateurs',
      categorie_nom: 'Ordinateurs',
      categorie: 2,
      entreprise_nom: 'Tech Store',
      entrepot_nom: 'Entrepôt Principal',
      code_barres: '2345678901234',
      unite_mesure: 'piece',
      stock_minimum: 2,
      stock_maximum: 20,
      fournisseur_principal: 1,
      fournisseur_nom: 'Apple Inc.',
      marque: 'Apple',
      modele: 'MacBook Pro M3',
      etat_produit: 'neuf',
      devise: 'XAF',
      sku: 'MBP-M3-512-001',
      actif: true,
      created_at: '2024-01-10T09:15:00Z',
      updated_at: '2024-01-18T16:20:00Z'
    },
    {
      id: 3,
      nom: 'AirPods Pro 2',
      reference: 'APP2-001',
      description: 'Écouteurs sans fil Apple AirPods Pro 2ème génération',
      prix_achat: 180000,
      prix_vente: 220000,
      prix: 220000,
      quantite: 45,
      category: 'accessoires',
      categorie_nom: 'Accessoires',
      categorie: 3,
      entreprise_nom: 'Tech Store',
      entrepot_nom: 'Entrepôt Principal',
      code_barres: '3456789012345',
      unite_mesure: 'piece',
      stock_minimum: 10,
      stock_maximum: 100,
      fournisseur_principal: 1,
      fournisseur_nom: 'Apple Inc.',
      marque: 'Apple',
      modele: 'AirPods Pro 2',
      etat_produit: 'neuf',
      devise: 'XAF',
      sku: 'APP2-001-001',
      actif: true,
      created_at: '2024-01-05T11:00:00Z',
      updated_at: '2024-01-22T13:30:00Z'
    }
  ]
  
  console.log('Données de test créées:', testProduits.length, 'produits')
  
  try {
    // Importer SheetJS dynamiquement
    import('xlsx').then((XLSX) => {
      // Préparer les données avec en-têtes simples pour éviter les problèmes de reconnaissance
      const headers = [
        'nom', 'prix_achat', 'prix_vente', 'quantite', 'reference', 'description', 'categorie', 'code_barre', 'unite', 'fournisseur', 'marque', 'modele', 'etat', 'devise', 'sku'
      ]
      
      // Préparer les données avec validation
      const data = testProduits.map((p: any) => {
        // Validation et nettoyage des données
        const prixAchat = typeof p.prix_achat === 'number' && p.prix_achat > 0 ? p.prix_achat : 0
        const prixVente = typeof p.prix_vente === 'number' && p.prix_vente > 0 ? p.prix_vente : 0
        const quantite = typeof p.quantite === 'number' && p.quantite >= 0 ? p.quantite : 0
        
        // S'assurer que le prix de vente > prix d'achat
        const prixVenteFinal = prixVente > prixAchat ? prixVente : prixAchat + 1
        
        return [
          p.nom || '',
          prixAchat,
          prixVenteFinal,
          quantite,
          p.reference || '',
          p.description || '',
          p.categorie_nom || p.category || 'autre',
          p.code_barres || '',
          p.unite_mesure || 'piece',
          p.fournisseur_nom || '',
          p.marque || '',
          p.modele || '',
          p.etat_produit || 'actif',
          p.devise || 'XAF',
          p.sku || ''
        ]
      })
      
      console.log('Données préparées:', data.length, 'lignes')
      
      // Créer le workbook
      const wb = XLSX.utils.book_new()
      
      // Créer la feuille de calcul
      const ws_data = [headers, ...data]
      const ws = XLSX.utils.aoa_to_sheet(ws_data)
      
      // Appliquer des styles et formatage
      const range = XLSX.utils.decode_range(ws['!ref'] || 'A1')
      
      // Formatage des en-têtes
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col })
        if (!ws[cellAddress]) continue
        
        ws[cellAddress].s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "4472C4" } },
          alignment: { horizontal: "center", vertical: "center" },
          border: {
            top: { style: "thin", color: { rgb: "FFFFFF" } },
            bottom: { style: "thin", color: { rgb: "FFFFFF" } },
            left: { style: "thin", color: { rgb: "FFFFFF" } },
            right: { style: "thin", color: { rgb: "FFFFFF" } }
          }
        }
      }
      
      // Formatage des colonnes de prix
      const prixCols = [4, 5] // Prix d'achat et prix de vente
      prixCols.forEach(col => {
        for (let row = 1; row <= range.e.r; row++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
          if (ws[cellAddress]) {
            ws[cellAddress].z = '#,##0.00'
          }
        }
      })
      
      // Définir les largeurs de colonnes
      const colWidths = [
        { wch: 8 },   // ID
        { wch: 25 },  // nom
        { wch: 15 },  // reference
        { wch: 40 },  // description
        { wch: 12 },  // prix_achat
        { wch: 12 },  // prix_vente
        { wch: 10 },  // quantite
        { wch: 15 },  // categorie
        { wch: 10 },  // categorie_id
        { wch: 20 },  // entreprise
        { wch: 20 },  // entrepot
        { wch: 15 },  // code_barres
        { wch: 8 },   // unite_mesure
        { wch: 10 },  // stock_minimum
        { wch: 10 },  // stock_maximum
        { wch: 10 },  // fournisseur_principal
        { wch: 20 },  // fournisseur_nom
        { wch: 15 },  // marque
        { wch: 15 },  // modele
        { wch: 10 },  // etat_produit
        { wch: 8 },   // devise
        { wch: 20 },  // sku
        { wch: 12 },  // created_at
        { wch: 12 }   // updated_at
      ]
      ws['!cols'] = colWidths
      
      // Ajouter la feuille au workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Test Produits')
      
      // Générer le fichier Excel
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0]
      const filename = `test_export_produits_${timestamp}.xlsx`
      
      console.log('Génération du fichier de test:', filename)
      
      // Télécharger le fichier
      XLSX.writeFile(wb, filename)
      
      success(`Test Excel réussi! ${data.length} produit(s) exporté(s) dans le fichier ${filename}`)
      console.log('=== TEST TERMINÉ AVEC SUCCÈS ===')
      
    }).catch((err) => {
      console.error('Erreur lors du chargement de SheetJS:', err)
      error('Erreur lors du chargement de la bibliothèque Excel')
    })
    
  } catch (err: any) {
    console.error('Erreur lors du test Excel:', err)
    error('Erreur lors du test Excel: ' + (err.message || 'Erreur inconnue'))
  }
}

// Exposer la fonction de test globalement pour les tests
if (process.client) {
  (window as any).testExcelGeneration = testExcelGeneration
}

// Fonction d'export Excel améliorée avec SheetJS
const exportToExcel = () => {
  try {
    if (!produits.value || produits.value.length === 0) {
      error('Aucun produit à exporter')
      return
    }
    
    console.log('=== EXPORT EXCEL AVEC SHEETJS ===')
    console.log(`Export de ${produits.value.length} produits`)
    
    // Importer SheetJS dynamiquement
    import('xlsx').then((XLSX) => {
      // Préparer les données avec en-têtes simples pour éviter les problèmes de reconnaissance
      const headers = [
        'nom', 'prix_achat', 'prix_vente', 'quantite', 'reference', 'description', 'categorie', 'code_barre', 'unite', 'fournisseur', 'marque', 'modele', 'etat', 'devise', 'sku'
      ]
      
      // Préparer les données avec validation
      const data = produits.value.map((p: Produit) => {
        // Validation et nettoyage des données
        const prixAchat = typeof p.prix_achat === 'number' && p.prix_achat > 0 ? p.prix_achat : 0
        const prixVente = typeof p.prix_vente === 'number' && p.prix_vente > 0 ? p.prix_vente : 0
        const quantite = typeof p.quantite === 'number' && p.quantite >= 0 ? p.quantite : 0
        
        // S'assurer que le prix de vente > prix d'achat
        const prixVenteFinal = prixVente > prixAchat ? prixVente : prixAchat + 1
        
        return [
          p.nom || '',
          prixAchat,
          prixVenteFinal,
          quantite,
          p.reference || '',
          p.description || '',
          p.categorie_nom || p.category || 'autre',
          p.code_barres || '',
          p.unite_mesure || 'piece',
          p.fournisseur_nom || '',
          p.marque || '',
          p.modele || '',
          p.etat_produit || 'actif',
          p.devise || 'XAF',
          p.sku || ''
        ]
      })
      
      console.log('Données préparées:', data.length, 'lignes')
      
      // Créer le workbook
      const wb = XLSX.utils.book_new()
      
      // Créer la feuille de calcul
      const ws_data = [headers, ...data]
      const ws = XLSX.utils.aoa_to_sheet(ws_data)
      
      // Appliquer des styles et formatage
      const range = XLSX.utils.decode_range(ws['!ref'] || 'A1')
      
      // Formatage des en-têtes
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col })
        if (!ws[cellAddress]) continue
        
        ws[cellAddress].s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "4472C4" } },
          alignment: { horizontal: "center", vertical: "center" },
          border: {
            top: { style: "thin", color: { rgb: "FFFFFF" } },
            bottom: { style: "thin", color: { rgb: "FFFFFF" } },
            left: { style: "thin", color: { rgb: "FFFFFF" } },
            right: { style: "thin", color: { rgb: "FFFFFF" } }
          }
        }
      }
      
      // Formatage des colonnes de prix
      const prixCols = [4, 5] // Prix d'achat et prix de vente
      prixCols.forEach(col => {
        for (let row = 1; row <= range.e.r; row++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
          if (ws[cellAddress]) {
            ws[cellAddress].z = '#,##0.00'
          }
        }
      })
      
      // Définir les largeurs de colonnes
      const colWidths = [
        { wch: 8 },   // ID
        { wch: 25 },  // nom
        { wch: 15 },  // reference
        { wch: 40 },  // description
        { wch: 12 },  // prix_achat
        { wch: 12 },  // prix_vente
        { wch: 10 },  // quantite
        { wch: 15 },  // categorie
        { wch: 10 },  // categorie_id
        { wch: 20 },  // entreprise
        { wch: 20 },  // entrepot
        { wch: 15 },  // code_barres
        { wch: 8 },   // unite_mesure
        { wch: 10 },  // stock_minimum
        { wch: 10 },  // stock_maximum
        { wch: 10 },  // fournisseur_principal
        { wch: 20 },  // fournisseur_nom
        { wch: 15 },  // marque
        { wch: 15 },  // modele
        { wch: 10 },  // etat_produit
        { wch: 8 },   // devise
        { wch: 20 },  // sku
        { wch: 12 },  // created_at
        { wch: 12 }   // updated_at
      ]
      ws['!cols'] = colWidths
      
      // Ajouter la feuille au workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Produits')
      
      // Générer le fichier Excel
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0]
      const filename = `export_produits_${timestamp}.xlsx`
      
      console.log('Génération du fichier:', filename)
      
      // Télécharger le fichier
      XLSX.writeFile(wb, filename)
      
      success(`Export Excel réussi! ${data.length} produit(s) exporté(s) dans le fichier ${filename}`)
      showExportModal.value = false
      
      console.log('=== EXPORT TERMINÉ AVEC SUCCÈS ===')
      
    }).catch((err) => {
      console.error('Erreur lors du chargement de SheetJS:', err)
      error('Erreur lors du chargement de la bibliothèque Excel')
    })
    
  } catch (err: any) {
    console.error('Erreur lors de l\'export Excel:', err)
    error('Erreur lors de l\'export Excel: ' + (err.message || 'Erreur inconnue'))
  }
}

// Fonction pour créer un fichier Excel XML valide et amélioré
const createExcelXML = (headers: string[], data: any[][]) => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
xmlns:o="urn:schemas-microsoft-com:office:office"
xmlns:x="urn:schemas-microsoft-com:office:excel"
xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
xmlns:html="http://www.w3.org/TR/REC-html40">
<DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
 <Title>Export des Produits - ${new Date().toLocaleDateString('fr-FR')}</Title>
 <Author>Système de Gestion des Produits</Author>
 <Created>${new Date().toISOString()}</Created>
 <LastSaved>${new Date().toISOString()}</LastSaved>
 <Company>Walner Durel</Company>
 <Version>1.0</Version>
</DocumentProperties>
<OfficeDocumentSettings xmlns="urn:schemas-microsoft-com:office:office">
 <AllowPNG/>
 <RemovePersonalInformation/>
</OfficeDocumentSettings>
<ExcelWorkbook xmlns="urn:schemas-microsoft-com:office:excel">
 <WindowHeight>12000</WindowHeight>
 <WindowWidth>18000</WindowWidth>
 <WindowTopX>0</WindowTopX>
 <WindowTopY>0</WindowTopY>
 <ProtectStructure>False</ProtectStructure>
 <ProtectWindows>False</ProtectWindows>
</ExcelWorkbook>
<Styles>
 <Style ss:ID="Default" ss:Name="Normal">
  <Alignment ss:Vertical="Bottom"/>
  <Borders/>
  <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#000000"/>
  <Interior/>
  <NumberFormat/>
  <Protection/>
 </Style>
 <Style ss:ID="Header">
  <Font ss:Bold="1" ss:Size="12" ss:Color="#FFFFFF"/>
  <Interior ss:Color="#4472C4" ss:Pattern="Solid"/>
  <Borders>
   <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FFFFFF"/>
   <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FFFFFF"/>
   <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FFFFFF"/>
   <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FFFFFF"/>
  </Borders>
  <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
 </Style>
 <Style ss:ID="Data">
  <Borders>
   <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D9D9D9"/>
   <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D9D9D9"/>
   <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D9D9D9"/>
   <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D9D9D9"/>
  </Borders>
  <Alignment ss:Vertical="Center"/>
 </Style>
 <Style ss:ID="Number">
  <NumberFormat ss:Format="0.00"/>
  <Borders>
   <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D9D9D9"/>
   <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D9D9D9"/>
   <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D9D9D9"/>
   <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D9D9D9"/>
  </Borders>
  <Alignment ss:Vertical="Center" ss:Horizontal="Right"/>
 </Style>
 <Style ss:ID="Date">
  <NumberFormat ss:Format="dd/mm/yyyy"/>
  <Borders>
   <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D9D9D9"/>
   <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D9D9D9"/>
   <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D9D9D9"/>
   <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D9D9D9"/>
  </Borders>
  <Alignment ss:Vertical="Center"/>
 </Style>
</Styles>
<Worksheet ss:Name="Produits">
 <Table ss:ExpandedColumnCount="${headers.length}" ss:ExpandedRowCount="${data.length + 1}" x:FullColumns="1" x:FullRows="1">
  <Column ss:Index="1" ss:Width="60"/>
  <Column ss:Index="2" ss:Width="200"/>
  <Column ss:Index="3" ss:Width="120"/>
  <Column ss:Index="4" ss:Width="300"/>
  <Column ss:Index="5" ss:Width="100"/>
  <Column ss:Index="6" ss:Width="100"/>
  <Column ss:Index="7" ss:Width="80"/>
  <Column ss:Index="8" ss:Width="120"/>
  <Column ss:Index="9" ss:Width="80"/>
  <Column ss:Index="10" ss:Width="150"/>
  <Column ss:Index="11" ss:Width="150"/>
  <Column ss:Index="12" ss:Width="120"/>
  <Column ss:Index="13" ss:Width="80"/>
  <Column ss:Index="14" ss:Width="80"/>
  <Column ss:Index="15" ss:Width="80"/>
  <Column ss:Index="16" ss:Width="80"/>
  <Column ss:Index="17" ss:Width="120"/>
  <Column ss:Index="18" ss:Width="120"/>
  <Column ss:Index="19" ss:Width="80"/>
  <Column ss:Index="20" ss:Width="80"/>
  <Column ss:Index="21" ss:Width="80"/>
  <Column ss:Index="22" ss:Width="100"/>
  <Column ss:Index="23" ss:Width="120"/>
  <Row ss:StyleID="Header">
   ${headers.map((header, index) => `<Cell ss:Index="${index + 1}" ss:StyleID="Header"><Data ss:Type="String">${escapeXml(header)}</Data></Cell>`).join('')}
  </Row>
   ${data.map((row, rowIndex) => `
   <Row ss:Index="${rowIndex + 2}">
    ${row.map((cell, cellIndex) => {
      const cellType = typeof cell === 'number' ? 'Number' : 'String'
      const styleId = typeof cell === 'number' ? 'Number' : 'Data'
      return `<Cell ss:Index="${cellIndex + 1}" ss:StyleID="${styleId}"><Data ss:Type="${cellType}">${escapeXml(cell.toString())}</Data></Cell>`
    }).join('')}
   </Row>`).join('')}
 </Table>
 <AutoFilter x:Range="A1:${String.fromCharCode(65 + headers.length - 1)}${data.length + 1}" xmlns="urn:schemas-microsoft-com:office:excel"/>
</Worksheet>
</Workbook>`
  
  return xml
}

// Fonction pour échapper les caractères XML
const escapeXml = (text: string) => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

// Fonction de test pour vérifier le chargement des données
const testDataLoading = async () => {
  console.log('=== TEST CHARGEMENT DONNÉES ===')
  
  // Vérifier les données dans localStorage
  const token = process.client ? localStorage.getItem('access_token') : null
  const user = process.client ? localStorage.getItem('user') : null
  const entreprise = process.client ? localStorage.getItem('entreprise') : null
  const boutique = process.client ? localStorage.getItem('boutique') : null
  
  console.log('Données localStorage:', {
    token: token ? 'Présent' : 'Absent',
    user: user ? 'Présent' : 'Absent',
    entreprise: entreprise ? 'Présent' : 'Absent',
    boutique: boutique ? 'Présent' : 'Absent'
  })
  
  if (user) {
    try {
      const userData = JSON.parse(user)
      console.log('Données utilisateur:', userData)
    } catch (e) {
      console.error('Erreur parsing user:', e)
    }
  }
  
  if (entreprise) {
    try {
      const entrepriseData = JSON.parse(entreprise)
      console.log('Données entreprise:', entrepriseData)
    } catch (e) {
      console.error('Erreur parsing entreprise:', e)
    }
  }
  
  if (boutique) {
    try {
      const boutiqueData = JSON.parse(boutique)
      console.log('Données boutique:', boutiqueData)
    } catch (e) {
      console.error('Erreur parsing boutique:', e)
    }
  }
  
  // Tester le chargement des données
  await loadData()
  
  console.log('=== FIN TEST ===')
}

// Fonction de test pour vérifier la création
const testCreation = async () => {
  console.log('=== TEST DE CRÉATION ===')
  console.log('Entreprises disponibles:', entreprises.value)
  console.log('Catégories disponibles:', categories.value)
  console.log('Fournisseurs disponibles:', fournisseurs.value)
  
  if (entreprises.value.length === 0) {
    console.error('Aucune entreprise trouvée!')
    return
  }
  
  const entrepriseId = entreprises.value[0].id
  console.log('ID de l\'entreprise utilisée:', entrepriseId)
  
  // Test de création d'une catégorie
  const testCategorie = {
    nom: `Test Catégorie ${Date.now()}`,
    description: 'Catégorie de test',
    icone: 'i-heroicons-tag',
    couleur: '#FF5733',
    parent: null,
    entreprise: entrepriseId,
    actif: true
  }
  
  console.log('Données de test pour catégorie:', testCategorie)
  
  try {
    const token = process.client ? localStorage.getItem('access_token') : null
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    const response = await $fetch(`${API_BASE_URL}/api/categories/`, {
      method: 'POST',
      headers,
      body: testCategorie
    })
    
    console.log('✅ Catégorie créée avec succès:', response)
    success('Test de création de catégorie réussi!')
  } catch (err: any) {
    console.error('❌ Erreur lors du test de création:', err)
    console.error('Détails:', err.data)
    error('Test de création échoué: ' + (err.data?.message || err.message))
  }
}

// Charger les données au montage
onMounted(() => {
  loadData()
})
</script>
