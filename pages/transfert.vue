<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useNotification } from '@/types/useNotification'

// Utiliser le composable de notification
const { success, error } = useNotification()

// Interface pour un entrepôt
interface Warehouse {
  id: number
  name: string
  location: string
  capacity: number
  currentStock: number
  enterpriseId: number
  isActive: boolean
}

// Interface pour un produit avec stock par entrepôt
interface Product {
  id: number
  nom: string
  reference: string
  description: string
  prix_achat: number
  prix_vente: number
  quantite: number
  category?: string
  stocks: ProductStock[]
}

// Interface pour le stock d'un produit dans un entrepôt
interface ProductStock {
  productId: number
  warehouseId: number
  warehouseName: string
  quantity: number
  minStock: number
  maxStock: number
}

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
  requestedBy: string
}

// État de l'application
const loading = ref(false)
const currentEnterprise = ref<any>(null)
const currentUser = ref<any>(null)

// Données
const warehouses = ref<Warehouse[]>([])
const products = ref<Product[]>([])
const transfers = ref<StockTransfer[]>([])

// Interface utilisateur
const showCreateModal = ref(false)
const showTransferDetails = ref(false)
const selectedTransfer = ref<StockTransfer | null>(null)
const searchQuery = ref('')
const selectedStatus = ref<'all' | 'pending' | 'in_progress' | 'completed' | 'cancelled'>('all')

// Formulaire de création de transfert
const newTransfer = ref({
  productId: 0,
  productName: '',
  fromWarehouseId: 0,
  toWarehouseId: 0,
  quantity: 1,
  notes: ''
})

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

// Charger les entrepôts de l'entreprise
const fetchWarehouses = async () => {
  try {
    loading.value = true
    const enterprise = getCurrentEnterprise()
    
    if (!enterprise) {
      throw new Error('Entreprise non connectée')
    }

    console.log('🏢 Chargement des entrepôts pour l\'entreprise:', enterprise.nom)

    // Appel API pour récupérer les entrepôts de l'entreprise
    const token = process.client ? localStorage.getItem('access_token') : null
    if (!token) {
      throw new Error('Token d\'authentification manquant')
    }

    const response = await $fetch(`/api/boutiques/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }) as any[]

    // Transformer les données de l'API vers notre interface
    warehouses.value = response.map((boutique: any) => ({
      id: boutique.id,
      name: boutique.nom,
      location: boutique.ville,
      capacity: 1000, // Capacité par défaut, à ajuster selon vos besoins
      currentStock: 0, // Sera calculé dynamiquement
      enterpriseId: boutique.entreprise,
      isActive: boutique.is_active
    }))

    console.log('📦 Entrepôts chargés:', warehouses.value.length)
    console.log('📦 Entrepôts:', warehouses.value.map(w => w.name))
  } catch (err) {
    console.error('Erreur fetchWarehouses:', err)
    error('Erreur lors du chargement des entrepôts')
    
    // Fallback avec des données simulées si l'API échoue
    const enterprise = getCurrentEnterprise()
    if (enterprise) {
      warehouses.value = [
        {
          id: 1,
          name: `${enterprise.nom} - Entrepôt Principal`,
          location: 'Douala',
          capacity: 1000,
          currentStock: 0,
          enterpriseId: enterprise.id,
          isActive: true
        }
      ]
      console.log('📦 Utilisation des données de fallback')
    }
  } finally {
    loading.value = false
  }
}

// Charger les produits avec leur stock par entrepôt
const fetchProducts = async () => {
  try {
    loading.value = true
    const enterprise = getCurrentEnterprise()
    
    if (!enterprise) {
      throw new Error('Entreprise non connectée')
    }

    console.log('📦 Chargement des produits pour l\'entreprise:', enterprise.nom)

    // Appel API pour récupérer les produits de l'entreprise
    const token = process.client ? localStorage.getItem('access_token') : null
    if (!token) {
      throw new Error('Token d\'authentification manquant')
    }

    const response = await $fetch(`/api/produits/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }) as any[]

    // Transformer les données de l'API vers notre interface
    products.value = response.map((produit: any) => {
      // Calculer le stock total et par entrepôt
      const stocks = produit.stocks || []
      const totalStock = stocks.reduce((sum: number, stock: any) => sum + stock.quantite, 0)
      
      return {
        id: produit.id,
        nom: produit.nom,
        reference: produit.reference || produit.sku || '',
        description: produit.description || '',
        prix_achat: parseFloat(produit.prix_achat) || 0,
        prix_vente: parseFloat(produit.prix_vente) || 0,
        quantite: totalStock,
        category: produit.categorie?.nom || produit.category || 'Autre',
        stocks: stocks.map((stock: any) => ({
          productId: produit.id,
          warehouseId: stock.entrepot,
          warehouseName: getWarehouseName(stock.entrepot),
          quantity: stock.quantite,
          minStock: produit.stock_minimum || 0,
          maxStock: produit.stock_maximum || 1000
        }))
      }
    })

    console.log('📦 Produits chargés:', products.value.length)
    console.log('📦 Produits:', products.value.map(p => `${p.nom} (${p.quantite})`))
  } catch (err) {
    console.error('Erreur fetchProducts:', err)
    error('Erreur lors du chargement des produits')
    
    // Fallback avec des données simulées si l'API échoue
    const enterprise = getCurrentEnterprise()
    if (enterprise) {
      products.value = [
        {
          id: 1,
          nom: 'Produit de Test',
          reference: 'TEST-001',
          description: 'Produit de test pour le transfert',
          prix_achat: 100000,
          prix_vente: 120000,
          quantite: 10,
          category: 'Test',
          stocks: [
            {
              productId: 1,
              warehouseId: 1,
              warehouseName: `${enterprise.nom} - Entrepôt Principal`,
              quantity: 10,
              minStock: 5,
              maxStock: 50
            }
          ]
        }
      ]
      console.log('📦 Utilisation des données de fallback')
    }
  } finally {
    loading.value = false
  }
}

