import { MURA_STORAGE_EVENTS, DEFAULT_EVENT_PARAMS } from '~/constants/muraEvents'

export const useMuraTracking = () => {
  const { trackEvent } = useAnalytics()

  // Tracking des pages spécifiques
  const trackHomePage = () => {
    trackEvent(MURA_STORAGE_EVENTS.HOME_PAGE_VIEW, {
      ...DEFAULT_EVENT_PARAMS,
      page_path: '/',
      page_title: 'Accueil - Mura Storage'
    })
  }

  const trackLoginPage = () => {
    trackEvent(MURA_STORAGE_EVENTS.LOGIN_PAGE_VIEW, {
      ...DEFAULT_EVENT_PARAMS,
      page_path: '/connexion',
      page_title: 'Connexion - Mura Storage'
    })
  }

  const trackDashboard = (userRole: string) => {
    trackEvent(MURA_STORAGE_EVENTS.DASHBOARD_VIEW, {
      ...DEFAULT_EVENT_PARAMS,
      user_role: userRole,
      page_path: '/dashboard',
      page_title: 'Tableau de bord - Mura Storage'
    })
  }

  // Tracking des événements d'authentification
  const trackLoginSuccess = (userRole: string, loginType: string) => {
    trackEvent(MURA_STORAGE_EVENTS.LOGIN_SUCCESS, {
      ...DEFAULT_EVENT_PARAMS,
      user_role: userRole,
      login_type: loginType,
      timestamp: new Date().toISOString()
    })
  }

  const trackLoginError = (errorType: string, errorMessage: string) => {
    trackEvent(MURA_STORAGE_EVENTS.LOGIN_ERROR, {
      ...DEFAULT_EVENT_PARAMS,
      error_type: errorType,
      error_message: errorMessage,
      timestamp: new Date().toISOString()
    })
  }

  const trackLogout = (userRole: string) => {
    trackEvent(MURA_STORAGE_EVENTS.LOGOUT, {
      ...DEFAULT_EVENT_PARAMS,
      user_role: userRole,
      timestamp: new Date().toISOString()
    })
  }

  // Tracking des événements de stock
  const trackProductView = (productId: string, productName: string, category: string) => {
    trackEvent(MURA_STORAGE_EVENTS.PRODUCT_VIEW, {
      ...DEFAULT_EVENT_PARAMS,
      product_id: productId,
      product_name: productName,
      product_category: category,
      timestamp: new Date().toISOString()
    })
  }

  const trackStockUpdate = (productId: string, oldQuantity: number, newQuantity: number, action: string) => {
    trackEvent(MURA_STORAGE_EVENTS.STOCK_UPDATE, {
      ...DEFAULT_EVENT_PARAMS,
      product_id: productId,
      old_quantity: oldQuantity,
      new_quantity: newQuantity,
      action: action, // 'add', 'remove', 'adjust'
      quantity_change: newQuantity - oldQuantity,
      timestamp: new Date().toISOString()
    })
  }

  const trackStockTransfer = (fromLocation: string, toLocation: string, productId: string, quantity: number) => {
    trackEvent(MURA_STORAGE_EVENTS.STOCK_TRANSFER, {
      ...DEFAULT_EVENT_PARAMS,
      from_location: fromLocation,
      to_location: toLocation,
      product_id: productId,
      quantity: quantity,
      timestamp: new Date().toISOString()
    })
  }

  // Tracking des événements de facturation
  const trackInvoiceCreate = (invoiceId: string, amount: number, currency: string) => {
    trackEvent(MURA_STORAGE_EVENTS.INVOICE_CREATE, {
      ...DEFAULT_EVENT_PARAMS,
      invoice_id: invoiceId,
      amount: amount,
      currency: currency,
      timestamp: new Date().toISOString()
    })
  }

  const trackPaymentSuccess = (invoiceId: string, amount: number, paymentMethod: string) => {
    trackEvent(MURA_STORAGE_EVENTS.PAYMENT_SUCCESS, {
      ...DEFAULT_EVENT_PARAMS,
      invoice_id: invoiceId,
      amount: amount,
      payment_method: paymentMethod,
      timestamp: new Date().toISOString()
    })
  }

  // Tracking des événements d'abonnement
  const trackSubscriptionStart = (planName: string, price: number, currency: string) => {
    trackEvent(MURA_STORAGE_EVENTS.SUBSCRIPTION_START, {
      ...DEFAULT_EVENT_PARAMS,
      plan_name: planName,
      price: price,
      currency: currency,
      timestamp: new Date().toISOString()
    })
  }

  const trackSubscriptionUpgrade = (fromPlan: string, toPlan: string, priceDifference: number) => {
    trackEvent(MURA_STORAGE_EVENTS.SUBSCRIPTION_UPGRADE, {
      ...DEFAULT_EVENT_PARAMS,
      from_plan: fromPlan,
      to_plan: toPlan,
      price_difference: priceDifference,
      timestamp: new Date().toISOString()
    })
  }

  // Tracking des performances
  const trackPageLoadTime = (pageName: string, loadTime: number) => {
    trackEvent(MURA_STORAGE_EVENTS.PAGE_LOAD_TIME, {
      ...DEFAULT_EVENT_PARAMS,
      page_name: pageName,
      load_time_ms: loadTime,
      timestamp: new Date().toISOString()
    })
  }

  const trackApiResponseTime = (endpoint: string, responseTime: number, statusCode: number) => {
    trackEvent(MURA_STORAGE_EVENTS.API_RESPONSE_TIME, {
      ...DEFAULT_EVENT_PARAMS,
      endpoint: endpoint,
      response_time_ms: responseTime,
      status_code: statusCode,
      timestamp: new Date().toISOString()
    })
  }

  const trackError = (errorType: string, errorMessage: string, page: string, additionalData?: any) => {
    trackEvent(MURA_STORAGE_EVENTS.ERROR_OCCURRED, {
      ...DEFAULT_EVENT_PARAMS,
      error_type: errorType,
      error_message: errorMessage,
      page: page,
      ...additionalData,
      timestamp: new Date().toISOString()
    })
  }

  return {
    // Pages
    trackHomePage,
    trackLoginPage,
    trackDashboard,
    
    // Authentification
    trackLoginSuccess,
    trackLoginError,
    trackLogout,
    
    // Stock
    trackProductView,
    trackStockUpdate,
    trackStockTransfer,
    
    // Facturation
    trackInvoiceCreate,
    trackPaymentSuccess,
    
    // Abonnement
    trackSubscriptionStart,
    trackSubscriptionUpgrade,
    
    // Performance
    trackPageLoadTime,
    trackApiResponseTime,
    trackError
  }
}



