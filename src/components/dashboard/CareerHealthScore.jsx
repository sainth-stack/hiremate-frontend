import { Box, Typography } from '@mui/material';
import WhatshotRoundedIcon from '@mui/icons-material/WhatshotRounded';
import { computeCareerScore, getScoreColor, getScoreCoachingTip } from '../../utils/dashboardUtils';
import SkeletonCard from './SkeletonCard';

function ScoreRing({ score, color, size, gradientId }) {
  const stroke = 8;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = ((score || 0) / 100) * circ;

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.38" />
          <stop offset="55%" stopColor={color} stopOpacity="0.85" />
          <stop offset="100%" stopColor={color} stopOpacity="1" />
        </linearGradient>
      </defs>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke="rgba(16, 24, 40, 0.08)"
        strokeWidth={stroke}
        fill="none"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke={`url(#${gradientId})`}
        strokeWidth={stroke}
        fill="none"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.85s ease-in-out' }}
      />
    </svg>
  );
}

export default function CareerHealthScore({ summary, jobs, loading }) {
  if (loading) return <SkeletonCard height={120} />;

  const { score, breakdown, streak } = computeCareerScore(summary, jobs);
  const color = getScoreColor(score);
  const tip = getScoreCoachingTip(breakdown);

  return (
    <Box
      sx={{
        borderRadius: 'var(--dashboard-card-radius)',
        px: 'var(--dashboard-card-px)',
        py: 'var(--dashboard-card-py)',
        border: '1px solid',
        borderColor: 'var(--dashboard-border-subtle, var(--border-color))',
        bgcolor: 'var(--bg-paper)',
        boxShadow: 'var(--dashboard-card-shadow)',
        transition: 'all 0.2s ease',
        '&:hover': { boxShadow: 'var(--dashboard-card-shadow-hover)', transform: 'translateY(-2px)' },
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'auto 1fr', lg: 'auto 1fr auto' },
          gap: 'var(--dashboard-block-gap)',
          alignItems: 'center',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
          <Box
            sx={{
              position: 'relative',
              width: 110,
              height: 110,
              borderRadius: '999px',
              bgcolor: 'rgba(16, 24, 40, 0.02)',
              boxShadow: 'inset 0 1px 2px rgba(16, 24, 40, 0.06)',
              border: '1px solid var(--dashboard-border-subtle, var(--border-color))',
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
            }}
          >
            <ScoreRing score={score} color={color.hex} size={104} gradientId="careerScoreRingGradient" />
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--dashboard-label-gap)',
              }}
            >
              <Typography
                sx={{
                  fontSize: '28px',
                  fontWeight: 700,
                  lineHeight: 1,
                  letterSpacing: -0.4,
                  color: 'var(--text-primary)',
                }}
              >
                {score}
              </Typography>
              <Typography sx={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1 }}>
                / 100
              </Typography>
            </Box>
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="caption"
              sx={{
                color: 'var(--text-secondary)',
                opacity: 0.9,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontSize: 'var(--dashboard-section-label)',
                display: 'block',
                mb: 1.5,
              }}
            >
              Career Health Score
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.25 }}>
              {streak > 0 && (
                <Box
                  sx={{
                    px: 1.25,
                    py: 0.5,
                    borderRadius: '999px',
                    bgcolor: 'rgba(245, 158, 11, 0.10)',
                    border: '1px solid rgba(245, 158, 11, 0.18)',
                    color: 'var(--warning)',
                    fontSize: '12px',
                    fontWeight: 600,
                    lineHeight: 1,
                    whiteSpace: 'nowrap',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.75,
                  }}
                >
                  <WhatshotRoundedIcon sx={{ fontSize: 16, color: 'var(--warning)' }} />
                  {streak}-day streak
                </Box>
              )}
              <Box
                sx={{
                  px: 1.25,
                  py: 0.5,
                  borderRadius: '999px',
                  bgcolor: color.bg,
                  border: '1px solid rgba(37, 99, 235, 0.14)',
                  color: color.text,
                  fontSize: '12px',
                  fontWeight: 600,
                  lineHeight: 1,
                  whiteSpace: 'nowrap',
                }}
              >
                {score >= 70 ? 'Strong' : score >= 40 ? 'Building' : 'Starting'}
              </Box>
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            gap: 1.5,
            pr: { lg: 1 },
            minWidth: 0,
          }}
        >
          {breakdown &&
            Object.values(breakdown).map((factor) => (
              <Box key={factor.label} sx={{ display: 'grid', gridTemplateColumns: '160px 1fr 64px', gap: 1.5, alignItems: 'center' }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'var(--text-secondary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontSize: '13px',
                  }}
                >
                  {factor.label}
                </Typography>
                <Box
                  sx={{
                    height: 10,
                    bgcolor: 'rgba(16, 24, 40, 0.06)',
                    borderRadius: '999px',
                    overflow: 'hidden',
                    boxShadow: 'inset 0 1px 1px rgba(16, 24, 40, 0.05)',
                  }}
                >
                  <Box
                    sx={{
                      height: '100%',
                      width: `${((factor.score || 0) / (factor.max || 1)) * 100}%`,
                      background: `linear-gradient(90deg, ${color.hex} 0%, ${color.hex} 100%)`,
                      borderRadius: '999px',
                      transition: 'width 0.6s ease-in-out',
                    }}
                  />
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    textAlign: 'right',
                    color: 'var(--text-primary)',
                    fontWeight: 600,
                    fontSize: '13px',
                  }}
                >
                  {factor.value || `${factor.score}/${factor.max}`}
                </Typography>
              </Box>
            ))}
        </Box>

        <Box
          sx={{
            display: { xs: 'block', lg: 'block' },
            justifySelf: { lg: 'end' },
            maxWidth: { xs: '100%', lg: 280 },
            borderRadius: '10px',
            bgcolor: 'rgba(37, 99, 235, 0.06)',
            border: '1px solid rgba(37, 99, 235, 0.12)',
            px: 2,
            py: 1.5,
          }}
        >
          <Typography sx={{ color: 'var(--text-primary)', fontSize: '13px', lineHeight: 1.55 }}>
            <Box component="span" sx={{ color: 'var(--primary)', fontWeight: 700 }}>
              Tip:
            </Box>{' '}
            {tip}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
