import { Typography } from '@mui/material';
import PageContainer from '../../components/common/PageContainer';

export default function JobRecommendations() {
  return (
    <PageContainer>
      <Typography variant="h5" gutterBottom>
        Job Recommendations
      </Typography>
      <Typography color="text.secondary">
        Discover jobs that match your profile and preferences — add your content here.
      </Typography>
    </PageContainer>
  );
}
