import 'dotenv/config';
import express from 'express';
import fetch from 'node-fetch';
import OpenAI from 'openai';

const TWENTY_API_URL = process.env.TWENTY_API_URL;
const TWENTY_API_KEY = process.env.TWENTY_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const app = express();
app.use(express.json());

app.post('/webhook/fireflies', async (req, res) => {
  const { transcript, title, participants } = req.body;

  console.log(`📞 Received call: ${title}`);

  // Analyser avec GPT-4
  try {
    const analysis = await analyzeCall(transcript);
    // Ajouter une note dans Twenty
    await addCallNoteToTwenty(title, analysis, transcript);
    res.json({ success: true, analysis });
  } catch(e) {
    console.error("Error analyzing call", e);
    res.status(500).json({ success: false, error: e.message });
  }
});

async function analyzeCall(transcript) {
  if (!transcript) return { objection: "None", sentiment: "Neutre", next_action: "None" };

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "Tu es un analyste de ventes. Analyse cette conversation et extrais l'objection principale, le sentiment, et la prochaine action recommandée. Réponds en JSON."
      },
      {
        role: "user",
        content: `Analyse cette conversation:\n\n${transcript}\n\nRéponds en JSON: {"objection": "...", "sentiment": "Positif|Neutre|Négatif", "next_action": "..."}`
      }
    ],
    temperature: 0.3
  });

  const content = completion.choices[0].message.content;
  return JSON.parse(content);
}

async function addCallNoteToTwenty(callTitle, analysis, transcript) {
  const mutation = `
    mutation CreateNote($data: NoteCreateInput!) {
      createNote(data: $data) {
        id
      }
    }
  `;

  const noteContent = `
📞 Call: ${callTitle || 'Unknown Call'}

**Analyse IA:**
- Objection: ${analysis.objection}
- Sentiment: ${analysis.sentiment}
- Next action: ${analysis.next_action}

**Transcript:**
${transcript ? transcript.substring(0, 500) + '...' : 'No transcript provided.'}
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
          content: noteContent
          // Vous pouvez rajouter le personId si vous le déterminez : personId
        }
      }
    })
  });

  const resJson = await response.json();
  if(resJson.errors) {
     console.error("Twenty GraphQL Errors:", resJson.errors);
  } else {
     console.log(`✅ Added call note to Twenty`);
  }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🎧 Call analyzer webhook running on port ${PORT}`);
});
