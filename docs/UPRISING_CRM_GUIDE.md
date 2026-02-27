# Guide d'adaptation de Twenty CRM pour Uprising Studio

L'adaptation de Twenty CRM pour votre agence **Uprising Studio** est un processus structuré qui transformera ce CRM open-source en un outil parfaitement adapté à vos services de création web et de contenu.

---

## Étape 1 : Configuration initiale du workspace

Commencez par configurer votre environnement de travail Twenty selon vos besoins spécifiques :

- **Email :** Connectez votre boîte mail (Google/Microsoft) sous `Paramètres → Comptes` pour synchroniser automatiquement vos communications avec vos clients.
- **Nommage :** Personnalisez le nom du workspace à "Uprising Studio" dans les paramètres.
- **Branding :** Configurez l'image de marque en ajoutant votre logo dans les paramètres du workspace.

---

## Étape 2 : Personnalisation du modèle de données

Adaptez les objets standards aux besoins de votre agence sous `Paramètres → Data Model` :

### Objet "People" (Clients/Prospects)
Ajoutez les champs personnalisés suivants :
- **Client Type** *(Select)* : Prospect, Client Actif, Ancien Client, Partenaire
- **Services Interested In** *(Multi-Select)* : Web Design, Content Creation, SEO, Brand Development
- **Budget Range** *(Select)* : <5K$, 5-10K$, 10-25K$, 25K$+
- **Lead Source** *(Select)* : Outreach, Referral, Website, LinkedIn, Networking

### Objet "Companies" (Entreprises)
Ajoutez les champs personnalisés suivants :
- **Industry** *(Select)* : Construction, Restaurant, Services Professionnels, E-commerce, etc.
- **Website Status** *(Select)* : Aucun, Outdated, Needs Refresh, Modern
- **Company Size** *(Select)* : Solo, 2-10, 11-50, 50+
- **Decision Maker Role** *(Text)* : Pour identifier le contact principal

### Objet "Opportunities" → "Projets"
*Renommez cet objet en "Projets" pour refléter votre terminologie.*
Ajoutez les champs personnalisés suivants :
- **Project Type** *(Select)* : Site Web, Vidéo, Branding, SEO, Package Complet
- **Deliverables** *(Multi-Select)* : Design Mockups, Site Live, Video Edit, Content Calendar
- **Technology Stack** *(Multi-Select)* : Framer, WordPress, Next.js, React
- **Project Phase** *(Select)* : Discovery, Design, Development, Content, Review, Launch
- **Estimated Hours** *(Number)*
- **Actual Hours** *(Number)*

---

## Étape 3 : Création d'objets custom spécifiques

Créez des objets personnalisés pour gérer au mieux votre agence :

### Objet "Contrats"
Champs à créer :
- **Contract ID** *(ID automatique)*
- **Client** *(Relation → Companies)*
- **Service Type** *(Select)*
- **Contract Value** *(Currency)*
- **Start Date / End Date** *(Date)*
- **Payment Terms** *(Select)* : 50/50, Monthly, Milestone-based
- **Status** *(Select)* : Draft, Signed, Active, Completed
- **Contract Document** *(Files)*

### Objet "Content Assets"
Champs à créer :
- **Asset Name** *(Title)*
- **Project** *(Relation → Projets)*
- **Asset Type** *(Select)* : Video, Image, Copy, Design
- **File/Link** *(URL)*
- **Creation Date** *(Date)*
- **Status** *(Select)* : Draft, In Review, Approved, Published
- **Notes** *(Rich Text)*

### Objet "Lead Outreach"
Champs à créer :
- **Company Name** *(Relation → Companies)*
- **Outreach Date** *(Date)*
- **Channel** *(Select)* : Email, LinkedIn, Cold Call, Referral
- **Message Template Used** *(Text)*
- **Response Status** *(Select)* : No Response, Positive, Negative, Follow-up Needed
- **Next Action Date** *(Date)*
- **Notes** *(Rich Text)*

---

## Étape 4 : Configuration des vues et pipelines

Créez des vues spécialisées pour différents workflows dans l'interface :

### Vue "Pipeline de Vente" (Kanban)
- **Colonnes :** Lead → Qualified → Proposal Sent → Negotiation → Won/Lost
- **Filtres :** Montrer uniquement les projets actifs
- **Tri :** Par date de création (plus récent en premier)

### Vue "Projets Actifs" (Board groupé)
- **Grouper par :** Project Phase
- **Filtres :** Status = Active
- **Afficher :** Client, Type, Deadline, Assigned To

### Vue "Outreach Cette Semaine" (List)
- **Filtres :** Next Action Date = Cette semaine
- **Colonnes :** Company, Last Contact, Response Status, Next Action
- **Tri :** Par Next Action Date

---

## Étape 5 : Automation avec Workflows

Configurez des automations pour gagner du temps :

**Workflow 1: Nouveau Lead Qualification**
- **Trigger :** Nouveau contact créé
- **Actions :**
  1. Si Email contient domaine d'entreprise → Tag "Qualified"
  2. Créer tâche "First Contact" assignée au SDR
  3. Envoyer email de bienvenue personnalisé
  4. Planifier rappel dans 3 jours si pas de réponse

**Workflow 2: Gestion de Projet**
- **Trigger :** Projet passe à "Design Phase"
- **Actions :**
  1. Créer tâches checklist : Moodboard, Wireframes, Design Mockups
  2. Assigner au designer
  3. Notifier le client par email
  4. Créer événement Google Meet pour design review

