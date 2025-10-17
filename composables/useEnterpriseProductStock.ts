// Composable pour la gestion des produits avec stock par entrepôt de l'entreprise
import { ref, computed } from 'vue'

export const useEnterpriseProductStock = () => {
  // Interface pour le stock d'un produit dans un entrepôt
  interface ProductStock {
    productId: number
    productName: string
    warehouseId: number
    warehouseName: string
    quantity: number
    minStock: number
    maxStock: number
    lastUpdated: string
    enterpriseId: number
  }

  // Interface pour un produit avec son stock total
  interface Product {
    id: number
    name: string
    reference: string
    description: string
    category: string
    totalStock: number
    stockByWarehouse: ProductStock[]
    enterpriseId: number
    prix_achat: number
    prix_vente: number
  }

  const products = ref<Product[]>([])
  const loading = ref(false)
  const error = ref('')

  // Obtenir l'entreprise de l'utilisateur connecté
  const getCurrentEnterprise = () => {
    if (process.client) {
      const enterpriseData = localStorage.getItem('entreprise')
      if (enterpriseData) {
        try {
          return JSON.parse(enterpriseData)
        } catch (e) {
          console.error('Erreur parsing entreprise:', e)
        }
      }
    }
    return null
  }

  // Obtenir le nom d'un entrepôt
  const getWarehouseName = (warehouseId: number) => {
    const warehouseNames: Record<number, string> = {
      1: 'Entrepôt Principal',
      2: 'Entrepôt Secondaire', 
      3: 'Entrepôt Nord',
      4: 'Entrepôt Sud'
    }
    return warehouseNames[warehouseId] || `Entrepôt ${warehouseId}`
  }

  // Charger les produits avec leur stock pour l'entreprise connectée
  const fetchEnterpriseProducts = async () => {
    try {
      loading.value = true
      error.value = ''

      const enterprise = getCurrentEnterprise()
      if (!enterprise) {
        throw new Error('Entreprise non connectée')
      }

      console.log('🏢 Chargement des produits pour l\'entreprise:', enterprise.name)

      // Simulation d'un appel API pour récupérer les produits de l'entreprise
      // Dans une vraie implémentation, vous feriez :
      // const response = await $fetch(`/api/enterprises/${enterprise.id}/products/with-stock/`, {
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      //   }
      // })

      // Données simulées basées sur l'entreprise
      const mockProducts: Product[] = [
        {
          id: 1,
          name: 'Ordinateur Portable Dell',
          reference: 'DELL-001',
          description: 'Ordinateur portable professionnel',
          category: 'Informatique',
          totalStock: 25,
          enterpriseId: enterprise.id,
          prix_achat: 450000,
          prix_vente: 550000,
          stockByWarehouse: [
            { 
              productId: 1, 
              productName: 'Ordinateur Portable Dell', 
              warehouseId: 1, 
              warehouseName: `${enterprise.name} - Entrepôt Principal`, 
              quantity: 15, 
              minStock: 5, 
              maxStock: 50, 
              lastUpdated: '2024-01-15',
              enterpriseId: enterprise.id
            },
            { 
              productId: 1, 
              productName: 'Ordinateur Portable Dell', 
              warehouseId: 2, 
              warehouseName: `${enterprise.name} - Entrepôt Secondaire`, 
              quantity: 10, 
              minStock: 3, 
              maxStock: 30, 
              lastUpdated: '2024-01-15',
              enterpriseId: enterprise.id
            }
          ]
        },
        {
          id: 2,
          name: 'Smartphone Samsung',
          reference: 'SAMS-001',
          description: 'Smartphone Android haut de gamme',
          category: 'Téléphonie',
          totalStock: 40,
          enterpriseId: enterprise.id,
          prix_achat: 180000,
          prix_vente: 220000,
          stockByWarehouse: [
            { 
              productId: 2, 
              productName: 'Smartphone Samsung', 
              warehouseId: 1, 
              warehouseName: `${enterprise.name} - Entrepôt Principal`, 
              quantity: 20, 
              minStock: 10, 
              maxStock: 100, 
              lastUpdated: '2024-01-15',
              enterpriseId: enterprise.id
            },
            { 
              productId: 2, 
              productName: 'Smartphone Samsung', 
              warehouseId: 3, 
              warehouseName: `${enterprise.name} - Entrepôt Nord`, 
              quantity: 20, 
              minStock: 5, 
              maxStock: 50, 
              lastUpdated: '2024-01-15',
              enterpriseId: enterprise.id
            }
          ]
        },
        {
          id: 3,
          name: 'Tablette iPad',
          reference: 'IPAD-001',
          description: 'Tablette Apple iPad',
          category: 'Informatique',
          totalStock: 15,
          enterpriseId: enterprise.id,
          prix_achat: 320000,
          prix_vente: 380000,
          stockByWarehouse: [
            { 
              productId: 3, 
              productName: 'Tablette iPad', 
              warehouseId: 2, 
              warehouseName: `${enterprise.name} - Entrepôt Secondaire`, 
              quantity: 15, 
              minStock: 3, 
              maxStock: 25, 
              lastUpdated: '2024-01-15',
              enterpriseId: enterprise.id
            }
          ]
        },
        {
          id: 4,
          name: 'Imprimante HP LaserJet',
          reference: 'HP-001',
          description: 'Imprimante laser professionnelle',
          category: 'Bureautique',
          totalStock: 8,
          enterpriseId: enterprise.id,
          prix_achat: 120000,
          prix_vente: 150000,
          stockByWarehouse: [
            { 
              productId: 4, 
              productName: 'Imprimante HP LaserJet', 
              warehouseId: 1, 
              warehouseName: `${enterprise.name} - Entrepôt Principal`, 
              quantity: 5, 
              minStock: 2, 
              maxStock: 20, 
              lastUpdated: '2024-01-15',
              enterpriseId: enterprise.id
            },
            { 
              productId: 4, 
              productName: 'Imprimante HP LaserJet', 
              warehouseId: 4, 
              warehouseName: `${enterprise.name} - Entrepôt Sud`, 
              quantity: 3, 
              minStock: 1, 
              maxStock: 10, 
              lastUpdated: '2024-01-15',
              enterpriseId: enterprise.id
            }
          ]
        }
      ]

      products.value = mockProducts
      console.log('📦 Produits chargés:', products.value.length)
      console.log('📦 Produits:', products.value.map(p => p.name))

    } catch (err) {
      error.value = 'Erreur lors du chargement des produits'
      console.error('Erreur fetchEnterpriseProducts:', err)
    } finally {
      loading.value = false
    }
  }

  // Obtenir un produit par ID
  const getProductById = (id: number) => {
    return products.value.find(p => p.id === id)
  }

  // Obtenir le stock d'un produit dans un entrepôt spécifique
  const getProductStockInWarehouse = (productId: number, warehouseId: number) => {
    const product = getProductById(productId)
    if (!product) return 0

    const stock = product.stockByWarehouse.find(s => s.warehouseId === warehouseId)
    return stock ? stock.quantity : 0
  }

  // Vérifier si un produit a du stock dans un entrepôt
  const hasStockInWarehouse = (productId: number, warehouseId: number, requiredQuantity: number = 1) => {
    const stock = getProductStockInWarehouse(productId, warehouseId)
    return stock >= requiredQuantity
  }

  // Obtenir les entrepôts où un produit est disponible
  const getWarehousesWithProduct = (productId: number) => {
    const product = getProductById(productId)
    if (!product) return []

    return product.stockByWarehouse
      .filter(s => s.quantity > 0)
      .map(s => ({
        warehouseId: s.warehouseId,
        warehouseName: s.warehouseName,
        quantity: s.quantity
      }))
  }

  // Rechercher des produits par nom ou référence
  const searchProducts = (query: string) => {
    if (!query.trim()) return products.value

    const lowercaseQuery = query.toLowerCase()
    return products.value.filter(p => 
      p.name.toLowerCase().includes(lowercaseQuery) ||
      p.reference.toLowerCase().includes(lowercaseQuery) ||
      p.description.toLowerCase().includes(lowercaseQuery)
    )
  }

  // Obtenir les produits avec stock faible
  const getProductsWithLowStock = () => {
    return products.value.filter(product => 
      product.stockByWarehouse.some(stock => stock.quantity <= stock.minStock)
    )
  }

  // Mettre à jour le stock d'un produit dans un entrepôt
  const updateProductStock = (productId: number, warehouseId: number, quantityChange: number) => {
    const product = getProductById(productId)
    if (!product) return false

    const stock = product.stockByWarehouse.find(s => s.warehouseId === warehouseId)
    if (stock) {
      stock.quantity = Math.max(0, stock.quantity + quantityChange)
      stock.lastUpdated = new Date().toISOString()
      
      // Mettre à jour le stock total
      product.totalStock = product.stockByWarehouse.reduce((sum, s) => sum + s.quantity, 0)
      
      console.log(`📦 Stock mis à jour pour ${product.name} dans ${stock.warehouseName}: ${stock.quantity}`)
      return true
    }
    return false
  }

  // Computed properties
  const totalProducts = computed(() => products.value.length)
  const totalStockValue = computed(() => {
    return products.value.reduce((total, product) => {
      return total + (product.totalStock * product.prix_vente)
    }, 0)
  })

  return {
    products,
    loading,
    error,
    fetchEnterpriseProducts,
    getProductById,
    getProductStockInWarehouse,
    hasStockInWarehouse,
    getWarehousesWithProduct,
    searchProducts,
    getProductsWithLowStock,
    updateProductStock,
    totalProducts,
    totalStockValue
  }
}














