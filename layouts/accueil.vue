
<script lang="ts" setup>
import AccueilHeader from "~/components/home/AccueilHeader.vue";
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <AccueilHeader/>
    <main class="flex-1">
      <slot />
    </main>
    <footer class="bg-gray-100 dark:bg-gray-900 py-8 px-4">
      <div class="max-w-6xl mx-auto text-center">
        <div class="mb-4">
          <NuxtLink href="/home/accueil" class="text-2xl font-bold text-emerald-500">
            Mura<span class="text-gray-800 dark:text-white">Storage</span>
          </NuxtLink>
        </div>
        <p class="text-gray-600 dark:text-gray-300 mb-4">
          © 2025 Tous droits réservés. Conçu par durel-<NuxtLink href="https://tayou.netlify.app" target="_blank" rel="noopener noreferrer" class="text-emerald-600 hover:underline">tayou</NuxtLink>
        </p>
      </div>
    </footer>
  </div>
</template>
