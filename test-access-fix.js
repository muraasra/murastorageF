// Script de test pour vérifier l'accès aux pages publiques et superadmin
// À exécuter dans la console du navigateur

console.log('🧪 Test d\'accès aux pages publiques et superadmin')

// Fonction pour nettoyer le localStorage
function clearAuth() {
  console.log('🧹 Nettoyage de l\'authentification...')
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('user')
  localStorage.removeItem('entreprise')
  localStorage.removeItem('boutique')
  localStorage.removeItem('permissions')
  console.log('✅ Authentification nettoyée')
}

// Fonction pour simuler une connexion superadmin
function simulateSuperAdmin() {
  console.log('👑 Simulation connexion SuperAdmin...')
  
  const mockUser = {
    id: 1,
    email: 'admin@test.com',
    role: 'superadmin',
    first_name: 'Super',
    last_name: 'Admin'
  }
  
  localStorage.setItem('access_token', 'mock-token-' + Date.now())
  localStorage.setItem('user', JSON.stringify(mockUser))
  
  console.log('✅ Connexion SuperAdmin simulée')
  console.log('   - Token:', localStorage.getItem('access_token'))
  console.log('   - User:', localStorage.getItem('user'))
}

// Fonction pour tester les pages publiques
function testPublicPages() {
  console.log('🌐 Test des pages publiques...')
  
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
  
  // Vérifier l'état actuel
  const token = localStorage.getItem('access_token')
  const user = localStorage.getItem('user')
  
  if (token && user) {
    console.log('⚠️  Vous êtes connecté. Pour tester les pages publiques, exécutez: clearAuth()')
  } else {
    console.log('✅ Vous n\'êtes pas connecté. Les pages publiques devraient être accessibles.')
  }
}

// Fonction pour tester l'accès superadmin
function testSuperAdminAccess() {
  console.log('👑 Test d\'accès SuperAdmin...')
  
  const token = localStorage.getItem('access_token')
  const user = localStorage.getItem('user')
  
  if (!token || !user) {
    console.log('❌ Pas connecté. Exécutez: simulateSuperAdmin()')
    return
  }
  
  try {
    const userData = JSON.parse(user)
    console.log('👤 Rôle utilisateur:', userData.role)
    
    if (userData.role === 'superadmin') {
      console.log('✅ SuperAdmin détecté - accès autorisé à /superadmin/*')
      console.log('   - /superadmin/tarification devrait être accessible')
      console.log('   - /superadmin/dashboard devrait être accessible')
    } else {
      console.log('❌ Pas SuperAdmin - accès refusé à /superadmin/*')
    }
  } catch (e) {
    console.log('❌ Erreur parsing user data:', e)
  }
}

// Fonction pour vérifier le middleware
function checkMiddleware() {
  console.log('🔍 Vérification du middleware...')
  
  const currentPath = window.location.pathname
  const token = localStorage.getItem('access_token')
  const user = localStorage.getItem('user')
  
  console.log('📍 Chemin actuel:', currentPath)
  console.log('🔐 Token:', token ? 'Présent' : 'Absent')
  console.log('👤 User:', user ? 'Présent' : 'Absent')
  
  if (!token || !user) {
    // Pas connecté
    const publicPages = [
      '/connexion', '/test-public',
      '/home/accueil', '/home/a_propos', '/home/confidentialite',
      '/home/conditions', '/home/contact_accueil', '/home/faq',
      '/home/services', '/home/tarification', '/home/inscription',
      '/home/verification', '/home/about'
    ]
    
    const isPublicPage = publicPages.some(page => currentPath === page) || currentPath.startsWith('/home/')
    
    if (isPublicPage) {
      console.log('✅ Page publique autorisée')
    } else {
      console.log('❌ Page privée - redirection attendue vers /home/accueil')
    }
  } else {
    // Connecté
    try {
      const userData = JSON.parse(user)
      console.log('👤 Rôle:', userData.role)
      
      if (userData.role === 'superadmin') {
        if (currentPath.startsWith('/superadmin')) {
          console.log('✅ Accès SuperAdmin autorisé')
        } else {
          console.log('⚠️  SuperAdmin sur page non-superadmin')
        }
      } else {
        if (currentPath.startsWith('/superadmin')) {
          console.log('❌ Accès SuperAdmin refusé pour ce rôle')
        } else {
          console.log('✅ Accès autorisé pour ce rôle')
        }
      }
    } catch (e) {
      console.log('❌ Erreur parsing user:', e)
    }
  }
}

// Fonction pour tester la navigation
function testNavigation() {
  console.log('🧭 Test de navigation...')
  
  const testUrls = [
    '/home/accueil',
    '/home/confidentialite',
    '/home/conditions',
    '/superadmin/tarification'
  ]
  
  console.log('🔗 URLs à tester:', testUrls)
  console.log('💡 Ouvrez ces URLs dans de nouveaux onglets pour tester')
}

// Exécuter les tests
console.log('🚀 Démarrage des tests...')
testPublicPages()
testSuperAdminAccess()
checkMiddleware()
testNavigation()

console.log('\n📝 Commandes disponibles:')
console.log('   - clearAuth() : Nettoyer l\'authentification')
console.log('   - simulateSuperAdmin() : Simuler connexion SuperAdmin')
console.log('   - testPublicPages() : Tester les pages publiques')
console.log('   - testSuperAdminAccess() : Tester l\'accès SuperAdmin')
console.log('   - checkMiddleware() : Vérifier le middleware')
console.log('   - testNavigation() : Tester la navigation')







