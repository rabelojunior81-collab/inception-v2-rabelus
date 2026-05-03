# Brief — ss-9.3: provider-fallback

**Status:** ⏳ pending
**Resolve:** Ausência de fallback cross-provider (não era gap numerado, mas bloqueador de produção)
**Sprint:** 9

---

## Problema

Se o provider configurado fica indisponível (ex: Anthropic overload, OpenAI rate limit),
o agente morre. Não há mecanismo para tentar um provider alternativo.

## Implementação

### `packages/config/src/schema.ts`

Adicionar ao `AgentConfig`:

```typescript
interface AgentConfig {
  // ...
  fallbackProviders?: ProviderId[]; // ex: ['openai', 'ollama']
}
```

### `apps/cli/src/commands/start.ts`

Criar `ProviderWithFallback` wrapper:

```typescript
async function createProviderWithFallback(
  cfg: RuntimeConfig,
  factory: ProviderFactory
): Promise<IProvider> {
  const primary = await factory.create(cfg.provider);

  if (!cfg.agent.fallbackProviders?.length) return primary;

  return new FallbackProvider(
    primary,
    cfg.agent.fallbackProviders.map((id) => factory.create({ id, ...cfg.fallbackConfig }))
  );
}
```

### Novo `packages/core/src/fallback-provider.ts`

```typescript
export class FallbackProvider implements IProvider {
  constructor(
    private readonly primary: IProvider,
    private readonly fallbacks: Promise<IProvider>[]
  ) {}

  async generate(request: GenerateRequest): Promise<GenerateResponse> {
    try {
      return await this.primary.generate(request);
    } catch (err) {
      for (const fallbackPromise of this.fallbacks) {
        try {
          const fallback = await fallbackPromise;
          return await fallback.generate(request);
        } catch {
          continue;
        }
      }
      throw err; // todos falharam
    }
  }
}
```

## Critério de Aceite

- Config aceita `fallbackProviders: ['openai']`
- Se Anthropic falha após retries, tenta OpenAI automaticamente
- Teste: mock primary sempre falha → fallback responde → agent retorna resposta
