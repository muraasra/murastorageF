// Composable pour gérer l'état de chargement des boutons
import { ref, Ref } from 'vue'

export interface ButtonLoadingState {
  isLoading: Ref<boolean>
  disabled: Ref<boolean>
  startLoading: () => void
  stopLoading: () => void
}

export const useButtonLoading = (initialState = false): ButtonLoadingState => {
  const isLoading = ref(initialState)
  const disabled = ref(initialState)

  const startLoading = () => {
    isLoading.value = true
    disabled.value = true
  }

  const stopLoading = () => {
    isLoading.value = false
    disabled.value = false
  }

  return {
    isLoading,
    disabled,
    startLoading,
    stopLoading
  }
}

// Hook pour gérer plusieurs états de chargement de boutons
export const useMultipleButtonLoading = (buttonCount: number = 3) => {
  const loadingStates = ref(Array.from({ length: buttonCount }, () => ref(false)))

  const startLoading = (index: number) => {
    if (index >= 0 && index < loadingStates.value.length) {
      loadingStates.value[index].value = true
    }
  }

  const stopLoading = (index: number) => {
    if (index >= 0 && index < loadingStates.value.length) {
      loadingStates.value[index].value = false
    }
  }

  const getLoading = (index: number) => {
    if (index >= 0 && index < loadingStates.value.length) {
      return loadingStates.value[index]
    }
    return ref(false)
  }

  return {
    loadingStates,
    startLoading,
    stopLoading,
    getLoading
  }
}






