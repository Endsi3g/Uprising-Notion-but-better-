# Guide de Déploiement Railway.app 🚂

Railway est une excellente alternative à Oracle Cloud pour un déploiement rapide et sans gestion de clés SSH.

## ⚠️ Prérequis Important
Le CRM Twenty nécessite au moins **2 Go de RAM** pour fonctionner (build et exécution). Assurez-vous d'avoir un compte Railway avec suffisamment de crédits ou un plan Pro.

## Étapes de déploiement

### 1. Préparer le compte Railway
1. Créez un compte sur [Railway.app](https://railway.app).
2. Liez votre compte GitHub.

### 2. Créer le projet
1. Cliquez sur **"New Project"**.
2. Choisissez **"Deploy from GitHub repo"**.
3. Sélectionnez votre dépôt `twenty-main`.

### 3. Configurer les services (PostgreSQL & Redis)
Railway détectera peut-être le `docker-compose.yml`, mais il est recommandé d'utiliser les services natifs de Railway pour de meilleures performances :
1. Dans votre projet Railway, cliquez sur **"Add Service"** > **"Database"** > **"Add PostgreSQL"**.
2. Cliquez sur **"Add Service"** > **"Database"** > **"Add Redis"**.

### 4. Configurer le service Application
1. Cliquez sur le service correspondant à votre dépôt GitHub.
2. Allez dans **"Settings"** > **"General"** > **"Docker"**.
3. Assurez-vous que le **Dockerfile Path** pointe vers : `packages/twenty-docker/twenty/Dockerfile`.
4. Allez dans **"Variables"** et ajoutez les variables suivantes :
   - `PG_DATABASE_URL` : `${{Postgres.DATABASE_URL}}` (Utilisez la variable fournie par le service PostgreSQL de Railway)
   - `REDIS_URL` : `${{Redis.REDIS_URL}}`
   - `SERVER_URL` : L'URL générée par Railway pour ce service.
   - `APP_SECRET` : Une chaîne aléatoire longue.
   - `NOTION_WEBHOOK_SECRET` : Votre secret Notion.
   - `VITE_SERVER_URL` : La même valeur que `SERVER_URL`.

### 5. Déploiement
Railway lancera automatiquement le build. Le build peut prendre entre 10 et 20 minutes car il compile tout le TypeScript et le Frontend.

---
**Note d'Antigravity** : Je ne peux pas créer de compte en votre nom pour des raisons de sécurité et de confidentialité. Vous devez effectuer la création du compte et la liaison GitHub manuellement. Une fois cela fait, je peux vous aider à ajuster les fichiers de configuration si nécessaire.
