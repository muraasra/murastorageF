// Script de test pour vérifier l'accès à tarification
console.log('=== TEST ACCÈS TARIFICATION ===')

// Fonction pour tester une URL
async function testUrl(url, description) {
  try {
    console.log(`\n🔍 Test: ${description}`)
    console.log(`   URL: ${url}`)
    
    const response = await fetch(url, {
      method: 'HEAD',
      mode: 'no-cors' // Pour éviter les erreurs CORS en développement
    })
    
    console.log(`   ✅ Page accessible`)
    return true
  } catch (error) {
    console.log(`   ❌ Erreur: ${error.message}`)
    return false
  }
}

// Fonction pour vérifier l'authentification
function checkAuth() {
  console.log('\n🔐 Vérification de l\'authentification:')
  
  const token = localStorage.getItem('access_token')
  const user = localStorage.getItem('user')
  const boutique = localStorage.getItem('boutique')
  
  console.log(`   Token: ${token ? '✅ Présent' : '❌ Absent'}`)
  console.log(`   User: ${user ? '✅ Présent' : '❌ Absent'}`)
  console.log(`   Boutique: ${boutique ? '✅ Présente' : '❌ Absente'}`)
  
  if (user) {
    try {
      const userData = JSON.parse(user)
      console.log(`   Rôle: ${userData.role || 'Non défini'}`)
      console.log(`   Email: ${userData.email || 'Non défini'}`)
      
      if (userData.role === 'superadmin') {
        console.log('   ✅ Accès autorisé à /superadmin/tarification')
      } else {
        console.log('   ❌ Rôle insuffisant pour /superadmin/tarification')
      }
    } catch (e) {
      console.log(`   ❌ Erreur parsing user: ${e.message}`)
    }
  }
}

// Fonction pour simuler une connexion superadmin (test uniquement)
function simulateSuperAdmin() {
  console.log('\n🧪 Simulation connexion SuperAdmin (TEST UNIQUEMENT):')
  
  localStorage.setItem('access_token', 'test-token-' + Date.now())
  localStorage.setItem('user', JSON.stringify({
    id: 1,
    email: 'admin@test.com',
    role: 'superadmin',
    entreprise: 1
  }))
  
  console.log('   ✅ Connexion simulée')
  console.log('   ⚠️  ATTENTION: Ceci est pour les tests uniquement!')
}

// Fonction pour effacer les données de test
function clearTestData() {
  console.log('\n🧹 Nettoyage des données de test:')
  localStorage.removeItem('access_token')
  localStorage.removeItem('user')
  localStorage.removeItem('boutique')
  console.log('   ✅ Données effacées')
}

// Exécution des tests
async function runTests() {
  console.log('Démarrage des tests...')
  
  // Vérifier l'authentification actuelle
  checkAuth()
  
  // Tester les URLs
  const baseUrl = window.location.origin
  
  await testUrl(`${baseUrl}/debug-auth`, 'Page de diagnostic')
  await testUrl(`${baseUrl}/superadmin/tarification-test`, 'Page tarification test')
  await testUrl(`${baseUrl}/superadmin/tarification`, 'Page tarification principale')
  
  console.log('\n📋 Instructions:')
  console.log('1. Si vous n\'êtes pas connecté: utilisez simulateSuperAdmin()')
  console.log('2. Si vous voulez tester sans auth: utilisez /tarification-test')
  console.log('3. Si vous voulez nettoyer: utilisez clearTestData()')
  
  console.log('\n🎯 Commandes disponibles:')
  console.log('- simulateSuperAdmin() : Simuler une connexion superadmin')
  console.log('- clearTestData() : Effacer les données de test')
  console.log('- checkAuth() : Vérifier l\'authentification')
  console.log('- runTests() : Relancer tous les tests')
}

// Exposer les fonctions globalement pour utilisation dans la console
window.simulateSuperAdmin = simulateSuperAdmin
window.clearTestData = clearTestData
window.checkAuth = checkAuth
window.runTests = runTests

// Lancer les tests automatiquement
runTests()













