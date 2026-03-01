import { useDispatch, useSelector } from 'react-redux';
import { Box, MenuItem, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CustomInput from '../../../components/inputs/CustomInput';
import CustomSelect from '../../../components/inputs/CustomSelect';
import CustomButton from '../../../components/common/CustomButton';
import SectionCard from '../components/SectionCard';
import { setProjects } from '../../../store/profile/profileSlice';
import { FORM_GRID_SX, SECTION_TITLE_SX } from '../constants';

const PROJECT_TYPES = ['Personal', 'Academic', 'Professional'];

const defaultProject = {
  name: '', description: '', role: '', techStack: '', githubUrl: '', liveUrl: '', projectType: '',
};

export default function ProjectsTab() {
  const dispatch = useDispatch();
  const projects = useSelector((state) => state.profile?.form?.projects) ?? [{ ...defaultProject }];

  const updateAt = (idx, field, value) => {
    const next = projects.map((x, i) => (i === idx ? { ...x, [field]: value } : x));
    dispatch(setProjects(next));
  };

  const addProject = () => dispatch(setProjects([...projects, { ...defaultProject }]));
  const removeProject = (idx) => {
    if (projects.length <= 1) return;
    dispatch(setProjects(projects.filter((_, i) => i !== idx)));
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 3 }}>
        <Box component="p" sx={{ m: 0, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          Add your projects with GitHub and live URLs.
        </Box>
      </Box>

      {projects.map((proj, idx) => (
        <SectionCard key={idx} sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box component="span" sx={SECTION_TITLE_SX}>
              Project #{idx + 1}
            </Box>
            <IconButton size="small" onClick={() => removeProject(idx)} disabled={projects.length <= 1} aria-label="Delete">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>

          <Box sx={FORM_GRID_SX}>
            <Box sx={{ gridColumn: '1 / -1' }}>
              <CustomInput label="Project Name" fullWidth value={proj.name} onChange={(e) => updateAt(idx, 'name', e.target.value)} />
            </Box>
            <Box sx={{ gridColumn: '1 / -1' }}>
              <CustomInput label="Description" multiline rows={3} placeholder="Short description (2–4 lines)" value={proj.description} onChange={(e) => updateAt(idx, 'description', e.target.value)} />
            </Box>
            <CustomInput label="Your Role" value={proj.role} onChange={(e) => updateAt(idx, 'role', e.target.value)} />
            <CustomInput label="Tech Stack" placeholder="React, Node.js" value={proj.techStack} onChange={(e) => updateAt(idx, 'techStack', e.target.value)} />
            <CustomInput label="GitHub URL" type="url" placeholder="https://github.com/..." value={proj.githubUrl} onChange={(e) => updateAt(idx, 'githubUrl', e.target.value)} />
            <CustomInput label="Live URL (optional)" type="url" placeholder="https://..." value={proj.liveUrl} onChange={(e) => updateAt(idx, 'liveUrl', e.target.value)} />
            <Box sx={{ gridColumn: '1 / -1' }}>
              <CustomSelect label="Project Type" value={proj.projectType} onChange={(e) => updateAt(idx, 'projectType', e.target.value)}>
                {PROJECT_TYPES.map((t) => (
                  <MenuItem key={t} value={t}>{t}</MenuItem>
                ))}
              </CustomSelect>
            </Box>
          </Box>
        </SectionCard>
      ))}

      <CustomButton variant="outlined" startIcon={<AddIcon />} onClick={addProject} sx={{ mt: 1 }}>
        Add Project
      </CustomButton>
    </Box>
  );
}
