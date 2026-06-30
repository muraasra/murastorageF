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
import { useApiBase } from '@/composables/useApiBase'
import { useSeo } from '@/composables/useSeo'
import { useFacturePDF } from '@/composables/useFacturePDF';

// Page privée - Noindex
useSeo({
  title: 'Facturation - Mura Storage',
  description: 'Gestion de facturation et commandes clients',
  noindex: true
});

const auth = useAuthStore()
const { getStockQuantity } = useApiBase()
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

// Interface correspondant Ã  la structure de votre API
interface Product {
  id: number;
  reference: string;
  nom: string;
  description: string;
  prix: number;
  prix_achat?: number;
  category?: string;
  quantite?: number;
  actif?: boolean;
  nb_variantes?: number;
  variantes?: { id: number; nom: string; prix_achat: number; prix_vente: number; prix_gros?: number; sku: string; stock_total: number }[];
  // champs spécifiques ordinateurs
  ram?: string;
  disque_dur?: string;
  processeur?: string;
  generation?: string;
  carte_graphique?: string;
  systeme_exploitation?: string;
  // champs virtuels pour variantes aplaties
  _varianteId?: number;
  _varianteNom?: string;
  _isVariante?: boolean;
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

const { genererPDFFacture } = useFacturePDF();

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
      console.log('Données utilisateur mises Ã  jour:', user.value);
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
        console.log('Données boutique mises Ã  jour:', boutique.value);
      }
    } else {
      console.warn('Aucune boutique associée Ã  l\'utilisateur');
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
        window.location.href = '/connexion';
      }
    }
  }
};

// Récupération des produits depuis l'API avec stock par entrepôt
const products = ref<Product[]>([]);
const isLoadingProducts = ref(false);
const isSearchingProducts = ref(false);
const searchResults = ref<Product[]>([]);
let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;

const parseApiList = (data: any): any[] =>
  Array.isArray(data) ? data : (data?.results ?? []);

const getEntrepriseId = (): number | null => {
  const fromBoutique = boutique.value?.entreprise?.id ?? boutique.value?.entreprise;
  if (fromBoutique) return Number(fromBoutique);
  const fromUser = user.value?.entreprise?.id ?? user.value?.entreprise;
  if (fromUser) return Number(fromUser);
  if (process.client) {
    try {
      const stored = localStorage.getItem('entreprise');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed?.id ? Number(parsed.id) : null;
      }
    } catch {}
  }
  return null;
};

const mapProductFromApi = (p: any, stockMap: Map<number, number>): Product => ({
  id: p.id,
  reference: p.reference || p.sku || p.code_barres || '',
  nom: p.nom,
  description: p.description,
  prix: parseFloat(p.prix_vente || p.prix || 0),
  prix_achat: parseFloat(p.prix_achat || 0),
  category: p.category || p.categorie_nom || p.categorie?.nom || '',
  quantite: stockMap.get(p.id) ?? 0,
  actif: p.actif !== false,
  ram: p.ram,
  disque_dur: p.disque_dur,
  processeur: p.processeur,
  generation: p.generation,
  carte_graphique: p.carte_graphique,
  systeme_exploitation: p.systeme_exploitation,
  // Variantes — conservées depuis l'API
  nb_variantes: p.nb_variantes || 0,
  variantes: (p.variantes || []).filter((v: any) => v.actif !== false),
});

const loadStockMap = async (boutiqueId: number, forceReload = false): Promise<Map<number, number>> => {
  const stockMap = new Map<number, number>();
  const token = process.client ? localStorage.getItem('access_token') : null;
  const authHeaders = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
  const stocksTimestamp = forceReload ? `&t=${Date.now()}` : '';
  const stocksUrl = `${API_BASE_URL}/api/stocks/?entrepot=${boutiqueId}${stocksTimestamp}`;
  const stocksData: any = await $fetch(stocksUrl, {
    method: 'GET',
    headers: authHeaders,
    cache: 'no-store' as any,
  });
  parseApiList(stocksData).forEach((stock: any) => stockMap.set(stock.produit, stock.quantite));
  return stockMap;
};

