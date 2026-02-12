import { Typography } from '@mui/material';
import PageContainer from '../../components/common/PageContainer';

export default function ApplicationTracker() {
  return (
    <PageContainer>
      <Typography variant="h5" gutterBottom>
        Application Tracker
      </Typography>
      <Typography color="text.secondary">
        Track your job applications — add your content here.
      </Typography>
    </PageContainer>
  );
}
