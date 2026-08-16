import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Grid,
  Skeleton,
  LinearProgress,
  Avatar,
  Chip,
  Tabs,
  Tab,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import RocketLaunchRoundedIcon from '@mui/icons-material/RocketLaunchRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import HourglassTopRoundedIcon from '@mui/icons-material/HourglassTopRounded';
import PendingActionsRoundedIcon from '@mui/icons-material/PendingActionsRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import PageContainer from '../../components/common/PageContainer';
import { StatCard, SectionCard } from '../../components/admin';
import DifficultyChip from '../../components/admin/interview/DifficultyChip';
import AssigneeResultPanel, { StatusChip } from '../../components/admin/launch/AssigneeResultPanel';
import { getAdminLaunchDetailAPI, deleteAdminLaunchAPI } from '../../services';
import { parseApiError } from '../../utilities/apiErrorUtils';
import toast from 'react-hot-toast';

const FILTER_TABS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Not started' },
  { key: 'in_progress', label: 'In progress' },
  { key: 'completed', label: 'Completed' },
];

function getInitials(name, email) {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  if (email) return email.slice(0, 2).toUpperCase();
  return '?';
}

function avgScore(assignees) {
  const scores = (assignees || [])
    .filter((a) => a.status === 'completed' && a.score != null)
    .map((a) => a.score);
  if (!scores.length) return null;
  return Math.round(scores.reduce((s, v) => s + v, 0) / scores.length);
}

