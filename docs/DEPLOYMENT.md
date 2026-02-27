# Guide de Déploiement - Uprising Studio CRM

Ce document explique comment déployer et configurer le CRM personnalisé d'Uprising Studio.
Pour des options de déploiement 100% gratuites ou open-source, consultez le [Guide de Déploiement Gratuit](./FREE_DEPLOYMENT_GUIDE.md).

## [1.1.1] - 2026-02-26

### Ajouté
- **Guide de Déploiement Gratuit** : Création de `FREE_DEPLOYMENT_GUIDE.md` détaillant les options Oracle Cloud, Coolify et CapRover.

## 1. White-Labeling (Branding)

L'application a été configurée pour afficher "Uprising Studio" au lieu de "Twenty". Les fichiers suivants contrôlent ce comportement :
- `packages/twenty-front/src/utils/title-utils.ts` : Titre des onglets du navigateur.
- `packages/twenty-front/src/modules/ui/navigation/navigation-drawer/constants/DefaultWorkspaceName.ts` : Nom par défaut de l'espace de travail.

## 2. Déploiement avec Docker

### Prérequis

- **Docker** : version 20.10+ (vérifier avec `docker --version`)
- **Docker Compose** : version 2.0+ (vérifier avec `docker compose version`)
- **RAM** : minimum 2 Go disponibles pour les conteneurs
- **Espace disque** : minimum 5 Go libres

### Variables d'environnement requises

Copiez le fichier `.env.example` en `.env` et renseignez les valeurs :

```bash
cp .env.example .env
```

Les variables essentielles sont documentées dans `.env.example`. Consultez également `docker-compose.yml` à la racine du projet pour la configuration complète des services.

### Lancement

```bash
docker compose up -d
```

Assurez-vous que votre fichier `.env` contient les variables nécessaires.

### Vérification post-déploiement

Vérifiez que tous les services sont opérationnels :

```bash
# Vérifier l'état des conteneurs
docker compose ps

# Vérifier les logs en cas de problème
docker compose logs --tail=50

# Tester le point de santé de l'API
curl http://localhost:3000/healthz
```

## 3. Configuration des Intégrations

### Notion

1. Obtenez un "Internal Integration Token" sur [Notion Developers](https://www.notion.so/my-integrations).
2. Configurez le token via l'endpoint API ou l'interface de réglage d'Uprising Studio.
3. Mappez les IDs de vos bases de données Notion (`Companies`, `People`, `Opportunities`, `Tasks`).

> [!CAUTION]
> **Sécurité des tokens Notion** : Le "Internal Integration Token" est un secret sensible.
> - **Ne jamais le commiter** dans le contrôle de version (ajoutez-le à `.gitignore`).
> - **Stockez-le** dans des variables d'environnement ou un gestionnaire de secrets (Vault, AWS Secrets Manager, etc.).
> - **Rotation régulière** : régénérez le token périodiquement depuis le portail Notion Developers.
> - **En CI/CD** : utilisez les secrets stores de votre pipeline (GitHub Secrets, Railway Variables, Vercel Environment Variables) ou un fichier `.env` exclu du VCS.

### Google Tasks

1. Configurez un projet Google Cloud avec l'API Google Tasks activée.
2. Ajoutez le scope `https://www.googleapis.com/auth/tasks` à votre configuration OAuth.

### Google OAuth (Gmail, Calendar, Tasks)

> [!CAUTION]
> **Sécurité des identifiants OAuth** : Le `Client ID` et le `Client Secret` Google sont des secrets sensibles.
> - **Ne jamais les commiter** dans le code source ou les fichiers de configuration versionnés.
> - **Stockez-les** dans des variables d'environnement (`AUTH_GOOGLE_CLIENT_ID`, `AUTH_GOOGLE_CLIENT_SECRET`) ou un gestionnaire de secrets.
> - **Rotation** : régénérez les identifiants OAuth dans la [Console Google Cloud](https://console.cloud.google.com/apis/credentials) si vous suspectez une compromission.
> - **Exemple** : dans votre fichier `.env` (exclu du VCS via `.gitignore`) :
>   ```
>   AUTH_GOOGLE_CLIENT_ID=votre-client-id
>   AUTH_GOOGLE_CLIENT_SECRET=votre-client-secret
>   ```

## 4. Sécurité & Monitoring (Sentry / Webhooks)

### Tracking d'Erreurs avec Sentry
L'application intègre Sentry sur le frontend et le backend pour une surveillance en temps réel.
- **Frontend** : Renseignez la variable `VITE_SENTRY_DSN` (ex: dans Vercel). J'ai configuré le client pour capturer les erreurs globales.
- **Backend** : Renseignez la variable `SENTRY_DSN` dans votre fichier `.env`.

### Sécurisation des Webhooks Notion
Les callbacks de Notion vers `/rest/integration/notion/webhook` sont désormais protégés :
- **Validation Strict** : Le code exige un `rawBody` valide et utilise `crypto.timingSafeEqual` pour empêcher les attaques par canal auxiliaire.
- **Isolation** : J'ai créé un `NotionWebhookController` dédié sans les gardes REST habituels, permettant une réception publique tout en maintenant une sécurité cryptographique élevée.
- **Configuration** : Définissez `NOTION_WEBHOOK_SECRET` sur votre backend et saisissez le même secret dans Notion.

## 5. Maintenance

Pour mettre à jour l'application, suivez cette checklist complète :

### 5.1 Sauvegarde pré-mise à jour

Avant toute mise à jour, effectuez une sauvegarde de la base de données et des fichiers :

```bash
# Sauvegarder la base de données
docker exec twenty-db-1 pg_dump -U postgres -d default > backup_$(date +%Y%m%d_%H%M%S).sql

# Sauvegarder les volumes Docker (optionnel)
docker compose stop
tar czf volumes_backup_$(date +%Y%m%d).tar.gz ./docker-data/
docker compose start
```

### 5.2 Mise à jour du code

```bash
git pull origin main
yarn install
```

### 5.3 Migration de la base de données

Exécutez les migrations après la mise à jour du code :

```bash
npx nx run twenty-server:database:migrate
```

### 5.4 Reconstruction et redémarrage des services

```bash
nx build twenty-server
docker compose restart
# Ou pour un redémarrage complet :
# docker compose down && docker compose up -d
```

### 5.5 Procédure de rollback

Si la mise à jour cause des problèmes :

```bash
# Revenir à la version précédente du code
git checkout HEAD~1

# Restaurer la sauvegarde de la base de données
docker exec -i twenty-db-1 psql -U postgres -d default < backup_YYYYMMDD_HHMMSS.sql

# Reconstruire et redémarrer
yarn install
nx build twenty-server
docker compose restart
```

### 5.6 Vérification post-mise à jour

```bash
# Vérifier que tous les containers sont en état "healthy"
docker compose ps

# Tester le point de santé de l'API
curl http://localhost:3000/healthz

# Vérifier la connectivité à la base de données
docker exec twenty-db-1 pg_isready -U postgres

# Consulter les logs pour d'éventuelles erreurs
docker compose logs --tail=20 twenty-server twenty-worker
```
