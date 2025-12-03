<script setup lang="ts">
definePageMeta({
  layout: "accueil",
})

// Métadonnées SEO optimisées
useSeoMeta({
  title: 'Politique de Confidentialité Mura Storage - Protection des Données RGPD',
  description: 'Politique de confidentialité Mura Storage : protection de vos données personnelles, conformité RGPD, sécurité des informations, gestion des cookies, droits des utilisateurs. Transparence totale sur la collecte et l\'utilisation de vos données.',
  ogTitle: 'Politique de Confidentialité Mura Storage',
  ogDescription: 'Politique de confidentialité complète de Mura Storage. Protection des données, conformité RGPD, sécurité des informations.',
  ogType: 'website',
  ogUrl: 'https://murastorage.netlify.app/home/confidentialite',
  ogImage: 'https://murastorage.netlify.app/img/og-image-MuraSrorage.png',
  keywords: 'politique confidentialité Mura Storage, protection données RGPD, confidentialité gestion stock, sécurité données entreprise, RGPD logiciel stock, vie privée Mura Storage',
  robots: 'index, follow',
  canonical: 'https://murastorage.netlify.app/home/confidentialite'
});
</script>

<template>
  <div class="max-w-4xl mx-auto px-6 py-8 text-justify leading-relaxed">
    <h1 class="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-white">
      POLITIQUE DE CONFIDENTIALITÉ – MURA STORAGE
    </h1>

    <p class="text-sm text-gray-600 dark:text-gray-400 mb-8 text-center">
      Dernière mise à jour : {{ new Date().toLocaleDateString('fr-FR') }}
    </p>

    <div class="prose prose-lg max-w-none dark:prose-invert">
      <h2 class="text-2xl font-semibold text-gray-800 dark:text-white mb-4">1. INTRODUCTION ET DÉFINITIONS GÉNÉRALES</h2>

      <h3 class="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-3">1.1. Objet et portée de la présente Politique</h3>
      <p class="mb-4 text-gray-700 dark:text-gray-300">
        La présente Politique de Confidentialité ("Politique") régit la collecte, l'utilisation, le stockage, le traitement, la protection et la communication des données personnelles des utilisateurs de la plateforme Mura Storage ("Plateforme", "Service", "Nous", "Notre", "Groupe Mura") développée et exploitée par Groupe Mura, société camerounaise immatriculée au Registre du Commerce sous le numéro RC/CMR/2024/XXXX, dont le siège social est situé à Bamendzi 2, Bafoussam, Cameroun.
      </p>
      <p class="mb-6 text-gray-700 dark:text-gray-300">
        Cette Politique s'applique à tous les utilisateurs ("Utilisateur", "Vous", "Votre") de notre plateforme de gestion de stock, qu'ils soient des entreprises, des particuliers, des partenaires commerciaux, des visiteurs de notre site web, des utilisateurs de nos applications mobiles, des intégrateurs utilisant nos API, ou toute personne interagissant avec nos services. En utilisant notre Service, Vous acceptez expressément les termes de cette Politique de Confidentialité.
      </p>

      <h3 class="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-3">1.2. Conformité réglementaire</h3>
      <p class="mb-6 text-gray-700 dark:text-gray-300">
        Cette Politique est établie en conformité avec le Règlement Général sur la Protection des Données (RGPD) de l'Union Européenne (Règlement UE 2016/679), la Loi camerounaise sur la protection des données personnelles, et toute autre réglementation applicable en matière de protection des données personnelles dans les juridictions où nous opérons.
      </p>

      <h3 class="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-3">1.3. Principes fondamentaux</h3>
      <p class="mb-3 text-gray-700 dark:text-gray-300">
        Nous nous engageons à respecter les principes fondamentaux suivants dans le traitement de vos données personnelles :
      </p>
      <ul class="list-disc list-inside mb-6 text-gray-700 dark:text-gray-300 space-y-2">
        <li>Licéité, loyauté et transparence du traitement</li>
        <li>Limitation des finalités (collecte pour des finalités déterminées, explicites et légitimes)</li>
        <li>Minimisation des données (données adéquates, pertinentes et limitées au nécessaire)</li>
        <li>Exactitude et mise à jour des données</li>
        <li>Limitation de la conservation (durées de conservation appropriées)</li>
        <li>Intégrité et confidentialité (sécurité appropriée des données)</li>
        <li>Responsabilité et capacité de démonstration</li>
      </ul>

      <h3 class="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-3">1.4. Définitions importantes</h3>
      <p class="mb-3 text-gray-700 dark:text-gray-300">
        Pour les besoins de cette Politique, les termes suivants ont les significations qui leur sont attribuées :
      </p>

      <div class="space-y-4 text-gray-700 dark:text-gray-300">
        <p><strong>"Données personnelles"</strong> : toute information se rapportant à une personne physique identifiée ou identifiable directement ou indirectement, notamment par référence à un identifiant tel qu'un nom, un numéro d'identification, des données de localisation, un identifiant en ligne, ou à un ou plusieurs éléments spécifiques propres à l'identité physique, physiologique, génétique, psychique, économique, culturelle ou sociale de cette personne.</p>

