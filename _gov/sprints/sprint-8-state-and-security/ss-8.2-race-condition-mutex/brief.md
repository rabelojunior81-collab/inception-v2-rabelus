# Brief — ss-8.2: race-condition-mutex

**Status:** ⏳ pending
**Resolve:** F16 (race condition slash command durante tool call)
**Sprint:** 8

---

## Problema

`CliChannel._handleUserInput()` dispara `inboundHandler(inbound)` imediatamente, sem verificar
se o AgentLoop está processando um turn anterior. Dois turns podem rodar em paralelo, corrompendo
estado de memória e produzindo respostas intercaladas.

**Evidência:** `packages/channels/cli/src/channel.ts:182-236` — sem mutex ou lock.

## Análise

A TUI já tem `isProcessing: boolean` no estado React (usado para desabilitar o input field visualmente).
O handler já guarda a flag. O problema é que a flag não bloqueia novos dispatches — só muda o estilo
da UI.

**Solução sem lib externa:**

O `CliChannel` já tem um `inboundHandler`. Podemos envolver o handler com uma fila simples:

```typescript
private _turnQueue: Array<InboundMessage> = [];
private _isProcessing = false;

private async _dispatchNext(): Promise<void> {
  if (this._isProcessing || this._turnQueue.length === 0) return;
  const next = this._turnQueue.shift()!;
  this._isProcessing = true;
  try {
    await this.inboundHandler!(next);
  } finally {
    this._isProcessing = false;
    void this._dispatchNext(); // processa próximo se houver
  }
}

private _handleUserInput(text: string): void {
  // ...
  const inbound: InboundMessage = { ... };
  this._turnQueue.push(inbound);
  void this._dispatchNext();
}
```

## Implementação

### `packages/channels/cli/src/channel.ts`

1. Adicionar `_turnQueue: InboundMessage[]` e `_isProcessingTurn: boolean`
2. Substituir dispatch direto por `_turnQueue.push() + _dispatchNext()`
3. `_dispatchNext()` consome a fila sequencialmente
4. Exibir na TUI que há inputs pendentes (opcional: badge de fila)

### Considerações

- Slash commands (`/task done`, `/mission create`) devem PULAR a fila e executar imediatamente
  (não são processados pelo AgentLoop — são interceptados antes)
- Apenas inputs "normais" (texto para o agente) entram na fila

## Critério de Aceite

- Dois inputs rápidos são processados sequencialmente, não em paralelo
- Slash commands continuam executando imediatamente
- Teste: enviar 3 inputs em <100ms → todos processados em ordem, sem erro
