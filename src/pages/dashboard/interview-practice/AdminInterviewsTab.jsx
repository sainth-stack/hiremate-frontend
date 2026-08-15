import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import RocketLaunchRoundedIcon from '@mui/icons-material/RocketLaunchRounded';
import AssignmentTurnedInRoundedIcon from '@mui/icons-material/AssignmentTurnedInRounded';
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import toast from 'react-hot-toast';
import {
  getMyAdminInterviewsAPI,
  requestAdminInterviewAPI,
} from '../../../services/adminInterviewService';
import { parseApiError } from '../../../utilities/apiErrorUtils';
import { buildInterviewUrl } from '../../../utilities/const';

const STATUS_CONFIG = {
  requested: { label: 'Requested', color: 'var(--warning-dark)', bgcolor: 'var(--warning-bg)' },
  pending: { label: 'Pending', color: 'var(--primary)', bgcolor: 'var(--light-blue-bg-08)' },
  in_progress: { label: 'In Progress', color: 'var(--primary)', bgcolor: 'var(--light-blue-bg-08)' },
  completed: { label: 'Completed', color: 'var(--success-dark)', bgcolor: 'var(--success-bg)' },
  cancelled: { label: 'Cancelled', color: 'var(--text-muted)', bgcolor: 'var(--grey-4)' },
};

function normalizeItem(item) {
  return {
    id: item.id ?? item.request_id,
    requestId: item.request_id ?? item.id,
    interviewId: item.interview_id,
    domain: item.domain || item.title || 'Interview',
    title: item.title || item.domain || 'Interview',
    description: item.description || '',
    status: String(item.status || 'requested').toLowerCase(),
    createdAt: item.created_at,
    launchedAt: item.launched_at,
    completedAt: item.completed_at,
    score: item.score ?? item.final_score,
    interviewUrl: item.interview_url,
    userId: item.user_id,
  };
}

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function truncateText(text, maxChars = 120) {
  const value = String(text || '').trim();
  if (!value) return 'No description';
  if (value.length <= maxChars) return value;
  return `${value.slice(0, maxChars).trim()}…`;
}

function InterviewCard({ item, userId, onOpen }) {
  const status = STATUS_CONFIG[item.status] || STATUS_CONFIG.requested;
  const canStart = ['pending', 'in_progress'].includes(item.status);
  const isCompleted = item.status === 'completed';
  const isWaiting = item.status === 'requested';

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        minHeight: 220,
        maxHeight: 320,
        borderRadius: 3,
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'all 0.2s',
        '&:hover': { boxShadow: '0 12px 32px rgba(37, 99, 235, 0.1)', borderColor: 'rgba(37, 99, 235, 0.25)' },
      }}
    >
      <CardContent sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1, mb: 1 }}>
          <Tooltip title={item.domain} arrow placement="top">
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: 15,
                color: 'var(--text-primary)',
                lineHeight: 1.3,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1,
                minWidth: 0,
              }}
            >
              {item.domain}
            </Typography>
          </Tooltip>
          <Chip
            label={status.label}
            size="small"
            sx={{ height: 22, fontWeight: 700, fontSize: 10, color: status.color, bgcolor: status.bgcolor, flexShrink: 0 }}
          />
        </Box>

        <Tooltip title={item.description || 'No description'} arrow placement="top">
          <Typography
            sx={{
              fontSize: 12,
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
              mb: 1.5,
              minHeight: 54,
              maxHeight: 54,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              wordBreak: 'break-word',
            }}
          >
            {truncateText(item.description, 140)}
          </Typography>
        </Tooltip>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.5 }}>
          <Chip label={`Created ${formatDate(item.createdAt)}`} size="small" variant="outlined" sx={{ fontSize: 10, height: 22 }} />
          {item.launchedAt && (
            <Chip label={`Sent ${formatDate(item.launchedAt)}`} size="small" variant="outlined" sx={{ fontSize: 10, height: 22 }} />
          )}
          {isCompleted && item.score != null && (
            <Chip label={`Score ${Math.round(item.score)}%`} size="small" sx={{ fontWeight: 700, fontSize: 10, height: 22, bgcolor: 'var(--success-bg)', color: 'var(--success-dark)' }} />
          )}
        </Box>

        {isWaiting && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, p: 1, borderRadius: 2, bgcolor: 'var(--warning-bg)', mb: 1.5 }}>
            <HourglassEmptyRoundedIcon sx={{ fontSize: 16, color: 'var(--warning-dark)' }} />
            <Typography sx={{ fontSize: 11, fontWeight: 600, color: 'var(--warning-dark)', lineHeight: 1.3 }}>
              Waiting for admin
            </Typography>
          </Box>
        )}

        <Box sx={{ mt: 'auto', pt: 0.5 }}>
          {canStart && (
            <Button
              fullWidth
              variant="contained"
              disableElevation
              startIcon={<RocketLaunchRoundedIcon />}
              onClick={() => onOpen(item)}
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, py: 0.85, fontSize: 13 }}
            >
              Start Interview
            </Button>
          )}
          {isCompleted && (
            <Button
              fullWidth
              variant="contained"
              disableElevation
              startIcon={<AssignmentTurnedInRoundedIcon />}
              onClick={() => onOpen(item)}
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, py: 0.85, fontSize: 13, bgcolor: 'var(--success)' }}
            >
              View Results
            </Button>
          )}
          {canStart || isCompleted ? (
            <Button
              fullWidth
              size="small"
              startIcon={<OpenInNewRoundedIcon sx={{ fontSize: 16 }} />}
              onClick={() => onOpen(item, true)}
              sx={{ mt: 0.75, textTransform: 'none', fontWeight: 600, color: 'var(--text-muted)', fontSize: 12 }}
            >
              Open link
            </Button>
          ) : null}
        </Box>
      </CardContent>
    </Card>
  );
}

