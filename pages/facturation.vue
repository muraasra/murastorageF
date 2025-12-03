<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from "vue";
import { useNotification } from '../types/useNotification';
import { useBarcodeScanner } from '../composables/useBarcodeScanner';
import { useInvoiceManager } from '../composables/useInvoiceManager';
import { useAutoSave } from '../composables/useAutoSave';
import { useBackgroundScanner } from '../composables/useBackgroundScanner';
import { useCameraScanner } from '../composables/useCameraScanner';
import { useDataExpiration } from '../composables/useDataExpiration';
import { useRealBarcodeScanner } from '../composables/useRealBarcodeScanner';
import { useSimpleScanner } from '../composables/useSimpleScanner';
import { Body } from "#components";
import { boolean } from "zod";
import { useAuthStore } from '@/stores/auth'
import { API_BASE_URL } from '@/constants'
import { useSeo } from '@/composables/useSeo'
// Corriger l'import de jsPDF
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Page privée - Noindex
useSeo({
  title: 'Facturation - Mura Storage',
  description: 'Gestion de facturation et commandes clients',
  noindex: true
});

const auth = useAuthStore()
const { error, success } = useNotification();
const { isScanning, scannedCode, startScan, stopScan, processScannedCode, simulateScan } = useBarcodeScanner();
const { calculateTotals, validateInvoice, generateInvoiceNumber, formatCurrency, calculateMargin, validateSellingPrice } = useInvoiceManager();
const { saveToLocalStorage, loadFromLocalStorage, clearFromLocalStorage, autoSave } = useAutoSave();
const { isActive: scannerActive, startBackgroundScan, stopBackgroundScan, setupScanListener, cleanup } = useBackgroundScanner();
const { isScanning: cameraScanning, scannedCode: cameraCode, scanError, videoRef, startCamera, stopCamera, scanImageFile, processScannedCode: processCameraCode } = useCameraScanner();
const { saveWithExpiration, loadWithExpiration, checkExpirationWarning, cleanupExpiredData, scheduleCleanup, getExpirationStatus } = useDataExpiration();
const { isScanning: realScanning, scannedCode: realCode, scanError: realScanError, scannerContainer, startQuaggaScanner, stopQuaggaScanner, testScan, processDetectedCode, cleanup: realCleanup } = useRealBarcodeScanner();
const { isScanning: simpleScanning, scannedCode: simpleCode, scanError: simpleScanError, videoRef: simpleVideoRef, startSimpleScanner, stopSimpleScanner, testScan: testSimpleScan, processDetectedCode: processSimpleCode, cleanup: simpleCleanup } = useSimpleScanner();

// Variables pour le scanner
const scannerType = ref<'quagga' | 'simple'>('simple') // Scanner simple par défaut
const currentScanning = computed(() => scannerType.value === 'quagga' ? realScanning.value : simpleScanning.value)
const currentScanError = computed(() => scannerType.value === 'quagga' ? realScanError.value : simpleScanError.value)

interface InvoiceBody {
  total: number;
  quantite: number;
  prix_unitaire_fcfa: number;
  prix_vente_vendeur?: number;
  justification?: string;
  nom: string;
  prenom: string;
  telephone: string;
  produit_id: number;
  facture?: number;
}

interface InvoiceBodyPartners {
  quantite: number;
  prix_unitaire_fcfa: number;
  prix_vente_vendeur?: number;
  justification?: string;
  partenaire: number;
  produit_id: number;
  facture?: number;
}

interface InvoiceItem {
  id: number;
  reference: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
  prix_unitaire_fcfa: number;
  prix_vente_vendeur?: number;
  justification?: string;
  prix_achat?: number;
  category?: string;
  ram?: string;
  disque_dur?: string;
  processeur?: string;
  generation?: string;
  carte_graphique?: string;
  systeme_exploitation?: string;
  priceError?: string | null; // Corriger le type
}

interface Invoice {
  number: string;
  date: string;
  recipientType: 'client' | 'partenaire' | '';
  client: {
    id: number;
    nom: string;
    prenom: string;
    telephone: string;
    email?: string;
    adresse?: string;
  };
  partenaire?: string;
  items: InvoiceItem[];
  montantVerse: number;
  taxAmount?: number;
}

// Interface correspondant à la structure de votre API
interface Product {
  id: number;
  reference: string;
  nom: string;
  description: string;
  prix: number;
  prix_achat?: number; // Prix d'achat optionnel
  category?: string;
  quantite?: number;
  actif?: boolean;
  // Champs spécifiques pour les ordinateurs
  ram?: string;
  disque_dur?: string;
  processeur?: string;
  generation?: string;
  carte_graphique?: string;
  systeme_exploitation?: string;
}

interface Partner {
  id?: number;
  nom: string;
  prenom: string;
  telephone: string;
  localisation?: string;
  statut?: string;
  dateadhesion?: string;
  boutique?: string;
}

interface Client {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  email?: string;
  adresse?: string;
  ville?: string;
  entreprise?: number;
  boutique?: number;
  nom_complet?: string;
}

interface Boutique {
  id: number;
  nom: string;
  adresse?: string;
  telephone?: string;
  ville?: string;
  description?: string;
  entreprise?: {
    id: number;
    nom: string;
    adresse?: string;
    ville?: string;
    code_postal?: string;
    pays?: string;
    numero_fiscal?: string;
    telephone?: string;
    site_web?: string;
  };
}

// Interfaces pour les réponses API
interface StockResponse {
  quantite: number;
  id: number;
}

interface FactureResponse {
  id: number;
  numero: string;
}

interface User {
  id: number;
  username: string;
  email?: string;
  role?: string;
  boutique?: {
    id: number;
    nom: string;
  };
  entreprise?: {
    id: number;
    nom: string;
    adresse?: string;
    ville?: string;
    code_postal?: string;
    pays?: string;
    numero_fiscal?: string;
    telephone?: string;
    site_web?: string;
  };
  nom?: string;
  prenom?: string;
}

declare module '@/stores/auth' {
  interface AuthStore {
    user: User | null;
  }
}

// Corriger la déclaration du module jsPDF
declare module 'jspdf' {
  interface jsPDF {
    autoTable: any;
    lastAutoTable: {
      finalY: number;
    };
  }
}

const user = ref<User | null>(null);
const boutique = ref<Boutique | null>(null);

if (process.client) {
  const userData = localStorage.getItem('user');
  const boutiqueData = localStorage.getItem('boutique');
  
  if (userData) {
    user.value = JSON.parse(userData);
    console.log('Utilisateur récupéré:', user.value);
  }
  
  if (boutiqueData) {
    boutique.value = JSON.parse(boutiqueData);
    console.log('Boutique récupérée:', boutique.value);
  }
}

const userId = computed(() => user.value?.id);

// Fonction pour récupérer les données utilisateur et boutique depuis l'API
const fetchUserAndBoutiqueData = async () => {
  try {
    const token = process.client ? localStorage.getItem('access_token') : null;
    if (!token) {
      console.error('Token d\'authentification manquant');
      return;
    }

    // Récupérer l'ID utilisateur depuis le localStorage ou le store
    const currentUser = user.value || (process.client ? JSON.parse(localStorage.getItem('user') || '{}') : {});
    const userId = currentUser.id;
    
    if (!userId) {
      console.error('ID utilisateur non trouvé dans les données locales');
      console.log('Données utilisateur disponibles:', currentUser);
      console.log('Tentative de récupération depuis le store auth...');
      
      // Essayer de récupérer depuis le store auth
      const authStore = useAuthStore();
      if (authStore.user?.id) {
        console.log('ID utilisateur trouvé dans le store auth:', authStore.user.id);
        user.value = authStore.user;
        return;
      }
      
      console.error('Aucun ID utilisateur trouvé nulle part');
      return;
    }
    
    console.log('Récupération des données pour l\'utilisateur ID:', userId);

    // Récupérer les données utilisateur complètes
    const userData = await $fetch<User>(`${API_BASE_URL}/api/users/${userId}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (userData) {
      user.value = userData;
      if (process.client) {
        localStorage.setItem('user', JSON.stringify(userData));
      }
      console.log('Données utilisateur mises à jour:', user.value);
    }

    // Récupérer les données de la boutique de l'utilisateur
    const boutiqueId = userData?.boutique?.id || userData?.boutique;
    if (boutiqueId) {
      const boutiqueData = await $fetch(`${API_BASE_URL}/api/boutiques/${boutiqueId}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (boutiqueData) {
        boutique.value = boutiqueData as Boutique;
        if (process.client) {
          localStorage.setItem('boutique', JSON.stringify(boutiqueData));
        }
        console.log('Données boutique mises à jour:', boutique.value);
      }
    } else {
      console.warn('Aucune boutique associée à l\'utilisateur');
    }
  } catch (err: any) {
    console.error('Erreur lors de la récupération des données:', err);
    console.error('Détails de l\'erreur:', {
      status: err.response?.status,
      statusText: err.response?.statusText,
      url: err.response?.url,
      message: err.message
    });
    
    // Si l'erreur est 404, essayer de récupérer les données depuis le localStorage
    if (err.response?.status === 404) {
      console.log('Endpoint non trouvé, utilisation des données locales');
      if (process.client) {
        const storedUser = localStorage.getItem('user');
        const storedBoutique = localStorage.getItem('boutique');
        
        if (storedUser) {
          try {
            user.value = JSON.parse(storedUser);
            console.log('Utilisateur restauré depuis localStorage:', user.value);
          } catch (e) {
            console.error('Erreur lors de la restauration de l\'utilisateur:', e);
          }
        }
        
        if (storedBoutique) {
          try {
            boutique.value = JSON.parse(storedBoutique);
            console.log('Boutique restaurée depuis localStorage:', boutique.value);
          } catch (e) {
            console.error('Erreur lors de la restauration de la boutique:', e);
          }
        }
      }
    } else if (err.response?.status === 401) {
      console.error('Token expiré ou invalide');
      if (process.client) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        localStorage.removeItem('boutique');
        window.location.href = '/login';
      }
    }
  }
};

