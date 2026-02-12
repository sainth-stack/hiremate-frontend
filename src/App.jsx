import { useEffect } from 'react';
import { Provider, useSelector } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { getTheme } from './theme/theme';
import { store } from './store';
import AppRoutes from './routes/AppRoutes';

function ThemeGate({ children }) {
  const darkMode = useSelector((state) => state.theme.darkMode);
  const theme = getTheme(darkMode ? 'dark' : 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

function App() {
  return (
    <Provider store={store}>
      <ThemeGate>
        <AppRoutes />
      </ThemeGate>
    </Provider>
  );
}

export default App;
