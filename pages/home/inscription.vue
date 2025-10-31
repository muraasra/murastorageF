<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { navigateTo } from '#app'
import { useNotification } from '@/types/useNotification'

definePageMeta({
    layout: "accueil",
})

const { error, success } = useNotification()

// État du formulaire
const currentStep = ref(1)
const isLoading = ref(false)
const hasUnsavedChanges = ref(false)
const errors = ref({
  user: {} as Record<string, string>,
  entreprise: {} as Record<string, string>
})

// Données du formulaire
const formData = ref({
  // Étape 1: Informations utilisateur (SuperAdmin)
  user: {
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    motDePasse: '',
    confirmerMotDePasse: '',
    accepteConditions: false
  },
  
  // Étape 2: Informations entreprise
  entreprise: {
    nom: '',
    description: '',
    secteurActivite: '',
    adresse: '',
    ville: '',
    codePostal: '',
    pays: 'Cameroun',
    telephone: '',
    email: '',
    siteWeb: '',
    numeroFiscal: '',
    nombreEmployes: '',
    anneeCreation: ''
  },
  
  // Étape 3: Sélection du pack
  pack: {
    type: '',
    prix: 0,
    duree: 'mensuel'
  }
})

// Packs disponibles
const packs = [
  {
    id: 'free',
    nom: 'Free',
    prix: 0,
    devise: 'XAF',
    duree: '3 mois',
    description: 'Plan gratuit pour 3 mois',
    fonctionnalites: [
      '1 entreprise, 1 boutique',
      '2 utilisateurs',
      '15 produits',
      '100 factures',
      'Support Email'
    ],
    populaire: false
  },
  {
    id: 'basic',
    nom: 'Basic',
    prix: 9900,
    devise: 'XAF',
    duree: 'mois',
    description: 'Accès aux fonctionnalités de base',
    fonctionnalites: [
      '2 boutiques, 3 utilisateurs',
      '100 produits',
      '500 factures/mois',
      'Codes-barres',
      'Import/Export CSV/Excel'
    ],
    populaire: false
  },
  {
    id: 'premium',
    nom: 'Premium',
    prix: 29000,
    devise: 'XAF',
    duree: 'mois',
    description: 'Accès complet à toutes les fonctionnalités',
    fonctionnalites: [
      '5 boutiques, 10 utilisateurs',
      '500 produits',
      '2,000 factures/mois',
      '1 inventaire/mois',
      'Support prioritaire'
    ],
    populaire: true
  },
  {
    id: 'organisation',
    nom: 'Organisation',
    prix: 55000,
    devise: 'XAF',
    duree: 'mois',
    description: 'Plan personnalisable illimité',
    fonctionnalites: [
      'Entreprises, boutiques illimitées',
      'Utilisateurs illimités',
      'Produits illimités',
      'API accès',
      'Support dédié'
    ],
    populaire: false
  }
]

// Validation des étapes
const isStepValid = computed(() => {
  switch (currentStep.value) {
    case 1:
      return validateUserData()
    case 2:
      return validateCompanyData()
    case 3:
      return formData.value.pack.type
    default:
      return false
  }
})

// Validation des données utilisateur
const validateUserData = () => {
  const user = formData.value.user
  
  // Vérifications de base
  if (!user.nom || !user.prenom || !user.email || !user.telephone || !user.motDePasse) {
    return false
  }
  
  // Validation email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(user.email)) {
    return false
  }
  
  // Validation téléphone (format camerounais)
  const phoneRegex = /^(\+237|237)?[6-7][0-9]{8}$/
  const cleanPhone = user.telephone.replace(/\s/g, '')
  if (!phoneRegex.test(cleanPhone)) {
    return false
  }
  
  // Validation mot de passe (minimum 8 caractères)
  if (user.motDePasse.length < 8) {
    return false
  }
  
  // Vérification confirmation mot de passe
  if (user.motDePasse !== user.confirmerMotDePasse) {
    return false
  }
  
  // Acceptation des conditions
  if (!user.accepteConditions) {
    return false
  }
  
  return true
}

