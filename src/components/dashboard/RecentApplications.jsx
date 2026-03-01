import { Box, Typography, Link as MuiLink } from '@mui/material';
import SkeletonCard from './SkeletonCard';

const STATUS_BADGE = {
  applied: { label: 'Applied', bg: 'rgba(37, 99, 235, 0.10)', text: 'var(--primary)', border: 'rgba(37, 99, 235, 0.18)' },
  interview: { label: 'Interview', bg: 'rgba(34, 197, 94, 0.10)', text: 'var(--success)', border: 'rgba(34, 197, 94, 0.18)' },
  offer: { label: 'Offer', bg: 'rgba(245, 158, 11, 0.10)', text: 'var(--warning)', border: 'rgba(245, 158, 11, 0.18)' },
  closed: { label: 'Closed', bg: 'rgba(16, 24, 40, 0.04)', text: 'var(--text-muted)', border: 'rgba(16, 24, 40, 0.10)' },
  saved: { label: 'Saved', bg: 'rgba(109, 40, 217, 0.10)', text: 'var(--primary)', border: 'rgba(109, 40, 217, 0.18)' },
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

export default function RecentApplications({ applications, loading }) {
  if (loading) return <SkeletonCard height={280} />;

  return (
    <Box sx={cardBaseSx}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
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
          Recent Applications
        </Typography>
        <MuiLink
          href="/application-tracker"
          sx={{
            fontSize: '13px',
            fontWeight: 700,
            color: 'var(--primary)',
            textDecoration: 'none',
            transition: 'all 0.15s ease',
            '&:hover': { color: 'var(--primary-dark)', textDecoration: 'underline' },
          }}
        >
          View all →
        </MuiLink>
      </Box>

      {(!applications || applications.length === 0) ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center', fontSize: '0.875rem' }}>
          No applications yet. Start applying!
        </Typography>
      ) : (
        <Box
          sx={{
            maxHeight: 320,
            overflowY: 'auto',
            borderRadius: '12px',
            border: '1px solid var(--dashboard-border-subtle, var(--border-color))',
            bgcolor: 'rgba(16, 24, 40, 0.01)',
          }}
        >
          {applications.map((app) => {
            const status = app.application_status || 'applied';
            const badge = STATUS_BADGE[status] || STATUS_BADGE.applied;
            return (
              <Box
                key={app.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1.5,
                  px: 2,
                  py: 1.5,
                  minHeight: 'var(--dashboard-row-min-height)',
                  borderBottom: '1px solid var(--dashboard-border-subtle, var(--border-color))',
                  transition: 'background-color 0.15s ease',
                  '&:hover': { bgcolor: 'rgba(37, 99, 235, 0.04)' },
                  '&:last-of-type': { borderBottom: 'none' },
                }}
              >
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    sx={{
                      color: 'var(--text-primary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontSize: '14px',
                    }}
                  >
                    {app.title || 'Untitled'}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: 'block',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontSize: '13px',
                      mt: 'var(--dashboard-label-gap)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {app.company || '—'} · {app.location || '—'}
                  </Typography>
                  {app.job_posting_url && (
                    <MuiLink
                      href={app.job_posting_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        fontSize: '13px',
                        mt: 0.75,
                        display: 'inline-block',
                        fontWeight: 700,
                        color: 'var(--primary)',
                        textDecoration: 'none',
                        transition: 'all 0.15s ease',
                        '&:hover': { color: 'var(--primary-dark)', textDecoration: 'underline' },
                      }}
                    >
                      View →
                    </MuiLink>
                  )}
                </Box>
                <Box
                  sx={{
                    height: 26,
                    px: 1.25,
                    borderRadius: '999px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    flexShrink: 0,
                    bgcolor: badge.bg,
                    color: badge.text,
                    border: '1px solid',
                    borderColor: badge.border,
                    fontSize: '12px',
                    lineHeight: 1,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {badge.label}
                </Box>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
