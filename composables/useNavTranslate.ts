import { useLocale } from '~/composables/useLocale'

// Mapping nom affiché → clé de traduction
const navNameMap: Record<string, string> = {
  'Stock des Produits': 'nav.stockProducts',
  'Mouvements de Stock': 'nav.stockMovements',
  'Inventaires': 'nav.inventories',
  'Transferts': 'nav.transfers',
  'Facturation': 'nav.invoicing',
  'Listes des factures': 'nav.invoiceList',
  'Commandes partenaires': 'nav.partnerOrders',
  'Partenaires': 'nav.partners',
  'Analytiques': 'nav.analytics',
  'Journal': 'nav.journal',
  'Abonnement': 'nav.subscription',
  'Dashboard': 'nav.dashboard',
  'Produits': 'nav.products',
  'Entrepôts': 'nav.warehouses',
  'Utilisateurs': 'nav.users',
  'Tarification': 'nav.pricing',
  'Exercice Fiscal': 'nav.fiscalYear',
  'Logout': 'nav.logout',
}

const navLabelMap: Record<string, string> = {
  'Stock': 'nav.stock',
  'Catalogue': 'nav.catalogue',
  'Ventes': 'nav.sales',
  'Ventes & Facturation': 'nav.billing',
  'Rapports': 'nav.reports',
  'Rapports & Analyses': 'nav.reportsAnalysis',
  'Système': 'nav.system',
}

export function useNavTranslate() {
  const { t } = useLocale()

  function tNav(name: string): string {
    const key = navNameMap[name]
    return key ? t(key) : name
  }

  function tNavLabel(label: string): string {
    if (!label) return ''
    const key = navLabelMap[label]
    return key ? t(key) : label
  }

  return { tNav, tNavLabel }
}