**Workflow 3: Follow-up Automatique**
- **Trigger :** Proposal envoyée depuis 7 jours
- **Condition :** Status = "Proposal Sent" AND pas de réponse
- **Actions :**
  1. Créer tâche "Follow-up call"
  2. Envoyer email de relance personnalisé
  3. Notifier le commercial assigné

---

## Étape 6 : Import de vos données existantes

Migrez vos données actuelles vers Twenty.

**Préparation des fichiers CSV :**
1. Téléchargez les templates CSV depuis Twenty (`Cmd/Ctrl + K` → Import).
2. Formatez vos données clients selon le template.
3. Nettoyez les doublons (emails identiques, domaines identiques).
4. Limitez à 10 000 lignes par fichier.
5. Importez dans cet ordre : **Companies** → **People** → **Projets** → **Contracts**.

**Bonnes pratiques d'import :**
- Testez d'abord avec 10-20 lignes pour valider le format.
- Corrigez les erreurs signalées en jaune avant de finaliser l'import.
- Vérifiez les relations entre objets après import.

---

## Étape 7 : Configuration des dashboards

Créez des tableaux de bord personnalisés pour votre agence :

### Dashboard "Vue d'ensemble Agence"
- **Chart:** Projets par Status *(Pie chart)*
- **Chart:** Revenue par Type de Service *(Bar chart)*
- **Chart:** Pipeline Value par Stage *(Funnel)*
- **Metric:** Projets actifs ce mois
- **Metric:** Revenue généré ce mois
- **List:** Prochaines deadlines (7 jours)

### Dashboard "Sales Performance"
- **Chart:** Leads captés par semaine *(Line chart)*
- **Chart:** Conversion rate par source *(Bar chart)*
- **Metric:** Taux de conversion Lead → Client
- **Metric:** Temps moyen pour closer
- **List:** Deals chauds (>5K$, stage avancé)

### Dashboard "Operations"
- **Chart:** Projets par phase *(Kanban view)*
- **Chart:** Heures estimées vs actuelles *(Comparison)*
- **Metric:** Projets en retard
- **Metric:** Utilisation d'équipe (%)
- **List:** Blockers et issues

---

## Étape 8 : Intégrations techniques

Connectez Twenty à vos outils existants :

**Google Workspace :**
- Gmail/Calendar déjà configuré
- Google Drive : Liez les documents via des champs URL
- Google Sheets : Export manuel ou via API

**Outils de communication :**
- Slack : Notifications pour nouveaux leads, projets won
- Discord : Webhooks pour updates d'équipe

**Outils de design/dev :**
- Framer : Liez vos projets via un URL custom field
- GitHub : Intégration via Zapier ou webhooks Twenty
- Vercel : Webhooks pour deployments

**Automation avancée :**
- Zapier/Make : Connectez Twenty à 3000+ apps
- API Twenty : GraphQL pour des intégrations sur-mesure
- Webhooks : Événements temps réel vers vos systèmes

---

## Étape 9 : Formation de l'équipe

Préparez votre équipe à utiliser Twenty :

**Documentation interne :**
- Créez un guide Notion/Google Doc avec des captures d'écran.
- Filmez de courtes vidéos tutoriels pour les workflows clés.
- Documentez les conventions de nommage et les tags.

**Sessions de formation :**
- **Session 1 (1h) :** Navigation, création de contacts et d'entreprises.
- **Session 2 (1h) :** Gestion de projets, tâches, pipeline de vente.
- **Session 3 (30min) :** Analyse avec les dashboards, rapports, exports.

**Bonnes pratiques d'adoption :**
- Commencez avec 1 ou 2 workflows simples.
- Ajoutez de la complexité progressivement.
- Récoltez du feedback hebdomadaire et ajustez selon les besoins réels de l'équipe.

---

## Étape 10 : Optimisation continue

Affinez votre CRM au fil du temps :

**Révision mensuelle :**
- Quels workflows sont utilisés vs. ignorés ?
- Quelles données manquent le plus souvent dans les fiches client ?
- Quels nouveaux rapports seraient utiles ?
- Analyse de performance : temps pour closer, conversion rates.

**Ajustements réguliers :**
- Ajoutez de nouveaux champs personnalisés au gré des besoins émergents.
- Créez de nouvelles vues pour des cas d'usage spécifiques (ex: Campagne Black Friday).
- Automatisez les nouvelles tâches répétitives identifiées par l'équipe.
- Documentez toujours chaque modification pour l'équipe.

---

### Pourquoi cette configuration est cruciale pour Uprising Studio :

Cette approche stratégique apportera à votre agence digitale :
- **Visibilité complète :** Tous vos prospects, clients et projets au sein d'un espace unique.
- **Gain de temps massif :** Automatisation des follow-ups, création de tâches contextuelles, et envois d'emails ciblés.
- **Meilleure conversion :** Grâce à un pipeline structuré pour éviter tout lead oublié.
- **Collaboration temps réel :** Toute l'équipe dispose d'une source unique de vérité et peut éditer les données simultanément.
- **Scalabilité illimitée :** Vous pouvez ajouter autant d'objets, de champs et d'utilisateurs que la croissance de l'agence l'exige.
- **Souveraineté des données :** Le code est open-source et hébergé sous votre contrôle, ce qui élimine les verrous fournisseurs (vendor lock-in) et réduit vos marges d'infrastructure.

*Avec ces fondations, Twenty ne sera plus un CRM standard, mais le moteur de croissance sur mesure d'Uprising Studio.*