"Traitement" : toute opération ou ensemble d'opérations effectuées ou non à l'aide de procédés automatisés et appliquées à des données personnelles, telles que la collecte, l'enregistrement, l'organisation, la structuration, la conservation, l'adaptation ou la modification, l'extraction, la consultation, l'utilisation, la communication par transmission, la diffusion ou toute autre forme de mise à disposition, le rapprochement ou l'interconnexion, la limitation, l'effacement ou la destruction.

"Responsable du traitement" : Groupe Mura, qui détermine les finalités et les moyens du traitement des données personnelles.

"Sous-traitant" : toute entité qui traite des données personnelles pour le compte du responsable du traitement, conformément à ses instructions.

"Consentement" : toute manifestation de volonté, libre, spécifique, éclairée et univoque par laquelle la personne concernée accepte, par une déclaration ou par un acte positif clair, que des données personnelles la concernant fassent l'objet d'un traitement.

"Données sensibles" : données personnelles révélant l'origine raciale ou ethnique, les opinions politiques, les convictions religieuses ou philosophiques, l'appartenance syndicale, ainsi que le traitement des données génétiques, des données biométriques aux fins d'identifier de manière unique une personne physique, des données concernant la santé ou des données concernant la vie sexuelle ou l'orientation sexuelle d'une personne physique.

"Violation de données" : violation de la sécurité entraînant, de manière accidentelle ou illicite, la destruction, la perte, l'altération, la divulgation non autorisée de données personnelles transmises, conservées ou traitées d'une autre manière, ou l'accès non autorisé à de telles données.

2. IDENTITÉ ET COORDONNÉES DU RESPONSABLE DU TRAITEMENT

2.1. Identification du responsable
Responsable du traitement : Groupe Mura
Adresse du siège social : Bamendzi 2, Bafoussam, Cameroun
Numéro d'immatriculation : RC/CMR/2024/XXXX
Téléphone : +237 658 934 147
Email général : info@murastorage.com
Site web : www.murastorage.com

2.2. Délégué à la Protection des Données (DPO)
Email DPO : dpo@murastorage.com
Email confidentialité : privacy@murastorage.com
Support technique : support@murastorage.com
Heures d'ouverture : Lundi - Vendredi, 8h00 - 18h00 (GMT+1)

2.3. Représentant dans l'Union Européenne
Conformément à l'article 27 du RGPD, nous avons désigné un représentant dans l'Union Européenne pour les cas où nous traitons des données personnelles de résidents européens. Les coordonnées de ce représentant sont disponibles sur demande via dpo@murastorage.com.

3. DONNÉES PERSONNELLES COLLECTÉES

