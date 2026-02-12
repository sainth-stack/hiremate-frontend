import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { logout } from '../../store/auth/authSlice';

export default function Navbar({ logo = 'HIREMATEAI', showLogout = true }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        height: 'var(--navbar-height)',
        bgcolor: 'var(--navbar-bg)',
        color: 'var(--text-primary)',
        borderBottom: 1,
        borderColor: 'var(--navbar-border)',
      }}
    >
      <Toolbar
        disableGutters
        sx={{
          minHeight: 'var(--navbar-height) !important',
          px: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography
          component="span"
          sx={{
            fontSize: 'var(--font-size-page-title)',
            fontWeight: 700,
            color: 'var(--primary)',
            letterSpacing: '-0.02em',
          }}
        >
          {logo}
        </Typography>
        {showLogout && (
          <Button
            variant="outlined"
            color="primary"
            size="medium"
            startIcon={<LogoutRoundedIcon />}
            onClick={handleLogout}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              fontSize: 'var(--font-size-helper)',
              borderColor: 'var(--border-color)',
              color: 'var(--primary)',
              '&:hover': {
                borderColor: 'var(--primary)',
                bgcolor: 'var(--sidebar-item-hover-bg)',
              },
            }}
          >
            Logout
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}
