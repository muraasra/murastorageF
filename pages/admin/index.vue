<script setup lang="ts">

</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-10 max-w-xl w-full text-center">
      <h1 class="text-3xl md:text-4xl font-extrabold mb-4 text-blue-600 dark:text-blue-400">
        Bienvenue sur le Dashboard<br>
        <span class="text-gray-800 dark:text-gray-200">Admin</span>
        <span class="block text-base font-normal text-gray-400 dark:text-gray-500 mt-2">
          Gestionnaire de stock {{ entrepriseData?.nom || 'StoRage' }}
        </span>
      </h1>
      <p class="mb-8 text-gray-600 dark:text-gray-400">
        Vous pouvez gerer  de la plateforme ici.<br>
        Utilisez le menu à gauche pour accéder aux fonctionnalités qui vous ont été attribué.
      </p>
    </div>
  </div>
</template>