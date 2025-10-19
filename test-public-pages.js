// Script de test pour vérifier les pages publiques
// À exécuter dans la console du navigateur

console.log('🧪 Test des pages publiques /home/*')

// Fonction pour tester l'accès aux pages publiques
function testPublicPages() {
  const publicPages = [
    '/home/accueil',
    '/home/a_propos',
    '/home/confidentialite',
    '/home/conditions',
    '/home/contact_accueil',
    '/home/faq',
    '/home/services',
    '/home/tarification',
    '/home/inscription',
    '/home/verification',
    '/home/about'
  ]

  console.log('📋 Pages publiques à tester:', publicPages)
  
  // Vérifier l'état actuel de l'authentification
  const token = localStorage.getItem('access_token')
  const user = localStorage.getItem('user')
  
  console.log('🔐 État de l\'authentification:')
  console.log('   - Token:', token ? 'Présent' : 'Absent')
  console.log('   - User:', user ? 'Présent' : 'Absent')
  
  if (token && user) {
    console.log('⚠️  Vous êtes connecté. Pour tester les pages publiques, déconnectez-vous d\'abord.')
    console.log('   Exécutez: logout()')
  } else {
    console.log('✅ Vous n\'êtes pas connecté. Les pages publiques devraient être accessibles.')
  }
}

// Fonction pour se déconnecter
function logout() {
  console.log('🚪 Déconnexion...')
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('user')
  localStorage.removeItem('entreprise')
  localStorage.removeItem('boutique')
  localStorage.removeItem('permissions')
  console.log('✅ Déconnexion réussie')
  
  // Rediriger vers la page d'accueil publique
  window.location.href = '/home/accueil'
}

// Fonction pour tester la redirection de la racine
function testRootRedirect() {
  console.log('🔄 Test de redirection depuis la racine "/"')
  
  // Simuler la navigation vers la racine
  const currentPath = window.location.pathname
  console.log('   - Chemin actuel:', currentPath)
  
  if (currentPath === '/') {
    console.log('   - Vous êtes sur la racine, redirection attendue vers /home/accueil')
  } else {
    console.log('   - Vous n\'êtes pas sur la racine')
  }
}

// Fonction pour vérifier le middleware
function checkMiddleware() {
  console.log('🔍 Vérification du middleware auth')
  
  const token = localStorage.getItem('access_token')
  const user = localStorage.getItem('user')
  const currentPath = window.location.pathname
  
  console.log('   - Chemin actuel:', currentPath)
  console.log('   - Token:', token ? 'Présent' : 'Absent')
  console.log('   - User:', user ? 'Présent' : 'Absent')
  
  if (!token || !user) {
    const publicPages = [
      '/connexion', '/test-public',
      '/home/accueil', '/home/a_propos', '/home/confidentialite',
      '/home/conditions', '/home/contact_accueil', '/home/faq',
      '/home/services', '/home/tarification', '/home/inscription',
      '/home/verification', '/home/about'
    ]
    
    const isPublicPage = publicPages.some(page => currentPath === page) || currentPath.startsWith('/home/')
    
    if (isPublicPage) {
      console.log('   ✅ Page publique autorisée')
    } else {
      console.log('   ❌ Page privée - redirection attendue vers /home/accueil')
    }
  } else {
    console.log('   ✅ Utilisateur connecté - accès autorisé')
  }
}

// Exécuter les tests
console.log('🚀 Démarrage des tests...')
testPublicPages()
testRootRedirect()
checkMiddleware()

console.log('\n📝 Commandes disponibles:')
console.log('   - testPublicPages() : Tester les pages publiques')
console.log('   - logout() : Se déconnecter')
console.log('   - testRootRedirect() : Tester la redirection racine')
console.log('   - checkMiddleware() : Vérifier le middleware')







