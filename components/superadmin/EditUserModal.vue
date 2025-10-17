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
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </div>
              </div>
              <div class="ml-4">
                <h3 class="text-lg font-semibold text-white">{{ isEditing ? 'Modifier l\'utilisateur' : 'Détails de l\'utilisateur' }}</h3>
                <p class="text-emerald-100 text-sm">{{ isEditing ? 'Modifiez les informations de l\'utilisateur' : 'Consultez les informations de l\'utilisateur' }}</p>
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
            <!-- Informations personnelles -->
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Informations personnelles</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Prénom</label>
                  <p class="mt-1 text-sm text-gray-900 dark:text-white">{{ userData?.first_name || 'Non renseigné' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom</label>
                  <p class="mt-1 text-sm text-gray-900 dark:text-white">{{ userData?.last_name || 'Non renseigné' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                  <p class="mt-1 text-sm text-gray-900 dark:text-white">{{ userData?.email || 'Non renseigné' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Téléphone</label>
                  <p class="mt-1 text-sm text-gray-900 dark:text-white">{{ userData?.telephone || 'Non renseigné' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Poste</label>
                  <p class="mt-1 text-sm text-gray-900 dark:text-white">{{ userData?.poste || 'Non renseigné' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Rôle</label>
                  <span class="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="getRoleBadgeClass(userData?.role)">
                    {{ userData?.role || 'Non défini' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Informations entreprise -->
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Informations entreprise</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Entreprise</label>
                  <p class="mt-1 text-sm text-gray-900 dark:text-white">{{ userData?.entreprise_nom || 'Non assignée' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Entrepôt</label>
                  <p class="mt-1 text-sm text-gray-900 dark:text-white">{{ userData?.boutique_nom || 'Non assigné' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Statut</label>
                  <span class="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="userData?.is_active_employee ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'">
                    {{ userData?.is_active_employee ? 'Actif' : 'Inactif' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Boutons d'action -->
            <div class="flex justify-end space-x-3">
              <button @click="isEditing = true" class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                <svg class="h-4 w-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
                Modifier
              </button>
              <button @click="$emit('close')" class="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors">
                Fermer
              </button>
            </div>
          </div>

          <!-- Mode édition -->
          <div v-else class="space-y-6">
            <form @submit.prevent="updateUser" class="space-y-6">
              <!-- Informations personnelles -->
              <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Informations personnelles</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Prénom</label>
                    <input v-model="form.first_name" type="text" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-600 dark:text-white" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nom</label>
                    <input v-model="form.last_name" type="text" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-600 dark:text-white" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                    <input v-model="form.email" type="email" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-600 dark:text-white" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Téléphone</label>
                    <input v-model="form.telephone" type="tel" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-600 dark:text-white" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Poste</label>
                    <input v-model="form.poste" type="text" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-600 dark:text-white" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rôle</label>
                    <!-- Affichage du rôle si c'est un superadmin (non modifiable) -->
                    <div v-if="userData?.role === 'superadmin'" class="flex items-center space-x-2">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                        Super Admin
                      </span>
                      <span class="text-xs text-gray-500 dark:text-gray-400">(Non modifiable)</span>
                    </div>
                    <!-- Sélecteur de rôle pour les autres utilisateurs -->
                    <select v-else v-model="form.role" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-600 dark:text-white">
                      <option value="user">Utilisateur</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Informations entreprise -->
              <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Informations entreprise</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Entrepôt</label>
                    <select v-model="form.boutique" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-600 dark:text-white">
                      <option value="">Aucun entrepôt</option>
                      <option v-for="boutique in boutiques" :key="boutique.id" :value="boutique.id">{{ boutique.nom }}</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Statut</label>
                    <select v-model="form.is_active_employee" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-600 dark:text-white">
                      <option :value="true">Actif</option>
                      <option :value="false">Inactif</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Boutons d'action -->
              <div class="flex justify-end space-x-3">
                <button type="button" @click="isEditing = false" class="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors">
                  Annuler
                </button>
                <button type="submit" :disabled="loading" class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50">
                  <span v-if="!loading">Sauvegarder</span>
                  <span v-else>Sauvegarde...</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import { useNotification } from '@/types/useNotification'
import { useAuth } from '@/composables/useAuth'

const props = defineProps<{
  isOpen: boolean
  user?: any
}>()

const emit = defineEmits(['close', 'updated'])

const { error, success } = useNotification()
const { getAuthHeaders } = useAuth()
const loading = ref(false)
const isEditing = ref(false)

const userData = ref(null)
const boutiques = ref([])

const form = reactive({
  first_name: '',
  last_name: '',
  email: '',
  telephone: '',
  poste: '',
  role: 'user',
  boutique: '',
  is_active_employee: true
})

const loadUserData = () => {
  if (props.user) {
    userData.value = props.user
    Object.assign(form, {
      first_name: props.user.first_name || '',
      last_name: props.user.last_name || '',
      email: props.user.email || '',
      telephone: props.user.telephone || '',
      poste: props.user.poste || '',
      role: props.user.role || 'user',
      boutique: props.user.boutique || '',
      is_active_employee: props.user.is_active_employee !== false
    })
    
    // Protection : s'assurer que le rôle superadmin ne peut pas être modifié
    if (props.user.role === 'superadmin') {
      form.role = 'superadmin'
    }
  }
}

const loadBoutiques = async () => {
  try {
    const entreprise = localStorage.getItem('entreprise')
    if (!entreprise) return
    
    const entrepriseData = JSON.parse(entreprise)
    const entrepriseId = entrepriseData.id

    try {
      const data = await $fetch(`http://127.0.0.1:8000/api/boutiques/?entreprise=${entrepriseId}`, {
        headers: getAuthHeaders()
      })
      boutiques.value = data || []
    } catch (apiError: any) {
      console.error('Erreur chargement entrepôts:', apiError)
    }
  } catch (err) {
    console.error('Erreur chargement entrepôts:', err)
  }
}

const updateUser = async () => {
  if (!form.first_name || !form.last_name || !form.email) {
    error('Veuillez remplir au moins le prénom, nom et email')
    return
  }

  // Vérification de sécurité : empêcher la modification du rôle superadmin
  if (userData.value?.role === 'superadmin' && form.role !== 'superadmin') {
    error('Le rôle Super Admin ne peut pas être modifié')
    return
  }

  loading.value = true

  try {
    const updateData = {
      first_name: form.first_name,
      last_name: form.last_name,
      email: form.email,
      telephone: form.telephone,
      poste: form.poste,
      role: form.role,
      boutique: form.boutique || null,
      is_active_employee: form.is_active_employee
    }

    try {
      const data = await $fetch(`http://127.0.0.1:8000/api/users/${userData.value.id}/`, {
        method: 'PATCH',
        body: updateData,
        headers: getAuthHeaders()
      })
    } catch (apiError: any) {
      error('Erreur lors de la mise à jour de l\'utilisateur: ' + (apiError.data?.message || apiError.message))
      return
    }

    success('Utilisateur mis à jour avec succès')
    emit('updated')
    isEditing.value = false
  } catch (err) {
    console.error('Erreur mise à jour utilisateur:', err)
    error('Une erreur est survenue')
  } finally {
    loading.value = false
  }
}

const getRoleBadgeClass = (role: string) => {
  switch (role) {
    case 'superadmin':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    case 'admin':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
    case 'user':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
  }
}

watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    loadUserData()
    loadBoutiques()
    isEditing.value = false
  }
})

onMounted(() => {
  if (props.isOpen) {
    loadUserData()
    loadBoutiques()
  }
})
</script>