// Récupération des produits depuis l'API avec stock par entrepôt
const products = ref<Product[]>([]);
const fetchProducts = async (forceReload: boolean = false) => {
  try {
    const token = process.client ? localStorage.getItem('access_token') : null;
    
    // Invalider le cache si on force le rechargement
    if (forceReload && process.client) {
      const nuxtApp = useNuxtApp();
      if (nuxtApp.$invalidateCacheByPattern) {
        nuxtApp.$invalidateCacheByPattern('/api/produits');
        nuxtApp.$invalidateCacheByPattern('/api/stocks');
        console.log('[fetchProducts] Cache invalidé pour forcer le rechargement');
      }
    }
    
    // Récupérer les produits de l'entreprise avec leurs stocks
    // Ajouter un timestamp pour éviter le cache si forceReload
    const timestamp = forceReload ? `?t=${Date.now()}` : '';
    const produitsUrl = `${API_BASE_URL}/api/produits/${timestamp}`;
    console.log('[fetchProducts] URL produits:', produitsUrl, 'forceReload:', forceReload);
    
    // Vérifier que l'URL est correcte
    if (forceReload && !produitsUrl.includes('?t=')) {
      console.warn('[fetchProducts] ATTENTION: Timestamp non ajouté correctement à l\'URL');
    }
    const data = await $fetch(produitsUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });

    // Récupérer les stocks pour la boutique de l'utilisateur
    const boutiqueId = boutique.value?.id;
    if (!boutiqueId) {
      console.error("Boutique non trouvée");
      return;
    }

    // Ajouter un timestamp pour éviter le cache si forceReload
    const stocksTimestamp = forceReload ? `&t=${Date.now()}` : '';
    const stocksUrl = `${API_BASE_URL}/api/stocks/?entrepot=${boutiqueId}${stocksTimestamp}`;
    const stocksData = await $fetch(stocksUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });

    // Créer un map des stocks par produit
    const stockMap = new Map();
    if (Array.isArray(stocksData)) {
      stocksData.forEach(stock => {
        stockMap.set(stock.produit, stock.quantite);
      });
    }

    // Mappez les données de l'API vers Product avec stock disponible
    products.value = Array.isArray(data)
      ? data.map(p => ({
        id : p.id,
        reference: p.reference,
        nom: p.nom,
        description: p.description,
        prix: p.prix,
        prix_achat: p.prix_achat,
        category: p.category,
        quantite: stockMap.get(p.id) || 0, // Stock disponible dans l'entrepôt
        actif: p.actif,
        ram: p.ram,
        disque_dur: p.disque_dur,
        processeur: p.processeur,
        generation: p.generation,
        carte_graphique: p.carte_graphique,
        systeme_exploitation: p.systeme_exploitation
      })).filter(p => p.quantite > 0) // Filtrer seulement les produits avec stock disponible
      : [];

    console.log(`✅ ${products.value.length} produits avec stock disponible chargés`);
    if (forceReload) {
      console.log('[fetchProducts] Stocks mis à jour après rechargement forcé');
      // Afficher quelques exemples de stocks pour vérification
      if (products.value.length > 0) {
        console.log('[fetchProducts] Exemples de stocks:', products.value.slice(0, 3).map(p => ({ nom: p.nom, stock: p.quantite })));
      }
    }

  } catch (err) {
    console.error("Erreur lors de la récupération des produits:", err);
  }
};

// Récupération des partenaires depuis l'API
const partners = ref<Partner[]>([]);
const clients = ref<Client[]>([]);
const allClients = ref<Client[]>([]); // Tous les clients de l'entreprise
const selectedClient = ref<Client | null>(null);
const isSearchingClient = ref(false);
const clientSearchQuery = ref('');
// Récupération des clients depuis l'API
const fetchClients = async () => {
  try {
    const token = process.client ? localStorage.getItem('access_token') : null;
    
    // Récupérer l'entreprise de l'utilisateur connecté
    const entreprise = process.client ? localStorage.getItem('entreprise') : null;
    let entrepriseId = null;
    if (entreprise) {
      try {
        const entrepriseData = JSON.parse(entreprise);
        entrepriseId = entrepriseData.id;
      } catch (e) {
        console.error('Erreur parsing entreprise:', e);
      }
    }
    
    // Filtrer les clients par entreprise
    const url = entrepriseId 
      ? `${API_BASE_URL}/api/clients/?entreprise=${entrepriseId}`
      : `${API_BASE_URL}/api/clients/`;
    
    const data = await $fetch<Client[]>(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });
    
    clients.value = data;
    allClients.value = data; // Stocker tous les clients pour la recherche locale
    console.log('Clients récupérés (filtrés par entreprise):', data);
  } catch (err) {
    console.error("Erreur lors de la récupération des clients:", err);
  }
};

// Recherche automatique de clients lors de la saisie (recherche locale)
const searchClientAutomatically = () => {
  const nom = invoice.value.client?.nom || '';
  const prenom = invoice.value.client?.prenom || '';
  const telephone = invoice.value.client?.telephone || '';
  
  // Rechercher seulement si on a au moins 2 caractères dans un champ
  if (nom.length < 2 && prenom.length < 2 && telephone.length < 2) {
    clients.value = [];
    return;
  }
  
  // Recherche locale dans les clients déjà chargés
  const clientsTrouves = allClients.value.filter(client => {
    const nomMatch = nom.length >= 2 && client.nom.toLowerCase().includes(nom.toLowerCase());
    const prenomMatch = prenom.length >= 2 && client.prenom.toLowerCase().includes(prenom.toLowerCase());
    const telephoneMatch = telephone.length >= 2 && client.telephone.includes(telephone);
    
    return nomMatch || prenomMatch || telephoneMatch;
  });
  
  clients.value = clientsTrouves;
  console.log('Clients trouvés localement:', clientsTrouves);
};

// Recherche de clients par téléphone
const searchClientByPhone = async (phone: string) => {
  if (!phone || phone.length < 3) return;
  
  try {
    isSearchingClient.value = true;
    const token = process.client ? localStorage.getItem('access_token') : null;
    
    // Récupérer l'entreprise de l'utilisateur connecté
    const entreprise = process.client ? localStorage.getItem('entreprise') : null;
    let entrepriseId = null;
    if (entreprise) {
      try {
        const entrepriseData = JSON.parse(entreprise);
        entrepriseId = entrepriseData.id;
      } catch (e) {
        console.error('Erreur parsing entreprise:', e);
      }
    }
    
    // Filtrer par entreprise dans la recherche par téléphone
    const url = entrepriseId 
      ? `${API_BASE_URL}/api/clients/search_by_phone/?phone=${phone}&entreprise=${entrepriseId}`
      : `${API_BASE_URL}/api/clients/search_by_phone/?phone=${phone}`;
    
    const data = await $fetch<Client[]>(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });
    
    clients.value = data;
    console.log('Clients trouvés (filtrés par entreprise):', data);
  } catch (err) {
    console.error("Erreur lors de la recherche de clients:", err);
  } finally {
    isSearchingClient.value = false;
  }
};

// Création automatique d'un client
const createClient = async (clientData: Partial<Client>) => {
  try {
    const token = process.client ? localStorage.getItem('access_token') : null;
    
    // Validation des données requises
    if (!clientData.nom || !clientData.telephone) {
      throw new Error('Nom et téléphone sont requis');
    }
    
    if (!token) {
      throw new Error('Token d\'authentification manquant');
    }
    
    // Récupérer les données utilisateur si nécessaire
    console.log('Données utilisateur actuelles:', user.value);
    console.log('Données boutique actuelles:', boutique.value);
    
    if (!user.value?.entreprise?.id) {
      console.log('Données entreprise manquantes, tentative de récupération...');
      try {
        await fetchUserAndBoutiqueData();
      } catch (err) {
        console.error('Erreur lors de la récupération des données:', err);
      }
    }
    
    // Si toujours pas d'entreprise, essayer de récupérer depuis le store auth ou utiliser des valeurs par défaut
    let entrepriseId = user.value?.entreprise?.id;
    if (!entrepriseId) {
      console.warn('Aucune entreprise trouvée dans les données utilisateur');
      
      // Essayer de récupérer depuis le store auth
      const authStore = useAuthStore();
      if ((authStore.user as any)?.entreprise?.id) {
        entrepriseId = (authStore.user as any).entreprise.id;
        console.log('Entreprise trouvée dans le store auth:', entrepriseId);
      } else {
        console.warn('Utilisation d\'une entreprise par défaut (ID: 1)');
        entrepriseId = 1;
      }
    }
    
    // Récupérer l'ID de la boutique
    let boutiqueId = boutique.value?.id || user.value?.boutique?.id;
    if (!boutiqueId) {
      console.warn('Aucune boutique trouvée dans les données utilisateur');
      
      // Essayer de récupérer depuis le store auth
      const authStore = useAuthStore();
      if ((authStore.user as any)?.boutique?.id) {
        boutiqueId = (authStore.user as any).boutique.id;
        console.log('Boutique trouvée dans le store auth:', boutiqueId);
      } else {
        console.warn('Utilisation d\'une boutique par défaut (ID: 1)');
        boutiqueId = 1;
      }
    }
    
    console.log('IDs utilisés - Entreprise:', entrepriseId, 'Boutique:', boutiqueId);
    
    const clientPayload = {
      nom: clientData.nom?.trim() || '',
      prenom: clientData.prenom?.trim() || '',
      telephone: clientData.telephone?.trim() || '',
      email: clientData.email?.trim() || '',
      adresse: clientData.adresse?.trim() || '',
      ville: clientData.ville?.trim() || 'Bafoussam',
      boutique: boutiqueId,
      entreprise: entrepriseId,
      actif: true
    };
    
    // Validation des champs requis
    if (!clientPayload.nom || !clientPayload.telephone || !clientPayload.entreprise || !clientPayload.boutique) {
      throw new Error('Champs requis manquants: nom, telephone, entreprise, boutique');
    }
    
    console.log('Données client à envoyer:', clientPayload);
    console.log('Utilisateur connecté:', {
      id: user.value?.id,
      nom: user.value?.nom,
      prenom: user.value?.prenom,
      entreprise: user.value?.entreprise,
      boutique: user.value?.boutique
    });
    console.log('Boutique récupérée:', boutique.value);
    console.log('IDs utilisés - Entreprise:', entrepriseId, 'Boutique:', boutiqueId);
    console.log('Token disponible:', !!token);
    
    const newClient = await $fetch<Client>(`${API_BASE_URL}/api/clients/`, {
      method: 'POST',
      body: clientPayload,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });
    
    console.log('Client créé:', newClient);
    
    // Ajouter le nouveau client à la liste locale
    allClients.value.push(newClient);
    
    return newClient;
    } catch (err: any) {
      console.error("Erreur lors de la création du client:", err);
    
    if (err.response) {
      try {
        const errorData = await err.response.json();
        console.error('Réponse du serveur (JSON):', errorData);
        
        // Si erreur 400, afficher les détails de validation
        if (err.response.status === 400) {
          console.error('Erreur de validation:', errorData);
          throw new Error(`Erreur de validation: ${JSON.stringify(errorData)}`);
        }
        
        // Si erreur 401, le token est probablement expiré
        if (err.response.status === 401) {
          console.error('Token expiré, redirection vers la connexion');
          if (process.client) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            localStorage.removeItem('boutique');
            window.location.href = '/login';
          }
          throw new Error('Token expiré, veuillez vous reconnecter');
        }
        
        // Pour les autres erreurs, continuer avec les valeurs par défaut
        console.warn('Erreur API, utilisation des valeurs par défaut');
        throw new Error(`Erreur serveur ${err.response.status}: ${JSON.stringify(errorData)}`);
        
      } catch (e) {
        const errorText = await err.response.text();
        console.error('Réponse du serveur (texte):', errorText);
        console.error('Status:', err.response.status);
        console.error('StatusText:', err.response.statusText);
        throw new Error(`Erreur serveur ${err.response.status}: ${errorText}`);
      }
    } else {
      console.error('Pas de réponse disponible - erreur de connexion');
      throw new Error('Erreur de connexion au serveur');
    }
  }
};

// Sélection d'un client existant
const selectClient = (client: Client) => {
  selectedClient.value = client;
  invoice.value.client = {
    id: client.id,
    nom: client.nom,
    prenom: client.prenom,
    telephone: client.telephone,
    email: client.email || '',
    adresse: client.adresse || ''
  };
  clientSearchQuery.value = '';
  clients.value = []; // Vider la liste des suggestions
};

// Création automatique d'un client si nécessaire
const handleClientCreation = async () => {
  if (!invoice.value.client?.telephone) return;
  
  // Vérifier si le client existe déjà dans la liste locale
  const existingClient = allClients.value.find(c => c.telephone === invoice.value.client?.telephone);
  
  if (existingClient) {
    selectClient(existingClient);
    return;
  }
  
  // Créer le client automatiquement
  try {
    const newClient = await createClient(invoice.value.client);
    selectClient(newClient);
    success(`Client ${newClient.nom_complet} créé automatiquement`);
  } catch (err) {
    error("Erreur lors de la création du client");
  }
};

