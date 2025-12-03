<script setup lang="ts">
definePageMeta({
    layout: "accueil",
  });
import Avis from "~/components/home/Avis.vue";
import { useMuraTracking } from '@/composables/useMuraTracking'

// Métadonnées SEO optimisées avec composable
import { useSeo, createWebPageStructuredData, createWebSiteStructuredData } from '@/composables/useSeo'

useSeo({
  title: 'Mura Storage - Gestion Stock Multi-Entrepôts | Essai Gratuit',
  description: 'Solution complète de gestion de stock, inventaire et facturation pour entreprises. Multi-entrepôts, codes-barres, alertes. Essai gratuit 14 jours. Sécurité RGPD, support 24/7.',
  keywords: 'gestion de stock, logiciel stock, inventaire, facturation, gestion entrepôt, multi-entrepôts, codes-barres, transfert stock, alertes stock, Mura Storage, Groupe Mura, ERP stock, suivi stock, gestion inventaire, logiciel facturation, gestion produits, stock management, inventory management, warehouse management, point de vente, POS, Cameroun, Afrique, logiciel stock Cameroun, gestion stock Afrique',
  canonical: 'https://murastorage.netlify.app/home/accueil',
  structuredData: createWebPageStructuredData(
    'Mura Storage - Gestion Stock Multi-Entrepôts',
    'Solution complète de gestion de stock, inventaire et facturation pour entreprises',
    'https://murastorage.netlify.app/home/accueil'
  )
});

// Structured Data WebSite
const websiteStructuredData = createWebSiteStructuredData()
useHead({
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify(websiteStructuredData)
    }
  ]
});

// Tracking Google Analytics
const { trackHomePage } = useMuraTracking()

onMounted(() => {
  trackHomePage()
})
</script>

