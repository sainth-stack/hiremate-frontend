import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  CircularProgress,
  Checkbox,
  Chip,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import QuizRoundedIcon from '@mui/icons-material/QuizRounded';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import RocketLaunchRoundedIcon from '@mui/icons-material/RocketLaunchRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import { SkeletonBox } from '../../components/admin';
import DifficultyChip from '../../components/admin/interview/DifficultyChip';
import InterviewBuilderWizard from './InterviewBuilderWizard';
import {
  deleteAdminInterviewAPI,
  getAdminInterviewsAPI,
} from '../../services';
import { parseApiError } from '../../utilities/apiErrorUtils';
import toast from 'react-hot-toast';

const SHADOW = {
  panel: '0 8px 32px rgba(15, 23, 42, 0.08)',
  card: '0 4px 16px rgba(15, 23, 42, 0.06)',
  cardHover: '0 16px 40px rgba(37, 99, 235, 0.14)',
};

function InterviewCardSkeleton() {
  return (
    <Card elevation={0} sx={{ borderRadius: '16px', border: '1px solid var(--border-color)', p: 2.5, bgcolor: 'var(--bg-paper)' }}>
      <SkeletonBox height={20} sx={{ mb: 1.5, width: '70%' }} />
      <SkeletonBox height={22} sx={{ mb: 2, width: 64, borderRadius: '999px' }} />
      <SkeletonBox height={36} sx={{ width: '100%', borderRadius: '10px' }} />
    </Card>
  );
}

function TemplateCard({
  interview,
  selected,
  onToggleSelect,
  onReview,
  onEdit,
  onLaunch,
  onDelete,
}) {
  return (
    <Card
      elevation={0}
      onClick={() => onToggleSelect(interview.id)}
      sx={{
        borderRadius: '16px',
        border: selected ? '2px solid var(--primary)' : '1px solid rgba(15, 23, 42, 0.06)',
        p: 2.5,
        bgcolor: selected ? 'var(--light-blue-bg-04)' : 'var(--bg-paper)',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        boxShadow: SHADOW.card,
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: SHADOW.cardHover,
          borderColor: selected ? 'var(--primary)' : 'rgba(37, 99, 235, 0.2)',
        },
      }}
    >
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
        <Checkbox
          checked={selected}
          onClick={(e) => e.stopPropagation()}
          onChange={() => onToggleSelect(interview.id)}
          size="small"
          sx={{ p: 0, mt: 0.25 }}
        />
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: '12px',
            bgcolor: 'var(--light-blue-bg-08)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <QuizRoundedIcon sx={{ fontSize: 22 }} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.35, mb: 0.75 }}>
            {interview.title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <DifficultyChip difficulty={interview.difficulty} />
            <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontWeight: 600 }}>
              {interview.question_count || 15} questions
            </Typography>
          </Box>
        </Box>
        <IconButton
          size="small"
          title="Delete"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(interview);
          }}
          sx={{ color: 'var(--error)' }}
        >
          <DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      <Typography
        variant="body2"
        onClick={(e) => e.stopPropagation()}
        sx={{
          color: 'var(--text-secondary)',
          fontSize: 13,
          lineHeight: 1.55,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          flex: 1,
        }}
      >
        {interview.summary || interview.description}
      </Typography>

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', pt: 0.5 }} onClick={(e) => e.stopPropagation()}>
        <Button
          size="small"
          startIcon={<VisibilityRoundedIcon />}
          onClick={() => onReview(interview)}
          sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px' }}
        >
          Review
        </Button>
        <Button
          size="small"
          startIcon={<EditNoteRoundedIcon />}
          onClick={() => onEdit(interview)}
          sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px' }}
        >
          Edit
        </Button>
        <Button
          size="small"
          variant="contained"
          startIcon={<RocketLaunchRoundedIcon />}
          onClick={() => onLaunch(interview)}
          sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px', ml: 'auto', boxShadow: 'none' }}
        >
          Launch
        </Button>
      </Box>
    </Card>
  );
}

