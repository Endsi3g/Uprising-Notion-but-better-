import 'dotenv/config';
import fs from 'fs';
import { google } from 'googleapis';
/* eslint-disable no-console */
import fetch from 'node-fetch';

const TWENTY_API_URL = process.env.TWENTY_API_URL;
const TWENTY_API_KEY = process.env.TWENTY_API_KEY;
const GOOGLE_SERVICE_ACCOUNT_PATH = process.env.GOOGLE_SERVICE_ACCOUNT_PATH;

if (
  !TWENTY_API_URL ||
  !TWENTY_API_KEY ||
  !GOOGLE_SHEET_ID ||
  !GOOGLE_SERVICE_ACCOUNT_PATH
) {
  console.error(
    '❌ Missing required environment variables (TWENTY_API_URL, TWENTY_API_KEY, GOOGLE_SHEET_ID, GOOGLE_SERVICE_ACCOUNT_PATH).',
  );
  process.exit(1);
}

// Prevent parsing errors if missing
let GOOGLE_SERVICE_ACCOUNT = {};
try {
  const fileContent = fs.readFileSync(GOOGLE_SERVICE_ACCOUNT_PATH, 'utf-8');
  GOOGLE_SERVICE_ACCOUNT = JSON.parse(fileContent);
} catch (e) {
  console.error(
    `❌ Failed to read or parse GOOGLE_SERVICE_ACCOUNT at ${GOOGLE_SERVICE_ACCOUNT_PATH}`,
    e,
  );
  process.exit(1);
}

// Setup Google Sheets
const auth = new google.auth.GoogleAuth({
  credentials: GOOGLE_SERVICE_ACCOUNT,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

// Récupérer toutes les opportunities
const getAllOpportunities = async () => {
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

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(TWENTY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TWENTY_API_KEY}`,
      },
      body: JSON.stringify({ query }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `HTTP ${response.status} ${response.statusText}: ${text}`,
      );
    }

    const data = await response.json();
    if (data.errors) {
      throw new Error(`GraphQL Errors: ${JSON.stringify(data.errors)}`);
    }

    if (data?.data?.opportunities?.edges) {
      return data.data.opportunities.edges.map((e) => e.node);
    }
    return [];
  } catch (error) {
    console.error('❌ Error fetching opportunities:', error);
    throw error;
  }
};

// Exporter vers Google Sheets
const exportToSheets = async (opportunities) => {
  if (!opportunities.length) {
    console.log('ℹ️ No opportunities to export.');
    return;
  }

  const rows = opportunities.map((opp) => [
    new Date().toISOString().split('T')[0], // Date
    opp.person?.firstName || 'Unknown',
    opp.stage?.name || 'No Stage',
    opp.person?.customFields?.canal || 'N/A',
    opp.person?.customFields?.industrie || 'N/A',
    opp.amount || 0,
    opp.person?.phone || 'N/A',
    opp.person?.customFields?.objectionPrincipale || 'N/A',
  ]);

  await sheets.spreadsheets.values.append({
    spreadsheetId: GOOGLE_SHEET_ID,
    range: 'Raw Data!A:H',
    valueInputOption: 'USER_ENTERED',
    resource: { values: rows },
  });

  console.log(`✅ Exported ${rows.length} rows to Google Sheets`);
};

const main = async () => {
  console.log('📊 Starting metrics export...');
  const opportunities = await getAllOpportunities();
  await exportToSheets(opportunities);
};

main().catch((error) => {
  console.error('❌ Fatal error in Main:', error);
  process.exit(1);
});
