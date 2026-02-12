import { useDispatch, useSelector } from 'react-redux';
import { Box, MenuItem, IconButton, Card, CardContent } from '@mui/material';
import CustomSelect from '../../../components/inputs/CustomSelect';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CustomInput from '../../../components/inputs/CustomInput';
import CustomButton from '../../../components/common/CustomButton';
import { setProjects } from '../../../store/profile/profileSlice';

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

  const formGridSx = {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', sm: 'minmax(0, 1fr) minmax(0, 1fr)' },
    columnGap: 2,
    rowGap: 1.5,
    width: '100%',
    '& .custom-input': { marginBottom: 0 },
    '& .custom-select': { marginBottom: 0 },
  };
  const sectionHeaderSx = { mb: 1.5, fontSize: 'var(--font-size-section-header)', fontWeight: 600 };
  const sectionWrapperSx = { mt: 3, '&:first-of-type': { mt: 0 } };

  return (
    <Box sx={{ width: '100%' }}>
      <Box component="span" sx={{ display: 'block', mb: 1.5, fontSize: 'var(--font-size-helper)', color: 'text.secondary' }}>
        Add your projects with GitHub and live URLs.
      </Box>

      {projects.map((proj, idx) => (
        <Card key={idx} variant="outlined" sx={{ ...sectionWrapperSx, borderRadius: 2, width: '100%' }}>
          <CardContent sx={{ '&:last-child': { pb: 2 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0 }}>
              <Box component="span" sx={{ display: 'block', ...sectionHeaderSx, mb: 0 }}>
                Project #{idx + 1}
              </Box>
              <IconButton size="small" onClick={() => removeProject(idx)} disabled={projects.length <= 1} aria-label="Delete">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>

            <Box sx={formGridSx}>
              <Box sx={{ gridColumn: '1 / -1' }}>
                <CustomInput label="Project Name" fullWidth value={proj.name} onChange={(e) => updateAt(idx, 'name', e.target.value)} />
              </Box>
              <Box sx={{ gridColumn: '1 / -1' }}>
                <Box component="span" sx={{ display: 'block', mb: 0.5, fontSize: 'var(--font-size-helper)', color: 'text.secondary' }}>
                  Short Description (2–4 lines)
                </Box>
                <CustomInput label="Description" multiline rows={3} value={proj.description} onChange={(e) => updateAt(idx, 'description', e.target.value)} />
              </Box>
              <CustomInput label="Your Role" value={proj.role} onChange={(e) => updateAt(idx, 'role', e.target.value)} />
              <CustomInput label="Tech Stack (tags)" placeholder="React, Node.js" value={proj.techStack} onChange={(e) => updateAt(idx, 'techStack', e.target.value)} />
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
          </CardContent>
        </Card>
      ))}

      <CustomButton variant="outlined" startIcon={<AddIcon />} onClick={addProject}>
        Add Project
      </CustomButton>
    </Box>
  );
}
