# Guide de Déploiement : Vercel (UI) + Railway (Backend) 🚀

Ce guide explique comment faire fonctionner ensemble le Frontend (Vercel) et le Backend (Railway) pour votre CRM Uprising Studio.

## 🏗️ Architecture
1.  **Vercel** : Héberge l'interface utilisateur (React). Elle est rapide et accessible via une URL `.vercel.app`.
2.  **Railway** : Héberge le serveur (API), la base de données PostgreSQL et le cache Redis.

---

## 🏁 Étape 1 : Le Backend (Railway)
*C'est le moteur de votre application.*

1.  Suivez le [Guide Railway](./RAILWAY_GUIDE.md) pour déployer le backend.
2.  Une fois déployé, Railway vous donnera une URL (ex: `https://uprising-backend-production.up.railway.app`).
3.  **Copiez cette URL**, elle est indispensable pour l'étape suivante.

---

## 🎨 Étape 2 : Le Frontend (Vercel)
*C'est ce que vous et votre équipe verrez dans le navigateur.*

1.  Connectez-vous à [Vercel](https://vercel.com).
2.  Créez un nouveau projet à partir de votre dépôt GitHub.
3.  **Configuration du dossier** : Sélectionnez `packages/twenty-front` comme dossier racine (Root Directory).
4.  **Variables d'environnement** : C'est ici que la magie opère. Ajoutez cette variable :
    *   **Clé** : `VITE_SERVER_URL`
    *   **Valeur** : L'URL de votre backend Railway (celle copiée à l'étape 1).
5.  Cliquez sur **Deploy**.

---

## 🔗 Étape 3 : Liaison finale
Quand vous ouvrirez votre URL Vercel, l'interface va essayer de contacter le serveur sur Railway.
*   Si vous voyez l'écran de connexion : **C'est gagné !**
*   Si vous voyez une erreur de connexion : Vérifiez que `VITE_SERVER_URL` sur Vercel correspond exactement à l'adresse de Railway.

---

## 💡 Astuce de Configuration
Pour configurer Notion rapidement une fois que votre serveur est lancé localement (via Docker) :
Lancez cette commande dans votre terminal :
```bash
node scripts/setup_notion_config.js "VOTRE_TOKEN" "ID_DB_ENTREPRISES" "ID_DB_PERSONNES"
```
*Cela injectera directement les identifiants dans la base de données sans passer par l'interface.*

---
**Status** : Votre système est maintenant prêt pour une production robuste et scalable !
