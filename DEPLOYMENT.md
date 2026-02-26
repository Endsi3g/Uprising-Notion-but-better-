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

Pour une production rapide, utilisez Docker Compose :

```bash
docker-compose up -d
```

Assurez-vous que votre fichier `.env` contient les variables nécessaires.

## 3. Configuration des Intégrations

### Notion
1. Obtenez un "Internal Integration Token" sur [Notion Developers](https://www.notion.so/my-integrations).
2. Configurez le token via l'endpoint API ou l'interface de réglage d'Uprising Studio.
3. Mappez les IDs de vos bases de données Notion (`Companies`, `People`, `Opportunities`, `Tasks`).

### Google Tasks
1. Configurez un projet Google Cloud avec l'API Google Tasks activée.
2. Ajoutez le scope `https://www.googleapis.com/auth/tasks` à votre configuration OAuth.

## 4. Sécurité & Monitoring (Sentry / Webhooks)

### Tracking d'Erreurs avec Sentry
L'application intègre Sentry sur le frontend et le backend.
- **Frontend** : Renseignez la variable `VITE_SENTRY_DSN` (par exemple dans Vercel).
- **Backend** : Renseignez la variable `SENTRY_DSN` dans votre fichier `.env`.

### Sécurisation des Webhooks Notion
Les callbacks de Notion vers `/rest/integration/notion/webhook` requièrent une signature valide.
- Définissez une variable `NOTION_WEBHOOK_SECRET` sur votre backend.
- Saisissez cette même phrase secrète dans le panneau de configuration du webhook sur l'interface de Notion.

## 5. Maintenance

Pour mettre à jour l'application :
1. `git pull origin main`
2. `yarn install`
3. `nx build twenty-server`
4. Redémarrer les services.