const fetchProducts = async (forceReload: boolean = false) => {
  try {
    isLoadingProducts.value = true;
    const token = process.client ? localStorage.getItem('access_token') : null;
    
    if (forceReload && process.client) {
      const nuxtApp = useNuxtApp();
      if (nuxtApp.$invalidateCacheByPattern) {
        nuxtApp.$invalidateCacheByPattern('/api/produits');
        nuxtApp.$invalidateCacheByPattern('/api/stocks');
      }
    }
    
    const entrepriseId = getEntrepriseId();
    const params = new URLSearchParams();
    if (entrepriseId) params.set('entreprise', String(entrepriseId));
    if (forceReload) params.set('t', String(Date.now()));
    const produitsUrl = `${API_BASE_URL}/api/produits/?${params.toString()}`;

    const authHeaders = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };

    const data = await $fetch(produitsUrl, {
      method: 'GET',
      headers: authHeaders,
      cache: 'no-store' as any,
    });

    const boutiqueId = boutique.value?.id;
    let stockMap = new Map<number, number>();
    if (boutiqueId) {
      try {
        stockMap = await loadStockMap(boutiqueId, forceReload);
      } catch (stockErr) {
        console.warn('[fetchProducts] Impossible de charger les stocks:', stockErr);
      }
    } else {
      console.warn('[fetchProducts] Boutique non trouvée â€” produits chargés sans données de stock');
    }

    products.value = parseApiList(data)
      .map((p: any) => mapProductFromApi(p, stockMap))
      .filter((p: Product) => p.actif !== false);

    console.log(`âœ… ${products.value.length} produits chargés`);

  } catch (err) {
    console.error("Erreur lors de la récupération des produits:", err);
    error("Impossible de charger les produits. Vérifiez votre connexion.");
  } finally {
    isLoadingProducts.value = false;
  }
};

const searchProductsOnServer = async (query: string) => {
  const trimmed = query.trim();
  if (!trimmed) {
    searchResults.value = [];
    return;
  }

  try {
    isSearchingProducts.value = true;
    const token = process.client ? localStorage.getItem('access_token') : null;
    const entrepriseId = getEntrepriseId();
    const params = new URLSearchParams({ search: trimmed });
    if (entrepriseId) params.set('entreprise', String(entrepriseId));
    params.set('t', String(Date.now()));

    const authHeaders = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };

    const data = await $fetch(`${API_BASE_URL}/api/produits/?${params.toString()}`, {
      method: 'GET',
      headers: authHeaders,
      cache: 'no-store' as any,
    });

    const boutiqueId = boutique.value?.id;
    let stockMap = new Map<number, number>();
    if (boutiqueId) {
      try {
        stockMap = await loadStockMap(boutiqueId, true);
      } catch {}
    }

    searchResults.value = parseApiList(data)
      .map((p: any) => mapProductFromApi(p, stockMap))
      .filter((p: Product) => p.actif !== false);
  } catch (err) {
    console.error('[searchProductsOnServer]', err);
    searchResults.value = [];
  } finally {
    isSearchingProducts.value = false;
  }
};

