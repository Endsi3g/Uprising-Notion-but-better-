# Architecture Code-First - Specs Techniques

## Stack Technique Recommandée

```
┌─────────────────────────────────────────────────────────────────┐
│                   APIFY API (Scraping)                           │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│              SCRIPTS D'AUTOMATISATION (Node.js/Python)           │
│  • apify-to-twenty.js - Injection leads                          │
│  • follow-up-engine.js - Auto follow-ups                         │
│  • metrics-exporter.js - Dashboard quotidien                     │
│  • call-analyzer.js - Analyse transcripts Fireflies              │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                   TWENTY CRM (GraphQL API)                       │
└─────────────────────────────────────────────────────────────────┘
```

**Pourquoi Node.js ?** 
- Twenty utilise GraphQL (natif en JS)
- Apify SDK en JavaScript
- Déploiement facile (Vercel, Railway, ou serveur simple)
- Xavier le connaît probablement déjà

---

## Script 1 : Apify → Twenty (Injection Automatique de Leads)

### Fichier : `apify-to-twenty.js`

```javascript
import { ApifyClient } from 'apify-client';
import fetch from 'node-fetch';

// Configuration
const APIFY_TOKEN = process.env.APIFY_TOKEN;
const TWENTY_API_URL = process.env.TWENTY_API_URL; // https://your-instance.twenty.com/graphql
const TWENTY_API_KEY = process.env.TWENTY_API_KEY;

const apifyClient = new ApifyClient({ token: APIFY_TOKEN });

// GraphQL query pour vérifier si le lead existe déjà
async function findPersonByPhone(phone) {
  const query = `
    query FindPerson($phone: String!) {
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
  `;
  
  const response = await fetch(TWENTY_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TWENTY_API_KEY}`
    },
    body: JSON.stringify({ query, variables: { phone } })
  });
  
  const data = await response.json();
  return data.data.people.edges.length > 0 ? data.data.people.edges[0].node : null;
}

// GraphQL mutation pour créer un nouveau lead
async function createLead(leadData) {
  const mutation = `
    mutation CreatePerson($data: PersonCreateInput!) {
      createPerson(data: $data) {
        id
        firstName
        phone
      }
    }
  `;
  
  const response = await fetch(TWENTY_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TWENTY_API_KEY}`
    },
    body: JSON.stringify({
      query: mutation,
      variables: {
        data: {
          firstName: leadData.title,
          phone: leadData.phone,
          // Ajouter custom fields ici
          customFields: {
            canal: 'Outbound',
            industrie: detectIndustry(leadData.title),
            sourceGoogleMaps: leadData.url
          }
        }
      }
    })
  });
  
  return await response.json();
}

// Détection de l'industrie basée sur le nom du business
function detectIndustry(businessName) {
  const keywords = {
    'Nettoyage': ['nettoyage', 'cleaning', 'entretien', 'ménage'],
    'Plomberie': ['plomberie', 'plumber', 'plombier'],
    'Électricité': ['électrique', 'électricien', 'electric'],
    'Toiture': ['toiture', 'couvreur', 'roofing'],
    'Paysagiste': ['paysage', 'landscaping', 'aménagement']
  };
  
  const lowerName = businessName.toLowerCase();
  
  for (const [industry, terms] of Object.entries(keywords)) {
    if (terms.some(term => lowerName.includes(term))) {
      return industry;
    }
  }
  
  return 'Autre';
}

// Main function : Scraper et injecter
async function runApifyToTwenty(searchQuery, maxResults = 30) {
  console.log(`🔍 Scraping: ${searchQuery}`);
  
  // Run Apify actor
  const run = await apifyClient.actor('compass/crawler-google-places').call({
    searchStringsArray: [searchQuery],
    maxCrawledPlacesPerSearch: maxResults,
    language: 'fr',
    exportPlaceUrls: true,
    includeWebResults: false
  });
  
  // Récupérer les résultats
  const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
  
  console.log(`✅ Scraped ${items.length} leads`);
  
  let created = 0;
  let skipped = 0;
  
  for (const item of items) {
    if (!item.phone) {
      console.log(`⚠️  Skipped ${item.title} (no phone)`);
      skipped++;
      continue;
    }
    
    // Vérifier si existe déjà
    const existing = await findPersonByPhone(item.phone);
    
    if (existing) {
      console.log(`⏭️  Skipped ${item.title} (already exists)`);
      skipped++;
      continue;
    }
    
    // Créer le lead
    try {
      await createLead(item);
      console.log(`✅ Created: ${item.title}`);
      created++;
    } catch (error) {
      console.error(`❌ Error creating ${item.title}:`, error);
    }
    
    // Rate limiting (pour ne pas spammer Twenty)
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`   Created: ${created}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Total: ${items.length}`);
}

// Run avec plusieurs recherches
async function main() {
  const searches = [
    'plombier Repentigny',
    'électricien Terrebonne',
    'nettoyage commercial Laval',
    'couvreur Montréal Est',
    'paysagiste Repentigny'
  ];
  
  for (const search of searches) {
    await runApifyToTwenty(search, 30);
  }
}

main().catch(console.error);
```

### Setup du Script

```bash
# Installer dépendances
npm init -y
npm install apify-client node-fetch dotenv

# Créer .env
echo "APIFY_TOKEN=your_apify_token" >> .env
echo "TWENTY_API_URL=https://your-instance.twenty.com/graphql" >> .env
echo "TWENTY_API_KEY=your_twenty_api_key" >> .env

# Run le script
node apify-to-twenty.js
```

### Cron Job pour Automatisation

```bash
# Ajouter dans crontab (run tous les lundis à 9h)
0 9 * * 1 cd /path/to/scripts && node apify-to-twenty.js >> logs/apify.log 2>&1
```

---

## Script 2 : Auto Follow-up Engine

### Fichier : `follow-up-engine.js`

```javascript
import fetch from 'node-fetch';
import nodemailer from 'nodemailer';

const TWENTY_API_URL = process.env.TWENTY_API_URL;
const TWENTY_API_KEY = process.env.TWENTY_API_KEY;
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;
const CALENDLY_LINK = process.env.CALENDLY_LINK;

// Setup email transporter
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_APP_PASSWORD
  }
});

// Récupérer les leads qui nécessitent un follow-up
async function getLeadsForFollowUp() {
  const query = `
    query GetInterested {
      opportunities(where: { stage: { name: { equals: "Intéressé" } } }) {
        edges {
          node {
            id
            name
            person {
              id
              firstName
              email
              phone
            }
            updatedAt
          }
        }
      }
    }
  `;
  
  const response = await fetch(TWENTY_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TWENTY_API_KEY}`
    },
    body: JSON.stringify({ query })
  });
  
  const data = await response.json();
  return data.data.opportunities.edges.map(e => e.node);
}

