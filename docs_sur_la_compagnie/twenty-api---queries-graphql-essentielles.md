# Twenty API - Queries GraphQL essentielles

## Setup : Obtenir ton API Key

1. Dans Twenty : Settings → Developers → API Keys
2. Créer une nouvelle API key
3. Copier la key (format : `sk_...`)
4. Utiliser dans tous tes calls avec header : `Authorization: Bearer sk_...`

**Endpoint GraphQL** : `https://[ton-instance].twenty.com/graphql`

---

## 1. Créer un Nouveau Lead (Person)

### Query GraphQL

```graphql
mutation CreatePerson($data: PersonCreateInput!) {
  createPerson(data: $data) {
    id
    firstName
    lastName
    phone
    email
    createdAt
  }
}
```

### Variables

```json
{
  "data": {
    "firstName": "Jean",
    "lastName": "Tremblay",
    "phone": "+15141234567",
    "email": "jean@plomberietremblay.com"
  }
}
```

### Exemple cURL (pour tester)

```bash
curl -X POST https://[ton-instance].twenty.com/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk_YOUR_API_KEY" \
  -d '{
    "query": "mutation CreatePerson($data: PersonCreateInput!) { createPerson(data: $data) { id firstName phone } }",
    "variables": {
      "data": {
        "firstName": "Jean Tremblay",
        "phone": "+15141234567"
      }
    }
  }'
```

---

## 2. Créer une Opportunité (Deal)

### Query GraphQL

```graphql
mutation CreateOpportunity($data: OpportunityCreateInput!) {
  createOpportunity(data: $data) {
    id
    name
    amount
    stage {
      id
      name
    }
    person {
      id
      firstName
    }
  }
}
```

### Variables

```json
{
  "data": {
    "name": "Plomberie Tremblay - Trifecta",
    "amount": 3500,
    "stageId": "[ID_DU_STAGE_LEAD_FROID]",
    "personId": "[ID_DE_LA_PERSONNE]"
  }
}
```

---

## 3. Mettre à Jour un Lead (Changer de Stage)

### Query GraphQL

```graphql
mutation UpdateOpportunity($id: ID!, $data: OpportunityUpdateInput!) {
  updateOpportunity(where: { id: $id }, data: $data) {
    id
    stage {
      name
    }
  }
}
```

### Variables

```json
{
  "id": "[ID_OPPORTUNITY]",
  "data": {
    "stageId": "[ID_STAGE_DEMO_BOOKEE]"
  }
}
```

---

## 4. Ajouter des Champs Custom à un Lead

**Note** : Les champs custom doivent d'abord être créés dans l'UI de Twenty.

### Query GraphQL

```graphql
mutation UpdatePerson($id: ID!, $data: PersonUpdateInput!) {
  updatePerson(where: { id: $id }, data: $data) {
    id
    customFields {
      canal
      scriptUtilise
      industrie
      objectionPrincipale
    }
  }
}
```

### Variables

```json
{
  "id": "[ID_PERSON]",
  "data": {
    "customFields": {
      "canal": "Cold Call",
      "scriptUtilise": "Platten",
      "industrie": "Plomberie",
      "objectionPrincipale": "Trop cher"
    }
  }
}
```

**Important** : La syntaxe exacte des custom fields dépend de comment Twenty les nomme en interne. Tu devras peut-être ajuster.

---

## 5. Récupérer Tous les Leads d'un Stage Spécifique

### Query GraphQL

```graphql
query GetOpportunitiesByStage($stageId: ID!) {
  opportunities(where: { stageId: { equals: $stageId } }) {
    edges {
      node {
        id
        name
        amount
        person {
          firstName
          phone
          email
        }
        createdAt
      }
    }
  }
}
```

### Variables

```json
{
  "stageId": "[ID_DU_STAGE_LEAD_FROID]"
}
```

---

## 6. Rechercher un Lead par Téléphone (Éviter les Doublons)

### Query GraphQL

```graphql
query FindPersonByPhone($phone: String!) {
  people(where: { phone: { equals: $phone } }) {
    edges {
      node {
        id
        firstName
        phone
      }
    }
  }
}
```

### Variables

```json
{
  "phone": "+15141234567"
}
```

**Utilisation dans Make** : Avant de créer un nouveau lead depuis Apify, checker si le numéro existe déjà pour éviter les doublons.

---

## 7. Ajouter une Note à un Lead

