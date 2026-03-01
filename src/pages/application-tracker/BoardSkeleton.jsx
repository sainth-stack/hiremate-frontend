import { memo } from 'react';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';

const columnVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.3, ease: 'easeOut' },
  }),
};

function CardSkeleton() {
  return (
    <Box
      sx={{
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'var(--border-color)',
        bgcolor: 'var(--bg-paper)',
        p: 2,
      }}
    >
      <Box sx={{ display: 'flex', gap: 1.25 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 1.5,
            bgcolor: 'var(--light-blue-bg-02)',
            flexShrink: 0,
          }}
        />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box
            sx={{
              height: 16,
              width: '80%',
              borderRadius: 1,
              bgcolor: 'var(--light-blue-bg-02)',
              mb: 0.75,
            }}
          />
          <Box
            sx={{
              height: 12,
              width: '60%',
              borderRadius: 1,
              bgcolor: 'var(--light-blue-bg-02)',
              mb: 0.5,
            }}
          />
          <Box
            sx={{
              height: 10,
              width: '40%',
              borderRadius: 1,
              bgcolor: 'var(--light-blue-bg-02)',
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}

function ColumnSkeleton({ index }) {
  return (
    <motion.div
      custom={index}
      variants={columnVariants}
      initial="hidden"
      animate="visible"
      style={{
        flex: '0 0 280px',
        minWidth: 280,
        width: 280,
        display: 'flex',
        flexDirection: 'column',
        alignSelf: 'flex-start',
      }}
    >
      <Box
        sx={{
          borderRadius: 2,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          bgcolor: 'var(--bg-paper)',
          border: '1px solid',
          borderColor: 'var(--border-color)',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            p: 2,
            pb: 1.5,
            borderBottom: '1px solid',
            borderColor: 'rgba(0,0,0,0.06)',
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1.5,
              bgcolor: 'var(--light-blue-bg-02)',
            }}
          />
          <Box sx={{ flex: 1 }}>
            <Box sx={{ height: 18, width: 80, borderRadius: 1, bgcolor: 'var(--light-blue-bg-02)', mb: 0.5 }} />
            <Box sx={{ height: 14, width: 40, borderRadius: 1, bgcolor: 'var(--light-blue-bg-02)' }} />
          </Box>
        </Box>
        <Box sx={{ p: 2, pt: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {[1, 2, 3].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </Box>
      </Box>
    </motion.div>
  );
}

function BoardSkeleton() {
  return (
    <Box
      role="status"
      aria-label="Loading application tracker"
      sx={{
        display: 'flex',
        gap: 2,
        overflowX: 'hidden',
        pb: 3,
        pt: 0.5,
        alignItems: 'stretch',
        minHeight: 400,
      }}
    >
      {[0, 1, 2, 3].map((i) => (
        <ColumnSkeleton key={i} index={i} />
      ))}
    </Box>
  );
}

export default memo(BoardSkeleton);
