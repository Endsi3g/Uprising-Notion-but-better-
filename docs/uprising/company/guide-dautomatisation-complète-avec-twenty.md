# Guide d'automatisation complète avec Twenty

## Architecture du Système

```
[Apify Scraping] → [Make.com] → [Twenty CRM] ← [Fireflies Call Recording]
                                      ↓
                            [Auto Follow-ups via Make]
                                      ↓
                            [Google Sheets Dashboard]
```

Twenty est le centre de contrôle. Tout passe par Twenty, tout est loggé dans Twenty.

---

## Étape 1 : Configurer Twenty pour l'Acquisition

### 1.1 Créer les Champs Personnalisés

Dans Twenty, tu dois ajouter des champs custom à l'objet "People" ou "Companies" :

**Navigue vers** : Settings → Objects → People (ou Companies) → Fields

**Ajouter ces champs** :

| Nom du Champ | Type | Options/Notes |
|--------------|------|---------------|
| `Canal` | Select | Options: "Cold Call", "Guerrilla", "Référence", "Inbound" |
| `Script Utilisé` | Select | Options: "Platten", "Daniel G", "Autre" |
| `Industrie` | Select | Options: "Nettoyage", "Plomberie", "Électricité", "Toiture", "Paysagiste" |
| `Objection Principale` | Text | Texte libre pour noter l'objection |
| `Taille Entreprise` | Number | Nombre d'employés estimé |
| `Source Google Maps` | URL | Lien vers leur fiche Google Maps |
| `Nombre Appels Faits` | Number | Compteur automatique |
| `Dernière Interaction` | Date | Auto-update via Make |

### 1.2 Configurer le Pipeline de Ventes

**Navigue vers** : Settings → Objects → Opportunities → Stages

**Créer ces étapes** :

1. **Lead Froid** (statut initial après scraping)
2. **Contacté** (après premier appel/visite)
3. **Intéressé** (réponse positive, veut en savoir plus)
4. **Démo Bookée** (rendez-vous confirmé)
5. **Démo Faite** (démo livrée, en attente de décision)
6. **Négociation** (en discussion pricing/termes)
7. **Gagné** (client signé, paiement reçu)
8. **Perdu** (pas intéressé ou ghosté)

---

## Étape 2 : Connecter Apify → Twenty (Injection Automatique de Leads)

### 2.1 Scraper Google Maps avec Apify

**Aller sur** : <https://apify.com/compass/crawler-google-places>

**Configurer le scraper** :

- **Search Query** : "plombier Repentigny" (ou autre combinaison industrie + ville)
- **Max Results** : 30
- **Language** : fr
- **Fields à extraire** :
  - title (nom du business)
  - phone
  - address
  - url (lien Google Maps)
  - totalScore (rating)
  - reviewsCount

**Run le scraper**, puis exporter en JSON ou CSV.

### 2.2 Connecter Apify à Make.com

**Option A : Webhook (Recommandé)**

1. Dans Apify, va dans ton Actor run → Integrations → Webhooks
2. Copie l'URL webhook de Make (tu vas la créer à l'étape suivante)
3. Configure le webhook pour trigger à chaque run completed

**Option B : Scheduled Run**

1. Configure Apify pour run tous les lundis matin (par exemple)
2. Make récupère les résultats via l'API Apify

### 2.3 Créer le Scenario Make.com

**Aller sur** : <https://make.com>

**Créer un nouveau scenario** avec ces modules :

**Module 1 : Apify - Watch Task Runs**

- Connect ton compte Apify
- Select le task que tu viens de créer

**Module 2 : Apify - Get Dataset Items**

- Task Run ID : mappé depuis Module 1
- Format : JSON

**Module 3 : Iterator**

- Array : sortie du Module 2 (pour boucler sur chaque lead)

**Module 4 : Tools - Set Variables**

- Mapper les champs :
  - `nom_business` = title
  - `telephone` = phone
  - `adresse` = address
  - `url_gmaps` = url
  - `industrie` = (à détecter via keyword dans title, ou set manuellement)

**Module 5 : Twenty - Create a Record (via HTTP)**

Twenty n'a pas encore de module Make natif, donc tu passes par HTTP Request.

**Configuration HTTP Request** :

```
Method: POST
URL: https://[ton-instance-twenty].com/graphql
Headers:
  Content-Type: application/json
  Authorization: Bearer [TON_API_KEY]

Body (GraphQL):
{
  "query": "mutation CreatePerson($data: PersonCreateInput!) { createPerson(data: $data) { id firstName lastName phone email } }",
  "variables": {
    "data": {
      "firstName": "{{nom_business}}",
      "phone": "{{telephone}}",
      "companyId": "[ID_COMPANY_SI_APPLICABLE]"
    }
  }
}
```

