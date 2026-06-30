<script setup lang="ts">
import { onMounted, ref, onUnmounted, defineAsyncComponent } from 'vue'

definePageMeta({ layout: 'accueil' })

// Lazy-load Avis : code parsé seulement quand l'utilisateur approche la section
const Avis = defineAsyncComponent(() => import('~/components/home/Avis.vue'))
const showAvis = ref(false)

import { useMuraTracking } from '@/composables/useMuraTracking'
import { useSeo, createWebPageStructuredData, createWebSiteStructuredData, createSoftwareApplicationData, createFAQData, SITE_URL } from '@/composables/useSeo'

useSeo({
  title: 'Mura Storage — Logiciel de gestion de stock pour PME africaines | Essai gratuit 3 mois',
  description: 'Mura Storage : gérez stocks, inventaires et factures de toutes vos boutiques en un seul endroit. Conçu pour les PME d\'Afrique. Essai gratuit 3 mois, sans carte bancaire.',
  keywords: 'gestion de stock Afrique, logiciel stock Cameroun, inventaire multi-boutiques, facturation PME africaine, Mura Storage, Groupe Mura, gestion entrepôt, codes-barres, transfert stock',
  canonical: `${SITE_URL}/home/accueil`,
  ogImage: `${SITE_URL}/img/logo-mura-storage.png`,
  structuredData: [
    createWebPageStructuredData(
      'Mura Storage — Logiciel de gestion de stock pour PME africaines',
      'Gérez stocks, inventaires et factures de toutes vos boutiques. Essai gratuit 3 mois.',
      `${SITE_URL}/home/accueil`
    ),
    createSoftwareApplicationData(),
    createFAQData([
      { question: 'Qu\'est-ce que Mura Storage ?', answer: 'Mura Storage est un logiciel de gestion de stock, d\'inventaire et de facturation multi-boutiques conçu pour les PME africaines.' },
      { question: 'Mura Storage est-il gratuit ?', answer: 'Oui, Mura Storage propose un plan Essai Gratuit pendant 3 mois sans carte bancaire.' },
      { question: 'Mura Storage fonctionne-t-il sur mobile ?', answer: 'Oui, Mura Storage est entièrement responsive, accessible depuis n\'importe quel navigateur sans installation.' },
      { question: 'Puis-je gérer plusieurs boutiques ?', answer: 'Oui. Starter : 2 boutiques, Business : 3 boutiques, Pro : jusqu\'à 10 boutiques.' },
    ])
  ]
})

useHead({
  script: [{ type: 'application/ld+json', children: JSON.stringify(createWebSiteStructuredData()) }]
})

const { trackHomePage } = useMuraTracking()

// Typewriter sur les propositions de valeur (pas le nom de marque)
const PHRASES = [
  'vos stocks en temps réel',
  'toutes vos boutiques',
  'vos factures en 3 secondes',
  'vos transferts entre sites',
]
const typedPhrase = ref('')
let twTimer: ReturnType<typeof setTimeout> | null = null
let phraseIndex = 0
let charIndex = 0
let isDeleting = false

function typeStep() {
  const phrase = PHRASES[phraseIndex]
  if (!isDeleting) {
    typedPhrase.value = phrase.slice(0, ++charIndex)
    if (charIndex === phrase.length) {
      twTimer = setTimeout(() => { isDeleting = true; typeStep() }, 2400)
      return
    }
  } else {
    typedPhrase.value = phrase.slice(0, --charIndex)
    if (charIndex === 0) {
      isDeleting = false
      phraseIndex = (phraseIndex + 1) % PHRASES.length
      twTimer = setTimeout(typeStep, 400)
      return
    }
  }
  twTimer = setTimeout(typeStep, isDeleting ? 40 : 75)
}

// IntersectionObserver pour révéler les sections au scroll (pas de CSS animation hors-écran)
let revealObserver: IntersectionObserver | null = null

