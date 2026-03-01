import { Box, Tabs, Tab } from '@mui/material';
import { TAB_LABELS, CARD_BORDER_RADIUS } from '../constants';

const tabsContainerSx = {
  bgcolor: '#fff',
  borderRadius: CARD_BORDER_RADIUS,
  boxShadow: '0px 4px 16px rgba(0,0,0,0.04)',
  border: '1px solid rgba(0,0,0,0.06)',
  p: 1,
  mb: 3,
};

const tabsSx = {
  minHeight: 48,
  '& .MuiTabs-flexContainer': {
    gap: 0,
  },
  '& .MuiTabs-indicator': {
    height: 3,
    borderRadius: '3px 3px 0 0',
    backgroundColor: 'var(--primary)',
  },
  '& .MuiTab-root': {
    minHeight: 48,
    textTransform: 'uppercase',
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--text-secondary)',
    '&.Mui-selected': {
      fontWeight: 700,
      color: 'var(--primary)',
    },
  },
};

export default function ProfileTabs({ value, onChange, children }) {
  return (
    <Box sx={tabsContainerSx}>
      <Tabs
        value={value}
        onChange={onChange}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={tabsSx}
      >
        {TAB_LABELS.map((label, idx) => (
          <Tab key={idx} label={label} id={`profile-tab-${idx}`} aria-controls={`profile-tabpanel-${idx}`} />
        ))}
      </Tabs>
      <Box
        role="tabpanel"
        id={`profile-tabpanel-${value}`}
        aria-labelledby={`profile-tab-${value}`}
        sx={{
          px: { xs: 2, sm: 3 },
          py: 3,
          bgcolor: 'rgba(0,0,0,0.02)',
          borderRadius: `0 0 ${CARD_BORDER_RADIUS}px ${CARD_BORDER_RADIUS}px`,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
