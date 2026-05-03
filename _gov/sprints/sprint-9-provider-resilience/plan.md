# Sprint 9: Provider Resilience

**Status:** ⏳ pending
**Branch:** `feat/gov-sprint-9`
**Motivação:** Providers falham silenciosamente. Streaming existe mas nunca é usado.
**Origem:** Auditoria funcional 2026-03-30 (F3, F4)
**Bloqueia:** Sprint 10 (context management depende de agent loop com streaming)

---

## Contexto

Em produção real, rate limits (429) e sobrecarga (529) da Anthropic API são frequentes.
O SDK já tem `maxRetries: 2`, mas sem backoff configurável e sem fallback cross-provider.

Paralelamente, todos os 12 providers implementam `generateStream()`, mas o AgentLoop sempre
chama `generate()` bloqueante. Respostas longas parecem travamentos.

---

## Sub-sprints

| SS     | Nome                 | Gap resolve | Paralela?        |
| ------ | -------------------- | ----------- | ---------------- |
| ss-9.1 | retry-with-p-retry   | F3          | paralela com 9.2 |
| ss-9.2 | streaming-agent-loop | F4          | paralela com 9.1 |
| ss-9.3 | provider-fallback    | —           | após 9.1         |

---

## Dependências

```
npm install p-retry@^5.1.2   (root devDependencies ou em cada provider)
```

p-retry: MIT license, zero deps, 3.8kb minified. Referência: https://github.com/sindresorhus/p-retry

---

## Critério de Aceite Sprint 9

```
[ ] Providers retentam 429/529/500 com backoff exponencial + jitter
[ ] Erros 400/401/403 não são retentados (AbortError)
[ ] AgentLoop usa generateStream() para respostas progressivas
[ ] CLI exibe texto progressivamente (não espera resposta completa)
[ ] Tool calls detectados durante stream, acumulados para execução
[ ] Se provider A falha após retries, tenta provider B (fallback configurável)
[ ] pnpm test → sem regressão
```
