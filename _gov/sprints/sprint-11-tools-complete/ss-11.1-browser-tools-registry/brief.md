# Brief — ss-11.1: browser-tools-registry

**Status:** ⏳ pending
**Resolve:** F5 (browser tools não registradas no ToolRegistry)
**Sprint:** 11

---

## Problema

`apps/cli/src/tool-registry.ts:48-66` nunca instancia nem registra as 5 browser tools.
Playwright não está em nenhum `package.json`. `BrowserSession` singleton nunca é inicializado.

## Investigação Preliminar

Verificar `packages/tools/browser/src/session.ts`:

- Como `BrowserSession` é gerenciado? Singleton lazy? Precisa de `await session.init()`?
- O que acontece se Playwright não estiver instalado? Erro na importação ou na execução?

## Implementação

### 1. `packages/tools/browser/package.json`

```json
{
  "dependencies": {
    "playwright": "^1.50.0"
  }
}
```

### 2. `apps/cli/src/tool-registry.ts`

```typescript
import {
  BrowserNavigateTool,
  BrowserScreenshotTool,
  BrowserClickTool,
  BrowserFillTool,
  BrowserSelectTool,
} from '@rabeluslab/inception-tool-browser';

export function buildToolRegistry(options: { enableBrowser?: boolean } = {}): ToolRegistry {
  const registry = new ToolRegistry();

  // Filesystem tools
  registry.register(new ReadFileTool());
  // ... existentes

  // Browser tools (opcional — requer Playwright instalado)
  if (options.enableBrowser !== false) {
    try {
      registry.register(new BrowserNavigateTool());
      registry.register(new BrowserScreenshotTool());
      registry.register(new BrowserClickTool());
      registry.register(new BrowserFillTool());
      registry.register(new BrowserSelectTool());
    } catch {
      // Playwright não instalado — browser tools desabilitadas silenciosamente
      // F19: quando logger existir → logger.warn('Browser tools disabled: Playwright not found')
    }
  }

  return registry;
}
```

### 3. `apps/cli/src/commands/start.ts`

```typescript
const toolRegistry = buildToolRegistry({
  enableBrowser: cfg.tools?.browser?.enabled ?? true,
});
```

### 4. `packages/config/src/schema.ts`

```typescript
tools?: {
  browser?: { enabled?: boolean };
};
```

### 5. Shutdown graceful

```typescript
// start.ts — no shutdown handler
process.on('SIGINT', async () => {
  await browserSession.close(); // fechar Playwright
  await runtime.stop();
});
```

## Critério de Aceite

- `playwright` em `packages/tools/browser/package.json`
- 5 browser tools registradas no registry
- Startup sem Playwright: warning silencioso, sem crash
- Config `tools.browser.enabled: false` desabilita browser tools
