import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import TimerRoundedIcon from '@mui/icons-material/TimerRounded';
import PageContainer from '../../components/common/PageContainer';
import { EmptyState, TableRowsSkeleton } from '../../components/admin';
import { getAdminIngestionRunsAPI } from '../../services';

const headSx = {
  fontWeight: 700,
  fontSize: 12,
  color: 'var(--text-muted)',
  bgcolor: 'var(--bg-light)',
  borderBottom: '2px solid var(--divider)',
  py: 1.5,
  textTransform: 'uppercase',
  letterSpacing: 0.5,
};

function StatCard({ label, value, icon: Icon, accent = false }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2.5,
        border: '1px solid var(--divider)',
        bgcolor: 'var(--bg-paper)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: 1.5,
            display: 'grid',
            placeItems: 'center',
            bgcolor: accent ? 'rgba(37,99,235,0.12)' : 'rgba(100,116,139,0.12)',
            color: accent ? 'var(--primary)' : 'var(--text-secondary)',
          }}
        >
          <Icon sx={{ fontSize: 18 }} />
        </Box>
        <Box>
          <Typography sx={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
            {label}
          </Typography>
          <Typography sx={{ fontSize: 20, color: 'var(--text-primary)', fontWeight: 700 }}>
            {value ?? 0}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

export default function AdminIngestionRuns() {
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [total, setTotal] = useState(0);

  const fetchRuns = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        ...(source && { source }),
        ...(success !== '' && { success: success === 'true' }),
      };
      const { data } = await getAdminIngestionRunsAPI(params);
      setRows(data?.items || []);
      setSummary(data?.summary || null);
      setTotal(data?.total || 0);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, source, success]);

  useEffect(() => {
    fetchRuns();
  }, [fetchRuns]);

  useEffect(() => {
    const id = setInterval(() => {
      fetchRuns();
    }, 20000);
    return () => clearInterval(id);
  }, [fetchRuns]);

  const sourceOptions = useMemo(() => {
    const set = new Set(rows.map((r) => r.source).filter(Boolean));
    return Array.from(set).sort();
  }, [rows]);

  return (
    <PageContainer title="Ingestion Analytics" subtitle="Portal-wise ingestion stats for every run">
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
        <StatCard label="Runs" value={summary?.runs || 0} icon={InsightsRoundedIcon} accent />
        <StatCard label="Jobs Seen" value={summary?.total_jobs_seen || 0} icon={StorageRoundedIcon} />
        <StatCard label="Inserted" value={summary?.inserted || 0} icon={CheckCircleRoundedIcon} />
        <StatCard label="Errors" value={summary?.errors || 0} icon={ErrorOutlineRoundedIcon} />
      </Box>

      <Paper
        elevation={0}
        sx={{
          border: '1px solid var(--divider)',
          borderRadius: 2.5,
          p: 2.5,
          mb: 3,
          bgcolor: 'var(--bg-paper)',
          display: 'flex',
          gap: 2,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Source</InputLabel>
          <Select
            value={source}
            label="Source"
            onChange={(e) => {
              setSource(e.target.value);
              setPage(0);
            }}
          >
            <MenuItem value="">All Sources</MenuItem>
            {sourceOptions.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={success}
            label="Status"
            onChange={(e) => {
              setSuccess(e.target.value);
              setPage(0);
            }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="true">Success</MenuItem>
            <MenuItem value="false">Failed</MenuItem>
          </Select>
        </FormControl>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          border: '1px solid var(--divider)',
          borderRadius: 2.5,
          overflow: 'hidden',
          boxShadow: 'var(--dashboard-card-shadow)',
        }}
      >
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                {['Run', 'Started', 'Source', 'Portal Breakdown', 'Seen', 'Inserted', 'Updated', 'Skipped', 'Errors', 'Duration'].map((h) => (
                  <TableCell key={h} sx={headSx}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRowsSkeleton rows={8} cols={10} />
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} sx={{ py: 8 }}>
                    <EmptyState
                      icon={<InsightsRoundedIcon sx={{ fontSize: 48, color: 'var(--text-muted)' }} />}
                      message="No ingestion runs found"
                    />
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((r) => (
                  <TableRow key={r.id} hover>
                    <TableCell sx={{ fontWeight: 700, color: 'var(--text-secondary)' }}>#{r.id}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', fontSize: 12, color: 'var(--text-secondary)' }}>
                      {r.started_at ? new Date(r.started_at).toLocaleString() : '—'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={r.source}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: 11, fontWeight: 600, height: 24 }}
                      />
                    </TableCell>
                    <TableCell sx={{ minWidth: 260 }}>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                        {(r.portal_breakdown || []).slice(0, 4).map((p) => (
                          <Chip
                            key={`${r.id}-${p.portal}`}
                            label={`${p.portal}: ${p.fetched_jobs}`}
                            size="small"
                            sx={{ fontSize: 11, height: 22 }}
                          />
                        ))}
                        {(r.portal_breakdown || []).length === 0 && (
                          <Typography sx={{ fontSize: 12, color: 'var(--text-muted)' }}>—</Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      {(r.total_jobs_seen || 0).toLocaleString()}
                    </TableCell>
                    <TableCell sx={{ color: 'success.main', fontWeight: 700 }}>
                      {(r.inserted || 0).toLocaleString()}
                    </TableCell>
                    <TableCell sx={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                      {(r.updated || 0).toLocaleString()}
                    </TableCell>
                    <TableCell sx={{ color: 'var(--text-secondary)' }}>
                      {(r.skipped || 0).toLocaleString()}
                    </TableCell>
                    <TableCell sx={{ color: (r.errors || 0) > 0 ? 'error.main' : 'var(--text-secondary)', fontWeight: 700 }}>
                      {(r.errors || 0).toLocaleString()}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <TimerRoundedIcon sx={{ fontSize: 14, color: 'var(--text-muted)' }} />
                        {r.duration_seconds != null ? `${r.duration_seconds}s` : '—'}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={total}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(_, p) => setPage(p)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 20, 50]}
          sx={{
            borderTop: '1px solid var(--divider)',
            bgcolor: 'var(--bg-light)',
            '& .MuiTablePagination-toolbar': { minHeight: 52 },
          }}
        />
      </Paper>
    </PageContainer>
  );
}
