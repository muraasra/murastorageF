<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useApiBase } from '@/composables/useApiBase'
import { useNotification } from '@/types/useNotification'
import CreateUserModal from '@/components/superadmin/CreateUserModal.vue'
import EditUserModal from '@/components/superadmin/EditUserModal.vue'

definePageMeta({ layout: 'superadmin' })

const { getApiUrl, getAuthHeaders } = useApiBase()
const { error, success } = useNotification()

async function apiFetch(path: string, opts: any = {}) {
  return $fetch(getApiUrl(path), { headers: getAuthHeaders(), ...opts })
}

// â”€â”€ Data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const users = ref<any[]>([])
const loading = ref(true)
const searchQuery = ref('')
const roleFilter = ref('')
const totalPages = ref(1)
const currentPage = ref(1)

// â”€â”€ Modals â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const showCreate = ref(false)
const showEdit = ref(false)
const showDeleteConfirm = ref(false)
const selectedUser = ref<any>(null)

// â”€â”€ Stats â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const stats = computed(() => ({
  total: users.value.length,
  superAdmins: users.value.filter(u => u.role === 'superadmin').length,
  admins: users.value.filter(u => u.role === 'admin').length,
  actifs: users.value.filter(u => u.is_active).length,
}))

const filtered = computed(() => {
  let list = users.value
  if (roleFilter.value) list = list.filter(u => u.role === roleFilter.value)
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(u =>
      u.first_name?.toLowerCase().includes(q) ||
      u.last_name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    )
  }
  return list
})

// â”€â”€ Load â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function load(page = 1) {
  loading.value = true
  try {
    const res: any = await apiFetch(`/api/users/?page=${page}`)
    users.value = res.results ?? (Array.isArray(res) ? res : [])
    totalPages.value = res.total_pages ?? 1
    currentPage.value = page
  } catch {
    error('Impossible de charger les utilisateurs')
  } finally {
    loading.value = false
  }
}

onMounted(() => load())

// â”€â”€ Actions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function openEdit(u: any) { selectedUser.value = u; showEdit.value = true }
function openDelete(u: any) { selectedUser.value = u; showDeleteConfirm.value = true }

async function deleteUser() {
  try {
    await apiFetch(`/api/users/${selectedUser.value.id}/`, { method: 'DELETE' })
    success('Utilisateur supprimÃ©')
    showDeleteConfirm.value = false
    await load(currentPage.value)
  } catch {
    error('Erreur lors de la suppression')
  }
}

async function toggleActive(u: any) {
  try {
    await apiFetch(`/api/users/${u.id}/`, { method: 'PATCH', body: { is_active: !u.is_active } })
    u.is_active = !u.is_active
    success(`Utilisateur ${u.is_active ? 'activÃ©' : 'dÃ©sactivÃ©'}`)
  } catch {
    error('Erreur lors de la mise Ã  jour')
  }
}

function roleLabel(r: string) {
  return r === 'superadmin' ? 'Super Admin' : r === 'admin' ? 'Admin' : 'Utilisateur'
}
function roleClass(r: string) {
  if (r === 'superadmin') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
  if (r === 'admin') return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
  return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
}
function initials(u: any) {
  return ((u.first_name?.[0] || '') + (u.last_name?.[0] || '')).toUpperCase() || u.email?.[0]?.toUpperCase() || '?'
}
function avatarColor(id: number) {
  const colors = ['bg-emerald-500', 'bg-blue-500', 'bg-violet-500', 'bg-rose-500', 'bg-amber-500', 'bg-cyan-500']
  return colors[id % colors.length]
}

