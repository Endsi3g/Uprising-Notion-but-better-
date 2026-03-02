# Changelog - Uprising Studio CRM

Toutes les modifications notables apportées à ce projet seront documentées dans ce fichier.

## [1.4.0] - 2026-03-02

### Ajouté

- **Intégration Instagram & Ollama** : Nouveau service de surveillance (`instagram-monitor`) pour automatiser les interactions Instagram via Ollama.
- **Monitoring IA** : Surveillance automatique des messages directs avec génération de réponses contextuelles par LLM local.
- **Support Instagram CLI** : Intégration du dépôt `Instagram-clii` comme base pour les opérations CLI.
- **Configuration** : Nouvelles variables d'environnement pour la gestion des identifiants Instagram et les intervalles de surveillance.


## [1.3.0] - 2026-03-02

### Ajouté

- **Intégration Voice Agency** : Intégration complète du dépôt `Uprising-ai-voice-agency` avec support pour la synchronisation automatique.
- **App Hub** : Ajout de "Uprising AI Voice Agency" à la liste des applications disponibles.
- **Voice Platform** : Mise à jour des agents avec les profils réels (Rénovation Expert Québec, Clinique Dentaire Sourire Plus, Garage Mécanique Pro).
- **Infrastructure** : Ajout du service `voice-agency` dans Docker Compose et création du script `uprising-sync-voice.ps1`.
- **Automatisation** : Intégration de la synchronisation de l'agence vocale dans le flux d'automatisation principal.

---

## [1.2.0] - 2026-03-01

### Corrigé

- **Docker Build** : Résolution d'un bug critique dans la build `twenty-front` en contournant NX pour la génération des éléments DOM distants.
- **Scripts de Déploiement** : Correction de la résolution des chemins dans les scripts PowerShell après leur réorganisation.
- **Import TypeScript** : Correction du chemin d'import du composant `Button` dans `VoiceAgentsPage.tsx`.

### Modifié

- **Internationalisation** : Traduction des labels français en anglais dans les fichiers sources pour assurer la compatibilité avec le pipeline Lingui (`SignInUp.tsx`, `AppHubPage.tsx`).
- **Branding Centralisé** : Utilisation de `DefaultWorkspaceName` pour toutes les instances de "Uprising Studio".
- **Organisation du Code** : Réorganisation majeure des documents et scripts vers `docs/uprising/` et `scripts/uprising-ps/` pour un socle plus propre.

---

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
