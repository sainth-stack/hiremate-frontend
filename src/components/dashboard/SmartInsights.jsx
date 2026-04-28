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
  streak: { accent: 'rgba(6, 182, 212, 0.55)', iconBg: 'rgba(6, 182, 212, 0.10)', text: '#06B6D4' },
  pattern: { accent: 'rgba(30, 58, 138, 0.55)', iconBg: 'rgba(30, 58, 138, 0.10)', text: 'var(--primary)' },
  coaching: { accent: 'rgba(30, 58, 138, 0.55)', iconBg: 'rgba(30, 58, 138, 0.10)', text: 'var(--primary)' },
  warning: { accent: 'rgba(6, 182, 212, 0.55)', iconBg: 'rgba(6, 182, 212, 0.10)', text: '#06B6D4' },
  positive: { accent: 'rgba(16, 185, 129, 0.55)', iconBg: 'rgba(16, 185, 129, 0.10)', text: 'var(--success)' },
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
  if (loading) return <SkeletonCard height={140} />;

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
          Insights & Recommendations
        </Typography>
        <Box
          sx={{
            borderRadius: '12px',
            border: '1px solid var(--dashboard-border-subtle, var(--border-color))',
            bgcolor: 'rgba(16, 24, 40, 0.01)',
            px: 2.5,
            py: 2.5,
            textAlign: 'center',
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '12px',
              mx: 'auto',
              mb: 1.25,
              bgcolor: 'rgba(37, 99, 235, 0.08)',
              border: '1px solid rgba(37, 99, 235, 0.12)',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <AutoAwesomeRoundedIcon sx={{ fontSize: 18, color: 'var(--primary)' }} />
          </Box>
          <Typography sx={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Start tracking to get personalized insights
          </Typography>
          <Typography sx={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.55, mt: 0.5 }}>
            Apply to jobs and track activity to see coaching tips here
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={cardBaseSx}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.75, gap: 2 }}>
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
          Insights & Recommendations
        </Typography>
        <Box
          sx={{
            px: 1.25,
            py: 0.5,
            borderRadius: '999px',
            bgcolor: 'rgba(37, 99, 235, 0.08)',
            border: '1px solid rgba(37, 99, 235, 0.12)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.75,
          }}
        >
          <AutoAwesomeRoundedIcon sx={{ fontSize: 14, color: 'var(--primary)' }} />
          <Typography sx={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 700, lineHeight: 1 }}>
            {insights.length}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(auto-fit, minmax(280px, 1fr))' }, gap: 2 }}>
        {insights.map((insight, i) => {
          const style = TYPE_STYLE[insight.type] || TYPE_STYLE.coaching;
          const Icon = TYPE_ICON[insight.type] || LightbulbRoundedIcon;
          return (
            <Box
              key={i}
              sx={{
                borderRadius: '12px',
                p: 2,
                border: '1px solid var(--dashboard-border-subtle, var(--border-color))',
                bgcolor: 'rgba(16, 24, 40, 0.01)',
                boxShadow: '0 1px 2px rgba(16, 24, 40, 0.04)',
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': { boxShadow: '0 8px 20px rgba(16, 24, 40, 0.08)', transform: 'translateY(-2px)' },
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
                    width: 32,
                    height: 32,
                    borderRadius: '10px',
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: style.iconBg,
                    border: '1px solid var(--dashboard-border-subtle, var(--border-color))',
                    flexShrink: 0,
                    mt: 0.125,
                  }}
                >
                  <Icon sx={{ fontSize: 17, color: style.text }} />
                </Box>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography sx={{ color: 'var(--text-primary)', mb: 0.5, fontSize: '13.5px', fontWeight: 700, lineHeight: 1.3 }}>
                    {insight.title}
                  </Typography>
                  <Typography sx={{ color: 'var(--text-secondary)', lineHeight: 1.5, fontSize: '13px' }}>
                    {insight.body}
                  </Typography>
                  {insight.cta && (
                    <Typography
                      component="a"
                      href={insight.cta.anchor}
                      sx={{
                        color: 'var(--primary)',
                        mt: 0.75,
                        display: 'inline-block',
                        textDecoration: 'none',
                        fontSize: '12.5px',
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
