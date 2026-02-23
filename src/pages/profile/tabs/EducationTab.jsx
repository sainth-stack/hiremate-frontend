import { useDispatch, useSelector } from 'react-redux';
import { Box, IconButton, Card, CardContent } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CustomInput from '../../../components/inputs/CustomInput';
import CustomButton from '../../../components/common/CustomButton';
import { setEducations } from '../../../store/profile/profileSlice';

const defaultEducation = {
  degree: '', fieldOfStudy: '', institution: '', startYear: '', endYear: '', grade: '', location: '',
};

export default function EducationTab() {
  const dispatch = useDispatch();
  const educations = useSelector((state) => state.profile?.form?.educations) ?? [{ ...defaultEducation }];

  const updateAt = (idx, field, value) => {
    const next = educations.map((x, i) => (i === idx ? { ...x, [field]: value } : x));
    dispatch(setEducations(next));
  };

  const addEducation = () => dispatch(setEducations([...educations, { ...defaultEducation }]));

  const removeEducation = (idx) => {
    if (educations.length <= 1) return;
    dispatch(setEducations(educations.filter((_, i) => i !== idx)));
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
        Add your education history.
      </Box>

      {educations.map((edu, idx) => (
        <Card key={idx} variant="outlined" sx={{ ...cardSx, mt: idx > 0 ? 2 : 0 }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 }, '&:last-child': { pb: { xs: 2, sm: 3 } } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0 }}>
              <Box component="span" sx={{ display: 'block', ...sectionHeaderSx, mb: 0 }}>
                Education #{idx + 1}
              </Box>
              <IconButton size="small" onClick={() => removeEducation(idx)} disabled={educations.length <= 1} aria-label="Delete">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>

            <Box sx={formGridSx}>
              <CustomInput label="Degree" placeholder="B.Tech, BSc, MSc, etc." value={edu.degree} onChange={(e) => updateAt(idx, 'degree', e.target.value)} />
              <CustomInput label="Field of Study" placeholder="Computer Science" value={edu.fieldOfStudy} onChange={(e) => updateAt(idx, 'fieldOfStudy', e.target.value)} />
              <Box sx={{ gridColumn: '1 / -1' }}>
                <CustomInput label="Institution Name" fullWidth value={edu.institution} onChange={(e) => updateAt(idx, 'institution', e.target.value)} />
              </Box>
              <CustomInput label="Start Year" placeholder="2018" value={edu.startYear} onChange={(e) => updateAt(idx, 'startYear', e.target.value)} />
              <CustomInput label="End Year or Present" placeholder="2022" value={edu.endYear} onChange={(e) => updateAt(idx, 'endYear', e.target.value)} />
              <CustomInput label="Grade / GPA (optional)" placeholder="8.5 CGPA" value={edu.grade} onChange={(e) => updateAt(idx, 'grade', e.target.value)} />
              <CustomInput label="Location (optional)" placeholder="City, Country" value={edu.location} onChange={(e) => updateAt(idx, 'location', e.target.value)} />
            </Box>
          </CardContent>
        </Card>
      ))}

      <CustomButton variant="outlined" startIcon={<AddIcon />} onClick={addEducation} sx={{ mt: 2 }}>
        Add Education
      </CustomButton>
    </Box>
  );
}
