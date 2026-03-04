/**
 * ============================================================
 * Project: Uprising CRM
 * Author: Uprising Studio
 * Description: introspect_metadata.js
 * Last Modified: 2026-03-04
 * ============================================================
 */
const fs = require('fs');

async function introspect() {
  const token = process.env.INTROSPECT_TOKEN;
  if (!token) throw new Error("INTROSPECT_TOKEN environment variable is required.");

  const query = `
    query IntrospectionQuery {
      __schema {
        mutationType {
          name
          fields {
            name
            args {
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
    }
  `;

  try {
    const res = await fetch('http://localhost:3001/metadata', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ query })
    });

    if (!res.ok) {
        console.error("HTTP Error", res.status, await res.text());
        return;
    }

    const data = await res.json();
    fs.writeFileSync('introspection.json', JSON.stringify(data, null, 2));
    console.log("Introspection saved to introspection.json");

    // Also try to query existing objects to see their IDs
    const objectsQuery = `
      query {
        objects {
          edges {
            node {
              id
              nameSingular
              namePlural
            }
          }
        }
      }
    `;
    const res2 = await fetch('http://localhost:3001/metadata', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ query: objectsQuery })
    });

    if (!res2.ok) {
        console.error("HTTP Error", res2.status, await res2.text());
        return;
    }

    const data2 = await res2.json();
    fs.writeFileSync('objects.json', JSON.stringify(data2, null, 2));
    console.log("Objects saved to objects.json");

  } catch (error) {
    console.error('Error:', error);
  }
}

introspect();