### Query GraphQL

```graphql
mutation CreateNote($data: NoteCreateInput!) {
  createNote(data: $data) {
    id
    content
    createdAt
  }
}
```

### Variables

```json
{
  "data": {
    "content": "Appel du 27 fév : Intéressé mais veut réfléchir. Rappeler dans 48h.",
    "personId": "[ID_PERSON]"
  }
}
```

---

## 8. Lister Toutes les Opportunités (Pour Export Dashboard)

### Query GraphQL

```graphql
query GetAllOpportunities {
  opportunities {
    edges {
      node {
        id
        name
        amount
        stage {
          name
        }
        person {
          firstName
          phone
          customFields {
            canal
            industrie
          }
        }
        createdAt
        closedAt
      }
    }
  }
}
```

Pas de variables nécessaires.

**Utilisation** : Export quotidien vers Google Sheets pour analytics.

---

## 9. Créer une Tâche de Follow-up

### Query GraphQL

```graphql
mutation CreateTask($data: TaskCreateInput!) {
  createTask(data: $data) {
    id
    title
    dueDate
    status
  }
}
```

### Variables

```json
{
  "data": {
    "title": "Rappeler Jean Tremblay",
    "dueDate": "2026-03-01T10:00:00Z",
    "status": "TODO",
    "personId": "[ID_PERSON]"
  }
}
```

---

## 10. Webhooks : Twenty → Make (Déclenchement Auto)

Twenty supporte les webhooks pour trigger Make automatiquement quand un record change.

### Setup dans Twenty

1. Settings → Developers → Webhooks
2. Créer un nouveau webhook
3. URL : [URL Webhook Make]
4. Événements à surveiller :
   - `opportunity.updated` (quand le stage change)
   - `person.created` (quand un nouveau lead est créé)
   - `task.completed` (quand une tâche est cochée)

### Payload Reçu par Make

```json
{
  "event": "opportunity.updated",
  "data": {
    "id": "abc123",
    "name": "Plomberie Tremblay - Trifecta",
    "stage": {
      "id": "xyz789",
      "name": "Démo Bookée"
    },
    "person": {
      "id": "person123",
      "firstName": "Jean",
      "phone": "+15141234567"
    }
  }
}
```

**Utilisation dans Make** :
- Trigger : Webhook
- Condition : Si `data.stage.name == "Démo Bookée"`
- Action : Envoyer email de confirmation avec lien Calendly

---

## Exemples de Scénarios Make avec Twenty

### Scénario 1 : Apify Scraping → Twenty

```
[Apify - Get Dataset] 
  → [Iterator sur chaque lead]
    → [HTTP - Search Person by Phone dans Twenty]
      → [Router : Si existe déjà ? Skip : Créer]
        → [HTTP - Create Person]
        → [HTTP - Create Opportunity avec stage "Lead Froid"]
```

### Scénario 2 : Changement de Stage → Auto Follow-up

```
[Webhook de Twenty : opportunity.updated]
  → [Filter : stage == "Intéressé"]
    → [HTTP - Get Person Details]
      → [Gmail - Send Email avec Calendly link]
      → [HTTP - Add Note dans Twenty : "Follow-up envoyé"]
```

### Scénario 3 : Export Quotidien → Google Sheets

```
[Schedule : Tous les jours 18h]
  → [HTTP - Get All Opportunities]
    → [Iterator]
      → [Google Sheets - Add Row avec : Date, Nom, Stage, Canal, Industrie]
```

---

## Troubleshooting

### Erreur : "Authentication required"
- Vérifier que l'API Key est bien dans le header `Authorization: Bearer sk_...`
- Vérifier que la key n'a pas expiré (Settings → API Keys)

### Erreur : "Field does not exist"
- Les custom fields doivent être créés dans l'UI avant d'être utilisés via API
- Vérifier le nom exact du champ (case-sensitive)

### Erreur : "Rate limit exceeded"
- Twenty a des limites de rate (généralement 100 requests/min)
- Dans Make, ajouter un "Sleep" de 1-2 secondes entre les iterations si tu traites beaucoup de records

---

## Ressources

- **Documentation Twenty API** : https://twenty.com/developers/section/graphql
- **GraphQL Playground** : https://[ton-instance].twenty.com/graphql (pour tester les queries en live)
- **Make.com Twenty Integration** : Pas de module natif encore, utiliser HTTP module avec les queries ci-dessus