// Middleware temporairement désactivé pour debug
export default defineNuxtRouteMiddleware((to) => {
  console.log('[Middleware Role] Route:', to.path)
  return
})