const fetchPartners = async () => {
  try {
    const token = process.client ? localStorage.getItem('access_token') : null;
    
    const data = await $fetch(`${API_BASE_URL}/api/partenaires/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });

    // Mappez les données de l'API vers Partner
    partners.value = Array.isArray(data) ? data : [];

  } catch (err) {
    console.error("Erreur lors de la récupération des partenaires:", err);
  }
};

const invoice = ref<Invoice>({
  number: "",
  date: new Date().toISOString().split('T')[0],
  recipientType: '',
  client: {
    id: 0,
    nom: "",
    prenom: "",
    telephone: ""
  },
  partenaire: "",
  items: [],
  montantVerse: 0,
});

// Nouvelles fonctionnalités
const taxRate = ref(0); // Taux de TVA en pourcentage
const discountRate = ref(0); // Remise en pourcentage
const discountAmount = ref(0); // Remise en montant fixe
const paymentMethod = ref('cash'); // Méthode de paiement
const notes = ref(''); // Notes de la facture
const showBarcodeScanner = ref(false);
const barcodeInput = ref('');
const isSubmitting = ref(false); // État de soumission de la facture

const currentProductRef = ref("");
const invoicePreview = ref<HTMLElement | null>(null);

// État pour la recherche de produits
const searchQuery = ref("");
const showProductSearch = ref(false);

// Computed pour filtrer les produits selon la recherche
const filteredProducts = computed(() => {
  if (!searchQuery.value) return [];
  
  const query = searchQuery.value.toLowerCase().trim();
  return products.value.filter(product => 
    product.reference.toLowerCase().includes(query) ||
    product.nom.toLowerCase().includes(query)
  ).slice(0, 5); // Limite à 5 résultats
});


const findProductByReference = (reference: string): Product | undefined => {
  return products.value.find((product) => product.reference === reference);
};

// Recherche par code-barres
const findProductByBarcode = (barcode: string): Product | undefined => {
  return products.value.find((product) => 
    product.reference === barcode || 
    product.id.toString() === barcode
  );
};

// Fonction pour traiter le code-barres scanné
const handleBarcodeScan = async (barcode: string) => {
  console.log('Code-barres scanné:', barcode);
  
  const product = findProductByBarcode(barcode);
  if (product) {
    await selectProduct(product);
    success(`Produit trouvé: ${product.nom}`);
  } else {
    error(`Produit non trouvé pour le code: ${barcode}`);
  }
  
  // Réinitialiser le scanner
  scannedCode.value = '';
  showBarcodeScanner.value = false;
};

// Fonction pour simuler un scan (pour les tests)
const simulateBarcodeScan = () => {
  if (barcodeInput.value) {
    handleBarcodeScan(barcodeInput.value);
    barcodeInput.value = '';
  }
};

// Fonction pour démarrer le scan
const startBarcodeScan = () => {
  showBarcodeScanner.value = true;
  startScan();
};

// Fonction pour arrêter le scan
const stopBarcodeScan = () => {
  showBarcodeScanner.value = false;
  stopScan();
};

// Sélection d'un produit depuis la liste de recherche
const selectProduct = async (product: Product) => {
  try {
    const token = process.client ? localStorage.getItem('access_token') : null;
    const boutiqueId = boutique.value?.id;
    
    if (!boutiqueId) {
      alert("Boutique non trouvée");
      return;
    }
    
    // Vérifier le stock disponible dans l'entrepôt (forcer le rechargement sans cache)
    const timestamp = `&t=${Date.now()}`;
    const stockData = await $fetch(`${API_BASE_URL}/api/stocks/?entrepot=${boutiqueId}&produit=${product.id}${timestamp}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });

    const stockDisponible = Array.isArray(stockData) && stockData.length > 0 ? stockData[0].quantite : 0;

    if (stockDisponible < 1) {
      alert(`Stock insuffisant pour ${product.nom}. Stock disponible: ${stockDisponible}`);
      return;
    }
    
    // Mettre à jour le stock dans la liste locale des produits
    const productIndex = products.value.findIndex(p => p.id === product.id);
    if (productIndex !== -1) {
      products.value[productIndex].quantite = stockDisponible;
      console.log(`[selectProduct] Stock mis à jour pour ${product.nom}: ${stockDisponible}`);
    }

    invoice.value.items.push({
      id: product.id,
      reference: product.reference,
      name: product.nom,
      description: product.description,
      quantity: 1,
      price: product.prix,
      prix_unitaire_fcfa: product.prix,
      prix_vente_vendeur: product.prix,
      prix_achat: product.prix_achat,
      justification: "",
      category: product.category,
      ram: product.ram,
      disque_dur: product.disque_dur,
      processeur: product.processeur,
      generation: product.generation,
      carte_graphique: product.carte_graphique,
      systeme_exploitation: product.systeme_exploitation
    });
    
    searchQuery.value = "";
    showProductSearch.value = false;
  } catch (err) {
    console.error("Erreur lors de la vérification du stock:", err);
    alert("Erreur lors de la vérification du stock");
  }
};

const removeItem = (index: number) => {
  invoice.value.items.splice(index, 1);
};

// Calculs avec taxes et remises
const invoiceTotals = computed(() => {
  return calculateTotals(invoice.value.items, taxRate.value, discountRate.value, discountAmount.value);
});

const subtotal = computed(() => invoiceTotals.value.subtotal);
const taxAmount = computed(() => invoiceTotals.value.taxAmount);
const totalDiscount = computed(() => invoiceTotals.value.totalDiscount);
const total = computed(() => invoiceTotals.value.total);

// Calcul du montant restant à payer
const reste = computed(() => {
  return total.value - invoice.value.montantVerse;
});

// Calcul de la marge totale
const totalMargin = computed(() => {
  const totalCost = invoice.value.items.reduce((sum, item) => {
    const costPrice = item.prix_achat || 0;
    return sum + (costPrice * item.quantity);
  }, 0);
  
  const totalRevenue = subtotal.value;
  
  if (totalCost === 0) return 0;
  return ((totalRevenue - totalCost) / totalCost) * 100;
});


const printInvoice = () => {
  const printContents = invoicePreview.value?.innerHTML;
  const originalContents = document.body.innerHTML;

  document.body.innerHTML = printContents || "";
  window.print();
  document.body.innerHTML = originalContents;
};

// Sauvegarde automatique avec expiration (1h)
const autoSaveInvoice = () => {
  saveWithExpiration('invoice-draft', invoice.value, 1)
}

// Charger les données sauvegardées au montage
onMounted(async () => {
  // Programmer le nettoyage automatique
  scheduleCleanup()
  
  // Charger les données sauvegardées avec vérification d'expiration
  const savedInvoice = loadWithExpiration('invoice-draft')
  if (savedInvoice && Object.keys(savedInvoice).length > 0) {
    invoice.value = { ...invoice.value, ...savedInvoice }
    
    // Vérifier l'avertissement d'expiration (silencieux)
    const warning = checkExpirationWarning('invoice-draft', 0.5) // 30 minutes avant expiration
    if (warning) {
      console.log(`Données restaurées - Expire dans ${warning.hoursLeft}h ${warning.minutesLeft}m`)
    } else {
      console.log('Données de facture restaurées depuis la sauvegarde automatique')
    }
  } else {
    invoice.value.number = generateInvoiceNumber()
  }

  // Vérifier et récupérer les données utilisateur si nécessaire
  console.log('Vérification des données utilisateur au montage...');
  console.log('Utilisateur:', user.value);
  console.log('Boutique:', boutique.value);
  
  if (!user.value?.entreprise?.id || (!boutique.value?.id && !user.value?.boutique?.id)) {
    console.log('Données utilisateur incomplètes, récupération depuis l\'API...');
    await fetchUserAndBoutiqueData();
    
    // Vérifier à nouveau après récupération
    if (!user.value?.entreprise?.id) {
      console.error('Impossible de récupérer les données entreprise');
    }
    if (!boutique.value?.id && !user.value?.boutique?.id) {
      console.error('Impossible de récupérer les données boutique');
    }
  }

  // Chargement des données depuis les API
  await Promise.all([fetchProducts(), fetchPartners(), fetchClients()])

  // Démarrer le scanner simple (plus rapide)
  await startSimpleScanner()

  // Écouter les événements de scan
  if (process.client) {
    window.addEventListener('barcode-scanned', handleBarcodeScanned)
  }
})

// Nettoyer les événements au démontage
onUnmounted(() => {
  cleanup()
  realCleanup()
  simpleCleanup()
  if (process.client) {
    window.removeEventListener('barcode-scanned', handleBarcodeScanned)
  }
})

// Fonction pour gérer les codes scannés en arrière-plan
const handleBarcodeScanned = (event: any) => {
  const code = event.detail.code
  handleBarcodeScan(code)
}

// Watcher pour la sauvegarde automatique avec debounce
let saveTimeout: NodeJS.Timeout
watch(invoice, () => {
  clearTimeout(saveTimeout)
  saveTimeout = setTimeout(() => {
    autoSaveInvoice()
  }, 2000) // Sauvegarde après 2 secondes d'inactivité
}, { deep: true })

// Fonction pour effacer la sauvegarde après enregistrement réussi
const clearDraft = () => {
  clearFromLocalStorage('invoice-draft')
}

// Constantes pour la facture (données dynamiques basées sur l'entreprise connectée)
const COMPANY_INFO = computed(() => {
  const entrepriseNom = boutique.value?.entreprise?.nom || user.value?.entreprise?.nom || 'Entreprise';
  const boutiqueAdresse = boutique.value?.adresse || 'Adresse non disponible';
  const entrepriseNUI = boutique.value?.entreprise?.numero_fiscal || user.value?.entreprise?.numero_fiscal || '';
  const boutiqueTelephone = boutique.value?.telephone || '';
  const entrepriseSite = boutique.value?.entreprise?.site_web || user.value?.entreprise?.site_web || '';
  
  return {
    name: entrepriseNom,
    description: boutique.value?.description || 'Vente de produits et services',
    address: boutiqueAdresse,
    nui: entrepriseNUI,
    phones: boutiqueTelephone ? [boutiqueTelephone] : [],
    site: entrepriseSite,
    notice: "Les Marchandises vendues ne sont ni reprises ni échangées",
    warranty: "Garantie Produit – Service Après-Vente\nCe produit est couvert par une garantie de 6 mois à compter de la date d'achat figurant sur cette facture.\nEn cas de dysfonctionnement non causé par une mauvaise utilisation, vous pouvez bénéficier d'un service après-vente en présentant cette facture.\n\n Cette garantie couvre uniquement les défauts de fabrication et ne s'applique pas aux dommages physiques ou à l'usure normale.\n\nPour toute demande de prise en charge, contactez notre service client."
  };
});

