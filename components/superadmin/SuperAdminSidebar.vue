<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useLogoutConfirm } from '~/composables/useLogoutConfirm'
import { useLocale } from '~/composables/useLocale'
import { useNavTranslate } from '~/composables/useNavTranslate'
import { NAVIGATION_ITEMS_SUPERADMIN } from '~/constants'
import { useApiBase } from '@/composables/useApiBase'

const auth = useAuthStore()
const { requestLogout } = useLogoutConfirm()
const { t } = useLocale()
const { tNav, tNavLabel } = useNavTranslate()
const { getApiUrl, getAuthHeaders } = useApiBase()
const boutiqueData = ref<any>(null)
const lowStockCount = ref(0)

onMounted(async () => {
  if (!process.client) return
  try {
    const boutique = localStorage.getItem('boutique')
    if (boutique) boutiqueData.value = JSON.parse(boutique)
  } catch {}
  if (boutiqueData.value?.id) {
    try {
      const raw: any = await $fetch(getApiUrl(`/api/stocks/?entrepot=${boutiqueData.value.id}`), { headers: getAuthHeaders() })
      const stocks: any[] = Array.isArray(raw) ? raw : (raw?.results ?? [])
      lowStockCount.value = stocks.filter((s: any) => (s.quantite || 0) > 0 && (s.quantite || 0) < 10).length
    } catch {}
  }
})

const isLogout = (item: any) => item.name === 'Logout'
</script>

<template>
  <div class="hidden md:flex flex-col z-10 fixed w-[250px] h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 overflow-hidden">
    <!-- Brand + badge SuperAdmin -->
    <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
      <NuxtLink to="/superadmin/dashboard" class="flex items-center min-w-0">
        <img src="/img/logo-mura-storage.png" alt="MuRa StoRage" class="h-9 w-auto object-contain" />
      </NuxtLink>
      <span class="ml-2 flex-shrink-0 text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 px-2 py-0.5 rounded-full whitespace-nowrap uppercase tracking-wide">
        Super Admin
      </span>
    </div>

    <!-- Navigation thématique -->
    <nav class="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
      <template v-for="(group, gi) in NAVIGATION_ITEMS_SUPERADMIN" :key="gi">
        <!-- Label de groupe -->
        <div v-if="group.label" class="pt-3 pb-1">
          <p class="px-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
            {{ tNavLabel(group.label) }}
          </p>
        </div>
        <div v-else-if="gi > 0" class="border-t border-gray-100 dark:border-gray-800 my-2" />

        <template v-for="item in group.items" :key="item.link || item.name">
          <!-- Déconnexion -->
          <button
            v-if="isLogout(item)"
            @click="requestLogout()"
            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors mt-1"
          >
            <UIcon :name="item.icon" class="w-5 h-5 flex-shrink-0" />
            <span class="text-sm font-medium">{{ t('nav.logout') }}</span>
          </button>

          <!-- Lien normal â€” amber active pour superadmin -->
          <NuxtLink
            v-else
            :to="item.link"
            active-class="bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 font-semibold"
            class="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <div class="flex items-center gap-3 min-w-0">
              <UIcon :name="item.icon" class="w-5 h-5 flex-shrink-0" />
              <span class="text-sm truncate">{{ tNav(item.name) }}</span>
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

