import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth/authSlice';
import resumeReducer from './resume/resumeSlice';
import profileReducer from './profile/profileSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    resume: resumeReducer,
    profile: profileReducer,
  },
});