// Fonction pour générer le PDF (améliorée)
// Fonction de génération PDF adaptée aux imprimantes thermiques
const generatePDF = async () => {
  try {
    // Créer un document PDF adapté aux imprimantes thermiques (58mm = ~164 points)
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [58, 200] // Format 58mm de largeur, hauteur variable
    });
    
    // Configuration pour les imprimantes thermiques
    const pageWidth = 58;
    const margin = 2;
    const contentWidth = pageWidth - (margin * 2);
    
    // Fonction pour centrer le texte
    const centerText = (text: string, y: number, fontSize: number = 10) => {
      doc.setFontSize(fontSize);
      const textWidth = doc.getTextWidth(text);
      const x = (pageWidth - textWidth) / 2;
      doc.text(text, x, y);
    };
    
    // Fonction pour dessiner une ligne de séparation
    const drawLine = (y: number) => {
      doc.line(margin, y, pageWidth - margin, y);
    };
    
    let currentY = 5;
    
    // Logo de l'entreprise (si disponible) - chargement synchrone pour éviter les problèmes
    try {
      const logoUrl = '/img/logo.jpg';
      const response = await fetch(logoUrl);
      if (response.ok) {
        const blob = await response.blob();
        const reader = new FileReader();
        
        // Attendre que le logo soit chargé avant de continuer
        await new Promise<void>((resolve, reject) => {
          reader.onload = () => {
            const img = new Image();
            img.onload = () => {
              try {
                const logoWidth = 12;
                const logoHeight = 8;
                const logoX = (pageWidth - logoWidth) / 2;
                doc.addImage(img, 'JPEG', logoX, currentY, logoWidth, logoHeight);
                currentY += logoHeight + 2;
                resolve();
              } catch (err) {
                console.log('Erreur ajout logo au PDF:', err);
                resolve(); // Continuer même si le logo échoue
              }
            };
            img.onerror = () => resolve(); // Continuer sans logo
            img.src = reader.result as string;
          };
          reader.onerror = () => resolve(); // Continuer sans logo
          reader.readAsDataURL(blob);
        });
      } else {
        console.log('Logo non disponible, génération sans logo');
      }
    } catch (logoError) {
      console.log('Erreur lors du chargement du logo:', logoError);
      // Continuer sans logo
    }
    
    // En-tête de la facture
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    centerText('FACTURE', currentY, 14);
    currentY += 8;
    
    // Informations de l'entreprise (récupérées depuis les données connectées)
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    // Nom de l'entreprise - récupérer depuis plusieurs sources
    let entrepriseNom = '';
    
    // 1. Essayer depuis la boutique
    if (boutique.value?.entreprise?.nom) {
      entrepriseNom = boutique.value.entreprise.nom;
    }
    // 2. Essayer depuis l'utilisateur
    else if (user.value?.entreprise?.nom) {
      entrepriseNom = user.value.entreprise.nom;
    }
    // 3. Essayer depuis localStorage
    else if (process.client) {
      try {
        const entrepriseData = localStorage.getItem('entreprise');
        if (entrepriseData) {
          const entreprise = JSON.parse(entrepriseData);
          if (entreprise?.nom) {
            entrepriseNom = entreprise.nom;
          }
        }
      } catch (e) {
        console.error('Erreur parsing entreprise depuis localStorage:', e);
      }
    }
    
    // Si toujours pas de nom, utiliser le nom de la boutique comme fallback
    if (!entrepriseNom && boutique.value?.nom) {
      entrepriseNom = boutique.value.nom;
    }
    
    // Afficher le nom de l'entreprise (ne jamais afficher "Entreprise" par défaut)
    if (entrepriseNom) {
      centerText(entrepriseNom, currentY, 9);
      currentY += 4;
    }
    
    // Construction de l'adresse complète
    const adresseParts = [];
    
    // Adresse de la boutique (priorité)
    if (boutique.value?.adresse) {
      adresseParts.push(boutique.value.adresse);
    }
    // Sinon adresse de l'entreprise
    else if (boutique.value?.entreprise?.adresse || user.value?.entreprise?.adresse) {
      adresseParts.push(boutique.value?.entreprise?.adresse || user.value?.entreprise?.adresse);
    }
    
    // Code postal
    if (boutique.value?.entreprise?.code_postal || user.value?.entreprise?.code_postal) {
      adresseParts.push(boutique.value?.entreprise?.code_postal || user.value?.entreprise?.code_postal);
    }
    
    // Ville
    if (boutique.value?.ville || boutique.value?.entreprise?.ville || user.value?.entreprise?.ville) {
      adresseParts.push(boutique.value?.ville || boutique.value?.entreprise?.ville || user.value?.entreprise?.ville);
    }
    
    // Pays
    if (boutique.value?.entreprise?.pays || user.value?.entreprise?.pays) {
      const pays = boutique.value?.entreprise?.pays || user.value?.entreprise?.pays;
      if (pays && pays !== 'Cameroun') { // Ne pas afficher Cameroun par défaut
        adresseParts.push(pays);
      }
    }
    
    // Afficher l'adresse complète
    if (adresseParts.length > 0) {
      const adresseComplete = adresseParts.join(', ');
      centerText(adresseComplete, currentY, 9);
      currentY += 4;
    }
    
    // NUI de l'entreprise (si disponible)
    const entrepriseNUI = boutique.value?.entreprise?.numero_fiscal || user.value?.entreprise?.numero_fiscal || '';
    if (entrepriseNUI) {
      centerText(`NUI: ${entrepriseNUI}`, currentY, 9);
      currentY += 4;
    }
    
    // Téléphone de la boutique (priorité) ou entreprise
    const telephone = boutique.value?.telephone || boutique.value?.entreprise?.telephone || user.value?.entreprise?.telephone || '';
    if (telephone) {
      centerText(`Tel: ${telephone}`, currentY, 9);
      currentY += 4;
    }
    
    currentY += 2;
    
    drawLine(currentY);
    currentY += 3;
    
    // Informations de la facture
    doc.setFontSize(8);
    doc.text(`Facture N°: ${invoice.value.number || 'AUTO'}`, margin, currentY);
    currentY += 4;
    doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, margin, currentY);
    currentY += 4;
    doc.text(`Boutique: ${boutique.value?.nom || 'N/A'}`, margin, currentY);
    currentY += 6;
    
    drawLine(currentY);
    currentY += 4;
    
    // Informations du client/partenaire
    if (invoice.value.recipientType === 'client' && invoice.value.client) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('CLIENT:', margin, currentY);
      currentY += 4;
      doc.setFont('helvetica', 'normal');
      doc.text(`${invoice.value.client.prenom} ${invoice.value.client.nom}`, margin, currentY);
      currentY += 4;
      doc.text(`Tel: ${invoice.value.client.telephone}`, margin, currentY);
      currentY += 6;
    } else if (invoice.value.recipientType === 'partenaire') {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('PARTENAIRE:', margin, currentY);
      currentY += 4;
      doc.setFont('helvetica', 'normal');
      doc.text(invoice.value.partenaire || 'N/A', margin, currentY);
      currentY += 6;
    }
    
    drawLine(currentY);
    currentY += 3;
    
    // Tableau des produits (format optimisé)
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    
    // En-tête du tableau optimisé - colonnes décalées pour plus d'espace référence
    doc.text('REF', margin, currentY);
    doc.text('PRODUIT', margin + 10, currentY);
    doc.text('Q', margin + 25, currentY);
    doc.text('PRIX', margin + 30, currentY);
    doc.text('TOTAL', margin + 45, currentY);
    currentY += 3;
    
    drawLine(currentY);
    currentY += 3;
    
    // Produits - Vérifier que les items existent
    if (!invoice.value.items || invoice.value.items.length === 0) {
      console.error('Aucun produit dans la facture');
      error('Aucun produit dans la facture. Impossible de générer le PDF.');
      return false;
    }
    
    doc.setFont('helvetica', 'normal');
    invoice.value.items.forEach(item => {
      // Nom du produit (tronqué si trop long)
      const productName = (item.name || '').length > 10 ? (item.name || '').substring(0, 10) + '..' : (item.name || '');
      
      // S'assurer que les prix sont des nombres
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 0;
      const total = price * quantity;
      
      // Référence (plus d'espace, moins de troncature)
      const ref = (item.reference || 'N/A').length > 8 ? (item.reference || 'N/A').substring(0, 8) : (item.reference || 'N/A');
      
      // Ajuster les positions: plus d'espace pour référence, colonnes décalées
      doc.setFontSize(7); // Réduire la taille de police
      doc.text(ref, margin, currentY);
      doc.text(productName, margin + 10, currentY);
      doc.text(quantity.toString(), margin + 25, currentY);
      doc.text(`${price.toFixed(0)}`, margin + 30, currentY);
      doc.text(`${total.toFixed(0)}`, margin + 45, currentY);
      currentY += 3;
    });
    
    currentY += 3;
    drawLine(currentY);
    currentY += 3;
    
    // Totaux (optimisés)
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    
    // Sous-total
    doc.text('SOUS-TOTAL:', margin, currentY);
    doc.text(`${subtotal.value.toFixed(0)} FCFA`, margin + 30, currentY);
    currentY += 3;
    
    // Remise
    if (totalDiscount.value > 0) {
      doc.text('REMISE:', margin, currentY);
      doc.text(`-${totalDiscount.value.toFixed(0)} FCFA`, margin + 30, currentY);
      currentY += 3;
    }
    
    // TVA
    if (taxAmount.value > 0) {
      doc.text(`TVA (${taxRate.value}%):`, margin, currentY);
      doc.text(`${taxAmount.value.toFixed(0)} FCFA`, margin + 30, currentY);
      currentY += 3;
    }
    
    // Ligne de séparation avant le total
    drawLine(currentY);
    currentY += 3;
    
    // TOTAL
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL:', margin, currentY);
    doc.text(`${total.value.toFixed(0)} FCFA`, margin + 25, currentY);
    currentY += 4;
    
    drawLine(currentY);
    currentY += 4;
    
    // Informations de paiement (optimisées)
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Versé: ${invoice.value.montantVerse?.toFixed(0) || '0'} FCFA`, margin, currentY);
    currentY += 3;
    doc.text(`Reste: ${reste.value.toFixed(0)} FCFA`, margin, currentY);
    currentY += 3;
    doc.text(`Méthode: ${paymentMethod.value || 'Espèces'}`, margin, currentY);
    currentY += 4;
    
    // Notes (si présentes)
    if (notes.value) {
      drawLine(currentY);
      currentY += 3;
      doc.setFontSize(7);
      doc.text('NOTES:', margin, currentY);
      currentY += 3;
      
      // Diviser les notes en plusieurs lignes si nécessaire
      const words = notes.value.split(' ');
      let line = '';
      words.forEach(word => {
        if (doc.getTextWidth(line + word + ' ') < contentWidth) {
          line += word + ' ';
        } else {
          doc.text(line.trim(), margin, currentY);
          currentY += 3;
          line = word + ' ';
        }
      });
      if (line.trim()) {
        doc.text(line.trim(), margin, currentY);
        currentY += 3;
      }
    }
    
    currentY += 4;
    drawLine(currentY);
    currentY += 4;
    
    // Pied de page (optimisé)
    doc.setFontSize(7);
    centerText('Merci pour votre achat !', currentY, 7);
    currentY += 3;
    
    // Site web de l'entreprise (si disponible)
    const entrepriseSite = boutique.value?.entreprise?.site_web || user.value?.entreprise?.site_web || '';
    if (entrepriseSite) {
      centerText(entrepriseSite, currentY, 7);
      currentY += 3;
    }
    
    // Service client avec le téléphone de la boutique
    const serviceClientTel = boutique.value?.telephone || boutique.value?.entreprise?.telephone || user.value?.entreprise?.telephone || '';
    if (serviceClientTel) {
      centerText(`Service: ${serviceClientTel}`, currentY, 7);
      currentY += 4;
    }
    
    // Signature "by mura storage" avec une belle police
    doc.setFontSize(6);
    doc.setFont('helvetica', 'italic');
    centerText('by mura storage', currentY, 6);
    
    // Sauvegarder le PDF
    const fileName = `facture_${invoice.value.number || 'AUTO'}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    success('Facture PDF générée avec succès !');
    return true;
    
  } catch (err) {
    console.error('Erreur lors de la génération du PDF:', err);
    error('Erreur lors de la génération du PDF');
    return false;
  }
};

