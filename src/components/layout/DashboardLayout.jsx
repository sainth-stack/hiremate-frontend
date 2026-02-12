import { Box } from '@mui/material';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../common/Navbar';
import Sidebar from '../common/Sidebar';

export default function DashboardLayout() {
  const location = useLocation();
  const profileOnly = location.state?.fromRegister === true;

  // After register: show profile page only (no navbar/sidebar)
  if (profileOnly) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'var(--bg-default)' }}>
        <Outlet />
      </Box>
    );
  }

  // Login / normal: full dashboard with navbar and sidebar
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'var(--bg-default)' }}>
      <Navbar />
      <Box
        sx={{
          display: 'flex',
          marginTop: 'var(--navbar-height)',
          height: 'calc(100vh - var(--navbar-height))',
          minHeight: 0,
        }}
      >
        <Sidebar />
        <Box
          component="main"
          sx={{
            flex: 1,
            overflow: 'auto',
            minHeight: 0,
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
