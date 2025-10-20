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
  if (role.value === 'superadmin') return NAVIGATION_ITEMS_SUPERADMIN.flat()
  if (role.value === 'admin') return NAVIGATION_ITEMS_ADMIN.flat()
  return NAVIGATION_ITEMS.flat()
})
</script>
<template>
  <div
    class="hidden z-10 md:block fixed w-[250px] h-full py-5 px-2 border-r dark:border-r-gray-600 border-r-gray-200 
    overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-500"
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
          :href="navigation.link"
          class="flex items-center gap-x-2 cursor-pointer px-4 py-4 hover:bg-green-500 rounded-md hover:text-white transition-all"
        >
          <UIcon :name="navigation.icon" class="w-5 h-5" />
          <span class="text-sm">{{ navigation.name }}</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Styles personnalisés pour la scrollbar */
.scrollbar-thin {
  scrollbar-width: thin;
}

.scrollbar-track-transparent {
  scrollbar-color: transparent transparent;
}

.scrollbar-thumb-gray-400 {
  scrollbar-color: rgb(156 163 175) transparent;
}

.hover\:scrollbar-thumb-gray-500:hover {
  scrollbar-color: rgb(107 114 128) transparent;
}

/* Pour WebKit (Chrome, Safari, Edge) */
.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background-color: rgb(156 163 175);
  border-radius: 3px;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background-color: rgb(107 114 128);
}
</style>