// Charger les transferts
const fetchTransfers = async () => {
  try {
    loading.value = true
    
    console.log('🔄 Chargement des transferts')

    // Appel API pour récupérer les transferts (mouvements de type 'transfert')
    const token = process.client ? localStorage.getItem('access_token') : null
    if (!token) {
      throw new Error('Token d\'authentification manquant')
    }

    const response = await $fetch(`/api/mouvements-stock/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }) as any[]

    // Filtrer les mouvements de type 'transfert' et les transformer
    const transferMovements = response.filter((mouvement: any) => mouvement.type_mouvement === 'transfert')
    
    // Grouper les mouvements par transfert (sortie + entrée)
    const transferGroups = new Map()
    
    transferMovements.forEach((mouvement: any) => {
      const key = `${mouvement.produit}-${mouvement.reference_document || mouvement.created_at}`
      if (!transferGroups.has(key)) {
        transferGroups.set(key, {
          id: mouvement.id,
          productId: mouvement.produit,
          productName: mouvement.produit_nom || 'Produit inconnu',
          quantity: mouvement.quantite,
          createdAt: mouvement.created_at,
          referenceDocument: mouvement.reference_document,
          notes: mouvement.notes || '',
          requestedBy: mouvement.utilisateur || 'Système',
          movements: []
        })
      }
      transferGroups.get(key).movements.push(mouvement)
    })

    // Transformer les groupes en transferts
    transfers.value = Array.from(transferGroups.values()).map((group: any) => {
      const sortieMovement = group.movements.find((m: any) => m.quantite < 0)
      const entreeMovement = group.movements.find((m: any) => m.quantite > 0)
      
      return {
        id: group.id,
        productId: group.productId,
        productName: group.productName,
        fromWarehouseId: sortieMovement?.entrepot || 0,
        toWarehouseId: entreeMovement?.entrepot || 0,
        quantity: Math.abs(group.quantity),
        status: 'completed', // Les transferts dans l'historique sont complétés
        createdAt: group.createdAt,
        completedAt: group.createdAt,
        notes: group.notes,
        requestedBy: group.requestedBy
      }
    })

    console.log('🔄 Transferts chargés:', transfers.value.length)
  } catch (err) {
    console.error('Erreur fetchTransfers:', err)
    error('Erreur lors du chargement des transferts')
    
    // Fallback avec des données simulées si l'API échoue
    transfers.value = []
    console.log('🔄 Utilisation des données de fallback (vide)')
  } finally {
    loading.value = false
  }
}

// Computed properties
const filteredProducts = computed(() => {
  if (!searchQuery.value.trim()) return products.value
  
  const query = searchQuery.value.toLowerCase()
  return products.value.filter(p => 
    p.nom.toLowerCase().includes(query) ||
    p.reference.toLowerCase().includes(query) ||
    p.description.toLowerCase().includes(query)
  )
})

const filteredTransfers = computed(() => {
  if (selectedStatus.value === 'all') {
    return transfers.value
  }
  return transfers.value.filter(t => t.status === selectedStatus.value)
})

const transferStats = computed(() => {
  return {
    total: transfers.value.length,
    pending: transfers.value.filter(t => t.status === 'pending').length,
    inProgress: transfers.value.filter(t => t.status === 'in_progress').length,
    completed: transfers.value.filter(t => t.status === 'completed').length,
    cancelled: transfers.value.filter(t => t.status === 'cancelled').length
  }
})

const sourceWarehouses = computed(() => {
  if (!newTransfer.value.productId) return []
  
  const product = products.value.find(p => p.id === newTransfer.value.productId)
  if (!product) return []
  
  return product.stocks
    .filter(s => s.quantity >= newTransfer.value.quantity)
    .map(s => ({
      warehouseId: s.warehouseId,
      warehouseName: s.warehouseName,
      quantity: s.quantity
    }))
})

const destinationWarehouses = computed(() => {
  if (!newTransfer.value.fromWarehouseId) return warehouses.value
  
  return warehouses.value.filter(w => w.id !== newTransfer.value.fromWarehouseId)
})

// Méthodes
const openCreateModal = () => {
  resetForm()
  showCreateModal.value = true
}

const resetForm = () => {
  newTransfer.value = {
    productId: 0,
    productName: '',
    fromWarehouseId: 0,
    toWarehouseId: 0,
  quantity: 1,
    notes: ''
  }
}

const selectProduct = (product: Product) => {
  newTransfer.value.productId = product.id
  newTransfer.value.productName = product.nom
  newTransfer.value.fromWarehouseId = 0
  newTransfer.value.toWarehouseId = 0
}

const onQuantityChange = () => {
  if (newTransfer.value.quantity <= 0) {
    newTransfer.value.fromWarehouseId = 0
    newTransfer.value.toWarehouseId = 0
  }
}

const submitTransfer = async () => {
  try {
    if (!newTransfer.value.productId || !newTransfer.value.fromWarehouseId || !newTransfer.value.toWarehouseId) {
      error('Veuillez remplir tous les champs obligatoires')
      return
    }

    if (newTransfer.value.fromWarehouseId === newTransfer.value.toWarehouseId) {
      error('L\'entrepôt source et destination doivent être différents')
      return
    }

    // Vérifier le stock disponible
    const product = products.value.find(p => p.id === newTransfer.value.productId)
    if (!product) {
      error('Produit non trouvé')
      return
    }

    const stock = product.stocks.find(s => s.warehouseId === newTransfer.value.fromWarehouseId)
    if (!stock || stock.quantity < newTransfer.value.quantity) {
      error('Stock insuffisant dans l\'entrepôt source')
      return
    }

    console.log('🚀 Création du transfert via API')

    // Appel API pour créer le transfert
    const token = process.client ? localStorage.getItem('access_token') : null
    if (!token) {
      throw new Error('Token d\'authentification manquant')
    }

    // Créer les mouvements de stock (sortie + entrée)
    const transferData = {
      produit: newTransfer.value.productId,
      entrepot_source: newTransfer.value.fromWarehouseId,
      entrepot_destination: newTransfer.value.toWarehouseId,
      quantite: newTransfer.value.quantity,
      notes: newTransfer.value.notes || '',
      type_mouvement: 'transfert'
    }

    const response = await $fetch(`/api/mouvements-stock/transfert/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: transferData
    }) as any

    console.log('✅ Transfert créé via API:', response)

    // Créer le transfert local pour l'affichage
    const newTransferData: StockTransfer = {
      id: response.id || Date.now(),
      productId: newTransfer.value.productId,
      productName: newTransfer.value.productName,
      fromWarehouseId: newTransfer.value.fromWarehouseId,
      toWarehouseId: newTransfer.value.toWarehouseId,
      quantity: newTransfer.value.quantity,
      status: 'completed', // Le transfert est immédiatement complété via l'API
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      notes: newTransfer.value.notes,
      requestedBy: currentUser.value?.prenom + ' ' + currentUser.value?.nom || 'Utilisateur'
    }

    transfers.value.push(newTransferData)
    
    // Mettre à jour les stocks localement
    if (product) {
      const fromStock = product.stocks.find(s => s.warehouseId === newTransfer.value.fromWarehouseId)
      const toStock = product.stocks.find(s => s.warehouseId === newTransfer.value.toWarehouseId)
      
      if (fromStock) {
        fromStock.quantity -= newTransfer.value.quantity
      }
      
      if (toStock) {
        toStock.quantity += newTransfer.value.quantity
      } else {
        // Créer un nouveau stock pour l'entrepôt de destination
        const toWarehouse = warehouses.value.find(w => w.id === newTransfer.value.toWarehouseId)
        if (toWarehouse) {
          product.stocks.push({
            productId: newTransfer.value.productId,
            warehouseId: newTransfer.value.toWarehouseId,
            warehouseName: toWarehouse.name,
            quantity: newTransfer.value.quantity,
            minStock: product.stocks[0]?.minStock || 0,
            maxStock: product.stocks[0]?.maxStock || 1000
          })
        }
      }
      
      // Mettre à jour la quantité totale
      product.quantite = product.stocks.reduce((sum, s) => sum + s.quantity, 0)
    }

    success(`Transfert créé avec succès (ID: ${newTransferData.id})`)
    
    showCreateModal.value = false
    resetForm()
  } catch (err) {
    console.error('Erreur lors de la création du transfert:', err)
    error('Erreur lors de la création du transfert: ' + (err as Error).message)
  }
}

