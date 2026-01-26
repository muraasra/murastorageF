<script lang="ts" setup>
import { ref } from 'vue';

definePageMeta({
  layout: "accueil",
});

useSeoMeta({
  title: 'Tarification Mura Storage - Plans Gratuit, Basic, Premium | Essai Gratuit',
  description: 'Découvrez nos plans de tarification Mura Storage : Gratuit, Basic, Premium et Organisation. Plans adaptés à chaque entreprise. Essai gratuit 14 jours. Gestion de stock multi-entrepôts, facturation, inventaires, transferts.',
  ogTitle: 'Tarification Mura Storage - Plans et Prix',
  ogDescription: 'Plans de tarification flexibles pour la gestion de stock : Gratuit, Basic, Premium, Organisation. Essai gratuit 3 mois sans engagement.',
  ogType: 'website',
  ogUrl: 'https://murastorage.netlify.app/home/tarification',
  ogImage: 'https://murastorage.netlify.app/img/og-image-MuraSrorage.png',
  keywords: 'tarification Mura Storage, prix logiciel stock, tarif gestion stock, plan gratuit stock, essai gratuit gestion stock',
  robots: 'index, follow',
});

const billingPeriod = ref<'monthly' | 'yearly'>('monthly');

// Plans avec prix cohérents
const plans = [
  {
    name: 'Free',
    description: 'Pour démarrer et tester',
    price: { monthly: 0, yearly: 0 },
    highlight: false,
    badge: '3 mois gratuits',
    features: [
      { text: '1 entreprise', included: true },
      { text: '1 boutique', included: true },
      { text: '2 utilisateurs', included: true },
      { text: '50 produits', included: true },
      { text: '100 factures/mois', included: true },
      { text: 'Inventaires', included: false },
      { text: 'Transferts', included: false },
      { text: 'Codes-barres', included: false },
      { text: 'Import/Export', included: false },
    ],
    cta: { text: 'Commencer gratuitement', to: '/home/inscription' },
  },
  {
    name: 'Basic',
    description: 'Pour les petites équipes',
    price: { monthly: 9900, yearly: 118800 },
    highlight: false,
    badge: null,
    features: [
      { text: '1 entreprise', included: true },
      { text: '3 boutiques', included: true },
      { text: '5 utilisateurs', included: true },
      { text: '500 produits', included: true },
      { text: '1 000 factures/mois', included: true },
      { text: '50 transferts/mois', included: true },
      { text: 'Codes-barres', included: true },
      { text: 'Alertes de stock', included: true },
      { text: 'Export CSV/Excel', included: true },
    ],
    cta: { text: 'Choisir Basic', to: '/home/inscription' },
  },
  {
    name: 'Premium',
    description: 'Pour les entreprises en croissance',
    price: { monthly: 29900, yearly: 358800 },
    highlight: true,
    badge: 'Le plus populaire',
    features: [
      { text: '1 entreprise', included: true },
      { text: '10 boutiques', included: true },
      { text: '25 utilisateurs', included: true },
      { text: 'Produits illimités', included: true },
      { text: 'Factures illimitées', included: true },
      { text: 'Inventaires illimités', included: true },
      { text: 'Transferts illimités', included: true },
      { text: 'Import CSV', included: true },
      { text: 'Support prioritaire', included: true },
    ],
    cta: { text: 'Choisir Premium', to: '/home/inscription' },
  },
  {
    name: 'Organisation',
    description: 'Pour les grandes structures',
    price: { monthly: 55000, yearly: 660000 },
    highlight: false,
    badge: 'Sur mesure',
    features: [
      { text: 'Entreprises illimitées', included: true },
      { text: 'Boutiques illimitées', included: true },
      { text: 'Utilisateurs illimités', included: true },
      { text: 'Produits illimités', included: true },
      { text: 'Factures illimitées', included: true },
      { text: 'API complète', included: true },
      { text: 'Analyses avancées', included: true },
      { text: 'Support dédié 24/7', included: true },
      { text: 'Personnalisation', included: true },
    ],
    cta: { text: 'Contacter les ventes', to: '/home/contact_accueil' },
  },
];

// Format prix
const formatPrice = (price: number) => {
  if (price === 0) return 'Gratuit';
  return new Intl.NumberFormat('fr-FR').format(price) + ' XAF';
};

