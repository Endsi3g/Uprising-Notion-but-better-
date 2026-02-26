# Guide de Déploiement Gratuit & Open Source 🚀

Pour rendre Uprising Studio accessible à votre équipe sans frais mensuels d'abonnement SaaS, voici les trois meilleures options.

## 🏆 Option 1 : Oracle Cloud Free Tier (Recommandé)
Oracle offre le "Always Free Tier" le plus généreux du marché.

- **Avantages** : 100% gratuit à vie, instances ARM puissantes (jusqu'à 4 CPUs et 24 Go de RAM).
- **Processus** :
    1. Créez un compte sur `cloud.oracle.com`.
    2. Créez une instance "Ampere" avec Ubuntu.
    3. Installez Docker et Docker Compose.
    4. Clonez ce repository.
    5. Lancez via `docker-compose up -d`.

## 🛠️ Option 2 : Coolify (Self-Hosted PaaS)
Coolify est une alternative open-source à Heroku/Vercel que vous installez sur votre propre serveur (VPS à 4-5$/mois ou instance gratuite Oracle).

- **Lien** : [coolify.io](https://coolify.io)
- **Pourquoi ?** : Il gère automatiquement les domaines SSL (https), les bases de données PostgreSQL/Redis et les déploiements Git push. C'est l'outil parfait pour une équipe qui veut une interface simplifiée.

## ⛵ Option 3 : CapRover
Similaire à Coolify, CapRover est extrêmement léger et facile à configurer sur n'importe quel serveur Linux.

- **Processus** :
    1. Installez CapRover sur votre serveur.
    2. Utilisez le "One-Click App" pour PostgreSQL et Redis.
    3. Déployez le frontend et le backend via des fichiers `captain-definition`.

---

## 💡 Conseils pour l'accessibilité d'équipe

1. **Domaine Gratuit** : Utilisez `freenom.com` ou des sous-domaines dynamiques comme `duckdns.org` si vous n'avez pas encore de nom de domaine `.com`.
2. **Reverse Proxy** : Utilisez **Nginx Proxy Manager** (Open Source) pour gérer les certificats SSL (HTTPS) gratuitement avec Let's Encrypt. C'est essentiel pour que votre équipe puisse se connecter en toute sécurité.
3. **Tunneling (Si pas de serveur)** : Si vous voulez tester sur votre machine locale mais le rendre accessible, utilisez **Cloudflare Tunnel** (gratuit et sécurisé) au lieu de ngrok.

---

## ⚠️ Note sur les performances
Le CRM Twenty (Uprising) nécessite environ **2 Go de RAM minimum** pour fonctionner correctement avec la base de données et les workers. Évitez les instances "Micro" à 1 Go de RAM.
