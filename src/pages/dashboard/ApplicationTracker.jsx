import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
  Link,
  Button,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import SwapVertRoundedIcon from '@mui/icons-material/SwapVertRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import BookmarkBorderRoundedIcon from '@mui/icons-material/BookmarkBorderRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import DragIndicatorRoundedIcon from '@mui/icons-material/DragIndicatorRounded';
import OpenInFullRoundedIcon from '@mui/icons-material/OpenInFullRounded';
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
  closestCorners,
} from '@dnd-kit/core';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import PageContainer from '../../components/common/PageContainer';
import { listJobsAPI, updateJobStatusAPI } from '../../services';

const STATUSES = [
  { id: 'saved', label: 'Saved', icon: BookmarkBorderRoundedIcon, color: 'var(--primary)', bgTint: 'var(--light-blue-bg-08)' },
  { id: 'applied', label: 'Applied', icon: CheckCircleOutlineRoundedIcon, color: 'var(--success)', bgTint: 'var(--success-bg)' },
  { id: 'interview', label: 'Interview', icon: EventAvailableRoundedIcon, color: 'var(--warning)', bgTint: 'var(--warning-bg)' },
  { id: 'closed', label: 'Closed', icon: BlockRoundedIcon, color: 'var(--text-muted)', bgTint: 'var(--light-blue-bg-02)' },
];

function normalizeStatus(raw) {
  if (!raw) return 'saved';
  const s = String(raw).toLowerCase();
  const map = {
    'i have not yet applied': 'saved',
    'not yet applied': 'saved',
    applied: 'applied',
    interviewing: 'interview',
    offer: 'closed',
    rejected: 'closed',
    withdrawn: 'closed',
  };
  return map[s] || (['saved', 'applied', 'interview', 'closed'].includes(s) ? s : 'saved');
}

function JobCard({ job, isDragging, compact }) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: `job-${job.id}`,
    data: { job },
  });

  return (
    <Card
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      variant="outlined"
      sx={{
        mb: 0,
        borderRadius: 1.5,
        borderColor: 'var(--border-color)',
        bgcolor: 'var(--bg-paper)',
        cursor: 'grab',
        opacity: isDragging ? 0.5 : 1,
        transition: 'box-shadow 0.2s',
        '&:active': { cursor: 'grabbing' },
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          borderColor: 'var(--primary)',
        },
      }}
    >
      <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
          <DragIndicatorRoundedIcon
            sx={{ color: 'var(--text-muted)', fontSize: 18, mt: 0.25, flexShrink: 0 }}
          />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              fontWeight={600}
              color="var(--text-primary)"
              sx={{ lineHeight: 1.3 }}
            >
              {job.position_title || 'Untitled'}
            </Typography>
            {!compact && (
              <Typography variant="caption" color="var(--text-secondary)" sx={{ display: 'block', mt: 0.5, fontSize: '0.8125rem' }}>
                {[job.company || '—', job.location].filter(Boolean).join(' · ')}
              </Typography>
            )}
          </Box>
        </Box>
        {job.job_posting_url && (
          <Link
            href={job.job_posting_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.25,
              fontSize: '0.75rem',
              mt: 1,
              color: 'var(--primary)',
              '&:hover': { color: 'var(--primary-light)' },
            }}
          >
            View job
            <OpenInNewRoundedIcon sx={{ fontSize: 14 }} />
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

function Column({ status, jobs, isOver }) {
  const { setNodeRef } = useDroppable({
    id: status.id,
    data: { statusId: status.id },
  });
  const Icon = status.icon;

  return (
    <Box
      ref={setNodeRef}
      sx={{
        flex: '1 1 0',
        minWidth: 200,
        display: 'flex',
        flexDirection: 'column',
        alignSelf: 'stretch',
        borderRadius: 2,
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        bgcolor: isOver ? 'var(--light-blue-bg-08)' : 'var(--bg-paper)',
        border: '1px solid',
        borderColor: isOver ? 'var(--primary)' : 'var(--border-color)',
        p: 2.5,
        transition: 'border-color 0.2s, background-color 0.2s, box-shadow 0.2s',
      }}
    >
      {/* Column header: icon | title + count | expand */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          mb: 2.5,
          pb: 2,
          borderBottom: '1px solid',
          borderColor: 'rgba(0,0,0,0.06)',
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: status.bgTint || 'var(--light-blue-bg-02)',
            flexShrink: 0,
          }}
        >
          <Icon sx={{ color: status.color, fontSize: 22 }} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" fontWeight={600} color="var(--text-primary)" sx={{ lineHeight: 1.2 }}>
            {status.label}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: status.color,
              fontWeight: 500,
              fontSize: '0.8125rem',
              display: 'block',
              mt: 0.25,
            }}
          >
            {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'}
          </Typography>
        </Box>
        <IconButton
          size="small"
          sx={{
            color: 'var(--text-muted)',
            p: 0.5,
            '&:hover': { bgcolor: 'rgba(0,0,0,0.04)', color: 'var(--text-secondary)' },
          }}
        >
          <OpenInFullRoundedIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
        }}
      >
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} isDragging={false} compact={false} />
        ))}
      </Box>
    </Box>
  );
}

