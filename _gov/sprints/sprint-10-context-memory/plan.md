# Sprint 10: Context & Memory

**Status:** ⏳ pending
**Branch:** `feat/gov-sprint-10`
**Motivação:** Context window explode silenciosamente. Compaction é fire-and-forget. Bootstrap não recupera sessão.
**Origem:** Auditoria funcional 2026-03-30 (F2, F9, F14)
**Após:** Sprint 9 (streaming informará o budget real necessário)

---

## Contexto

O sistema de memória SQLite é sólido, mas tem 3 brechas que causam degradação em conversas
longas (50+ turnos): context overflow silencioso, compaction assíncrona não esperada,
e bootstrap que não reconstrói o estado da sessão anterior.

---

## Sub-sprints

| SS      | Nome             | Gap resolve | Paralela?         |
| ------- | ---------------- | ----------- | ----------------- |
| ss-10.1 | token-counting   | F2          | — (primeiro)      |
| ss-10.2 | memory-bootstrap | F9          | paralela com 10.1 |
| ss-10.3 | compaction-sync  | F14         | após 10.1         |

---

## Decisões

**Token counting:** Estimativa conservadora (`chars / 4`) sem dep externa.
Para precisão futura: `@anthropic-ai/tokenizer` ou `tiktoken-node` — deixar como TODO.

**Bootstrap:** Thread_id deve ser persistido entre sessões (não gerado novo a cada boot).
Verificar se há thread_id em config/DB antes de gerar UUID novo.

**Compaction:** Aguardar com timeout (ex: 2s). Se não terminar, continua sem compactar.

---

## Critério de Aceite Sprint 10

```
[ ] Context builder conta: messages + system prompt + tool definitions
[ ] Warning no log se context > 90% do budget
[ ] Truncamento inteligente se context > 95% do budget
[ ] Bootstrap recupera thread_id de sessão anterior (mesmo usuário/agente)
[ ] Compaction awaited com timeout de 2s (não fire-and-forget)
[ ] pnpm test → sem regressão
```
