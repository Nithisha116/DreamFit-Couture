import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../app/axios";

export const fetchSalaryReports = createAsyncThunk(
  "salary/fetchReports",
  async (filters, { rejectWithValue }) => {
    try {
      const response = await API.get("/salary/reports", { params: filters });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch reports");
    }
  }
);

export const generateSalaries = createAsyncThunk(
  "salary/generate",
  async (data, { rejectWithValue }) => {
    try {
      const response = await API.post("/salary/generate", data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to generate salaries");
    }
  }
);

export const lockSalary = createAsyncThunk(
  "salary/lock",
  async (id, { rejectWithValue }) => {
    try {
      const response = await API.put(`/salary/lock/${id}`);
      return response.data.salary;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to lock salary");
    }
  }
);

export const recalculateSalary = createAsyncThunk(
  "salary/recalculate",
  async (id, { rejectWithValue }) => {
    try {
      const response = await API.get(`/salary/live/${id}`, { params: { save: true } });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to recalculate salary");
    }
  }
);

export const fetchPayrollConfig = createAsyncThunk(
  "salary/fetchConfig",
  async (params, { rejectWithValue }) => {
    try {
      const response = await API.get("/salary/config", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch config");
    }
  }
);

export const updatePayrollConfig = createAsyncThunk(
  "salary/updateConfig",
  async (data, { rejectWithValue }) => {
    try {
      const response = await API.post("/salary/config", data);
      return response.data.config;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update config");
    }
  }
);

const salarySlice = createSlice({
  name: "salary",
  initialState: {
    reports: [],
    config: null,
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    clearSalaryState: (state) => {
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Reports
      .addCase(fetchSalaryReports.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSalaryReports.fulfilled, (state, action) => {
        state.loading = false;
        state.reports = action.payload;
      })
      .addCase(fetchSalaryReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Generate Salaries
      .addCase(generateSalaries.pending, (state) => {
        state.loading = true;
      })
      .addCase(generateSalaries.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(generateSalaries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Lock Salary
      .addCase(lockSalary.fulfilled, (state, action) => {
        const index = state.reports.findIndex(r => r._id === action.payload._id);
        if (index !== -1) {
          state.reports[index] = action.payload;
        }
      })
      // Recalculate Salary
      .addCase(recalculateSalary.fulfilled, (state, action) => {
        const index = state.reports.findIndex(r => r._id === action.payload._id);
        if (index !== -1) {
          state.reports[index] = action.payload;
        }
      })
      // Fetch Config
      .addCase(fetchPayrollConfig.fulfilled, (state, action) => {
        state.config = action.payload;
      })
      // Update Config
      .addCase(updatePayrollConfig.fulfilled, (state, action) => {
        state.config = action.payload;
      });
  },
});

export const { clearSalaryState } = salarySlice.actions;
export default salarySlice.reducer;
