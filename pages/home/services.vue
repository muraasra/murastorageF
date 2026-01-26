<script lang="ts" setup>
import { ref, onMounted } from 'vue'

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

// Animation states
const isVisible = ref(false)

onMounted(() => {
  setTimeout(() => {
    isVisible.value = true
  }, 100)
})

// Services data
const services = [
  {
    id: 1,
    title: 'Gestion des Stocks',
    description: 'Suivi en temps réel de vos stocks avec alertes automatiques, seuils personnalisables et inventaires rapides.',
    icon: 'stock',
    color: 'emerald',
    features: ['Suivi en temps réel', 'Alertes automatiques', 'Seuils personnalisables', 'Inventaires rapides']
  },
  {
    id: 2,
    title: 'Mouvements & Commandes',
    description: 'Gérez facilement vos transferts entre entrepôts, entrées/sorties de stock avec validation multi-niveaux.',
    icon: 'transfer',
    color: 'blue',
    features: ['Transferts inter-entrepôts', 'Entrées/Sorties', 'Historique complet', 'Validation multi-niveaux']
  },
  {
    id: 3,
    title: 'Analyses & Rapports',
    description: 'Rapports automatiques détaillés, exports Excel/CSV et indicateurs clés de performance (KPI).',
    icon: 'analytics',
    color: 'purple',
    features: ['Rapports automatiques', 'Export Excel/CSV', 'KPI détaillés', 'Tableaux de bord']
  },
  {
    id: 4,
    title: 'Intégrations',
    description: 'Connectez Mura Storage à vos outils existants : ERP, e-commerce et API complète.',
    icon: 'integration',
    color: 'teal',
    features: ['API REST complète', 'Connecteurs ERP', 'E-commerce ready', 'Webhooks']
  },
  {
    id: 5,
    title: 'Sécurité & Conformité',
    description: 'Protection maximale de vos données avec chiffrement, sauvegardes et conformité RGPD.',
    icon: 'security',
    color: 'yellow',
    features: ['Chiffrement SSL', 'Sauvegardes auto', 'Conformité RGPD', 'Logs d\'activité']
  },
  {
    id: 6,
    title: 'Accompagnement',
    description: 'Bénéficiez d\'un onboarding personnalisé, de formations et d\'un support expert 24/7.',
    icon: 'support',
    color: 'orange',
    features: ['Onboarding guidé', 'Formation équipe', 'Support 24/7', 'Documentation complète']
  }
]

// Get icon component based on type
const getIconPath = (icon: string) => {
  const icons: Record<string, string> = {
    stock: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    transfer: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
    analytics: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    integration: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4',
    security: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    support: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z'
  }
  return icons[icon] || icons.stock
}

