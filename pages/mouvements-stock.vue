<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useApi } from "../stores/useApi";
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

    const userData: any = await $fetch(`${API_BASE_URL}/api/user/me/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (userData && userData.boutique?.id) {
      const boutiqueData: any = await $fetch(`${API_BASE_URL}/api/boutiques/${userData.boutique.id}/`, {
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
    const response = await $fetch(`${API_BASE_URL}/api/boutiques/`, {
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
    const stocksData = await $fetch(`${API_BASE_URL}/api/stocks/?entrepot=${boutique.id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });

    if (!Array.isArray(stocksData) || stocksData.length === 0) return;

    // Récupérer les détails des produits
    const productIds = stocksData.map(stock => stock.produit).join(',');
    const productsData = await $fetch(`${API_BASE_URL}/api/produits/?id__in=${productIds}`, {
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
    const stockResponse = await $fetch(`${API_BASE_URL}/api/stocks/?entrepot=${boutique.id}&produit=${transfertForm.value.produitId}`, {
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
    const response: any = await $fetch(`${API_BASE_URL}/api/mouvements-stock/transfert_stock/`, {
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
    let url = `${API_BASE_URL}/api/mouvements-stock/?entrepot=${boutique.id}`;
    
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

    // Utiliser useApi pour les mouvements
    const { data: mouvementsData, error: mouvementsError } = await useApi(url, {
      method: 'GET',
      server: false,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });

    if (mouvementsError.value) {
      errorMessage.value = "Erreur lors du chargement des mouvements: " + mouvementsError.value;
      return;
    }

    if (!mouvementsData.value) {
      errorMessage.value = "Aucune donnée reçue";
      return;
    }

    // Vérifier si c'est une structure paginée ou une liste directe
    let mouvementsList = [];
    if (Array.isArray(mouvementsData.value)) {
      mouvementsList = mouvementsData.value;
    } else if (mouvementsData.value && typeof mouvementsData.value === 'object' && 'results' in mouvementsData.value) {
      mouvementsList = mouvementsData.value.results || [];
    } else {
      mouvementsList = [];
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

// Mouvements filtrés avec pagination
const mouvementsFiltres = computed(() => {
  const start = (page.value - 1) * pageCount;
  const end = start + pageCount;
  return mouvements.value.slice(start, end);
});

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
      alert('Aucun mouvement à exporter');
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

// Initialisation
onMounted(async () => {
  await Promise.all([
    chargerMouvements(),
    chargerEntrepots(),
    chargerProduitsAvecStock()
  ]);
});
</script>

<template>
  <section class="mt-5 px-6">
    <!-- En-tête de la page -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h2 class="text-xl md:text-3xl font-bold text-green-400">Mouvements de Stock</h2>
        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Historique complet des mouvements de stock pour la comptabilité
        </p>
      </div>
      
      <div class="flex gap-2">
        <!-- Bouton Transfert -->
        <UButton
          color="purple"
          @click="showTransferModal = true"
          class="flex items-center gap-2"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
          </svg>
          Transfert
        </UButton>

        <!-- Bouton Filtres -->
        <UButton
          color="gray"
          variant="outline"
          @click="showFilters = !showFilters"
          class="flex items-center gap-2"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
          </svg>
          Filtres
        </UButton>

        <!-- Bouton Export -->
        <UButton
          color="green"
          @click="showExportModal = true"
          class="flex items-center gap-2"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          Export
        </UButton>
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

      <!-- Boutons d'action pour les filtres -->
      <div class="flex gap-3 mt-4">
        <UButton color="blue" @click="appliquerFiltres">
          Appliquer les Filtres
        </UButton>
        <UButton color="gray" variant="outline" @click="effacerFiltres">
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

    <!-- Statistiques Compactes -->
    <div class="grid grid-cols-4 gap-3 mb-4">
      <div class="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
        <div class="text-center">
          <p class="text-xs font-medium text-blue-600 dark:text-green-400">Total</p>
          <p class="text-lg font-bold text-blue-800 dark:text-blue-200">{{ totalMouvements }}</p>
        </div>
      </div>
      <div class="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
        <div class="text-center">
          <p class="text-xs font-medium text-green-600 dark:text-green-400">Entrées</p>
          <p class="text-lg font-bold text-green-800 dark:text-green-200">{{ mouvements.filter(m => m.type_mouvement === 'entree').length }}</p>
        </div>
      </div>
      <div class="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
        <div class="text-center">
          <p class="text-xs font-medium text-red-600 dark:text-red-400">Sorties</p>
          <p class="text-lg font-bold text-red-800 dark:text-red-200">{{ mouvements.filter(m => m.type_mouvement === 'sortie').length }}</p>
        </div>
      </div>
      <div class="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
        <div class="text-center">
          <p class="text-xs font-medium text-purple-600 dark:text-purple-400">Transferts</p>
          <p class="text-lg font-bold text-purple-800 dark:text-purple-200">{{ mouvements.filter(m => m.type_mouvement === 'transfert').length }}</p>
        </div>
      </div>
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
              <td class="px-3 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-white">
                {{ new Date(mouvement.created_at).toLocaleDateString('fr-FR') }}
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
      <div v-if="mouvements.length > pageCount" class="bg-white dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700 sm:px-6">
        <div class="flex items-center justify-between">
          <div class="flex-1 flex justify-between sm:hidden">
            <UButton
              :disabled="page === 1"
              @click="page = page - 1"
              variant="outline"
              size="sm"
            >
              Précédent
            </UButton>
            <UButton
              :disabled="page * pageCount >= mouvements.length"
              @click="page = page + 1"
              variant="outline"
              size="sm"
            >
              Suivant
            </UButton>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700 dark:text-gray-300">
                Affichage de
                <span class="font-medium">{{ (page - 1) * pageCount + 1 }}</span>
                à
                <span class="font-medium">{{ Math.min(page * pageCount, mouvements.length) }}</span>
                sur
                <span class="font-medium">{{ mouvements.length }}</span>
                résultats
              </p>
            </div>
            <div>
              <UPagination
                v-model="page"
                :total="mouvements.length"
                :page-count="pageCount"
                color="blue"
              />
            </div>
          </div>
        </div>
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
    <UModal v-model="showTransferModal">
      <div class="p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Transfert de Stock
        </h3>
        
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Transférer des produits de l'entrepôt actuel vers un autre entrepôt de l'entreprise.
        </p>

        <div class="space-y-4">
          <!-- Sélection du produit -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Produit à transférer
            </label>
            <USelect
              v-model.number="transfertForm.produitId"
              :options="produitsAvecStock.map(p => ({ value: p.id, label: `${p.nom} (Stock: ${p.quantiteStock})` }))"
              placeholder="Sélectionner un produit"
              @change="(value) => {
                const produit = produitsAvecStock.find(p => p.id === value);
                if (produit) {
                  transfertForm.produitNom = produit.nom;
                }
              }"
            />
          </div>

             <!-- Entrepôt de destination -->
             <div>
               <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                 Entrepôt de destination
               </label>
              <USelect
                v-model.number="transfertForm.entrepotDestination"
                 :options="entrepots.map(e => ({ 
                   value: e.id, 
                   label: `${e.nom} - ${e.ville}` 
                 }))"
                 placeholder="Sélectionner l'entrepôt de destination"
               />
               <p v-if="entrepots.length === 0" class="text-xs text-red-500 mt-1">
                 Aucun autre entrepôt disponible dans l'entreprise
               </p>
               <p v-else class="text-xs text-gray-500 mt-1">
                 {{ entrepots.length }} entrepôt(s) disponible(s)
               </p>
             </div>

          <!-- Quantité -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Quantité à transférer
            </label>
              <UInput
              v-model.number="transfertForm.quantite"
              type="number"
              min="1"
              :max="produitsAvecStock.find(p => p.id === transfertForm.produitId)?.quantiteStock || 0"
              placeholder="Quantité"
            />
            <p v-if="transfertForm.produitId" class="text-xs text-gray-500 mt-1">
              Stock disponible: {{ produitsAvecStock.find(p => p.id === transfertForm.produitId)?.quantiteStock || 0 }}
            </p>
          </div>

          <!-- Motif -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Motif du transfert
            </label>
            <UTextarea
              v-model.trim="transfertForm.motif"
              placeholder="Raison du transfert..."
              :rows="3"
            />
          </div>
        </div>

           <div class="mt-6 flex justify-end gap-3">
             <UButton
               color="gray"
               variant="outline"
               @click="showTransferModal = false"
             >
               Annuler
             </UButton>
             <UButton
               color="purple"
               @click="effectuerTransfert"
               :disabled="transferLoading || !transfertForm.produitId || !transfertForm.entrepotDestination || !transfertForm.quantite || entrepots.length === 0"
             >
               <span v-if="!transferLoading">Effectuer le Transfert</span>
               <span v-else class="inline-flex items-center gap-2">
                 <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
                   <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                   <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                 </svg>
                 Transfert en cours...
               </span>
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
  </section>
</template>