const viewTransferDetails = (transfer: StockTransfer) => {
  selectedTransfer.value = transfer
  showTransferDetails.value = true
}

const startTransfer = async (transferId: number) => {
  try {
    const transfer = transfers.value.find(t => t.id === transferId)
    if (!transfer) throw new Error('Transfert non trouvé')

    if (transfer.status !== 'pending') {
      throw new Error('Ce transfert ne peut pas être démarré')
    }

    transfer.status = 'in_progress'
    success(`Transfert ${transferId} démarré`)
  } catch (err) {
    console.error('Erreur lors du démarrage du transfert:', err)
    error('Erreur lors du démarrage du transfert')
  }
}

const completeTransfer = async (transferId: number) => {
  try {
    const transfer = transfers.value.find(t => t.id === transferId)
    if (!transfer) throw new Error('Transfert non trouvé')

    if (transfer.status !== 'in_progress') {
      throw new Error('Ce transfert ne peut pas être complété')
    }

    // Mettre à jour les stocks
    const product = products.value.find(p => p.id === transfer.productId)
    if (product) {
      const fromStock = product.stocks.find(s => s.warehouseId === transfer.fromWarehouseId)
      const toStock = product.stocks.find(s => s.warehouseId === transfer.toWarehouseId)
      
      if (fromStock) {
        fromStock.quantity -= transfer.quantity
      }
      
      if (toStock) {
        toStock.quantity += transfer.quantity
      } else {
        // Créer un nouveau stock pour l'entrepôt de destination
        const toWarehouse = warehouses.value.find(w => w.id === transfer.toWarehouseId)
        if (toWarehouse) {
          product.stocks.push({
            productId: transfer.productId,
            warehouseId: transfer.toWarehouseId,
            warehouseName: toWarehouse.name,
            quantity: transfer.quantity,
            minStock: 0,
            maxStock: 1000
          })
        }
      }
      
      // Mettre à jour la quantité totale
      product.quantite = product.stocks.reduce((sum, s) => sum + s.quantity, 0)
    }

    transfer.status = 'completed'
    transfer.completedAt = new Date().toISOString()
    success(`Transfert ${transferId} complété avec succès`)
  } catch (err) {
    console.error('Erreur lors de la completion du transfert:', err)
    error('Erreur lors de la completion du transfert')
  }
}

