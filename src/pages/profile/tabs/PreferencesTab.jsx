import { useDispatch, useSelector } from 'react-redux';
import { Box, MenuItem } from '@mui/material';
import CustomInput from '../../../components/inputs/CustomInput';
import CustomSelect from '../../../components/inputs/CustomSelect';
import SectionCard from '../components/SectionCard';
import { setPreferences } from '../../../store/profile/profileSlice';
import { FORM_GRID_SX, SECTION_TITLE_SX } from '../constants';

const EMPLOYMENT_TYPES = ['Full-time', 'Contract', 'Internship', 'Freelance'];
const EXPERIENCE_LEVELS = ['Entry', 'Mid', 'Senior', 'Lead'];

export default function PreferencesTab() {
  const dispatch = useDispatch();
  const prefs = useSelector((state) => state.profile?.form?.preferences) ?? {};
  const desiredRoles = prefs.desiredRoles ?? '';
  const employmentType = Array.isArray(prefs.employmentType) ? prefs.employmentType : [];
  const experienceLevel = prefs.experienceLevel ?? '';
  const openToRemote = prefs.openToRemote ?? '';
  const willingToRelocate = prefs.willingToRelocate ?? '';
  const preferredLocations = Array.isArray(prefs.preferredLocations) ? prefs.preferredLocations : [];
  const expectedSalary = prefs.expectedSalaryRange ?? '';

  return (
    <Box sx={{ width: '100%' }}>
      <SectionCard>
        <Box component="p" sx={{ m: 0, mb: 2, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          Job preferences are critical for matching. Set your expectations clearly.
        </Box>
        <Box component="span" sx={{ ...SECTION_TITLE_SX, display: 'block', mb: 2 }}>
          Job Preferences
        </Box>
        <Box sx={FORM_GRID_SX}>
          <Box sx={{ gridColumn: '1 / -1' }}>
            <CustomInput label="Desired Roles" placeholder="Frontend Developer, Software Engineer" fullWidth value={desiredRoles} onChange={(e) => dispatch(setPreferences({ desiredRoles: e.target.value }))} />
          </Box>
          <CustomSelect label="Employment Type" multiple value={employmentType} onChange={(e) => dispatch(setPreferences({ employmentType: e.target.value ?? [] }))} renderValue={(v) => (v?.length ? v.join(', ') : 'Select')}>
            {EMPLOYMENT_TYPES.map((t) => (
              <MenuItem key={t} value={t}>{t}</MenuItem>
            ))}
          </CustomSelect>
          <CustomSelect label="Experience Level" value={experienceLevel} onChange={(e) => dispatch(setPreferences({ experienceLevel: e.target.value }))}>
            {EXPERIENCE_LEVELS.map((l) => (
              <MenuItem key={l} value={l}>{l}</MenuItem>
            ))}
          </CustomSelect>
          <CustomSelect label="Open to Remote" value={openToRemote} onChange={(e) => dispatch(setPreferences({ openToRemote: e.target.value }))}>
            <MenuItem value="yes">Yes</MenuItem>
            <MenuItem value="no">No</MenuItem>
          </CustomSelect>
          <CustomSelect label="Willing to Relocate" value={willingToRelocate} onChange={(e) => dispatch(setPreferences({ willingToRelocate: e.target.value }))}>
            <MenuItem value="yes">Yes</MenuItem>
            <MenuItem value="no">No</MenuItem>
          </CustomSelect>
          <Box sx={{ gridColumn: '1 / -1' }}>
            <CustomSelect label="Preferred Locations" multiple value={preferredLocations} onChange={(e) => dispatch(setPreferences({ preferredLocations: e.target.value ?? [] }))} renderValue={(v) => (v?.length ? v.join(', ') : 'Select')}>
              <MenuItem value="New York">New York</MenuItem>
              <MenuItem value="London">London</MenuItem>
              <MenuItem value="Bangalore">Bangalore</MenuItem>
              <MenuItem value="Remote">Remote</MenuItem>
            </CustomSelect>
          </Box>
          <Box sx={{ gridColumn: '1 / -1' }}>
            <CustomInput label="Expected Salary Range (optional, private)" placeholder="e.g. $80k - $120k" fullWidth value={expectedSalary} onChange={(e) => dispatch(setPreferences({ expectedSalaryRange: e.target.value }))} />
          </Box>
        </Box>
      </SectionCard>
    </Box>
  );
}
