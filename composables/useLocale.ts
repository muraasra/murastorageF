import { ref, computed } from 'vue'
import fr from '~/locales/fr'
import en from '~/locales/en'

type Locale = 'fr' | 'en'

const translations = { fr, en }

// Singleton — partagé entre tous les composants
const _locale = ref<Locale>('fr')

if (process.client) {
  const saved = localStorage.getItem('locale') as Locale | null
  if (saved === 'fr' || saved === 'en') _locale.value = saved
}

export function useLocale() {
  const locale = computed(() => _locale.value)

  function setLocale(l: Locale) {
    _locale.value = l
    if (process.client) {
      localStorage.setItem('locale', l)
      document.documentElement.setAttribute('lang', l)
    }
  }

  function toggleLocale() {
    setLocale(_locale.value === 'fr' ? 'en' : 'fr')
  }

  // Accès aux traductions par chemin pointé ex: t('profile.logout')
  function t(path: string): string {
    const keys = path.split('.')
    let val: any = translations[_locale.value]
    for (const k of keys) {
      if (val == null) return path
      val = val[k]
    }
    return typeof val === 'string' ? val : path
  }

  return { locale, setLocale, toggleLocale, t }
}