// Validation des données entreprise
const validateCompanyData = () => {
  const company = formData.value.entreprise
  
  // Vérifications de base
  if (!company.nom || !company.secteurActivite || !company.adresse || !company.ville || !company.email) {
    return false
  }
  
  // Validation email entreprise
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(company.email)) {
    return false
  }
  
  // Validation année de création
  if (company.anneeCreation) {
    const currentYear = new Date().getFullYear()
    const year = parseInt(company.anneeCreation)
    if (year < 1900 || year > currentYear) {
      return false
    }
  }
  
  // Validation site web si fourni
  if (company.siteWeb && company.siteWeb.trim() !== '') {
    const urlRegex = /^https?:\/\/.+\..+/
    if (!urlRegex.test(company.siteWeb)) {
      return false
    }
  }
  
  return true
}

// Fonction pour obtenir les erreurs de validation
const getValidationErrors = () => {
  const userErrors: Record<string, string> = {}
  const companyErrors: Record<string, string> = {}
  
  // Erreurs utilisateur
  const user = formData.value.user
  if (user.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
    userErrors.email = 'Format d\'email invalide'
  }
  if (user.telephone && !/^(\+237|237)?[6-7][0-9]{8}$/.test(user.telephone.replace(/\s/g, ''))) {
    userErrors.telephone = 'Format de téléphone invalide (ex: +237 6XX XX XX XX)'
  }
  if (user.motDePasse && user.motDePasse.length < 8) {
    userErrors.motDePasse = 'Le mot de passe doit contenir au moins 8 caractères'
  }
  if (user.motDePasse && user.confirmerMotDePasse && user.motDePasse !== user.confirmerMotDePasse) {
    userErrors.confirmerMotDePasse = 'Les mots de passe ne correspondent pas'
  }
  
  // Erreurs entreprise
  const company = formData.value.entreprise
  if (company.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(company.email)) {
    companyErrors.email = 'Format d\'email invalide'
  }
  if (company.siteWeb && company.siteWeb.trim() !== '' && !/^https?:\/\/.+\..+/.test(company.siteWeb)) {
    companyErrors.siteWeb = 'Format d\'URL invalide (ex: https://www.exemple.com)'
  }
  if (company.anneeCreation) {
    const currentYear = new Date().getFullYear()
    const year = parseInt(company.anneeCreation)
    if (year < 1900 || year > currentYear) {
      companyErrors.anneeCreation = `L'année doit être entre 1900 et ${currentYear}`
    }
  }
  
  return { user: userErrors, entreprise: companyErrors }
}

// Fonction pour obtenir la classe CSS d'erreur
const getFieldErrorClass = (fieldPath: string) => {
  const [section, field] = fieldPath.split('.')
  return (errors.value as any)[section]?.[field] ? 'border-red-500 focus:border-red-500' : ''
}

// Fonction pour obtenir le message d'erreur
const getFieldError = (fieldPath: string) => {
  const [section, field] = fieldPath.split('.')
  return (errors.value as any)[section]?.[field] || ''
}

// Mise à jour des erreurs
const updateErrors = () => {
  errors.value = getValidationErrors()
}

