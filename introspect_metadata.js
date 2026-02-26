const fs = require('fs');

async function introspect() {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4N2FiYTkzNi1iZTgxLTQ3OWYtYjZhZS1jNzA1NDE3M2VlN2QiLCJ0eXBlIjoiQVBJX0tFWSIsIndvcmtzcGFjZUlkIjoiODdhYmE5MzYtYmU4MS00NzlmLWI2YWUtYzcwNTQxNzNlZTdkIiwiaWF0IjoxNzcyMDA2MTMzLCJleHAiOjQ5MjU2MDYxMzEsImp0aSI6Ijg0NWE3YTFiLWVmNTMtNGFiYy05ZThhLWY1ZTc5YmIyYmNmMiJ9.rcNQDopvFtytpJWg03Qt8e5rzJ247MXePpjJqUv3eOo';

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
    const data2 = await res2.json();
    fs.writeFileSync('objects.json', JSON.stringify(data2, null, 2));
    console.log("Objects saved to objects.json");

  } catch (error) {
    console.error('Error:', error);
  }
}

introspect();
