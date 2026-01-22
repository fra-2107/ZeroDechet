# Guide de Déploiement - ZeroDechet

## Prérequis

- Docker
- Docker Compose
- cloner le projet git

## 1. Accès au bon dossier
```bash
cd ZeroDechet/docker
```

### 2. Lancer le conteneur
```bash
docker-compose up --build
```
attendre : 
    node_api       | API Node lancée sur le port 3000
    node_api       | Connecté à MySQL !



## Accès à l'application

Une fois le conteneur lancé, ouvrez votre navigateur et allez à:

```
http://localhost:4200
```

compte de test :
- utilisateur : alice@brest.fr
- mot de passe : hash123

## Arrêter le conteneur quand vous avez fini
ctrl + c dans le terminal puis:
```bash
docker-compose down
```

## Autres services disponibles

- **phpMyAdmin**: http://localhost:8080 (backlog_user / backlog_pass)


auteurs : Raphaël CARDINAL, Timoté CHIMIENTI, Ewen HELARY, Léonie PIMENT