<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { NAVIGATION_ITEMS, NAVIGATION_ITEMS_ADMIN, NAVIGATION_ITEMS_SUPERADMIN } from '~/constants'
import type { NavGroup } from '~/constants'
import { useApiBase } from '@/composables/useApiBase'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const { getApiUrl, getAuthHeaders } = useApiBase()

const role = ref<string | null>(null)
const boutiqueData = ref<any>(null)
const lowStockCount = ref(0)

onMounted(async () => {
  if (!process.client) return
  try {
    const user = localStorage.getItem('user')
    role.value = user ? JSON.parse(user)?.role || null : null
    const boutique = localStorage.getItem('boutique')
    if (boutique) boutiqueData.value = JSON.parse(boutique)
  } catch { role.value = null }

  if (boutiqueData.value?.id) {
    try {
      const raw: any = await $fetch(getApiUrl(`/api/stocks/?entrepot=${boutiqueData.value.id}`), { headers: getAuthHeaders() })
      const stocks: any[] = Array.isArray(raw) ? raw : (raw?.results ?? [])
      lowStockCount.value = stocks.filter((s: any) => (s.quantite || 0) > 0 && (s.quantite || 0) < 10).length
    } catch {}
  }
})

const navGroups = computed((): NavGroup[] => {
  if (role.value === 'superadmin') return NAVIGATION_ITEMS_SUPERADMIN
  if (role.value === 'admin') return NAVIGATION_ITEMS_ADMIN
  return NAVIGATION_ITEMS
})

const isLogout = (item: any) => item.name === 'Logout'
</script>

<template>
  <div class="hidden md:flex flex-col z-10 fixed w-[250px] h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 overflow-y-auto scrollbar-thin">
    <!-- Logo -->
    <div class="flex items-center px-4 py-4 border-b border-gray-100 dark:border-gray-800">
      <NuxtLink href="/user" class="flex items-center">
        <img src="/img/logo-mura-storage.png" alt="MuRa StoRage" class="h-9 w-auto object-contain" />
      </NuxtLink>
    </div>

    <!-- Groupes thématiques -->
    <nav class="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
      <template v-for="(group, gi) in navGroups" :key="gi">
        <!-- Séparateur + label de groupe -->
        <div v-if="group.label" class="pt-3 pb-1 first:pt-1">
          <p class="px-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
            {{ group.label }}
          </p>
        </div>
        <div v-else-if="gi > 0" class="border-t border-gray-100 dark:border-gray-800 my-2" />

        <template v-for="item in group.items" :key="item.link || item.name">
          <!-- Déconnexion -->
          <button
            v-if="isLogout(item)"
            @click="auth.logout()"
            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors mt-1"
          >
            <UIcon :name="item.icon" class="w-5 h-5 flex-shrink-0" />
            <span class="text-sm font-medium">Déconnexion</span>
          </button>

          <!-- Lien normal -->
          <NuxtLink
            v-else
            :to="item.link"
            active-class="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-semibold"
            class="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <div class="flex items-center gap-3 min-w-0">
              <UIcon :name="item.icon" class="w-5 h-5 flex-shrink-0" />
              <span class="text-sm truncate">{{ item.name }}</span>
            </div>
            <span
              v-if="item.link === '/stock_produit' && lowStockCount > 0"
              class="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold bg-red-500 text-white rounded-full"
            >{{ lowStockCount > 99 ? '99+' : lowStockCount }}</span>
          </NuxtLink>
        </template>
      </template>
    </nav>

    <div class="px-4 py-3 border-t border-gray-100 dark:border-gray-800">
      <p class="text-xs text-gray-400 dark:text-gray-600 text-center">Mura Storage v1.0</p>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-thin { scrollbar-width: thin; }
.scrollbar-thin::-webkit-scrollbar { width: 5px; }
.scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
.scrollbar-thin::-webkit-scrollbar-thumb { background-color: rgb(209 213 219); border-radius: 3px; }
.scrollbar-thin::-webkit-scrollbar-thumb:hover { background-color: rgb(156 163 175); }
</style>
