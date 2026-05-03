# Brief — ss-9.2: streaming-agent-loop

**Status:** ⏳ pending
**Resolve:** F4 (streaming implementado em todos os providers mas nunca chamado pelo AgentLoop)
**Sprint:** 9

---

## Problema

`AgentLoop.turn()` sempre chama `provider.generate()` (resposta completa bloqueante).
`provider.generateStream()` retorna `AsyncIterable<GenerateChunk>` em todos os 12 providers,
mas nunca é invocado. Para respostas de 30+ segundos, UX parece travamento.

**Evidência:** `packages/agent/src/agent-loop.ts:173`

```typescript
const response = await this.cfg.provider.generate(request); // sempre síncrono
```

## Arquitetura do Streaming com Tool Detection

O desafio do streaming no ReAct loop: precisamos detectar tool calls durante o stream,
acumulá-los, executá-los, e continuar. Não podemos retornar ao usuário antes de ter certeza
que não há tool calls.

**Estratégia (baseada em AutoGen + Vercel AI SDK patterns):**

```
stream chunks → classificar: text | tool_call_start | tool_call_delta | tool_call_end
→ buffer text chunks → enviar progressivamente para canal (streaming de texto)
→ acumular tool_call chunks → executar após stream terminar
→ se há tool calls: recursão com resultados → novo stream
→ se apenas texto: retornar texto acumulado
```

## Implementação

### `packages/types/src/providers.ts`

Definir `GenerateChunk`:

```typescript
export type GenerateChunk =
  | { type: 'text'; text: string }
  | { type: 'tool_call_start'; toolCallId: string; toolName: string }
  | { type: 'tool_call_delta'; toolCallId: string; argsDelta: string }
  | { type: 'tool_call_end'; toolCallId: string }
  | { type: 'usage'; inputTokens: number; outputTokens: number }
  | { type: 'finish'; finishReason: FinishReason };
```

### `packages/agent/src/agent-loop.ts`

Novo método `_streamTurn()` para uso interno:

```typescript
private async _executeStreamRound(
  request: GenerateRequest,
  onTextChunk: (text: string) => void
): Promise<{ textContent: string; toolCalls: ToolCall[] }> {
  const stream = this.cfg.provider.generateStream(request);
  let textContent = '';
  const toolCallBuilders: Map<string, { name: string; argsJson: string }> = new Map();

  for await (const chunk of stream) {
    switch (chunk.type) {
      case 'text':
        textContent += chunk.text;
        onTextChunk(chunk.text); // progressivo
        break;
      case 'tool_call_start':
        toolCallBuilders.set(chunk.toolCallId, { name: chunk.toolName, argsJson: '' });
        break;
      case 'tool_call_delta':
        const builder = toolCallBuilders.get(chunk.toolCallId);
        if (builder) builder.argsJson += chunk.argsDelta;
        break;
    }
  }

  const toolCalls: ToolCall[] = [];
  for (const [id, builder] of toolCallBuilders) {
    toolCalls.push({
      id,
      name: builder.name,
      args: JSON.parse(builder.argsJson || '{}'),
    });
  }

  return { textContent, toolCalls };
}
```

### `packages/channels/cli/src/channel.ts`

Expor método para streaming progressivo:

```typescript
streamText(chunk: string): void {
  this._updateState((prev) => ({
    ...prev,
    streamingText: (prev.streamingText ?? '') + chunk,
  }));
}
```

### IChannel em `packages/types/src/channels.ts`

Adicionar método opcional:

```typescript
interface IChannel {
  // ... métodos existentes
  streamText?(chunk: string): void; // novo — opcional
}
```

## Critério de Aceite

- AgentLoop usa `generateStream()` quando provider suporta
- Texto aparece progressivamente no CLI (não espera response completa)
- Tool calls são detectados e acumulados durante stream
- Execução de tools ocorre após stream terminar
- Loop ReAct continua funcionando (N rounds de tools)
- Fallback para `generate()` se provider não suporta stream
