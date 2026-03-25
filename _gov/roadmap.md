# Roadmap Vivo — Inception Framework v2.0

> Atualizado ao início e fim de cada sub-sprint. Fonte da verdade sobre o estado do desenvolvimento.

**Última atualização:** 2026-03-25
**Sprint ativa:** Sprint 2 — Code Gaps
**Branch ativa:** `feat/gov-sprint-2` (a criar)

---

## Status Geral

| Sprint | Objetivo | Status | Branch | Iniciada | Concluída |
|--------|----------|--------|--------|----------|-----------|
| Sprint 0 | Governance Bootstrap | ✅ done | `feat/governance` | 2026-03-25 | 2026-03-25 |
| Sprint 1 | Memory + Docs | ✅ done | `feat/gov-sprint-1` | 2026-03-25 | 2026-03-25 |
| Sprint 2 | Code Gaps | 🔄 in-progress | `feat/gov-sprint-2` | 2026-03-25 | — |
| Sprint 3 | CI/CD | ⏳ pending | `feat/gov-sprint-3` | — | — |
| Sprint 4 | Stubs | ⏳ pending | `feat/gov-sprint-4` | — | — |
| Sprint 5 | Filesystem Sanitization | ⏳ pending | `feat/gov-sprint-5` | — | — |

---

## Sprint 0: Governance Bootstrap

**Objetivo:** Criar a infraestrutura de governança. Sem isso, as outras sprints não têm onde registrar seus artefatos.
**Bloqueadores:** nenhum
**Bloqueia:** Sprint 1 (hard)

| SS | Nome | Status | Branch | Commit |
|----|------|--------|--------|--------|
| ss-0.1 | research-filesystem-audit | ✅ done | — | (integrado ao bootstrap) |
| ss-0.2 | create-gov-structure | ✅ done | `feat/governance` | 0de099b |
| ss-0.3 | archive-audits | ✅ done | `feat/governance` | 0de099b |
| ss-0.4 | roadmap-initial | ✅ done | `feat/governance` | 0de099b |
| ss-0.5 | sync-memory-index | ✅ done | — (externo ao repo) | — |
| ss-0.6 | commit-eslint-fix | ✅ done | `feat/mission-system` | ebff68a |

### Checklist de Conclusão Sprint 0

```
[x] _gov/ existe com estrutura completa e commitada (0de099b)
[x] _gov/archive/audits/ tem os 2 arquivos de auditoria (git mv)
[x] docs/audit-research/ tem apenas README.md redirect
[x] _gov/roadmap.md atualizado com todas as SS
[x] Memórias Claude não mencionam "8% implementado"
[x] .eslintrc.cjs commitado (override no-console) (ebff68a)
[x] pnpm build → verde (30 packages)
[x] git status limpo na branch feat/governance
```

---

## Sprint 1: Memory + Docs

**Objetivo:** Sincronizar toda documentação e memórias de agente com o estado real.
**Bloqueadores:** Sprint 0 (hard)
**Bloqueia:** Sprint 2 (soft)

| SS | Nome | Gaps resolve | Status | Commit |
|----|------|-------------|--------|--------|
| ss-1.1 | sync-claude-memories | G10 | ✅ done | — (externo) |
| ss-1.2 | handoff-update | G12 | ✅ done | 5dcc1ff |
| ss-1.3 | guia-gaps-update | G1 (doc) | ✅ done | 5dcc1ff |
| ss-1.4 | security-md-update | — | ✅ done | 5dcc1ff |
| ss-1.5 | changelog-sync | G1-G5 | ✅ done | 5dcc1ff |
| ss-1.6 | version-alignment | G6 | ✅ done | 5dcc1ff |

### Checklist de Conclusão Sprint 1

```
[x] HANDOFF.md menciona G1-G12 explicitamente
[x] SECURITY.md documenta SecurityManager + gates + G2 como known gap
[x] CHANGELOG.md seção "Known Gaps" com G1, G2, G4, G6, G8, G11
[x] Todos os 29 packages em version 2.0.0
[x] pnpm build → verde (30 packages, 0 erros)
```

---

## Sprint 2: Security + Code Gaps (REVISADO)

