<script setup lang="ts">
import { ref } from 'vue'
import { useNotification } from '~/types/useNotification'

const { success, error } = useNotification()

const emit = defineEmits(['imported', 'exported'])

// État des composants
const showImportModal = ref(false)
const showExportModal = ref(false)
const importFile = ref(null)
const importLoading = ref(false)
const exportLoading = ref(false)

// Fonction d'import
const handleImport = async () => {
  if (!importFile.value) {
    error('Veuillez sélectionner un fichier CSV')
    return
  }

  importLoading.value = true
  
  try {
    const formData = new FormData()
    formData.append('file', importFile.value)
    
    const response = await fetch('http://127.0.0.1:8000/api/produits/import_produits/', {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    
    const result = await response.json()
    
    if (response.ok) {
      success(`Import réussi: ${result.imported} produits importés`)
      if (result.errors > 0) {
        error(`${result.errors} erreurs détectées. Vérifiez les détails.`)
        console.log('Erreurs d\'import:', result.error_details)
      }
      emit('imported', result)
      showImportModal.value = false
      importFile.value = null
    } else {
      error(`Erreur d'import: ${result.error || 'Erreur inconnue'}`)
    }
  } catch (err) {
    console.error('Erreur import:', err)
    error('Erreur lors de l\'import du fichier')
  } finally {
    importLoading.value = false
  }
}

// Fonction d'export
const handleExport = async () => {
  exportLoading.value = true
  
  try {
    const entreprise = JSON.parse(localStorage.getItem('entreprise') || '{}')
    
    const response = await fetch(
      `http://127.0.0.1:8000/api/produits/export_produits/?format=csv&entreprise=${entreprise.id}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    )
    
    if (response.ok) {
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `produits_export_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      success('Export réussi! Le fichier a été téléchargé.')
      emit('exported')
      showExportModal.value = false
    } else {
      const result = await response.json()
      error(`Erreur d'export: ${result.error || 'Erreur inconnue'}`)
    }
  } catch (err) {
    console.error('Erreur export:', err)
    error('Erreur lors de l\'export des produits')
  } finally {
    exportLoading.value = false
  }
}

// Gestion du fichier d'import
const onFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    if (!file.name.endsWith('.csv')) {
      error('Seuls les fichiers CSV sont acceptés')
      return
    }
    importFile.value = file
  }
}

// Template CSV pour l'import
const downloadTemplate = () => {
  const csvContent = `Nom,SKU,Description,Code-barres,Référence,Prix d'achat,Prix de vente,Prix de gros,Stock minimum,Stock maximum,Unité de mesure,Marque,Modèle,État
iPhone 13,IPH13-001,Smartphone Apple,1234567890123,REF001,450000,550000,500000,5,50,piece,Apple,iPhone 13,neuf
MacBook Pro,MBP-001,Ordinateur portable Apple,1234567890124,REF002,1200000,1500000,1350000,3,20,piece,Apple,MacBook Pro M1,neuf`
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'template_import_produits.csv'
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
  
  success('Modèle CSV téléchargé!')
}
</script>

<template>
  <div class="flex space-x-3">
    <!-- Bouton Import -->
    <UButton color="green" @click="showImportModal = true">
      <UIcon name="i-heroicons-arrow-up-tray" class="mr-2" />
      Importer
    </UButton>
    
    <!-- Bouton Export -->
    <UButton color="blue" @click="showExportModal = true">
      <UIcon name="i-heroicons-arrow-down-tray" class="mr-2" />
      Exporter
    </UButton>
    
    <!-- Bouton Template -->
    <UButton color="gray" variant="outline" @click="downloadTemplate">
      <UIcon name="i-heroicons-document-text" class="mr-2" />
      Modèle CSV
    </UButton>
  </div>

  <!-- Modal Import -->
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

      <div class="space-y-4">
        <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h4 class="font-medium text-blue-900 dark:text-blue-100 mb-2">Instructions d'import</h4>
          <ul class="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>• Utilisez le fichier CSV fourni comme modèle</li>
            <li>• Les colonnes "Nom", "Prix d'achat" et "Prix de vente" sont obligatoires</li>
            <li>• Les autres colonnes sont optionnelles</li>
            <li>• Le prix de vente doit être supérieur au prix d'achat</li>
          </ul>
        </div>

        <UFormGroup label="Fichier CSV" name="file">
          <UInput 
            type="file" 
            accept=".csv"
            @change="onFileChange"
            placeholder="Sélectionner un fichier CSV"
          />
        </UFormGroup>

        <div v-if="importFile" class="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
          <p class="text-sm text-green-700 dark:text-green-300">
            Fichier sélectionné: {{ importFile.name }}
          </p>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end space-x-3">
          <UButton color="gray" variant="outline" @click="showImportModal = false">
            Annuler
          </UButton>
          <UButton 
            color="green" 
            @click="handleImport"
            :loading="importLoading"
            :disabled="!importFile"
          >
            Importer
          </UButton>
        </div>
      </template>
    </UCard>
  </UModal>

  <!-- Modal Export -->
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

      <div class="space-y-4">
        <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h4 class="font-medium text-blue-900 dark:text-blue-100 mb-2">Informations d'export</h4>
          <ul class="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>• Tous les produits de votre entreprise seront exportés</li>
            <li>• Le fichier sera au format CSV</li>
            <li>• Compatible avec Excel et autres tableurs</li>
            <li>• Inclut toutes les informations des produits</li>
          </ul>
        </div>

        <div class="text-center">
          <UIcon name="i-heroicons-document-arrow-down" class="h-12 w-12 text-blue-500 mx-auto mb-2" />
          <p class="text-gray-600 dark:text-gray-400">
            Cliquez sur "Exporter" pour télécharger le fichier CSV
          </p>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end space-x-3">
          <UButton color="gray" variant="outline" @click="showExportModal = false">
            Annuler
          </UButton>
          <UButton 
            color="blue" 
            @click="handleExport"
            :loading="exportLoading"
          >
            Exporter
          </UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>
