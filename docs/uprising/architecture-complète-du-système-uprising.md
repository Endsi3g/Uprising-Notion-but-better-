# Architecture complète du système Uprising

## Vue d'ensemble : La Machine d'Acquisition

```
┌─────────────────────────────────────────────────────────────────┐
│                     APIFY (Scraping Engine)                      │
│  Google Maps → Filtrage par industrie/zone → Export leads        │
└──────────────────────────┬──────────────────────────────────────┘
                           │ (Webhook ou API)
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                     MAKE.COM (Orchestration)                     │
│  • Template 1: Apify → Twenty (injection auto)                  │
│  • Template 2: Stage change → Follow-up email                   │
│  • Template 3: Daily export → Google Sheets                     │
│  • Template 4: Fireflies → Analysis → Twenty                    │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                   TWENTY CRM (Centre de Contrôle)                │
│                                                                   │
│  Pipeline :                                                       │
│  Lead Froid → Contacté → Intéressé → Démo Bookée → Démo Faite   │
│  → Négociation → Gagné / Perdu                                   │
│                                                                   │
│  Champs Custom :                                                  │
│  • Canal (Cold Call / Guerrilla)                                 │
│  • Script Utilisé (Platten / Daniel G)                           │
│  • Industrie (5 industries ciblées)                              │
│  • Objection Principale                                          │
│  • Taille Entreprise                                             │
│                                                                   │
│  Webhooks → Déclenchement auto vers Make                         │
└───────┬───────────────────────────┬─────────────────────────────┘
        │                           │
        │                           │
        ▼                           ▼
┌──────────────────┐      ┌──────────────────────────────────────┐
│  FIREFLIES.AI    │      │     GOOGLE SHEETS + DATA STUDIO      │
│                  │      │                                        │
│  • Enregistre    │      │  • Dashboard métriques quotidiennes   │
│    tous appels   │      │  • Taux de conversion par canal       │
│  • Transcription │      │  • Performance par industrie          │
│  • Analyse auto  │      │  • Graphiques de funnel               │
│    via GPT-4     │      │                                        │
└──────────────────┘      └────────────────────────────────────────┘
```

---

## Flux de Données : Du Lead au Client

### 1. Acquisition du Lead

```
Apify scrape Google Maps
    ↓
Make reçoit le lead
    ↓
Make vérifie si existe déjà (query Twenty par téléphone)
    ↓
Si nouveau : Créer Person + Opportunity dans Twenty
    ↓
Stage initial : "Lead Froid"
```

### 2. Exécution Outbound (Manuel)

```
Kael ouvre Twenty → Filtre "Lead Froid" par industrie
    ↓
Cold Call (Fireflies enregistre en background)
    ↓
Kael update le statut dans Twenty :
  - Contacté (si connexion établie)
  - Intéressé (si positif)
  - Pas Intéressé (si refus)
    ↓
Ajoute note avec objection/réaction
```

### 3. Follow-up Automatique (Automation)

```
Twenty webhook détecte changement de stage → "Intéressé"
    ↓
Make reçoit le webhook
    ↓
Make envoie email automatique avec lien Calendly
    ↓
Make ajoute note dans Twenty : "Follow-up envoyé le [date]"
```

### 4. Analyse Post-Appel (Automation)

```
Fireflies termine enregistrement d'appel
    ↓
Fireflies webhook → Make
    ↓
Make envoie transcript à GPT-4 pour analyse
    ↓
GPT-4 retourne : Objection + Sentiment + Next Action
    ↓
Make update Twenty avec ces insights
```

### 5. Dashboard Quotidien (Automation)

```
Schedule Make : Tous les jours 18h
    ↓
Make query Twenty : Récupérer toutes les opportunities
    ↓
Pour chaque opp : Exporter vers Google Sheets
    ↓
Google Sheets calcule automatiquement :
  - Taux de connexion
  - Taux de conversion
  - Performance par canal/industrie
```

---

## Points d'Interaction Humaine vs. Automatisés

### ✋ Humain Requis (Impossible à automatiser)

1. **Cold Calls** : La conversation, la conviction, l'adaptation en temps réel
2. **Guerrilla Visits** : Présence physique, démo en personne
3. **Démos Zoom** : Présentation personnalisée, gestion d'objections
4. **Décisions stratégiques** : Analyser les patterns, ajuster l'approche

