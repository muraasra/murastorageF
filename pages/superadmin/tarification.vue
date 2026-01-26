<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Tarification & Abonnement</h1>
            <p class="mt-2 text-gray-600 dark:text-gray-400">
              Gérez votre plan d'abonnement et surveillez votre utilisation
            </p>
          </div>
          <div class="flex items-center gap-4">
            <button 
              @click="refreshData"
              :disabled="loading"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <svg v-if="loading" class="animate-spin h-4 w-4 mr-2 inline" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Actualiser
            </button>
          </div>
        </div>
      </div>
      
      <!-- Loading state -->
      <div v-if="loading" class="flex items-center justify-center py-24">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
        <div class="flex items-start">
          <svg class="w-5 h-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM9 7a1 1 0 012 0v4a1 1 0 11-2 0V7zm1 8a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" clip-rule="evenodd" />
          </svg>
          <div>
            <p class="font-medium">Erreur lors du chargement des données</p>
            <p class="text-sm">{{ error }}</p>
            <button @click="refreshData" class="mt-3 px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700">Réessayer</button>
          </div>
        </div>
      </div>

      <div v-else class="space-y-8">
        
        <!-- Plan actuel et utilisation -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <!-- Carte du plan actuel -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">Plan actuel</h2>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {{ currentPlan ? (currentPlan.display_name || currentPlan.name) : 'Free' }}
              </span>
            </div>
            
            <div class="space-y-4">
              <div class="flex justify-between items-baseline">
                <span class="text-3xl font-bold text-gray-900 dark:text-white">
                  {{ !currentPlan ? 'Gratuit' : (currentPlan.price === 0 ? 'Gratuit' : `${formatPrice ? formatPrice(currentPlan.price) : currentPlan.price} XAF`) }}
                </span>
                <span v-if="currentPlan && currentPlan.price > 0" class="text-gray-600 dark:text-gray-400">/mois</span>
              </div>
              
              <!-- Informations d'abonnement -->
              <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Informations d'abonnement</h3>
                <div class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div class="flex justify-between">
                    <span>Statut:</span>
                    <span class="font-medium text-green-600">Actif</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Début:</span>
                    <span class="font-medium">{{ formatDate(subscriptionStartDate) || 'N/A' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Fin (estimée):</span>
                    <span class="font-medium">{{ formatDate(subscriptionEndDate) || 'N/A' }}</span>
                  </div>
                </div>
              </div>
              
              <!-- Fonctionnalités -->
              <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Fonctionnalités incluses</h3>
                <div class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div v-for="feature in (currentPlan?.features || staticPlans.free.features)" :key="feature.name" class="flex items-center">
                    <svg 
                      class="w-4 h-4 mr-2" 
                      :class="feature.included ? 'text-green-500' : 'text-red-500'" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path 
                        v-if="feature.included" 
                        fill-rule="evenodd" 
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                        clip-rule="evenodd"
                      />
                      <path 
                        v-else 
                        fill-rule="evenodd" 
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
                        clip-rule="evenodd"
                      />
                    </svg>
                    <span :class="feature.included ? 'text-gray-700 dark:text-gray-300' : 'text-red-500 line-through'">
                      {{ feature.name }}
                    </span>
                  </div>
                </div>
              </div>
              
              <!-- Bouton renouveler si plan != free -->
              <div v-if="currentPlan && currentPlan.name !== 'free'" class="pt-4 border-t border-gray-200 mt-4">
                <button
                  @click="handleRenew"
                  :disabled="loading || extending"
                  class="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {{ extending ? 'Renouvellement...' : 'Renouveler 30 jours' }}
                </button>
              </div>
            </div>
          </div>
          
          <!-- Utilisation -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">Utilisation actuelle</h2>
              <div class="flex items-center space-x-2">
                <div v-if="usageData.length > 0" class="flex items-center text-green-600">
                  <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  <span class="text-xs">Données réelles</span>
                </div>
                <div v-else class="flex items-center text-orange-600">
                  <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                  </svg>
                  <span class="text-xs">Données estimées</span>
                </div>
              </div>
            </div>
            
            <div v-if="displayUsageData.length" class="space-y-6">
              <div v-for="usage in displayUsageData" :key="usage.name" class="mb-4">
                <div class="flex justify-between items-center mb-1">
                  <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ usage.name }}</span>
                  <span class="text-sm text-gray-500 dark:text-gray-400">
                    {{ usage.current }} / {{ usage.limit === 'unlimited' ? 'Illimité' : usage.limit }}
                    <span v-if="usage.isLimitReached" class="text-red-500 ml-1">(Limite atteinte)</span>
                  </span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    class="h-2.5 rounded-full"
                    :class="usage.progressBarClass"
                    :style="{ width: usage.progressBarWidth }"
                  ></div>
                </div>
              </div>
            </div>
            <div v-else class="text-sm text-gray-500 dark:text-gray-400">
              <div class="mb-4">
                <div class="flex justify-between items-center mb-1">
                  <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Utilisateurs</span>
                  <span class="text-sm text-gray-500 dark:text-gray-400">Chargement...</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2.5">
                  <div class="h-2.5 rounded-full bg-gray-400 animate-pulse" style="width: 30%"></div>
                </div>
              </div>
              <div class="mb-4">
                <div class="flex justify-between items-center mb-1">
                  <span class="text-sm font-medium text-gray-700">Boutiques/Entrepôts</span>
                  <span class="text-sm text-gray-500">Chargement...</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2.5">
                  <div class="h-2.5 rounded-full bg-gray-400 animate-pulse" style="width: 20%"></div>
                </div>
              </div>
              <div class="mb-4">
                <div class="flex justify-between items-center mb-1">
                  <span class="text-sm font-medium text-gray-700">Produits</span>
                  <span class="text-sm text-gray-500">Chargement...</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2.5">
                  <div class="h-2.5 rounded-full bg-gray-400 animate-pulse" style="width: 15%"></div>
                </div>
              </div>
              <div class="mb-4">
                <div class="flex justify-between items-center mb-1">
                  <span class="text-sm font-medium text-gray-700">Factures ce mois</span>
                  <span class="text-sm text-gray-500">Chargement...</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2.5">
                  <div class="h-2.5 rounded-full bg-gray-400 animate-pulse" style="width: 10%"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Plans disponibles -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Plans disponibles</h2>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <!-- Plan Free -->
            <div class="rounded-lg shadow-md p-6 flex flex-col border-2" :class="isCurrent(staticPlans.free) ? 'bg-gray-100 dark:bg-gray-700 border-gray-400 dark:border-gray-600' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-2xl font-bold" :class="isCurrent(staticPlans.free) ? 'text-gray-600 dark:text-gray-300' : 'text-gray-900 dark:text-white'">
                  Free
                </h3>
                <span v-if="isCurrent(staticPlans.free)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
                  Plan actuel
                </span>
              </div>
              <p class="text-gray-600 dark:text-gray-400 mb-4">Accès limité aux fonctionnalités de base.</p>
              <div class="mb-6">
                <span class="text-4xl font-extrabold" :class="isCurrent(staticPlans.free) ? 'text-gray-600 dark:text-gray-300' : 'text-gray-900 dark:text-white'">
                  Gratuit
                </span>
              </div>
              <ul class="space-y-2 text-gray-700 dark:text-gray-300 flex-grow mb-6">
                <li class="flex items-center">
                  <svg class="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  1 entreprise
                </li>
                <li class="flex items-center">
                  <svg class="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  1 boutique
                </li>
                <li class="flex items-center">
                  <svg class="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  2 utilisateurs
                </li>
                <li class="flex items-center">
                  <svg class="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  15 produits
                </li>
                <li class="flex items-center">
                  <svg class="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  100 factures/mois
                </li>
                <li class="flex items-center">
                  <svg class="w-5 h-5 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                  </svg>
                  <span class="text-red-500 line-through">Export CSV</span>
                </li>
                <li class="flex items-center">
                  <svg class="w-5 h-5 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                  </svg>
                  <span class="text-red-500 line-through">Export Excel</span>
                </li>
                <li class="flex items-center">
                  <svg class="w-5 h-5 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                  </svg>
                  <span class="text-red-500 line-through">Import CSV</span>
                </li>
                <li class="flex items-center">
                  <svg class="w-5 h-5 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                  </svg>
                  <span class="text-red-500 line-through">Accès API</span>
                </li>
                <li class="flex items-center">
                  <svg class="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  Support Email
                </li>
              </ul>
              <button
                v-if="!isCurrent(staticPlans.free)"
                @click="handleUpgrade('free')"
                :disabled="loading"
                class="mt-auto w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {{ loading ? 'Mise à niveau...' : 'Choisir ce plan' }}
              </button>
              <button
                v-else
                disabled
                class="mt-auto w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-400 cursor-not-allowed"
              >
                Plan actuel
              </button>
            </div>
            
            <!-- Plan Basic -->
            <div class="rounded-lg shadow-md p-6 flex flex-col border-2" :class="isCurrent(staticPlans.basic) ? 'bg-gray-100 border-gray-400' : 'bg-white border-gray-200'">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-2xl font-bold" :class="isCurrent(staticPlans.basic) ? 'text-gray-600' : 'text-gray-900'">
                  Basic
                </h3>
                <span v-if="isCurrent(staticPlans.basic)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
                  Plan actuel
                </span>
              </div>
              <p class="text-gray-600 mb-4">Accès aux fonctionnalités de base avec quelques options supplémentaires.</p>
              <div class="mb-6">
                <span class="text-4xl font-extrabold" :class="isCurrent(staticPlans.basic) ? 'text-gray-600' : 'text-gray-900'">
                  9,900 XAF
                </span>
                <span class="text-gray-500">/ mois</span>
              </div>
              <ul class="space-y-2 text-gray-700 flex-grow mb-6">
                <li class="flex items-center">
                  <svg class="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  1 entreprise
                </li>
                <li class="flex items-center">
                  <svg class="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  2 boutiques
                </li>
                <li class="flex items-center">
                  <svg class="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  3 utilisateurs
                </li>
                <li class="flex items-center">
                  <svg class="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  100 produits
                </li>
                <li class="flex items-center">
                  <svg class="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  1,000 factures/mois
                </li>
                <li class="flex items-center">
                  <svg class="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  <span class="text-green-600">Export CSV</span>
                </li>
                <li class="flex items-center">
                  <svg class="w-5 h-5 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                  </svg>
                  <span class="text-red-500 line-through">Export Excel</span>
                </li>
                <li class="flex items-center">
                  <svg class="w-5 h-5 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                  </svg>
                  <span class="text-red-500 line-through">Import CSV</span>
                </li>
                <li class="flex items-center">
                  <svg class="w-5 h-5 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                  </svg>
                  <span class="text-red-500 line-through">Accès API</span>
                </li>
                <li class="flex items-center">
                  <svg class="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  Support Email
                </li>
              </ul>
              <button
                v-if="!isCurrent(staticPlans.basic)"
                @click="handleUpgrade('basic')"
                :disabled="loading"
                class="mt-auto w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {{ loading ? 'Mise à niveau...' : 'Choisir ce plan' }}
              </button>
              <button
                v-else
                disabled
                class="mt-auto w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-400 cursor-not-allowed"
              >
                Plan actuel
              </button>
            </div>
            
            <!-- Plan Premium -->
            <div class="rounded-lg shadow-md p-6 flex flex-col border-2" :class="isCurrent(staticPlans.premium) ? 'bg-gray-100 border-gray-400' : 'bg-white border-gray-200'">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-2xl font-bold" :class="isCurrent(staticPlans.premium) ? 'text-gray-600' : 'text-gray-900'">
                  Premium
                </h3>
                <span v-if="isCurrent(staticPlans.premium)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
                  Plan actuel
                </span>
              </div>
              <p class="text-gray-600 mb-4">Accès complet à toutes les fonctionnalités standard.</p>
              <div class="mb-6">
                <span class="text-4xl font-extrabold" :class="isCurrent(staticPlans.premium) ? 'text-gray-600' : 'text-gray-900'">
                  29,000 XAF
                </span>
                <span class="text-gray-500">/ mois</span>
              </div>
              <ul class="space-y-2 text-gray-700 flex-grow mb-6">
                <li class="flex items-center">
                  <svg class="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  1 entreprise
                </li>
                <li class="flex items-center">
                  <svg class="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  5 boutiques
                </li>
                <li class="flex items-center">
                  <svg class="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  10 utilisateurs
                </li>
                <li class="flex items-center">
                  <svg class="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  500 produits
                </li>
                <li class="flex items-center">
                  <svg class="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  2,000 factures/mois
                </li>
                <li class="flex items-center">
                  <svg class="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  1 inventaire/mois
                </li>
                <li class="flex items-center">
                  <svg class="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  100 transferts/mois
                </li>
                <li class="flex items-center">
                  <svg class="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  Codes-barres illimités
                </li>
                <li class="flex items-center">
                  <svg class="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  Alertes avancées
                </li>
                <li class="flex items-center">
                  <svg class="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  <span class="text-green-600">Export CSV</span>
                </li>
                <li class="flex items-center">
                  <svg class="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  <span class="text-green-600">Export Excel</span>
                </li>
                <li class="flex items-center">
                  <svg class="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  <span class="text-green-600">Import CSV</span>
                </li>
                <li class="flex items-center">
                  <svg class="w-5 h-5 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                  </svg>
                  <span class="text-red-500 line-through">Accès API</span>
                </li>
                <li class="flex items-center">
                  <svg class="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  Support prioritaire
                </li>
              </ul>
              <button
                v-if="!isCurrent(staticPlans.premium)"
                @click="handleUpgrade('premium')"
                :disabled="loading"
                class="mt-auto w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {{ loading ? 'Mise à niveau...' : 'Choisir ce plan' }}
              </button>
              <button
                      v-else 
                disabled
                class="mt-auto w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-400 cursor-not-allowed"
              >
                Plan actuel
              </button>
            </div>
            
            <!-- Plan Organisation -->
            <div class="rounded-lg shadow-md p-6 flex flex-col border-2" :class="isCurrent(staticPlans.organisation) ? 'bg-gray-100 border-gray-400' : 'bg-white border-gray-200'">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-2xl font-bold" :class="isCurrent(staticPlans.organisation) ? 'text-gray-600' : 'text-gray-900'">
                  Organisation
                </h3>
                <span v-if="isCurrent(staticPlans.organisation)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
                  Plan actuel
                </span>
              </div>
              <p class="text-gray-600 mb-4">Plan entreprise avec toutes les fonctionnalités</p>
              <div class="mb-6">
                <span class="text-4xl font-extrabold" :class="isCurrent(staticPlans.organisation) ? 'text-gray-600' : 'text-gray-900'">
                  55,000 XAF
                </span>
                <span class="text-gray-500">/ mois</span>
              </div>
              <ul class="space-y-2 text-gray-700 flex-grow mb-6">
                <li class="flex items-center">
                  <svg class="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  Entreprises illimitées
                </li>
                <li class="flex items-center">
                  <svg class="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  Boutiques illimitées
                </li>
                <li class="flex items-center">
                  <svg class="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  Utilisateurs illimités
                </li>
                <li class="flex items-center">
                  <svg class="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  Produits illimités
                </li>
                <li class="flex items-center">
                  <svg class="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  Factures illimitées
                </li>
                <li class="flex items-center">
                  <svg class="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  <span class="text-green-600">Export CSV</span>
                </li>
                <li class="flex items-center">
                  <svg class="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  <span class="text-green-600">Export Excel</span>
                </li>
                <li class="flex items-center">
                  <svg class="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  <span class="text-green-600">Import CSV</span>
                </li>
                <li class="flex items-center">
                  <svg class="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  <span class="text-green-600">Accès API</span>
                </li>
                <li class="flex items-center">
                  <svg class="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  Support Dédié
                </li>
              </ul>
              <button
                v-if="!isCurrent(staticPlans.organisation)"
                @click="handleUpgrade('organisation')"
                :disabled="loading"
                class="mt-auto w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {{ loading ? 'Mise à niveau...' : 'Choisir ce plan' }}
              </button>
              <button
                v-else
                disabled
                class="mt-auto w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-400 cursor-not-allowed"
              >
                Plan actuel
              </button>
            </div>
          </div>
        </div>
        
        
      </div>
    </div>

    <!-- Modale confirmation upgrade -->
    <div v-if="showConfirmUpgrade" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h3 class="text-lg font-semibold mb-2">Confirmer le changement de plan</h3>
        <p class="text-gray-600 mb-6">Voulez-vous vraiment changer vers le plan <strong>{{ pendingPlanName }}</strong> maintenant ?</p>
        <div class="flex justify-end gap-3">
          <button class="px-4 py-2 rounded border" @click="closeUpgradeConfirm" :disabled="loading">Annuler</button>
          <button class="px-4 py-2 rounded bg-blue-600 text-white" @click="confirmUpgradeNow" :disabled="loading">
            {{ loading ? 'Traitement...' : 'Confirmer' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modale confirmation renouvellement -->
    <div v-if="showConfirmRenew" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h3 class="text-lg font-semibold mb-2">Confirmer le renouvellement</h3>
        <p class="text-gray-600 mb-6">Renouveler l'abonnement de 30 jours ?</p>
        <div class="flex justify-end gap-3">
          <button class="px-4 py-2 rounded border" @click="closeRenewConfirm" :disabled="loading">Annuler</button>
          <button class="px-4 py-2 rounded bg-green-600 text-white" @click="confirmRenewNow" :disabled="loading">
            {{ loading ? 'Traitement...' : 'Renouveler' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSubscription } from '@/composables/useSubscription'
import { useNotification } from '@/types/useNotification'

const { success: showSuccess, error: showError } = useNotification()

definePageMeta({
  layout: 'superadmin'
})

// Variable supprimée car nous affichons maintenant tous les plans

const {
  loading,
  error,
  currentPlan,
  currentUsage,
  availablePlans,
  formatPrice,
  subscriptionStartDate,
  subscriptionEndDate,
  refresh,
  upgradeSubscription
} = useSubscription()

// Charger les plans depuis l'API
const apiPlans = ref<any[]>([])
const extending = ref(false)
const showConfirmUpgrade = ref(false)
const showConfirmRenew = ref(false)
const pendingPlanId = ref<number | null>(null)
const pendingPlanName = ref('')

// Load plans from API
const loadPlans = async () => {
  try {
    const { API_BASE_URL } = await import('@/constants')
    const { useApi } = await import('@/stores/useApi')
    const { data, error: err } = await useApi(`${API_BASE_URL}/api/subscription-plans/`, {
      method: 'GET',
      server: false,
      cacheTTL: 5 * 60 * 1000
    })
    if (err.value) {
      console.error('[LoadPlans] Error:', err.value)
      throw err.value
    }
    apiPlans.value = (data.value as any[]) || []
    console.log('[LoadPlans] Plans chargés:', apiPlans.value.map(p => ({ id: p.id, name: p.name, display_name: p.display_name })))
  } catch (e) {
    console.error('[LoadPlans] Exception:', e)
  }
}

// Plans statiques comme fallback
const staticPlans = ref({
  free: {
    id: 'free',
    name: 'free',
    display_name: 'Free',
    description: 'Plan gratuit pour 3 mois - Accès limité aux fonctionnalités de base.',
    price: 0,
    features: [
      { name: '1 entreprise', included: true },
      { name: '1 boutique', included: true },
      { name: '2 utilisateurs', included: true },
      { name: '15 produits', included: true },
      { name: '100 factures', included: true },
      { name: 'Inventaires', included: false },
      { name: 'Transferts', included: false },
      { name: 'Codes-barres', included: false },
      { name: 'Partenaires', included: false },
      { name: 'Import/Export', included: false }
    ]
  },
  basic: {
    id: 'basic',
    name: 'basic',
    display_name: 'Basic',
    description: 'Accès aux fonctionnalités de base avec quelques options supplémentaires.',
    price: 9900,
    features: [
      { name: '1 entreprise', included: true },
      { name: '2 boutiques', included: true },
      { name: '3 utilisateurs', included: true },
      { name: '100 produits', included: true },
      { name: '500 factures/mois', included: true },
      { name: '25 transferts/mois', included: true },
      { name: 'Codes-barres', included: true },
      { name: 'Alertes', included: true },
      { name: 'Partenaires', included: true },
      { name: 'Import/Export CSV/Excel', included: true }
    ]
  },
  premium: {
    id: 'premium',
    name: 'premium',
    display_name: 'Premium',
    description: 'Accès complet à toutes les fonctionnalités standard.',
    price: 29000,
    features: [
      { name: '1 entreprise', included: true },
      { name: '5 boutiques', included: true },
      { name: '10 utilisateurs', included: true },
      { name: '500 produits', included: true },
      { name: '2,000 factures/mois', included: true },
      { name: '1 inventaire/mois', included: true },
      { name: '100 transferts/mois', included: true },
      { name: 'Codes-barres illimités', included: true },
      { name: 'Alertes avancées', included: true },
      { name: 'Gestion partenaires avancée', included: true },
      { name: 'Import/Export complets', included: true }
    ]
  },
  organisation: {
    id: 'organisation',
    name: 'organisation',
    display_name: 'Organisation',
    description: 'Plan personnalisable avec accès illimité',
    price: 55000,
    features: [
      { name: 'Entreprises illimitées', included: true },
      { name: 'Boutiques illimitées', included: true },
      { name: 'Utilisateurs illimités', included: true },
      { name: 'Produits illimités', included: true },
      { name: 'Factures illimitées', included: true },
      { name: 'Export CSV', included: true },
      { name: 'Export Excel', included: true },
      { name: 'Import CSV', included: true },
      { name: 'Accès API', included: true },
      { name: 'Support Dédié', included: true }
    ]
  }
})

// Normaliser les données d'utilisation pour l'affichage
const usageData = computed(() => {
  const raw = currentUsage.value as any
  const arr: any[] = Array.isArray(raw)
    ? raw
    : raw && typeof raw === 'object'
      ? Object.keys(raw).map(k => ({ name: k, ...(raw as any)[k] }))
      : []

  return arr.map((u: any) => {
    const name = u.name || u.label || 'Ressource'
    const current = Number(u.current ?? u.value ?? 0) || 0
    const limitRaw = u.limit ?? u.max
    const isUnlimited = limitRaw === undefined || limitRaw === null || limitRaw === 'unlimited'
    const limit = isUnlimited ? 'unlimited' as const : Number(limitRaw) || 0
    const pct = isUnlimited || limit === 0 ? 0 : Math.min(100, Math.round((current / (limit as number)) * 100))
    return {
      name,
      current,
      limit,
      isLimitReached: !isUnlimited && current >= (limit as number),
      progressBarClass: pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-yellow-500' : 'bg-green-500',
      progressBarWidth: `${pct}%`
    }
  })
})

// Données d'utilisation de fallback plus réalistes
const fallbackUsageData = ref([
  {
    name: 'Utilisateurs',
    current: 1,
    limit: 2,
    isLimitReached: false,
    progressBarClass: 'bg-green-500',
    progressBarWidth: '50%'
  },
  {
    name: 'Boutiques/Entrepôts',
    current: 1,
    limit: 1,
    isLimitReached: false,
    progressBarClass: 'bg-green-500',
    progressBarWidth: '100%'
  },
  {
    name: 'Produits',
    current: 15,
    limit: 50,
    isLimitReached: false,
    progressBarClass: 'bg-green-500',
    progressBarWidth: '30%'
  },
  {
    name: 'Factures ce mois',
    current: 25,
    limit: 100,
    isLimitReached: false,
    progressBarClass: 'bg-green-500',
    progressBarWidth: '25%'
  }
])

// Utiliser les données réelles ou les données de fallback
const displayUsageData = computed(() => {
  if (usageData.value && usageData.value.length > 0) {
    return usageData.value
  }
  return fallbackUsageData.value
})

// Methods
function isCurrent(plan: any) {
  // Pour cette démonstration, considérer que l'utilisateur est toujours sur le plan Free
  // Vous pouvez modifier cette logique selon vos besoins
  if (plan?.id === 'free') {
    return true // Toujours considérer Free comme le plan actuel
  }
  
  // Logique pour les autres plans si nécessaire
  if (!currentPlan.value) {
    return false
  }
  return plan?.id === currentPlan.value.id || plan?.id === currentPlan.value.name
}

async function handleUpgrade(planId: string) {
  // Trouver le plan dans les plans API
  const plan = apiPlans.value.find(p => p.name === planId || p.display_name?.toLowerCase() === planId.toLowerCase())
  if (!plan) {
    console.error('[Upgrade] Plan introuvable dans apiPlans:', planId, 'Plans disponibles:', apiPlans.value.map(p => ({ id: p.id, name: p.name, display_name: p.display_name })))
    return
  }
  
  pendingPlanId.value = plan.id
  pendingPlanName.value = plan.display_name || plan.name
  showConfirmUpgrade.value = true
}

function closeUpgradeConfirm() {
  showConfirmUpgrade.value = false
  pendingPlanId.value = null
  pendingPlanName.value = ''
}

async function confirmUpgradeNow() {
  if (!pendingPlanId.value) return
  loading.value = true
  try {
    const { API_BASE_URL } = await import('@/constants')
    const { useApi } = await import('@/stores/useApi')
    const { data, error: err } = await useApi(`${API_BASE_URL}/api/subscriptions/upgrade/`, {
      method: 'POST',
      body: { plan_id: pendingPlanId.value },
      server: false
    })
    console.log('[Upgrade] Request body:', { plan_id: pendingPlanId.value })
    console.log('[Upgrade] Response:', data.value)
    if (err.value) {
      console.error('[Upgrade] Error:', err.value)
      showError(err.value.message || 'Erreur lors du changement de plan')
      throw err.value
    }
    
    // Message de succès
    const responseData = data.value as any
    showSuccess(responseData?.message || `Plan changé vers ${pendingPlanName.value} avec succès !`)
    
    // Invalider le cache frontend et recharger
    if (process.client) {
      const nuxtApp = useNuxtApp()
      if (nuxtApp.$invalidateCacheByPattern) {
        nuxtApp.$invalidateCacheByPattern('/api/subscriptions')
        nuxtApp.$invalidateCacheByPattern('/api/produits')
      }
      // Invalider aussi via useApi si disponible
      try {
        const { useApi } = await import('@/stores/useApi')
        // useApi invalide automatiquement lors des appels POST/PUT/DELETE
      } catch {}
    }
    
    await refresh()
  } catch (e: any) {
    console.error('[Upgrade] Exception:', e)
    if (!e.message || !e.message.includes('Erreur')) {
      showError('Erreur lors du changement de plan. Vérifiez la console pour plus de détails.')
    }
  } finally {
    showConfirmUpgrade.value = false
    pendingPlanId.value = null
    pendingPlanName.value = ''
    loading.value = false
  }
}

function handleRenew() {
  showConfirmRenew.value = true
}

function closeRenewConfirm() {
  showConfirmRenew.value = false
}

async function confirmRenewNow() {
  extending.value = true
  try {
    const { API_BASE_URL } = await import('@/constants')
    const { useApi } = await import('@/stores/useApi')
    const { data, error: err } = await useApi(`${API_BASE_URL}/api/subscriptions/extend/`, {
      method: 'POST',
      body: { days: 30 },
      server: false
    })
    console.log('[Renew] Response:', data.value)
    if (err.value) {
      console.error('[Renew] Error:', err.value)
      showError(err.value.message || 'Erreur lors du renouvellement')
      return
    }
    
    // Message de succès
    const responseData = data.value as any
    showSuccess(responseData?.message || 'Abonnement renouvelé de 30 jours avec succès !')
    
    // Invalider le cache frontend et recharger
    if (process.client) {
      const nuxtApp = useNuxtApp()
      if (nuxtApp.$invalidateCacheByPattern) {
        nuxtApp.$invalidateCacheByPattern('subscriptions')
      }
    }
    
    await refresh()
  } catch (e: any) {
    console.error('[Renew] Exception:', e)
    if (!e.message || !e.message.includes('Erreur')) {
      showError('Erreur lors du renouvellement. Vérifiez la console pour plus de détails.')
    }
  } finally {
    showConfirmRenew.value = false
    extending.value = false
  }
}

async function refreshData() {
  try {
    await refresh()
    // Forcer le chargement des données d'utilisation si elles ne sont pas disponibles
    if (!currentUsage.value || currentUsage.value.length === 0) {
      console.log('Données d\'utilisation manquantes, tentative de récupération...')
      // Essayer de récupérer les données d'utilisation directement
      const { useApi } = await import('@/stores/useApi')
      const { API_BASE_URL } = await import('@/constants')
      
      try {
        const { data: usageData, error: usageError } = await useApi(`${API_BASE_URL}/api/subscriptions/usage/`, { 
          method: 'GET', 
          server: false, 
          cacheTTL: 5 * 60 * 1000 
        })
        
        if (!usageError.value && usageData.value) {
          console.log('Données d\'utilisation récupérées:', usageData.value)
          // Les données seront automatiquement mises à jour via le composable
        } else {
          console.warn('Erreur lors de la récupération des données d\'utilisation:', usageError.value)
        }
      } catch (err) {
        console.warn('Impossible de récupérer les données d\'utilisation:', err)
      }
    }
  } catch (err) {
    console.error('Erreur lors du rafraîchissement:', err)
  }
}

onMounted(() => {
  refresh()
  loadPlans()
})

function formatDate(d: any) {
  if (!d) return 'N/A'
  try {
    const date = new Date(d)
    return date.toLocaleDateString('fr-FR')
  } catch { return 'N/A' }
}
</script>