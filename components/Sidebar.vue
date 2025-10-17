<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { NAVIGATION_ITEMS, NAVIGATION_ITEMS_ADMIN, NAVIGATION_ITEMS_SUPERADMIN } from "~/constants";

const role = ref<string | null>(null)

onMounted(() => {
  if (process.client) {
    try {
      const user = localStorage.getItem('user')
      role.value = user ? JSON.parse(user)?.role || null : null
    } catch (e) {
      role.value = null
    }
  }
})

const navItems = computed(() => {
  if (role.value === 'superadmin') return NAVIGATION_ITEMS_ADMIN
  if (role.value === 'admin') return NAVIGATION_ITEMS_ADMIN
  return NAVIGATION_ITEMS
})
</script>
<template>
  <div
    class="hidden z-10 md:block fixed w-[250px] h-full py-5 px-2 border-r dark:border-r-gray-600 border-r-gray-200"
  >
    <div class="flex items-center justify-center">
      <NuxtLink href="/" class="text-lg md:text-2xl font-extrabold pb-3"
        ><span class="text-green-500">Entreprise</span></NuxtLink>
    </div>
    <div class="px-1 mt-4">
      <div
        v-for="navigation in navItems"
        class="space-y-1 mb-3 pb-3 border-b last:border-b-0 dark:border-b-gray-600 border-b-gray-200"
      >
        <NuxtLink
          active-class="bg-green-500 text-white"
          v-for="nav in navigation"
          :href="nav.link"
          class="flex items-center gap-x-2 cursor-pointer px-4 py-4 hover:bg-green-500 rounded-md hover:text-white transition-all"
        >
          <UIcon :name="nav.icon" class="w-5 h-5" />
          <span class="text-sm">{{ nav.name }}</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
