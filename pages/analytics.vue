<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useApiBase } from '@/composables/useApiBase'
import { useNotification } from '@/types/useNotification'

definePageMeta({ layout: 'default' })

const { getApiUrl, getAuthHeaders, getEntrepriseId } = useApiBase()
const { error } = useNotification()

// ─── State ────────────────────────────────────────────────────────────────────
const loading = ref(true)
const data = ref<any>(null)
const boutiqueId = ref<string>('')

const periodes = [
  { key: 'today',   label: "Aujourd'hui" },
  { key: '7d',      label: '7 jours' },
  { key: '30d',     label: '30 jours' },
  { key: 'month',   label: 'Ce mois' },
  { key: 'quarter', label: 'Ce trimestre' },
  { key: 'custom',  label: 'Période libre' },
]
const periodeKey = ref('30d')
const granularite = ref<'jour'|'semaine'|'mois'>('jour')
const customDebut = ref('')
const customFin = ref('')

function getDateRange(key: string) {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`
  const today = fmt(now)
  if (key === 'today') return { debut: today, fin: today, granularite: 'jour' as const }
  if (key === '7d') {
    const d = new Date(now); d.setDate(d.getDate() - 6)
    return { debut: fmt(d), fin: today, granularite: 'jour' as const }
  }
  if (key === '30d') {
    const d = new Date(now); d.setDate(d.getDate() - 29)
    return { debut: fmt(d), fin: today, granularite: 'jour' as const }
  }
  if (key === 'month') {
    const d = new Date(now.getFullYear(), now.getMonth(), 1)
    return { debut: fmt(d), fin: today, granularite: 'jour' as const }
  }
  if (key === 'quarter') {
    const q = Math.floor(now.getMonth() / 3)
    const d = new Date(now.getFullYear(), q * 3, 1)
    return { debut: fmt(d), fin: today, granularite: 'semaine' as const }
  }
  return { debut: customDebut.value || today, fin: customFin.value || today, granularite: granularite.value }
}

async function charger() {
  loading.value = true
  try {
    const { debut, fin, granularite: gran } = getDateRange(periodeKey.value)
    if (periodeKey.value !== 'custom') granularite.value = gran
    const entrepriseId = getEntrepriseId()
    const params = new URLSearchParams({
      date_debut: debut, date_fin: fin,
      granularite: granularite.value,
      ...(boutiqueId.value ? { boutique: boutiqueId.value } : {}),
      ...(entrepriseId && !boutiqueId.value ? { entreprise: String(entrepriseId) } : {})
    })
    data.value = await $fetch(getApiUrl(`/api/factures/analytics/?${params}`), {
      headers: getAuthHeaders(), cache: 'no-store'
    })
  } catch (e: any) {
    error(e?.data?.detail || 'Erreur lors du chargement des statistiques')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (process.client) {
    try { const b = JSON.parse(localStorage.getItem('boutique') || 'null'); if (b?.id) boutiqueId.value = String(b.id) } catch {}
  }
  charger()
})
watch(periodeKey, () => { if (periodeKey.value !== 'custom') charger() })
watch(granularite, () => { if (periodeKey.value === 'custom') charger() })

// ─── KPIs ────────────────────────────────────────────────────────────────────
const kpis = computed(() => data.value?.kpis || {})
const serie = computed(() => data.value?.serie || [])
const topProduits = computed(() => data.value?.top_produits || [])
const topClients = computed(() => data.value?.top_clients || [])
const topPartenaires = computed(() => data.value?.top_partenaires || [])
const periode = computed(() => data.value?.periode || {})

const tauxPaiement = computed(() => {
  const total = kpis.value.ca_total || 0
  const verse = kpis.value.total_verse || 0
  return total > 0 ? Math.round((verse / total) * 100) : 0
})

const fmt = (n: number) => (n || 0).toLocaleString('fr-FR')

// ─── Graphique SVG CA ─────────────────────────────────────────────────────────
const svgW = 700
const svgH = 200
const padL = 60, padR = 20, padT = 20, padB = 40

const chartData = computed(() => {
  const pts = serie.value
  if (!pts.length) return { bars: [], labels: [], maxCA: 0 }
  const maxCA = Math.max(...pts.map((p: any) => p.ca || 0), 1)
  const w = svgW - padL - padR
  const h = svgH - padT - padB
  const bw = Math.max(4, Math.floor(w / pts.length) - 2)
  const bars = pts.map((p: any, i: number) => {
    const x = padL + i * (w / pts.length) + (w / pts.length - bw) / 2
    const barH = ((p.ca || 0) / maxCA) * h
    const y = padT + h - barH
    const dateLabel = p.date ? p.date.slice(5) : ''
    return { x, y, w: bw, h: barH, ca: p.ca, nb: p.nb_factures, dateLabel, full: p.date }
  })
  // Y-axis labels
  const steps = 4
  const yLabels = Array.from({ length: steps + 1 }, (_, i) => ({
    y: padT + (svgH - padT - padB) * (1 - i / steps),
    val: Math.round((maxCA * i) / steps)
  }))
  return { bars, yLabels, maxCA }
})

// ─── Top produits bar chart horizontal ───────────────────────────────────────
const maxTopCA = computed(() => Math.max(...topProduits.value.map((p: any) => p.ca || 0), 1))

// ─── Tooltip ─────────────────────────────────────────────────────────────────
const tooltip = ref<{ x: number; y: number; bar: any } | null>(null)
const svgRef = ref<SVGElement | null>(null)
function showTip(e: MouseEvent, bar: any) {
  const rect = (e.target as SVGElement).closest('svg')?.getBoundingClientRect()
  if (!rect) return
  tooltip.value = { x: e.clientX - rect.left, y: e.clientY - rect.top - 60, bar }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
  <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

    <!-- Header + contrôles -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Analytiques</h1>
        <p class="text-sm text-gray-500 mt-0.5" v-if="periode.debut">
          {{ new Date(periode.debut).toLocaleDateString('fr-FR') }} → {{ new Date(periode.fin).toLocaleDateString('fr-FR') }}
        </p>
      </div>
      <div class="flex flex-wrap gap-2">
        <button v-for="p in periodes" :key="p.key" @click="periodeKey = p.key"
          :class="periodeKey === p.key
            ? 'bg-emerald-600 text-white border-emerald-600'
            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-emerald-400'"
          class="px-3 py-1.5 text-xs font-medium border rounded-lg transition-colors">
          {{ p.label }}
        </button>
      </div>
    </div>

    <!-- Période libre -->
    <div v-if="periodeKey === 'custom'" class="flex flex-wrap gap-3 items-end bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <div>
        <label class="block text-xs font-medium text-gray-500 mb-1">Début</label>
        <input v-model="customDebut" type="date" class="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" />
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-500 mb-1">Fin</label>
        <input v-model="customFin" type="date" class="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" />
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-500 mb-1">Granularité</label>
        <select v-model="granularite" class="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none">
          <option value="jour">Par jour</option>
          <option value="semaine">Par semaine</option>
          <option value="mois">Par mois</option>
        </select>
      </div>
      <button @click="charger" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors">
        Appliquer
      </button>
    </div>

    <!-- Loader -->
    <div v-if="loading" class="flex justify-center py-16">
      <div class="w-10 h-10 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
    </div>

    <template v-else-if="data">
      <!-- KPIs cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div class="flex items-center justify-between mb-3">
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">CA Total</p>
            <div class="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <UIcon name="i-heroicons-currency-dollar" class="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ fmt(kpis.ca_total) }}</p>
          <p class="text-xs text-gray-400 mt-1">FCFA</p>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div class="flex items-center justify-between mb-3">
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Versé</p>
            <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <UIcon name="i-heroicons-check-circle" class="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <p class="text-2xl font-bold text-blue-600">{{ fmt(kpis.total_verse) }}</p>
          <div class="mt-2">
            <div class="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
              <div class="bg-blue-500 h-1.5 rounded-full transition-all" :style="{ width: tauxPaiement + '%' }"></div>
            </div>
            <p class="text-xs text-gray-400 mt-1">{{ tauxPaiement }}% encaissé</p>
          </div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div class="flex items-center justify-between mb-3">
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Reste à percevoir</p>
            <div class="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <UIcon name="i-heroicons-clock" class="w-4 h-4 text-red-500" />
            </div>
          </div>
          <p class="text-2xl font-bold" :class="kpis.total_reste > 0 ? 'text-red-600' : 'text-emerald-600'">{{ fmt(kpis.total_reste) }}</p>
          <p class="text-xs text-gray-400 mt-1">FCFA</p>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div class="flex items-center justify-between mb-3">
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Factures</p>
            <div class="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <UIcon name="i-heroicons-document-text" class="w-4 h-4 text-purple-600" />
            </div>
          </div>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ kpis.nb_factures || 0 }}</p>
          <div class="flex gap-2 mt-2 text-xs">
            <span class="text-emerald-600 font-medium">{{ kpis.nb_payees || 0 }} payées</span>
            <span class="text-amber-600 font-medium">{{ kpis.nb_partielles || 0 }} partielles</span>
            <span class="text-gray-400">{{ kpis.nb_attente || 0 }} en attente</span>
          </div>
        </div>
      </div>

      <!-- Graphique CA par période -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-sm font-semibold text-gray-900 dark:text-white">Chiffre d'affaires par {{ granularite }}</h2>
          <div class="flex gap-2" v-if="periodeKey === 'custom'">
            <button v-for="g in ['jour','semaine','mois']" :key="g" @click="granularite = g as any"
              :class="granularite === g ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'text-gray-500 hover:text-gray-700'"
              class="px-2 py-1 text-xs rounded-lg transition-colors capitalize">{{ g }}</button>
          </div>
        </div>

        <div v-if="!serie.length" class="text-center py-12 text-gray-400">
          <UIcon name="i-heroicons-chart-bar" class="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p>Aucune donnée sur cette période</p>
        </div>

        <div v-else class="relative" @mouseleave="tooltip = null">
          <svg ref="svgRef" :viewBox="`0 0 ${svgW} ${svgH}`" class="w-full" style="height:220px">
            <!-- Grille horizontale -->
            <line v-for="y in chartData.yLabels" :key="y.y"
              :x1="padL" :y1="y.y" :x2="svgW - padR" :y2="y.y"
              stroke="currentColor" stroke-opacity="0.08" stroke-width="1" />
            <!-- Labels Y -->
            <text v-for="y in chartData.yLabels" :key="'yl'+y.y"
              :x="padL - 6" :y="y.y + 4" text-anchor="end"
              class="fill-gray-400 dark:fill-gray-500" font-size="9">
              {{ y.val >= 1000 ? Math.round(y.val/1000) + 'k' : y.val }}
            </text>
            <!-- Barres -->
            <g v-for="(bar, i) in chartData.bars" :key="i">
              <rect
                :x="bar.x" :y="bar.y" :width="bar.w" :height="bar.h"
                rx="2"
                :class="bar.ca > 0 ? 'fill-emerald-500 dark:fill-emerald-400' : 'fill-gray-200 dark:fill-gray-700'"
                class="cursor-pointer transition-opacity hover:opacity-80"
                @mousemove="showTip($event, bar)"
              />
              <text v-if="chartData.bars.length <= 14"
                :x="bar.x + bar.w / 2" :y="svgH - padB + 14"
                text-anchor="middle" font-size="8" class="fill-gray-400 dark:fill-gray-500">
                {{ bar.dateLabel }}
              </text>
            </g>
            <!-- Axe X -->
            <line :x1="padL" :y1="svgH - padB" :x2="svgW - padR" :y2="svgH - padB"
              stroke="currentColor" stroke-opacity="0.15" stroke-width="1" />
          </svg>

          <!-- Tooltip -->
          <div v-if="tooltip" class="absolute pointer-events-none bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg px-3 py-2 shadow-lg z-10 whitespace-nowrap"
            :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px', transform: 'translateX(-50%)' }">
            <p class="font-semibold">{{ tooltip.bar.full }}</p>
            <p>CA : {{ fmt(tooltip.bar.ca) }} FCFA</p>
            <p class="text-gray-300">{{ tooltip.bar.nb }} facture(s)</p>
          </div>
        </div>
      </div>

      <!-- Répartition + Top -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">

        <!-- Répartition Clients vs Partenaires -->
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h2 class="text-sm font-semibold text-gray-900 dark:text-white mb-4">Répartition</h2>
          <div class="space-y-3">
            <div>
              <div class="flex justify-between text-xs mb-1">
                <span class="text-gray-600 dark:text-gray-400">Clients</span>
                <span class="font-semibold text-blue-600">{{ fmt(kpis.ca_clients) }} FCFA</span>
              </div>
              <div class="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                <div class="bg-blue-500 h-2 rounded-full transition-all"
                  :style="{ width: kpis.ca_total > 0 ? ((kpis.ca_clients / kpis.ca_total) * 100) + '%' : '0%' }"></div>
              </div>
              <p class="text-xs text-gray-400 mt-0.5">{{ kpis.ca_total > 0 ? Math.round((kpis.ca_clients / kpis.ca_total) * 100) : 0 }}%</p>
            </div>
            <div>
              <div class="flex justify-between text-xs mb-1">
                <span class="text-gray-600 dark:text-gray-400">Partenaires</span>
                <span class="font-semibold text-emerald-600">{{ fmt(kpis.ca_partenaires) }} FCFA</span>
              </div>
              <div class="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                <div class="bg-emerald-500 h-2 rounded-full transition-all"
                  :style="{ width: kpis.ca_total > 0 ? ((kpis.ca_partenaires / kpis.ca_total) * 100) + '%' : '0%' }"></div>
              </div>
              <p class="text-xs text-gray-400 mt-0.5">{{ kpis.ca_total > 0 ? Math.round((kpis.ca_partenaires / kpis.ca_total) * 100) : 0 }}%</p>
            </div>
            <div class="border-t border-gray-100 dark:border-gray-700 pt-3 space-y-1.5 text-xs">
              <div class="flex justify-between">
                <span class="text-gray-500">Payées</span>
                <span class="font-semibold text-emerald-600">{{ kpis.nb_payees || 0 }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Partiellement payées</span>
                <span class="font-semibold text-amber-600">{{ kpis.nb_partielles || 0 }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">En attente</span>
                <span class="font-semibold text-gray-600">{{ kpis.nb_attente || 0 }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Top produits -->
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h2 class="text-sm font-semibold text-gray-900 dark:text-white mb-4">Top 5 produits</h2>
          <div v-if="!topProduits.length" class="text-center py-6 text-gray-400 text-xs">Aucune vente sur cette période</div>
          <div v-else class="space-y-3">
            <div v-for="(p, i) in topProduits" :key="p.nom" class="flex items-center gap-2">
              <span class="w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0"
                :class="i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-100 text-gray-600' : 'bg-gray-50 text-gray-500'">
                {{ i + 1 }}
              </span>
              <div class="flex-1 min-w-0">
                <div class="flex justify-between items-center mb-0.5">
                  <p class="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">{{ p.nom }}</p>
                  <p class="text-xs font-bold text-emerald-600 ml-2 flex-shrink-0">{{ fmt(p.ca) }}</p>
                </div>
                <div class="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
                  <div class="bg-emerald-500 h-1.5 rounded-full"
                    :style="{ width: ((p.ca / maxTopCA) * 100) + '%' }"></div>
                </div>
                <p class="text-xs text-gray-400 mt-0.5">{{ p.qte }} unités</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Top clients & partenaires -->
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h2 class="text-sm font-semibold text-gray-900 dark:text-white mb-3">Top clients & partenaires</h2>
          <div v-if="topClients.length" class="mb-4">
            <p class="text-xs font-semibold text-blue-600 mb-2">Clients</p>
            <div v-for="c in topClients" :key="c.nom" class="flex items-center justify-between py-1.5 border-b border-gray-50 dark:border-gray-700 last:border-0">
              <div class="flex items-center gap-2">
                <div class="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xs font-bold text-blue-600">
                  {{ (c.nom || '?').charAt(0).toUpperCase() }}
                </div>
                <span class="text-xs text-gray-700 dark:text-gray-300 truncate max-w-[100px]">{{ c.nom }}</span>
              </div>
              <div class="text-right">
                <p class="text-xs font-bold text-gray-900 dark:text-white">{{ fmt(c.ca) }}</p>
                <p class="text-xs text-gray-400">{{ c.nb }} fact.</p>
              </div>
            </div>
          </div>
          <div v-if="topPartenaires.length">
            <p class="text-xs font-semibold text-emerald-600 mb-2">Partenaires</p>
            <div v-for="p in topPartenaires" :key="p.nom" class="flex items-center justify-between py-1.5 border-b border-gray-50 dark:border-gray-700 last:border-0">
              <div class="flex items-center gap-2">
                <div class="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-xs font-bold text-emerald-600">
                  {{ (p.nom || '?').charAt(0).toUpperCase() }}
                </div>
                <span class="text-xs text-gray-700 dark:text-gray-300 truncate max-w-[100px]">{{ p.nom }}</span>
              </div>
              <div class="text-right">
                <p class="text-xs font-bold text-gray-900 dark:text-white">{{ fmt(p.ca) }}</p>
                <p class="text-xs text-gray-400">{{ p.nb }} fact.</p>
              </div>
            </div>
          </div>
          <div v-if="!topClients.length && !topPartenaires.length" class="text-center py-6 text-gray-400 text-xs">Aucune donnée</div>
        </div>
      </div>
    </template>

    <div v-else-if="!loading" class="text-center py-16 text-gray-400">
      <UIcon name="i-heroicons-chart-bar" class="w-12 h-12 mx-auto mb-3 opacity-30" />
      <p>Aucune donnée disponible</p>
    </div>

  </section>
  </div>
</template>
