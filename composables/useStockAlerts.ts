import { ref, onMounted, onUnmounted } from 'vue'
import { useApi } from '@/stores/useApi'
import { useNotification } from '@/types/useNotification'

const POLL_INTERVAL_MS = 30000

export const useStockAlerts = () => {
  const isRunning = ref(false)
  let timer: number | null = null

  const { success, warning, error, info } = useNotification()

  const handleAlert = (alert: any) => {
    const message = alert.message || alert.title || 'Nouvelle alerte'
    switch (alert.level) {
      case 'success':
        success(message)
        break
      case 'warning':
        warning(message)
        break
      case 'error':
        error(message)
        break
      default:
        info(message)
    }
  }

  const fetchAlerts = async () => {
    if (!process.client) return

    try {
      const { data, error: apiError } = await useApi('/stock-alerts/?unread=1')
      if (apiError.value || !data.value) return

      const alerts = data.value as any[]
      if (!alerts.length) return

      // Afficher chaque alerte comme notification
      alerts.forEach(handleAlert)

      // Marquer les alertes comme lues pour éviter les doublons
      const ids = alerts.map((a) => a.id)
      if (ids.length) {
        await useApi('/stock-alerts/mark_read/', {
          method: 'POST',
          body: { ids },
        })
      }
    } catch (e) {
      // Ne pas casser l'interface si l'API des alertes échoue
      console.warn('[useStockAlerts] Erreur récupération alertes:', e)
    }
  }

  const start = () => {
    if (!process.client || isRunning.value) return
    isRunning.value = true
    // Premier check rapide
    fetchAlerts()
    // Puis polling périodique
    timer = window.setInterval(fetchAlerts, POLL_INTERVAL_MS)
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

