# Serveur Mangrat 🧠

## Description

Mangrat est un serveur backend intelligent conçu pour être le "cerveau" d'une application. Il utilise une base de données MySQL pour stocker des connaissances et peut être interrogé et enseigné via une API REST. Si une réponse n'est pas trouvée dans sa base de connaissances, il peut faire appel à l'API Google Gemini pour générer une réponse.

Ce serveur est construit avec Node.js, Express, et se connecte à une base de données MySQL (configurée pour Aiven).

## Fonctionnalités Clés

* **Base de Connaissances Thématique :** Les informations sont stockées dans des tables dédiées (Animaux, Histoire, Géographie, etc.).
* **API d'interrogation (`/ask`) :** Permet de poser des questions au système. Il cherche d'abord dans sa base de données.
* **API d'apprentissage (`/teach`) :** Permet d'enseigner de nouvelles paires question/réponse au système.
* **Initialisation Automatique :** Crée automatiquement les tables nécessaires dans la base de données au démarrage.

## Technologies Utilisées

* **Backend :** Node.js
* **Framework :** Express.js
* **Base de Données :** MySQL (avec le driver `mysql2/promise`)
* **Autres :** `cors` pour la gestion des requêtes cross-origin, `dotenv` pour la gestion des variables d'environnement.

## Prérequis

* [Node.js](https://nodejs.org/) (version 18.x ou supérieure recommandée)
* Un serveur de base de données MySQL accessible.

## Installation

1.  **Clonez le dépôt :**
    ```bash
    git clone [URL_DE_VOTRE_DEPOT]
    cd mangrat-server
    ```

2.  **Installez les dépendances :**
    ```bash
    npm install
    ```

3.  **Configuration de l'environnement :**
    Créez un fichier nommé `.env` à la racine du projet. Ce fichier contiendra vos informations sensibles pour éviter de les exposer dans le code.

    ```ini
    # Configuration du Port
    PORT=3000

    # Configuration de la Base de Données Aiven MySQL
    DB_HOST="mysql-1a36101-botwii.c.aivencloud.com"
    DB_USER="avnadmin"
    DB_PASSWORD="AVNS_BvVULOCxM7CcMQd0Aqw"
    DB_DATABASE="defaultdb"
    DB_PORT=14721

    # Clé API pour Google Gemini (si vous l'utilisez)
    GEMINI_API_KEY="AIzaSyAFPlEXH9dVXpaVvNbuQRQZI8-gv-ouH2Q"
    ```

## Lancement du Serveur

Pour démarrer le serveur en mode développement, exécutez :

```bash
node Server.js
