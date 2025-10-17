// Composable pour la gestion des entrepôts de l'entreprise connectée
import { ref, computed } from 'vue'

export const useEnterpriseWarehouses = () => {
  // Interface pour un entrepôt
  interface Warehouse {
    id: number
    name: string
    location: string
    capacity: number
    currentStock: number
    enterpriseId: number
    isActive: boolean
    managerId?: number
  }

  // Interface pour l'entreprise
  interface Enterprise {
    id: number
    name: string
    warehouses: Warehouse[]
  }

  const warehouses = ref<Warehouse[]>([])
  const currentEnterprise = ref<Enterprise | null>(null)
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

  // Obtenir l'utilisateur connecté
  const getCurrentUser = () => {
    if (process.client) {
      const userData = localStorage.getItem('user')
      if (userData) {
        try {
          return JSON.parse(userData)
        } catch (e) {
          console.error('Erreur parsing user:', e)
        }
      }
    }
    return null
  }

  // Charger les entrepôts de l'entreprise connectée
  const fetchEnterpriseWarehouses = async () => {
    try {
      loading.value = true
      error.value = ''

      const enterprise = getCurrentEnterprise()
      const user = getCurrentUser()

      if (!enterprise || !user) {
        throw new Error('Utilisateur ou entreprise non connecté')
      }

      console.log('🏢 Entreprise connectée:', enterprise.name)
      console.log('👤 Utilisateur connecté:', user.prenom, user.nom)

      // Simulation d'un appel API pour récupérer les entrepôts de l'entreprise
      // Dans une vraie implémentation, vous feriez :
      // const response = await $fetch(`/api/enterprises/${enterprise.id}/warehouses/`, {
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      //   }
      // })

      // Données simulées basées sur l'entreprise
      const mockWarehouses: Warehouse[] = [
        {
          id: 1,
          name: `${enterprise.name} - Entrepôt Principal`,
          location: 'Douala',
          capacity: 1000,
          currentStock: 0,
          enterpriseId: enterprise.id,
          isActive: true,
          managerId: user.id
        },
        {
          id: 2,
          name: `${enterprise.name} - Entrepôt Secondaire`,
          location: 'Yaoundé',
          capacity: 500,
          currentStock: 0,
          enterpriseId: enterprise.id,
          isActive: true
        },
        {
          id: 3,
          name: `${enterprise.name} - Entrepôt Nord`,
          location: 'Garoua',
          capacity: 300,
          currentStock: 0,
          enterpriseId: enterprise.id,
          isActive: true
        },
        {
          id: 4,
          name: `${enterprise.name} - Entrepôt Sud`,
          location: 'Kribi',
          capacity: 200,
          currentStock: 0,
          enterpriseId: enterprise.id,
          isActive: true
        }
      ]

      warehouses.value = mockWarehouses
      currentEnterprise.value = {
        id: enterprise.id,
        name: enterprise.name,
        warehouses: mockWarehouses
      }

      console.log('📦 Entrepôts chargés:', warehouses.value.length)
      console.log('📦 Entrepôts:', warehouses.value.map(w => w.name))

    } catch (err) {
      error.value = 'Erreur lors du chargement des entrepôts'
      console.error('Erreur fetchEnterpriseWarehouses:', err)
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
      console.log(`📦 Stock mis à jour pour ${warehouse.name}: ${warehouse.currentStock}`)
    }
  }

  // Obtenir l'entrepôt de l'utilisateur connecté (si il en gère un)
  const getUserWarehouse = () => {
    const user = getCurrentUser()
    if (!user) return null

    return warehouses.value.find(w => w.managerId === user.id)
  }

  // Vérifier si l'utilisateur peut gérer un entrepôt
  const canManageWarehouse = (warehouseId: number) => {
    const user = getCurrentUser()
    if (!user) return false

    const warehouse = getWarehouseById(warehouseId)
    if (!warehouse) return false

    // L'utilisateur peut gérer l'entrepôt s'il en est le manager ou s'il est admin
    return warehouse.managerId === user.id || user.role === 'admin' || user.role === 'superadmin'
  }

  // Obtenir les entrepôts que l'utilisateur peut gérer
  const getManageableWarehouses = () => {
    const user = getCurrentUser()
    if (!user) return warehouses.value

    return warehouses.value.filter(w => canManageWarehouse(w.id))
  }

  // Computed properties
  const totalCapacity = computed(() => {
    return warehouses.value.reduce((sum, w) => sum + w.capacity, 0)
  })

  const totalCurrentStock = computed(() => {
    return warehouses.value.reduce((sum, w) => sum + w.currentStock, 0)
  })

  const availableCapacity = computed(() => {
    return totalCapacity.value - totalCurrentStock.value
  })

  return {
    warehouses,
    currentEnterprise,
    loading,
    error,
    fetchEnterpriseWarehouses,
    getWarehouseById,
    getWarehouseName,
    checkCapacity,
    updateWarehouseStock,
    getUserWarehouse,
    canManageWarehouse,
    getManageableWarehouses,
    totalCapacity,
    totalCurrentStock,
    availableCapacity
  }
}














