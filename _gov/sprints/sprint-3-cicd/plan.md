# Sprint 3 — CI/CD: Plano Vivo

**Objetivo:** Fortalecer o pipeline de CI com audit de dependências, coverage report e triggers corretos para todas as branches de desenvolvimento.
**Status:** ⏳ pending
**Branch:** `feat/gov-sprint-3` (criar a partir de `feat/gov-sprint-2`)
**Bloqueadores:** Sprint 2 (soft — código estável antes de configurar CI)
**Bloqueia:** Sprint 4 (soft)

---

## Sub-sprints

| SS | Nome | Gaps resolve | Status | Paralela? |
|----|------|-------------|--------|-----------|
| ss-3.1 | ci-audit | G8 | ⏳ pending | com 3.2, 3.3, 3.4 |
| ss-3.2 | ci-coverage | G8 | ⏳ pending | com 3.1, 3.3, 3.4 |
| ss-3.3 | ci-branch-triggers | G8 | ⏳ pending | com 3.1, 3.2, 3.4 |
| ss-3.4 | ci-badges | — | ⏳ pending | com 3.1, 3.2, 3.3 |

**Todas as SS podem rodar em paralelo.**

---

## Arquivo Crítico

**`.github/workflows/ci.yml`** — único arquivo alvo desta sprint.

### O que adicionar:

1. **ss-3.1** — `pnpm audit --audit-level=high` no job `lint-and-typecheck`; falha em CVE crítica/alta
2. **ss-3.2** — `pnpm vitest --coverage`; upload de relatório como artefato GitHub
3. **ss-3.3** — Adicionar branches aos `push.branches` e `pull_request.branches`:
   - `feat/mission-system`
   - `feat/governance`
   - `feat/gov-sprint-*`
   - `ss/sprint-*`
4. **ss-3.4** — Badges no `README.md`:
   - `[![CI](...)` apontando para o workflow
   - `[![Coverage](...)` apontando para o relatório

---

## Checklist de Conclusão Sprint 3

```
[ ] pnpm audit no CI (falha em CVE crítica/alta)
[ ] coverage report gerado no CI como artefato
[ ] feat/mission-system e feat/governance nos triggers do ci.yml
[ ] feat/gov-sprint-* e ss/sprint-* nos triggers do ci.yml
[ ] CI verde no GitHub Actions após push
[ ] Badges no README.md atualizados
[ ] _gov/roadmap.md: G8 marcado como done
```

---

## Briefs (criar ao iniciar cada SS)

Pasta: `_gov/sprints/sprint-3-cicd/ss-{N.M}-{fase}-{alvo}/brief.md`
