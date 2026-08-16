import { Box, Typography } from '@mui/material';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';

export default function InterviewFlowStepper({ steps, activeIndex = 0 }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: { xs: 0.5, md: 1 },
        flexWrap: 'wrap',
        mb: 3,
      }}
    >
      {steps.map((step, index) => {
        const done = index < activeIndex;
        const active = index === activeIndex;
        return (
          <Box key={step.key} sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, md: 1 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 800,
                  flexShrink: 0,
                  bgcolor: done || active ? 'var(--primary)' : 'var(--grey-4)',
                  color: done || active ? '#fff' : 'var(--text-muted)',
                  boxShadow: active ? '0 0 0 4px rgba(37, 99, 235, 0.15)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                {done ? <CheckRoundedIcon sx={{ fontSize: 16 }} /> : index + 1}
              </Box>
              <Typography
                sx={{
                  fontSize: { xs: 12, md: 13 },
                  fontWeight: active ? 700 : 500,
                  color: active ? 'var(--text-primary)' : done ? 'var(--text-secondary)' : 'var(--text-muted)',
                  whiteSpace: 'nowrap',
                }}
              >
                {step.label}
              </Typography>
            </Box>
            {index < steps.length - 1 && (
              <Box
                sx={{
                  width: { xs: 16, md: 32 },
                  height: 2,
                  borderRadius: 1,
                  bgcolor: done ? 'var(--primary)' : 'var(--border-color)',
                  mx: { xs: 0.25, md: 0.5 },
                }}
              />
            )}
          </Box>
        );
      })}
    </Box>
  );
}
