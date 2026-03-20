// ============================================================================
// inception start — launches the full runtime with the CLI channel
// ============================================================================

import { homedir } from 'node:os';
import { join } from 'node:path';

import {
  AgentLoop,
  handleSlashCommand,
} from '@rabeluslab/inception-agent';
import type { PendingApproval, SlashCommandContext } from '@rabeluslab/inception-agent';
import { CliChannel } from '@rabeluslab/inception-channel-cli';
import { loadConfig, refreshModelsInBackground } from '@rabeluslab/inception-config';
import { ChannelManager, InceptionRuntime } from '@rabeluslab/inception-core';
import { SQLiteMemoryBackend } from '@rabeluslab/inception-memory';
import { SecurityManager } from '@rabeluslab/inception-security';
import type { Mission } from '@rabeluslab/inception-types';

import { createProvider } from '../provider-factory.js';
import { buildToolRegistry } from '../tool-registry.js';

export interface StartOptions {
  config?: string;
  provider?: string;
  model?: string;
  memory?: string;
  debug?: boolean;
  activeMission?: Mission;
}

export async function runStart(options: StartOptions): Promise<void> {
  // ── Load config ────────────────────────────────────────────────────────────
  const configResult = await loadConfig(options.config);
  if (!configResult.success) {
    console.error(`[inception] Config error: ${configResult.error.message}`);
    process.exit(1);
  }
  const cfg = configResult.data;

  // ── Create provider ────────────────────────────────────────────────────────
  let providerSelection: Awaited<ReturnType<typeof createProvider>>;
  try {
    providerSelection = await createProvider(cfg, options.provider, options.model);
  } catch (err) {
    console.error(
      `[inception] Provider init error: ${err instanceof Error ? err.message : String(err)}`
    );
    process.exit(1);
  }
  const { provider, model } = providerSelection;

  // ── Create memory backend ──────────────────────────────────────────────────
  const dbPath = options.memory ?? join(homedir(), '.inception', 'memory.db');
  const memory = new SQLiteMemoryBackend();
  await memory.initialize({
    backend: 'sqlite',
    connectionString: dbPath,
    maxEntries: 100_000,
    compactionThreshold: 0.75,
  });

  // ── Create tool registry ───────────────────────────────────────────────────
  const toolRegistry = buildToolRegistry();

  // ── Create security manager (validates tool execution against policy) ───────
  new SecurityManager({
    network: cfg.security.network,
    filesystem: {
      ...cfg.security.filesystem,
      workspacePath: process.cwd(),
    },
    execution: cfg.security.execution,
    authentication: cfg.security.authentication,
    rateLimit: cfg.security.rateLimit,
  });

  // ── Create CLI channel ─────────────────────────────────────────────────────
  const cliChannel = new CliChannel();
  await cliChannel.initialize({ enabled: true });
  cliChannel.setAgentName(cfg.agent.identity.name);

  // ── Create channel manager ─────────────────────────────────────────────────
  const channelManager = new ChannelManager();
  channelManager.register(cliChannel, { operatorChannel: true });

  // ── Create approval handler ────────────────────────────────────────────────
  const pendingResolvers = new Map<string, (approved: boolean) => void>();

  const approvalHandler = async (request: PendingApproval): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      cliChannel.showApprovalPrompt({
        id: request.id,
        toolName: request.toolName,
        toolDescription: request.toolDescription,
        args: request.args,
        expiresAt: request.expiresAt,
      });
      pendingResolvers.set(request.id, resolve);
    });
  };

  // ── Create agent loop ──────────────────────────────────────────────────────
  const agentLoop = new AgentLoop({
    identity: cfg.agent.identity,
    operator: cfg.agent.operator,
    provider,
    memory,
    toolRegistry,
    approvalHandler,
    model,
    maxToolRounds: 10,
    activeMission: options.activeMission,
    allowedCommands: cfg.security.execution.allowedCommands,
    allowedPaths: cfg.security.filesystem.allowedPaths,
  });

  // ── Wire slash commands ────────────────────────────────────────────────────
  // Shared mutable ref to active mission (can change via /mission create)
  let currentMission: Mission | undefined = options.activeMission;

  const slashCtx = (): SlashCommandContext => ({
    activeMission: currentMission,
    onMissionUpdate: (updated: Mission) => {
      currentMission = updated;
      cliChannel.setActiveMission(updated.title);
    },
    agentName: cfg.agent.identity.name,
    provider: provider.id,
    model,
  });

  cliChannel.setSlashHandler((cmd: string) => {
    const result = handleSlashCommand(cmd, slashCtx());
    // Handle /pause — trigger graceful shutdown after response
    if (cmd.trim() === '/pause') {
      setTimeout(() => void shutdown(), 500);
    }
    return result;
  });

  // ── Show active mission in status bar ─────────────────────────────────────
  if (currentMission) {
    cliChannel.setActiveMission(currentMission.title);
  }

  // ── Wire inbound messages ──────────────────────────────────────────────────
  channelManager.onMessage(async (inbound) => {
    cliChannel.setRuntimeState('Pensando...');
    try {
      const result = await agentLoop.turn(inbound);
      await channelManager.send(result.response);
      cliChannel.setRuntimeState('Pronto');
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error(`[inception] Turn error: ${errMsg}`);
      cliChannel.setRuntimeState('Erro');
    }
  });

  channelManager.onError((err, channelId) => {
    console.error(`[inception] Channel error on ${channelId}: ${err.message}`);
  });

  // ── Initialize runtime ─────────────────────────────────────────────────────
  const runtime = new InceptionRuntime();
  await runtime.initialize(cfg.runtime);

  // ── Start everything ───────────────────────────────────────────────────────
  await runtime.start();
  cliChannel.setRuntimeState('Pronto');
  await channelManager.startAll();

  // ── Refresh de modelos em background (fire and forget) ────────────────────
  refreshModelsInBackground(
    Object.entries(cfg.providers).map(([slug, provCfg]) => ({
      slug,
      apiKey: provCfg.apiKey,
      baseUrl: provCfg.baseUrl,
    }))
  );

  if (options.debug) {
    console.error(`[inception] Provider: ${provider.id} / Model: ${model}`);
    console.error(`[inception] Memory DB: ${dbPath}`);
    console.error(
      `[inception] Tools: ${toolRegistry
        .list()
        .map((t) => t.id)
        .join(', ')}`
    );
    if (currentMission) {
      console.error(`[inception] Active Mission: ${currentMission.title} (${currentMission.id})`);
    }
  }

  // ── Handle approval decisions from the UI ─────────────────────────────────
  const originalHandleDecision = (
    cliChannel as unknown as { _handleApprovalDecision: (id: string, approved: boolean) => void }
  )._handleApprovalDecision.bind(cliChannel);
  (
    cliChannel as unknown as { _handleApprovalDecision: (id: string, approved: boolean) => void }
  )._handleApprovalDecision = (approvalId: string, approved: boolean): void => {
    originalHandleDecision(approvalId, approved);
    const resolver = pendingResolvers.get(approvalId);
    if (resolver) {
      pendingResolvers.delete(approvalId);
      resolver(approved);
    }
    agentLoop.resolveApproval(approvalId, approved);
  };

  // ── Graceful shutdown ──────────────────────────────────────────────────────
  const shutdown = async (): Promise<void> => {
    cliChannel.setRuntimeState('Encerrando...');
    await channelManager.stopAll();
    await memory.close();
    await runtime.stop();
    process.exit(0);
  };

  process.on('SIGINT', () => void shutdown());
  process.on('SIGTERM', () => void shutdown());

  // Block until exit
  await new Promise<void>(() => {
    /* keep process alive */
  });
}
