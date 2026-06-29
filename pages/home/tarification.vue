<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSubscriptionStore } from '@/stores/subscription'
import { useAuthStore } from '@/stores/auth'
import { useSeo, createSoftwareApplicationData, createFAQData, createPricingData, SITE_URL } from '@/composables/useSeo'

definePageMeta({ layout: 'accueil' })

// SEO/AEO/GEO complet
useSeo({
  title: 'Tarification Mura Storage — Starter 4 900, Business 9 900, Pro 19 900 FCFA/mois',
  description: 'Plans de gestion de stock abordables pour PME africaines. Essai gratuit 3 mois. Starter 4 900 FCFA, Business 9 900 FCFA, Pro 19 900 FCFA. Paiement Orange Money, MTN, carte.',
  keywords: 'tarif gestion stock Cameroun, prix logiciel stock, abonnement Mura Storage, Starter Business Pro, logiciel facturation prix',
  canonical: `${SITE_URL}/home/tarification`,
  ogImage: `${SITE_URL}/img/logo-mura-storage.png`,
  structuredData: [
    createSoftwareApplicationData(),
    ...createPricingData(),
    createFAQData([
      { question: 'Combien coûte Mura Storage ?', answer: 'Mura Storage propose 4 plans : Essai Gratuit (0 FCFA, 3 mois), Starter (4 900 FCFA/mois), Business (9 900 FCFA/mois) et Pro (19 900 FCFA/mois). Paiement par Orange Money, MTN Money ou carte bancaire.' },
      { question: 'Y a-t-il une période d\'essai gratuite ?', answer: 'Oui, le plan Essai Gratuit donne accès à Mura Storage pendant 3 mois sans carte bancaire ni engagement.' },
      { question: 'Puis-je changer de plan à tout moment ?', answer: 'Oui, vous pouvez passer à un plan supérieur ou inférieur à tout moment. Le changement prend effet immédiatement.' },
      { question: 'Quels moyens de paiement acceptez-vous ?', answer: 'Nous acceptons Orange Money, MTN Mobile Money, Stripe et carte bancaire classique. Aucun prélèvement automatique sans accord.' },
      { question: 'Combien de boutiques puis-je gérer avec le plan Starter ?', answer: 'Le plan Starter permet de gérer 2 boutiques avec 5 utilisateurs et jusqu\'à 200 produits.' },
    ])
  ]
})

const router = useRouter()
const authStore = useAuthStore()
const subStore = useSubscriptionStore()
const billingPeriod = ref<'monthly' | 'yearly'>('monthly')

const isLoggedIn = computed(() => !!authStore.token)

onMounted(async () => {
  if (isLoggedIn.value) {
    try {
      await Promise.all([subStore.fetchCurrentLimits(), subStore.fetchCurrentUsage()])
    } catch {}
  }
})

function usagePct(current: number, limit: number | null) {
  if (!limit) return null
  return Math.min(Math.round((current / limit) * 100), 100)
}

function usageColor(pct: number | null) {
  if (pct === null) return 'bg-emerald-500'
  if (pct >= 90) return 'bg-red-500'
  if (pct >= 70) return 'bg-orange-400'
  return 'bg-emerald-500'
}

const usageItems = computed(() => {
  const u = subStore.currentUsage
  const l = subStore.currentLimits
  if (!u || !l) return []
  return [
    { label: 'Boutiques', current: u.boutiques_count, limit: l.max_boutiques, pct: usagePct(u.boutiques_count, l.max_boutiques) },
    { label: 'Utilisateurs', current: u.users_count, limit: l.max_users, pct: usagePct(u.users_count, l.max_users) },
    { label: 'Produits', current: u.produits_count, limit: l.max_produits, pct: usagePct(u.produits_count, l.max_produits) },
    { label: 'Factures/mois', current: u.factures_count, limit: l.max_factures_per_month, pct: usagePct(u.factures_count, l.max_factures_per_month) },
  ]
})
const showPaymentModal = ref(false)
const selectedPlan = ref<any>(null)
const paymentMethod = ref('')
const phoneNumber = ref('')
const paying = ref(false)
const paymentDone = ref(false)

