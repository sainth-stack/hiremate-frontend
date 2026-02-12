import { Typography } from '@mui/material';
import PageContainer from '../../components/common/PageContainer';

export default function JobSearch() {
  return (
    <PageContainer>
      <Typography sx={{ fontSize: 'var(--font-size-page-title)', fontWeight: 600, mb: 1 }}>
        Job Search
      </Typography>
      <Typography sx={{ fontSize: 'var(--font-size-page-subtitle)', color: 'var(--text-secondary)' }}>
        Search and apply to jobs — content coming soon.
      </Typography>
    </PageContainer>
  );
}
