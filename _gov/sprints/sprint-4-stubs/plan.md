# Sprint 4 — Stubs: Plano Vivo

**Objetivo:** Implementar os 3 stubs explícitos (Discord, Browser, tools/memory) e documentar os 9 ProviderId sem pacote.
**Status:** ⏳ pending
**Branch:** `feat/gov-sprint-4` (criar a partir de `feat/gov-sprint-3`)
**Bloqueadores:** Sprint 3 (soft — CI valida implementações)
**Bloqueia:** Sprint 5 (soft)

---

## Sub-sprints

| SS | Nome | Gaps resolve | Status | Paralela? |
|----|------|-------------|--------|-----------|
| ss-4.1 | spec-discord-channel | G5 (parcial) | ⏳ pending | — (primeiro) |
| ss-4.2 | impl-discord-channel | G5 (parcial) | ⏳ pending | depois 4.1 |
| ss-4.3 | spec-browser-tool | — | ⏳ pending | com 4.1 |
| ss-4.4 | impl-browser-tool | — | ⏳ pending | depois 4.3 |
| ss-4.5 | fix-tools-memory-package | G11 (finaliza) | ⏳ pending | com 4.1, 4.3 |
| ss-4.6 | cleanup-provider-enum | G3, G5 | ⏳ pending | com 4.1, 4.3 |

**SS 4.1 e 4.3 podem rodar em paralelo.**
**SS 4.2 depende de 4.1. SS 4.4 depende de 4.3.**
**SS 4.5 e 4.6 são independentes.**

---

## Arquivos Críticos

| Arquivo | Gap | O que fazer |
|---------|-----|-------------|
| `packages/channels/discord/src/index.ts` | G5 | Implementar `DiscordChannel` implementando `IChannel` |
| `packages/tools/browser/src/index.ts` | — | Implementar `BrowserTool` com Playwright |
| `packages/tools/memory/src/index.ts` | G11 | Re-exportar tools de `packages/memory/src/tools/` |
| `packages/types/src/providers.ts` | G3, G5 | 9 ProviderId sem pacote → JSDoc `@future` |

---

## Specs Técnicas de Referência

### DiscordChannel (ss-4.1/4.2)
- Seguir padrão de `packages/channels/telegram/src/index.ts`
- Usar discord.js v14
- Implementar `IChannel`: `send()`, `onMessage()`, `start()`, `stop()`
- Suporte a approval via reactions/buttons

### BrowserTool (ss-4.3/4.4)
- Usar Playwright (já em devDependencies ou adicionar)
- Ferramentas: `navigate`, `screenshot`, `click`, `fill`, `select`
- SecurityManager.checkUrl() antes de qualquer navegação
- Sandboxing: contexto isolado por sessão

### tools/memory re-export (ss-4.5)
- `packages/tools/memory/src/index.ts` deve re-exportar:
  ```typescript
  export * from '@rabeluslab/inception-memory/tools';
  ```
- Remover stub placeholder

### Provider enum (ss-4.6)
- 9 providers sem pacote: adicionar JSDoc `@future` + link para decisão
- Criar `docs/decisions/provider-stubs.md` documentando por que existem no enum

---

## Checklist de Conclusão Sprint 4

```
[ ] DiscordChannel implementa IChannel (não export {})
[ ] BrowserTool: navigate, screenshot, click, fill implementados
[ ] packages/tools/memory/ re-exporta memory tools reais
[ ] 9 providers sem pacote têm @future JSDoc
[ ] pnpm build → verde
[ ] pnpm test → verde
[ ] _gov/roadmap.md: G3, G5, G11 marcados como done
```

---

## Briefs (criar ao iniciar cada SS)

Pasta: `_gov/sprints/sprint-4-stubs/ss-{N.M}-{fase}-{alvo}/brief.md`
