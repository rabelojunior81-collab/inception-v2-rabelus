# Sprint 12: Multi-Channel

**Status:** ⏳ pending
**Branch:** `feat/gov-sprint-12`
**Motivação:** HTTP channel existe mas nunca é instanciado. Discord/Telegram sem testes. Daemon usa apenas CLI.
**Origem:** Auditoria funcional 2026-03-30 (F7, F15)
**Após:** Sprint 8 (channel coordination base estável)

---

## Contexto

O Inception Framework promete multi-channel — CLI + Telegram + Discord + HTTP simultaneamente.
Na realidade: apenas CLI é instanciado em `start.ts`. HTTP/Discord/Telegram são código não-ativado.
O Daemon deveria usar HTTP, mas também usa CLI.

---

## Sub-sprints

| SS      | Nome                   | Resolve | Paralela?    |
| ------- | ---------------------- | ------- | ------------ |
| ss-12.1 | http-channel-start     | F15     | — (primeiro) |
| ss-12.2 | discord-telegram-tests | F7      | após 12.1    |
| ss-12.3 | channel-coordination   | —       | após 12.1    |

---

## Critério de Aceite Sprint 12

```
[ ] apps/daemon/src/index.ts usa HttpChannel (não CLI)
[ ] apps/cli/src/commands/start.ts aceita --channel http flag
[ ] Telegram channel tem testes de smoke com grammy mock
[ ] Discord channel tem testes de smoke com discord.js mock
[ ] ChannelManager pode fazer broadcast outbound para múltiplos canais
[ ] pnpm test → 131+ testes passando
```
