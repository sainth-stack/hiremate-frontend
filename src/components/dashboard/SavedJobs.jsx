import { Box, Typography, Link as MuiLink } from '@mui/material';
import { getAgeBadge } from '../../utils/dashboardUtils';
import SkeletonCard from './SkeletonCard';

const badgeStyle = {
  green: { bg: 'rgba(34, 197, 94, 0.10)', text: 'var(--success)', border: 'rgba(34, 197, 94, 0.18)' },
  amber: { bg: 'rgba(245, 158, 11, 0.10)', text: 'var(--warning)', border: 'rgba(245, 158, 11, 0.18)' },
  red: { bg: 'rgba(37, 99, 235, 0.10)', text: 'var(--primary)', border: 'rgba(37, 99, 235, 0.18)' },
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

export default function SavedJobs({ jobs, loading }) {
  if (loading) return <SkeletonCard height={280} />;

  const savedJobs = (jobs || [])
    .filter((j) => (j.application_status || 'saved') === 'saved')
    .map((j) => ({ ...j, ageBadge: getAgeBadge(j.created_at) }))
    .sort((a, b) => (b.ageBadge?.days ?? 0) - (a.ageBadge?.days ?? 0));

  const staleCount = savedJobs.filter((j) => j.ageBadge?.color === 'red').length;

  return (
    <Box id="saved-jobs" sx={cardBaseSx}>
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
          Saved Jobs
        </Typography>
        <Typography sx={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 600 }}>
          {savedJobs.length} jobs
        </Typography>
      </Box>

      {savedJobs.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center', fontSize: '0.875rem' }}>
          No saved jobs yet.
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
          {savedJobs.map((job) => {
            const style = badgeStyle[job.ageBadge?.color] || badgeStyle.green;
            return (
              <Box
                key={job.id}
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
                    {job.position_title || 'Unknown Role'}
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
                    {job.company || '—'} · {job.location || '—'}
                  </Typography>
                  {job.job_posting_url && (
                    <MuiLink
                      href={job.job_posting_url}
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
                      View job →
                    </MuiLink>
                  )}
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}>
                  <Box
                    sx={{
                      height: 26,
                      px: 1.25,
                      borderRadius: '999px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.75,
                      fontWeight: 700,
                      bgcolor: style.bg,
                      color: style.text,
                      border: '1px solid',
                      borderColor: style.border,
                      fontSize: '12px',
                      lineHeight: 1,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <Box
                      component="span"
                      sx={{
                        width: 7,
                        height: 7,
                        borderRadius: '999px',
                        bgcolor: style.text,
                        opacity: 0.9,
                        boxShadow: '0 0 0 2px rgba(255, 255, 255, 0.6)',
                      }}
                    />
                    {job.ageBadge?.label || 'Fresh'}
                  </Box>
                  <Typography sx={{ mt: 0.75, fontSize: '12px', color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                    {job.ageBadge?.days ?? 0}d ago
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      )}

      {staleCount > 0 && (
        <Box
          sx={{
            mt: 2,
            px: 2,
            py: 1.25,
            borderRadius: '12px',
            bgcolor: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.16)',
            color: 'var(--text-primary)',
            textAlign: 'center',
          }}
        >
          <Typography sx={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, fontWeight: 600 }}>
            {staleCount} saved job{staleCount > 1 ? 's' : ''} look stale. Consider reviewing them soon.
          </Typography>
        </Box>
      )}
    </Box>
  );
}
