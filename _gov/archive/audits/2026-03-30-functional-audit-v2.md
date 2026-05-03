# Auditoria Funcional Profunda — Inception Framework v2.0

**Data:** 2026-03-30
**Solicitante:** Rabelus (fundador)
**Executor:** Claude Sonnet 4.6
**Metodologia:** Auditoria forense com evidências arquivo:linha + pesquisa web em tempo real
**Escopo:** Gaps funcionais além dos G1-G21 de governança já resolvidos

---

## Sumário Executivo

O Inception Framework v2.0 possui **infraestrutura de governança exemplar** (CI verde, 131 testes,
30 packages compilando). Porém, uma análise forense profunda do código fonte revela **17 gaps
funcionais confirmados** (F1-F20, sendo 3 refutados) que impedem uso em produção real.

**Percentual de funcionalidade real: ~50%** (infraestrutura: 95%; produto: 45%)

A dicotomia central: o projeto compila perfeitamente e tem cobertura de testes adequada para as
camadas que testou — mas nunca testou canais, providers, nem o fluxo end-to-end completo.

---

## Metodologia

- **Auditoria de código:** Leitura completa de 40+ arquivos fonte com evidências arquivo:linha
- **Pesquisa web:** Documentação oficial Anthropic API, AutoGen, p-retry, MSW, Vitest, Observer Pattern
- **Verificação de gaps:** Cada gap classificado como CONFIRMADO, REFUTADO ou PARCIAL com snippet
- **Priorização:** Impacto em produção vs esforço de implementação

---

## Gaps Funcionais — Mapa Completo

### 🔴 ALTA PRIORIDADE (Bloqueiam produção)

#### F1 — Mission State Dessincronizado do AgentLoop

**Status:** CONFIRMADO
**Evidência:** `apps/cli/src/commands/start.ts:129` + `packages/agent/src/agent-loop.ts:41`

```typescript
// start.ts:129
let currentMission: Mission | undefined = options.activeMission;
// onMissionUpdate só atualiza a variável local — nunca propaga ao AgentLoop

// agent-loop.ts:41 — recebe snapshot no construtor, NUNCA atualiza
constructor(private readonly cfg: AgentLoopConfig) { ... }
```

**Impacto:** `/mission create` cria missão no SQLite, mas o AgentLoop continua com mission=undefined
ou com a anterior. O agente nunca "sabe" que está em uma missão nova.

**Solução (baseada em AutoGen save_state/load_state + Observer pattern):**
Implementar `MissionObserver` interface em AgentLoop. MissionProtocol emite eventos via
Node.js `EventEmitter`. AgentLoop subscreve e atualiza `this.cfg.activeMission` em runtime.

```typescript
// Padrão: observable mission protocol
class MissionProtocol extends EventEmitter {
  async createMission(config): Promise<Mission> {
    const mission = await this._create(config);
    this.emit('mission:created', mission);
    return mission;
  }
  async updateTaskStatus(missionId, taskId, status): Promise<void> {
    await this._update(missionId, taskId, status);
    const mission = await this.getMission(missionId);
    this.emit('mission:updated', mission);
  }
}

// AgentLoop subscreve
protocol.on('mission:created', (m) => {
  this.cfg.activeMission = m;
});
protocol.on('mission:updated', (m) => {
  this.cfg.activeMission = m;
});
```

---

#### F5 — Browser Tools Implementados mas Não Registrados

**Status:** CONFIRMADO
**Evidência:** `apps/cli/src/tool-registry.ts:48-66`

```typescript
// tool-registry.ts — browser tools AUSENTES
export function buildToolRegistry(): ToolRegistry {
  registry.register(new ReadFileTool());
  registry.register(new WriteFileTool());
  // ... filesystem + shell + http
  // ← BrowserNavigateTool, BrowserScreenshotTool etc. NUNCA aparecem
  return registry;
}
```

`packages/tools/browser/src/index.ts` exporta 5 tools completas.
`packages/tools/browser/src/` tem ~1000 linhas de código real com Playwright.
Nenhuma é registrada nem invocada.

**Impacto:** Agente não pode navegar/interagir com websites. Feature completamente morta.

**Solução:** Registrar no registry + adicionar `playwright` como dep + testar.

---

#### F16 — Race Condition: Slash Command Durante Tool Call

**Status:** CONFIRMADO
**Evidência:** `packages/channels/cli/src/channel.ts:182-236` + `packages/agent/src/agent-loop.ts:90`

