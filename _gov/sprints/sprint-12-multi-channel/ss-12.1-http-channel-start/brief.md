# Brief — ss-12.1: http-channel-start

**Status:** ⏳ pending
**Resolve:** F15 (HTTP channel nunca instanciado)
**Sprint:** 12

---

## Problema

`packages/channels/http/src/http-channel.ts` implementa SSE + REST + Bearer auth.
Nunca é instanciado em `apps/daemon/src/index.ts` nem em `apps/cli/src/commands/start.ts`.
O Daemon roda CLI headlessly — não faz sentido para deploy server-side.

## Implementação

### `apps/daemon/src/index.ts`

Substituir CLI channel por HTTP channel:

```typescript
import { HttpChannel } from '@rabeluslab/inception-channel-http';

// antes: CliChannel
const httpChannel = new HttpChannel();
await httpChannel.initialize({
  port: cfg.channels?.http?.port ?? 3000,
  auth: cfg.channels?.http?.auth ?? { type: 'bearer', tokens: [] },
  cors: cfg.channels?.http?.cors ?? { origins: ['*'] },
});

const channelManager = new ChannelManager();
channelManager.register(httpChannel, { operatorChannel: true });
```

### `apps/cli/src/commands/start.ts`

Adicionar flag `--channel`:

```typescript
program
  .command('start')
  .option('--channel <type>', 'channel type: cli (default) | http | discord | telegram');
// ...
```

```typescript
const channelType = options.channel ?? 'cli';
let channel: IChannel;

switch (channelType) {
  case 'http':
    channel = new HttpChannel();
    await channel.initialize({ port: cfg.channels?.http?.port ?? 3000, ... });
    break;
  case 'cli':
  default:
    channel = new CliChannel();
    await channel.initialize({ enabled: true });
}
```

### `packages/config/src/schema.ts`

```typescript
channels?: {
  http?: {
    port?: number;
    auth?: { type: 'bearer'; tokens: string[] };
    cors?: { origins: string[] };
  };
  discord?: { botToken?: string; allowedUserIds?: string[] };
  telegram?: { botToken?: string; allowedUserIds?: number[] };
};
```

## Critério de Aceite

- `inception start --channel http` sobe servidor HTTP na porta configurada
- Daemon usa HTTP por padrão (não CLI)
- Config `channels.http.port` funciona
- Endpoint `POST /message` recebe mensagem e responde via SSE