export default function InterviewCreationSection() {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wizardMode, setWizardMode] = useState(null);
  const [activeInterview, setActiveInterview] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [deleting, setDeleting] = useState(false);

  const selectedCount = selectedIds.size;
  const allSelected = interviews.length > 0 && selectedCount === interviews.length;

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(interviews.map((item) => item.id)));
    }
  };

  const clearSelection = () => setSelectedIds(new Set());

  const fetchInterviews = useCallback(() => {
    setLoading(true);
    setError(null);
    getAdminInterviewsAPI()
      .then((res) => setInterviews(res?.data?.interviews || []))
      .catch((err) => {
        setError(parseApiError(err, 'Failed to load interviews'));
        setInterviews([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchInterviews();
  }, [fetchInterviews]);

  const closeWizard = () => {
    setWizardMode(null);
    setActiveInterview(null);
  };

  const handleSaved = (saved) => {
    if (saved?.id) {
      setInterviews((prev) => {
        const exists = prev.some((item) => item.id === saved.id);
        if (exists) return prev.map((item) => (item.id === saved.id ? { ...item, ...saved } : item));
        return [saved, ...prev];
      });
    } else {
      fetchInterviews();
    }
  };

  const handleLaunch = () => {
    navigate('/admin/launch-interviews');
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setDeleting(true);
    deleteAdminInterviewAPI(deleteTarget.id)
      .then(() => {
        setInterviews((prev) => prev.filter((item) => item.id !== deleteTarget.id));
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(deleteTarget.id);
          return next;
        });
        setDeleteTarget(null);
        toast.success('Interview deleted');
      })
      .catch((err) => setError(parseApiError(err, 'Failed to delete interview')))
      .finally(() => setDeleting(false));
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    if (!ids.length) return;

    setDeleting(true);
    const results = await Promise.allSettled(ids.map((id) => deleteAdminInterviewAPI(id)));
    const failed = results.filter((result) => result.status === 'rejected').length;
    const succeeded = ids.length - failed;

    if (succeeded > 0) {
      setInterviews((prev) => prev.filter((item) => !selectedIds.has(item.id)));
      clearSelection();
      toast.success(`Deleted ${succeeded} interview${succeeded === 1 ? '' : 's'}`);
    }
    if (failed > 0) {
      setError(`Failed to delete ${failed} interview${failed === 1 ? '' : 's'}`);
      toast.error(`Failed to delete ${failed} interview${failed === 1 ? '' : 's'}`);
    }

    setBulkDeleteOpen(false);
    setDeleting(false);
  };

  if (wizardMode) {
    return (
      <InterviewBuilderWizard
        mode={wizardMode}
        initialInterview={activeInterview}
        onClose={closeWizard}
        onSaved={handleSaved}
        onDeleted={(deleted) => {
          setInterviews((prev) => prev.filter((item) => item.id !== deleted.id));
          closeWizard();
        }}
      />
    );
  }

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
      <Box
        sx={{
          flexShrink: 0,
          px: 3,
          py: 2.5,
          borderBottom: '1px solid var(--divider)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Box>
          <Typography sx={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
            Interview templates
          </Typography>
          <Typography sx={{ fontSize: 13, color: 'var(--text-secondary)', mt: 0.25 }}>
            Create a template first, review AI-generated questions, then launch to candidates.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          {interviews.length > 0 && (
            <>
              <Button
                size="small"
                onClick={toggleSelectAll}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                {allSelected ? 'Deselect all' : 'Select all'}
              </Button>
              {selectedCount > 0 && (
                <>
                  <Chip
                    label={`${selectedCount} selected`}
                    size="small"
                    sx={{ fontWeight: 700, bgcolor: 'var(--light-blue-bg-08)', color: 'var(--primary)' }}
                  />
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
            </>
          )}
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => {
              setActiveInterview(null);
              setWizardMode('create');
            }}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: '12px',
              px: 2.5,
              boxShadow: '0 6px 20px rgba(37, 99, 235, 0.25)',
              ml: 'auto',
            }}
          >
            New interview
          </Button>
        </Box>
      </Box>

      {error && (
        <Box sx={{ mx: 3, mt: 2, p: 1.5, borderRadius: '10px', bgcolor: 'var(--error-bg)', border: '1px solid rgba(220,38,38,0.2)' }}>
          <Typography variant="body2" sx={{ color: 'var(--error-dark)', fontWeight: 500, fontSize: 13 }}>
            {error}
          </Typography>
        </Box>
      )}

      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', p: 3 }}>
        {loading ? (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 2 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <InterviewCardSkeleton key={i} />
            ))}
          </Box>
        ) : interviews.length === 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              px: 3,
              borderRadius: '16px',
              border: '2px dashed rgba(37, 99, 235, 0.25)',
              bgcolor: 'rgba(248, 250, 252, 0.8)',
            }}
          >
            <AutoAwesomeRoundedIcon sx={{ fontSize: 48, color: 'var(--primary)', mb: 2, opacity: 0.85 }} />
            <Typography sx={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', mb: 1 }}>
              No interviews yet
            </Typography>
            <Typography sx={{ fontSize: 14, color: 'var(--text-secondary)', mb: 3, maxWidth: 420, mx: 'auto', lineHeight: 1.6 }}>
              Start by defining the role and job context. Choose how many questions to generate, then refine them before launching with your preferred voice.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={() => setWizardMode('create')}
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '12px' }}
            >
              Create your first interview
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 2 }}>
            {interviews.map((interview) => (
              <TemplateCard
                key={interview.id}
                interview={interview}
                selected={selectedIds.has(interview.id)}
                onToggleSelect={toggleSelect}
                onReview={(item) => {
                  setActiveInterview(item);
                  setWizardMode('review');
                }}
                onEdit={(item) => {
                  setActiveInterview(item);
                  setWizardMode('edit');
                }}
                onLaunch={handleLaunch}
                onDelete={setDeleteTarget}
              />
            ))}
          </Box>
        )}
      </Box>

      <Dialog open={Boolean(deleteTarget)} onClose={() => !deleting && setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete interview?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
            Delete <strong>{deleteTarget?.title}</strong>? This removes all generated questions and cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleting} sx={{ textTransform: 'none' }}>
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

      <Dialog open={bulkDeleteOpen} onClose={() => !deleting && setBulkDeleteOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete {selectedCount} interview{selectedCount === 1 ? '' : 's'}?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
            This removes all selected templates, generated questions, and linked launch history. This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => setBulkDeleteOpen(false)} disabled={deleting} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleBulkDelete}
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : <DeleteOutlineRoundedIcon />}
            sx={{ textTransform: 'none', boxShadow: 'none' }}
          >
            {deleting ? 'Deleting…' : `Delete ${selectedCount}`}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
