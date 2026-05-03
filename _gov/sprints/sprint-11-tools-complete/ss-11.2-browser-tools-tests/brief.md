# Brief — ss-11.2: browser-tools-tests

**Status:** ⏳ pending
**Resolve:** Testes para browser tools (complementa F5)
**Sprint:** 11

---

## Problema

Após registrar as browser tools (ss-11.1), garantir que funcionam via testes.
Playwright real não pode rodar em CI headless facilmente — usar mocks.

## Implementação

### `packages/tools/browser/src/tools/browser-navigate.test.ts`

```typescript
import { vi, describe, it, expect } from 'vitest';

// Mock Playwright
vi.mock('playwright', () => ({
  chromium: {
    launch: vi.fn().mockResolvedValue({
      newPage: vi.fn().mockResolvedValue({
        goto: vi.fn().mockResolvedValue(null),
        title: vi.fn().mockResolvedValue('Test Page'),
        url: vi.fn().mockReturnValue('https://example.com'),
        close: vi.fn(),
      }),
      close: vi.fn(),
    }),
  },
}));

describe('BrowserNavigateTool', () => {
  it('navega para URL na allowlist', async () => {
    const tool = new BrowserNavigateTool();
    const ctx = buildExecutionContext({
      allowedUrls: ['https://example.com'],
      securityManager: mockSecurityManager({ validateNetworkRequest: () => true }),
    });

    const result = await tool.execute({ url: 'https://example.com' }, ctx);
    expect(result.success).toBe(true);
    expect(result.data?.url).toBe('https://example.com');
  });

  it('bloqueia URL fora da allowlist', async () => {
    const tool = new BrowserNavigateTool();
    const ctx = buildExecutionContext({
      allowedUrls: ['https://example.com'],
      securityManager: mockSecurityManager({ validateNetworkRequest: () => false }),
    });

    const result = await tool.execute({ url: 'https://evil.com' }, ctx);
    expect(result.success).toBe(false);
    expect(result.error).toContain('blocked');
  });
});
```

## Critério de Aceite

- Testes de smoke para BrowserNavigateTool (navigate, blocked URL)
- Testes para BrowserScreenshotTool (captura com mock)
- Todos passam em CI sem Playwright real instalado
- `pnpm test` → 131+ testes (adicionar estes)
