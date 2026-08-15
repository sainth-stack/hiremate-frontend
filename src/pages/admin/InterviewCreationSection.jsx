import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  CircularProgress,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import QuizRoundedIcon from '@mui/icons-material/QuizRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { SkeletonBox } from '../../components/admin';
import {
  createAdminInterviewAPI,
  deleteAdminInterviewAPI,
  getAdminInterviewAPI,
  getAdminInterviewsAPI,
  updateAdminInterviewAPI,
} from '../../services';
import { parseApiError, parseApiFieldErrors } from '../../utilities/apiErrorUtils';
import { saveLaunchInterview } from '../../utilities/launchInterviewStorage';

const TITLE_MAX_LENGTH = 255;

const SHADOW = {
  panel: '0 8px 32px rgba(15, 23, 42, 0.08), 0 2px 8px rgba(15, 23, 42, 0.04)',
  card: '0 4px 16px rgba(15, 23, 42, 0.06), 0 1px 4px rgba(15, 23, 42, 0.04)',
  cardHover: '0 16px 40px rgba(37, 99, 235, 0.14), 0 6px 16px rgba(15, 23, 42, 0.08)',
  create: '0 6px 20px rgba(37, 99, 235, 0.1), 0 2px 6px rgba(15, 23, 42, 0.04)',
  createHover: '0 16px 36px rgba(37, 99, 235, 0.22), 0 4px 12px rgba(15, 23, 42, 0.06)',
  icon: '0 4px 12px rgba(37, 99, 235, 0.2)',
};

const DIFFICULTY_OPTIONS = ['easy', 'medium', 'hard'];

const DIFFICULTY_CONFIG = {
  easy: { label: 'Easy', bgcolor: 'var(--success-bg)', color: 'var(--success-dark)' },
  medium: { label: 'Medium', bgcolor: 'var(--warning-bg)', color: 'var(--warning-dark)' },
  hard: { label: 'Hard', bgcolor: 'var(--error-bg)', color: 'var(--error-dark)' },
};

const dialogInputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    fontSize: 14,
    '& fieldset': { borderColor: 'var(--border-color)' },
    '&:hover fieldset': { borderColor: 'var(--border-hover)' },
    '&.Mui-focused fieldset': { borderColor: 'var(--primary)' },
  },
};

const dialogFieldLabelSx = {
  fontSize: 13,
  fontWeight: 700,
  color: 'var(--text-label)',
  mb: 1,
  display: 'block',
};

function DifficultyChip({ difficulty, size = 'small' }) {
  const level = String(difficulty || 'medium').toLowerCase();
  const config = DIFFICULTY_CONFIG[level] || DIFFICULTY_CONFIG.medium;
  return (
    <Chip
      label={config.label}
      size={size}
      sx={{
        height: 22,
        fontWeight: 700,
        fontSize: 11,
        letterSpacing: '0.02em',
        bgcolor: config.bgcolor,
        color: config.color,
        border: 'none',
        borderRadius: '999px',
        textTransform: 'capitalize',
      }}
    />
  );
}

function InterviewCardSkeleton() {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: '16px',
        border: '1px solid rgba(15, 23, 42, 0.06)',
        p: 3,
        minHeight: 200,
        bgcolor: 'var(--bg-paper)',
        boxShadow: SHADOW.card,
      }}
    >
      <SkeletonBox height={20} sx={{ mb: 1.5, width: '70%' }} />
      <SkeletonBox height={22} sx={{ mb: 2, width: 64, borderRadius: '999px' }} />
      <SkeletonBox height={14} sx={{ width: '45%' }} />
    </Card>
  );
}

const CARD_ACTIONS = {
  view: {
    color: 'var(--primary)',
    hoverBg: 'var(--light-blue-bg-08)',
  },
  edit: {
    color: '#0ea5e9',
    hoverBg: 'rgba(14, 165, 233, 0.12)',
  },
  delete: {
    color: 'var(--error)',
    hoverBg: 'var(--error-bg)',
  },
};

