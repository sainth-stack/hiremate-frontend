import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
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
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { Tooltip } from '@mui/material';
import { logout } from '../../store/auth/authSlice';
import SignOutConfirmDialog from './SignOutConfirmDialog';
import logoImg from '../../assets/logo.png';

const menuItems = [
  { label: 'Profile', path: '/profile', icon: PersonRoundedIcon },
  { label: 'Subscription & Billing', path: '/pricing', icon: CreditCardRoundedIcon },
  { label: 'Settings', path: '/settings', icon: SettingsRoundedIcon },
  { label: 'Help & Support', path: '/help', icon: HelpOutlineRoundedIcon },
];

export default function Navbar({ showProfile = true }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [signOutDialogOpen, setSignOutDialogOpen] = useState(false);
  const open = Boolean(anchorEl);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const displayName = user
    ? [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email
    : '';
  const displayEmail = user?.email || '';
  const avatarLetter = (user?.first_name?.[0] || user?.email?.[0] || '?').toUpperCase();

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
        height: '60px',
        bgcolor: 'var(--navbar-bg)',
        color: 'var(--text-primary)',
        boxShadow: '0 1px 0 0 var(--border-color)',
      }}
    >
      <Toolbar
        disableGutters
        sx={{
          minHeight: '60px !important',
          px: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            component="img"
            src={logoImg}
            alt="OpsBrain"
            sx={{ height: 36, objectFit: 'contain' }}
          />
        </Box>
        {showProfile && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            {/* Token Wallet Display */}
            {(() => {
              const isUnlimited = user?.token_balance === -1;
              const balance = user?.token_balance || 0;
              const isLow = !isUnlimited && balance > 0 && balance < 5000;
              const isEmpty = !isUnlimited && balance <= 0;
              const accentColor = isEmpty ? '#ef4444' : isLow ? '#f59e0b' : '#0891b2';
              const bgColor = isEmpty
                ? 'rgba(239,68,68,0.08)'
                : isLow
                ? 'rgba(245,158,11,0.08)'
                : 'rgba(6,182,212,0.08)';
              const borderColor = isEmpty
                ? 'rgba(239,68,68,0.3)'
                : isLow
                ? 'rgba(245,158,11,0.3)'
                : 'rgba(6,182,212,0.2)';

              return (
                <Tooltip
                  title={
                    isEmpty
                      ? 'Tokens exhausted — upgrade to continue using AI features'
                      : isLow
                      ? `Only ${balance.toLocaleString()} tokens left — consider upgrading`
                      : 'View usage & limits'
                  }
                  arrow
                >
                  <Box
                    onClick={() => navigate('/usage')}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      bgcolor: bgColor,
                      px: 1.5,
                      py: 0.75,
                      borderRadius: '20px',
                      border: `1px solid ${borderColor}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        opacity: 0.85,
                        transform: 'translateY(-1px)',
                      },
                    }}
                  >
                    {(isEmpty || isLow) ? (
                      <WarningAmberRoundedIcon sx={{ fontSize: 18, color: accentColor }} />
                    ) : (
                      <AccountBalanceWalletRoundedIcon sx={{ fontSize: 18, color: accentColor }} />
                    )}
                    <Box>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: accentColor, lineHeight: 1 }}>
                        {isUnlimited ? 'Unlimited' : balance.toLocaleString()}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: '0.625rem',
                          fontWeight: 600,
                          color: accentColor,
                          opacity: 0.8,
                          textTransform: 'uppercase',
                          letterSpacing: '0.02em',
                          mt: 0.25,
                        }}
                      >
                        {isEmpty ? 'Empty' : isLow ? 'Low' : 'Tokens'}
                      </Typography>
                    </Box>
                  </Box>
                </Tooltip>
              );
            })()}

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
                  background: 'linear-gradient(135deg, #1E3A8A 0%, #06B6D4 100%)',
                  fontSize: '0.95rem',
                }}
              >
                {avatarLetter}
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
                  {displayName || 'User'}
                </Typography>
                <Typography
                  sx={{
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary, #64748b)',
                    lineHeight: 1.2,
                  }}
                >
                  {displayEmail}
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
                  {displayName || 'User'}
                </Typography>
                <Typography
                  sx={{
                    fontSize: '0.8125rem',
                    color: 'var(--text-secondary, #64748b)',
                    mt: 0.25,
                  }}
                >
                  {displayEmail}
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
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
