/**
 * ============================================================
 * Project: Uprising CRM
 * Author: Uprising Studio
 * Description: follow-up-engine.js
 * Last Modified: 2026-03-04
 * ============================================================
 */
import 'dotenv/config';
import fs from 'fs';
/* eslint-disable no-console */
import fetch from 'node-fetch';
import nodemailer from 'nodemailer';

const TWENTY_API_URL = process.env.TWENTY_API_URL;
const TWENTY_API_KEY = process.env.TWENTY_API_KEY;
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;
const CALENDLY_LINK = process.env.CALENDLY_LINK;

if (
  !TWENTY_API_URL ||
  !TWENTY_API_KEY ||
  !GMAIL_USER ||
  !GMAIL_APP_PASSWORD ||
  !CALENDLY_LINK
) {
  console.error(
    '❌ Missing required env vars (TWENTY_API_URL, TWENTY_API_KEY, GMAIL_USER, GMAIL_APP_PASSWORD, CALENDLY_LINK).',
  );
  process.exit(1);
}

// Setup email transporter
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_APP_PASSWORD,
  },
});

// Récupérer les leads qui nécessitent un follow-up
const getLeadsForFollowUp = async () => {
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

  try {
    const response = await fetch(TWENTY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TWENTY_API_KEY}`,
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(
        `❌ HTTP ${response.status} ${response.statusText}: ${text}`,
      );
      return [];
    }

    const data = await response.json();
    if (data.errors) {
      console.error(`❌ GraphQL Errors: ${JSON.stringify(data.errors)}`);
      return [];
    }

    if (data?.data?.opportunities?.edges) {
      return data.data.opportunities.edges.map((e) => e.node);
    }
    return [];
  } catch (error) {
    console.error(`❌ Network or parse error:`, error);
    return [];
  }
};

// Envoyer email de follow-up
const sendFollowUpEmail = async (person) => {
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
      <p>Xavier<br>
      Uprising Studio</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// Ajouter note dans Twenty
const addNote = async (personId, content) => {
  const mutation = `
    mutation CreateNote($data: NoteCreateInput!) {
      createNote(data: $data) {
        id
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
          content,
          personId,
        },
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP ${response.status} adding note: ${text}`);
  }

  const resJson = await response.json();
  if (resJson.errors) {
    throw new Error(
      `GraphQL errors adding note: ${JSON.stringify(resJson.errors)}`,
    );
  }
  if (!resJson?.data?.createNote) {
    throw new Error(`No createNote data returned: ${JSON.stringify(resJson)}`);
  }
};

const CACHE_FILE = 'followup-cache.json';

const loadCache = () => {
  if (fs.existsSync(CACHE_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
    } catch {
      return [];
    }
  }
  return [];
};

const saveToCache = (id) => {
  const cache = loadCache();
  if (!cache.includes(id)) {
    cache.push(id);
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf-8');
  }
};

// Main
const main = async () => {
  const leads = await getLeadsForFollowUp();

  console.log(`📧 Found ${leads.length} leads for follow-up`);

  const cache = loadCache();

  for (const lead of leads) {
    if (!lead.person) {
      console.log(`⚠️  Skipped generic opportunity (no attached person)`);
      continue;
    }

    const shortId = lead.person.id ? lead.person.id.substring(0, 8) : 'unknown';

    if (!lead.person.email) {
      console.log(`⚠️  Skipped Person #${shortId} (no email)`);
      continue;
    }

    if (cache.includes(lead.person.id)) {
      console.log(`⏭️  Skipped Person #${shortId} (already in cache)`);
      continue;
    }

    // Vérifier si follow-up déjà envoyé (check updatedAt)
    const hoursSinceUpdate =
      (Date.now() - new Date(lead.updatedAt).getTime()) / (1000 * 60 * 60);

    if (hoursSinceUpdate < 1) {
      // Follow-up immédiat si le stage vient de changer (< 1h)
      try {
        await sendFollowUpEmail(lead.person);
        await addNote(
          lead.person.id,
          `Follow-up email automatique envoyé le ${new Date().toISOString()}`,
        );
        saveToCache(lead.person.id);
        console.log(`✅ Sent follow-up to Person #${shortId}`);
      } catch (error) {
        console.error(`❌ Error sending to Person #${shortId}:`, error);
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
};

// Run le script
main().catch(console.error);
