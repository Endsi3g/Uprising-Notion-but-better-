# 📖 Guide de Configuration — Uprising Cofounder

Ce guide détaille toutes les intégrations mises en place et comment les configurer.

---

## Table des matières

1. [Variables d'environnement](#1-variables-denvironnement)
2. [Sentry — Monitoring d'erreurs](#2-sentry--monitoring-derreurs)
3. [PostHog — Product Analytics](#3-posthog--product-analytics)
4. [Supabase — Base de données PostgreSQL](#4-supabase--base-de-données-postgresql)
5. [Docker — Déploiement conteneurisé](#5-docker--déploiement-conteneurisé)
6. [Services optionnels](#6-services-optionnels)

---

## 1. Variables d'environnement

Copiez le fichier d'exemple, puis éditez-le :

```bash
cp .env.example .env
```

### Variables obligatoires

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Clé API Google Gemini pour les fonctionnalités IA |
| `JWT_SECRET` | Chaîne secrète de 64+ caractères pour la signature des tokens JWT. **Obligatoire en production.** |

### Variables recommandées (production)

| Variable | Description |
|---|---|
| `NODE_ENV` | `production` pour activer les protections de sécurité |
| `APP_URL` | URL de votre application (ex: `https://cofounder.uprisingstudio.ca`) |
| `CORS_ORIGIN` | Origines autorisées pour les requêtes CORS |
| `PORT` | Port du serveur backend (défaut : `3000`) |

---

## 2. Sentry — Monitoring d'erreurs

Sentry est intégré dans le **frontend** (React) et le **backend** (Express) pour capturer automatiquement les erreurs, le profiling et les replays de sessions.

### Ce qui est en place

- **Frontend** (`src/main.tsx`) : `@sentry/react` avec Browser Tracing et Session Replay
- **Backend** (`server/index.ts`) : `@sentry/node` avec Node Profiling et Express Error Handler

### Configuration

1. Créez un projet sur [sentry.io](https://sentry.io)
2. Récupérez votre **DSN** dans les paramètres du projet
3. Ajoutez dans `.env` :

```env
SENTRY_DSN="https://examplePublicKey@o0.ingest.sentry.io/0"
VITE_SENTRY_DSN="https://examplePublicKey@o0.ingest.sentry.io/0"
```

> **Note** : `SENTRY_DSN` est utilisé par le backend, `VITE_SENTRY_DSN` par le frontend (Vite expose uniquement les variables préfixées par `VITE_`).

### Fonctionnalités activées

| Fonctionnalité | Taux d'échantillonnage | Modifiable dans |
|---|---|---|
| Tracing (transactions) | 100% | `tracesSampleRate` |
| Profiling backend | 100% | `profilesSampleRate` |
| Session Replay | 10% (100% sur erreur) | `replaysSessionSampleRate` |

---

## 3. PostHog — Product Analytics

PostHog permet de suivre le comportement des utilisateurs sur la plateforme : pages visitées, actions cliquées, funnels de conversion, etc.

### Ce qui est en place

- **Frontend** (`src/main.tsx`) : `posthog-js` initialisé avec `PostHogProvider` qui enveloppe toute l'application React
- L'initialisation est **conditionnelle** : PostHog ne se charge que si `VITE_POSTHOG_KEY` est renseignée

### Configuration

1. Créez un compte sur [posthog.com](https://posthog.com) (tier gratuit : 1M événements/mois)
2. Créez un projet et récupérez votre **Project API Key**
3. Ajoutez dans `.env` :

```env
VITE_POSTHOG_KEY="phc_VotreClefAPI"
VITE_POSTHOG_HOST="https://us.i.posthog.com"
```

> **Note** : Si vous êtes en Europe, utilisez `https://eu.i.posthog.com` comme hôte.

### Fonctionnalités disponibles

- 📊 Suivi automatique des pages visitées
- 🖱️ Tracking des actions utilisateur
- 🔍 Funnels de conversion
- 👤 Identification des utilisateurs (mode `identified_only`)

---

## 4. Supabase — Base de données PostgreSQL

L'application utilise **Prisma ORM** pour interagir avec PostgreSQL. Supabase fournit une instance PostgreSQL gratuite hébergée dans le cloud.

### Ce qui est en place

- Prisma est déjà configuré dans le projet
- La variable `DATABASE_URL` dans `.env.example` pointe par défaut vers une instance locale Docker
- Le schéma Prisma est prêt à fonctionner avec Supabase sans aucune modification de code

### Configuration avec Supabase

1. Créez un projet sur [supabase.com](https://supabase.com) (tier gratuit : 500 MB)
2. Allez dans **Settings > Database > Connection String > URI**
3. Copiez l'URL et ajoutez-la dans `.env` :

```env
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
```

4. Lancez les migrations Prisma :

```bash
npx prisma db push
```

### Configuration locale (Docker)

Si vous utilisez Docker, la base de données est automatiquement créée :

```env
DATABASE_URL="postgresql://uprising:uprising_pass@localhost:5432/uprising_crm?schema=public"
```

---

## 5. Docker — Déploiement conteneurisé

### Scripts de déploiement

Des scripts automatisés gèrent la construction et le lancement des conteneurs :

| Script | Plateforme | Usage |
|---|---|---|
| `deploy.ps1` | Windows (PowerShell) | `.\deploy.ps1` |
| `deploy.sh` | Linux / macOS (Bash) | `./deploy.sh` |

### Caractéristiques des scripts

- ✅ Vérification que Docker est installé
- ✅ Création automatique du `.env` depuis `.env.example` si absent
- ✅ Gestion d'erreurs avec `try/catch` (PowerShell) et `trap` (Bash)
- ✅ Build et démarrage automatique des conteneurs

### Architecture Docker

| Conteneur | Port | Description |
|---|---|---|
| `frontend` | 80 → 3000 (via Nginx) | App React construite et servie par Nginx |
| `backend` | 3000 | API Express + WebSocket |
| `postgres` | 5432 | Base de données PostgreSQL |

### Nginx (Frontend)

Le frontend utilise Nginx comme serveur statique avec :
- Proxy des requêtes `/api/` vers le backend
- Proxy des WebSockets (`/socket.io/`) vers le backend
- Gestion du client-side routing React (`try_files`)

### Résolution de problèmes Docker

Consultez le [DOCKER_GUIDE.md](./DOCKER_GUIDE.md) pour les problèmes courants.

---

## 6. Services optionnels

Ces services nécessitent des clés API spécifiques que vous pouvez configurer dans `.env` :

| Service | Variables | Usage |
|---|---|---|
| **Bland AI** | `BLAND_API_KEY` | Appels téléphoniques automatisés |
| **Twilio** | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` | Envoi de SMS |
| **ElevenLabs** | `ELEVENLABS_API_KEY` | Synthèse vocale |
| **Twenty CRM** | `TWENTY_API_KEY`, `TWENTY_API_URL` | Synchronisation CRM |
| **SMTP** | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM` | Emails (vérification, reset password) |
| **AWS S3** | `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET` | Upload d'images |

---

## Résumé des modifications récentes

| Date | Modification |
|---|---|
| 2026-03-12 | ✅ Correction des scripts de déploiement Docker (`deploy.ps1`, `deploy.sh`) |
| 2026-03-12 | ✅ Ajout de la configuration Nginx pour le proxy frontend |
| 2026-03-12 | ✅ Correction du build NPM (`--legacy-peer-deps`) |
| 2026-03-12 | ✅ Finalisation de l'intégration Sentry (frontend + backend) |
| 2026-03-12 | ✅ Intégration de PostHog pour les analytics |
| 2026-03-12 | ✅ Préparation de la configuration Supabase (DATABASE_URL) |
