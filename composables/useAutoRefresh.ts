import { ref, onMounted, onUnmounted } from 'vue'

/**
 * Composable de rafraîchissement automatique avec indicateur visuel.
 * Usage : const { lastUpdated, isRefreshing, startRefresh } = useAutoRefresh(fetchFn, 60)
 */
export const useAutoRefresh = (
  fetchFn: () => Promise<void>,
  intervalSeconds = 60
) => {
  const lastUpdated = ref<Date | null>(null)
  const isRefreshing = ref(false)
  let timer: ReturnType<typeof setInterval> | null = null

  const run = async () => {
    if (isRefreshing.value) return
    isRefreshing.value = true
    try {
      await fetchFn()
      lastUpdated.value = new Date()
    } catch (e) {
      console.warn('[useAutoRefresh] Erreur:', e)
    } finally {
      isRefreshing.value = false
    }
  }

  const startRefresh = () => {
    run()
    timer = setInterval(run, intervalSeconds * 1000)
  }

  const stopRefresh = () => {
    if (timer) { clearInterval(timer); timer = null }
  }

  const manualRefresh = () => run()

  const lastUpdatedLabel = computed(() => {
    if (!lastUpdated.value) return ''
    const now = new Date()
    const diff = Math.floor((now.getTime() - lastUpdated.value.getTime()) / 1000)
    if (diff < 5) return 'À l\'instant'
    if (diff < 60) return `Il y a ${diff}s`
    const min = Math.floor(diff / 60)
    return `Il y a ${min}min`
  })

  onMounted(startRefresh)
  onUnmounted(stopRefresh)

  return { lastUpdated, lastUpdatedLabel, isRefreshing, manualRefresh, stopRefresh }
}
