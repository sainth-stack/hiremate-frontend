import { createSlice } from '@reduxjs/toolkit';

const THEME_KEY = 'hiremate-theme';

const getStoredDarkMode = () => {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    return stored === 'dark';
  } catch {
    return false;
  }
};

const initialState = {
  darkMode: getStoredDarkMode(),
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.darkMode = !state.darkMode;
      try {
        localStorage.setItem(THEME_KEY, state.darkMode ? 'dark' : 'light');
      } catch {}
    },
    setDarkMode: (state, { payload }) => {
      state.darkMode = Boolean(payload);
      try {
        localStorage.setItem(THEME_KEY, state.darkMode ? 'dark' : 'light');
      } catch {}
    },
  },
});

export const { toggleTheme, setDarkMode } = themeSlice.actions;
export default themeSlice.reducer;
