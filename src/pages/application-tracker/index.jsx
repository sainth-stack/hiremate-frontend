import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  CircularProgress,
  Menu,
  MenuItem,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import PageContainer from '../../components/common/PageContainer';
import { listJobsAPI, updateJobStatusAPI } from '../../services';
import { normalizeStatus, STATUSES } from './constants';
import StatsRow from './StatsRow';
import ApplicationBoard from './ApplicationBoard';
import AddApplicationModal from './AddApplicationModal';
import BoardSkeleton from './BoardSkeleton';

const SORT_OPTIONS = [
  { id: 'recent', label: 'Most recent' },
  { id: 'company', label: 'Company A–Z' },
  { id: 'title', label: 'Job title A–Z' },
];

export default function ApplicationTrackerPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [sortAnchor, setSortAnchor] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [overId, setOverId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editJob, setEditJob] = useState(null);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await listJobsAPI();
      setJobs((data || []).map((j) => ({ ...j, application_status: normalizeStatus(j.application_status) })));
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Keyboard shortcut: "a" to add application (when not in input)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'a' && !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
        const target = e.target;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
        e.preventDefault();
        setEditJob(null);
        setModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const jobsByStatus = useMemo(() => {
    let filtered = search.trim()
      ? jobs.filter(
          (j) =>
            (j.position_title || '').toLowerCase().includes(search.toLowerCase()) ||
            (j.company || '').toLowerCase().includes(search.toLowerCase()) ||
            (j.location || '').toLowerCase().includes(search.toLowerCase())
        )
      : jobs;

    if (sortBy === 'company') {
      filtered = [...filtered].sort((a, b) => (a.company || '').localeCompare(b.company || ''));
    } else if (sortBy === 'title') {
      filtered = [...filtered].sort((a, b) => (a.position_title || '').localeCompare(b.position_title || ''));
    } else {
      filtered = [...filtered].sort((a, b) => {
        const da = a.created_at ? new Date(a.created_at).getTime() : 0;
        const db = b.created_at ? new Date(b.created_at).getTime() : 0;
        return db - da;
      });
    }

    const byStatus = {};
    STATUSES.forEach((s) => (byStatus[s.id] = []));
    filtered.forEach((j) => {
      const status = normalizeStatus(j.application_status);
      if (byStatus[status]) byStatus[status].push(j);
      else byStatus.saved.push(j);
    });
    return byStatus;
  }, [jobs, search, sortBy]);

  const handleDragStart = (event) => setActiveId(event.active.id);

  const handleDragOver = (event) => {
    const over = event.over?.id;
    if (!over) {
      setOverId(null);
      return;
    }
    const overStr = String(over);
    if (STATUSES.find((s) => s.id === overStr)) {
      setOverId(overStr);
    } else if (overStr.startsWith('job-')) {
      const hoveredJob = jobs.find((j) => `job-${j.id}` === overStr);
      setOverId(hoveredJob ? normalizeStatus(hoveredJob.application_status) : null);
    } else {
      setOverId(null);
    }
  };

  const handleDragEnd = (event) => {
    setActiveId(null);
    setOverId(null);
    const { active, over } = event;
    if (!over) return;
    const jobId = active?.id?.replace?.('job-', '');
    if (!jobId) return;

    let newStatus = null;
    const overIdStr = String(over.id);
    if (STATUSES.find((s) => s.id === overIdStr)) {
      newStatus = overIdStr;
    } else if (overIdStr.startsWith('job-')) {
      const hoveredJob = jobs.find((j) => `job-${j.id}` === overIdStr);
      newStatus = hoveredJob ? normalizeStatus(hoveredJob.application_status) : null;
    }
    if (!newStatus || !STATUSES.find((s) => s.id === newStatus)) return;

    const job = jobs.find((j) => String(j.id) === jobId);
    if (!job || normalizeStatus(job.application_status) === newStatus) return;

    // Optimistic update: apply immediately
    const previousJobs = [...jobs];
    setJobs((prev) =>
      prev.map((j) => (j.id === Number(jobId) ? { ...j, application_status: newStatus } : j))
    );
    setUpdatingId(jobId);

    updateJobStatusAPI(jobId, newStatus).catch(() => {
      // Revert on failure
      setJobs(previousJobs);
    }).finally(() => setUpdatingId(null));
  };

  const handleAddSuccess = () => {
    fetchJobs();
  };

  const handleEditJob = (job) => {
    setEditJob(job);
    setModalOpen(true);
  };

  const handleDeleteJob = () => {
    // TODO: Add delete API when backend supports
  };

  const sortLabel = SORT_OPTIONS.find((o) => o.id === sortBy)?.label || 'Sort';

  return (
    <PageContainer
      maxWidth="100%"
      role="main"
      aria-label="Application Tracker"
      sx={{
        py: 3,
        px: { xs: 2, sm: 3 },
        bgcolor: 'var(--bg-light)',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
        width: '100%',
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 3, flexShrink: 0 }}>
        <Typography variant="h5" fontWeight={600} color="var(--text-primary)">
          Application Tracker
        </Typography>
        <Typography variant="body2" color="var(--text-muted)" sx={{ mt: 0.5 }}>
          Track and manage your job applications in one place
        </Typography>
      </Box>

      {/* Search + controls (premium) */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
          mb: 3,
          flexWrap: 'wrap',
        }}
      >
        {/* Search (large, premium) */}
        <Box sx={{ flex: '1 1 0', minWidth: 320, maxWidth: 860 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search job title, company, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            inputProps={{
              'aria-label': 'Search applications by job title, company, or location',
              style: { height: 48, padding: '0 14px' },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" sx={{ ml: 1 }}>
                  <SearchRoundedIcon sx={{ color: 'var(--placeholder)', fontSize: 20 }} />
                </InputAdornment>
              ),
              sx: {
                height: 48,
                borderRadius: 24,
                bgcolor: 'var(--grey-5)',
                boxShadow: 'inset 0 1px 2px rgba(16,24,40,0.04)',
                '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                '& input::placeholder': { color: 'var(--placeholder)' },
              },
            }}
          />
        </Box>

        {/* Controls group (right) */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
          <Button
            variant="outlined"
            size="medium"
            startIcon={<FilterListRoundedIcon sx={{ fontSize: 18 }} />}
            aria-label="Filter applications"
            sx={{
              px: 2,
              height: 40,
              borderRadius: 2,
              textTransform: 'none',
            }}
          >
            Filter
          </Button>

          <Button
            variant="outlined"
            size="medium"
            endIcon={<KeyboardArrowDownRoundedIcon sx={{ fontSize: 18 }} />}
            onClick={(e) => setSortAnchor(e.currentTarget)}
            aria-label={`Sort by ${sortLabel}. Click to change.`}
            aria-haspopup="menu"
            aria-expanded={Boolean(sortAnchor)}
            sx={{ px: 2, height: 40, borderRadius: 2, textTransform: 'none' }}
          >
            {sortLabel}
          </Button>

          <IconButton
            onClick={fetchJobs}
            disabled={loading}
            aria-label="Refresh applications"
            sx={{
              width: 44,
              height: 40,
              borderRadius: 2,
              bgcolor: 'transparent',
            }}
          >
            <RefreshRoundedIcon />
          </IconButton>

          <Button
            variant="contained"
            startIcon={<AddRoundedIcon sx={{ fontSize: 20 }} />}
            onClick={() => {
              setEditJob(null);
              setModalOpen(true);
            }}
            aria-label="Add new application"
            sx={{
              px: 2.5,
              height: 48,
              borderRadius: 24,
              textTransform: 'none',
              fontWeight: 700,
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)',
            }}
          >
            Add Application
          </Button>
        </Box>

        {/* Sort menu */}
        <Menu
          anchorEl={sortAnchor}
          open={Boolean(sortAnchor)}
          onClose={() => setSortAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{ sx: { borderRadius: 2, mt: 1.5, minWidth: 160 } }}
        >
          {SORT_OPTIONS.map((opt) => (
            <MenuItem
              key={opt.id}
              onClick={() => {
                setSortBy(opt.id);
                setSortAnchor(null);
              }}
            >
              {opt.label}
            </MenuItem>
          ))}
        </Menu>
      </Box>

      {/* Metrics row */}
      {!loading && jobs.length > 0 && <StatsRow jobs={jobs} />}

      {/* Kanban board — flex 1 so columns can scroll inside */}
      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {loading ? (
        <BoardSkeleton />
      ) : jobs.length === 0 ? (
        <Box
          sx={{
            flex: 1,
            borderRadius: 2,
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            bgcolor: 'var(--bg-paper)',
            py: 10,
            px: 4,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--border-color)',
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: 3,
              bgcolor: 'var(--light-blue-bg-08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
            }}
          >
            <Typography variant="h3" color="var(--primary)" sx={{ opacity: 0.5 }}>
              📋
            </Typography>
          </Box>
          <Typography variant="h6" fontWeight={600} color="var(--text-primary)" sx={{ mb: 1 }}>
            No applications yet
          </Typography>
          <Typography variant="body2" color="var(--text-secondary)" sx={{ mb: 2, maxWidth: 400 }}>
            Use the HireMate Chrome extension on career pages to save jobs, or add applications manually below.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => setModalOpen(true)}
            sx={{
              bgcolor: 'var(--primary)',
              '&:hover': { bgcolor: 'var(--primary-light)' },
              borderRadius: 2,
            }}
          >
            Add your first application
          </Button>
        </Box>
      ) : (
        <ApplicationBoard
          jobsByStatus={jobsByStatus}
          activeId={activeId}
          overId={overId}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onEditJob={handleEditJob}
          onDeleteJob={handleDeleteJob}
        />
      )}
      </Box>

      {/* Add/Edit modal */}
      <AddApplicationModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditJob(null);
        }}
        onSuccess={handleAddSuccess}
        editJob={editJob}
      />

      {/* Updating toast */}
      {updatingId && (
        <Box
          role="status"
          aria-live="polite"
          aria-label="Updating application status"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            bgcolor: 'var(--text-primary)',
            color: 'white',
            px: 2,
            py: 1,
            borderRadius: 2,
            boxShadow: 4,
            zIndex: 1300,
          }}
        >
          <CircularProgress size={16} sx={{ color: 'white' }} aria-hidden />
          <Typography variant="caption">Updating...</Typography>
        </Box>
      )}
    </PageContainer>
  );
}
