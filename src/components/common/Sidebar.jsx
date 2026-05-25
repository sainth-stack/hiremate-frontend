import { useState } from 'react';
import { useLocation, useNavigate, NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Avatar,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import SpaceDashboardRoundedIcon from '@mui/icons-material/SpaceDashboardRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import AssignmentTurnedInRoundedIcon from '@mui/icons-material/AssignmentTurnedInRounded';
import RecordVoiceOverRoundedIcon from '@mui/icons-material/RecordVoiceOverRounded';
import WbSunnyRoundedIcon from '@mui/icons-material/WbSunnyRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import CreditCardRoundedIcon from '@mui/icons-material/CreditCardRounded';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import ExtensionRoundedIcon from '@mui/icons-material/ExtensionRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import WorkOutlineRoundedIcon from '@mui/icons-material/WorkOutlineRounded';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import DataUsageRoundedIcon from '@mui/icons-material/DataUsageRounded';
import { logout } from '../../store/auth/authSlice';
import { toggleTheme } from '../../store/theme/themeSlice';
import { getProfileCompletion } from '../../pages/profile/utils/profileCompletion';
import { CHROME_EXTENSION_WEBSTORE_URL } from '../../utilities/const';
import SignOutConfirmDialog from './SignOutConfirmDialog';
import OpsBrainLogo from '../ui/OpsBrainLogo';

// ═══════════════════════════════════════════════════════════════════════════
// BRAND COLORS - OpsBrain Strict Palette
// ═══════════════════════════════════════════════════════════════════════════
const BRAND_COLORS = {
  PRIMARY_DARK: '#0F1E35',
  SECONDARY_BLUE: '#1E3A8A',
  ACCENT_CYAN: '#06B6D4',
  ACCENT_GREEN: '#10B981',
  ERROR: '#dc2626',
};

// ═══════════════════════════════════════════════════════════════════════════
// NAVIGATION CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════
const NAV_CONFIG = {
  workspace: [
    { 
      label: 'Dashboard', 
      path: '/', 
      icon: SpaceDashboardRoundedIcon 
    },
    { 
      label: 'Job Recommendation', 
      path: '/job-recommendation', 
      icon: WorkOutlineRoundedIcon 
    },
    { 
      label: 'Application Tracker', 
      path: '/application-tracker', 
      icon: AssignmentTurnedInRoundedIcon
    },
    { 
      label: 'AI Resume Studio', 
      path: '/ai-resume-studio', 
      icon: DescriptionRoundedIcon,
      badge: { label: 'AI', color: BRAND_COLORS.ACCENT_CYAN }
    },
    { 
      label: 'Interview Practice', 
      path: '/interview-practice', 
      icon: RecordVoiceOverRoundedIcon
    },
  ],
  account: [
    { 
      label: 'Profile', 
      path: '/profile', 
      icon: PersonOutlineRoundedIcon,
      showIncompleteIndicator: true
    },
    { 
      label: 'Usage & Limits', 
      path: '/usage', 
      icon: DataUsageRoundedIcon, 
      color: BRAND_COLORS.ACCENT_CYAN 
    },
    { 
      label: 'Settings', 
      path: '/settings', 
      icon: SettingsRoundedIcon
    },
  ],
  admin: [
    { 
      label: 'Admin', 
      path: '/admin', 
      icon: AdminPanelSettingsRoundedIcon,
      requiresAdmin: true
    },
    { 
      label: 'Token Usage', 
      path: '/admin/token-usage', 
      icon: DataUsageRoundedIcon,
      requiresAdmin: true
    },
  ],
  support: [
    { 
      label: 'Report an Issue', 
      path: '/report-issue', 
      icon: SupportAgentRoundedIcon 
    },
  ],
};

const USER_MENU_CONFIG = [
  { label: 'Profile', path: '/profile', icon: AccountCircleRoundedIcon },
  { label: 'Usage & Limits', path: '/usage', icon: DataUsageRoundedIcon },
  { label: 'Subscription & Billing', path: '/pricing', icon: CreditCardRoundedIcon },
  { label: 'Settings', path: '/settings', icon: SettingsRoundedIcon },
  { label: 'Help & Support', path: '/help', icon: HelpOutlineRoundedIcon },
];

// ═══════════════════════════════════════════════════════════════════════════
// SHARED COMPONENT: Section Label
// ═══════════════════════════════════════════════════════════════════════════
function SectionLabel({ children }) {
  return (
    <Typography
      sx={{
        fontSize: '0.6875rem',
        fontWeight: 700,
        letterSpacing: '0.1em',
        color: 'var(--text-muted)',
        px: 1.75,
        mt: 2.75,
        mb: 0.75,
        textTransform: 'uppercase',
        fontFamily: 'var(--font-family)',
        userSelect: 'none',
        lineHeight: 1,
      }}
    >
      {children}
    </Typography>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SHARED COMPONENT: Navigation Item
// ═══════════════════════════════════════════════════════════════════════════
function NavItem({ 
  label, 
  path, 
  icon: Icon, 
  danger = false,
  badge, 
  location, 
  incomplete,
  onClick 
}) {
  const exact = path === '/';
  const isActive = exact ? location.pathname === '/' : location.pathname.startsWith(path);
  const activeColor = danger ? 'var(--error)' : 'var(--sidebar-item-active-color)';

  const content = (
    <>
      {/* Icon container with brand-consistent styling */}
      <Box
        sx={{
          width: 34,
          height: 34,
          borderRadius: '9px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          bgcolor: isActive ? 'var(--sidebar-item-active-bg)' : 'transparent',
          border: isActive ? '1px solid var(--border-color)' : '1px solid transparent',
          transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Icon
          sx={{
            fontSize: 19,
            color: isActive ? activeColor : 'var(--text-muted)',
            transition: 'color 0.18s',
          }}
        />
      </Box>

      {/* Label text */}
      <Typography
        sx={{
          fontSize: '0.875rem',
          fontWeight: isActive ? 600 : 500,
          fontFamily: 'var(--font-family)',
          color: 'inherit',
          lineHeight: 1.2,
          userSelect: 'none',
          flex: 1,
        }}
      >
        {label}
      </Typography>

      {/* AI Badge - brand consistent */}
      {badge && (
        <Box
          sx={{
            px: 0.75,
            py: 0.25,
            borderRadius: '6px',
            bgcolor: isActive 
              ? `${badge.color}22` 
              : `${badge.color}12`,
            color: badge.color,
            fontSize: '0.625rem',
            fontWeight: 800,
            letterSpacing: '0.05em',
            fontFamily: 'var(--font-family)',
            lineHeight: 1,
          }}
        >
          {badge.label}
        </Box>
      )}

      {/* Incomplete indicator - brand consistent */}
      {incomplete && !isActive && !danger && (
        <Box
          sx={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            bgcolor: BRAND_COLORS.ACCENT_CYAN,
            flexShrink: 0,
            boxShadow: `0 0 0 2px ${BRAND_COLORS.ACCENT_CYAN}30`,
          }}
        />
      )}
    </>
  );

  const sx = {
    display: 'flex',
    alignItems: 'center',
    gap: 1.25,
    px: 1.25,
    py: 0.875,
    borderRadius: '11px',
    mb: 0.5,
    textDecoration: 'none',
    position: 'relative',
    color: isActive ? activeColor : 'var(--text-secondary)',
    bgcolor: isActive ? 'var(--sidebar-item-active-bg)' : 'transparent',
    border: `1px solid ${isActive ? 'rgba(30, 58, 138, 0.18)' : 'transparent'}`,
    transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    '&::before': {
      content: '""',
      position: 'absolute',
      left: -6,
      top: 8,
      bottom: 8,
      width: 3,
      borderRadius: 999,
      background: isActive ? 'linear-gradient(180deg, #1E3A8A 0%, #3B82F6 100%)' : 'transparent',
      opacity: isActive ? 1 : 0,
      transition: 'opacity 0.18s ease',
    },
    '&:hover': {
      bgcolor: isActive ? 'var(--sidebar-item-active-bg)' : 'var(--sidebar-item-hover-bg)',
      color: isActive ? activeColor : 'var(--text-primary)',
      transform: 'translateX(1px)',
    },
    '&:active': {
      transform: 'scale(0.98)',
    },
  };

  return onClick ? (
    <Box onClick={onClick} sx={sx}>
      {content}
    </Box>
  ) : (
    <Box component={NavLink} to={path} sx={sx}>
      {content}
    </Box>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT: Sidebar
// World-class SaaS navigation sidebar with perfect brand consistency
// ═══════════════════════════════════════════════════════════════════════════
export default function Sidebar() {
  // ─── Hooks & State ────────────────────────────────────────────────────────
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // ─── Redux Selectors ──────────────────────────────────────────────────────
  const darkMode = useSelector((state) => state.theme.darkMode);
  const isAdmin = useSelector((state) => state.auth?.user?.is_admin) === true;
  const user = useSelector((state) => state.auth.user);
  const profileForm = useSelector((state) => state.profile?.form);
  
  // ─── Computed Values ──────────────────────────────────────────────────────
  const { percent: profilePercent } = getProfileCompletion(profileForm);
  const profileIncomplete = profileForm != null && profilePercent < 100;
  
  const displayName = user
    ? [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email
    : '';
  const displayEmail = user?.email || '';
  const avatarLetter = (user?.first_name?.[0] || user?.email?.[0] || '?').toUpperCase();

  // ─── Local State ──────────────────────────────────────────────────────────
  const [signOutDialogOpen, setSignOutDialogOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const userMenuOpen = Boolean(userMenuAnchor);

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const openExtensionStore = () => {
    window.open(CHROME_EXTENSION_WEBSTORE_URL, '_blank', 'noopener,noreferrer');
  };

  const confirmSignOut = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <Box
      component="nav"
      aria-label="Main navigation"
      sx={{
        width: 'var(--sidebar-width)',
        flexShrink: 0,
        height: '100vh',
        bgcolor: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 100,
        overflow: 'hidden',
      }}
    >
      {/* ── Logo Section ── */}
      <Box
        sx={{
          px: 2.75,
          height: 72,
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
          borderBottom: '1px solid var(--border-color)',
          bgcolor: 'var(--sidebar-bg)',
        }}
      >
        <OpsBrainLogo variant="full" height={44} darkMode={darkMode} />
      </Box>

      {/* ── Scrollable Nav ── */}
      <Box 
        sx={{ 
          flex: 1, 
          minHeight: 0, 
          overflowY: 'auto', 
          px: 1.5, 
          py: 1.5,
          '&::-webkit-scrollbar': { width: 6 },
          '&::-webkit-scrollbar-thumb': { 
            backgroundColor: 'var(--border-color)', 
            borderRadius: 3 
          },
          '&::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
        }}
      >
        {/* Workspace Section */}
        <SectionLabel>Workspace</SectionLabel>
        {NAV_CONFIG.workspace.map((item) => (
          <NavItem 
            key={item.path} 
            {...item} 
            location={location} 
          />
        ))}

        {/* Account Section */}
        <SectionLabel>Account</SectionLabel>
        {NAV_CONFIG.account.map((item) => (
          <NavItem
            key={item.path}
            {...item}
            location={location}
            incomplete={item.showIncompleteIndicator ? profileIncomplete : undefined}
          />
        ))}

        {/* Admin Section - conditional rendering */}
        {isAdmin && (
          <>
            <SectionLabel>Admin</SectionLabel>
            {NAV_CONFIG.admin.map((item) => (
              <NavItem 
                key={item.path} 
                {...item} 
                location={location} 
              />
            ))}
          </>
        )}

        {/* Support Section */}
        <SectionLabel>Support</SectionLabel>
        {NAV_CONFIG.support.map((item) => (
          <NavItem 
            key={item.path} 
            {...item} 
            location={location} 
          />
        ))}

        {/* Sign Out - Special action item */}
        <NavItem
          label="Sign Out"
          path="/logout"
          icon={LogoutRoundedIcon}
          danger
          location={location}
          onClick={() => setSignOutDialogOpen(true)}
        />
      </Box>

      {/* ── Bottom Fixed Section ── */}
      <Box
        sx={{
          flexShrink: 0,
          px: 1.5,
          pb: 1.75,
          pt: 1.25,
          borderTop: '1px solid var(--border-color)',
          bgcolor: '#f8fafc',
        }}
      >
        {/* Theme toggle - streamlined */}
        <Box
          onClick={() => dispatch(toggleTheme())}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 1.5,
            py: 1,
            borderRadius: '11px',
            mb: 1.25,
            cursor: 'pointer',
            bgcolor: 'var(--bg-paper)',
            border: '1px solid var(--border-color)',
            transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              bgcolor: 'var(--sidebar-item-hover-bg)',
              borderColor: 'var(--border-color)',
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            {darkMode ? (
              <DarkModeRoundedIcon sx={{ fontSize: 16, color: BRAND_COLORS.ACCENT_CYAN }} />
            ) : (
              <WbSunnyRoundedIcon sx={{ fontSize: 16, color: BRAND_COLORS.ACCENT_CYAN }} />
            )}
            <Typography
              sx={{
                fontSize: '0.8125rem',
                fontWeight: 500,
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-family)',
                lineHeight: 1,
              }}
            >
              {darkMode ? 'Dark' : 'Light'} mode
            </Typography>
          </Box>
          {/* Toggle pill */}
          <Box
            sx={{
              width: 38,
              height: 20,
              borderRadius: '10px',
              bgcolor: darkMode ? 'var(--primary)' : 'var(--border-color)',
              position: 'relative',
              transition: 'background 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              flexShrink: 0,
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 3,
                left: darkMode ? 20 : 3,
                width: 14,
                height: 14,
                borderRadius: '50%',
                bgcolor: 'white',
                transition: 'left 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }}
            />
          </Box>
        </Box>

        {/* Chrome Extension CTA - refined */}
        <Box
          sx={{
            p: 1.5,
            borderRadius: '12px',
            background: 'linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)',
            border: '1px solid #dbe3f2',
            mb: 1.25,
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 8px 20px rgba(15, 23, 42, 0.06)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.875, mb: 0.75 }}>
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: '7px',
                bgcolor: `${BRAND_COLORS.SECONDARY_BLUE}12`,
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
              }}
            >
              <ExtensionRoundedIcon sx={{ fontSize: 14, color: BRAND_COLORS.SECONDARY_BLUE }} />
            </Box>
            <Typography
              sx={{
                fontSize: '0.8125rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-family)',
                lineHeight: 1,
              }}
            >
              Chrome Extension
            </Typography>
            <Box
              sx={{
                ml: 'auto',
                px: 0.75,
                py: 0.25,
                borderRadius: '5px',
                bgcolor: `${BRAND_COLORS.ACCENT_GREEN}14`,
                color: BRAND_COLORS.ACCENT_GREEN,
                fontSize: '0.625rem',
                fontWeight: 800,
                letterSpacing: '0.05em',
                fontFamily: 'var(--font-family)',
                lineHeight: 1,
              }}
            >
              FREE
            </Box>
          </Box>
          <Typography
            sx={{
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-family)',
              mb: 1.25,
              lineHeight: 1.5,
            }}
          >
            Apply to jobs faster with one click
          </Typography>
          <Box
            component="button"
            onClick={openExtensionStore}
            sx={{
              width: '100%',
              py: 0.875,
              borderRadius: '9px',
              border: 'none',
              background: `linear-gradient(135deg, ${BRAND_COLORS.SECONDARY_BLUE} 0%, ${BRAND_COLORS.PRIMARY_DARK} 100%)`,
              color: 'white',
              fontSize: '0.8125rem',
              fontWeight: 700,
              fontFamily: 'var(--font-family)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.625,
              boxShadow: `0 2px 8px ${BRAND_COLORS.SECONDARY_BLUE}40`,
              transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                background: `linear-gradient(135deg, ${BRAND_COLORS.PRIMARY_DARK} 0%, ${BRAND_COLORS.SECONDARY_BLUE} 100%)`,
                boxShadow: `0 4px 12px ${BRAND_COLORS.SECONDARY_BLUE}50`,
                transform: 'translateY(-1px)',
              },
              '&:active': { transform: 'translateY(0)' },
            }}
          >
            <BoltRoundedIcon sx={{ fontSize: 15 }} />
            Install Now
          </Box>
        </Box>

        {/* User profile card - polished */}
        <Box
          onClick={(e) => setUserMenuAnchor(e.currentTarget)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.125,
            px: 1.25,
            py: 1,
            borderRadius: '11px',
            cursor: 'pointer',
            border: '1px solid var(--border-color)',
            bgcolor: 'var(--bg-paper)',
            transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              bgcolor: 'var(--sidebar-item-hover-bg)',
              borderColor: 'var(--border-color)',
              transform: 'translateY(-1px)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            },
          }}
        >
          <Avatar
            sx={{
              width: 34,
              height: 34,
              background: `linear-gradient(135deg, ${BRAND_COLORS.SECONDARY_BLUE} 0%, ${BRAND_COLORS.ACCENT_CYAN} 100%)`,
              fontSize: '0.875rem',
              fontWeight: 700,
              flexShrink: 0,
              boxShadow: `0 2px 6px ${BRAND_COLORS.SECONDARY_BLUE}35`,
            }}
          >
            {avatarLetter}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              noWrap
              sx={{
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-family)',
                lineHeight: 1.35,
              }}
            >
              {displayName || 'User'}
            </Typography>
            <Typography
              noWrap
              sx={{
                fontSize: '0.6875rem',
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-family)',
                lineHeight: 1.35,
              }}
            >
              {displayEmail}
            </Typography>
          </Box>
          <KeyboardArrowDownRoundedIcon
            sx={{
              fontSize: 17,
              color: 'var(--text-muted)',
              flexShrink: 0,
              transform: userMenuOpen ? 'rotate(180deg)' : 'rotate(0)',
              transition: 'transform 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        </Box>
      </Box>

      {/* ── User dropdown menu - polished ── */}
      <Menu
        anchorEl={userMenuAnchor}
        open={userMenuOpen}
        onClose={() => setUserMenuAnchor(null)}
        transformOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        anchorOrigin={{ horizontal: 'left', vertical: 'top' }}
        slotProps={{
          paper: {
            sx: {
              mb: 1.25,
              minWidth: 240,
              boxShadow: `0 8px 32px ${BRAND_COLORS.SECONDARY_BLUE}18`,
              borderRadius: '13px',
              border: '1px solid var(--border-color)',
              overflow: 'hidden',
              bgcolor: 'var(--bg-paper)',
            },
          },
        }}
      >
        {/* User info header - brand gradient */}
        <Box
          sx={{
            px: 2.25,
            py: 1.75,
            background: `linear-gradient(135deg, ${BRAND_COLORS.SECONDARY_BLUE}06 0%, ${BRAND_COLORS.ACCENT_CYAN}06 100%)`,
            borderBottom: '1px solid var(--border-color)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar
              sx={{
                width: 36,
                height: 36,
                background: `linear-gradient(135deg, ${BRAND_COLORS.SECONDARY_BLUE} 0%, ${BRAND_COLORS.ACCENT_CYAN} 100%)`,
                fontSize: '0.9375rem',
                fontWeight: 700,
                boxShadow: `0 2px 6px ${BRAND_COLORS.SECONDARY_BLUE}30`,
              }}
            >
              {avatarLetter}
            </Avatar>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                noWrap
                sx={{
                  fontWeight: 600,
                  fontSize: '0.9375rem',
                  fontFamily: 'var(--font-family)',
                  color: 'var(--text-primary)',
                  lineHeight: 1.3,
                }}
              >
                {displayName || 'User'}
              </Typography>
              <Typography
                noWrap
                sx={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  fontFamily: 'var(--font-family)',
                  lineHeight: 1.4,
                }}
              >
                {displayEmail}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Menu items - streamlined */}
        <Box sx={{ py: 0.75 }}>
          {(isAdmin
            ? [
                ...USER_MENU_CONFIG.slice(0, 3),
                { label: 'Token Usage', path: '/admin/token-usage', icon: DataUsageRoundedIcon },
                USER_MENU_CONFIG[3],
              ]
            : USER_MENU_CONFIG
          ).map(({ label, path, icon: Icon }) => (
            <MenuItem
              key={path}
              onClick={() => { setUserMenuAnchor(null); navigate(path); }}
              sx={{
                fontSize: '0.875rem',
                fontFamily: 'var(--font-family)',
                py: 1.125,
                px: 2.25,
                transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': { 
                  bgcolor: `${BRAND_COLORS.ACCENT_CYAN}08`,
                  pl: 2.75,
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 34 }}>
                <Icon sx={{ fontSize: 18, color: 'var(--text-secondary)' }} />
              </ListItemIcon>
              <ListItemText
                slotProps={{ 
                  primary: { 
                    sx: { 
                      fontSize: '0.875rem', 
                      fontFamily: 'var(--font-family)', 
                      fontWeight: 500,
                      lineHeight: 1.5,
                    } 
                  } 
                }}
              >
                {label}
              </ListItemText>
            </MenuItem>
          ))}
        </Box>

        <Divider sx={{ borderColor: 'var(--border-color)', mx: 1.5 }} />

        {/* Sign out - danger state */}
        <Box sx={{ py: 0.75 }}>
          <MenuItem
            onClick={() => { setUserMenuAnchor(null); setSignOutDialogOpen(true); }}
            sx={{
              py: 1.125,
              px: 2.25,
              transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': { 
                bgcolor: `${BRAND_COLORS.ERROR}08`,
                pl: 2.75,
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 34 }}>
              <LogoutRoundedIcon sx={{ fontSize: 18, color: BRAND_COLORS.ERROR }} />
            </ListItemIcon>
            <ListItemText
              slotProps={{ 
                primary: { 
                  sx: { 
                    fontSize: '0.875rem', 
                    fontWeight: 600, 
                    fontFamily: 'var(--font-family)', 
                    color: BRAND_COLORS.ERROR,
                    lineHeight: 1.5,
                  } 
                } 
              }}
            >
              Sign Out
            </ListItemText>
          </MenuItem>
        </Box>
      </Menu>

      <SignOutConfirmDialog
        open={signOutDialogOpen}
        onClose={() => setSignOutDialogOpen(false)}
        onConfirm={confirmSignOut}
      />
    </Box>
  );
}
