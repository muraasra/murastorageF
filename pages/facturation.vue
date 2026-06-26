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

// Page privÃ©e - Noindex
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
const scannerType = ref<'quagga' | 'simple'>('simple') // Scanner simple par dÃ©faut
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
  prix_achat?: number; // Prix d'achat optionnel
  category?: string;
  quantite?: number;
  actif?: boolean;
  // Champs spÃ©cifiques pour les ordinateurs
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

// Interfaces pour les rÃ©ponses API
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
    console.log('Utilisateur rÃ©cupÃ©rÃ©:', user.value);
  }
  
  if (boutiqueData) {
    boutique.value = JSON.parse(boutiqueData);
    console.log('Boutique rÃ©cupÃ©rÃ©e:', boutique.value);
  }
}

const userId = computed(() => user.value?.id);

// Fonction pour rÃ©cupÃ©rer les donnÃ©es utilisateur et boutique depuis l'API
const fetchUserAndBoutiqueData = async () => {
  try {
    const token = process.client ? localStorage.getItem('access_token') : null;
    if (!token) {
      console.error('Token d\'authentification manquant');
      return;
    }

    // RÃ©cupÃ©rer l'ID utilisateur depuis le localStorage ou le store
    const currentUser = user.value || (process.client ? JSON.parse(localStorage.getItem('user') || '{}') : {});
    const userId = currentUser.id;
    
    if (!userId) {
      console.error('ID utilisateur non trouvÃ© dans les donnÃ©es locales');
      console.log('DonnÃ©es utilisateur disponibles:', currentUser);
      console.log('Tentative de rÃ©cupÃ©ration depuis le store auth...');
      
      // Essayer de rÃ©cupÃ©rer depuis le store auth
      const authStore = useAuthStore();
      if (authStore.user?.id) {
        console.log('ID utilisateur trouvÃ© dans le store auth:', authStore.user.id);
        user.value = authStore.user;
        return;
      }
      
      console.error('Aucun ID utilisateur trouvÃ© nulle part');
      return;
    }
    
    console.log('RÃ©cupÃ©ration des donnÃ©es pour l\'utilisateur ID:', userId);

    // RÃ©cupÃ©rer les donnÃ©es utilisateur complÃ¨tes
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
      console.log('DonnÃ©es utilisateur mises Ã  jour:', user.value);
    }

    // RÃ©cupÃ©rer les donnÃ©es de la boutique de l'utilisateur
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
        console.log('DonnÃ©es boutique mises Ã  jour:', boutique.value);
      }
    } else {
      console.warn('Aucune boutique associÃ©e Ã  l\'utilisateur');
    }
  } catch (err: any) {
    console.error('Erreur lors de la rÃ©cupÃ©ration des donnÃ©es:', err);
    console.error('DÃ©tails de l\'erreur:', {
      status: err.response?.status,
      statusText: err.response?.statusText,
      url: err.response?.url,
      message: err.message
    });
    
    // Si l'erreur est 404, essayer de rÃ©cupÃ©rer les donnÃ©es depuis le localStorage
    if (err.response?.status === 404) {
      console.log('Endpoint non trouvÃ©, utilisation des donnÃ©es locales');
      if (process.client) {
        const storedUser = localStorage.getItem('user');
        const storedBoutique = localStorage.getItem('boutique');
        
        if (storedUser) {
          try {
            user.value = JSON.parse(storedUser);
            console.log('Utilisateur restaurÃ© depuis localStorage:', user.value);
          } catch (e) {
            console.error('Erreur lors de la restauration de l\'utilisateur:', e);
          }
        }
        
        if (storedBoutique) {
          try {
            boutique.value = JSON.parse(storedBoutique);
            console.log('Boutique restaurÃ©e depuis localStorage:', boutique.value);
          } catch (e) {
            console.error('Erreur lors de la restauration de la boutique:', e);
          }
        }
      }
    } else if (err.response?.status === 401) {
      console.error('Token expirÃ© ou invalide');
      if (process.client) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        localStorage.removeItem('boutique');
        window.location.href = '/connexion';
      }
    }
  }
};

// RÃ©cupÃ©ration des produits depuis l'API avec stock par entrepÃ´t
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
      console.warn('[fetchProducts] Boutique non trouvÃ©e â€” produits chargÃ©s sans donnÃ©es de stock');
    }

    products.value = parseApiList(data)
      .map((p: any) => mapProductFromApi(p, stockMap))
      .filter((p: Product) => p.actif !== false);

    console.log(`âœ… ${products.value.length} produits chargÃ©s`);

  } catch (err) {
    console.error("Erreur lors de la rÃ©cupÃ©ration des produits:", err);
    error("Impossible de charger les produits. VÃ©rifiez votre connexion.");
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

// RÃ©cupÃ©ration des partenaires depuis l'API (filtrÃ©s par entreprise)
const partners = ref<Partner[]>([]);
const clients = ref<Client[]>([]);
const allClients = ref<Client[]>([]); // Tous les clients de l'entreprise
const selectedClient = ref<Client | null>(null);
const isSearchingClient = ref(false);
const clientSearchQuery = ref('');
// RÃ©cupÃ©ration des clients depuis l'API
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
    console.log('Clients rÃ©cupÃ©rÃ©s (filtrÃ©s par entreprise):', list.length);
  } catch (err) {
    console.error("Erreur lors de la rÃ©cupÃ©ration des clients:", err);
    clients.value = [];
    allClients.value = [];
  }
};

