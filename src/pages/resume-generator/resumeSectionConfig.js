/** Built-in resume section IDs and default display labels (sync with backend DEFAULT_SECTION_LABELS). */
export const DEFAULT_SECTION_LABELS = {
  summary: 'Professional Summary',
  experience: 'Work Experience',
  skills: 'Skills',
  education: 'Education',
  projects: 'Projects',
  certifications: 'Awards and Certificates',
};

export const REMOVABLE_SECTIONS = [
  'summary',
  'experience',
  'skills',
  'education',
  'projects',
  'certifications',
];

export const ALL_BUILTIN_SECTIONS = [...REMOVABLE_SECTIONS];

export function getDefaultSectionLabels() {
  return { ...DEFAULT_SECTION_LABELS };
}

export function getSectionLabel(sectionId, sectionLabels) {
  return (sectionLabels && sectionLabels[sectionId]) || DEFAULT_SECTION_LABELS[sectionId] || sectionId;
}

/** Empty sections_visible = all sections shown. */
export function isSectionVisible(sectionId, sectionsVisible) {
  if (!sectionsVisible || sectionsVisible.length === 0) return true;
  return sectionsVisible.includes(sectionId);
}

export function getVisibleSections(sectionsVisible) {
  if (!sectionsVisible || sectionsVisible.length === 0) return [...ALL_BUILTIN_SECTIONS];
  return ALL_BUILTIN_SECTIONS.filter((id) => sectionsVisible.includes(id));
}

export function getHiddenSections(sectionsVisible) {
  if (!sectionsVisible || sectionsVisible.length === 0) return [];
  return ALL_BUILTIN_SECTIONS.filter((id) => !sectionsVisible.includes(id));
}

export function removeSection(sectionId, sectionsVisible) {
  const current = sectionsVisible?.length ? [...sectionsVisible] : [...ALL_BUILTIN_SECTIONS];
  return current.filter((id) => id !== sectionId);
}

export function restoreSection(sectionId, sectionsVisible) {
  const current = sectionsVisible?.length ? [...sectionsVisible] : [...ALL_BUILTIN_SECTIONS];
  if (current.includes(sectionId)) return current;
  return [...current, sectionId];
}

export function updateSectionLabel(sectionId, label, sectionLabels) {
  return {
    ...(sectionLabels || getDefaultSectionLabels()),
    [sectionId]: label,
  };
}

/** Client-side migration when snapshot has legacy techSkills only. */
export function migrateLegacySkillsToCategories(profile) {
  if (profile.skillCategories?.length) return profile.skillCategories;
  const categories = [];
  const tech = (profile.techSkills || []).map((s) => (s.name || '').trim()).filter(Boolean);
  if (tech.length) {
    categories.push({ categoryName: 'Technical Skills', skills: tech, order: 0 });
  }
  const soft = (profile.softSkills || []).map((s) => (s.name || '').trim()).filter(Boolean);
  if (soft.length) {
    categories.push({ categoryName: 'Soft Skills', skills: soft, order: categories.length });
  }
  return categories;
}

export function normalizeSkillCategories(raw) {
  if (!Array.isArray(raw) || raw.length === 0) return [];
  return raw.map((cat, idx) => ({
    categoryName: cat.categoryName || cat.category_name || '',
    skills: Array.isArray(cat.skills) ? cat.skills : [],
    order: cat.order ?? idx,
  }));
}

export function normalizeCustomSections(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.map((s, idx) => ({
    sectionId: s.sectionId || s.section_id || `section_${idx}`,
    sectionName: s.sectionName || s.section_name || 'New Section',
    content: s.content || '',
    format: s.format || 'bullets',
    order: s.order ?? idx,
    enabled: s.enabled !== false,
  }));
}

export function skillsToCommaString(skills) {
  if (!Array.isArray(skills)) return '';
  return skills.filter(Boolean).join(', ');
}

export function commaStringToSkills(text) {
  if (!text || !String(text).trim()) return [];
  return String(text)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}