**Note** : Remplace `[TON_API_KEY]` par ton API key Twenty (Settings → API Keys).

**Module 6 : Twenty - Update Custom Fields (via HTTP)**

Pour ajouter les champs custom (Canal, Industrie, etc.) :

```
Method: POST
URL: https://[ton-instance-twenty].com/graphql
Body:
{
  "query": "mutation UpdatePerson($id: ID!, $data: PersonUpdateInput!) { updatePerson(where: { id: $id }, data: $data) { id } }",
  "variables": {
    "data": {
      "canal": "Outbound",
      "industrie": "{{industrie}}",
      "sourceGoogleMaps": "{{url_gmaps}}"
    }
  }
}
```

**Sauvegarder et tester le scenario.**

---

## Étape 3 : Automatiser le Tracking d'Appels

### 3.1 Enregistrement Automatique avec Fireflies.ai

**Setup Fireflies** :

1. Créer compte sur <https://fireflies.ai>
2. Connecter ton système téléphonique :
   - Si tu utilises Zoom : connecte via intégration Zoom
   - Si tu utilises téléphone direct : utilise l'app mobile Fireflies
3. Configure pour auto-record tous les appels

**Intégration Fireflies → Make** :

Fireflies peut envoyer un webhook à Make après chaque appel.

1. Dans Fireflies : Settings → Integrations → Webhooks
2. Copie l'URL webhook Make (créée ci-dessous)
3. Configure pour trigger sur "Meeting Ended"

### 3.2 Scenario Make : Fireflies → Twenty

**Module 1 : Webhook - Custom Webhook**

- Créer un webhook et copier l'URL
- Coller dans Fireflies (étape précédente)

**Module 2 : Tools - Parse JSON**

- Parse le payload Fireflies pour extraire :
  - Transcript
  - Duration
  - Participant Name (si détectable)

**Module 3 : OpenAI - Create a Completion (Optional mais puissant)**

- Utiliser GPT-4 pour analyser le transcript et extraire :
  - Objection principale
  - Sentiment (Positif/Neutre/Négatif)
  - Next action recommandée

Prompt :

```
Analyse cette conversation de vente et extrais:
1. L'objection principale du prospect (si applicable)
2. Le sentiment général (Positif/Neutre/Négatif)
3. La prochaine action recommandée (Rappeler/Envoyer info/Démo à booker/Abandon)

Transcript:
{{transcript}}

Réponds en JSON:
{"objection": "...", "sentiment": "...", "next_action": "..."}
```

**Module 4 : Twenty - Update Person Record**

Update le contact dans Twenty avec :

- Objection Principale (depuis OpenAI ou manual)
- Dernière Interaction = today
- Notes = résumé de l'appel

---

## Étape 4 : Automatiser les Follow-ups

### 4.1 Scenario Make : Auto Follow-up Email/SMS

**Trigger** : Twenty - Watch Records (via polling ou webhook)

**Condition** : Si statut passe à "Intéressé - Follow-up Requis"

**Action** :

**Module 1 : Twenty - Get Record Details**

- Récupérer nom, email, téléphone du prospect

**Module 2 : Router (2 chemins)**

**Chemin A : Si Email disponible**

- **Gmail/SendGrid - Send Email**
- Template :

```
Subject: Suite à notre conversation

Salut {{firstName}},

Merci pour ton temps aujourd'hui. Comme discuté, voici le lien pour booker ta démo de 15 minutes :

[Lien Calendly]

Si tu as des questions d'ici là, n'hésite pas.

Kael
Uprising Studio
```

**Chemin B : Si Téléphone disponible**

- **Twilio - Send SMS**
- Template :

```
Salut {{firstName}}, c'est Kael d'Uprising. Voici le lien pour booker ta démo : [lien]. Des questions ? Réponds à ce texto.
```

**Module 3 : Twenty - Update Record**

- Ajouter note : "Follow-up envoyé le [date]"
- Update "Nombre Appels Faits" += 1

---

## Étape 5 : Dashboard Automatique de Métriques

### 5.1 Exporter Twenty → Google Sheets

**Scenario Make : Daily Export**

**Trigger** : Schedule (tous les jours à 18h)

**Module 1 : Twenty - List All Opportunities (via HTTP GraphQL)**

```
Method: POST
URL: https://[ton-instance-twenty].com/graphql
Body:
{
  "query": "query { opportunities { edges { node { id stage { name } person { firstName phone } createdAt } } } }"
}
```

**Module 2 : Iterator**

- Boucler sur chaque opportunity

**Module 3 : Google Sheets - Add a Row**

