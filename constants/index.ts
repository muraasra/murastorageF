import type { Produit } from "@/types"

// Marque Mura Storage
export const BRAND_LOGO_PATH = '/img/logo-mura-storage.png'
export const SUPPORT_EMAIL = 'support@murastorage.com'
export const SITE_URL = 'https://murastorage.netlify.app'

// Configuration de l'API
export const API_BASE_URL = import.meta.env.PROD
  ? 'https://murastorage.pythonanywhere.com'
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

export const ROLES = {
  SUPERADMIN: 'superadmin',
  ADMIN: 'admin',
  USER: 'user'
} as const

export const PERMISSIONS = {
  MANAGE_USERS: 'manage_users',
  MANAGE_PRODUCTS: 'manage_products',
  MANAGE_WAREHOUSES: 'manage_warehouses',
  VIEW_REPORTS: 'view_reports',
  MANAGE_SETTINGS: 'manage_settings'
} as const

export const NOTIFICATION_DURATION = 5000
export const API_TIMEOUT = 30000
export const REQUEST_TIMEOUT = 10000

// ─── Types ────────────────────────────────────────────────────────────────────
export interface NavItem {
  name: string
  link: string
  icon: string
}

export interface NavGroup {
  label: string    // "" = pas de titre de groupe
  items: NavItem[]
}

// ─── Navigation Utilisateur (user) ────────────────────────────────────────────
export const NAVIGATION_ITEMS: NavGroup[] = [
  {
    label: 'Stock',
    items: [
      { name: 'Stock des Produits',      link: '/stock_produit',    icon: 'i-heroicons-square-2-stack' },
      { name: 'Mouvements de Stock',     link: '/mouvements-stock', icon: 'i-heroicons-arrows-up-down' },
      { name: 'Inventaires',             link: '/inventaire',       icon: 'i-heroicons-clipboard-document-check' },
      { name: 'Transferts',              link: '/transfert',        icon: 'i-heroicons-arrows-right-left' },
    ],
  },
  {
    label: 'Ventes',
    items: [
      { name: 'Facturation',         link: '/facturation',       icon: 'i-heroicons-document-currency-dollar' },
      { name: 'Listes des factures', link: '/listes-factures',   icon: 'i-heroicons-clipboard-document-list' },
      { name: 'Partenaires',         link: '/partenaires',       icon: 'i-heroicons-user-group' },
    ],
  },
  {
    label: 'Rapports',
    items: [
      { name: 'Analytiques', link: '/analytics', icon: 'i-heroicons-presentation-chart-line' },
    ],
  },
  {
    label: '',
    items: [
      { name: 'Logout', link: '', icon: 'i-heroicons-power' },
    ],
  },
]

// ─── Navigation Administrateur ────────────────────────────────────────────────
export const NAVIGATION_ITEMS_ADMIN: NavGroup[] = [
  {
    label: '',
    items: [
      { name: 'Dashboard', link: '/admin', icon: 'i-heroicons-rectangle-group' },
    ],
  },
  {
    label: 'Catalogue',
    items: [
      { name: 'Produits', link: '/produits', icon: 'i-heroicons-squares-plus' },
    ],
  },
  {
    label: 'Stock',
    items: [
      { name: 'Stock des Produits',  link: '/stock_produit',    icon: 'i-heroicons-square-2-stack' },
      { name: 'Mouvements de Stock', link: '/mouvements-stock', icon: 'i-heroicons-arrows-up-down' },
      { name: 'Inventaires',         link: '/inventaire',       icon: 'i-heroicons-clipboard-document-check' },
      { name: 'Transferts',          link: '/transfert',        icon: 'i-heroicons-arrows-right-left' },
    ],
  },
  {
    label: 'Ventes & Facturation',
    items: [
      { name: 'Facturation',            link: '/facturation',           icon: 'i-heroicons-document-currency-dollar' },
      { name: 'Listes des factures',    link: '/listes-factures',       icon: 'i-heroicons-clipboard-document-list' },
      { name: 'Commandes partenaires',  link: '/commandes_partenaires', icon: 'i-heroicons-truck' },
      { name: 'Partenaires',            link: '/partenaires',           icon: 'i-heroicons-user-group' },
    ],
  },
  {
    label: 'Rapports & Analyses',
    items: [
      { name: 'Analytiques',    link: '/analytics',      icon: 'i-heroicons-presentation-chart-line' },
      { name: 'Journal',        link: '/journal',         icon: 'i-heroicons-book-open' },
    ],
  },
  {
    label: 'Système',
    items: [
      { name: 'Abonnement', link: '/abonnement', icon: 'i-heroicons-credit-card' },
    ],
  },
  {
    label: '',
    items: [
      { name: 'Logout', link: '', icon: 'i-heroicons-power' },
    ],
  },
]

// ─── Navigation SuperAdmin ────────────────────────────────────────────────────
export const NAVIGATION_ITEMS_SUPERADMIN: NavGroup[] = [
  {
    label: '',
    items: [
      { name: 'Dashboard',       link: '/superadmin/dashboard',    icon: 'i-heroicons-rectangle-group' },
      { name: 'Entrepôts',       link: '/superadmin/entrepots',    icon: 'i-heroicons-building-storefront' },
      { name: 'Utilisateurs',    link: '/superadmin/utilisateurs', icon: 'i-heroicons-users' },
      { name: 'Tarification',    link: '/superadmin/tarification', icon: 'i-heroicons-credit-card' },
      { name: 'Exercice Fiscal', link: '/exercice-fiscal',         icon: 'i-heroicons-calendar-days' },
      { name: 'Journal',         link: '/superadmin/journal',      icon: 'i-heroicons-book-open' },
    ],
  },
  {
    label: '',
    items: [
      { name: 'Logout', link: '', icon: 'i-heroicons-power' },
    ],
  },
]

export const PRODUCTS_DATA: Produit[] = []
