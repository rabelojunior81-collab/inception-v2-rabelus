import type { ChatMessage } from './components/MessageList.js';

export interface PendingApprovalDisplay {
  id: string;
  toolName: string;
  toolDescription: string;
  args: Record<string, unknown>;
  expiresAt: string;
}

export interface CliAppState {
  messages: ChatMessage[];
  agentName: string;
  runtimeState: string;
  activeMission?: string;
  tokenCount?: number;
  toolRounds?: number;
  pendingApproval?: PendingApprovalDisplay;
  isProcessing: boolean;
}