// Récupération des partenaires depuis l'API (filtrés par entreprise)
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
    const entrepriseId = getEntrepriseId();

    const url = entrepriseId
      ? `${API_BASE_URL}/api/clients/?entreprise=${entrepriseId}`
      : `${API_BASE_URL}/api/clients/`;

    const data = await $fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      cache: 'no-store' as any,
    });

    const list = parseApiList<Client>(data);
    clients.value = list;
    allClients.value = list;
    console.log('Clients récupérés (filtrés par entreprise):', list.length);
  } catch (err) {
    console.error("Erreur lors de la récupération des clients:", err);
    clients.value = [];
    allClients.value = [];
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
  
  // Recherche locale dans les clients déjÃ  chargés
  const source = Array.isArray(allClients.value) ? allClients.value : parseApiList<Client>(allClients.value)
  const clientsTrouves = source.filter(client => {
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
    
    const data = await $fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      cache: 'no-store' as any,
    });

    clients.value = parseApiList<Client>(data);
    console.log('Clients trouvés (filtrés par entreprise):', clients.value.length);
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
    
    console.log('Données client Ã  envoyer:', clientPayload);
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
    
    // Ajouter le nouveau client Ã  la liste locale
    if (!Array.isArray(allClients.value)) {
      allClients.value = parseApiList<Client>(allClients.value)
    }
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
          throw new Error('Erreur de validation. Vérifiez les données saisies.');
        }
        
        // Si erreur 401, le token est probablement expiré
        if (err.response.status === 401) {
          console.error('Token expiré, redirection vers la connexion');
          if (process.client) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            localStorage.removeItem('boutique');
            window.location.href = '/connexion';
          }
          throw new Error('Token expiré, veuillez vous reconnecter');
        }
        
        // Pour les autres erreurs, continuer avec les valeurs par défaut
        console.warn('Erreur API, utilisation des valeurs par défaut');
        throw new Error('Erreur serveur. Veuillez réessayer.');
        
      } catch (e) {
        const errorText = await err.response.text();
        console.error('Réponse du serveur (texte):', errorText);
        console.error('Status:', err.response.status);
        console.error('StatusText:', err.response.statusText);
        throw new Error('Erreur serveur. Veuillez réessayer.');
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
  
  // Vérifier si le client existe déjÃ  dans la liste locale
  const clientsList = Array.isArray(allClients.value) ? allClients.value : parseApiList<Client>(allClients.value)
  const existingClient = clientsList.find(c => c.telephone === invoice.value.client?.telephone);
  
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
    
    const entrepriseId = getEntrepriseId();

    // Filtrer les partenaires par entreprise si possible
    const url = entrepriseId
      ? `${API_BASE_URL}/api/partenaires/?entreprise=${entrepriseId}`
      : `${API_BASE_URL}/api/partenaires/`;
    
    const data = await $fetch<Partner[] | any>(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });

    partners.value = parseApiList<Partner>(data);
    console.log('Partenaires récupérés (filtrés par entreprise):', partners.value.length);

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

// Computed pour filtrer les produits selon la recherche — avec variantes aplaties
const filteredProducts = computed<Product[]>(() => {
  const query = searchQuery.value.toLowerCase().trim()
  const source = (query && searchResults.value.length > 0) ? searchResults.value : products.value

  const filtered = query
    ? source.filter(p =>
        (p.reference || '').toLowerCase().includes(query) ||
        (p.nom || '').toLowerCase().includes(query) ||
        (p.category || '').toLowerCase().includes(query) ||
        String(p.id).includes(query)
      ).slice(0, 20)
    : [...source].sort((a, b) => (b.quantite || 0) - (a.quantite || 0)).slice(0, 10)

  // Aplatir : produits avec variantes → une entrée par variante
  const result: Product[] = []
  for (const p of filtered) {
    if (p.nb_variantes && p.nb_variantes > 0 && p.variantes && p.variantes.length > 0) {
      for (const v of p.variantes) {
        // Construire le label des attributs : ex. "poids: 80kg, couleur: rouge"
        const attrs = v.attributs && Object.keys(v.attributs).length > 0
          ? Object.entries(v.attributs).map(([k, val]) => `${k}: ${val}`).join(', ')
          : ''
        result.push({
          ...p,
          nom: `${p.nom} — ${v.nom}`,
          prix: parseFloat(v.prix_vente) || p.prix,
          prix_achat: parseFloat(v.prix_achat) || p.prix_achat,
          quantite: v.stock_total ?? 0,
          _varianteId: v.id,
          _varianteNom: v.nom,
          _varianteAttrs: attrs,
          _isVariante: true,
        })
      }
    } else {
      result.push(p)
    }
  }
  return result
});

watch(searchQuery, (query) => {
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
  const trimmed = query.trim()
  if (!trimmed) {
    searchResults.value = []
    return
  }
  searchDebounceTimer = setTimeout(() => {
    searchProductsOnServer(trimmed)
  }, 300)
});


