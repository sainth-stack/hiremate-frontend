import { useLocation } from 'react-router-dom';
import { List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import WorkOutlineRoundedIcon from '@mui/icons-material/WorkOutlineRounded';
import TimelineRoundedIcon from '@mui/icons-material/TimelineRounded';
import { NavLink } from 'react-router-dom';
import { Box } from '@mui/material';

const navItems = [
  { label: 'Dashboard', path: '/', icon: DashboardRoundedIcon },
  { label: 'Profile', path: '/profile', icon: PersonRoundedIcon },
  { label: 'Job Search', path: '/job-search', icon: WorkOutlineRoundedIcon },
  { label: 'Activity', path: '/activity', icon: TimelineRoundedIcon },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <Box
      component="nav"
      sx={{
        width: 'var(--sidebar-width)',
        flexShrink: 0,
        bgcolor: 'var(--sidebar-bg)',
        borderRight: 1,
        borderColor: 'var(--sidebar-border)',
        height: '100%',
        overflow: 'auto',
      }}
    >
      <List disablePadding sx={{ py: 2, px: 1.5 }}>
        {navItems.map(({ label, path, icon: Icon }) => {
          const isActive =
            path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(path);
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
                  '& .MuiListItemIcon-root': {
                    color: 'var(--sidebar-item-active-color)',
                  },
                  '&:hover': {
                    bgcolor: 'var(--light-blue-bg-08)',
                  },
                },
                '&:hover': {
                  bgcolor: 'var(--sidebar-item-hover-bg)',
                },
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
        })}
      </List>
    </Box>
  );
}