// FAQ
const faqs = [
  {
    question: 'Puis-je changer de plan à tout moment ?',
    answer: 'Oui, vous pouvez passer à un plan supérieur ou inférieur à tout moment. La différence sera calculée au prorata.',
  },
  {
    question: "Que se passe-t-il après l'essai gratuit ?",
    answer: "Après 14 jours, vous serez automatiquement basculé sur le plan Free. Vous pouvez upgrader à tout moment pour accéder à plus de fonctionnalités.",
  },
  {
    question: 'Comment fonctionne la facturation annuelle ?',
    answer: "La facturation annuelle vous fait économiser 2 mois. Vous payez pour 10 mois et bénéficiez de 12 mois d'accès.",
  },
  {
    question: 'Proposez-vous des réductions pour les ONG ?',
    answer: 'Oui, nous offrons 50% de réduction pour les ONG et associations à but non lucratif. Contactez-nous pour en savoir plus.',
  },
];
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
    <!-- Hero Section -->
    <section class="py-16 md:py-24 px-4">
      <div class="max-w-7xl mx-auto text-center">
        <span class="inline-flex items-center px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-6">
          <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
          3 mois d'essai gratuit
        </span>
        
        <h1 class="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-6">
          Des prix simples et
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-blue-600">
            transparents
          </span>
        </h1>
        
        <p class="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-10">
          Choisissez le plan adapté à votre entreprise. Sans engagement, sans frais cachés.
        </p>

        <!-- Toggle Mensuel/Annuel -->
        <div class="inline-flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          <button
            @click="billingPeriod = 'monthly'"
            :class="[
              'px-6 py-3 rounded-lg font-medium transition-all duration-200',
              billingPeriod === 'monthly' 
                ? 'bg-white dark:bg-gray-700 shadow-md text-emerald-600 dark:text-emerald-400' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            ]"
          >
            Mensuel
          </button>
          <button
            @click="billingPeriod = 'yearly'"
            :class="[
              'px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center',
              billingPeriod === 'yearly' 
                ? 'bg-white dark:bg-gray-700 shadow-md text-emerald-600 dark:text-emerald-400' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            ]"
          >
            Annuel
            <span class="ml-2 px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs rounded-full">
              -17%
            </span>
          </button>
        </div>
      </div>
    </section>

    <!-- Plans Grid -->
    <section class="pb-16 md:pb-24 px-4">
      <div class="max-w-7xl mx-auto">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          <div
            v-for="(plan, index) in plans"
            :key="plan.name"
            :class="[
              'relative rounded-2xl p-8 transition-all duration-300 hover:scale-[1.02]',
              plan.highlight 
                ? 'bg-gradient-to-b from-emerald-600 to-emerald-700 text-white shadow-2xl shadow-emerald-500/20 ring-4 ring-emerald-500/50' 
                : 'bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700'
            ]"
            :style="{ animationDelay: `${index * 100}ms` }"
          >
            <!-- Badge -->
            <span 
              v-if="plan.badge"
              :class="[
                'absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-semibold',
                plan.highlight 
                  ? 'bg-white text-emerald-700' 
                  : 'bg-emerald-600 text-white'
              ]"
            >
              {{ plan.badge }}
            </span>

            <!-- Plan Info -->
            <div class="mb-6">
              <h3 :class="[
                'text-xl font-bold mb-2',
                plan.highlight ? 'text-white' : 'text-gray-900 dark:text-white'
              ]">
                {{ plan.name }}
              </h3>
              <p :class="[
                'text-sm',
                plan.highlight ? 'text-emerald-100' : 'text-gray-500 dark:text-gray-400'
              ]">
                {{ plan.description }}
              </p>
            </div>

            <!-- Prix -->
            <div class="mb-6">
              <span :class="[
                'text-4xl font-extrabold',
                plan.highlight ? 'text-white' : 'text-gray-900 dark:text-white'
              ]">
                {{ formatPrice(plan.price[billingPeriod]) }}
              </span>
              <span 
                v-if="plan.price[billingPeriod] !== 0"
                :class="[
                  'text-sm ml-1',
                  plan.highlight ? 'text-emerald-100' : 'text-gray-500 dark:text-gray-400'
                ]"
              >
                /{{ billingPeriod === 'monthly' ? 'mois' : 'an' }}
              </span>
            </div>

            <!-- Features -->
            <ul class="space-y-3 mb-8">
              <li 
                v-for="feature in plan.features" 
                :key="feature.text"
                class="flex items-start"
              >
                <svg 
                  :class="[
                    'w-5 h-5 mr-3 flex-shrink-0 mt-0.5',
                    feature.included 
                      ? (plan.highlight ? 'text-emerald-200' : 'text-emerald-500') 
                      : (plan.highlight ? 'text-emerald-300/50' : 'text-gray-300 dark:text-gray-600')
                  ]"
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
                <span :class="[
                  'text-sm',
                  feature.included 
                    ? (plan.highlight ? 'text-white' : 'text-gray-700 dark:text-gray-300') 
                    : (plan.highlight ? 'text-emerald-200/50 line-through' : 'text-gray-400 dark:text-gray-500 line-through')
                ]">
                  {{ feature.text }}
                </span>
              </li>
            </ul>

            <!-- CTA -->
            <NuxtLink
              :to="plan.cta.to"
              :class="[
                'block w-full py-3 px-6 rounded-xl font-semibold text-center transition-all duration-200',
                plan.highlight 
                  ? 'bg-white text-emerald-700 hover:bg-emerald-50 shadow-lg' 
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg hover:shadow-emerald-500/25'
              ]"
            >
              {{ plan.cta.text }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Comparison -->
    <section class="py-16 md:py-24 bg-gray-50 dark:bg-gray-900/50 px-4">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Tout ce dont vous avez besoin
          </h2>
          <p class="text-xl text-gray-600 dark:text-gray-300">
            Des fonctionnalités puissantes pour gérer votre stock efficacement
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Feature 1 -->
          <div class="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
            <div class="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center mb-6">
              <svg class="w-7 h-7 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">Tableaux de bord</h3>
            <p class="text-gray-600 dark:text-gray-400">
              Visualisez vos données en temps réel avec des graphiques et statistiques détaillés.
            </p>
          </div>

          <!-- Feature 2 -->
          <div class="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
            <div class="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-6">
              <svg class="w-7 h-7 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">Codes-barres</h3>
            <p class="text-gray-600 dark:text-gray-400">
              Scannez et générez des codes-barres pour une gestion rapide de votre inventaire.
            </p>
          </div>

          <!-- Feature 3 -->
          <div class="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
            <div class="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-6">
              <svg class="w-7 h-7 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">Transferts</h3>
            <p class="text-gray-600 dark:text-gray-400">
              Transférez facilement des produits entre vos différents entrepôts et boutiques.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ Section -->
    <section class="py-16 md:py-24 px-4">
      <div class="max-w-3xl mx-auto">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Questions fréquentes
          </h2>
          <p class="text-xl text-gray-600 dark:text-gray-300">
            Tout ce que vous devez savoir sur nos tarifs
          </p>
        </div>

        <div class="space-y-4">
          <details 
            v-for="(faq, index) in faqs" 
            :key="index"
            class="group bg-white dark:bg-gray-800 rounded-xl shadow-lg"
          >
            <summary class="flex items-center justify-between p-6 cursor-pointer list-none">
              <span class="font-semibold text-gray-900 dark:text-white">{{ faq.question }}</span>
              <svg class="w-5 h-5 text-gray-500 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </summary>
            <div class="px-6 pb-6 text-gray-600 dark:text-gray-400">
              {{ faq.answer }}
            </div>
          </details>
        </div>

        <div class="text-center mt-10">
          <p class="text-gray-600 dark:text-gray-400 mb-4">Vous avez d'autres questions ?</p>
          <NuxtLink 
            to="/home/contact_accueil" 
            class="inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
            Contactez-nous
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-16 md:py-24 bg-gradient-to-r from-emerald-600 to-blue-600 px-4">
      <div class="max-w-4xl mx-auto text-center">
        <h2 class="text-3xl md:text-4xl font-bold text-white mb-6">
          Prêt à optimiser votre gestion de stock ?
        </h2>
        <p class="text-xl text-emerald-100 mb-10">
          Rejoignez des centaines d'entreprises qui font confiance à Mura Storage
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
            Demander une démo
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
details summary::-webkit-details-marker {
  display: none;
}
</style>
