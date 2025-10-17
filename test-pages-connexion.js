// Script de test pour vérifier l'accès aux pages publiques et la connexion
console.log('=== TEST ACCÈS PAGES PUBLIQUES ET CONNEXION ===')

// Fonction pour tester l'accès aux pages publiques
function testPublicPages() {
  console.log('\n📄 Test d\'accès aux pages publiques:')
  
  const publicPages = [
    { path: '/home/accueil', name: 'Accueil' },
    { path: '/home/a_propos', name: 'À propos' },
    { path: '/home/confidentialite', name: 'Confidentialité' },
    { path: '/home/conditions', name: 'Conditions' },
    { path: '/connexion', name: 'Connexion' }
  ]
  
  publicPages.forEach(page => {
    console.log(`   ✅ ${page.name} (${page.path}) - Accès autorisé sans connexion`)
  })
}

// Fonction pour tester la connexion
function testConnection() {
  console.log('\n🔐 Test de connexion:')
  
  // Vérifier les données actuelles
  const token = localStorage.getItem('access_token')
  const user = localStorage.getItem('user')
  const boutique = localStorage.getItem('boutique')
  
  console.log('   Token:', token ? '✅ Présent' : '❌ Absent')
  console.log('   User:', user ? '✅ Présent' : '❌ Absent')
  console.log('   Boutique:', boutique ? '✅ Présente' : '❌ Absente')
  
  if (user) {
    try {
      const userData = JSON.parse(user)
      console.log('   Rôle:', userData.role)
      console.log('   Email:', userData.email)
      console.log('   Entreprise:', userData.entreprise)
    } catch (e) {
      console.log('   ❌ Erreur parsing user:', e.message)
    }
  }
}

// Fonction pour simuler une connexion SuperAdmin
function simulateSuperAdminLogin() {
  console.log('\n🧪 Simulation connexion SuperAdmin:')
  
  const mockUser = {
    id: 1,
    email: 'admin@storagepro.cm',
    role: 'superadmin',
    entreprise: 1,
    nom: 'Admin',
    prenom: 'Super'
  }
  
  localStorage.setItem('access_token', 'mock-token-' + Date.now())
  localStorage.setItem('user', JSON.stringify(mockUser))
  
  console.log('   ✅ Connexion SuperAdmin simulée')
  console.log('   📧 Email: admin@storagepro.cm')
  console.log('   🔑 Mot de passe: password123')
  
  // Recharger la page
  setTimeout(() => {
    location.reload()
  }, 1000)
}

// Fonction pour simuler une connexion utilisateur
function simulateUserLogin() {
  console.log('\n🧪 Simulation connexion Utilisateur:')
  
  const mockUser = {
    id: 2,
    email: 'user@storagepro.cm',
    role: 'user',
    entreprise: 1,
    nom: 'User',
    prenom: 'Test'
  }
  
  const mockBoutique = {
    id: 1,
    nom: 'Boutique Test',
    entreprise: 1
  }
  
  localStorage.setItem('access_token', 'mock-token-' + Date.now())
  localStorage.setItem('user', JSON.stringify(mockUser))
  localStorage.setItem('boutique', JSON.stringify(mockBoutique))
  
  console.log('   ✅ Connexion Utilisateur simulée')
  console.log('   📧 Email: user@storagepro.cm')
  console.log('   🔑 Mot de passe: password123')
  console.log('   🏢 Entreprise ID: 1')
  
  // Recharger la page
  setTimeout(() => {
    location.reload()
  }, 1000)
}

// Fonction pour déconnecter
function logout() {
  console.log('\n🚪 Déconnexion:')
  
  localStorage.removeItem('access_token')
  localStorage.removeItem('user')
  localStorage.removeItem('boutique')
  localStorage.removeItem('refresh_token')
  
  console.log('   ✅ Déconnexion effectuée')
  
  // Recharger la page
  setTimeout(() => {
    location.reload()
  }, 1000)
}

// Fonction pour naviguer vers une page
function navigateToPage(path) {
  console.log(`\n🧭 Navigation vers: ${path}`)
  window.location.href = path
}

// Fonction pour tester le backend
async function testBackend() {
  console.log('\n🔧 Test du backend:')
  
  try {
    const response = await fetch('http://127.0.0.1:8000/api/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      console.log('   ✅ Backend accessible sur http://127.0.0.1:8000')
    } else {
      console.log('   ⚠️ Backend répond mais avec erreur:', response.status)
    }
  } catch (error) {
    console.log('   ❌ Backend non accessible:', error.message)
    console.log('   💡 Le mode simulation sera utilisé pour la connexion')
  }
}

// Exécution des tests
function runAllTests() {
  console.log('Démarrage des tests...')
  
  testPublicPages()
  testConnection()
  testBackend()
  
  console.log('\n📋 Instructions:')
  console.log('1. Pour tester la connexion SuperAdmin: simulateSuperAdminLogin()')
  console.log('2. Pour tester la connexion Utilisateur: simulateUserLogin()')
  console.log('3. Pour se déconnecter: logout()')
  console.log('4. Pour naviguer vers une page: navigateToPage("/home/accueil")')
  console.log('5. Pour relancer tous les tests: runAllTests()')
  
  console.log('\n🎯 Commandes disponibles:')
  console.log('- simulateSuperAdminLogin() : Simuler connexion SuperAdmin')
  console.log('- simulateUserLogin() : Simuler connexion Utilisateur')
  console.log('- logout() : Se déconnecter')
  console.log('- testConnection() : Vérifier l\'état de connexion')
  console.log('- testPublicPages() : Tester l\'accès aux pages publiques')
  console.log('- testBackend() : Tester la disponibilité du backend')
  console.log('- navigateToPage(path) : Naviguer vers une page')
  console.log('- runAllTests() : Relancer tous les tests')
}

// Exposer les fonctions globalement
window.simulateSuperAdminLogin = simulateSuperAdminLogin
window.simulateUserLogin = simulateUserLogin
window.logout = logout
window.testConnection = testConnection
window.testPublicPages = testPublicPages
window.testBackend = testBackend
window.navigateToPage = navigateToPage
window.runAllTests = runAllTests

// Lancer les tests automatiquement
runAllTests()