<template>
  <div class="w-full h-full">
    <!-- Hero Section -->
    <section class="relative bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden -z-20">
    <!-- Background Shapes -->
      <div class="absolute inset-0">
    <div class="absolute top-0 left-0 w-full h-full">
          <svg class="w-full h-full" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path fill="#10B981" fill-opacity="0.1" d="M0,192L48,192C96,192,192,192,288,176C384,160,480,128,576,138.7C672,149,768,203,864,208C960,213,1056,171,1152,144C1248,117,1344,107,1392,101.3L1440,96L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
          </svg>
        </div>
        <!-- Floating elements -->
        <div class="absolute top-20 left-10 w-20 h-20 bg-emerald-200 rounded-full opacity-20 animate-pulse -z-10"></div>
        <div class="absolute top-40 right-20 w-16 h-16 bg-blue-200 rounded-full opacity-20 animate-pulse delay-1000 -z-10"></div>
        <div class="absolute bottom-20 left-1/4 w-12 h-12 bg-green-200 rounded-full opacity-20 animate-pulse delay-2000 -z-10"></div>
      </div>
      
      <div class="relative z-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <!-- Content -->
          <div class="text-center lg:text-left">
            <div class="inline-flex items-center px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-6">
              <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              Solution de gestion de stock professionnelle
            </div>
            
            <h1 class="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-6">
              Mura
              <span class="text-transparent bg-clip-text bg-gradient-to-br from-emerald-500 to-blue-600">
                Storage
              </span>
              <br>
              <span class="text-2xl md:text-3xl lg:text-4xl font-normal text-gray-600 dark:text-gray-300">
                par Groupe Mura
              </span>
            </h1>
            
            <p class="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto lg:mx-0">
              Optimisez votre gestion de stock avec Mura Storage, la plateforme moderne propulsée par Groupe Mura.
              Suivez vos inventaires, gérez vos mouvements et maximisez votre efficacité opérationnelle.
            </p>
            
            <!-- CTA Buttons -->
            <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
              <NuxtLink 
                to="/home/inscription" 
                class="inline-flex items-center justify-center px-8 py-4 bg-emerald-600 text-white rounded-xl shadow-lg hover:bg-emerald-700 transition-all duration-300 transform hover:scale-105 font-semibold text-lg"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
                Commencer gratuitement
              </NuxtLink>
              
              <NuxtLink 
                to="/home/contact_accueil" 
                class="inline-flex items-center justify-center px-8 py-4 border-2 border-emerald-600 text-emerald-600 dark:text-emerald-400 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all duration-300 font-semibold text-lg"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
                Nous contacter
              </NuxtLink>
            </div>
            
            <!-- Trust indicators -->
            <div class="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 text-sm text-gray-500 dark:text-gray-400">
              <div class="flex items-center">
                <svg class="w-5 h-5 mr-2 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                Essai gratuit 14 jours
              </div>
              <div class="flex items-center">
                <svg class="w-5 h-5 mr-2 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                Support 24/7 Groupe Mura
              </div>
              <div class="flex items-center">
                <svg class="w-5 h-5 mr-2 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                Sécurité RGPD et conformité
              </div>
            </div>
          </div>
          
          <!-- Image/Illustration -->
          <div class="relative">
            <div class="relative z-0">
              <img 
                src="../../public/img/undraw_finance_m6vw_1_-removebg-preview.png" 
                alt="Mura Storage - Gestion de stock moderne" 
                class="w-full max-w-lg mx-auto lg:max-w-none"
              >
            </div>
            <!-- Floating cards -->
            <div class="absolute -top-4 -left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <div class="flex items-center space-x-2">
                <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Stock en temps réel</span>
              </div>
            </div>
            <div class="absolute -bottom-4 -right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
              <div class="flex items-center space-x-2">
                <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Rapports automatiques</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing Preview Section (aligned with backend) -->
    <section class="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Plans adaptés à votre croissance</h2>
          <p class="text-lg text-gray-600 dark:text-gray-300">Free, Basic, Premium et Organisation en XAF.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <!-- Free -->
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow p-8">
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Free</h3>
            <p class="text-3xl font-extrabold mt-3 text-gray-900 dark:text-white">Gratuit</p>
            <ul class="mt-6 space-y-2 text-gray-600 dark:text-gray-300">
              <li>1 entreprise, 1 boutique</li>
              <li>2 utilisateurs, 50 produits</li>
              <li>100 factures/mois</li>
            </ul>
            <NuxtLink to="/home/inscription" class="mt-6 inline-block w-full text-center px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700">Essayer</NuxtLink>
          </div>

          <!-- Basic -->
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow p-8">
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Basic</h3>
            <p class="text-3xl font-extrabold mt-3 text-gray-900 dark:text-white">15 000 XAF<span class="text-lg font-normal">/mois</span></p>
            <ul class="mt-6 space-y-2 text-gray-600 dark:text-gray-300">
              <li>3 boutiques, 5 utilisateurs</li>
              <li>500 produits</li>
              <li>1 000 factures/mois</li>
            </ul>
            <NuxtLink to="/home/inscription" class="mt-6 inline-block w-full text-center px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700">Choisir</NuxtLink>
          </div>

          <!-- Premium -->
          <div class="bg-gradient-to-b from-emerald-600 to-emerald-700 text-white rounded-2xl shadow-xl p-8 border-2 border-emerald-500">
            <div class="inline-block px-3 py-1 text-xs font-semibold bg-white/10 rounded-full">Le plus populaire</div>
            <h3 class="text-xl font-semibold mt-3">Premium</h3>
            <p class="text-3xl font-extrabold mt-3">35 000 XAF<span class="text-lg font-normal">/mois</span></p>
            <ul class="mt-6 space-y-2 text-emerald-50">
              <li>10 boutiques, 25 utilisateurs</li>
              <li>Produits et factures illimités</li>
              <li>Exports CSV/Excel, import CSV</li>
            </ul>
            <NuxtLink to="/home/inscription" class="mt-6 inline-block w-full text-center px-6 py-3 bg-white text-emerald-700 rounded-xl hover:bg-emerald-50">Commencer</NuxtLink>
          </div>

          <!-- Organisation -->
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow p-8">
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Organisation</h3>
            <p class="text-3xl font-extrabold mt-3 text-gray-900 dark:text-white">75 000 XAF<span class="text-lg font-normal">/mois</span></p>
            <ul class="mt-6 space-y-2 text-gray-600 dark:text-gray-300">
              <li>Entreprises/boutiques/utilisateurs illimités</li>
              <li>Exports/Imports et API</li>
              <li>Analyses avancées, support dédié</li>
            </ul>
            <NuxtLink to="/home/contact_accueil" class="mt-6 inline-block w-full text-center px-6 py-3 border-2 border-emerald-600 text-emerald-600 dark:text-emerald-400 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20">Parler à un expert</NuxtLink>
          </div>
        </div>

        <div class="text-center mt-10">
          <NuxtLink to="/home/tarification" class="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline">Voir le détail des offres →</NuxtLink>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-16 md:py-24 bg-white dark:bg-gray-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Pourquoi choisir Mura Storage ?
          </h2>
          <p class="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Une solution complète pour moderniser votre gestion de stock et optimiser vos opérations
          </p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- Feature 1 -->
          <div class="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl p-8 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div class="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center mb-6">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Suivi en temps réel</h3>
            <p class="text-gray-600 dark:text-gray-300">
              Surveillez vos stocks en temps réel avec des alertes automatiques et des tableaux de bord intuitifs.
            </p>
          </div>
          
          <!-- Feature 2 -->
          <div class="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-8 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div class="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Tarification flexible</h3>
            <p class="text-gray-600 dark:text-gray-300">
              Choisissez le plan qui correspond à vos besoins, du gratuit aux solutions entreprise complètes.
            </p>
          </div>
          
          <!-- Feature 3 -->
          <div class="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-8 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div class="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-6">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Sécurité garantie</h3>
            <p class="text-gray-600 dark:text-gray-300">
              Vos données sont protégées avec un chiffrement de niveau bancaire et une conformité RGPD totale.
            </p>
    </div>
    
          <!-- Feature 4 -->
          <div class="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-8 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div class="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-6">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Performance optimisée</h3>
            <p class="text-gray-600 dark:text-gray-300">
              Interface rapide et responsive, optimisée pour tous les appareils et navigateurs modernes.
            </p>
          </div>
          
          <!-- Feature 5 -->
          <div class="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-xl p-8 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div class="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center mb-6">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z"></path>
                    </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Intégrations multiples</h3>
            <p class="text-gray-600 dark:text-gray-300">
              Connectez-vous facilement avec vos outils existants : ERP, comptabilité, e-commerce.
            </p>
                </div>
          
          <!-- Feature 6 -->
          <div class="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl p-8 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div class="w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center mb-6">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Support expert</h3>
            <p class="text-gray-600 dark:text-gray-300">
              Équipe de support dédiée disponible 24/7 pour vous accompagner dans votre réussite.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="py-16 md:py-24 bg-gradient-to-r from-emerald-600 to-blue-600">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">
            Des résultats qui parlent
          </h2>
          <p class="text-xl text-emerald-100 max-w-3xl mx-auto">
            Rejoignez des milliers d'entreprises qui font confiance à Mura Srorage
          </p>
        </div>
        
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div class="text-center">
            <div class="text-4xl md:text-5xl font-bold text-white mb-2">500+</div>
            <div class="text-emerald-100">Entreprises satisfaites</div>
          </div>
          <div class="text-center">
            <div class="text-4xl md:text-5xl font-bold text-white mb-2">45+</div>
            <div class="text-emerald-100">Créations d'entreprises</div>
          </div>
          <div class="text-center">
            <div class="text-4xl md:text-5xl font-bold text-white mb-2">5+</div>
            <div class="text-emerald-100">Années d'expérience</div>
          </div>
          <div class="text-center">
            <div class="text-4xl md:text-5xl font-bold text-white mb-2">99.9%</div>
            <div class="text-emerald-100">Disponibilité</div>
          </div>
            </div>
      </div>
    </section>

    <!-- Contact Section -->
    <section class="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Prêt à transformer votre gestion de stock ?
          </h2>
          <p class="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Contactez-nous dès aujourd'hui pour découvrir comment Mura Storage peut optimiser vos opérations
          </p>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <!-- Contact Info -->
          <div class="space-y-8">
            <div class="flex items-start space-x-4">
              <div class="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Téléphone</h3>
                <p class="text-gray-600 dark:text-gray-300">+237 658 934 147</p>
              </div>
            </div>
            
            <div class="flex items-start space-x-4">
              <div class="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Email</h3>
                <p class="text-gray-600 dark:text-gray-300">contact@murastorage.cm</p>
                <p class="text-gray-600 dark:text-gray-300">support@murastorage.cm</p>
              </div>
            </div>
            
            <div class="flex items-start space-x-4">
              <div class="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Adresse</h3>
                <p class="text-gray-600 dark:text-gray-300">Bamendzi 2, Bafoussam</p>
                <p class="text-gray-600 dark:text-gray-300">Cameroun</p>
              </div>
            </div>
          </div>
          
          <!-- CTA -->
          <div class="text-center lg:text-left">
            <div class="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
              <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Commencez votre essai gratuit
              </h3>
              <p class="text-gray-600 dark:text-gray-300 mb-6">
                Aucune carte de crédit requise. Démarrez en 2 minutes.
              </p>
              <div class="space-y-4">
                <NuxtLink 
                  to="/home/inscription" 
                  class="block w-full bg-emerald-600 text-white py-4 px-6 rounded-xl hover:bg-emerald-700 transition-colors font-semibold text-lg"
                >
                  Créer mon compte gratuit
                </NuxtLink>
                <NuxtLink 
                  to="/home/contact_accueil" 
                  class="block w-full border-2 border-emerald-600 text-emerald-600 dark:text-emerald-400 py-4 px-6 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors font-semibold text-lg"
                >
                  Demander une démo
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Avis Section -->
    <Avis />
  </div>
</template>

<style scoped>
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .text-6xl {
    font-size: 3rem;
  }
  
  .text-5xl {
    font-size: 2.5rem;
  }
  
  .text-4xl {
    font-size: 2rem;
  }
  }
</style>