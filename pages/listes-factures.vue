<script setup lang="ts">

import { ref, computed, onMounted } from 'vue';
import table_factures from '@/components/table_factures.vue';
import { useApi } from '../stores/useApi';
import { API_BASE_URL } from '@/constants';

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

// --- Chargement des factures avec filtrage par boutique ---
async function loadFactures() {
  loading.value = true;
  errorMessage.value = null;
  
  try {
    // Récupérer la boutique de l'utilisateur
    currentBoutique.value = getCurrentBoutique();
    
    if (!currentBoutique.value) {
      errorMessage.value = 'Aucune boutique assignée à cet utilisateur';
      factures.value = [];
      return;
    }

    // Construire l'URL avec le filtre boutique
    const url = `/api/factures/?boutique=${currentBoutique.value.id}`;
    
    const { data, error } = await useApi(url, { method: 'GET' });
    
  if (error.value) {
    console.error("Erreur API :", error.value);
      errorMessage.value = `Erreur lors du chargement des factures: ${error.value.message}`;
    factures.value = [];
    return;
  }
    
  factures.value = Array.isArray(data.value)
    ? data.value.map(facture => {
        const verse = facture.total !== undefined && facture.reste !== undefined
          ? facture.total - facture.reste
            : 0;
          
          // Déterminer le nom du client/partenaire - Une facture est toujours liée à un client ou partenaire
          let nomClient = '';
          if (facture.type === 'client') {
            // Pour les factures client, utiliser client_nom (qui vient de client.nom_complet)
            nomClient = facture.client_nom || 'Client non spécifié';
          } else if (facture.type === 'partenaire') {
            // Pour les factures partenaire, utiliser partenaire_nom (qui vient de partenaire.__str__)
            nomClient = facture.partenaire_nom || facture.partenaire?.nom || 'Partenaire non spécifié';
            console.log('[loadFactures] Facture partenaire:', {
              id: facture.id,
              type: facture.type,
              partenaire_nom: facture.partenaire_nom,
              partenaire: facture.partenaire,
              nomFinal: nomClient
            });
          } else {
            // Fallback si le type n'est pas défini
            nomClient = 'Destinataire non spécifié';
          }
          
        return {
          id: facture.id,
          numero: facture.numero,
          type: facture.type,
          status: facture.status,
            date: facture.created_at ? facture.created_at : 'Date inconnue',
            nom: nomClient,
          total: facture.total ?? 0,
          verse,
          reste: facture.reste !== undefined ? facture.reste : (facture.total ?? 0) - verse,
            boutique_nom: facture.boutique_nom,
            created_by_username: facture.created_by_username,
        }
      }).sort((a, b) => {
        // Tri par date et heure décroissante
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB.getTime() - dateA.getTime();
      })
    : [];
      
    console.log(`✅ ${factures.value.length} factures chargées pour la boutique: ${currentBoutique.value.nom}`);
  } catch (err) {
    console.error('Erreur lors du chargement des factures:', err);
    errorMessage.value = 'Une erreur inattendue est survenue';
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
    // Si forceReload, utiliser $fetch directement pour éviter le cache
    if (forceReload) {
      console.log('[voirFacture] Rechargement forcé avec $fetch direct');
      const token = process.client ? localStorage.getItem('access_token') : null;
      const timestamp = `&t=${Date.now()}`;
      const fullUrl = `${API_BASE_URL}${endpoint}${timestamp}`;
      
      // Utiliser $fetch (auto-importé par Nuxt 3)
      const response = await $fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      
      console.log('[voirFacture] Réponse brute de l\'API:', response);
      console.log('[voirFacture] Premier élément de la réponse:', Array.isArray(response) ? response[0] : null);
      
      produitsFactures.value = Array.isArray(response)
        ? response.map((cmd: any) => {
            // Essayer plusieurs façons de récupérer le nom du produit
            let nomProduit = 'Produit inconnu';
            
            // Priorité 1: produit_nom du serializer
            if (cmd.produit_nom && cmd.produit_nom !== 'Produit inconnu') {
              nomProduit = cmd.produit_nom;
            }
            // Priorité 2: produit est un objet avec nom
            else if (cmd.produit && typeof cmd.produit === 'object' && cmd.produit.nom) {
              nomProduit = cmd.produit.nom;
            }
            // Priorité 3: produit est une string (nom direct)
            else if (typeof cmd.produit === 'string' && cmd.produit.length > 0) {
              nomProduit = cmd.produit;
            }
            // Priorité 4: Si produit est un nombre (ID), on doit faire une requête supplémentaire
            else if (typeof cmd.produit === 'number') {
              // Ne pas afficher l'ID, mais plutôt un message d'erreur
              nomProduit = 'Nom du produit non disponible';
              console.warn('[voirFacture] Produit ID trouvé sans nom:', cmd.produit, 'Commande complète:', cmd);
            }
            
            console.log('[voirFacture] Commande mappée:', {
              cmd,
              nomProduit,
              produit_nom: cmd.produit_nom,
              produit: cmd.produit,
              type_produit: typeof cmd.produit
            });
            
            return {
              nom: nomProduit,
              prix: cmd.prix_unitaire_fcfa ?? cmd.prix ?? 0,
              quantite: cmd.quantite ?? 0,
              reference: cmd.produit_reference || (cmd.produit?.reference) || ''
            };
          })
        : [];
      
      console.log('[voirFacture] Produits mappés finaux:', produitsFactures.value);
    } else {
      // Utiliser useApi normalement avec cache
      const options: any = { method: 'GET' };
      const { data, error } = await useApi(endpoint, options);
      if (error.value) {
        console.error('Erreur lors du chargement des produits:', error.value);
        produitsFactures.value = [];
        return;
      }
      console.log('[voirFacture] Données brutes de useApi:', data.value);
      console.log('[voirFacture] Premier élément de useApi:', Array.isArray(data.value) ? data.value[0] : null);
      
      produitsFactures.value = Array.isArray(data.value)
        ? data.value.map((cmd: any) => {
            // Essayer plusieurs façons de récupérer le nom du produit
            let nomProduit = 'Produit inconnu';
            
            // Priorité 1: produit_nom du serializer
            if (cmd.produit_nom && cmd.produit_nom !== 'Produit inconnu') {
              nomProduit = cmd.produit_nom;
            }
            // Priorité 2: produit est un objet avec nom
            else if (cmd.produit && typeof cmd.produit === 'object' && cmd.produit.nom) {
              nomProduit = cmd.produit.nom;
            }
            // Priorité 3: produit est une string (nom direct)
            else if (typeof cmd.produit === 'string' && cmd.produit.length > 0) {
              nomProduit = cmd.produit;
            }
            // Priorité 4: Si produit est un nombre (ID), on doit faire une requête supplémentaire
            else if (typeof cmd.produit === 'number') {
              // Ne pas afficher l'ID, mais plutôt un message d'erreur
              nomProduit = 'Nom du produit non disponible';
              console.warn('[voirFacture] Produit ID trouvé sans nom:', cmd.produit, 'Commande complète:', cmd);
            }
            
            console.log('[voirFacture] Commande mappée:', {
              cmd,
              nomProduit,
              produit_nom: cmd.produit_nom,
              produit: cmd.produit,
              type_produit: typeof cmd.produit
            });
            
            return {
              nom: nomProduit,
              prix: cmd.prix_unitaire_fcfa ?? cmd.prix ?? 0,
              quantite: cmd.quantite ?? 0,
              reference: cmd.produit_reference || (cmd.produit?.reference) || ''
            };
          })
        : [];
      
      console.log('[voirFacture] Produits mappés finaux:', produitsFactures.value);
    }
    
    console.log(`[voirFacture] ${produitsFactures.value.length} produit(s) chargé(s)`);
  } catch (err: any) {
    console.error('[voirFacture] Erreur lors du chargement:', err);
    produitsFactures.value = [];
  }
}

