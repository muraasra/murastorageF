<script setup lang="ts">
import { ref, defineEmits } from "vue";

const emit = defineEmits(["close", "ajouterPartenaire"]);

// Modèle pour un nouveau partenaire
const nouveauPartenaire = ref({
  nomPartenaire: "",
  prenomPartenaire: "",
  telephone: "",
  boutique: false,
  localisationBoutique: "",
});

const errors = ref({
  nomPartenaire: "",
  prenomPartenaire: "",
  telephone: "",
});

// Validation des champs
function validateForm() {
  errors.value = {
    nomPartenaire: "",
    prenomPartenaire: "",
    telephone: "",
  };

  let isValid = true;

  if (!nouveauPartenaire.value.nomPartenaire.trim()) {
    errors.value.nomPartenaire = "Le nom est requis";
    isValid = false;
  }

  if (!nouveauPartenaire.value.prenomPartenaire.trim()) {
    errors.value.prenomPartenaire = "Le prénom est requis";
    isValid = false;
  }

  if (!nouveauPartenaire.value.telephone.trim()) {
    errors.value.telephone = "Le téléphone est requis";
    isValid = false;
  } else if (!/^[0-9+\-\s()]+$/.test(nouveauPartenaire.value.telephone)) {
    errors.value.telephone = "Format de téléphone invalide";
    isValid = false;
  }

  return isValid;
}

const ajouter = () => {
  if (validateForm()) {
    emit("ajouterPartenaire", { ...nouveauPartenaire.value });
    emit("close"); // Fermer la modale après ajout
  }
};
</script>

<template>
  <UModal @close="emit('close')">
    <UCard :ui="{ header: { padding: 'px-4 py-5 sm:px-6' }, body: { padding: 'px-4 sm:px-6' } }">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Ajouter un Partenaire</h3>
          <UButton
            @click="emit('close')"
            icon="i-heroicons-x-mark"
            color="gray"
            variant="ghost"
            size="sm"
          />
        </div>
      </template>

      <div class="space-y-4">
        <!-- Nom -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nom *
          </label>
          <UInput 
            v-model="nouveauPartenaire.nomPartenaire" 
            placeholder="Nom du partenaire"
            :error="!!errors.nomPartenaire"
          />
          <p v-if="errors.nomPartenaire" class="mt-1 text-sm text-red-600 dark:text-red-400">
            {{ errors.nomPartenaire }}
          </p>
        </div>

        <!-- Prénom -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Prénom *
          </label>
          <UInput 
            v-model="nouveauPartenaire.prenomPartenaire" 
            placeholder="Prénom du partenaire"
            :error="!!errors.prenomPartenaire"
          />
          <p v-if="errors.prenomPartenaire" class="mt-1 text-sm text-red-600 dark:text-red-400">
            {{ errors.prenomPartenaire }}
          </p>
        </div>

        <!-- Téléphone -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Téléphone *
          </label>
          <UInput 
            v-model="nouveauPartenaire.telephone" 
            placeholder="Numéro de téléphone"
            :error="!!errors.telephone"
          />
          <p v-if="errors.telephone" class="mt-1 text-sm text-red-600 dark:text-red-400">
            {{ errors.telephone }}
          </p>
        </div>

        <!-- Localisation -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Localisation
          </label>
          <UInput 
            v-model="nouveauPartenaire.localisationBoutique" 
            placeholder="Ville ou localisation"
          />
        </div>

        <!-- Boutique -->
        <div>
          <UCheckbox 
            v-model="nouveauPartenaire.boutique" 
            label="Possède une boutique"
          />
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end space-x-3">
          <UButton 
            color="gray" 
            variant="soft" 
            @click="emit('close')"
          >
            Annuler
          </UButton>
          <UButton 
            color="green" 
            @click="ajouter"
          >
            Ajouter le Partenaire
          </UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>
