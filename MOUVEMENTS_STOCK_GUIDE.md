# 📊 Guide des Mouvements de Stock - Page Comptable

## 🎯 Vue d'ensemble

La page **Mouvements de Stock** (`mouvements-stock.vue`) est une interface comptable complète qui permet de visualiser, filtrer et exporter l'historique complet des mouvements de stock de l'entrepôt.

## 🚀 Fonctionnalités Principales

### 📋 **Visualisation des Mouvements**
- **Historique complet** de tous les mouvements de stock
- **Informations détaillées** : date, type, produit, quantités, utilisateur, motif
- **Traçabilité complète** avec références de documents (factures, etc.)
- **Interface responsive** adaptée aux écrans comptables

### 🔍 **Filtres Avancés**
- **Période** : Filtrage par date de début et fin
- **Type de mouvement** : Entrée, Sortie, Ajustement, Transfert, Perte, Retour
- **Produit** : Recherche par nom de produit
- **Utilisateur** : Filtrage par utilisateur responsable
- **Référence document** : Recherche par numéro de facture ou document

### 📊 **Statistiques en Temps Réel**
- **Total des mouvements** dans la période sélectionnée
- **Nombre d'entrées** de stock
- **Nombre de sorties** de stock
- **Nombre de transferts** entre entrepôts

### 📤 **Export Comptable**
- **Export Excel (.xlsx)** : Format professionnel avec mise en forme
- **Export CSV (.csv)** : Format compatible avec tous les logiciels comptables
- **Données complètes** : Toutes les informations nécessaires pour la comptabilité

## 🏗️ Structure Technique

### **Modèle de Données**
```typescript
interface MouvementStock {
  id: number;
  produit: number;
  produit_nom: string;
  entrepot: number;
  entrepot_nom: string;
  type_mouvement: string;
  quantite: number;
  quantite_avant: number;
  quantite_apres: number;
  reference_document: string;
  motif: string;
  utilisateur: number;
  utilisateur_nom: string;
  created_at: string;
}
```

### **Types de Mouvements**
- **`entree`** : Ajout de stock (achat, retour, ajustement positif)
- **`sortie`** : Retrait de stock (vente, perte, ajustement négatif)
- **`ajustement`** : Correction d'inventaire
- **`transfert`** : Déplacement entre entrepôts
- **`perte`** : Stock endommagé ou perdu
- **`retour`** : Retour de produits

## 📋 Colonnes d'Export Excel

### **En-têtes Comptables**
1. **Date/Heure** : Horodatage précis du mouvement
2. **Type Mouvement** : Classification du mouvement
3. **Produit** : Nom du produit concerné
4. **Entrepôt** : Lieu du mouvement
5. **Quantité** : Quantité du mouvement (+ pour entrée, - pour sortie)
6. **Stock Avant** : Quantité avant le mouvement
7. **Stock Après** : Quantité après le mouvement
8. **Référence Document** : Numéro de facture ou document source
9. **Motif** : Description détaillée du mouvement
10. **Utilisateur** : Responsable du mouvement
11. **ID Mouvement** : Identifiant unique pour traçabilité

## 🎨 Interface Utilisateur

### **En-tête de Page**
- **Titre** : "Mouvements de Stock"
- **Description** : "Historique complet des mouvements de stock pour la comptabilité"
- **Boutons d'action** : Filtres et Export

### **Panneau de Filtres**
- **Interface pliable** : Masquable pour économiser l'espace
- **Filtres multiples** : Combinaison possible de tous les critères
- **Boutons d'action** : Appliquer et Effacer les filtres

### **Tableau des Mouvements**
- **Tri automatique** : Par date décroissante (plus récent en premier)
- **Couleurs indicatives** : 
  - 🟢 Vert pour les entrées
  - 🔴 Rouge pour les sorties
  - 🔵 Bleu pour les ajustements
  - 🟣 Violet pour les transferts
- **Pagination** : 20 mouvements par page
- **Responsive** : Adaptation mobile et desktop

### **Statistiques Visuelles**
- **Cartes colorées** : Indicateurs visuels des types de mouvements
- **Compteurs en temps réel** : Mise à jour automatique avec les filtres

## 🔧 Utilisation Comptable

### **1. Consultation des Mouvements**
```
1. Accéder à la page "Mouvements de Stock"
2. Utiliser les filtres pour cibler la période souhaitée
3. Consulter le tableau détaillé des mouvements
4. Vérifier les statistiques en temps réel
```

### **2. Export pour Comptabilité**
```
1. Appliquer les filtres nécessaires (période, type, etc.)
2. Cliquer sur "Exporter"
3. Choisir le format :
   - Excel (.xlsx) : Pour analyses approfondies
   - CSV (.csv) : Pour import dans logiciels comptables
4. Télécharger le fichier généré
```

### **3. Traçabilité des Factures**
```
1. Utiliser le filtre "Référence Document"
2. Saisir le numéro de facture (ex: FA22-251014-0011)
3. Visualiser tous les mouvements liés à cette facture
4. Exporter pour archivage comptable
```

## 📊 Exemples d'Utilisation

### **Audit Mensuel**
```
Filtres appliqués :
- Date Début : 01/10/2024
- Date Fin : 31/10/2024
- Type : Tous

Résultat : Export Excel complet du mois d'octobre
```

### **Suivi des Ventes**
```
Filtres appliqués :
- Type Mouvement : Sortie
- Référence Document : FA22-251014-0011

Résultat : Mouvements de sortie pour la facture spécifique
```

### **Contrôle des Ajustements**
```
Filtres appliqués :
- Type Mouvement : Ajustement
- Période : Dernière semaine

Résultat : Tous les ajustements d'inventaire récents
```

## 🔒 Sécurité et Permissions

### **Accès Restreint**
- **Authentification requise** : Token JWT obligatoire
- **Filtrage par entreprise** : Seuls les mouvements de l'entreprise connectée
- **Filtrage par entrepôt** : Seuls les mouvements de l'entrepôt actuel

### **Traçabilité Complète**
- **Utilisateur responsable** : Chaque mouvement est lié à un utilisateur
- **Horodatage précis** : Date et heure exactes de chaque mouvement
- **Référence document** : Lien avec les factures et documents sources

## 🚀 Avantages Comptables

### **1. Conformité Réglementaire**
- **Traçabilité complète** des mouvements de stock
- **Audit trail** pour les contrôles comptables
- **Archivage numérique** des mouvements

### **2. Efficacité Opérationnelle**
- **Export automatisé** : Plus besoin de saisie manuelle
- **Filtres précis** : Accès rapide aux données pertinentes
- **Format standardisé** : Compatible avec tous les logiciels comptables

### **3. Contrôle de Gestion**
- **Statistiques en temps réel** : Vue d'ensemble des mouvements
- **Analyse des tendances** : Identification des patterns de stock
- **Optimisation des processus** : Amélioration continue

## 📈 Évolutions Futures

### **Fonctionnalités Prévues**
- **Graphiques de tendances** : Visualisation des mouvements dans le temps
- **Alertes automatiques** : Notifications pour mouvements anormaux
- **Rapports automatisés** : Génération périodique de rapports comptables
- **Intégration ERP** : Synchronisation avec les systèmes comptables externes

---

## 🎯 Conclusion

La page **Mouvements de Stock** est un outil comptable complet qui répond aux besoins de traçabilité, d'audit et d'export des mouvements de stock. Elle offre une interface intuitive et des fonctionnalités d'export professionnelles, facilitant le travail comptable et la conformité réglementaire.

