import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { uploadResumeAPI } from '../../services/resumeService';

export const uploadResume = createAsyncThunk(
  'resume/upload',
  async (file, { rejectWithValue }) => {
    try {
      const { data } = await uploadResumeAPI(file);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message || 'Resume upload failed');
    }
  }
);

const initialState = {
  parsedData: null,
  lastUpdated: null,
  loading: false,
  error: null,
};

const resumeSlice = createSlice({
  name: 'resume',
  initialState,
  reducers: {
    clearParsedResume(state) {
      state.parsedData = null;
      state.lastUpdated = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadResume.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadResume.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.parsedData = action.payload?.data ?? action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(uploadResume.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearParsedResume } = resumeSlice.actions;
export default resumeSlice.reducer;