// Envoyer email de follow-up
async function sendFollowUpEmail(person) {
  const mailOptions = {
    from: GMAIL_USER,
    to: person.email,
    subject: 'Suite à notre conversation',
    html: `
      <p>Salut ${person.firstName},</p>
      
      <p>Merci pour ton temps aujourd'hui. Comme discuté, voici le lien pour booker ta démo de 15 minutes :</p>
      
      <p><a href="${CALENDLY_LINK}" style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Choisir un créneau</a></p>
      
      <p>Si tu as des questions d'ici là, n'hésite pas à répondre à cet email.</p>
      
      <p>Kael<br>
      Uprising Studio</p>
    `
  };
  
  await transporter.sendMail(mailOptions);
}

// Ajouter note dans Twenty
async function addNote(personId, content) {
  const mutation = `
    mutation CreateNote($data: NoteCreateInput!) {
      createNote(data: $data) {
        id
      }
    }
  `;
  
  await fetch(TWENTY_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TWENTY_API_KEY}`
    },
    body: JSON.stringify({
      query: mutation,
      variables: {
        data: {
          content,
          personId
        }
      }
    })
  });
}

// Main
async function main() {
  const leads = await getLeadsForFollowUp();
  
  console.log(`📧 Found ${leads.length} leads for follow-up`);
  
  for (const lead of leads) {
    if (!lead.person.email) {
      console.log(`⚠️  Skipped ${lead.person.firstName} (no email)`);
      continue;
    }
    
    // Vérifier si follow-up déjà envoyé (check updatedAt)
    const hoursSinceUpdate = (Date.now() - new Date(lead.updatedAt)) / (1000 * 60 * 60);
    
    if (hoursSinceUpdate < 1) {
      // Follow-up immédiat si le stage vient de changer (< 1h)
      try {
        await sendFollowUpEmail(lead.person);
        await addNote(lead.person.id, `Follow-up email automatique envoyé le ${new Date().toISOString()}`);
        console.log(`✅ Sent follow-up to ${lead.person.firstName}`);
      } catch (error) {
        console.error(`❌ Error sending to ${lead.person.firstName}:`, error);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

// Run le script toutes les 15 minutes via cron
main().catch(console.error);
```

### Cron Job

```bash
# Run toutes les 15 minutes
*/15 * * * * cd /path/to/scripts && node follow-up-engine.js >> logs/follow-up.log 2>&1
```

---

## Script 3 : Metrics Exporter (Dashboard Quotidien)

### Fichier : `metrics-exporter.js`

```javascript
import fetch from 'node-fetch';
import { google } from 'googleapis';

const TWENTY_API_URL = process.env.TWENTY_API_URL;
const TWENTY_API_KEY = process.env.TWENTY_API_KEY;
const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID;
const GOOGLE_SERVICE_ACCOUNT = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);

// Setup Google Sheets
const auth = new google.auth.GoogleAuth({
  credentials: GOOGLE_SERVICE_ACCOUNT,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const sheets = google.sheets({ version: 'v4', auth });

// Récupérer toutes les opportunities
async function getAllOpportunities() {
  const query = `
    query GetAllOpps {
      opportunities {
        edges {
          node {
            id
            name
            amount
            stage { name }
            person {
              firstName
              phone
              customFields {
                canal
                industrie
                objectionPrincipale
              }
            }
            createdAt
            closedAt
          }
        }
      }
    }
  `;
  
  const response = await fetch(TWENTY_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TWENTY_API_KEY}`
    },
    body: JSON.stringify({ query })
  });
  
  const data = await response.json();
  return data.data.opportunities.edges.map(e => e.node);
}