// Navigation entre les étapes
const nextStep = () => {
  if (isStepValid.value && currentStep.value < 3) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

// Sélection du pack
const selectPack = (pack: any) => {
  formData.value.pack.type = pack.id
  formData.value.pack.prix = pack.prix
}

// Soumission du formulaire
const submitForm = async () => {
  if (!isStepValid.value) return
  
  isLoading.value = true
  
  try {
    // Préparer les données pour l'API selon la vue backend
    const registrationData = {
      user: {
        nom: formData.value.user.nom,
        prenom: formData.value.user.prenom,
        email: formData.value.user.email,
        telephone: formData.value.user.telephone,
        mot_de_passe: formData.value.user.motDePasse,
        role: 'superadmin'
      },
      nom: formData.value.entreprise.nom,
      description: formData.value.entreprise.description,
      secteur_activite: formData.value.entreprise.secteurActivite,
      adresse: formData.value.entreprise.adresse,
      ville: formData.value.entreprise.ville,
      code_postal: formData.value.entreprise.codePostal,
      pays: formData.value.entreprise.pays,
      telephone: formData.value.entreprise.telephone,
      email: formData.value.entreprise.email,
      site_web: formData.value.entreprise.siteWeb,
      numero_fiscal: formData.value.entreprise.numeroFiscal,
      nombre_employes: formData.value.entreprise.nombreEmployes ? parseInt(formData.value.entreprise.nombreEmployes.split('-')[0]) || 0 : 0,
      annee_creation: parseInt(formData.value.entreprise.anneeCreation) || new Date().getFullYear(),
      pack_type: formData.value.pack.type,
      pack_prix: formData.value.pack.prix,
      pack_duree: formData.value.pack.duree,
      is_active: true
    }
    
    // Debug: Afficher les données envoyées
    console.log('Données envoyées au backend:', registrationData)
    
    // Appel à l'API
    const { data, error: apiError } = await useApi(`/api/inscription/`, {
      method: 'POST',
      body: registrationData,
      server: false
    })
    
    if (apiError.value) {
      error(apiError.value.message || 'Erreur lors de l\'inscription')
      return
    }
    
    success('Inscription réussie ! Un email de vérification a été envoyé.')
    
    // Redirection vers la page de vérification
    setTimeout(() => {
      navigateTo('/home/verification')
    }, 1500)
    
  } catch (err) {
    console.error('Erreur lors de l\'inscription:', err)
    error('Une erreur est survenue lors de l\'inscription')
  } finally {
    isLoading.value = false
  }
}

// Secteurs d'activité
const secteursActivite = [
  'Technologie et Informatique',
  'Commerce et Vente',
  'Industrie et Production',
  'Services',
  'Santé et Médical',
  'Éducation et Formation',
  'Finance et Assurance',
  'Immobilier',
  'Transport et Logistique',
  'Agriculture et Agroalimentaire',
  'Tourisme et Hôtellerie',
  'Autre'
]

// Nombre d'employés
const nombreEmployesOptions = [
  '1-5 employés',
  '6-20 employés',
  '21-50 employés',
  '51-100 employés',
  '101-500 employés',
  'Plus de 500 employés'
]

// Fonction pour détecter les changements dans le formulaire
const checkForChanges = () => {
  const hasUserData = formData.value.user.nom || formData.value.user.prenom || 
                     formData.value.user.email || formData.value.user.telephone ||
                     formData.value.user.motDePasse || formData.value.user.confirmerMotDePasse
  
  const hasCompanyData = formData.value.entreprise.nom || formData.value.entreprise.description ||
                        formData.value.entreprise.secteurActivite || formData.value.entreprise.adresse ||
                        formData.value.entreprise.ville || formData.value.entreprise.email ||
                        formData.value.entreprise.telephone || formData.value.entreprise.siteWeb ||
                        formData.value.entreprise.numeroFiscal || formData.value.entreprise.nombreEmployes ||
                        formData.value.entreprise.anneeCreation
  
  const hasPackData = formData.value.pack.type
  
  hasUnsavedChanges.value = Boolean(hasUserData || hasCompanyData || hasPackData)
}

// Fonction pour sauvegarder les données dans localStorage
const saveToLocalStorage = () => {
  if (process.client) {
    localStorage.setItem('inscription_form_data', JSON.stringify(formData.value))
  }
}

// Fonction pour charger les données depuis localStorage
const loadFromLocalStorage = () => {
  if (process.client) {
    const savedData = localStorage.getItem('inscription_form_data')
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData)
        formData.value = { ...formData.value, ...parsedData }
        checkForChanges()
      } catch (e) {
        console.error('Erreur lors du chargement des données sauvegardées:', e)
      }
    }
  }
}