// Fonction pour convertir un nombre en lettres
const numberToWords = (number: number): string => {
  // Cette fonction devrait être implémentée pour convertir les nombres en lettres
  // Pour l'instant, retourne une chaîne simple
  return number.toString();
};

// Fonction pour valider le prix de vente et mettre à jour les totaux
const validatePrice = (item: InvoiceItem) => {
  const prixAchat = item.prix_achat || 0;
  const prixVente = item.price;
  
  const validation = validateSellingPrice(prixVente, prixAchat, 5); // Marge minimale de 5%
  
  if (!validation.isValid) {
    item.priceError = `Le prix de vente doit être au moins ${formatCurrency(validation.minPrice)} FCFA (marge: ${validation.margin.toFixed(1)}%)`;
    return false;
  } else {
    item.priceError = undefined;
    // Mettre à jour prix_vente_vendeur quand le prix est valide
    item.prix_vente_vendeur = item.price;
    return true;
  }
};

// Ajouter la fonction getPriceValidationClass manquante
const getPriceValidationClass = (item: InvoiceItem) => {
  if (item.priceError) {
    return 'border-red-500 bg-red-50';
  }
  return '';
};

// Modification de la fonction d'ajout d'article
const addItem = () => {
  const product = findProductByReference(currentProductRef.value);
  if (!product) {
    error("Produit non trouvé");
    return;
  }

  const existingItem = invoice.value.items.find(item => item.reference === product.reference);
  if (existingItem) {
    existingItem.quantity++;
  } else {
    invoice.value.items.push({
      id: product.id,
      reference: product.reference,
      name: product.nom,
      description: product.description,
      quantity: 1,
      price: product.prix,
      prix_unitaire_fcfa: product.prix,
      prix_vente_vendeur: product.prix,
    
      prix_achat: product.prix_achat,
      justification: "",
      category: product.category,
      ram: product.ram,
      disque_dur: product.disque_dur,
      processeur: product.processeur,
      generation: product.generation,
      carte_graphique: product.carte_graphique,
      systeme_exploitation: product.systeme_exploitation
    });
  }
  currentProductRef.value = "";
};