function InterviewCard({ interview, onLaunch, onView, onEdit, onDelete }) {
  const stop = (e) => e.stopPropagation();

  return (
    <Card
      elevation={0}
      onClick={() => onLaunch(interview)}
      sx={{
        position: 'relative',
        borderRadius: '16px',
        border: '1px solid rgba(15, 23, 42, 0.06)',
        minHeight: 200,
        p: 3,
        cursor: 'pointer',
        bgcolor: 'var(--bg-paper)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
        boxShadow: SHADOW.card,
        '&:hover': {
          borderColor: 'rgba(37, 99, 235, 0.25)',
          transform: 'translateY(-4px)',
          boxShadow: SHADOW.cardHover,
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 2 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--light-blue-bg-08) 0%, rgba(14, 165, 233, 0.12) 100%)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: SHADOW.icon,
          }}
        >
          <QuizRoundedIcon sx={{ fontSize: 22 }} />
        </Box>
        <Typography
          sx={{
            fontSize: 15,
            fontWeight: 700,
            color: 'var(--text-primary)',
            lineHeight: 1.35,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {interview.title}
        </Typography>
      </Box>
      <Box sx={{ mb: 'auto' }}>
        <DifficultyChip difficulty={interview.difficulty} />
      </Box>
      <Box
        sx={{
          mt: 'auto',
          pt: 2,
          borderTop: '1px solid var(--divider)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontSize: 11 }}>
          {interview.created_at
            ? new Date(interview.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
            : '—'}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }} onClick={stop}>
          <IconButton
            size="small"
            title="View"
            onClick={() => onView(interview)}
            sx={{
              width: 32,
              height: 32,
              color: CARD_ACTIONS.view.color,
              bgcolor: 'rgba(37, 99, 235, 0.06)',
              boxShadow: '0 1px 3px rgba(37, 99, 235, 0.12)',
              '&:hover': { bgcolor: CARD_ACTIONS.view.hoverBg, boxShadow: '0 2px 8px rgba(37, 99, 235, 0.2)' },
            }}
          >
            <VisibilityRoundedIcon sx={{ fontSize: 17 }} />
          </IconButton>
          <IconButton
            size="small"
            title="Edit"
            onClick={() => onEdit(interview)}
            sx={{
              width: 32,
              height: 32,
              color: CARD_ACTIONS.edit.color,
              bgcolor: 'rgba(14, 165, 233, 0.08)',
              boxShadow: '0 1px 3px rgba(14, 165, 233, 0.15)',
              '&:hover': { bgcolor: CARD_ACTIONS.edit.hoverBg, boxShadow: '0 2px 8px rgba(14, 165, 233, 0.25)' },
            }}
          >
            <EditRoundedIcon sx={{ fontSize: 17 }} />
          </IconButton>
          <IconButton
            size="small"
            title="Delete"
            onClick={() => onDelete(interview)}
            sx={{
              width: 32,
              height: 32,
              color: CARD_ACTIONS.delete.color,
              bgcolor: 'rgba(220, 38, 38, 0.06)',
              boxShadow: '0 1px 3px rgba(220, 38, 38, 0.12)',
              '&:hover': { bgcolor: CARD_ACTIONS.delete.hoverBg, boxShadow: '0 2px 8px rgba(220, 38, 38, 0.2)' },
            }}
          >
            <DeleteOutlineRoundedIcon sx={{ fontSize: 17 }} />
          </IconButton>
        </Box>
      </Box>
    </Card>
  );
}

export default function InterviewCreationSection() {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingInterview, setEditingInterview] = useState(null);
  const [viewInterview, setViewInterview] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isEditMode = Boolean(editingInterview);

  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [description, setDescription] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const fetchInterviews = useCallback(() => {
    setLoading(true);
    setError(null);
    getAdminInterviewsAPI()
      .then((res) => {
        setInterviews(res?.data?.interviews || []);
      })
      .catch((err) => {
        setError(parseApiError(err, 'Failed to load interviews'));
        setInterviews([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchInterviews();
  }, [fetchInterviews]);

  const openViewDialog = (interview) => {
    setViewInterview(interview);
    setViewLoading(true);
    getAdminInterviewAPI(interview.id)
      .then((res) => {
        setViewInterview(res?.data || interview);
      })
      .catch((err) => {
        setError(parseApiError(err, 'Failed to load interview details'));
        setViewInterview(interview);
      })
      .finally(() => setViewLoading(false));
  };

  const closeViewDialog = () => {
    if (viewLoading) return;
    setViewInterview(null);
  };

  const handleLaunchNavigate = (interview) => {
    const payload = {
      id: interview.id,
      title: interview.title,
      difficulty: interview.difficulty,
      description: interview.description,
      created_at: interview.created_at,
    };
    saveLaunchInterview(payload);
    navigate('/admin/launch-interviews', { state: { interview: payload } });
  };

  const resetForm = () => {
    setTitle('');
    setDifficulty('medium');
    setDescription('');
    setFormErrors({});
    setEditingInterview(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setFormOpen(true);
  };

  const openEditDialog = (interview) => {
    setEditingInterview(interview);
    setTitle(interview.title || '');
    setDifficulty(String(interview.difficulty || 'medium').toLowerCase());
    setDescription(interview.description || '');
    setFormErrors({});
    setFormOpen(true);
  };

  const closeFormDialog = () => {
    if (saving) return;
    setFormOpen(false);
    resetForm();
  };

  const validateForm = () => {
    const errs = {};
    const trimmedTitle = title.trim();
    if (!trimmedTitle) errs.title = 'Title is required';
    else if (trimmedTitle.length > TITLE_MAX_LENGTH) {
      errs.title = `Title must be at most ${TITLE_MAX_LENGTH} characters`;
    }
    if (!description.trim()) errs.description = 'Description is required';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveInterview = () => {
    if (!validateForm()) return;

    const payload = {
      title: title.trim(),
      difficulty,
      description: description.trim(),
    };

    setSaving(true);
    setError(null);

    const request = isEditMode
      ? updateAdminInterviewAPI(editingInterview.id, payload)
      : createAdminInterviewAPI(payload);

    request
      .then((res) => {
        const saved = res?.data;
        if (isEditMode) {
          setInterviews((prev) => prev.map((item) => (item.id === editingInterview.id ? { ...item, ...saved } : item)));
          if (viewInterview?.id === editingInterview.id) {
            setViewInterview((prev) => ({ ...prev, ...saved }));
          }
        } else if (saved?.id) {
          setInterviews((prev) => [saved, ...prev]);
        } else {
          fetchInterviews();
        }
        setFormOpen(false);
        resetForm();
      })
      .catch((err) => {
        const fieldErrors = parseApiFieldErrors(err);
        if (Object.keys(fieldErrors).length > 0) {
          setFormErrors(fieldErrors);
        } else {
          setError(parseApiError(err, isEditMode ? 'Failed to update interview' : 'Failed to create interview'));
          setFormOpen(false);
          resetForm();
        }
      })
      .finally(() => setSaving(false));
  };

  const handleDeleteInterview = () => {
    if (!deleteTarget) return;

    setDeleting(true);
    setError(null);
    deleteAdminInterviewAPI(deleteTarget.id)
      .then(() => {
        setInterviews((prev) => prev.filter((item) => item.id !== deleteTarget.id));
        if (viewInterview?.id === deleteTarget.id) setViewInterview(null);
        setDeleteTarget(null);
      })
      .catch((err) => {
        setError(parseApiError(err, 'Failed to delete interview'));
        setDeleteTarget(null);
      })
      .finally(() => setDeleting(false));
  };

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.8)',
        bgcolor: 'var(--bg-paper)',
        boxShadow: SHADOW.panel,
        overflow: 'hidden',
      }}
    >
      {error && (
        <Box
          sx={{
            flexShrink: 0,
            m: 2,
            mb: 0,
            p: 1.5,
            borderRadius: '10px',
            bgcolor: 'var(--error-bg)',
            border: '1px solid rgba(220,38,38,0.2)',
          }}
        >
          <Typography variant="body2" sx={{ color: 'var(--error-dark)', fontWeight: 500, fontSize: 13 }}>
            {error}
          </Typography>
        </Box>
      )}

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '30% 65%' },
          gap: { xs: 2, md: '5%' },
          alignItems: 'stretch',
          p: 2.5,
          pt: error ? 2 : 2.5,
          overflow: 'hidden',
          bgcolor: 'linear-gradient(180deg, rgba(248, 250, 252, 0.5) 0%, transparent 120px)',
        }}
      >
        {/* Left — Create Interview (30%), vertically centered */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: { xs: 'stretch', md: 'center' },
            height: '100%',
            minHeight: 0,
          }}
        >
          <Card
            elevation={0}
            onClick={openCreateDialog}
            sx={{
              borderRadius: '16px',
              border: '2px dashed rgba(37, 99, 235, 0.35)',
              width: { xs: '100%', md: 260 },
              height: { xs: 140, md: 156 },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1.25,
              cursor: 'pointer',
              bgcolor: 'linear-gradient(145deg, #ffffff 0%, var(--light-blue-bg-02) 100%)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
              flexShrink: 0,
              boxShadow: SHADOW.create,
              '&:hover': {
                borderColor: 'var(--primary)',
                transform: 'translateY(-3px)',
                boxShadow: SHADOW.createHover,
                '& .create-icon': {
                  bgcolor: 'var(--primary)',
                  color: '#fff',
                  boxShadow: '0 8px 20px rgba(37, 99, 235, 0.35)',
                },
                '& .create-label': { color: 'var(--primary)' },
              },
            }}
          >
            <Box
              className="create-icon"
              sx={{
                width: 48,
                height: 48,
                borderRadius: '14px',
                bgcolor: 'var(--light-blue-bg-08)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                boxShadow: SHADOW.icon,
              }}
            >
              <AddRoundedIcon sx={{ fontSize: 26 }} />
            </Box>
            <Typography
              className="create-label"
              sx={{ fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)', transition: 'color 0.2s ease' }}
            >
              Create Interview
            </Typography>
          </Card>
        </Box>

        {/* Right — Interview cards (65%), scrollable only here */}
        <Box
          sx={{
            minHeight: 0,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            borderRadius: '16px',
            border: '1px solid rgba(15, 23, 42, 0.05)',
            bgcolor: 'rgba(248, 250, 252, 0.6)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8)',
          }}
        >
          <Box
            sx={{
              flexShrink: 0,
              px: 2,
              py: 1.5,
              borderBottom: '1px solid rgba(15, 23, 42, 0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
              Interview Templates
            </Typography>
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--primary)',
                bgcolor: 'var(--light-blue-bg-08)',
                px: 1.25,
                py: 0.35,
                borderRadius: '999px',
              }}
            >
              {loading ? '…' : `${interviews.length} total`}
            </Typography>
          </Box>
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              overflowX: 'hidden',
              p: 2,
              pr: 1.5,
              '&::-webkit-scrollbar': { width: 6 },
              '&::-webkit-scrollbar-thumb': {
                bgcolor: 'rgba(15, 23, 42, 0.15)',
                borderRadius: '999px',
              },
              '&::-webkit-scrollbar-thumb:hover': { bgcolor: 'var(--text-muted)' },
            }}
          >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
              },
              gap: 2,
              pb: 0.5,
            }}
          >
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <InterviewCardSkeleton key={i} />)
              : interviews.map((interview) => (
                <InterviewCard
                  key={interview.id}
                  interview={interview}
                  onLaunch={handleLaunchNavigate}
                  onView={openViewDialog}
                  onEdit={openEditDialog}
                  onDelete={setDeleteTarget}
                />
              ))}
          </Box>
          </Box>
        </Box>
      </Box>

      {/* Create / Edit dialog */}
      <Dialog
        open={formOpen}
        onClose={closeFormDialog}
        maxWidth="md"
        fullWidth
        slotProps={{
          backdrop: { sx: { backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0,0,0,0.25)' } },
        }}
        PaperProps={{
          sx: { borderRadius: '16px', boxShadow: '0 24px 48px rgba(0,0,0,0.15)', maxWidth: 720 },
        }}
      >
        <DialogTitle sx={{ px: 4, py: 3, borderBottom: '1px solid var(--divider)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ width: 48, height: 48, borderRadius: '12px', bgcolor: 'var(--light-blue-bg-08)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {isEditMode ? <EditRoundedIcon /> : <AddRoundedIcon />}
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>
                {isEditMode ? 'Edit Interview' : 'Create Interview'}
              </Typography>
              <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                {isEditMode ? 'Update this interview template' : 'Add a new interview template'}
              </Typography>
            </Box>
            <IconButton onClick={closeFormDialog} disabled={saving} size="small" sx={{ color: 'var(--text-muted)' }}>
              <CloseRoundedIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ px: 4, pt: 3, pb: 2 }}>
          <Box sx={{ mt: 2, mb: 3 }}>
            <Typography component="label" sx={dialogFieldLabelSx}>
              Title <Typography component="span" sx={{ color: 'var(--error)' }}>*</Typography>
            </Typography>
            <TextField
              autoFocus
              fullWidth
              placeholder="e.g. Senior Frontend Developer — Stripe"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value.slice(0, TITLE_MAX_LENGTH));
                if (formErrors.title) setFormErrors((p) => ({ ...p, title: '' }));
              }}
              error={Boolean(formErrors.title)}
              helperText={formErrors.title || `${title.length}/${TITLE_MAX_LENGTH} characters`}
              sx={dialogInputSx}
            />
          </Box>
          <Box sx={{ mb: 3 }}>
            <Typography component="label" sx={dialogFieldLabelSx}>Difficulty</Typography>
            <TextField
              select
              fullWidth
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              sx={dialogInputSx}
            >
              {DIFFICULTY_OPTIONS.map((level) => (
                <MenuItem key={level} value={level} sx={{ textTransform: 'capitalize' }}>
                  {DIFFICULTY_CONFIG[level].label}
                </MenuItem>
              ))}
            </TextField>
          </Box>
          <Box>
            <Typography component="label" sx={dialogFieldLabelSx}>
              Description <Typography component="span" sx={{ color: 'var(--error)' }}>*</Typography>
            </Typography>
            <TextField
              fullWidth
              multiline
              minRows={8}
              placeholder="Paste job description, requirements, and interview focus areas..."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (formErrors.description) setFormErrors((p) => ({ ...p, description: '' }));
              }}
              error={Boolean(formErrors.description)}
              helperText={formErrors.description || 'Include role, company, and key requirements'}
              sx={dialogInputSx}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 4, py: 3, borderTop: '1px solid var(--divider)', gap: 1.5 }}>
          <Button onClick={closeFormDialog} disabled={saving} variant="outlined" sx={{ textTransform: 'none', fontWeight: 600, minHeight: 42, borderColor: 'var(--border-color)' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveInterview}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : (isEditMode ? <EditRoundedIcon /> : <AddRoundedIcon />)}
            sx={{ textTransform: 'none', fontWeight: 600, minHeight: 42, boxShadow: 'none', '&:hover': { boxShadow: 'none' } }}
          >
            {saving ? (isEditMode ? 'Saving…' : 'Creating…') : (isEditMode ? 'Save Changes' : 'Create Interview')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirm dialog */}
      <Dialog open={Boolean(deleteTarget)} onClose={() => !deleting && setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete interview?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
            Delete <strong>{deleteTarget?.title}</strong>? This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleting} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteInterview}
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : <DeleteOutlineRoundedIcon />}
            sx={{ textTransform: 'none', boxShadow: 'none', '&:hover': { boxShadow: 'none' } }}
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View dialog */}
      <Dialog
        open={Boolean(viewInterview)}
        onClose={closeViewDialog}
        maxWidth="md"
        fullWidth
        slotProps={{
          backdrop: { sx: { backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0,0,0,0.25)' } },
        }}
        PaperProps={{
          sx: { borderRadius: '16px', boxShadow: '0 24px 48px rgba(0,0,0,0.15)', maxWidth: 720 },
        }}
      >
        <DialogTitle sx={{ px: 4, py: 3, borderBottom: '1px solid var(--divider)' }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <Box sx={{ width: 48, height: 48, borderRadius: '12px', bgcolor: 'var(--light-blue-bg-08)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <QuizRoundedIcon />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3, mb: 1 }}>
                {viewInterview?.title}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <DifficultyChip difficulty={viewInterview?.difficulty} />
                {viewInterview?.created_at && (
                  <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontSize: 12 }}>
                    Created {new Date(viewInterview.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                  </Typography>
                )}
              </Box>
            </Box>
            <IconButton onClick={closeViewDialog} disabled={viewLoading} size="small" sx={{ color: 'var(--text-muted)' }}>
              <CloseRoundedIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ px: 4, pt: 3, pb: 3 }}>
          <Typography component="label" sx={{ ...dialogFieldLabelSx, mt: 2 }}>Description</Typography>
          <Box
            sx={{
              p: 2.5,
              borderRadius: '10px',
              bgcolor: 'var(--grey-4)',
              border: '1px solid var(--border-color)',
              maxHeight: 200,
              overflow: 'auto',
              mb: 3,
            }}
          >
            <Typography
              sx={{
                fontSize: 14,
                color: 'var(--text-primary)',
                lineHeight: 1.7,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {viewInterview?.description || '—'}
            </Typography>
          </Box>

          <Typography component="label" sx={dialogFieldLabelSx}>
            Questions
            {viewInterview?.questions?.length ? ` (${viewInterview.questions.length})` : ''}
          </Typography>
          <Box
            sx={{
              p: 2.5,
              borderRadius: '10px',
              bgcolor: 'var(--grey-4)',
              border: '1px solid var(--border-color)',
              maxHeight: 360,
              overflow: 'auto',
            }}
          >
            {viewLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={28} sx={{ color: 'var(--primary)' }} />
              </Box>
            ) : viewInterview?.questions?.length ? (
              <Box component="ol" sx={{ m: 0, pl: 2.5 }}>
                {[...viewInterview.questions]
                  .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                  .map((question, index) => (
                    <Box
                      component="li"
                      key={question.id ?? index}
                      sx={{
                        mb: index < viewInterview.questions.length - 1 ? 2 : 0,
                        '&::marker': {
                          fontWeight: 700,
                          color: 'var(--primary)',
                        },
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 14,
                          color: 'var(--text-primary)',
                          lineHeight: 1.7,
                          wordBreak: 'break-word',
                        }}
                      >
                        {question.question_text}
                      </Typography>
                    </Box>
                  ))}
              </Box>
            ) : (
              <Typography sx={{ fontSize: 14, color: 'var(--text-muted)' }}>
                No questions available for this interview yet.
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 4, py: 3, borderTop: '1px solid var(--divider)' }}>
          <Button onClick={closeViewDialog} disabled={viewLoading} variant="contained" sx={{ textTransform: 'none', fontWeight: 600, minHeight: 42, boxShadow: 'none', '&:hover': { boxShadow: 'none' } }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
