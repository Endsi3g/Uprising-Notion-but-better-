# Plan

## Constraint actuel

**Pas de boucle de feedback systématique pour identifier ce qui convertit.**

L'infrastructure est prête, l'action est lancée, mais sans tracking chirurgical pour apprendre ce qui marche. Risque de brûler la liste locale (finie) sans apprendre, ou de closer quelques clients sans pouvoir répliquer parce qu'on ne sait pas ce qui a causé le succès.

## Phase actuelle : Identifier le playbook d'acquisition gagnant

**Objectif** : Transformer l'exécution outbound en intelligence reproductible à travers un tracking rigoureux.

**Critères de complétion** :

- 100+ contacts outbound trackés (cold calls + prospection en personne)
- Taux de connexion et taux de démo bookée calculés par script et canal
- Minimum 5 démos live livrées
- Minimum 2 nouveaux clients payants closés
- Playbook "ce qui fonctionne" documenté et prêt à scaler

### Tâches

**1. Préparer l'infrastructure d'acquisition et automatisation**

- [ ] Configurer Twenty :
  - Ajouter champs custom : Canal, Script Utilisé, Industrie, Objection Principale, Taille Entreprise, Source Google Maps
  - Créer pipeline avec 8 stages : Lead Froid → Contacté → Intéressé → Démo Bookée → Démo Faite → Négociation → Gagné/Perdu
  - Générer API key (Settings → Developers → API Keys)
- [ ] Setup APIs et credentials :
  - Créer compte Apify, récupérer API token
  - Installer Fireflies.ai pour enregistrement d'appels
  - Setup Gmail App Password pour auto follow-ups
  - Créer Google Service Account pour Sheets export (optional)
- [ ] Xavier : Coder les scripts d'automation (Node.js) :
  - `apify-to-twenty.js` - Scraping → injection automatique leads
  - `follow-up-engine.js` - Auto follow-up emails quand stage = "Intéressé"
  - `metrics-exporter.js` - Export quotidien vers Google Sheets (optional)
  - `call-analyzer.js` - Webhook Fireflies + analyse GPT-4 (optional)
- [ ] Déployer scripts sur Railway/Render/VPS avec cron jobs
- [ ] Tester avec 10-20 leads de test
- [ ] Préparer routine pré-session : relire témoignages Clenar + autres cas pour état d'esprit de conviction

**2. Scraper et segmenter la target list**

- [ ] Utiliser Apify pour scraper Google Maps : 150 prospects (30 par industrie : nettoyage, plomberie, électricité, toiture, paysagiste)
- [ ] Zone : Repentigny, Terrebonne, Laval, Est de Montréal
- [ ] Filtrer par taille : prioriser 1-5 employés (plus vulnérables aux appels manqués)
- [ ] Automatiser injection dans Twenty via API ou import CSV avec champs pré-remplis
- [ ] Créer liste "Cibles Guerrilla" : 20 businesses physiques accessibles pour démos en personne

**3. Exécuter Wave 1 Cold Calls (50 appels)**

- [ ] 25 appels avec Script Platten (Direct/Capacité)
- [ ] 25 appels avec Script Daniel G (Anti-Vendeur)
- [ ] Timing optimal : 9h-11h30 (avant chantier) ou 16h-17h30 (retour de chantier)
- [ ] Logger TOUT dans Twenty : script utilisé, industrie, durée, objection, outcome
- [ ] Enregistrer minimum 10 appels pour analyse post-mortem

**4. Exécuter Wave 1 Prospection En Personne (10 visites)**

- [ ] Sélectionner 10 cibles de la liste "Cibles Guerrilla" (commerces avec bureau/réception accessible)
- [ ] Préparer kit physique : téléphone chargé, démo IA prête à lancer, carte de visite
- [ ] Exécuter : entrer, approche directe "Je suis local, 2 minutes pour vous montrer quelque chose", lancer démo live
- [ ] Logger dans Twenty : réaction, objection, outcome, follow-up nécessaire
- [ ] Noter : qui a autorité de décision sur place vs. qui doit escalader

**5. Analyser Wave 1 (après 2-3 jours)**

- [ ] Calculer métriques cold calls : taux de connexion, taux de démo bookée par script
- [ ] Calculer métriques en personne : taux de réception positive, taux de démo bookée
- [ ] Identifier patterns : quel script/canal résonne par industrie, objections récurrentes
- [ ] Écouter 5-10 enregistrements d'appels : où perds-tu le prospect, où gagnes-tu l'intérêt
- [ ] Créer document "Learnings Wave 1" avec insights actionnables

**6. Exécuter Wave 2 (50 contacts mixtes)**

- [ ] Doubler sur le canal + script gagnant de Wave 1
- [ ] Cold calls : 40 appels avec script optimisé basé sur learnings
- [ ] En personne : 10 visites avec approche raffinée
- [ ] Logger tout, continuer enregistrements

**6. Livrer démos avec tracking structuré**

- [ ] Pour chaque démo : logger objections, signaux d'achat, points de friction
- [ ] Identifier ce qui génère l'excitation vs. ce qui tue le deal
- [ ] Tracker l'outcome dans Twenty

**7. Closer les 2 premiers clients**

- [ ] Documenter le chemin exact : canal → message → touches → objections → close
- [ ] Capturer ce qui a scellé le deal

**8. Compiler le Playbook d'Acquisition v1**

- [ ] Synthétiser : canal gagnant, message gagnant, meilleures industries
- [ ] Documenter : objections communes + réponses, touches moyennes pour closer
- [ ] Output : manuel de scaling

## Phases futures (directionnelles)

**Phase 2** : Systématiser la delivery client

- Une fois le playbook validé, le constraint devient la capacité de delivery
- Créer templates pour onboarding, builds de sites, setup d'agents IA, workflows de contenu
- Objectif : réduire time-to-live pour nouveaux clients à moins de 2 semaines

**Phase 3** : Scaler le volume d'acquisition

- Avec playbook prouvé + capacité de delivery, augmenter le volume outbound
- Lancer le moteur inbound "Build in Public"
- Viser 10+ clients dans le pipeline simultanément
