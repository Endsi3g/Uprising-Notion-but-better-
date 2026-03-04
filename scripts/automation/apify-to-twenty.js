// ============================================================
// Project: Uprising CRM
// Author: Uprising Studio
// Description: apify-to-twenty.js
// Last Modified: 2026-03-04
// ============================================================

/* eslint-disable no-console */
import { ApifyClient } from 'apify-client';
import 'dotenv/config';
import fetch from 'node-fetch';

// Configuration
const APIFY_TOKEN = process.env.APIFY_TOKEN;
const TWENTY_API_URL = process.env.TWENTY_API_URL; // https://your-instance.twenty.com/graphql
const TWENTY_API_KEY = process.env.TWENTY_API_KEY;

if (!APIFY_TOKEN || !TWENTY_API_URL || !TWENTY_API_KEY) {
  console.error(
    '❌ Missing required environment variables (APIFY_TOKEN, TWENTY_API_URL, TWENTY_API_KEY).',
  );
  process.exit(1);
}

const apifyClient = new ApifyClient({ token: APIFY_TOKEN });

// GraphQL query pour vérifier si le lead existe déjà
const findPersonByPhone = async (phone) => {
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
      Authorization: `Bearer ${TWENTY_API_KEY}`,
    },
    body: JSON.stringify({ query, variables: { phone } }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP ${response.status} when looking up person: ${text}`);
  }

  const data = await response.json();
  if (data.errors) {
    throw new Error(
      `GraphQL Error looking up person: ${JSON.stringify(data.errors)}`,
    );
  }

  if (data?.data?.people?.edges?.length > 0)
    return data.data.people.edges[0].node;
  return null;
};

// GraphQL mutation pour créer un nouveau lead
const createLead = async (leadData) => {
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
      Authorization: `Bearer ${TWENTY_API_KEY}`,
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
            sourceGoogleMaps: leadData.url,
          },
        },
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `HTTP ${response.status} creating lead ${leadData.title}: ${text}`,
    );
  }

  const resJson = await response.json();
  if (resJson.errors) {
    throw new Error(
      `GraphQL Error creating lead ${leadData.title}: ${JSON.stringify(resJson.errors)}`,
    );
  }
  if (!resJson?.data?.createPerson) {
    throw new Error(
      `Missing expected data field after creating lead ${leadData.title}. Response: ${JSON.stringify(resJson)}`,
    );
  }

  return resJson;
};

// Détection de l'industrie basée sur le nom du business
const detectIndustry = (businessName) => {
  const keywords = {
    Nettoyage: ['nettoyage', 'cleaning', 'entretien', 'ménage'],
    Plomberie: ['plomberie', 'plumber', 'plombier'],
    Électricité: ['électrique', 'électricien', 'electric'],
    Toiture: ['toiture', 'couvreur', 'roofing'],
    Paysagiste: ['paysage', 'landscaping', 'aménagement'],
  };

  const lowerName = businessName?.toLowerCase() || '';

  for (const [industry, terms] of Object.entries(keywords)) {
    if (terms.some((term) => lowerName.includes(term))) {
      return industry;
    }
  }

  return 'Autre';
};

// Main function : Scraper et injecter
const runApifyToTwenty = async (searchQuery, maxResults = 30) => {
  console.log(`\n🔍 Scraping: ${searchQuery}`);

  // Run Apify actor
  const run = await apifyClient.actor('compass/crawler-google-places').call({
    searchStringsArray: [searchQuery],
    maxCrawledPlacesPerSearch: maxResults,
    language: 'fr',
    exportPlaceUrls: true,
    includeWebResults: false,
  });

  // Récupérer les résultats
  const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();

  console.log(`✅ Scraped ${items.length} leads`);

  let created = 0;
  let skipped = 0;
  let failed = 0;

  for (const item of items) {
    if (!item.phone) {
      console.log(`⚠️  Skipped ${item.title} (no phone)`);
      skipped++;
      continue;
    }

    try {
      // Vérifier si existe déjà
      const existing = await findPersonByPhone(item.phone);

      if (existing) {
        console.log(`⏭️  Skipped ${item.title} (already exists)`);
        skipped++;
        continue;
      }

      // Créer le lead
      await createLead(item);
      console.log(`✅ Created: ${item.title}`);
      created++;
    } catch (error) {
      console.error(`❌ Error creating ${item.title}:`, error);
      failed++;
    }

    // Rate limiting (pour ne pas spammer Twenty)
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log(`\n📊 Summary for "${searchQuery}":`);
  console.log(`   Created: ${created}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Failed:  ${failed}`);
  console.log(`   Total:   ${items.length}`);
};

// Run avec plusieurs recherches
const main = async () => {
  const searches = [
    'plombier Repentigny',
    'électricien Terrebonne',
    'nettoyage commercial Laval',
    'couvreur Montréal Est',
    'paysagiste Repentigny',
  ];

  for (const search of searches) {
    await runApifyToTwenty(search, 30);
  }
};

main().catch(console.error);
