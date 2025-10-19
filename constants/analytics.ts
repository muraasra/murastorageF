// Événements de tracking pour l'analytics
export const ANALYTICS_EVENTS = {
  // Pages et navigation
  PAGE_VIEW: 'page_view',
  
  // Authentification
  SIGNUP: 'sign_up',
  LOGIN: 'login',
  LOGOUT: 'logout',
  
  // Interactions
  BUTTON_CLICK: 'button_click',
  FORM_SUBMIT: 'form_submit',
  
  // E-commerce
  ADD_TO_CART: 'add_to_cart',
  REMOVE_FROM_CART: 'remove_from_cart',
  VIEW_ITEM: 'view_item',
  PURCHASE: 'purchase',
  
  // Abonnements
  SUBSCRIPTION: 'subscription',
  
  // Recherche
  SEARCH: 'search',
  
  // Téléchargements
  DOWNLOAD: 'file_download',
  
  // Partage social
  SOCIAL_SHARE: 'social_share',
  
  // Vidéo
  VIDEO_PLAY: 'video_play',
  VIDEO_COMPLETE: 'video_complete',
  
  // Erreurs
  ERROR: 'error',
  
  // Performance
  PERFORMANCE: 'performance'
} as const

// Configuration des événements personnalisés
export const CUSTOM_EVENTS = {
  PRODUCT_SCAN: 'product_scan',
  STOCK_UPDATE: 'stock_update',
  WAREHOUSE_TRANSFER: 'warehouse_transfer',
  INVOICE_CREATE: 'invoice_create',
  USER_MANAGEMENT: 'user_management'
} as const

// Configuration des services d'analytics
export const ANALYTICS_CONFIG = {
  GA_ID: 'G-XXXXXXXXXX', // Remplacez par votre ID Google Analytics
  GSC_ID: '9artqrghm4Re-7Mtnpp73H61ynt3zNIncWDWGh96fuA' // ID Google Search Console
} as const