function setupReveal() {
  if (!process.client) return
  // prefersReducedMotion: on révèle tout immédiatement
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll<HTMLElement>('.reveal').forEach(el => el.classList.add('is-visible'))
    return
  }
  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible')
        revealObserver?.unobserve(e.target)
      }
    })
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' })
  document.querySelectorAll('.reveal').forEach(el => revealObserver!.observe(el))
}

// Lazy-mount Avis quand le marqueur est proche
function setupAvisLazy() {
  if (!process.client) return
  const marker = document.getElementById('avis-marker')
  if (!marker) return
  const obs = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) { showAvis.value = true; obs.disconnect() }
  }, { rootMargin: '300px' })
  obs.observe(marker)
}

onMounted(() => {
  trackHomePage()
  twTimer = setTimeout(typeStep, 600)
  setupReveal()
  setupAvisLazy()
})

onUnmounted(() => {
  if (twTimer) clearTimeout(twTimer)
  revealObserver?.disconnect()
})

// Données features
const features = [
  {
    color: 'emerald',
    title: 'Stock en temps réel',
    desc: 'Chaque vente et réception met à jour le stock instantanément. Alertes automatiques en cas de rupture ou de seuil bas.',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  },
  {
    color: 'blue',
    title: 'Multi-boutiques centralisé',
    desc: 'Gérez jusqu\'à 10 points de vente depuis un seul tableau de bord. Vision globale ou par boutique en un clic.',
    icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  },
  {
    color: 'purple',
    title: 'Codes-barres & QR Codes',
    desc: 'Générez et scannez des codes-barres pour chaque produit. Entrées et sorties en quelques secondes avec un smartphone.',
    icon: 'M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z',
  },
  {
    color: 'orange',
    title: 'Facturation rapide',
    desc: 'Créez et imprimez une facture en moins de 3 secondes. Format PDF ou ticket de caisse. Historique complet des transactions.',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  },
  {
    color: 'teal',
    title: 'Transferts entre sites',
    desc: 'Transférez des marchandises entre vos boutiques avec traçabilité complète. Aucun mouvement ne passe inaperçu.',
    icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
  },
  {
    color: 'indigo',
    title: 'Analytiques & rapports',
    desc: 'Tableaux de bord visuels : meilleures ventes, marges, tendances. Exportez vos rapports en Excel ou PDF.',
    icon: 'M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z',
  },
]

const colorMap: Record<string, string> = {
  emerald: 'bg-emerald-600',
  blue: 'bg-blue-600',
  purple: 'bg-purple-600',
  orange: 'bg-orange-500',
  teal: 'bg-teal-600',
  indigo: 'bg-indigo-600',
}
const bgMap: Record<string, string> = {
  emerald: 'from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20',
  blue: 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
  purple: 'from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20',
  orange: 'from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20',
  teal: 'from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20',
  indigo: 'from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20',
}

// Données pricing
const plans = [
  {
    name: 'Essai Gratuit',
    price: 'Gratuit',
    period: '3 mois offerts',
    highlight: false,
    cta: 'Essayer gratuitement',
    ctaStyle: 'border-2 border-emerald-600 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20',
    features: ['1 boutique', '3 utilisateurs', '30 produits', '30 factures/mois', 'Codes-barres', 'Support email'],
  },
  {
    name: 'Starter',
    price: '4 900 XAF',
    period: '/mois',
    highlight: false,
    cta: 'Choisir Starter',
    ctaStyle: 'border-2 border-emerald-600 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20',
    features: ['2 boutiques', '5 utilisateurs', '200 produits', '200 factures/mois', 'Codes-barres & QR', 'Transferts de stock', 'Support email prioritaire'],
  },
  {
    name: 'Business',
    price: '9 900 XAF',
    period: '/mois',
    highlight: true,
    badge: 'Le plus populaire',
    cta: 'Commencer Business',
    ctaStyle: 'bg-white text-emerald-700 hover:bg-emerald-50',
    features: ['3 boutiques', '15 utilisateurs', '1 000 produits', 'Factures illimitées', 'Import/Export CSV & Excel', 'Analytiques avancées', 'Transferts multi-sites', 'Support téléphonique'],
  },
  {
    name: 'Pro',
    price: '19 900 XAF',
    period: '/mois',
    highlight: false,
    cta: 'Choisir Pro',
    ctaStyle: 'border-2 border-emerald-600 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20',
    features: ['10 boutiques', '50 utilisateurs', 'Produits illimités', 'Factures illimitées', 'API & intégrations', 'Analytiques premium', 'Exercice fiscal', 'Support dédié 24/7'],
  },
]