// Recherche automatique de clients lors de la saisie (recherche locale)
const searchClientAutomatically = () => {
  const nom = invoice.value.client?.nom || '';
  const prenom = invoice.value.client?.prenom || '';
  const telephone = invoice.value.client?.telephone || '';
  
  // Rechercher seulement si on a au moins 2 caractÃ¨res dans un champ
  if (nom.length < 2 && prenom.length < 2 && telephone.length < 2) {
    clients.value = [];
    return;
  }
  
  // Recherche locale dans les clients dÃ©jÃ  chargÃ©s
  const source = Array.isArray(allClients.value) ? allClients.value : parseApiList<Client>(allClients.value)
  const clientsTrouves = source.filter(client => {
    const nomMatch = nom.length >= 2 && client.nom.toLowerCase().includes(nom.toLowerCase());
    const prenomMatch = prenom.length >= 2 && client.prenom.toLowerCase().includes(prenom.toLowerCase());
    const telephoneMatch = telephone.length >= 2 && client.telephone.includes(telephone);
    
    return nomMatch || prenomMatch || telephoneMatch;
  });
  
  clients.value = clientsTrouves;
  console.log('Clients trouvÃ©s localement:', clientsTrouves);
};

// Recherche de clients par tÃ©lÃ©phone
const searchClientByPhone = async (phone: string) => {
  if (!phone || phone.length < 3) return;
  
  try {
    isSearchingClient.value = true;
    const token = process.client ? localStorage.getItem('access_token') : null;
    
    // RÃ©cupÃ©rer l'entreprise de l'utilisateur connectÃ©
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
    
    // Filtrer par entreprise dans la recherche par tÃ©lÃ©phone
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
    console.log('Clients trouvÃ©s (filtrÃ©s par entreprise):', clients.value.length);
  } catch (err) {
    console.error("Erreur lors de la recherche de clients:", err);
  } finally {
    isSearchingClient.value = false;
  }
};

// CrÃ©ation automatique d'un client
const createClient = async (clientData: Partial<Client>) => {
  try {
    const token = process.client ? localStorage.getItem('access_token') : null;
    
    // Validation des donnÃ©es requises
    if (!clientData.nom || !clientData.telephone) {
      throw new Error('Nom et tÃ©lÃ©phone sont requis');
    }
    
    if (!token) {
      throw new Error('Token d\'authentification manquant');
    }
    
    // RÃ©cupÃ©rer les donnÃ©es utilisateur si nÃ©cessaire
    console.log('DonnÃ©es utilisateur actuelles:', user.value);
    console.log('DonnÃ©es boutique actuelles:', boutique.value);
    
    if (!user.value?.entreprise?.id) {
      console.log('DonnÃ©es entreprise manquantes, tentative de rÃ©cupÃ©ration...');
      try {
        await fetchUserAndBoutiqueData();
      } catch (err) {
        console.error('Erreur lors de la rÃ©cupÃ©ration des donnÃ©es:', err);
      }
    }
    
    // Si toujours pas d'entreprise, essayer de rÃ©cupÃ©rer depuis le store auth ou utiliser des valeurs par dÃ©faut
    let entrepriseId = user.value?.entreprise?.id;
    if (!entrepriseId) {
      console.warn('Aucune entreprise trouvÃ©e dans les donnÃ©es utilisateur');
      
      // Essayer de rÃ©cupÃ©rer depuis le store auth
      const authStore = useAuthStore();
      if ((authStore.user as any)?.entreprise?.id) {
        entrepriseId = (authStore.user as any).entreprise.id;
        console.log('Entreprise trouvÃ©e dans le store auth:', entrepriseId);
      } else {
        console.warn('Utilisation d\'une entreprise par dÃ©faut (ID: 1)');
        entrepriseId = 1;
      }
    }
    
    // RÃ©cupÃ©rer l'ID de la boutique
    let boutiqueId = boutique.value?.id || user.value?.boutique?.id;
    if (!boutiqueId) {
      console.warn('Aucune boutique trouvÃ©e dans les donnÃ©es utilisateur');
      
      // Essayer de rÃ©cupÃ©rer depuis le store auth
      const authStore = useAuthStore();
      if ((authStore.user as any)?.boutique?.id) {
        boutiqueId = (authStore.user as any).boutique.id;
        console.log('Boutique trouvÃ©e dans le store auth:', boutiqueId);
      } else {
        console.warn('Utilisation d\'une boutique par dÃ©faut (ID: 1)');
        boutiqueId = 1;
      }
    }
    
    console.log('IDs utilisÃ©s - Entreprise:', entrepriseId, 'Boutique:', boutiqueId);
    
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
    
    console.log('DonnÃ©es client Ã  envoyer:', clientPayload);
    console.log('Utilisateur connectÃ©:', {
      id: user.value?.id,
      nom: user.value?.nom,
      prenom: user.value?.prenom,
      entreprise: user.value?.entreprise,
      boutique: user.value?.boutique
    });
    console.log('Boutique rÃ©cupÃ©rÃ©e:', boutique.value);
    console.log('IDs utilisÃ©s - Entreprise:', entrepriseId, 'Boutique:', boutiqueId);
    console.log('Token disponible:', !!token);
    
    const newClient = await $fetch<Client>(`${API_BASE_URL}/api/clients/`, {
      method: 'POST',
      body: clientPayload,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });
    
    console.log('Client crÃ©Ã©:', newClient);
    
    // Ajouter le nouveau client Ã  la liste locale
    if (!Array.isArray(allClients.value)) {
      allClients.value = parseApiList<Client>(allClients.value)
    }
    allClients.value.push(newClient);
    
    return newClient;
    } catch (err: any) {
      console.error("Erreur lors de la crÃ©ation du client:", err);
    
    if (err.response) {
      try {
        const errorData = await err.response.json();
        console.error('RÃ©ponse du serveur (JSON):', errorData);
        
        // Si erreur 400, afficher les dÃ©tails de validation
        if (err.response.status === 400) {
          console.error('Erreur de validation:', errorData);
          throw new Error('Erreur de validation. VÃ©rifiez les donnÃ©es saisies.');
        }
        
        // Si erreur 401, le token est probablement expirÃ©
        if (err.response.status === 401) {
          console.error('Token expirÃ©, redirection vers la connexion');
          if (process.client) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            localStorage.removeItem('boutique');
            window.location.href = '/connexion';
          }
          throw new Error('Token expirÃ©, veuillez vous reconnecter');
        }
        
        // Pour les autres erreurs, continuer avec les valeurs par dÃ©faut
        console.warn('Erreur API, utilisation des valeurs par dÃ©faut');
        throw new Error('Erreur serveur. Veuillez rÃ©essayer.');
        
      } catch (e) {
        const errorText = await err.response.text();
        console.error('RÃ©ponse du serveur (texte):', errorText);
        console.error('Status:', err.response.status);
        console.error('StatusText:', err.response.statusText);
        throw new Error('Erreur serveur. Veuillez rÃ©essayer.');
      }
    } else {
      console.error('Pas de rÃ©ponse disponible - erreur de connexion');
      throw new Error('Erreur de connexion au serveur');
    }
  }
};

