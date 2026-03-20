// ============================================================================
// Mission Wizard Logic — pure logic, no I/O, no readline, no chalk
// Reusable by CLI, slash commands, and tests.
// ============================================================================

import type { Mission, Task } from '@rabeluslab/inception-types';
import { AgentMode, AutonomyLevel, TechnicalStatus, TaskStatus } from '@rabeluslab/inception-types';

// ----------------------------------------------------------------------------
// Domain types
// ----------------------------------------------------------------------------

export type MissionType =
  | 'development'
  | 'research'
  | 'analysis'
  | 'automation'
  | 'refactor'
  | 'investigation';

export type TechStack = 'node' | 'python' | 'go' | 'docker' | 'browser' | 'api' | 'sql' | 'nosql';

export type Methodology =
  | 'exploratory'
  | 'tdd'
  | 'research-first'
  | 'sprint'
  | 'autonomous';

export type Skill =
  | 'web-scraping'
  | 'code-generation'
  | 'data-analysis'
  | 'api-integration'
  | 'deploy'
  | 'documentation';

export type WizardAutonomyLevel = 'readonly' | 'supervised' | 'full';

// ----------------------------------------------------------------------------
// Wizard input — the "answers" collected by any UI
// ----------------------------------------------------------------------------

export interface MissionWizardInput {
  name: string;
  type: MissionType;
  description: string;
  techStack: TechStack[];
  methodology: Methodology;
  autonomyLevel: WizardAutonomyLevel;
  skills: Skill[];
  rules: string[];
  initialTasks: string[];
}

// ----------------------------------------------------------------------------
// Label/description maps (used by UI to render options)
// ----------------------------------------------------------------------------

export const MISSION_TYPE_LABELS: Record<MissionType, string> = {
  development: 'Development',
  research: 'Research',
  analysis: 'Analysis',
  automation: 'Automation',
  refactor: 'Refactor',
  investigation: 'Investigation',
};

export const MISSION_TYPE_DESCRIPTIONS: Record<MissionType, string> = {
  development: 'Build or extend a software feature, module, or system',
  research: 'Investigate a topic and produce findings or a report',
  analysis: 'Examine existing code, data, or systems to identify patterns or issues',
  automation: 'Create scripts or pipelines that automate repetitive processes',
  refactor: 'Improve code quality, structure, or performance without changing behavior',
  investigation: 'Debug or diagnose a problem, tracing root cause and proposing fixes',
};

export const TECH_STACK_LABELS: Record<TechStack, string> = {
  node: 'Node.js / TypeScript',
  python: 'Python',
  go: 'Go',
  docker: 'Docker / Kubernetes',
  browser: 'Browser / Frontend',
  api: 'REST / GraphQL API',
  sql: 'SQL Database',
  nosql: 'NoSQL Database',
};

export const METHODOLOGY_LABELS: Record<Methodology, string> = {
  exploratory: 'Exploratory',
  tdd: 'TDD (Test-Driven Development)',
  'research-first': 'Research-First',
  sprint: 'Sprint',
  autonomous: 'Autonomous',
};

export const METHODOLOGY_DESCRIPTIONS: Record<Methodology, string> = {
  exploratory: 'Discover the problem space before committing to a solution',
  tdd: 'Write tests before implementation; red-green-refactor cycle',
  'research-first': 'Gather information and produce a design doc before writing code',
  sprint: 'Time-boxed execution with a defined backlog',
  autonomous: 'Agent acts independently with minimal checkpoints',
};

export const AUTONOMY_LEVEL_LABELS: Record<WizardAutonomyLevel, string> = {
  readonly: 'Read-only (observe only)',
  supervised: 'Supervised (request approval for risky actions)',
  full: 'Full autonomy (act independently)',
};

export const SKILL_LABELS: Record<Skill, string> = {
  'web-scraping': 'Web Scraping',
  'code-generation': 'Code Generation',
  'data-analysis': 'Data Analysis',
  'api-integration': 'API Integration',
  deploy: 'Deploy / DevOps',
  documentation: 'Documentation',
};

// ----------------------------------------------------------------------------
// Wizard step definitions
// ----------------------------------------------------------------------------

export type WizardStepId =
  | 'name'
  | 'type'
  | 'description'
  | 'techStack'
  | 'methodology'
  | 'autonomyLevel'
  | 'skills'
  | 'rules'
  | 'initialTasks';

