<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from '#imports'
import { NAVIGATION_ITEMS, NAVIGATION_ITEMS_ADMIN, NAVIGATION_ITEMS_SUPERADMIN } from '~/constants'
import type { NavGroup } from '~/constants'
import { useAuthStore } from '~/stores/auth'
import { useLogoutConfirm } from '~/composables/useLogoutConfirm'

const auth = useAuthStore()
const { requestLogout } = useLogoutConfirm()
const route = useRoute()

const role = ref<string | null>(null)
const boutiqueSelected = ref(false)
const showSheet = ref(false)

onMounted(() => {
  if (!process.client) return
  try {
    const user = localStorage.getItem('user')
    role.value = user ? JSON.parse(user)?.role || null : null
    boutiqueSelected.value = !!localStorage.getItem('boutique')
  } catch { role.value = null }
})

const navGroups = computed((): NavGroup[] => {
  if (role.value === 'superadmin') {
    return boutiqueSelected.value ? NAVIGATION_ITEMS_ADMIN : NAVIGATION_ITEMS_SUPERADMIN
  }
  if (role.value === 'admin') return NAVIGATION_ITEMS_ADMIN
  return NAVIGATION_ITEMS
})

// Tous les items navigables (sans Logout)
const allItems = computed(() =>
  navGroups.value.flatMap(g => g.items).filter(i => i.link && i.name !== 'Logout')
)

// 4 raccourcis fixes selon le rÃ´le â€” les plus utilisÃ©s
const pinnedLinks = computed(() => {
  if (role.value === 'superadmin' && !boutiqueSelected.value) return [
    '/superadmin/dashboard',
    '/stock_produit',
    '/facturation',
    '/analytics',
  ]
  if (role.value === 'superadmin' || role.value === 'admin') return [
    '/admin',
    '/stock_produit',
    '/facturation',
    '/analytics',
  ]
  return [
    '/stock_produit',
    '/mouvements-stock',
    '/facturation',
    '/analytics',
  ]
})

const pinnedItems = computed(() =>
  pinnedLinks.value
    .map(link => allItems.value.find(i => i.link === link))
    .filter(Boolean) as typeof allItems.value
)

const isActive = (link: string) => route.path === link || route.path.startsWith(link + '/')

// Fermer la sheet + rafraÃ®chir rÃ´le/boutique Ã  chaque navigation
watch(() => route.path, () => {
  showSheet.value = false
  if (!process.client) return
  try {
    const user = localStorage.getItem('user')
    role.value = user ? JSON.parse(user)?.role || null : null
    boutiqueSelected.value = !!localStorage.getItem('boutique')
  } catch { /* ignore */ }
})
</script>

<template>
  <!-- Barre fixe en bas â€” 4 raccourcis + bouton "Menu" -->
  <nav class="fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-t border-gray-200 dark:border-gray-700 md:hidden safe-area-pb">
    <div class="flex items-stretch justify-around h-16">
      <!-- 4 raccourcis fixes -->
      <NuxtLink
        v-for="item in pinnedItems"
        :key="item.link"
        :to="item.link"
        class="flex flex-col items-center justify-center flex-1 px-1 py-2 text-[10px] font-medium transition-colors"
        :class="isActive(item.link)
          ? 'text-emerald-600 dark:text-emerald-400'
          : 'text-gray-500 dark:text-gray-400'"
      >
        <div class="relative">
          <UIcon :name="item.icon" class="w-6 h-6 mb-0.5" />
          <span v-if="isActive(item.link)" class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-emerald-500 rounded-full" />
        </div>
        <span class="truncate max-w-[56px] leading-tight mt-0.5">{{ item.name.split(' ')[0] }}</span>
      </NuxtLink>

      <!-- Bouton "Menu" -->
      <button
        @click="showSheet = true"
        class="flex flex-col items-center justify-center flex-1 px-1 py-2 text-[10px] font-medium transition-colors"
        :class="showSheet ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'"
      >
        <div class="relative">
          <UIcon name="i-heroicons-squares-2x2" class="w-6 h-6 mb-0.5" />
          <span v-if="showSheet" class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-emerald-500 rounded-full" />
        </div>
        <span class="mt-0.5">Menu</span>
      </button>
    </div>
  </nav>

  <!-- Bottom Sheet â€” tous les menus groupÃ©s -->
  <Teleport to="body">
    <Transition name="sheet">
      <div v-if="showSheet" class="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
        <!-- Overlay -->
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showSheet = false" />

        <!-- Sheet -->
        <div class="relative bg-white dark:bg-gray-900 rounded-t-2xl max-h-[80vh] flex flex-col shadow-2xl">
          <!-- PoignÃ©e -->
          <div class="flex justify-center pt-3 pb-1 flex-shrink-0">
            <div class="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
          </div>

          <!-- Header -->
          <div class="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
            <h2 class="text-base font-bold text-gray-900 dark:text-white">Navigation</h2>
            <button @click="showSheet = false" class="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <UIcon name="i-heroicons-x-mark" class="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <!-- Contenu scrollable -->
          <div class="overflow-y-auto flex-1 px-4 pb-8 pt-2">
            <template v-for="(group, gi) in navGroups" :key="gi">
              <!-- Titre de groupe -->
              <div v-if="group.label" class="mt-4 mb-2 first:mt-2">
                <p class="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 px-1">
                  {{ group.label }}
                </p>
              </div>
              <div v-else-if="gi > 0" class="border-t border-gray-100 dark:border-gray-800 my-3" />

              <!-- Items du groupe -->
              <div class="grid grid-cols-3 gap-2">
                <template v-for="item in group.items" :key="item.link || item.name">
                  <!-- DÃ©connexion -->
                  <button
                    v-if="item.name === 'Logout'"
                    @click="requestLogout()"
                    class="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 transition-colors"
                  >
                    <UIcon :name="item.icon" class="w-6 h-6" />
                    <span class="text-[10px] font-medium text-center leading-tight">DÃ©connexion</span>
                  </button>

                  <!-- Lien normal -->
                  <NuxtLink
                    v-else
                    :to="item.link"
                    class="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-colors"
                    :class="isActive(item.link)
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                      : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'"
                  >
                    <UIcon :name="item.icon" class="w-6 h-6" />
                    <span class="text-[10px] font-medium text-center leading-tight line-clamp-2">{{ item.name }}</span>
                  </NuxtLink>
                </template>
              </div>
            </template>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.sheet-enter-active { transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1); }
.sheet-leave-active { transition: transform 0.25s ease-in; }
.sheet-enter-from, .sheet-leave-to { transform: translateY(100%); }

/* Safe area iOS */
.safe-area-pb { padding-bottom: env(safe-area-inset-bottom, 0px); }
</style>

