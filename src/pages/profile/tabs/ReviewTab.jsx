import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Box, LinearProgress, Card, CardContent, Chip, CircularProgress, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import CustomButton from '../../../components/common/CustomButton';
import { updateProfile } from '../../../store/profile/profileSlice';

const SECTIONS = [
  { name: 'Profile (Core Identity)', complete: 60, missing: ['Resume upload', 'Phone validation'] },
  { name: 'Experience', complete: 80, missing: ['Job descriptions'] },
  { name: 'Education', complete: 100, missing: [] },
  { name: 'Skills', complete: 40, missing: ['Technical skills', 'Proficiency levels'] },
  { name: 'Projects', complete: 0, missing: ['Add at least one project'] },
  { name: 'Preferences', complete: 50, missing: ['Desired roles', 'Employment type'] },
  { name: 'Links', complete: 30, missing: ['LinkedIn URL required'] },
];

export default function ReviewTab() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { submitLoading, submitError } = useSelector((state) => state.profile);
  const overallComplete = Math.round(SECTIONS.reduce((a, s) => a + s.complete, 0) / SECTIONS.length);
  const atsScore = 65;

  const handleSubmitProfile = () => {
    dispatch(updateProfile())
      .then((result) => {
        if (updateProfile.fulfilled.match(result)) navigate('/start', { replace: true });
      });
  };

  const sectionHeaderSx = { mb: 1.5, fontSize: 'var(--font-size-section-header)', fontWeight: 600 };
  const sectionWrapperSx = { mt: 3, '&:first-of-type': { mt: 0 } };

  return (
    <Box sx={{ width: '100%' }}>
      <Card variant="outlined" sx={{ borderRadius: 2, width: '100%' }}>
        <CardContent>
          <Box component="span" sx={{ display: 'block', mb: 1.5, fontSize: 'var(--font-size-helper)', color: 'text.secondary' }}>
            Review your profile completeness and fix any missing or weak fields before submitting.
          </Box>

          {/* Profile Completeness */}
          <Box sx={sectionWrapperSx}>
            <Box component="span" sx={{ display: 'block', ...sectionHeaderSx }}>
              Profile Completeness
            </Box>
            <Card variant="outlined" sx={{ borderRadius: 2, width: '100%' }}>
              <CardContent sx={{ '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0 }}>
                  <LinearProgress
                    variant="determinate"
                    value={overallComplete}
                    sx={{ flex: 1, height: 10, borderRadius: 1 }}
                  />
                  <Box component="span" sx={{ fontWeight: 600 }}>
                    {overallComplete}%
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                  <Chip label={`ATS Readiness: ${atsScore}%`} color="primary" size="small" />
                  <Chip label="Optional" variant="outlined" size="small" />
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Section-wise status */}
          <Box sx={sectionWrapperSx}>
            <Box component="span" sx={{ display: 'block', ...sectionHeaderSx }}>
              Section-wise Completion
            </Box>
            {SECTIONS.map((section, idx) => (
              <Card key={idx} variant="outlined" sx={{ mt: idx > 0 ? 1 : 0, borderRadius: 2, width: '100%' }}>
                <CardContent sx={{ '&:last-child': { pb: 2 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0 }}>
                {section.complete === 100 ? (
                  <CheckCircleIcon color="success" fontSize="small" />
                ) : (
                  <WarningIcon color="warning" fontSize="small" />
                )}
                    <Box component="span" sx={{ fontWeight: 500 }}>
                      {section.name}
                    </Box>
                    <Box component="span" sx={{ ml: 1, fontSize: '0.75rem', color: 'text.secondary' }}>
                      {section.complete}%
                    </Box>
                  </Box>
                  <LinearProgress variant="determinate" value={section.complete} sx={{ height: 6, borderRadius: 1, mt: 1 }} />
                  {section.missing?.length > 0 && (
                    <Box component="span" sx={{ display: 'block', mt: 0.5, fontSize: '0.75rem', color: 'error.main' }}>
                      Missing / weak: {section.missing.join(', ')}
                    </Box>
                  )}
                </CardContent>
              </Card>
            ))}
          </Box>
        </CardContent>
      </Card>

      {submitError && (
        <Typography variant="body2" color="error" sx={{ mt: 2 }}>
          {typeof submitError === 'object' ? (submitError.message || JSON.stringify(submitError)) : submitError}
        </Typography>
      )}
      {/* Actions */}
      <Box sx={{ mt: 2.5, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <CustomButton variant="outlined">Preview auto-filled job form</CustomButton>
        <CustomButton onClick={handleSubmitProfile} disabled={submitLoading}>
          {submitLoading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={20} color="inherit" />
              <span>Submitting…</span>
            </Box>
          ) : (
            'Submit Profile'
          )}
        </CustomButton>
        <CustomButton variant="outlined" color="secondary">
          Lock profile for auto-apply
        </CustomButton>
      </Box>
    </Box>
  );
}
