# 📅 VilleNova — Plateforme d'Événements Culturels

Projet d'intégration et de développement d'une plateforme web dynamique connectée à l'API OpenAgenda pour la ville de VilleNova.

## 🚀 Démo en ligne
Le projet est déployé et accessible en direct ici : **https://villenova.vercel.app/** ou **https://noeadouane.github.io/villenova/**

---

## ✨ Fonctionnalités implémentées
* **Affichage dynamique :** Récupération en temps réel des 9 prochains événements via l'API OpenAgenda.
* **Mode Hors-ligne (Fallback) :** Système de secours avec injection de données locales (Mock) en cas de panne réseau ou de clé API invalide.
* **Normalisation des données :** Formatage dynamique des dates complexes de l'API (gestion des plages horaires, d'affichage multilingue `fr/en`).
* **Catégorisation intelligente :** Analyse sémantique des descriptions textuelles pour trier automatiquement les événements (CONCERT, EXPOSITION, FESTIVAL, SPECTACLE).
* **Interface Responsive :** Design fluide adapté aux mobiles, tablettes et ordinateurs.

---

## 🛠️ Technologies utilisées
* **Front-end :** HTML5, CSS3 (variables, Flexbox, Grid)
* **JavaScript :** ES6+ (Fetch API, Programmation asynchrone `async/await`, Programmation orientée objet)
* **Hébergement & Déploiement :** Vercel

---

## 🔑 Configuration & Sécurité (Note pour le Jury)
L'application est construite sur une **architecture 100% statique (Client-Side)**. 

Pour des raisons de robustesse lors de la phase d'évaluation et de démonstration, la clé API OpenAgenda et l'UID de l'agenda (`464817`) ont été directement configurés dans le fichier `js/api.js`. 

> 💡 **Bonne pratique de production :** Sur un environnement de production réel, l'accès à l'API OpenAgenda s'effectuerait via un proxy côté serveur (comme une *Serverless Function* Vercel) afin de masquer totalement la clé d'API aux yeux des clients dans l'onglet Réseau du navigateur.

---

## 📂 Structure du projet
## 📂 Structure du projet (Architecture Modulaire)

Le projet respecte scrupuleusement l'architecture technique imposée, séparant la logique applicative, les styles précompilés et les vues :

```text
VilleNova/
├── css/                        # Généré automatiquement par le compilateur SASS
│   └── style.css               # Fichier CSS final minifié
├── js/                         # Logique JavaScript applicative
│   ├── api.js                  # Gestion des appels API OpenAgenda et Fallback Mock
│   └── main.js                 # Initialisation, écouteurs d'événements et gestion UI
├── assets/                     # Médias statiques de l'application
│   
├── scss/                       # Code source SASS découpé
│   ├── main.scss               # Centralisateur (uniquement des @use / @import)
│   ├── _variable.scss          # Design Tokens (couleurs, polices, thèmes)
│   ├── _mixins.scss            # Fonctions réutilisables (media queries, flexbox)
│   ├── _base.scss              # Reset CSS, skip-links, styles globaux
│   ├── _accessibility-themes.scss # Gestion des modes de contrastes (nuit, daltonisme)
│   ├── _buttons.scss           # Styles des boutons génériques
│   ├── _home.scss              # Styles spécifiques à la page d'accueil (Hero, recherche)
│   └── _detail.scss            # Styles spécifiques à la fiche événement
├── index.html                  # Page d'accueil / Recherche d'événements
└── fiche-evenement.html        # Page de détails d'un événement
