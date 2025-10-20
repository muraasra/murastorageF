import type { Produit } from "@/types"

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

export const NAVIGATION_ITEMS = [
  [
    {
      name: "Stock des Produits",
      link: "/stock_produit",
      icon: "i-heroicons-square-2-stack",
    },
    {
      name: "Mouvements de Stock",
      link: "/mouvements-stock",
      icon: "i-heroicons-chart-bar",
    },
  ],
  [
    {
      name: "Facturation",
      link: "/facturation",
      icon: "i-heroicons-document-currency-dollar",
    },
    {
      name: "Liste des factures",
      link: "/listes-factures",
      icon: "i-heroicons-clipboard-document-list",
    },
  ],
  [
    {
      name: "Transfert",
      link: "/transfert",
      icon: "i-heroicons-arrows-right-left",
    },
  ],
  [
    {
      name: "Logout",
      link: "",
      icon: "i-heroicons-power",
    },
  ],
  // [
  //   {
  //     name: "Guide",
  //     link: "/guide",
  //     icon: "i-heroicons-book-open",
  //   },
  // ],
];

export const NAVIGATION_ITEMS_ADMIN = [
  [
    {
      name: "Dashboard",
      link: "/",
      icon: "i-heroicons-rectangle-group",
    },
    {
      name: "Produits",
      link: "/produits",
      icon: "i-heroicons-squares-plus",
    },

    {
      name: "Stock des Produits",
      link: "/stock_produit",
      icon: "i-heroicons-square-2-stack",
    },
    {
      name: "Mouvements de Stock",
      link: "/mouvements-stock",
      icon: "i-heroicons-chart-bar",
    },
  ],
    [ 
    {
      name: "Partenaires",
      link: "/partenaires",
      icon: "i-heroicons-user-group",
    },
  ],
  [ 
    {
      name: "Facturation",
      link: "/facturation",
      icon: "i-heroicons-document-currency-dollar",
    },    
    {
      name: "Liste des factures",
      link: "/listes-factures",
      icon: "i-heroicons-clipboard-document-list",
    },
  ],
  [
    {
      name: "Transfert",
      link: "/transfert",
      icon: "i-heroicons-arrows-right-left",
    },
  ],
  // [
  //   {
  //     name: "Guide",
  //     link: "/guide",
  //     icon: "i-heroicons-book-open",
  //   },
  // ],
  [
    {
      name: "Logout",
      link: "",
      icon: "i-heroicons-power",
    },
  ],
];

export const NAVIGATION_ITEMS_SUPERADMIN = [
  [
    {
      name: "Dashboard",
      link: "/",
      icon: "i-heroicons-rectangle-group",
    },
    {
      name: "Produits",
      link: "/produits",
      icon: "i-heroicons-squares-plus",
    },
    {
      name: "Stock des Produits",
      link: "/stock_produit",
      icon: "i-heroicons-square-2-stack",
    },
    {
      name: "Mouvements de Stock",
      link: "/mouvements-stock",
      icon: "i-heroicons-chart-bar",
    },
  ],
  [
    {
      name: "Utilisateurs",
      link: "/utilisateurs",
      icon: "i-heroicons-user",
    },
    {
      name: "Journal",
      link: "/journal",
      icon: "i-heroicons-clipboard-document-list",
    },
  ],
  [ 
    {
      name: "Partenaires",
      link: "/partenaires",
      icon: "i-heroicons-user-group",
    },
  ],
  [ 
    {
      name: "Facturation",
      link: "/facturation",
      icon: "i-heroicons-document-currency-dollar",
    },    
    {
      name: "Liste des factures",
      link: "/listes-factures",
      icon: "i-heroicons-clipboard-document-list",
    },
  ],
  [
    {
      name: "Transfert",
      link: "/transfert",
      icon: "i-heroicons-arrows-right-left",
    },
  ],
  // [
  //   {
  //     name: "Guide",
  //     link: "/guide",
  //     icon: "i-heroicons-book-open",
  //   },
  // ],
  [
    {
      name: "Logout",
      link: "",
      icon: "i-heroicons-power",
    },
  ],
];

export const PRODUCTS_DATA: Produit[] = [
  
];

