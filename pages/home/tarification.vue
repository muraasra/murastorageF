<script lang="ts" setup>
definePageMeta({
    layout: "accueil",
})
useSeoMeta({
  title: 'Tarification - Mura Storage',
  description: 'Des offres adaptées à chaque besoin : Gratuit, Pro, et Entreprise. Sans engagement, annulation à tout moment.',
});
</script>
<template>
  <div class="py-16 px-4 md:px-10 lg:px-20 bg-white dark:bg-gray-900 text-gray-800 dark:text-white">
    <div class="text-center mb-12">
      <h1 class="text-4xl font-extrabold text-gray-900 dark:text-white">Tarification</h1>
      <p class="mt-3 text-lg text-gray-600 dark:text-gray-300">Des plans clairs, sans frais cachés. Essai gratuit de 14 jours.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 items-stretch">
      <!-- Free -->
      <div class="p-8 rounded-2xl border dark:border-gray-700 bg-white dark:bg-gray-800 shadow">
        <h2 class="text-xl font-semibold">Free</h2>
        <p class="text-4xl font-extrabold my-4">Gratuit</p>
        <ul class="space-y-2 text-gray-600 dark:text-gray-300">
          <li>✔ 1 entreprise</li>
          <li>✔ 1 boutique</li>
          <li>✔ 2 utilisateurs</li>
          <li>✔ 50 produits</li>
          <li>✔ 100 factures/mois</li>
          <li>✖ Export CSV/Excel</li>
          <li>✖ Import CSV</li>
          <li>✖ Accès API</li>
        </ul>
        <NuxtLink to="/home/inscription" class="block mt-6 px-4 py-3 text-center bg-emerald-600 text-white rounded-xl hover:bg-emerald-700">Essayer</NuxtLink>
      </div>

      <!-- Basic -->
      <div class="p-8 rounded-2xl border dark:border-gray-700 bg-white dark:bg-gray-800 shadow">
        <h2 class="text-xl font-semibold">Basic</h2>
        <p class="text-4xl font-extrabold my-4">15 000 XAF<span class="text-lg font-normal">/mois</span></p>
        <ul class="space-y-2 text-gray-600 dark:text-gray-300">
          <li>✔ 1 entreprise</li>
          <li>✔ 3 boutiques</li>
          <li>✔ 5 utilisateurs</li>
          <li>✔ 500 produits</li>
          <li>✔ 1 000 factures/mois</li>
          <li>✔ Export CSV</li>
          <li>✖ Export Excel</li>
          <li>✖ Import CSV</li>
          <li>✖ Accès API</li>
        </ul>
        <NuxtLink to="/home/inscription" class="block mt-6 px-4 py-3 text-center bg-emerald-600 text-white rounded-xl hover:bg-emerald-700">Choisir</NuxtLink>
      </div>

      <!-- Premium (Recommended) -->
      <div class="p-8 rounded-2xl border-2 border-emerald-600 bg-gradient-to-b from-emerald-600 to-emerald-700 text-white shadow-xl">
        <span class="inline-block px-3 py-1 text-xs font-semibold bg-white/10 rounded-full">Recommandé</span>
        <h2 class="text-xl font-semibold mt-2">Premium</h2>
        <p class="text-4xl font-extrabold my-4">35 000 XAF<span class="text-lg font-normal">/mois</span></p>
        <ul class="space-y-2 text-emerald-50">
          <li>✔ 1 entreprise</li>
          <li>✔ 10 boutiques</li>
          <li>✔ 25 utilisateurs</li>
          <li>✔ Produits illimités</li>
          <li>✔ Factures illimitées</li>
          <li>✔ Export CSV/Excel</li>
          <li>✔ Import CSV</li>
          <li>✖ Accès API</li>
          <li>✔ Analyses avancées</li>
          <li>✔ Support Prioritaire</li>
        </ul>
        <NuxtLink to="/home/inscription" class="block mt-6 px-4 py-3 text-center bg-white text-emerald-700 rounded-xl hover:bg-emerald-50">Commencer</NuxtLink>
      </div>

      <!-- Organisation -->
      <div class="p-8 rounded-2xl border dark:border-gray-700 bg-white dark:bg-gray-800 shadow">
        <h2 class="text-xl font-semibold">Organisation</h2>
        <p class="text-4xl font-extrabold my-4">75 000 XAF<span class="text-lg font-normal">/mois</span></p>
        <ul class="space-y-2 text-gray-600 dark:text-gray-300">
          <li>✔ Entreprises illimitées</li>
          <li>✔ Boutiques illimitées</li>
          <li>✔ Utilisateurs illimités</li>
          <li>✔ Produits illimités</li>
          <li>✔ Factures illimitées</li>
          <li>✔ Export CSV/Excel</li>
          <li>✔ Import CSV</li>
          <li>✔ Accès API</li>
          <li>✔ Analyses avancées</li>
          <li>✔ Support dédié</li>
        </ul>
        <NuxtLink to="/home/contact_accueil" class="block mt-6 px-4 py-3 text-center border-2 border-emerald-600 text-emerald-600 dark:text-emerald-400 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20">Parler à un expert</NuxtLink>
      </div>
    </div>

    <!-- FAQ CTA -->
    <div class="text-center mt-14">
      <p class="text-gray-600 dark:text-gray-300">Des questions ?</p>
      <NuxtLink to="/home/faq" class="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">Consultez la FAQ →</NuxtLink>
    </div>
  </div>
</template>