// --- Wrapper pour télécharger une facture avec gestion d'erreurs ---
async function handleTelechargerFacture(facture: Facture) {
  // FONCTION COMPLÈTEMENT DÉSACTIVÉE - NE PAS APPELER telechargerFacture
  console.warn('[PDF] Téléchargement désactivé par l\'utilisateur.');
  errorMessage.value = 'Le téléchargement PDF est temporairement désactivé.';
  // NE PAS APPELER telechargerFacture - retour immédiat
  return Promise.resolve();
}

// --- Télécharger une facture (FONCTION DÉSACTIVÉE) ---
async function telechargerFacture(facture: Facture) {
  // ⚠️ FONCTION COMPLÈTEMENT DÉSACTIVÉE - AUCUN CODE PDF N'EST EXÉCUTÉ ⚠️
  // Cette fonction retourne immédiatement sans faire quoi que ce soit
  // NE PAS MODIFIER CETTE FONCTION - Elle doit rester vide
  console.warn('[PDF] Fonction désactivée - aucune génération de PDF.');
  // RETOUR IMMÉDIAT - AUCUN CODE PDF N'EST EXÉCUTÉ
  // Ne pas appeler jsPDF, doc.text, ou toute autre fonction PDF
  // Ne pas ajouter de code ici - la fonction doit rester vide
  return; // Retour immédiat sans erreur
}