// Corriger la fonction submitInvoice
const submitInvoice = async () => {
  if (isSubmitting.value) return; // Empêcher les soumissions multiples
  
  try {
    isSubmitting.value = true; // Activer l'état de soumission
    
    // Récupérer le token d'authentification
    const token = process.client ? localStorage.getItem('access_token') : null;
    
    // Validation des prix
    for (const item of invoice.value.items) {
      if (!validatePrice(item)) {
        return;
      }
    }

    // Utiliser l'ID de l'utilisateur connecté pour created_by
    const userIdValue = userId.value; // Extraire la valeur du computed ref
    if (!userIdValue) { // Vérifier si l'utilisateur est connecté
        error("Utilisateur non connecté.");
        return;
    }

    if (invoice.value.items.length === 0) {
      error("Veuillez ajouter au moins un article");
      return;
    }

    if (!invoice.value.recipientType) {
      error("Veuillez sélectionner un type de destinataire");
      return;
    }

    // Vérifier le stock pour tous les articles avant de procéder
    for (const item of invoice.value.items) {
      const stockData = await $fetch(`${API_BASE_URL}/api/stocks/?entrepot=${boutique.value?.id}&produit=${item.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      const stockDisponible = Array.isArray(stockData) && stockData.length > 0 ? stockData[0].quantite : 0;

      if (stockDisponible < item.quantity) {
        error(`Stock insuffisant pour ${item.name}: ${stockDisponible} disponible(s), ${item.quantity} demandé(s)`);
        return;
      }
    }

    // Validation des champs requis
    console.log('Validation - Utilisateur:', user.value);
    console.log('Validation - Boutique:', boutique.value);
    
    if (!boutique.value?.id) {
      console.log('Tentative de récupération des données depuis l\'API...');
      await fetchUserAndBoutiqueData();
      
      if (!boutique.value?.id) {
        error("Boutique non trouvée. Veuillez vous reconnecter ou contacter l'administrateur.");
        return;
      }
    }

    // Le numéro de facture sera généré automatiquement par le backend
    // Plus besoin de validation du champ number

    // Gestion des clients et partenaires
    let clientId = null;
    let partenaireId = null;
    
    if (invoice.value.recipientType === 'client') {
      // Vérifier si le client existe déjà dans la liste locale
      const existingClient = allClients.value.find(c => c.telephone === invoice.value.client?.telephone);
      
      if (existingClient) {
        clientId = existingClient.id;
        console.log('Client existant trouvé:', existingClient);
      } else {
        // Créer le client seulement lors de la soumission de la facture
        if (!invoice.value.client?.nom || !invoice.value.client?.telephone) {
          error("Nom et téléphone du client sont requis");
          return;
        }
        
        try {
          console.log('Création du client lors de la soumission...');
          const newClient = await createClient(invoice.value.client);
          clientId = newClient.id;
          console.log('Client créé lors de la soumission:', newClient);
        } catch (err: any) {
          console.error('Erreur lors de la création du client:', err);
          error("Erreur lors de la création du client");
          return;
        }
      }
    } else if (invoice.value.recipientType === 'partenaire') {
      // Trouver l'ID du partenaire sélectionné
      const selectedPartner = partners.value.find(p => 
        `${p.prenom} ${p.nom}` === invoice.value.partenaire
      );
      if (selectedPartner) {
        partenaireId = selectedPartner.id;
      }
    }
    
    // S'assurer que les valeurs numériques sont valides
    const totalValue = Number(total.value) || 0;
    const resteValue = Number(reste.value) || 0;
    
    // Validation des valeurs
    if (isNaN(totalValue) || totalValue < 0) {
      error('Le total de la facture est invalide');
      return;
    }
    
    if (isNaN(resteValue) || resteValue < 0) {
      error('Le reste à payer est invalide');
      return;
    }
    
    // Déterminer le statut selon le reste
    let statusValue = 'En attente';
    if (resteValue === 0) {
      statusValue = 'Payé';
    } else if (resteValue < totalValue) {
      statusValue = 'Partiellement payé';
    }
    
    // Vérifier que la boutique et l'utilisateur sont valides
    if (!boutique.value?.id) {
      error('Boutique invalide. Veuillez vous reconnecter.');
      return;
    }
    
    if (!userIdValue) {
      error('Utilisateur invalide. Veuillez vous reconnecter.');
      return;
    }
    
    // Vérifier que client ou partenaire est défini selon le type
    if (invoice.value.recipientType === 'client' && !clientId) {
      error('Client requis pour une facture client');
      return;
    }
    
    if (invoice.value.recipientType === 'partenaire' && !partenaireId) {
      error('Partenaire requis pour une facture partenaire');
      return;
    }
    
    const factureData = {
      type: invoice.value.recipientType,
      total: totalValue,
      reste: resteValue,
      status: statusValue,
      boutique: boutique.value.id,
      created_by: userIdValue,
      // Ajouter les IDs du client ou partenaire selon le type
      ...(invoice.value.recipientType === 'client' && clientId && { client: clientId }),
      ...(invoice.value.recipientType === 'partenaire' && partenaireId && { partenaire: partenaireId })
    };

    console.log('Données de facture envoyées:', factureData);
    console.log('Validation - Boutique ID:', boutique.value.id);
    console.log('Validation - User ID:', userIdValue);
    console.log('Validation - Client ID:', clientId);
    console.log('Validation - Partenaire ID:', partenaireId);

    let facture: FactureResponse | null = null;
    
    try {
      facture = await $fetch<FactureResponse>(`${API_BASE_URL}/api/factures/`, {
        method: 'POST',
        body: factureData,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
    } catch (err: any) {
      console.error('Erreur détaillée:', err);
      console.error('Type d\'erreur:', typeof err);
      console.error('Erreur data:', err.data);
      console.error('Erreur message:', err.message);
      console.error('Erreur status:', err.status || err.statusCode);
      console.error('Erreur response:', err.response);
      
      // Gérer l'erreur - $fetch met généralement les données dans err.data
      let errorMessage = 'Erreur lors de la création de la facture';
      let errorData: any = null;
      
      // Avec $fetch de Nuxt, les erreurs sont généralement dans err.data
      if (err.data) {
        errorData = err.data;
        console.error('Détails de l\'erreur du serveur (err.data):', errorData);
      } else if (err.response?.data) {
        errorData = err.response.data;
        console.error('Détails de l\'erreur du serveur (err.response.data):', errorData);
      } else if (err.message) {
        errorMessage = `Erreur: ${err.message}`;
      }
      
      // Extraire le message d'erreur
      if (errorData) {
        if (typeof errorData === 'string') {
          errorMessage = `Erreur serveur: ${errorData}`;
        } else if (errorData.detail) {
          errorMessage = `Erreur serveur: ${errorData.detail}`;
        } else if (errorData.message) {
          errorMessage = `Erreur serveur: ${errorData.message}`;
        } else if (errorData.non_field_errors) {
          errorMessage = `Erreur: ${Array.isArray(errorData.non_field_errors) ? errorData.non_field_errors.join(', ') : errorData.non_field_errors}`;
        } else {
          // Afficher toutes les erreurs de validation
          const validationErrors = Object.entries(errorData)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join('; ');
          errorMessage = `Erreur de validation: ${validationErrors || JSON.stringify(errorData)}`;
        }
      }
      
      error(errorMessage);
      console.error('Données envoyées qui ont causé l\'erreur:', factureData);
      isSubmitting.value = false; // Réinitialiser l'état de soumission
      return; // Arrêter l'exécution en cas d'erreur
    }

    if (!facture?.id) {
      error("Erreur lors de la création de la facture");
      console.error("Détails:", facture);
      return;
    }

    // Mettre à jour le numéro de facture avec celui retourné par le backend
    invoice.value.number = facture.numero;
    console.log('Numéro de facture généré:', facture.numero);
    
    // Annuler le cache après création de facture
    if (process.client) {
      const nuxtApp = useNuxtApp()
      if (nuxtApp.$invalidateCacheByPattern) {
        nuxtApp.$invalidateCacheByPattern('/api/factures')
        nuxtApp.$invalidateCacheByPattern('/api/commandes-client')
        nuxtApp.$invalidateCacheByPattern('/api/commandes-partenaire')
        nuxtApp.$invalidateCacheByPattern('/api/stocks')
        nuxtApp.$invalidateCacheByPattern('/api/produits')
        nuxtApp.$invalidateCacheByPattern('/api/mouvements-stock')
        console.log('[Cache] Cache invalidé après création de facture')
      }
      // Invalider aussi via useApi si disponible
      try {
        const { useApi } = await import('@/stores/useApi')
        // useApi invalide automatiquement lors des appels POST/PUT/DELETE
      } catch {}
    }

    if (invoice.value.recipientType === 'client') {
      const endpoint = `${API_BASE_URL}/api/commandes-client/`;
      let isSuccess = true;

      for (const item of invoice.value.items) {
        // Créer la commande client
        const commandeData = {
          facture: facture.id,
          produit: item.id,
          quantite: item.quantity,
          prix_unitaire_fcfa: item.price,
          prix_initial_fcfa: item.prix_achat || item.price,
          justification_prix: item.justification || ''
        };

        console.log('Données commande à envoyer:', commandeData);
        console.log('Item complet:', item);

        try {
          // Enregistrer la commande
          const commandeResponse = await $fetch(endpoint, {
            method: 'POST',
            body: commandeData,
            headers: {
              'Content-Type': 'application/json',
              ...(token && { 'Authorization': `Bearer ${token}` })
            }
          });

          // Mettre à jour le stock dans l'entrepôt
          const stockData = await $fetch(`${API_BASE_URL}/api/stocks/?entrepot=${boutique.value?.id}&produit=${item.id}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              ...(token && { 'Authorization': `Bearer ${token}` })
            }
          });

          if (Array.isArray(stockData) && stockData.length > 0) {
            const stock = stockData[0];
            const nouveauStock = stock.quantite - item.quantity;
            
            // Mettre à jour le stock
            await $fetch(`${API_BASE_URL}/api/stocks/${stock.id}/`, {
              method: 'PATCH',
              body: { quantite: nouveauStock },
              headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
              }
            });

            // Créer un mouvement de stock pour tracer la sortie
            await $fetch(`${API_BASE_URL}/api/mouvements-stock/`, {
              method: 'POST',
              body: {
                produit: item.id,
                entrepot: boutique.value.id,
                type_mouvement: 'sortie',
                quantite: item.quantity,
                quantite_avant: stock.quantite,
                quantite_apres: nouveauStock,
                motif: `Vente - Facture ${facture.numero}`,
                reference_document: facture.numero
              },
              headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
              }
            });
          }

        } catch (err: any) {
          console.error(`Erreur pour l'article ${item.id}:`, err);
          console.error('Données envoyées:', commandeData);
          
          // Gérer l'erreur sans lire le body deux fois
          if (err.data) {
            console.error('Détails de l\'erreur du serveur (err.data):', err.data);
          } else if (err.response?.data) {
            console.error('Détails de l\'erreur du serveur (err.response.data):', err.response.data);
          } else if (err.response) {
            try {
              // Lire le body une seule fois
              const contentType = err.response.headers?.get('content-type') || '';
              if (contentType.includes('application/json')) {
                const errorData = await err.response.json();
                console.error('Détails de l\'erreur du serveur:', errorData);
              } else {
                const errorText = await err.response.text();
                console.error('Réponse du serveur (texte):', errorText);
              }
            } catch (readErr) {
              console.error('Impossible de lire la réponse d\'erreur:', readErr);
            }
          }
          
          isSuccess = false;
          break;
        }
      }

    if (isSuccess) {
        // Générer le PDF
      const pdfGenerated = await generatePDF();
      if (pdfGenerated) {
          success(`Facture client ${invoice.value.number} enregistrée et téléchargée`);
          // Effacer la sauvegarde automatique
          clearDraft()
      } else {
        error("Erreur lors de la génération du PDF");
      }
      
      // IMPORTANT: Recharger les produits pour mettre à jour les stocks (forcer le rechargement sans cache)
      console.log('[Facture] Rechargement des produits après création de facture...');
      try {
        // Attendre un peu pour que le backend mette à jour les stocks
        await new Promise(resolve => setTimeout(resolve, 300));
        await fetchProducts(true); // true = forceReload pour éviter le cache
        console.log('[Facture] Produits rechargés avec succès, stocks mis à jour');
        
        // Forcer la réactivité de Vue en recréant la liste
        const updatedProducts = [...products.value];
        products.value = [];
        await nextTick();
        products.value = updatedProducts;
        console.log('[Facture] Liste des produits mise à jour pour la réactivité');
      } catch (err) {
        console.error('[Facture] Erreur lors du rechargement des produits:', err);
      }
      
      // Réinitialiser le formulaire
      invoice.value = {
        number: generateInvoiceNumber(),
        date: new Date().toISOString().split("T")[0],
        recipientType: "",
        client: { id: 0, nom: "", prenom: "", telephone: "" },
        partenaire: "",
        items: [],
        montantVerse: 0,
      };
      
      // Réinitialiser l'état de soumission
      isSubmitting.value = false;
      
      // Actualiser la page après un court délai pour s'assurer que tout est à jour
      if (process.client) {
        console.log('[Facture] Planification du rechargement de la page dans 1.5 secondes...');
        setTimeout(() => {
          console.log('[Facture] Rechargement de la page maintenant...');
          // Utiliser window.location.href pour forcer un rechargement complet
          window.location.href = window.location.href;
        }, 1500); // Attendre 1.5 secondes pour que l'utilisateur voie le message de succès
      }
      } else {
        // En cas d'échec, réinitialiser aussi
        isSubmitting.value = false;
      }

    } else {
      // Logique pour les partenaires...
      const endpoint = `${API_BASE_URL}/api/commandes-partenaire/`;
      let isSuccess = true;

      const selectedPartner = partners.value.find(
        p => `${p.prenom} ${p.nom}` === invoice.value.partenaire
      );

      if (!selectedPartner?.id) {
        error("Partenaire introuvable");
        return;
      }

      for (const item of invoice.value.items) {
        // Créer la commande partenaire
        const commandeData = {
          facture: facture.id,
          produit: item.id,
          quantite: item.quantity,
          prix_unitaire_fcfa: item.price,
          prix_initial_fcfa: item.prix_achat || item.price,
          justification_prix: item.justification || ''
        };

        try {
          const commandeResponse = await $fetch(endpoint, {
            method: 'POST',
            body: commandeData,
            headers: {
              'Content-Type': 'application/json',
              ...(token && { 'Authorization': `Bearer ${token}` })
            }
          });

          // Mettre à jour le stock dans l'entrepôt
          const stockData = await $fetch(`${API_BASE_URL}/api/stocks/?entrepot=${boutique.value?.id}&produit=${item.id}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              ...(token && { 'Authorization': `Bearer ${token}` })
            }
          });

          if (Array.isArray(stockData) && stockData.length > 0) {
            const stock = stockData[0];
            const nouveauStock = stock.quantite - item.quantity;
            
            // Mettre à jour le stock
            await $fetch(`${API_BASE_URL}/api/stocks/${stock.id}/`, {
              method: 'PATCH',
              body: { quantite: nouveauStock },
              headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
              }
            });

            // Créer un mouvement de stock pour tracer la sortie
            await $fetch(`${API_BASE_URL}/api/mouvements-stock/`, {
              method: 'POST',
              body: {
                produit: item.id,
                entrepot: boutique.value.id,
                type_mouvement: 'sortie',
                quantite: item.quantity,
                quantite_avant: stock.quantite,
                quantite_apres: nouveauStock,
                motif: `Vente - Facture ${facture.numero}`,
                reference_document: facture.numero
              },
              headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
              }
            });
          }

        } catch (err: any) {
          console.error(`Erreur pour l'article ${item.id}:`, err);
          console.error('Données envoyées:', commandeData);
          
          // Gérer l'erreur sans lire le body deux fois
          if (err.data) {
            console.error('Détails de l\'erreur du serveur (err.data):', err.data);
          } else if (err.response?.data) {
            console.error('Détails de l\'erreur du serveur (err.response.data):', err.response.data);
          } else if (err.response) {
            try {
              // Lire le body une seule fois
              const contentType = err.response.headers?.get('content-type') || '';
              if (contentType.includes('application/json')) {
                const errorData = await err.response.json();
                console.error('Détails de l\'erreur du serveur:', errorData);
              } else {
                const errorText = await err.response.text();
                console.error('Réponse du serveur (texte):', errorText);
              }
            } catch (readErr) {
              console.error('Impossible de lire la réponse d\'erreur:', readErr);
            }
          }
          
          isSuccess = false;
          break;
        }
      }

      if (isSuccess) {
        // Générer le PDF
        const pdfGenerated = await generatePDF();
        if (pdfGenerated) {
          success(`Facture partenaire ${invoice.value.number} enregistrée et téléchargée`);
          // Effacer la sauvegarde automatique
          clearDraft()
        } else {
          error("Erreur lors de la génération du PDF");
        }

        // IMPORTANT: Recharger les produits pour mettre à jour les stocks (forcer le rechargement sans cache)
        console.log('[Facture] Rechargement des produits après création de facture partenaire...');
        try {
          // Attendre un peu pour que le backend mette à jour les stocks
          await new Promise(resolve => setTimeout(resolve, 300));
          await fetchProducts(true); // true = forceReload pour éviter le cache
          console.log('[Facture] Produits rechargés avec succès, stocks mis à jour');
          
          // Forcer la réactivité de Vue en recréant la liste
          const updatedProducts = [...products.value];
          products.value = [];
          await nextTick();
          products.value = updatedProducts;
          console.log('[Facture] Liste des produits mise à jour pour la réactivité');
        } catch (err) {
          console.error('[Facture] Erreur lors du rechargement des produits:', err);
        }

        // Réinitialiser le formulaire
        invoice.value = {
          number: generateInvoiceNumber(),
          date: new Date().toISOString().split("T")[0],
          recipientType: "",
          client: { id: 0, nom: "", prenom: "", telephone: "" },
          partenaire: "",
          items: [],
          montantVerse: 0,
        };
        
        // Réinitialiser l'état de soumission
        isSubmitting.value = false;
        
        // Actualiser la page après un court délai pour s'assurer que tout est à jour
        if (process.client) {
          console.log('[Facture] Planification du rechargement de la page dans 1.5 secondes...');
          setTimeout(() => {
            console.log('[Facture] Rechargement de la page maintenant...');
            // Utiliser window.location.href pour forcer un rechargement complet
            window.location.href = window.location.href;
          }, 1500); // Attendre 1.5 secondes pour que l'utilisateur voie le message de succès
        }
      } else {
        // En cas d'échec, réinitialiser aussi
        isSubmitting.value = false;
      }
    }

  } catch (err: any) {
    error("Erreur inattendue");
    console.error("Erreur complète:", err);
  } finally {
    isSubmitting.value = false; // Désactiver l'état de soumission
  }
};

// Computed pour le nombre total d'articles
const totalItems = computed(() => {
  return invoice.value.items.reduce((sum, item) => sum + item.quantity, 0);
});

// Utility function for delay
const delay = (ms: number) => new Promise(resolve => window.setTimeout(resolve, ms));
</script>

