# Brief — ss-10.1: token-counting

**Status:** ⏳ pending
**Resolve:** F2 (context window explode silenciosamente)
**Sprint:** 10

---

## Problema

`ContextBuilder.build()` retorna `estimatedTokens: assembled.totalTokens` que conta apenas
as mensagens do histórico. System prompt (~2000 tokens) e tool definitions (~500 tokens/tool)
não são contados. Em modelos com context pequeno (8k-32k), isso causa truncamento silencioso.

**Evidência:** `packages/agent/src/context-builder.ts:20-45`

## Implementação

### `packages/agent/src/context-builder.ts`

```typescript
private estimateTokens(text: string): number {
  // Estimativa conservadora: 4 chars ≈ 1 token (Unicode-aware)
  // Fonte: Anthropic/OpenAI documentation + empirical average
  return Math.ceil(text.length / 3.5); // ligeiramente conservador
}

private estimateToolTokens(tools: ToolDefinition[]): number {
  return tools.reduce((sum, t) => {
    const toolJson = JSON.stringify({
      name: t.name,
      description: t.description,
      parameters: t.parameters,
    });
    return sum + this.estimateTokens(toolJson);
  }, 0);
}

build(
  threadId: string,
  newUserMessage: Message,
  systemCtx: SystemPromptContext,
  tools: ToolDefinition[] = []
): BuiltContext {
  const system = buildSystemPrompt(systemCtx);
  const systemTokens = this.estimateTokens(system);
  const toolTokens = this.estimateToolTokens(tools);
  const overhead = 500; // margem de segurança para metadados

  const adjustedBudget = Math.max(
    this.modelTokenBudget - systemTokens - toolTokens - overhead,
    1000 // mínimo de 1000 tokens para histórico
  );

  const assembled = this.memory.assembleContext(threadId, adjustedBudget, this.freshTailCount);

  const totalEstimated = systemTokens + toolTokens + assembled.totalTokens + overhead;
  const budgetUsagePct = (totalEstimated / this.modelTokenBudget) * 100;

  if (budgetUsagePct > 90) {
    // F19: quando logger existir → logger.warn(...)
    // por ora: sem console (Sprint 13 resolve)
  }

  return {
    messages: [...assembled.messages, newUserMessage],
    system,
    estimatedTokens: totalEstimated,
    budgetUsagePct,
    hasSummaries: assembled.hasSummaries,
  };
}
```

### `packages/types/src/agent.ts` (ou onde BuiltContext é definido)

Adicionar `budgetUsagePct` ao tipo:

```typescript
interface BuiltContext {
  messages: Message[];
  system: string;
  estimatedTokens: number;
  budgetUsagePct: number; // NOVO — 0-100
  hasSummaries: boolean;
}
```

### `packages/agent/src/agent-loop.ts`

Passar tools ao context builder:

```typescript
const toolDefs = this._buildToolDefs();
const built = this.contextBuilder.build(threadId, userMessage, systemCtx, toolDefs);
```

## Critério de Aceite

- `build()` recebe tools e as inclui no budget calculation
- `estimatedTokens` inclui system + tools + messages
- `budgetUsagePct` disponível para logging/warning futuro
- Testes: context com 5 tools + system prompt → estimatedTokens > só messages
