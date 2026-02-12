/**
 * Maps API parsed resume response (snake_case or camelCase) to profile tab field shapes.
 * If response has field → use value; if not → empty string or empty array.
 */

const toStr = (v) => (v != null && v !== '' ? String(v).trim() : '');
const toArr = (v) => (Array.isArray(v) ? v : []);

/** Profile tab: supports flat response (firstName, professionalHeadline, etc.) or nested profile */
export const mapParsedProfile = (parsed) => {
  if (!parsed) {
    return { firstName: '', lastName: '', email: '', phone: '', city: '', country: '', headline: '', summary: '', willingToWorkIn: [] };
  }
  const p = parsed.profile ?? parsed;
  const willingRaw = p.willing_to_work_in ?? p.willingToWorkIn;
  const willingArr = Array.isArray(willingRaw) ? willingRaw.map((x) => toStr(x)) : [];
  return {
    firstName: toStr(p.first_name ?? p.firstName),
    lastName: toStr(p.last_name ?? p.lastName),
    email: toStr(p.email),
    phone: toStr(p.phone),
    city: toStr(p.city),
    country: toStr(p.country),
    headline: toStr(p.headline ?? p.professional_headline ?? p.professionalHeadline),
    summary: toStr(p.summary ?? p.professional_summary ?? p.professionalSummary),
    willingToWorkIn: willingArr,
  };
};

export const mapParsedExperience = (parsed) => {
  const raw = toArr(parsed?.experiences ?? parsed?.experience);
  return raw.map((e) => ({
    jobTitle: toStr(e.job_title ?? e.jobTitle),
    companyName: toStr(e.company_name ?? e.companyName),
    employmentType: toStr(e.employment_type ?? e.employmentType),
    startDate: toStr(e.start_date ?? e.startDate),
    endDate: toStr(e.end_date ?? e.endDate),
    location: toStr(e.location),
    workMode: toStr(e.work_mode ?? e.workMode),
    description: toStr(e.description),
    techStack: toStr(e.tech_stack ?? e.techStack),
  }));
};

export const mapParsedEducation = (parsed) => {
  const raw = toArr(parsed?.educations ?? parsed?.education);
  return raw.map((e) => ({
    degree: toStr(e.degree),
    fieldOfStudy: toStr(e.field_of_study ?? e.fieldOfStudy),
    institution: toStr(e.institution),
    startYear: toStr(e.start_year ?? e.startYear),
    endYear: toStr(e.end_year ?? e.endYear),
    grade: toStr(e.grade),
    location: toStr(e.location),
  }));
};

export const mapParsedSkills = (parsed) => {
  const tech = toArr(parsed?.techSkills ?? parsed?.skills?.technical ?? parsed?.technical_skills ?? parsed?.skills);
  const soft = toArr(parsed?.softSkills ?? parsed?.skills?.soft ?? parsed?.soft_skills ?? []);
  return {
    techSkills: tech.map((s) => ({
      name: toStr(typeof s === 'string' ? s : (s?.name ?? s?.skill)),
      level: toStr(s?.level ?? s?.proficiency),
      years: toStr(s?.years ?? s?.years_of_experience ?? ''),
    })),
    softSkills: soft.map((s) => ({
      name: toStr(typeof s === 'string' ? s : (s?.name ?? s?.skill)),
    })),
  };
};

export const mapParsedProjects = (parsed) => {
  const raw = toArr(parsed?.projects);
  return raw.map((p) => ({
    name: toStr(p.name ?? p.title),
    description: toStr(p.description),
    role: toStr(p.role),
    techStack: toStr(p.tech_stack ?? p.techStack),
    githubUrl: toStr(p.github_url ?? p.githubUrl),
    liveUrl: toStr(p.live_url ?? p.liveUrl),
    projectType: toStr(p.project_type ?? p.projectType),
  }));
};

export const mapParsedLinks = (parsed) => {
  const l = parsed?.links ?? parsed;
  const other = toArr(l?.other ?? l?.other_links ?? l?.otherLinks ?? []);
  return {
    linkedin: toStr(l?.linkedInUrl ?? l?.linkedin ?? l?.linkedin_url),
    github: toStr(l?.githubUrl ?? l?.github ?? l?.github_url),
    portfolio: toStr(l?.portfolioUrl ?? l?.portfolio ?? l?.portfolio_website ?? l?.website),
    otherLinks: other.map((o) => ({
      label: toStr(o.label ?? o.name),
      url: toStr(o.url ?? o.link),
    })),
  };
};

/** Preferences tab: value from response or empty (supports preferences.expectedSalaryRange) */
export const mapParsedPreferences = (parsed) => {
  const prefs = parsed?.preferences ?? parsed?.job_preferences ?? parsed;
  const employment = toArr(prefs?.employment_type ?? prefs?.employmentType);
  const locations = toArr(prefs?.preferred_locations ?? prefs?.preferredLocations);
  return {
    desiredRoles: toStr(prefs?.desired_roles ?? prefs?.desiredRoles),
    employmentType: employment.map((x) => toStr(x)),
    experienceLevel: toStr(prefs?.experience_level ?? prefs?.experienceLevel),
    openToRemote: toStr(prefs?.open_to_remote ?? prefs?.openToRemote),
    willingToRelocate: toStr(prefs?.willing_to_relocate ?? prefs?.willingToRelocate),
    preferredLocations: locations.map((x) => toStr(x)),
    expectedSalary: toStr(prefs?.expected_salary ?? prefs?.expectedSalary ?? prefs?.expectedSalaryRange),
  };
};
