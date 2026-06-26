<script setup lang="ts">

import { ref, computed, onMounted, onUnmounted } from 'vue';
import table_factures from '@/components/table_factures.vue';
import { useApiBase } from '@/composables/useApiBase';
import { API_BASE_URL } from '@/constants';
import { useNotification } from '@/types/useNotification';
import { useFacturePDF } from '@/composables/useFacturePDF';

const { getApiUrl, getAuthHeaders, parseApiList } = useApiBase();

// PDF génération désactivée - jsPDF non utilisé
// declare const jsPDF: any;


interface Facture {
  id: number;
  numero: string;
  date: string;
  nom: string;
  total: number;
  verse: number;
  reste: number;
  type: string;
  status: string;
  boutique_nom?: string;
  created_by_username?: string;
  created_by_nom?: string;
}

interface ProduitFacture {
  nom: string;
  prix: number;
  quantite: number;
  reference?: string;
}

interface Versement {
  id: number;
  facture: number;
  montant: number;
  date_versement: string;
  created_by: string;
  created_by_username?: string;
}

const { success, error: notifError } = useNotification();
const { genererPDFFacture, genererPDFRecu } = useFacturePDF();
const factures = ref<Facture[]>([]);
const factureSelectionnee = ref<Facture | null>(null);
const showModal = ref(false);
const showVersementHistoryModal = ref(false);
const versementsHistory = ref<Versement[]>([]);

const produitsFactures = ref<ProduitFacture[]>([]);
const loading = ref(false);
const errorMessage = ref<string | null>(null);

// Boutique de l'utilisateur connecté
const currentBoutique = ref<any>(null);

const totalGlobal = computed(() =>
  factures.value.reduce((acc, curr) => acc + (curr.total || 0), 0)
);

const totalVerse = computed(() =>
  factures.value.reduce((acc, curr) => acc + (curr.verse || 0), 0)
);

const totalReste = computed(() =>
  factures.value.reduce((acc, curr) => acc + (curr.reste || 0), 0)
);

// Pour le versement
const facturePourVersement = ref<Facture | null>(null);
const showVersementModal = ref(false);
const payment = ref<number>(0);

// --- Récupération de la boutique de l'utilisateur ---
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

// --- Mapper une facture API → modèle UI ---
function mapFacture(facture: any): Facture {
  const verse = facture.total !== undefined && facture.reste !== undefined
    ? facture.total - facture.reste
    : 0;

  let nomClient = '';
  if (facture.type === 'client') {
    nomClient = facture.client_nom || 'Client non spécifié';
  } else if (facture.type === 'partenaire') {
    nomClient = facture.partenaire_nom || facture.partenaire?.nom || 'Partenaire non spécifié';
  } else {
    nomClient = 'Destinataire non spécifié';
  }

  return {
    id: facture.id,
    numero: facture.numero,
    type: facture.type,
    status: facture.status,
    date: facture.created_at || 'Date inconnue',
    nom: nomClient,
    total: facture.total ?? 0,
    verse,
    reste: facture.reste !== undefined ? facture.reste : (facture.total ?? 0) - verse,
    boutique_nom: facture.boutique_nom,
    created_by_username: facture.created_by_username,
    created_by_nom: facture.created_by_nom || facture.created_by_username,
  };
}

function mapCommande(cmd: any) {
  let nomProduit = 'Produit inconnu';
  if (cmd.produit_nom && cmd.produit_nom !== 'Produit inconnu') {
    nomProduit = cmd.produit_nom;
  } else if (cmd.produit && typeof cmd.produit === 'object' && cmd.produit.nom) {
    nomProduit = cmd.produit.nom;
  } else if (typeof cmd.produit === 'string' && cmd.produit.length > 0) {
    nomProduit = cmd.produit;
  }
  return {
    nom: nomProduit,
    prix: cmd.prix_unitaire_fcfa ?? cmd.prix ?? 0,
    quantite: cmd.quantite ?? 0,
    reference: cmd.produit_reference || cmd.produit?.reference || '',
  };
}

