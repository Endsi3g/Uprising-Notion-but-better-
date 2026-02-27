# Uprising Automation Scripts

Ce dossier contient l'ensemble des scripts nécessaires à l'automatisation du flux d'acquisition Uprising, interagissant avec Twenty CRM.

## Composants

1. **`apify-to-twenty.js`** : Interroge Apify pour scraper Google Maps et injecter les résultats dans Twenty.
2. **`follow-up-engine.js`** : Analyse le pipeline et envoie des emails de relance automatique (ex: lien Calendly) aux leads intéressés.
3. **`metrics-exporter.js`** : Exporte l'ensemble des requêtes depuis Twenty vers un Google Sheet.
4. **`call-analyzer.js`** : Serveur webhook pour traiter les transcripts Fireflies.ai et les analyser avec OpenAI GPT-4, avant de créer la note dans Twenty.

## Installation

```bash
cd scripts/automation
npm install
# ou
yarn install
```

## Configuration

Copiez `.env.example` en un fichier `.env` puis complétez avec vos informations (Token Apify, Twenty, OpenAI, SMTP, etc.) :

```bash
cp .env.example .env
```

## Lancement

```bash
npm run apify
npm run followup
npm run metrics
npm run analyzer
```
