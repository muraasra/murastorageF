export default defineNuxtPlugin(() => {
  // Initialiser le thème côté client
  if (process.client) {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    } else {
      // Utiliser la préférence système
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (prefersDark) {
        document.documentElement.classList.add('dark')
        localStorage.setItem('theme', 'dark')
      } else {
        document.documentElement.classList.remove('dark')
        localStorage.setItem('theme', 'light')
      }
    }

    // Appliquer une couleur primaire verte via CSS variables
    const root = document.documentElement
    root.style.setProperty('--color-primary', '16 185 129') // emerald-500
  }
})
















