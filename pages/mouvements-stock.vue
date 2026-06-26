<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useApiBase } from "@/composables/useApiBase";
const { getApiUrl, getAuthHeaders } = useApiBase();
import { useNotification } from "../types/useNotification";
import { API_BASE_URL } from "@/constants";
import selecteur_date from "@/components/selecteur_date.vue";
import LoadingSkeleton from "@/components/LoadingSkeleton.vue";
import * as XLSX from 'xlsx';

// Interface pour les mouvements de stock
interface MouvementStock {
  id: number;
  produit: number;
  produit_nom: string;
  entrepot: number;
  entrepot_nom: string;
  type_mouvement: string;
  quantite: number;
  quantite_avant: number;
  quantite_apres: number;
  reference_document: string;
  motif: string;
  utilisateur: number;
  utilisateur_nom: string;
  created_at: string;
}

// Interface pour les filtres
interface FiltresMouvements {
  dateDebut: string;
  dateFin: string;
  typeMouvement: string;
  produit: string;
  entrepot: string;
  utilisateur: string;
  referenceDocument: string;
}

// Notifications
const { error, success, warning } = useNotification();

// États réactifs
const mouvements = ref<MouvementStock[]>([]);
const loading = ref(false);
const errorMessage = ref<string | null>(null);
const showExportModal = ref(false);
const showFilters = ref(false);
const showTransferModal = ref(false);
const showDetailsModal = ref(false);
const transferLoading = ref(false);
const selectedMouvement = ref<MouvementStock | null>(null);

// Données pour les transferts
const entrepots = ref<any[]>([]);
const produitsAvecStock = ref<any[]>([]);

// Filtres
const filtres = ref<FiltresMouvements>({
  dateDebut: '',
  dateFin: '',
  typeMouvement: '',
  produit: '',
  entrepot: '',
  utilisateur: '',
  referenceDocument: ''
});

// Pagination - Réduite pour tenir sur une page
const page = ref(1);
const pageCount = 10; // Réduit de 20 à 10
const totalMouvements = ref(0);

// Formulaire de transfert
const transfertForm = ref({
  produitId: 0,
  produitNom: '',
  entrepotDestination: 0,
  quantite: 1,
  motif: ''
});

// Options pour les filtres
const typesMouvement = [
  { value: '', label: 'Tous les types' },
  { value: 'entree', label: 'Entrée' },
  { value: 'sortie', label: 'Sortie' },
  { value: 'ajustement', label: 'Ajustement' },
  { value: 'transfert', label: 'Transfert' },
  { value: 'perte', label: 'Perte' },
  { value: 'retour', label: 'Retour' }
];

// Fonction pour récupérer la boutique actuelle
const getCurrentBoutique = () => {
  if (process.client) {
    const boutiqueData = localStorage.getItem('boutique');
    if (boutiqueData) {
      try {
        return JSON.parse(boutiqueData);
      } catch (e) {
        console.error('Erreur parsing boutique:', e);
      }
    }
  }
  return null;
};

