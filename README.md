# Interface de Chat Mangrat

## Description

Ce projet est l'interface utilisateur (front-end) pour interagir avec le serveur intelligent Mangrat. C'est une application web d'une seule page (Single Page Application) qui permet aux utilisateurs de poser des questions à l'IA Mangrat et de recevoir des réponses en temps réel.

L'interface est conçue pour être propre, simple et réactive.

## Fonctionnalités

* **Interface de Chat Intuitive :** Affiche les messages de l'utilisateur et du bot dans des bulles de discussion distinctes.
* **Communication Asynchrone :** Utilise l'API Fetch pour communiquer avec le backend Mangrat (`/ask`) sans recharger la page.
* **Indicateur de Réponse :** Affiche un message "Mangrat est en train d'écrire..." pour améliorer l'expérience utilisateur pendant que le serveur traite une réponse.
* **Aucune Dépendance :** Construit avec du HTML, CSS et JavaScript purs (vanilla JS).

## Installation et Lancement

Cette interface est un client statique. Elle est conçue pour être servie directement par le serveur `Server.js` de Mangrat.

1.  **Assurez-vous que le serveur Mangrat est en cours d'exécution.**
2.  **Placez les fichiers `index.html`, `style.css`, et `script.js` dans le dossier `public`** à la racine de votre projet serveur.
3.  **Ouvrez votre navigateur** et allez à l'adresse `http://localhost:3000` (ou le port que vous avez configuré).

L'interface de chat se chargera automatiquement.