const findProductByReference = (reference: string): Product | undefined => {
  const ref = reference.toLowerCase()
  return products.value.find((product) =>
    product.reference?.toLowerCase() === ref ||
    product.reference === reference
  );
};

// Recherche par code-barres
const findProductByBarcode = (barcode: string): Product | undefined => {
  const code = barcode.toLowerCase()
  return products.value.find((product) => 
    product.reference?.toLowerCase() === code ||
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
      error("Boutique non trouvée");
      return;
    }
    // Vérifier le stock (variante ou produit-niveau)
    const stockDisponible = await _resolveStockVariante(boutiqueId, product, token);

    if (stockDisponible < 1) {
      error(`Stock insuffisant pour "${product.nom}". Stock : ${stockDisponible} unité(s).`);
      searchQuery.value = '';
      showProductSearch.value = false;
      return;
    }
    invoice.value.items.push({
      id: product.id,
      reference: product.reference,
      name: product.nom,
      description: product.description || '',
      quantity: 1,
      price: product.prix,
      prix_unitaire_fcfa: product.prix,
      prix_vente_vendeur: product.prix,
      prix_achat: product.prix_achat,
      justification: '',
      category: product.category,
      ram: product.ram,
      disque_dur: product.disque_dur,
      processeur: product.processeur,
      generation: product.generation,
      carte_graphique: product.carte_graphique,
      systeme_exploitation: product.systeme_exploitation,
      ...(product._varianteId && { variante_id: product._varianteId, variante_nom: product._varianteNom }),
    } as any);

    searchQuery.value = '';
    showProductSearch.value = false;
  } catch (err) {
    console.error("Erreur lors de la vérification du stock:", err);
    error("Erreur lors de la vérification du stock");
  }
};

// Résolution du stock variante dans selectProduct
const _resolveStockVariante = async (boutiqueId: number, product: Product, token: string | null) => {
  if (product._varianteId) {
    const data: any = await $fetch(
      `${API_BASE_URL}/api/stocks/?entrepot=${boutiqueId}&variante=${product._varianteId}&t=${Date.now()}`,
      { headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) } }
    );
    const stocks: any[] = Array.isArray(data) ? data : (data?.results ?? []);
    return stocks.reduce((s: number, st: any) => s + (st.quantite || 0), 0);
  }
  const data = await $fetch(
    `${API_BASE_URL}/api/stocks/?entrepot=${boutiqueId}&produit=${product.id}&t=${Date.now()}`,
    { headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) } }
  );
  return getStockQuantity(data, product.quantite ?? 0);
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

// Calcul du montant restant Ã  payer
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
    
    // Vérifier Ã  nouveau après récupération
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
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
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
    warranty: "Garantie Produit â€“ Service Après-Vente\nCe produit est couvert par une garantie de 6 mois Ã  compter de la date d'achat figurant sur cette facture.\nEn cas de dysfonctionnement non causé par une mauvaise utilisation, vous pouvez bénéficier d'un service après-vente en présentant cette facture.\n\n Cette garantie couvre uniquement les défauts de fabrication et ne s'applique pas aux dommages physiques ou Ã  l'usure normale.\n\nPour toute demande de prise en charge, contactez notre service client."
  };
});

