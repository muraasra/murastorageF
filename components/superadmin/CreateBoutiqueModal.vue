<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Overlay -->
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="$emit('close')"></div>

      <!-- Modal -->
      <div class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <div class="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 sm:mx-0 sm:h-10 sm:w-10">
              <svg class="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
              </svg>
            </div>
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Créer un nouvel entrepôt
              </h3>
              <div class="mt-4 space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom de l'entrepôt</label>
                  <input v-model="form.nom" type="text" class="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white sm:text-sm">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Ville</label>
                  <input v-model="form.ville" type="text" class="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white sm:text-sm">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Adresse</label>
                  <input v-model="form.adresse" type="text" class="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white sm:text-sm">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Téléphone</label>
                  <input v-model="form.telephone" type="tel" class="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white sm:text-sm">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                  <input v-model="form.email" type="email" class="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white sm:text-sm">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Responsable</label>
                  <input v-model="form.responsable" type="text" class="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white sm:text-sm">
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button @click="createBoutique" :disabled="loading || isLimitReached('max_boutiques')" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-emerald-600 text-base font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-ausset 2 focus:ring-emerald-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50">
            <span v-if="!loading">Créer</span>
            <span v-else>Création...</span>
          </button>
          <button @click="$emit('close')" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
            Annuler
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useNotification } from '@/types/useNotification'
import { useAuth } from '@/composables/useAuth'
import { API_BASE_URL } from '@/constants'
import { useSubscriptionLimits } from '@/composables/useSubscriptionLimits'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits(['close', 'created'])

const { error, success } = useNotification()
const { getAuthHeaders } = useAuth()
const loading = ref(false)

// Vérification des limites
const { isLimitReached, getLimitErrorMessage, loadSubscription, loadLimits, loadUsage, getUpgradeSuggestion } = useSubscriptionLimits()

const form = reactive({
  nom: '',
  ville: '',
  adresse: '',
  telephone: '',
  email: '',
  responsable: ''
})

const createBoutique = async () => {
  if (!form.nom || !form.ville) {
    error('Veuillez remplir au moins le nom et la ville')
    return
  }

  // Vérifier la limite de boutiques
  if (isLimitReached('max_boutiques')) {
    error(getLimitErrorMessage('max_boutiques'))
    error(getUpgradeSuggestion('boutiques'))
    return
  }

  loading.value = true
  try {
    const entreprise = localStorage.getItem('entreprise')
    if (!entreprise) {
      error('Informations entreprise manquantes')
      return
    }
    
    const entrepriseData = JSON.parse(entreprise)
    const entrepriseId = entrepriseData.id

    const boutiqueData = {
      nom: form.nom,
      ville: form.ville,
      adresse: form.adresse,
      telephone: form.telephone,
      email: form.email,
      responsable: form.responsable,
      entreprise: entrepriseId
    }

    try {
      const data = await $fetch(`${API_BASE_URL}/api/boutiques/`, {
        method: 'POST',
        body: boutiqueData,
        headers: getAuthHeaders()
      })
    } catch (apiError: any) {
      error('Erreur lors de la création de l\'entrepôt: ' + (apiError.data?.message || apiError.message))
      return
    }

    success('Entrepôt créé avec succès. Patientez 1 à 5 minutes pour son activation')
    emit('created')
    emit('close')
    
    // Reset form
    Object.assign(form, {
      nom: '',
      ville: '',
      adresse: '',
      telephone: '',
      email: '',
      responsable: ''
    })
  } catch (err) {
    console.error('Erreur création entrepôt:', err)
    error('Une erreur est survenue')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadSubscription()
  loadLimits()
  loadUsage()
})
</script>