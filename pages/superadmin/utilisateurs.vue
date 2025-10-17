<template>
  <div>
    <!-- Header de la page -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Gestion des Utilisateurs</h1>
          <p class="mt-2 text-gray-600 dark:text-gray-400">Gérez les utilisateurs de votre entreprise</p>
        </div>
        <button @click="showCreateUser = true" class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
          <svg class="h-4 w-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Nouvel Utilisateur
        </button>
      </div>
    </div>

    <!-- Statistiques -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div class="flex items-center">
          <div class="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <svg class="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Utilisateurs</p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ users.length }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div class="flex items-center">
          <div class="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
            <svg class="h-6 w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Super Admins</p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ superAdmins }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div class="flex items-center">
          <div class="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <svg class="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Utilisateurs Actifs</p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ activeUsers }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div class="flex items-center">
          <div class="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <svg class="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Admins</p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ admins }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Liste des utilisateurs -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Liste des Utilisateurs</h3>
          <div class="flex space-x-3">
            <select v-model="roleFilter" class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white">
              <option value="">Tous les rôles</option>
              <option value="superadmin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="user">Utilisateur</option>
            </select>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher un utilisateur..."
              class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white"
            />
            <button @click="loadUsers" class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
              <svg class="h-4 w-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              Actualiser
            </button>
          </div>
        </div>
      </div>

      <div class="p-6">
        <div v-if="users.length === 0" class="text-center py-8">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
          <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">Aucun utilisateur trouvé</p>
        </div>

        <div v-else class="space-y-4">
          <div v-for="user in filteredUsers" :key="user.id" class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="flex items-center space-x-3">
                  <div class="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span class="text-white font-semibold text-sm">{{ user.first_name?.charAt(0) || user.username?.charAt(0) || 'U' }}</span>
                  </div>
                  <div>
                    <h4 class="text-lg font-semibold text-gray-900 dark:text-white">{{ user.first_name }} {{ user.last_name }}</h4>
                    <p class="text-sm text-gray-500 dark:text-gray-400">{{ user.email }}</p>
                  </div>
                </div>
                
                <div class="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span class="text-gray-500 dark:text-gray-400">Rôle:</span>
                    <span class="ml-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="getRoleBadgeClass(user.role)">
                      {{ user.role }}
                    </span>
                  </div>
                  <div>
                    <span class="text-gray-500 dark:text-gray-400">Entreprise:</span>
                    <span class="ml-1 font-medium text-gray-900 dark:text-white">{{ user.entreprise_nom || 'Aucune' }}</span>
                  </div>
                  <div>
                    <span class="text-gray-500 dark:text-gray-400">Entrepôt:</span>
                    <span class="ml-1 font-medium text-gray-900 dark:text-white">{{ user.boutique_nom || 'Aucun' }}</span>
                  </div>
                  <div>
                    <span class="text-gray-500 dark:text-gray-400">Actif:</span>
                    <span class="ml-1 font-medium" :class="user.is_active_employee ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
                      {{ user.is_active_employee ? 'Oui' : 'Non' }}
                    </span>
                  </div>
                </div>
              </div>
              
              <div class="flex space-x-2">
                <button @click="viewUser(user)" class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                </button>
                <button @click="editUser(user)" class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                </button>
                <button @click="deleteUser(user.id)" class="p-2 text-red-400 hover:text-red-600">
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

    <!-- Modales -->
    <CreateUserModal :isOpen="showCreateUser" @close="showCreateUser = false" @created="loadUsers" />
    <EditUserModal :isOpen="showEditUser" :user="selectedUser" @close="showEditUser = false" @updated="loadUsers" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useNotification } from '@/types/useNotification'
import { useAuth } from '@/composables/useAuth'
import CreateUserModal from '@/components/superadmin/CreateUserModal.vue'
import EditUserModal from '@/components/superadmin/EditUserModal.vue'

definePageMeta({
  layout: "superadmin",
})

const { error, success } = useNotification()
const { getAuthHeaders } = useAuth()

// Types
interface User {
  id: number
  first_name: string
  last_name: string
  email: string
  telephone?: string
  poste?: string
  role: string
  username: string
  entreprise_nom?: string
  boutique_nom?: string
  is_active_employee: boolean
}

// État des données
const users = ref<User[]>([])
const searchQuery = ref('')
const roleFilter = ref('')
const showCreateUser = ref(false)
const showEditUser = ref(false)
const selectedUser = ref<User | null>(null)

// Statistiques calculées
const superAdmins = computed(() => users.value.filter(user => user.role === 'superadmin').length)
const admins = computed(() => users.value.filter(user => user.role === 'admin').length)
const activeUsers = computed(() => users.value.filter(user => user.is_active_employee).length)

// Utilisateurs filtrés
const filteredUsers = computed(() => {
  let filtered = users.value

  if (roleFilter.value) {
    filtered = filtered.filter(user => user.role === roleFilter.value)
  }

  if (searchQuery.value) {
    filtered = filtered.filter(user =>
      user.first_name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  return filtered
})

// Fonctions utilitaires
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

// Charger les utilisateurs de l'entreprise
const loadUsers = async () => {
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
      const headers = getAuthHeaders()
      const data = await $fetch<User[]>(`http://127.0.0.1:8000/api/users/?entreprise=${entrepriseId}`, {
        headers
      })
      users.value = data || []
    } catch (apiError: any) {
      error('Erreur lors du chargement des utilisateurs: ' + (apiError.data?.message || apiError.message))
      return
    }
  } catch (err) {
    console.error('Erreur chargement utilisateurs:', err)
    error('Une erreur est survenue')
  }
}

// Actions
const viewUser = (user: User) => {
  selectedUser.value = user
  showEditUser.value = true
}

const editUser = (user: User) => {
  selectedUser.value = user
  showEditUser.value = true
}

const deleteUser = async (id: number) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.')) {
    try {
      try {
        const headers = getAuthHeaders()
        await $fetch(`http://127.0.0.1:8000/api/users/${id}/`, {
          method: 'DELETE',
          headers
        })
      } catch (apiError: any) {
        error('Erreur lors de la suppression: ' + (apiError.data?.message || apiError.message))
        return
      }

      success('Utilisateur supprimé avec succès')
      loadUsers()
    } catch (err) {
      console.error('Erreur suppression:', err)
      error('Erreur lors de la suppression')
    }
  }
}

// Charger les données au montage
onMounted(() => {
  loadUsers()
})
</script>
