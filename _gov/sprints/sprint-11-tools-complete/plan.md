# Sprint 11: Tools Complete

**Status:** ⏳ pending
**Branch:** `feat/gov-sprint-11`
**Motivação:** Browser tools implementados (~1000 linhas) mas completamente desconectados. Agente não pode navegar web.
**Origem:** Auditoria funcional 2026-03-30 (F5)
**Após:** Sprint 8 (tool registry estável)

---

## Contexto

`packages/tools/browser/src/` tem 5 tools completas com Playwright. `apps/cli/src/tool-registry.ts`
nunca as registra. Playwright não está em devDependencies. Nenhum teste.

O browser tool é um dos diferenciadores do Inception Framework — agente que navega web autonomamente.
Está 80% implementado, faltando apenas conexão com o sistema.

---

## Sub-sprints

| SS      | Nome                   | Resolve | Paralela?    |
| ------- | ---------------------- | ------- | ------------ |
| ss-11.1 | browser-tools-registry | F5      | — (primeiro) |
| ss-11.2 | browser-tools-tests    | —       | após 11.1    |

---

## Dependências

```bash
pnpm add -D playwright@^1.50.0  # ou @playwright/test
pnpm exec playwright install chromium  # instalar browser
```

---

## Critério de Aceite Sprint 11

```
[ ] playwright em devDependencies
[ ] BrowserNavigateTool e as outras 4 registradas no ToolRegistry
[ ] BrowserSession inicializado no startup (lazy) e fechado no shutdown
[ ] Agente consegue navegar URL configurada na whitelist
[ ] Testes de smoke para BrowserNavigateTool com Playwright mock
[ ] pnpm test → 131+ testes passando
```
