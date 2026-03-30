# Projet Vue.js : SmartCV
# Marc MAALOUF & Noé LABBÉ

## 1. Objectif du projet

L'objectif de ce projet est de développer un site permettant de générer des CV

L'application aide l'utilisateur à :
- saisir ses informations de profil,
- choisir un template de CV,
- enregistrer son CV et son historique,
- exporter le CV en PDF,
- obtenir un score ATS pour améliorer son contenu.

## 2. Fonctionnalités principales

- Authentification utilisateur avec Firebase Auth (inscription, connexion, réinitialisation du mot de passe).
- Gestion des données CV avec Firestore (création, mise à jour, sauvegarde).
- Deux templates de CV disponibles :
  - CV ATS,
  - CV Colorful.
- Formulaires complets pour les sections du CV (identité, résumé, expériences, formations, compétences, langues, certifications, etc.).
- Validation des dates et des champs pour éviter les incohérences de saisie.
- Export du CV en PDF avec html2pdf.js.
- Historique des CV avec affichage adapté selon l'état connecté/non connecté.
- Page 404 pour les routes inconnues.
- Analyse ATS via API Node/Express avec :
  - score global,
  - points forts,
  - points à améliorer.

  ## 3. Travail en binôme : qui a fait quoi

  Projet réalisé en binôme :
- Noé LABBÉ
- Marc MAALOUF

### Contributions principales de Marc Maalouf
- Mise en place de la structure initiale de l'application (routes, navigation, page d'accueil).
- Création du composant réutilisable AuthContainer.
- Implémentation des pages d'authentification (login, sign up, forgot password visuel).
- Ajout de la fonctionnalité Firebase (première intégration).
- Ajout des stores Pinia (auth + CV) et intégration avec Firebase.
- Ajout des livrables de maquettes (Figma en .fig et version PDF).

### Contributions principales de Noé Labbé
- Création de la page "Générer" et des deux templates de CV.
- Ajout du composant d'éditeur de CV (formulaire informations personnelles).
- Intégration Firebase Auth + Firestore avec sauvegarde/mise à jour et synchronisation historique.
- Création du service Firestore et de la page 404.
- Mise en place des validations de dates et correction des messages d'erreur.
- Intégration de l'export PDF (html2pdf.js).
- Ajout de l'API d'analyse ATS (Node/Express) et connexion aux vues CVEditor/CVColorful.

## 4. Organisation du binôme

Nous nous sommes organisés par fonctionnalités, avec des commits réguliers.

Mode de fonctionnement :
- répartition des tâches par modules (authentification, éditeur CV, ATS),
- 2 réunions Teams ont été faites pour faire le point de l'avancement du projet et sur les tâches restantes et définir qui allait faire quoi,
- corrections rapides suite aux problèmes identifiés (validations, messages d'erreur, synchro historique).


## 5. Difficultés rencontrées et solutions apportées

### 1) Synchronisation des données utilisateur (auth + historique)
Problème : maintenir un comportement propre pour les états connecté/non connecté et l'affichage de l'historique.

Solution : centralisation de l'état avec Pinia + intégration Firestore pour fiabiliser la lecture/écriture des CV

### 2) Validation des dates dans les formulaires CV
Problème : incohérences possibles entre dates de début et de fin

Solution : ajout de validations dans les vues et amélioration des messages d'erreur pour guider la correction.

### 3) Export PDF du CV
Problème : garantir une génération de PDF depuis les templates.

Solution : intégration de html2pdf.js pour pouvoir exporter un document en pdf

### 4) Analyse ATS et intégration front/back
Problème : relier les données du formulaire CV à une API d'analyse et restituer un résultat compréhensible.

Solution : création d'une API Node/Express dédiée, envoi depuis le front et affichage du score + recommandations dans les vues de génération.

## 6. Installation et lancement de l'application

### Prérequis

- Node.js
- npm

### Étapes d'installation

1. Cloner le dépôt.
2. Se placer à la racine du projet.
3. Installer les dépendances :

```bash
npm install
```

### Lancer le front (Vue + Vite)

```bash
npm run dev
```

Le front est alors disponible sur l'URL indiquée par Vite (en général http://localhost:5173).

### Lancer l'API ATS (Node/Express)

Dans un second terminal, depuis la racine du projet :

```bash
node server.js
```

L'API ATS sur :

```bash
node server.js
Serveur lancé sur http://localhost:3000
```

Pour tester l'analyse ATS en local, le front et l'API doivent être lancés en même temps dans deux terminaux séparés



## 7. Rendus supplémentaires (bonus)

- Déploiement Vercel du projet :
  - https://projet-vuejs-noelabbe-marcmaalouf.vercel.app/
- Maquettes réalisées sur Figma (fichiers .fig et export PDF ajoutés au projet).
- API ATS développée en Node/Express et intégrée au front.
