import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import RocketLaunchRoundedIcon from '@mui/icons-material/RocketLaunchRounded';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import PageContainer from '../../components/common/PageContainer';
import { EmptyState, TableRowsSkeleton } from '../../components/admin';
import {
  getAdminInterviewRequestsAPI,
  launchInterviewFromRequestAPI,
} from '../../services/adminInterviewService';
import { getAdminInterviewsAPI } from '../../services';
import { parseApiError } from '../../utilities/apiErrorUtils';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  requested: { label: 'Requested', color: 'warning' },
  pending: { label: 'Pending', color: 'info' },
  in_progress: { label: 'In Progress', color: 'info' },
  completed: { label: 'Completed', color: 'success' },
  cancelled: { label: 'Cancelled', color: 'default' },
};

const tableCellHeadSx = {
  fontWeight: 700,
  fontSize: 12,
  color: 'var(--text-muted)',
  bgcolor: 'var(--bg-light)',
  borderBottom: '2px solid var(--divider)',
  py: 1.5,
  textTransform: 'uppercase',
  letterSpacing: 0.5,
};

function normalizeRequest(row) {
  return {
    id: row.id,
    domain: row.domain || row.title || '—',
    title: row.title || row.domain || '—',
    description: row.description || '',
    status: String(row.status || 'requested').toLowerCase(),
    createdAt: row.created_at,
    launchedAt: row.launched_at,
    completedAt: row.completed_at,
    userId: row.user_id,
    userEmail: row.user_email || row.email || row.user?.email || '—',
    userName: [row.user?.first_name, row.user?.last_name].filter(Boolean).join(' ') || row.user_name || '',
    interviewId: row.interview_id,
    interviewUrl: row.interview_url,
    score: row.score ?? row.final_score,
  };
}

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function RequestDetailDialog({ request, onClose }) {
  if (!request) return null;
  const status = STATUS_CONFIG[request.status] || STATUS_CONFIG.requested;

  return (
    <Dialog open={Boolean(request)} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Typography sx={{ fontWeight: 800, fontSize: 18 }}>{request.domain}</Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          <Chip label={status.label} color={status.color} size="small" sx={{ fontWeight: 700 }} />
          <Chip icon={<EmailRoundedIcon sx={{ fontSize: 16 }} />} label={request.userEmail} size="small" variant="outlined" />
        </Box>
        {request.userName && (
          <Typography sx={{ fontSize: 13, color: 'var(--text-secondary)', mb: 2 }}>
            Requested by: <strong>{request.userName}</strong>
          </Typography>
        )}
        <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', mb: 0.75 }}>
          Description
        </Typography>
        <Typography sx={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.7, whiteSpace: 'pre-wrap', mb: 2 }}>
          {request.description || 'No description provided.'}
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
          <Box>
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Created</Typography>
            <Typography sx={{ fontSize: 13 }}>{formatDate(request.createdAt)}</Typography>
          </Box>
          {request.launchedAt && (
            <Box>
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Sent</Typography>
              <Typography sx={{ fontSize: 13 }}>{formatDate(request.launchedAt)}</Typography>
            </Box>
          )}
          {request.completedAt && (
            <Box>
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Completed</Typography>
              <Typography sx={{ fontSize: 13 }}>{formatDate(request.completedAt)}</Typography>
            </Box>
          )}
          {request.score != null && (
            <Box>
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Score</Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'var(--success-dark)' }}>{Math.round(request.score)}%</Typography>
            </Box>
          )}
        </Box>
        {request.interviewUrl && (
          <Typography sx={{ fontSize: 12, color: 'var(--text-secondary)', mt: 2, wordBreak: 'break-all' }}>
            Interview link: {request.interviewUrl}
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none' }}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

function SendInterviewDialog({ request, interviews, onClose, onSent }) {
  const [selectedId, setSelectedId] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (interviews?.length === 1) {
      setSelectedId(String(interviews[0].id));
    } else {
      setSelectedId('');
    }
  }, [request?.id, interviews]);

  if (!request) return null;

  const selected = interviews.find((i) => String(i.id) === String(selectedId));

  const handleSend = () => {
    if (!selected) return;
    setSending(true);
    launchInterviewFromRequestAPI(request.id, {
      interview_id: selected.id,
      title: selected.title,
      difficulty: selected.difficulty,
      description: selected.description,
      created_at: selected.created_at,
      user_id: request.userId,
      user_email: request.userEmail,
    })
      .then((res) => {
        toast.success(`Interview sent to ${request.userEmail}.`);
        onSent(res?.data);
        onClose();
      })
      .catch((err) => toast.error(parseApiError(err, 'Failed to send interview')))
      .finally(() => setSending(false));
  };

  return (
    <Dialog open={Boolean(request)} onClose={() => !sending && onClose()} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Typography sx={{ fontWeight: 800, fontSize: 18 }}>Send Interview</Typography>
        <IconButton size="small" onClick={onClose} disabled={sending}>
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Typography sx={{ fontSize: 13, color: 'var(--text-secondary)', mb: 2 }}>
          Send an interview template to <strong>{request.userEmail}</strong> for domain: <strong>{request.domain}</strong>.
          The user will receive an email and see it in their Admin Interviews tab.
        </Typography>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="interview-template-label">Interview template</InputLabel>
          <Select
            labelId="interview-template-label"
            label="Interview template"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            disabled={sending || !interviews?.length}
          >
            {interviews.map((item) => (
              <MenuItem key={item.id} value={String(item.id)}>
                {item.title} ({item.difficulty})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {!interviews?.length && (
          <Typography sx={{ fontSize: 13, color: 'var(--warning-dark)' }}>
            No interview templates found. Create one under Interview Creation first.
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} disabled={sending} sx={{ textTransform: 'none' }}>Cancel</Button>
        <Button
          variant="contained"
          disableElevation
          disabled={!selected || sending}
          onClick={handleSend}
          startIcon={sending ? <CircularProgress size={16} color="inherit" /> : <RocketLaunchRoundedIcon />}
          sx={{ textTransform: 'none', fontWeight: 700 }}
        >
          {sending ? 'Sending…' : 'Send Interview'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function RequestedInterviews() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [detailRequest, setDetailRequest] = useState(null);
  const [sendRequest, setSendRequest] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [interviewsLoading, setInterviewsLoading] = useState(false);

  const fetchRequests = useCallback(() => {
    setLoading(true);
    setError(null);
    getAdminInterviewRequestsAPI(statusFilter ? { status: statusFilter } : {})
      .then((res) => {
        const list = res?.data?.requests || res?.data?.items || res?.data || [];
        setRequests((Array.isArray(list) ? list : []).map(normalizeRequest));
      })
      .catch((err) => setError(parseApiError(err, 'Failed to load interview requests')))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  useEffect(() => {
    if (!sendRequest) return;
    setInterviewsLoading(true);
    getAdminInterviewsAPI()
      .then((res) => setInterviews(res?.data?.interviews || []))
      .catch(() => setInterviews([]))
      .finally(() => setInterviewsLoading(false));
  }, [sendRequest]);

  const handleSent = () => {
    fetchRequests();
  };

  return (
    <PageContainer sx={{ maxWidth: 1400, mx: 'auto', px: { xs: 2, sm: 3, md: 4 }, py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 3, pb: 3, borderBottom: '1px solid var(--divider)' }}>
        <Box>
          <Typography component="h1" sx={{ fontSize: { xs: 22, md: 28 }, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Requested Interviews
          </Typography>
          <Typography sx={{ fontSize: 14, color: 'var(--text-secondary)', mt: 0.5, maxWidth: 560 }}>
            Review user interview requests by domain and description. Send an interview template — the user gets an email and sees it in Admin Interviews.
          </Typography>
        </Box>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="status-filter-label">Status</InputLabel>
          <Select
            labelId="status-filter-label"
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="requested">Requested</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="in_progress">In Progress</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {error && (
        <Box sx={{ p: 2, mb: 2, borderRadius: 2, bgcolor: 'var(--error-bg)' }}>
          <Typography sx={{ color: 'var(--error-dark)', fontSize: 14 }}>{error}</Typography>
        </Box>
      )}

      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid var(--border-color)', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={tableCellHeadSx}>Domain</TableCell>
                <TableCell sx={tableCellHeadSx}>User</TableCell>
                <TableCell sx={tableCellHeadSx}>Description</TableCell>
                <TableCell sx={tableCellHeadSx}>Status</TableCell>
                <TableCell sx={tableCellHeadSx}>Created</TableCell>
                <TableCell sx={tableCellHeadSx} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && <TableRowsSkeleton columns={6} rows={6} />}
              {!loading && requests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} sx={{ border: 0, py: 0 }}>
                    <EmptyState
                      icon={InboxOutlinedIcon}
                      title="No interview requests"
                      description="When users request interviews from Interview Practice → Admin Interviews, they will appear here."
                    />
                  </TableCell>
                </TableRow>
              )}
              {!loading && requests.map((row) => {
                const status = STATUS_CONFIG[row.status] || STATUS_CONFIG.requested;
                const canSend = row.status === 'requested';
                return (
                  <TableRow key={row.id} hover>
                    <TableCell sx={{ fontWeight: 700, fontSize: 14, maxWidth: 160 }}>{row.domain}</TableCell>
                    <TableCell sx={{ fontSize: 13 }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{row.userEmail}</Typography>
                      {row.userName && (
                        <Typography sx={{ fontSize: 12, color: 'var(--text-muted)' }}>{row.userName}</Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 280 }}>
                      <Typography
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          lineHeight: 1.5,
                        }}
                      >
                        {row.description || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={status.label} color={status.color} size="small" sx={{ fontWeight: 700, fontSize: 11 }} />
                    </TableCell>
                    <TableCell sx={{ fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      {formatDate(row.createdAt)}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => setDetailRequest(row)} title="View details">
                        <VisibilityRoundedIcon fontSize="small" />
                      </IconButton>
                      {canSend && (
                        <Button
                          size="small"
                          variant="contained"
                          disableElevation
                          startIcon={<RocketLaunchRoundedIcon />}
                          onClick={() => setSendRequest(row)}
                          sx={{ ml: 0.5, textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
                        >
                          Send
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <RequestDetailDialog request={detailRequest} onClose={() => setDetailRequest(null)} />
      <SendInterviewDialog
        request={sendRequest}
        interviews={interviewsLoading ? [] : interviews}
        onClose={() => setSendRequest(null)}
        onSent={handleSent}
      />
    </PageContainer>
  );
}
