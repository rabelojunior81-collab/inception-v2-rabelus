# Brief — ss-8.3: autonomy-readonly-fix

**Status:** ⏳ pending
**Resolve:** F17 (AutonomyLevel.Readonly não bloqueia tools corretamente)
**Sprint:** 8

---

## Problema

`ApprovalGate.checkAndWait()` só pede aprovação para `AutonomyLevel.Supervised + tool.dangerous`.
`AutonomyLevel.Readonly` é tratado igual a `Autonomous` — passa tudo sem perguntar.

**Evidência:** `packages/agent/src/approval-gate.ts:27-43`

```typescript
// lógica atual — ERRADA para Readonly
if (this.autonomyLevel !== AutonomyLevel.Supervised) return true; // Readonly entra aqui
```

## Lógica Correta

| AutonomyLevel | Comportamento desejado                                   |
| ------------- | -------------------------------------------------------- |
| `Autonomous`  | Executa tudo sem perguntar                               |
| `Supervised`  | Pede aprovação para tools `dangerous: true`              |
| `Readonly`    | Permite só tools `readonly: true`; bloqueia todo o resto |

## Implementação

### 1. `packages/types/src/tools.ts`

Adicionar campo ao `ToolDefinition`:

```typescript
export interface ToolDefinition {
  name: string;
  description: string;
  parameters: JSONSchema;
  dangerous?: boolean;
  readonly?: boolean; // NOVO — tool que só lê, nunca escreve/executa
}
```

### 2. Atualizar tools com `readonly: true`

Tools de leitura que devem ser liberadas em Readonly mode:

- `ReadFileTool` → `readonly: true`
- `FileExistsTool` → `readonly: true`
- `StatFileTool` → `readonly: true`
- `ListDirTool` → `readonly: true`
- `HttpGetTool` → `readonly: true`
- `MemorySearchTool` → `readonly: true`
- `MemoryDescribeTool` → `readonly: true`

Tools que devem ser bloqueadas em Readonly:

- `WriteFileTool` → bloqueada
- `RunCommandTool` → bloqueada
- `HttpPostTool` → bloqueada
- `BrowserNavigateTool`, `BrowserClickTool`, `BrowserFillTool` → bloqueadas
- `BrowserScreenshotTool` → `readonly: true` (apenas lê estado visual)

### 3. `packages/agent/src/approval-gate.ts`

```typescript
async checkAndWait(
  toolDef: ToolDefinition,
  args: JSONObject,
  context: ApprovalContext
): Promise<boolean> {
  switch (this.autonomyLevel) {
    case AutonomyLevel.Autonomous:
      return true; // tudo permitido sem aprovação

    case AutonomyLevel.Supervised:
      if (!toolDef.dangerous) return true;
      return this._requestApproval(toolDef, args, context);

    case AutonomyLevel.Readonly:
      if (toolDef.readonly === true) return true;
      // bloqueia silenciosamente — avisa o agente
      return false;

    default:
      return false; // fail-safe: bloqueia se level desconhecido
  }
}
```

### 4. `packages/agent/src/tool-executor.ts`

Quando `ApprovalGate` retorna `false` por Readonly, retornar resultado de erro claro:

```typescript
if (!approved) {
  return {
    toolCallId: call.id,
    toolName: call.name,
    result: {
      error: `Tool '${call.name}' bloqueada: autonomia Readonly não permite escrita/execução.`,
    },
    error: true,
  };
}
```

## Critério de Aceite

- `Autonomous` → todas as tools executam sem perguntar
- `Supervised` → tools com `dangerous: true` pedem aprovação
- `Readonly` → apenas tools com `readonly: true` executam; resto retorna erro claro
- Testes cobrindo os 3 modos
