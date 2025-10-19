export const useAnalytics = () => {
  // Éviter les appels API côté serveur
  if (process.server) {
    return {
      trackEvent: () => {},
      trackPageView: () => {},
      trackConversion: () => {},
      trackEcommerce: () => {}
    }
  }

  // Fonction de base pour tracker les événements
  const trackEvent = (eventName: string, parameters: Record<string, any> = {}) => {
    if (process.client) {
      // Google Analytics 4
      if (typeof gtag !== 'undefined') {
        gtag('event', eventName, parameters)
      }
      
      // Console log pour debug
      console.log(`Analytics Event: ${eventName}`, parameters)
    }
  }

  // Tracking des pages
  const trackPageView = (pagePath: string, pageTitle: string) => {
    if (process.client) {
      if (typeof gtag !== 'undefined') {
        gtag('config', 'GA_MEASUREMENT_ID', {
          page_path: pagePath,
          page_title: pageTitle
        })
      }
    }
  }

  // Tracking des conversions
  const trackConversion = (conversionName: string, value?: number, currency?: string) => {
    trackEvent('conversion', {
      conversion_name: conversionName,
      value: value,
      currency: currency || 'XOF'
    })
  }

  // Tracking e-commerce
  const trackEcommerce = (transactionId: string, value: number, currency: string, items: any[] = []) => {
    trackEvent('purchase', {
      transaction_id: transactionId,
      value: value,
      currency: currency,
      items: items
    })
  }

  // Initialisation Google Analytics
  const initGoogleAnalytics = (gaId: string) => {
    if (process.client && gaId && gaId !== 'G-XXXXXXXXXX') {
      // Script Google Analytics
      const script = document.createElement('script')
      script.async = true
      script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`
      document.head.appendChild(script)

      // Configuration gtag
      window.dataLayer = window.dataLayer || []
      function gtag(...args: any[]) {
        window.dataLayer.push(args)
      }
      window.gtag = gtag
      gtag('js', new Date())
      gtag('config', gaId)
    }
  }

  // Initialisation Google Search Console
  const initGoogleSearchConsole = (gscId: string) => {
    if (process.client && gscId) {
      const meta = document.createElement('meta')
      meta.name = 'google-site-verification'
      meta.content = gscId
      document.head.appendChild(meta)
    }
  }

  return {
    trackEvent,
    trackPageView,
    trackConversion,
    trackEcommerce,
    initGoogleAnalytics,
    initGoogleSearchConsole
  }
}