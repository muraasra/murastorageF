<script setup lang="ts">
definePageMeta({
    layout: "accueil",
});

import { ref } from "vue";
import { useNotification } from '@/types/useNotification';

const { success } = useNotification();

const company = ref("");
const email = ref("");
const service = ref("");
const details = ref("");
const errors = ref<{ company?: string; email?: string; service?: string }>({});

// Validation instantanée
const validateForm = () => {
  errors.value = {};
  if (!company.value.trim()) errors.value.company = "Nom de l'entreprise requis.";
  if (!email.value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errors.value.email = "Email invalide.";
  if (!service.value) errors.value.service = "Veuillez sélectionner un service.";

  return Object.keys(errors.value).length === 0;
};

const submitForm = () => {
  if (validateForm()) {
    success("Demande de devis envoyée !");
    company.value = email.value = service.value = details.value = "";
  }
};
</script>

<template>
  <div class="py-10 px-4 md:px-20 bg-white dark:bg-gray-900 text-gray-800 dark:text-white">
    <h1 class="text-3xl font-bold text-emerald-500 mb-6 text-center">Obtenir un Devis</h1>

    <form @submit.prevent="submitForm" class="space-y-4 max-w-lg mx-auto">
      <div>
        <input
          v-model="company"
          type="text"
          placeholder="Nom de l'entreprise"
          class="w-full p-3 border rounded-md dark:bg-gray-800 focus:ring-2 focus:ring-emerald-500"
          :class="{ 'border-red-500': errors.company }"
        />
        <p v-if="errors.company" class="text-red-500 text-sm">{{ errors.company }}</p>
      </div>

      <div>
        <input
          v-model="email"
          type="email"
          placeholder="Adresse email"
          class="w-full p-3 border rounded-md dark:bg-gray-800 focus:ring-2 focus:ring-emerald-500"
          :class="{ 'border-red-500': errors.email }"
        />
        <p v-if="errors.email" class="text-red-500 text-sm">{{ errors.email }}</p>
      </div>

      <div>
        <select
          v-model="service"
          class="w-full p-3 border rounded-md dark:bg-gray-800 focus:ring-2 focus:ring-emerald-500"
          :class="{ 'border-red-500': errors.service }"
        >
          <option disabled value="">Sélectionnez un service</option>
          <option>Gestion de stock</option>
          <option>Analyse des données</option>
          <option>Intégration API</option>
        </select>
        <p v-if="errors.service" class="text-red-500 text-sm">{{ errors.service }}</p>
      </div>

      <textarea
        v-model="details"
        placeholder="Détails supplémentaires (optionnel)"
        class="w-full p-3 border rounded-md dark:bg-gray-800 focus:ring-2 focus:ring-emerald-500"
      ></textarea>

      <button
        type="submit"
        class="w-full bg-emerald-500 text-white p-3 rounded-md hover:bg-emerald-600 transition"
      >
        Demander un devis
      </button>
    </form>
  </div>
</template>