// --- Chargement des factures avec filtrage par boutique ---
async function loadFactures() {
  loading.value = true;
  errorMessage.value = null;
  
  try {
    currentBoutique.value = getCurrentBoutique();
    
    if (!currentBoutique.value?.id) {
      errorMessage.value = 'Aucune boutique assignée à cet utilisateur';
      factures.value = [];
      return;
    }

    const url = getApiUrl(`/api/factures/?boutique=${currentBoutique.value.id}&ordering=-created_at`);
    const raw = await $fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
      cache: 'no-store',
    });

    const list = parseApiList<any>(raw);
    factures.value = list
      .map(mapFacture)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
    console.log(`✅ ${factures.value.length} factures chargées pour la boutique: ${currentBoutique.value.nom}`);
  } catch (err: any) {
    console.error('Erreur lors du chargement des factures:', err);
    errorMessage.value = err?.data?.detail || 'Une erreur inattendue est survenue';
    factures.value = [];
  } finally {
    loading.value = false;
  }
}

// --- Voir une facture ---
async function voirFacture(facture: Facture, forceReload: boolean = false) {
  factureSelectionnee.value = facture;
  showModal.value = true;

  const endpoint =
    facture.type === "partenaire"
      ? `/api/commandes-partenaire/?facture=${facture.id}`
      : `/api/commandes-client/?facture=${facture.id}`;

  try {
    const url = forceReload
      ? `${getApiUrl(endpoint)}&t=${Date.now()}`
      : getApiUrl(endpoint);

    const response = await $fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
      cache: 'no-store',
    });

    produitsFactures.value = parseApiList(response).map(mapCommande);
    console.log(`[voirFacture] ${produitsFactures.value.length} produit(s) chargé(s)`);
  } catch (err: any) {
    console.error('[voirFacture] Erreur lors du chargement:', err);
    produitsFactures.value = [];
  }
}

// --- Générer et télécharger la facture en PDF ---
async function handleTelechargerFacture(facture: Facture) {
  let produits: ProduitFacture[] = []
  try {
    const endpoint = facture.type === 'partenaire'
      ? `/api/commandes-partenaire/?facture=${facture.id}`
      : `/api/commandes-client/?facture=${facture.id}`
    const res: any = await $fetch(getApiUrl(endpoint), { headers: getAuthHeaders(), cache: 'no-store' })
    produits = parseApiList(res).map(mapCommande)
  } catch {
    produits = produitsFactures.value
  }
  await genererPDFFacture(facture, produits)
  success(`Facture ${facture.numero} téléchargée`)
}

// --- Annuler une facture (avec retour de stock) ---
const showAnnulerModal = ref(false)
const factureAAnnuler = ref<Facture | null>(null)
const annulerLoading = ref(false)

function demanderAnnulation(facture: Facture) {
  factureAAnnuler.value = facture
  showAnnulerModal.value = true
}

