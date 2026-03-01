import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Switch,
} from '@mui/material';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import PhoneAndroidRoundedIcon from '@mui/icons-material/PhoneAndroidRounded';
import WorkOutlineRoundedIcon from '@mui/icons-material/WorkOutlineRounded';
import RecommendRoundedIcon from '@mui/icons-material/RecommendRounded';
import RecordVoiceOverRoundedIcon from '@mui/icons-material/RecordVoiceOverRounded';
import WbSunnyRoundedIcon from '@mui/icons-material/WbSunnyRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { NavLink } from 'react-router-dom';
import { logout } from '../../store/auth/authSlice';
import { toggleTheme } from '../../store/theme/themeSlice';
import SignOutConfirmDialog from './SignOutConfirmDialog';

const PAGES = [
  { label: 'Dashboard', path: '/', icon: DashboardRoundedIcon },
  { label: 'Application Tracker', path: '/application-tracker', icon: PhoneAndroidRoundedIcon },

  { label: 'Resume Generator', path: '/resume-generator/build', icon: WorkOutlineRoundedIcon },
  {label:'AI Resume Studio',path:'/ai-resume-studio',icon:AutoAwesomeIcon},
   { label: 'Interview practice', path: '/interview-practice', icon: RecordVoiceOverRoundedIcon },
  // { label: 'Job Recommendations', path: '/job-recommendations', icon: RecommendRoundedIcon },
];

const MORE = [
  { label: 'Profile', path: '/profile', icon: PersonRoundedIcon },
  { label: 'Settings', path: '/settings', icon: SettingsRoundedIcon },
];

function NavSection({ items, location }) {
  return items.map(({ label, path, icon: Icon }) => {
    const isActive =
      path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
    return (
      <ListItemButton
        key={path}
        component={NavLink}
        to={path}
        selected={isActive}
        sx={{
          borderRadius: 2,
          mb: 0.5,
          '&.Mui-selected': {
            bgcolor: 'var(--sidebar-item-active-bg)',
            color: 'var(--sidebar-item-active-color)',
            '& .MuiListItemIcon-root': { color: 'var(--sidebar-item-active-color)' },
            '&:hover': { bgcolor: 'var(--light-blue-bg-08)' },
          },
          '&:hover': { bgcolor: 'var(--sidebar-item-hover-bg)' },
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: 40,
            color: isActive ? 'var(--sidebar-item-active-color)' : 'var(--text-secondary)',
          }}
        >
          <Icon fontSize="small" />
        </ListItemIcon>
        <ListItemText
          primary={label}
          primaryTypographyProps={{
            fontSize: 'var(--font-size-helper)',
            fontWeight: isActive ? 600 : 500,
          }}
        />
      </ListItemButton>
    );
  });
}

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const darkMode = useSelector((state) => state.theme.darkMode);
  const [signOutDialogOpen, setSignOutDialogOpen] = useState(false);

  const openSignOutDialog = () => setSignOutDialogOpen(true);
  const closeSignOutDialog = () => setSignOutDialogOpen(false);
  const confirmSignOut = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  return (
    <Box
      component="nav"
      sx={{
        width: 'var(--sidebar-width)',
        flexShrink: 0,
        bgcolor: 'var(--sidebar-bg)',
        boxShadow: 'var(--sidebar-shadow)',
        height: 'calc(100vh - var(--navbar-height))',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', py: 2, px: 1.5 }}>
        <Typography
          sx={{
            fontSize: '0.6875rem',
            fontWeight: 700,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            px: 2,
            mb: 1,
          }}
        >
          PAGES
        </Typography>
        <List disablePadding>
          <NavSection items={PAGES} location={location} />
        </List>

        <Typography
          sx={{
            fontSize: '0.6875rem',
            fontWeight: 700,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            px: 2,
            mb: 1,
            mt: 3,
          }}
        >
          MORE
        </Typography>
        <List disablePadding>
          <NavSection items={MORE} location={location} />
          <ListItemButton
            onClick={openSignOutDialog}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              '&:hover': { bgcolor: 'var(--sidebar-item-hover-bg)' },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: 'var(--text-secondary)' }}>
              <LogoutRoundedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Sign Out"
              primaryTypographyProps={{
                fontSize: 'var(--font-size-helper)',
                fontWeight: 500,
              }}
            />
          </ListItemButton>
        </List>
      </Box>

      <Box sx={{ flexShrink: 0, marginTop: 'auto', p: 1.5 }}>
        {/* Theme toggle */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 1.5,
            borderRadius: 2,
            bgcolor: 'var(--bg-paper)',
            border: 1,
            borderColor: 'var(--border-color)',
            mb: 1.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {darkMode ? (
              <>
                <DarkModeRoundedIcon sx={{ fontSize: 20, color: 'var(--primary-light)' }} />
                <Typography sx={{ fontSize: 'var(--font-size-helper)', fontWeight: 500 }}>
                  Dark
                </Typography>
              </>
            ) : (
              <>
                <WbSunnyRoundedIcon sx={{ fontSize: 20, color: 'var(--warning)' }} />
                <Typography sx={{ fontSize: 'var(--font-size-helper)', fontWeight: 500 }}>
                  Light
                </Typography>
              </>
            )}
          </Box>
          <Switch
            size="small"
            checked={darkMode}
            onChange={() => dispatch(toggleTheme())}
          />
        </Box>

        {/* Chrome Extension card */}
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            bgcolor: 'var(--primary)',
            color: 'var(--white)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Typography sx={{ fontSize: 'var(--font-size-helper)', fontWeight: 700, mb: 0.5 }}>
            Install Our Chrome Extension!
          </Typography>
          <Typography sx={{ fontSize: '0.8125rem', opacity: 0.95, mb: 1.5 }}>
            Apply jobs faster
          </Typography>
          <Box
            component="button"
            sx={{
              py: 0.75,
              px: 1.5,
              borderRadius: 1,
              border: 'none',
              bgcolor: 'var(--white)',
              color: 'var(--primary)',
              fontSize: 'var(--font-size-helper)',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Install
          </Box>
        </Box>
      </Box>
      <SignOutConfirmDialog
        open={signOutDialogOpen}
        onClose={closeSignOutDialog}
        onConfirm={confirmSignOut}
      />
    </Box>
  );
}
