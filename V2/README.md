# Clean Coast - Protection des côtes bretonnes

Application web pour la protection et le nettoyage des côtes bretonnes.

## Structure du projet

```
V2/
├── index.html          # Page principale de l'application
├── pages/
│   ├── login.html      # Page de connexion
│   ├── register.html   # Page d'inscription
├── styles.css          # Feuille de styles CSS
├── script.js           # Logique JavaScript
└── start_server.bat   # Script pour lancer le serveur
```

## Fonctionnalités

### Authentification
- Connexion avec vérification d'identifiants
- Inscription de nouveaux utilisateurs
- Système de session avec localStorage
- Bouton de déconnexion

### Pages principales
- **Tableau de bord** : Vue d'ensemble des statistiques et événements
- **Événements** : Liste des événements de nettoyage à venir
- **Carte** : Carte interactive avec Leaflet montrant les plages et points de collecte
- **Statistiques** : Tableaux de bord et classements
- **Historique** : Événements passés et résultats
- **Profil** : Gestion du profil utilisateur

### Fonctionnalités techniques
- Navigation SPA (Single Page Application)
- Carte interactive avec filtres
- Responsive design
- Interface moderne avec CSS custom properties

## Technologies utilisées

- **HTML5** : Structure des pages
- **CSS3** : Styles et responsive design
- **JavaScript (ES6+)** : Logique applicative
- **Leaflet** : Cartes interactives
- **LocalStorage** : Stockage des données de session

## Installation et utilisation

### Lancement du serveur

#### Option 1 : Via le script batch (Windows)
```bash
# Double-cliquez sur start_server.bat
```

#### Option 2 : Via ligne de commande
```bash
cd ZeroDechet
python -m http.server 8000
```

### Accès à l'application

Ouvrez votre navigateur et allez sur :
- **Page principale** : `http://localhost:8000/V2/index.html`
- **Connexion** : `http://localhost:8000/V2/pages/login.html`
- **Inscription** : `http://localhost:8000/V2/pages/register.html`

### Identifiants de test

- **Email** : `benoit@zerodechets.fr`
- **Mot de passe** : `password`

## Architecture du code

### Séparation des préoccupations
- **HTML** (`index.html`) : Structure et contenu
- **CSS** (`styles.css`) : Présentation et mise en page
- **JavaScript** (`script.js`) : Comportement et logique

### Données mock
L'application utilise des données fictives pour la démonstration :
- Événements de nettoyage
- Plages et leur statut
- Points de collecte de déchets
- Classement des utilisateurs

### Authentification
Système d'authentification simplifié utilisant localStorage :
- Stockage des informations de session
- Vérification des identifiants
- Gestion de l'état de connexion

## Développement

### Ajout de nouvelles fonctionnalités
1. Modifier les données mock dans `script.js`
2. Ajouter les styles correspondants dans `styles.css`
3. Mettre à jour la structure HTML si nécessaire

### Déploiement
L'application est statique et peut être déployée sur n'importe quel serveur web ou service de hosting statique (GitHub Pages, Netlify, etc.).

## Auteurs
Projet réalisé dans le cadre du cours Gestion de Projet à l'ISEN Brest.