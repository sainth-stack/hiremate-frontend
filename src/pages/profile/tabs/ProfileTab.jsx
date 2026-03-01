import { Box } from '@mui/material';
import ResumeSection from '../components/ResumeSection';
import BasicInfoSection from '../components/BasicInfoSection';
import LocationSection from '../components/LocationSection';
import HeadlineSummarySection from '../components/HeadlineSummarySection';

export default function ProfileTab() {
  return (
    <Box sx={{ width: '100%' }}>
      <ResumeSection />
      <BasicInfoSection />
      <LocationSection />
      <HeadlineSummarySection />
    </Box>
  );
}
