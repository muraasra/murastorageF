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

  return {
    trackEvent,
    trackPageView,
    trackConversion,
    trackEcommerce
  }
}