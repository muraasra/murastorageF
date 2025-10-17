// Composable pour la gestion des transferts de stock entre entrepôts de l'entreprise
import { ref, computed } from 'vue'

export const useEnterpriseStockTransfer = () => {
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
    enterpriseId: number
    requestedBy: number
    approvedBy?: number
  }

  const transfers = ref<StockTransfer[]>([])
  const loading = ref(false)
  const errorMessage = ref('')

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

  // Fonctions de notification simples
  const success = (message: string) => {
    console.log('✅', message)
    // Dans une vraie implémentation, vous utiliseriez un système de notifications
  }

  const error = (message: string) => {
    console.error('❌', message)
    // Dans une vraie implémentation, vous utiliseriez un système de notifications
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
  const createTransfer = async (transferData: Omit<StockTransfer, 'id' | 'status' | 'createdAt' | 'enterpriseId' | 'requestedBy'>) => {
    try {
      loading.value = true
      errorMessage.value = ''

      const enterprise = getCurrentEnterprise()
      const user = getCurrentUser()

      if (!enterprise || !user) {
        throw new Error('Utilisateur ou entreprise non connecté')
      }

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
        createdAt: new Date().toISOString(),
        enterpriseId: enterprise.id,
        requestedBy: user.id
      }

      // Dans une vraie implémentation, vous feriez :
      // const response = await $fetch('/api/enterprises/stock-transfers/', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: newTransfer
      // })

      transfers.value.push(newTransfer)
      success(`Transfert créé avec succès (ID: ${newTransfer.id})`)
      
      console.log('📦 Nouveau transfert créé:', {
        produit: newTransfer.productName,
        de: getWarehouseName(newTransfer.fromWarehouseId),
        vers: getWarehouseName(newTransfer.toWarehouseId),
        quantité: newTransfer.quantity,
        entreprise: enterprise.name
      })
      
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
      // await $fetch(`/api/enterprises/stock-transfers/${transferId}/start/`, { 
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      //   }
      // })

      success(`Transfert ${transferId} démarré`)
      console.log('🚀 Transfert démarré:', transfer.productName)
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
      // await $fetch(`/api/enterprises/stock-transfers/${transferId}/complete/`, { 
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      //   }
      // })

      success(`Transfert ${transferId} complété avec succès`)
      console.log('✅ Transfert complété:', {
        produit: transfer.productName,
        quantité: transfer.quantity,
        de: getWarehouseName(transfer.fromWarehouseId),
        vers: getWarehouseName(transfer.toWarehouseId)
      })
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
      // await $fetch(`/api/enterprises/stock-transfers/${transferId}/cancel/`, { 
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      //   }
      // })

      success(`Transfert ${transferId} annulé`)
      console.log('❌ Transfert annulé:', transfer.productName)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erreur lors de l\'annulation du transfert'
      error(errorMsg)
      throw err
    }
  }

  // Charger les transferts de l'entreprise
  const fetchTransfers = async () => {
    try {
      loading.value = true
      errorMessage.value = ''

      const enterprise = getCurrentEnterprise()
      if (!enterprise) {
        throw new Error('Entreprise non connectée')
      }

      // Dans une vraie implémentation, vous feriez :
      // const response = await $fetch(`/api/enterprises/${enterprise.id}/stock-transfers/`, {
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      //   }
      // })
      // transfers.value = response.data

      console.log('📦 Transferts chargés pour l\'entreprise:', enterprise.name)
      console.log('📦 Nombre de transferts:', transfers.value.length)
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

  // Obtenir les transferts de l'entreprise connectée
  const getEnterpriseTransfers = () => {
    const enterprise = getCurrentEnterprise()
    if (!enterprise) return []

    return transfers.value.filter(t => t.enterpriseId === enterprise.id)
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
    getTransfersByStatus,
    getEnterpriseTransfers
  }
}















