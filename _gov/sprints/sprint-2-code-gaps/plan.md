# Sprint 2 — Code Gaps: Plano Vivo

**Objetivo:** Corrigir os gaps funcionais de código — prioridade em comportamento quebrado que afeta o usuário.
**Status:** ⏳ pending
**Branch:** `feat/gov-sprint-2` (criar a partir de `feat/gov-sprint-1`)
**Bloqueadores:** Sprint 1 (soft — spec-first exige docs corretas)
**Bloqueia:** Sprint 3 (soft)

---

## Sub-sprints

| SS | Nome | Gaps resolve | Status | Paralela? |
|----|------|-------------|--------|-----------|
| ss-2.1 | spec-slash-persistence | G1 (spec) | ⏳ pending | — (primeiro) |
| ss-2.2 | impl-slash-persistence | G1 | ⏳ pending | depois 2.1 |
| ss-2.3 | impl-rate-limit | G2 | ⏳ pending | com 2.4, 2.5 |
| ss-2.4 | impl-runtime-channel-wiring | G4 | ⏳ pending | com 2.3, 2.5 |
| ss-2.5 | fix-memory-tools-registration | G11 | ⏳ pending | com 2.3, 2.4 |

**SS 2.1 → 2.2 é sequencial (spec-first obrigatório).**
**SS 2.3, 2.4, 2.5 podem rodar em paralelo.**

---

## Arquivos Críticos

| Arquivo | Gap | O que fazer |
|---------|-----|-------------|
| `packages/agent/src/slash-handler.ts` | G1 | `/task done`, `/task add`, `/note` → persistência SQLite |
| `packages/types/src/protocol.ts` | G1 | Adicionar `addTask()` + `addJournalEntry()` ao `IMissionProtocol` |
| `packages/protocol/src/mission-protocol.ts` | G1 | Implementar `addTask()` + `addJournalEntry()` |
| `packages/security/src/security-manager.ts` | G2 | Implementar `checkRateLimit()` com token-bucket |
| `packages/agent/src/agent-loop.ts` | G2+G4 | Chamar `checkRateLimit()` antes de `generate()` |
| `packages/core/src/runtime.ts` | G4 | Garantir `registerChannel()` funcional |
| `apps/cli/src/commands/start.ts` | G4 | Usar `runtime.registerChannel(cliChannel)` |
| `apps/cli/src/tool-registry.ts` | G11 | Registrar memory tools do `packages/memory/src/tools/` |

---

## Checklist de Conclusão Sprint 2

```
[ ] /task done persiste no SQLite (teste manual: verificar DB)
[ ] /task add persiste nova task (visível em /task list)
[ ] /note persiste no journal
[ ] IMissionProtocol.addTask() + addJournalEntry() implementados
[ ] SecurityManager.checkRateLimit() implementado (token-bucket)
[ ] AgentLoop chama checkRateLimit() antes de generate()
[ ] InceptionRuntime.registerChannel() funcional
[ ] start.ts usa runtime.registerChannel(cliChannel)
[ ] memory tools registradas no CLI tool-registry
[ ] pnpm test → verde
[ ] _gov/roadmap.md: G1, G2, G4, G11 marcados como done
```

---

## Dependência Crítica: SPEC-FIRST

**ss-2.1 deve ser concluída antes de ss-2.2.**

`brief.md` da ss-2.2 (implementação) só pode ser criado após a aprovação do `handoff.md` da ss-2.1 (spec técnica). Isso garante que a implementação segue uma spec aprovada, não intuição.

---

## Briefs (criar ao iniciar cada SS)

Pasta: `_gov/sprints/sprint-2-code-gaps/ss-{N.M}-{fase}-{alvo}/brief.md`
