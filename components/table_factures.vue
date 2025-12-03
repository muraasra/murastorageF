<script setup lang="ts">
import { ref, computed, watch } from "vue";
import selecteur_date from "./selecteur_date.vue";

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

const props = defineProps<{ factures: Facture[] }>();

const emit = defineEmits<{
  voir: [facture: Facture];
  versement: [facture: Facture];
  telecharger: [facture: Facture];
  historique: [facture: Facture];
}>();

const columns = 
[
  { key: "numero", label: "N° Facture" },
  { key: "date", label: "Date" },
  { key: "nom", label: "Client/Partenaire" },
  { key: "status", label: "Statut" },
  { key: "total", label: "Total" },
  { key: "verse", label: "Versé" },
  { key: "reste", label: "Reste" },
  { key: "action", label: "Actions" },
];

const q = ref("");
const page = ref(1);
const pageCount = 10;
const plageDatesSelectionnee = ref<{ start: Date | null; end: Date | null }>({ start: null, end: null });

const facturesFiltrees = computed(() => {
  let liste = props.factures;

  if (q.value) {
    liste = liste.filter((fact) =>
      Object.values(fact).some((val) =>
        String(val).toLowerCase().includes(q.value.toLowerCase())
      )
    );
  }

  if (plageDatesSelectionnee.value.start && plageDatesSelectionnee.value.end) {
    liste = liste.filter((fact) => {
      const dateFacture = new Date(fact.date);
      return (
        dateFacture >= plageDatesSelectionnee.value.start! &&
        dateFacture <= plageDatesSelectionnee.value.end!
      );
    });
  }

  return liste.slice((page.value - 1) * pageCount, page.value * pageCount);
});

const totalFactures = computed(() => props.factures.length);

const resetFiltres = () => {
  q.value = "";
  plageDatesSelectionnee.value = { start: null, end: null };
};

watch([q, plageDatesSelectionnee], () => {
  page.value = 1;
});
</script>

<template>
  <div class="flex flex-col lg:flex-row justify-between items-center w-full py-3.5 border-b border-gray-200 dark:border-gray-700 gap-4">
    <UInput v-model="q" placeholder="Rechercher une facture..." class="w-full lg:w-[250px]" color="blue" variant="outline" />
    <div class="flex items-center gap-3">
      <selecteur_date class="w-full" @update-range="(range) => (plageDatesSelectionnee = range)" />
      <UButton @click="resetFiltres" color="gray">Réinitialiser</UButton>
    </div>
  </div>

  <div class="shadow-lg border rounded-md dark:border-gray-600 dark:shadow-gray-800 mt-3">
    <UTable :rows="facturesFiltrees" :columns="columns">
      <template #numero-data="{ row }">
        <span class="font-mono text-sm font-semibold text-blue-600">{{ row.numero }}</span>
      </template>
      <template #date-data="{ row }">
        <div class="text-xs">
          <div class="font-semibold">{{ new Date(row.date).toLocaleDateString('fr-FR', {day: '2-digit', month: '2-digit', year: '2-digit'}) }}</div>
          <div class="text-gray-500">{{ new Date(row.date).toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'}) }}</div>
        </div>
      </template>
      <template #nom-data="{ row }">
        <div class="max-w-32 truncate" :title="row.nom">
          <span v-if="row.type === 'partenaire'" class="text-purple-600 font-medium">{{ row.nom }}</span>
          <span v-else>{{ row.nom }}</span>
        </div>
      </template>
      <template #status-data="{ row }">
        <span
          :class="[
            'inline-block px-3 py-1 text-xs font-semibold rounded-full',
            row.status === 'Payé'
              ? 'bg-green-100 text-green-700'
              : row.status === 'Partiellement payé'
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-red-100 text-red-700'
          ]"
        >
          {{ row.status }}
        </span>
      </template>
      <template #total-data="{ row }">
        <span class="font-semibold">{{ row.total.toLocaleString() }} FCFA</span>
      </template>
      <template #verse-data="{ row }">
        <span class="text-green-600 font-semibold">{{ row.verse.toLocaleString() }} FCFA</span>
      </template>
      <template #reste-data="{ row }">
        <span :class="row.reste > 0 ? 'text-red-600 font-bold' : 'text-green-600 font-bold'">
          {{ row.reste.toLocaleString() }} FCFA
        </span>
      </template>
      <template #action-data="{ row }">
        <div class="flex flex-wrap gap-1">
          <!-- Bouton Voir -->
          <UButton 
            color="blue" 
            size="xs"
            @click="emit('voir', row)"
            class="flex items-center gap-1"
            title="Voir la facture"
          >
            <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
            </svg>
            Voir
          </UButton>
          
          <!-- Bouton Télécharger -->
          <UButton 
            color="gray" 
            size="xs"
            @click="emit('telecharger', row)"
            class="flex items-center gap-1"
            title="Télécharger la facture en PDF"
          >
            <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            PDF
          </UButton>
          
          <!-- Bouton Historique -->
          <UButton 
            color="purple" 
            size="xs"
            @click="emit('historique', row)"
            class="flex items-center gap-1"
            title="Voir l'historique des versements"
          >
            <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Hist.
          </UButton>
          
          <!-- Bouton Versement (seulement si reste > 0) -->
          <UButton
            v-if="row.reste > 0 && row.status !== 'Payé'"
            color="green"
            size="xs"
            @click="emit('versement', row)"
            class="flex items-center gap-1"
            title="Ajouter un versement"
          >
            <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
            </svg>
            Verser
          </UButton>
        </div>
      </template>
    </UTable>

    <div class="flex justify-end px-3 py-3.5 border-t border-gray-200 dark:border-gray-700">
      <UPagination v-model="page" :page-count="pageCount" :total="totalFactures" />
    </div>
    
  </div>
</template>
