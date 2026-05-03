# Brief — ss-9.1: retry-with-p-retry

**Status:** ⏳ pending
**Resolve:** F3 (retry apenas SDK-level, sem backoff configurável e sem fallback)
**Sprint:** 9

---

## Problema

Providers têm `maxRetries: cfg.maxRetries ?? 2` no SDK — isso faz 2 retentativas automáticas
com backoff do próprio SDK (não configurável). Não há:

- Backoff exponencial com jitter customizável
- Circuit breaker (parar de tentar após N falhas)
- Fallback para outro provider
- Logging de tentativas para observability

## Erros Anthropic API (fonte: docs oficiais 2025)

| Status | Tipo                    | Retry?                 |
| ------ | ----------------------- | ---------------------- |
| 400    | `invalid_request_error` | ❌ Não                 |
| 401    | `authentication_error`  | ❌ Não                 |
| 402    | `billing_error`         | ❌ Não                 |
| 403    | `permission_error`      | ❌ Não                 |
| 413    | `request_too_large`     | ❌ Não                 |
| 429    | `rate_limit_error`      | ✅ Sim + backoff       |
| 500    | `api_error`             | ✅ Sim (limitado)      |
| 529    | `overloaded_error`      | ✅ Sim + backoff maior |

## Implementação

### `packages/types/src/providers.ts`

Adicionar ao `ProviderConfig`:

```typescript
interface ProviderConfig {
  // ... campos existentes
  retry?: {
    retries?: number; // default: 3
    minTimeout?: number; // default: 1000ms
    maxTimeout?: number; // default: 30000ms
    factor?: number; // default: 2
  };
}
```

### Base provider (novo arquivo `packages/providers/base/src/retry.ts`)

```typescript
import pRetry, { AbortError } from 'p-retry';

const NON_RETRYABLE_STATUS = new Set([400, 401, 402, 403, 413]);

export async function withRetry<T>(
  fn: () => Promise<T>,
  options?: { retries?: number; minTimeout?: number; factor?: number; randomize?: boolean },
  onAttempt?: (attempt: number, error: Error) => void
): Promise<T> {
  return pRetry(
    async () => {
      try {
        return await fn();
      } catch (err) {
        // Não retentar erros de client (4xx exceto 429)
        if (err instanceof ProviderError && NON_RETRYABLE_STATUS.has(err.statusCode ?? 0)) {
          throw new AbortError(err);
        }
        throw err;
      }
    },
    {
      retries: options?.retries ?? 3,
      minTimeout: options?.minTimeout ?? 1000,
      factor: options?.factor ?? 2,
      randomize: options?.randomize ?? true, // jitter
      onFailedAttempt: (ctx) => {
        onAttempt?.(ctx.attemptNumber, ctx.error);
      },
    }
  );
}
```

### Aplicar em cada provider

```typescript
// packages/providers/anthropic/src/provider.ts
async generate(request: GenerateRequest): Promise<GenerateResponse> {
  return withRetry(
    () => this._doGenerate(request),
    this.retryConfig,
    (attempt, err) => {
      // F19: quando logger existir, usar logger.warn
      // por ora: sem console, silencioso até Sprint 13
    }
  );
}
```

### Aplicar em: anthropic, openai, gemini, ollama, kimi, zai, bailian, openrouter, kilo, opencode-zen

## Critério de Aceite

- `pnpm add p-retry@^5.1.2` adicionado ao workspace root
- Cada provider usa `withRetry()` em `generate()` e `generateStream()`
- 429/529/500 são retentados com backoff exponencial + jitter
- 400/401/403 lançam imediatamente (sem retry)
- Testes com `vi.mock` verificando: 2 falhas + 1 sucesso = retorna sucesso