**Objetivo:** Resolver os gaps críticos de runtime, segurança e persistência — incluindo o SecurityManager orphaned que inviabiliza o rate limiting.
**Bloqueadores:** Sprint 1 (soft)
**Bloqueia:** Sprint 3 (soft)

> **Mudança vs. plano original:** G13 (SecurityManager orphaned) e G17 (AgentLoopConfig sem securityManager) são pré-requisitos de G2. Adicionadas ss-2.2, ss-2.5, ss-2.6. Redefinido G4.

| SS | Nome | Gaps resolve | Dependência | Paralela? |
|----|------|-------------|-------------|-----------|
| ss-2.1 | spec-security-and-slash | G1+G2+G13+G17+G20 (spec) | — (PRIMEIRO) | — |
| ss-2.2 | fix-securitymanager-wiring | G13, G17 | depois 2.1 | — |
| ss-2.3 | impl-slash-persistence | G1 | depois 2.2 | — |
| ss-2.4 | impl-rate-limit | G2 | depois 2.2 | com 2.3 (independente) |
| ss-2.5 | fix-execution-context-urls | G20 | depois 2.2 | com 2.3, 2.4 |
| ss-2.6 | fix-runtime-lifecycle | G4 | depois 2.2 | com 2.3, 2.4, 2.5 |
| ss-2.7 | fix-memory-tools-package | G11 | independente | com todas |

**Sequência obrigatória:** ss-2.1 → ss-2.2 → {ss-2.3, ss-2.4, ss-2.5, ss-2.6} paralelas → ss-2.7 qualquer hora

### Detalhamento das SS

**ss-2.1 — spec-security-and-slash** (SPEC-FIRST obrigatório)
- Documentar exatamente como `SecurityManager` será injetado em `AgentLoopConfig`
- Definir `addTask(desc: string): Promise<Task>` e `addJournalEntry(text: string): Promise<JournalEntry>` em `IMissionProtocol`
- Definir token-bucket para `checkRateLimit()`: algoritmo, contadores, reset TTL
- Definir como `SlashCommandContext` receberá referência ao `missionProtocol`

**ss-2.2 — fix-securitymanager-wiring** (G13 + G17 — CRÍTICO)
- `apps/cli/src/commands/start.ts`: mudar `new SecurityManager({...})` para `const securityManager = new SecurityManager({...})`
- Adicionar campo `securityManager: SecurityManager` a `AgentLoopConfig` em `packages/agent/src/agent-loop.ts`
- Passar `securityManager` na criação do `AgentLoop` em `start.ts`
- Sem isso, rate limiting é impossível

**ss-2.3 — impl-slash-persistence** (G1)
- `packages/types/src/protocol.ts`: adicionar `addTask()` e `addJournalEntry()` a `IMissionProtocol`
- `packages/protocol/src/mission-protocol.ts`: implementar os dois métodos
- `packages/agent/src/slash-handler.ts`: adicionar `missionProtocol?: IMissionProtocol` a `SlashCommandContext`; chamar `missionProtocol.addTask()` em `/task done` e `/task add`; chamar `addJournalEntry()` em `/note`

**ss-2.4 — impl-rate-limit** (G2)
- `packages/security/src/security-manager.ts`: implementar `checkRateLimit()` com token-bucket (in-memory, reset por minuto/hora)
- `packages/agent/src/agent-loop.ts`: chamar `this.cfg.securityManager?.checkRateLimit()` antes de `provider.generate()`

**ss-2.5 — fix-execution-context-urls** (G20)
- `packages/agent/src/agent-loop.ts`: passar `allowedUrls: this.cfg.allowedUrls` no `ExecutionContext` montado antes de `toolExecutor.execute()`

**ss-2.6 — fix-runtime-lifecycle** (G4)
- `packages/core/src/runtime.ts`: implementar `registerChannelManager(cm: ChannelManager)` no `InceptionRuntime`; `runtime.start()` deve chamar `channelManager.startAll()`; `runtime.stop()` deve chamar `channelManager.stopAll()`
- `apps/cli/src/commands/start.ts`: passar `channelManager` ao runtime antes de `runtime.start()`

**ss-2.7 — fix-memory-tools-package** (G11)
- `packages/tools/memory/src/index.ts`: substituir `export {}` por re-exports de `@rabeluslab/inception-memory/tools`
- `packages/tools/memory/package.json`: adicionar `@rabeluslab/inception-memory` como dependência