export interface WizardStepOption {
  readonly value: string;
  readonly label: string;
  readonly description?: string;
}

export interface WizardStep {
  readonly id: WizardStepId;
  readonly order: number;
  readonly title: string;
  readonly prompt: string;
  readonly inputType: 'text' | 'select' | 'multiselect' | 'list';
  readonly required: boolean;
  readonly options?: readonly WizardStepOption[];
  readonly hint?: string;
}

export function getWizardSteps(): WizardStep[] {
  return [
    {
      id: 'name',
      order: 1,
      title: 'Mission Name',
      prompt: 'What is the name of this mission?',
      inputType: 'text',
      required: true,
      hint: 'Use a short, descriptive name (e.g. "Implement auth module")',
    },
    {
      id: 'type',
      order: 2,
      title: 'Mission Type',
      prompt: 'What type of mission is this?',
      inputType: 'select',
      required: true,
      options: (Object.keys(MISSION_TYPE_LABELS) as MissionType[]).map((k) => ({
        value: k,
        label: MISSION_TYPE_LABELS[k],
        description: MISSION_TYPE_DESCRIPTIONS[k],
      })),
    },
    {
      id: 'description',
      order: 3,
      title: 'Description',
      prompt: 'Describe the goal and scope of this mission:',
      inputType: 'text',
      required: true,
      hint: 'What should be done and why? Be as specific as possible.',
    },
    {
      id: 'techStack',
      order: 4,
      title: 'Tech Stack',
      prompt: 'Which technologies are involved? (select all that apply)',
      inputType: 'multiselect',
      required: false,
      options: (Object.keys(TECH_STACK_LABELS) as TechStack[]).map((k) => ({
        value: k,
        label: TECH_STACK_LABELS[k],
      })),
    },
    {
      id: 'methodology',
      order: 5,
      title: 'Methodology',
      prompt: 'Which methodology should guide execution?',
      inputType: 'select',
      required: true,
      options: (Object.keys(METHODOLOGY_LABELS) as Methodology[]).map((k) => ({
        value: k,
        label: METHODOLOGY_LABELS[k],
        description: METHODOLOGY_DESCRIPTIONS[k],
      })),
    },
    {
      id: 'autonomyLevel',
      order: 6,
      title: 'Autonomy Level',
      prompt: 'How much autonomy should the agent have?',
      inputType: 'select',
      required: true,
      options: (Object.keys(AUTONOMY_LEVEL_LABELS) as WizardAutonomyLevel[]).map((k) => ({
        value: k,
        label: AUTONOMY_LEVEL_LABELS[k],
      })),
    },
    {
      id: 'skills',
      order: 7,
      title: 'Required Skills',
      prompt: 'Which agent skills will be needed? (select all that apply)',
      inputType: 'multiselect',
      required: false,
      options: (Object.keys(SKILL_LABELS) as Skill[]).map((k) => ({
        value: k,
        label: SKILL_LABELS[k],
      })),
    },
    {
      id: 'rules',
      order: 8,
      title: 'Mission Rules',
      prompt: 'Add any mission-specific rules or constraints (one per line, leave empty to skip):',
      inputType: 'list',
      required: false,
      hint: 'e.g. "Never delete production data", "Always write tests before implementation"',
    },
    {
      id: 'initialTasks',
      order: 9,
      title: 'Initial Tasks',
      prompt: 'List the initial tasks for this mission (one per line):',
      inputType: 'list',
      required: false,
      hint: 'You can always add more tasks later.',
    },
  ];
}

// ----------------------------------------------------------------------------
// Validation
// ----------------------------------------------------------------------------

export interface WizardValidationResult {
  readonly valid: boolean;
  readonly errors: string[];
}

