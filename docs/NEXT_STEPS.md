# Prochaines Étapes : Finalisation Uprising Studio CRM

Pour compléter les nouvelles fonctionnalités et passer en production :

## 1. Finalisation Intégration Notion (Push)
- **Action** : Implémenter les `Orm Event Listeners` dans Twenty pour détecter la création ou modification d'une `Company` ou `Person` et mettre à jour Notion.
- **Action** : Configurer les Webhooks Notion pour recevoir les mises à jour en temps réel.

## 2. Configuration Google Tasks (Sync)
- **Action** : Finaliser le polling dans `GoogleTasksSyncService` pour synchroniser les tâches avec `TaskTargetWorkspaceEntity`.

## 3. Intégration GitHub (App Hub)
- **Action** : Ajouter une intégration GitHub pour permettre de connecter facilement ses projets dans le App Hub.

## 4. Déploiement & Sécurité
- **Action** : Configurer Sentry pour le tracking d'erreurs en production.
- **Action** : Sécuriser les endpoints de webhook Notion avec une vérification de signature.
- **Action** : Déployer sur l'infrastructure finale (Vercel et Oracle Cloud) via le pipeline CI/CD.

## 5. Monitoring
- **Action** : Surveiller les logs de synchronisation dans la base de données via `KeyValuePairService`.