### Checklist de Conclusão Sprint 2

```
[ ] SecurityManager armazenado em start.ts (const securityManager = ...)
[ ] AgentLoopConfig tem campo securityManager: SecurityManager
[ ] AgentLoop recebe securityManager na criação
[ ] IMissionProtocol.addTask() + addJournalEntry() definidos nos tipos
[ ] MissionProtocol implementa addTask() + addJournalEntry()
[ ] /task done persiste no SQLite (verificar DB após execução)
[ ] /task add persiste nova task (visível em /task list)
[ ] /note persiste no journal
[ ] SecurityManager.checkRateLimit() implementado com token-bucket
[ ] AgentLoop chama checkRateLimit() antes de provider.generate()
[ ] ExecutionContext recebe allowedUrls do config
[ ] InceptionRuntime.registerChannelManager() funcional
[ ] runtime.start() coordena channelManager.startAll()
[ ] packages/tools/memory re-exporta MemorySearchTool etc.
[ ] pnpm build + pnpm test → verde
```

---

## Sprint 3: Quality Gates + CI/CD (REVISADO)

**Objetivo:** Fechar os buracos de qualidade — `.gitattributes`, hooks Husky, commitlint, ESLint, testes faltando, CI completo.
**Bloqueadores:** Sprint 2 (soft — código estável)
**Bloqueia:** Sprint 4 (soft)

> **Mudança vs. plano original:** Sprint 3 agora inclui G14-G19, G21 descobertos na auditoria profunda. Passou de 4 SS para 6+ SS.

| SS | Nome | Gaps resolve | Dependência | Paralela? |
|----|------|-------------|-------------|-----------|
| ss-3.1 | create-gitattributes | G14 | — | com todas |
| ss-3.2 | create-commitlintrc | G15 | — | com todas |
| ss-3.3 | configure-husky-hooks | G16 | depois 3.2 | — |
| ss-3.4 | fix-eslint-warnings | G18 | — | com 3.1, 3.2 |
| ss-3.5 | ci-quality-gates | G8, G21 | depois 3.3 | — |
| ss-3.6 | add-missing-tests | G19 | depois Sprint 2 | — |
| ss-3.7 | ci-badges | — | depois 3.5 | — |

### Detalhamento das SS

**ss-3.1 — create-gitattributes** (G14)
- Criar `.gitattributes` na raiz:
  ```
  * text=auto eol=lf
  *.bat text eol=crlf
  *.cmd text eol=crlf
  ```
- Eliminar os warnings LF→CRLF em todo commit Windows

**ss-3.2 — create-commitlintrc** (G15)
- Criar `.commitlintrc.cjs`:
  ```javascript
  module.exports = { extends: ['@commitlint/config-conventional'] };
  ```
- Commitlint está instalado mas sem config = valida nada

**ss-3.3 — configure-husky-hooks** (G16)
- Criar `.husky/pre-commit`:
  ```sh
  #!/usr/bin/env sh
  . "$(dirname "$0")/_/h"
  npx lint-staged
  ```
- Criar `.husky/commit-msg`:
  ```sh
  #!/usr/bin/env sh
  . "$(dirname "$0")/_/h"
  npx --no -- commitlint --edit "$1"
  ```
- Garantir que `git add` em qualquer arquivo dispara lint-staged (ESLint fix + Prettier)
- Garantir que commit com mensagem errada é rejeitado

**ss-3.4 — fix-eslint-warnings** (G18)
- `.eslintrc.cjs`: remover a definição duplicada de `explicit-function-return-type` (linha 24)
- Analisar os 443 warnings — decidir quais são erros legítimos vs. ruído
- Configurar thresholds de warnings aceitáveis

**ss-3.5 — ci-quality-gates** (G8, G21)
- `.github/workflows/ci.yml`:
  - Adicionar `pnpm audit --audit-level=high` no job lint-and-typecheck
  - Adicionar `pnpm test:coverage` no job test + upload artifact
  - Adicionar commitlint no job lint-and-typecheck (para PRs)
  - Atualizar triggers: adicionar `feat/gov-sprint-*`, `feat/governance`, `feat/mission-system`, `ss/sprint-*`
  - Otimizar: compartilhar `dist/` entre jobs via `actions/cache` para evitar 3 builds

