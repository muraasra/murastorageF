import { ref } from 'vue'

export interface ImportExportConfig {
  // Colonnes obligatoires
  requiredColumns: string[]
  // Colonnes optionnelles
  optionalColumns: string[]
  // Mapping des colonnes (nom interne -> alias possibles)
  columnMapping: Record<string, string[]>
  // Validation des colonnes
  columnValidation: Record<string, (value: string) => boolean>
}

export const useImportExport = () => {
  // Configuration standard pour l'import/export des produits
  const productConfig: ImportExportConfig = {
    requiredColumns: [
      'nom',
      'prix_achat', 
      'prix_vente',
      'quantite'
    ],
    optionalColumns: [
      'reference',
      'description',
      'categorie',
      'categorie_id',
      'code_barres',
      'unite_mesure',
      'stock_minimum',
      'stock_maximum',
      'fournisseur_principal',
      'fournisseur_nom',
      'marque',
      'modele',
      'etat_produit',
      'devise',
      'sku',
      'actif'
    ],
    columnMapping: {
      'nom': ['nom', 'name', 'produit', 'product', 'libelle'],
      'prix_achat': ['prix_achat', 'achat', 'cost', 'prix_achat_ht', 'prix_achat_ttc'],
      'prix_vente': ['prix_vente', 'vente', 'price', 'prix', 'prix_vente_ht', 'prix_vente_ttc'],
      'quantite': ['quantite', 'stock', 'quantity', 'qte', 'qty'],
      'reference': ['reference', 'ref', 'sku', 'code', 'code_produit'],
      'description': ['description', 'desc', 'details', 'commentaire'],
      'categorie': ['categorie', 'category', 'type', 'famille'],
      'categorie_id': ['categorie_id', 'category_id', 'id_categorie'],
      'code_barres': ['code_barres', 'barcode', 'ean', 'ean13', 'code_barre'],
      'unite_mesure': ['unite_mesure', 'unite', 'unit', 'mesure'],
      'stock_minimum': ['stock_minimum', 'stock_min', 'seuil_min', 'min_stock'],
      'stock_maximum': ['stock_maximum', 'stock_max', 'seuil_max', 'max_stock'],
      'fournisseur_principal': ['fournisseur_principal', 'fournisseur_id', 'supplier_id'],
      'fournisseur_nom': ['fournisseur_nom', 'fournisseur', 'supplier', 'supplier_name'],
      'marque': ['marque', 'brand', 'fabricant'],
      'modele': ['modele', 'model', 'version'],
      'etat_produit': ['etat_produit', 'etat', 'condition', 'state'],
      'devise': ['devise', 'currency', 'monnaie'],
      'sku': ['sku', 'code_sku', 'reference_interne'],
      'actif': ['actif', 'active', 'enabled', 'disponible']
    },
    columnValidation: {
      'nom': (value: string) => value && value.trim().length > 0,
      'prix_achat': (value: string) => !isNaN(parseFloat(value)) && parseFloat(value) > 0,
      'prix_vente': (value: string) => !isNaN(parseFloat(value)) && parseFloat(value) > 0,
      'quantite': (value: string) => !isNaN(parseInt(value)) && parseInt(value) >= 0,
      'reference': (value: string) => true, // Optionnel
      'description': (value: string) => true, // Optionnel
      'categorie': (value: string) => true, // Optionnel
      'categorie_id': (value: string) => !value || !isNaN(parseInt(value)),
      'code_barres': (value: string) => true, // Optionnel
      'unite_mesure': (value: string) => true, // Optionnel
      'stock_minimum': (value: string) => !value || (!isNaN(parseInt(value)) && parseInt(value) >= 0),
      'stock_maximum': (value: string) => !value || (!isNaN(parseInt(value)) && parseInt(value) >= 0),
      'fournisseur_principal': (value: string) => !value || !isNaN(parseInt(value)),
      'fournisseur_nom': (value: string) => true, // Optionnel
      'marque': (value: string) => true, // Optionnel
      'modele': (value: string) => true, // Optionnel
      'etat_produit': (value: string) => true, // Optionnel
      'devise': (value: string) => true, // Optionnel
      'sku': (value: string) => true, // Optionnel
      'actif': (value: string) => !value || ['true', 'false', '1', '0', 'oui', 'non', 'yes', 'no'].includes(value.toLowerCase())
    }
  }

  // Fonction pour créer le mapping des colonnes à partir des en-têtes
  const createColumnMapping = (headers: string[]): Record<string, number> => {
    const mapping: Record<string, number> = {}
    
    headers.forEach((header, index) => {
      const cleanHeader = header.toLowerCase().trim().replace(/"/g, '')
      
      // Chercher dans le mapping des colonnes
      for (const [internalName, aliases] of Object.entries(productConfig.columnMapping)) {
        if (aliases.some(alias => cleanHeader.includes(alias.toLowerCase()))) {
          mapping[internalName] = index
          break
        }
      }
    })
    
    return mapping
  }

  // Fonction pour valider les en-têtes
  const validateHeaders = (headers: string[]): { valid: boolean, missing: string[], mapping: Record<string, number> } => {
    const mapping = createColumnMapping(headers)
    const missing = productConfig.requiredColumns.filter(col => mapping[col] === undefined)
    
    return {
      valid: missing.length === 0,
      missing,
      mapping
    }
  }

  // Fonction pour valider les données d'une ligne
  const validateRowData = (values: string[], mapping: Record<string, number>, rowIndex: number): Array<{field: string, value: string, message: string}> => {
    const errors: Array<{field: string, value: string, message: string}> = []
    
    // Valider chaque colonne requise
    for (const column of productConfig.requiredColumns) {
      const columnIndex = mapping[column]
      if (columnIndex === undefined) continue
      
      const value = values[columnIndex] || ''
      const validator = productConfig.columnValidation[column]
      
      if (!validator(value)) {
        errors.push({
          field: column,
          value,
          message: `Valeur invalide pour ${column}: ${value}`
        })
      }
    }
    
    // Validation croisée : prix de vente > prix d'achat
    const prixAchatIndex = mapping.prix_achat
    const prixVenteIndex = mapping.prix_vente
    
    if (prixAchatIndex !== undefined && prixVenteIndex !== undefined) {
      const prixAchat = parseFloat(values[prixAchatIndex] || '0')
      const prixVente = parseFloat(values[prixVenteIndex] || '0')
      
      if (prixVente <= prixAchat) {
        errors.push({
          field: 'prix_vente',
          value: values[prixVenteIndex] || '',
          message: 'Le prix de vente doit être supérieur au prix d\'achat'
        })
      }
    }
    
    return errors
  }

  // Fonction pour créer un objet produit à partir des valeurs
  const createProductFromValues = (values: string[], mapping: Record<string, number>, rowIndex: number): any => {
    const product: any = {
      id: Date.now() + rowIndex,
      nom: '',
      prix_achat: 0,
      prix_vente: 0,
      quantite: 0,
      reference: '',
      description: '',
      categorie: 'autre',
      code_barres: '',
      unite_mesure: 'piece',
      stock_minimum: 0,
      stock_maximum: 1000,
      fournisseur_principal: null,
      fournisseur_nom: '',
      marque: '',
      modele: '',
      etat_produit: 'neuf',
      devise: 'XAF',
      sku: '',
      actif: true,
      created_at: new Date().toISOString().split('T')[0]
    }

    // Remplir les champs selon le mapping
    for (const [field, index] of Object.entries(mapping)) {
      if (index !== undefined && values[index] !== undefined) {
        const value = values[index].trim()
        
        switch (field) {
          case 'nom':
          case 'reference':
          case 'description':
          case 'fournisseur_nom':
          case 'marque':
          case 'modele':
          case 'etat_produit':
          case 'devise':
          case 'sku':
            product[field] = value
            break
            
          case 'prix_achat':
          case 'prix_vente':
            product[field] = parseFloat(value.replace(/[^\d.,]/g, '').replace(',', '.')) || 0
            break
            
          case 'quantite':
          case 'stock_minimum':
          case 'stock_maximum':
            product[field] = parseInt(value.replace(/[^\d]/g, '')) || 0
            break
            
          case 'categorie_id':
          case 'fournisseur_principal':
            product[field] = value ? parseInt(value) : null
            break
            
          case 'actif':
            product[field] = ['true', '1', 'oui', 'yes'].includes(value.toLowerCase())
            break
            
          case 'categorie':
            product[field] = value || 'autre'
            break
            
          case 'code_barres':
          case 'unite_mesure':
            product[field] = value || ''
            break
        }
      }
    }

    // Compatibilité avec l'ancien système
    product.prix = product.prix_vente
    product.category = product.categorie

    return product
  }

  // Fonction pour générer les en-têtes d'export standardisés
  const getStandardHeaders = (): string[] => {
    return [
      ...productConfig.requiredColumns,
      ...productConfig.optionalColumns
    ]
  }

  // Fonction pour créer un CSV standardisé
  const createStandardCSV = (products: any[]): string => {
    const headers = getStandardHeaders()
    const csvRows = [headers.join(',')]
    
    products.forEach(product => {
      const row = headers.map(header => {
        let value = product[header] || ''
        
        // Gérer les valeurs spéciales
        if (value === null || value === undefined) {
          value = ''
        } else if (typeof value === 'boolean') {
          value = value ? 'true' : 'false'
        } else if (typeof value === 'number') {
          value = value.toString()
        } else if (typeof value === 'string' && value.includes(',')) {
          value = `"${value}"`
        }
        
        return value
      })
      
      csvRows.push(row.join(','))
    })
    
    return csvRows.join('\n')
  }

  return {
    productConfig,
    createColumnMapping,
    validateHeaders,
    validateRowData,
    createProductFromValues,
    getStandardHeaders,
    createStandardCSV
  }
}