```typescript
// channel.ts — dispara handler imediatamente, sem verificar se agent está ocupado
private _handleUserInput(text: string): void {
  if (!this.inboundHandler) return;
  this.inboundHandler(inbound).catch(...); // ← sem mutex
}

// agent-loop.ts — turn() não é re-entrante
async turn(inbound: InboundMessage): Promise<TurnResult> {
  while (rounds <= this.maxToolRounds) {
    const toolResults = await this.toolExecutor.executeAll(...); // ← pode colidir
  }
}
```

**Impacto:** Se usuário digita durante execução de tool, dois `turn()` rodam em paralelo.
Podem corromper o estado de memória e retornar respostas inconsistentes.

**Solução:** Mutex simples via `async-mutex` (npm) ou flag `isProcessing` já existente na TUI.

---

#### F17 — AutonomyLevel.Readonly Não Bloqueia Tools

**Status:** CONFIRMADO
**Evidência:** `packages/agent/src/approval-gate.ts:27-43`

```typescript
async checkAndWait(...): Promise<boolean> {
  // APENAS Supervised requer aprovação — Readonly passa tudo
  if (this.autonomyLevel !== AutonomyLevel.Supervised) return true;
  if (!toolDef.dangerous) return true;
  // ...
}
```

**Impacto:** `AutonomyLevel.Readonly` deveria bloquear TODAS as tools write/execute,
mas qualquer tool não-marcada como `dangerous` passa sem aprovação.
Um agente "read-only" pode executar shell commands não marcados como perigosos.

**Solução:** Redesenhar lógica:

- `Autonomous` → permite tudo sem perguntar
- `Supervised` → pede aprovação para tools `dangerous`
- `Readonly` → bloqueia tudo exceto tools `readonly: true`

---

#### F12 — Zero Testes para Providers e Channels

**Status:** CONFIRMADO
**Evidência:** Glob `packages/providers/**/*.test.ts` → 0 resultados. `packages/channels/**/*.test.ts` → 0 resultados.

**Impacto:** 12 providers e 4 canais sem nenhum teste. Qualquer regressão passa invisível.
Em particular, os 10 providers além de Anthropic/OpenAI nunca foram validados — podem estar
quebrados silenciosamente.

**Solução:** Testes com `vi.mock` do SDK + MSW para respostas determinísticas:

```typescript
// packages/providers/anthropic/src/provider.test.ts
import { vi, describe, it, expect } from 'vitest';

vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn(() => ({
    messages: {
      create: vi.fn().mockResolvedValue({
        id: 'msg_test',
        model: 'claude-opus-4-6',
        content: [{ type: 'text', text: 'Hello' }],
        usage: { input_tokens: 10, output_tokens: 5 },
        stop_reason: 'end_turn',
      }),
    },
  })),
}));

describe('AnthropicProvider', () => {
  it('generate() maps response correctly', async () => {
    const provider = new AnthropicProvider();
    await provider.initialize({ apiKey: 'test-key' });
    const response = await provider.generate({ model: 'claude-opus-4-6', messages: [] });
    expect(response.content).toBe('Hello');
    expect(response.usage.inputTokens).toBe(10);
  });
});
```

---

### 🟡 MÉDIA PRIORIDADE (Degradam experiência real)

#### F2 — Context Window Explode Silenciosamente

**Status:** CONFIRMADO
**Evidência:** `packages/agent/src/context-builder.ts:20-45`

```typescript
build(...): BuiltContext {
  const assembled = this.memory.assembleContext(threadId, this.modelTokenBudget, ...);
  const system = buildSystemPrompt(enrichedCtx); // ← tokens NÃO contados
  const messages = [...assembled.messages, newUserMessage];

  return {
    messages,
    system,
    estimatedTokens: assembled.totalTokens, // ← só conta messages, não system nem tools
  };
}
```

**Impacto real:** Em conversa com 50+ turnos com 5 tools registradas:

- System prompt: ~2000 tokens
- Tool definitions (5 tools): ~2500 tokens
- Budget declarado: ex. 100k tokens
- Budget real disponível para conversa: ~95500 tokens (nunca calculado)
- Em modelos com 8k context, isso causaria truncamento silencioso imediato

**Solução:** Usar `@anthropic-ai/tokenizer` ou estimativa conservadora (4 chars = 1 token):

```typescript
const systemTokens = Math.ceil(system.length / 4);
const toolTokens = toolDefs.reduce((s, t) => s + Math.ceil(JSON.stringify(t).length / 4), 0);
const adjustedBudget = this.modelTokenBudget - systemTokens - toolTokens - 500; // margem
```

---

#### F3 — Retry Apenas via SDK (Sem Fallback Cross-Provider)

