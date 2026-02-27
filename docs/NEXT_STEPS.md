# Prochaines Étapes : Finalisation Uprising Studio CRM

Pour compléter les nouvelles fonctionnalités et passer en production :

## 1. Finalisation Intégration Notion (Push)

- **Action** : Implémenter les `Orm Event Listeners` dans Twenty pour détecter la création ou modification d'une `Company` ou `Person` et mettre à jour Notion.
- **Action** : Configurer les Webhooks Notion pour recevoir les mises à jour en temps réel.

### Garde-fous contre les boucles de synchronisation infinies

> [!WARNING]
> La combinaison des Orm Event Listeners (Twenty → Notion) et des Webhooks Notion (Notion → Twenty) peut créer des boucles infinies. Appliquez ces trois mécanismes ensemble :

1. **Vérification d'idempotence** : Ajoutez un champ `lastSyncedContentHash` (hash SHA-256 du contenu) et `lastSyncTimestamp` sur les entités `Company` et `Person`. Avant de propager une modification, comparez le hash actuel avec le hash stocké. Si identiques, ignorez la mise à jour.

2. **Champ `syncSource`** : Ajoutez un champ `syncSource: 'local' | 'notion'` sur `Company` et `Person`.
   - Les Orm Event Listeners doivent marquer `syncSource = 'local'` et ignorer les modifications où `syncSource === 'notion'`.
   - Le Webhook Handler Notion doit marquer `syncSource = 'notion'` et ignorer les modifications où `syncSource === 'local'`.

3. **Verrou de synchronisation (cooldown)** : Implémentez un mutex ou TTL par entité (ex: `syncLockUntil: Date`) empêchant toute re-synchronisation dans les 5 secondes suivant la dernière sync. Cela prévient la ré-entrée rapide.

## 2. Configuration Google Tasks (Sync)

- **Action** : Finaliser le polling dans `GoogleTasksSyncService` pour synchroniser les tâches avec `TaskTargetWorkspaceEntity`.

## 3. Intégration GitHub (App Hub)

### Spécifications concrètes

- **Méthode d'authentification** : GitHub App (recommandé plutôt qu'OAuth App car elle offre des permissions granulaires par dépôt et un taux de requêtes plus élevé).
- **Entités GitHub à synchroniser** :
  - Dépôts (repositories)
  - Issues
  - Pull Requests
  - Commits (historique)
- **Mapping CRM** :
  - GitHub Issue → Task (objet Twenty)
  - PR Author → Person (objet Twenty)
  - Repository → Company ou Project (objet custom)
- **Direction et cadence de synchronisation** :
  - **Issues / PRs** : webhook-driven (temps réel), synchronisation bidirectionnelle
  - **Commits** : polling horaire, synchronisation unidirectionnelle (GitHub → CRM)
  - **Repositories** : polling quotidien, unidirectionnel
- **Scopes API GitHub requis** : `repo`, `read:org`, `issues`, `pull_requests`, `workflow`
- **Gestion des tokens** : Stocker le `Installation Token` dans les variables d'environnement ; régénérer automatiquement via le mécanisme JWT de la GitHub App.

## 4. Déploiement & Sécurité

- **Action** : Configurer Sentry pour le tracking d'erreurs en production.
- **Action** : Sécuriser les endpoints de webhook Notion avec une vérification de signature.
- **Action** : Déployer sur l'infrastructure finale (Vercel et Oracle Cloud) via le pipeline CI/CD.

### Gestion des secrets

- **Action** : Stocker toutes les clés API, tokens et secrets de webhooks dans des variables d'environnement ou un gestionnaire de secrets (HashiCorp Vault, AWS Secrets Manager, etc.).
- **Action** : Ne jamais commiter de secrets dans le code source ; utiliser `.env` exclu via `.gitignore`.
- **Action** : Mettre en place la rotation automatique des secrets sensibles.

### Protection des endpoints

- **Action** : Ajouter un middleware de rate limiting sur les endpoints de webhook (ex: `express-rate-limit` ou équivalent NestJS).
- **Action** : Forcer HTTPS/TLS sur tous les endpoints en production (configurer le reverse proxy avec certificats SSL).
- **Action** : Valider et assainir (sanitize) tous les payloads reçus par les webhooks avant traitement.

### Configuration par environnement

- **Action** : Créer des configurations séparées pour dev, staging et production (fichiers `.env.development`, `.env.staging`, `.env.production`).
- **Action** : Mettre en place un plan de sauvegarde et de reprise après sinistre (backup automatique de la base de données, plan de restauration documenté).
- **Action** : Documenter la procédure de rollback en cas d'échec de déploiement (cf. [Guide de Déploiement](./DEPLOYMENT.md#55-procédure-de-rollback)).
- **Action** : Implémenter des endpoints de health check (`/healthz`) pour le monitoring et les sondes de disponibilité.

## 5. Monitoring

- **Action** : Surveiller les logs de synchronisation dans la base de données via `KeyValuePairService`.
