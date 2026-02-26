const fs = require('fs');

const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4N2FiYTkzNi1iZTgxLTQ3OWYtYjZhZS1jNzA1NDE3M2VlN2QiLCJ0eXBlIjoiQVBJX0tFWSIsIndvcmtzcGFjZUlkIjoiODdhYmE5MzYtYmU4MS00NzlmLWI2YWUtYzcwNTQxNzNlZTdkIiwiaWF0IjoxNzcyMDA2MTMzLCJleHAiOjQ5MjU2MDYxMzEsImp0aSI6Ijg0NWE3YTFiLWVmNTMtNGFiYy05ZThhLWY1ZTc5YmIyYmNmMiJ9.rcNQDopvFtytpJWg03Qt8e5rzJ247MXePpjJqUv3eOo';
const ENDPOINT = 'http://localhost:3001/metadata';

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

    const data = await res.json();
    fs.writeFileSync('introspection_full.json', JSON.stringify(data, null, 2));
    console.log("Full Introspection saved to introspection_full.json");
  } catch(e) { console.error(e); }
}

introspect();