const cancelTransfer = async (transferId: number) => {
  try {
    const transfer = transfers.value.find(t => t.id === transferId)
    if (!transfer) throw new Error('Transfert non trouvé')

    if (transfer.status === 'completed') {
      throw new Error('Un transfert complété ne peut pas être annulé')
    }

    transfer.status = 'cancelled'
    success(`Transfert ${transferId} annulé`)
  } catch (err) {
    console.error('Erreur lors de l\'annulation du transfert:', err)
    error('Erreur lors de l\'annulation du transfert')
  }
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: 'yellow',
    in_progress: 'blue',
    completed: 'green',
    cancelled: 'red'
  }
  return colors[status] || 'gray'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    pending: 'En attente',
    in_progress: 'En cours',
    completed: 'Complété',
    cancelled: 'Annulé'
  }
  return texts[status] || status
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getWarehouseName = (warehouseId: number) => {
  const warehouse = warehouses.value.find(w => w.id === warehouseId)
  return warehouse ? warehouse.name : `Entrepôt ${warehouseId}`
}

// Chargement initial
onMounted(async () => {
  console.log('🚀 Page transfert chargée')
  
  const user = getCurrentUser()
  const enterprise = getCurrentEnterprise()
  
  if (!user) {
    error('Utilisateur non connecté')
    console.error('❌ Utilisateur non connecté')
    return
  }
  
  if (!enterprise) {
    error('Entreprise non définie')
    console.error('❌ Entreprise non définie')
    return
  }
  
  currentUser.value = user
  currentEnterprise.value = enterprise
  
  console.log('✅ Utilisateur connecté:', user.prenom, user.nom)
  console.log('✅ Entreprise connectée:', enterprise.name)

  await Promise.all([
    fetchWarehouses(),
    fetchProducts(),
    fetchTransfers()
  ])
})
</script>

