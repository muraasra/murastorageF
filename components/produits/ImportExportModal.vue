<script setup lang="ts">
import { ref } from 'vue'
import { useApi } from '@/stores/useApi'
import { useNotification } from '~/types/useNotification'

const { success, error } = useNotification()

const props = defineProps<{
  isOpen: boolean
  mode: 'import' | 'export'
}>()

const emit = defineEmits(['close', 'completed'])

const loading = ref(false)
const selectedFile = ref(null)
const exportFormat = ref('excel')
const includeImages = ref(false)

// Options d'export
const exportOptions = ref({
  format: 'excel',
  includeImages: false,
  includeStock: true,
  includePrices: true,
  includeCategories: true,
  includeSuppliers: true,
  dateRange: 'all'
})

// Template d'import
const downloadTemplate = () => {
  // Créer un fichier Excel template
  const templateData = [
    ['Nom', 'SKU', 'Description', 'Code-barres', 'Prix d\'achat', 'Prix de vente', 'Catégorie', 'Fournisseur', 'Stock minimum', 'Stock maximum', 'Unité de mesure', 'Poids', 'Volume', 'Couleur', 'Taille', 'Variante', 'Tags (séparés par virgule)'],
    ['Exemple Produit', 'PRD-001', 'Description du produit', '1234567890123', '1000', '1500', 'Électronique', 'Fournisseur A', '10', '100', 'pièce', '0.5', '0.001', 'Rouge', 'M', 'Standard', 'tag1, tag2, tag3']
  ]
  
  // Convertir en CSV
  const csvContent = templateData.map(row => row.join(',')).join('\n')
  
  // Créer et télécharger le fichier
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', 'template_produits.csv')
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  success('Template téléchargé avec succès')
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0]
  }
}

const importProduits = async () => {
  if (!selectedFile.value) {
    error('Veuillez sélectionner un fichier')
    return
  }
  
  loading.value = true
  
  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value)
    
    const { data, error: apiError } = await useApi('http://127.0.0.1:8000/api/produits/import/', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    
    if (!apiError.value && data.value) {
      success(`Import réussi: ${data.value.imported} produits importés, ${data.value.errors} erreurs`)
      emit('completed', data.value)
      emit('close')
    } else {
      error(`Erreur lors de l'import: ${apiError.value?.message}`)
    }
  } catch (err) {
    console.error('Erreur import:', err)
    error('Une erreur est survenue lors de l\'import')
  } finally {
    loading.value = false
  }
}

const exportProduits = async () => {
  loading.value = true
  
  try {
    const userData = JSON.parse(localStorage.getItem('user') || '{}')
    const entrepriseData = JSON.parse(localStorage.getItem('entreprise') || '{}')
    
    const params = new URLSearchParams({
      entreprise: entrepriseData.id,
      format: exportOptions.value.format,
      include_images: exportOptions.value.includeImages.toString(),
      include_stock: exportOptions.value.includeStock.toString(),
      include_prices: exportOptions.value.includePrices.toString(),
      include_categories: exportOptions.value.includeCategories.toString(),
      include_suppliers: exportOptions.value.includeSuppliers.toString(),
      date_range: exportOptions.value.dateRange
    })
    
    const { data, error: apiError } = await useApi(`http://127.0.0.1:8000/api/produits/export/?${params}`)
    
    if (!apiError.value && data.value) {
      // Créer et télécharger le fichier
      const blob = new Blob([data.value], { 
        type: exportOptions.value.format === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'text/csv'
      })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `produits_export_${new Date().toISOString().split('T')[0]}.${exportOptions.value.format === 'excel' ? 'xlsx' : 'csv'}`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      success('Export réussi')
      emit('completed')
      emit('close')
    } else {
      error(`Erreur lors de l'export: ${apiError.value?.message}`)
    }
  } catch (err) {
    console.error('Erreur export:', err)
    error('Une erreur est survenue lors de l\'export')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UModal :model-value="isOpen" @update:model-value="emit('close')">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">
            {{ mode === 'import' ? 'Importer des produits' : 'Exporter des produits' }}
          </h3>
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-x-mark-20-solid"
            @click="emit('close')"
          />
        </div>
      </template>

      <div class="space-y-6">
        <!-- Import -->
        <div v-if="mode === 'import'" class="space-y-4">
          <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 class="font-medium text-blue-900 dark:text-blue-100 mb-2">Instructions d'import</h4>
            <ul class="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Utilisez le template fourni pour respecter le format</li>
              <li>• Les champs obligatoires sont: Nom, Prix d'achat, Prix de vente</li>
              <li>• Les catégories et fournisseurs doivent exister dans le système</li>
              <li>• Formats supportés: CSV, Excel (.xlsx)</li>
            </ul>
          </div>

          <div class="flex space-x-3">
            <UButton color="gray" variant="outline" @click="downloadTemplate">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Télécharger le template
            </UButton>
          </div>

          <div class="space-y-4">
            <UFormGroup label="Fichier à importer">
              <UInput 
                type="file" 
                accept=".csv,.xlsx,.xls"
                @change="handleFileSelect"
              />
            </UFormGroup>

            <div v-if="selectedFile" class="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
              <div class="flex items-center">
                <svg class="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span class="text-sm text-green-700 dark:text-green-300">
                  Fichier sélectionné: {{ selectedFile.name }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Export -->
        <div v-if="mode === 'export'" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormGroup label="Format d'export">
              <USelect 
                v-model="exportOptions.format"
                :options="[
                  { value: 'excel', label: 'Excel (.xlsx)' },
                  { value: 'csv', label: 'CSV' }
                ]"
              />
            </UFormGroup>

            <UFormGroup label="Période">
              <USelect 
                v-model="exportOptions.dateRange"
                :options="[
                  { value: 'all', label: 'Tous les produits' },
                  { value: 'last_month', label: 'Dernier mois' },
                  { value: 'last_quarter', label: 'Dernier trimestre' },
                  { value: 'last_year', label: 'Dernière année' }
                ]"
              />
            </UFormGroup>
          </div>

          <div class="space-y-3">
            <h4 class="font-medium text-gray-900 dark:text-white">Options d'inclusion</h4>
            
            <div class="space-y-2">
              <UCheckbox v-model="exportOptions.includeStock" label="Inclure les informations de stock" />
              <UCheckbox v-model="exportOptions.includePrices" label="Inclure les prix et marges" />
              <UCheckbox v-model="exportOptions.includeCategories" label="Inclure les catégories" />
              <UCheckbox v-model="exportOptions.includeSuppliers" label="Inclure les fournisseurs" />
              <UCheckbox v-model="exportOptions.includeImages" label="Inclure les images (URLs)" />
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end space-x-3 pt-4 border-t">
          <UButton color="gray" variant="outline" @click="emit('close')">
            Annuler
          </UButton>
          <UButton 
            :color="mode === 'import' ? 'blue' : 'green'"
            :loading="loading"
            @click="mode === 'import' ? importProduits() : exportProduits()"
          >
            {{ mode === 'import' ? 'Importer' : 'Exporter' }}
          </UButton>
        </div>
      </div>
    </UCard>
  </UModal>
</template>
