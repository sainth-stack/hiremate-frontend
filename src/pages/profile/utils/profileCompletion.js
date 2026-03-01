/**
 * Compute profile completion percentage and which sections are incomplete.
 * Used for header indicator and Review tab.
 */

const SECTION_KEYS = [
  'profile',
  'experience',
  'education',
  'skills',
  'projects',
  'preferences',
  'links',
];

const SECTION_LABELS = {
  profile: 'Profile',
  experience: 'Experience',
  education: 'Education',
  skills: 'Skills',
  projects: 'Projects',
  preferences: 'Preferences',
  links: 'Links',
};

function scoreProfile(form) {
  let score = 0;
  const max = 7;
  if (form.firstName?.trim() && form.lastName?.trim() && form.email?.trim()) score += 1;
  return { score, max: 1 };
}

function scoreExperience(form) {
  const arr = form.experiences ?? [];
  if (arr.length === 0) return { score: 0, max: 1 };
  const filled = arr.filter((e) => (e.jobTitle?.trim() && e.companyName?.trim()) || e.description?.trim()).length;
  return { score: Math.min(1, filled), max: 1 };
}

function scoreEducation(form) {
  const arr = form.educations ?? [];
  if (arr.length === 0) return { score: 0, max: 1 };
  const filled = arr.filter((e) => e.degree?.trim() || e.institution?.trim()).length;
  return { score: Math.min(1, filled), max: 1 };
}

function scoreSkills(form) {
  const tech = form.techSkills ?? [];
  const soft = form.softSkills ?? [];
  const hasAny = (tech.length > 0 && tech.some((s) => s.name?.trim())) || (soft.length > 0 && soft.some((s) => s.name?.trim()));
  return { score: hasAny ? 1 : 0, max: 1 };
}

function scoreProjects(form) {
  const arr = form.projects ?? [];
  const filled = arr.filter((p) => p.name?.trim() || p.description?.trim()).length;
  return { score: Math.min(1, filled), max: 1 };
}

function scorePreferences(form) {
  const p = form.preferences ?? {};
  const hasRoles = !!p.desiredRoles?.trim();
  const hasType = Array.isArray(p.employmentType) && p.employmentType.length > 0;
  const hasLevel = !!p.experienceLevel;
  const count = [hasRoles, hasType, hasLevel].filter(Boolean).length;
  return { score: count / 3, max: 1 };
}

function scoreLinks(form) {
  const links = form.links ?? {};
  const hasLinkedIn = !!links.linkedInUrl?.trim();
  return { score: hasLinkedIn ? 1 : 0, max: 1 };
}

const scorers = {
  profile: scoreProfile,
  experience: scoreExperience,
  education: scoreEducation,
  skills: scoreSkills,
  projects: scoreProjects,
  preferences: scorePreferences,
  links: scoreLinks,
};

/**
 * @param {Object} form - profile.form from Redux
 * @returns {{ percent: number, sectionsRemaining: number, sections: Array<{ key: string, label: string, complete: boolean, percent: number }> }}
 */
export function getProfileCompletion(form) {
  if (!form) {
    return { percent: 0, sectionsRemaining: 7, sections: SECTION_KEYS.map((key) => ({ key, label: SECTION_LABELS[key], complete: false, percent: 0 })) };
  }

  let totalScore = 0;
  let totalMax = 0;
  const sections = SECTION_KEYS.map((key) => {
    const fn = scorers[key];
    const { score, max } = fn ? fn(form) : { score: 0, max: 1 };
    totalScore += score;
    totalMax += max;
    const percent = max ? Math.round((score / max) * 100) : 0;
    return {
      key,
      label: SECTION_LABELS[key],
      complete: percent >= 100,
      percent,
    };
  });

  const percent = totalMax ? Math.round((totalScore / totalMax) * 100) : 0;
  const sectionsRemaining = sections.filter((s) => !s.complete).length;

  return { percent, sectionsRemaining, sections };
}
