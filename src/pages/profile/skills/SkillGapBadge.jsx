import { Chip } from '@mui/material';
import { SKILL_GAP_TYPES } from './constants';

const BADGE_CONFIG = {
  [SKILL_GAP_TYPES.MATCH]: { label: 'Match', color: 'success', size: 'small' },
  [SKILL_GAP_TYPES.CORE]: { label: 'Core', color: 'primary', size: 'small' },
  [SKILL_GAP_TYPES.SUPPORTING]: { label: 'Supporting', variant: 'outlined', size: 'small' },
  [SKILL_GAP_TYPES.EMERGING]: { label: 'Emerging', variant: 'outlined', size: 'small' },
  [SKILL_GAP_TYPES.MISSING]: { label: 'Missing', color: 'error', size: 'small' },
  [SKILL_GAP_TYPES.BONUS]: { label: 'Bonus', color: 'info', size: 'small' },
};

export default function SkillGapBadge({ type }) {
  const config = BADGE_CONFIG[type];
  if (!config) return null;

  return (
    <Chip
      label={config.label}
      size={config.size}
      color={config.color}
      variant={config.variant ?? 'filled'}
      sx={{
        height: 20,
        fontSize: 10,
        fontWeight: 600,
        '& .MuiChip-label': { px: 0.75 },
      }}
    />
  );
}