// Exporter vers Google Sheets
async function exportToSheets(opportunities) {
  const rows = opportunities.map(opp => [
    new Date().toISOString().split('T')[0], // Date
    opp.person.firstName,
    opp.stage.name,
    opp.person.customFields?.canal || 'N/A',
    opp.person.customFields?.industrie || 'N/A',
    opp.amount || 0,
    opp.person.phone,
    opp.person.customFields?.objectionPrincipale || 'N/A'
  ]);
  
  await sheets.spreadsheets.values.append({
    spreadsheetId: GOOGLE_SHEET_ID,
    range: 'Raw Data!A:H',
    valueInputOption: 'USER_ENTERED',
    resource: { values: rows }
  });
  
  console.log(`✅ Exported ${rows.length} rows to Google Sheets`);
}

async function main() {
  const opportunities = await getAllOpportunities();
  await exportToSheets(opportunities);
}

main().catch(console.error);
```

---

## Script 4 : Call Analyzer (Fireflies + GPT-4)

### Fichier : `call-analyzer.js`

```javascript
import fetch from 'node-fetch';
import OpenAI from 'openai';

const TWENTY_API_URL = process.env.TWENTY_API_URL;
const TWENTY_API_KEY = process.env.TWENTY_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// Webhook endpoint pour recevoir Fireflies
import express from 'express';
const app = express();
app.use(express.json());

app.post('/webhook/fireflies', async (req, res) => {
  const { transcript, title, participants } = req.body;
  
  console.log(`📞 Received call: ${title}`);
  
  // Analyser avec GPT-4
  const analysis = await analyzeCall(transcript);
  
  // Trouver le contact dans Twenty (par numéro de téléphone si disponible)
  // Ou créer une note générique
  await addCallNoteToTwenty(title, analysis, transcript);
  
  res.json({ success: true });
});

async function analyzeCall(transcript) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "Tu es un analyste de ventes. Analyse cette conversation et extrais l'objection principale, le sentiment, et la prochaine action recommandée. Réponds en JSON."
      },
      {
        role: "user",
        content: `Analyse cette conversation:\n\n${transcript}\n\nRéponds en JSON: {"objection": "...", "sentiment": "Positif/Neutre/Négatif", "next_action": "..."}`
      }
    ],
    temperature: 0.3
  });
  
  return JSON.parse(completion.choices[0].message.content);
}

async function addCallNoteToTwenty(callTitle, analysis, transcript) {
  const mutation = `
    mutation CreateNote($data: NoteCreateInput!) {
      createNote(data: $data) {
        id
      }
    }
  `;
  
  const noteContent = `
📞 Call: ${callTitle}

**Analyse IA:**
- Objection: ${analysis.objection}
- Sentiment: ${analysis.sentiment}
- Next action: ${analysis.next_action}

**Transcript:**
${transcript.substring(0, 500)}...
  `;
  
  await fetch(TWENTY_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TWENTY_API_KEY}`
    },
    body: JSON.stringify({
      query: mutation,
      variables: {
        data: {
          content: noteContent
          // Ajouter personId si tu peux mapper l'appelant
        }
      }
    })
  });
  
  console.log(`✅ Added call note to Twenty`);
}

app.listen(3000, () => {
  console.log('🎧 Call analyzer webhook running on port 3000');
});
```

---

## Déploiement

### Option 1 : Serveur Simple (VPS, Railway, Render)

```bash
# Structure du projet
/uprising-automation
  ├── package.json
  ├── .env
  ├── scripts/
  │   ├── apify-to-twenty.js
  │   ├── follow-up-engine.js
  │   ├── metrics-exporter.js
  │   └── call-analyzer.js
  ├── cron-jobs.sh
  └── server.js (pour webhooks)
```

### Option 2 : Serverless (Vercel Functions)

Chaque script devient une Vercel Function déclenchée par webhook ou cron.

---

## Avantages de l'Approche Code-First

✅ **Contrôle total** : Tu décides de la logique exacte
✅ **Performance** : Pas de latence de Make.com
✅ **Coût** : Gratuit ou quasi-gratuit (juste l'hébergement)
✅ **Customisation infinie** : Ajouter n'importe quelle feature
✅ **Debugging facile** : Logs clairs, stack traces
✅ **Versioning** : Git pour tracker les changements

---

## Prochaines Étapes

1. Xavier code les 4 scripts de base
2. Deploy sur Railway/Render (gratuit)
3. Setup cron jobs
4. Tester avec 10-20 leads
5. Itérer basé sur les résultats