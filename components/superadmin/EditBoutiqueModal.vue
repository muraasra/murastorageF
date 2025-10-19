<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Overlay -->
      <div class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity" @click="$emit('close')"></div>

      <!-- Modal -->
      <div class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
        <!-- Header -->
        <div class="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="h-10 w-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                  </svg>
                </div>
              </div>
              <div class="ml-4">
                <h3 class="text-lg font-semibold text-white">{{ isEditing ? 'Modifier l\'entrepôt' : 'Détails de l\'entrepôt' }}</h3>
                <p class="text-emerald-100 text-sm">{{ isEditing ? 'Modifiez les informations de l\'entrepôt' : 'Consultez les informations de l\'entrepôt' }}</p>
              </div>
            </div>
            <button @click="$emit('close')" class="text-white hover:text-emerald-200 transition-colors">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="px-6 py-6">
          <!-- Mode visualisation -->
          <div v-if="!isEditing" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nom de l'entrepôt</label>
                <p class="text-lg font-semibold text-gray-900 dark:text-white">{{ boutiqueData?.nom }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ville</label>
                <p class="text-lg font-semibold text-gray-900 dark:text-white">{{ boutiqueData?.ville }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Responsable</label>
                <p class="text-gray-900 dark:text-white">{{ boutiqueData?.responsable || 'Non renseigné' }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Téléphone</label>
                <p class="text-gray-900 dark:text-white">{{ boutiqueData?.telephone || 'Non renseigné' }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                <p class="text-gray-900 dark:text-white">{{ boutiqueData?.email || 'Non renseigné' }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Statut</label>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                  Actif
                </span>
              </div>
            </div>
            <div v-if="boutiqueData?.adresse">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Adresse</label>
              <p class="text-gray-900 dark:text-white">{{ boutiqueData.adresse }}</p>
            </div>
          </div>

          <!-- Mode édition -->
          <div v-else class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nom de l'entrepôt *</label>
                <input v-model="form.nom" type="text" required class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white transition-colors">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ville *</label>
                <input v-model="form.ville" type="text" required class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white transition-colors">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Responsable</label>
                <input v-model="form.responsable" type="text" class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white transition-colors">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Téléphone</label>
                <input v-model="form.telephone" type="tel" class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white transition-colors">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                <input v-model="form.email" type="email" class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white transition-colors">
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Adresse</label>
              <textarea v-model="form.adresse" rows="3" class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white transition-colors"></textarea>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex justify-between">
          <div>
            <button v-if="!isEditing" @click="isEditing = true" class="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
              Modifier
            </button>
            <button v-else @click="isEditing = false" class="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
              Annuler
            </button>
          </div>
          <div class="flex space-x-3">
            <button @click="$emit('close')" class="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
              {{ isEditing ? 'Fermer' : 'Fermer' }}
            </button>
            <button v-if="isEditing" @click="updateBoutique" :disabled="loading" class="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 transition-colors">
              <span v-if="!loading">Enregistrer</span>
              <span v-else class="flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sauvegarde...
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useNotification } from '@/types/useNotification'
import { useAuth } from '@/composables/useAuth'
import { API_BASE_URL } from '@/constants'

const props = defineProps<{
  isOpen: boolean
  boutique?: any
}>()

const emit = defineEmits(['close', 'updated'])

const { error, success } = useNotification()
const { getAuthHeaders } = useAuth()
const loading = ref(false)
const isEditing = ref(false)

const boutiqueData = ref(null)
const form = reactive({
  nom: '',
  ville: '',
  adresse: '',
  telephone: '',
  email: '',
  responsable: ''
})

const loadBoutiqueData = () => {
  if (props.boutique) {
    boutiqueData.value = props.boutique
    Object.assign(form, {
      nom: props.boutique.nom || '',
      ville: props.boutique.ville || '',
      adresse: props.boutique.adresse || '',
      telephone: props.boutique.telephone || '',
      email: props.boutique.email || '',
      responsable: props.boutique.responsable || ''
    })
  }
}

const updateBoutique = async () => {
  if (!form.nom || !form.ville) {
    error('Veuillez remplir au moins le nom et la ville')
    return
  }

  loading.value = true

  try {
    const updateData = {
      nom: form.nom,
      ville: form.ville,
      adresse: form.adresse,
      telephone: form.telephone,
      email: form.email,
      responsable: form.responsable
    }

    try {
      const data = await $fetch(`${API_BASE_URL}/api/boutiques/${boutiqueData.value.id}/`, {
        method: 'PATCH',
        body: updateData,
        headers: getAuthHeaders()
      })
      
      // Mettre à jour les données locales avec la réponse
      boutiqueData.value = { ...boutiqueData.value, ...data }
    } catch (apiError: any) {
      error('Erreur lors de la mise à jour de l\'entrepôt: ' + (apiError.data?.message || apiError.message))
      return
    }

    success('Entrepôt mis à jour avec succès')
    emit('updated')
    isEditing.value = false
  } catch (err) {
    console.error('Erreur mise à jour entrepôt:', err)
    error('Une erreur est survenue')
  } finally {
    loading.value = false
  }
}

watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    loadBoutiqueData()
    isEditing.value = false
  }
})
</script>
