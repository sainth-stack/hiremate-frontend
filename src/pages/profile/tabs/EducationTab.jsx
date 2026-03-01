import { useDispatch, useSelector } from 'react-redux';
import { Box, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CustomInput from '../../../components/inputs/CustomInput';
import CustomButton from '../../../components/common/CustomButton';
import SectionCard from '../components/SectionCard';
import { setEducations } from '../../../store/profile/profileSlice';
import { FORM_GRID_SX, SECTION_TITLE_SX } from '../constants';

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

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 3 }}>
        <Box component="p" sx={{ m: 0, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          Add your education history.
        </Box>
      </Box>

      {educations.map((edu, idx) => (
        <SectionCard key={idx} sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box component="span" sx={SECTION_TITLE_SX}>
              Education #{idx + 1}
            </Box>
            <IconButton size="small" onClick={() => removeEducation(idx)} disabled={educations.length <= 1} aria-label="Delete">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>

          <Box sx={FORM_GRID_SX}>
            <CustomInput label="Degree" placeholder="B.Tech, BSc, MSc" value={edu.degree} onChange={(e) => updateAt(idx, 'degree', e.target.value)} />
            <CustomInput label="Field of Study" placeholder="Computer Science" value={edu.fieldOfStudy} onChange={(e) => updateAt(idx, 'fieldOfStudy', e.target.value)} />
            <Box sx={{ gridColumn: '1 / -1' }}>
              <CustomInput label="Institution Name" fullWidth value={edu.institution} onChange={(e) => updateAt(idx, 'institution', e.target.value)} />
            </Box>
            <CustomInput label="Start Year" placeholder="2018" value={edu.startYear} onChange={(e) => updateAt(idx, 'startYear', e.target.value)} />
            <CustomInput label="End Year or Present" placeholder="2022" value={edu.endYear} onChange={(e) => updateAt(idx, 'endYear', e.target.value)} />
            <CustomInput label="Grade / GPA (optional)" placeholder="8.5 CGPA" value={edu.grade} onChange={(e) => updateAt(idx, 'grade', e.target.value)} />
            <CustomInput label="Location (optional)" placeholder="City, Country" value={edu.location} onChange={(e) => updateAt(idx, 'location', e.target.value)} />
          </Box>
        </SectionCard>
      ))}

      <CustomButton variant="outlined" startIcon={<AddIcon />} onClick={addEducation} sx={{ mt: 1 }}>
        Add Education
      </CustomButton>
    </Box>
  );
}