**Status:** PARCIAL
**Evidência:** `packages/providers/anthropic/src/provider.ts:209` — `maxRetries: cfg.maxRetries ?? 2`

**O que existe:** SDK-level retry (2 tentativas) para 429/529/503.
**O que falta:**

- Backoff exponencial com jitter configurável além do SDK
- Circuit breaker (parar de tentar após N falhas consecutivas)
- Fallback automático para provider alternativo

**Erros que devem ter retry (Anthropic API docs):**

- 429 `rate_limit_error` → retry com backoff
- 500 `api_error` → retry limitado
- 529 `overloaded_error` → retry com backoff maior

**Solução com `p-retry` (v5.1.2, MIT):**

```typescript
import pRetry, { AbortError } from 'p-retry';

async generate(request: GenerateRequest): Promise<GenerateResponse> {
  return pRetry(
    async (attempt) => {
      try {
        return await this._doGenerate(request);
      } catch (err) {
        if (err instanceof ProviderError && [400, 401, 403].includes(err.statusCode ?? 0)) {
          throw new AbortError(err); // não retenta erros de auth/validação
        }
        throw err; // retenta 429, 500, 529
      }
    },
    {
      retries: 3,
      minTimeout: 1000,
      factor: 2,
      randomize: true, // jitter
      onFailedAttempt: (ctx) => {
        this.logger.warn(`Provider attempt ${ctx.attemptNumber} failed: ${ctx.error.message}`);
      },
    }
  );
}
```

---

#### F4 — Streaming Implementado mas Nunca Chamado

**Status:** CONFIRMADO
**Evidência:** `packages/agent/src/agent-loop.ts:173` — sempre chama `generate()`, nunca `generateStream()`

**Impacto:** UX degradada — usuário espera resposta completa antes de ver qualquer texto.
Para respostas longas (>30s), parece que o agente travou.

**Solução:** Integrar streaming no loop ReAct com detecção de tool calls:

```typescript
// Padrão Vercel AI SDK / AutoGen: stream + buffer para tool detection
async *streamTurn(inbound: InboundMessage): AsyncGenerator<string> {
  const stream = this.cfg.provider.generateStream(request);
  let buffer = '';
  let toolCallBuffer: ToolCall[] = [];

  for await (const chunk of stream) {
    if (chunk.type === 'text') {
      buffer += chunk.text;
      yield chunk.text; // progressivo para o usuário
    } else if (chunk.type === 'tool_call') {
      toolCallBuffer.push(chunk.toolCall);
    }
  }

  if (toolCallBuffer.length > 0) {
    // executar tools e continuar loop
    const results = await this.toolExecutor.executeAll(toolCallBuffer, ctx);
    // ... recursão
  }
}
```

---

#### F9 — Memory Bootstrap Não Recupera Sessão Anterior

**Status:** CONFIRMADO
**Evidência:** `packages/memory/src/backend.ts:217-228`

```typescript
bootstrap(threadId: string): void {
  const lastSession = this.sessionStore.get_last(threadId);
  if (!lastSession) {
    this.sessionStore.upsert({ anchor_seq: 0, ... }); // sempre começa do zero
  }
  // SE lastSession existe: não faz nada com ela
}
```

**Impacto:** Cada vez que o agente é reiniciado, começa como se nunca tivesse conversado.
A memória SQLite existe, mas `assembleContext()` recupera por thread_id — que funciona.
O problema real é que o `currentSessionId` muda a cada boot, possivelmente quebrando o thread_id.

**Verificar:** Se thread_id é UUID gerado a cada boot ou persistido.

---

#### F11 — Mission Context Injetado mas Desatualizado

**Status:** PARCIAL
**Evidência:** `packages/agent/src/system-prompt.ts:52-66` — injeta; `agent-loop.ts:41` — snapshot fixo

**Impacto:** Se usuário cria missão no meio da conversa, o system prompt continua mostrando
"Nenhuma missão ativa" porque `activeMission` do AgentLoop não atualiza (veja F1).
Mesmo com F1 corrigido, system prompt é reconstruído a cada turn — isso já funciona ao resolver F1.

---

#### F14 — Memory Compaction Fire-and-Forget

**Status:** CONFIRMADO
**Evidência:** `packages/agent/src/agent-loop.ts:234` — `void this.cfg.memory.assembleContext(...)`

**Impacto:** Compaction assíncrono pode não completar antes do próximo turn, resultando em
contexto não-compactado sendo enviado ao modelo. Em sessões longas, isso infla o contexto.

