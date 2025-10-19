// Configuration de l'API
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://murastorage.pythonanywhere.com' 
  : 'https://murastorage.pythonanywhere.com'

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

// Données de test pour les produits
export const PRODUCTS_DATA = [
  {
    id: 1,
    name: 'Produit Test 1',
    price: 1000,
    stock: 50,
    category: 'Électronique'
  },
  {
    id: 2,
    name: 'Produit Test 2',
    price: 2500,
    stock: 25,
    category: 'Informatique'
  }
] as const

// Éléments de navigation pour admin
export const NAVIGATION_ITEMS_ADMIN = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: 'dashboard'
  },
  {
    name: 'Produits',
    href: '/produits',
    icon: 'products'
  },
  {
    name: 'Stock',
    href: '/stock_produit',
    icon: 'stock'
  },
  {
    name: 'Factures',
    href: '/facturation',
    icon: 'invoices'
  },
  {
    name: 'Utilisateurs',
    href: '/utilisateurs',
    icon: 'users'
  }
] as const

// Éléments de navigation pour superadmin
export const NAVIGATION_ITEMS_SUPERADMIN = [
  {
    name: 'Dashboard',
    href: '/superadmin/dashboard',
    icon: 'dashboard'
  },
  {
    name: 'Entreprises',
    href: '/superadmin/entrepots',
    icon: 'companies'
  },
  {
    name: 'Produits',
    href: '/superadmin/produits',
    icon: 'products'
  },
  {
    name: 'Factures',
    href: '/superadmin/factures',
    icon: 'invoices'
  },
  {
    name: 'Utilisateurs',
    href: '/superadmin/utilisateurs',
    icon: 'users'
  },
  {
    name: 'Tarification',
    href: '/superadmin/tarification',
    icon: 'pricing'
  }
] as const

// Éléments de navigation génériques
export const NAVIGATION_ITEMS = [
  {
    name: 'Accueil',
    href: '/',
    icon: 'home'
  },
  {
    name: 'Produits',
    href: '/produits',
    icon: 'products'
  },
  {
    name: 'Stock',
    href: '/stock_produit',
    icon: 'stock'
  },
  {
    name: 'Factures',
    href: '/facturation',
    icon: 'invoices'
  }
] as const