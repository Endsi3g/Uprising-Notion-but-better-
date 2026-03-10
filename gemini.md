# gemini.md

This file provides context and technical guidance for Gemini-based agents (like Antigravity) when working with the **Uprising Studio CRM** repository.

## Project Overview

**Uprising Studio CRM** is a custom fork of [Twenty](https://twenty.com), an open-source CRM. It is designed as a "Machine d'Acquisition" with integrated AI agents, automation pipelines (Make.com/Apify), and local LLM support.

The project uses a monorepo structure managed with **Nx** and **Yarn 4**.

## Tech Stack

- **Frontend**: React 18, Recoil, Emotion (styled-components), Vite.
- **Backend**: NestJS, TypeORM, PostgreSQL, Redis, GraphQL (Yoga).
- **Automation**: Make.com, Apify, Fireflies.ai.
- **AI/LLM**: Ollama (local LLM), OpenRouter/Groq (fallback).
- **Workspace**: Nx, Yarn Berry (v4).

## Key Commands

### Development
```powershell
# Start everything (standard Twenty)
yarn start

# Uprising-specific deployment (Docker)
.\scripts\uprising-ps\uprising_docker_deploy.ps1
```

### Nx Task Execution
```powershell
npx nx build twenty-shared  # Always build shared first
npx nx build twenty-front
npx nx build twenty-server
npx nx lint twenty-front --configuration=fix
```

## Coding Standards

- **Architecture**: Domain-driven design within NestJS modules.
- **Exports**: Named exports only (no `default`).
- **Naming**:
  - Variables/Functions: `camelCase`
  - Types/Classes: `PascalCase`
  - Files/Folders: `kebab-case`
- **Typing**: Strict TypeScript. No `any`. Use `Types` over `Interfaces`.
- **Logic**: Favor event handlers over `useEffect`. Favor composition over inheritance.

## Specific Components (Uprising Fork)

- **Instagram Monitor**: Located in `packages/twenty-apps/instagram-monitor`. Monitors DMs via Ollama.
- **Voice Agency**: Integration with `Uprising-ai-voice-agency` (cloned at `../uprising-voice-temp`).
- **Scripts**: Main administration scripts found in `scripts/uprising-ps/`.

## Working with Antigravity

- **Absolute Paths**: Always use absolute paths for tool calls.
- **Nx aware**: Recognize that changes in one package (e.g., `twenty-shared`) may require rebuilding or re-testing others.
- **Docker-first**: The preferred deployment method for this project is Docker.