<template>
  <section class="mt-5 px-6">
    <!-- En-tête moderne -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-blue-400 mb-2">📦 Transferts de Stock</h1>
          <p class="text-gray-600 dark:text-gray-400">Gérez les transferts entre entrepôts de votre entreprise</p>
          <div v-if="currentEnterprise" class="mt-2">
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              <UIcon name="i-heroicons-building-office" class="h-4 w-4 mr-1" />
              {{ currentEnterprise.name }}
            </span>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <UIcon name="i-heroicons-arrow-path" class="h-8 w-8 text-blue-400" />
        </div>
      </div>
    </div>

    <!-- Statistiques -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow border border-gray-200 dark:border-gray-700">
        <div class="flex items-center">
          <div class="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <UIcon name="i-heroicons-document-text" class="h-6 w-6 text-blue-600" />
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ transferStats.total }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow border border-gray-200 dark:border-gray-700">
        <div class="flex items-center">
          <div class="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
            <UIcon name="i-heroicons-clock" class="h-6 w-6 text-yellow-600" />
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">En attente</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ transferStats.pending }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow border border-gray-200 dark:border-gray-700">
        <div class="flex items-center">
          <div class="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <UIcon name="i-heroicons-play" class="h-6 w-6 text-blue-600" />
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">En cours</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ transferStats.inProgress }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow border border-gray-200 dark:border-gray-700">
        <div class="flex items-center">
          <div class="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
            <UIcon name="i-heroicons-check-circle" class="h-6 w-6 text-green-600" />
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Complétés</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ transferStats.completed }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Interface principale -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Liste des transferts -->
      <div class="lg:col-span-2">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div class="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-semibold text-white flex items-center">
                <UIcon name="i-heroicons-list-bullet" class="h-5 w-5 mr-2" />
                Transferts
              </h2>
              <UButton @click="openCreateModal" color="white" size="sm" icon="i-heroicons-plus">
        Nouveau Transfert
      </UButton>
            </div>
          </div>

          <div class="p-6">
            <!-- Filtres -->
            <div class="mb-4 flex space-x-4">
              <div class="flex-1">
                <UInput 
                  v-model="searchQuery" 
                  placeholder="Rechercher un produit..."
                  icon="i-heroicons-magnifying-glass"
                />
              </div>
              <USelect 
                v-model="selectedStatus"
                :options="[
                  { label: 'Tous', value: 'all' },
                  { label: 'En attente', value: 'pending' },
                  { label: 'En cours', value: 'in_progress' },
                  { label: 'Complétés', value: 'completed' },
                  { label: 'Annulés', value: 'cancelled' }
                ]"
                class="w-40"
              />
            </div>

            <!-- Liste des transferts -->
            <div v-if="filteredTransfers.length === 0" class="text-center py-8 text-gray-500">
              <UIcon name="i-heroicons-inbox" class="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Aucun transfert trouvé</p>
            </div>

            <div v-else class="space-y-3">
              <div 
                v-for="transfer in filteredTransfers" 
                :key="transfer.id"
                class="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                @click="viewTransferDetails(transfer)"
              >
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <div class="flex items-center space-x-3">
                      <h3 class="font-semibold text-gray-900 dark:text-white">{{ transfer.productName }}</h3>
                      <UBadge :color="getStatusColor(transfer.status) as any" size="sm">
                        {{ getStatusText(transfer.status) }}
                      </UBadge>
                    </div>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      De {{ getWarehouseName(transfer.fromWarehouseId) }} vers {{ getWarehouseName(transfer.toWarehouseId) }}
                    </p>
                    <p class="text-sm text-gray-500 dark:text-gray-500">
                      Quantité: {{ transfer.quantity }} • Créé le {{ formatDate(transfer.createdAt) }}
                    </p>
                  </div>
                  
                  <div class="flex items-center space-x-2">
                    <UButton 
                      v-if="transfer.status === 'pending'"
                      @click.stop="startTransfer(transfer.id)"
                      color="blue"
                      size="xs"
                      icon="i-heroicons-play"
                    >
                      Démarrer
                    </UButton>
                    
                    <UButton 
                      v-if="transfer.status === 'in_progress'"
                      @click.stop="completeTransfer(transfer.id)"
                      color="green"
                      size="xs"
                      icon="i-heroicons-check"
                    >
                      Compléter
                    </UButton>
                    
                    <UButton 
                      v-if="transfer.status === 'pending' || transfer.status === 'in_progress'"
                      @click.stop="cancelTransfer(transfer.id)"
                      color="red"
                      size="xs"
                      icon="i-heroicons-x-mark"
                    >
                      Annuler
                    </UButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar - Actions rapides -->
      <div class="lg:col-span-1">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden sticky top-6">
          <div class="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
            <h3 class="text-lg font-semibold text-white flex items-center">
              <UIcon name="i-heroicons-lightning-bolt" class="h-5 w-5 mr-2" />
              Actions Rapides
            </h3>
          </div>
          <div class="p-6">
            <div class="space-y-4">
              <UButton @click="openCreateModal" color="blue" size="lg" class="w-full" icon="i-heroicons-plus">
                Nouveau Transfert
              </UButton>
              
              <UButton @click="fetchTransfers" color="gray" size="lg" class="w-full" icon="i-heroicons-arrow-path">
                Actualiser
              </UButton>
            </div>

            <!-- Informations rapides -->
            <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
              <h4 class="font-semibold text-gray-900 dark:text-white mb-3">Informations</h4>
              <div class="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <div class="flex justify-between">
                  <span>Entrepôts:</span>
                  <span class="font-medium">{{ warehouses.length }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Produits:</span>
                  <span class="font-medium">{{ products.length }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Transferts actifs:</span>
                  <span class="font-medium">{{ transferStats.pending + transferStats.inProgress }}</span>
                </div>
                <div v-if="currentEnterprise" class="flex justify-between">
                  <span>Entreprise:</span>
                  <span class="font-medium text-blue-600">{{ currentEnterprise.name }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de création de transfert -->
    <UModal v-model="showCreateModal">
      <div class="p-6">
        <h3 class="text-lg font-semibold mb-4 flex items-center">
          <UIcon name="i-heroicons-plus-circle" class="h-5 w-5 mr-2 text-blue-500" />
          Nouveau Transfert de Stock
        </h3>

        <!-- Sélection du produit -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Produit
          </label>
          <UInput 
            v-model="searchQuery" 
            placeholder="Rechercher un produit..."
            icon="i-heroicons-magnifying-glass"
            class="mb-2"
          />
          
          <div v-if="searchQuery" class="max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg">
            <div 
              v-for="product in filteredProducts" 
              :key="product.id"
              class="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-600 last:border-b-0"
              @click="selectProduct(product)"
            >
              <div class="font-medium">{{ product.nom }}</div>
              <div class="text-sm text-gray-500">{{ product.reference }}</div>
              <div class="text-sm text-gray-400">Stock total: {{ product.quantite }}</div>
            </div>
          </div>

          <div v-if="newTransfer.productId" class="mt-2 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
            <div class="font-medium text-blue-900 dark:text-blue-100">{{ newTransfer.productName }}</div>
            <div class="text-sm text-blue-700 dark:text-blue-300">
              Disponible dans {{ sourceWarehouses.length }} entrepôt(s)
            </div>
          </div>
        </div>

        <!-- Quantité -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Quantité
          </label>
          <UInput 
            v-model.number="newTransfer.quantity" 
            type="number" 
            min="1"
            @input="onQuantityChange"
          />
        </div>

        <!-- Entrepôt source -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Entrepôt source
          </label>
          <USelect 
            v-model.number="newTransfer.fromWarehouseId"
            :options="sourceWarehouses.map(w => ({ label: `${w.warehouseName} (${w.quantity} disponibles)`, value: w.warehouseId }))"
            placeholder="Sélectionner l'entrepôt source"
          />
        </div>

        <!-- Entrepôt destination -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Entrepôt destination
          </label>
          <USelect 
            v-model.number="newTransfer.toWarehouseId"
            :options="destinationWarehouses.map(w => ({ label: w.name, value: w.id }))"
            placeholder="Sélectionner l'entrepôt destination"
          />
        </div>

        <!-- Notes -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Notes (optionnel)
          </label>
          <UTextarea 
            v-model="newTransfer.notes"
            placeholder="Ajouter des notes sur ce transfert..."
            :rows="3"
          />
        </div>

        <!-- Actions -->
        <div class="flex justify-end space-x-3">
          <UButton @click="showCreateModal = false" color="gray">
            Annuler
          </UButton>
          <UButton @click="submitTransfer" color="blue" :loading="loading">
            Créer le Transfert
          </UButton>
        </div>
      </div>
    </UModal>

    <!-- Modal de détails du transfert -->
    <UModal v-model="showTransferDetails">
      <div v-if="selectedTransfer" class="p-6">
        <h3 class="text-lg font-semibold mb-4 flex items-center">
          <UIcon name="i-heroicons-document-text" class="h-5 w-5 mr-2 text-blue-500" />
          Détails du Transfert
        </h3>

        <div class="space-y-4">
          <div>
            <label class="text-sm font-medium text-gray-600 dark:text-gray-400">Produit</label>
            <p class="text-lg font-semibold">{{ selectedTransfer.productName }}</p>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-medium text-gray-600 dark:text-gray-400">Entrepôt source</label>
              <p class="font-medium">{{ getWarehouseName(selectedTransfer.fromWarehouseId) }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-600 dark:text-gray-400">Entrepôt destination</label>
              <p class="font-medium">{{ getWarehouseName(selectedTransfer.toWarehouseId) }}</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-medium text-gray-600 dark:text-gray-400">Quantité</label>
              <p class="font-medium">{{ selectedTransfer.quantity }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-600 dark:text-gray-400">Statut</label>
              <UBadge :color="getStatusColor(selectedTransfer.status) as any" size="sm">
                {{ getStatusText(selectedTransfer.status) }}
              </UBadge>
            </div>
      </div>

          <div>
            <label class="text-sm font-medium text-gray-600 dark:text-gray-400">Demandé par</label>
            <p class="font-medium">{{ selectedTransfer.requestedBy }}</p>
          </div>

          <div>
            <label class="text-sm font-medium text-gray-600 dark:text-gray-400">Créé le</label>
            <p class="font-medium">{{ formatDate(selectedTransfer.createdAt) }}</p>
          </div>

          <div v-if="selectedTransfer.completedAt">
            <label class="text-sm font-medium text-gray-600 dark:text-gray-400">Complété le</label>
            <p class="font-medium">{{ formatDate(selectedTransfer.completedAt) }}</p>
            </div>

          <div v-if="selectedTransfer.notes">
            <label class="text-sm font-medium text-gray-600 dark:text-gray-400">Notes</label>
            <p class="font-medium">{{ selectedTransfer.notes }}</p>
          </div>
        </div>

        <div class="flex justify-end mt-6">
          <UButton @click="showTransferDetails = false" color="gray">
            Fermer
          </UButton>
      </div>
    </div>
    </UModal>
  </section>
</template>