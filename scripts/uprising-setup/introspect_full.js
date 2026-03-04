/**
 * ============================================================
 * Project: Uprising CRM
 * Author: Uprising Studio
 * Description: introspect_full.js
 * Last Modified: 2026-03-04
 * ============================================================
 */
const fs = require('fs');

const TOKEN = process.env.INTROSPECT_TOKEN;
if (!TOKEN) throw new Error("INTROSPECT_TOKEN environment variable is required.");
const ENDPOINT = process.env.ENDPOINT || 'http://localhost:3001/metadata';

async function introspect() {
  const query = `
    query IntrospectionQuery {
      __schema {
        types {
          name
          kind
          inputFields {
            name
            type {
              name
              kind
              ofType {
                name
                kind
              }
            }
          }
        }
      }
    }
  `;

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      },
      body: JSON.stringify({ query })
    });

    if (!res.ok) {
      console.error("HTTP Error", res.status, await res.text());
      return;
    }

    const data = await res.json();
    fs.writeFileSync('introspection_full.json', JSON.stringify(data, null, 2));
    console.log("Full Introspection saved to introspection_full.json");
  } catch(e) { console.error(e); }
}

introspect();
