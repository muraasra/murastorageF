<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useApi } from "../stores/useApi";
import { API_BASE_URL } from '@/constants'

// Colonnes du tableau
const colonnes = [
  { key: "reference", label: "Référence" },
  { key: "nomProduit", label: "Nom" },
  { key: "category", label: "Catégorie" },
  { key: "prix", label: "Prix (FCFA)" },
  { key: "quantiteStock", label: "Stock Entrepôt" },
  { key: "emplacement", label: "Emplacement" },
  { key: "statut", label: "Statut" },
];

// Interface produit avec stock
interface ProductStock {
  id: number;
  reference: string;
  nomProduit: string;
  category: string;
  prix: number;
  description: string;
  quantiteStock: number;
  emplacement: string;
  statut: boolean;
  entrepot: number;
  entrepot_nom: string;
}

// Liste des produits avec stock (réactif)
const produits = ref<ProductStock[]>([]);

// 🔍 Recherche + pagination
const q = ref("");
const page = ref(1);
const pageCount = 15;

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
    const { data: userResp, error: userErr } = await useApi<any>(`${API_BASE_URL}/api/user/me/`, { method: 'GET', server: false, cache: false })
    if (userErr.value) return null
    const userData = userResp.value
    if (userData && userData.boutique?.id) {
      const { data: boutiqueResp } = await useApi<any>(`${API_BASE_URL}/api/boutiques/${userData.boutique.id}/`, { method: 'GET', server: false })
      const boutiqueData = boutiqueResp.value
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

// Chargement des produits avec stock depuis l'API
const isLoading = ref(false)
async function chargementProduits() {
  try {
    if (isLoading.value) return
    isLoading.value = true
    const token = process.client ? localStorage.getItem('access_token') : null;
    let boutique = getCurrentBoutique();
    
    // Si pas de boutique en localStorage, essayer de la récupérer depuis l'API
    if (!boutique || !boutique.id) {
      console.log("🔄 Tentative de récupération des données boutique depuis l'API...");
      boutique = await fetchUserAndBoutiqueData();
    }
    
    if (!boutique || !boutique.id) {
      console.error("❌ Aucune boutique sélectionnée ou boutique sans ID");
      console.log("🔍 Debug - Boutique récupérée:", boutique);
      return;
    }

    console.log("🔍 Debug - Boutique ID:", boutique.id);
    console.log("🔍 Debug - Boutique nom:", boutique.nom);
    console.log("🔍 Debug - Token:", token ? "Présent" : "Absent");

    // Récupérer les stocks de l'entrepôt actuel
    const { data: stocksData, error: stocksError } = await useApi<any[]>(`${API_BASE_URL}/api/stocks/?entrepot=${boutique.id}`, {
      method: "GET",
      server: false,
      cacheTTL: 5 * 60 * 1000,
    });

    if (stocksError.value) {
      console.error("❌ Erreur API stocks :", stocksError.value);
      return;
    }

    console.log("📊 Debug - Données stocks reçues:", stocksData.value);

    if (!Array.isArray(stocksData.value) || stocksData.value.length === 0) {
      console.log("⚠️ Aucun stock trouvé pour cette boutique");
      produits.value = [];
      return;
    }

    // Récupérer les détails des produits
    const productIds = stocksData.value.map(stock => stock.produit).join(',');
    const { data: productsData, error: productsError } = await useApi<any[]>(`${API_BASE_URL}/api/produits/?id__in=${productIds}`, {
      method: "GET",
      server: false,
      cacheTTL: 10 * 60 * 1000,
    });

    if (productsError.value) {
      console.error("❌ Erreur API produits :", productsError.value);
      return;
    }

    console.log("📦 Debug - Données produits reçues:", productsData.value);

    // Combiner les données de stock et de produits
    const stockMap = new Map();
    stocksData.value.forEach(stock => {
      stockMap.set(stock.produit, stock);
    });

    produits.value = Array.isArray(productsData.value)
      ? productsData.value.map((p: any) => {
          const stock = stockMap.get(p.id);
          return {
            id: p.id,
            reference: p.reference || 'N/A',
            nomProduit: p.nom,
            category: p.category || 'N/A',
            prix: p.prix || 0,
            description: p.description || '',
            quantiteStock: stock ? stock.quantite : 0,
            emplacement: stock ? stock.emplacement || 'N/A' : 'N/A',
            statut: p.actif,
            entrepot: stock ? stock.entrepot : null,
            entrepot_nom: stock ? stock.entrepot_nom : 'N/A',
          };
        }).filter(p => p.quantiteStock > 0) // Seulement les produits avec stock > 0
      : [];

    console.log(`✅ ${produits.value.length} produits avec stock chargés pour l'entrepôt`);
    console.log("📋 Debug - Produits finaux:", produits.value);
  } catch (err) {
    console.error("Erreur lors de l'appel API :", err);
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  chargementProduits();
});

// Produits filtrés (par recherche)
const lignesFiltrees = computed(() => {
  let produitsFiltres = produits.value;

  if (q.value) {
    produitsFiltres = produitsFiltres.filter((produit: ProductStock) =>
      Object.values(produit).some((valeur) =>
        String(valeur).toLowerCase().includes(q.value.toLowerCase())
      )
    );
  }

  return produitsFiltres.slice(
    (page.value - 1) * pageCount,
    page.value * pageCount
  );
});

// Total pour pagination
const totalProduitsFiltres = computed(() => {
  let produitsFiltres = produits.value;

  if (q.value) {
    produitsFiltres = produitsFiltres.filter((produit: ProductStock) =>
      Object.values(produit).some((valeur) =>
        String(valeur).toLowerCase().includes(q.value.toLowerCase())
      )
    );
  }

  return produitsFiltres.length;
});
</script>

<template>
  <div class="space-y-4">
    <!-- Informations de l'entrepôt -->
    <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-lg font-semibold text-blue-800 dark:text-blue-200">
            Stock de l'Entrepôt
          </h3>
          <p class="text-sm text-blue-600 dark:text-blue-300">
            Affichage des produits avec stock disponible dans l'entrepôt actuel
          </p>
        </div>
        <div class="text-right">
          <p class="text-sm text-blue-600 dark:text-blue-300">
            {{ produits.length }} produit(s) en stock
          </p>
        </div>
      </div>
    </div>

    <!-- Barre de recherche -->
    <div class="flex justify-between items-center w-full py-3.5 border-b border-gray-200 dark:border-gray-700">
      <UInput
        color="blue"
        variant="outline"
        v-model="q"
        placeholder="Rechercher un produit..."
      />
    </div>

    <!-- Tableau -->
    <div class="shadow-lg border rounded-md dark:border-gray-600 dark:shadow-gray-800">
      <UTable
        :rows="lignesFiltrees"
        :columns="colonnes"
        class="w-[270px] sm:w-[320px] md:w-[490px] lg:w-full overflow-x-auto"
      >
        <!-- Prix personnalisé -->
        <template #prix-data="{ row }">
          <span>{{ row.prix.toLocaleString() }} FCFA</span>
        </template>
        
        <!-- Stock personnalisé -->
        <template #quantiteStock-data="{ row }">
          <span class="font-semibold" :class="row.quantiteStock > 10 ? 'text-green-600' : row.quantiteStock > 5 ? 'text-yellow-600' : 'text-red-600'">
            {{ row.quantiteStock }}
          </span>
        </template>
        
        <!-- Emplacement personnalisé -->
        <template #emplacement-data="{ row }">
          <span class="text-sm text-gray-600">{{ row.emplacement }}</span>
        </template>
        
        <!-- Statut personnalisé -->
        <template #statut-data="{ row }">
          <span :class="row.statut ? 'text-green-600' : 'text-red-600'" class="font-semibold">
            {{ row.statut ? 'Actif' : 'Inactif' }}
          </span>
        </template>
      </UTable>

      <!-- Pagination -->
      <div class="flex justify-end px-3 py-3.5 border-t border-gray-200 dark:border-gray-700">
        <UPagination
          :active-button="{ variant: 'outline' }"
          :inactive-button="{ color: 'blue' }"
          v-model="page"
          color="blue"
          :page-count="pageCount"
          :total="totalProduitsFiltres"
        />
      </div>
    </div>
  </div>
</template>
