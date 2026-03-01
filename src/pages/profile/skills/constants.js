// Technical skill categories (ATS-friendly grouping)
export const TECH_SKILL_CATEGORIES = [
  'Programming Languages',
  'Frameworks',
  'Databases',
  'Tools',
  'Cloud',
  'DevOps',
  'AI/ML',
];

export const PROFICIENCY_LEVELS = [
  { value: 'Beginner', label: 'Beginner', level: 1 },
  { value: 'Intermediate', label: 'Intermediate', level: 2 },
  { value: 'Advanced', label: 'Advanced', level: 3 },
  { value: 'Expert', label: 'Expert', level: 4 },
];

// Mock skill DB for autocomplete (replace with API later)
export const SKILL_SUGGESTIONS = [
  { name: 'JavaScript', category: 'Programming Languages' },
  { name: 'TypeScript', category: 'Programming Languages' },
  { name: 'Python', category: 'Programming Languages' },
  { name: 'Java', category: 'Programming Languages' },
  { name: 'Go', category: 'Programming Languages' },
  { name: 'React', category: 'Frameworks' },
  { name: 'React.js', category: 'Frameworks' },
  { name: 'Node.js', category: 'Frameworks' },
  { name: 'Vue.js', category: 'Frameworks' },
  { name: 'Angular', category: 'Frameworks' },
  { name: 'Express', category: 'Frameworks' },
  { name: 'Next.js', category: 'Frameworks' },
  { name: 'PostgreSQL', category: 'Databases' },
  { name: 'MongoDB', category: 'Databases' },
  { name: 'Redis', category: 'Databases' },
  { name: 'MySQL', category: 'Databases' },
  { name: 'Git', category: 'Tools' },
  { name: 'Docker', category: 'DevOps' },
  { name: 'Kubernetes', category: 'DevOps' },
  { name: 'AWS', category: 'Cloud' },
  { name: 'GCP', category: 'Cloud' },
  { name: 'Azure', category: 'Cloud' },
  { name: 'CI/CD', category: 'DevOps' },
  { name: 'TensorFlow', category: 'AI/ML' },
  { name: 'PyTorch', category: 'AI/ML' },
];

// Soft skill categories
export const SOFT_SKILL_CATEGORIES = [
  'Communication',
  'Leadership',
  'Analytical',
  'Behavioral',
  'Team-based',
];

// Soft skill suggestions (max 10 for ATS)
export const MAX_SOFT_SKILLS = 10;

export const SOFT_SKILL_SUGGESTIONS = [
  'Communication', 'Problem Solving', 'Leadership', 'Teamwork', 'Time Management',
  'Adaptability', 'Critical Thinking', 'Creativity', 'Conflict Resolution', 'Decision Making',
  'Emotional Intelligence', 'Mentorship', 'Presentation', 'Negotiation', 'Collaboration',
];

// Gap analysis badge types
export const SKILL_GAP_TYPES = {
  MATCH: 'match',       // green - in job description
  CORE: 'core',         // primary skill
  SUPPORTING: 'supporting',
  EMERGING: 'emerging',
  MISSING: 'missing',   // red - job wants, you don't have
  BONUS: 'bonus',       // blue - you have, extra
};
