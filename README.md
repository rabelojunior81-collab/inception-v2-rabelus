# Inception Framework v2.0

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22+-green.svg)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-8+-orange.svg)](https://pnpm.io/)
[![CI](https://github.com/rabeluslab/inception-v2-rabelus/actions/workflows/ci.yml/badge.svg)](https://github.com/rabeluslab/inception-v2-rabelus/actions)

> **The Claw Evolution** — Runtime TypeScript-nativo para agentes de IA autônomos com metodologia Inception no núcleo.

---

## O que e o Inception?

Inception Framework e um **runtime completo para agentes de IA autônomos**, combinando:

- **Mission System** — Agentes configurados organicamente para cada objetivo (wizard interativo, skills, metodologias)
- **Metodologia Inception** — Abordagem Mission-first com protocolos IMP/IEP/ISP
- **Multi-Provider** — 14+ providers: Anthropic, OpenAI, Gemini, Ollama, Kimi, Z.AI, Bailian, OpenRouter e mais
- **Auto-Update de Modelos** — Lista de modelos atualizada automaticamente via API dos providers
- **Slash Commands** — Controle do agente via `/mission`, `/task`, `/note`, `/pause` dentro do chat
- **Security-first** — Autonomy levels, gates, allowlists, approval flows
- **Multi-channel** — CLI (Ink), Telegram, HTTP/REST

---

## Instalação Rapida

### Pre-requisitos

- **Node.js 22+** obrigatorio (`node:sqlite` e built-in do Node 22)
- **pnpm 8+** — `npm install -g pnpm`

```bash
node --version   # deve mostrar v22.x.x
pnpm --version   # deve mostrar 8.x.x
```

### Clonar e Build

```bash
git clone https://github.com/rabeluslab/inception-v2-rabelus.git
cd inception-v2-rabelus

pnpm install
pnpm build
```

### Configurar o Agente

```bash
# Crie um diretório de projeto e configure
mkdir meu-projeto && cd meu-projeto
node ../apps/cli/dist/index.js init
```

### Iniciar

```bash
# Iniciar o agente (chat interativo)
node ../apps/cli/dist/index.js start

# Ou, com alias global (opcional)
pnpm -F @rabeluslab/inception link --global
inception start
```

---

## Sistema de Missoes

O sistema de missoes e o nucleo operacional do Inception. Uma missao configura o agente dinamicamente para um objetivo especifico:

```
Missao = Objetivo + Tech Stack + Metodologia + Skills + Autonomia + Regras + Tarefas
```

### Criar uma Missao

```bash
node apps/cli/dist/index.js mission create
```

O wizard interativo pergunta:

```
① Nome da missao
② Tipo: Development | Research | Analysis | Automation | Refactor | Investigation
③ Descricao/objetivo
④ Tech stack: Node/TS | Python | Go | Docker | Browser | API | SQL | NoSQL
⑤ Metodologia: Exploratorio | TDD | Research-First | Sprint | Autonomo
⑥ Autonomia: Readonly | Supervised | Full
⑦ Skills: Web Scraping | Code Gen | Data Analysis | API Integration | Deploy | Docs
⑧ Regras e restricoes (opcional)
⑨ Decompor em tarefas agora?
```

Cada resposta **configura o agente automaticamente** — sem precisar editar JSONs.

### Comandos de Missao

```bash
inception mission create            # wizard interativo
inception mission list              # listar missoes
inception mission start <id>        # iniciar agente com missao ativa
inception mission status [id]       # progresso e tasks
inception mission report [id]       # relatorio markdown
inception mission archive <id>      # arquivar missao encerrada
```

### Slash Commands (dentro do agente)

Enquanto o agente esta rodando, digite:

| Comando | Acao |
|---|---|
| `/mission` | Exibe missao ativa e progresso |
| `/task list` | Lista tasks pendentes |
| `/task done <texto>` | Marca task concluida |
| `/task add <desc>` | Adiciona nova task |
| `/note <texto>` | Entrada no journal |
| `/rules` | Regras ativas da missao |
| `/pause` | Salva e encerra graciosamente |
| `/status` | Estado: provider, modelo, tokens, missao |
| `/help` | Lista todos os comandos |

---

## Providers Suportados

| Provider | Slug | Modelos principais |
|---|---|---|
| Kimi / Moonshot AI | `kimi` | kimi-k2.5, kimi-k2-thinking |
| Kimi Coding Plan | `kimi-coding` | kimi-for-coding |
| Z.AI / Zhipu | `zai` | GLM-5, GLM-4.7 |
| Z.AI Coding Plan | `zai-coding` | GLM-4.7 |
| Bailian Coding | `bailian` | Qwen+GLM+Kimi hub |
| Bailian PAYG | `bailian-payg` | qwen3.5-plus, qwen-max |
| Anthropic Claude | `anthropic` | claude-sonnet-4-6, claude-opus-4-6 |
| OpenAI | `openai` | gpt-4o, o3, o4-mini |
| OpenAI OAuth | `openai-oauth` | ChatGPT Plus/Pro |
| Google Gemini | `gemini` | gemini-2.5-flash, gemini-2.5-pro |
| Ollama (local) | `ollama` | llama3, mistral, phi4, qwen2.5 |
| OpenRouter | `openrouter` | 300+ modelos |
| Kilo Gateway | `kilo` | Gateway com controle de custo |

**Auto-update:** a lista de modelos e atualizada automaticamente na inicializacao (cache 24h).

---

## Todos os Comandos CLI

```bash
# Configuracao
inception init                      # wizard de configuracao inicial
inception config                    # exibe config resolvida
inception status                    # verifica ambiente, providers, memoria

# Agente
inception start                     # inicia agente (chat interativo)
inception start --provider kimi     # forca provider especifico
inception start --model GLM-5       # forca modelo especifico
inception start --debug             # modo debug

# Missoes
inception mission create            # wizard de nova missao
inception mission list              # listar missoes
inception mission start <id>        # agente com missao ativa
inception mission status [id]       # status e progresso
inception mission report [id]       # relatorio markdown
inception mission archive <id>      # arquivar missao
```

---

## Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                      CHANNEL LAYER                          │
│   ┌─────────┐  ┌──────────┐  ┌─────────┐  ┌──────────┐    │
│   │   CLI   │  │ Telegram │  │ Discord │  │   HTTP   │    │
│   └────┬────┘  └────┬─────┘  └────┬────┘  └────┬─────┘    │
└────────┼────────────┼─────────────┼─────────────┼──────────┘
         └────────────┴─────────────┴─────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────┐
│                   INCEPTION RUNTIME CORE                    │
│              (Event Loop, ChannelManager)                   │
└────────┬────────────┬──────────────┬───────────┬────────────┘
         │            │              │           │
    ┌────▼────┐  ┌────▼────┐  ┌─────▼───┐  ┌───▼──────────┐
    │ Provider│  │  Tools  │  │ Memory  │  │   Protocol   │
    │ (LLMs)  │  │(Action) │  │(SQLite) │  │ IMP/IEP/ISP  │
    └────┬────┘  └────┬────┘  └─────────┘  └──────────────┘
         └────────────┘
              │
    ┌─────────▼──────────┐
    │    AGENT LOOP      │
    │  (ReAct: reason    │
    │   + act + observe) │
    └────────────────────┘
```

### Packages

| Package | Descricao | Status |
|---|---|---|
| `@rabeluslab/inception-types` | 200+ tipos/interfaces/enums TypeScript | Completo |
| `@rabeluslab/inception-config` | Schema Zod, loader, model-registry | Completo |
| `@rabeluslab/inception-core` | Runtime engine, ChannelManager, DI | Completo |
| `@rabeluslab/inception-memory` | SQLite + FTS5 + vector search + compaction | Completo |
| `@rabeluslab/inception-security` | Gates, allowlists, approval flows | Completo |
| `@rabeluslab/inception-protocol` | Mission CRUD SQLite, wizard-logic, config-mapper | Completo |
| `@rabeluslab/inception-agent` | AgentLoop (ReAct), ContextBuilder, slash-handler | Completo |
| `@rabeluslab/inception-provider-anthropic` | Claude integration | Completo |
| `@rabeluslab/inception-provider-openai` | OpenAI-compat integration | Completo |
| `@rabeluslab/inception-provider-gemini` | Gemini integration | Completo |
| `@rabeluslab/inception-provider-ollama` | Ollama local/cloud | Completo |
| `@rabeluslab/inception-channel-cli` | Ink terminal UI | Completo |
| `@rabeluslab/inception-channel-telegram` | Telegram bot | Completo |
| `@rabeluslab/inception-tool-filesystem` | Read/Write/ListDir/Stat | Completo |
| `@rabeluslab/inception-tool-shell` | RunCommand com allowlist | Completo |
| `@rabeluslab/inception-tool-http` | HttpGet/HttpPost | Completo |
| `@rabeluslab/inception` | CLI app (inception init/start/mission/...) | Completo |

---

## Metodologia Inception (IMP)

### Modos do Agente

| Modo | Codigo | Descricao |
|---|---|---|
| Auditor | A | Planejamento e analise — sem execucao |
| Executor | B | Implementacao ativa |
| Archivist | C | Consolidacao e preservacao no journal |
| Verifier | D | Leitura somente — SAGRADO |

### Protocolos

- **IMP** — Mission Protocol: briefing → execucao → arquivamento
- **IEP** — Engineering Protocol: gates (G-TS, G-DI, G-SEC, G-UX, G-REL, G-AI), status de tarefas
- **ISP** — Safety Protocol: autonomia, approvals, limites

### Status das Tarefas

- `Resolved` — implementado e validado
- `Partial` — parcialmente implementado
- `Stub` — placeholder, aguardando implementacao
- `RiskAccepted` — risco conhecido e aceito
- `Blocked` — bloqueado por dependencia

---

## Desenvolvimento

```bash
pnpm install          # instalar dependencias
pnpm build            # build de todos os packages
pnpm lint             # ESLint (zero erros)
pnpm test             # testes
pnpm typecheck        # TypeScript check
```

### Estrutura

```
inception-v2/
├── apps/
│   ├── cli/           # CLI application
│   └── daemon/        # Background daemon (experimental)
├── packages/
│   ├── types/         # Core TypeScript definitions
│   ├── config/        # Configuration + model-registry
│   ├── core/          # Runtime engine
│   ├── memory/        # SQLite memory backend
│   ├── security/      # Security manager
│   ├── protocol/      # Mission protocol + wizard
│   ├── agent/         # Agent loop + slash commands
│   ├── providers/     # LLM provider adapters
│   ├── channels/      # Communication channels
│   └── tools/         # Tool implementations
├── docs/
│   └── missions/      # Mission system documentation
└── CHANGELOG.md
```

### Branch Strategy (Mission System)

```
main
└── feat/mission-system
    ├── snapshot/mission/phase-0-baseline  (CI verde, 0 erros ESLint)
    ├── snapshot/mission/phase-0           (docs/missions/mission-system.md)
    ├── snapshot/mission/phase-1           (Protocol Layer)
    ├── snapshot/mission/phase-2           (CLI Commands)
    ├── snapshot/mission/phase-3           (Slash Commands)
    ├── snapshot/mission/phase-4           (Auto-Update Models)
    └── snapshot/mission/phase-5           (Integracao final)
```

**Rollback:**
```bash
git reset --hard snapshot/mission/phase-N
```

---

## Seguranca

### Niveis de Autonomia

| Nivel | Comportamento |
|---|---|
| `Readonly` | Apenas le e sugere — nunca escreve ou executa |
| `Supervised` | Age mas pede aprovacao para acoes destrutivas |
| `Full` | Age autonomamente — recomendado apenas para ambientes seguros |

### Allowlists

Configure no `.inception.json` ou no wizard de missao:

```json
{
  "security": {
    "execution": {
      "allowedCommands": ["git", "node", "npm", "python", "docker"]
    },
    "filesystem": {
      "allowedPaths": ["./src", "./tests"]
    }
  }
}
```

---

## Licenca

MIT — veja [LICENSE](LICENSE).

---

Desenvolvido por [Rabelus Lab](https://rabeluslab.dev)
