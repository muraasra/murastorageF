// Script pour tester l'authentification et les middlewares
console.log('=== TEST AUTHENTIFICATION ET MIDDLEWARES ===')

// Vérifier les données dans localStorage
if (typeof window !== 'undefined') {
  console.log('1. Vérification du localStorage:')
  console.log('   - Token:', localStorage.getItem('access_token') ? 'Présent' : 'Absent')
  console.log('   - User:', localStorage.getItem('user') ? 'Présent' : 'Absent')
  console.log('   - Boutique:', localStorage.getItem('boutique') ? 'Présent' : 'Absent')
  
  // Afficher les détails de l'utilisateur
  const userStr = localStorage.getItem('user')
  if (userStr) {
    try {
      const user = JSON.parse(userStr)
      console.log('   - Rôle utilisateur:', user.role)
      console.log('   - ID utilisateur:', user.id)
      console.log('   - Email:', user.email)
    } catch (e) {
      console.log('   - Erreur parsing user:', e.message)
    }
  }
  
  // Afficher les détails de la boutique
  const boutiqueStr = localStorage.getItem('boutique')
  if (boutiqueStr) {
    try {
      const boutique = JSON.parse(boutiqueStr)
      console.log('   - Boutique ID:', boutique.id)
      console.log('   - Boutique nom:', boutique.nom)
    } catch (e) {
      console.log('   - Erreur parsing boutique:', e.message)
    }
  }
  
  console.log('\n2. Test de navigation vers /superadmin/tarification:')
  
  // Simuler la logique du middleware
  const token = localStorage.getItem('access_token')
  const user = localStorage.getItem('user')
  
  if (!token || !user) {
    console.log('   ❌ Pas connecté - redirection vers /connexion')
  } else {
    try {
      const userData = JSON.parse(user)
      const userRole = userData.role
      
      if (userRole === 'superadmin') {
        console.log('   ✅ SuperAdmin détecté - accès autorisé à /superadmin/tarification')
      } else {
        console.log('   ❌ Rôle non autorisé:', userRole, '- accès refusé')
      }
    } catch (e) {
      console.log('   ❌ Erreur parsing user:', e.message)
    }
  }
  
  console.log('\n3. Instructions pour résoudre le problème:')
  console.log('   - Si pas connecté: allez sur /connexion')
  console.log('   - Si connecté mais pas superadmin: contactez un administrateur')
  console.log('   - Si superadmin: vérifiez la console pour les erreurs')
  
} else {
  console.log('Ce script doit être exécuté dans le navigateur')
}














