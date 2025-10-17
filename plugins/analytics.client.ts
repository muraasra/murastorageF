import { ANALYTICS_CONFIG } from '~/constants/analytics'

export default defineNuxtPlugin(() => {
  const { initGoogleAnalytics, initGoogleSearchConsole } = useAnalytics()
  
  // Initialiser Google Analytics avec votre ID réel
  initGoogleAnalytics(ANALYTICS_CONFIG.GA_ID)
  
  // Initialiser Google Search Console
  initGoogleSearchConsole(ANALYTICS_CONFIG.GSC_ID)
})
