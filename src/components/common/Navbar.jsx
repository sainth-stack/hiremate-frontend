import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import CreditCardRoundedIcon from '@mui/icons-material/CreditCardRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { logout } from '../../store/auth/authSlice';
import SignOutConfirmDialog from './SignOutConfirmDialog';

// Static profile values
const PROFILE_USER_NAME = 'Basam Gurusai Kumar Reddy';
const PROFILE_EMAIL = 'basamgurusai123@gmail.com';

const menuItems = [
  { label: 'Profile', path: '/profile', icon: PersonRoundedIcon },
  { label: 'Subscription & Billing', path: '/pricing', icon: CreditCardRoundedIcon },
  { label: 'Settings', path: '/settings', icon: SettingsRoundedIcon },
  { label: 'Help & Support', path: '/help', icon: HelpOutlineRoundedIcon },
];

export default function Navbar({ logo = 'HIREMATEAI', showProfile = true }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [signOutDialogOpen, setSignOutDialogOpen] = useState(false);
  const open = Boolean(anchorEl);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (path) => {
    handleMenuClose();
    navigate(path);
  };

  const openSignOutDialog = () => {
    handleMenuClose();
    setSignOutDialogOpen(true);
  };

  const closeSignOutDialog = () => setSignOutDialogOpen(false);

  const confirmSignOut = () => {
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
        boxShadow: 'var(--navbar-shadow)',
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
        {showProfile && (
          <>
            <Box
              onClick={handleMenuOpen}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                cursor: 'pointer',
                py: 0.5,
                px: 1,
                borderRadius: 1,
                '&:hover': { bgcolor: 'var(--sidebar-item-hover-bg)' },
              }}
            >
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: '#f97316',
                  fontSize: '0.95rem',
                }}
              >
                G
              </Avatar>
              <Box sx={{ textAlign: 'left' }}>
                <Typography
                  sx={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    lineHeight: 1.2,
                    color: 'var(--text-primary)',
                  }}
                >
                  {PROFILE_USER_NAME}
                </Typography>
                <Typography
                  sx={{
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary, #64748b)',
                    lineHeight: 1.2,
                  }}
                >
                  {PROFILE_EMAIL}
                </Typography>
              </Box>
              <KeyboardArrowDownRoundedIcon
                sx={{
                  fontSize: 20,
                  color: 'var(--text-secondary, #64748b)',
                  transform: open ? 'rotate(180deg)' : 'rotate(0)',
                  transition: 'transform 0.2s',
                }}
              />
            </Box>
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleMenuClose}
              onClick={handleMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              slotProps={{
                paper: {
                  sx: {
                    mt: 1.5,
                    minWidth: 240,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                    borderRadius: 2,
                  },
                },
              }}
            >
              <Box sx={{ px: 2, py: 2 }}>
                <Typography sx={{ fontWeight: 600, fontSize: '0.9375rem' }}>
                  {PROFILE_USER_NAME}
                </Typography>
                <Typography
                  sx={{
                    fontSize: '0.8125rem',
                    color: 'var(--text-secondary, #64748b)',
                    mt: 0.25,
                  }}
                >
                  {PROFILE_EMAIL}
                </Typography>
              </Box>
              <Divider />
              {menuItems.map(({ label, path, icon: Icon }) => (
                <MenuItem key={path} onClick={() => handleMenuItemClick(path)}>
                  <ListItemIcon>
                    <Icon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={label} />
                </MenuItem>
              ))}
              <Divider />
              <MenuItem onClick={openSignOutDialog}>
                <ListItemIcon>
                  <LogoutRoundedIcon fontSize="small" sx={{ color: 'error.main' }} />
                </ListItemIcon>
                <ListItemText
                  primary="Sign Out"
                  primaryTypographyProps={{ sx: { color: 'error.main', fontWeight: 600 } }}
                />
              </MenuItem>
            </Menu>
            <SignOutConfirmDialog
              open={signOutDialogOpen}
              onClose={closeSignOutDialog}
              onConfirm={confirmSignOut}
            />
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}
