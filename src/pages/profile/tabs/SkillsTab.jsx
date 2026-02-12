import { useDispatch, useSelector } from 'react-redux';
import { Box, MenuItem, IconButton, Card, CardContent } from '@mui/material';
import CustomSelect from '../../../components/inputs/CustomSelect';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CustomInput from '../../../components/inputs/CustomInput';
import CustomButton from '../../../components/common/CustomButton';
import { setTechSkills, setSoftSkills } from '../../../store/profile/profileSlice';

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
      <Card variant="outlined" sx={{ borderRadius: 2, width: '100%' }}>
        <CardContent>
          <Box component="span" sx={{ display: 'block', mb: 1.5, fontSize: 'var(--font-size-helper)', color: 'text.secondary' }}>
            Normalized skills for ATS matching. Technical skills can use autocomplete from skill DB.
          </Box>

          {/* Technical Skills */}
          <Box sx={sectionWrapperSx}>
            <Box component="span" sx={{ display: 'block', ...sectionHeaderSx }}>
              Technical Skills
            </Box>
            {techSkills.map((skill, idx) => (
              <Card key={idx} variant="outlined" sx={{ mt: idx > 0 ? 1 : 0, borderRadius: 2, width: '100%' }}>
                <CardContent sx={{ '&:last-child': { pb: 2 } }}>
                  <Box sx={{ ...formGridSx, alignItems: 'flex-end' }}>
                    <CustomInput label="Skill Name" placeholder="e.g. React" value={skill.name} onChange={(e) => updateTechAt(idx, 'name', e.target.value)} />
                    <CustomSelect label="Proficiency Level" value={skill.level} onChange={(e) => updateTechAt(idx, 'level', e.target.value)}>
                      {PROFICIENCY_LEVELS.map((l) => (
                        <MenuItem key={l} value={l}>{l}</MenuItem>
                      ))}
                    </CustomSelect>
                    <CustomInput label="Years" type="number" placeholder="3" value={skill.years} onChange={(e) => updateTechAt(idx, 'years', e.target.value)} />
                    <Box sx={{ display: 'flex', alignItems: 'center', height: 56 }}>
                      <IconButton size="small" onClick={() => removeTechSkill(idx)} disabled={techSkills.length <= 1}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
            <CustomButton variant="outlined" startIcon={<AddIcon />} onClick={addTechSkill}>
              Add Technical Skill
            </CustomButton>
          </Box>

          {/* Soft Skills */}
          <Box sx={sectionWrapperSx}>
            <Box component="span" sx={{ display: 'block', ...sectionHeaderSx }}>
              Soft Skills
            </Box>
            <Box component="span" sx={{ display: 'block', mb: 1.5, fontSize: 'var(--font-size-helper)', color: 'text.secondary' }}>
              Free text / suggestions. Stored as flat list for auto-filling checkbox fields.
            </Box>
            {softSkills.map((skill, idx) => (
              <Box key={idx} sx={{ ...formGridSx, alignItems: 'center', mt: idx > 0 ? 1 : 0 }}>
                <CustomInput label="Skill Name" placeholder="e.g. Communication" value={skill.name} onChange={(e) => updateSoftAt(idx, 'name', e.target.value)} />
                <Box sx={{ display: 'flex', alignItems: 'center', height: 56 }}>
                  <IconButton size="small" onClick={() => removeSoftSkill(idx)} disabled={softSkills.length <= 1}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            ))}
            <CustomButton variant="outlined" startIcon={<AddIcon />} onClick={addSoftSkill}>
              Add Soft Skill
            </CustomButton>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
