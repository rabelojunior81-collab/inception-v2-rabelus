# Brief — ss-10.2: memory-bootstrap

**Status:** ⏳ pending
**Resolve:** F9 (memory bootstrap recomeça do zero a cada sessão)
**Sprint:** 10

---

## Problema

`SQLiteMemoryBackend.bootstrap()` cria nova sessão se não houver anterior, mas se houver
anterior, não faz nada útil com ela. `anchor_seq: 0` sempre — nunca resume de onde parou.

Verificar também: `thread_id` é gerado como UUID novo a cada boot? Se sim, CADA sessão tem
thread_id diferente e o histórico da memória nunca é recuperado — pior cenário.

**Evidência:** `packages/memory/src/backend.ts:217-228`

## Investigação Necessária

Antes de implementar, verificar em `apps/cli/src/commands/start.ts`:

1. Como `threadId` é gerado? `crypto.randomUUID()`? Ou persistido?
2. Se UUID novo a cada boot → fix principal: persistir thread_id em config ou DB

## Implementação

### Caso A: thread_id é novo a cada boot (pior caso)

```typescript
// apps/cli/src/commands/start.ts
// Ao invés de gerar UUID:
const threadId = await resolveThreadId(dbPath, cfg.agent.identity.id);
```

```typescript
// novo helper: packages/memory/src/thread-resolver.ts
export async function resolveThreadId(dbPath: string, agentId: string): Promise<string> {
  const db = openDatabase(dbPath);
  const row = db
    .prepare(
      `SELECT thread_id FROM sessions
     WHERE agent_id = ?
     ORDER BY started_at DESC LIMIT 1`
    )
    .get(agentId) as { thread_id: string } | undefined;

  if (row) return row.thread_id; // reutiliza thread anterior

  const newId = crypto.randomUUID();
  db.prepare(`INSERT INTO sessions (thread_id, agent_id, started_at) VALUES (?, ?, ?)`).run(
    newId,
    agentId,
    new Date().toISOString()
  );
  return newId;
}
```

### Caso B: thread_id já é persistido (melhor caso)

Apenas garantir que `bootstrap()` usa o `anchor_seq` correto:

```typescript
bootstrap(threadId: string): void {
  const lastSession = this.sessionStore.get_last(threadId);
  if (!lastSession) {
    this.sessionStore.upsert({
      id: this.currentSessionId,
      thread_id: threadId,
      started_at: new Date().toISOString(),
      ended_at: null,
      anchor_seq: 0,
    });
  } else {
    // Criar nova sessão apontando para o anchor da última
    const lastAnchor = this._getLastMessageSeq(threadId);
    this.sessionStore.upsert({
      id: this.currentSessionId,
      thread_id: threadId,
      started_at: new Date().toISOString(),
      ended_at: null,
      anchor_seq: lastAnchor, // continua do fim da última sessão
    });
  }
}
```

## Critério de Aceite

- Ao reiniciar o agente, histórico de conversa anterior é recuperado
- `assembleContext()` retorna mensagens da sessão anterior (não só da atual)
- Thread_id é consistente entre sessões para o mesmo agente
- Teste: criar sessão, escrever 10 mensagens, reiniciar backend, `assembleContext()` retorna as 10
