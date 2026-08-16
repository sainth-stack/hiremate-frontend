import { useState, useEffect, useCallback } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  LinearProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Checkbox,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RocketLaunchRoundedIcon from '@mui/icons-material/RocketLaunchRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import PageContainer from '../../components/common/PageContainer';
import { EmptyState, TableRowsSkeleton } from '../../components/admin';
import DifficultyChip from '../../components/admin/interview/DifficultyChip';
import NewLaunchWizardDialog from './NewLaunchWizardDialog';
import { getAdminLaunchesAPI, deleteAdminLaunchAPI } from '../../services';
import { parseApiError } from '../../utilities/apiErrorUtils';
import toast from 'react-hot-toast';

const headSx = {
  fontWeight: 700,
  fontSize: 12,
  bgcolor: 'var(--grey-4)',
  color: 'var(--text-secondary)',
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  py: 1.5,
  borderBottom: '1px solid var(--border-color)',
};

export default function LaunchInterviews() {
  const navigate = useNavigate();
  const [launches, setLaunches] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [wizardOpen, setWizardOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [deleting, setDeleting] = useState(false);

  const selectedCount = selectedIds.size;
  const allPageSelected = launches.length > 0 && launches.every((launch) => selectedIds.has(launch.id));
  const somePageSelected = launches.some((launch) => selectedIds.has(launch.id)) && !allPageSelected;

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAllPage = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allPageSelected) {
        launches.forEach((launch) => next.delete(launch.id));
      } else {
        launches.forEach((launch) => next.add(launch.id));
      }
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const openCampaign = (id) => navigate(`/admin/launch-interviews/${id}`);

  const fetchLaunches = useCallback(() => {
    setLoading(true);
    setError(null);
    getAdminLaunchesAPI({ page, limit })
      .then((res) => {
        setLaunches(res?.data?.launches || []);
        setTotal(res?.data?.total || 0);
      })
      .catch((err) => {
        setError(parseApiError(err, 'Failed to load launches'));
        setLaunches([]);
      })
      .finally(() => setLoading(false));
  }, [page, limit]);

  useEffect(() => {
    fetchLaunches();
  }, [fetchLaunches]);

  useEffect(() => {
    clearSelection();
  }, [page]);

  const handleLaunched = () => {
    toast.success('Interview campaign launched successfully');
    setPage(1);
    fetchLaunches();
  };

  const handleDeleteLaunch = () => {
    if (!deleteTarget) return;
    setDeleting(true);
    deleteAdminLaunchAPI(deleteTarget.id)
      .then(() => {
        toast.success('Launch campaign deleted');
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(deleteTarget.id);
          return next;
        });
        setDeleteTarget(null);
        fetchLaunches();
      })
      .catch((err) => {
        toast.error(parseApiError(err, 'Failed to delete launch'));
      })
      .finally(() => setDeleting(false));
  };

  const handleBulkDeleteLaunches = async () => {
    const ids = Array.from(selectedIds);
    if (!ids.length) return;

    setDeleting(true);
    const results = await Promise.allSettled(ids.map((id) => deleteAdminLaunchAPI(id)));
    const failed = results.filter((result) => result.status === 'rejected').length;
    const succeeded = ids.length - failed;

    if (succeeded > 0) {
      toast.success(`Deleted ${succeeded} launch${succeeded === 1 ? '' : 'es'}`);
      clearSelection();
      fetchLaunches();
    }
    if (failed > 0) {
      toast.error(`Failed to delete ${failed} launch${failed === 1 ? '' : 'es'}`);
    }

    setBulkDeleteOpen(false);
    setDeleting(false);
  };

  return (
    <PageContainer sx={{ maxWidth: 1400, mx: 'auto', px: { xs: 2, sm: 3, md: 4 }, py: 4, bgcolor: 'var(--bg-light)' }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', mb: 3 }}>
        <Box>
          <Typography component="h1" sx={{ fontSize: { xs: 22, md: 28 }, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Launch Interviews
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mt: 0.5, fontSize: 14, maxWidth: 560 }}>
            Track every campaign, candidate status, transcripts, and evaluation results — then launch new sessions in a few clicks.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={() => setWizardOpen(true)}
          sx={{
            textTransform: 'none',
            fontWeight: 700,
            borderRadius: '12px',
            px: 2.5,
            py: 1.1,
            boxShadow: '0 8px 24px rgba(37, 99, 235, 0.28)',
          }}
        >
          New launch
        </Button>
      </Box>

      {error && (
        <Paper elevation={0} sx={{ mb: 3, p: 2, borderRadius: '12px', bgcolor: 'var(--error-bg)', border: '1px solid rgba(220,38,38,0.2)' }}>
          <Typography sx={{ color: 'var(--error-dark)', fontSize: 13 }}>{error}</Typography>
        </Paper>
      )}

      <Paper elevation={0} sx={{ borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
        <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid var(--divider)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
          <Typography sx={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>All launches</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            {selectedCount > 0 && (
              <>
                <Chip label={`${selectedCount} selected`} size="small" sx={{ fontWeight: 700, bgcolor: 'var(--light-blue-bg-08)', color: 'var(--primary)' }} />
                <Button
                  size="small"
                  color="error"
                  startIcon={<DeleteOutlineRoundedIcon />}
                  onClick={() => setBulkDeleteOpen(true)}
                  sx={{ textTransform: 'none', fontWeight: 700 }}
                >
                  Delete selected
                </Button>
                <Button size="small" onClick={clearSelection} sx={{ textTransform: 'none' }}>
                  Clear
                </Button>
              </>
            )}
            <Chip label={`${total} total`} size="small" sx={{ fontWeight: 700, bgcolor: 'var(--light-blue-bg-08)', color: 'var(--primary)' }} />
          </Box>
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ ...headSx, width: 48, px: 1 }}>
                  <Checkbox
                    size="small"
                    checked={allPageSelected}
                    indeterminate={somePageSelected}
                    onChange={toggleSelectAllPage}
                    disabled={loading || launches.length === 0}
                  />
                </TableCell>
                <TableCell sx={headSx}>Campaign</TableCell>
                <TableCell sx={headSx}>Interview template</TableCell>
                <TableCell sx={headSx}>Launched</TableCell>
                <TableCell sx={headSx}>Progress</TableCell>
                <TableCell sx={headSx} align="center">Completed</TableCell>
                <TableCell sx={headSx} align="center">In progress</TableCell>
                <TableCell sx={headSx} align="center">Pending</TableCell>
                <TableCell sx={headSx} width={96} />
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRowsSkeleton rows={6} cols={9} />
              ) : launches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} sx={{ border: 'none' }}>
                    <EmptyState
                      icon={InboxOutlinedIcon}
                      title="No launches yet"
                      description="Create your first campaign — name it, pick an interview template, and assign candidates."
                      action={
                        <Button variant="contained" startIcon={<RocketLaunchRoundedIcon />} onClick={() => setWizardOpen(true)} sx={{ textTransform: 'none', fontWeight: 700, mt: 1 }}>
                          New launch
                        </Button>
                      }
                    />
                  </TableCell>
                </TableRow>
              ) : (
                launches.map((launch) => {
                  const pct = launch.total_assignees
                    ? Math.round((launch.completed_count / launch.total_assignees) * 100)
                    : 0;
                  const isSelected = selectedIds.has(launch.id);
                  return (
                    <TableRow
                      key={launch.id}
                      hover
                      selected={isSelected}
                      sx={{ cursor: 'pointer', '& td': { borderBottom: '1px solid var(--divider)', py: 1.75 } }}
                      onClick={() => openCampaign(launch.id)}
                    >
                      <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          size="small"
                          checked={isSelected}
                          onChange={() => toggleSelect(launch.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{launch.launch_name}</Typography>
                        <Typography sx={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          by {launch.launched_by_name || launch.launched_by_email || 'Admin'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
                          <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{launch.interview_title}</Typography>
                          <DifficultyChip difficulty={launch.difficulty} />
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                        {new Date(launch.launched_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </TableCell>
                      <TableCell sx={{ minWidth: 140 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={pct}
                            sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: 'var(--grey-4)' }}
                          />
                          <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', minWidth: 32 }}>{pct}%</Typography>
                        </Box>
                        <Typography sx={{ fontSize: 11, color: 'var(--text-muted)', mt: 0.5 }}>
                          {launch.total_assignees} candidate{launch.total_assignees === 1 ? '' : 's'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={launch.completed_count} size="small" sx={{ fontWeight: 800, bgcolor: 'var(--success-bg)', color: 'var(--success-dark)' }} />
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={launch.in_progress_count} size="small" sx={{ fontWeight: 800, bgcolor: 'var(--light-blue-bg-08)', color: 'var(--primary)' }} />
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={launch.pending_count} size="small" sx={{ fontWeight: 800 }} />
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Box sx={{ display: 'flex', gap: 0.25 }}>
                          <IconButton size="small" title="View details" onClick={() => openCampaign(launch.id)}>
                            <VisibilityRoundedIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            title="Delete launch"
                            onClick={() => setDeleteTarget(launch)}
                            sx={{ color: 'var(--error)' }}
                          >
                            <DeleteOutlineRoundedIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {!loading && launches.length > 0 && (
          <TablePagination
            component="div"
            count={total}
            page={page - 1}
            onPageChange={(_, p) => setPage(p + 1)}
            rowsPerPage={limit}
            rowsPerPageOptions={[limit]}
          />
        )}
      </Paper>

      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography sx={{ fontSize: 12, color: 'var(--text-muted)' }}>
          Need a new template?{' '}
          <Typography component={RouterLink} to="/admin/interview-creation" sx={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
            Go to Interview Studio
          </Typography>
        </Typography>
      </Box>

      <NewLaunchWizardDialog
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onLaunched={handleLaunched}
      />

      <Dialog open={Boolean(deleteTarget)} onClose={() => !deleting && setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete launch campaign?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
            Delete <strong>{deleteTarget?.launch_name}</strong>? This removes all candidate assignments and results for this campaign. This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleting} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteLaunch}
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : <DeleteOutlineRoundedIcon />}
            sx={{ textTransform: 'none', boxShadow: 'none' }}
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={bulkDeleteOpen} onClose={() => !deleting && setBulkDeleteOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete {selectedCount} launch{selectedCount === 1 ? '' : 'es'}?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
            This removes all selected campaigns, candidate assignments, and results. This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => setBulkDeleteOpen(false)} disabled={deleting} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleBulkDeleteLaunches}
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : <DeleteOutlineRoundedIcon />}
            sx={{ textTransform: 'none', boxShadow: 'none' }}
          >
            {deleting ? 'Deleting…' : `Delete ${selectedCount}`}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}