// Fonction pour récupérer les données utilisateur et boutique depuis l'API
const fetchUserAndBoutiqueData = async () => {
  try {
    const token = process.client ? localStorage.getItem('access_token') : null;
    if (!token) return;

    const userData: any = await $fetch(getApiUrl(`/api/user/me/`), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (userData && userData.boutique?.id) {
      const boutiqueData: any = await $fetch(getApiUrl(`/api/boutiques/${userData.boutique.id}/`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (boutiqueData && process.client) {
        localStorage.setItem('boutique', JSON.stringify(boutiqueData));
        console.log('✅ Données boutique mises à jour:', boutiqueData);
        return boutiqueData;
      }
    }
  } catch (err) {
    console.error('❌ Erreur lors de la récupération des données:', err);
  }
  return null;
};

// Charger les entrepôts de l'entreprise (excluant l'entrepôt actuel)
const chargerEntrepots = async () => {
  try {
    const token = process.client ? localStorage.getItem('access_token') : null;
    if (!token) return;

    // Utiliser directement l'API boutiques qui filtre automatiquement par entreprise
    const response = await $fetch(getApiUrl(`/api/boutiques/`), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    // Filtrer l'entrepôt actuel
    let boutique = getCurrentBoutique();
    if (!boutique || !boutique.id) {
      boutique = await fetchUserAndBoutiqueData();
    }

    entrepots.value = Array.isArray(response) 
      ? response.filter(e => e.id !== boutique?.id) // Exclure l'entrepôt actuel
      : [];
    
    console.log(`✅ ${entrepots.value.length} entrepôts de destination chargés`);
    console.log('📋 Entrepôts disponibles:', entrepots.value.map(e => `${e.nom} (ID: ${e.id})`));
  } catch (err) {
    console.error('❌ Erreur lors du chargement des entrepôts:', err);
  }
};

// Charger les produits avec stock pour les transferts
const chargerProduitsAvecStock = async () => {
  try {
    const token = process.client ? localStorage.getItem('access_token') : null;
    let boutique = getCurrentBoutique();
    
    if (!boutique || !boutique.id) {
      boutique = await fetchUserAndBoutiqueData();
    }
    
    if (!boutique || !boutique.id) return;

    // Récupérer les stocks de l'entrepôt actuel
    const stocksData = await $fetch(getApiUrl(`/api/stocks/?entrepot=${boutique.id}`), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });

    if (!Array.isArray(stocksData) || stocksData.length === 0) return;

    // Récupérer les détails des produits
    const productIds = stocksData.map(stock => stock.produit).join(',');
    const productsData = await $fetch(getApiUrl(`/api/produits/?id__in=${productIds}`), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });

    // Combiner les données
    const stockMap = new Map();
    stocksData.forEach(stock => {
      stockMap.set(stock.produit, stock);
    });

    produitsAvecStock.value = Array.isArray(productsData)
      ? productsData.map((p: any) => {
          const stock = stockMap.get(p.id);
          return {
            id: p.id,
            nom: p.nom,
            reference: p.reference || 'N/A',
            quantiteStock: stock ? stock.quantite : 0,
            prix: p.prix || 0
          };
        }).filter(p => p.quantiteStock > 0)
      : [];

    console.log(`✅ ${produitsAvecStock.value.length} produits avec stock chargés pour transfert`);
  } catch (err) {
    console.error('❌ Erreur lors du chargement des produits:', err);
  }
};

// Effectuer un transfert de stock
const effectuerTransfert = async () => {
  try {
    transferLoading.value = true;
    if (!transfertForm.value.produitId || !transfertForm.value.entrepotDestination || !transfertForm.value.quantite) {
      error('Veuillez remplir tous les champs obligatoires');
      transferLoading.value = false;
      return;
    }

    if (entrepots.value.length === 0) {
      error('Aucun entrepôt de destination disponible dans l\'entreprise');
      transferLoading.value = false;
      return;
    }

    const token = process.client ? localStorage.getItem('access_token') : null;
    let boutique = getCurrentBoutique();
    
    if (!boutique || !boutique.id) {
      boutique = await fetchUserAndBoutiqueData();
    }
    
    if (!boutique || !boutique.id) {
      error('Aucune boutique sélectionnée');
      transferLoading.value = false;
      return;
    }

    // Vérifier le stock disponible dans l'entrepôt actuel via l'API
    const stockResponse = await $fetch(getApiUrl(`/api/stocks/?entrepot=${boutique.id}&produit=${transfertForm.value.produitId}`), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });

    const stockData = Array.isArray(stockResponse) && stockResponse.length > 0 ? stockResponse[0] : null;
    
    if (!stockData || stockData.quantite < transfertForm.value.quantite) {
      const stockDisponible = stockData ? stockData.quantite : 0;
      error(`Stock insuffisant ! Stock disponible: ${stockDisponible}, Quantité demandée: ${transfertForm.value.quantite}`);
      transferLoading.value = false;
      return;
    }

    // Utiliser le nouveau endpoint de transfert avec envoi d'emails
    const response: any = await $fetch(getApiUrl(`/api/mouvements-stock/transfert_stock/`), {
      method: 'POST',
      body: {
        produit: transfertForm.value.produitId,
        entrepot_source: boutique.id,
        entrepot_destination: transfertForm.value.entrepotDestination,
        quantite: transfertForm.value.quantite,
        motif: transfertForm.value.motif
      },
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });

    if ((response as any)?.success) {
      success(`Transfert effectué avec succès! Référence: ${response.reference_transfert}`);
      if ((response as any)?.emails_sent) {
        success('Emails de notification envoyés aux personnes concernées');
      }
    } else {
      error((response as any)?.error || 'Erreur lors du transfert');
      transferLoading.value = false;
      return;
    }
    showTransferModal.value = false;
    
    // Réinitialiser le formulaire
    transfertForm.value = {
      produitId: 0,
      produitNom: '',
      entrepotDestination: 0,
      quantite: 1,
      motif: ''
    };

    // Recharger les données
    await chargerMouvements();
    await chargerProduitsAvecStock();

  } catch (err: any) {
    console.error('❌ Erreur lors du transfert:', err);
    error('Erreur lors du transfert: ' + (err.message || 'Erreur inconnue'));
  } finally {
    transferLoading.value = false;
  }
};

// Chargement des mouvements de stock
const chargerMouvements = async () => {
  try {
    loading.value = true;
    errorMessage.value = null;

    const token = process.client ? localStorage.getItem('access_token') : null;
    let boutique = getCurrentBoutique();
    
    // Si pas de boutique en localStorage, essayer de la récupérer depuis l'API
    if (!boutique || !boutique.id) {
      console.log("🔄 Tentative de récupération des données boutique depuis l'API...");
      boutique = await fetchUserAndBoutiqueData();
    }
    
    if (!boutique || !boutique.id) {
      errorMessage.value = "Aucune boutique sélectionnée";
      return;
    }

    // Construire l'URL avec les filtres
    let url = getApiUrl(`/api/mouvements-stock/?entrepot=${boutique.id}`);
    
    // Ajouter les filtres de date
    if (filtres.value.dateDebut) {
      url += `&created_at__gte=${filtres.value.dateDebut}`;
    }
    if (filtres.value.dateFin) {
      url += `&created_at__lte=${filtres.value.dateFin}`;
    }
    
    // Ajouter les autres filtres
    if (filtres.value.typeMouvement) {
      url += `&type_mouvement=${filtres.value.typeMouvement}`;
    }
    if (filtres.value.produit) {
      url += `&produit__nom__icontains=${filtres.value.produit}`;
    }
    if (filtres.value.utilisateur) {
      url += `&utilisateur__username__icontains=${filtres.value.utilisateur}`;
    }
    if (filtres.value.referenceDocument) {
      url += `&reference_document__icontains=${filtres.value.referenceDocument}`;
    }

    console.log("🔍 URL de requête:", url);

    const mouvementsRaw: any = await $fetch(url, { headers: getAuthHeaders() });

    // Vérifier si c'est une structure paginée ou une liste directe
    let mouvementsList: any[] = [];
    if (Array.isArray(mouvementsRaw)) {
      mouvementsList = mouvementsRaw;
    } else if (mouvementsRaw && typeof mouvementsRaw === 'object' && 'results' in mouvementsRaw) {
      mouvementsList = mouvementsRaw.results || [];
    }

    mouvements.value = mouvementsList;
    totalMouvements.value = mouvements.value.length;
    
    console.log(`✅ ${mouvements.value.length} mouvements chargés`);

  } catch (err: any) {
    console.error("❌ Erreur lors du chargement des mouvements:", err);
    errorMessage.value = "Erreur lors du chargement des mouvements";
  } finally {
    loading.value = false;
  }
};

// Filtre rapide par type (chips)
const filtreRapide = ref<string>('')

const mouvementsFiltresRapide = computed(() => {
  if (!filtreRapide.value) return mouvements.value
  return mouvements.value.filter(m => m.type_mouvement === filtreRapide.value)
})

// Mouvements filtrés avec pagination
const mouvementsFiltres = computed(() => {
  const list = mouvementsFiltresRapide.value
  const start = (page.value - 1) * pageCount;
  const end = start + pageCount;
  return list.slice(start, end);
});

const totalFiltresRapide = computed(() => mouvementsFiltresRapide.value.length)

// KPIs du jour
const today = new Date().toISOString().slice(0, 10)
const entreesAujourdhui = computed(() => mouvements.value.filter(m => m.type_mouvement === 'entree' && m.created_at?.slice(0, 10) === today).length)
const sortiesAujourdhui = computed(() => mouvements.value.filter(m => m.type_mouvement === 'sortie' && m.created_at?.slice(0, 10) === today).length)
const transfertsAujourdhui = computed(() => mouvements.value.filter(m => m.type_mouvement === 'transfert' && m.created_at?.slice(0, 10) === today).length)

const setFiltreRapide = (type: string) => {
  filtreRapide.value = filtreRapide.value === type ? '' : type
  page.value = 1
}

// Fonction pour formater la date
const formaterDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Fonction pour obtenir la couleur du type de mouvement
const getTypeColor = (type: string) => {
  const colors = {
    'entree': 'text-green-600 bg-green-100',
    'sortie': 'text-red-600 bg-red-100',
    'ajustement': 'text-green-600 bg-green-100',
    'transfert': 'text-purple-600 bg-purple-100',
    'perte': 'text-orange-600 bg-orange-100',
    'retour': 'text-indigo-600 bg-indigo-100'
  };
  return colors[type as keyof typeof colors] || 'text-gray-600 bg-gray-100';
};

// Fonction pour obtenir le libellé du type de mouvement
const getTypeLabel = (type: string) => {
  const labels = {
    'entree': 'Entrée',
    'sortie': 'Sortie',
    'ajustement': 'Ajustement',
    'transfert': 'Transfert',
    'perte': 'Perte',
    'retour': 'Retour'
  };
  return labels[type as keyof typeof labels] || type;
};

// Déterminer entrée/sortie de manière robuste (gère accents/casse et fallback via avant/après)
const isEntryMovement = (m: MouvementStock) => {
  const t = (m.type_mouvement || '').toString().toLowerCase();
  if (t.includes('entr')) return true; // "entrée", "entree"
  if (t.includes('sort')) return false; // "sortie"
  // Fallback: si stock après >= stock avant => entrée
  return Number(m.quantite_apres || 0) >= Number(m.quantite_avant || 0);
};
const getSignedQuantity = (m: MouvementStock) => {
  const q = Number(m.quantite || 0) || 0;
  return isEntryMovement(m) ? q : -q;
};

// Fonction pour voir les détails d'un mouvement
const voirDetails = (mouvement: MouvementStock) => {
  selectedMouvement.value = mouvement;
  showDetailsModal.value = true;
};

// Fonction pour effacer les filtres
const effacerFiltres = () => {
  filtres.value = {
    dateDebut: '',
    dateFin: '',
    typeMouvement: '',
    produit: '',
    entrepot: '',
    utilisateur: '',
    referenceDocument: ''
  };
  page.value = 1;
  chargerMouvements();
};

// Fonction pour appliquer les filtres
const appliquerFiltres = () => {
  page.value = 1;
  chargerMouvements();
};

// Fonction d'export Excel
const exporterExcel = async () => {
  try {
    if (!mouvements.value || mouvements.value.length === 0) {
      warning('Aucun mouvement à exporter');
      return;
    }

    console.log('=== EXPORT EXCEL MOUVEMENTS STOCK ===');
    console.log(`Export de ${mouvements.value.length} mouvements`);

    // Importer SheetJS dynamiquement
    const XLSX = await import('xlsx');

    // En-têtes pour l'export comptable
    const headers = [
      'Date/Heure',
      'Type Mouvement',
      'Produit',
      'Entrepôt',
      'Quantité',
      'Stock Avant',
      'Stock Après',
      'Référence Document',
      'Motif',
      'Utilisateur',
      'ID Mouvement'
    ];

    // Préparer les données
    const data = mouvements.value.map((mouvement) => [
      formaterDate(mouvement.created_at),
      getTypeLabel(mouvement.type_mouvement),
      mouvement.produit_nom,
      mouvement.entrepot_nom,
      mouvement.quantite,
      mouvement.quantite_avant,
      mouvement.quantite_apres,
      mouvement.reference_document || '',
      mouvement.motif || '',
      mouvement.utilisateur_nom || '',
      mouvement.id
    ]);

    // Créer le workbook
    const wb = XLSX.utils.book_new();

    // Créer la feuille de calcul
    const ws_data = [headers, ...data];
    const ws = XLSX.utils.aoa_to_sheet(ws_data);

    // Définir les largeurs de colonnes
    const colWidths = [
      { wch: 20 }, // Date/Heure
      { wch: 15 }, // Type Mouvement
      { wch: 25 }, // Produit
      { wch: 20 }, // Entrepôt
      { wch: 12 }, // Quantité
      { wch: 12 }, // Stock Avant
      { wch: 12 }, // Stock Après
      { wch: 20 }, // Référence Document
      { wch: 30 }, // Motif
      { wch: 20 }, // Utilisateur
      { wch: 12 }  // ID Mouvement
    ];
    ws['!cols'] = colWidths;

    // Ajouter la feuille au workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Mouvements Stock');

    // Générer le fichier Excel
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const filename = `mouvements_stock_${timestamp}.xlsx`;

    console.log('Génération du fichier:', filename);

    // Télécharger le fichier
    XLSX.writeFile(wb, filename);

    success(`Export Excel réussi! ${data.length} mouvement(s) exporté(s) dans le fichier ${filename}`);
    showExportModal.value = false;

    console.log('=== EXPORT TERMINÉ AVEC SUCCÈS ===');

  } catch (err: any) {
    console.error('Erreur lors de l\'export Excel:', err);
    error('Erreur lors de l\'export Excel: ' + (err.message || 'Erreur inconnue'));
  }
};

// Fonction d'export CSV
const exporterCSV = () => {
  if (!mouvements.value || mouvements.value.length === 0) {
    warning('Aucun mouvement à exporter');
    return;
  }

  // Fonction pour échapper les caractères spéciaux dans CSV
  const escapeCSVField = (field: any) => {
    if (field === null || field === undefined) return '';
    const str = String(field);
    const escaped = str.replace(/"/g, '""');
    if (escaped.includes(',') || escaped.includes('"') || escaped.includes('\n') || escaped.includes('\r')) {
      return `"${escaped}"`;
    }
    return escaped;
  };

  // Créer un CSV avec les en-têtes
  const csvContent = `Date/Heure,Type Mouvement,Produit,Entrepôt,Quantité,Stock Avant,Stock Après,Référence Document,Motif,Utilisateur,ID Mouvement
${mouvements.value.map((mouvement) => [
    escapeCSVField(formaterDate(mouvement.created_at)),
    escapeCSVField(getTypeLabel(mouvement.type_mouvement)),
    escapeCSVField(mouvement.produit_nom),
    escapeCSVField(mouvement.entrepot_nom),
    escapeCSVField(mouvement.quantite),
    escapeCSVField(mouvement.quantite_avant),
    escapeCSVField(mouvement.quantite_apres),
    escapeCSVField(mouvement.reference_document || ''),
    escapeCSVField(mouvement.motif || ''),
    escapeCSVField(mouvement.utilisateur_nom || ''),
    escapeCSVField(mouvement.id)
  ].join(',')).join('\n')}`;

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mouvements_stock_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);

  success('Export CSV réussi! Le fichier a été téléchargé.');
  showExportModal.value = false;
};

// ——— NOUVEAU MOUVEMENT ———
const showNouveauMouvementModal = ref(false)
const nouveauType = ref<'entree' | 'sortie' | 'ajustement' | 'perte' | 'retour'>('entree')
const nouveauProduitSearch = ref('')
const nouveauProduitId = ref<number | null>(null)
const nouveauProduitNom = ref('')
const nouveauQuantite = ref<number>(1)
const nouveauMotif = ref('')
const nouveauReference = ref('')
const nouveauLoading = ref(false)
const produitsSuggestions = ref<any[]>([])
const showProduitDropdown = ref(false)
let searchTimer: ReturnType<typeof setTimeout> | null = null

const searchProduits = async (q: string) => {
  if (!q || q.length < 2) { produitsSuggestions.value = []; return }
  try {
    const boutique = getCurrentBoutique()
    const h = getAuthHeaders()
    const entrepriseId = boutique?.entreprise?.id ?? (typeof boutique?.entreprise === 'number' ? boutique?.entreprise : null)
    let url = getApiUrl(`/api/produits/?search=${encodeURIComponent(q)}`)
    if (entrepriseId) url += `&entreprise=${entrepriseId}`
    const raw: any = await $fetch(url, { headers: h })
    const list = Array.isArray(raw) ? raw : (raw?.results ?? [])
    produitsSuggestions.value = list.slice(0, 8)
  } catch { produitsSuggestions.value = [] }
}

const onProduitInput = (e: Event) => {
  const val = (e.target as HTMLInputElement).value
  nouveauProduitSearch.value = val
  nouveauProduitId.value = null
  showProduitDropdown.value = true
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => searchProduits(val), 300)
}

