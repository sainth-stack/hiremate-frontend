/**
 * Normalize between extended UI shape and legacy API shape.
 * API expects: techSkills[{ name, level, years }], softSkills[{ name }].
 */

const generateId = () => `skill_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

export function toLegacyTechSkill(s) {
  if (!s) return { name: '', level: '', years: '' };
  return {
    name: s.name ?? '',
    level: s.proficiencyLevel ?? s.level ?? '',
    years: s.years ?? s.yearsOfExperience ?? '',
  };
}

export function toLegacySoftSkill(s) {
  if (!s) return { name: '' };
  return { name: s.name ?? '' };
}

export function fromLegacyTechSkill(s, index) {
  if (!s) return createEmptyTechSkill(index);
  return {
    id: s.id ?? generateId(),
    name: s.name ?? '',
    category: s.category ?? '',
    proficiencyLevel: s.proficiencyLevel ?? s.level ?? '',
    years: s.years ?? s.yearsOfExperience ?? '',
    lastUsed: s.lastUsed ?? '',
    aiScore: s.aiScore ?? null,
    relevanceToJob: s.relevanceToJob ?? null,
    isCoreSkill: s.isCoreSkill ?? false,
  };
}

export function fromLegacySoftSkill(s, index) {
  if (!s) return createEmptySoftSkill(index);
  return {
    id: s.id ?? generateId(),
    name: s.name ?? '',
    category: s.category ?? '',
    aiRelevanceScore: s.aiRelevanceScore ?? null,
  };
}

export function createEmptyTechSkill(index) {
  return {
    id: generateId(),
    name: '',
    category: '',
    proficiencyLevel: '',
    years: '',
    lastUsed: '',
    aiScore: null,
    relevanceToJob: null,
    isCoreSkill: false,
  };
}

export function createEmptySoftSkill(index) {
  return {
    id: generateId(),
    name: '',
    category: '',
    aiRelevanceScore: null,
  };
}
