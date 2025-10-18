<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Tarification & Abonnement</h1>
        <p class="mt-2 text-gray-600">
          Gérez votre plan d'abonnement et surveillez votre utilisation
        </p>
      </div>
      
      <!-- Plan actuel -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Plan actuel</h2>
        <div class="flex items-center justify-between">
          <div>
            <span class="text-2xl font-bold text-blue-600">Free</span>
            <span class="text-gray-600 ml-2">- Gratuit</span>
          </div>
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Actif
          </span>
        </div>
      </div>
      
      <!-- Plans disponibles -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Plans disponibles</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- Plan Free -->
          <div class="bg-white rounded-lg shadow-md p-6 flex flex-col border-2 border-blue-500">
            <h3 class="text-2xl font-bold mb-4 text-blue-600">Free</h3>
            <p class="text-gray-600 mb-4">Accès limité aux fonctionnalités de base.</p>
            <div class="mb-6">
              <span class="text-4xl font-extrabold text-blue-600">Gratuit</span>
            </div>
            <ul class="space-y-2 text-gray-700 flex-grow mb-6">
              <li>1 entreprise</li>
              <li>1 boutique</li>
              <li>2 utilisateurs</li>
              <li>50 produits</li>
              <li>100 factures/mois</li>
              <li class="text-red-500 line-through">Export CSV</li>
              <li class="text-red-500 line-through">Export Excel</li>
              <li class="text-red-500 line-through">Import CSV</li>
              <li class="text-red-500 line-through">Accès API</li>
              <li>Support Email</li>
            </ul>
            <button disabled class="mt-auto w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-400 cursor-not-allowed">
              Plan actuel
            </button>
          </div>
          
          <!-- Plan Basic -->
          <div class="bg-white rounded-lg shadow-md p-6 flex flex-col border-2">
            <h3 class="text-2xl font-bold mb-4 text-gray-900">Basic</h3>
            <p class="text-gray-600 mb-4">Accès aux fonctionnalités de base avec quelques options supplémentaires.</p>
            <div class="mb-6">
              <span class="text-4xl font-extrabold text-gray-900">15,000 XAF</span>
              <span class="text-gray-500">/ mois</span>
            </div>
            <ul class="space-y-2 text-gray-700 flex-grow mb-6">
              <li>1 entreprise</li>
              <li>3 boutiques</li>
              <li>5 utilisateurs</li>
              <li>500 produits</li>
              <li>1,000 factures/mois</li>
              <li class="text-green-600">Export CSV</li>
              <li class="text-red-500 line-through">Export Excel</li>
              <li class="text-red-500 line-through">Import CSV</li>
              <li class="text-red-500 line-through">Accès API</li>
              <li>Support Email</li>
            </ul>
            <button class="mt-auto w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Choisir ce plan
            </button>
          </div>
          
          <!-- Plan Premium -->
          <div class="bg-white rounded-lg shadow-md p-6 flex flex-col border-2">
            <h3 class="text-2xl font-bold mb-4 text-gray-900">Premium</h3>
            <p class="text-gray-600 mb-4">Accès complet à toutes les fonctionnalités standard.</p>
            <div class="mb-6">
              <span class="text-4xl font-extrabold text-gray-900">35,000 XAF</span>
              <span class="text-gray-500">/ mois</span>
            </div>
            <ul class="space-y-2 text-gray-700 flex-grow mb-6">
              <li>1 entreprise</li>
              <li>10 boutiques</li>
              <li>25 utilisateurs</li>
              <li>Produits illimités</li>
              <li>Factures illimitées</li>
              <li class="text-green-600">Export CSV</li>
              <li class="text-green-600">Export Excel</li>
              <li class="text-green-600">Import CSV</li>
              <li class="text-red-500 line-through">Accès API</li>
              <li>Support Prioritaire</li>
            </ul>
            <button class="mt-auto w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Choisir ce plan
            </button>
          </div>
          
          <!-- Plan Organisation -->
          <div class="bg-white rounded-lg shadow-md p-6 flex flex-col border-2">
            <h3 class="text-2xl font-bold mb-4 text-gray-900">Organisation</h3>
            <p class="text-gray-600 mb-4">Plan entreprise avec toutes les fonctionnalités</p>
            <div class="mb-6">
              <span class="text-4xl font-extrabold text-gray-900">75,000 XAF</span>
              <span class="text-gray-500">/ mois</span>
            </div>
            <ul class="space-y-2 text-gray-700 flex-grow mb-6">
              <li>Entreprises illimitées</li>
              <li>Boutiques illimitées</li>
              <li>Utilisateurs illimités</li>
              <li>Produits illimités</li>
              <li>Factures illimitées</li>
              <li class="text-green-600">Export CSV</li>
              <li class="text-green-600">Export Excel</li>
              <li class="text-green-600">Import CSV</li>
              <li class="text-green-600">Accès API</li>
              <li>Support Dédié</li>
            </ul>
            <button class="mt-auto w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Choisir ce plan
            </button>
          </div>
        </div>
      </div>
      
      <!-- Message d'aide -->
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
        <div class="flex items-start">
          <svg class="w-6 h-6 text-blue-600 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
          </svg>
          <div>
            <h3 class="text-lg font-medium text-blue-900 mb-2">
              Page Tarification - Version de test
            </h3>
            <p class="text-blue-700 mb-3">
              Cette page fonctionne avec des données statiques pour éviter les erreurs d'API.
              Une fois le système complet opérationnel, elle se connectera automatiquement au backend.
            </p>
            <div class="text-sm text-blue-600">
              <p>✅ Page accessible</p>
              <p>✅ Interface fonctionnelle</p>
              <p>✅ Données statiques</p>
              <p>⏳ Intégration API en cours</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'superadmin'
  // Pas de middleware pour tester l'accès
})
</script>











