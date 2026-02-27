# Automatisation de l'acquisition

## Ce qui PEUT être automatisé (Quick Wins)

### 1. Scraping et injection de leads dans Twenty

**Outil** : Apify + Twenty API

**Workflow** :

1. Apify scrape Google Maps pour ta zone (Repentigny, Terrebonne, Laval, Est MTL)
2. Filtre par industrie (plomberie, nettoyage, électricité, toiture, paysagiste)
3. Exporte en CSV avec : nom business, téléphone, adresse, industrie, nombre d'avis Google
4. Make.com ou Zapier prend le CSV et inject automatiquement dans Twenty avec statut "Lead Froid"

**Temps gagné** : 2-3h de saisie manuelle par semaine

**Setup** :

- Template Apify pour Google Maps scraping (existe déjà)
- Connexion Twenty API (webhook ou intégration directe)
- Make scenario : CSV → Parse → Twenty Create Record

---

### 2. Enregistrement automatique des appels

**Outil** : Fireflies.ai (gratuit pour 3 meetings/mois, $10/mois pour illimité)

**Workflow** :

1. Fireflies s'intègre à ton téléphone ou logiciel d'appel
2. Enregistre automatiquement chaque call
3. Génère transcription + résumé IA
4. Identifie automatiquement les objections et questions clés

**Temps gagné** : Pas besoin de prendre des notes pendant l'appel, focus à 100% sur la conversation

**Setup** :

- Install Fireflies app
- Connect à ton système d'appel
- Configure pour auto-record

---

### 3. Follow-up automatique post-appel

**Outil** : Make.com + Twenty + Email/SMS

**Workflow** :

1. Après chaque appel, tu updates le statut dans Twenty ("Intéressé - Follow-up", "Démo Bookée", "Pas Intéressé")
2. Make surveille les changements de statut
3. Envoie automatiquement :

- Email de confirmation si démo bookée (avec lien Calendly)
- SMS de follow-up si intéressé mais pas encore booké ("Salut [Nom], comme discuté, voici le lien pour choisir ton créneau...")
- Rien si pas intéressé

**Temps gagné** : 30min-1h de follow-ups manuels par jour

**Setup** :

- Make scenario : Twenty Webhook → Check Status → Send Email/SMS
- Templates d'email/SMS pré-écrits avec variables dynamiques

---

### 4. Préparation automatique de l'appel

**Outil** : Make.com + Google/LinkedIn

**Workflow** :

1. Avant d'appeler, tu cliques sur le contact dans Twenty
2. Make récupère automatiquement :

- Leur site web
- Profil LinkedIn du propriétaire
- Derniers avis Google (pour identifier pain points)
1. Affiche un "briefing card" avec info clé

**Temps gagné** : 5min de recherche par prospect x 50 appels = 4h

**Setup** :

- Make scenario avec API Google/LinkedIn
- Interface simple (peut être un Google Doc auto-généré)

---

### 5. Tracking automatique des métriques

**Outil** : Twenty + Google Sheets + Data Studio (gratuit)

**Workflow** :

1. Twenty log tous les appels avec outcome
2. Make exporte automatiquement les données vers Google Sheets chaque soir
3. Google Sheets calcule :

- Taux de connexion par script
- Taux de démo bookée par industrie
- Taux de close par canal
1. Data Studio génère dashboard visuel en temps réel

**Temps gagné** : Pas besoin d'analyser manuellement, tu vois les patterns instantanément

**Setup** :

- Make scenario : Twenty → Google Sheets (daily export)
- Google Sheets avec formules pré-configurées
- Data Studio dashboard connecté au Sheet

---

## Ce qui NE PEUT PAS être automatisé (Humain requis)

### Cold Calls

Tu ne peux pas automatiser la conversation. Les robocalls sont morts et détestés. Ta voix humaine + conviction = ton avantage compétitif.

**Ce que tu peux optimiser** :

- Avoir le script sous les yeux
- Enregistrer pour s'améliorer
- Utiliser un dialer (Aircall, CallHippo) pour enchaîner les appels sans composer manuellement

---

### Prospection En Personne (Guerrilla)

Impossible à automatiser. C'est le canal le plus physique et le plus humain.

**Ce que tu peux optimiser** :

- Préparer l'itinéraire optimal (Google Maps avec toutes les adresses)
- Avoir la démo IA prête sur ton téléphone (1 tap pour lancer)
- Créer un pitch de 60 secondes ultra-rodé

---

### Démos

Les démos doivent être live et personnalisées. C'est là que tu closes.

**Ce que tu peux optimiser** :

- Template de démo avec slides pré-faits (Pitch deck dans Notion ou PowerPoint)
- Démo live de l'agent IA avec numéro de test pré-configuré
- Document de proposition automatiquement généré après la démo (Make.com peut remplir un template avec leurs infos)

---

## Ordre de priorité pour l'automation

**Semaine 1 (Minimum Viable)** :

1. Scraping Apify → Twenty (automatise la génération de leads)
2. Enregistrement des appels (Fireflies ou fonction téléphone native)

**Semaine 2 (Si ça roule)** :
3. Follow-up automatique post-appel
4. Tracking automatique des métriques

**Semaine 3+ (Nice to have)** :
5. Préparation automatique de l'appel

---

## Coût total de la stack automation

- Apify : $49/mois (ou scrape manuel gratuit au début)
- Make.com : $9/mois (Free tier peut suffire au début)
- Fireflies.ai : $10/mois
- Twenty : Open-source, hébergé par toi = gratuit
- Google Sheets/Data Studio : Gratuit

**Total** : ~$70/mois pour automatisation complète (ou $10/mois si tu commences lean avec juste Make + Fireflies)
