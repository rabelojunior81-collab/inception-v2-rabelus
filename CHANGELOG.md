# Changelog

All notable changes to Inception Framework v2.0 are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased] — feat/mission-system

### Added

#### Mission System
- `packages/protocol/src/mission-wizard-logic.ts` — pure wizard logic (reusable in CLI and agent)
  - Types: `MissionType`, `TechStack`, `Methodology`, `Skill`, `WizardAutonomyLevel`, `MissionWizardInput`
  - `getWizardSteps()` — 9 wizard steps with labels, options, and input types
  - `validateMissionInput()` — full validation with error messages
  - `wizardInputToMissionCreate()` — converts wizard input → `Mission` create payload
- `packages/protocol/src/mission-config-mapper.ts` — organic skill-to-config mapping
  - `mapMissionToAgentConfig()` — maps wizard answers → `AgentLoopConfig` (autonomy, allowedCommands, agent mode, system prompt context)
  - `buildSystemPromptContext()` — generates context block injected into agent's system prompt
- `apps/cli/src/commands/mission.ts` — CLI command with all subcommands
  - `inception mission create` — interactive wizard (readline, box-drawing, same UX as `init`)
  - `inception mission list` — tabular view of all missions with status
  - `inception mission start <id>` — loads mission from DB and starts agent with context
  - `inception mission status [id]` — progress bars, task list, mission details
  - `inception mission report [id]` — generates markdown report saved to `.inception/reports/`
  - `inception mission archive <id>` — archives mission to immutable journal

#### Slash Commands (inside agent chat)
- `packages/agent/src/slash-handler.ts` — pure slash command logic
  - `/mission` — display active mission (title, progress, tasks)
  - `/task list` — list pending tasks
  - `/task done <text>` — mark task done
  - `/task add <desc>` — add new task
  - `/note <text>` — journal entry
  - `/rules` — show active mission rules
  - `/pause` — graceful shutdown with state save
  - `/status` — agent state (provider, model, tokens, mission)
  - `/help` — list all commands
- `packages/channels/cli/src/channel.ts` — added `setSlashHandler()` method
- `packages/channels/cli/src/components/App.tsx` — routes `/commands` to slash handler before LLM

#### Auto-Update Models
- `packages/config/src/model-registry.ts` — live model registry with cache
  - Fetches available models from provider APIs on startup
  - Cache at `~/.inception/models-cache.json` with 24h TTL
  - Provider-specific endpoints: Anthropic, OpenAI, Gemini, Ollama, Bailian, Kimi, Z.AI, OpenRouter, Kilo
  - Timeout 5s per request, graceful fallback to hardcoded models
  - `refreshModelsInBackground()` — non-blocking background refresh on `inception start`
- `apps/cli/src/commands/init.ts` — uses `getModelsForProvider()` for live model lists in wizard
- `apps/cli/src/commands/start.ts` — triggers background model refresh on startup

#### Documentation
- `docs/missions/mission-system.md` — complete technical spec of the mission system

### Changed
- `apps/cli/src/index.ts` — registered `mission` command with 6 subcommands
- `packages/channels/cli/src/types.ts` — added `slashOutput?: string` to `CliAppState`
- `packages/agent/src/index.ts` — exports `handleSlashCommand`, `SlashCommandContext`, `SlashCommandResult`
- `packages/config/src/index.ts` — exports model registry functions and types

### Fixed
- ESLint: 0 errors across all packages (was 10 errors before this branch)
- CI: Node.js version requirement updated to 22+ throughout

---

## [2.0.0-alpha] — 2026-03-16

### Added
- Full monorepo structure with Turborepo + pnpm workspaces
- `packages/types` — ~200 TypeScript interfaces, types, and enums (Mission, Task, Agent, Provider, Channel, Tool, Security, Memory, Protocol)
- `packages/config` — Zod-validated configuration schema with loader
- `packages/core` — Runtime engine, ChannelManager, Container (manual DI)
- `packages/memory` — SQLite backend with FTS5 + vector search + compaction
- `packages/security` — SecurityManager with gates, allowlists, approval flow
- `packages/protocol` — SQLite-backed mission protocol (CRUD: missions, tasks, journal)
- `packages/agent` — AgentLoop (ReAct orchestrator), ContextBuilder, ApprovalGate, ToolExecutor
- `packages/providers/anthropic` — Anthropic Claude integration
- `packages/providers/openai` — OpenAI-compatible integration
- `packages/providers/gemini` — Google Gemini integration
- `packages/providers/ollama` — Ollama local/cloud integration
- `packages/providers/kimi` — Kimi/Moonshot AI integration
- `packages/providers/zai` — Z.AI/Zhipu integration
- `packages/providers/bailian` — Bailian/DashScope integration
- `packages/channels/cli` — Ink-based terminal UI (React/Ink, StatusBar, MessageList, ApprovalPrompt)
- `packages/channels/telegram` — Telegram bot channel
- `packages/channels/http` — HTTP/REST channel
- `packages/tools/filesystem` — Read, Write, ListDir, FileExists, StatFile
- `packages/tools/shell` — RunCommand with allowlist enforcement
- `packages/tools/http` — HttpGet, HttpPost
- `packages/tools/memory` — MemorySearch, MemoryDescribe, MemoryExpand
- `apps/cli` — CLI application: `inception init | start | status | config`
- `apps/daemon` — Background daemon (experimental)
- CI/CD: GitHub Actions (lint + typecheck + test + build, Node 22 matrix)
- ESLint + Prettier + Turborepo pipeline

### Technical
- **Namespace:** `@rabeluslab/inception-*` (all packages)
- **Build:** tsup (ESM + CJS + DTS)
- **Runtime:** Node.js 22+ (uses `node:sqlite` built-in)
- **Memory:** SQLite with FTS5 full-text search and cosine similarity vector search
- **Security:** Gate system (G-TS, G-DI, G-SEC, G-UX, G-REL, G-AI), approval flows
- **Autonomy:** Readonly / Supervised / Full (configurable per mission)
