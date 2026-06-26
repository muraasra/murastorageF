<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useApiBase } from '@/composables/useApiBase'

definePageMeta({ layout: 'superadmin' })

const { getApiUrl, getAuthHeaders } = useApiBase()

const loading = ref(true)
const currentSub = ref<any>(null)
const plans = ref<any[]>([])
const billingPeriod = ref<'monthly' | 'yearly'>('monthly')

// Modal paiement
const showModal = ref(false)
const selectedPlan = ref<any>(null)
const paymentMethod = ref('')
const phoneNumber = ref('')
const paying = ref(false)
const paymentSuccess = ref(false)
const paymentError = ref('')

async function load() {
  loading.value = true
  try {
    const h = getAuthHeaders()
    const [subRes, plansRes] = await Promise.all([
      $fetch(getApiUrl('/api/subscriptions/current/'), { headers: h }).catch(() => null),
      $fetch(getApiUrl('/api/subscription-plans/'), { headers: h }).catch(() => []),
    ])
    currentSub.value = subRes
    plans.value = Array.isArray(plansRes) ? plansRes : ((plansRes as any)?.results || [])
  } catch (e: any) {
    console.error('Erreur chargement abonnement', e)
  } finally {
    loading.value = false
  }
}

onMounted(load)

function isCurrent(plan: any) {
  return currentSub.value?.plan?.name === plan.name
}

function formatPrice(n: number) {
  return n?.toLocaleString('fr-FR') || '0'
}

function trialLabel() {
  const end = currentSub.value?.trial_end_date
  if (!end) return null
  const days = Math.ceil((new Date(end).getTime() - Date.now()) / 86400000)
  if (days <= 0) return 'Essai expiré'
  return `Essai gratuit — ${days} jour${days > 1 ? 's' : ''} restant${days > 1 ? 's' : ''}`
}

function statusColor(s: string) {
  return s === 'active' ? 'text-emerald-600' : s === 'trial' ? 'text-amber-600' : 'text-red-500'
}

const FEATURE_MAP: Record<string, string> = {
  allow_inventory: 'Inventaires',
  allow_transfers: 'Transferts entre boutiques',
  allow_barcode_generation: 'Génération de codes-barres',
  allow_partners: 'Gestion des partenaires',
  allow_export_csv: 'Export CSV',
  allow_export_excel: 'Export Excel',
  allow_import_csv: 'Import CSV',
  allow_api_access: 'Accès API',
  allow_advanced_analytics: 'Analytiques avancées',
  allow_custom_branding: 'Branding personnalisé',
}

function planFeatures(plan: any) {
  return Object.entries(FEATURE_MAP).map(([key, label]) => ({
    label,
    ok: !!plan[key],
  }))
}

function openModal(plan: any) {
  selectedPlan.value = plan
  paymentMethod.value = ''
  phoneNumber.value = ''
  paymentSuccess.value = false
  paymentError.value = ''
  showModal.value = true
}