export function validateMissionInput(
  input: Partial<MissionWizardInput>
): WizardValidationResult {
  const errors: string[] = [];

  if (input.name === undefined || input.name.trim().length === 0) {
    errors.push('Mission name is required.');
  } else if (input.name.trim().length < 3) {
    errors.push('Mission name must be at least 3 characters.');
  } else if (input.name.trim().length > 120) {
    errors.push('Mission name must be at most 120 characters.');
  }

  const validTypes: MissionType[] = [
    'development',
    'research',
    'analysis',
    'automation',
    'refactor',
    'investigation',
  ];
  if (!input.type) {
    errors.push('Mission type is required.');
  } else if (!validTypes.includes(input.type)) {
    errors.push(`Invalid mission type: "${input.type}". Must be one of: ${validTypes.join(', ')}.`);
  }

  if (input.description === undefined || input.description.trim().length === 0) {
    errors.push('Mission description is required.');
  } else if (input.description.trim().length < 10) {
    errors.push('Mission description must be at least 10 characters.');
  }

  const validMethodologies: Methodology[] = [
    'exploratory',
    'tdd',
    'research-first',
    'sprint',
    'autonomous',
  ];
  if (!input.methodology) {
    errors.push('Methodology is required.');
  } else if (!validMethodologies.includes(input.methodology)) {
    errors.push(
      `Invalid methodology: "${input.methodology}". Must be one of: ${validMethodologies.join(', ')}.`
    );
  }

  const validAutonomy: WizardAutonomyLevel[] = ['readonly', 'supervised', 'full'];
  if (!input.autonomyLevel) {
    errors.push('Autonomy level is required.');
  } else if (!validAutonomy.includes(input.autonomyLevel)) {
    errors.push(
      `Invalid autonomy level: "${input.autonomyLevel}". Must be one of: ${validAutonomy.join(', ')}.`
    );
  }

  if (input.techStack !== undefined) {
    const validStacks: TechStack[] = [
      'node',
      'python',
      'go',
      'docker',
      'browser',
      'api',
      'sql',
      'nosql',
    ];
    const invalid = input.techStack.filter((s) => !validStacks.includes(s));
    if (invalid.length > 0) {
      errors.push(`Invalid tech stack values: ${invalid.join(', ')}.`);
    }
  }

  if (input.skills !== undefined) {
    const validSkills: Skill[] = [
      'web-scraping',
      'code-generation',
      'data-analysis',
      'api-integration',
      'deploy',
      'documentation',
    ];
    const invalid = input.skills.filter((s) => !validSkills.includes(s));
    if (invalid.length > 0) {
      errors.push(`Invalid skill values: ${invalid.join(', ')}.`);
    }
  }

  return { valid: errors.length === 0, errors };
}

// ----------------------------------------------------------------------------
// Conversion: WizardInput → Mission create payload
// ----------------------------------------------------------------------------

function generateTaskId(index: number): string {
  return `task_${Date.now().toString(36)}_${index.toString(36)}`;
}

/**
 * Converts a WizardAutonomyLevel string to the AutonomyLevel enum value.
 */
function wizardAutonomyToEnum(level: WizardAutonomyLevel): AutonomyLevel {
  switch (level) {
    case 'readonly':
      return AutonomyLevel.Readonly;
    case 'supervised':
      return AutonomyLevel.Supervised;
    case 'full':
      return AutonomyLevel.Full;
  }
}

/**
 * Determines the suggested AgentMode from methodology.
 * Mirrors the logic in mission-config-mapper for consistency.
 */
function methodologyToAgentMode(methodology: Methodology): AgentMode {
  if (methodology === 'research-first' || methodology === 'exploratory') {
    return AgentMode.Auditor;
  }
  return AgentMode.Executor;
}

/**
 * Converts a completed MissionWizardInput into the shape expected by
 * MissionProtocol.createMission() — i.e. Omit<Mission, 'id' | 'createdAt' | 'status'>.
 */
export function wizardInputToMissionCreate(
  input: MissionWizardInput,
  createdBy: string
): Omit<Mission, 'id' | 'createdAt' | 'status'> {
  const tasks: Task[] = input.initialTasks
    .filter((t) => t.trim().length > 0)
    .map((description, index) => ({
      id: generateTaskId(index),
      group: 'B' as Task['group'],
      description: description.trim(),
      status: TaskStatus.Pending,
      dependencies: [],
      technicalStatus: TechnicalStatus.Stub,
    }));

  // Encode wizard metadata (techStack, methodology, skills, rules) in Mission.metadata.tags
  const tags: string[] = [
    `type:${input.type}`,
    `methodology:${input.methodology}`,
    ...input.techStack.map((s) => `stack:${s}`),
    ...input.skills.map((s) => `skill:${s}`),
  ];

  return {
    title: input.name.trim(),
    description: input.description.trim(),
    projectId: 'default',
    mode: methodologyToAgentMode(input.methodology),
    autonomyLevel: wizardAutonomyToEnum(input.autonomyLevel),
    tasks,
    createdBy,
    metadata: {
      priority: 1,
      tags,
    },
  };
}
