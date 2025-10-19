<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Overlay -->
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="$emit('close')"></div>

      <!-- Modal -->
      <div class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <div class="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 sm:mx-0 sm:h-10 sm:w-10">
              <svg class="h-6 w-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            </div>
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Créer un nouvel utilisateur
              </h3>
              <div class="mt-4 space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Prénom</label>
                  <input v-model="form.first_name" type="text" class="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white sm:text-sm">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom</label>
                  <input v-model="form.last_name" type="text" class="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white sm:text-sm">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                  <input v-model="form.email" type="email" class="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white sm:text-sm">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Téléphone</label>
                  <input v-model="form.telephone" type="tel" class="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white sm:text-sm">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Poste</label>
                  <input v-model="form.poste" type="text" class="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white sm:text-sm">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Rôle</label>
                  <select v-model="form.role" class="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white sm:text-sm">
                    <option value="user">Utilisateur</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Entrepôt</label>
                  <select v-model="form.boutique" class="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white sm:text-sm">
                    <option value="">Sélectionner un entrepôt</option>
                    <option v-for="boutique in boutiques" :key="boutique.id" :value="boutique.id">{{ boutique.nom }}</option>
                  </select>
                </div>
                <div class="flex items-center">
                  <input v-model="form.send_email" type="checkbox" class="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded">
                  <label class="ml-2 block text-sm text-gray-900 dark:text-gray-300">Envoyer les identifiants par email</label>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button @click="createUser" :disabled="loading" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-emerald-600 text-base font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50">
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
import { ref, reactive, watch, onMounted } from 'vue'
import { useNotification } from '@/types/useNotification'
import { useAuth } from '@/composables/useAuth'
import { API_BASE_URL } from '@/constants'

const props = defineProps<{
  isOpen: boolean
  boutiques?: any[]
}>()

const emit = defineEmits(['close', 'created'])

const { error, success } = useNotification()
const { getAuthHeaders } = useAuth()
const loading = ref(false)

const form = reactive({
  first_name: '',
  last_name: '',
  email: '',
  telephone: '',
  poste: '',
  role: 'user',
  boutique: '',
  send_email: true
})

const boutiques = ref([])

// Charger les entrepôts disponibles
const loadBoutiques = async () => {
  try {
    const entreprise = localStorage.getItem('entreprise')
    if (!entreprise) return
    
    const entrepriseData = JSON.parse(entreprise)
    const entrepriseId = entrepriseData.id

    try {
      const data = await $fetch(`${API_BASE_URL}/api/boutiques/?entreprise=${entrepriseId}`, {
        headers: getAuthHeaders()
      })
      boutiques.value = data
    } catch (apiError: any) {
      console.error('Erreur chargement entrepôts:', apiError)
    }
  } catch (err) {
    console.error('Erreur chargement entrepôts:', err)
  }
}

const createUser = async () => {
  if (!form.first_name || !form.last_name || !form.email) {
    error('Veuillez remplir tous les champs obligatoires')
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

    const userData = {
      username: form.email,
      first_name: form.first_name,
      last_name: form.last_name,
      email: form.email,
      telephone: form.telephone,
      poste: form.poste,
      role: form.role,
      entreprise: entrepriseId,
      boutique: form.boutique || null,
      send_email: form.send_email
    }

    try {
      const data = await $fetch(`${API_BASE_URL}/api/users/`, {
        method: 'POST',
        body: userData,
        headers: getAuthHeaders()
      })
    } catch (apiError: any) {
      error('Erreur lors de la création de l\'utilisateur: ' + (apiError.data?.message || apiError.message))
      return
    }

    success('Utilisateur créé avec succès. Patientez 1 à 5 minutes pour son activation')
    emit('created')
    emit('close')
    
    // Reset form
    Object.assign(form, {
      first_name: '',
      last_name: '',
      email: '',
      telephone: '',
      poste: '',
      role: 'user',
      boutique: '',
      send_email: true
    })
  } catch (err) {
    console.error('Erreur création utilisateur:', err)
    error('Une erreur est survenue')
  } finally {
    loading.value = false
  }
}

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    loadBoutiques()
  }
})
</script>