import { useDispatch, useSelector } from 'react-redux';
import { Box, MenuItem, Card, CardContent, CircularProgress, Typography } from '@mui/material';
import CustomInput from '../../../components/inputs/CustomInput';
import CustomSelect from '../../../components/inputs/CustomSelect';
import CustomButton from '../../../components/common/CustomButton';
import FileUploadCustom from '../../../components/uploadFiles/index.jsx';
import { uploadResume } from '../../../store/resume/resumeSlice';
import { setBasicInfo } from '../../../store/profile/profileSlice';

export default function ProfileTab() {
  const dispatch = useDispatch();
  const { parsedData, lastUpdated, loading, error } = useSelector((state) => state.resume);
  const form = useSelector((state) => state.profile?.form) || {};
  const firstName = form.firstName ?? '';
  const lastName = form.lastName ?? '';
  const email = form.email ?? '';
  const phone = form.phone ?? '';
  const city = form.city ?? '';
  const country = form.country ?? '';
  const headline = form.professionalHeadline ?? '';
  const summary = form.professionalSummary ?? '';
  const willingToWorkIn = Array.isArray(form.willingToWorkIn) ? form.willingToWorkIn : [];

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

  const handleFileUpload = (file) => {
    if (file) dispatch(uploadResume(file));
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Card variant="outlined" sx={{ borderRadius: 2, width: '100%' }}>
        <CardContent>
          {/* Resume */}
          <Box sx={sectionWrapperSx}>
            <Box component="span" sx={{ display: 'block', ...sectionHeaderSx }}>
              Resume
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {loading && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} />
                  <Typography variant="body2" color="text.secondary">Uploading & parsing resume…</Typography>
                </Box>
              )}
              {error && (
                <Typography variant="body2" color="error">{typeof error === 'object' ? (error.message || JSON.stringify(error)) : error}</Typography>
              )}
              <FileUploadCustom
                label="Upload Resume (PDF / DOC / DOCX)"
                id="resumeUpload"
                onFileUpload={handleFileUpload}
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                allowedExtensions={['.pdf', '.doc', '.docx']}
                subtitle="PDF, DOC, DOCX (Max 50MB)"
              />
              <Box component="span" sx={{ display: 'block', fontSize: 'var(--font-size-helper)', color: 'text.secondary' }}>
                Resume last updated: {lastUpdated ? new Date(lastUpdated).toLocaleString() : '—'}
              </Box>
              {parsedData && (
                <CustomButton variant="text" size="small" sx={{ mt: 0.5, p: 0, minWidth: 'auto', textTransform: 'none', alignSelf: 'flex-start' }}>
                  Parse resume → auto-fill all tabs
                </CustomButton>
              )}
            </Box>
          </Box>

          {/* Basic Information */}
          <Box sx={sectionWrapperSx}>
            <Box component="span" sx={{ display: 'block', ...sectionHeaderSx }}>
              Basic Information
            </Box>
            <Box sx={formGridSx}>
              <CustomInput label="First Name" value={firstName} onChange={(e) => dispatch(setBasicInfo({ firstName: e.target.value }))} />
              <CustomInput label="Last Name" value={lastName} onChange={(e) => dispatch(setBasicInfo({ lastName: e.target.value }))} />
              <CustomInput label="Email" type="email" placeholder="john.doe@example.com" value={email} onChange={(e) => dispatch(setBasicInfo({ email: e.target.value }))} />
              <CustomInput label="Phone (with country code)" placeholder="+1 234 567 8900" value={phone} onChange={(e) => dispatch(setBasicInfo({ phone: e.target.value }))} />
            </Box>
          </Box>

          {/* Current Location */}
          <Box sx={sectionWrapperSx}>
            <Box component="span" sx={{ display: 'block', ...sectionHeaderSx }}>
              Current Location
            </Box>
            <Box sx={formGridSx}>
              <CustomInput label="City" value={city} onChange={(e) => dispatch(setBasicInfo({ city: e.target.value }))} />
              <CustomInput label="Country" value={country} onChange={(e) => dispatch(setBasicInfo({ country: e.target.value }))} />
              <Box sx={{ gridColumn: '1 / -1' }}>
                <CustomSelect label="Willing to Work In" multiple displayEmpty value={willingToWorkIn} onChange={(e) => dispatch(setBasicInfo({ willingToWorkIn: e.target.value ?? [] }))} renderValue={(v) => v?.length ? v.join(', ') : 'Select countries'}>
                  <MenuItem value="United States">United States</MenuItem>
                  <MenuItem value="United Kingdom">United Kingdom</MenuItem>
                  <MenuItem value="India">India</MenuItem>
                  <MenuItem value="Canada">Canada</MenuItem>
                  <MenuItem value="Germany">Germany</MenuItem>
                </CustomSelect>
              </Box>
            </Box>
          </Box>

          {/* Headline & Summary */}
          <Box sx={sectionWrapperSx}>
            <Box component="span" sx={{ display: 'block', ...sectionHeaderSx }}>
              Headline &amp; Summary
            </Box>
            <Box sx={formGridSx}>
              <Box sx={{ gridColumn: '1 / -1' }}>
                <Box component="span" sx={{ display: 'block', mb: 0.5, fontSize: 'var(--font-size-helper)', color: 'text.secondary' }}>
                  Professional Headline (max 120 chars) — e.g. Frontend Developer | React | TypeScript
                </Box>
                <CustomInput label="Professional Headline" inputProps={{ maxLength: 120 }} value={headline} onChange={(e) => dispatch(setBasicInfo({ professionalHeadline: e.target.value }))} />
              </Box>
              <Box sx={{ gridColumn: '1 / -1' }}>
                <Box component="span" sx={{ display: 'block', mb: 0.5, fontSize: 'var(--font-size-helper)', color: 'text.secondary' }}>
                  Professional Summary (500–800 chars) — used in job portal Summary fields
                </Box>
                <CustomInput
                  label="Professional Summary"
                  multiline
                  rows={6}
                  inputProps={{ maxLength: 800 }}
                  placeholder="Enter your professional summary (500–800 chars)..."
                  value={summary}
                  onChange={(e) => dispatch(setBasicInfo({ professionalSummary: e.target.value }))}
                />
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
