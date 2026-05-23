import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../app/axios';

// Generic thunk to fetch workers with any query params
export const fetchWorkers = createAsyncThunk(
  'worker/fetchWorkers',
  async (params = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v) query.append(k, v);
      });
      const response = await API.get(`/workers?${query.toString()}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Convenience thunk to fetch workers by role (used by UI)
export const fetchWorkersByRole = createAsyncThunk(
  'worker/fetchWorkersByRole',
  async (role, { rejectWithValue }) => {
    try {
      const response = await API.get(`/workers?role=${role}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const workerSlice = createSlice({
  name: 'worker',
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearWorkerList: (state) => {
      state.list = [];
      state.loading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWorkers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.workers || action.payload.data || [];
      })
      .addCase(fetchWorkers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch workers';
      })
      .addCase(fetchWorkersByRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWorkersByRole.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.workers || action.payload.data || [];
      })
      .addCase(fetchWorkersByRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch workers by role';
      });
  },
});

export const { clearWorkerList } = workerSlice.actions;


// Selectors
export const selectAllWorkers = (state) => state.worker?.list || [];
export const selectWorkersByRole = (state, role) =>
  state.worker.list.filter((w) => w.role === role);
export const selectWorkerLoading = (state) => state.worker.loading;
export const selectWorkerError = (state) => state.worker.error;

export default workerSlice.reducer;
