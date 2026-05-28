import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../app/axios";

// ── Existing thunks (unchanged) ───────────────────────────────────────────────
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

// ── New: Salary Payment Workflow thunks ──────────────────────────────────────
export const fetchActiveEmployees = createAsyncThunk(
  "salary/fetchActiveEmployees",
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.get("/salary/employees/active");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch employees");
    }
  }
);

export const fetchPayrollSummary = createAsyncThunk(
  "salary/fetchPayrollSummary",
  async ({ employeeId, month, year }, { rejectWithValue }) => {
    try {
      const response = await API.get("/salary/payroll/summary", {
        params: { employeeId, month, year },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch payroll summary");
    }
  }
);

export const paySalaryThunk = createAsyncThunk(
  "salary/pay",
  async (data, { rejectWithValue }) => {
    try {
      const response = await API.post("/salary/pay", data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Salary payment failed");
    }
  }
);

export const fetchSalaryHistory = createAsyncThunk(
  "salary/fetchHistory",
  async ({ employeeId, year }, { rejectWithValue }) => {
    try {
      const response = await API.get(`/salary/history/${employeeId}`, {
        params: { year },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch salary history");
    }
  }
);

export const fetchSalarySlip = createAsyncThunk(
  "salary/fetchSlip",
  async ({ employeeId, month, year }, { rejectWithValue }) => {
    try {
      const response = await API.get(`/salary/slip/${employeeId}/${month}/${year}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch salary slip");
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────
const salarySlice = createSlice({
  name: "salary",
  initialState: {
    // Existing
    reports: [],
    config: null,
    loading: false,
    error: null,
    success: false,
    // New payment workflow state
    activeEmployees: [],
    employeesLoading: false,
    payrollSummary: null,
    summaryLoading: false,
    salaryHistory: [],
    historyLoading: false,
    salarySlipData: null,
    slipLoading: false,
    payLoading: false,
    paySuccess: false,
    lastTransaction: null,
  },
  reducers: {
    clearSalaryState: (state) => {
      state.error = null;
      state.success = false;
      state.paySuccess = false;
      state.lastTransaction = null;
    },
    clearPayrollSummary: (state) => {
      state.payrollSummary = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Existing cases ──────────────────────────────────────────────────
      .addCase(fetchSalaryReports.pending, (state) => { state.loading = true; })
      .addCase(fetchSalaryReports.fulfilled, (state, action) => {
        state.loading = false;
        state.reports = action.payload;
      })
      .addCase(fetchSalaryReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(generateSalaries.pending, (state) => { state.loading = true; })
      .addCase(generateSalaries.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(generateSalaries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(lockSalary.fulfilled, (state, action) => {
        const index = state.reports.findIndex((r) => r._id === action.payload?._id);
        if (index !== -1) state.reports[index] = action.payload;
      })
      .addCase(recalculateSalary.fulfilled, (state, action) => {
        const index = state.reports.findIndex((r) => r._id === action.payload?._id);
        if (index !== -1) state.reports[index] = action.payload;
      })
      .addCase(fetchPayrollConfig.fulfilled, (state, action) => {
        state.config = action.payload;
      })
      .addCase(updatePayrollConfig.fulfilled, (state, action) => {
        state.config = action.payload;
      })

      // ── New: Active Employees ────────────────────────────────────────────
      .addCase(fetchActiveEmployees.pending, (state) => { state.employeesLoading = true; })
      .addCase(fetchActiveEmployees.fulfilled, (state, action) => {
        state.employeesLoading = false;
        state.activeEmployees = action.payload;
      })
      .addCase(fetchActiveEmployees.rejected, (state) => { state.employeesLoading = false; })

      // ── New: Payroll Summary ─────────────────────────────────────────────
      .addCase(fetchPayrollSummary.pending, (state) => {
        state.summaryLoading = true;
        state.payrollSummary = null;
      })
      .addCase(fetchPayrollSummary.fulfilled, (state, action) => {
        state.summaryLoading = false;
        state.payrollSummary = action.payload;
      })
      .addCase(fetchPayrollSummary.rejected, (state) => { state.summaryLoading = false; })

      // ── New: Pay Salary ──────────────────────────────────────────────────
      .addCase(paySalaryThunk.pending, (state) => { state.payLoading = true; })
      .addCase(paySalaryThunk.fulfilled, (state, action) => {
        state.payLoading = false;
        state.paySuccess = true;
        state.lastTransaction = action.payload.transaction;
        // Update payrollSummary if it matches
        if (state.payrollSummary && action.payload.updatedPayroll) {
          state.payrollSummary = {
            ...state.payrollSummary,
            ...action.payload.updatedPayroll,
          };
        }
      })
      .addCase(paySalaryThunk.rejected, (state, action) => {
        state.payLoading = false;
        state.error = action.payload;
      })

      // ── New: Salary History ──────────────────────────────────────────────
      .addCase(fetchSalaryHistory.pending, (state) => { state.historyLoading = true; })
      .addCase(fetchSalaryHistory.fulfilled, (state, action) => {
        state.historyLoading = false;
        state.salaryHistory = action.payload;
      })
      .addCase(fetchSalaryHistory.rejected, (state) => { state.historyLoading = false; })

      // ── New: Salary Slip ─────────────────────────────────────────────────
      .addCase(fetchSalarySlip.pending, (state) => { state.slipLoading = true; })
      .addCase(fetchSalarySlip.fulfilled, (state, action) => {
        state.slipLoading = false;
        state.salarySlipData = action.payload;
      })
      .addCase(fetchSalarySlip.rejected, (state) => { state.slipLoading = false; });
  },
});

export const { clearSalaryState, clearPayrollSummary } = salarySlice.actions;
export default salarySlice.reducer;
