export default defineNuxtPlugin(() => {
  // Plugin pour corriger les problèmes d'injection Vue
  if (process.client) {
    // Enregistrer le service worker pour le cache d'assets
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {/* silencieux */})
      })
    }
    // S'assurer que les composables Nuxt sont disponibles
    const originalConsoleWarn = console.warn
    console.warn = (...args) => {
      // Filtrer les avertissements spécifiques
      if (args[0] && typeof args[0] === 'string') {
        const message = args[0]
        if (message.includes('injection "Symbol(route location)" not found') ||
            message.includes('Focusable elements inside the <FocusTrap />') ||
            message.includes('emitsOptions')) {
          return // Ignorer ces avertissements spécifiques
        }
      }
      originalConsoleWarn.apply(console, args)
    }
  }
})
















