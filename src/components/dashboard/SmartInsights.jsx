import { Box, Typography } from '@mui/material';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import WhatshotRoundedIcon from '@mui/icons-material/WhatshotRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import LightbulbRoundedIcon from '@mui/icons-material/LightbulbRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { generateInsights } from '../../utils/dashboardUtils';
import SkeletonCard from './SkeletonCard';

const TYPE_STYLE = {
  streak: { accent: 'rgba(245, 158, 11, 0.55)', iconBg: 'rgba(245, 158, 11, 0.10)', text: 'var(--warning)' },
  pattern: { accent: 'rgba(37, 99, 235, 0.55)', iconBg: 'rgba(37, 99, 235, 0.10)', text: 'var(--primary)' },
  coaching: { accent: 'rgba(109, 40, 217, 0.55)', iconBg: 'rgba(109, 40, 217, 0.10)', text: 'var(--primary)' },
  warning: { accent: 'rgba(245, 158, 11, 0.55)', iconBg: 'rgba(245, 158, 11, 0.10)', text: 'var(--warning)' },
  positive: { accent: 'rgba(34, 197, 94, 0.55)', iconBg: 'rgba(34, 197, 94, 0.10)', text: 'var(--success)' },
};

const TYPE_ICON = {
  streak: WhatshotRoundedIcon,
  pattern: CalendarMonthRoundedIcon,
  coaching: LightbulbRoundedIcon,
  warning: WarningAmberRoundedIcon,
  positive: CheckCircleRoundedIcon,
};

const cardBaseSx = {
  borderRadius: 'var(--dashboard-card-radius)',
  px: 'var(--dashboard-card-px)',
  py: 'var(--dashboard-card-py)',
  bgcolor: 'var(--bg-paper)',
  border: '1px solid var(--dashboard-border-subtle, var(--border-color))',
  boxShadow: 'var(--dashboard-card-shadow)',
  transition: 'all 0.2s ease',
  '&:hover': { boxShadow: 'var(--dashboard-card-shadow-hover)', transform: 'translateY(-2px)' },
};

export default function SmartInsights({ summary, jobs, loading }) {
  if (loading) return <SkeletonCard height={160} />;

  const insights = generateInsights(summary, jobs);

  if (insights.length === 0) {
    return (
      <Box sx={cardBaseSx}>
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
          Smart Insights
        </Typography>
        <Box
          sx={{
            borderRadius: '12px',
            border: '1px solid var(--dashboard-border-subtle, var(--border-color))',
            bgcolor: 'rgba(16, 24, 40, 0.01)',
            px: 2,
            py: 3,
            textAlign: 'center',
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '14px',
              mx: 'auto',
              mb: 1.5,
              bgcolor: 'rgba(37, 99, 235, 0.08)',
              border: '1px solid rgba(37, 99, 235, 0.12)',
              display: 'grid',
              placeItems: 'center',
              color: 'var(--primary)',
              fontWeight: 800,
            }}
          >
            <AutoAwesomeRoundedIcon sx={{ fontSize: 20, color: 'var(--primary)' }} />
          </Box>
          <Typography sx={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Insights will appear here
          </Typography>
          <Typography sx={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, mt: 0.75 }}>
            Keep applying and tracking activity to unlock personalized coaching.
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={cardBaseSx}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 2 }}>
        <Typography
          sx={{
            color: 'var(--text-secondary)',
            opacity: 0.9,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontSize: 'var(--dashboard-section-label)',
            fontWeight: 600,
          }}
        >
          Smart Insights
        </Typography>
        <Typography sx={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>
          {insights.length} insight{insights.length > 1 ? 's' : ''}
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 'var(--dashboard-block-gap)' }}>
        {insights.map((insight, i) => {
          const style = TYPE_STYLE[insight.type] || TYPE_STYLE.coaching;
          const Icon = TYPE_ICON[insight.type] || LightbulbRoundedIcon;
          return (
            <Box
              key={i}
              sx={{
                borderRadius: '12px',
                p: 2.25,
                border: '1px solid var(--dashboard-border-subtle, var(--border-color))',
                bgcolor: 'rgba(16, 24, 40, 0.01)',
                boxShadow: '0 1px 2px rgba(16, 24, 40, 0.04)',
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': { boxShadow: '0 10px 26px rgba(16, 24, 40, 0.10)', transform: 'translateY(-2px)' },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 3,
                  bgcolor: style.accent,
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: '12px',
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: style.iconBg,
                    border: '1px solid var(--dashboard-border-subtle, var(--border-color))',
                    flexShrink: 0,
                    mt: 0.25,
                  }}
                >
                  <Icon sx={{ fontSize: 18, color: style.text }} />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ color: 'var(--text-primary)', mb: 0.5, fontSize: '14px', fontWeight: 700, lineHeight: 1.25 }}>
                {insight.title}
                  </Typography>
                  <Typography sx={{ color: 'var(--text-secondary)', lineHeight: 1.55, fontSize: '13px' }}>
                {insight.body}
                  </Typography>
              {insight.cta && (
                <Typography
                  component="a"
                  href={insight.cta.anchor}
                  sx={{
                    color: 'var(--primary)',
                    mt: 1,
                    display: 'inline-block',
                    textDecoration: 'none',
                    fontSize: '13px',
                    fontWeight: 700,
                    transition: 'all 0.15s ease',
                    '&:hover': { color: 'var(--primary-dark)', textDecoration: 'underline' },
                  }}
                >
                  {insight.cta.label} →
                </Typography>
              )}
                </Box>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
