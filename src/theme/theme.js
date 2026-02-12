import { createTheme } from '@mui/material/styles';

// Blue / light blue palette - sync with CSS variables in App.css
const getTheme = (mode = 'light') =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: mode === 'dark' ? '#3b82f6' : '#2563eb',
        light: mode === 'dark' ? '#60a5fa' : '#3b82f6',
        dark: mode === 'dark' ? '#2563eb' : '#1d4ed8',
        contrastText: '#ffffff',
      },
      secondary: {
        main: mode === 'dark' ? '#38bdf8' : '#0ea5e9',
        light: mode === 'dark' ? '#7dd3fc' : '#38bdf8',
        dark: mode === 'dark' ? '#0ea5e9' : '#0284c7',
      },
      success: {
        main: '#22c55e',
        light: '#4ade80',
        dark: '#16a34a',
      },
      error: {
        main: '#dc2626',
        light: '#ef4444',
        dark: '#b91c1c',
      },
      warning: {
        main: '#f59e0b',
        light: '#fbbf24',
      },
      background: {
        default: mode === 'dark' ? '#0f172a' : '#ffffff',
        paper: mode === 'dark' ? '#1e293b' : '#ffffff',
      },
      text: {
        primary: mode === 'dark' ? '#f1f5f9' : '#0f172a',
        secondary: mode === 'dark' ? '#94a3b8' : '#475569',
      },
    },
  typography: {
    fontFamily: '"DM Sans", "Segoe UI", system-ui, sans-serif',
    h4: {
      fontWeight: 700,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    body1: {
      fontSize: '1rem',
    },
    body2: {
      fontSize: '1rem',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          padding: '10px 24px',
          fontWeight: 600,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: 'var(--border-focus)',
              borderWidth: 2,
            },
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: 'var(--border-focus)',
          },
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: 'var(--primary)',
        },
      },
    },
  },
  });

export default getTheme('light');
export { getTheme };
