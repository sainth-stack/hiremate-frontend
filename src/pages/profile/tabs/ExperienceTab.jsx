import { useDispatch, useSelector } from 'react-redux';
import { Box, MenuItem, IconButton, Card, CardContent } from '@mui/material';
import CustomSelect from '../../../components/inputs/CustomSelect';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import CustomInput from '../../../components/inputs/CustomInput';
import CustomButton from '../../../components/common/CustomButton';
import { setExperiences } from '../../../store/profile/profileSlice';

const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'];
const WORK_MODES = ['Remote', 'Hybrid', 'On-site'];

const defaultExperience = {
  jobTitle: '', companyName: '', employmentType: '', startDate: '', endDate: '',
  location: '', workMode: '', description: '', techStack: '',
};

export default function ExperienceTab() {
  const dispatch = useDispatch();
  const experiences = useSelector((state) => state.profile?.form?.experiences) ?? [{ ...defaultExperience }];

  const updateAt = (idx, field, value) => {
    const next = experiences.map((x, i) => (i === idx ? { ...x, [field]: value } : x));
    dispatch(setExperiences(next));
  };

  const addExperience = () => dispatch(setExperiences([...experiences, { ...defaultExperience }]));

  const removeExperience = (idx) => {
    if (experiences.length <= 1) return;
    dispatch(setExperiences(experiences.filter((_, i) => i !== idx)));
  };

  const moveUp = (idx) => {
    if (idx === 0) return;
    const arr = [...experiences];
    [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
    dispatch(setExperiences(arr));
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
  const cardSx = {
    borderRadius: 2,
    width: '100%',
    border: '1px solid var(--border-color)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box component="p" sx={{ display: 'block', m: 0, mb: 2.5, fontSize: 'var(--font-size-helper)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
        List your work experience (latest first). Bullet-style descriptions are ATS-friendly.
      </Box>

      {experiences.map((exp, idx) => (
        <Card key={idx} variant="outlined" sx={{ ...cardSx, mt: idx > 0 ? 2 : 0 }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 }, '&:last-child': { pb: { xs: 2, sm: 3 } } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0 }}>
              <Box component="span" sx={{ display: 'block', ...sectionHeaderSx, mb: 0 }}>
                Experience #{idx + 1}
              </Box>
              <Box>
                <IconButton size="small" onClick={() => moveUp(idx)} disabled={idx === 0} aria-label="Move up">
                  <ArrowUpwardIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => removeExperience(idx)} disabled={experiences.length <= 1} aria-label="Delete">
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>

            <Box sx={formGridSx}>
              <Box sx={{ gridColumn: '1 / -1' }}>
                <CustomInput label="Job Title *" required fullWidth value={exp.jobTitle} onChange={(e) => updateAt(idx, 'jobTitle', e.target.value)} />
              </Box>
              <Box sx={{ gridColumn: '1 / -1' }}>
                <CustomInput label="Company Name *" required fullWidth value={exp.companyName} onChange={(e) => updateAt(idx, 'companyName', e.target.value)} />
              </Box>
              <Box sx={{ gridColumn: '1 / -1' }}>
                <CustomSelect label="Employment Type" value={exp.employmentType} onChange={(e) => updateAt(idx, 'employmentType', e.target.value)}>
                  {EMPLOYMENT_TYPES.map((t) => (
                    <MenuItem key={t} value={t}>{t}</MenuItem>
                  ))}
                </CustomSelect>
              </Box>
              <CustomInput label="Start Date (MM/YYYY)" placeholder="01/2022" value={exp.startDate} onChange={(e) => updateAt(idx, 'startDate', e.target.value)} />
              <CustomInput label="End Date (MM/YYYY) or Present" placeholder="Present" value={exp.endDate} onChange={(e) => updateAt(idx, 'endDate', e.target.value)} />
              <Box sx={{ gridColumn: '1 / -1' }}>
                <CustomInput label="Location (City, Country)" value={exp.location} onChange={(e) => updateAt(idx, 'location', e.target.value)} />
              </Box>
              <Box sx={{ gridColumn: '1 / -1' }}>
                <CustomSelect label="Remote / Hybrid / On-site" value={exp.workMode} onChange={(e) => updateAt(idx, 'workMode', e.target.value)}>
                  {WORK_MODES.map((m) => (
                    <MenuItem key={m} value={m}>{m}</MenuItem>
                  ))}
                </CustomSelect>
              </Box>
              <Box sx={{ gridColumn: '1 / -1' }}>
                <Box component="span" sx={{ display: 'block', mb: 0.5, fontSize: 'var(--font-size-helper)', color: 'text.secondary' }}>
                  Description (ATS-optimized, bullet-style)
                </Box>
                <CustomInput label="Description" multiline rows={4} placeholder="• Achievement 1&#10;• Achievement 2" value={exp.description} onChange={(e) => updateAt(idx, 'description', e.target.value)} />
              </Box>
              <Box sx={{ gridColumn: '1 / -1' }}>
                <CustomInput label="Tech Stack (multi-select + free text)" placeholder="React, Node.js, PostgreSQL" value={exp.techStack} onChange={(e) => updateAt(idx, 'techStack', e.target.value)} />
              </Box>
            </Box>
          </CardContent>
        </Card>
      ))}

      <CustomButton variant="outlined" startIcon={<AddIcon />} onClick={addExperience} sx={{ mt: 2 }}>
        Add Experience
      </CustomButton>
    </Box>
  );
}
