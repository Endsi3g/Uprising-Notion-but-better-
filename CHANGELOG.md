# Changelog - Uprising Studio CRM

All notable changes to this project will be documented in this file.

## [1.4.0] - 2026-03-02

### Added (1.4.0)

- **Instagram & Ollama Integration**: New monitoring service (`instagram-monitor`) to automate Instagram interactions via Ollama.
- **AI Monitoring**: Automated direct message surveillance with contextual response generation by a local LLM.
- **Instagram CLI Support**: Integration of the `Instagram-clii` repository as the base for CLI operations.
- **Configuration**: New environment variables for managing Instagram credentials and monitoring intervals.

## [1.3.0] - 2026-03-02

### Added (1.3.0)

- **Voice Agency Integration**: Full integration of the `Uprising-ai-voice-agency` repository with support for automatic synchronisation.
- **App Hub**: Added "Uprising AI Voice Agency" to the list of available applications.
- **Voice Platform**: Updated agents with real profiles (Rénovation Expert Québec, Clinique Dentaire Sourire Plus, Garage Mécanique Pro).
- **Infrastructure**: Added `voice-agency` service to Docker Compose and created the `uprising-sync-voice.ps1` script.
- **Automation**: Integrated voice agency synchronisation into the main automation workflow.

---

## [1.2.0] - 2026-03-01

### Fixed (1.2.0)

- **Docker Build**: Resolved a critical bug in the `twenty-front` build by bypassing NX for remote DOM element generation.
- **Deployment Scripts**: Fixed path resolution in PowerShell scripts after their reorganisation.
- **TypeScript Import**: Fixed the import path for the `Button` component in `VoiceAgentsPage.tsx`.

### Changed (1.2.0)

- **Internationalisation**: Translated French labels to English in source files to ensure compatibility with the Lingui pipeline (`SignInUp.tsx`, `AppHubPage.tsx`).
- **Centralised Branding**: Using `DefaultWorkspaceName` for all instances of "Uprising Studio".
- **Code Organisation**: Major reorganisation of documents and scripts into `docs/uprising/` and `scripts/uprising-ps/` for a cleaner codebase.

---

## [1.1.0] - 2026-02-26

### Added (1.1.0)

- **Notion Integration (Backend)**: Scaffolded the `integration-notion` module with support for `Companies`, `People`, `Opportunities`, and `Tasks`. Implemented the `@notionhq/client`.
- **Google Tasks Integration (Backend)**: Extended OAuth scopes and created the `GoogleTasksSyncService`.
- **App Hub**: Created the dynamic `App Hub` page using the custom `AppHubLink` object.
- **Key-Value Manager**: Using `KeyValuePairService` to store integration tokens and configurations.

### Changed

- **Dashboard Branding**: Updated welcome text ("Uprising Studio — Control Center").
- **Voice Platform**: Prepared `VoiceAgentsPage.tsx` for REST endpoint integration via environment variables.

---

## [1.0.0] - 2026-02-20

- Initialised the Twenty CRM fork for Uprising Studio.
- Translated status labels to French.
