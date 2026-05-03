# Sprint 8: State & Security Fixes

**Status:** ⏳ pending
**Branch:** `feat/gov-sprint-8`
**Motivação:** 4 gaps de alta prioridade que quebram fluxos fundamentais do agente em uso real.
**Origem:** Auditoria funcional profunda de 2026-03-30 (F1, F11, F16, F17)
**Bloqueia:** Sprint 9 (provider resilience depende de agent loop estável)

---

## Contexto

A auditoria forense revelou que o AgentLoop opera com estado congelado: mission criada após
o boot nunca é propagada para o loop. Simultaneamente, dois inputs concorrentes podem corromper
o estado de execução. E o controle de autonomia tem lógica invertida para o nível Readonly.

Estes 3 gaps tornam o sistema **não-confiável** para uso interativo real.

---

## Sub-sprints

| SS     | Nome                  | Gap resolve | Paralela?        |
| ------ | --------------------- | ----------- | ---------------- |
| ss-8.1 | mission-observer      | F1, F11     | — (primeiro)     |
| ss-8.2 | race-condition-mutex  | F16         | após 8.1         |
| ss-8.3 | autonomy-readonly-fix | F17         | paralela com 8.2 |

---

## Critério de Aceite Sprint 8

```
[ ] MissionProtocol emite eventos via EventEmitter (created, updated, archived)
[ ] AgentLoop subscreve e atualiza activeMission em runtime
[ ] /mission create → agente vê nova mission no próximo turn
[ ] /task done → agente vê task como Completed no próximo turn
[ ] Dois inputs simultâneos são enfileirados (não correm em paralelo)
[ ] AutonomyLevel.Readonly bloqueia tools não-readonly
[ ] pnpm test → 131+ testes passando (sem regressão)
[ ] pnpm lint → 0 errors
```

---

## Decisões Arquiteturais

**Observer via EventEmitter nativo (Node.js):**

- Sem dependência nova
- MissionProtocol extends EventEmitter (ou usa composição com private emitter)
- AgentLoop subscreve no construtor, desinscreve no método close()

**Mutex via flag simples (sem lib externa):**

- CliChannel já tem `isProcessing` flag na TUI state
- Adicionar verificação antes de despachar novo turn
- Input durante processamento é enfileirado (não descartado)

**Autonomy fix:**

- Nova lógica: `Readonly` → bloqueia tudo exceto tools com `readonly: true`
- Atualizar tipos em `@rabeluslab/inception-types` para adicionar campo `readonly` em ToolDefinition
