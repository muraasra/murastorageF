<script lang="ts" setup>
definePageMeta({
    layout: "accueil",
})
useSeoMeta({
  title: 'Tarification Mura Storage - Plans Gratuit, Basic, Premium | Essai 3 Mois Gratuit',
  description: 'Découvrez nos plans de tarification Mura Storage : Gratuit (3 mois), Basic, Premium et Organisation. Plans adaptés à chaque entreprise. Sans engagement, essai gratuit 3 mois. Gestion de stock multi-entrepôts, facturation, inventaires, transferts.',
  ogTitle: 'Tarification Mura Storage - Plans et Prix',
  ogDescription: 'Plans de tarification flexibles pour la gestion de stock : Gratuit, Basic, Premium, Organisation. Essai gratuit 3 mois sans engagement.',
  ogType: 'website',
  ogUrl: 'https://murastorage.netlify.app/home/tarification',
  ogImage: 'https://murastorage.netlify.app/img/og-image-MuraSrorage.png',
  keywords: 'tarification Mura Storage, prix logiciel stock, tarif gestion stock, plan gratuit stock, essai gratuit gestion stock, logiciel stock prix, abonnement gestion stock, plan Basic Premium, logiciel inventaire prix, solution stock entreprise prix, gestion stock Cameroun prix, logiciel stock Afrique tarif',
  robots: 'index, follow',
  canonical: 'https://murastorage.netlify.app/home/tarification'
});
</script>
<template>
  <div class="py-16 px-4 md:px-10 lg:px-20 bg-white dark:bg-gray-900 text-gray-800 dark:text-white">
    <div class="text-center mb-12">
      <h1 class="text-4xl font-extrabold text-gray-900 dark:text-white">Tarification</h1>
      <p class="mt-3 text-lg text-gray-600 dark:text-gray-300">Des plans clairs, sans frais cachés. Essai gratuit de 3 mois.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 items-stretch">
      <!-- Free -->
      <div class="p-8 rounded-2xl border dark:border-gray-700 bg-white dark:bg-gray-800 shadow">
        <h2 class="text-xl font-semibold">Free</h2>
        <p class="text-sm font-semibold text-emerald-600 dark:text-emerald-400">3 mois gratuits</p>
        <p class="text-4xl font-extrabold my-4">0 XAF</p>
        <ul class="space-y-2 text-gray-600 dark:text-gray-300">
          <li>✔ 1 entreprise</li>
          <li>✔ 1 boutique</li>
          <li>✔ 2 utilisateurs</li>
          <li>✔ 15 produits</li>
          <li>✔ 100 factures</li>
          <li>✖ Inventaires</li>
          <li>✖ Transferts</li>
          <li>✖ Codes-barres</li>
          <li>✖ Import/Export</li>
        </ul>
        <NuxtLink to="/home/inscription" class="block mt-6 px-4 py-3 text-center bg-emerald-600 text-white rounded-xl hover:bg-emerald-700">Essayer</NuxtLink>
      </div>

      <!-- Basic -->
      <div class="p-8 rounded-2xl border dark:border-gray-700 bg-white dark:bg-gray-800 shadow">
        <h2 class="text-xl font-semibold">Basic</h2>
        <p class="text-4xl font-extrabold my-4">9 900 XAF<span class="text-lg font-normal">/mois</span></p>
        <ul class="space-y-2 text-gray-600 dark:text-gray-300">
          <li>✔ 1 entreprise</li>
          <li>✔ 2 boutiques</li>
          <li>✔ 3 utilisateurs</li>
          <li>✔ 100 produits</li>
          <li>✔ 500 factures/mois</li>
          <li>✔ 25 transferts/mois</li>
          <li>✔ Codes-barres</li>
          <li>✔ Alertes</li>
          <li>✔ Import/Export CSV/Excel</li>
        </ul>
        <NuxtLink to="/home/inscription" class="block mt-6 px-4 py-3 text-center bg-emerald-600 text-white rounded-xl hover:bg-emerald-700">Choisir</NuxtLink>
      </div>

      <!-- Premium (Recommended) -->
      <div class="p-8 rounded-2xl border-2 border-emerald-600 bg-gradient-to-b from-emerald-600 to-emerald-700 text-white shadow-xl">
        <span class="inline-block px-3 py-1 text-xs font-semibold bg-white/10 rounded-full">Recommandé</span>
        <h2 class="text-xl font-semibold mt-2">Premium</h2>
        <p class="text-4xl font-extrabold my-4">29 000 XAF<span class="text-lg font-normal">/mois</span></p>
        <ul class="space-y-2 text-emerald-50">
          <li>✔ 1 entreprise</li>
          <li>✔ 5 boutiques</li>
          <li>✔ 10 utilisateurs</li>
          <li>✔ 500 produits</li>
          <li>✔ 2 000 factures/mois</li>
          <li>✔ 1 inventaire/mois</li>
          <li>✔ 100 transferts/mois</li>
          <li>✔ Codes-barres illimités</li>
          <li>✔ Alertes avancées</li>
          <li>✔ Support prioritaire</li>
        </ul>
        <NuxtLink to="/home/inscription" class="block mt-6 px-4 py-3 text-center bg-white text-emerald-700 rounded-xl hover:bg-emerald-50">Commencer</NuxtLink>
      </div>

      <!-- Organisation -->
      <div class="p-8 rounded-2xl border dark:border-gray-700 bg-white dark:bg-gray-800 shadow">
        <h2 class="text-xl font-semibold">Organisation</h2>
        <p class="text-4xl font-extrabold my-4">55 000 XAF<span class="text-lg font-normal">/mois</span></p>
        <ul class="space-y-2 text-gray-600 dark:text-gray-300">
          <li>✔ Entreprises illimitées</li>
          <li>✔ Boutiques illimitées</li>
          <li>✔ Utilisateurs illimités</li>
          <li>✔ Produits illimités</li>
          <li>✔ Factures illimitées</li>
          <li>✔ Inventaires illimités</li>
          <li>✔ API accès</li>
          <li>✔ Support dédié</li>
          <li>✔ Personnalisable</li>
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