// Génération PDF déléguée au composable useFacturePDF
const generatePDF = async (): Promise<boolean> => {
  try {
    const nomDestinataire = invoice.value.recipientType === 'client'
      ? `${invoice.value.client?.prenom || ''} ${invoice.value.client?.nom || ''}`.trim()
      : invoice.value.partenaire || ''
    const totalVal = total.value || 0
    const verseVal = invoice.value.montantVerse || 0
    const resteVal = Math.max(0, totalVal - verseVal)
    const statut = resteVal <= 0 ? 'Payé' : verseVal > 0 ? 'Partiellement payé' : 'En attente'

    await genererPDFFacture(
      {
        id: 0,
        numero: invoice.value.number || 'AUTO',
        date: invoice.value.date || new Date().toISOString(),
        nom: nomDestinataire,
        type: (invoice.value.recipientType || 'client') as 'client' | 'partenaire',
        status: statut,
        total: totalVal,
        verse: verseVal,
        reste: resteVal,
        boutique_nom: boutique.value?.nom || '',
      },
      invoice.value.items.map(item => ({
        nom: item.name || (item as any).nom || (item as any).produit_nom || '',
        reference: item.reference || '',
        quantite: item.quantity || (item as any).quantite || 1,
        prix: item.prix_vente_vendeur || item.price || (item as any).prix || 0,
      }))
    )
    return true
  } catch (err) {
    console.error('Erreur lors de la génération du PDF:', err);
    // NE PAS afficher d'erreur â€” le PDF est un bonus, pas bloquer la facture
    return false;
  }
};

// â€”â€”â€” Ancienne implémentation jsPDF supprimée â€”â€”â€”
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _obsolete_generatePDF_jsPDF = async () => { /* supprimée */ };

// Fonction pour convertir un nombre en lettres
const numberToWords = (number: number): string => {
  // Cette fonction devrait être implémentée pour convertir les nombres en lettres
  // Pour l'instant, retourne une chaîne simple
  return number.toString();
};

