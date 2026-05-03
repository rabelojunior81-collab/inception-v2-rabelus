# Brief — ss-8.1: mission-observer

**Status:** ⏳ pending
**Resolve:** F1 (mission state dessincronizado), F11 (mission context desatualizado)
**Sprint:** 8

---

## Problema

`AgentLoop` recebe `activeMission` como snapshot no construtor e nunca o atualiza.
Quando usuário executa `/mission create` ou `/task done`, a mudança persiste no SQLite
mas o loop não sabe disso.

**Evidência:**

- `packages/agent/src/agent-loop.ts:41` — `constructor(private readonly cfg: AgentLoopConfig)`
- `apps/cli/src/commands/start.ts:129` — `let currentMission` local nunca propagado ao loop

## Análise da API

`MissionProtocol` já é classe concreta. Pode estender `EventEmitter` do Node.js sem deps novas.

**Eventos necessários:**

- `mission:created` → payload: `Mission`
- `mission:updated` → payload: `Mission` (após updateTaskStatus, addJournalEntry, etc.)
- `mission:archived` → payload: `{ missionId: string }`

**AgentLoop** precisa de método público `setActiveMission(mission: Mission | undefined)`.

## Implementação

### 1. `packages/protocol/src/mission-protocol.ts`

```typescript
import { EventEmitter } from 'node:events';

export class MissionProtocol extends EventEmitter implements IMissionProtocol {
  // ... implementação atual

  async createMission(config: MissionConfig): Promise<Mission> {
    const mission = await this._create(config);
    this.emit('mission:created', mission);
    return mission;
  }

  async updateTaskStatus(missionId: string, taskId: string, status: TaskStatus): Promise<void> {
    await this._updateTask(missionId, taskId, status);
    const mission = await this.getMission(missionId);
    if (mission) this.emit('mission:updated', mission);
  }

  async addJournalEntry(missionId: string, content: string): Promise<void> {
    await this._addNote(missionId, content);
    // nota: sem emit aqui — não muda estado da mission em si
  }

  async archiveMission(missionId: string): Promise<JournalEntry> {
    const entry = await this._archive(missionId);
    this.emit('mission:archived', { missionId });
    return entry;
  }
}
```

### 2. `packages/protocol/src/index.ts`

Exportar os tipos dos eventos:

```typescript
export type MissionEvents = {
  'mission:created': [mission: Mission];
  'mission:updated': [mission: Mission];
  'mission:archived': [payload: { missionId: string }];
};
```

### 3. `packages/agent/src/agent-loop.ts`

```typescript
export class AgentLoop {
  private activeMission: Mission | undefined;

  constructor(private readonly cfg: AgentLoopConfig) {
    this.activeMission = cfg.activeMission;

    // Subscrever observer se protocol disponível
    if (cfg.missionProtocol && 'on' in cfg.missionProtocol) {
      const proto = cfg.missionProtocol as MissionProtocol;
      proto.on('mission:created', (m) => {
        this.activeMission = m;
      });
      proto.on('mission:updated', (m) => {
        if (this.activeMission?.id === m.id) this.activeMission = m;
      });
      proto.on('mission:archived', ({ missionId }) => {
        if (this.activeMission?.id === missionId) this.activeMission = undefined;
      });
    }
  }

  // usar this.activeMission em vez de this.cfg.activeMission nos turn() calls
}
```

### 4. `packages/types/src/protocol.ts`

Adicionar ao `IMissionProtocol`:

```typescript
// Indicar que pode emitir eventos (opcional — backward compat)
on?(event: string, listener: (...args: any[]) => void): this;
```

## Critério de Aceite

- `protocol.createMission()` emite `mission:created`
- `protocol.updateTaskStatus()` emite `mission:updated`
- `AgentLoop` atualiza `activeMission` ao receber evento
- Teste: criar mission após agent loop instanciado → turn seguinte usa nova mission
- Testes existentes continuam passando (sem regressão)
