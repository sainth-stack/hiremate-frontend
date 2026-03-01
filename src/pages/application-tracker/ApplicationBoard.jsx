import { memo } from 'react';
import { Box } from '@mui/material';
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
  closestCorners,
} from '@dnd-kit/core';
import Column from './Column';
import { STATUSES } from './constants';
import { motion } from 'framer-motion';

const dropAnimation = {
  keyframes: ({ transform }) => [
    { transform: transform.initial },
    { transform: transform.final },
  ],
  duration: 200,
  easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
};

function DraggingCard({ job }) {
  return (
    <motion.div
      initial={{ scale: 1, rotate: 0 }}
      animate={{
        scale: 1.02,
        boxShadow: '0 16px 32px rgba(0,0,0,0.15)',
      }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <Box
        role="status"
        aria-live="polite"
        aria-label={`Dragging ${job.position_title || 'job'} to new column`}
        sx={{
          borderRadius: 2,
          border: '2px solid',
          borderColor: 'var(--primary)',
          boxShadow: '0 12px 24px rgba(0,0,0,0.12)',
          maxWidth: 280,
          bgcolor: 'var(--bg-paper)',
          p: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1.5,
              bgcolor: 'var(--light-blue-bg-08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Box
              component="span"
              sx={{
                fontWeight: 700,
                fontSize: '0.875rem',
                color: 'var(--primary)',
              }}
            >
              {(job.company || '?')[0].toUpperCase()}
            </Box>
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box component="span" sx={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
              {job.position_title || 'Untitled'}
            </Box>
            <Box component="span" sx={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              {job.company || '—'}
            </Box>
          </Box>
        </Box>
      </Box>
    </motion.div>
  );
}

function ApplicationBoard({
  jobsByStatus,
  activeId,
  overId,
  onDragStart,
  onDragOver,
  onDragEnd,
  onEditJob,
  onDeleteJob,
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  const allJobs = jobsByStatus ? Object.values(jobsByStatus).flat() : [];
  const activeJob = activeId ? allJobs.find((j) => `job-${j.id}` === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      accessibility={{
        announcements: {
          onDragStart: ({ active }) => {
            const job = allJobs.find((j) => `job-${j.id}` === active.id);
            return `Picked up ${job?.position_title || 'job'}. Drag to a column to move.`;
          },
          onDragOver: ({ active, over }) => {
            if (!over) return '';
            const status = STATUSES.find((s) => s.id === over.id);
            return status ? `Over ${status.label} column` : '';
          },
          onDragEnd: ({ active, over }) => {
            const job = allJobs.find((j) => `job-${j.id}` === active.id);
            if (!over) return 'Cancelled';
            const status = STATUSES.find((s) => s.id === over.id);
            return status
              ? `Dropped ${job?.position_title || 'job'} in ${status.label}`
              : 'Cancelled';
          },
        },
      }}
    >
      <Box
        role="application"
        aria-label="Application tracker kanban board. Drag job cards between columns to update status."
        sx={{
          display: 'flex',
          gap: 3,
          overflowX: 'auto',
          overflowY: 'hidden',
          pb: 2,
          mt:2,
          pt: 0.5,
          alignItems: 'flex-start',
          minHeight: 400,
          '&::-webkit-scrollbar': { height: 8 },
          '&::-webkit-scrollbar-track': { bgcolor: 'var(--bg-light)', borderRadius: 4 },
          '&::-webkit-scrollbar-thumb': { bgcolor: 'var(--border-color)', borderRadius: 4 },
        }}
      >
        {STATUSES.map((status, i) => (
          <Column
            key={status.id}
            status={status}
            jobs={jobsByStatus[status.id] || []}
            isOver={overId === status.id}
            activeId={activeId}
            onEditJob={onEditJob}
            onDeleteJob={onDeleteJob}
            index={i}
          />
        ))}
      </Box>

      <DragOverlay dropAnimation={dropAnimation}>
        {activeJob ? <DraggingCard job={activeJob} /> : null}
      </DragOverlay>
    </DndContext>
  );
}

export default memo(ApplicationBoard);