// SÃ©lection d'un client existant
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

// CrÃ©ation automatique d'un client si nÃ©cessaire
const handleClientCreation = async () => {
  if (!invoice.value.client?.telephone) return;
  
  // VÃ©rifier si le client existe dÃ©jÃ  dans la liste locale
  const clientsList = Array.isArray(allClients.value) ? allClients.value : parseApiList<Client>(allClients.value)
  const existingClient = clientsList.find(c => c.telephone === invoice.value.client?.telephone);
  
  if (existingClient) {
    selectClient(existingClient);
    return;
  }
  
  // CrÃ©er le client automatiquement
  try {
    const newClient = await createClient(invoice.value.client);
    selectClient(newClient);
    success(`Client ${newClient.nom_complet} crÃ©Ã© automatiquement`);
  } catch (err) {
    error("Erreur lors de la crÃ©ation du client");
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
    console.log('Partenaires rÃ©cupÃ©rÃ©s (filtrÃ©s par entreprise):', partners.value.length);

  } catch (err) {
    console.error("Erreur lors de la rÃ©cupÃ©ration des partenaires:", err);
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

// Nouvelles fonctionnalitÃ©s
const taxRate = ref(0); // Taux de TVA en pourcentage
const discountRate = ref(0); // Remise en pourcentage
const discountAmount = ref(0); // Remise en montant fixe
const paymentMethod = ref('cash'); // MÃ©thode de paiement
const notes = ref(''); // Notes de la facture
const showBarcodeScanner = ref(false);
const barcodeInput = ref('');
const isSubmitting = ref(false); // Ã‰tat de soumission de la facture

const currentProductRef = ref("");
const invoicePreview = ref<HTMLElement | null>(null);

// Ã‰tat pour la recherche de produits
const searchQuery = ref("");
const showProductSearch = ref(false);

// Computed pour filtrer les produits selon la recherche
const filteredProducts = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  if (!query) {
    return [...products.value]
      .sort((a, b) => (b.quantite || 0) - (a.quantite || 0))
      .slice(0, 8)
  }

  // PrioritÃ© aux rÃ©sultats serveur si disponibles
  const source = searchResults.value.length > 0 ? searchResults.value : products.value
  return source.filter(product =>
    (product.reference || '').toLowerCase().includes(query) ||
    (product.nom || '').toLowerCase().includes(query) ||
    (product.category || '').toLowerCase().includes(query) ||
    String(product.id).includes(query)
  ).slice(0, 15)
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

// Fonction pour traiter le code-barres scannÃ©
const handleBarcodeScan = async (barcode: string) => {
  console.log('Code-barres scannÃ©:', barcode);
  
  const product = findProductByBarcode(barcode);
  if (product) {
    await selectProduct(product);
    success(`Produit trouvÃ©: ${product.nom}`);
  } else {
    error(`Produit non trouvÃ© pour le code: ${barcode}`);
  }
  
  // RÃ©initialiser le scanner
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

// Fonction pour dÃ©marrer le scan
const startBarcodeScan = () => {
  showBarcodeScanner.value = true;
  startScan();
};

// Fonction pour arrÃªter le scan
const stopBarcodeScan = () => {
  showBarcodeScanner.value = false;
  stopScan();
};

// SÃ©lection d'un produit depuis la liste de recherche
const selectProduct = async (product: Product) => {
  try {
    const token = process.client ? localStorage.getItem('access_token') : null;
    const boutiqueId = boutique.value?.id;
    
    if (!boutiqueId) {
      error("Boutique non trouvÃ©e");
      return;
    }
    
    // VÃ©rifier le stock disponible dans l'entrepÃ´t (forcer le rechargement sans cache)
    const timestamp = `&t=${Date.now()}`;
    const stockData = await $fetch(`${API_BASE_URL}/api/stocks/?entrepot=${boutiqueId}&produit=${product.id}${timestamp}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });

    const stockDisponible = getStockQuantity(stockData, product.quantite ?? 0);

    if (stockDisponible < 1) {
      error(`Stock insuffisant pour "${product.nom}". Stock actuel : ${stockDisponible} unitÃ©(s) dans cet entrepÃ´t.`);
      searchQuery.value = ''
      showProductSearch.value = false
      return;
    }
    
    // Mettre Ã  jour le stock dans la liste locale des produits
    const productIndex = products.value.findIndex(p => p.id === product.id);
    if (productIndex !== -1) {
      products.value[productIndex].quantite = stockDisponible;
      console.log(`[selectProduct] Stock mis Ã  jour pour ${product.nom}: ${stockDisponible}`);
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
    console.error("Erreur lors de la vÃ©rification du stock:", err);
    error("Erreur lors de la vÃ©rification du stock");
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

// Charger les donnÃ©es sauvegardÃ©es au montage
onMounted(async () => {
  // Programmer le nettoyage automatique
  scheduleCleanup()
  
  // Charger les donnÃ©es sauvegardÃ©es avec vÃ©rification d'expiration
  const savedInvoice = loadWithExpiration('invoice-draft')
  if (savedInvoice && Object.keys(savedInvoice).length > 0) {
    invoice.value = { ...invoice.value, ...savedInvoice }
    
    // VÃ©rifier l'avertissement d'expiration (silencieux)
    const warning = checkExpirationWarning('invoice-draft', 0.5) // 30 minutes avant expiration
    if (warning) {
      console.log(`DonnÃ©es restaurÃ©es - Expire dans ${warning.hoursLeft}h ${warning.minutesLeft}m`)
    } else {
      console.log('DonnÃ©es de facture restaurÃ©es depuis la sauvegarde automatique')
    }
  } else {
    invoice.value.number = generateInvoiceNumber()
  }

  // VÃ©rifier et rÃ©cupÃ©rer les donnÃ©es utilisateur si nÃ©cessaire
  console.log('VÃ©rification des donnÃ©es utilisateur au montage...');
  console.log('Utilisateur:', user.value);
  console.log('Boutique:', boutique.value);
  
  if (!user.value?.entreprise?.id || (!boutique.value?.id && !user.value?.boutique?.id)) {
    console.log('DonnÃ©es utilisateur incomplÃ¨tes, rÃ©cupÃ©ration depuis l\'API...');
    await fetchUserAndBoutiqueData();
    
    // VÃ©rifier Ã  nouveau aprÃ¨s rÃ©cupÃ©ration
    if (!user.value?.entreprise?.id) {
      console.error('Impossible de rÃ©cupÃ©rer les donnÃ©es entreprise');
    }
    if (!boutique.value?.id && !user.value?.boutique?.id) {
      console.error('Impossible de rÃ©cupÃ©rer les donnÃ©es boutique');
    }
  }

  // Chargement des donnÃ©es depuis les API
  await Promise.all([fetchProducts(), fetchPartners(), fetchClients()])

  // DÃ©marrer le scanner simple (plus rapide)
  await startSimpleScanner()

  // Ã‰couter les Ã©vÃ©nements de scan
  if (process.client) {
    window.addEventListener('barcode-scanned', handleBarcodeScanned)
  }
})

// Nettoyer les Ã©vÃ©nements au dÃ©montage
onUnmounted(() => {
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
  cleanup()
  realCleanup()
  simpleCleanup()
  if (process.client) {
    window.removeEventListener('barcode-scanned', handleBarcodeScanned)
  }
})

// Fonction pour gÃ©rer les codes scannÃ©s en arriÃ¨re-plan
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
  }, 2000) // Sauvegarde aprÃ¨s 2 secondes d'inactivitÃ©
}, { deep: true })

// Fonction pour effacer la sauvegarde aprÃ¨s enregistrement rÃ©ussi
const clearDraft = () => {
  clearFromLocalStorage('invoice-draft')
}

// Constantes pour la facture (donnÃ©es dynamiques basÃ©es sur l'entreprise connectÃ©e)
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
    notice: "Les Marchandises vendues ne sont ni reprises ni Ã©changÃ©es",
    warranty: "Garantie Produit â€“ Service AprÃ¨s-Vente\nCe produit est couvert par une garantie de 6 mois Ã  compter de la date d'achat figurant sur cette facture.\nEn cas de dysfonctionnement non causÃ© par une mauvaise utilisation, vous pouvez bÃ©nÃ©ficier d'un service aprÃ¨s-vente en prÃ©sentant cette facture.\n\n Cette garantie couvre uniquement les dÃ©fauts de fabrication et ne s'applique pas aux dommages physiques ou Ã  l'usure normale.\n\nPour toute demande de prise en charge, contactez notre service client."
  };
});

// GÃ©nÃ©ration PDF dÃ©lÃ©guÃ©e au composable useFacturePDF
const generatePDF = async (): Promise<boolean> => {
  try {
    const nomDestinataire = invoice.value.recipientType === 'client'
      ? `${invoice.value.client?.prenom || ''} ${invoice.value.client?.nom || ''}`.trim()
      : invoice.value.partenaire || ''
    const totalVal = total.value || 0
    const verseVal = invoice.value.montantVerse || 0
    const resteVal = Math.max(0, totalVal - verseVal)
    const statut = resteVal <= 0 ? 'PayÃ©' : verseVal > 0 ? 'Partiellement payÃ©' : 'En attente'

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
        nom: (item as any).nom || (item as any).produit_nom || '',
        reference: (item as any).reference || '',
        quantite: (item as any).quantite || 1,
        prix: (item as any).prix || 0,
      }))
    )
    return true
  } catch (err) {
    console.error('Erreur lors de la gÃ©nÃ©ration du PDF:', err);
    // NE PAS afficher d'erreur â€” le PDF est un bonus, pas bloquer la facture
    return false;
  }
};

// â€”â€”â€” Ancienne implÃ©mentation jsPDF supprimÃ©e â€”â€”â€”
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _obsolete_generatePDF_jsPDF = async () => { /* supprimÃ©e */ };

// Fonction pour convertir un nombre en lettres
const numberToWords = (number: number): string => {
  // Cette fonction devrait Ãªtre implÃ©mentÃ©e pour convertir les nombres en lettres
  // Pour l'instant, retourne une chaÃ®ne simple
  return number.toString();
};

// Fonction pour valider le prix de vente et mettre Ã  jour les totaux
const validatePrice = (item: InvoiceItem) => {
  const prixAchat = item.prix_achat || 0;
  const prixVente = item.price;
  
  const validation = validateSellingPrice(prixVente, prixAchat, 5); // Marge minimale de 5%
  
  if (!validation.isValid) {
    item.priceError = `Le prix de vente doit Ãªtre au moins ${formatCurrency(validation.minPrice)} FCFA (marge: ${validation.margin.toFixed(1)}%)`;
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
    error("Produit non trouvÃ©");
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
  if (isSubmitting.value) return; // EmpÃªcher les soumissions multiples
  
  try {
    isSubmitting.value = true; // Activer l'Ã©tat de soumission
    
    // RÃ©cupÃ©rer le token d'authentification
    const token = process.client ? localStorage.getItem('access_token') : null;
    
    // Validation des prix
    for (const item of invoice.value.items) {
      if (!validatePrice(item)) {
        return;
      }
    }

    // Utiliser l'ID de l'utilisateur connectÃ© pour created_by
    const userIdValue = userId.value; // Extraire la valeur du computed ref
    if (!userIdValue) { // VÃ©rifier si l'utilisateur est connectÃ©
        error("Utilisateur non connectÃ©.");
        return;
    }

    if (invoice.value.items.length === 0) {
      error("Veuillez ajouter au moins un article");
      return;
    }

    if (!invoice.value.recipientType) {
      error("Veuillez sÃ©lectionner un type de destinataire");
      return;
    }

    // VÃ©rifier le stock pour tous les articles avant de procÃ©der
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
        error(`Stock insuffisant pour ${item.name}: ${stockDisponible} disponible(s), ${item.quantity} demandÃ©(s)`);
        return;
      }
    }

    // Validation des champs requis
    console.log('Validation - Utilisateur:', user.value);
    console.log('Validation - Boutique:', boutique.value);
    
    if (!boutique.value?.id) {
      console.log('Tentative de rÃ©cupÃ©ration des donnÃ©es depuis l\'API...');
      await fetchUserAndBoutiqueData();
      
      if (!boutique.value?.id) {
        error("Boutique non trouvÃ©e. Veuillez vous reconnecter ou contacter l'administrateur.");
        return;
      }
    }

    // Le numÃ©ro de facture sera gÃ©nÃ©rÃ© automatiquement par le backend
    // Plus besoin de validation du champ number

    // Gestion des clients et partenaires
    let clientId = null;
    let partenaireId = null;
    
    if (invoice.value.recipientType === 'client') {
      // VÃ©rifier si le client existe dÃ©jÃ  dans la liste locale
      const clientsList = Array.isArray(allClients.value) ? allClients.value : parseApiList<Client>(allClients.value)
      const existingClient = clientsList.find(c => c.telephone === invoice.value.client?.telephone);
      
      if (existingClient) {
        clientId = existingClient.id;
        console.log('Client existant trouvÃ©:', existingClient);
      } else {
        // CrÃ©er le client seulement lors de la soumission de la facture
        if (!invoice.value.client?.nom || !invoice.value.client?.telephone) {
          error("Nom et tÃ©lÃ©phone du client sont requis");
          return;
        }
        
        try {
          console.log('CrÃ©ation du client lors de la soumission...');
          const newClient = await createClient(invoice.value.client);
          clientId = newClient.id;
          console.log('Client crÃ©Ã© lors de la soumission:', newClient);
        } catch (err: any) {
          console.error('Erreur lors de la crÃ©ation du client:', err);
          error("Erreur lors de la crÃ©ation du client");
          return;
        }
      }
    } else if (invoice.value.recipientType === 'partenaire') {
      // Trouver l'ID du partenaire sÃ©lectionnÃ©
      const selectedPartner = partners.value.find(p => 
        `${p.prenom} ${p.nom}` === invoice.value.partenaire
      );
      if (selectedPartner) {
        partenaireId = selectedPartner.id;
      }
    }
    
    // S'assurer que les valeurs numÃ©riques sont valides
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
    
    // VÃ©rifier que la boutique et l'utilisateur sont valides
    if (!boutique.value?.id) {
      error('Boutique invalide. Veuillez vous reconnecter.');
      return;
    }
    
    if (!userIdValue) {
      error('Utilisateur invalide. Veuillez vous reconnecter.');
      return;
    }
    
    // VÃ©rifier que client ou partenaire est dÃ©fini selon le type
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

    console.log('DonnÃ©es de facture envoyÃ©es:', factureData);
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
        justification_prix: item.justification || ''
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
      console.error('Erreur crÃ©ation facture transactionnelle:', err);
      
      let errorMessage = 'Erreur lors de la crÃ©ation de la facture. Veuillez rÃ©essayer.';
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
        errorMessage = 'Erreur temporaire. Veuillez rÃ©essayer dans quelques instants.';
      } else if (err.status === 401) {
        errorMessage = 'Session expirÃ©e. Veuillez vous reconnecter.';
      } else if (err.status === 403) {
        errorMessage = 'Vous n\'avez pas les permissions pour crÃ©er une facture.';
      } else if (err.status === 400) {
        errorMessage = 'DonnÃ©es invalides. VÃ©rifiez les informations saisies.';
      } else if (err.status === 500 || err.status === 502 || err.status === 503) {
        errorMessage = 'Erreur serveur. Veuillez rÃ©essayer plus tard.';
      } else if (err.name === 'FetchError' || err.message?.includes('fetch')) {
        errorMessage = 'Erreur de connexion. VÃ©rifiez votre connexion internet.';
      }
      
      error(errorMessage);
      isSubmitting.value = false;
      return;
    }

    if (!facture?.id) {
      error("Erreur lors de la crÃ©ation de la facture");
      console.error("DÃ©tails:", facture);
      return;
    }

    // Mettre Ã  jour le numÃ©ro de facture avec celui retournÃ© par le backend
    invoice.value.number = facture.numero;
    console.log('NumÃ©ro de facture gÃ©nÃ©rÃ©:', facture.numero);
    
    // Annuler le cache aprÃ¨s crÃ©ation de facture
    if (process.client) {
      const nuxtApp = useNuxtApp()
      if (nuxtApp.$invalidateCacheByPattern) {
        nuxtApp.$invalidateCacheByPattern('/api/factures')
        nuxtApp.$invalidateCacheByPattern('/api/commandes-client')
        nuxtApp.$invalidateCacheByPattern('/api/commandes-partenaire')
        nuxtApp.$invalidateCacheByPattern('/api/stocks')
        nuxtApp.$invalidateCacheByPattern('/api/produits')
        nuxtApp.$invalidateCacheByPattern('/api/mouvements-stock')
        console.log('[Cache] Cache invalidÃ© aprÃ¨s crÃ©ation de facture')
      }
    }

    // GÃ©nÃ©rer le PDF
    const pdfGenerated = await generatePDF();
    const typeLabel = invoice.value.recipientType === 'client' ? 'client' : 'partenaire';
    const savedNumber = facture.numero || invoice.value.number;

    if (pdfGenerated) {
      success(`Facture ${typeLabel} ${savedNumber} enregistrÃ©e et tÃ©lÃ©chargÃ©e`);
    } else {
      success(`Facture ${typeLabel} ${savedNumber} enregistrÃ©e avec succÃ¨s`);
    }
    clearDraft();

    // Recharger les produits pour mettre Ã  jour les stocks
    await fetchProducts(true);

    // RÃ©initialiser le formulaire pour une nouvelle vente
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
    console.error("Erreur complÃ¨te:", err);
  } finally {
    isSubmitting.value = false; // DÃ©sactiver l'Ã©tat de soumission
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
    <!-- En-tÃªte moderne -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-blue-400 mb-2"> Facturation</h1>
          <p class="text-gray-600 dark:text-gray-400">CrÃ©ez et gÃ©rez vos factures professionnelles</p>
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
                <!-- Client sÃ©lectionnÃ© -->
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
                        PrÃ©nom du client
                      </label>
                      <UInput 
                        id="clientPrenom" 
                        color="blue" 
                        variant="outline" 
                        v-model="invoice.client.prenom" 
                        placeholder="PrÃ©nom du client" 
                        @input="searchClientAutomatically"
                      />
                    </div>
                    <div>
                      <label for="clientTelephone" class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                        TÃ©lÃ©phone *
                      </label>
                      <UInput 
                        id="clientTelephone" 
                        color="blue" 
                        variant="outline" 
                        v-model="invoice.client.telephone"
                        placeholder="TÃ©lÃ©phone du client" 
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
                  
                  <!-- Suggestions de clients trouvÃ©s -->
                  <div v-if="clients.length > 0 && (invoice.client.nom || invoice.client.telephone)" class="mt-3">
                    <div class="text-sm text-gray-600 dark:text-gray-400 mb-2">Clients trouvÃ©s :</div>
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
                  
                  <!-- Liste complÃ¨te des clients de l'entreprise -->
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
                        <div class="text-sm text-gray-500 dark:text-gray-400">{{ client.telephone }} <span v-if="client.email">â€¢ {{ client.email }}</span></div>
                      </div>
                    </div>
                    <div v-else class="text-sm text-gray-500 dark:text-gray-400 p-2 text-center">
                      Aucun client enregistrÃ©
                    </div>
                  </div>
                  
                  <div class="mt-3 text-sm text-gray-600 dark:text-gray-400">
                    <UIcon name="i-heroicons-information-circle" class="h-4 w-4 inline mr-1" />
                    Le client sera crÃ©Ã© automatiquement lors de la validation de la facture
                  </div>
                </div>
              </template>

          <!-- Champs partenaire (affichÃ©s si type partenaire est sÃ©lectionnÃ©) -->
          <div class="sm:col-span-6" v-if="invoice.recipientType === 'partenaire'">
            <label for="partenaireSelect"
              class="block text-sm font-medium text-gray-700 dark:text-gray-200">SÃ©lectionner un
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
                  
                  <!-- SÃ©lecteur de type de scanner -->
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
                
                <!-- Boutons de contrÃ´le compacts -->
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
                    ArrÃªter
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
                    ? 'Scanner simple: Appuyez sur EntrÃ©e pour tester' 
                    : 'Scanner QuaggaJS: Pointez le code-barres vers la camÃ©ra' 
                  }}
                </div>
                
                <!-- Zones de scan (masquÃ©es) -->
                <div ref="scannerContainer" style="display: none;"></div>
                <video 
                  ref="simpleVideoRef"
                  style="display: none;"
                  autoplay
                  muted
                  playsinline
                ></video>
              </div>

      <!-- Ã‰lÃ©ment vidÃ©o cachÃ© pour la camÃ©ra -->
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
          placeholder="Rechercher un produit par rÃ©fÃ©rence ou nom"
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
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">Aucun produit chargÃ©.</p>
            <button @click="fetchProducts(true)" class="text-xs text-emerald-600 hover:underline font-medium">â†º Recharger les produits</button>
          </div>
          <!-- Aucun rÃ©sultat -->
          <div v-else-if="searchQuery.trim() && filteredProducts.length === 0" class="p-4 text-center">
            <p class="text-sm text-gray-500 dark:text-gray-400">Aucun produit trouvÃ© pour Â« {{ searchQuery }} Â»</p>
          </div>
          <!-- RÃ©sultats -->
          <template v-else>
            <div class="px-3 py-1.5 text-xs text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              {{ filteredProducts.length }} produit(s) â€” cliquer pour ajouter
            </div>
            <div v-for="product in filteredProducts"
                 :key="product.id"
                 @mousedown.prevent="selectProduct(product)"
                 class="flex items-center gap-3 px-3 py-2.5 border-b border-gray-100 dark:border-gray-700 last:border-0 transition-colors"
                 :class="product.quantite > 0
                   ? 'hover:bg-emerald-50 dark:hover:bg-emerald-900/10 cursor-pointer'
                   : 'hover:bg-red-50 dark:hover:bg-red-900/10 cursor-not-allowed opacity-60'"
            >
              <!-- Initiales produit -->
              <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
                :class="product.quantite > 0 ? 'bg-emerald-500' : 'bg-red-400'">
                {{ (product.nom || '?').substring(0, 2).toUpperCase() }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <span class="font-medium text-sm text-gray-900 dark:text-white truncate">{{ product.nom }}</span>
                  <span v-if="product.category" class="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded flex-shrink-0">{{ product.category }}</span>
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-0.5">
                  <span>RÃ©f: {{ product.reference || 'â€”' }}</span>
                  <span class="font-semibold" :class="product.quantite > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'">
                    Stock: {{ product.quantite ?? 0 }}
                  </span>
                </div>
              </div>
              <div class="text-right flex-shrink-0">
                <div class="font-semibold text-sm text-gray-900 dark:text-white">{{ formatCurrency(product.prix) }}</div>
                <div v-if="product.quantite <= 0" class="text-xs text-red-500 font-medium">Rupture</div>
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
            placeholder="Entrer un code-barres ou rÃ©fÃ©rence"
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
            {{ isScanning ? 'Scan...' : 'CamÃ©ra' }}
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
              <p class="text-gray-600">Pointez la camÃ©ra vers le code-barres...</p>
              <UButton @click="stopBarcodeScan" color="red">ArrÃªter le scan</UButton>
            </div>
            
            <div v-else class="space-y-4">
              <UIcon name="i-heroicons-qr-code" class="h-16 w-16 text-gray-400 mx-auto" />
              <p class="text-gray-600">Scanner prÃªt</p>
              <UButton @click="startBarcodeScan" color="blue">DÃ©marrer le scan</UButton>
            </div>
            
            <!-- Zone pour afficher le code scannÃ© -->
            <div v-if="scannedCode" class="mt-4 p-4 bg-green-50 rounded-lg">
              <p class="text-green-800 font-medium">Code scannÃ©: {{ scannedCode }}</p>
              <UButton @click="handleBarcodeScan(scannedCode)" color="green" class="mt-2">
                Ajouter le produit
              </UButton>
            </div>
          </div>
        </UCard>
      </UModal>

          <!-- Liste des articles ajoutÃ©s -->
          <div class="overflow-x-auto">
            <table class="w-full text-sm text-left text-gray-700 dark:text-gray-300 mt-3">
              <thead class="text-xs uppercase bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th class="px-4 py-2">RÃ©fÃ©rence</th>
                  <th class="px-4 py-2">Nom</th>
                  <th class="px-4 py-2">Description</th>
                  <th class="px-4 py-2">Prix de vente</th>
                  <th class="px-4 py-2">Justification</th>
                  <th class="px-4 py-2">QuantitÃ©</th>
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
                      <div v-if="item.generation">GÃ©nÃ©ration: {{ item.generation }}</div>
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

        <!-- Montant versÃ© et reste Ã  payer -->
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

          <!-- MÃ©thode de paiement -->
          <div class="mb-4">
            <label for="paymentMethod" class="block text-sm font-medium text-gray-700 dark:text-gray-200">MÃ©thode de paiement</label>
            <USelect 
              id="paymentMethod" 
              v-model="paymentMethod" 
              color="blue" 
              variant="outline" 
              class="mt-1"
              :options="[
                { value: 'cash', label: 'EspÃ¨ces' },
                { value: 'card', label: 'Carte bancaire' },
                { value: 'mobile', label: 'Mobile Money' },
                { value: 'transfer', label: 'Virement' },
                { value: 'check', label: 'ChÃ¨que' }
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

          <!-- RÃ©sumÃ© des totaux -->
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">RÃ©sumÃ© de la facture</h3>
            
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
                <span class="text-sm text-gray-500 dark:text-gray-300">Marge bÃ©nÃ©ficiaire :</span>
                <span class="text-sm font-medium" :class="totalMargin >= 0 ? 'text-green-600' : 'text-red-600'">
                  {{ totalMargin.toFixed(1) }}%
                </span>
              </div>
            </div>
          </div>

          <!-- Montant versÃ© -->
          <div class="mt-4 grid grid-cols-1 gap-y-2 sm:grid-cols-2 gap-x-4">
            <div>
              <label for="montantVerse" class="block text-sm font-medium text-gray-700 dark:text-gray-200">Montant
                versÃ©</label>
              <UInput id="montantVerse" color="blue" variant="outline" v-model="invoice.montantVerse" type="number"
                min="0" :max="total" class="mt-1" placeholder="Montant versÃ© par le client" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200">Reste Ã  payer</label>
              <div class="mt-3 text-lg font-bold" :class="reste > 0 ? 'text-red-500' : 'text-green-500'">
                {{ formatCurrency(reste) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Actions (centrÃ©es et responsives) -->
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
            {{ isSubmitting ? 'CrÃ©ation en cours...' : 'Enregistrer la Facture' }}
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
        <p><strong>NumÃ©ro de la Facture :</strong> {{ invoice.number }}</p>
        <p><strong>Date :</strong> {{ invoice.date }}</p>

        <div v-if="invoice.recipientType === 'client' && invoice.client">
          <p><strong>Client :</strong> {{ invoice.client.prenom }} {{ invoice.client.nom }}</p>
          <p><strong>TÃ©lÃ©phone :</strong> {{ invoice.client.telephone }}</p>
        </div>

        <div v-if="invoice.recipientType === 'partenaire'">
          <p><strong>Partenaire :</strong> {{ invoice.partenaire }}</p>
        </div>
      </div>

      <table class="w-full mb-6 border-collapse border">
        <thead>
          <tr class="bg-blue-50">
            <th class="border p-2 text-left">RÃ©fÃ©rence</th>
            <th class="border p-2 text-left">Description</th>
            <th class="border p-2 text-right">Prix</th>
            <th class="border p-2 text-right">QuantitÃ©</th>
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
                <div v-if="item.generation">GÃ©nÃ©ration: {{ item.generation }}</div>
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