3.1. Données d'identification personnelle
Nous collectons les données d'identification suivantes :
- Nom complet (nom de famille et prénoms)
- Nom d'utilisateur et pseudonyme (si différent du nom réel)
- Adresse électronique (e-mail) professionnelle et/ou personnelle
- Numéro de téléphone mobile et/ou fixe
- Adresse postale complète (rue, ville, code postal, pays)
- Date de naissance (si nécessaire pour la vérification d'identité ou les obligations légales)
- Numéro d'identification fiscale ou professionnelle
- Photographie d'identité (si fournie volontairement)
- Signature électronique (si utilisée pour l'authentification)
- Informations de contact d'urgence

3.2. Données professionnelles et d'entreprise
Pour les utilisateurs professionnels, nous collectons :
- Nom de l'entreprise ou de l'organisation
- Forme juridique de l'entreprise
- Numéro d'immatriculation au registre du commerce
- Fonction ou poste occupé dans l'entreprise
- Secteur d'activité et domaine d'expertise
- Taille de l'entreprise (nombre d'employés)
- Chiffre d'affaires annuel (si communiqué volontairement)
- Informations de facturation et de paiement
- Historique des transactions commerciales
- Informations sur les partenaires commerciaux
- Certifications professionnelles (si pertinentes)

3.3. Données techniques et d'utilisation
Nous collectons automatiquement les données techniques suivantes :
- Adresse IP et informations de géolocalisation
- Type et version du navigateur web utilisé
- Système d'exploitation de l'appareil
- Résolution d'écran et paramètres d'affichage
- Pages visitées et durée de session
- Actions effectuées sur la plateforme
- Données de performance et d'erreurs
- Cookies et technologies de suivi similaires
- Données de connexion et d'authentification
- Logs de serveur et journaux d'audit
- Données de navigation et parcours utilisateur
- Informations sur les appareils connectés
- Données de géolocalisation précise (si autorisée)

3.4. Données de contenu et de communication
Nous traitons également :
- Messages et communications avec notre équipe
- Commentaires et avis laissés sur la plateforme
- Documents téléchargés ou partagés
- Préférences et paramètres utilisateur
- Historique des demandes de support
- Enregistrements d'appels (avec consentement)
- Contenu des formulaires remplis
- Historique des recherches effectuées
- Données de personnalisation de l'interface

3.5. Données métier et opérationnelles
Pour le fonctionnement de notre service de gestion de stock :
- Informations sur les produits et services
- Données d'inventaire et de stock
- Historique des mouvements de stock
- Données de facturation et comptabilité
- Informations sur les clients et fournisseurs
- Données de production et de vente
- Analyses et rapports générés
- Configurations et paramètres métier
- Intégrations avec systèmes tiers
- Données de synchronisation et sauvegarde

3.6. Données de paiement et financières
Lors des transactions financières :
- Informations de carte bancaire (via prestataires sécurisés)
- Données de compte bancaire
- Historique des paiements et remboursements
- Informations fiscales et comptables
- Données de facturation et de TVA
- Informations sur les moyens de paiement alternatifs

3.7. Données collectées via des tiers
Nous pouvons recevoir des données de :
- Partenaires commerciaux et intégrateurs
- Réseaux sociaux (si vous vous connectez via ces plateformes)
- Services d'authentification tiers
- Fournisseurs de données externes
- Services d'analyse et de marketing
- Plateformes de paiement

4. MÉTHODES DE COLLECTE DES DONNÉES

4.1. Collecte directe
Nous collectons directement vos données lorsque :
- Vous créez un compte utilisateur
- Vous remplissez des formulaires sur notre site
- Vous nous contactez par email, téléphone ou chat
- Vous participez à des enquêtes ou sondages
- Vous téléchargez des documents ou ressources
- Vous vous abonnez à nos newsletters
- Vous utilisez nos services de support

4.2. Collecte automatique
Certaines données sont collectées automatiquement :
- Via les cookies et technologies similaires
- Par l'analyse des logs de serveur
- Grâce aux outils d'analyse web
- Par le suivi des interactions utilisateur
- Via les balises web et pixels de suivi
- Par l'analyse des performances techniques

4.3. Collecte via des tiers
Nous pouvons recevoir des données de :
- Partenaires commerciaux autorisés
- Services d'authentification sociaux
- Fournisseurs de données externes
- Services d'enrichissement de données
- Plateformes de marketing et publicité
- Services d'analyse et de mesure

4.4. Collecte passive
Certaines données sont collectées sans interaction directe :
- Adresse IP et informations de connexion
- Données de géolocalisation approximative
- Informations sur l'appareil et le navigateur
- Données de performance et d'erreurs
- Métriques d'utilisation anonymisées

5. FINALITÉS ET BASES LÉGALES DU TRAITEMENT

5.1. Exécution du contrat et prestation de services
Base légale : Exécution du contrat de service (Article 6.1.b du RGPD)

Finalités :
- Fourniture et maintenance de la plateforme de gestion de stock
- Création et gestion des comptes utilisateurs
- Authentification et contrôle d'accès
- Traçabilité des mouvements de stock et inventaires
- Génération de rapports et analyses personnalisées
- Support technique et maintenance préventive
- Facturation et gestion des paiements
- Sauvegarde et récupération de données
- Intégration avec systèmes tiers
- Formation et assistance utilisateur

5.2. Intérêt légitime
Base légale : Intérêt légitime (Article 6.1.f du RGPD)

Finalités :
- Amélioration continue des services et fonctionnalités
- Analyse statistique et recherche de tendances
- Prévention de la fraude et sécurisation des comptes
- Optimisation des performances techniques
- Développement de nouveaux produits et services
- Communication marketing ciblée (avec possibilité d'opposition)
- Analyse de l'utilisation et des préférences
- Recherche et développement
- Assurance qualité et tests
- Optimisation de l'expérience utilisateur

5.3. Consentement
Base légale : Consentement libre et éclairé (Article 6.1.a du RGPD)

Finalités :
- Envoi de newsletters et communications marketing
- Utilisation de cookies non essentiels
- Partage de données avec des partenaires commerciaux
- Utilisation de données pour des études de marché
- Géolocalisation précise (si activée)
- Profilage marketing et publicité ciblée
- Enregistrement d'appels et communications
- Utilisation de données biométriques (si applicable)
- Transferts internationaux vers des pays tiers
- Utilisation de données pour des fins de recherche

5.4. Obligations légales
Base légale : Respect d'obligations légales (Article 6.1.c du RGPD)

Finalités :
- Conservation de données pour des obligations comptables
- Respect des réglementations fiscales
- Coopération avec les autorités compétentes
- Respect des réglementations sectorielles
- Conservation pour des procédures judiciaires
- Respect des obligations de reporting
- Conservation pour des audits légaux
- Respect des réglementations anti-blanchiment
- Conservation pour des obligations de sécurité
- Respect des réglementations douanières

5.5. Protection des intérêts vitaux
Base légale : Protection des intérêts vitaux (Article 6.1.d du RGPD)

Finalités :
- Protection de la sécurité des utilisateurs
- Prévention de situations d'urgence
- Protection contre les menaces de sécurité
- Sauvegarde en cas de catastrophe
- Protection des données critiques
- Prévention des dommages importants
- Protection de la santé publique
- Sécurité nationale (si applicable)

6. PARTAGE ET COMMUNICATION DES DONNÉES

6.1. Principe général
Nous nous engageons à ne jamais vendre, louer ou échanger vos données personnelles à des tiers à des fins commerciales. Le partage de vos données ne s'effectue que dans les cas strictement nécessaires et dans le respect de la réglementation applicable.

6.2. Sous-traitants et prestataires de services
Nous pouvons partager vos données avec des sous-traitants qui nous aident à fournir nos services :

Hébergeurs de données :
- Stockage sécurisé des données sur des serveurs certifiés
- Services de cloud computing et d'infrastructure
- Services de sauvegarde et de réplication
- Services de CDN et d'optimisation de performance

Services de paiement :
- Traitement sécurisé des transactions financières
- Services de facturation et de comptabilité
- Services de vérification d'identité financière
- Services de prévention de la fraude

Services d'email et communication :
- Envoi de communications et notifications
- Services de messagerie et de chat
- Services de notification push
- Services de communication marketing

Services d'analyse et de mesure :
- Analyse anonymisée de l'utilisation de la plateforme
- Services de mesure d'audience
- Services d'analyse de performance
- Services de test A/B et d'optimisation

Services de support :
- Assistance technique et relation client
- Services de formation et d'onboarding
- Services de maintenance et de support
- Services de migration et d'intégration

Tous nos sous-traitants sont contractuellement tenus de respecter les mêmes standards de protection des données que nous-mêmes, conformément aux exigences du RGPD.

6.3. Partenaires commerciaux
Nous pouvons partager des données avec nos partenaires commerciaux dans les cas suivants :
- Intégration avec des systèmes ERP et de comptabilité
- Intégration avec des plateformes e-commerce
- Intégration avec des services de logistique
- Intégration avec des services de marketing
- Intégration avec des services de communication
- Partenariats stratégiques et alliances commerciales

6.4. Autorités compétentes
Nous pouvons être amenés à communiquer vos données aux autorités compétentes dans les cas suivants :
- Demande légale d'une autorité judiciaire ou administrative
- Investigation en cas de suspicion d'activités illégales
- Respect d'obligations réglementaires sectorielles
- Protection de nos droits légitimes et de ceux de nos utilisateurs
- Coopération avec les forces de l'ordre
- Respect des obligations de reporting réglementaire
- Procédures judiciaires et arbitrales
- Enquêtes administratives et fiscales

6.5. Transferts internationaux
Dans le cas où vos données seraient transférées vers des pays situés en dehors de l'Union Européenne ou du Cameroun, nous nous assurons que :
- Le pays de destination bénéficie d'une décision d'adéquation de la Commission Européenne
- Des garanties appropriées sont mises en place (clauses contractuelles types, certifications)
- Votre consentement explicite est obtenu pour le transfert
- Des mesures de sécurité supplémentaires sont appliquées
- Les transferts sont effectués dans le respect des principes de minimisation et de finalité

6.6. Réorganisation d'entreprise
En cas de fusion, acquisition, cession d'actifs ou autre réorganisation d'entreprise, vos données personnelles peuvent être transférées dans le cadre de cette transaction, sous réserve que le nouveau responsable du traitement s'engage à respecter cette Politique de Confidentialité.

7. SÉCURITÉ ET PROTECTION DES DONNÉES

7.1. Mesures techniques de sécurité
Nous mettons en œuvre des mesures techniques de sécurité avancées :

Chiffrement :
- Chiffrement AES-256 pour les données au repos
- TLS 1.3 pour les données en transit
- Chiffrement des sauvegardes et des archives
- Chiffrement des communications internes
- Chiffrement des bases de données sensibles

Authentification et contrôle d'accès :
- Authentification multi-facteurs (MFA) obligatoire pour les comptes administrateurs
- Authentification forte avec certificats numériques
- Principe du moindre privilège pour les accès
- Gestion centralisée des identités et des accès
- Rotation régulière des mots de passe et des clés

Surveillance et détection :
- Monitoring continu des systèmes et détection d'intrusions
- Surveillance des accès et des activités suspectes
- Détection automatique des anomalies
- Alertes en temps réel pour les incidents de sécurité
- Analyse comportementale des utilisateurs

Sauvegarde et récupération :
- Sauvegardes chiffrées et réplication géographique
- Tests réguliers de récupération de données
- Plans de continuité d'activité
- Sauvegardes incrémentielles et différentielles
- Stockage sécurisé des sauvegardes

Tests et audits :
- Audits de sécurité réguliers et tests de pénétration
- Évaluations de vulnérabilités
- Tests de résistance aux attaques
- Audits de conformité
- Formation continue en sécurité

7.2. Mesures organisationnelles
Nous appliquons également des mesures organisationnelles strictes :

Formation du personnel :
- Sensibilisation régulière à la protection des données
- Formation aux bonnes pratiques de sécurité
- Formation aux procédures de gestion des incidents
- Formation à la conformité RGPD
- Formation aux risques de sécurité

Politiques internes :
- Procédures strictes de gestion des données
- Politiques de sécurité informatique
- Procédures de gestion des accès
- Politiques de développement sécurisé
- Procédures de gestion des incidents

Contrôles d'accès :
- Limitation des accès aux données selon les fonctions
- Révision régulière des droits d'accès
- Séparation des environnements de production et de test
- Contrôle des accès privilégiés
- Gestion des comptes de service

Audit interne :
- Vérifications périodiques du respect des procédures
- Contrôles de conformité internes
- Évaluations des risques de sécurité
- Révisions des politiques et procédures
- Rapports réguliers à la direction

Gestion des incidents :
- Plan de réponse aux violations de données
- Procédures d'escalade des incidents
- Communication avec les autorités compétentes
- Notification des personnes concernées
- Analyse post-incident et amélioration continue

7.3. Notification des violations
En cas de violation de données personnelles susceptible d'engendrer un risque élevé pour vos droits et libertés, nous nous engageons à :
- Notifier l'autorité de contrôle compétente dans les 72 heures
- Vous informer directement dans les meilleurs délais
- Prendre toutes les mesures nécessaires pour limiter les conséquences
- Coopérer pleinement avec les autorités compétentes
- Documenter la violation et les mesures prises
- Mettre en place des mesures correctives
- Informer les partenaires et sous-traitants concernés

7.4. Responsabilité des utilisateurs
Vous êtes également responsable de la sécurité de vos données :
- Utilisation de mots de passe robustes et uniques
- Activation de l'authentification multi-facteurs quand disponible
- Mise à jour régulière de vos logiciels et systèmes
- Protection de vos appareils contre les malwares
- Signalement immédiat de toute activité suspecte
- Respect des bonnes pratiques de sécurité informatique

8. DURÉE DE CONSERVATION DES DONNÉES

8.1. Données de compte utilisateur
- Compte actif : Conservation pendant toute la durée de l'abonnement + 3 ans après la fin du contrat
- Compte inactif : Suppression après 2 ans d'inactivité complète
- Données de facturation : Conservation pendant 10 ans (obligation légale)
- Données de support : Conservation pendant 3 ans après la dernière interaction
- Données de marketing : Conservation jusqu'au retrait du consentement

8.2. Données d'utilisation et techniques
- Logs de connexion : Conservation pendant 1 an
- Données analytiques : Conservation pendant 2 ans (anonymisées après 6 mois)
- Cookies : Durée variable selon le type (voir politique des cookies)
- Données de performance : Conservation pendant 6 mois
- Données de sécurité : Conservation pendant 2 ans

8.3. Données de communication
- Messages de support : Conservation pendant 3 ans
- Communications marketing : Conservation jusqu'au retrait du consentement
- Enregistrements d'appels : Conservation pendant 6 mois
- Emails commerciaux : Conservation pendant 2 ans
- Données de chat : Conservation pendant 1 an

8.4. Données métier
- Données de stock et inventaire : Conservation pendant 7 ans après la fin du contrat
- Données de facturation : Conservation pendant 10 ans (obligation légale)
- Données de comptabilité : Conservation pendant 10 ans
- Rapports et analyses : Conservation pendant 5 ans
- Données d'intégration : Conservation pendant 3 ans après la fin de l'intégration

8.5. Critères de prolongation
Les délais de conservation peuvent être prolongés en cas de :
- Obligation légale spécifique
- Procédure judiciaire en cours
- Demande légitime de conservation pour des raisons légitimes
- Investigation en cours
- Obligations contractuelles spécifiques
- Intérêt légitime de l'entreprise

9. VOS DROITS ET EXERCICE

9.1. Droit d'accès (Article 15 RGPD)
Vous avez le droit d'obtenir la confirmation que vos données personnelles sont traitées et d'accéder à ces données, ainsi qu'aux informations suivantes :
- Les finalités du traitement
- Les catégories de données concernées
- Les destinataires des données
- La durée de conservation
- L'existence de vos droits
- Les informations sur les transferts internationaux
- Les informations sur la logique du traitement automatisé
- Les informations sur les sources des données

9.2. Droit de rectification (Article 16 RGPD)
Vous pouvez demander la rectification des données inexactes ou incomplètes. Nous procéderons à la rectification dans les meilleurs délais et vous informerons des mesures prises.

9.3. Droit à l'effacement (Article 17 RGPD)
Vous pouvez demander la suppression de vos données dans les cas suivants :
- Les données ne sont plus nécessaires aux finalités
- Vous retirez votre consentement
- Les données ont été traitées illicitement
- L'effacement est nécessaire pour respecter une obligation légale
- Les données ont été collectées dans le cadre de services de la société de l'information

9.4. Droit à la limitation (Article 18 RGPD)
Vous pouvez demander la limitation du traitement lorsque :
- Vous contestez l'exactitude des données
- Vous vous opposez à l'effacement
- Le traitement est illicite
- Nous n'avons plus besoin des données mais vous en avez besoin pour des réclamations

9.5. Droit à la portabilité (Article 20 RGPD)
Vous avez le droit de recevoir vos données dans un format structuré et lisible par machine, et de les transmettre à un autre responsable du traitement, lorsque le traitement est basé sur le consentement ou l'exécution d'un contrat.

9.6. Droit d'opposition (Article 21 RGPD)
Vous pouvez vous opposer au traitement de vos données pour des raisons tenant à votre situation particulière, notamment pour le marketing direct.

9.7. Droit de retrait du consentement
Vous pouvez retirer votre consentement à tout moment pour les traitements basés sur le consentement, sans affecter la licéité du traitement effectué avant le retrait.

9.8. Droit de ne pas faire l'objet d'une décision automatisée
Vous avez le droit de ne pas faire l'objet d'une décision fondée exclusivement sur un traitement automatisé, y compris le profilage, qui produit des effets juridiques vous concernant.

9.9. Comment exercer vos droits
Pour exercer vos droits, contactez-nous à : dpo@murastorage.com
Nous répondrons à votre demande dans un délai maximum de 30 jours, prolongeable de 2 mois en cas de complexité. Une pièce d'identité pourra être demandée pour vérifier votre identité.

10. COOKIES ET TECHNOLOGIES DE SUIVI

10.1. Qu'est-ce qu'un cookie ?
Un cookie est un petit fichier texte stocké sur votre appareil lorsque vous visitez notre site. Les cookies nous permettent de reconnaître votre appareil et de mémoriser vos préférences et informations.

10.2. Types de cookies utilisés

Cookies strictement nécessaires :
- Cookies de session et d'authentification
- Cookies de sécurité et de prévention de la fraude
- Cookies de préférences de langue
- Cookies de panier d'achat
- Cookies de consentement

Cookies de performance :
- Cookies d'analyse d'audience (Google Analytics)
- Cookies de mesure de performance
- Cookies de test A/B
- Cookies de monitoring des erreurs
- Cookies de statistiques d'utilisation

Cookies de fonctionnalité :
- Cookies de préférences utilisateur
- Cookies de personnalisation
- Cookies de géolocalisation
- Cookies de mémorisation des choix
- Cookies d'accessibilité

Cookies marketing :
- Cookies de ciblage publicitaire
- Cookies de réseaux sociaux
- Cookies de remarketing
- Cookies de conversion
- Cookies de partenaires publicitaires

10.3. Gestion des cookies
Vous pouvez gérer vos préférences de cookies via :
- Le bandeau de consentement sur notre site
- Les paramètres de votre navigateur
- Les outils de désactivation des cookies tiers
- Les paramètres de votre compte utilisateur

10.4. Cookies tiers
Notre site peut contenir des cookies de tiers. Nous ne contrôlons pas ces cookies et vous encourageons à consulter les politiques de confidentialité des tiers concernés.

11. MODIFICATIONS DE LA POLITIQUE

11.1. Droit de modification
Nous nous réservons le droit de modifier cette Politique de Confidentialité à tout moment pour refléter les changements dans nos pratiques, nos services, ou la réglementation applicable.

11.2. Notification des modifications
En cas de modification substantielle, nous vous informerons par :
- Notification par email à l'adresse associée à votre compte
- Bannière de notification sur notre site web
- Mise à jour de la date de "Dernière mise à jour" en haut de cette page
- Notification dans l'application mobile
- Communication via nos canaux de support

11.3. Acceptation des modifications
La poursuite de l'utilisation de nos services après la publication des modifications constitue votre acceptation de la nouvelle Politique. Si vous n'acceptez pas les modifications, vous devez cesser d'utiliser nos services.

12. LIENS ET SERVICES TIERS

12.1. Sites web tiers
Notre site peut contenir des liens vers des sites web tiers. Nous ne sommes pas responsables des pratiques de confidentialité de ces sites et vous encourageons à consulter leurs politiques de confidentialité.

12.2. Services tiers intégrés
Nous utilisons des services tiers pour certaines fonctionnalités :
- Services de paiement (Stripe, PayPal, etc.)
- Services d'analyse (Google Analytics, etc.)
- Services de marketing (Facebook, Google Ads, etc.)
- Services de communication (SendGrid, Twilio, etc.)
- Services de stockage cloud (AWS, Google Cloud, etc.)

12.3. Responsabilité limitée
Nous ne sommes pas responsables des pratiques de confidentialité des services tiers et vous encourageons à consulter leurs politiques de confidentialité avant utilisation.

13. SÉCURITÉ DES INCIDENTS

13.1. Plan de réponse aux incidents
En cas de violation de données susceptible d'engendrer un risque élevé pour vos droits et libertés, nous suivons un plan de réponse structuré :

Phase de détection :
- Identification de l'incident
- Évaluation de la gravité
- Activation de l'équipe de réponse
- Documentation initiale

Phase de réponse :
- Contenir l'incident
- Évaluer l'impact
- Notifier les autorités compétentes
- Informer les personnes concernées
- Mettre en place des mesures correctives

Phase de récupération :
- Restaurer les services
- Renforcer la sécurité
- Analyser les causes
- Améliorer les procédures
- Former le personnel

13.2. Notification aux autorités
Nous notifions l'autorité de contrôle compétente dans les 72 heures suivant la découverte de la violation, sauf si la violation ne présente pas de risque pour les droits et libertés des personnes.

13.3. Notification aux personnes concernées
Nous informons les personnes concernées sans délai injustifié lorsque la violation présente un risque élevé pour leurs droits et libertés.

14. MINEURS ET PROTECTION DES DONNÉES

14.1. Âge minimum
Notre service ne s'adresse pas sciemment aux enfants de moins de 16 ans. Si des données d'enfants sont traitées par erreur, contactez-nous pour supprimer ces données sans délai.

14.2. Consentement parental
Pour les mineurs de 16 à 18 ans, nous pouvons exiger le consentement parental selon la réglementation applicable.

14.3. Protection renforcée
Les données des mineurs bénéficient d'une protection renforcée et sont traitées avec une attention particulière.

15. TRANSFERTS INTERNATIONAUX

15.1. Pays de destination
Vos données peuvent être transférées vers des pays situés en dehors de l'Union Européenne, notamment :
- États-Unis (avec garanties appropriées)
- Canada (décision d'adéquation)
- Royaume-Uni (garanties post-Brexit)
- Autres pays selon les besoins opérationnels

15.2. Garanties de protection
Pour les transferts vers des pays tiers, nous mettons en place :
- Clauses contractuelles types approuvées par la Commission Européenne
- Certifications de conformité (Privacy Shield, etc.)
- Codes de conduite approuvés
- Certifications et labels de protection des données
- Mesures techniques et organisationnelles supplémentaires

15.3. Consentement pour les transferts
Pour certains transferts, nous obtenons votre consentement explicite après vous avoir informé des risques potentiels.

16. PROFILAGE ET DÉCISIONS AUTOMATISÉES

16.1. Profilage
Nous pouvons utiliser vos données pour créer des profils utilisateur afin de :
- Personnaliser votre expérience
- Recommander des produits ou services
- Analyser vos préférences
- Améliorer nos services
- Prévenir la fraude

16.2. Décisions automatisées
Certaines décisions peuvent être prises de manière automatisée, notamment :
- Détection de fraude
- Évaluation de crédit
- Recommandations personnalisées
- Segmentation marketing
- Optimisation des prix

16.3. Vos droits
Vous avez le droit de ne pas faire l'objet d'une décision fondée exclusivement sur un traitement automatisé et de demander une intervention humaine.

17. DONNÉES SENSIBLES

17.1. Collecte limitée
Nous ne collectons généralement pas de données sensibles. Si nous devons le faire, nous obtenons votre consentement explicite et mettons en place des mesures de protection renforcées.

17.2. Protection renforcée
Les données sensibles bénéficient d'une protection renforcée conformément aux exigences du RGPD.

18. DONNÉES ANONYMISÉES ET AGRÉGÉES

18.1. Anonymisation
Nous pouvons anonymiser vos données pour :
- Analyses statistiques
- Recherche et développement
- Amélioration des services
- Reporting interne
- Études de marché

18.2. Données agrégées
Les données agrégées ne permettent pas de vous identifier et peuvent être utilisées librement.

19. RESPONSABILITÉ DES UTILISATEURS

19.1. Exactitude des données
Vous êtes responsable de l'exactitude et de la mise à jour de vos données personnelles.

19.2. Sécurité des accès
Vous devez maintenir la confidentialité de vos identifiants de connexion et signaler toute utilisation non autorisée.

19.3. Respect des conditions
Vous devez respecter nos conditions d'utilisation et ne pas utiliser nos services à des fins illégales.

20. PROCÉDURES DE RÉCLAMATION

20.1. Réclamations internes
Vous pouvez déposer une réclamation auprès de notre DPO à : dpo@murastorage.com

20.2. Autorités de contrôle
Vous avez le droit d'introduire une réclamation auprès de l'autorité de contrôle compétente :
- Commission Nationale de Protection des Données Personnelles (Cameroun)
- CNIL (France) pour les résidents français
- Autres autorités selon votre résidence

20.3. Procédures de médiation
Nous nous engageons à participer aux procédures de médiation pour résoudre les différends.

21. LANGUE ET INTERPRÉTATION

21.1. Langue de référence
Cette Politique est rédigée en français. En cas de traduction, la version française prévaut.

21.2. Interprétation
En cas de divergence entre les différentes versions linguistiques, la version française fait foi.

22. DROIT APPLICABLE ET JURIDICTION

22.1. Droit applicable
Cette Politique est régie par le droit camerounais et le Règlement Général sur la Protection des Données (RGPD) de l'Union Européenne.

22.2. Juridiction compétente
En cas de litige, les juridictions camerounaises sont compétentes, sous réserve des règles d'ordre public.

23. CONTACT ET COORDONNÉES

23.1. Contact général
Groupe Mura – Mura Storage
Bamendzi 2, Bafoussam, Cameroun
Email : info@murastorage.com
Téléphone : +237 658 934 147
Site web : www.murastorage.com

23.2. Contact DPO
Email DPO : dpo@murastorage.com
Email confidentialité : privacy@murastorage.com
Support technique : support@murastorage.com

23.3. Heures d'ouverture
Lundi - Vendredi : 8h00 - 18h00 (GMT+1)
Samedi : 9h00 - 13h00 (GMT+1)
Dimanche : Fermé

24. DISPOSITIONS FINALES

24.1. Intégralité de l'accord
Cette Politique de Confidentialité, complétée des conditions générales d'utilisation et des politiques spécifiques, constitue l'accord complet entre nous concernant le traitement de vos données personnelles.

24.2. Divisibilité
Si une disposition de cette Politique était déclarée nulle ou inapplicable, les autres dispositions resteraient en vigueur.

24.3. Non-renonciation
L'absence d'exercice d'un droit ne vaut pas renonciation à ce droit.

24.4. Évolution
Cette Politique peut évoluer pour tenir compte des changements législatifs, technologiques ou organisationnels.

25. ENGAGEMENT ET CONCLUSION

25.1. Notre engagement
Nous nous engageons à traiter vos données personnelles avec le plus grand respect et dans le strict respect de la réglementation applicable. Votre confiance est notre priorité absolue.

25.2. Transparence
Nous nous efforçons d'être transparents sur nos pratiques de traitement des données et de vous donner le contrôle sur vos informations personnelles.

25.3. Amélioration continue
Nous nous engageons à améliorer continuellement nos pratiques de protection des données et à vous tenir informés des évolutions.

25.4. Merci
Merci de votre confiance et de votre utilisation de Mura Storage. Nous nous engageons à protéger vos données et à vous fournir un service de qualité.

        <p class="mb-4 text-gray-700 dark:text-gray-300">
          Pour toute question concernant cette Politique de Confidentialité, n'hésitez pas à nous contacter à dpo@murastorage.com.
        </p>

        <p class="text-center font-semibold text-gray-800 dark:text-white mt-8">
          Groupe Mura - Mura Storage<br>
          Bamendzi 2, Bafoussam, Cameroun<br>
          +237 658 934 147 | info@murastorage.com | www.murastorage.com
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Styles globaux pour tout le contenu de la politique de confidentialité */
.prose h2 {
  @apply text-2xl font-semibold text-gray-800 dark:text-white mb-4 mt-8;
}

.prose h3 {
  @apply text-xl font-semibold text-gray-700 dark:text-gray-300 mb-3 mt-6;
}

.prose h4 {
  @apply text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2 mt-4;
}

.prose p {
  @apply mb-4 text-gray-700 dark:text-gray-300 leading-relaxed;
}

.prose ul {
  @apply list-disc list-inside mb-4 text-gray-700 dark:text-gray-300 space-y-2;
}

.prose ol {
  @apply list-decimal list-inside mb-4 text-gray-700 dark:text-gray-300 space-y-2;
}

.prose li {
  @apply text-gray-700 dark:text-gray-300;
}

.prose strong {
  @apply font-semibold text-gray-800 dark:text-white;
}

/* Styles pour les sections numérotées */
.prose > * {
  @apply text-justify;
}
</style>