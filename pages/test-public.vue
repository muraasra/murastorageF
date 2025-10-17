<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          Test Page Publique
        </h1>
        <p class="text-lg text-gray-600">
          Cette page devrait être accessible sans connexion
        </p>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">Statut</h2>
        <div class="space-y-2">
          <p class="text-gray-700">✅ Page publique accessible</p>
          <p class="text-gray-700">✅ Middleware fonctionne</p>
          <p class="text-gray-700">✅ Layout public appliqué</p>
        </div>
        
        <div class="mt-6">
          <NuxtLink 
            to="/home/accueil" 
            class="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
          >
            Aller à l'accueil
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "public",
})
</script>