**ss-3.6 — add-missing-tests** (G19)
- Criar testes para os pacotes sem cobertura:
  - `packages/protocol/src/mission-protocol.test.ts` — CRUD missions, addTask, addJournalEntry
  - `packages/core/src/channel-manager.test.ts` — register, startAll, stopAll
  - `packages/core/src/runtime.test.ts` — lifecycle states
  - `packages/config/src/schema.test.ts` — Zod validation pass/fail
- Coverage threshold: mínimo 60% para novos arquivos

**ss-3.7 — ci-badges** (info)
- README.md: adicionar badges CI, coverage, version

### Checklist de Conclusão Sprint 3

```
[ ] .gitattributes criado — zero warnings LF/CRLF em commits Windows
[ ] .commitlintrc.cjs criado com extends config-conventional
[ ] .husky/pre-commit existe e invoca lint-staged
[ ] .husky/commit-msg existe e invoca commitlint
[ ] Commit com mensagem fora do padrão é rejeitado (teste manual)
[ ] ESLint: zero conflito de regras
[ ] pnpm audit no CI (falha em high/critical CVE)
[ ] Coverage report gerado e upado como artifact no CI
[ ] Commitlint validado no CI (PR validation)
[ ] Todos os branches de dev nos triggers do CI
[ ] Testes para protocol, core, config criados e passando
[ ] CI verde end-to-end
```

---

## Sprint 4: Stubs (REVISADO)

**Objetivo:** Implementar Discord channel, Browser tool, e cleanup dos 9 providers faltando.
**Bloqueadores:** Sprint 3 (soft — CI valida implementações)
**Bloqueia:** Sprint 5 (soft)

| SS | Nome | Gaps resolve | Dependência | Paralela? |
|----|------|-------------|-------------|-----------|
| ss-4.1 | spec-discord-channel | G5 (parcial) | — | — |
| ss-4.2 | impl-discord-channel | G5 (parcial) | depois 4.1 | — |
| ss-4.3 | spec-browser-tool | — | com 4.1 | com 4.1 |
| ss-4.4 | impl-browser-tool | — | depois 4.3 | — |
| ss-4.5 | cleanup-provider-enum | G3, G5 | independente | com 4.1, 4.3 |

### Detalhamento das SS

**ss-4.1 — spec-discord-channel**
- Spec técnica: arquitetura Discord (discord.js v14), padrão do TelegramChannel
- Definir: `DiscordChannel implements IChannel`, eventos, approval via reactions/buttons
- Definir: `packages/channels/discord/package.json` com `discord.js` dep

**ss-4.2 — impl-discord-channel**
- Implementar `DiscordChannel` baseado na spec
- Classe: `start()`, `stop()`, `send()`, `onMessage()`, `setApprovalHandler()`
- Testes: conectar, enviar mensagem, receber mensagem (mock discord.js)

**ss-4.3 — spec-browser-tool**
- Spec técnica: Playwright API, sandboxing, SecurityManager.checkUrl() antes de navigate
- Ferramentas: `navigate`, `screenshot`, `click`, `fill`, `select`, `getText`
- Definir: contexto isolado por sessão de agente

**ss-4.4 — impl-browser-tool**
- Implementar `BrowserTool` com Playwright
- Cada ação aplica `securityManager.checkUrl()`
- Contexto de browser destruído quando agente encerra

**ss-4.5 — cleanup-provider-enum**
- `packages/types/src/providers.ts`: 9 ProviderId sem pacote recebem JSDoc:
  ```typescript
  /** @future Groq provider — não implementado. Ver sprint-4 do roadmap. */
  Groq = 'groq',
  ```
- Criar `docs/decisions/provider-stubs.md` documentando os 9 providers planejados (Groq, Together, Fireworks, Perplexity, Cohere, Mistral, XAI, DeepSeek, Custom)
- `sandbox: 'none'` (G3): adicionar comentário JSDoc em `ExecutionPolicy` explicando que docker/vm são futuros

### Checklist de Conclusão Sprint 4