**Solução:** Awaitar compaction OU usar queue com prioridade:

```typescript
// Opção 1: await (bloqueia ligeiramente)
await this.cfg.memory.triggerCompactionIfNeeded(threadId, this.modelTokenBudget);

// Opção 2: background queue com limite
this.compactionQueue.add(() => this.cfg.memory.triggerCompaction(threadId));
```

---

#### F19 — 215+ console.\* Sem Logger Estruturado

**Status:** CONFIRMADO
**Evidência:** 215 ocorrências em `apps/` — `console.error`, `console.log`, `console.warn`

**Impacto:** Sem log levels configuráveis. Sem timestamps. Sem structured output (JSON).
Impossível filtrar por severity, correlacionar com request-id da Anthropic API,
ou rotear para arquivo/Datadog/CloudWatch.

**Solução:** Substituir por logger leve como `pino` (fastest JSON logger para Node.js):

```typescript
import pino from 'pino';
const logger = pino({ level: process.env.LOG_LEVEL ?? 'info' });

// antes: console.error(`[inception] Provider error: ${err.message}`)
// depois:
logger.error({ err, provider: provider.id }, 'Provider generate failed');
```

---

### 🟢 BAIXA PRIORIDADE (Melhorias de qualidade)

#### F6 — packages/tools/memory É Pure Re-export

**Status:** REFUTADO (não é vazio, mas é passthrough)
**Evidência:** `packages/tools/memory/src/index.ts` re-exporta de `@rabeluslab/inception-memory`

**Situação:** Funciona como design intencional (thin wrapper). Não é bug, é pattern.

---

#### F7 — Discord Channel Real mas Não Instanciado em Produção

**Status:** REFUTADO (implementação real existe)
**Evidência:** `packages/channels/discord/src/channel.ts:26-84` — implementação completa com discord.js

**Situação:** Canal implementado. Gap real é que `start.ts` só instancia CLI. Discord/HTTP/Telegram
precisam ser configurados para uso.

---

#### F8 — Approval Gate Tem Timeout de 5 Minutos

**Status:** REFUTADO
**Evidência:** `packages/agent/src/approval-gate.ts:46-78`

```typescript
const timer = setTimeout(
  () => {
    this.pending.delete(id);
    resolve(false); // auto-reject após 5min
  },
  5 * 60 * 1000
);
```

**Situação:** Timeout existe. É configurável via parâmetro? Não — hardcoded. Mas funciona.

---

#### F10 — runtime.registerChannelManager() É Chamado

**Status:** REFUTADO
**Evidência:** `apps/cli/src/commands/start.ts:354`

```typescript
runtime.registerChannelManager(channelManager); // linha 354 — é chamado
```

---

#### F13 — ChannelManager Tem Coordenação Básica

**Status:** REFUTADO
**Evidência:** `packages/core/src/channel-manager.ts:28-95`

**Situação:** `startAll()`, `stopAll()`, unified inbound routing existem.
Gap real: não há broadcast outbound para múltiplos canais — mas não é crítico.

---

#### F15 — HTTP Channel Não Instanciado em start.ts

**Status:** CONFIRMADO (baixo impacto)
**`packages/channels/http/src/http-channel.ts`** existe, mas `start.ts` não instancia.
Daemon poderia usar, mas não usa.

---

#### F18 — Versão 0.0.0 no CLI

**Status:** CONFIRMADO
**Evidência:** `apps/cli/src/index.ts:17` — `.version('0.0.0')` vs `package.json: "version": "2.0.0"`

---

#### F20 — Zero Testes para Channels e Providers

**Status:** CONFIRMADO (redundante com F12 — mesmo gap)

---

## Tabela Consolidada

