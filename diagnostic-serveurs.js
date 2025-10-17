// Script de diagnostic pour vérifier l'état des serveurs et pages
console.log('=== DIAGNOSTIC SERVEURS ET PAGES PUBLIQUES ===')

// Fonction pour tester la disponibilité du frontend
async function testFrontend() {
  console.log('\n🌐 Test du serveur frontend:')
  
  try {
    const response = await fetch('http://localhost:3000/', {
      method: 'GET',
      mode: 'no-cors'
    })
    console.log('   ✅ Frontend accessible sur http://localhost:3000')
    return true
  } catch (error) {
    console.log('   ❌ Frontend non accessible:', error.message)
    console.log('   💡 Démarrez le frontend avec: cd Frontend && npm run dev')
    return false
  }
}

// Fonction pour tester la disponibilité du backend
async function testBackend() {
  console.log('\n🔧 Test du serveur backend:')
  
  try {
    const response = await fetch('http://127.0.0.1:8000/api/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      console.log('   ✅ Backend accessible sur http://127.0.0.1:8000')
      return true
    } else {
      console.log('   ⚠️ Backend répond mais avec erreur:', response.status)
      return false
    }
  } catch (error) {
    console.log('   ❌ Backend non accessible:', error.message)
    console.log('   💡 Démarrez le backend avec: cd Backend && python manage.py runserver')
    return false
  }
}

// Fonction pour tester l'accès aux pages publiques
async function testPublicPages() {
  console.log('\n📄 Test d\'accès aux pages publiques:')
  
  const publicPages = [
    { path: '/test-public', name: 'Test Public' },
    { path: '/home/accueil', name: 'Accueil' },
    { path: '/home/a_propos', name: 'À propos' },
    { path: '/home/confidentialite', name: 'Confidentialité' },
    { path: '/home/conditions', name: 'Conditions' },
    { path: '/connexion', name: 'Connexion' }
  ]
  
  for (const page of publicPages) {
    try {
      const response = await fetch(`http://localhost:3000${page.path}`, {
        method: 'GET',
        mode: 'no-cors'
      })
      console.log(`   ✅ ${page.name} (${page.path}) - Accessible`)
    } catch (error) {
      console.log(`   ❌ ${page.name} (${page.path}) - Non accessible`)
    }
  }
}

// Fonction pour vérifier l'état de connexion
function checkAuthState() {
  console.log('\n🔐 État de l\'authentification:')
  
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
    } catch (e) {
      console.log('   ❌ Erreur parsing user:', e.message)
    }
  }
}

// Fonction pour naviguer vers une page de test
function goToTestPage() {
  console.log('\n🧭 Navigation vers la page de test:')
  window.location.href = '/test-public'
}

// Fonction pour naviguer vers l'accueil
function goToHome() {
  console.log('\n🏠 Navigation vers l\'accueil:')
  window.location.href = '/home/accueil'
}

// Fonction pour simuler une connexion rapide
function quickLogin() {
  console.log('\n⚡ Connexion rapide simulée:')
  
  const mockUser = {
    id: 1,
    email: 'test@example.com',
    role: 'superadmin',
    entreprise: 1,
    nom: 'Test',
    prenom: 'User'
  }
  
  localStorage.setItem('access_token', 'mock-token-' + Date.now())
  localStorage.setItem('user', JSON.stringify(mockUser))
  
  console.log('   ✅ Connexion simulée réussie')
  console.log('   🔄 Rechargement de la page...')
  
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
  
  setTimeout(() => {
    location.reload()
  }, 1000)
}

// Exécution des tests
async function runDiagnostic() {
  console.log('Démarrage du diagnostic...')
  
  const frontendOk = await testFrontend()
  const backendOk = await testBackend()
  
  if (frontendOk) {
    await testPublicPages()
  }
  
  checkAuthState()
  
  console.log('\n📋 Instructions:')
  console.log('1. Pour tester une page publique: goToTestPage()')
  console.log('2. Pour aller à l\'accueil: goToHome()')
  console.log('3. Pour une connexion rapide: quickLogin()')
  console.log('4. Pour se déconnecter: logout()')
  console.log('5. Pour relancer le diagnostic: runDiagnostic()')
  
  console.log('\n🎯 Commandes disponibles:')
  console.log('- runDiagnostic() : Relancer tous les tests')
  console.log('- testFrontend() : Tester le frontend')
  console.log('- testBackend() : Tester le backend')
  console.log('- testPublicPages() : Tester les pages publiques')
  console.log('- checkAuthState() : Vérifier l\'état d\'auth')
  console.log('- goToTestPage() : Aller à la page de test')
  console.log('- goToHome() : Aller à l\'accueil')
  console.log('- quickLogin() : Connexion rapide')
  console.log('- logout() : Se déconnecter')
}

// Exposer les fonctions globalement
window.runDiagnostic = runDiagnostic
window.testFrontend = testFrontend
window.testBackend = testBackend
window.testPublicPages = testPublicPages
window.checkAuthState = checkAuthState
window.goToTestPage = goToTestPage
window.goToHome = goToHome
window.quickLogin = quickLogin
window.logout = logout

// Lancer le diagnostic automatiquement
runDiagnostic()









