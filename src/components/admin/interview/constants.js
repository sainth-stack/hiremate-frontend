export const DIFFICULTY_OPTIONS = ['easy', 'medium', 'hard'];

export const DIFFICULTY_CONFIG = {
  easy: {
    label: 'Easy',
    subtitle: 'Fundamentals & warm-up',
    bgcolor: 'var(--success-bg)',
    color: 'var(--success-dark)',
    border: 'rgba(22, 163, 74, 0.25)',
  },
  medium: {
    label: 'Medium',
    subtitle: 'Applied & scenario-based',
    bgcolor: 'var(--warning-bg)',
    color: 'var(--warning-dark)',
    border: 'rgba(217, 119, 6, 0.25)',
  },
  hard: {
    label: 'Hard',
    subtitle: 'Deep dive & system design',
    bgcolor: 'var(--error-bg)',
    color: 'var(--error-dark)',
    border: 'rgba(220, 38, 38, 0.25)',
  },
};

export const CATEGORY_COLORS = {
  technical: { bg: 'rgba(37, 99, 235, 0.1)', color: '#2563eb' },
  behavioral: { bg: 'rgba(168, 85, 247, 0.1)', color: '#9333ea' },
  hr: { bg: 'rgba(14, 165, 233, 0.1)', color: '#0284c7' },
  leadership: { bg: 'rgba(245, 158, 11, 0.12)', color: '#d97706' },
  default: { bg: 'rgba(100, 116, 139, 0.1)', color: '#64748b' },
};

export const CREATION_STEPS = [
  { key: 'define', label: 'Define interview' },
  { key: 'generate', label: 'Generate questions' },
  { key: 'review', label: 'Review & refine' },
];

export const LAUNCH_STEPS = [
  { key: 'create', label: 'Create template' },
  { key: 'review', label: 'Review questions' },
  { key: 'launch', label: 'Assign users' },
];

export const GENERATION_MESSAGES = [
  'Analyzing role requirements…',
  'Crafting behavioral questions…',
  'Building technical scenarios…',
  'Balancing difficulty mix…',
  'Polishing question phrasing…',
  'Finalizing your interview pack…',
];

export const TITLE_MAX_LENGTH = 255;

export const QUESTION_COUNT_OPTIONS = [5, 8, 10, 12, 15, 18, 20, 25, 30];

export const DESCRIPTION_PLACEHOLDER = `Paste or write the job context your interviewer would use.

Example:
• Role: Senior Frontend Engineer at Stripe
• Stack: React, TypeScript, GraphQL
• Focus: component architecture, performance, cross-team collaboration
• Must-have: 5+ years experience, payments domain a plus
• Interview style: conversational, mix of behavioral + technical`;
