<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="$emit('close')">
      <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" @click="$emit('close')"></div>

      <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
        <!-- Header -->
        <div class="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </div>
            <div>
              <h3 class="text-base font-bold text-white">{{ isEditing ? 'Modifier l\'utilisateur' : 'Détails de l\'utilisateur' }}</h3>
              <p class="text-xs text-emerald-100">{{ userData?.first_name }} {{ userData?.last_name }}</p>
            </div>
          </div>
          <button @click="$emit('close')" class="text-white/70 hover:text-white p-1 rounded-lg transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <!-- Contenu -->
        <div class="px-6 py-6 overflow-y-auto max-h-[75vh]">

          <!-- ── Vue ── -->
          <div v-if="!isEditing" class="space-y-5">
            <!-- Infos personnelles -->
            <div>
              <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Informations personnelles</p>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div v-for="(item, i) in personalDetails" :key="i">
                  <p class="text-xs text-gray-500 dark:text-gray-400">{{ item.label }}</p>
                  <p class="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">{{ item.value || '—' }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500 dark:text-gray-400">Rôle</p>
                  <span class="mt-0.5 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold" :class="roleBadge(userData?.role)">
                    {{ roleLabel(userData?.role) }}
                  </span>
                </div>
              </div>
            </div>

            <div class="border-t border-gray-100 dark:border-gray-700 pt-4">
              <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Affectation</p>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p class="text-xs text-gray-500 dark:text-gray-400">Entreprise</p>
                  <p class="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">{{ userData?.entreprise_nom || '—' }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500 dark:text-gray-400">Entrepôt assigné</p>
                  <p class="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">{{ userData?.boutique_nom || 'Aucun' }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500 dark:text-gray-400">Statut</p>
                  <span class="mt-0.5 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
                    :class="userData?.is_active_employee ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'">
                    {{ userData?.is_active_employee ? 'Actif' : 'Inactif' }}
                  </span>
                </div>
              </div>
            </div>

            <div class="flex justify-end gap-3 pt-2">
              <button @click="$emit('close')" class="px-4 py-2 text-sm border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Fermer</button>
              <button @click="isEditing = true" class="px-5 py-2 text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-colors">
                Modifier
              </button>
            </div>
          </div>

          <!-- ── Édition ── -->
          <form v-else @submit.prevent="updateUser" class="space-y-5">
            <div>
              <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Informations personnelles</p>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Prénom <span class="text-red-500">*</span></label>
                  <input v-model="form.first_name" type="text" required class="field" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Nom <span class="text-red-500">*</span></label>
                  <input v-model="form.last_name" type="text" required class="field" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Email <span class="text-red-500">*</span></label>
                  <input v-model="form.email" type="email" required class="field" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Téléphone</label>
                  <input v-model="form.telephone" type="tel" class="field" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Poste</label>
                  <input v-model="form.poste" type="text" class="field" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Rôle</label>
                  <div v-if="userData?.role === 'superadmin'" class="flex items-center gap-2 h-10">
                    <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">Super Admin</span>
                    <span class="text-xs text-gray-400">(non modifiable)</span>
                  </div>
                  <select v-else v-model="form.role" class="field">
                    <option value="user">Utilisateur</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="border-t border-gray-100 dark:border-gray-700 pt-4">
              <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Affectation &amp; statut</p>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Entrepôt assigné</label>
                  <div v-if="loadingBoutiques" class="field text-gray-400 text-xs">Chargement…</div>
                  <select v-else v-model="form.boutique" class="field">
                    <option :value="null">Aucun entrepôt</option>
                    <option v-for="b in boutiques" :key="b.id" :value="b.id">{{ b.nom }} ({{ b.ville }})</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Statut</label>
                  <select v-model="form.is_active_employee" class="field">
                    <option :value="true">Actif</option>
                    <option :value="false">Inactif</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="flex justify-end gap-3 pt-2">
              <button type="button" @click="isEditing = false" class="px-4 py-2 text-sm border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Annuler</button>
              <button type="submit" :disabled="loading" class="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-colors disabled:opacity-50">
                <svg v-if="loading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                {{ loading ? 'Enregistrement...' : 'Enregistrer' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useNotification } from '@/types/useNotification'
import { useApiBase } from '@/composables/useApiBase'

const props = defineProps<{ isOpen: boolean; user?: any }>()
const emit = defineEmits(['close', 'updated'])

const { getApiUrl, getAuthHeaders } = useApiBase()
const { error, success } = useNotification()

async function apiFetch(path: string, opts: any = {}) {
  return $fetch(getApiUrl(path), { headers: getAuthHeaders(), ...opts })
}

const loading = ref(false)
const loadingBoutiques = ref(false)
const isEditing = ref(false)
const userData = ref<any>(null)
const boutiques = ref<any[]>([])

const form = reactive({
  first_name: '',
  last_name: '',
  email: '',
  telephone: '',
  poste: '',
  role: 'user' as string,
  boutique: null as number | null,
  is_active_employee: true,
})

const personalDetails = computed(() => [
  { label: 'Prénom', value: userData.value?.first_name },
  { label: 'Nom', value: userData.value?.last_name },
  { label: 'Email', value: userData.value?.email },
  { label: 'Téléphone', value: userData.value?.telephone },
  { label: 'Poste', value: userData.value?.poste },
])

function roleBadge(r: string) {
  if (r === 'superadmin') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
  if (r === 'admin')      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
  return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
}

function roleLabel(r: string) {
  return r === 'superadmin' ? 'Super Admin' : r === 'admin' ? 'Admin' : 'Utilisateur'
}

function loadUserData() {
  if (!props.user) return
  userData.value = props.user
  Object.assign(form, {
    first_name: props.user.first_name || '',
    last_name: props.user.last_name || '',
    email: props.user.email || '',
    telephone: props.user.telephone || '',
    poste: props.user.poste || '',
    role: props.user.role || 'user',
    boutique: props.user.boutique ?? null,
    is_active_employee: props.user.is_active_employee !== false,
  })
}

async function loadBoutiques() {
  if (!props.user) return
  // Filtre par l'entreprise de l'utilisateur qu'on édite
  const entrepriseId = props.user.entreprise
  if (!entrepriseId) return
  loadingBoutiques.value = true
  try {
    const res: any = await apiFetch(`/api/boutiques/?entreprise=${entrepriseId}`)
    boutiques.value = res.results ?? (Array.isArray(res) ? res : [])
  } catch {
    boutiques.value = []
  } finally {
    loadingBoutiques.value = false
  }
}

async function updateUser() {
  if (!form.first_name.trim() || !form.last_name.trim() || !form.email.trim()) {
    error('Prénom, nom et email sont obligatoires')
    return
  }
  if (userData.value?.role === 'superadmin' && form.role !== 'superadmin') {
    error('Le rôle Super Admin ne peut pas être modifié')
    return
  }
  loading.value = true
  try {
    await apiFetch(`/api/users/${userData.value.id}/`, {
      method: 'PATCH',
      body: {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        telephone: form.telephone,
        poste: form.poste,
        role: form.role,
        boutique: form.boutique || null,
        is_active_employee: form.is_active_employee,
      },
    })
    success('Utilisateur mis à jour avec succès')
    emit('updated')
    isEditing.value = false
  } catch (err: any) {
    error(err?.data?.detail || err?.data?.email?.[0] || err?.data?.message || 'Erreur lors de la mise à jour')
  } finally {
    loading.value = false
  }
}

watch(() => props.isOpen, (v) => {
  if (v) { loadUserData(); loadBoutiques(); isEditing.value = false }
})
</script>

<style scoped>
.field {
  @apply w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent;
}
</style>
