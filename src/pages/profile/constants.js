export const TAB_LABELS = [
  'Profile',
  'Experience',
  'Education',
  'Skills',
  'Projects',
  'Preferences',
  'Links',
  'Review',
];

// Simple, consistent radii: 8px inputs, 12px cards/containers
export const INPUT_BORDER_RADIUS = 8;
export const CARD_BORDER_RADIUS = 4;

export const FORM_GRID_SX = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
  gap: 2,
  width: '100%',
  '& .custom-input': { marginBottom: 0 },
  '& .custom-select': { marginBottom: 0 },
};

export const SECTION_TITLE_SX = {
  fontSize: 16,
  fontWeight: 600,
  color: 'var(--text-primary)',
  mb: 2,
  display: 'block',
};

export const FIELD_LABEL_SX = {
  fontSize: 12,
  textTransform: 'uppercase',
  letterSpacing: 0.5,
  color: 'var(--text-secondary)',
};

export const INPUT_TEXT_SX = {
  '& .MuiOutlinedInput-input': { fontSize: 14 },
  '& .MuiInputLabel-root': { fontSize: 12 },
};