// Fonction pour valider le prix de vente et mettre Ã  jour les totaux
const validatePrice = (item: InvoiceItem) => {
  const prixAchat = item.prix_achat || 0;
  const prixVente = item.price;
  
  const validation = validateSellingPrice(prixVente, prixAchat, 5); // Marge minimale de 5%
  
  if (!validation.isValid) {
    item.priceError = `Le prix de vente doit être au moins ${formatCurrency(validation.minPrice)} FCFA (marge: ${validation.margin.toFixed(1)}%)`;
    return false;
  } else {
    item.priceError = undefined;
    // Mettre Ã  jour prix_vente_vendeur quand le prix est valide
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

      const stockDisponible = getStockQuantity(
        stockData,
        products.value.find(p => p.id === item.id)?.quantite ?? 0
      );

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
      // Vérifier si le client existe déjÃ  dans la liste locale
      const clientsList = Array.isArray(allClients.value) ? allClients.value : parseApiList<Client>(allClients.value)
      const existingClient = clientsList.find(c => c.telephone === invoice.value.client?.telephone);
      
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
      error('Le reste Ã  payer est invalide');
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
    const transactionPayload = {
      ...factureData,
      items: invoice.value.items.map(item => ({
        produit: item.id,
        quantite: item.quantity,
        prix_unitaire_fcfa: item.price,
        prix_initial_fcfa: item.prix_achat || item.price,
        justification_prix: item.justification || '',
        ...((item as any).variante_id && { variante: (item as any).variante_id }),
      }))
    };

    try {
      const transactionResponse = await $fetch<{ success: boolean; facture: FactureResponse }>(
        `${API_BASE_URL}/api/factures/create-with-stock/`,
        {
          method: 'POST',
          body: transactionPayload,
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
          }
        }
      );

      facture = transactionResponse?.facture || null;
    } catch (err: any) {
      console.error('Erreur création facture transactionnelle:', err);
      
      let errorMessage = 'Erreur lors de la création de la facture. Veuillez réessayer.';
      const errorData = err.data || err.response?.data;
      const isTransactionError = err.status === 500 && (
        err.message?.includes('TransactionManagementError') ||
        err.message?.includes('atomic') ||
        (typeof errorData === 'string' && (
          errorData.includes('Duplicate entry') ||
          errorData.includes('TransactionManagementError')
        ))
      );
      
      if (isTransactionError) {
        errorMessage = 'Erreur temporaire. Veuillez réessayer dans quelques instants.';
      } else if (err.status === 401) {
        errorMessage = 'Session expirée. Veuillez vous reconnecter.';
      } else if (err.status === 403) {
        errorMessage = 'Vous n\'avez pas les permissions pour créer une facture.';
      } else if (err.status === 400) {
        errorMessage = 'Données invalides. Vérifiez les informations saisies.';
      } else if (err.status === 500 || err.status === 502 || err.status === 503) {
        errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
      } else if (err.name === 'FetchError' || err.message?.includes('fetch')) {
        errorMessage = 'Erreur de connexion. Vérifiez votre connexion internet.';
      }
      
      error(errorMessage);
      isSubmitting.value = false;
      return;
    }

    if (!facture?.id) {
      error("Erreur lors de la création de la facture");
      console.error("Détails:", facture);
      return;
    }

    // Mettre Ã  jour le numéro de facture avec celui retourné par le backend
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
    }

    // Générer le PDF
    const pdfGenerated = await generatePDF();
    const typeLabel = invoice.value.recipientType === 'client' ? 'client' : 'partenaire';
    const savedNumber = facture.numero || invoice.value.number;

    if (pdfGenerated) {
      success(`Facture ${typeLabel} ${savedNumber} enregistrée et téléchargée`);
    } else {
      success(`Facture ${typeLabel} ${savedNumber} enregistrée avec succès`);
    }
    clearDraft();

    // Recharger les produits pour mettre Ã  jour les stocks
    await fetchProducts(true);

    // Réinitialiser le formulaire pour une nouvelle vente
    invoice.value = {
      number: generateInvoiceNumber(),
      date: new Date().toISOString().split("T")[0],
      recipientType: "",
      client: { id: 0, nom: "", prenom: "", telephone: "" },
      partenaire: "",
      items: [],
      montantVerse: 0,
    };
    searchQuery.value = '';
    selectedClient.value = null;
    taxRate.value = 0;
    discountRate.value = 0;
    discountAmount.value = 0;
    notes.value = '';
    paymentMethod.value = 'cash';

    isSubmitting.value = false;

    // Proposer d'aller Ã  la liste des factures
    setTimeout(() => {
      navigateTo('/listes-factures');
    }, 1200);

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
          @blur="async () => { await delay(150); showProductSearch = false }"
          @input="showProductSearch = true"
        />
        
        <!-- Liste des suggestions -->
        <div v-if="showProductSearch && (filteredProducts.length > 0 || products.length === 0 || isLoadingProducts || isSearchingProducts)"
             class="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl max-h-72 overflow-y-auto">
          <!-- Chargement -->
          <div v-if="isLoadingProducts || isSearchingProducts" class="p-4 text-center">
            <p class="text-sm text-gray-500 dark:text-gray-400">Recherche en cours...</p>
          </div>
          <!-- Chargement / aucun produit -->
          <div v-else-if="products.length === 0" class="p-4 text-center">
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">Aucun produit chargé.</p>
            <button @click="fetchProducts(true)" class="text-xs text-emerald-600 hover:underline font-medium">â†º Recharger les produits</button>
          </div>
          <!-- Aucun résultat -->
          <div v-else-if="searchQuery.trim() && filteredProducts.length === 0" class="p-4 text-center">
            <p class="text-sm text-gray-500 dark:text-gray-400">Aucun produit trouvé pour « {{ searchQuery }} »</p>
          </div>
          <!-- Résultats -->
          <template v-else>
            <div class="px-3 py-1.5 text-xs text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              {{ filteredProducts.length }} produit(s) — cliquer pour ajouter
            </div>
            <div v-for="product in filteredProducts"
                 :key="product._varianteId ? `v-${product._varianteId}` : product.id"
                 @mousedown.prevent="selectProduct(product)"
                 class="flex items-center gap-3 px-3 py-2.5 border-b border-gray-100 dark:border-gray-700 last:border-0 transition-colors"
                 :class="(product.quantite ?? 0) > 0
                   ? 'hover:bg-emerald-50 dark:hover:bg-emerald-900/10 cursor-pointer'
                   : 'hover:bg-red-50 dark:hover:bg-red-900/10 cursor-not-allowed opacity-60'"
            >
              <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
                :class="product._isVariante ? 'bg-blue-500' : ((product.quantite ?? 0) > 0 ? 'bg-emerald-500' : 'bg-red-400')">
                {{ product._isVariante ? '↘' : (product.nom || '?').substring(0, 2).toUpperCase() }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span class="font-medium text-sm text-gray-900 dark:text-white truncate">{{ product.nom }}</span>
                  <span v-if="product._isVariante" class="text-xs px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full flex-shrink-0">variante</span>
                  <span v-else-if="product.category" class="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded flex-shrink-0">{{ product.category }}</span>
                </div>
                <!-- Caractéristiques de la variante -->
                <div v-if="(product as any)._varianteAttrs" class="text-xs text-blue-600 dark:text-blue-400 mt-0.5 truncate">
                  {{ (product as any)._varianteAttrs }}
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-0.5">
                  <span>Réf: {{ product.reference || '—' }}</span>
                  <span class="font-semibold" :class="(product.quantite ?? 0) > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'">
                    Stock: {{ product.quantite ?? 0 }}
                  </span>
                </div>
              </div>
              <div class="text-right flex-shrink-0">
                <div class="font-semibold text-sm text-gray-900 dark:text-white">{{ formatCurrency(product.prix) }}</div>
                <div v-if="(product.quantite ?? 0) <= 0" class="text-xs text-red-500 font-medium">Rupture</div>
              </div>
            </div>
          </template>
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
            <!-- Vue mobile : cartes -->
            <div class="sm:hidden space-y-3 mb-4">
              <div v-for="(item, index) in invoice.items" :key="index"
                class="bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <div class="flex items-start justify-between mb-3">
                  <div class="flex-1 min-w-0">
                    <p class="font-semibold text-sm text-gray-900 dark:text-white">{{ item.name }}</p>
                    <p v-if="(item as any).variante_nom" class="text-xs text-blue-600 dark:text-blue-400 mt-0.5">{{ (item as any).variante_nom }}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Réf: {{ item.reference }}</p>
                  </div>
                  <UButton icon="i-heroicons-trash" @click="removeItem(index)" color="red" size="xs" variant="ghost" />
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="text-xs text-gray-500 dark:text-gray-400 block mb-1">Prix unitaire</label>
                    <UInput type="number" v-model="item.price" min="0" size="sm" class="w-full" @input="validatePrice(item)" />
                    <p v-if="item.priceError" class="text-xs text-red-500 mt-0.5">{{ item.priceError }}</p>
                  </div>
                  <div>
                    <label class="text-xs text-gray-500 dark:text-gray-400 block mb-1">Quantité</label>
                    <UInput type="number" v-model="item.quantity" min="1" size="sm" class="w-full" />
                  </div>
                </div>
                <div class="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <span class="text-xs text-gray-500">Total ligne</span>
                  <span class="font-bold text-gray-900 dark:text-white">{{ formatCurrency(item.quantity * item.price) }}</span>
                </div>
              </div>
            </div>

            <!-- Vue desktop : tableau -->
            <div class="hidden sm:block">
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
                    <div>{{ item.name }}</div>
                    <div v-if="(item as any).variante_nom" class="text-xs text-blue-600 dark:text-blue-400 font-medium mt-0.5">↘ {{ (item as any).variante_nom }}</div>
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
        </div>

        <!-- Montant versé et reste Ã  payer -->
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
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200">Reste Ã  payer</label>
              <div class="mt-3 text-lg font-bold" :class="reste > 0 ? 'text-red-500' : 'text-green-500'">
                {{ formatCurrency(reste) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Actions (centrées et responsives) -->
        <div class="flex flex-wrap justify-end gap-3">
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
          <tr v-for="(item, idx) in invoice.items" :key="idx" class="border-b">
            <td class="border p-2">{{ item.reference }}</td>
            <td class="border p-2">
              {{ item.name }}<span v-if="(item as any).variante_nom" class="ml-1 text-xs text-blue-600 font-medium">— {{ (item as any).variante_nom }}</span>
              <span v-if="item.description"> - {{ item.description }}</span>
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
