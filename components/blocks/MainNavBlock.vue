<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { onClickOutside } from "@vueuse/core";

const { NAVIGATION } = defineProps<{
  NAVIGATION: { name: string; link: string; icon: string; description?: string }[][];
}>();

const search = ref("");
const isLoading = ref(false);
const searchContainer = ref(null);

// Fermer la recherche lorsqu'on clique en dehors
onClickOutside(searchContainer, () => {
  search.value = "";
  isLoading.value = false;
});

// Fonction de recherche optimisée (debounce)
let timeout: NodeJS.Timeout;
watch(search, (newQuery) => {
  clearTimeout(timeout);

  if (!newQuery.trim()) {
    isLoading.value = false;
    return;
  }

  isLoading.value = true;
  timeout = setTimeout(() => {
    isLoading.value = false;
  }, 500);
});

// Filtrage des éléments de navigation
const filteredItems = computed(() => {
  if (!search.value.trim()) return [];
  return NAVIGATION.flatMap((group) =>
    group.filter((item) =>
      item.name.toLowerCase().includes(search.value.toLowerCase())
    )
  );
});
</script>

<template>
  <!-- Barre de recherche -->
  <div ref="searchContainer" class="relative flex-1 flex justify-center px-4">
    <div class="relative w-full max-w-md">
      <input
        v-model="search"
        type="text"
        placeholder="Rechercher un service..."
        class="w-full px-4 py-2 border rounded-md dark:bg-gray-800 dark:text-white dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />

      <!-- Icône de chargement -->
      <div v-if="isLoading" class="absolute right-3 top-2.5">
        <svg class="animate-spin h-5 w-5 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10" stroke-width="4"></circle>
          <path d="M12 2v4M12 20v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M20 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
        </svg>
      </div>

      <!-- Résultats de la recherche -->
      <div
        v-if="search.trim().length > 0"
        class="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-full max-w-md bg-white dark:bg-gray-800 rounded-md shadow-lg border dark:border-gray-600 z-30"
      >
        <!-- Aucun résultat trouvé -->
        <div v-if="!isLoading && filteredItems.length === 0" class="p-4 text-gray-600 dark:text-gray-300 text-center">
          Aucune donnée trouvée.
        </div>

        <!-- Résultats trouvés -->
        <ul v-else class="divide-y divide-gray-200 dark:divide-gray-600 max-h-60 overflow-y-auto">
          <li
            v-for="item in filteredItems"
            :key="item.link"
            class="flex items-center p-4 hover:bg-emerald-500 hover:text-white cursor-pointer transition duration-200"
          >
            <!-- Icône -->
            <UIcon :name="item.icon || 'i-heroicons-home'" class="w-8 h-8 text-emerald-500 dark:text-white mr-3" />

            <!-- Infos -->
            <div class="flex-1">
              <NuxtLink :href="item.link" class="block text-md font-semibold">
                {{ item.name }}
              </NuxtLink>
              <p v-if="item.description" class="text-sm text-gray-600 dark:text-gray-300">
                {{ item.description }}
              </p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>