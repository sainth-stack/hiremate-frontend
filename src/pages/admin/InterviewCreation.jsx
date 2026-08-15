import { Box, Typography } from '@mui/material';
import QuizRoundedIcon from '@mui/icons-material/QuizRounded';
import InterviewCreationSection from './InterviewCreationSection';

export default function InterviewCreation() {
  return (
    <Box
      sx={{
        width: '100%',
        height: 'calc(100vh - 60px)',
        maxHeight: 'calc(100vh - 60px)',
        minHeight: 0,
        boxSizing: 'border-box',
        p: '20px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: `
          radial-gradient(ellipse 80% 50% at 0% 0%, rgba(37, 99, 235, 0.06) 0%, transparent 50%),
          radial-gradient(ellipse 60% 40% at 100% 100%, rgba(14, 165, 233, 0.05) 0%, transparent 50%),
          var(--bg-light)
        `,
      }}
    >
      <Box
        sx={{
          flexShrink: 0,
          mb: 2.5,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '14px',
            background: 'linear-gradient(135deg, var(--primary) 0%, #0ea5e9 100%)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(37, 99, 235, 0.28)',
            flexShrink: 0,
          }}
        >
          <QuizRoundedIcon />
        </Box>
        <Box>
          <Typography
            component="h1"
            sx={{
              fontSize: { xs: 20, md: 26 },
              fontWeight: 800,
              color: 'var(--text-primary)',
              letterSpacing: '-0.03em',
              lineHeight: 1.2,
            }}
          >
            Interview Creation
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mt: 0.35, fontSize: 13 }}>
            Create and manage interview templates with title and difficulty level
          </Typography>
        </Box>
      </Box>

      <InterviewCreationSection />
    </Box>
  );
}
