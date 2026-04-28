import { Box, Typography } from '@mui/material';
import SkeletonCard from './SkeletonCard';

const STAGES = [
  { key: 'saved', label: 'Saved', color: '#64748B' },
  { key: 'applied', label: 'Applied', color: '#06B6D4' },
  { key: 'interview', label: 'Interview', color: '#10B981' },
  { key: 'offer', label: 'Offer', color: '#F59E0B' },
  { key: 'closed', label: 'Closed', color: '#1E3A8A' },
];

export default function ApplicationFunnel({ jobs, loading }) {
  if (loading) return <SkeletonCard height={200} />;

  const counts = STAGES.reduce((acc, s) => {
    acc[s.key] = (jobs || []).filter((j) => (j.application_status || 'saved') === s.key).length;
    return acc;
  }, {});

  const savedCount = counts.saved || 0;
  const appliedCount = counts.applied || 0;
  const interviewCount = counts.interview || 0;
  const offerCount = counts.offer || 0;
  
  const totalSubmitted = appliedCount + interviewCount + offerCount + (counts.closed || 0);
  
  const savedToAppliedRate = savedCount > 0 ? Math.round((totalSubmitted / (savedCount + totalSubmitted)) * 100) : 0;
  const appliedToInterviewRate = totalSubmitted > 0 ? Math.round((interviewCount / totalSubmitted) * 100) : 0;
  const interviewToOfferRate = interviewCount > 0 ? Math.round((offerCount / interviewCount) * 100) : 0;
  
  const rates = [savedToAppliedRate, appliedToInterviewRate, interviewToOfferRate, 100];

  const getTip = () => {
    if (totalSubmitted === 0) return 'Start applying to jobs to build your pipeline!';
    if (offerCount > 0) return `Great job! You have ${offerCount} offer${offerCount > 1 ? 's' : ''}. Focus on negotiation.`;
    if (interviewCount === 0 && totalSubmitted >= 5) return `Applied to ${totalSubmitted} jobs with no interviews yet. Tailor your resume to each job description.`;
    if (interviewCount > 0 && offerCount === 0) return `${interviewCount} interview${interviewCount > 1 ? 's' : ''} scheduled. Practice common questions and research the companies.`;
    if (savedCount > 5) return `You have ${savedCount} saved jobs. Set a goal to apply to 3 of them this week.`;
    return 'Keep applying consistently to increase your chances!';
  };
  
  const tip = getTip();

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
            const rate = i > 0 && i < rates.length ? rates[i - 1] || 0 : null;
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
          background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.10) 0%, rgba(6, 182, 212, 0.06) 60%, rgba(16, 24, 40, 0.02) 100%)',
          border: '1px solid rgba(30, 58, 138, 0.14)',
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