<template>
  <section class="mt-5 px-6">
    <!-- En-tête moderne -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-blue-400 mb-2"> Facturation</h1>
          <p class="text-gray-600 dark:text-gray-400">Créez et gérez vos factures professionnelles</p>
        </div>
        <div class="flex items-center space-x-2">
          <UIcon name="i-heroicons-document-text" class="h-8 w-8 text-blue-400" />
        </div>
      </div>
    </div>

    <!-- Interface principale -->
    <div class="w-full">
      <!-- Formulaire de facture -->
      <div class="w-full">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div class="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
            <h2 class="text-xl font-semibold text-white flex items-center">
              <UIcon name="i-heroicons-document-plus" class="h-5 w-5 mr-2" />
              Nouvelle Facture
            </h2>
          </div>
          <div class="p-6">
            <!-- Indicateur de sauvegarde automatique (discret) -->
            <div class="mb-6 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div class="flex items-center space-x-2">
                <UIcon name="i-heroicons-shield-check" class="h-3 w-3 text-gray-500" />
                <span class="text-xs text-gray-600 dark:text-gray-400">
                  Sauvegarde automatique (1h)
                </span>
              </div>
            </div>

            <!-- Section Type de destinataire -->
        <div class="mb-6">
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
                <UIcon name="i-heroicons-user-group" class="h-4 w-4 inline mr-1" />
                Type de destinataire
              </label>
              <div class="flex space-x-4">
          <URadio v-model="invoice.recipientType" value="client" name="recipientType" label="Client" color="blue"
            class="mr-4" />
          <URadio v-model="invoice.recipientType" value="partenaire" name="recipientType" label="Partenaire"
            color="blue" />
              </div>
        </div>

            <!-- Section Informations facture -->
            <div class="mb-6">
              <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                <UIcon name="i-heroicons-document-text" class="h-5 w-5 mr-2 text-blue-500" />
                Informations de la facture
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-1 gap-4">
                <div>
                  <label for="invoiceDate" class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Date de facture
                  </label>
                  <UInput id="invoiceDate" color="blue" variant="outline" v-model="invoice.date" 
              placeholder="Date de la facture" type="date" />
                </div>
              </div>
          </div>

            <!-- Section Informations destinataire -->
            <div class="mb-6">
              <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                <UIcon name="i-heroicons-user" class="h-5 w-5 mr-2 text-blue-500" />
                Informations du destinataire
              </h3>
              
              <!-- Section Client avec recherche automatique -->
              <template v-if="invoice.recipientType === 'client'">
                <!-- Client sélectionné -->
                <div v-if="selectedClient" class="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                  <div class="flex items-center justify-between">
                    <div>
                      <div class="font-medium text-green-800">{{ selectedClient.nom_complet }}</div>
                      <div class="text-sm text-green-600">{{ selectedClient.telephone }}</div>
                    </div>
                    <UButton 
                      @click="selectedClient = null; invoice.client = { id: 0, nom: '', prenom: '', telephone: '', email: '', adresse: '' }"
                      color="red" 
                      variant="ghost" 
                      size="sm"
                    >
                      <UIcon name="i-heroicons-x-mark" class="h-4 w-4" />
                    </UButton>
                  </div>
                </div>

                <!-- Formulaire de saisie client avec recherche automatique -->
                <div v-if="!selectedClient">
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label for="clientNom" class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                        Nom du client *
                      </label>
                      <UInput 
                        id="clientNom" 
                        color="blue" 
                        variant="outline" 
                        v-model="invoice.client.nom" 
                        placeholder="Nom du client" 
                        required
                        @input="searchClientAutomatically"
                      />
                    </div>
                    <div>
                      <label for="clientPrenom" class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                        Prénom du client
                      </label>
                      <UInput 
                        id="clientPrenom" 
                        color="blue" 
                        variant="outline" 
                        v-model="invoice.client.prenom" 
                        placeholder="Prénom du client" 
                        @input="searchClientAutomatically"
                      />
                    </div>
                    <div>
                      <label for="clientTelephone" class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                        Téléphone *
                      </label>
                      <UInput 
                        id="clientTelephone" 
                        color="blue" 
                        variant="outline" 
                        v-model="invoice.client.telephone"
                        placeholder="Téléphone du client" 
                        required
                        @input="searchClientAutomatically"
                      />
                    </div>
                  </div>
                  
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label for="clientEmail" class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                        Email
                      </label>
                      <UInput 
                        id="clientEmail" 
                        color="blue" 
                        variant="outline" 
                        v-model="invoice.client.email"
                        placeholder="Email du client" 
                        type="email"
                      />
                    </div>
                    <div>
                      <label for="clientAdresse" class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                        Adresse
                      </label>
                      <UInput 
                        id="clientAdresse" 
                        color="blue" 
                        variant="outline" 
                        v-model="invoice.client.adresse"
                        placeholder="Adresse du client" 
                      />
                    </div>
                  </div>
                  
                  <!-- Suggestions de clients trouvés -->
                  <div v-if="clients.length > 0 && (invoice.client.nom || invoice.client.telephone)" class="mt-3">
                    <div class="text-sm text-gray-600 dark:text-gray-400 mb-2">Clients trouvés :</div>
                    <div class="max-h-32 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md">
                      <div 
                        v-for="client in clients.slice(0, 5)" 
                        :key="client.id"
                        @click="selectClient(client)"
                        class="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                      >
                        <div class="font-medium text-gray-900 dark:text-white">{{ client.nom_complet }}</div>
                        <div class="text-sm text-gray-500 dark:text-gray-400">{{ client.telephone }}</div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Liste complète des clients de l'entreprise -->
                  <div class="mt-4">
                    <div class="flex items-center justify-between mb-2">
                      <div class="text-sm font-medium text-gray-700 dark:text-gray-300">Liste des clients ({{ allClients.length }})</div>
                      <UButton @click="fetchClients" variant="ghost" size="xs" icon="i-heroicons-arrow-path" />
                    </div>
                    <div v-if="allClients.length > 0" class="max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md">
                      <div 
                        v-for="client in allClients" 
                        :key="client.id"
                        @click="selectClient(client)"
                        class="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                      >
                        <div class="font-medium text-gray-900 dark:text-white">{{ client.nom }} {{ client.prenom }}</div>
                        <div class="text-sm text-gray-500 dark:text-gray-400">{{ client.telephone }} <span v-if="client.email">• {{ client.email }}</span></div>
                      </div>
                    </div>
                    <div v-else class="text-sm text-gray-500 dark:text-gray-400 p-2 text-center">
                      Aucun client enregistré
                    </div>
                  </div>
                  
                  <div class="mt-3 text-sm text-gray-600 dark:text-gray-400">
                    <UIcon name="i-heroicons-information-circle" class="h-4 w-4 inline mr-1" />
                    Le client sera créé automatiquement lors de la validation de la facture
                  </div>
                </div>
              </template>

          <!-- Champs partenaire (affichés si type partenaire est sélectionné) -->
          <div class="sm:col-span-6" v-if="invoice.recipientType === 'partenaire'">
            <label for="partenaireSelect"
              class="block text-sm font-medium text-gray-700 dark:text-gray-200">Sélectionner un
              Partenaire</label>
            <USelect id="partenaireSelect" color="blue" variant="outline" v-model="invoice.partenaire" class="mt-1"
              placeholder="Choisir un partenaire" :options="partners.map(p => `${p.prenom} ${p.nom}`)" />
          </div>
        </div>

        <!-- Invoice Items -->
            <!-- Section Articles -->
    <div class="mb-6">
              <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                <UIcon name="i-heroicons-shopping-cart" class="h-5 w-5 mr-2 text-blue-500" />
                Articles de la facture
              </h3>

              <!-- Scanner de code-barres -->
              <div class="mb-4 p-3 bg-green-50 dark:bg-green-900 rounded-lg border border-green-200 dark:border-green-700">
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center space-x-2">
                    <UIcon name="i-heroicons-qr-code" class="h-4 w-4 text-green-600" />
                    <span class="text-sm font-medium text-green-800 dark:text-green-200">
                      Scanner code-barres
                    </span>
                    <div v-if="currentScanning" class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <div v-else class="w-2 h-2 bg-gray-400 rounded-full"></div>
                  </div>
                  
                  <!-- Sélecteur de type de scanner -->
                  <div class="flex items-center space-x-2">
                    <span class="text-xs text-gray-600 dark:text-gray-400">Type:</span>
                    <USelect 
                      v-model="scannerType"
                      :options="[
                        { label: 'Simple', value: 'simple' },
                        { label: 'QuaggaJS', value: 'quagga' }
                      ]"
                      size="xs"
                      class="w-20"
                    />
                  </div>
                </div>
                
                <!-- Boutons de contrôle compacts -->
                <div class="flex space-x-1">
                  <UButton 
                    v-if="!currentScanning"
                    @click="scannerType === 'quagga' ? startQuaggaScanner() : startSimpleScanner()"
                    size="xs"
                    color="green"
                    icon="i-heroicons-qr-code"
                  >
                    Activer
                  </UButton>
                  <UButton 
                    v-if="currentScanning"
                    @click="scannerType === 'quagga' ? stopQuaggaScanner() : stopSimpleScanner()"
                    size="xs"
                    color="red"
                    icon="i-heroicons-stop"
                  >
                    Arrêter
                  </UButton>
                  <UButton 
                    @click="scannerType === 'quagga' ? testScan() : testSimpleScan()"
                    size="xs"
                    color="blue"
                    icon="i-heroicons-pencil"
                  >
                    Test
                  </UButton>
                </div>
                
                <!-- Message d'erreur compact -->
                <div v-if="currentScanError" class="text-red-600 text-xs mt-1">
                  {{ currentScanError }}
                </div>
                
                <!-- Instructions -->
                <div class="text-xs text-green-600 dark:text-green-400 mt-1">
                  {{ scannerType === 'simple' 
                    ? 'Scanner simple: Appuyez sur Entrée pour tester' 
                    : 'Scanner QuaggaJS: Pointez le code-barres vers la caméra' 
                  }}
                </div>
                
                <!-- Zones de scan (masquées) -->
                <div ref="scannerContainer" style="display: none;"></div>
                <video 
                  ref="simpleVideoRef"
                  style="display: none;"
                  autoplay
                  muted
                  playsinline
                ></video>
              </div>

      <!-- Élément vidéo caché pour la caméra -->
      <video 
        ref="videoRef"
        style="display: none;"
        autoplay
        muted
        playsinline
      ></video>

      <!-- Recherche de produit avec suggestions -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <!-- Recherche textuelle -->
        <div class="relative">
        <UInput 
          v-model="searchQuery"
          color="blue"
          variant="outline"
          placeholder="Rechercher un produit par référence ou nom"
          class="w-full"
          @focus="showProductSearch = true"
              @blur="async () => { await delay(200); showProductSearch = false }"
        />
        
        <!-- Liste des suggestions -->
        <div v-if="showProductSearch && filteredProducts.length > 0" 
             class="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <div v-for="product in filteredProducts" 
               :key="product.id"
               @click="selectProduct(product)"
                   class="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b dark:border-gray-700">
                <div class="flex justify-between items-center">
                  <div>
                    <div class="font-medium text-gray-900 dark:text-gray-100">{{ product.nom }}</div>
                    <div class="text-sm text-gray-600 dark:text-gray-400">Réf: {{ product.reference }}</div>
                  </div>
                  <div class="text-blue-500 font-medium">{{ formatCurrency(product.prix) }}</div>
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Stock disponible: {{ product.quantite || 0 }}
                </div>
              </div>
            </div>
          </div>

        <!-- Recherche par code-barres -->
        <div class="flex gap-2">
          <UInput 
            v-model="barcodeInput"
            color="green"
            variant="outline"
            placeholder="Entrer un code-barres ou référence"
            class="flex-1"
            @keyup.enter="simulateBarcodeScan"
          />
          <UButton 
            @click="simulateBarcodeScan"
            color="green"
            icon="i-heroicons-qr-code"
            :disabled="!barcodeInput"
          >
            Scanner
          </UButton>
          <UButton 
            @click="startBarcodeScan"
            color="blue"
            icon="i-heroicons-camera"
            :loading="isScanning"
          >
            {{ isScanning ? 'Scan...' : 'Caméra' }}
          </UButton>
        </div>
      </div>

      <!-- Scanner de code-barres modal -->
      <UModal v-model="showBarcodeScanner">
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">Scanner de Code-barres</h3>
          </template>
          
          <div class="text-center p-8">
            <div v-if="isScanning" class="space-y-4">
              <UIcon name="i-heroicons-camera" class="h-16 w-16 text-blue-500 mx-auto animate-pulse" />
              <p class="text-gray-600">Pointez la caméra vers le code-barres...</p>
              <UButton @click="stopBarcodeScan" color="red">Arrêter le scan</UButton>
            </div>
            
            <div v-else class="space-y-4">
              <UIcon name="i-heroicons-qr-code" class="h-16 w-16 text-gray-400 mx-auto" />
              <p class="text-gray-600">Scanner prêt</p>
              <UButton @click="startBarcodeScan" color="blue">Démarrer le scan</UButton>
            </div>
            
            <!-- Zone pour afficher le code scanné -->
            <div v-if="scannedCode" class="mt-4 p-4 bg-green-50 rounded-lg">
              <p class="text-green-800 font-medium">Code scanné: {{ scannedCode }}</p>
              <UButton @click="handleBarcodeScan(scannedCode)" color="green" class="mt-2">
                Ajouter le produit
              </UButton>
            </div>
          </div>
        </UCard>
      </UModal>

          <!-- Liste des articles ajoutés -->
          <div class="overflow-x-auto">
            <table class="w-full text-sm text-left text-gray-700 dark:text-gray-300 mt-3">
              <thead class="text-xs uppercase bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th class="px-4 py-2">Référence</th>
                  <th class="px-4 py-2">Nom</th>
                  <th class="px-4 py-2">Description</th>
                  <th class="px-4 py-2">Prix de vente</th>
                  <th class="px-4 py-2">Justification</th>
                  <th class="px-4 py-2">Quantité</th>
                  <th class="px-4 py-2">Total</th>
                  <th class="px-4 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in invoice.items" :key="index" class="border-b dark:border-gray-600">
                  <td class="px-4 py-2">{{ item.reference }}</td>
                  <td class="px-4 py-2">
                    {{ item.name }}
                    <div v-if="item.category?.toLowerCase() === 'ordinateur'" class="text-sm text-gray-600 mt-1">
                      <div v-if="item.ram">RAM: {{ item.ram }}</div>
                      <div v-if="item.disque_dur">Disque dur: {{ item.disque_dur }}</div>
                      <div v-if="item.processeur">Processeur: {{ item.processeur }}</div>
                      <div v-if="item.generation">Génération: {{ item.generation }}</div>
                      <div v-if="item.carte_graphique">Carte graphique: {{ item.carte_graphique }}</div>
                      <div v-if="item.systeme_exploitation">OS: {{ item.systeme_exploitation }}</div>
                    </div>
                  </td>
                  <td class="px-4 py-2">{{ item.description }}</td>
                  <td class="px-4 py-2 w-32">
                    <UInput 
                      type="number" 
                      color="blue" 
                      variant="outline" 
                      v-model="item.price" 
                      min="0"
                      class="w-full"
                      :class="getPriceValidationClass(item)"
                      @input="validatePrice(item)"
                    />
                    <div v-if="item.priceError" class="text-xs text-red-500 mt-1">
                      {{ item.priceError }}
                    </div>
                  </td>
                  <td class="px-4 py-2">
                    <UInput
                      v-model="item.justification"
                      placeholder="Justification du prix"
                      class="w-full"
                      :disabled="!item.price || item.price === item.prix_vente_vendeur"
                    />
                  </td>
                  <td class="px-4 py-2 w-24">
                    <UInput 
                      type="number" 
                      color="blue" 
                      variant="outline" 
                      v-model="item.quantity" 
                      min="1"
                      class="w-full" 
                    />
                  </td>
                  <td class="px-4 py-2">
                    {{ formatCurrency(item.quantity * item.price) }}
                  </td>
                  <td class="px-4 py-2">
                    <UButton 
                      icon="i-heroicons-trash" 
                      @click="removeItem(index)" 
                      color="red" 
                      size="sm"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Montant versé et reste à payer -->
        <div class="mb-6">
          <!-- Taxes et remises -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label for="taxRate" class="block text-sm font-medium text-gray-700 dark:text-gray-200">TVA (%)</label>
              <UInput 
                id="taxRate" 
                v-model="taxRate" 
                type="number" 
                min="0" 
                max="100" 
                step="0.1"
                color="blue" 
                variant="outline" 
                class="mt-1" 
                placeholder="0" 
              />
            </div>
            <div>
              <label for="discountRate" class="block text-sm font-medium text-gray-700 dark:text-gray-200">Remise (%)</label>
              <UInput 
                id="discountRate" 
                v-model="discountRate" 
                type="number" 
                min="0" 
                max="100" 
                step="0.1"
                color="orange" 
                variant="outline" 
                class="mt-1" 
                placeholder="0" 
              />
            </div>
            <div>
              <label for="discountAmount" class="block text-sm font-medium text-gray-700 dark:text-gray-200">Remise (FCFA)</label>
              <UInput 
                id="discountAmount" 
                v-model="discountAmount" 
                type="number" 
                min="0" 
                step="100"
                color="red" 
                variant="outline" 
                class="mt-1" 
                placeholder="0" 
              />
            </div>
          </div>

          <!-- Méthode de paiement -->
          <div class="mb-4">
            <label for="paymentMethod" class="block text-sm font-medium text-gray-700 dark:text-gray-200">Méthode de paiement</label>
            <USelect 
              id="paymentMethod" 
              v-model="paymentMethod" 
              color="blue" 
              variant="outline" 
              class="mt-1"
              :options="[
                { value: 'cash', label: 'Espèces' },
                { value: 'card', label: 'Carte bancaire' },
                { value: 'mobile', label: 'Mobile Money' },
                { value: 'transfer', label: 'Virement' },
                { value: 'check', label: 'Chèque' }
              ]"
            />
          </div>

          <!-- Notes -->
          <div class="mb-4">
            <label for="notes" class="block text-sm font-medium text-gray-700 dark:text-gray-200">Notes</label>
            <UTextarea 
              id="notes" 
              v-model="notes" 
              color="blue" 
              variant="outline" 
              class="mt-1" 
              placeholder="Notes additionnelles pour la facture..."
              :rows="2"
            />
          </div>

          <!-- Résumé des totaux -->
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Résumé de la facture</h3>
            
            <div class="space-y-2">
              <div class="flex justify-between items-center py-1">
                <span class="text-sm text-gray-500 dark:text-gray-300">Total produits :</span>
            <span class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ totalItems }}</span>
          </div>
              
              <div class="flex justify-between items-center py-1 border-t border-gray-200 dark:border-gray-600">
                <span class="text-sm text-gray-500 dark:text-gray-300">Sous-total :</span>
            <span class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ formatCurrency(subtotal) }}</span>
          </div>
              
              <div v-if="totalDiscount > 0" class="flex justify-between items-center py-1">
                <span class="text-sm text-red-500 dark:text-red-400">Remise :</span>
                <span class="text-sm font-medium text-red-500 dark:text-red-400">-{{ formatCurrency(totalDiscount) }}</span>
              </div>
              
              <div v-if="taxAmount > 0" class="flex justify-between items-center py-1">
                <span class="text-sm text-gray-500 dark:text-gray-300">TVA ({{ taxRate }}%) :</span>
                <span class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ formatCurrency(taxAmount) }}</span>
              </div>
           
          <div class="flex justify-between items-center py-2 border-t border-gray-200 dark:border-gray-600">
                <span class="text-base font-semibold text-gray-900 dark:text-gray-100">TOTAL :</span>
                <span class="text-base font-semibold text-gray-900 dark:text-gray-100">{{ formatCurrency(total) }}</span>
              </div>
              
              <div class="flex justify-between items-center py-1">
                <span class="text-sm text-gray-500 dark:text-gray-300">Marge bénéficiaire :</span>
                <span class="text-sm font-medium" :class="totalMargin >= 0 ? 'text-green-600' : 'text-red-600'">
                  {{ totalMargin.toFixed(1) }}%
                </span>
              </div>
            </div>
          </div>

          <!-- Montant versé -->
          <div class="mt-4 grid grid-cols-1 gap-y-2 sm:grid-cols-2 gap-x-4">
            <div>
              <label for="montantVerse" class="block text-sm font-medium text-gray-700 dark:text-gray-200">Montant
                versé</label>
              <UInput id="montantVerse" color="blue" variant="outline" v-model="invoice.montantVerse" type="number"
                min="0" :max="total" class="mt-1" placeholder="Montant versé par le client" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200">Reste à payer</label>
              <div class="mt-3 text-lg font-bold" :class="reste > 0 ? 'text-red-500' : 'text-green-500'">
                {{ formatCurrency(reste) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end space-x-4">
          <UButton 
            @click="submitInvoice" 
            color="green" 
            variant="solid" 
            size="lg" 
            icon="i-heroicons-document-check"
            :loading="isSubmitting"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? 'Création en cours...' : 'Enregistrer la Facture' }}
          </UButton>
        </div>
        </div>
        </div>
      </div>
    </div>

    <!-- Invoice Preview (for printing) -->
    <div ref="invoicePreview" class="hidden bg-white p-8 max-w-4xl mx-auto mt-8">
      <h1 class="text-3xl font-bold mb-6 text-blue-400">Facture</h1>
      <div class="mb-6">
        <p><strong>Numéro de la Facture :</strong> {{ invoice.number }}</p>
        <p><strong>Date :</strong> {{ invoice.date }}</p>

        <div v-if="invoice.recipientType === 'client' && invoice.client">
          <p><strong>Client :</strong> {{ invoice.client.prenom }} {{ invoice.client.nom }}</p>
          <p><strong>Téléphone :</strong> {{ invoice.client.telephone }}</p>
        </div>

        <div v-if="invoice.recipientType === 'partenaire'">
          <p><strong>Partenaire :</strong> {{ invoice.partenaire }}</p>
        </div>
      </div>

      <table class="w-full mb-6 border-collapse border">
        <thead>
          <tr class="bg-blue-50">
            <th class="border p-2 text-left">Référence</th>
            <th class="border p-2 text-left">Description</th>
            <th class="border p-2 text-right">Prix</th>
            <th class="border p-2 text-right">Quantité</th>
            <th class="border p-2 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in invoice.items" :key="item.id" class="border-b">
            <td class="border p-2">{{ item.reference }}</td>
            <td class="border p-2">
              {{ item.name }} - {{ item.description }}
              <div v-if="item.category?.toLowerCase() === 'ordinateur'" class="text-sm text-gray-600 mt-1">
                <div v-if="item.ram">RAM: {{ item.ram }}</div>
                <div v-if="item.disque_dur">Disque dur: {{ item.disque_dur }}</div>
                <div v-if="item.processeur">Processeur: {{ item.processeur }}</div>
                <div v-if="item.generation">Génération: {{ item.generation }}</div>
                <div v-if="item.carte_graphique">Carte graphique: {{ item.carte_graphique }}</div>
                <div v-if="item.systeme_exploitation">OS: {{ item.systeme_exploitation }}</div>
              </div>
            </td>
            <td class="border p-2 text-right">{{ formatCurrency(item.price) }}</td>
            <td class="border p-2 text-right">{{ item.quantity }}</td>
            <td class="border p-2 text-right">
              {{ formatCurrency(item.quantity * item.price) }}
            </td>
          </tr>
        </tbody>
      </table>

      <div class="mb-6 text-right">
        <p><strong>Total produits :</strong> {{ totalItems }}</p>
        <p><strong>Sous-total :</strong> {{ formatCurrency(subtotal) }}</p>
        <p class="text-lg font-bold text-blue-400"><strong>Total :</strong> {{ formatCurrency(total) }}</p>
      </div>
    </div>
  </section>
</template>