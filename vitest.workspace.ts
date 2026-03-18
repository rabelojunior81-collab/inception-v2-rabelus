import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  'packages/memory/vitest.config.ts',
  'packages/agent/vitest.config.ts',
  'packages/security/vitest.config.ts',
  'packages/tools/filesystem/vitest.config.ts',
]);
