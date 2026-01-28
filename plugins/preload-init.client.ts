// Plugin pour initialiser le préchargement après le first paint (ne pas bloquer le chargement)
export default defineNuxtPlugin(() => {
  if (!process.client) return
  const token = localStorage.getItem('access_token')
  const user = localStorage.getItem('user')
  if (!token || !user) return
  try {
    const userData = JSON.parse(user)
    if (userData.role !== 'superadmin') return
    const { preloadAllData } = useSuperAdminPreloader()
    const run = () => preloadAllData().catch(() => {})
    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(run, { timeout: 4000 })
    } else {
      setTimeout(run, 2500)
    }
  } catch {
    // ignorer
  }
})











