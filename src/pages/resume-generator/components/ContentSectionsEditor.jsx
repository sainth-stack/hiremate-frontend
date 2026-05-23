/**
 * ContentSectionsEditor — built-in + custom resume sections with editable headers and remove/restore.
 */
import React from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  TextField,
  Menu,
  MenuItem,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import RestoreRoundedIcon from '@mui/icons-material/RestoreRounded';
import CustomInput from '../../../components/inputs/CustomInput';
import SectionEditor from './SectionEditor';
import {
  ResumeSectionCard,
  EditableSectionCard,
  BulletEditor,
  SkillRowEditor,
  getBulletChar,
  EMPTY_EDUCATION,
  EMPTY_EXPERIENCE,
  EMPTY_SKILL_CATEGORY,
  EMPTY_CUSTOM_SECTION,
  EMPTY_PROJECT,
} from './SharedComponents';
import {
  getSectionLabel,
  isSectionVisible,
  getHiddenSections,
  removeSection,
  restoreSection,
  updateSectionLabel,
} from '../resumeSectionConfig';
import { RESUME_STUDIO_THEME as T } from '../../../utilities/resumeStudioTheme';

export default function ContentSectionsEditor({
  profile,
  setProfile,
  designConfig,
  handleDesignChange,
  scheduleProfilePatch,
  selectedResumeId,
}) {
  const [restoreAnchor, setRestoreAnchor] = React.useState(null);
  const sectionLabels = designConfig.section_labels || {};
  const sectionsVisible = designConfig.sections_visible ?? [];
  const hiddenSections = getHiddenSections(sectionsVisible);

  const patchLabel = (sectionId, label) => {
    handleDesignChange({ section_labels: updateSectionLabel(sectionId, label, sectionLabels) });
  };

  const hideSection = (sectionId) => {
    handleDesignChange({ sections_visible: removeSection(sectionId, sectionsVisible) });
  };

  const showSection = (sectionId) => {
    handleDesignChange({ sections_visible: restoreSection(sectionId, sectionsVisible) });
    setRestoreAnchor(null);
  };

  const skillCategories = profile.skillCategories?.length
    ? profile.skillCategories
    : [{ ...EMPTY_SKILL_CATEGORY, categoryName: 'Languages', skills: [], order: 0 }];

  return (
    <>
      <ResumeSectionCard title="Personal Information">
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
          <CustomInput label="First Name" placeholder="John" value={profile.firstName || ''} onChange={(e) => { setProfile((p) => ({ ...p, firstName: e.target.value })); scheduleProfilePatch(); }} />
          <CustomInput label="Last Name" placeholder="Doe" value={profile.lastName || ''} onChange={(e) => { setProfile((p) => ({ ...p, lastName: e.target.value })); scheduleProfilePatch(); }} />
          <CustomInput label="Email" placeholder="john@example.com" type="email" value={profile.email || ''} onChange={(e) => { setProfile((p) => ({ ...p, email: e.target.value })); scheduleProfilePatch(); }} sx={{ gridColumn: { sm: '1 / -1' } }} />
          <CustomInput label="Phone" placeholder="+1 234 567 8900" value={profile.phone || ''} onChange={(e) => { setProfile((p) => ({ ...p, phone: e.target.value })); scheduleProfilePatch(); }} />
          <CustomInput
            label="Location"
            placeholder="City, Country"
            value={[profile.city, profile.country].filter(Boolean).join(', ')}
            onChange={(e) => {
              const parts = (e.target.value || '').split(',').map((s) => s.trim()).filter(Boolean);
              const city = parts.length >= 2 ? parts.slice(0, -1).join(', ') : (parts[0] ?? '');
              const country = parts.length >= 2 ? parts[parts.length - 1] : (parts[1] ?? '');
              setProfile((p) => ({ ...p, city, country }));
              scheduleProfilePatch();
            }}
            sx={{ gridColumn: { sm: '1 / -1' } }}
          />
        </Box>
      </ResumeSectionCard>

      <ResumeSectionCard title="Links">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <CustomInput label="LinkedIn URL" placeholder="https://linkedin.com/in/yourname" value={profile.links?.linkedInUrl || ''} onChange={(e) => { setProfile((p) => ({ ...p, links: { ...(p.links || {}), linkedInUrl: e.target.value } })); scheduleProfilePatch(); }} />
          <CustomInput label="GitHub URL" placeholder="https://github.com/yourname" value={profile.links?.githubUrl || ''} onChange={(e) => { setProfile((p) => ({ ...p, links: { ...(p.links || {}), githubUrl: e.target.value } })); scheduleProfilePatch(); }} />
          <CustomInput label="Portfolio URL" placeholder="https://yourportfolio.com" value={profile.links?.portfolioUrl || ''} onChange={(e) => { setProfile((p) => ({ ...p, links: { ...(p.links || {}), portfolioUrl: e.target.value } })); scheduleProfilePatch(); }} />
        </Box>
      </ResumeSectionCard>

      {isSectionVisible('summary', sectionsVisible) && (
        <EditableSectionCard
          label={getSectionLabel('summary', sectionLabels)}
          onLabelChange={(v) => patchLabel('summary', v)}
          onRemove={() => hideSection('summary')}
          defaultOpen
        >
          <Typography variant="caption" color="var(--text-muted)" sx={{ display: 'block', mb: 1, fontFamily: 'var(--font-family)' }}>
            Shown on your resume as &quot;{getSectionLabel('summary', sectionLabels)}&quot;
          </Typography>
          <SectionEditor section="summary" resumeId={selectedResumeId} onChange={(content) => { setProfile((p) => ({ ...p, professionalSummary: content })); scheduleProfilePatch(); }} />
          <TextField
            size="small"
            fullWidth
            multiline
            minRows={4}
            placeholder="Write a 2-3 sentence summary..."
            value={profile.professionalSummary || ''}
            onChange={(e) => { setProfile((p) => ({ ...p, professionalSummary: e.target.value })); scheduleProfilePatch(); }}
            sx={{ fontFamily: 'var(--font-family)', '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
          />
        </EditableSectionCard>
      )}

      {isSectionVisible('skills', sectionsVisible) && (
        <EditableSectionCard
          label={getSectionLabel('skills', sectionLabels)}
          onLabelChange={(v) => patchLabel('skills', v)}
          onRemove={() => hideSection('skills')}
          badge={skillCategories.length ? `${skillCategories.length} rows` : null}
        >
          <Typography variant="caption" color="var(--text-muted)" sx={{ display: 'block', mb: 1.5, fontFamily: 'var(--font-family)' }}>
            Each row becomes one line on your resume — <strong>Languages: JavaScript, Python</strong>
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
            {skillCategories.map((category, idx) => (
              <SkillRowEditor
                key={idx}
                categoryName={category.categoryName || ''}
                skills={category.skills || []}
                onChange={(newName, newSkills) => {
                  const next = [...skillCategories];
                  next[idx] = { ...next[idx], categoryName: newName, skills: newSkills };
                  setProfile((p) => ({ ...p, skillCategories: next }));
                  scheduleProfilePatch();
                }}
                onRemove={() => {
                  const next = skillCategories.filter((_, i) => i !== idx);
                  setProfile((p) => ({
                    ...p,
                    skillCategories: next.length ? next : [{ ...EMPTY_SKILL_CATEGORY, categoryName: 'Skills', order: 0 }],
                  }));
                  scheduleProfilePatch();
                }}
                canRemove={skillCategories.length > 1}
              />
            ))}
          </Box>
          <Button
            size="small"
            variant="outlined"
            startIcon={<AddRoundedIcon />}
            onClick={() => {
              const order = skillCategories.length;
              setProfile((p) => ({
                ...p,
                skillCategories: [...skillCategories, { ...EMPTY_SKILL_CATEGORY, categoryName: '', skills: [], order }],
              }));
              scheduleProfilePatch();
            }}
            sx={{ mt: 1.5, fontFamily: 'var(--font-family)', textTransform: 'none' }}
          >
            Add Skills
          </Button>
        </EditableSectionCard>
      )}

      {isSectionVisible('experience', sectionsVisible) && (
        <EditableSectionCard
          label={getSectionLabel('experience', sectionLabels)}
          onLabelChange={(v) => patchLabel('experience', v)}
          onRemove={() => hideSection('experience')}
          badge={profile.experiences?.length ? `${profile.experiences.length} roles` : null}
        >
          {(profile.experiences || []).map((exp, idx) => (
            <Box key={idx} sx={{ mb: 2.5, p: 2, bgcolor: 'var(--bg-light)', borderRadius: 1, border: '1px solid var(--border-color)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, fontFamily: 'var(--font-family)', color: 'var(--text-secondary)' }}>Role #{idx + 1}</Typography>
                <IconButton size="small" onClick={() => { setProfile((p) => ({ ...p, experiences: p.experiences.filter((_, i) => i !== idx).length ? p.experiences.filter((_, i) => i !== idx) : [{ ...EMPTY_EXPERIENCE }] })); scheduleProfilePatch(); }} disabled={(profile.experiences || []).length <= 1} sx={{ color: 'var(--text-muted)' }}>
                  <DeleteOutlinedIcon fontSize="small" />
                </IconButton>
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <CustomInput label="Job Title" fullWidth sx={{ gridColumn: '1 / -1' }} value={exp.jobTitle || ''} onChange={(e) => { const next = [...(profile.experiences || [])]; next[idx] = { ...next[idx], jobTitle: e.target.value }; setProfile((p) => ({ ...p, experiences: next })); scheduleProfilePatch(); }} />
                <CustomInput label="Company" value={exp.companyName || ''} onChange={(e) => { const next = [...(profile.experiences || [])]; next[idx] = { ...next[idx], companyName: e.target.value }; setProfile((p) => ({ ...p, experiences: next })); scheduleProfilePatch(); }} />
                <CustomInput label="Location" placeholder="City, Country" value={exp.location || ''} onChange={(e) => { const next = [...(profile.experiences || [])]; next[idx] = { ...next[idx], location: e.target.value }; setProfile((p) => ({ ...p, experiences: next })); scheduleProfilePatch(); }} />
                <CustomInput label="Start Date" placeholder="Jan 2022" value={exp.startDate || ''} onChange={(e) => { const next = [...(profile.experiences || [])]; next[idx] = { ...next[idx], startDate: e.target.value }; setProfile((p) => ({ ...p, experiences: next })); scheduleProfilePatch(); }} />
                <CustomInput label="End Date" placeholder="Present" value={exp.endDate || ''} onChange={(e) => { const next = [...(profile.experiences || [])]; next[idx] = { ...next[idx], endDate: e.target.value }; setProfile((p) => ({ ...p, experiences: next })); scheduleProfilePatch(); }} />
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <BulletEditor
                    bulletChar={getBulletChar(designConfig.bullet_icon)}
                    value={exp.description || ''}
                    onChange={(val) => { const next = [...(profile.experiences || [])]; next[idx] = { ...next[idx], description: val }; setProfile((p) => ({ ...p, experiences: next })); scheduleProfilePatch(); }}
                  />
                </Box>
              </Box>
            </Box>
          ))}
          <Button size="small" variant="outlined" startIcon={<AddRoundedIcon />} onClick={() => setProfile((p) => ({ ...p, experiences: [...(p.experiences || []), { ...EMPTY_EXPERIENCE }] }))} sx={{ fontFamily: 'var(--font-family)', textTransform: 'none' }}>Add Experience</Button>
        </EditableSectionCard>
      )}

      {isSectionVisible('education', sectionsVisible) && (
        <EditableSectionCard
          label={getSectionLabel('education', sectionLabels)}
          onLabelChange={(v) => patchLabel('education', v)}
          onRemove={() => hideSection('education')}
          badge={profile.educations?.length ? `${profile.educations.length} entries` : null}
        >
          {(profile.educations || []).map((edu, idx) => (
            <Box key={idx} sx={{ mb: 2.5, p: 2, bgcolor: 'var(--bg-light)', borderRadius: 1, border: '1px solid var(--border-color)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, fontFamily: 'var(--font-family)' }}>Education #{idx + 1}</Typography>
                <IconButton size="small" onClick={() => { setProfile((p) => ({ ...p, educations: p.educations.filter((_, i) => i !== idx).length ? p.educations.filter((_, i) => i !== idx) : [{ ...EMPTY_EDUCATION }] })); scheduleProfilePatch(); }} disabled={(profile.educations || []).length <= 1}>
                  <DeleteOutlinedIcon fontSize="small" />
                </IconButton>
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <CustomInput label="Institution" fullWidth sx={{ gridColumn: '1 / -1' }} value={edu.institution || ''} onChange={(e) => { const next = [...(profile.educations || [])]; next[idx] = { ...next[idx], institution: e.target.value }; setProfile((p) => ({ ...p, educations: next })); scheduleProfilePatch(); }} />
                <CustomInput label="Degree" value={edu.degree || ''} onChange={(e) => { const next = [...(profile.educations || [])]; next[idx] = { ...next[idx], degree: e.target.value }; setProfile((p) => ({ ...p, educations: next })); scheduleProfilePatch(); }} />
                <CustomInput label="Field of Study" value={edu.fieldOfStudy || ''} onChange={(e) => { const next = [...(profile.educations || [])]; next[idx] = { ...next[idx], fieldOfStudy: e.target.value }; setProfile((p) => ({ ...p, educations: next })); scheduleProfilePatch(); }} />
                <CustomInput label="Graduation Year" placeholder="2022" value={edu.endYear || ''} onChange={(e) => { const next = [...(profile.educations || [])]; next[idx] = { ...next[idx], endYear: e.target.value }; setProfile((p) => ({ ...p, educations: next })); scheduleProfilePatch(); }} />
                <CustomInput label="Grade / GPA" value={edu.grade || ''} onChange={(e) => { const next = [...(profile.educations || [])]; next[idx] = { ...next[idx], grade: e.target.value }; setProfile((p) => ({ ...p, educations: next })); scheduleProfilePatch(); }} />
              </Box>
            </Box>
          ))}
          <Button size="small" variant="outlined" startIcon={<AddRoundedIcon />} onClick={() => setProfile((p) => ({ ...p, educations: [...(p.educations || []), { ...EMPTY_EDUCATION }] }))} sx={{ fontFamily: 'var(--font-family)', textTransform: 'none' }}>Add Education</Button>
        </EditableSectionCard>
      )}

      {isSectionVisible('projects', sectionsVisible) && (
        <EditableSectionCard
          label={getSectionLabel('projects', sectionLabels)}
          onLabelChange={(v) => patchLabel('projects', v)}
          onRemove={() => hideSection('projects')}
          badge={profile.projects?.length ? `${profile.projects.length} projects` : null}
        >
          {(profile.projects || []).map((proj, idx) => (
            <Box key={idx} sx={{ mb: 2.5, p: 2, bgcolor: 'var(--bg-light)', borderRadius: 1, border: '1px solid var(--border-color)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, fontFamily: 'var(--font-family)' }}>Project #{idx + 1}</Typography>
                <IconButton size="small" onClick={() => { setProfile((p) => ({ ...p, projects: p.projects.filter((_, i) => i !== idx).length ? p.projects.filter((_, i) => i !== idx) : [{ ...EMPTY_PROJECT }] })); scheduleProfilePatch(); }} disabled={(profile.projects || []).length <= 1}>
                  <DeleteOutlinedIcon fontSize="small" />
                </IconButton>
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <CustomInput label="Project Name" fullWidth sx={{ gridColumn: '1 / -1' }} value={proj.name || ''} onChange={(e) => { const next = [...(profile.projects || [])]; next[idx] = { ...next[idx], name: e.target.value }; setProfile((p) => ({ ...p, projects: next })); scheduleProfilePatch(); }} />
                <CustomInput label="Tech Stack" fullWidth sx={{ gridColumn: '1 / -1' }} placeholder="React, Node.js..." value={proj.techStack || ''} onChange={(e) => { const next = [...(profile.projects || [])]; next[idx] = { ...next[idx], techStack: e.target.value }; setProfile((p) => ({ ...p, projects: next })); scheduleProfilePatch(); }} />
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <BulletEditor
                    bulletChar={getBulletChar(designConfig.bullet_icon)}
                    value={proj.description || ''}
                    onChange={(val) => { const next = [...(profile.projects || [])]; next[idx] = { ...next[idx], description: val }; setProfile((p) => ({ ...p, projects: next })); scheduleProfilePatch(); }}
                  />
                </Box>
              </Box>
            </Box>
          ))}
          <Button size="small" variant="outlined" startIcon={<AddRoundedIcon />} onClick={() => setProfile((p) => ({ ...p, projects: [...(p.projects || []), { ...EMPTY_PROJECT }] }))} sx={{ fontFamily: 'var(--font-family)', textTransform: 'none' }}>Add Project</Button>
        </EditableSectionCard>
      )}

      {isSectionVisible('certifications', sectionsVisible) && (
        <EditableSectionCard
          label={getSectionLabel('certifications', sectionLabels)}
          onLabelChange={(v) => patchLabel('certifications', v)}
          onRemove={() => hideSection('certifications')}
        >
          <Typography variant="caption" color="var(--text-muted)" sx={{ display: 'block', mb: 1, fontFamily: 'var(--font-family)' }}>
            Awards and certificates from your profile preferences appear here. Add custom sections below for more.
          </Typography>
        </EditableSectionCard>
      )}

      {(profile.customSections || []).map((section, idx) => (
        <EditableSectionCard
          key={section.sectionId || idx}
          label={section.sectionName || 'New Section'}
          onLabelChange={(name) => {
            const next = [...(profile.customSections || [])];
            next[idx] = {
              ...next[idx],
              sectionName: name,
              sectionId: (name || 'section').toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') || `section_${idx}`,
            };
            setProfile((p) => ({ ...p, customSections: next }));
            scheduleProfilePatch();
          }}
          onRemove={() => {
            setProfile((p) => ({ ...p, customSections: p.customSections.filter((_, i) => i !== idx) }));
            scheduleProfilePatch();
          }}
          defaultOpen
        >
          <BulletEditor
            bulletChar={getBulletChar(designConfig.bullet_icon)}
            value={section.content || ''}
            onChange={(val) => {
              const next = [...(profile.customSections || [])];
              next[idx] = { ...next[idx], content: val, format: 'bullets' };
              setProfile((p) => ({ ...p, customSections: next }));
              scheduleProfilePatch();
            }}
          />
        </EditableSectionCard>
      ))}

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1, mb: 2 }}>
        <Button
          size="small"
          variant="contained"
          disableElevation
          startIcon={<AddRoundedIcon />}
          onClick={() => {
            const order = (profile.customSections || []).length;
            setProfile((p) => ({
              ...p,
              customSections: [...(p.customSections || []), { ...EMPTY_CUSTOM_SECTION, sectionName: 'New Section', sectionId: `section_${order}`, order }],
            }));
            scheduleProfilePatch();
          }}
          sx={{ fontFamily: 'var(--font-family)', textTransform: 'none', bgcolor: T.primary, boxShadow: 'none', '&:hover': { bgcolor: T.primaryDark } }}
        >
          Add Section
        </Button>
        {hiddenSections.length > 0 && (
          <>
            <Button
              size="small"
              variant="outlined"
              startIcon={<RestoreRoundedIcon />}
              onClick={(e) => setRestoreAnchor(e.currentTarget)}
              sx={{ fontFamily: 'var(--font-family)', textTransform: 'none' }}
            >
              Restore Section
            </Button>
            <Menu anchorEl={restoreAnchor} open={Boolean(restoreAnchor)} onClose={() => setRestoreAnchor(null)}>
              {hiddenSections.map((id) => (
                <MenuItem key={id} onClick={() => showSection(id)} sx={{ fontFamily: 'var(--font-family)', fontSize: '0.875rem' }}>
                  {getSectionLabel(id, sectionLabels)}
                </MenuItem>
              ))}
            </Menu>
          </>
        )}
      </Box>
    </>
  );
}
