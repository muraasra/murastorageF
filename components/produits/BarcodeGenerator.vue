<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  produit: any
}>()

const emit = defineEmits(['close'])

const showBarcode = ref(true)
const showQRCode = ref(false)
const printSize = ref('medium')

const barcodeSize = computed(() => {
  switch (printSize.value) {
    case 'small': return { width: 200, height: 100 }
    case 'medium': return { width: 300, height: 150 }
    case 'large': return { width: 400, height: 200 }
    default: return { width: 300, height: 150 }
  }
})

const qrCodeSize = computed(() => {
  switch (printSize.value) {
    case 'small': return 150
    case 'medium': return 200
    case 'large': return 300
    default: return 200
  }
})

const printLabels = () => {
  window.print()
}

const downloadBarcode = () => {
  // TODO: Implémenter le téléchargement du code-barres
  console.log('Télécharger code-barres')
}

const downloadQRCode = () => {
  // TODO: Implémenter le téléchargement du QR code
  console.log('Télécharger QR code')
}
</script>

<template>
  <UModal :model-value="true" @update:model-value="emit('close')">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">Génération de codes-barres et QR codes</h3>
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-x-mark-20-solid"
            @click="emit('close')"
          />
        </div>
      </template>

      <div class="space-y-6">
        <!-- Informations du produit -->
        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h4 class="font-medium text-gray-900 dark:text-white mb-2">{{ produit.nom }}</h4>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-gray-600 dark:text-gray-400">SKU:</span>
              <span class="ml-2 font-medium">{{ produit.sku || produit.reference }}</span>
            </div>
            <div>
              <span class="text-gray-600 dark:text-gray-400">Code-barres:</span>
              <span class="ml-2 font-medium">{{ produit.code_barres }}</span>
            </div>
            <div>
              <span class="text-gray-600 dark:text-gray-400">QR Code:</span>
              <span class="ml-2 font-medium">{{ produit.qr_code }}</span>
            </div>
            <div>
              <span class="text-gray-600 dark:text-gray-400">Prix:</span>
              <span class="ml-2 font-medium">{{ produit.prix_vente }} {{ produit.devise || 'XAF' }}</span>
            </div>
          </div>
        </div>

        <!-- Options d'affichage -->
        <div class="space-y-4">
          <h4 class="font-medium text-gray-900 dark:text-white">Options d'affichage</h4>
          
          <div class="flex space-x-4">
            <UButton 
              :color="showBarcode ? 'blue' : 'gray'"
              variant="outline"
              @click="showBarcode = !showBarcode"
            >
              Code-barres
            </UButton>
            <UButton 
              :color="showQRCode ? 'blue' : 'gray'"
              variant="outline"
              @click="showQRCode = !showQRCode"
            >
              QR Code
            </UButton>
          </div>

          <div class="flex items-center space-x-4">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Taille d'impression:</label>
            <USelect 
              v-model="printSize"
              :options="[
                { value: 'small', label: 'Petit' },
                { value: 'medium', label: 'Moyen' },
                { value: 'large', label: 'Grand' }
              ]"
            />
          </div>
        </div>

        <!-- Aperçu des codes -->
        <div class="space-y-6">
          <!-- Code-barres -->
          <div v-if="showBarcode" class="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h4 class="font-medium text-gray-900 dark:text-white mb-4">Code-barres</h4>
            <div class="flex justify-center">
              <div class="bg-white p-4 rounded border">
                <!-- Ici on intégrerait une bibliothèque de génération de codes-barres -->
                <div class="text-center">
                  <div class="text-sm text-gray-600 mb-2">{{ produit.code_barres }}</div>
                  <div class="bg-black h-8 w-full mb-2"></div>
                  <div class="text-xs text-gray-500">{{ produit.nom }}</div>
                </div>
              </div>
            </div>
            <div class="flex justify-center mt-4">
              <UButton size="sm" color="blue" variant="outline" @click="downloadBarcode">
                Télécharger
              </UButton>
            </div>
          </div>

          <!-- QR Code -->
          <div v-if="showQRCode" class="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h4 class="font-medium text-gray-900 dark:text-white mb-4">QR Code</h4>
            <div class="flex justify-center">
              <div class="bg-white p-4 rounded border">
                <!-- Ici on intégrerait une bibliothèque de génération de QR codes -->
                <div class="text-center">
                  <div class="bg-gray-200 w-32 h-32 mx-auto mb-2 flex items-center justify-center">
                    <div class="text-xs text-gray-500">QR Code</div>
                  </div>
                  <div class="text-xs text-gray-500">{{ produit.qr_code }}</div>
                </div>
              </div>
            </div>
            <div class="flex justify-center mt-4">
              <UButton size="sm" color="blue" variant="outline" @click="downloadQRCode">
                Télécharger
              </UButton>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end space-x-3 pt-4 border-t">
          <UButton color="gray" variant="outline" @click="emit('close')">
            Fermer
          </UButton>
          <UButton color="blue" @click="printLabels">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
            </svg>
            Imprimer
          </UButton>
        </div>
      </div>
    </UCard>
  </UModal>
</template>

<style scoped>
@media print {
  .no-print {
    display: none !important;
  }
  
  .print-label {
    page-break-after: always;
    margin: 0;
    padding: 20px;
  }
}
</style>
