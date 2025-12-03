<script lang="ts" setup>
definePageMeta({
    layout: "accueil",
})
useSeoMeta({
  title: 'Services Mura Storage - Gestion Stock, Inventaire, Facturation, Analyses',
  description: 'Découvrez tous nos services Mura Storage : gestion de stock en temps réel, inventaires, facturation, transferts multi-entrepôts, codes-barres, alertes, analyses et rapports, intégrations API, support expert 24/7 par Groupe Mura.',
  ogTitle: 'Services Mura Storage - Solutions Complètes de Gestion de Stock',
  ogDescription: 'Services complets de gestion de stock : suivi temps réel, inventaires, facturation, transferts, codes-barres, alertes, analyses. Support expert Groupe Mura.',
  ogType: 'website',
  ogUrl: 'https://murastorage.netlify.app/home/services',
  ogImage: 'https://murastorage.netlify.app/img/og-image-MuraSrorage.png',
  keywords: 'services gestion stock, fonctionnalités logiciel stock, gestion inventaire services, facturation multi-entrepôts, transferts stock, codes-barres, alertes stock, rapports stock, analyses inventaire, intégrations API stock, support gestion stock, Groupe Mura services',
  robots: 'index, follow',
  canonical: 'https://murastorage.netlify.app/home/services'
});

</script>
<template>
  <div class="py-16 px-4 md:px-10 lg:px-20 bg-white dark:bg-gray-900 text-gray-800 dark:text-white">
    <div class="text-center mb-12">
      <h1 class="text-4xl font-extrabold text-gray-900 dark:text-white">Nos Services</h1>
      <p class="mt-3 text-lg text-gray-600 dark:text-gray-300">Tout pour réussir votre gestion de stock, du suivi aux intégrations.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Gestion des Stocks -->
      <div class="p-8 bg-white dark:bg-gray-800 rounded-2xl shadow border dark:border-gray-700">
        <div class="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center mb-4"></div>
        <h2 class="text-xl font-semibold">Gestion des Stocks</h2>
        <p class="mt-2 text-gray-600 dark:text-gray-300">Suivi en temps réel, alertes, seuils, et inventaires rapides.</p>
      </div>
      <!-- Mouvements & Commandes -->
      <div class="p-8 bg-white dark:bg-gray-800 rounded-2xl shadow border dark:border-gray-700">
        <div class="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4"></div>
        <h2 class="text-xl font-semibold">Mouvements & Commandes</h2>
        <p class="mt-2 text-gray-600 dark:text-gray-300">Transferts, entrées/sorties, historiques et validation multi-niveaux.</p>
      </div>
      <!-- Analyses & Rapports -->
      <div class="p-8 bg-white dark:bg-gray-800 rounded-2xl shadow border dark:border-gray-700">
        <div class="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4"></div>
        <h2 class="text-xl font-semibold">Analyses & Rapports</h2>
        <p class="mt-2 text-gray-600 dark:text-gray-300">Rapports automatiques, export et indicateurs clés de performance.</p>
      </div>
      <!-- Intégrations -->
      <div class="p-8 bg-white dark:bg-gray-800 rounded-2xl shadow border dark:border-gray-700">
        <div class="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center mb-4"></div>
        <h2 class="text-xl font-semibold">Intégrations</h2>
        <p class="mt-2 text-gray-600 dark:text-gray-300">Connecteurs ERP, e-commerce et API pour automatiser vos flux.</p>
      </div>
      <!-- Sécurité & Conformité -->
      <div class="p-8 bg-white dark:bg-gray-800 rounded-2xl shadow border dark:border-gray-700">
        <div class="w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center mb-4"></div>
        <h2 class="text-xl font-semibold">Sécurité & Conformité</h2>
        <p class="mt-2 text-gray-600 dark:text-gray-300">Chiffrement, sauvegardes, et conformité RGPD pour vos données.</p>
      </div>
      <!-- Accompagnement -->
      <div class="p-8 bg-white dark:bg-gray-800 rounded-2xl shadow border dark:border-gray-700">
        <div class="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-4"></div>
        <h2 class="text-xl font-semibold">Accompagnement</h2>
        <p class="mt-2 text-gray-600 dark:text-gray-300">Onboarding, formation et support expert 24/7.</p>
      </div>
    </div>

    <div class="mt-12 text-center">
      <NuxtLink to="/home/inscription" class="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700">Commencer gratuitement</NuxtLink>
      <span class="mx-3 text-gray-500">ou</span>
      <NuxtLink to="/home/contact_accueil" class="px-6 py-3 border-2 border-emerald-600 text-emerald-600 dark:text-emerald-400 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20">Parler à un expert</NuxtLink>
    </div>
  </div>
</template>