import { Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import PageContainer from '../../components/common/PageContainer';
import CustomButton from '../../components/common/CustomButton';

export default function Home() {
  return (
    <PageContainer>
      <Typography variant="h5" gutterBottom>
        Welcome to HIREMATEAI
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Dashboard home — add your content here.
      </Typography>
      <CustomButton component={Link} to="/profile">
        Build Profile
      </CustomButton>
    </PageContainer>
  );
}
