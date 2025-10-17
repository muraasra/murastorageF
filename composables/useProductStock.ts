// Composable pour la gestion des produits avec stock par entrepôt
import { ref } from 'vue'

export const useProductStock = () => {
  // Fonction simple pour obtenir le nom d'un entrepôt
  const getWarehouseName = (warehouseId: number) => {
    const warehouseNames: Record<number, string> = {
      1: 'Entrepôt Principal',
      2: 'Entrepôt Secondaire', 
      3: 'Entrepôt Nord',
      4: 'Entrepôt Sud'
    }
    return warehouseNames[warehouseId] || `Entrepôt ${warehouseId}`
  }

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
  }

  const products = ref<Product[]>([])
  const loading = ref(false)
  const error = ref('')

  // Charger les produits avec leur stock
  const fetchProducts = async () => {
    try {
      loading.value = true
      error.value = ''

      // Simulation de données
      const mockProducts: Product[] = [
        {
          id: 1,
          name: 'Ordinateur Portable Dell',
          reference: 'DELL-001',
          description: 'Ordinateur portable professionnel',
          category: 'Informatique',
          totalStock: 25,
          stockByWarehouse: [
            { productId: 1, productName: 'Ordinateur Portable Dell', warehouseId: 1, warehouseName: 'Entrepôt Principal', quantity: 15, minStock: 5, maxStock: 50, lastUpdated: '2024-01-15' },
            { productId: 1, productName: 'Ordinateur Portable Dell', warehouseId: 2, warehouseName: 'Entrepôt Secondaire', quantity: 10, minStock: 3, maxStock: 30, lastUpdated: '2024-01-15' }
          ]
        },
        {
          id: 2,
          name: 'Smartphone Samsung',
          reference: 'SAMS-001',
          description: 'Smartphone Android haut de gamme',
          category: 'Téléphonie',
          totalStock: 40,
          stockByWarehouse: [
            { productId: 2, productName: 'Smartphone Samsung', warehouseId: 1, warehouseName: 'Entrepôt Principal', quantity: 20, minStock: 10, maxStock: 100, lastUpdated: '2024-01-15' },
            { productId: 2, productName: 'Smartphone Samsung', warehouseId: 3, warehouseName: 'Entrepôt Nord', quantity: 20, minStock: 5, maxStock: 50, lastUpdated: '2024-01-15' }
          ]
        },
        {
          id: 3,
          name: 'Tablette iPad',
          reference: 'IPAD-001',
          description: 'Tablette Apple iPad',
          category: 'Informatique',
          totalStock: 15,
          stockByWarehouse: [
            { productId: 3, productName: 'Tablette iPad', warehouseId: 2, warehouseName: 'Entrepôt Secondaire', quantity: 15, minStock: 3, maxStock: 25, lastUpdated: '2024-01-15' }
          ]
        }
      ]

      // Dans une vraie implémentation, vous feriez :
      // const response = await $fetch('/api/products/with-stock/')
      // products.value = response.data

      products.value = mockProducts
      console.log('Produits chargés:', products.value.length)
    } catch (err) {
      error.value = 'Erreur lors du chargement des produits'
      console.error('Erreur fetchProducts:', err)
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
      
      return true
    }
    return false
  }

  return {
    products,
    loading,
    error,
    fetchProducts,
    getProductById,
    getProductStockInWarehouse,
    hasStockInWarehouse,
    getWarehousesWithProduct,
    searchProducts,
    getProductsWithLowStock,
    updateProductStock
  }
}
