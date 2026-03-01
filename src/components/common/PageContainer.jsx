import { Box } from '@mui/material';

export default function PageContainer({ children, maxWidth = 'lg', ...props }) {
  const baseSx = {
    width: '100%',
    maxWidth: { xs: '100%', sm: maxWidth },
    mx: 'auto',
    px: { xs: 2, sm: 3 },
    py: 3,
  };

  return (
    <Box
      sx={[baseSx, props?.sx]}
      {...props}
    >
      {children}
    </Box>
  );
}
