# Guide de Déploiement : Vercel (UI) + Railway (Backend) 🚀

Ce guide explique comment faire fonctionner ensemble le Frontend (Vercel) et le Backend (Railway) pour votre CRM Uprising Studio.

## 🏗️ Architecture

1. **Vercel** : Héberge l'interface utilisateur (React). Elle est rapide et accessible via une URL `.vercel.app`.
2. **Railway** : Héberge le serveur (API), la base de données PostgreSQL et le cache Redis.

---

## 🏁 Étape 1 : Le Backend (Railway)

*C'est le moteur de votre application.*

1. Suivez le [Guide Railway](./RAILWAY_GUIDE.md) pour déployer le backend.
2. Une fois déployé, Railway vous donnera une URL (ex: `https://uprising-backend-production.up.railway.app`).
3. **Copiez cette URL**, elle est indispensable pour l'étape suivante.

---

## 🎨 Étape 2 : Le Frontend (Vercel)

*C'est ce que vous et votre équipe verrez dans le navigateur.*

1. Connectez-vous à [Vercel](https://vercel.com).
2. Créez un nouveau projet à partir de votre dépôt GitHub.
3. **Configuration du dossier** : Sélectionnez `packages/twenty-front` comme dossier racine (Root Directory).
4. **Framework Preset** : Sélectionnez **Vite** dans les paramètres de build.
5. **Build Command** : `npx nx build twenty-front` (ou la commande de build Vite de votre repo).
6. **Output Directory** : `dist` (le répertoire de sortie standard de Vite).
7. **Node.js version** : Sélectionnez une version compatible (18.x ou 20.x recommandé) dans les paramètres de projet Vercel.
8. **Variables d'environnement** : C'est ici que la magie opère. Ajoutez cette variable :
    * **Clé** : `VITE_SERVER_URL`
    * **Valeur** : L'URL de votre backend Railway (celle copiée à l'étape 1).
9. Cliquez sur **Deploy**.

### Configuration CORS sur Railway

> [!IMPORTANT]
> Le backend Railway doit autoriser les requêtes CORS provenant du domaine Vercel.
> Ajoutez la variable d'environnement suivante sur votre service Railway :
>
> ```
> CORS_ORIGIN=https://votre-projet.vercel.app
> ```
>
> Remplacez `votre-projet.vercel.app` par l'URL réelle de votre déploiement Vercel.

---

## 🔗 Étape 3 : Liaison finale

Quand vous ouvrirez votre URL Vercel, l'interface va essayer de contacter le serveur sur Railway.
* Si vous voyez l'écran de connexion : **C'est gagné !**
* Si vous voyez une erreur de connexion : Vérifiez que `VITE_SERVER_URL` sur Vercel correspond exactement à l'adresse de Railway.

---

## 💡 Configuration Notion

### Pour le développement local (Docker)

> [!NOTE]
> Cette section concerne uniquement la configuration locale pour le test initial avant déploiement sur Vercel/Railway.

Configurez les identifiants Notion via des variables d'environnement, puis lancez le script :

```bash
# Définir les variables d'environnement (ne PAS passer les secrets en arguments CLI)
export NOTION_TOKEN="votre_token_notion"
export NOTION_DB_ENTERPRISES="id_db_entreprises"
export NOTION_DB_PEOPLE="id_db_personnes"

# Lancer le script de configuration
node scripts/uprising-setup/setup_notion_config.js
```

*Cela injectera directement les identifiants dans la base de données sans passer par l'interface.*

### Pour la production (Railway / Vercel)

Pour la production, configurez les secrets Notion directement via l'interface de Railway :

1. Ouvrez votre service backend sur Railway.
2. Allez dans **Variables**.
3. Ajoutez les variables suivantes :
   - `NOTION_TOKEN` : votre Internal Integration Token Notion
   - `NOTION_DB_ENTERPRISES` : l'ID de la base de données Entreprises
   - `NOTION_DB_PEOPLE` : l'ID de la base de données Personnes

> [!CAUTION]
> Ne passez jamais les secrets en arguments de ligne de commande. Les arguments CLI apparaissent dans l'historique du shell et les logs de processus.

---

## ⚠️ Considérations pour la production

> [!WARNING]
> Le déploiement seul ne suffit pas pour une production robuste. Assurez-vous de couvrir les points suivants :

### Monitoring & Logging

- Configurez Sentry (`SENTRY_DSN` / `VITE_SENTRY_DSN`) pour le suivi d'erreurs en temps réel.
- Activez les logs structurés côté Railway pour le debugging.

### Sauvegardes & Reprise après sinistre

- Configurez des sauvegardes automatiques de la base PostgreSQL sur Railway.
- Testez régulièrement la restauration des sauvegardes.
- Consultez le [Guide de Déploiement](./DEPLOYMENT.md#5-maintenance) pour les procédures détaillées.

### Sécurité

- Forcez HTTPS/TLS sur tous les endpoints (Railway le fait par défaut).
- Configurez l'authentification et l'autorisation appropriées.
- Ajoutez du rate limiting sur les endpoints publics et webhooks.

### Certificats SSL/TLS

- Railway fournit automatiquement des certificats SSL pour les domaines personnalisés.
- Vercel gère automatiquement les certificats pour les sous-domaines `.vercel.app`.

### Migrations de base de données

- Exécutez les migrations avant chaque déploiement : `npx nx run twenty-server:database:migrate`.
- Documentez les migrations et maintenez un historique.

### CI/CD

- Configurez GitHub Actions ou un pipeline équivalent pour automatiser le build, les tests et le déploiement.
- Consultez le workflow existant dans `.github/workflows/`.

### Scalabilité & Performance

- Surveillez l'utilisation des ressources (CPU, RAM, I/O) sur Railway.
- Configurez le scaling horizontal si nécessaire.
- Optimisez les requêtes de base de données lentes.

### Suivi des erreurs & Alertes

- Configurez des alertes Sentry pour les erreurs critiques.
- Mettez en place des notifications (Slack, email) pour les incidents de production.
