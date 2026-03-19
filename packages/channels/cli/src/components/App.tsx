import { Box, useApp } from 'ink';
import React from 'react';

import type { CliAppState } from '../types.js';

import { ApprovalPrompt } from './ApprovalPrompt.js';
import { InputBox } from './InputBox.js';
import { MessageList } from './MessageList.js';
import { StatusBar } from './StatusBar.js';


interface AppProps {
  state: CliAppState;
  onUserInput: (text: string) => void;
  onApprovalDecision: (approvalId: string, approved: boolean) => void;
}

export function App({ state, onUserInput, onApprovalDecision }: AppProps): React.ReactElement {
  const { exit } = useApp();

  // Handle /stop and /exit commands
  const handleInput = (text: string): void => {
    if (text === '/stop' || text === '/exit') {
      exit();
      return;
    }
    onUserInput(text);
  };

  return (
    <Box flexDirection="column" height="100%">
      <StatusBar
        agentName={state.agentName}
        state={state.runtimeState}
        activeMission={state.activeMission}
        tokenCount={state.tokenCount}
        toolRounds={state.toolRounds}
      />
      <MessageList messages={state.messages} />
      {state.pendingApproval ? (
        <ApprovalPrompt
          approval={state.pendingApproval}
          onDecision={onApprovalDecision}
        />
      ) : (
        <InputBox
          onSubmit={handleInput}
          disabled={state.isProcessing}
          placeholder={state.isProcessing ? 'Processando...' : 'Digite uma mensagem... (/stop para sair)'}
        />
      )}
    </Box>
  );
}
