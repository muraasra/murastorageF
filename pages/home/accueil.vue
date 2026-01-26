<script setup lang="ts">
import { onMounted } from 'vue'
definePageMeta({
    layout: "accueil",
  });
import Avis from "~/components/home/Avis.vue";
import { useMuraTracking } from '@/composables/useMuraTracking'

// Métadonnées SEO optimisées avec composable
import { useSeo, createWebPageStructuredData, createWebSiteStructuredData } from '@/composables/useSeo'

useSeo({
  title: 'Mura Storage - Gestion Stock Multi-Entrepôts | Essai Gratuit',
  description: 'Solution complète de gestion de stock, inventaire et facturation pour entreprises. Multi-entrepôts, codes-barres, alertes. Essai gratuit 3 mois. Sécurité RGPD, support 24/7.',
  keywords: 'gestion de stock, logiciel stock, inventaire, facturation, gestion entrepôt, multi-entrepôts, codes-barres, transfert stock, alertes stock, Mura Storage, Groupe Mura, ERP stock, suivi stock, gestion inventaire, logiciel facturation, gestion produits, stock management, inventory management, warehouse management, point de vente, POS, Cameroun, Afrique, logiciel stock Cameroun, gestion stock Afrique, wilfried tayou, tayou fom',
  canonical: 'https://murastorage.netlify.app/home/accueil',
  structuredData: createWebPageStructuredData(
    'Mura Storage - Logiciel de Gestion Stock Multi-Entrepôts',
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
    <section class="relative bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
      <!-- Animated Background -->
      <div class="absolute inset-0 -z-10">
        <!-- Gradient Orbs -->
        <div class="absolute top-0 left-0 w-full h-full">
          <div class="absolute top-10 left-10 w-72 h-72 bg-emerald-400/20 dark:bg-emerald-500/10 rounded-full blur-3xl animate-blob"></div>
          <div class="absolute top-40 right-10 w-96 h-96 bg-blue-400/20 dark:bg-blue-500/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
          <div class="absolute bottom-10 left-1/3 w-80 h-80 bg-purple-400/15 dark:bg-purple-500/10 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
        </div>
        
        <!-- SVG Wave -->
        <div class="absolute top-0 left-0 w-full h-full opacity-50">
          <svg class="w-full h-full" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path fill="#10B981" fill-opacity="0.1" d="M0,192L48,192C96,192,192,192,288,176C384,160,480,128,576,138.7C672,149,768,203,864,208C960,213,1056,171,1152,144C1248,117,1344,107,1392,101.3L1440,96L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
          </svg>
        </div>
        
        <!-- Floating Particles -->
        <div class="absolute top-20 left-[10%] w-3 h-3 bg-emerald-500/40 dark:bg-emerald-400/30 rounded-full animate-float-particle"></div>
        <div class="absolute top-32 left-[25%] w-2 h-2 bg-blue-500/40 dark:bg-blue-400/30 rounded-full animate-float-particle animation-delay-1000"></div>
        <div class="absolute top-16 right-[30%] w-4 h-4 bg-emerald-400/30 dark:bg-emerald-300/20 rounded-full animate-float-particle animation-delay-2000"></div>
        <div class="absolute top-48 right-[15%] w-2 h-2 bg-purple-500/40 dark:bg-purple-400/30 rounded-full animate-float-particle animation-delay-3000"></div>
        <div class="absolute bottom-32 left-[20%] w-3 h-3 bg-blue-400/40 dark:bg-blue-300/30 rounded-full animate-float-particle animation-delay-1500"></div>
        <div class="absolute bottom-20 right-[25%] w-2 h-2 bg-emerald-500/40 dark:bg-emerald-400/30 rounded-full animate-float-particle animation-delay-2500"></div>
        
        <!-- Animated Grid Lines -->
        <div class="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
          <div class="absolute inset-0" style="background-image: linear-gradient(to right, #10B981 1px, transparent 1px), linear-gradient(to bottom, #10B981 1px, transparent 1px); background-size: 60px 60px;"></div>
        </div>
        
        <!-- Floating Geometric Shapes -->
        <div class="absolute top-24 left-[5%] w-8 h-8 border-2 border-emerald-400/30 dark:border-emerald-500/20 rotate-45 animate-spin-very-slow"></div>
        <div class="absolute top-60 right-[8%] w-6 h-6 border-2 border-blue-400/30 dark:border-blue-500/20 rounded-full animate-pulse-slow"></div>
        <div class="absolute bottom-40 left-[12%] w-10 h-10 border-2 border-purple-400/20 dark:border-purple-500/15 animate-spin-very-slow animation-delay-3000"></div>
        <div class="absolute bottom-24 right-[18%] w-4 h-4 bg-emerald-500/20 dark:bg-emerald-400/15 rotate-45 animate-bounce-slow"></div>
        
        <!-- Moving Light Beam -->
        <div class="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div class="absolute -top-20 -left-20 w-40 h-[500px] bg-gradient-to-b from-emerald-500/10 via-emerald-500/5 to-transparent rotate-45 animate-light-beam"></div>
        </div>
      </div>
      
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <!-- Content -->
          <div class="text-center lg:text-left">
            <div class="inline-flex items-center px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-6 animate-fade-in-up border border-emerald-200/50 dark:border-emerald-700/30">
              <span class="relative flex h-3 w-3 mr-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              Solution de gestion de stock professionnelle
            </div>
            
            <h1 class="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 animate-fade-in-up animation-delay-200">
              Mura
              <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-blue-500 to-emerald-500 bg-[length:200%_auto] animate-gradient-x">
                Storage
              </span>
              <br>
              <span class="text-2xl md:text-3xl lg:text-4xl font-normal text-gray-600 dark:text-gray-300 animate-fade-in-up animation-delay-400">
                par Groupe Mura
              </span>
            </h1>
            
            <p class="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto lg:mx-0 animate-fade-in-up animation-delay-600">
              Optimisez votre gestion de stock avec Mura Storage, la plateforme moderne propulsée par Groupe Mura.
              Suivez vos inventaires, gérez vos mouvements et maximisez votre efficacité opérationnelle.
            </p>
            
            <!-- CTA Buttons -->
            <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8 animate-fade-in-up animation-delay-800">
              <NuxtLink 
                to="/home/inscription" 
                class="group relative inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 font-semibold text-lg overflow-hidden"
              >
                <!-- Shine effect -->
                <span class="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                <svg class="w-5 h-5 mr-2 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
                Commencer gratuitement
              </NuxtLink>
              
              <NuxtLink 
                to="/home/contact_accueil" 
                class="group relative inline-flex items-center justify-center px-8 py-4 border-2 border-emerald-600 dark:border-emerald-500 text-emerald-600 dark:text-emerald-400 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all duration-300 font-semibold text-lg overflow-hidden hover:border-emerald-500 dark:hover:border-emerald-400"
              >
                <!-- Border glow on hover -->
                <span class="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-emerald-500/10 to-blue-500/10"></span>
                <svg class="w-5 h-5 mr-2 group-hover:animate-bounce-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
                Nous contacter
              </NuxtLink>
            </div>
            
            <!-- Trust indicators -->
            <div class="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 text-sm text-gray-500 dark:text-gray-400 animate-fade-in-up animation-delay-1000">
              <div class="flex items-center group cursor-default">
                <div class="w-6 h-6 mr-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg class="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                </div>
                <span class="group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Essai gratuit 3 mois</span>
              </div>
              <div class="flex items-center group cursor-default">
                <div class="w-6 h-6 mr-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg class="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                </div>
                <span class="group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Support 24/7 Groupe Mura</span>
              </div>
              <div class="flex items-center group cursor-default">
                <div class="w-6 h-6 mr-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg class="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                </div>
                <span class="group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Sécurité RGPD</span>
              </div>
            </div>
          </div>
          
          <!-- Image/Illustration -->
          <div class="relative animate-fade-in-right animation-delay-500">
            <div class="relative animate-float-slow">
              <img 
                src="/img/undraw_finance_m6vw_1_-removebg-preview.png" 
                alt="Mura Storage - Gestion de stock moderne" 
                class="w-full max-w-lg mx-auto lg:max-w-none drop-shadow-2xl"
              >
            </div>
            <!-- Floating cards -->
            <div class="absolute -top-4 right-0 lg:-right-8 bg-white dark:bg-gray-800 rounded-xl shadow-xl p-4 transform hover:scale-105 transition-all duration-300 animate-float">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                  <svg class="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <div>
                  <p class="text-xs text-gray-500 dark:text-gray-400">Mise à jour</p>
                  <p class="text-sm font-semibold text-gray-800 dark:text-white">Stock en temps réel</p>
                </div>
              </div>
            </div>
            <div class="absolute bottom-20 lg:bottom-10 -left-4 lg:left-auto lg:-right-12 bg-white dark:bg-gray-800 rounded-xl shadow-xl p-4 transform hover:scale-105 transition-all duration-300 animate-float-delayed">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                  </svg>
                </div>
                <div>
                  <p class="text-2xl font-bold text-emerald-600 dark:text-emerald-400">+45%</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">efficacité</p>
                </div>
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
            <p class="text-3xl font-extrabold mt-3 text-gray-900 dark:text-white">9 900 XAF<span class="text-lg font-normal">/mois</span></p>
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
            <p class="text-3xl font-extrabold mt-3">29 900 XAF<span class="text-lg font-normal">/mois</span></p>
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
            <p class="text-3xl font-extrabold mt-3 text-gray-900 dark:text-white">55 000 XAF<span class="text-lg font-normal">/mois</span></p>
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

    <!-- How It Works Section - Scanner to Invoice Animation -->
    <section class="py-16 md:py-24 bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-emerald-900 relative overflow-hidden">
      <!-- Background effects -->
      <div class="absolute inset-0">
        <div class="absolute top-20 left-10 w-40 h-40 bg-emerald-500/20 dark:bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div class="absolute bottom-20 right-10 w-60 h-60 bg-blue-500/20 dark:bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>
      
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <span class="inline-flex items-center px-4 py-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-full text-emerald-700 dark:text-emerald-400 text-sm font-medium mb-4">
            Processus simplifié
          </span>
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Comment ça marche ?
          </h2>
          <p class="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            De la lecture du code-barres à l'impression de la facture en moins de 3 secondes
          </p>
        </div>
        
        <!-- Scanner to Printer Animation -->
        <div class="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-gray-200 dark:border-gray-700 shadow-xl">
          <div class="flex flex-col md:flex-row items-center justify-between gap-8">
            
            <!-- Step 1: Scanner -->
            <div class="flex flex-col items-center text-center">
              <div class="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mb-4 animate-pulse shadow-lg shadow-emerald-500/30">
                <span class="text-2xl font-bold text-white">1</span>
              </div>
              <div class="relative w-32 h-40 bg-gradient-to-b from-gray-400 to-gray-500 dark:from-gray-600 dark:to-gray-700 rounded-2xl shadow-2xl flex flex-col items-center justify-end pb-4 group hover:scale-105 transition-transform">
                <!-- Scanner screen -->
                <div class="absolute top-4 left-4 right-4 h-8 bg-gray-800 dark:bg-gray-900 rounded flex items-center justify-center">
                  <span class="text-xs font-mono text-emerald-400 animate-pulse">SCAN</span>
                </div>
                <!-- Laser -->
                <div class="w-20 h-12 bg-gray-700 dark:bg-gray-800 rounded relative overflow-hidden">
                  <div class="absolute inset-x-2 h-0.5 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-scan-laser"></div>
                  <!-- Barcode -->
                  <div class="absolute inset-3 flex items-center justify-center">
                    <div class="flex space-x-0.5">
                      <div class="w-0.5 h-4 bg-white"></div>
                      <div class="w-1 h-4 bg-white"></div>
                      <div class="w-0.5 h-4 bg-white"></div>
                      <div class="w-1 h-4 bg-white"></div>
                      <div class="w-0.5 h-4 bg-white"></div>
                      <div class="w-1.5 h-4 bg-white"></div>
                    </div>
                  </div>
                </div>
                <div class="w-6 h-2 mt-3 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/50"></div>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mt-4">Scanner le produit</h3>
              <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">Code-barres ou QR Code</p>
            </div>
            
            <!-- Arrow 1 -->
            <div class="hidden md:flex items-center">
              <div class="flex items-center space-x-1">
                <div class="w-3 h-3 bg-emerald-500 rounded-full animate-ping"></div>
                <div class="w-16 h-0.5 bg-gradient-to-r from-emerald-500 to-blue-500"></div>
                <div class="w-3 h-3 bg-blue-500 rounded-full animate-ping animation-delay-500"></div>
              </div>
            </div>
            <div class="md:hidden w-0.5 h-8 bg-gradient-to-b from-emerald-500 to-blue-500"></div>
            
            <!-- Step 2: Processing -->
            <div class="flex flex-col items-center text-center">
              <div class="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mb-4 animate-bounce-slow shadow-lg shadow-blue-500/30">
                <span class="text-2xl font-bold text-white">2</span>
              </div>
              <div class="w-24 h-24 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/30 dark:shadow-emerald-500/20 animate-spin-slow">
                <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"/>
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mt-4">Traitement instantané</h3>
              <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">Base de données temps réel</p>
            </div>
            
            <!-- Arrow 2 -->
            <div class="hidden md:flex items-center">
              <div class="flex items-center space-x-1">
                <div class="w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
                <div class="w-16 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                <div class="w-3 h-3 bg-purple-500 rounded-full animate-ping animation-delay-500"></div>
              </div>
            </div>
            <div class="md:hidden w-0.5 h-8 bg-gradient-to-b from-blue-500 to-purple-500"></div>
            
            <!-- Step 3: Printer -->
            <div class="flex flex-col items-center text-center">
              <div class="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-purple-500/30">
                <span class="text-2xl font-bold text-white">3</span>
              </div>
              <div class="relative w-36 h-28 bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-200 dark:to-gray-300 rounded-xl shadow-2xl group hover:scale-105 transition-transform border border-gray-300 dark:border-gray-400">
                <!-- Printer top -->
                <div class="absolute -top-2 left-3 right-3 h-3 bg-gray-300 dark:bg-gray-400 rounded-t-lg"></div>
                <!-- Paper slot -->
                <div class="absolute top-3 left-4 right-4 h-1.5 bg-gray-700 dark:bg-gray-800 rounded"></div>
                <!-- Screen -->
                <div class="absolute top-8 left-4 right-4 h-5 bg-emerald-500 rounded flex items-center justify-center">
                  <span class="text-[8px] font-bold text-white">IMPRESSION OK</span>
                </div>
                <!-- Buttons -->
                <div class="absolute bottom-3 left-4 flex space-x-1">
                  <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
                </div>
                
                <!-- Receipt coming out -->
                <div class="absolute -top-20 left-1/2 -translate-x-1/2 w-28 animate-receipt-out">
                  <div class="bg-white rounded shadow-xl px-2 py-2 space-y-1 border border-gray-200">
                    <div class="text-center border-b border-dashed border-gray-300 pb-1">
                      <div class="text-[8px] font-bold text-emerald-600">MURA STORAGE</div>
                      <div class="text-[6px] text-gray-500">Facture #2025-0142</div>
                    </div>
                    <div class="space-y-0.5">
                      <div class="flex justify-between text-[6px] text-gray-700">
                        <span>Produit A</span>
                        <span class="font-medium">15,000</span>
                      </div>
                      <div class="flex justify-between text-[6px] text-gray-700">
                        <span>Produit B x2</span>
                        <span class="font-medium">24,000</span>
                      </div>
                    </div>
                    <div class="border-t border-dashed border-gray-300 pt-1">
                      <div class="flex justify-between text-[7px] font-bold">
                        <span class="text-gray-800">TOTAL</span>
                        <span class="text-emerald-600">39,000 XAF</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mt-4">Facture imprimée</h3>
              <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">PDF ou ticket de caisse</p>
            </div>
          </div>
          
          <!-- Bottom stats -->
          <div class="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-center gap-8">
            <div class="flex items-center space-x-2">
              <svg class="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd"/>
              </svg>
              <span class="text-gray-600 dark:text-gray-300">Moins de 3 secondes</span>
            </div>
            <div class="flex items-center space-x-2">
              <svg class="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <span class="text-gray-600 dark:text-gray-300">100% automatisé</span>
            </div>
            <div class="flex items-center space-x-2">
              <svg class="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001z"/>
              </svg>
              <span class="text-gray-600 dark:text-gray-300">Données sécurisées</span>
            </div>
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
/* ===== Float Animations ===== */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

.animate-float-delayed {
  animation: float 3s ease-in-out infinite;
  animation-delay: 1.5s;
}

@keyframes float-slow {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
}

.animate-float-slow {
  animation: float-slow 5s ease-in-out infinite;
}

@keyframes float-particle {
  0%, 100% { 
    transform: translateY(0) translateX(0);
    opacity: 0.4;
  }
  25% { 
    transform: translateY(-20px) translateX(10px);
    opacity: 0.8;
  }
  50% { 
    transform: translateY(-40px) translateX(-5px);
    opacity: 0.4;
  }
  75% { 
    transform: translateY(-20px) translateX(-10px);
    opacity: 0.8;
  }
}

.animate-float-particle {
  animation: float-particle 6s ease-in-out infinite;
}

/* ===== Blob Animation ===== */
@keyframes blob {
  0%, 100% { 
    transform: translate(0, 0) scale(1);
  }
  25% { 
    transform: translate(20px, -30px) scale(1.1);
  }
  50% { 
    transform: translate(-20px, 20px) scale(0.9);
  }
  75% { 
    transform: translate(30px, 10px) scale(1.05);
  }
}

.animate-blob {
  animation: blob 15s ease-in-out infinite;
}

/* ===== Fade In Animations ===== */
@keyframes fade-in-up {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.8s ease-out forwards;
}

@keyframes fade-in-right {
  0% {
    opacity: 0;
    transform: translateX(30px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

.animate-fade-in-right {
  animation: fade-in-right 0.8s ease-out forwards;
}

/* ===== Gradient Animation ===== */
@keyframes gradient-x {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.animate-gradient-x {
  animation: gradient-x 3s ease infinite;
}

/* ===== Light Beam ===== */
@keyframes light-beam {
  0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
  100% { transform: translateX(200vw) translateY(200vh) rotate(45deg); }
}

.animate-light-beam {
  animation: light-beam 8s ease-in-out infinite;
}

/* ===== Spin Animations ===== */
@keyframes spin-very-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin-very-slow {
  animation: spin-very-slow 20s linear infinite;
}

@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin-slow {
  animation: spin-slow 4s linear infinite;
}

/* ===== Pulse Slow ===== */
@keyframes pulse-slow {
  0%, 100% { transform: scale(1); opacity: 0.3; }
  50% { transform: scale(1.2); opacity: 0.6; }
}

.animate-pulse-slow {
  animation: pulse-slow 3s ease-in-out infinite;
}

/* ===== Bounce Slow ===== */
@keyframes bounce-slow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.animate-bounce-slow {
  animation: bounce-slow 2s ease-in-out infinite;
}

/* ===== Scanner laser animation ===== */
@keyframes scan-laser {
  0%, 100% { top: 15%; }
  50% { top: 75%; }
}

.animate-scan-laser {
  animation: scan-laser 1.5s ease-in-out infinite;
}

/* ===== Receipt printing animation ===== */
@keyframes receipt-out {
  0%, 20% { transform: translateX(-50%) translateY(60px); opacity: 0; }
  40% { transform: translateX(-50%) translateY(30px); opacity: 1; }
  100% { transform: translateX(-50%) translateY(0); opacity: 1; }
}

.animate-receipt-out {
  animation: receipt-out 3s ease-out infinite;
}

/* ===== Animation Delays ===== */
.animation-delay-200 { animation-delay: 200ms; }
.animation-delay-400 { animation-delay: 400ms; }
.animation-delay-500 { animation-delay: 500ms; }
.animation-delay-600 { animation-delay: 600ms; }
.animation-delay-800 { animation-delay: 800ms; }
.animation-delay-1000 { animation-delay: 1000ms; }
.animation-delay-1500 { animation-delay: 1500ms; }
.animation-delay-2000 { animation-delay: 2000ms; }
.animation-delay-2500 { animation-delay: 2500ms; }
.animation-delay-3000 { animation-delay: 3000ms; }
.animation-delay-4000 { animation-delay: 4000ms; }

/* Responsive adjustments */
@media (max-width: 768px) {
  .text-6xl { font-size: 3rem; }
  .text-5xl { font-size: 2.5rem; }
  .text-4xl { font-size: 2rem; }
}
</style>