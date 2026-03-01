import { memo, useState } from 'react';
import { Box, Typography, IconButton, Button } from '@mui/material';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import { useDroppable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import JobCard from './JobCard';

const columnVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.35, ease: 'easeOut' },
  }),
};

function EmptyColumnState({ status }) {
  const Icon = status.icon;
  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 6,
        px: 2,
        borderRadius: 2,
        bgcolor: 'transparent',
      }}
    >
      <Icon sx={{ color: status.color, fontSize: 28, mb: 1 }} />
      <Typography variant="h6" fontWeight={600} color="var(--text-primary)" sx={{ textAlign: 'center', mt: 1 }}>
        No applications yet
      </Typography>
      <Typography variant="caption" color="var(--text-muted)" sx={{ textAlign: 'center', mt: 0.5 }}>
        Start tracking your job search
      </Typography>
    </Box>
  );
}

function Column({ status, jobs, isOver, activeId, onEditJob, onDeleteJob, index = 0 }) {
  const { setNodeRef } = useDroppable({
    id: status.id,
    data: { statusId: status.id },
  });
  const Icon = status.icon;
  const isEmpty = jobs.length === 0;
  const [visibleCount, setVisibleCount] = useState(10);
  const visibleJobs = jobs.slice(0, visibleCount);

  return (
    <motion.div
      custom={index}
      variants={columnVariants}
      initial="hidden"
      animate="visible"
      style={{
        flex: '0 0 auto',
        minWidth: 320,
        maxWidth: 360,
        width: 320,
        minHeight: 0,
        height: '100%',
        maxHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        ref={setNodeRef}
        role="region"
        aria-label={`${status.label} column with ${jobs.length} job${jobs.length !== 1 ? 's' : ''}`}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0,
          borderRadius: 2,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          bgcolor: isOver ? 'var(--light-blue-bg-08)' : 'var(--bg-paper)',
          border: '1px solid',
          borderColor: isOver ? 'var(--primary)' : 'var(--border-color)',
          overflow: 'hidden',
          transition: 'border-color 0.2s ease, background-color 0.2s ease',
        }}
      >
        {/* Sticky column header */}
        <Box
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            p: 2,
            pb: 1.5,
            bgcolor: 'inherit',
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
              bgcolor: status.bgTint,
              flexShrink: 0,
            }}
          >
            <Icon sx={{ color: status.color, fontSize: 22 }} aria-hidden />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" fontWeight={600} color="var(--text-primary)" sx={{ lineHeight: 1.2 }}>
              {status.label}
            </Typography>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 24,
                height: 20,
                px: 1,
                borderRadius: 1,
                bgcolor: status.bgTint,
                mt: 0.25,
              }}
            >
              <Typography variant="caption" sx={{ color: status.color, fontWeight: 600, fontSize: '0.75rem' }}>
                {jobs.length}
              </Typography>
            </Box>
          </Box>
          <IconButton
            size="small"
            aria-label={`${status.label} column options`}
            sx={{
              color: 'var(--text-muted)',
              p: 0.5,
              '&:hover': { bgcolor: 'rgba(0,0,0,0.04)', color: 'var(--text-secondary)' },
            }}
          >
            <MoreVertRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        {/* Column content — scrollable, consistent gap between cards and below */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            flex: 1,
            minHeight: 0,
            p: 2,
            pt: 1.5,
            pb: 2,
            overflowY: 'auto',
            overflowX: 'hidden',
            '&::-webkit-scrollbar': { width: 8 },
            '&::-webkit-scrollbar-track': { bgcolor: 'rgba(0,0,0,0.04)', borderRadius: 4 },
            '&::-webkit-scrollbar-thumb': { bgcolor: 'var(--border-color)', borderRadius: 4 },
            '&::-webkit-scrollbar-thumb:hover': { bgcolor: 'var(--text-muted)' },
          }}
        >
          {isEmpty ? (
            <EmptyColumnState status={status} />
          ) : (
            <>
              {visibleJobs.map((job, i) => (
                <JobCard
                  key={job.id}
                  job={job}
                  isDragging={activeId === `job-${job.id}`}
                  onEdit={onEditJob}
                  onDelete={onDeleteJob}
                  index={i}
                />
              ))}
              {jobs.length > visibleCount && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                  <Button
                    size="small"
                    onClick={() => setVisibleCount((v) => v + 10)}
                    sx={{ textTransform: 'none', borderRadius: 2 }}
                  >
                    Load more
                  </Button>
                </Box>
              )}
            </>
          )}
        </Box>
      </Box>
    </motion.div>
  );
}

export default memo(Column);