// Fonction pour effacer les données sauvegardées
const clearSavedData = () => {
  if (process.client) {
    localStorage.removeItem('inscription_form_data')
    hasUnsavedChanges.value = false
  }
}

// Fonction pour confirmer la navigation
const confirmNavigation = (message: string) => {
  return confirm(message)
}

// Surveillance des changements dans le formulaire
watch(formData, () => {
  checkForChanges()
  updateErrors()
  if (hasUnsavedChanges.value) {
    saveToLocalStorage()
  }
}, { deep: true })

// Gestion de l'événement beforeunload
onMounted(() => {
  loadFromLocalStorage()
  
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (hasUnsavedChanges.value) {
      e.preventDefault()
      e.returnValue = 'Vous avez des données non sauvegardées. Êtes-vous sûr de vouloir quitter cette page ?'
      return e.returnValue
    }
  }
  
  window.addEventListener('beforeunload', handleBeforeUnload)
  
  onUnmounted(() => {
    window.removeEventListener('beforeunload', handleBeforeUnload)
  })
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
    <div class="max-w-4xl mx-auto">
      <!-- En-tête -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Créer votre entreprise
        </h1>
        <p class="text-lg text-gray-600 dark:text-gray-300">
          Rejoignez des milliers d'entreprises qui font confiance à notre solution de gestion
        </p>
        
        <!-- Indicateur de sauvegarde automatique -->
        <div v-if="hasUnsavedChanges" class="mt-4 inline-flex items-center px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-lg text-sm">
          <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
          </svg>
          Vos données sont sauvegardées automatiquement
        </div>
      </div>

      <!-- Indicateur de progression -->
      <div class="mb-8">
        <div class="flex items-center justify-center space-x-4">
          <div v-for="step in 3" :key="step" class="flex items-center">
            <div 
              :class="[
                'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium',
                currentStep >= step 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
              ]"
            >
              {{ step }}
            </div>
            <div v-if="step < 3" class="w-16 h-1 mx-2 bg-gray-200 dark:bg-gray-700"></div>
          </div>
        </div>
        <div class="flex justify-center mt-4 space-x-16">
          <span :class="currentStep >= 1 ? 'text-emerald-600 font-medium' : 'text-gray-500'">
            Informations personnelles
          </span>
          <span :class="currentStep >= 2 ? 'text-emerald-600 font-medium' : 'text-gray-500'">
            Informations entreprise
          </span>
          <span :class="currentStep >= 3 ? 'text-emerald-600 font-medium' : 'text-gray-500'">
            Choix du pack
          </span>
        </div>
      </div>

      <!-- Formulaire -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <!-- Étape 1: Informations utilisateur -->
        <div v-if="currentStep === 1" class="space-y-6">
          <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Vos informations personnelles
          </h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nom *
              </label>
              <UInput 
                v-model="formData.user.nom" 
                placeholder="Votre nom"
                class="w-full"
                required
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Prénom *
              </label>
              <UInput 
                v-model="formData.user.prenom" 
                placeholder="Votre prénom"
                class="w-full"
                required
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email *
              </label>
              <UInput 
                v-model="formData.user.email" 
                type="email"
                placeholder="votre@email.com"
                :class="['w-full', getFieldErrorClass('user.email')]"
                required
              />
              <p v-if="getFieldError('user.email')" class="text-red-500 text-sm mt-1">
                {{ getFieldError('user.email') }}
              </p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Téléphone *
              </label>
              <UInput 
                v-model="formData.user.telephone" 
                placeholder="+237 6XX XX XX XX"
                :class="['w-full', getFieldErrorClass('user.telephone')]"
                required
              />
              <p v-if="getFieldError('user.telephone')" class="text-red-500 text-sm mt-1">
                {{ getFieldError('user.telephone') }}
              </p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mot de passe *
              </label>
              <UInput 
                v-model="formData.user.motDePasse" 
                type="password"
                placeholder="Mot de passe sécurisé"
                :class="['w-full', getFieldErrorClass('user.motDePasse')]"
                required
              />
              <p v-if="getFieldError('user.motDePasse')" class="text-red-500 text-sm mt-1">
                {{ getFieldError('user.motDePasse') }}
              </p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirmer le mot de passe *
              </label>
              <UInput 
                v-model="formData.user.confirmerMotDePasse" 
                type="password"
                placeholder="Confirmer le mot de passe"
                :class="['w-full', getFieldErrorClass('user.confirmerMotDePasse')]"
                required
              />
              <p v-if="getFieldError('user.confirmerMotDePasse')" class="text-red-500 text-sm mt-1">
                {{ getFieldError('user.confirmerMotDePasse') }}
              </p>
            </div>
          </div>
          
          <div class="flex items-start space-x-3">
            <UCheckbox v-model="formData.user.accepteConditions" />
            <label class="text-sm text-gray-600 dark:text-gray-400">
              J'accepte les 
              <a href="/home/conditions" target="_blank" rel="noopener noreferrer" class="text-emerald-600 hover:underline">conditions d'utilisation</a> 
              et la 
              <a href="/home/confidentialite" target="_blank" rel="noopener noreferrer" class="text-emerald-600 hover:underline">politique de confidentialité</a>
            </label>
          </div>
        </div>

        <!-- Étape 2: Informations entreprise -->
        <div v-if="currentStep === 2" class="space-y-6">
          <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Informations de votre entreprise
          </h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nom de l'entreprise *
              </label>
              <UInput 
                v-model="formData.entreprise.nom" 
                placeholder="Nom de votre entreprise"
                class="w-full"
                required
              />
            </div>
            
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description de l'entreprise
              </label>
              <UTextarea 
                v-model="formData.entreprise.description" 
                placeholder="Décrivez brièvement votre entreprise et ses activités"
                class="w-full"
                :rows="3"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Secteur d'activité *
              </label>
              <USelect 
                v-model="formData.entreprise.secteurActivite"
                :options="secteursActivite"
                placeholder="Sélectionner un secteur"
                class="w-full"
                required
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre d'employés
              </label>
              <USelect 
                v-model="formData.entreprise.nombreEmployes"
                :options="nombreEmployesOptions"
                placeholder="Sélectionner"
                class="w-full"
              />
            </div>
            
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Adresse complète *
              </label>
              <UInput 
                v-model="formData.entreprise.adresse" 
                placeholder="Adresse de votre entreprise"
                class="w-full"
                required
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ville *
              </label>
              <UInput 
                v-model="formData.entreprise.ville" 
                placeholder="Ville"
                class="w-full"
                required
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Code postal
              </label>
              <UInput 
                v-model="formData.entreprise.codePostal" 
                placeholder="Code postal"
                class="w-full"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Pays
              </label>
              <UInput 
                v-model="formData.entreprise.pays" 
                placeholder="Pays"
                class="w-full"
                readonly
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Téléphone entreprise
              </label>
              <UInput 
                v-model="formData.entreprise.telephone" 
                placeholder="Téléphone de l'entreprise"
                class="w-full"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email entreprise *
              </label>
              <UInput 
                v-model="formData.entreprise.email" 
                type="email"
                placeholder="contact@entreprise.com"
                :class="['w-full', getFieldErrorClass('entreprise.email')]"
                required
              />
              <p v-if="getFieldError('entreprise.email')" class="text-red-500 text-sm mt-1">
                {{ getFieldError('entreprise.email') }}
              </p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Site web
              </label>
              <UInput 
                v-model="formData.entreprise.siteWeb" 
                placeholder="https://www.entreprise.com"
                :class="['w-full', getFieldErrorClass('entreprise.siteWeb')]"
              />
              <p v-if="getFieldError('entreprise.siteWeb')" class="text-red-500 text-sm mt-1">
                {{ getFieldError('entreprise.siteWeb') }}
              </p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Numéro fiscal
              </label>
              <UInput 
                v-model="formData.entreprise.numeroFiscal" 
                placeholder="Numéro fiscal"
                class="w-full"
              />
            </div>
            
    <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Année de création
              </label>
              <UInput 
                v-model="formData.entreprise.anneeCreation" 
                type="number"
                :min="1900"
                :max="new Date().getFullYear()"
                placeholder="2024"
                :class="['w-full', getFieldErrorClass('entreprise.anneeCreation')]"
              />
              <p v-if="getFieldError('entreprise.anneeCreation')" class="text-red-500 text-sm mt-1">
                {{ getFieldError('entreprise.anneeCreation') }}
              </p>
            </div>
          </div>
        </div>

        <!-- Étape 3: Sélection du pack -->
        <div v-if="currentStep === 3" class="space-y-6">
          <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Choisissez votre pack
          </h2>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div 
              v-for="pack in packs" 
              :key="pack.id"
              :class="[
                'relative p-6 border-2 rounded-xl cursor-pointer transition-all duration-200',
                formData.pack.type === pack.id 
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
                pack.populaire ? 'ring-2 ring-emerald-500 ring-opacity-50' : ''
              ]"
              @click="selectPack(pack)"
            >
              <!-- Badge populaire -->
              <div v-if="pack.populaire" class="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span class="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                  Populaire
                </span>
              </div>
              
              <div class="text-center">
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {{ pack.nom }}
                </h3>
                
                <div class="mb-4">
                  <span class="text-3xl font-bold text-gray-900 dark:text-white">
                    {{ pack.prix }}{{ pack.devise }}
                  </span>
                  <span class="text-gray-600 dark:text-gray-400">
                    /{{ pack.duree }}
                  </span>
                </div>
                
                <p class="text-gray-600 dark:text-gray-400 mb-4">
                  {{ pack.description }}
                </p>
                
                <ul class="text-left space-y-2 mb-6">
                  <li v-for="fonctionnalite in pack.fonctionnalites" :key="fonctionnalite" class="flex items-start">
                    <svg class="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                    </svg>
                    <span class="text-sm text-gray-700 dark:text-gray-300">{{ fonctionnalite }}</span>
                  </li>
                </ul>
                
                <div class="flex items-center justify-center">
                  <div :class="[
                    'w-6 h-6 rounded-full border-2 flex items-center justify-center',
                    formData.pack.type === pack.id 
                      ? 'border-emerald-500 bg-emerald-500' 
                      : 'border-gray-300 dark:border-gray-600'
                  ]">
                    <svg v-if="formData.pack.type === pack.id" class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Navigation -->
        <div class="flex justify-between items-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <UButton 
            v-if="currentStep > 1"
            @click="prevStep"
            variant="outline"
            color="gray"
            size="lg"
          >
            <template #leading>
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </template>
            Précédent
          </UButton>
          
          <div v-else></div>
          
          <UButton 
            v-if="currentStep < 3"
            @click="nextStep"
            :disabled="!isStepValid"
            color="emerald"
            size="lg"
          >
            Suivant
            <template #trailing>
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </template>
          </UButton>
          
          <UButton 
            v-else
            @click="submitForm"
            :disabled="!isStepValid || isLoading"
            :loading="isLoading"
            color="green"
            size="lg"
          >
            <template #leading>
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </template>
            Créer mon entreprise
          </UButton>
        </div>
      </div>
      
      <!-- Lien vers la connexion -->
      <div class="text-center mt-6">
        <p class="text-gray-600 dark:text-gray-400">
          Vous avez déjà un compte ? 
          <NuxtLink to="/connexion" class="text-emerald-600 hover:underline font-medium">
            Se connecter
          </NuxtLink>
        </p>
      </div>
    </div>
    </div>
</template>
