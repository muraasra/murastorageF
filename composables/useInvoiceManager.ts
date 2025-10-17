// Composable pour la gestion avancée des factures
export const useInvoiceManager = () => {
  // Note: useNotification sera utilisé dans le composant parent

  // Calculer les totaux avec taxes et remises
  const calculateTotals = (items: any[], taxRate: number = 0, discountRate: number = 0, discountAmount: number = 0) => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    
    // Appliquer la remise en pourcentage
    const discountByRate = subtotal * (discountRate / 100)
    
    // Appliquer la remise en montant fixe
    const totalDiscount = discountByRate + discountAmount
    
    // Calculer le montant après remise
    const amountAfterDiscount = Math.max(0, subtotal - totalDiscount)
    
    // Calculer les taxes sur le montant après remise
    const taxAmount = amountAfterDiscount * (taxRate / 100)
    
    // Total final
    const total = amountAfterDiscount + taxAmount

    return {
      subtotal,
      discountByRate,
      discountAmount,
      totalDiscount,
      amountAfterDiscount,
      taxAmount,
      total
    }
  }

  // Valider les données de facture
  const validateInvoice = (invoice: any) => {
    const errors: string[] = []

    if (!invoice.recipientType) {
      errors.push('Type de destinataire requis')
    }

    if (invoice.recipientType === 'client') {
      if (!invoice.client?.nom) errors.push('Nom du client requis')
      if (!invoice.client?.prenom) errors.push('Prénom du client requis')
      if (!invoice.client?.telephone) errors.push('Téléphone du client requis')
    }

    if (invoice.recipientType === 'partenaire') {
      if (!invoice.partenaire) errors.push('Partenaire requis')
    }

    if (!invoice.items || invoice.items.length === 0) {
      errors.push('Au moins un article requis')
    }

    // Valider chaque article
    invoice.items?.forEach((item: any, index: number) => {
      if (!item.price || item.price <= 0) {
        errors.push(`Article ${index + 1}: Prix invalide`)
      }
      if (!item.quantity || item.quantity <= 0) {
        errors.push(`Article ${index + 1}: Quantité invalide`)
      }
    })

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Générer un numéro de facture unique
  const generateInvoiceNumber = (prefix: string = 'FACT') => {
    const date = new Date()
    const year = date.getFullYear().toString().slice(-2)
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const randomPart = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    
    return `${prefix}-${year}${month}${day}-${randomPart}`
  }

  // Formater les montants
  const formatCurrency = (amount: number, currency: string = 'XAF') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount).replace(/\s/g, ' ')
  }

  // Calculer la marge bénéficiaire
  const calculateMargin = (sellingPrice: number, costPrice: number) => {
    if (!costPrice || costPrice === 0) return 0
    return ((sellingPrice - costPrice) / costPrice) * 100
  }

  // Valider le prix de vente
  const validateSellingPrice = (sellingPrice: number, costPrice: number, minMargin: number = 10) => {
    const margin = calculateMargin(sellingPrice, costPrice)
    return {
      isValid: margin >= minMargin,
      margin,
      minPrice: costPrice * (1 + minMargin / 100)
    }
  }

  return {
    calculateTotals,
    validateInvoice,
    generateInvoiceNumber,
    formatCurrency,
    calculateMargin,
    validateSellingPrice
  }
}