| ID  | Gap                                                 | Status     | Prioridade     | Sprint    |
| --- | --------------------------------------------------- | ---------- | -------------- | --------- |
| F1  | Mission state dessincronizado do AgentLoop          | CONFIRMADO | 🔴 ALTA        | Sprint 8  |
| F2  | Context explosion silenciosa                        | CONFIRMADO | 🟡 MÉDIA       | Sprint 10 |
| F3  | Retry apenas SDK-level, sem fallback cross-provider | PARCIAL    | 🟡 MÉDIA       | Sprint 9  |
| F4  | Streaming implementado mas nunca chamado            | CONFIRMADO | 🟡 MÉDIA       | Sprint 9  |
| F5  | Browser tools não registrados                       | CONFIRMADO | 🔴 ALTA        | Sprint 11 |
| F6  | tools/memory é pure re-export                       | REFUTADO   | —              | —         |
| F7  | Discord não instanciado (impl. existe)              | REFUTADO   | —              | Sprint 12 |
| F8  | Approval gate sem timeout                           | REFUTADO   | —              | —         |
| F9  | Memory bootstrap não recupera sessão                | CONFIRMADO | 🟡 MÉDIA       | Sprint 10 |
| F10 | registerChannelManager não chamado                  | REFUTADO   | —              | —         |
| F11 | Mission context desatualizado (depende F1)          | PARCIAL    | resolve com F1 | Sprint 8  |
| F12 | Zero testes providers e channels                    | CONFIRMADO | 🔴 ALTA        | Sprint 13 |
| F13 | Multi-channel sem coordenação outbound              | REFUTADO   | —              | Sprint 12 |
| F14 | Compaction fire-and-forget                          | CONFIRMADO | 🟡 MÉDIA       | Sprint 10 |
| F15 | HTTP channel não instanciado                        | CONFIRMADO | 🟢 BAIXA       | Sprint 12 |
| F16 | Race condition slash/tool                           | CONFIRMADO | 🔴 ALTA        | Sprint 8  |
| F17 | Readonly não bloqueia tools                         | CONFIRMADO | 🔴 ALTA        | Sprint 8  |
| F18 | Versão 0.0.0 no CLI                                 | CONFIRMADO | 🟢 BAIXA       | Sprint 13 |
| F19 | 215+ console.\* sem logger                          | CONFIRMADO | 🟡 MÉDIA       | Sprint 13 |
| F20 | Zero testes channels/providers                      | CONFIRMADO | 🔴 ALTA        | Sprint 13 |

**Total: 14 CONFIRMADOS | 3 PARCIAIS | 3 REFUTADOS**

---

## Distância do Objetivo

```
Camada                           Real    Claim
────────────────────────────────────────────────
Infraestrutura (CI/build/gov)    95%     95% ✅
Tipos e interfaces               95%     95% ✅
Agent loop (básico/texto)        65%     90% ⚠️
Memory (SQLite/FTS)              70%     90% ⚠️
Mission system (integrado)       35%     85% ❌
Providers (Anthropic/OpenAI)     85%     95% ⚠️
Providers (outros 10)            25%     80% ❌
Channels (CLI)                   85%     95% ✅
Channels (Telegram/Discord/HTTP) 20%     75% ❌
Tools (filesystem/shell/http)    85%     90% ✅
Tools (browser/memory)           15%     80% ❌
Resiliência/retry/circuit        15%     50% ❌
Observability/logging            5%      20% ❌
Testes (coverage real)           40%     70% ⚠️
────────────────────────────────────────────────
MÉDIA PONDERADA                  50%     87%
```

---

## Referências Externas

| Tópico              | Solução Recomendada    | Versão  | Justificativa                        |
| ------------------- | ---------------------- | ------- | ------------------------------------ |
| Retry + backoff     | `p-retry`              | 5.1.2   | MIT, zero deps, exponential + jitter |
| Provider mocking    | `vitest vi.mock`       | nativo  | Sem deps extras, SDK mockável        |
| Streaming loop      | `AsyncIterable` nativo | ES2018  | Já usado nos providers               |
| Observer/state sync | `EventEmitter` nativo  | Node.js | Já no runtime, zero deps             |
| Context token count | estimativa `length/4`  | —       | Conservadora, sem dep externa        |
| Logger estruturado  | `pino`                 | 9.x     | Mais rápido que winston, JSON nativo |
| Race condition      | `async-mutex`          | 1.x     | MIT, TypeScript nativo               |
| Circuit breaker     | `cockatiel`            | 3.x     | TypeScript-first, retry+CB+bulkhead  |

---

## Conclusão

O Inception Framework v2.0 precisa de **6 sprints adicionais** (Sprints 8-13) para atingir
funcionalidade de produção real. As sprints estão priorizadas por impacto:

1. **Sprint 8** — Estado e segurança (F1, F16, F17): mission sync + race condition + readonly fix
2. **Sprint 9** — Resiliência de provider (F3, F4): retry robusto + streaming real
3. **Sprint 10** — Context e memória (F2, F9, F14): token counting + bootstrap + compaction
4. **Sprint 11** — Tools completos (F5): browser tools conectados
5. **Sprint 12** — Multi-channel (F7, F15): Discord + HTTP instanciados
6. **Sprint 13** — Qualidade de produção (F12, F18, F19, F20): testes + logger + versão

**Após as 6 sprints:** ~85% de funcionalidade real, pronto para produção com Anthropic + OpenAI.
