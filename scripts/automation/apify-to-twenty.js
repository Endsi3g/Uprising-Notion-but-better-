import { ApifyClient } from 'apify-client';
import fetch from 'node-fetch';
import 'dotenv/config';

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
  if (data?.data?.people?.edges?.length > 0) return data.data.people.edges[0].node;
  return null;
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

  const lowerName = businessName?.toLowerCase() || '';

  for (const [industry, terms] of Object.entries(keywords)) {
    if (terms.some(term => lowerName.includes(term))) {
      return industry;
    }
  }

  return 'Autre';
}

// Main function : Scraper et injecter
async function runApifyToTwenty(searchQuery, maxResults = 30) {
  console.log(`\n🔍 Scraping: ${searchQuery}`);

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

  console.log(`\n📊 Summary for "${searchQuery}":`);
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
