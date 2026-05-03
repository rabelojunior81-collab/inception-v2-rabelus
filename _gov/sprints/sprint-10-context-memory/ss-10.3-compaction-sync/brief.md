# Brief — ss-10.3: compaction-sync

**Status:** ⏳ pending
**Resolve:** F14 (compaction fire-and-forget com void)
**Sprint:** 10

---

## Problema

`void this.cfg.memory.assembleContext(...)` no AgentLoop é fire-and-forget.
Compaction pode não completar antes do próximo turn, resultando em contexto não-compactado
sendo enviado ao modelo repetidamente.

**Evidência:** `packages/agent/src/agent-loop.ts:234`

## Implementação

### Estratégia: compaction com timeout

Não bloqueamos o usuário (compaction pode demorar), mas esperamos até um limite razoável:

```typescript
// packages/agent/src/agent-loop.ts
// Após enviar resposta ao canal, antes de retornar do turn():

const COMPACTION_TIMEOUT_MS = 2000;

async _triggerCompactionWithTimeout(threadId: string): Promise<void> {
  const compactionPromise = this.cfg.memory.triggerCompactionIfNeeded(
    threadId,
    this.modelTokenBudget
  );

  const timeoutPromise = new Promise<void>((resolve) =>
    setTimeout(resolve, COMPACTION_TIMEOUT_MS)
  );

  await Promise.race([compactionPromise, timeoutPromise]);
  // Se timeout: compaction foi abandonada silenciosamente — OK para UX
  // Próximo turn vai tentar novamente
}
```

### `packages/memory/src/backend.ts`

Expor método de compaction separado:

```typescript
async triggerCompactionIfNeeded(threadId: string, budget: number): Promise<void> {
  const current = await this.assembleContext(threadId, budget);
  if (current.totalTokens > budget * 0.8) {
    await this.compact(threadId);
  }
}
```

## Critério de Aceite

- Compaction é iniciada e awaited com timeout de 2s
- Se timeout: continua sem erro (graceful)
- Próximo turn sempre inicia compaction novamente se necessário
- Sem regressão em testes existentes