export default function LaunchCampaignDetailPage() {
  const { launchId } = useParams();
  const navigate = useNavigate();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAssigneeId, setSelectedAssigneeId] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!launchId) return;
    setLoading(true);
    setError(null);
    getAdminLaunchDetailAPI(launchId)
      .then((res) => {
        const data = res?.data || null;
        setDetail(data);
        if (data?.assignees?.length) {
          const firstCompleted = data.assignees.find((a) => a.status === 'completed');
          setSelectedAssigneeId((firstCompleted || data.assignees[0]).id);
        }
      })
      .catch((err) => setError(typeof err?.response?.data?.detail === 'string' ? err.response.data.detail : 'Failed to load campaign'))
      .finally(() => setLoading(false));
  }, [launchId]);

  const filteredAssignees = useMemo(() => {
    const list = detail?.assignees || [];
    if (statusFilter === 'all') return list;
    return list.filter((a) => a.status === statusFilter);
  }, [detail, statusFilter]);

  const selectedAssignee = useMemo(
    () => (detail?.assignees || []).find((a) => a.id === selectedAssigneeId) || null,
    [detail, selectedAssigneeId],
  );

  const completionPct = detail?.total_assignees
    ? Math.round((detail.completed_count / detail.total_assignees) * 100)
    : 0;

  const averageScore = avgScore(detail?.assignees);

  const handleDelete = () => {
    if (!launchId) return;
    setDeleting(true);
    deleteAdminLaunchAPI(launchId)
      .then(() => {
        toast.success('Launch campaign deleted');
        navigate('/admin/launch-interviews');
      })
      .catch((err) => toast.error(parseApiError(err, 'Failed to delete launch')))
      .finally(() => setDeleting(false));
  };

  return (
    <PageContainer sx={{ maxWidth: 1400, mx: 'auto', px: { xs: 2, sm: 3, md: 4 }, py: 4, bgcolor: 'var(--bg-light)' }}>
      <Button
        startIcon={<ArrowBackRoundedIcon sx={{ fontSize: 18 }} />}
        onClick={() => navigate('/admin/launch-interviews')}
        sx={{
          mb: 3,
          textTransform: 'none',
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--text-secondary)',
          pl: 0,
          '&:hover': { color: 'var(--primary)', bgcolor: 'transparent' },
        }}
      >
        Back to Launch Interviews
      </Button>

      {error && (
        <Paper elevation={0} sx={{ mb: 3, p: 2, borderRadius: '12px', bgcolor: 'var(--error-bg)', border: '1px solid rgba(220,38,38,0.2)' }}>
          <Typography sx={{ color: 'var(--error-dark)', fontSize: 13 }}>{error}</Typography>
        </Paper>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Skeleton variant="rectangular" height={140} sx={{ borderRadius: '16px' }} />
          <Grid container spacing={2.5}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Grid item xs={12} sm={6} md={2.4} key={i}>
                <Skeleton variant="rectangular" height={100} sx={{ borderRadius: '12px' }} />
              </Grid>
            ))}
          </Grid>
          <Skeleton variant="rectangular" height={420} sx={{ borderRadius: '12px' }} />
        </Box>
      ) : detail ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Campaign hero */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, md: 3 },
              borderRadius: '16px',
              border: '1px solid var(--border-color)',
              background: 'linear-gradient(135deg, var(--light-blue-bg-08) 0%, var(--bg-paper) 55%)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'var(--primary)',
                  color: '#fff',
                  boxShadow: '0 6px 20px rgba(37,99,235,0.28)',
                  flexShrink: 0,
                }}
              >
                <RocketLaunchRoundedIcon />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography component="h1" sx={{ fontSize: { xs: 22, md: 28 }, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                  {detail.launch_name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                  <AutoAwesomeRoundedIcon sx={{ fontSize: 16, color: 'var(--primary)' }} />
                  <Typography sx={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {detail.interview_title}
                  </Typography>
                  <DifficultyChip difficulty={detail.difficulty} />
                </Box>
                <Typography sx={{ fontSize: 13, color: 'var(--text-secondary)', mt: 1 }}>
                  Launched {new Date(detail.launched_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                  {' · '}
                  by {detail.launched_by_name || detail.launched_by_email || 'Admin'}
                </Typography>
              </Box>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteOutlineRoundedIcon />}
                onClick={() => setDeleteOpen(true)}
                sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '10px', flexShrink: 0 }}
              >
                Delete campaign
              </Button>
            </Box>

            {(detail.summary || detail.description) && (
              <Typography sx={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.65, mt: 2.5, maxWidth: 820 }}>
                {detail.summary || detail.description}
              </Typography>
            )}

            <Box sx={{ mt: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Campaign progress</Typography>
                <Typography sx={{ fontSize: 13, fontWeight: 800, color: 'var(--primary)' }}>{completionPct}% complete</Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={completionPct}
                sx={{ height: 8, borderRadius: 4, bgcolor: 'var(--grey-4)' }}
              />
              <Typography sx={{ fontSize: 12, color: 'var(--text-muted)', mt: 0.75 }}>
                {detail.completed_count} of {detail.total_assignees} candidates finished
              </Typography>
            </Box>
          </Paper>

          {/* Stats */}
          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6} md={2.4}>
              <StatCard icon={GroupsRoundedIcon} label="Total candidates" value={detail.total_assignees} accent />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <StatCard icon={CheckCircleRoundedIcon} label="Completed" value={detail.completed_count} sublabel="Submitted interviews" />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <StatCard icon={HourglassTopRoundedIcon} label="In progress" value={detail.in_progress_count} sublabel="Started, not submitted" />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <StatCard icon={PendingActionsRoundedIcon} label="Not started" value={detail.pending_count} sublabel="Awaiting candidate" />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <StatCard
                icon={TrendingUpRoundedIcon}
                label="Avg. score"
                value={averageScore != null ? `${averageScore}%` : '—'}
                sublabel={averageScore != null ? 'Among completed' : 'No submissions yet'}
              />
            </Grid>
          </Grid>

          {/* Candidates + results split */}
          <Grid container spacing={2.5}>
            <Grid item xs={12} lg={5}>
              <SectionCard
                title={`Candidates (${detail.assignees?.length || 0})`}
                sx={{ height: '100%', minHeight: 480 }}
              >
                <Tabs
                  value={statusFilter}
                  onChange={(_, v) => setStatusFilter(v)}
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{
                    mb: 2,
                    minHeight: 36,
                    '& .MuiTab-root': { textTransform: 'none', fontWeight: 700, fontSize: 13, minHeight: 36, py: 0.5 },
                  }}
                >
                  {FILTER_TABS.map((tab) => (
                    <Tab
                      key={tab.key}
                      value={tab.key}
                      label={tab.label}
                    />
                  ))}
                </Tabs>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: 520, overflowY: 'auto', pr: 0.5 }}>
                  {filteredAssignees.length === 0 ? (
                    <Typography sx={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', py: 4 }}>
                      No candidates in this filter.
                    </Typography>
                  ) : (
                    filteredAssignees.map((assignee) => {
                      const selected = selectedAssigneeId === assignee.id;
                      return (
                        <Box
                          key={assignee.id}
                          onClick={() => setSelectedAssigneeId(assignee.id)}
                          sx={{
                            p: 1.5,
                            borderRadius: '12px',
                            cursor: 'pointer',
                            border: `2px solid ${selected ? 'var(--primary)' : 'var(--border-color)'}`,
                            bgcolor: selected ? 'var(--light-blue-bg-04)' : 'var(--bg-paper)',
                            transition: 'all 0.15s',
                            '&:hover': { borderColor: 'var(--primary)' },
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar
                              sx={{
                                width: 36,
                                height: 36,
                                fontSize: 13,
                                bgcolor: 'var(--light-blue-bg-08)',
                                color: 'var(--primary)',
                              }}
                            >
                              {getInitials(assignee.user_name, assignee.user_email)}
                            </Avatar>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography sx={{ fontSize: 13, fontWeight: 700, lineHeight: 1.3 }}>
                                {assignee.user_name || assignee.user_email}
                              </Typography>
                              <Typography sx={{ fontSize: 11, color: 'var(--text-muted)' }}>{assignee.user_email}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                              <StatusChip status={assignee.status} />
                              {assignee.score != null && (
                                <Chip label={`${assignee.score}%`} size="small" sx={{ height: 20, fontSize: 10, fontWeight: 800, bgcolor: 'var(--primary)', color: '#fff' }} />
                              )}
                            </Box>
                          </Box>
                          {assignee.submitted_at && (
                            <Typography sx={{ fontSize: 11, color: 'var(--text-muted)', mt: 1, pl: 6.5 }}>
                              Submitted {new Date(assignee.submitted_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                            </Typography>
                          )}
                        </Box>
                      );
                    })
                  )}
                </Box>
              </SectionCard>
            </Grid>

            <Grid item xs={12} lg={7}>
              <SectionCard
                title="Results & transcript"
                sx={{ height: '100%', minHeight: 480 }}
              >
                {!selectedAssignee ? (
                  <Box sx={{ py: 6, textAlign: 'center' }}>
                    <Typography sx={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>
                      Select a candidate to view their interview results
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', mb: 2.5, pb: 2, borderBottom: '1px solid var(--divider)' }}>
                      <Box>
                        <Typography sx={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>
                          {selectedAssignee.user_name || selectedAssignee.user_email}
                        </Typography>
                        <Typography sx={{ fontSize: 12, color: 'var(--text-muted)' }}>{selectedAssignee.user_email}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <StatusChip status={selectedAssignee.status} />
                        {selectedAssignee.score != null && (
                          <Chip label={`Score ${selectedAssignee.score}%`} sx={{ fontWeight: 800, bgcolor: 'var(--primary)', color: '#fff' }} />
                        )}
                      </Box>
                    </Box>
                    <AssigneeResultPanel assignee={selectedAssignee} interviewId={detail.interview_id} />
                  </Box>
                )}
              </SectionCard>
            </Grid>
          </Grid>

          <Typography sx={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
            Interview template from{' '}
            <Typography
              component={RouterLink}
              to="/admin/interview-creation"
              sx={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}
            >
              Interview Studio
            </Typography>
          </Typography>
        </Box>
      ) : null}

      <Dialog open={deleteOpen} onClose={() => !deleting && setDeleteOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete launch campaign?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
            Delete <strong>{detail?.launch_name}</strong>? This removes all candidate assignments and results. This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => setDeleteOpen(false)} disabled={deleting} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : <DeleteOutlineRoundedIcon />}
            sx={{ textTransform: 'none', boxShadow: 'none' }}
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}
