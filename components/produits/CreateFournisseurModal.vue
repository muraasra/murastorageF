<script setup lang="ts">
import { ref } from 'vue'
import { z } from "zod"
import type { FormSubmitEvent } from "#ui/types"
import { useNotification } from '~/types/useNotification'

const { success, error } = useNotification()

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits(['close', 'created'])

const loading = ref(false)

// Schéma de validation
const schema = z.object({
  nom: z.string().min(1, "Le nom est requis"),
  code_fournisseur: z.string().min(1, "Le code fournisseur est requis"),
  email: z.string().email("Email invalide"),
  telephone: z.string().min(1, "Le téléphone est requis"),
  adresse: z.string().min(1, "L'adresse est requise"),
  ville: z.string().min(1, "La ville est requise"),
})

type Schema = z.output<typeof schema>

const state = ref<Schema>({
  nom: "",
  code_fournisseur: "",
  email: "",
  telephone: "",
  adresse: "",
  ville: "",
})

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  loading.value = true
  
  try {
    const entrepriseData = JSON.parse(localStorage.getItem('entreprise') || '{}')
    
    const fournisseurData = {
      ...event.data,
      pays: "Cameroun",
      delai_livraison_jours: 7,
      conditions_paiement: "",
      remise_defaut: 0,
      entreprise: entrepriseData.id,
      actif: true,
    }
    
    const response = await $fetch('http://127.0.0.1:8000/api/fournisseurs/', {
      method: 'POST',
      body: fournisseurData,
    })
    
    success('Fournisseur créé avec succès!')
    emit('created', response)
    emit('close')
    
    // Réinitialiser le formulaire
    state.value = {
      nom: "",
      code_fournisseur: "",
      email: "",
      telephone: "",
      adresse: "",
      ville: "",
    }
  } catch (err: any) {
    console.error('Erreur:', err)
    error(`Erreur lors de la création: ${err.data?.message || err.message || 'Erreur inconnue'}`)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UModal :model-value="isOpen" @update:model-value="emit('close')">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">Créer un nouveau fournisseur</h3>
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-x-mark-20-solid"
            @click="emit('close')"
          />
        </div>
      </template>

      <UForm
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormGroup label="Nom du fournisseur *" name="nom">
            <UInput v-model="state.nom" placeholder="Nom du fournisseur" />
          </UFormGroup>
          
          <UFormGroup label="Code fournisseur *" name="code_fournisseur">
            <UInput v-model="state.code_fournisseur" placeholder="Code unique" />
          </UFormGroup>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormGroup label="Email *" name="email">
            <UInput v-model="state.email" placeholder="email@exemple.com" />
          </UFormGroup>
          
          <UFormGroup label="Téléphone *" name="telephone">
            <UInput v-model="state.telephone" placeholder="+237 6XX XXX XXX" />
          </UFormGroup>
        </div>
        
        <UFormGroup label="Adresse *" name="adresse">
          <UTextarea v-model="state.adresse" placeholder="Adresse complète" />
        </UFormGroup>
        
        <UFormGroup label="Ville *" name="ville">
          <UInput v-model="state.ville" placeholder="Ville" />
        </UFormGroup>

        <div class="flex justify-end space-x-3 pt-4 border-t">
          <UButton type="button" color="gray" variant="outline" @click="emit('close')">
            Annuler
          </UButton>
          <UButton type="submit" color="green" :loading="loading">
            Créer
          </UButton>
        </div>
      </UForm>
    </UCard>
  </UModal>
</template>