async function confirmerAnnulation() {
  if (!factureAAnnuler.value) return
  annulerLoading.value = true
  try {
    const token = process.client ? localStorage.getItem('access_token') : null
    await $fetch(`${API_BASE_URL}/api/factures/${factureAAnnuler.value.id}/annuler/`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    success(`Facture ${factureAAnnuler.value.numero} annulée — le stock a été remis`)
    showAnnulerModal.value = false
    factureAAnnuler.value = null
    await loadFactures()
  } catch (e: any) {
    notifError(e?.data?.error || e?.message || "Erreur lors de l'annulation")
  } finally {
    annulerLoading.value = false
  }
}

// --- Exporter l'historique des versements en CSV ---
function exporterVersementsCSV(facture: Facture, versements: any[]) {
  const header = 'Date,Montant (FCFA),Enregistre par'
  const rows = versements.map(v =>
    `"${new Date(v.date_versement).toLocaleString('fr-FR')}",${v.montant},"${v.created_by_username || v.created_by || ''}"`
  )
  const csv = [header, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `Versements_${facture.numero}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// --- Voir l'historique des versements ---
async function voirHistoriqueVersements(facture: Facture) {
  factureSelectionnee.value = facture;
  showVersementHistoryModal.value = true;
  
  try {
    const raw = await $fetch(getApiUrl(`/api/versements/?facture=${facture.id}`), {
      method: 'GET',
      headers: getAuthHeaders(),
      cache: 'no-store',
    });
    versementsHistory.value = parseApiList(raw);
  } catch (err) {
    console.error('Erreur lors du chargement des versements:', err);
    versementsHistory.value = [];
  }
}

// --- Gérer le versement ---
function ajouterVersement(facture: Facture) {
  facturePourVersement.value = facture;
  payment.value = 0;
  errorMessage.value = null;
  showVersementModal.value = true;
}

async function validerVersement() {
  if (!facturePourVersement.value) return;
  if (payment.value <= 0) {
    errorMessage.value = 'Entrez un montant positif.';
    return;
  }
  if (payment.value > facturePourVersement.value.reste) {
    errorMessage.value = 'Le montant du versement ne peut pas dépasser le reste à payer.';
    return;
  }
  errorMessage.value = null;

  try {
    // 1. Créer le versement via l'API backend
    const versementData = {
      facture: facturePourVersement.value.id,
      montant: payment.value,
      boutique: currentBoutique.value.id
    };

    // Le backend recalcule reste et statut automatiquement après le versement
    await $fetch(getApiUrl('/api/versements/'), {
      method: 'POST',
      headers: getAuthHeaders(),
      body: versementData,
    });

    // Fermer la modal et recharger les données depuis le serveur
    showVersementModal.value = false;
    await loadFactures();
    success(`Versement de ${payment.value.toLocaleString()} FCFA enregistré avec succès !`);
    // Télécharger le reçu automatiquement
    await genererPDFRecu(facturePourVersement.value, { montant: payment.value })

  } catch (err: any) {
    console.error("Erreur inattendue lors du versement:", err);
    errorMessage.value = `Une erreur inattendue est survenue: ${err?.message || 'Erreur inconnue'}`;
  }
}

// Reçu désormais géré par useFacturePDF().genererPDFRecu
function _deleted_genererEtTelechargerReçu(facture: Facture, montantVersement: number) {
  const reçuContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Reçu de Versement - ${facture.numero}</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 20px; 
          line-height: 1.6;
        }
        .header { 
          text-align: center; 
          margin-bottom: 30px; 
          border-bottom: 2px solid #3b82f6;
          padding-bottom: 20px;
        }
        .header h1 { 
          color: #3b82f6; 
          margin: 0; 
          font-size: 28px;
        }
        .header h2 { 
          color: #666; 
          margin: 10px 0 0 0; 
          font-size: 18px;
          font-weight: normal;
        }
        .info { 
          margin-bottom: 30px; 
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .info p { 
          margin: 8px 0; 
          font-size: 14px;
        }
        .info strong {
          color: #374151;
        }
        .montant-section {
          background: #e0f2fe;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          margin: 20px 0;
        }
        .montant-versement {
          font-size: 32px;
          font-weight: bold;
          color: #0369a1;
          margin: 10px 0;
        }
        .details-versement {
          background: #f0f9ff;
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .footer { 
          margin-top: 40px; 
          text-align: center; 
          font-size: 12px; 
          color: #666;
          border-top: 1px solid #e5e7eb;
          padding-top: 20px;
        }
        .signature {
          margin-top: 40px;
          display: flex;
          justify-content: space-between;
        }
        .signature div {
          text-align: center;
          width: 200px;
        }
        .signature-line {
          border-top: 1px solid #000;
          margin-top: 50px;
        }
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>REÇU DE VERSEMENT</h1>
        <h2>${facture.boutique_nom || 'Boutique'}</h2>
      </div>
      
      <div class="info">
        <div class="info-grid">
          <div>
            <p><strong>Numéro de facture :</strong> ${facture.numero}</p>
            <p><strong>Date du versement :</strong> ${new Date().toLocaleString('fr-FR')}</p>
            <p><strong>Client :</strong> ${facture.nom}</p>
            <p><strong>Type :</strong> ${facture.type}</p>
          </div>
          <div>
            <p><strong>Total facture :</strong> ${facture.total.toLocaleString()} FCFA</p>
            <p><strong>Déjà versé :</strong> ${facture.verse.toLocaleString()} FCFA</p>
            <p><strong>Reste avant :</strong> ${facture.reste.toLocaleString()} FCFA</p>
            <p><strong>Nouveau reste :</strong> ${(facture.reste - montantVersement).toLocaleString()} FCFA</p>
          </div>
        </div>
      </div>

      <div class="montant-section">
        <h3>MONTANT DU VERSEMENT</h3>
        <div class="montant-versement">${montantVersement.toLocaleString()} FCFA</div>
      </div>

      <div class="details-versement">
        <h4>Détails du versement :</h4>
        <p>• Montant versé : <strong>${montantVersement.toLocaleString()} FCFA</strong></p>
        <p>• Mode de paiement : <strong>Espèces</strong></p>
        <p>• Statut facture : <strong>${facture.reste - montantVersement <= 0 ? 'Payée' : 'Partiellement payée'}</strong></p>
      </div>

      <div class="signature">
        <div>
          <p>Signature du client</p>
          <div class="signature-line"></div>
        </div>
        <div>
          <p>Signature du caissier</p>
          <div class="signature-line"></div>
        </div>
      </div>

      <div class="footer">
        <p>Reçu généré le ${new Date().toLocaleString('fr-FR')}</p>
        <p>Merci pour votre confiance!</p>
        <p><strong>Ce reçu fait foi de paiement</strong></p>
      </div>
    </body>
    </html>
  `;

  // Créer un blob et télécharger
  const blob = new Blob([reçuContent], { type: 'text/html' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Reçu_Versement_${facture.numero}_${new Date().toISOString().split('T')[0]}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

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

const rafraichir = async () => {
  isRefreshing.value = true
  await loadFactures()
  isRefreshing.value = false
  lastUpdated.value = new Date()
}

onMounted(() => {
  loadFactures()
  lastUpdated.value = new Date()
  refreshTimer = setInterval(rafraichir, 60_000)
})
onUnmounted(() => { if (refreshTimer) clearInterval(refreshTimer) })
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 relative">
  <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
    <!-- En-tête -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Factures</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          <span v-if="currentBoutique">{{ currentBoutique.nom }}</span>
          <span v-if="lastUpdatedLabel" class="ml-2 text-xs text-gray-400">· {{ lastUpdatedLabel }}</span>
        </p>
      </div>
      <div class="flex items-center gap-2">
        <button
          @click="rafraichir"
          :disabled="isRefreshing || loading"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium disabled:opacity-50 transition-colors"
        >
          <svg :class="['h-4 w-4', (isRefreshing || loading) ? 'animate-spin' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
          Actualiser
        </button>
      </div>
    </div>

    <!-- Message d'erreur -->
    <div v-if="errorMessage" class="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
      {{ errorMessage }}
    </div>

    <!-- KPIs -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-3">
        <div class="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
          <svg class="h-5 w-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
          </svg>
        </div>
        <div>
          <p class="text-xs text-gray-500 dark:text-gray-400">Total facturé</p>
          <p class="text-lg font-bold text-gray-900 dark:text-white">{{ totalGlobal.toLocaleString() }} FCFA</p>
        </div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-3">
        <div class="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
          <svg class="h-5 w-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <div>
          <p class="text-xs text-gray-500 dark:text-gray-400">Total versé</p>
          <p class="text-lg font-bold text-gray-900 dark:text-white">{{ totalVerse.toLocaleString() }} FCFA</p>
        </div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-3">
        <div class="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
          <svg class="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
          </svg>
        </div>
        <div>
          <p class="text-xs text-gray-500 dark:text-gray-400">Reste à percevoir</p>
          <p class="text-lg font-bold text-red-600 dark:text-red-400">{{ totalReste.toLocaleString() }} FCFA</p>
        </div>
      </div>
    </div>

    <!-- Table des Factures -->
    <div class="mt-7 w-full">
      <table_factures
        :factures="factures"
        @voir="voirFacture"
        @versement="ajouterVersement"
        @telecharger="handleTelechargerFacture"
        @historique="voirHistoriqueVersements"
        @annuler="demanderAnnulation"
      />
    </div>

    <!-- Modal Voir Facture -->
    <UModal v-model="showModal" :title="'Facture ' + factureSelectionnee?.numero" :width="'90%'">
      <div v-if="factureSelectionnee" class="p-6 space-y-6">
        <!-- En-tête de la facture -->
        <div class="text-center border-b pb-4">
          <h2 class="text-3xl font-bold text-blue-600">FACTURE {{ factureSelectionnee.numero }}</h2>
          <p class="text-gray-600 mt-2">{{ factureSelectionnee.boutique_nom || 'Boutique' }}</p>
        </div>
        
        <!-- Informations de la facture -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div class="space-y-2">
          <p><strong>Date :</strong> {{ new Date(factureSelectionnee.date).toLocaleString('fr-FR', {year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'}).replace(',', '') }}</p>
            <p v-if="factureSelectionnee.type === 'client'"><strong>Client :</strong> {{ factureSelectionnee.nom }}</p>
            <p v-else-if="factureSelectionnee.type === 'partenaire'"><strong>Partenaire :</strong> {{ factureSelectionnee.nom }}</p>
            <p v-else><strong>Destinataire :</strong> {{ factureSelectionnee.nom }}</p>
            <p><strong>Type :</strong> <span class="capitalize">{{ factureSelectionnee.type }}</span></p>
          </div>
          <div class="space-y-2">
            <p><strong>Statut :</strong> 
              <span :class="{
                'text-green-600': factureSelectionnee.status === 'Payé',
                'text-yellow-600': factureSelectionnee.status === 'Partiellement payé',
                'text-red-600': factureSelectionnee.status === 'En attente'
              }" class="font-semibold">
                {{ factureSelectionnee.status }}
              </span>
            </p>
            <p><strong>Créé par :</strong> {{ factureSelectionnee.created_by_username || 'N/A' }}</p>
          </div>
        </div>
        
        <!-- Actions (centrées, responsives) -->
        <div class="flex flex-wrap justify-center gap-3">
          <button
            @click="handleTelechargerFacture(factureSelectionnee)"
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            Télécharger PDF
          </button>
          <button
            @click="voirHistoriqueVersements(factureSelectionnee)"
            class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-2"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Historique Versements
          </button>
          <button
            v-if="factureSelectionnee.status !== 'Annulée'"
            @click="demanderAnnulation(factureSelectionnee); showModal = false"
            class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center gap-2"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
            Annuler la facture
          </button>
        </div>
        
        <hr />
        
        <!-- Table des produits -->
        <div class="overflow-x-auto">
          <table class="w-full table-auto border-collapse border border-gray-300">
            <thead class="bg-gray-100">
              <tr class="text-left">
                <th class="border border-gray-300 px-4 py-3 font-semibold">Produit(s)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(prod, index) in produitsFactures" :key="index" class="hover:bg-gray-50">
                <td class="border border-gray-300 px-4 py-3 capitalize">
                  {{ prod.nom }} | Qté: {{ prod.quantite }} × {{ prod.prix.toFixed(2) }} FCFA
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Totaux -->
        <div class="text-right space-y-2 bg-gray-50 p-4 rounded-lg">
          <p class="text-lg font-semibold text-gray-700">
            Total : {{ factureSelectionnee.total.toFixed(2) }} FCFA
          </p>
          <p class="text-lg font-semibold text-green-600">
            Déjà versé : {{ factureSelectionnee.verse.toFixed(2) }} FCFA
          </p>
          <p class="text-xl font-bold" :class="factureSelectionnee.reste > 0 ? 'text-red-600' : 'text-green-600'">
            Reste à payer : {{ factureSelectionnee.reste.toFixed(2) }} FCFA
          </p>
        </div>
      </div>
    </UModal>

    <!-- Modal Versement -->
    <UModal v-model="showVersementModal" title="Ajouter un versement" :width="'500px'">
      <div v-if="facturePourVersement" class="space-y-6 p-6">
        <!-- En-tête -->
        <div class="text-center border-b pb-4">
          <h3 class="text-xl font-bold text-blue-600">Nouveau Versement</h3>
          <p class="text-gray-600 mt-2">Facture n° {{ facturePourVersement.numero }}</p>
        </div>
        
        <!-- Informations de la facture -->
        <div class="bg-gray-50 p-4 rounded-lg space-y-2">
          <p class="text-sm"><strong>Client :</strong> {{ facturePourVersement.nom }}</p>
          <p class="text-sm"><strong>Total :</strong> {{ facturePourVersement.total.toLocaleString() }} FCFA</p>
          <p class="text-sm"><strong>Déjà versé :</strong> {{ facturePourVersement.verse.toLocaleString() }} FCFA</p>
          <p class="text-lg font-bold text-red-600">
            <strong>Reste à payer :</strong> {{ facturePourVersement.reste.toLocaleString() }} FCFA
          </p>
        </div>
        
        <!-- Formulaire de versement -->
        <div>
          <label class="block mb-2 font-semibold text-gray-700">Montant à verser (FCFA)</label>
          <input
            v-model="payment"
            type="number"
            min="1"
            :max="facturePourVersement.reste"
            placeholder="Entrez le montant"
            class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
          />
          <div v-if="errorMessage" class="text-red-500 mt-2 text-sm">{{ errorMessage }}</div>
        </div>
        
        <!-- Actions (responsives) -->
        <div class="flex flex-wrap justify-end gap-3 pt-4">
          <button 
            @click="showVersementModal = false" 
            class="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Annuler
          </button>
          <button 
            @click="validerVersement" 
            :disabled="payment <= 0 || payment > facturePourVersement.reste"
            class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Enregistrer le versement
          </button>
        </div>
      </div>
    </UModal>

    <!-- Modal Historique des Versements -->
    <UModal v-model="showVersementHistoryModal" title="Historique des Versements" :width="'80%'">
      <div v-if="factureSelectionnee" class="p-6 space-y-6">
        <!-- En-tête -->
        <div class="text-center border-b pb-4">
          <h3 class="text-2xl font-bold text-blue-600">Historique des Versements</h3>
          <p class="text-gray-600 mt-2">Facture n° {{ factureSelectionnee.numero }}</p>
        </div>
        
        <!-- Informations de la facture -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-blue-50 p-4 rounded-lg">
            <p class="text-sm text-blue-600 font-medium">Total Facture</p>
            <p class="text-xl font-bold text-blue-700">{{ factureSelectionnee.total.toLocaleString() }} FCFA</p>
          </div>
          <div class="bg-green-50 p-4 rounded-lg">
            <p class="text-sm text-green-600 font-medium">Total Versé</p>
            <p class="text-xl font-bold text-green-700">{{ factureSelectionnee.verse.toLocaleString() }} FCFA</p>
          </div>
          <div class="bg-red-50 p-4 rounded-lg">
            <p class="text-sm text-red-600 font-medium">Reste à Payer</p>
            <p class="text-xl font-bold text-red-700">{{ factureSelectionnee.reste.toLocaleString() }} FCFA</p>
          </div>
        </div>
        
        <!-- Table des versements -->
        <!-- Export CSV -->
        <div v-if="versementsHistory.length > 0" class="flex justify-end mb-3">
          <button @click="exporterVersementsCSV(factureSelectionnee, versementsHistory)"
            class="px-3 py-1.5 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-2">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            Exporter CSV
          </button>
        </div>
        <div v-if="versementsHistory.length > 0" class="overflow-x-auto">
          <table class="w-full table-auto border-collapse border border-gray-300">
            <thead class="bg-gray-100">
              <tr class="text-left">
                <th class="border border-gray-300 dark:border-gray-700 px-4 py-3 font-semibold">Date</th>
                <th class="border border-gray-300 dark:border-gray-700 px-4 py-3 font-semibold">Montant</th>
                <th class="border border-gray-300 dark:border-gray-700 px-4 py-3 font-semibold">Enregistré par</th>
                <th class="border border-gray-300 dark:border-gray-700 px-4 py-3 font-semibold text-center">Reçu</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="versement in versementsHistory" :key="versement.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/40">
                <td class="border border-gray-300 dark:border-gray-700 px-4 py-3">
                  {{ new Date(versement.date_versement).toLocaleString('fr-FR') }}
                </td>
                <td class="border border-gray-300 dark:border-gray-700 px-4 py-3 font-semibold text-green-600">
                  {{ versement.montant.toLocaleString() }} FCFA
                </td>
                <td class="border border-gray-300 dark:border-gray-700 px-4 py-3">
                  {{ versement.created_by_username || versement.created_by || 'Utilisateur inconnu' }}
                </td>
                <td class="border border-gray-300 dark:border-gray-700 px-4 py-3 text-center">
                  <button
                    v-if="factureSelectionnee"
                    @click="genererPDFRecu(factureSelectionnee, { montant: versement.montant, date: versement.date_versement, created_by_username: versement.created_by_username })"
                    class="inline-flex items-center gap-1 px-2 py-1 text-xs bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700 rounded hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
                    title="Télécharger le reçu"
                  >
                    <UIcon name="i-heroicons-arrow-down-tray" class="w-3.5 h-3.5" />
                    Reçu
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Message si aucun versement -->
        <div v-else class="text-center py-8 text-gray-500">
          <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <p class="text-lg">Aucun versement enregistré pour cette facture</p>
        </div>
      </div>
    </UModal>
  </section>

  <!-- Modal confirmation annulation -->
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="showAnnulerModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" @click.self="showAnnulerModal = false">
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
          <div class="p-6">
            <div class="flex items-center gap-3 mb-4">
              <div class="p-2 rounded-full bg-red-100 dark:bg-red-900/30">
                <svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
              </div>
              <h2 class="text-lg font-bold text-gray-900 dark:text-white">Annuler la facture</h2>
            </div>
            <div v-if="factureAAnnuler" class="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 mb-4">
              <p class="text-sm font-medium text-red-800 dark:text-red-300">Facture N° {{ factureAAnnuler.numero }}</p>
              <p class="text-sm text-red-700 dark:text-red-400 mt-1">Client : {{ factureAAnnuler.nom }}</p>
              <p class="text-sm text-red-700 dark:text-red-400">Montant : {{ factureAAnnuler.total.toLocaleString() }} FCFA</p>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Cette action est <strong>irréversible</strong>. Les produits seront remis en stock et la facture sera marquée comme annulée.
            </p>
          </div>
          <div class="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <button @click="showAnnulerModal = false" class="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">Retour</button>
            <button @click="confirmerAnnulation" :disabled="annulerLoading"
              class="px-5 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50">
              {{ annulerLoading ? 'Annulation...' : 'Confirmer l\'annulation' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
  </div>
</template>
  

