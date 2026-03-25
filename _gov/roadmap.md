# Roadmap Vivo — Inception Framework v2.0

> Atualizado ao início e fim de cada sub-sprint. Fonte da verdade sobre o estado do desenvolvimento.

**Última atualização:** 2026-03-25
**Sprint ativa:** Sprint 2 — Code Gaps
**Branch ativa:** `feat/gov-sprint-2` (a criar)

---

## Status Geral

| Sprint | Objetivo | Status | Branch | Iniciada | Concluída |
|--------|----------|--------|--------|----------|-----------|
| Sprint 0 | Governance Bootstrap | ✅ done | `feat/governance` | 2026-03-25 | 2026-03-25 |
| Sprint 1 | Memory + Docs | ✅ done | `feat/gov-sprint-1` | 2026-03-25 | 2026-03-25 |
| Sprint 2 | Code Gaps | 🔄 in-progress | `feat/gov-sprint-2` | 2026-03-25 | — |
| Sprint 3 | CI/CD | ⏳ pending | `feat/gov-sprint-3` | — | — |
| Sprint 4 | Stubs | ⏳ pending | `feat/gov-sprint-4` | — | — |
| Sprint 5 | Filesystem Sanitization | ⏳ pending | `feat/gov-sprint-5` | — | — |

---

## Sprint 0: Governance Bootstrap

**Objetivo:** Criar a infraestrutura de governança. Sem isso, as outras sprints não têm onde registrar seus artefatos.
**Bloqueadores:** nenhum
**Bloqueia:** Sprint 1 (hard)

| SS | Nome | Status | Branch | Commit |
|----|------|--------|--------|--------|
| ss-0.1 | research-filesystem-audit | ✅ done | — | (integrado ao bootstrap) |
| ss-0.2 | create-gov-structure | ✅ done | `feat/governance` | 0de099b |
| ss-0.3 | archive-audits | ✅ done | `feat/governance` | 0de099b |
| ss-0.4 | roadmap-initial | ✅ done | `feat/governance` | 0de099b |
| ss-0.5 | sync-memory-index | ✅ done | — (externo ao repo) | — |
| ss-0.6 | commit-eslint-fix | ✅ done | `feat/mission-system` | ebff68a |

### Checklist de Conclusão Sprint 0

```
[x] _gov/ existe com estrutura completa e commitada (0de099b)
[x] _gov/archive/audits/ tem os 2 arquivos de auditoria (git mv)
[x] docs/audit-research/ tem apenas README.md redirect
[x] _gov/roadmap.md atualizado com todas as SS
[x] Memórias Claude não mencionam "8% implementado"
[x] .eslintrc.cjs commitado (override no-console) (ebff68a)
[x] pnpm build → verde (30 packages)
[x] git status limpo na branch feat/governance
```

---

## Sprint 1: Memory + Docs

**Objetivo:** Sincronizar toda documentação e memórias de agente com o estado real.
**Bloqueadores:** Sprint 0 (hard)
**Bloqueia:** Sprint 2 (soft)

| SS | Nome | Gaps resolve | Status | Commit |
|----|------|-------------|--------|--------|
| ss-1.1 | sync-claude-memories | G10 | ✅ done | — (externo) |
| ss-1.2 | handoff-update | G12 | ✅ done | 5dcc1ff |
| ss-1.3 | guia-gaps-update | G1 (doc) | ✅ done | 5dcc1ff |
| ss-1.4 | security-md-update | — | ✅ done | 5dcc1ff |
| ss-1.5 | changelog-sync | G1-G5 | ✅ done | 5dcc1ff |
| ss-1.6 | version-alignment | G6 | ✅ done | 5dcc1ff |

### Checklist de Conclusão Sprint 1

```
[x] HANDOFF.md menciona G1-G12 explicitamente
[x] SECURITY.md documenta SecurityManager + gates + G2 como known gap
[x] CHANGELOG.md seção "Known Gaps" com G1, G2, G4, G6, G8, G11
[x] Todos os 29 packages em version 2.0.0
[x] pnpm build → verde (30 packages, 0 erros)
```

---

## Sprint 2: Code Gaps

**Objetivo:** Corrigir gaps funcionais — prioridade em comportamento quebrado.
**Bloqueadores:** Sprint 1 (soft)
**Bloqueia:** Sprint 3 (soft)

| SS | Nome | Gaps resolve | Paralela? |
|----|------|-------------|-----------|
| ss-2.1 | spec-slash-persistence | G1 (spec) | — (primeiro) |
| ss-2.2 | impl-slash-persistence | G1 | depois 2.1 |
| ss-2.3 | impl-rate-limit | G2 | com 2.4, 2.5 |
| ss-2.4 | impl-runtime-channel-wiring | G4 | com 2.3, 2.5 |
| ss-2.5 | fix-memory-tools-registration | G11 | com 2.3, 2.4 |

