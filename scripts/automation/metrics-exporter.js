import 'dotenv/config';
import { google } from 'googleapis';
import fetch from 'node-fetch';

const TWENTY_API_URL = process.env.TWENTY_API_URL;
const TWENTY_API_KEY = process.env.TWENTY_API_KEY;
const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID;

// Prevent parsing errors if missing
let GOOGLE_SERVICE_ACCOUNT = {};
try {
  GOOGLE_SERVICE_ACCOUNT = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT || '{}');
} catch(e) {
  console.error("Failed to parse GOOGLE_SERVICE_ACCOUNT env var", e);
}

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
  if(data?.data?.opportunities?.edges) {
    return data.data.opportunities.edges.map(e => e.node);
  }
  return [];
}

// Exporter vers Google Sheets
async function exportToSheets(opportunities) {
  if (!opportunities.length) {
    console.log("ℹ️ No opportunities to export.");
    return;
  }

  const rows = opportunities.map(opp => [
    new Date().toISOString().split('T')[0], // Date
    opp.person?.firstName || 'Unknown',
    opp.stage?.name || 'No Stage',
    opp.person?.customFields?.canal || 'N/A',
    opp.person?.customFields?.industrie || 'N/A',
    opp.amount || 0,
    opp.person?.phone || 'N/A',
    opp.person?.customFields?.objectionPrincipale || 'N/A'
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
  console.log("📊 Starting metrics export...");
  const opportunities = await getAllOpportunities();
  await exportToSheets(opportunities);
}

main().catch(console.error);