- Spreadsheet : "Uprising - Métriques Acquisition"
- Sheet : "Raw Data"
- Valeurs :
  - Column A : Date
  - Column B : Nom Prospect
  - Column C : Stage
  - Column D : Canal
  - Column E : Industrie
  - Column F : Objection

**Module 4 : Repeat pour toutes les opportunities**

### 5.2 Créer les Métriques dans Google Sheets

Dans ton Google Sheet, créer un onglet "Dashboard" avec ces formules :

**Taux de Connexion (Cold Calls)** :

```
=COUNTIF(Raw_Data!D:D,"Cold Call") / COUNTIF(Raw_Data!C:C,"Contacté")
```

**Taux de Démo Bookée** :

```
=COUNTIF(Raw_Data!C:C,"Démo Bookée") / COUNTIF(Raw_Data!C:C,"Intéressé")
```

**Taux de Close** :

```
=COUNTIF(Raw_Data!C:C,"Gagné") / COUNTIF(Raw_Data!C:C,"Démo Faite")
```

**Performance par Industrie** :

```
=COUNTIFS(Raw_Data!E:E,"Plomberie", Raw_Data!C:C,"Gagné")
```

### 5.3 Visualiser avec Google Data Studio (Optional)

1. Connecter Google Data Studio à ton Google Sheet
2. Créer graphiques :
   - Funnel de conversion (Lead → Contacté → Démo → Gagné)
   - Performance par Canal (Cold Call vs Guerrilla)
   - Taux de réponse par Industrie

---

## Étape 6 : Automatiser le Onboarding Client

### 6.1 Scenario Make : Gagné → Typeform Automatique

**Trigger** : Twenty - Watch Records
**Condition** : Statut = "Gagné"

**Module 1 : Twenty - Get Record Details**

**Module 2 : Gmail - Send Email**
Template :

```
Subject: Bienvenue chez Uprising Studio 🚀

Salut {{firstName}},

Félicitations ! On est excités de construire ton infrastructure d'acquisition.

Première étape : remplis ce formulaire (10 min max) pour qu'on ait toutes les infos nécessaires :
[Lien Typeform]

Dès que c'est fait, Xavier commence à builder ton setup.

Timeline : Launch dans 2 semaines.

Questions ? Réponds à cet email.

Kael
```

**Module 3 : Twenty - Add Note**

- "Email onboarding envoyé le [date]"

**Module 4 : Slack Notification (Optional)**

- Notifier Xavier : "Nouveau client closé : {{firstName}}, industry: {{industrie}}"

---

## Récap : Stack d'Automation Complète

| Outil | Fonction | Coût/mois |
|-------|----------|-----------|
| Twenty | CRM central | Gratuit (open-source) |
| Apify | Scraping Google Maps | $49 ou gratuit (manuel) |
| Make.com | Orchestration de tous les workflows | $9-29 |
| Fireflies.ai | Enregistrement + transcription appels | $10 |
| Twilio | SMS automatiques (optional) | Pay-as-you-go (~$5) |
| Google Sheets + Data Studio | Dashboard métriques | Gratuit |

**Total** : ~$70/mois pour automation complète

**Temps gagné** : 10-15h/semaine

---

## Ordre de Setup (Priorisation)

**Phase 1 (Cette semaine) - Les Essentiels** :

1. ✅ Configurer champs custom dans Twenty
2. ✅ Créer pipeline de ventes dans Twenty
3. ✅ Setup Apify scraping + injection manuelle dans Twenty (test avec 20-30 leads)
4. ✅ Installer Fireflies pour enregistrement d'appels

**Phase 2 (Semaine 2) - Automatisation de Base** :
5. ✅ Créer scenario Make : Apify → Twenty (automatiser injection)
6. ✅ Créer scenario Make : Auto follow-up email après changement de statut
7. ✅ Créer Google Sheet avec export quotidien

**Phase 3 (Semaine 3+) - Optimisations** :
8. ✅ Ajouter analyse GPT-4 des transcriptions d'appels
9. ✅ Setup Data Studio dashboard
10. ✅ Automatiser onboarding Typeform

---

## Checklist de Vérification

Avant de lancer Wave 1, vérifie :

- [ ] Twenty : Champs custom créés et visibles
- [ ] Twenty : Pipeline configuré avec 8 stages
- [ ] Apify : Premier scrape fait, 30 leads récupérés
- [ ] Make : Compte créé, API key Twenty configurée
- [ ] Make : Scenario Apify→Twenty testé avec succès sur 5 leads
- [ ] Fireflies : Compte créé, app installée
- [ ] Google Sheet : Template de tracking créé avec colonnes de base

Une fois tout coché, tu es prêt pour l'exécution massive.
