import { useDispatch, useSelector } from 'react-redux';
import { Box, MenuItem, Card, CardContent } from '@mui/material';
import CustomSelect from '../../../components/inputs/CustomSelect';
import CustomInput from '../../../components/inputs/CustomInput';
import CustomButton from '../../../components/common/CustomButton';
import { setPreferences } from '../../../store/profile/profileSlice';

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
      <Card variant="outlined" sx={cardSx}>
        <CardContent sx={{ p: { xs: 2, sm: 3 }, '&:last-child': { pb: { xs: 2, sm: 3 } } }}>
          <Box component="p" sx={{ display: 'block', m: 0, mb: 0, fontSize: 'var(--font-size-helper)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Job preferences are critical for matching. Set your expectations clearly.
          </Box>

          <Box sx={{ mt: 0, pt: 0 }}>
            <Box component="span" sx={{ display: 'block', ...sectionHeaderSx }}>
              Job Preferences
            </Box>
            <Box sx={formGridSx}>
            <Box sx={{ gridColumn: '1 / -1' }}>
              <Box component="span" sx={{ display: 'block', mb: 0.5, fontSize: 'var(--font-size-helper)', color: 'text.secondary' }}>
                Desired Roles (multi-select + free text)
              </Box>
              <CustomInput label="Desired Roles" placeholder="Frontend Developer, Software Engineer" fullWidth value={desiredRoles} onChange={(e) => dispatch(setPreferences({ desiredRoles: e.target.value }))} />
            </Box>
              <CustomSelect label="Employment Type" multiple value={employmentType} onChange={(e) => dispatch(setPreferences({ employmentType: e.target.value ?? [] }))} renderValue={(v) => v?.length ? v.join(', ') : 'Select'}>
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
              <Box component="span" sx={{ display: 'block', mb: 0.5, fontSize: 'var(--font-size-helper)', color: 'text.secondary' }}>
                Preferred Locations (multi-select cities/countries)
              </Box>
              <CustomSelect label="Preferred Locations" multiple value={preferredLocations} onChange={(e) => dispatch(setPreferences({ preferredLocations: e.target.value ?? [] }))} renderValue={(v) => v?.length ? v.join(', ') : 'Select'}>
                <MenuItem value="New York">New York</MenuItem>
                <MenuItem value="London">London</MenuItem>
                <MenuItem value="Bangalore">Bangalore</MenuItem>
                <MenuItem value="Remote">Remote</MenuItem>
              </CustomSelect>
            </Box>
            <Box sx={{ gridColumn: '1 / -1' }}>
              <Box component="span" sx={{ display: 'block', mb: 0.5, fontSize: 'var(--font-size-helper)', color: 'text.secondary' }}>
                Expected Salary Range (optional, private)
              </Box>
              <CustomInput label="Expected Salary Range" placeholder="e.g. $80k - $120k" fullWidth value={expectedSalary} onChange={(e) => dispatch(setPreferences({ expectedSalaryRange: e.target.value }))} />
            </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <CustomButton sx={{ mt: 2 }}>Save Preferences</CustomButton>
    </Box>
  );
}
