import { computed, ref } from 'vue'

export function useIsDarkTheme() {
  // Utiliser une approche plus robuste qui ne dépend pas de useColorMode
  const isDark = ref(false)
  
  // Initialiser le thème côté client
  if (process.client) {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      isDark.value = savedTheme === 'dark'
    } else {
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
  }
  
  const toggleTheme = () => {
    isDark.value = !isDark.value
    if (process.client) {
      localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
      if (isDark.value) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }
  
  return {
    isDark: computed(() => isDark.value),
    toggleTheme
  }
}
