# 🧬 Uprising Studio — Base de Connaissance Interne

## Qui sommes-nous ?

**Uprising Studio** est une firme d'ingénierie digitale qui déploie des **infrastructures d'acquisition automatisées** pour les PME locales.

### Notre Mission
Éradiquer le pire cauchemar des entrepreneurs : **perdre de l'argent à cause d'un appel manqué ou d'un site qui ne convertit pas.**

### L'Anomalie
Nous sommes l'anomalie de 16 ans qui remplace le travail manuel par du code et de l'intelligence artificielle.

---

## 🏗️ La Trifecta — Notre Offre en 3 Piliers

### 1. 🖥️ La Vitrine (Le Site Web)
Une plateforme ultra-rapide (codée sur **Framer**) conçue **psychologiquement** pour capturer l'attention et convertir les visiteurs en prospects qualifiés.

- Design premium orienté conversion
- Vitesse de chargement < 2 secondes
- SEO local intégré
- Formulaires de capture optimisés

### 2. 📡 Le Trafic (Le Contenu)
Un système de distribution pour **dominer la recherche locale** et générer un flux constant de prospects entrants.

- Contenu SEO local optimisé
- Profil Google Business optimisé
- Stratégie de contenu récurrent
- Domination des mots-clés locaux

### 3. 🧠 Le Cerveau (L'IA de Xavier)
Un **assistant vocal opérationnel 24/7** qui :
- Répond au téléphone
- Qualifie le prospect
- Prend le rendez-vous

**Pendant que le patron est sur un chantier ou en train de dormir.**

---

## 🎯 ICP — Profil Client Idéal

| Métier | Exemples | Douleur principale |
|---|---|---|
| Plombier | Plomberie résidentielle/commerciale | Appels manqués = contrats perdus |
| Couvreur | Toitures, réparations | Site web inexistant ou vieux |
| Électricien | Résidentiel/commercial | Pas de présence en ligne |
| Entrepreneur général | Rénovations, constructions | Pas de système de capture |
| Paysagiste | Entretien, aménagement | Dépendance au bouche-à-oreille |

---

## 📞 Scripts de Cold Call

### Script Principal — Tous Métiers

```
Bonjour [Prénom], c'est Xavier d'Uprising Studio.

Je vous appelle parce que j'ai remarqué que [observation spécifique :
votre site web est un peu daté / vous n'avez pas de site web /
vos avis Google pourraient être mieux mis en valeur].

On travaille avec des [plombiers/couvreurs/etc.] dans la région
de [ville] pour s'assurer qu'ils ne perdent plus jamais un appel
d'un client potentiel.

Est-ce que ça vous arrive de manquer des appels pendant
que vous êtes sur un chantier ?

[ÉCOUTER]

C'est exactement pour ça qu'on a développé notre système.
On installe un assistant IA qui répond 24/7, qualifie le prospect
et vous prend les rendez-vous automatiquement.

Est-ce que vous auriez 15 minutes cette semaine pour que je
vous montre comment ça marche ?
```

### Variante — Plombier (urgence)

```
Ajout après l'observation :
"Quand quelqu'un a un dégât d'eau à 2h du matin et que ça tombe
sur la boîte vocale, il appelle le suivant sur Google.
Notre IA répond immédiatement et bloque le rendez-vous pour vous."
```

### Variante — Couvreur (saisonnalité)

```
Ajout après l'observation :
"La saison des toitures, c'est maintenant. Chaque appel manqué,
c'est potentiellement un contrat de 15 000$ qui va chez le
concurrent. Notre système s'assure que ça n'arrive plus."
```

### Variante — Entrepreneur Général (projets longs)

```
Ajout après l'observation :
"Quand vous êtes sur un chantier pendant 3 mois, vous ne pouvez
pas répondre à chaque appel. Notre IA filtre les vrais prospects
des vendeurs et vous envoie seulement les opportunités qualifiées."
```

---

## 🔑 Accès & Identifiants

> ⚠️ **SÉCURITÉ** : Ne jamais stocker de vrais mots de passe dans ce fichier.
> Utiliser un gestionnaire de mots de passe (1Password, Bitwarden).

| Service | URL | Notes |
|---|---|---|
| **Stripe** | https://dashboard.stripe.com | Facturation clients |
| **Apify** | https://console.apify.com | Scraping Google Reviews |
| **Framer** | https://framer.com | Création des sites clients |
| **Uprising CRM** | http://localhost:3001 | Ce CRM (Twenty fork) |
| **Ollama** | http://localhost:11434 | LLM local |
| **Browserless** | ws://localhost:3333 | Navigateur headless |

---

## 📋 Onboarding Client

**Typeform d'Onboarding** : `[INSÉRER LIEN TYPEFORM ICI]`

### Processus d'Onboarding
1. Client remplit le Typeform
2. Données importées dans Uprising CRM (CSV/Excel)
3. Score Apify calculé (avis Google + état du site)
4. Système téléphonique actuel identifié
5. Rendez-vous de kickoff planifié via Google Calendar
6. Installation de l'IA vocale

---

## 🏗️ Architecture Technique

```
┌──────────────────────────────────────────┐
│           UPRISING CRM (Twenty)          │
│                                          │
│  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │ Contacts │  │ Sociétés │  │ Deals  │ │
│  └──────────┘  └──────────┘  └────────┘ │
│                                          │
│  ┌──────────────────────────────────────┐│
│  │        Outils AI Agent              ││
│  │  • HTTP Tool (API calls)            ││
│  │  • Browser Tool (scraping)          ││
│  │  • Email Tool (prospection)         ││
│  │  • Code Interpreter                 ││
│  └──────────────────────────────────────┘│
└──────────────┬───────────────────────────┘
               │
    ┌──────────┼──────────┐
    ▼          ▼          ▼
┌────────┐ ┌────────┐ ┌────────────┐
│ Ollama │ │Browser-│ │   SMTP     │
│ (LLM)  │ │ less   │ │  (Email)   │
└────────┘ └────────┘ └────────────┘
```
