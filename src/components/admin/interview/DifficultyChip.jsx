import { Chip } from '@mui/material';
import { DIFFICULTY_CONFIG } from './constants';

export default function DifficultyChip({ difficulty, size = 'small' }) {
  const level = String(difficulty || 'medium').toLowerCase();
  const config = DIFFICULTY_CONFIG[level] || DIFFICULTY_CONFIG.medium;

  return (
    <Chip
      label={config.label}
      size={size}
      sx={{
        height: size === 'small' ? 22 : 26,
        fontWeight: 700,
        fontSize: size === 'small' ? 11 : 12,
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