### 🤖 Automatisé (Zéro intervention)

1. **Scraping de leads** : Apify tourne en background
2. **Injection dans CRM** : Make injecte automatiquement
3. **Follow-up emails** : Envoyés dès qu'un lead devient chaud
4. **Enregistrement d'appels** : Fireflies record tout
5. **Analyse de transcripts** : GPT-4 extrait les insights
6. **Dashboard metrics** : Google Sheets update quotidien
7. **Détection de doublons** : Make vérifie avant création

---

## Outils et Coûts Mensuels

| Outil | Fonction | Plan | Coût/mois |
|-------|----------|------|-----------|
| **Twenty** | CRM central | Self-hosted | $0 (open-source) |
| **Make.com** | Automation hub | Free tier → Pro | $0 → $29 |
| **Apify** | Scraping Google Maps | Pay-as-you-go | $0 → $49 |
| **Fireflies.ai** | Call recording | Pro | $10 |
| **OpenAI API** | GPT-4 analysis (optional) | Pay-per-use | ~$5-10 |
| **Google Sheets** | Dashboard | Free | $0 |
| **Twilio** | SMS (optional) | Pay-per-SMS | ~$5 |

**Total Lean Stack** : $10-15/mois (Twenty + Fireflies + Make free tier)

**Total Full Stack** : $70-100/mois (avec Apify + Make Pro + GPT-4)

---

## Metrics Trackées Automatiquement

### Metrics d'Activité

- Nombre de cold calls passés (par jour/semaine/mois)
- Nombre de visites guerrilla faites
- Nombre de démos livrées
- Temps moyen par appel (via Fireflies)

### Metrics de Conversion

- **Taux de connexion** : Appels aboutis / Total appels
- **Taux d'intérêt** : Intéressés / Contactés
- **Taux de démo bookée** : Démos / Intéressés
- **Taux de close** : Gagnés / Démos faites

### Metrics de Performance

- **Performance par canal** : Cold Call vs. Guerrilla
- **Performance par script** : Platten vs. Daniel G
- **Performance par industrie** : Quelle niche convertit le mieux
- **Objections les plus fréquentes** : Top 5 reasons de refus

### Metrics Business

- **MRR ajouté** : Montant récurrent mensuel des nouveaux clients
- **Setup fees collectés** : One-time revenue
- **CAC (Customer Acquisition Cost)** : Temps investi / Clients closés
- **Pipeline value** : Valeur totale des opportunités en cours

---

## Roadmap d'Automatisation

### Phase 1 : Essentials (Semaine 1)
✅ Twenty configuré avec champs + pipeline
✅ Template Make #1 : Apify → Twenty
✅ Fireflies installé et enregistrement actif

**Output** : Leads auto-injectés, appels enregistrés

---

### Phase 2 : Follow-ups (Semaine 2)
✅ Template Make #2 : Auto follow-up emails
✅ Template Make #3 : Daily export Google Sheets

**Output** : Follow-ups automatiques, visibilité metrics quotidienne

---

### Phase 3 : Intelligence (Semaine 3+)
✅ Template Make #4 : Fireflies + GPT-4 analysis
✅ Data Studio dashboard avec visualisations
✅ SMS automation (Twilio) pour prospects chauds

**Output** : Insights IA sur chaque appel, dashboard visuel, multi-canal

---

## Success Looks Like

**Après 2 semaines d'automation** :

- ✅ 150+ leads injectés automatiquement dans Twenty
- ✅ Zéro saisie manuelle de données
- ✅ Tous les appels enregistrés et analysés
- ✅ Follow-ups envoyés sans y penser
- ✅ Dashboard avec tous les chiffres clés visible en 1 clic
- ✅ 10-15h/semaine gagnées pour exécuter plus d'appels

**ROI de l'automation** :

- Temps gagné : 10-15h/semaine = ~50h/mois
- Si 1h vaut $100 (valeur de ton temps) = $5000/mois économisés
- Coût automation : $70/mois
- ROI : 7000% 🚀

L'automation ne remplace pas l'exécution. Elle la multiplie.