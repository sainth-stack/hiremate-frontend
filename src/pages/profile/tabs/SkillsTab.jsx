import { useDispatch, useSelector } from 'react-redux';
import { Box, MenuItem, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CustomInput from '../../../components/inputs/CustomInput';
import CustomSelect from '../../../components/inputs/CustomSelect';
import CustomButton from '../../../components/common/CustomButton';
import SectionCard from '../components/SectionCard';
import { setTechSkills, setSoftSkills } from '../../../store/profile/profileSlice';
import { FORM_GRID_SX, SECTION_TITLE_SX } from '../constants';

const PROFICIENCY_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

const defaultTechSkill = { name: '', level: '', years: '' };
const defaultSoftSkill = { name: '' };

export default function SkillsTab() {
  const dispatch = useDispatch();
  const techSkills = useSelector((state) => state.profile?.form?.techSkills) ?? [{ ...defaultTechSkill }];
  const softSkills = useSelector((state) => state.profile?.form?.softSkills) ?? [{ ...defaultSoftSkill }];

  const updateTechAt = (idx, field, value) => {
    const next = techSkills.map((x, i) => (i === idx ? { ...x, [field]: value } : x));
    dispatch(setTechSkills(next));
  };
  const updateSoftAt = (idx, field, value) => {
    const next = softSkills.map((x, i) => (i === idx ? { ...x, [field]: value } : x));
    dispatch(setSoftSkills(next));
  };

  const addTechSkill = () => dispatch(setTechSkills([...techSkills, { ...defaultTechSkill }]));
  const removeTechSkill = (idx) => {
    if (techSkills.length <= 1) return;
    dispatch(setTechSkills(techSkills.filter((_, i) => i !== idx)));
  };
  const addSoftSkill = () => dispatch(setSoftSkills([...softSkills, { ...defaultSoftSkill }]));
  const removeSoftSkill = (idx) => {
    if (softSkills.length <= 1) return;
    dispatch(setSoftSkills(softSkills.filter((_, i) => i !== idx)));
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 3 }}>
        <Box component="p" sx={{ m: 0, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          Normalized skills for ATS matching. Technical skills can use autocomplete from skill DB.
        </Box>
      </Box>

      <SectionCard sx={{ mb: 3 }}>
        <Box component="span" sx={{ ...SECTION_TITLE_SX, mb: 2 }}>
          Technical Skills
        </Box>
        {techSkills.map((skill, idx) => (
          <Box key={idx} sx={{ ...FORM_GRID_SX, alignItems: 'flex-end', mb: idx < techSkills.length - 1 ? 2 : 0 }}>
            <CustomInput label="Skill Name" placeholder="e.g. React" value={skill.name} onChange={(e) => updateTechAt(idx, 'name', e.target.value)} />
            <CustomSelect label="Proficiency Level" value={skill.level} onChange={(e) => updateTechAt(idx, 'level', e.target.value)}>
              {PROFICIENCY_LEVELS.map((l) => (
                <MenuItem key={l} value={l}>{l}</MenuItem>
              ))}
            </CustomSelect>
            <CustomInput label="Years" type="number" placeholder="3" value={skill.years} onChange={(e) => updateTechAt(idx, 'years', e.target.value)} />
            <Box sx={{ display: 'flex', alignItems: 'center', height: 44 }}>
              <IconButton size="small" onClick={() => removeTechSkill(idx)} disabled={techSkills.length <= 1}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        ))}
        <CustomButton variant="outlined" startIcon={<AddIcon />} onClick={addTechSkill} size="small" sx={{ mt: 2 }}>
          Add Technical Skill
        </CustomButton>
      </SectionCard>

      <SectionCard>
        <Box component="span" sx={{ ...SECTION_TITLE_SX, mb: 2 }}>
          Soft Skills
        </Box>
        <Box component="p" sx={{ m: 0, mb: 2, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          Free text / suggestions. Stored as flat list for auto-filling checkbox fields.
        </Box>
        {softSkills.map((skill, idx) => (
          <Box key={idx} sx={{ ...FORM_GRID_SX, alignItems: 'center', mb: idx < softSkills.length - 1 ? 2 : 0 }}>
            <CustomInput label="Skill Name" placeholder="e.g. Communication" value={skill.name} onChange={(e) => updateSoftAt(idx, 'name', e.target.value)} />
            <Box sx={{ display: 'flex', alignItems: 'center', height: 44 }}>
              <IconButton size="small" onClick={() => removeSoftSkill(idx)} disabled={softSkills.length <= 1}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        ))}
        <CustomButton variant="outlined" startIcon={<AddIcon />} onClick={addSoftSkill} size="small" sx={{ mt: 2 }}>
          Add Soft Skill
        </CustomButton>
      </SectionCard>
    </Box>
  );
}
