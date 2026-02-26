# Changelog - Uprising Studio CRM

Toutes les modifications notables apportées à ce projet seront documentées dans ce fichier.

## [1.1.0] - 2026-02-26

### Ajouté
- **Intégration Notion (Backend)** : Scaffoldé le module `integration-notion` avec support pour `Companies`, `People`, `Opportunities` et `Tasks`. Implémentation du client `@notionhq/client`.
- **Intégration Google Tasks (Backend)** : Extension des scopes OAuth et création du `GoogleTasksSyncService`.
- **App Hub** : Création de la page `App Hub` dynamique utilisant l'objet personnalisé `AppHubLink`.
- **Gestionnaire de Clés-Valeurs** : Utilisation du `KeyValuePairService` pour stocker les tokens et configurations d'intégration.

### Modifié
- **Dashboard Branding** : Texte de bienvenue mis à jour ("Uprising Studio — Centre de Contrôle").
- **Voice Platform** : Préparation de `VoiceAgentsPage.tsx` pour l'intégration d'endpoints REST via variables d'environnement.

---

## [1.0.0] - 2026-02-20
- Initialisation du fork de Twenty CRM pour Uprising Studio.
- Traduction des labels de statut en Français.