let searchTimer: any
function onSearch() { clearTimeout(searchTimer); searchTimer = setTimeout(() => load(1), 400) }
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

      <!-- Header -->
      <div class="flex items-start justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Utilisateurs</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">GÃ©rez les membres de votre entreprise</p>
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="showCreate = true"
            class="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
            Nouvel utilisateur
          </button>
          <button @click="load(currentPage)" :disabled="loading" class="p-2 text-gray-400 hover:text-emerald-600 transition-colors disabled:opacity-50">
            <svg class="w-5 h-5" :class="loading ? 'animate-spin' : ''" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- KPIs -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">Total</p>
          <p class="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">{{ stats.total }}</p>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">Super Admins</p>
          <p class="text-3xl font-extrabold text-amber-600 mt-1">{{ stats.superAdmins }}</p>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">Admins</p>
          <p class="text-3xl font-extrabold text-blue-600 mt-1">{{ stats.admins }}</p>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">Actifs</p>
          <p class="text-3xl font-extrabold text-emerald-600 mt-1">{{ stats.actifs }}</p>
        </div>
      </div>

      <!-- Tableau -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <!-- Filtres -->
        <div class="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex flex-wrap items-center gap-3">
          <div class="relative flex-1 min-w-0 sm:min-w-[160px]">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input v-model="searchQuery" @input="onSearch" type="search" placeholder="Rechercher par nom, email..."
              class="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400" />
          </div>
          <select v-model="roleFilter" @change="load(1)"
            class="px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400">
            <option value="">Tous les rÃ´les</option>
            <option value="superadmin">Super Admin</option>
            <option value="admin">Admin</option>
            <option value="user">Utilisateur</option>
          </select>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="flex justify-center py-16">
          <div class="w-8 h-8 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
        </div>

        <!-- Empty -->
        <div v-else-if="filtered.length === 0" class="flex flex-col items-center justify-center py-16 text-gray-400">
          <svg class="w-12 h-12 mb-3" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/></svg>
          <p class="font-medium">Aucun utilisateur trouvÃ©</p>
        </div>

        <!-- Liste -->
        <div v-else class="divide-y divide-gray-50 dark:divide-gray-700/50">
          <div
            v-for="u in filtered"
            :key="u.id"
            class="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
          >
            <!-- Avatar -->
            <div class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0" :class="avatarColor(u.id)">
              {{ initials(u) }}
            </div>

            <!-- Infos -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-semibold text-gray-900 dark:text-white text-sm">{{ u.first_name }} {{ u.last_name }}</span>
                <span class="text-xs font-semibold px-2 py-0.5 rounded-full" :class="roleClass(u.role)">{{ roleLabel(u.role) }}</span>
                <span v-if="!u.is_active" class="text-xs bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded-full">Inactif</span>
              </div>
              <p class="text-sm text-gray-500 dark:text-gray-400 truncate">{{ u.email }}</p>
              <p v-if="u.boutique_nom" class="text-xs text-gray-400 mt-0.5">{{ u.boutique_nom }}</p>
            </div>

            <!-- TÃ©lÃ©phone -->
            <div class="hidden md:block text-sm text-gray-500 dark:text-gray-400">{{ u.telephone || 'â€”' }}</div>

            <!-- Actions -->
            <div class="flex items-center gap-1 flex-shrink-0">
              <button
                @click="toggleActive(u)"
                :title="u.is_active ? 'DÃ©sactiver' : 'Activer'"
                class="p-1.5 rounded-lg transition-colors"
                :class="u.is_active ? 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path v-if="u.is_active" d="M5 13l4 4L19 7"/>
                  <path v-else d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
              <button @click="openEdit(u)" title="Modifier"
                class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              </button>
              <button @click="openDelete(u)" title="Supprimer"
                class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="px-5 py-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-sm text-gray-500">
          <span>Page {{ currentPage }} / {{ totalPages }}</span>
          <div class="flex gap-2">
            <button @click="load(currentPage - 1)" :disabled="currentPage <= 1"
              class="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 disabled:opacity-40 hover:border-emerald-400 transition-colors">â† PrÃ©cÃ©dent</button>
            <button @click="load(currentPage + 1)" :disabled="currentPage >= totalPages"
              class="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 disabled:opacity-40 hover:border-emerald-400 transition-colors">Suivant â†’</button>
          </div>
        </div>
      </div>
    </section>

    <!-- Modals existants -->
    <CreateUserModal :isOpen="showCreate" @close="showCreate = false" @created="load(1)" />
    <EditUserModal :isOpen="showEdit" :user="selectedUser" @close="showEdit = false" @updated="load(currentPage)" />

    <!-- Confirm suppression -->
    <Teleport to="body">
      <div v-if="showDeleteConfirm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" @click.self="showDeleteConfirm = false">
        <div class="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm shadow-2xl p-6">
          <div class="flex items-center gap-4 mb-5">
            <div class="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0">
              <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            </div>
            <div>
              <h3 class="font-bold text-gray-900 dark:text-white">Supprimer l'utilisateur ?</h3>
              <p class="text-sm text-gray-500 mt-1">{{ selectedUser?.first_name }} {{ selectedUser?.last_name }} sera dÃ©finitivement supprimÃ©.</p>
            </div>
          </div>
          <div class="flex gap-3 justify-end">
            <button @click="showDeleteConfirm = false" class="px-4 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 rounded-xl transition-colors">Annuler</button>
            <button @click="deleteUser" class="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors">Supprimer</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