// Secteurs (sans emoji — texte seul, séparés par des points)
const sectors = [
  'Boutiques & Magasins',
  'Restaurants & Hôtels',
  'Pharmacies',
  'Entrepôts & Grossistes',
  'Commerce général',
  'Cosmétiques & Beauté',
]

// Pain points (numérotés, titrés — plus d'emojis)
const pains = [
  {
    num: '01',
    title: 'Stock impossible à suivre',
    pain: '"Je ne sais jamais combien j\'ai en stock réellement — ça diffère toujours de mon fichier Excel."',
    solution: 'Stock mis à jour à chaque vente et réception. Zéro écart, alertes rupture automatiques.',
  },
  {
    num: '02',
    title: 'Inventaires qui paralysent',
    pain: '"Mon inventaire annuel prend 3 jours et je dois fermer la boutique pour le faire."',
    solution: 'Inventaire en continu au scanner. Comptage QR code, ajustements en direct, sans fermeture.',
  },
  {
    num: '03',
    title: 'Multi-sites sans visibilité',
    pain: '"Je gère 3 boutiques mais je ne sais pas laquelle est la plus rentable."',
    solution: 'Dashboard analytique par boutique. Ventes, marges, mouvements et transferts en temps réel.',
  },
]
</script>

<template>
  <div class="w-full">

    <!-- ═══════════════════════════════════════
         HERO
    ════════════════════════════════════════ -->
    <section class="relative bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
      <!-- Background léger : grille + 1 orbe statique (pas de blobs animés) -->
      <div class="absolute inset-0 -z-10 opacity-[0.04] dark:opacity-[0.06]" aria-hidden="true"
        style="background-image: linear-gradient(to right, #10B981 1px, transparent 1px), linear-gradient(to bottom, #10B981 1px, transparent 1px); background-size: 64px 64px;">
      </div>
      <div class="absolute -top-24 -right-24 w-96 h-96 bg-emerald-400/20 dark:bg-emerald-500/10 rounded-full blur-3xl -z-10 pointer-events-none" aria-hidden="true"></div>

      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-24">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          <!-- Contenu gauche -->
          <div class="text-center lg:text-left">

            <!-- Badge live -->
            <div class="inline-flex items-center px-4 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-6 border border-emerald-200/50 dark:border-emerald-700/30">
              <span class="relative flex h-2.5 w-2.5 mr-2" aria-hidden="true">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              Logiciel de gestion de stock · PME africaines
            </div>

            <!-- H1 statique — lu immédiatement par le visiteur -->
            <h1 class="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 dark:text-white mb-4 leading-[1.05] tracking-tight">
              Gérez votre stock.<br>
              <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-blue-600">
                Pilotez votre<br class="hidden sm:block"> croissance.
              </span>
            </h1>

            <!-- Typewriter sur proposition de valeur (sous le H1) -->
            <p class="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-3 min-h-[1.8em]">
              Suivez
              <span class="text-emerald-600 dark:text-emerald-400 font-semibold">{{ typedPhrase }}</span><span
                class="inline-block w-0.5 h-[1em] bg-emerald-500 align-middle ml-0.5 animate-pulse" aria-hidden="true"></span>
            </p>

            <p class="text-base text-gray-500 dark:text-gray-400 mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              De la petite boutique à l'entrepôt multi-sites — stocks, inventaires, factures et transferts centralisés dans une seule plateforme. <strong class="text-gray-700 dark:text-gray-300">Sans Excel. Sans papier.</strong>
            </p>

            <!-- CTA -->
            <div class="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-8">
              <NuxtLink
                to="/home/inscription"
                class="inline-flex items-center justify-center px-7 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl shadow-lg shadow-emerald-500/30 transition-colors duration-150 font-semibold text-base"
              >
                <svg class="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
                Commencer gratuitement
              </NuxtLink>
              <NuxtLink
                to="/home/contact_accueil"
                class="inline-flex items-center justify-center px-7 py-3.5 border-2 border-emerald-600 dark:border-emerald-500 text-emerald-700 dark:text-emerald-400 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors duration-150 font-semibold text-base"
              >
                Demander une démo
              </NuxtLink>
            </div>

            <!-- Trust indicators -->
            <div class="flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
              <span v-for="trust in ['Essai gratuit 3 mois', 'Sans carte bancaire', 'Paiement en XAF']" :key="trust" class="flex items-center gap-1.5">
                <svg class="w-4 h-4 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                {{ trust }}
              </span>
            </div>
          </div>

          <!-- Image droite : LCP image avec hints de priorité -->
          <div class="relative">
            <img
              src="/img/undraw_finance_m6vw_1_-removebg-preview.png"
              alt="Interface Mura Storage — gestion de stock moderne"
              class="w-full max-w-lg mx-auto lg:max-w-none drop-shadow-xl"
              loading="eager"
              fetchpriority="high"
              width="600"
              height="480"
            >
            <!-- Floating card: stock temps réel -->
            <div class="hidden sm:flex absolute top-2 right-0 lg:-right-6 items-center gap-3 bg-white dark:bg-gray-800 rounded-xl shadow-xl p-3.5 border border-gray-100 dark:border-gray-700 animate-float">
              <div class="w-9 h-9 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <div>
                <p class="text-[10px] text-gray-400 dark:text-gray-500">Dernière mise à jour</p>
                <p class="text-sm font-semibold text-gray-800 dark:text-white">Stock synchronisé</p>
              </div>
            </div>
            <!-- Floating card: efficacité -->
            <div class="hidden sm:flex absolute bottom-10 -left-4 items-center gap-3 bg-white dark:bg-gray-800 rounded-xl shadow-xl p-3.5 border border-gray-100 dark:border-gray-700 animate-float-delayed">
              <div class="w-9 h-9 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                </svg>
              </div>
              <div>
                <p class="text-lg font-bold text-emerald-600 dark:text-emerald-400 leading-none">+45%</p>
                <p class="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">d'efficacité opérationnelle</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════
         SECTEURS (social proof bar)
    ════════════════════════════════════════ -->
    <section class="py-4 bg-white dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800 overflow-hidden">
      <div class="max-w-6xl mx-auto px-4 sm:px-6">
        <div class="flex flex-wrap items-center justify-center gap-y-2">
          <span class="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mr-6 flex-shrink-0">Secteurs</span>
          <template v-for="(s, i) in sectors" :key="s">
            <span class="text-[13px] font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">{{ s }}</span>
            <span v-if="i < sectors.length - 1" class="mx-3 text-gray-200 dark:text-gray-700 select-none" aria-hidden="true">·</span>
          </template>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════
         PAIN POINTS → SOLUTIONS
    ════════════════════════════════════════ -->
    <section class="py-16 md:py-20 bg-gray-50 dark:bg-gray-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12 reveal fade-up">
          <p class="text-[11px] font-semibold uppercase tracking-widest text-red-500 mb-3">Problèmes terrain</p>
          <h2 class="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-3">
            Vous gérez encore avec Excel ?
          </h2>
          <p class="text-lg font-light text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Ces blocages sont courants. Mura Storage les résout tous — de façon permanente.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div
            v-for="(p, i) in pains"
            :key="i"
            class="reveal fade-up group bg-white dark:bg-gray-800 rounded-2xl p-7 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col gap-5 hover:border-emerald-200 dark:hover:border-emerald-800 hover:shadow-md transition-all duration-200"
            :style="{ transitionDelay: `${i * 80}ms` }"
          >
            <!-- Numéro + label -->
            <div class="flex items-center justify-between">
              <span class="text-4xl font-black tabular-nums text-gray-100 dark:text-gray-700 leading-none select-none group-hover:text-emerald-100 dark:group-hover:text-emerald-900/50 transition-colors">{{ p.num }}</span>
              <span class="text-[10px] font-bold uppercase tracking-widest text-red-400 dark:text-red-500">Frein opérationnel</span>
            </div>
            <!-- Titre court -->
            <h3 class="text-base font-bold text-gray-800 dark:text-white -mt-2">{{ p.title }}</h3>
            <!-- Citation terrain -->
            <p class="text-gray-400 dark:text-gray-500 text-sm leading-relaxed italic border-l-2 border-gray-100 dark:border-gray-700 pl-3">{{ p.pain }}</p>
            <!-- Séparateur -->
            <div class="h-px bg-gray-100 dark:bg-gray-700"></div>
            <!-- Solution -->
            <div class="flex items-start gap-3">
              <div class="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <p class="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{{ p.solution }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════
         FONCTIONNALITÉS
    ════════════════════════════════════════ -->
    <section class="py-16 md:py-24 bg-white dark:bg-gray-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-14 reveal fade-up">
          <p class="text-[11px] font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-3">Fonctionnalités</p>
          <h2 class="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
            Pourquoi choisir Mura Storage ?
          </h2>
          <p class="text-lg font-light text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Toutes les fonctionnalités d'un ERP moderne, taillées pour les PME africaines
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          <div
            v-for="(f, i) in features"
            :key="f.title"
            class="reveal fade-up group bg-gradient-to-br rounded-xl p-7 hover:shadow-lg transition-shadow duration-300"
            :class="bgMap[f.color]"
            :style="{ transitionDelay: `${i * 70}ms` }"
          >
            <div class="w-11 h-11 rounded-xl flex items-center justify-center mb-5 flex-shrink-0" :class="colorMap[f.color]">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="f.icon"/>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">{{ f.title }}</h3>
            <p class="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{{ f.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════
         COMMENT ÇA MARCHE
    ════════════════════════════════════════ -->
    <section class="py-16 md:py-24 bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-emerald-900 relative overflow-hidden">
      <div class="absolute top-20 left-10 w-40 h-40 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" aria-hidden="true"></div>
      <div class="absolute bottom-20 right-10 w-60 h-60 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" aria-hidden="true"></div>

      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-14 reveal fade-up">
          <p class="text-[11px] font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-3">Processus simplifié</p>
          <h2 class="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">Comment ça marche ?</h2>
          <p class="text-lg font-light text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            De la lecture du code-barres à l'impression de la facture en moins de 3 secondes
          </p>
        </div>

        <div class="reveal fade-up bg-white/85 dark:bg-gray-800/60 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-gray-200 dark:border-gray-700 shadow-xl">
          <div class="flex flex-col md:flex-row items-center justify-between gap-10 md:gap-6">

            <!-- Étape 1 : Scanner -->
            <div class="flex flex-col items-center text-center flex-1">
              <div class="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/30">
                <span class="text-xl font-bold text-white">1</span>
              </div>
              <div class="relative w-28 h-36 bg-gradient-to-b from-gray-400 to-gray-500 dark:from-gray-600 dark:to-gray-700 rounded-2xl shadow-2xl flex flex-col items-center justify-end pb-3">
                <div class="absolute top-3 left-3 right-3 h-7 bg-gray-800 dark:bg-gray-900 rounded flex items-center justify-center">
                  <span class="text-[10px] font-mono text-emerald-400 animate-pulse">SCAN</span>
                </div>
                <div class="w-18 h-10 bg-gray-700 dark:bg-gray-800 rounded relative overflow-hidden w-[72px]">
                  <div class="absolute inset-x-2 h-0.5 bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)] animate-scan-laser"></div>
                  <div class="absolute inset-2 flex items-center justify-center gap-0.5">
                    <div class="w-0.5 h-4 bg-white"></div><div class="w-1 h-4 bg-white"></div>
                    <div class="w-0.5 h-4 bg-white"></div><div class="w-1 h-4 bg-white"></div>
                    <div class="w-0.5 h-4 bg-white"></div><div class="w-1.5 h-4 bg-white"></div>
                  </div>
                </div>
                <div class="w-5 h-1.5 mt-2 bg-emerald-500 rounded-full"></div>
              </div>
              <h3 class="text-base font-semibold text-gray-900 dark:text-white mt-4">Scanner le produit</h3>
              <p class="text-gray-400 dark:text-gray-500 text-xs mt-1">Code-barres ou QR Code</p>
            </div>

            <!-- Flèche -->
            <div class="hidden md:flex items-center flex-shrink-0">
              <svg class="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
              </svg>
            </div>
            <div class="md:hidden w-0.5 h-8 bg-gradient-to-b from-emerald-400 to-blue-400"></div>

            <!-- Étape 2 : Traitement -->
            <div class="flex flex-col items-center text-center flex-1">
              <div class="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
                <span class="text-xl font-bold text-white">2</span>
              </div>
              <div class="w-24 h-24 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/25">
                <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"/>
                </svg>
              </div>
              <h3 class="text-base font-semibold text-gray-900 dark:text-white mt-4">Traitement instantané</h3>
              <p class="text-gray-400 dark:text-gray-500 text-xs mt-1">Base de données en temps réel</p>
            </div>

            <!-- Flèche -->
            <div class="hidden md:flex items-center flex-shrink-0">
              <svg class="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
              </svg>
            </div>
            <div class="md:hidden w-0.5 h-8 bg-gradient-to-b from-blue-400 to-purple-400"></div>

            <!-- Étape 3 : Facture -->
            <div class="flex flex-col items-center text-center flex-1">
              <div class="w-14 h-14 bg-purple-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-purple-500/30">
                <span class="text-xl font-bold text-white">3</span>
              </div>
              <div class="relative w-32 h-24 bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-200 dark:to-gray-300 rounded-xl shadow-2xl border border-gray-300">
                <div class="absolute top-2.5 left-4 right-4 h-1 bg-gray-700 rounded"></div>
                <div class="absolute top-6 left-4 right-4 h-4 bg-emerald-500 rounded flex items-center justify-center">
                  <span class="text-[7px] font-bold text-white">IMPRESSION OK</span>
                </div>
                <div class="absolute bottom-2.5 left-4 flex gap-1">
                  <div class="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                  <div class="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
                </div>
                <!-- Ticket qui sort -->
                <div class="absolute -top-16 left-1/2 -translate-x-1/2 w-24 animate-receipt-out">
                  <div class="bg-white rounded shadow-xl px-2 py-1.5 border border-gray-200 space-y-1">
                    <div class="text-center border-b border-dashed border-gray-300 pb-1">
                      <div class="text-[7px] font-bold text-emerald-600">MURA STORAGE</div>
                      <div class="text-[5px] text-gray-400">Facture #2025-0142</div>
                    </div>
                    <div class="flex justify-between text-[5px] text-gray-600"><span>Produit A</span><span>15 000</span></div>
                    <div class="flex justify-between text-[5px] text-gray-600"><span>Produit B ×2</span><span>24 000</span></div>
                    <div class="border-t border-dashed border-gray-300 pt-1 flex justify-between text-[6px] font-bold">
                      <span class="text-gray-800">TOTAL</span><span class="text-emerald-600">39 000 XAF</span>
                    </div>
                  </div>
                </div>
              </div>
              <h3 class="text-base font-semibold text-gray-900 dark:text-white mt-4">Facture imprimée</h3>
              <p class="text-gray-400 dark:text-gray-500 text-xs mt-1">PDF ou ticket de caisse</p>
            </div>
          </div>

          <!-- Métriques bas — SVG à la place des emojis -->
          <div class="mt-10 pt-8 border-t border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-center gap-8">
            <div class="flex items-center gap-2.5 text-sm font-medium text-gray-600 dark:text-gray-300">
              <svg class="w-4 h-4 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd"/>
              </svg>
              Moins de 3 secondes
            </div>
            <div class="flex items-center gap-2.5 text-sm font-medium text-gray-600 dark:text-gray-300">
              <svg class="w-4 h-4 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              100% automatisé
            </div>
            <div class="flex items-center gap-2.5 text-sm font-medium text-gray-600 dark:text-gray-300">
              <svg class="w-4 h-4 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/>
              </svg>
              Données sécurisées
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════
         STATS
    ════════════════════════════════════════ -->
    <section class="py-16 md:py-20 bg-gradient-to-r from-emerald-600 to-blue-600">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-14">
          <p class="text-[11px] font-semibold uppercase tracking-widest text-emerald-300 mb-3">Résultats</p>
          <h2 class="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-3">Des chiffres qui parlent</h2>
          <p class="text-emerald-200 font-light max-w-xl mx-auto">Rejoignez des centaines d'entreprises africaines qui font confiance à Mura Storage</p>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div v-for="s in [
            { value: '500+', label: 'Boutiques gérées' },
            { value: '10 000+', label: 'Factures générées' },
            { value: '5+', label: 'Pays d\'Afrique' },
            { value: '99,9%', label: 'Disponibilité garantie' },
          ]" :key="s.label" class="flex flex-col items-center">
            <div class="text-5xl md:text-6xl font-black text-white tabular-nums leading-none mb-2">{{ s.value }}</div>
            <div class="text-emerald-200 text-sm font-light tracking-wide">{{ s.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════
         TARIFICATION
    ════════════════════════════════════════ -->
    <section class="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-14 reveal fade-up">
          <p class="text-[11px] font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-3">Tarification</p>
          <h2 class="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">Plans adaptés à votre croissance</h2>
          <p class="text-lg font-light text-gray-500 dark:text-gray-400">Commencez gratuitement. Évoluez à votre rythme. Paiement en XAF.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            v-for="(plan, i) in plans"
            :key="plan.name"
            class="reveal fade-up rounded-2xl flex flex-col overflow-hidden"
            :class="plan.highlight
              ? 'bg-gradient-to-b from-emerald-600 to-emerald-700 shadow-2xl shadow-emerald-500/30 border-2 border-emerald-400'
              : 'bg-white dark:bg-gray-800 shadow border border-gray-100 dark:border-gray-700'"
            :style="{ transitionDelay: `${i * 80}ms` }"
          >
            <!-- En-tête plan -->
            <div class="p-7 pb-4">
              <div v-if="plan.badge" class="inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full mb-3"
                :class="plan.highlight ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700'">
                {{ plan.badge }}
              </div>
              <h3 class="text-lg font-bold mb-1" :class="plan.highlight ? 'text-white' : 'text-gray-900 dark:text-white'">{{ plan.name }}</h3>
              <div class="flex items-baseline gap-1">
                <span class="text-3xl font-extrabold" :class="plan.highlight ? 'text-white' : 'text-gray-900 dark:text-white'">{{ plan.price }}</span>
                <span class="text-sm" :class="plan.highlight ? 'text-emerald-200' : 'text-gray-400'">{{ plan.period }}</span>
              </div>
            </div>

            <!-- Features avec checkmarks -->
            <ul class="flex-1 px-7 py-4 space-y-2.5">
              <li v-for="feat in plan.features" :key="feat" class="flex items-start gap-2.5 text-sm">
                <svg class="w-4 h-4 flex-shrink-0 mt-0.5" :class="plan.highlight ? 'text-emerald-200' : 'text-emerald-500'" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                <span :class="plan.highlight ? 'text-emerald-50' : 'text-gray-600 dark:text-gray-300'">{{ feat }}</span>
              </li>
            </ul>

            <!-- CTA -->
            <div class="px-7 pb-7 pt-4">
              <NuxtLink
                to="/home/inscription"
                class="block w-full text-center px-5 py-3 rounded-xl font-semibold text-sm transition-colors duration-150"
                :class="plan.ctaStyle"
              >
                {{ plan.cta }}
              </NuxtLink>
            </div>
          </div>
        </div>

        <div class="text-center mt-10">
          <NuxtLink to="/home/tarification" class="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold hover:underline text-sm">
            Comparer tous les plans en détail
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
            </svg>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════
         CTA FINAL
    ════════════════════════════════════════ -->
    <section class="py-16 md:py-20 bg-white dark:bg-gray-800">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 text-center reveal fade-up">
        <div class="bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-3xl p-10 md:p-16 border border-emerald-100 dark:border-emerald-800/40">
          <p class="text-[11px] font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-4">Commencer</p>
          <h2 class="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4 leading-tight">
            Prêt à transformer<br>votre gestion de stock ?
          </h2>
          <p class="text-lg font-light text-gray-500 dark:text-gray-400 mb-8 max-w-xl mx-auto">
            3 mois d'essai gratuit · Aucune carte bancaire · Configuration en 5 minutes
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <NuxtLink
              to="/home/inscription"
              class="inline-flex items-center justify-center px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/30 transition-colors duration-150"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
              Créer mon compte gratuit
            </NuxtLink>
            <NuxtLink
              to="/home/contact_accueil"
              class="inline-flex items-center justify-center px-8 py-4 border-2 border-emerald-600 dark:border-emerald-500 text-emerald-700 dark:text-emerald-400 rounded-xl font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors duration-150"
            >
              Parler à un expert
            </NuxtLink>
          </div>
          <!-- Contact rapide -->
          <div class="mt-8 pt-8 border-t border-emerald-100 dark:border-emerald-800/40 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-gray-500 dark:text-gray-400">
            <a href="tel:+237658934147" class="flex items-center gap-2 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
              </svg>
              +237 658 934 147
            </a>
            <a href="mailto:support@murastorage.com" class="flex items-center gap-2 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              support@murastorage.com
            </a>
            <span class="flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              Bamendzi 2, Bafoussam · Cameroun
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════
         AVIS (chargé en lazy quand approché)
    ════════════════════════════════════════ -->
    <div id="avis-marker"></div>
    <Suspense v-if="showAvis">
      <Avis />
      <template #fallback>
        <div class="py-20 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div class="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </template>
    </Suspense>

  </div>
</template>

<style scoped>
/* ===== Reveal au scroll (IntersectionObserver) ===== */
.reveal {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.55s ease, transform 0.55s ease;
}
.reveal.is-visible {
  opacity: 1;
  transform: translateY(0);
}
@media (prefers-reduced-motion: reduce) {
  .reveal { opacity: 1; transform: none; transition: none; }
}

/* ===== Floating cards hero (2 elements seulement) ===== */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
.animate-float { animation: float 4s ease-in-out infinite; }
.animate-float-delayed { animation: float 4s ease-in-out 2s infinite; }

/* ===== Scanner laser ===== */
@keyframes scan-laser {
  0%, 100% { top: 15%; }
  50% { top: 75%; }
}
.animate-scan-laser { animation: scan-laser 1.5s ease-in-out infinite; position: absolute; left: 8px; right: 8px; height: 2px; }

/* ===== Ticket qui sort de l'imprimante ===== */
@keyframes receipt-out {
  0%, 15% { transform: translateX(-50%) translateY(50px); opacity: 0; }
  35% { transform: translateX(-50%) translateY(20px); opacity: 1; }
  80%, 100% { transform: translateX(-50%) translateY(0); opacity: 1; }
}
.animate-receipt-out { animation: receipt-out 4s ease-out infinite; }

/* ===== Responsive ===== */
@media (max-width: 768px) {
  .text-6xl { font-size: 2.8rem; }
  .text-5xl { font-size: 2.25rem; }
}
</style>
