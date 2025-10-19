// Configuration de l'API
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-api-domain.com' 
  : 'http://127.0.0.1:8000'

// Configuration des routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/connexion',
  REGISTER: '/home/inscription',
  SUPERADMIN_DASHBOARD: '/superadmin/dashboard',
  USER_DASHBOARD: '/user',
  ADMIN_DASHBOARD: '/admin'
} as const

// Configuration des rôles
export const ROLES = {
  SUPERADMIN: 'superadmin',
  ADMIN: 'admin',
  USER: 'user'
} as const

// Configuration des permissions
export const PERMISSIONS = {
  MANAGE_USERS: 'manage_users',
  MANAGE_PRODUCTS: 'manage_products',
  MANAGE_WAREHOUSES: 'manage_warehouses',
  VIEW_REPORTS: 'view_reports',
  MANAGE_SETTINGS: 'manage_settings'
} as const

// Configuration des notifications
export const NOTIFICATION_DURATION = 5000 // 5 secondes

// Configuration des timeouts
export const API_TIMEOUT = 30000 // 30 secondes
export const REQUEST_TIMEOUT = 10000 // 10 secondes