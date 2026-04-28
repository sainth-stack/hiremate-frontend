import { Box, Typography } from '@mui/material';

/**
 * OpsBrain Brand Tagline Component
 * Displays the branded tagline with AI-Powered badge
 */
export default function BrandTagline({ darkMode = true, showBadge = true, sx = {} }) {
  return (
    <Box sx={sx}>
      {showBadge && (
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1.25,
            px: 1.25,
            py: 0.5,
            borderRadius: '6px',
            bgcolor: darkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(15, 30, 53, 0.03)',
            border: darkMode
              ? '1px solid rgba(255, 255, 255, 0.1)'
              : '1px solid rgba(15, 30, 53, 0.1)',
            backdropFilter: 'blur(10px)',
            mb: 3,
          }}
        >
          <Box
            sx={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              bgcolor: '#06B6D4',
              boxShadow: '0 0 10px #06B6D4',
            }}
          />
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 700,
              color: darkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(15, 30, 53, 0.8)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            AI-Powered Job Intelligence
          </Typography>
        </Box>
      )}

      <Typography
        sx={{
          fontSize: { xs: 32, md: 38, lg: 48 },
          fontWeight: 800,
          color: darkMode ? '#ffffff' : '#0F1E35',
          lineHeight: 1.15,
          letterSpacing: '-0.03em',
          mb: 2.5,
          fontFamily: '"Inter", "Poppins", system-ui, -apple-system, sans-serif',
        }}
      >
        The brain for{' '}
        <Box
          component="span"
          sx={{
            background: 'linear-gradient(135deg, #06B6D4 0%, #10B981 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontWeight: 800,
          }}
        >
          your career.
        </Box>
      </Typography>

      <Typography
        sx={{
          fontSize: 16,
          color: darkMode ? 'rgba(255, 255, 255, 0.65)' : 'rgba(15, 30, 53, 0.7)',
          lineHeight: 1.65,
          maxWidth: 460,
          fontWeight: 500,
          fontFamily: '"Inter", "Poppins", system-ui, -apple-system, sans-serif',
        }}
      >
        The enterprise-grade AI platform designed to automate your job search,
        optimize your applications, and master your interviews.
      </Typography>
    </Box>
  );
}
