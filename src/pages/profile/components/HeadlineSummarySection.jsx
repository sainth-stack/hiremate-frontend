import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography } from '@mui/material';
import CustomInput from '../../../components/inputs/CustomInput';
import SectionCard from './SectionCard';
import { FORM_GRID_SX, SECTION_TITLE_SX } from '../constants';
import { setBasicInfo } from '../../../store/profile/profileSlice';

export default function HeadlineSummarySection() {
  const dispatch = useDispatch();
  const form = useSelector((state) => state.profile?.form) || {};
  const headline = form.professionalHeadline ?? '';
  const summary = form.professionalSummary ?? '';

  return (
    <SectionCard>
      <Typography component="h3" sx={SECTION_TITLE_SX}>
        Headline & Summary
      </Typography>
      <Box sx={FORM_GRID_SX}>
        <Box sx={{ gridColumn: '1 / -1' }}>
          <Typography variant="caption" sx={{ display: 'block', mb: 0.5, fontSize: 12, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Professional Headline (max 120 chars)
          </Typography>
          <CustomInput
            label="Professional Headline"
            placeholder="e.g. Frontend Developer | React | TypeScript"
            inputProps={{ maxLength: 120 }}
            value={headline}
            onChange={(e) => dispatch(setBasicInfo({ professionalHeadline: e.target.value }))}
          />
        </Box>
        <Box sx={{ gridColumn: '1 / -1' }}>
          <Typography variant="caption" sx={{ display: 'block', mb: 0.5, fontSize: 12, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Professional Summary (500–800 chars)
          </Typography>
          <CustomInput
            multiline
            rows={6}
            inputProps={{ maxLength: 800 }}
            placeholder="Enter your professional summary (500–800 chars)..."
            value={summary}
            onChange={(e) => dispatch(setBasicInfo({ professionalSummary: e.target.value }))}
          />
        </Box>
      </Box>
    </SectionCard>
  );
}