const selectProduit = (p: any) => {
  nouveauProduitId.value = p.id
  nouveauProduitNom.value = p.nom
  nouveauProduitSearch.value = p.nom
  showProduitDropdown.value = false
}

const ouvrirNouveauMouvementModal = () => {
  nouveauType.value = 'entree'
  nouveauProduitSearch.value = ''
  nouveauProduitId.value = null
  nouveauProduitNom.value = ''
  nouveauQuantite.value = 1
  nouveauMotif.value = ''
  nouveauReference.value = ''
  produitsSuggestions.value = []
  showNouveauMouvementModal.value = true
}

const creerMouvement = async () => {
  if (!nouveauProduitId.value) { error('Sélectionnez un produit'); return }
  if (!nouveauQuantite.value || nouveauQuantite.value <= 0) { error('Quantité invalide'); return }
  const boutique = getCurrentBoutique()
  if (!boutique?.id) { error('Aucun entrepôt sélectionné. Reconnectez-vous.'); return }
  nouveauLoading.value = true
  try {
    const h = getAuthHeaders()
    await $fetch(getApiUrl('/api/mouvements-stock/'), {
      method: 'POST',
      headers: { ...h, 'Content-Type': 'application/json' },
      body: {
        produit: nouveauProduitId.value,
        entrepot: boutique.id,
        type_mouvement: nouveauType.value,
        quantite: nouveauQuantite.value,
        motif: nouveauMotif.value || '',
        reference_document: nouveauReference.value || '',
      }
    })
    success('Mouvement créé avec succès')
    showNouveauMouvementModal.value = false
    await chargerMouvements()
    await chargerProduitsAvecStock()
  } catch (e: any) {
    const msg = e?.data?.detail || e?.data?.non_field_errors?.[0] || e?.message || 'Erreur lors de la création'
    error(msg)
  } finally {
    nouveauLoading.value = false
  }
}