const getColorClasses = (color: string, type: 'bg' | 'text' | 'gradient') => {
  const colors: Record<string, Record<string, string>> = {
    emerald: { bg: 'bg-emerald-600', text: 'text-emerald-600 dark:text-emerald-400', gradient: 'from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20' },
    blue: { bg: 'bg-blue-600', text: 'text-blue-600 dark:text-blue-400', gradient: 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20' },
    purple: { bg: 'bg-purple-600', text: 'text-purple-600 dark:text-purple-400', gradient: 'from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20' },
    teal: { bg: 'bg-teal-600', text: 'text-teal-600 dark:text-teal-400', gradient: 'from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20' },
    yellow: { bg: 'bg-yellow-600', text: 'text-yellow-600 dark:text-yellow-400', gradient: 'from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20' },
    orange: { bg: 'bg-orange-600', text: 'text-orange-600 dark:text-orange-400', gradient: 'from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20' }
  }
  return colors[color]?.[type] || colors.emerald[type]
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
    <!-- Hero Section -->
    <section class="relative py-20 md:py-28 overflow-hidden">
      <!-- Background decorations -->
      <div class="absolute inset-0">
        <div class="absolute top-20 left-10 w-72 h-72 bg-emerald-200/30 dark:bg-emerald-900/20 rounded-full blur-3xl"></div>
        <div class="absolute bottom-20 right-10 w-72 h-72 bg-blue-200/30 dark:bg-blue-900/20 rounded-full blur-3xl"></div>
      </div>
      
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          :class="[
            'text-center transition-all duration-700',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          ]"
        >
          <span class="inline-flex items-center px-4 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-6">
            Solutions complètes
          </span>
          <h1 class="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-6">
            Nos 
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-blue-600">Services</span>
          </h1>
          <p class="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Tout pour réussir votre gestion de stock, du suivi en temps réel aux intégrations avancées.
          </p>
        </div>
      </div>
    </section>

    <!-- Services Grid -->
    <section class="py-16 md:py-24 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div 
            v-for="(service, index) in services" 
            :key="service.id"
            :class="[
              'group relative rounded-3xl p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl border border-gray-100 dark:border-gray-700 bg-gradient-to-br',
              getColorClasses(service.color, 'gradient'),
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            ]"
            :style="{ transitionDelay: ((index + 1) * 100) + 'ms' }"
          >
            <!-- Icon -->
            <div 
              :class="[
                'w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3',
                getColorClasses(service.color, 'bg')
              ]"
            >
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getIconPath(service.icon)" />
              </svg>
            </div>

            <!-- Content -->
            <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-3">{{ service.title }}</h2>
            <p class="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">{{ service.description }}</p>

            <!-- Features List -->
            <ul class="space-y-2">
              <li 
                v-for="feature in service.features" 
                :key="feature"
                class="flex items-center text-sm text-gray-600 dark:text-gray-400"
              >
                <svg 
                  :class="['w-4 h-4 mr-2 flex-shrink-0', getColorClasses(service.color, 'text')]" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                {{ feature }}
              </li>
            </ul>

            <!-- Hover Arrow -->
            <div class="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
              <svg :class="['w-6 h-6', getColorClasses(service.color, 'text')]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Why Choose Us Section -->
    <section class="py-16 md:py-24 bg-white dark:bg-gray-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Pourquoi nous choisir ?
          </h2>
          <p class="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Des avantages concrets pour votre entreprise
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <!-- Advantage 1 -->
          <div class="text-center">
            <div class="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Mise en place rapide</h3>
            <p class="text-gray-600 dark:text-gray-400">Démarrez en moins de 5 minutes avec notre onboarding guidé</p>
          </div>

          <!-- Advantage 2 -->
          <div class="text-center">
            <div class="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">100% sécurisé</h3>
            <p class="text-gray-600 dark:text-gray-400">Vos données sont chiffrées et protégées en permanence</p>
          </div>

          <!-- Advantage 3 -->
          <div class="text-center">
            <div class="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Mobile-first</h3>
            <p class="text-gray-600 dark:text-gray-400">Accessible sur tous vos appareils, partout</p>
          </div>

          <!-- Advantage 4 -->
          <div class="text-center">
            <div class="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Support dédié</h3>
            <p class="text-gray-600 dark:text-gray-400">Une équipe à votre écoute 24h/24 et 7j/7</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-16 md:py-24 bg-gradient-to-br from-emerald-600 via-emerald-700 to-blue-700 relative overflow-hidden">
      <!-- Background Pattern -->
      <div class="absolute inset-0 opacity-10">
        <div class="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.4%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')]"></div>
      </div>
      
      <div class="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
          Prêt à transformer votre gestion de stock ?
        </h2>
        <p class="text-xl text-emerald-100 mb-10 max-w-2xl mx-auto">
          Rejoignez des centaines d'entreprises qui optimisent leur stock avec Mura Storage
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <NuxtLink 
            to="/home/inscription"
            class="inline-flex items-center justify-center px-8 py-4 bg-white text-emerald-700 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            Commencer gratuitement
          </NuxtLink>
          <NuxtLink 
            to="/home/contact_accueil"
            class="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white rounded-xl font-bold hover:bg-white/10 transition-all duration-300"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
            Parler à un expert
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