export default function AdminInterviewsTab() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useSelector((state) => state.auth.user);
  const userId = user?.id;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [domain, setDomain] = useState('');
  const [description, setDescription] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['my-admin-interviews'],
    queryFn: async () => {
      const res = await getMyAdminInterviewsAPI();
      const list = res?.data?.interviews || res?.data?.items || res?.data || [];
      return (Array.isArray(list) ? list : []).map(normalizeItem);
    },
  });

  const requestMutation = useMutation({
    mutationFn: () => requestAdminInterviewAPI({ domain: domain.trim(), description: description.trim() }),
    onSuccess: () => {
      toast.success('Interview request sent to admin.');
      setDialogOpen(false);
      setDomain('');
      setDescription('');
      queryClient.invalidateQueries({ queryKey: ['my-admin-interviews'] });
    },
    onError: (err) => toast.error(parseApiError(err, 'Failed to send request')),
  });

  const getInterviewPath = (item) => {
    if (item.interviewUrl) {
      try {
        const url = new URL(item.interviewUrl, window.location.origin);
        return `${url.pathname}${url.search}`;
      } catch {
        return item.interviewUrl.startsWith('/') ? item.interviewUrl : `/${item.interviewUrl}`;
      }
    }
    const uid = item.userId || userId;
    return buildInterviewUrl(uid, item.interviewId).replace(window.location.origin, '');
  };

  const handleOpenInterview = (item, newTab = false) => {
    const path = getInterviewPath(item);
    if (newTab) {
      window.open(path, '_blank', 'noopener');
    } else {
      navigate(path);
    }
  };

  return (
    <Box sx={{ height: '100%', overflow: 'auto', p: { xs: 2, sm: 3, md: 4 } }}>
      <Box sx={{ width: '100%', maxWidth: 1400, mx: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          <Box>
            <Typography sx={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', color: 'var(--primary)', textTransform: 'uppercase', mb: 0.5 }}>
              Admin Interviews
            </Typography>
            <Typography sx={{ fontSize: { xs: 22, md: 26 }, fontWeight: 900, color: 'var(--text-primary)' }}>
              Request & Track Interviews
            </Typography>
            <Typography sx={{ fontSize: 14, color: 'var(--text-secondary)', mt: 0.5, maxWidth: 520 }}>
              Request a domain interview from admin. When sent, start here or via email. Results appear after submission.
            </Typography>
          </Box>
          <Button
            variant="contained"
            disableElevation
            startIcon={<AddRoundedIcon />}
            onClick={() => setDialogOpen(true)}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, px: 2.5 }}
          >
            Request Interview
          </Button>
        </Box>

        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'var(--error-bg)', mb: 2 }}>
            <Typography sx={{ color: 'var(--error-dark)', fontSize: 14 }}>
              {parseApiError(error, 'Failed to load interviews')}
            </Typography>
          </Box>
        )}

        {!isLoading && !error && data?.length === 0 && (
          <Card elevation={0} sx={{ p: 5, textAlign: 'center', borderRadius: 3, border: '1px dashed var(--border-color)' }}>
            <RocketLaunchRoundedIcon sx={{ fontSize: 48, color: 'var(--primary)', mb: 2, opacity: 0.7 }} />
            <Typography sx={{ fontWeight: 800, fontSize: 18, mb: 1 }}>No admin interviews yet</Typography>
            <Typography sx={{ color: 'var(--text-secondary)', mb: 3, fontSize: 14 }}>
              Request an interview by domain and job description. Admin will review and send you a link.
            </Typography>
            <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setDialogOpen(true)} sx={{ textTransform: 'none', fontWeight: 700 }}>
              Request Interview
            </Button>
          </Card>
        )}

        {data?.length > 0 && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
                md: 'repeat(3, minmax(0, 1fr))',
              },
              gap: 2,
              alignItems: 'stretch',
            }}
          >
            {data.map((item) => (
              <InterviewCard key={item.id} item={item} userId={userId} onOpen={handleOpenInterview} />
            ))}
          </Box>
        )}
      </Box>

      <Dialog open={dialogOpen} onClose={() => !requestMutation.isPending && setDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Typography sx={{ fontWeight: 800, fontSize: 18 }}>Request Interview</Typography>
          <IconButton size="small" onClick={() => setDialogOpen(false)} disabled={requestMutation.isPending}>
            <CloseRoundedIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 13, color: 'var(--text-secondary)', mb: 2 }}>
            Tell admin which domain/role you want to practice. They will create and send your interview.
          </Typography>
          <TextField
            fullWidth
            label="Domain / Role"
            placeholder="e.g. Frontend Developer, DevOps, Data Science"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
          <TextField
            fullWidth
            multiline
            minRows={5}
            label="Description"
            placeholder="Job description, skills, company context, interview focus..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setDialogOpen(false)} disabled={requestMutation.isPending} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            disableElevation
            disabled={!domain.trim() || !description.trim() || requestMutation.isPending}
            onClick={() => requestMutation.mutate()}
            startIcon={requestMutation.isPending ? <CircularProgress size={16} color="inherit" /> : null}
            sx={{ textTransform: 'none', fontWeight: 700 }}
          >
            {requestMutation.isPending ? 'Sending…' : 'Send Request'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
