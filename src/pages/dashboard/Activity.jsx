import { Typography } from '@mui/material';
import PageContainer from '../../components/common/PageContainer';

export default function Activity() {
  return (
    <PageContainer>
      <Typography sx={{ fontSize: 'var(--font-size-page-title)', fontWeight: 600, mb: 1 }}>
        Activity
      </Typography>
      <Typography sx={{ fontSize: 'var(--font-size-page-subtitle)', color: 'var(--text-secondary)' }}>
        Your application and profile activity — content coming soon.
      </Typography>
    </PageContainer>
  );
}
