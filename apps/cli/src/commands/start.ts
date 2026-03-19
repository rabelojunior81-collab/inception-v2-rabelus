// ============================================================================
// inception start — launches the full runtime with the CLI channel
// ============================================================================

import { homedir } from 'node:os';
import { join } from 'node:path';

import { AgentLoop } from '@rabeluslab/inception-agent';
import type { PendingApproval } from '@rabeluslab/inception-agent';
import { CliChannel } from '@rabeluslab/inception-channel-cli';
import { loadConfig } from '@rabeluslab/inception-config';
import { ChannelManager, InceptionRuntime } from '@rabeluslab/inception-core';
import { SQLiteMemoryBackend } from '@rabeluslab/inception-memory';
import { SecurityManager } from '@rabeluslab/inception-security';

import { createProvider } from '../provider-factory.js';
import { buildToolRegistry } from '../tool-registry.js';

export interface StartOptions {
  config?: string;
  provider?: string;
  model?: string;
  memory?: string;
  debug?: boolean;
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

  const pendingResolvers = new Map<string, (approved: boolean) => void>();

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
    allowedCommands: cfg.security.execution.allowedCommands,
    allowedPaths: cfg.security.filesystem.allowedPaths,
  });

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

  if (options.debug) {
    console.error(`[inception] Provider: ${provider.id} / Model: ${model}`);
    console.error(`[inception] Memory DB: ${dbPath}`);
    console.error(
      `[inception] Tools: ${toolRegistry
        .list()
        .map((t) => t.id)
        .join(', ')}`
    );
  }

  // ── Handle approval decisions from the UI ─────────────────────────────────
  // CliChannel calls _handleApprovalDecision which only clears the UI.
  // We need to also resolve the pending promise.
  // Override the channel's approval handler by monkey-patching the private method:
  const originalHandleDecision = (
    cliChannel as unknown as { _handleApprovalDecision: (id: string, approved: boolean) => void }
  )._handleApprovalDecision.bind(cliChannel);
  (
    cliChannel as unknown as { _handleApprovalDecision: (id: string, approved: boolean) => void }
  )._handleApprovalDecision = (approvalId: string, approved: boolean): void => {
    originalHandleDecision(approvalId, approved);
    // Resolve the pending AgentLoop approval promise
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
