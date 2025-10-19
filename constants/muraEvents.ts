// Événements spécifiques à Mura Storage
export const MURA_STORAGE_EVENTS = {
  // Événements de navigation
  HOME_PAGE_VIEW: 'home_page_view',
  LOGIN_PAGE_VIEW: 'login_page_view',
  DASHBOARD_VIEW: 'dashboard_view',
  
  // Événements d'authentification
  LOGIN_SUCCESS: 'login_success',
  LOGIN_ERROR: 'login_error',
  LOGOUT: 'logout',
  SIGNUP_SUCCESS: 'signup_success',
  
  // Événements de gestion de stock
  PRODUCT_VIEW: 'product_view',
  PRODUCT_ADD: 'product_add',
  PRODUCT_EDIT: 'product_edit',
  PRODUCT_DELETE: 'product_delete',
  STOCK_UPDATE: 'stock_update',
  STOCK_TRANSFER: 'stock_transfer',
  
  // Événements de facturation
  INVOICE_CREATE: 'invoice_create',
  INVOICE_VIEW: 'invoice_view',
  PAYMENT_SUCCESS: 'payment_success',
  
  // Événements d'abonnement
  SUBSCRIPTION_START: 'subscription_start',
  SUBSCRIPTION_UPGRADE: 'subscription_upgrade',
  SUBSCRIPTION_DOWNGRADE: 'subscription_downgrade',
  SUBSCRIPTION_CANCEL: 'subscription_cancel',
  
  // Événements de performance
  PAGE_LOAD_TIME: 'page_load_time',
  API_RESPONSE_TIME: 'api_response_time',
  ERROR_OCCURRED: 'error_occurred'
}

// Paramètres par défaut pour les événements
export const DEFAULT_EVENT_PARAMS = {
  app_name: 'Mura Storage',
  app_version: '1.0.0',
  environment: process.env.NODE_ENV || 'development'
}




