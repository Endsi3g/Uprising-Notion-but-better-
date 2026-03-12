# 🚀 Uprising Cofounder

Plateforme d'IA pour entrepreneurs canadiens. Transformez votre idée en startup avec la Trifecta Uprising.

## ⚡ Stack Technique

| Couche | Technologies |
|---|---|
| **Frontend** | React 19, Vite, TailwindCSS, Framer Motion |
| **Backend** | Express.js, Prisma ORM, Socket.IO |
| **Base de données** | PostgreSQL (Supabase ou Docker) |
| **IA** | Google Gemini API |
| **Monitoring** | Sentry (erreurs & profiling), PostHog (analytics) |
| **Sécurité** | JWT, Bcrypt, Helmet, Rate-Limiting, MFA (TOTP) |

## 🛠 Installation & Démarrage Rapide

### Prérequis

- [Node.js](https://nodejs.org/) v18+
- [Docker](https://www.docker.com/) (pour le déploiement conteneurisé)

### 1. Cloner le dépôt

```bash
git clone https://github.com/votre-utilisateur/Uprising-Notion-but-better-.git
cd Uprising-Notion-but-better-
```

### 2. Configurer les variables d'environnement

```bash
cp .env.example .env
```

Éditez `.env` et renseignez au minimum :
- `GEMINI_API_KEY` — Clé API Gemini (obligatoire)
- `JWT_SECRET` — Chaîne secrète de 64+ caractères (obligatoire en production)

> Consultez le [Guide de Configuration](./SETUP_GUIDE.md) pour la liste complète des variables.

### 3a. Démarrage Local (Sans Docker)

```powershell
.\start-local.ps1
```

Ou manuellement :

```bash
npm install --legacy-peer-deps
npx prisma generate
npm run dev
```

### 3b. Démarrage Docker (Recommandé pour le déploiement)

```powershell
# Windows
.\deploy.ps1

# Linux / macOS
./deploy.sh
```

Ou directement :

```bash
docker compose up -d --build
```

L'application sera accessible sur `http://localhost:3000`.

## 📊 Monitoring & Analytics

| Service | Rôle | Configuration |
|---|---|---|
| **Sentry** | Tracking d'erreurs, profiling backend, replays frontend | `SENTRY_DSN` + `VITE_SENTRY_DSN` |
| **PostHog** | Product analytics, suivi d'usage utilisateur | `VITE_POSTHOG_KEY` + `VITE_POSTHOG_HOST` |

> Ces services sont **optionnels** mais fortement recommandés en production.

## 📚 Documentation

- [SETUP_GUIDE.md](./SETUP_GUIDE.md) — Guide complet d'installation et de configuration
- [DOCKER_GUIDE.md](./DOCKER_GUIDE.md) — Configuration et déploiement conteneurisé
- [NEXT_STEPS.md](./NEXT_STEPS.md) — Feuille de route et prochaines étapes
- [AGENTS.md](./AGENTS.md) — Détails des services d'IA
- [GEMINI.md](./GEMINI.md) — Contexte technique pour les développeurs IA

## 📝 Licence

Projet privé — © Uprising Studio
