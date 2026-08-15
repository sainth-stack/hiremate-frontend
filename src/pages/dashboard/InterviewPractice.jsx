import { useState } from 'react';
import { Box, Tab, Tabs } from '@mui/material';
import PrepSessionsTab from './interview-practice/PrepSessionsTab';
import AdminInterviewsTab from './interview-practice/AdminInterviewsTab';

export default function InterviewPractice() {
  const [tab, setTab] = useState('prep');

  return (
    <Box sx={{ height: 'calc(100vh - var(--navbar-height))', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Box sx={{ px: { xs: 2, sm: 3 }, pt: 2, pb: 0, bgcolor: 'background.paper', borderBottom: '1px solid var(--divider)', flexShrink: 0 }}>
        <Tabs
          value={tab}
          onChange={(_, value) => setTab(value)}
          sx={{
            minHeight: 44,
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 700, fontSize: 14, minHeight: 44 },
          }}
        >
          <Tab label="Prep Sessions" value="prep" />
          <Tab label="Admin Interviews" value="admin" />
        </Tabs>
      </Box>
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {tab === 'prep' ? <PrepSessionsTab /> : <AdminInterviewsTab />}
      </Box>
    </Box>
  );
}
