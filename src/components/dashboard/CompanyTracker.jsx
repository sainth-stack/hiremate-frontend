import {
  Box,
  Typography,
  Chip,
  Link as MuiLink,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
} from '@mui/material';
import { getCompanySignal } from '../../utils/dashboardUtils';
import SkeletonCard from './SkeletonCard';

function formatCompanyName(name) {
  if (!name) return 'Unknown';
  return String(name)
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const signalColorMap = {
  green: { bg: 'var(--success-bg)', text: 'var(--success)', border: 'var(--success)' },
  red: { bg: 'rgba(109, 40, 217, 0.10)', text: 'var(--primary)', border: 'rgba(109, 40, 217, 0.22)' },
  purple: { bg: 'rgba(37, 99, 235, 0.10)', text: 'var(--primary)', border: 'rgba(37, 99, 235, 0.22)' },
  amber: { bg: 'var(--warning-bg)', text: 'var(--warning)', border: 'var(--warning)' },
  gray: { bg: 'var(--grey-5)', text: 'var(--text-muted)', border: 'var(--border-color)' },
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

export default function CompanyTracker({ companiesViewed, jobs, loading }) {
  if (loading) return <SkeletonCard height={220} />;

  const cleanSignalLabel = (label) => {
    if (!label) return '—';
    return String(label).replace(/^[^A-Za-z0-9]+/g, '').trim() || '—';
  };

  const appliedCompanies = new Set(
    (jobs || [])
      .filter((j) => ['applied', 'interview', 'offer', 'closed'].includes(j.application_status || ''))
      .map((j) => (j.company || '').toLowerCase())
      .filter(Boolean)
  );

  const enriched = (companiesViewed || [])
    .map((cv) => {
      const hasApplied = appliedCompanies.has((cv.company_name || '').toLowerCase());
      const visitCount = cv.visit_count ?? 1;
      const lastVisit = cv.last_visited_at || cv.created_at || new Date().toISOString();
      const signal = getCompanySignal(visitCount, hasApplied, lastVisit);
      return { ...cv, hasApplied, signal };
    })
    .sort((a, b) => (a.signal?.priority ?? 4) - (b.signal?.priority ?? 4));

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
        Company Interest Tracker
      </Typography>

      {enriched.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center', fontSize: '0.875rem' }}>
          No companies tracked yet. Use the HireMate Chrome extension on career pages to track visits.
        </Typography>
      ) : (
        <TableContainer
          sx={{
            borderRadius: '12px',
            border: '1px solid var(--dashboard-border-subtle, var(--border-color))',
            overflowX: { xs: 'auto', md: 'hidden' },
            maxHeight: 360,
            '&::-webkit-scrollbar': { height: 10, width: 10 },
            '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(16, 24, 40, 0.16)', borderRadius: 999 },
            '&::-webkit-scrollbar-track': { backgroundColor: 'rgba(16, 24, 40, 0.04)' },
          }}
        >
          <Table size="small" stickyHeader sx={{ minWidth: 740 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: 'var(--bg-paper)' }}>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    fontSize: '11px',
                    letterSpacing: '0.08em',
                    borderColor: 'var(--dashboard-border-subtle, var(--border-color))',
                    py: 1.5,
                    bgcolor: 'var(--bg-paper)',
                  }}
                >
                  Company
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    fontSize: '11px',
                    letterSpacing: '0.08em',
                    borderColor: 'var(--dashboard-border-subtle, var(--border-color))',
                    py: 1.5,
                    bgcolor: 'var(--bg-paper)',
                  }}
                >
                  Visits
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    fontSize: '11px',
                    letterSpacing: '0.08em',
                    borderColor: 'var(--dashboard-border-subtle, var(--border-color))',
                    py: 1.5,
                    bgcolor: 'var(--bg-paper)',
                  }}
                >
                  Applied?
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    fontSize: '11px',
                    letterSpacing: '0.08em',
                    borderColor: 'var(--dashboard-border-subtle, var(--border-color))',
                    py: 1.5,
                    bgcolor: 'var(--bg-paper)',
                  }}
                >
                  Signal
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    fontSize: '11px',
                    letterSpacing: '0.08em',
                    borderColor: 'var(--dashboard-border-subtle, var(--border-color))',
                    py: 1.5,
                    bgcolor: 'var(--bg-paper)',
                  }}
                >
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {enriched.map((company, i) => {
                const sc = signalColorMap[company.signal?.color] || signalColorMap.gray;
                return (
                  <TableRow
                    key={i}
                    sx={{
                      height: 'var(--dashboard-row-min-height)',
                      bgcolor: i % 2 === 0 ? 'rgba(16, 24, 40, 0.015)' : 'transparent',
                      transition: 'background-color 0.15s ease',
                      '&:hover': { bgcolor: 'rgba(37, 99, 235, 0.04)' },
                    }}
                  >
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        borderColor: 'var(--dashboard-border-subtle, var(--border-color))',
                        py: 1.5,
                        color: 'var(--text-primary)',
                        fontSize: '14px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {formatCompanyName(company.company_name)}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        color: 'var(--text-secondary)',
                        borderColor: 'var(--dashboard-border-subtle, var(--border-color))',
                        py: 1.5,
                        fontSize: '13px',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {company.visit_count ?? 1}x
                    </TableCell>
                    <TableCell sx={{ borderColor: 'var(--dashboard-border-subtle, var(--border-color))', py: 1.5 }}>
                      {company.hasApplied ? (
                        <Typography component="span" sx={{ color: 'var(--success)', fontWeight: 600, fontSize: '13px' }}>
                          Yes
                        </Typography>
                      ) : (
                        <Typography component="span" sx={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                          —
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ borderColor: 'var(--dashboard-border-subtle, var(--border-color))', py: 1.5 }}>
                      <Chip
                        label={cleanSignalLabel(company.signal?.label)}
                        size="small"
                        sx={{
                          height: 26,
                          fontSize: '12px',
                          fontWeight: 700,
                          bgcolor: sc.bg,
                          color: sc.text,
                          border: '1px solid',
                          borderColor: sc.border,
                          borderRadius: '999px',
                          '& .MuiChip-label': { px: 1.25 },
                        }}
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ borderColor: 'var(--dashboard-border-subtle, var(--border-color))', py: 1.5 }}>
                      {!company.hasApplied && company.page_url && (
                        <MuiLink
                          href={company.page_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            fontSize: '13px',
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
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
