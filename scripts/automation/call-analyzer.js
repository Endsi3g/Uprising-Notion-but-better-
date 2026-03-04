/**
 * ============================================================
 * Project: Uprising CRM
 * Author: Uprising Studio
 * Description: call-analyzer.js
 * Last Modified: 2026-03-04
 * ============================================================
 */
import 'dotenv/config';
import express from 'express';
/* eslint-disable no-console */
import fetch from 'node-fetch';
import OpenAI from 'openai';

const TWENTY_API_URL = process.env.TWENTY_API_URL;
const TWENTY_API_KEY = process.env.TWENTY_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!TWENTY_API_URL || !TWENTY_API_KEY || !OPENAI_API_KEY) {
  console.error(
    '❌ Missing required env vars (TWENTY_API_URL, TWENTY_API_KEY, OPENAI_API_KEY).',
  );
  process.exit(1);
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const app = express();
app.use(express.json({ limit: '1mb' }));

app.post('/webhook/fireflies', async (req, res) => {
  const { transcript, title } = req.body;

  console.log(`📞 Received call: ${title}`);

  // Analyser avec GPT-4
  try {
    const analysis = await analyzeCall(transcript);
    // Ajouter une note dans Twenty
    await addCallNoteToTwenty(title, analysis, transcript);
    res.json({ success: true, analysis });
  } catch (e) {
    console.error('Error analyzing call', e);
    res.status(500).json({ success: false, error: e.message });
  }
});

const analyzeCall = async (transcript) => {
  if (!transcript)
    return { objection: 'None', sentiment: 'Neutre', next_action: 'None' };

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content:
          "Tu es un analyste de ventes. Analyse cette conversation et extrais l'objection principale, le sentiment, et la prochaine action recommandée. Réponds en JSON.",
      },
      {
        role: 'user',
        content: `Analyse cette conversation:\n\n${transcript}\n\nRéponds en JSON: {"objection": "...", "sentiment": "Positif|Neutre|Négatif", "next_action": "..."}`,
      },
    ],
    temperature: 0.3,
  });

  const content = completion.choices[0].message.content;
  try {
    return JSON.parse(content);
  } catch {
    console.warn(
      `⚠️  Failed to parse OpenAI response directly, attempting fallback extraction.`,
    );
    const match = content.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        console.error(`❌ Fallback JSON parse failed. Raw content:`, content);
      }
    } else {
      console.error(`❌ Raw block missing JSON:`, content);
    }
    return { objection: 'None', sentiment: 'Neutre', next_action: 'None' };
  }
};

const addCallNoteToTwenty = async (callTitle, analysis, transcript) => {
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
- Objection: ${analysis?.objection || 'N/A'}
- Sentiment: ${analysis?.sentiment || 'N/A'}
- Next action: ${analysis?.next_action || 'N/A'}

**Transcript:**
${transcript ? transcript.substring(0, 500) + '...' : 'No transcript provided.'}
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
          content: noteContent,
          // Vous pouvez rajouter le personId si vous le déterminez : personId
        },
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `HTTP ${response.status} ${response.statusText} on adding note: ${text}`,
    );
  }

  const resJson = await response.json();
  if (resJson.errors) {
    throw new Error(
      `Twenty GraphQL Errors on adding note: ${JSON.stringify(resJson.errors)}`,
    );
  }

  if (!resJson?.data?.createNote) {
    throw new Error(`Missing createNote result: ${JSON.stringify(resJson)}`);
  }
  console.log(`✅ Added call note to Twenty`);
};

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🎧 Call analyzer webhook running on port ${PORT}`);
});