function DraggingCard({ job }) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 1.5,
        borderColor: 'var(--primary)',
        boxShadow: 4,
        maxWidth: 300,
      }}
    >
      <CardContent sx={{ py: 1.5, px: 2 }}>
        <Typography variant="body2" fontWeight={600}>
          {job.position_title || 'Untitled'}
        </Typography>
        <Typography variant="caption" color="var(--text-secondary)">
          {[job.company || '—', job.location].filter(Boolean).join(' · ')}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function ApplicationTracker() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeId, setActiveId] = useState(null);
  const [overId, setOverId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await listJobsAPI();
      setJobs((data || []).map((j) => ({ ...j, application_status: normalizeStatus(j.application_status) })));
    } catch (err) {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const jobsByStatus = useMemo(() => {
    const filtered = search.trim()
      ? jobs.filter(
          (j) =>
            (j.position_title || '').toLowerCase().includes(search.toLowerCase()) ||
            (j.company || '').toLowerCase().includes(search.toLowerCase())
        )
      : jobs;
    const byStatus = {};
    STATUSES.forEach((s) => (byStatus[s.id] = []));
    filtered.forEach((j) => {
      const status = normalizeStatus(j.application_status);
      if (byStatus[status]) byStatus[status].push(j);
      else byStatus.saved.push(j);
    });
    return byStatus;
  }, [jobs, search]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

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

    setUpdatingId(jobId);
    updateJobStatusAPI(jobId, newStatus)
      .then(() => {
        setJobs((prev) =>
          prev.map((j) => (j.id === Number(jobId) ? { ...j, application_status: newStatus } : j))
        );
      })
      .finally(() => setUpdatingId(null));
  };

  const activeJob = activeId ? jobs.find((j) => `job-${j.id}` === activeId) : null;

  return (
    <PageContainer
      maxWidth="100%"
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
      </Box>

      {/* Search + actions bar */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          mb: 3,
          flexWrap: 'wrap',
          alignItems: 'stretch',
          alignContent: 'center',
          flexShrink: 0,
        }}
      >
        <TextField
          size="small"
          placeholder="Search job title, company, or type..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start" sx={{ ml: 0.5 }}>
                <SearchRoundedIcon sx={{ color: 'var(--text-muted)', fontSize: 20 }} />
              </InputAdornment>
            ),
            sx: {
              py: 1.25,
              pl: 1.5,
              fontSize: '0.9375rem',
            },
          }}
          sx={{
            flex: '1 1 360px',
            minWidth: 280,
            '& .MuiOutlinedInput-root': {
              bgcolor: 'var(--bg-light)',
              borderRadius: 2,
              border: '1px solid var(--border-color)',
              '&:hover': { bgcolor: 'var(--light-blue-bg-02)' },
              '&.Mui-focused': {
                bgcolor: '#ffffff',
                borderColor: 'var(--primary)',
                boxShadow: '0 0 0 1px var(--primary)',
              },
            },
          }}
        />
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            flexShrink: 0,
          }}
        >
          <Button
            variant="outlined"
            size="medium"
            startIcon={<FilterListRoundedIcon sx={{ fontSize: 18 }} />}
            sx={{
              px: 2,
              py: 1.25,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
              borderColor: 'var(--border-color)',
              bgcolor: 'var(--bg-paper)',
              color: 'var(--text-primary)',
              '&:hover': {
                borderColor: 'var(--border-hover)',
                bgcolor: 'var(--bg-light)',
              },
            }}
          >
            Filter
          </Button>
          <Button
            variant="outlined"
            size="medium"
            startIcon={<SwapVertRoundedIcon sx={{ fontSize: 18 }} />}
            sx={{
              px: 2,
              py: 1.25,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
              borderColor: 'var(--border-color)',
              bgcolor: 'var(--bg-paper)',
              color: 'var(--text-primary)',
              '&:hover': {
                borderColor: 'var(--border-hover)',
                bgcolor: 'var(--bg-light)',
              },
            }}
          >
            Sort
          </Button>
          <IconButton
            onClick={fetchJobs}
            disabled={loading}
            sx={{
              width: 44,
              height: 44,
              border: '1px solid',
              borderColor: 'var(--border-color)',
              borderRadius: 2,
              bgcolor: 'var(--bg-paper)',
              color: 'var(--text-secondary)',
              '&:hover': {
                bgcolor: 'var(--bg-light)',
                borderColor: 'var(--border-hover)',
              },
            }}
          >
            <RefreshRoundedIcon />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon sx={{ fontSize: 20 }} />}
            sx={{
              px: 2.5,
              py: 1.25,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.9375rem',
              bgcolor: 'var(--primary)',
              boxShadow: 'none',
              '&:hover': {
                bgcolor: 'var(--primary-light)',
                boxShadow: 'none',
              },
            }}
          >
            Add
          </Button>
        </Box>
      </Box>

      {/* Kanban board */}
      {loading ? (
        <Box
          sx={{
            display: 'flex',
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 360,
          }}
        >
          <CircularProgress size={32} />
        </Box>
      ) : jobs.length === 0 ? (
        <Card
          sx={{
            flex: 1,
            borderRadius: 2,
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            bgcolor: '#ffffff',
            py: 8,
            px: 4,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <Typography variant="body1" color="var(--text-secondary)" sx={{ mb: 1.5 }}>
            No jobs yet. Use the HireMate Chrome extension on career pages to save jobs and track
            your applications.
          </Typography>
          <Typography variant="body2" color="var(--text-muted)">
            Drag cards between columns to update status.
          </Typography>
        </Card>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <Box
            sx={{
              display: 'flex',
              gap: 2.5,
              flex: 1,
              minHeight: 0,
              width: '100%',
              overflowX: 'auto',
              overflowY: 'hidden',
              pb: 3,
              pt: 0.5,
              alignItems: 'stretch',
            }}
          >
            {STATUSES.map((status) => (
              <Column
                key={status.id}
                status={status}
                jobs={jobsByStatus[status.id] || []}
                isOver={overId === status.id}
              />
            ))}
          </Box>

          <DragOverlay dropAnimation={null}>
            {activeJob ? <DraggingCard job={activeJob} /> : null}
          </DragOverlay>
        </DndContext>
      )}

      {updatingId && (
        <Box
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
          }}
        >
          <CircularProgress size={16} sx={{ color: 'white' }} />
          <Typography variant="caption">Updating...</Typography>
        </Box>
      )}
    </PageContainer>
  );
}