// --- Voir l'historique des versements ---
async function voirHistoriqueVersements(facture: Facture) {
  factureSelectionnee.value = facture;
  showVersementHistoryModal.value = true;
  
  try {
    // Charger l'historique des versements depuis l'API
    const { data, error } = await useApi(`/api/versements/?facture=${facture.id}`, { method: 'GET' });
    
    if (error.value) {
      console.error('Erreur lors du chargement des versements:', error.value);
      versementsHistory.value = [];
      return;
    }
    
    versementsHistory.value = Array.isArray(data.value) ? data.value : [];
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

    const { data: versementResponse, error: versementError } = await useApi(`/api/versements/`, {
      method: 'POST',
      body: JSON.stringify(versementData)
    });

    if (versementError.value) {
      console.error("Erreur lors de la création du versement:", versementError.value);
      errorMessage.value = `Erreur lors de l'enregistrement du versement: ${versementError.value.message}`;
      return;
    }

    // 2. Calculer le nouveau reste et statut
    const nouveauReste = facturePourVersement.value.reste - payment.value;
    const nouveauStatut = nouveauReste <= 0 ? 'Payé' : 'Partiellement payé';

    // 3. Mettre à jour la facture
    const { data: factureResponse, error: factureError } = await useApi(`/api/factures/${facturePourVersement.value.id}/`, {
        method: 'PATCH',
        body: JSON.stringify({
          reste: nouveauReste,
        status: nouveauStatut
        })
      });

    if (factureError.value) {
      console.error("Erreur lors de la mise à jour de la facture:", factureError.value);
      errorMessage.value = `Erreur lors de la mise à jour de la facture: ${factureError.value.message}`;
      return;
    }

    // 4. Succès - Fermer la modal et recharger les données
    showVersementModal.value = false;
    await loadFactures();
    
    // 5. Afficher confirmation
    alert(`✅ Versement de ${payment.value.toLocaleString()} FCFA enregistré avec succès !`);
    
    // 6. Téléchargement PDF désactivé - ne plus appeler telechargerFacture
    // await telechargerFacture(facturePourVersement.value);
    
  } catch (err: any) {
    console.error("Erreur inattendue lors du versement:", err);
    errorMessage.value = `Une erreur inattendue est survenue: ${err?.message || 'Erreur inconnue'}`;
  }
}

// --- Générer et télécharger le reçu de versement ---
function genererEtTelechargerReçu(facture: Facture, montantVersement: number) {
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

onMounted(() => {
  loadFactures();
});
</script>

<template>
  <section class="mt-5 px-6">
    <!-- En-tête avec informations de la boutique -->
    <div class="flex justify-between items-center mb-6">
      <div>
    <h2 class="text-xl md:text-3xl font-bold text-blue-400">Listes des Factures</h2>
        <p v-if="currentBoutique" class="text-sm text-gray-600 mt-1">
          Boutique: <span class="font-semibold">{{ currentBoutique.nom }}</span>
        </p>
      </div>
      <div class="flex gap-2">
        <button 
          @click="loadFactures" 
          :disabled="loading"
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
        >
          <svg v-if="loading" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <svg v-else class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          Actualiser
        </button>
      </div>
    </div>

    <!-- Message d'erreur -->
    <div v-if="errorMessage" class="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
      {{ errorMessage }}
    </div>

    <!-- Résumé des montants - Version compacte -->
    <div class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
      <div class="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
        <div class="flex items-center">
          <div class="p-2 bg-blue-500 rounded-lg">
            <svg class="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-xs font-medium text-blue-600">Total</p>
            <p class="text-lg font-bold text-blue-700">{{ totalGlobal.toLocaleString() }} FCFA</p>
          </div>
        </div>
      </div>
      
      <div class="p-4 border rounded-lg bg-gradient-to-r from-green-50 to-green-100 border-green-200">
        <div class="flex items-center">
          <div class="p-2 bg-green-500 rounded-lg">
            <svg class="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-xs font-medium text-green-600">Versé</p>
            <p class="text-lg font-bold text-green-700">{{ totalVerse.toLocaleString() }} FCFA</p>
          </div>
        </div>
      </div>
      
      <div class="p-4 border rounded-lg bg-gradient-to-r from-red-50 to-red-100 border-red-200">
        <div class="flex items-center">
          <div class="p-2 bg-red-500 rounded-lg">
            <svg class="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-xs font-medium text-red-600">Reste</p>
            <p class="text-lg font-bold text-red-700">{{ totalReste.toLocaleString() }} FCFA</p>
      </div>
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
        
        <!-- Actions -->
        <div class="flex justify-center gap-4">
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
        
        <!-- Actions -->
        <div class="flex justify-end gap-3 pt-4">
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
        <div v-if="versementsHistory.length > 0" class="overflow-x-auto">
          <table class="w-full table-auto border-collapse border border-gray-300">
            <thead class="bg-gray-100">
              <tr class="text-left">
                <th class="border border-gray-300 px-4 py-3 font-semibold">Date</th>
                <th class="border border-gray-300 px-4 py-3 font-semibold">Montant</th>
                <th class="border border-gray-300 px-4 py-3 font-semibold">Enregistré par</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="versement in versementsHistory" :key="versement.id" class="hover:bg-gray-50">
                <td class="border border-gray-300 px-4 py-3">
                  {{ new Date(versement.date_versement).toLocaleString('fr-FR') }}
                </td>
                <td class="border border-gray-300 px-4 py-3 font-semibold text-green-600">
                  {{ versement.montant.toLocaleString() }} FCFA
                </td>
                <td class="border border-gray-300 px-4 py-3">
                  {{ versement.created_by_username || versement.created_by || 'Utilisateur inconnu' }}
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
</template>
  

