export default defineNuxtPlugin(() => {
  // Ne pas bloquer le first paint : différer la vérification du token après le rendu
  if (!process.client) return

  const runTokenCheck = () => {
    const token = localStorage.getItem('access_token')
    const user = localStorage.getItem('user')
    if (!token || !user) return

    import('@/stores/useTokenCheck').then(({ useTokenCheck }) => {
      useTokenCheck().then((isValid) => {
        if (!isValid) {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          localStorage.removeItem('user')
          localStorage.removeItem('entreprise')
          localStorage.removeItem('boutique')
          localStorage.removeItem('permissions')
        }
      }).catch(() => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
        localStorage.removeItem('entreprise')
        localStorage.removeItem('boutique')
        localStorage.removeItem('permissions')
      })
    }).catch(() => {})
  }

  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(runTokenCheck, { timeout: 3000 })
  } else {
    setTimeout(runTokenCheck, 1500)
  }
})
