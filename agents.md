# agents.md

Documentation of the AI Agents and Automation components within **Uprising Studio CRM**.

## 1. Instagram Monitor Agent
**Location**: `packages/twenty-apps/instagram-monitor`

An automated surveillance service that monitors Instagram Direct Messages and generates contextual responses.
- **Engine**: Local LLM via **Ollama** (default: `llama3.1`).
- **Function**: Scrapes/Monitors DMs, analyzes sentiment, and prepares draft responses or automated replies.
- **Config**: Managed via `.env` (`INSTAGRAM_USERNAME`, `OPENAI_COMPATIBLE_BASE_URL`).

## 2. Voice Agency Agent
**Integration**: Connected to `Uprising-ai-voice-agency`.

A platform for managing "Voice Agents" specialized in different industries.
- **Profiles**: Rénovation Expert Québec, Clinique Dentaire Sourire Plus, Garage Mécanique Pro.
- **Synchronization**: Syncs profiles and configurations via `scripts/uprising-ps/uprising-sync-voice.ps1`.
- **Runtime**: Runs as a separate Docker service (`voice-agency`) on port 5000.

## 3. Acquisition Orchestrator (The Machine)
**Tools**: Apify + Make.com.

The "Cold Outbound" pipeline that powers the CRM's growth.
- **Lead Sourcing**: Apify scrapes Google Maps for specific industries (Plumbing, Cleaning, etc.).
- **Injection**: Make.com parses scraped data and injects it into Twenty CRM as "Lead Froid".
- **Follow-up**: Automation triggers email/SMS follow-ups when an opportunity stage changes to "Intéressé".

## 4. Call Analysis Agent
**Tools**: Fireflies.ai + GPT-4/Local LLM.

Automated analysis of every vocal interaction.
- **Transcription**: Fireflies.ai captures and transcribes all cold calls.
- **Intelligence**: GPT-4 (or local equivalent) analyzes the transcript to extract:
  - Principal Objections.
  - Customer Sentiment.
  - Recommended Next Actions.
- **CRM Sync**: Insights are automatically posted back to the specific Opportunity record in Twenty.

## 5. Development Roadmap

- **Phase 3 (Intelligence)**: Deepening the integration of Fireflies analysis directly into the CRM UI.
- **Local Fallback**: Replacing OpenAI with OpenRouter and Groq fallbacks, with the goal of 100% local analysis via Ollama.