async function pay() {
  if (!paymentMethod.value || !selectedPlan.value) return
  paying.value = true
  paymentError.value = ''
  try {
    await $fetch(getApiUrl('/api/payments/initiate/'), {
      method: 'POST',
      headers: getAuthHeaders(),
      body: {
        plan_id: selectedPlan.value.id,
        method: paymentMethod.value,
        billing_period: billingPeriod.value,
        phone_number: phoneNumber.value,
      },
    })
    paymentSuccess.value = true
    await load()
  } catch (e: any) {
    paymentError.value = e?.data?.error || 'Une erreur est survenue'
  } finally {
    paying.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      <!-- Header -->
      <div class="flex items-start justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Abonnement & Tarification</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Gérez votre plan et consultez votre utilisation.</p>
        </div>
        <button @click="load" :disabled="loading" class="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
          <svg class="w-4 h-4" :class="loading ? 'animate-spin' : ''" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
          Actualiser
        </button>
      </div>

      <div v-if="loading" class="flex justify-center py-20">
        <div class="w-10 h-10 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
      </div>

      <template v-else>
        <!-- Résumé abonnement actuel -->
        <div v-if="currentSub" class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div class="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div class="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">Plan actuel</div>
              <div class="flex items-center gap-3">
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">{{ currentSub.plan?.display_name || 'Gratuit' }}</h2>
                <span class="text-sm font-medium px-2.5 py-0.5 rounded-full"
                  :class="currentSub.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'">
                  {{ currentSub.status === 'active' ? 'Actif' : currentSub.status }}
                </span>
              </div>
              <p v-if="trialLabel()" class="text-amber-600 text-sm mt-1 font-medium">{{ trialLabel() }}</p>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div class="text-center">
                <div class="text-lg font-bold text-gray-900 dark:text-white">{{ currentSub.plan?.max_boutiques ?? '∞' }}</div>
                <div class="text-gray-500">Boutiques</div>
              </div>
              <div class="text-center">
                <div class="text-lg font-bold text-gray-900 dark:text-white">{{ currentSub.plan?.max_users ?? '∞' }}</div>
                <div class="text-gray-500">Utilisateurs</div>
              </div>
              <div class="text-center">
                <div class="text-lg font-bold text-gray-900 dark:text-white">{{ currentSub.plan?.max_produits ?? '∞' }}</div>
                <div class="text-gray-500">Produits</div>
              </div>
              <div class="text-center">
                <div class="text-lg font-bold text-gray-900 dark:text-white">{{ currentSub.plan?.max_factures_per_month ?? '∞' }}</div>
                <div class="text-gray-500">Factures/mois</div>
              </div>
            </div>
          </div>

          <!-- Dates -->
          <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div v-if="currentSub.start_date">
              <span class="text-gray-400">Début</span>
              <div class="font-medium text-gray-700 dark:text-gray-300">{{ new Date(currentSub.start_date).toLocaleDateString('fr-FR') }}</div>
            </div>
            <div v-if="currentSub.end_date">
              <span class="text-gray-400">Fin</span>
              <div class="font-medium text-gray-700 dark:text-gray-300">{{ new Date(currentSub.end_date).toLocaleDateString('fr-FR') }}</div>
            </div>
            <div v-if="currentSub.trial_end_date">
              <span class="text-gray-400">Fin essai</span>
              <div class="font-medium text-amber-600">{{ new Date(currentSub.trial_end_date).toLocaleDateString('fr-FR') }}</div>
            </div>
          </div>
        </div>

        <!-- Toggle période -->
        <div class="flex items-center gap-4">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">Changer de plan</h2>
          <div class="inline-flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1 gap-1 ml-auto">
            <button @click="billingPeriod = 'monthly'"
              class="px-4 py-1.5 rounded-md text-sm font-medium transition-all"
              :class="billingPeriod === 'monthly' ? 'bg-white dark:bg-gray-800 shadow text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700'">
              Mensuel
            </button>
            <button @click="billingPeriod = 'yearly'"
              class="px-4 py-1.5 rounded-md text-sm font-medium transition-all"
              :class="billingPeriod === 'yearly' ? 'bg-white dark:bg-gray-800 shadow text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700'">
              Annuel <span class="text-xs text-emerald-600 ml-1">-10%</span>
            </button>
          </div>
        </div>

        <!-- Grille des plans -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div
            v-for="plan in plans.filter(p => p.name !== 'organisation')"
            :key="plan.id"
            class="flex flex-col bg-white dark:bg-gray-800 rounded-xl border overflow-hidden transition-shadow hover:shadow-md"
            :class="isCurrent(plan) ? 'border-emerald-500 ring-2 ring-emerald-400' : 'border-gray-200 dark:border-gray-700'"
          >
            <div class="px-5 pt-5 pb-4" :class="isCurrent(plan) ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''">
              <div class="flex items-center justify-between mb-2">
                <span class="font-bold text-gray-900 dark:text-white">{{ plan.display_name }}</span>
                <span v-if="isCurrent(plan)" class="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full">Actuel</span>
              </div>

              <div class="mb-4">
                <div v-if="plan.price_monthly === 0 || plan.price_monthly == null">
                  <span class="text-3xl font-extrabold text-gray-900 dark:text-white">Gratuit</span>
                </div>
                <div v-else-if="billingPeriod === 'monthly'">
                  <span class="text-3xl font-extrabold text-gray-900 dark:text-white">{{ formatPrice(plan.price_monthly) }}</span>
                  <span class="text-gray-500 text-xs"> FCFA/mois</span>
                </div>
                <div v-else>
                  <span class="text-3xl font-extrabold text-gray-900 dark:text-white">{{ formatPrice(Math.round(plan.price_yearly / 12)) }}</span>
                  <span class="text-gray-500 text-xs"> FCFA/mois</span>
                  <div class="text-xs text-emerald-600 mt-0.5">soit {{ formatPrice(plan.price_yearly) }} FCFA/an</div>
                </div>
              </div>

              <button
                v-if="!isCurrent(plan) && plan.price_monthly > 0"
                @click="openModal(plan)"
                class="w-full py-2 rounded-lg text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-white transition-colors"
              >
                {{ currentSub?.plan?.price_monthly > 0 ? 'Changer de plan' : 'Souscrire' }}
              </button>
              <button
                v-else-if="isCurrent(plan) && plan.price_monthly > 0"
                @click="openModal(plan)"
                class="w-full py-2 rounded-lg text-sm font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors"
              >
                Renouveler
              </button>
              <div v-else class="py-2 text-center text-sm text-emerald-600 font-medium">Plan actif</div>
            </div>

            <!-- Features -->
            <div class="px-5 py-4 border-t border-gray-100 dark:border-gray-700 flex-1">
              <div class="grid grid-cols-2 gap-x-4 gap-y-2 text-xs mb-3">
                <div class="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                  {{ plan.max_boutiques ?? '∞' }} boutique{{ (plan.max_boutiques || 2) > 1 ? 's' : '' }}
                </div>
                <div class="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                  {{ plan.max_users ?? '∞' }} utilisateur{{ (plan.max_users || 2) > 1 ? 's' : '' }}
                </div>
                <div class="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                  {{ plan.max_produits ?? '∞' }} produits
                </div>
                <div class="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                  {{ plan.max_factures_per_month ?? '∞' }} factures/mois
                </div>
              </div>
              <ul class="space-y-1.5">
                <li v-for="f in planFeatures(plan)" :key="f.label" class="flex items-center gap-2 text-xs">
                  <svg v-if="f.ok" class="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
                  <svg v-else class="w-3.5 h-3.5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                  <span :class="f.ok ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400'">{{ f.label }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </template>
    </section>

    <!-- Modal paiement -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div class="bg-emerald-500 px-6 py-4 flex items-center justify-between">
          <h3 class="text-white font-bold text-lg">{{ paymentSuccess ? 'Paiement réussi' : `Souscrire — ${selectedPlan?.display_name}` }}</h3>
          <button @click="showModal = false" class="text-white/70 hover:text-white">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div class="p-6">
          <!-- Succès -->
          <div v-if="paymentSuccess" class="text-center py-4">
            <div class="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
            </div>
            <h4 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Abonnement activé !</h4>
            <p class="text-gray-500 text-sm mb-6">Votre plan {{ selectedPlan?.display_name }} est maintenant actif.</p>
            <button @click="showModal = false" class="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-8 py-3 rounded-xl transition-colors">
              Fermer
            </button>
          </div>

          <!-- Formulaire -->
          <div v-else>
            <!-- Récap -->
            <div class="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-5">
              <div class="flex justify-between text-sm mb-1">
                <span class="text-gray-500">Plan</span><span class="font-medium text-gray-900 dark:text-white">{{ selectedPlan?.display_name }}</span>
              </div>
              <div class="flex justify-between text-sm mb-1">
                <span class="text-gray-500">Facturation</span>
                <span class="font-medium text-gray-900 dark:text-white">{{ billingPeriod === 'monthly' ? 'Mensuelle' : 'Annuelle (-10%)' }}</span>
              </div>
              <div class="flex justify-between text-base font-bold pt-2 border-t border-gray-200 dark:border-gray-600 mt-2">
                <span class="text-gray-700 dark:text-gray-300">Total</span>
                <span class="text-emerald-600">
                  {{ formatPrice(billingPeriod === 'monthly' ? selectedPlan?.price_monthly : selectedPlan?.price_yearly) }} FCFA
                </span>
              </div>
            </div>

            <p class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Méthode de paiement</p>
            <div class="grid grid-cols-2 gap-3 mb-5">
              <button
                v-for="m in [
                  { key: 'orange_money', label: 'Orange Money' },
                  { key: 'mtn_money', label: 'MTN Money' },
                  { key: 'stripe', label: 'Stripe' },
                  { key: 'bank_card', label: 'Carte bancaire' },
                ]"
                :key="m.key"
                @click="paymentMethod = m.key"
                class="border-2 rounded-xl py-3 text-sm font-medium transition-all"
                :class="paymentMethod === m.key ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700' : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300'"
              >
                {{ m.label }}
              </button>
            </div>

            <div v-if="['orange_money', 'mtn_money'].includes(paymentMethod)" class="mb-5">
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Numéro de téléphone</label>
              <input v-model="phoneNumber" type="tel" placeholder="6XX XXX XXX"
                class="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400" />
            </div>

            <div v-if="paymentError" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {{ paymentError }}
            </div>

            <button
              @click="pay"
              :disabled="!paymentMethod || paying || (['orange_money', 'mtn_money'].includes(paymentMethod) && !phoneNumber)"
              class="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <svg v-if="paying" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
              {{ paying ? 'Traitement...' : 'Confirmer le paiement' }}
            </button>
            <p class="text-xs text-gray-400 text-center mt-3">Mode simulation · Intégration API en cours</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
