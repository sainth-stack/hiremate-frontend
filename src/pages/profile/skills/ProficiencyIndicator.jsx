import { Box, Typography } from '@mui/material';

const LEVEL_MAP = { Beginner: 1, Intermediate: 2, Advanced: 3, Expert: 4 };
const MAX = 4;

export default function ProficiencyIndicator({ level, showLabel = true, size = 'medium' }) {
  const value = LEVEL_MAP[level] ?? 0;
  const percent = (value / MAX) * 100;
  const height = size === 'small' ? 6 : 8;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
      <Box
        sx={{
          flex: 1,
          height,
          borderRadius: 1,
          bgcolor: 'rgba(0,0,0,0.06)',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            width: `${percent}%`,
            height: '100%',
            borderRadius: 1,
            bgcolor: 'var(--primary)',
            transition: 'width 0.25s ease',
          }}
        />
      </Box>
      {showLabel && level && (
        <Typography variant="caption" sx={{ fontSize: 11, color: 'var(--text-secondary)', flexShrink: 0 }}>
          {level}
        </Typography>
      )}
    </Box>
  );
}