### Checklist de Conclusão Sprint 2

```
[ ] /task done persiste no SQLite (teste manual)
[ ] /task add persiste nova task (visível em /task list)
[ ] /note persiste no journal
[ ] IMissionProtocol.addTask() + addJournalEntry() implementados
[ ] SecurityManager.checkRateLimit() implementado
[ ] AgentLoop chama checkRateLimit() antes de generate()
[ ] InceptionRuntime.registerChannel() funcional
[ ] start.ts usa runtime.registerChannel(cliChannel)
[ ] memory tools registradas no CLI tool-registry
[ ] pnpm test → verde
```

---

## Sprint 3: CI/CD

**Objetivo:** Fortalecer pipeline de CI com audit, coverage e triggers corretos.
**Bloqueadores:** Sprint 2 (soft — código estável)
**Bloqueia:** Sprint 4 (soft)

| SS | Nome | Gaps resolve | Paralela? |
|----|------|-------------|-----------|
| ss-3.1 | ci-audit | G8 | com 3.2, 3.3, 3.4 |
| ss-3.2 | ci-coverage | G8 | com 3.1, 3.3, 3.4 |
| ss-3.3 | ci-branch-triggers | G8 | com 3.1, 3.2, 3.4 |
| ss-3.4 | ci-badges | — | com 3.1, 3.2, 3.3 |

### Checklist de Conclusão Sprint 3

```
[ ] pnpm audit no CI (falha em CVE crítica/alta)
[ ] coverage report gerado no CI
[ ] feat/mission-system e feat/governance nos triggers
[ ] CI verde no GitHub Actions
```

---

## Sprint 4: Stubs

**Objetivo:** Implementar Discord, Browser tool, cleanup de providers.
**Bloqueadores:** Sprint 3 (soft — CI valida)
**Bloqueia:** Sprint 5 (soft)

| SS | Nome | Paralela? |
|----|------|-----------|
| ss-4.1 | spec-discord-channel | — |
| ss-4.2 | impl-discord-channel | depois 4.1 |
| ss-4.3 | spec-browser-tool | com 4.1 |
| ss-4.4 | impl-browser-tool | depois 4.3 |
| ss-4.5 | fix-tools-memory-package | com 4.1, 4.3 |
| ss-4.6 | cleanup-provider-enum | com 4.1, 4.3 |

### Checklist de Conclusão Sprint 4

```
[ ] DiscordChannel implementa IChannel
[ ] BrowserTool: navigate, screenshot, click, fill
[ ] packages/tools/memory/ re-exporta memory tools reais
[ ] 9 providers sem pacote têm @future JSDoc
[ ] pnpm build + test → verde
```

---

## Sprint 5: Filesystem Sanitization

**Objetivo:** Organização final — i18n, naming, testes.
**Bloqueadores:** Sprint 4 (soft)

| SS | Nome | Gaps resolve | Paralela? |
|----|------|-------------|-----------|
| ss-5.1 | archive-audit-research-dir | — | com todas |
| ss-5.2 | populate-docs-structure | G9 | com todas |
| ss-5.3 | naming-normalization | — | com todas |
| ss-5.4 | tests-organization | — | com todas |

### Checklist de Conclusão Sprint 5 (= Conclusão do Plano)

```
[ ] docs/pt/index.md e docs/en/index.md existem
[ ] Naming consistente em todo _gov/
[ ] pnpm build + lint + typecheck + test + audit → verde
[ ] PR para main criado e aprovado
[ ] _gov/roadmap.md: todas as sprints com status done
```

---

## Gaps — Rastreamento Consolidado

| ID | Gap | Sprint | SS | Status |
|----|-----|--------|----|--------|
| G1 | `/task done/add/note` sem persistência | 2 | ss-2.1, ss-2.2 | ⏳ open |
| G2 | Rate limiting não aplicado | 2 | ss-2.3 | ⏳ open |
| G3 | sandbox não implementado | 4 | ss-4.6 (doc) | ⏳ open |
| G4 | Runtime não conectado ao ChannelManager | 2 | ss-2.4 | ⏳ open |
| G5 | 9 ProviderId sem pacote | 4 | ss-4.6 | ⏳ open |
| G6 | Versionamento 2.0.0 vs 0.0.0 | 1 | ss-1.6 | ✅ done (5dcc1ff) |
| G7 | .eslintrc.cjs não commitado | 0 | ss-0.6 | ✅ done (ebff68a) |
| G8 | CI incompleto | 3 | ss-3.x | ⏳ open |
| G9 | docs/i18n vazios | 5 | ss-5.2 | ⏳ open |
| G10 | Memórias Claude obsoletas | 0 | ss-0.5 | ✅ done |
| G11 | tools/memory stub | 2 | ss-2.5 | ⏳ open |
| G12 | HANDOFF.md falso positivo | 1 | ss-1.2 | ✅ done (5dcc1ff) |
