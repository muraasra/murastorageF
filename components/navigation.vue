<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from '#imports'
import {
  NAVIGATION_ITEMS,
  NAVIGATION_ITEMS_ADMIN,
  NAVIGATION_ITEMS_SUPERADMIN
} from '~/constants'

const role = ref<string | null>(null)
const route = useRoute()

onMounted(() => {
  if (!process.client) return
  try {
    const user = localStorage.getItem('user')
    role.value = user ? JSON.parse(user)?.role || null : null
  } catch {
    role.value = null
  }
})

const navGroups = computed(() => {
  if (role.value === 'superadmin') return NAVIGATION_ITEMS_SUPERADMIN
  if (role.value === 'admin') return NAVIGATION_ITEMS_ADMIN
  return NAVIGATION_ITEMS
})

// Aplatir les groupes et enlever les entrées sans lien (ex: Logout vide)
const items = computed(() =>
  navGroups.value
    .flat()
    .filter((item) => item.link && item.name !== 'Logout')
)

const isActive = (link: string) => {
  return route.path === link
}
</script>

<template>
  <!-- Navigation mobile fixe en bas de l'écran -->
  <nav
    class="fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-gray-900/95 border-t border-gray-200 dark:border-gray-700 md:hidden"
  >
    <div class="flex items-center justify-around px-1.5 py-1.5">
      <NuxtLink
        v-for="item in items"
        :key="item.link"
        :to="item.link"
        class="flex flex-col items-center justify-center px-1.5 py-1 rounded-lg text-[11px] leading-tight"
        :class="
          isActive(item.link)
            ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30'
            : 'text-gray-500 dark:text-gray-400'
        "
      >
        <UIcon :name="item.icon" class="w-5 h-5 mb-0.5" />
        <span class="truncate max-w-[80px]">
          {{ item.name }}
        </span>
      </NuxtLink>
    </div>
  </nav>
</template>