const PLANS = [
  {
    key: 'free',
    name: 'Essai Gratuit',
    price: { monthly: 0, yearly: 0 },
    badge: '3 mois offerts',
    badgeColor: 'bg-emerald-100 text-emerald-700',
    highlight: false,
    description: 'Découvrez MuraStorage sans engagement ni carte bancaire.',
    features: [
      { label: '1 boutique', ok: true },
      { label: '3 utilisateurs', ok: true },
      { label: '30 produits', ok: true },
      { label: '30 factures/mois', ok: true },
      { label: 'Gestion des partenaires', ok: true },
      { label: 'Inventaires', ok: false },
      { label: 'Export CSV', ok: false },
      { label: 'Import CSV', ok: false },
      { label: 'Transferts entre boutiques', ok: false },
      { label: 'Analytiques avancées', ok: false },
      { label: 'Support prioritaire', ok: false },
    ],
    cta: 'Commencer gratuitement',
    ctaRoute: '/home/inscription',
  },
  {
    key: 'starter',
    name: 'Starter',
    price: { monthly: 4900, yearly: 52920 },
    badge: null,
    highlight: false,
    description: 'Pour les petits commerces qui veulent gérer leur stock sérieusement.',
    features: [
      { label: '2 boutiques', ok: true },
      { label: '5 utilisateurs', ok: true },
      { label: '200 produits', ok: true },
      { label: '200 factures/mois', ok: true },
      { label: 'Gestion des partenaires', ok: true },
      { label: '1 inventaire/mois', ok: true },
      { label: 'Export CSV', ok: true },
      { label: 'Import CSV', ok: false },
      { label: 'Transferts entre boutiques', ok: false },
      { label: 'Analytiques avancées', ok: false },
      { label: 'Support prioritaire', ok: false },
    ],
    cta: 'Choisir Starter',
    ctaRoute: null,
  },
  {
    key: 'business',
    name: 'Business',
    price: { monthly: 9900, yearly: 106920 },
    badge: 'Populaire',
    badgeColor: 'bg-emerald-500 text-white',
    highlight: true,
    description: 'Pour les PME avec plusieurs points de vente et une équipe structurée.',
    features: [
      { label: '3 boutiques', ok: true },
      { label: '15 utilisateurs', ok: true },
      { label: '1 000 produits', ok: true },
      { label: 'Factures illimitées', ok: true },
      { label: 'Gestion des partenaires', ok: true },
      { label: '5 inventaires/mois', ok: true },
      { label: 'Export CSV & Excel', ok: true },
      { label: 'Import CSV', ok: true },
      { label: 'Transferts entre boutiques', ok: true },
      { label: 'Analytiques avancées', ok: true },
      { label: 'Support prioritaire', ok: false },
    ],
    cta: 'Choisir Business',
    ctaRoute: null,
  },
  {
    key: 'pro',
    name: 'Pro',
    price: { monthly: 19900, yearly: 214920 },
    badge: 'Tout inclus',
    badgeColor: 'bg-violet-100 text-violet-700',
    highlight: false,
    description: 'Toutes les fonctionnalités sans aucune limite pour les entreprises ambitieuses.',
    features: [
      { label: '10 boutiques', ok: true },
      { label: '50 utilisateurs', ok: true },
      { label: 'Produits illimités', ok: true },
      { label: 'Factures illimitées', ok: true },
      { label: 'Gestion des partenaires', ok: true },
      { label: 'Inventaires illimités', ok: true },
      { label: 'Export CSV & Excel', ok: true },
      { label: 'Import CSV', ok: true },
      { label: 'Transferts entre boutiques', ok: true },
      { label: 'Analytiques avancées', ok: true },
      { label: 'Accès API', ok: true },
    ],
    cta: 'Choisir Pro',
    ctaRoute: null,
  },
]

function formatPrice(p: number) {
  return p.toLocaleString('fr-FR') + ' FCFA'
}

function yearlyMonthly(plan: any) {
  return Math.round(plan.price.yearly / 12).toLocaleString('fr-FR') + ' FCFA/mois'
}

function openPayment(plan: any) {
  if (plan.ctaRoute) {
    router.push(plan.ctaRoute)
    return
  }
  selectedPlan.value = plan
  paymentMethod.value = ''
  phoneNumber.value = ''
  paymentDone.value = false
  showPaymentModal.value = true
}

