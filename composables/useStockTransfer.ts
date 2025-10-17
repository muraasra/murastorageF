// Composable pour la gestion des transferts de stock
import { ref } from 'vue'

export const useStockTransfer = () => {
  // Interface pour un transfert
  interface StockTransfer {
    id: number
    productId: number
    productName: string
    fromWarehouseId: number
    toWarehouseId: number
    quantity: number
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
    createdAt: string
    completedAt?: string
    notes?: string
  }

  const transfers = ref<StockTransfer[]>([])
  const loading = ref(false)
  const errorMessage = ref('')

  // Fonctions de notification simples
  const success = (message: string) => {
    console.log('✅', message)
  }

  const error = (message: string) => {
    console.error('❌', message)
  }

  // Fonctions d'entrepôt simples
  const checkCapacity = (warehouseId: number, quantity: number) => {
    // Simulation - dans une vraie implémentation, vérifier la capacité réelle
    return true
  }

  const updateWarehouseStock = (warehouseId: number, quantityChange: number) => {
    // Simulation - dans une vraie implémentation, mettre à jour le stock réel
    console.log(`Stock mis à jour pour entrepôt ${warehouseId}: ${quantityChange}`)
  }

  const getWarehouseName = (warehouseId: number) => {
    // Simulation - dans une vraie implémentation, récupérer le nom réel
    return `Entrepôt ${warehouseId}`
  }

  // Créer un nouveau transfert
  const createTransfer = async (transferData: Omit<StockTransfer, 'id' | 'status' | 'createdAt'>) => {
    try {
      loading.value = true
      errorMessage.value = ''

      // Validation
      if (transferData.fromWarehouseId === transferData.toWarehouseId) {
        throw new Error('L\'entrepôt source et destination doivent être différents')
      }

      if (transferData.quantity <= 0) {
        throw new Error('La quantité doit être positive')
      }

      // Vérifier la capacité de l'entrepôt destination
      if (!checkCapacity(transferData.toWarehouseId, transferData.quantity)) {
        throw new Error('L\'entrepôt destination n\'a pas assez de capacité')
      }

      // Créer le transfert
      const newTransfer: StockTransfer = {
        id: Date.now(),
        ...transferData,
        status: 'pending',
        createdAt: new Date().toISOString()
      }

      // Dans une vraie implémentation, vous feriez :
      // const response = await $fetch('/api/stock-transfers/', {
      //   method: 'POST',
      //   body: newTransfer
      // })

      transfers.value.push(newTransfer)
      success(`Transfert créé avec succès (ID: ${newTransfer.id})`)
      
      return newTransfer
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erreur lors de la création du transfert'
      errorMessage.value = errorMsg
      error(errorMsg)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Démarrer un transfert
  const startTransfer = async (transferId: number) => {
    try {
      const transfer = transfers.value.find(t => t.id === transferId)
      if (!transfer) throw new Error('Transfert non trouvé')

      if (transfer.status !== 'pending') {
        throw new Error('Ce transfert ne peut pas être démarré')
      }

      transfer.status = 'in_progress'
      
      // Dans une vraie implémentation, vous feriez :
      // await $fetch(`/api/stock-transfers/${transferId}/start/`, { method: 'POST' })

      success(`Transfert ${transferId} démarré`)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erreur lors du démarrage du transfert'
      error(errorMsg)
      throw err
    }
  }

  // Compléter un transfert
  const completeTransfer = async (transferId: number) => {
    try {
      const transfer = transfers.value.find(t => t.id === transferId)
      if (!transfer) throw new Error('Transfert non trouvé')

      if (transfer.status !== 'in_progress') {
        throw new Error('Ce transfert ne peut pas être complété')
      }

      // Mettre à jour les stocks
      updateWarehouseStock(transfer.fromWarehouseId, -transfer.quantity)
      updateWarehouseStock(transfer.toWarehouseId, transfer.quantity)

      // Marquer comme complété
      transfer.status = 'completed'
      transfer.completedAt = new Date().toISOString()

      // Dans une vraie implémentation, vous feriez :
      // await $fetch(`/api/stock-transfers/${transferId}/complete/`, { method: 'POST' })

      success(`Transfert ${transferId} complété avec succès`)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erreur lors de la completion du transfert'
      error(errorMsg)
      throw err
    }
  }

  // Annuler un transfert
  const cancelTransfer = async (transferId: number) => {
    try {
      const transfer = transfers.value.find(t => t.id === transferId)
      if (!transfer) throw new Error('Transfert non trouvé')

      if (transfer.status === 'completed') {
        throw new Error('Un transfert complété ne peut pas être annulé')
      }

      transfer.status = 'cancelled'
      
      // Dans une vraie implémentation, vous feriez :
      // await $fetch(`/api/stock-transfers/${transferId}/cancel/`, { method: 'POST' })

      success(`Transfert ${transferId} annulé`)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erreur lors de l\'annulation du transfert'
      error(errorMsg)
      throw err
    }
  }

  // Charger les transferts
  const fetchTransfers = async () => {
    try {
      loading.value = true
      errorMessage.value = ''

      // Dans une vraie implémentation, vous feriez :
      // const response = await $fetch('/api/stock-transfers/')
      // transfers.value = response.data

      console.log('Transferts chargés:', transfers.value.length)
    } catch (err) {
      errorMessage.value = 'Erreur lors du chargement des transferts'
      console.error('Erreur fetchTransfers:', err)
    } finally {
      loading.value = false
    }
  }

  // Obtenir les statistiques des transferts
  const getTransferStats = () => {
    const stats = {
      total: transfers.value.length,
      pending: transfers.value.filter(t => t.status === 'pending').length,
      inProgress: transfers.value.filter(t => t.status === 'in_progress').length,
      completed: transfers.value.filter(t => t.status === 'completed').length,
      cancelled: transfers.value.filter(t => t.status === 'cancelled').length
    }
    return stats
  }

  // Filtrer les transferts par statut
  const getTransfersByStatus = (status: StockTransfer['status']) => {
    return transfers.value.filter(t => t.status === status)
  }

  return {
    transfers,
    loading,
    errorMessage,
    createTransfer,
    startTransfer,
    completeTransfer,
    cancelTransfer,
    fetchTransfers,
    getTransferStats,
    getTransfersByStatus
  }
}
