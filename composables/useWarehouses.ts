// Composable pour la gestion des entrepôts
import { ref } from 'vue'

export const useWarehouses = () => {
  const warehouses = ref([
    { id: 1, name: 'Entrepôt Principal', location: 'Douala', capacity: 1000, currentStock: 0 },
    { id: 2, name: 'Entrepôt Secondaire', location: 'Yaoundé', capacity: 500, currentStock: 0 },
    { id: 3, name: 'Entrepôt Nord', location: 'Garoua', capacity: 300, currentStock: 0 },
    { id: 4, name: 'Entrepôt Sud', location: 'Kribi', capacity: 200, currentStock: 0 }
  ])

  const loading = ref(false)
  const error = ref('')

  // Charger les entrepôts depuis l'API
  const fetchWarehouses = async () => {
    try {
      loading.value = true
      error.value = ''
      
      // Simulation d'un appel API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Dans une vraie implémentation, vous feriez :
      // const response = await $fetch('/api/warehouses/')
      // warehouses.value = response.data
      
      console.log('Entrepôts chargés:', warehouses.value.length)
    } catch (err) {
      error.value = 'Erreur lors du chargement des entrepôts'
      console.error('Erreur fetchWarehouses:', err)
    } finally {
      loading.value = false
    }
  }

  // Obtenir un entrepôt par ID
  const getWarehouseById = (id: number) => {
    return warehouses.value.find(w => w.id === id)
  }

  // Obtenir le nom d'un entrepôt
  const getWarehouseName = (id: number) => {
    const warehouse = getWarehouseById(id)
    return warehouse ? warehouse.name : `Entrepôt ${id}`
  }

  // Vérifier la capacité d'un entrepôt
  const checkCapacity = (warehouseId: number, additionalStock: number) => {
    const warehouse = getWarehouseById(warehouseId)
    if (!warehouse) return false
    
    return (warehouse.currentStock + additionalStock) <= warehouse.capacity
  }

  // Mettre à jour le stock d'un entrepôt
  const updateWarehouseStock = (warehouseId: number, stockChange: number) => {
    const warehouse = getWarehouseById(warehouseId)
    if (warehouse) {
      warehouse.currentStock = Math.max(0, warehouse.currentStock + stockChange)
    }
  }

  return {
    warehouses,
    loading,
    error,
    fetchWarehouses,
    getWarehouseById,
    getWarehouseName,
    checkCapacity,
    updateWarehouseStock
  }
}
