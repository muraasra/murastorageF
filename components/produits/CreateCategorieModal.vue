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
  description: z.string().optional(),
  icone: z.string().optional(),
  couleur: z.string().optional(),
})

type Schema = z.output<typeof schema>

const state = ref<Schema>({
  nom: "",
  description: "",
  icone: "",
  couleur: "#3B82F6",
})

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  loading.value = true
  
  try {
    const entrepriseData = JSON.parse(localStorage.getItem('entreprise') || '{}')
    
    const categorieData = {
      ...event.data,
      entreprise: entrepriseData.id,
      actif: true,
    }
    
    const response = await $fetch('http://127.0.0.1:8000/api/categories/', {
      method: 'POST',
      body: categorieData,
    })
    
    success('Catégorie créée avec succès!')
    emit('created', response)
    emit('close')
    
    // Réinitialiser le formulaire
    state.value = {
      nom: "",
      description: "",
      icone: "",
      couleur: "#3B82F6",
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
          <h3 class="text-lg font-semibold">Créer une nouvelle catégorie</h3>
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
        <UFormGroup label="Nom de la catégorie *" name="nom">
          <UInput v-model="state.nom" placeholder="Nom de la catégorie" />
        </UFormGroup>
        
        <UFormGroup label="Description" name="description">
          <UTextarea v-model="state.description" placeholder="Description de la catégorie" />
        </UFormGroup>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormGroup label="Icône" name="icone">
            <UInput v-model="state.icone" placeholder="Classe CSS pour l'icône" />
          </UFormGroup>
          
          <UFormGroup label="Couleur" name="couleur">
            <UInput v-model="state.couleur" type="color" />
          </UFormGroup>
        </div>

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