```
[ ] DiscordChannel implementa IChannel (não export {})
[ ] DiscordChannel: start, stop, send, onMessage, approval reactions
[ ] BrowserTool: navigate, screenshot, click, fill, select implementados
[ ] BrowserTool: SecurityManager.checkUrl() antes de navigate
[ ] packages/tools/memory re-exporta memory tools (de Sprint 2, confirmar)
[ ] 9 providers sem pacote têm @future JSDoc + docs/decisions/provider-stubs.md
[ ] G3 (sandbox) documentado no JSDoc do ExecutionPolicy
[ ] pnpm build + pnpm test → verde
```

---

## Sprint 5: Filesystem Sanitization

**Objetivo:** Organização final — i18n mínimo, semantic naming review, cleanup.
**Bloqueadores:** Sprint 4 (soft)

| SS | Nome | Gaps resolve | Paralela? |
|----|------|-------------|-----------|
| ss-5.1 | archive-audit-research-dir | — | com todas |
| ss-5.2 | populate-docs-structure | G9 | com todas |
| ss-5.3 | naming-normalization | — | com todas |
| ss-5.4 | final-test-run | — | depois todas |

### Checklist de Conclusão Sprint 5 (= Conclusão do Plano)

```
[ ] docs/pt/index.md e docs/en/index.md existem
[ ] docs/audit-research/ só tem README.md redirect
[ ] Naming consistente em todo _gov/
[ ] pnpm build + lint + typecheck + test + audit → verde (tudo)
[ ] PR para main criado com todos os gaps G1-G21 documentados
[ ] _gov/roadmap.md: todas as sprints com status done
```

---

## Gaps — Rastreamento Consolidado (Revisado)

| ID | Gap | Sprint | SS | Status |
|----|-----|--------|----|--------|
| G1 | `/task done/add/note` sem persistência SQLite | 2 | ss-2.3 | ⏳ open |
| G2 | Rate limiting: `checkRateLimit()` não implementado | 2 | ss-2.4 | ⏳ open |
| G3 | `sandbox: 'none'` sem implementação (doc apenas) | 4 | ss-4.5 | ⏳ open |
| G4 | `InceptionRuntime` não coordena lifecycle dos canais | 2 | ss-2.6 | ⏳ open |
| G5 | 9 ProviderId sem pacote (Groq, Together, etc.) | 4 | ss-4.5 | ⏳ open |
| G6 | Versionamento 2.0.0 vs 0.0.0 | 1 | ss-1.6 | ✅ done (5dcc1ff) |
| G7 | .eslintrc.cjs não commitado | 0 | ss-0.6 | ✅ done (ebff68a) |
| G8 | CI: sem audit, coverage, commitlint, triggers incompletos | 3 | ss-3.5 | ⏳ open |
| G9 | docs/en\|pt vazios | 5 | ss-5.2 | ⏳ open |
| G10 | Memórias Claude obsoletas | 0 | ss-0.5 | ✅ done |
| G11 | `packages/tools/memory/` stub — re-export pendente | 2 | ss-2.7 | ⏳ open |
| G12 | HANDOFF.md sem gaps | 1 | ss-1.2 | ✅ done (5dcc1ff) |
| **G13** | **SecurityManager DESCARTADO em start.ts (linha 74-83)** | **2** | **ss-2.2** | **⏳ open** |
| **G14** | **.gitattributes não existe — LF→CRLF warnings** | **3** | **ss-3.1** | **⏳ open** |
| **G15** | **.commitlintrc não existe — commitlint sem regras** | **3** | **ss-3.2** | **⏳ open** |
| **G16** | **Husky hooks não configurados (.husky/pre-commit vazio)** | **3** | **ss-3.3** | **⏳ open** |
| **G17** | **AgentLoopConfig sem campo securityManager** | **2** | **ss-2.2** | **⏳ open** |
| **G18** | **ESLint: regra duplicada + 443 warnings acumulados** | **3** | **ss-3.4** | **⏳ open** |
| **G19** | **Zero testes para protocol, core, config, channels, providers** | **3** | **ss-3.6** | **⏳ open** |
| **G20** | **allowedUrls não passado ao ExecutionContext** | **2** | **ss-2.5** | **⏳ open** |
| **G21** | **CI executa pnpm build 3x sem cache entre jobs** | **3** | **ss-3.5** | **⏳ open** |
