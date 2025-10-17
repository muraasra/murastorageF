// Configuration Google Analytics et Search Console
export const useAnalytics = () => {
  // Google Analytics 4
  const initGA = (measurementId: string) => {
    if (!process.client) return

    // Charger Google Analytics
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
    document.head.appendChild(script)

    // Initialiser gtag
    window.dataLayer = window.dataLayer || []
    function gtag(...args: any[]) {
      window.dataLayer.push(args)
    }
    gtag('js', new Date())
    gtag('config', measurementId, {
      page_title: document.title,
      page_location: window.location.href
    })

    // Exposer gtag globalement
    window.gtag = gtag
  }

  // Événements personnalisés
  const trackEvent = (eventName: string, parameters: Record<string, any> = {}) => {
    if (process.client && window.gtag) {
      window.gtag('event', eventName, parameters)
    }
  }

  // Suivi des conversions
  const trackConversion = (conversionId: string, value?: number, currency = 'EUR') => {
    if (process.client && window.gtag) {
      window.gtag('event', 'conversion', {
        send_to: conversionId,
        value: value,
        currency: currency
      })
    }
  }

  // Suivi des pages
  const trackPageView = (pagePath: string, pageTitle: string) => {
    if (process.client && window.gtag) {
      window.gtag('config', 'GA_MEASUREMENT_ID', {
        page_path: pagePath,
        page_title: pageTitle
      })
    }
  }

  return {
    initGA,
    trackEvent,
    trackConversion,
    trackPageView
  }
}

// Déclaration globale pour TypeScript
declare global {
  interface Window {
    dataLayer: any[]
    gtag: (...args: any[]) => void
  }
}
