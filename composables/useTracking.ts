import { ANALYTICS_EVENTS } from '~/constants/analytics'

export const useTracking = () => {
  // Éviter les appels API côté serveur
  if (process.server) {
    return {
      trackPage: () => {},
      trackSignup: () => {},
      trackLogin: () => {},
      trackSubscription: () => {},
      trackButtonClick: () => {},
      trackError: () => {},
      trackPurchase: () => {},
      trackSearch: () => {},
      trackFormSubmit: () => {},
      trackDownload: () => {},
      trackSocialShare: () => {},
      trackVideoPlay: () => {},
      trackVideoComplete: () => {},
      trackCustomEvent: () => {}
    }
  }

  const { trackEvent, trackPageView, trackConversion, trackEcommerce } = useAnalytics()

  // Tracking des pages
  const trackPage = (pageName: string, pagePath: string) => {
    trackPageView(pagePath, pageName)
    trackEvent(ANALYTICS_EVENTS.PAGE_VIEW, {
      page_title: pageName,
      page_location: pagePath
    })
  }

  // Tracking des conversions
  const trackSignup = (method: string = 'email') => {
    trackEvent(ANALYTICS_EVENTS.SIGNUP, {
      method: method
    })
  }

  const trackLogin = (method: string = 'email') => {
    trackEvent(ANALYTICS_EVENTS.LOGIN, {
      method: method
    })
  }

  const trackSubscription = (planName: string, value: number, currency: string = 'XOF') => {
    trackEvent(ANALYTICS_EVENTS.SUBSCRIPTION, {
      plan_name: planName,
      value: value,
      currency: currency
    })
    
    // Tracking e-commerce
    trackEcommerce(`sub_${Date.now()}`, value, currency, [{
      item_id: planName,
      item_name: planName,
      category: 'subscription',
      quantity: 1,
      price: value
    }])
  }

  // Tracking des interactions
  const trackButtonClick = (buttonName: string, location: string) => {
    trackEvent(ANALYTICS_EVENTS.BUTTON_CLICK, {
      button_name: buttonName,
      location: location
    })
  }

  const trackFormSubmit = (formName: string, success: boolean) => {
    trackEvent(ANALYTICS_EVENTS.FORM_SUBMIT, {
      form_name: formName,
      success: success
    })
  }

  // Tracking des produits
  const trackProductView = (productId: string, productName: string, category: string) => {
    trackEvent('view_item', {
      item_id: productId,
      item_name: productName,
      item_category: category
    })
  }

  const trackAddToCart = (productId: string, productName: string, value: number, currency: string = 'XOF') => {
    trackEvent(ANALYTICS_EVENTS.ADD_TO_CART, {
      item_id: productId,
      item_name: productName,
      value: value,
      currency: currency
    })
  }

  // Tracking des erreurs
  const trackError = (errorType: string, errorMessage: string, page: string) => {
    trackEvent('error', {
      error_type: errorType,
      error_message: errorMessage,
      page: page
    })
  }

  // Tracking des performances
  const trackPerformance = (metricName: string, value: number, unit: string = 'ms') => {
    trackEvent('performance', {
      metric_name: metricName,
      value: value,
      unit: unit
    })
  }

  return {
    trackPage,
    trackSignup,
    trackLogin,
    trackSubscription,
    trackButtonClick,
    trackFormSubmit,
    trackProductView,
    trackAddToCart,
    trackError,
    trackPerformance
  }
}

