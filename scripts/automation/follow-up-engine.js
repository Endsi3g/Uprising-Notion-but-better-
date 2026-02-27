import 'dotenv/config';
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
  if (data?.data?.opportunities?.edges) {
    return data.data.opportunities.edges.map(e => e.node);
  }
  return [];
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
    const hoursSinceUpdate = (Date.now() - new Date(lead.updatedAt).getTime()) / (1000 * 60 * 60);

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

// Run le script
main().catch(console.error);