// Auto-refresh
const lastUpdated = ref<Date | null>(null)
const isRefreshing = ref(false)
let refreshTimer: ReturnType<typeof setInterval> | null = null

const lastUpdatedLabel = computed(() => {
  if (!lastUpdated.value) return ''
  const diff = Math.floor((Date.now() - lastUpdated.value.getTime()) / 1000)
  if (diff < 5) return 'À l\'instant'
  if (diff < 60) return `Il y a ${diff}s`
  return `Il y a ${Math.floor(diff / 60)}min`
})

const rafraichirDonnees = async () => {
  isRefreshing.value = true
  await chargerMouvements()
  isRefreshing.value = false
  lastUpdated.value = new Date()
}

// Initialisation
onMounted(async () => {
  await Promise.all([
    chargerMouvements(),
    chargerEntrepots(),
    chargerProduitsAvecStock()
  ]);
  lastUpdated.value = new Date()
  refreshTimer = setInterval(rafraichirDonnees, 30_000)
});

onUnmounted(() => { if (refreshTimer) clearInterval(refreshTimer) })
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
  <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
    <!-- En-tête de la page -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Mouvements de Stock</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-2">
          Historique complet des flux
          <span v-if="lastUpdatedLabel" class="inline-flex items-center gap-1 text-xs text-gray-400 dark:text-gray-600">
            <UIcon name="i-heroicons-arrow-path" class="w-3 h-3" :class="{ 'animate-spin': isRefreshing }" />
            {{ lastUpdatedLabel }}
          </span>
        </p>
      </div>
      <div class="flex flex-wrap gap-2">
        <button @click="rafraichirDonnees" :disabled="isRefreshing" class="inline-flex items-center gap-2 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50">
          <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" :class="{ 'animate-spin': isRefreshing }" />
          Rafraîchir
        </button>
        <button @click="ouvrirNouveauMouvementModal" class="inline-flex items-center gap-2 px-3 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors">
          <UIcon name="i-heroicons-plus" class="w-4 h-4" />
          Nouveau
        </button>
        <button @click="showTransferModal = true" class="inline-flex items-center gap-2 px-3 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
          <UIcon name="i-heroicons-arrows-right-left" class="w-4 h-4" />
          Transfert
        </button>
        <button @click="showFilters = !showFilters" class="inline-flex items-center gap-2 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" :class="showFilters ? 'ring-2 ring-emerald-500' : ''">
          <UIcon name="i-heroicons-funnel" class="w-4 h-4 text-gray-500" />
          Filtres
        </button>
        <button @click="showExportModal = true" class="inline-flex items-center gap-2 px-3 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors">
          <UIcon name="i-heroicons-arrow-down-tray" class="w-4 h-4" />
          Export
        </button>
      </div>
    </div>

    <!-- Panneau de filtres -->
    <div v-if="showFilters" class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-6 border">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Filtre Date Début -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Date Début
          </label>
          <UInput
            v-model="filtres.dateDebut"
            type="date"
            placeholder="Date de début"
          />
        </div>

        <!-- Filtre Date Fin -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Date Fin
          </label>
          <UInput
            v-model="filtres.dateFin"
            type="date"
            placeholder="Date de fin"
          />
        </div>

        <!-- Filtre Type Mouvement -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Type de Mouvement
          </label>
          <USelect
            v-model="filtres.typeMouvement"
            :options="typesMouvement"
            placeholder="Sélectionner un type"
          />
        </div>

        <!-- Filtre Produit -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Produit
          </label>
          <UInput
            v-model="filtres.produit"
            placeholder="Rechercher un produit"
          />
        </div>

        <!-- Filtre Utilisateur -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Utilisateur
          </label>
          <UInput
            v-model="filtres.utilisateur"
            placeholder="Rechercher un utilisateur"
          />
        </div>

        <!-- Filtre Référence Document -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Référence Document
          </label>
          <UInput
            v-model="filtres.referenceDocument"
            placeholder="Ex: FA22-251014-0011"
          />
        </div>
      </div>

      <!-- Boutons d'action pour les filtres (responsives) -->
      <div class="flex flex-wrap gap-3 mt-4">
        <UButton color="blue" @click="appliquerFiltres" class="w-full sm:w-auto">
          Appliquer les Filtres
        </UButton>
        <UButton color="gray" variant="outline" @click="effacerFiltres" class="w-full sm:w-auto">
          Effacer les Filtres
        </UButton>
      </div>
    </div>

    <!-- Message d'erreur -->
    <div v-if="errorMessage" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
      <div class="flex">
        <svg class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800 dark:text-red-200">
            Erreur
          </h3>
          <div class="mt-2 text-sm text-red-700 dark:text-red-300">
            {{ errorMessage }}
          </div>
        </div>
      </div>
    </div>

    <!-- KPIs mouvements — cliquables comme filtres rapides -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Total — reset filtre -->
      <button @click="setFiltreRapide('')" class="bg-white dark:bg-gray-800 rounded-xl border-2 p-4 text-left transition-all" :class="filtreRapide === '' ? 'border-blue-500 shadow-md' : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'">
        <p class="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Total chargés</p>
        <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ totalMouvements }}</p>
        <p class="text-xs text-gray-400 mt-1">Aujourd'hui : {{ entreesAujourdhui + sortiesAujourdhui + transfertsAujourdhui }}</p>
      </button>
      <!-- Entrées -->
      <button @click="setFiltreRapide('entree')" class="bg-white dark:bg-gray-800 rounded-xl border-2 p-4 text-left transition-all" :class="filtreRapide === 'entree' ? 'border-emerald-500 shadow-md' : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300'">
        <p class="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">↑ Entrées</p>
        <p class="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{{ mouvements.filter(m => m.type_mouvement === 'entree').length }}</p>
        <p class="text-xs text-emerald-500 mt-1">Aujourd'hui : {{ entreesAujourdhui }}</p>
      </button>
      <!-- Sorties -->
      <button @click="setFiltreRapide('sortie')" class="bg-white dark:bg-gray-800 rounded-xl border-2 p-4 text-left transition-all" :class="filtreRapide === 'sortie' ? 'border-red-500 shadow-md' : 'border-gray-200 dark:border-gray-700 hover:border-red-300'">
        <p class="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">↓ Sorties</p>
        <p class="text-2xl font-bold text-red-600 dark:text-red-400">{{ mouvements.filter(m => m.type_mouvement === 'sortie').length }}</p>
        <p class="text-xs text-red-500 mt-1">Aujourd'hui : {{ sortiesAujourdhui }}</p>
      </button>
      <!-- Transferts -->
      <button @click="setFiltreRapide('transfert')" class="bg-white dark:bg-gray-800 rounded-xl border-2 p-4 text-left transition-all" :class="filtreRapide === 'transfert' ? 'border-purple-500 shadow-md' : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'">
        <p class="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">⇄ Transferts</p>
        <p class="text-2xl font-bold text-purple-600 dark:text-purple-400">{{ mouvements.filter(m => m.type_mouvement === 'transfert').length }}</p>
        <p class="text-xs text-purple-500 mt-1">Aujourd'hui : {{ transfertsAujourdhui }}</p>
      </button>
    </div>

    <!-- Filtre actif badge -->
    <div v-if="filtreRapide" class="flex items-center gap-2">
      <span class="text-sm text-gray-600 dark:text-gray-400">Filtre actif :</span>
      <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
        :class="{
          'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400': filtreRapide === 'entree',
          'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400': filtreRapide === 'sortie',
          'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400': filtreRapide === 'transfert',
        }">
        {{ getTypeLabel(filtreRapide) }}
        <button @click="filtreRapide = ''" class="ml-1 hover:opacity-70">✕</button>
      </span>
      <span class="text-xs text-gray-400">{{ totalFiltresRapide }} résultat(s)</span>
    </div>

    <!-- Tableau des mouvements -->
    <div class="bg-white dark:bg-gray-800 rounded-lg border shadow-sm">
      <div v-if="loading" class="p-8 text-center">
        <div class="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-blue-500">
          <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Chargement des mouvements...
        </div>
      </div>

      <div v-else-if="mouvementsFiltres.length === 0" class="p-8 text-center text-gray-500 dark:text-gray-400">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">Aucun mouvement trouvé</h3>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Aucun mouvement de stock ne correspond aux critères sélectionnés.
        </p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Date
              </th>
              <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Type
              </th>
              <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Produit
              </th>
              <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Qté
              </th>
              <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Avant
              </th>
              <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Après
              </th>
              <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Réf.
              </th>
              <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Utilisateur
              </th>
              <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <!-- Skeleton de chargement -->
            <template v-if="loading">
              <tr v-for="i in 5" :key="`skeleton-${i}`">
                <td v-for="j in 8" :key="`cell-${i}-${j}`" class="px-3 py-2">
                  <LoadingSkeleton type="default" />
                </td>
              </tr>
            </template>
            
            <!-- Données réelles -->
            <template v-else>
              <tr v-for="mouvement in mouvementsFiltres" :key="mouvement.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td class="px-3 py-2 whitespace-nowrap text-xs">
                <div class="font-medium text-gray-900 dark:text-white">{{ new Date(mouvement.created_at).toLocaleDateString('fr-FR') }}</div>
                <div class="text-gray-400 dark:text-gray-500">{{ new Date(mouvement.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }}</div>
              </td>
              <td class="px-3 py-2 whitespace-nowrap">
                <span :class="getTypeColor(mouvement.type_mouvement)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                  {{ getTypeLabel(mouvement.type_mouvement) }}
                </span>
              </td>
              <td class="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-900 dark:text-white">
                {{ mouvement.produit_nom }}
              </td>
              <td class="px-3 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-white">
                <span :class="getSignedQuantity(mouvement) >= 0 ? 'text-green-600' : 'text-red-600'" class="font-semibold">
                  {{ getSignedQuantity(mouvement) >= 0 ? '+' : '' }}{{ getSignedQuantity(mouvement) }}
                </span>
              </td>
              <td class="px-3 py-2 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                {{ mouvement.quantite_avant }}
              </td>
              <td class="px-3 py-2 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                {{ mouvement.quantite_apres }}
              </td>
              <td class="px-3 py-2 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                {{ mouvement.reference_document || '-' }}
              </td>
              <td class="px-3 py-2 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                {{ mouvement.utilisateur_nom || '-' }}
              </td>
              <td class="px-3 py-2 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                <UButton
                  color="blue"
                  size="xs"
                  @click="voirDetails(mouvement)"
                  class="flex items-center gap-1"
                >
                  <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                  Détails
                </UButton>
              </td>
            </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalFiltresRapide > pageCount" class="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{ (page - 1) * pageCount + 1 }}–{{ Math.min(page * pageCount, totalFiltresRapide) }} sur {{ totalFiltresRapide }}
        </p>
        <UPagination v-model="page" :total="totalFiltresRapide" :page-count="pageCount" :active-button="{ variant: 'solid', color: 'emerald' }" :inactive-button="{ color: 'gray' }" />
      </div>
    </div>

    <!-- Modal d'export -->
    <UModal v-model="showExportModal">
      <div class="p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Exporter les Mouvements de Stock
        </h3>
        
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Choisissez le format d'export pour les {{ mouvements.length }} mouvements de stock.
        </p>

        <div class="space-y-3">
          <UButton
            color="green"
            @click="exporterExcel"
            class="w-full flex items-center justify-center gap-2"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            Exporter en Excel (.xlsx)
          </UButton>

          <UButton
            color="blue"
            variant="outline"
            @click="exporterCSV"
            class="w-full flex items-center justify-center gap-2"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            Exporter en CSV (.csv)
          </UButton>
        </div>

        <div class="mt-6 flex justify-end">
          <UButton
            color="gray"
            variant="outline"
            @click="showExportModal = false"
          >
            Annuler
          </UButton>
        </div>
      </div>
    </UModal>

    <!-- Modal de Transfert de Stock -->
    <UModal v-model="showTransferModal" :ui="{ width: 'sm:max-w-lg' }">
      <div class="p-6">
        <div class="flex items-center justify-between mb-5">
          <h3 class="text-base font-semibold text-gray-900 dark:text-white">Transfert de stock</h3>
          <button @click="showTransferModal = false" class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
            <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
          </button>
        </div>

        <div class="space-y-4">
          <!-- Produit -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Produit à transférer
            </label>
            <USelect
              v-model.number="transfertForm.produitId"
              :options="produitsAvecStock.map(p => ({ value: p.id, label: `${p.nom} — stock: ${p.quantiteStock}` }))"
              placeholder="Sélectionner un produit"
            />
          </div>

          <!-- Stock disponible -->
          <div v-if="transfertForm.produitId" class="flex items-center gap-2 px-3 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-xs text-purple-700 dark:text-purple-300">
            <UIcon name="i-heroicons-cube" class="w-4 h-4 flex-shrink-0" />
            Stock disponible dans cet entrepôt :
            <strong class="ml-1">{{ produitsAvecStock.find(p => p.id === transfertForm.produitId)?.quantiteStock ?? 0 }}</strong>
          </div>

          <!-- Entrepôt destination -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Entrepôt de destination
            </label>
            <USelect
              v-model.number="transfertForm.entrepotDestination"
              :options="entrepots.map(e => ({ value: e.id, label: `${e.nom}${e.ville ? ' — ' + e.ville : ''}` }))"
              placeholder="Sélectionner l'entrepôt de destination"
            />
            <p v-if="entrepots.length === 0" class="text-xs text-red-500 mt-1">
              Aucun autre entrepôt disponible dans l'entreprise
            </p>
          </div>

          <!-- Quantité -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Quantité à transférer
            </label>
            <UInput
              v-model.number="transfertForm.quantite"
              type="number"
              min="1"
              :max="produitsAvecStock.find(p => p.id === transfertForm.produitId)?.quantiteStock || undefined"
              placeholder="1"
            />
          </div>

          <!-- Motif -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Motif <span class="text-gray-400 font-normal">(optionnel)</span>
            </label>
            <UTextarea
              v-model.trim="transfertForm.motif"
              placeholder="Raison du transfert..."
              :rows="2"
            />
          </div>
        </div>

        <div class="mt-6 flex justify-end gap-3">
          <UButton color="gray" variant="outline" @click="showTransferModal = false">
            Annuler
          </UButton>
          <UButton
            color="purple"
            :loading="transferLoading"
            :disabled="transferLoading || !transfertForm.produitId || !transfertForm.entrepotDestination || !transfertForm.quantite || entrepots.length === 0"
            @click="effectuerTransfert"
          >
            Effectuer le transfert
          </UButton>
        </div>
      </div>
    </UModal>

    <!-- Modal de Détails du Mouvement -->
    <UModal v-model="showDetailsModal">
      <div class="p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Détails du Mouvement de Stock
        </h3>
        
        <div v-if="selectedMouvement" class="space-y-4">
          <!-- Informations générales -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date/Heure
              </label>
              <p class="text-sm text-gray-900 dark:text-white">
                {{ formaterDate(selectedMouvement.created_at) }}
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type de Mouvement
              </label>
              <span :class="getTypeColor(selectedMouvement.type_mouvement)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                {{ getTypeLabel(selectedMouvement.type_mouvement) }}
              </span>
            </div>
          </div>

          <!-- Informations produit -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Produit
              </label>
              <p class="text-sm text-gray-900 dark:text-white">
                {{ selectedMouvement.produit_nom }}
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Entrepôt
              </label>
              <p class="text-sm text-gray-900 dark:text-white">
                {{ selectedMouvement.entrepot_nom }}
              </p>
            </div>
          </div>

          <!-- Quantités -->
          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Quantité du Mouvement
              </label>
              <p class="text-sm font-semibold" :class="selectedMouvement.type_mouvement === 'entree' ? 'text-green-600' : 'text-red-600'">
                {{ selectedMouvement.type_mouvement === 'entree' ? '+' : '-' }}{{ selectedMouvement.quantite }}
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Stock Avant
              </label>
              <p class="text-sm text-gray-900 dark:text-white">
                {{ selectedMouvement.quantite_avant }}
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Stock Après
              </label>
              <p class="text-sm text-gray-900 dark:text-white">
                {{ selectedMouvement.quantite_apres }}
              </p>
            </div>
          </div>

          <!-- Référence et utilisateur -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Référence Document
              </label>
              <p class="text-sm text-gray-900 dark:text-white">
                {{ selectedMouvement.reference_document || 'Aucune référence' }}
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Utilisateur Responsable
              </label>
              <p class="text-sm text-gray-900 dark:text-white">
                {{ selectedMouvement.utilisateur_nom || 'Non spécifié' }}
              </p>
            </div>
          </div>

          <!-- Motif -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Motif du Mouvement
            </label>
            <div class="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border">
              <p class="text-sm text-gray-900 dark:text-white">
                {{ selectedMouvement.motif || 'Aucun motif spécifié' }}
              </p>
            </div>
          </div>

          <!-- ID du mouvement -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              ID du Mouvement
            </label>
            <p class="text-xs text-gray-500 dark:text-gray-400 font-mono">
              {{ selectedMouvement.id }}
            </p>
          </div>
        </div>

        <div class="mt-6 flex justify-end">
          <UButton
            color="gray"
            variant="outline"
            @click="showDetailsModal = false"
          >
            Fermer
          </UButton>
        </div>
      </div>
    </UModal>

    <!-- ——— MODAL NOUVEAU MOUVEMENT ——— -->
    <UModal v-model="showNouveauMouvementModal" :ui="{ width: 'max-w-lg' }">
      <div class="p-6">
        <div class="flex items-center gap-3 mb-5">
          <div class="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
            <UIcon name="i-heroicons-plus-circle" class="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Nouveau mouvement</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">Entrée · Sortie · Ajustement</p>
          </div>
        </div>

        <div class="space-y-4">
          <!-- Type de mouvement -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type de mouvement</label>
            <div class="grid grid-cols-3 gap-2">
              <button v-for="t in [{ val:'entree', label:'Entrée', icon:'i-heroicons-arrow-down-circle', cls:'emerald' }, { val:'sortie', label:'Sortie', icon:'i-heroicons-arrow-up-circle', cls:'red' }, { val:'ajustement', label:'Ajustement', icon:'i-heroicons-adjustments-horizontal', cls:'blue' }]" :key="t.val"
                @click="nouveauType = t.val as any"
                class="flex flex-col items-center gap-1 p-3 rounded-lg border-2 text-sm font-medium transition-all cursor-pointer"
                :class="nouveauType === t.val
                  ? (t.cls === 'emerald' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : t.cls === 'red' ? 'border-red-500 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300')
                  : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'">
                <UIcon :name="t.icon" class="w-5 h-5" />
                {{ t.label }}
              </button>
            </div>
          </div>

          <!-- Recherche produit -->
          <div class="relative">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Produit</label>
            <input
              :value="nouveauProduitSearch"
              @input="onProduitInput"
              @focus="showProduitDropdown = produitsSuggestions.length > 0"
              @blur="setTimeout(() => showProduitDropdown = false, 200)"
              type="text"
              placeholder="Rechercher un produit..."
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
            <!-- Dropdown suggestions -->
            <div v-if="showProduitDropdown && produitsSuggestions.length" class="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              <button v-for="p in produitsSuggestions" :key="p.id" @mousedown.prevent="selectProduit(p)"
                class="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between">
                <span class="font-medium text-gray-800 dark:text-gray-200">{{ p.nom }}</span>
                <span class="text-xs text-gray-400">{{ p.reference || '' }}</span>
              </button>
            </div>
            <p v-if="nouveauProduitId" class="text-xs text-emerald-600 mt-1 flex items-center gap-1">
              <UIcon name="i-heroicons-check-circle" class="w-3.5 h-3.5" /> Produit sélectionné
            </p>
          </div>

          <!-- Quantité -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantité</label>
            <input v-model.number="nouveauQuantite" type="number" min="1"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" />
          </div>

          <!-- Motif -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Motif <span class="text-gray-400 font-normal">(optionnel)</span></label>
            <input v-model="nouveauMotif" type="text" placeholder="Ex: Réapprovisionnement, Vente directe..."
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" />
          </div>

          <!-- Référence -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Référence document <span class="text-gray-400 font-normal">(optionnel)</span></label>
            <input v-model="nouveauReference" type="text" placeholder="Ex: BL-2026-001"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" />
          </div>
        </div>

        <div class="mt-6 flex justify-end gap-3">
          <button @click="showNouveauMouvementModal = false" class="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            Annuler
          </button>
          <button @click="creerMouvement" :disabled="nouveauLoading || !nouveauProduitId"
            class="px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
            <UIcon v-if="nouveauLoading" name="i-heroicons-arrow-path" class="w-4 h-4 animate-spin" />
            <UIcon v-else name="i-heroicons-check" class="w-4 h-4" />
            {{ nouveauLoading ? 'En cours...' : 'Enregistrer' }}
          </button>
        </div>
      </div>
    </UModal>

  </section>
  </div>
</template>