async function pay() {
  if (!paymentMethod.value) return
  paying.value = true
  // Simulation — la vraie intégration se fera après inscription
  await new Promise(r => setTimeout(r, 1500))
  paying.value = false
  paymentDone.value = true
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero -->
    <section class="pt-16 pb-12 text-center bg-white border-b border-gray-100">
      <div class="max-w-3xl mx-auto px-4">
        <span class="inline-block bg-emerald-100 text-emerald-700 text-sm font-semibold px-3 py-1 rounded-full mb-4">
          Essai gratuit 3 mois · Aucune carte bancaire requise
        </span>
        <h1 class="text-4xl font-extrabold text-gray-900 mb-4">
          Des prix transparents, pour chaque commerce
        </h1>
        <p class="text-lg text-gray-500 mb-8">
          Paiement par Orange Money, MTN Money, Stripe ou carte bancaire. Résiliez à tout moment.
        </p>

        <!-- Toggle mensuel / annuel -->
        <div class="inline-flex items-center bg-gray-100 rounded-xl p-1 gap-1">
          <button
            @click="billingPeriod = 'monthly'"
            class="px-5 py-2 rounded-lg text-sm font-medium transition-all"
            :class="billingPeriod === 'monthly' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'"
          >
            Mensuel
          </button>
          <button
            @click="billingPeriod = 'yearly'"
            class="px-5 py-2 rounded-lg text-sm font-medium transition-all"
            :class="billingPeriod === 'yearly' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'"
          >
            Annuel
            <span class="ml-1.5 text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">-10%</span>
          </button>
        </div>
      </div>
    </section>

    <!-- Utilisation du compte (utilisateurs connectés uniquement) -->
    <section v-if="isLoggedIn && subStore.currentLimits" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-2">
      <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div class="flex items-center justify-between mb-5">
          <div>
            <h2 class="text-base font-bold text-gray-900">Votre utilisation actuelle</h2>
            <p class="text-sm text-gray-500 mt-0.5">
              Plan <span class="font-semibold text-emerald-700">{{ subStore.currentLimits.display_name }}</span>
            </p>
          </div>
          <span class="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">Ce mois-ci</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div v-for="item in usageItems" :key="item.label">
            <div class="flex items-end justify-between mb-1.5">
              <span class="text-xs font-medium text-gray-600">{{ item.label }}</span>
              <span class="text-xs text-gray-500">
                {{ item.current }}
                <span v-if="item.limit !== null"> / {{ item.limit }}</span>
                <span v-else class="text-emerald-600 font-medium"> / ∞</span>
              </span>
            </div>
            <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                v-if="item.limit !== null && item.pct !== null"
                class="h-full rounded-full transition-all"
                :class="usageColor(item.pct)"
                :style="{ width: item.pct + '%' }"
              />
              <div v-else class="h-full w-full bg-emerald-100 rounded-full" />
            </div>
            <p v-if="item.pct !== null && item.pct >= 90" class="text-xs text-red-500 font-medium mt-1">Limite atteinte</p>
            <p v-else-if="item.pct !== null && item.pct >= 70" class="text-xs text-orange-500 mt-1">{{ item.pct }}% utilisé</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Grille des plans -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          v-for="plan in PLANS"
          :key="plan.key"
          class="flex flex-col rounded-2xl border bg-white overflow-hidden transition-shadow hover:shadow-lg"
          :class="[
            plan.highlight ? 'border-emerald-500 shadow-emerald-100 shadow-lg ring-2 ring-emerald-500' : 'border-gray-200',
            isLoggedIn && subStore.currentLimits?.plan_name === plan.key ? 'ring-2 ring-violet-400 border-violet-300' : ''
          ]"
        >
          <!-- Badge plan actuel -->
          <div v-if="isLoggedIn && subStore.currentLimits?.plan_name === plan.key" class="bg-violet-600 text-white text-xs font-semibold text-center py-1.5 tracking-wide">
            Votre plan actuel
          </div>

          <!-- En-tête -->
          <div class="px-6 pt-6 pb-4" :class="plan.highlight ? 'bg-emerald-50' : ''">
            <div class="flex items-center justify-between mb-3">
              <span class="text-base font-bold text-gray-900">{{ plan.name }}</span>
              <span v-if="plan.badge" class="text-xs font-semibold px-2.5 py-1 rounded-full" :class="plan.badgeColor || 'bg-gray-100 text-gray-600'">
                {{ plan.badge }}
              </span>
            </div>
            <p class="text-sm text-gray-500 mb-5 min-h-[40px]">{{ plan.description }}</p>

            <!-- Prix -->
            <div v-if="plan.price.monthly === 0" class="mb-4">
              <span class="text-4xl font-extrabold text-gray-900">Gratuit</span>
              <div class="text-sm text-emerald-600 font-medium mt-1">3 mois d'essai offerts</div>
            </div>
            <div v-else-if="billingPeriod === 'monthly'" class="mb-4">
              <span class="text-4xl font-extrabold text-gray-900">{{ formatPrice(plan.price.monthly) }}</span>
              <span class="text-gray-500 text-sm">/mois</span>
            </div>
            <div v-else class="mb-4">
              <span class="text-4xl font-extrabold text-gray-900">{{ yearlyMonthly(plan) }}</span>
              <div class="text-sm text-emerald-600 font-medium mt-1">soit {{ formatPrice(plan.price.yearly) }}/an</div>
            </div>

            <button
              @click="openPayment(plan)"
              class="w-full py-2.5 rounded-xl text-sm font-semibold transition-colors"
              :class="plan.highlight
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                : 'bg-gray-900 hover:bg-gray-800 text-white'"
            >
              {{ plan.cta }}
            </button>
          </div>

          <!-- Features -->
          <div class="px-6 py-5 border-t border-gray-100 flex-1">
            <ul class="space-y-2.5">
              <li v-for="f in plan.features" :key="f.label" class="flex items-start gap-2.5 text-sm">
                <span v-if="f.ok" class="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                  <svg class="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span v-else class="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-red-50 flex items-center justify-center">
                  <svg class="w-3 h-3 text-red-400" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </span>
                <span :class="f.ok ? 'text-gray-700' : 'text-gray-400'">{{ f.label }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Organisation card -->
      <div class="mt-8 rounded-2xl border border-gray-200 bg-gradient-to-r from-gray-900 to-gray-800 text-white p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div class="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Entreprise / Organisation</div>
          <h3 class="text-2xl font-bold mb-2">Tarification sur demande</h3>
          <p class="text-gray-300 text-sm max-w-xl">
            Boutiques illimitées, utilisateurs illimités, branding personnalisé, support dédié et intégrations sur mesure.
            Idéal pour les groupes, réseaux de distribution et franchises.
          </p>
        </div>
        <a
          href="/home/contact_accueil"
          class="flex-shrink-0 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-8 py-3 rounded-xl transition-colors whitespace-nowrap"
        >
          Nous contacter
        </a>
      </div>
    </section>

    <!-- FAQ -->
    <section class="max-w-3xl mx-auto px-4 pb-20">
      <h2 class="text-2xl font-bold text-center text-gray-900 mb-8">Questions fréquentes</h2>
      <div class="space-y-4">
        <details class="bg-white rounded-xl border border-gray-200 px-6 py-4 group">
          <summary class="font-medium text-gray-900 cursor-pointer list-none flex items-center justify-between">
            Comment fonctionne l'essai gratuit ?
            <span class="text-gray-400 group-open:rotate-45 transition-transform">+</span>
          </summary>
          <p class="mt-3 text-sm text-gray-500">Créez votre compte gratuitement. Pendant 3 mois, vous accédez aux fonctionnalités de base sans aucune carte bancaire. Passez à un plan payant quand vous êtes prêt.</p>
        </details>
        <details class="bg-white rounded-xl border border-gray-200 px-6 py-4 group">
          <summary class="font-medium text-gray-900 cursor-pointer list-none flex items-center justify-between">
            Puis-je changer de plan à tout moment ?
            <span class="text-gray-400 group-open:rotate-45 transition-transform">+</span>
          </summary>
          <p class="mt-3 text-sm text-gray-500">Oui. Vous pouvez passer à un plan supérieur ou inférieur à tout moment. Le changement est immédiat.</p>
        </details>
        <details class="bg-white rounded-xl border border-gray-200 px-6 py-4 group">
          <summary class="font-medium text-gray-900 cursor-pointer list-none flex items-center justify-between">
            Quels moyens de paiement acceptez-vous ?
            <span class="text-gray-400 group-open:rotate-45 transition-transform">+</span>
          </summary>
          <p class="mt-3 text-sm text-gray-500">Orange Money, MTN Mobile Money, Stripe et carte bancaire classique. Aucun prélèvement automatique sans votre accord.</p>
        </details>
      </div>
    </section>

    <!-- Modal paiement -->
    <div v-if="showPaymentModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div class="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div class="bg-emerald-500 px-6 py-4 flex items-center justify-between">
          <h3 class="text-white font-bold text-lg">Souscrire — {{ selectedPlan?.name }}</h3>
          <button @click="showPaymentModal = false" class="text-white/70 hover:text-white">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div class="p-6">
          <div v-if="paymentDone" class="text-center py-4">
            <div class="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
            </div>
            <h4 class="text-xl font-bold text-gray-900 mb-2">Paiement simulé !</h4>
            <p class="text-gray-500 text-sm mb-6">Créez votre compte pour activer votre abonnement {{ selectedPlan?.name }}.</p>
            <NuxtLink to="/home/inscription" class="inline-block bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-8 py-3 rounded-xl transition-colors">
              Créer mon compte
            </NuxtLink>
          </div>

          <div v-else>
            <!-- Récap -->
            <div class="bg-gray-50 rounded-xl p-4 mb-5">
              <div class="flex justify-between text-sm text-gray-600 mb-1">
                <span>Plan</span><span class="font-medium text-gray-900">{{ selectedPlan?.name }}</span>
              </div>
              <div class="flex justify-between text-sm text-gray-600 mb-1">
                <span>Facturation</span>
                <span class="font-medium text-gray-900">{{ billingPeriod === 'monthly' ? 'Mensuelle' : 'Annuelle (-10%)' }}</span>
              </div>
              <div class="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-200 mt-2">
                <span>Total</span>
                <span class="text-emerald-600">
                  {{
                    billingPeriod === 'monthly'
                      ? formatPrice(selectedPlan?.price?.monthly)
                      : formatPrice(selectedPlan?.price?.yearly)
                  }}
                </span>
              </div>
            </div>

            <!-- Méthode de paiement -->
            <p class="text-sm font-medium text-gray-700 mb-3">Méthode de paiement</p>
            <div class="grid grid-cols-2 gap-3 mb-5">
              <button
                v-for="m in [
                  { key: 'orange_money', label: 'Orange Money', color: 'bg-orange-50 border-orange-200 text-orange-700' },
                  { key: 'mtn_money', label: 'MTN Money', color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
                  { key: 'stripe', label: 'Stripe', color: 'bg-blue-50 border-blue-200 text-blue-700' },
                  { key: 'bank_card', label: 'Carte bancaire', color: 'bg-gray-50 border-gray-200 text-gray-700' },
                ]"
                :key="m.key"
                @click="paymentMethod = m.key"
                class="border-2 rounded-xl py-3 px-3 text-sm font-medium transition-all flex items-center justify-center"
                :class="[m.color, paymentMethod === m.key ? 'ring-2 ring-emerald-500 border-emerald-400' : '']"
              >
                {{ m.label }}
              </button>
            </div>

            <!-- Numéro (OM/MTN) -->
            <div v-if="['orange_money', 'mtn_money'].includes(paymentMethod)" class="mb-5">
              <label class="text-sm font-medium text-gray-700 mb-1.5 block">Numéro de téléphone</label>
              <input
                v-model="phoneNumber"
                type="tel"
                placeholder="6XX XXX XXX"
                class="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            <button
              @click="pay"
              :disabled="!paymentMethod || paying || (['orange_money', 'mtn_money'].includes(paymentMethod) && !phoneNumber)"
              class="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <svg v-if="paying" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
              {{ paying ? 'Traitement...' : 'Payer maintenant' }}
            </button>
            <p class="text-xs text-gray-400 text-center mt-3">Paiement simulé · Les vraies API seront intégrées prochainement</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
