import { Box, Typography } from '@mui/material';
import SkeletonCard from './SkeletonCard';

const STAGES = [
  { key: 'saved', label: 'Saved', color: '#6D28D9' },
  { key: 'applied', label: 'Applied', color: '#2563EB' },
  { key: 'interview', label: 'Interview', color: '#16A34A' },
  { key: 'offer', label: 'Offer', color: '#D97706' },
  { key: 'closed', label: 'Closed', color: '#64748B' },
];

export default function ApplicationFunnel({ jobs, loading }) {
  if (loading) return <SkeletonCard height={200} />;

  const counts = STAGES.reduce((acc, s) => {
    acc[s.key] = (jobs || []).filter((j) => (j.application_status || 'saved') === s.key).length;
    return acc;
  }, {});

  const rates = STAGES.slice(1).map((stage, i) => {
    const prev = counts[STAGES[i].key] || 0;
    const curr = counts[stage.key] || 0;
    return prev > 0 ? Math.round((curr / prev) * 100) : 0;
  });

  const coachingTips = [
    `Your saved→applied rate is ${rates[0] || 0}%. Work through your saved jobs list.`,
    `Your applied→interview rate is ${rates[1] || 0}%. Consider tailoring your resume per job.`,
    `Your interview→offer rate is ${rates[2] || 0}%. Focus on interview prep.`,
    "You've received offers — great work!",
  ];
  const nonzeroRates = rates.filter((r) => r > 0);
  const lowestIdx = nonzeroRates.length > 0 ? rates.indexOf(Math.min(...nonzeroRates)) : 0;
  const tip =
    rates.every((r) => r === 0)
      ? 'Start applying to see your funnel fill up!'
      : coachingTips[lowestIdx] || coachingTips[0];

  return (
    <Box
      sx={{
        borderRadius: 'var(--dashboard-card-radius)',
        px: 'var(--dashboard-card-px)',
        py: 'var(--dashboard-card-py)',
        bgcolor: 'var(--bg-paper)',
        border: '1px solid var(--dashboard-border-subtle, var(--border-color))',
        boxShadow: 'var(--dashboard-card-shadow)',
        transition: 'all 0.2s ease',
        '&:hover': { boxShadow: 'var(--dashboard-card-shadow-hover)', transform: 'translateY(-2px)' },
      }}
    >
      <Typography
        sx={{
          color: 'var(--text-secondary)',
          opacity: 0.9,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          mb: 1.5,
          fontSize: 'var(--dashboard-section-label)',
          fontWeight: 600,
        }}
      >
        Application Funnel
      </Typography>

      <Box sx={{ overflowX: 'auto', pb: 0.5 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'stretch',
            gap: 3,
            minWidth: 680,
            maxWidth: 960,
            mx: 'auto',
          }}
        >
          {STAGES.map((stage, i) => {
            const count = counts[stage.key] ?? 0;
            const rate = i > 0 ? rates[i - 1] || 0 : null;
            return (
              <Box key={stage.key} sx={{ display: 'flex', alignItems: 'center', gap: 3, flex: 1, minWidth: 100 }}>
                <Box
                  sx={{
                    flex: 1,
                    minWidth: 100,
                    borderRadius: '14px',
                    px: 3,
                    py: 2.5,
                    bgcolor: 'rgba(16, 24, 40, 0.02)',
                    border: '1px solid var(--dashboard-border-subtle, var(--border-color))',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      background: `linear-gradient(135deg, ${stage.color}12 0%, transparent 60%)`,
                      pointerEvents: 'none',
                    }}
                  />
                  <Typography
                    sx={{
                      color: 'var(--text-secondary)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      fontSize: '11px',
                      fontWeight: 600,
                      position: 'relative',
                    }}
                  >
                    {stage.label}
                  </Typography>
                  <Typography
                    sx={{
                      color: 'var(--text-primary)',
                      mt: 1.25,
                      fontSize: '30px',
                      fontWeight: 600,
                      lineHeight: 1.15,
                      letterSpacing: -0.3,
                      position: 'relative',
                    }}
                  >
                    {count}
                  </Typography>
                  {typeof rate === 'number' && (
                    <Box
                      sx={{
                        mt: 1.5,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.5,
                        px: 1.5,
                        py: 0.5,
                        borderRadius: '999px',
                        bgcolor: 'rgba(16, 24, 40, 0.04)',
                        border: '1px solid var(--dashboard-border-subtle, var(--border-color))',
                        color: 'var(--text-secondary)',
                        fontSize: '12px',
                        fontWeight: 600,
                        lineHeight: 1,
                        position: 'relative',
                      }}
                    >
                      {rate}%
                    </Box>
                  )}
                </Box>

                {i < STAGES.length - 1 && (
                  <Box sx={{ flexShrink: 0, width: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderTop: '2px solid rgba(16, 24, 40, 0.25)',
                        borderRight: '2px solid rgba(16, 24, 40, 0.25)',
                        transform: 'rotate(45deg)',
                      }}
                    />
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
      </Box>

      <Box
        sx={{
          mt: 2.5,
          bgcolor: 'transparent',
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.10) 0%, rgba(109, 40, 217, 0.06) 60%, rgba(16, 24, 40, 0.02) 100%)',
          border: '1px solid rgba(37, 99, 235, 0.14)',
          borderRadius: '12px',
          px: 2.5,
          py: 1.75,
        }}
      >
        <Typography sx={{ color: 'var(--text-primary)', fontSize: '13px', lineHeight: 1.55 }}>
          <Box component="span" sx={{ color: 'var(--primary)', fontWeight: 700 }}>
            Coaching:
          </Box>{' '}
          {tip}
        </Typography>
      </Box>
    </Box>
  );
}
