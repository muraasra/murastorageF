import { ref, onMounted, onUnmounted } from 'vue'
import { useApiBase } from '@/composables/useApiBase'
import { useNotification } from '@/types/useNotification'

const POLL_INTERVAL_MS = 60000
const SHOWN_KEY = 'stock_alerts_shown_v2'

export const useStockAlerts = () => {
  const isRunning = ref(false)
  let timer: ReturnType<typeof setInterval> | null = null

  const { warning } = useNotification()
  const { getApiUrl, getAuthHeaders, parseApiList } = useApiBase()

  const getShownIds = (): Set<string> => {
    if (!process.client) return new Set()
    try {
      const raw = sessionStorage.getItem(SHOWN_KEY)
      return new Set(raw ? JSON.parse(raw) : [])
    } catch {
      return new Set()
    }
  }

  const markShown = (ids: string[]) => {
    if (!process.client || !ids.length) return
    const shown = getShownIds()
    ids.forEach((id) => shown.add(id))
    sessionStorage.setItem(SHOWN_KEY, JSON.stringify([...shown]))
  }

  const fetchAlerts = async () => {
    if (!process.client) return

    try {
      const boutiqueRaw = localStorage.getItem('boutique')
      if (!boutiqueRaw) return

      const boutique = JSON.parse(boutiqueRaw)
      if (!boutique?.id) return

      const data = await $fetch(getApiUrl(`/api/stocks/?entrepot=${boutique.id}`), {
        headers: getAuthHeaders(),
        cache: 'no-store',
      })

      const stocks = parseApiList<any>(data)
      if (!stocks.length) return

      const shown = getShownIds()
      const newlyShown: string[] = []

      for (const stock of stocks) {
        const qty = Number(stock.quantite ?? 0)
        const produitId = stock.produit
        const nom = stock.produit_nom || stock.produit?.nom || `Produit #${produitId}`
        const ruptureKey = `rupture:${produitId}`
        const lowKey = `low:${produitId}`

        if (qty === 0 && !shown.has(ruptureKey)) {
          warning(`Rupture de stock : ${nom}`)
          newlyShown.push(ruptureKey)
        } else if (qty > 0 && qty < 10 && !shown.has(lowKey)) {
          warning(`Stock faible (${qty} unités) : ${nom}`)
          newlyShown.push(lowKey)
        }
      }

      markShown(newlyShown)
    } catch {
      // Ne pas polluer la console si les stocks sont indisponibles
    }
  }

  const start = () => {
    if (!process.client || isRunning.value) return
    isRunning.value = true
    fetchAlerts()
    timer = setInterval(fetchAlerts, POLL_INTERVAL_MS)
  }

  const stop = () => {
    isRunning.value = false
    if (timer !== null) {
      clearInterval(timer)
      timer = null
    }
  }

  onMounted(start)
  onUnmounted(stop)

  return {
    isRunning,
    start,
    stop,
  }
}
