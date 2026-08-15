import { Box } from '@mui/material';
import OpsBrainLogo from '../../../components/ui/OpsBrainLogo';

export default function PageShell({ children, fullBleed = false }) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #f0f4ff 0%, #f8fafc 45%, #eef2ff 100%)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          px: { xs: 2, sm: 4 },
          py: 2,
          borderBottom: '1px solid rgba(15, 23, 42, 0.06)',
          bgcolor: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <OpsBrainLogo variant="full" height={32} darkMode={false} />
      </Box>
      <Box
        sx={{
          flex: 1,
          px: fullBleed ? 0 : { xs: 2, sm: 3 },
          py: fullBleed ? 0 : { xs: 3, sm: 4 },
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ width: '100%', maxWidth: fullBleed ? '100%' : 960, mx: fullBleed ? 0 : 'auto' }}>{children}</Box>
      </Box>
    </Box>
  );
}
