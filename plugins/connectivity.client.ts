/**
 * Initialise la détection de connectivité serveur uniquement dans les layouts
 * qui font des mutations (default, superadmin). Pas sur la vitrine publique.
 */
export default defineNuxtPlugin(() => {
  // Délégué aux composants OfflineBanner dans chaque layout
})
