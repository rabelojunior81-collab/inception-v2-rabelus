# 🧠 Inception Framework v2.0

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-8+-orange.svg)](https://pnpm.io/)

> **The Claw Evolution** — A TypeScript-native autonomous agent runtime with Inception Methodology core.

[English](README.md) | [Português](docs/pt/README.md) | [Español](docs/es/README.md)

---

## 🌟 What is Inception?

Inception Framework is a **production-ready runtime for autonomous AI agents**, combining:

- 🎯 **Inception Methodology** — Mission-first approach with IMP/IEP/ISP protocols
- ⚡ **ZeroClaw-inspired** — Trait-driven architecture, swappable components
- 🔒 **Security-first** — Autonomy levels, gates, sandboxing
- 💾 **SQLite + Gemini** — Hybrid memory with vector search
- 🤖 **Multi-channel** — CLI, Telegram, Discord, HTTP
- 📦 **Lightweight** — ~15MB runtime, single binary distribution

```bash
# Clone e configure em menos de 3 minutos
git clone https://github.com/rabelojunior81-collab/inception-v2-rabelus.git
cd inception-v2-rabelus
pnpm install && pnpm turbo run build
node --experimental-sqlite apps/cli/dist/index.js init
node --experimental-sqlite apps/cli/dist/index.js start
```

---

## 🚀 Quick Start

### Pré-requisitos

- **Node.js 22+** — obrigatório (`node:sqlite` é built-in do Node 22)
  - [Download](https://nodejs.org/) ou `nvm install 22`
- **pnpm 8+** — `npm install -g pnpm`

### Instalação

```bash
# 1. Clone
git clone https://github.com/rabelojunior81-collab/inception-v2-rabelus.git
cd inception-v2-rabelus

# 2. Instalar dependências
pnpm install

# 3. Build de todos os pacotes
pnpm turbo run build

# 4. Wizard de configuração (interativo — precisa de terminal real)
node --experimental-sqlite apps/cli/dist/index.js init

# 5. Iniciar o agente
node --experimental-sqlite apps/cli/dist/index.js start
```

### Atalhos (após clone + build)

```bash
pnpm inception:init    # wizard de configuração
pnpm inception:start   # iniciar agente
pnpm inception status  # verificar ambiente
pnpm inception config  # exibir config resolvida
```

### Providers suportados (configure no `inception init`)

| Provider            | Slug           | Nota                                   |
| ------------------- | -------------- | -------------------------------------- |
| Kimi (Moonshot AI)  | `kimi`         | PAYG — api.moonshot.ai                 |
| Kimi Coding Plan    | `kimi-coding`  | Subscription — api.kimi.com/coding     |
| Z.AI (Zhipu)        | `zai`          | PAYG — api.z.ai/paas                   |
| Z.AI Coding Plan    | `zai-coding`   | Subscription — api.z.ai/coding         |
| Bailian Coding Plan | `bailian`      | Hub multi-marca: Qwen+GLM+Kimi+MiniMax |
| Bailian PAYG        | `bailian-payg` | DashScope pay-per-token                |
| Anthropic Claude    | `anthropic`    | claude-sonnet-4-6, opus, haiku         |
| OpenAI API          | `openai`       | gpt-5.4 series + o-series              |
| OpenAI OAuth        | `openai-oauth` | ChatGPT Plus/Pro via Bearer token      |
| Google Gemini       | `gemini`       | gemini-2.5-flash + gemini-3 preview    |
| Ollama Cloud        | `ollama`       | Pro $20/mês, Max $100/mês              |
| Ollama Local        | `ollama`       | Grátis, sem API key, localhost:11434   |
| OpenRouter          | `openrouter`   | Gateway 300+ modelos                   |
| Kilo                | `kilo`         | Gateway com controle de custo          |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CHANNEL LAYER                            │
│  ┌─────────┐ ┌──────────┐ ┌─────────┐ ┌─────────────────┐  │
│  │   CLI   │ │ Telegram │ │ Discord │ │ HTTP/WebSocket  │  │
│  └────┬────┘ └────┬─────┘ └────┬────┘ └────────┬────────┘  │
└───────┼───────────┼────────────┼───────────────┼───────────┘
        │           │            │               │
        └───────────┴────────────┴───────────────┘
                            │
┌───────────────────────────▼───────────────────────────────┐
│              INCEPTION RUNTIME CORE                       │
│         (Event Loop & State Management)                   │
└──────────────┬────────────────────────────────────────────┘
               │
    ┌──────────┼──────────┬──────────┬──────────┐
    ▼          ▼          ▼          ▼          ▼
┌───────┐  ┌───────┐  ┌───────┐  ┌───────┐  ┌───────────┐
│Provider│  │ Tools │  │Memory │  │Security│  │  Protocol │
│(LLMs)  │  │(Action)│  │(SQLite│  │(Gates) │  │ IMP/IEP/ISP│
└───────┘  └───────┘  └───────┘  └───────┘  └───────────┘
```

### Trait-Driven Design

Every component is swappable via configuration:

```typescript
// Switch from OpenAI to Anthropic
{
  "provider": {
    "name": "anthropic",
    "model": "claude-3-opus-20240229"
  }
}

// Switch from SQLite to PostgreSQL
{
  "memory": {
    "backend": "postgresql",
    "connectionString": "postgresql://..."
  }
}
```

---

## 📦 Packages

| Package                        | Description                 | Status         |
| ------------------------------ | --------------------------- | -------------- |
| `@inception/types`             | Core TypeScript definitions | ✅ Ready       |
| `@inception/core`              | Runtime engine              | ⏳ In Progress |
| `@inception/config`            | Configuration management    | ⏳ In Progress |
| `@inception/providers/openai`  | OpenAI integration          | ⏳ In Progress |
| `@inception/providers/gemini`  | Gemini integration          | ⏳ In Progress |
| `@inception/channels/cli`      | Terminal UI                 | ⏳ In Progress |
| `@inception/channels/telegram` | Telegram bot                | ⏳ In Progress |
| `@inception/channels/discord`  | Discord bot                 | ⏳ In Progress |
| `@inception/memory`            | SQLite + vector storage     | ⏳ In Progress |
| `@inception/tools`             | Tool implementations        | ⏳ In Progress |
| `@inception/security`          | Auth, gates, sandbox        | ⏳ In Progress |
| `@inception/cli`               | Command-line interface      | ⏳ In Progress |

---

## 🎯 Features

### 🤖 Multi-Provider Support

- OpenAI (GPT-4, GPT-3.5)
- Anthropic (Claude 3)
- Google (Gemini)
- Ollama (Local models)
- OpenRouter (Unified API)
- **22+ providers supported**

### 💬 Multi-Channel

- **CLI** — Rich terminal interface (Ink-based)
- **Telegram** — Bot integration
- **Discord** — Bot integration
- **HTTP** — REST API + WebSocket

### 🧠 Hybrid Memory

- **SQLite** — Embedded, zero external deps
- **FTS5** — Full-text search with BM25
- **Vector Search** — Cosine similarity
- **Gemini Embeddings** — 768-dim vectors

### 🔒 Security

- **Autonomy Levels** — readonly / supervised / full
- **Gate System** — G-TS, G-DI, G-SEC, G-UX, G-REL, G-AI
- **Sandbox** — Docker containerization
- **Allowlists** — Commands, paths, URLs
- **Pairing Auth** — One-time codes

### 📋 Inception Methodology

- **IMP** — Mission Protocol (briefing, execution, archival)
- **IEP** — Engineering Protocol (gates, status tracking)
- **ISP** — Safety Protocol (autonomy, approvals)
- **Journal** — Immutable mission history

---

## 🛠️ Usage

### Creating an Agent

```bash
# Initialize a new agent
inception init

# Interactive prompts:
# - Agent name
# - LLM provider
# - Channels (CLI, Telegram, Discord)
# - Autonomy level
# - Workspace path
```

### Running the Agent

```bash
# Start in foreground
inception start

# Start as daemon
inception daemon start

# Check status
inception status
```

### Configuration

```toml
# ~/.inception/config.toml
[agent]
name = "MyAssistant"
autonomy = "supervised"

[provider]
name = "openai"
apiKey = "${OPENAI_API_KEY}"
model = "gpt-4"

[channels]
cli = { enabled = true }

[channels.telegram]
enabled = true
botToken = "${TELEGRAM_BOT_TOKEN}"
allowedUserIds = ["123456789"]

[memory]
backend = "sqlite"
embeddingProvider = "gemini"

[security]
sandbox = true
allowedCommands = ["git", "npm", "node"]
```

---

## 📚 Documentation

- [Getting Started Guide](docs/en/getting-started.md)
- [Architecture Overview](docs/en/architecture.md)
- [API Reference](docs/en/api.md)
- [Contributing Guide](CONTRIBUTING.md)
- [Security Policy](SECURITY.md)

### Translations

- 🇧🇷 [Português](docs/pt/README.md)
- 🇪🇸 [Español](docs/es/README.md)
- 🇨🇳 [中文](docs/zh/README.md)

---

## 🏗️ Development

```bash
# Install dependencies
pnpm install

# Start development mode
pnpm dev

# Build all packages
pnpm build

# Run tests
pnpm test

# Run linter
pnpm lint

# Type check
pnpm typecheck
```

### Project Structure

```
inception/
├── packages/           # Core packages
├── apps/              # Applications
├── docs/              # Documentation
├── tests/             # Test suites
└── scripts/           # Build scripts
```

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Quick Contributions

```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/inception.git

# Create branch
git checkout -b feat/your-feature

# Make changes, commit
git commit -m "feat(scope): description"

# Push and create PR
git push origin feat/your-feature
```

---

## 📜 License

MIT License — see [LICENSE](LICENSE) file.

---

## 🙏 Acknowledgments

- **ZeroClaw** — Inspiration for trait-driven architecture
- **OpenClaw** — Pioneer in autonomous agent frameworks
- **Rabelus Lab** — Inception Methodology creators

---

## 🔗 Links

- 🌐 [Website](https://inception.rabeluslab.dev)
- 📖 [Documentation](https://inception.rabeluslab.dev/docs)
- 🐦 [Twitter](https://twitter.com/inceptionfw)
- 💬 [Discord](https://discord.gg/inception)

---

<p align="center">
  Built with ❤️ by <a href="https://rabeluslab.dev">Rabelus Lab</a>
</p>
