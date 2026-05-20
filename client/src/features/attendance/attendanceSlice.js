import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../app/axios";

// ==================== ASYNC THUNKS ====================

// Fetch paginated attendance records
export const fetchAttendance = createAsyncThunk(
  "attendance/fetchAll",
  async (params = {}, thunkAPI) => {
    try {
      const response = await API.get("/attendance", { params });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// Fetch stats for a specific date (defaults to today)
export const fetchAttendanceStats = createAsyncThunk(
  "attendance/fetchStats",
  async (date, thunkAPI) => {
    try {
      const response = await API.get("/attendance/stats", { params: { date } });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// Fetch unique employees from attendance records
export const fetchAttendanceEmployees = createAsyncThunk(
  "attendance/fetchEmployees",
  async (_, thunkAPI) => {
    try {
      const response = await API.get("/attendance/employees");
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// Create new attendance record
export const createAttendance = createAsyncThunk(
  "attendance/create",
  async (data, thunkAPI) => {
    try {
      const response = await API.post("/attendance", data);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// Update existing attendance record
export const updateAttendance = createAsyncThunk(
  "attendance/update",
  async ({ id, data }, thunkAPI) => {
    try {
      const response = await API.put(`/attendance/${id}`, data);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// Soft delete attendance record
export const deleteAttendance = createAsyncThunk(
  "attendance/delete",
  async (id, thunkAPI) => {
    try {
      await API.delete(`/attendance/${id}`);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// ==================== SLICE ====================

const initialState = {
  records: [],
  employeeList: [],
  stats: {
    totalEmployees: 0,
    presentToday: 0,
    absentToday: 0,
    lateEmployees: 0,
    onLeave: 0,
    halfDay: 0,
  },
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },
  isLoading: false,
  isStatsLoading: false,
  isError: false,
  isSuccess: false,
  message: "",
};

export const attendanceSlice = createSlice({
  name: "attendance",
  initialState,
  reducers: {
    reset: (state) => {
      state.isError = false;
      state.isLoading = false;
      state.isSuccess = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchAttendance.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAttendance.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.records = action.payload.data || [];
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(fetchAttendance.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Fetch Stats
      .addCase(fetchAttendanceStats.pending, (state) => {
        state.isStatsLoading = true;
      })
      .addCase(fetchAttendanceStats.fulfilled, (state, action) => {
        state.isStatsLoading = false;
        if (action.payload.data) {
          state.stats = action.payload.data;
        }
      })
      .addCase(fetchAttendanceStats.rejected, (state, action) => {
        state.isStatsLoading = false;
      })
      // Fetch Employees
      .addCase(fetchAttendanceEmployees.fulfilled, (state, action) => {
        if (action.payload.data) {
          state.employeeList = action.payload.data;
        }
      })
      // Create
      .addCase(createAttendance.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createAttendance.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        if (action.payload.data) {
          state.records.unshift(action.payload.data);
          state.pagination.total += 1;
        }
      })
      .addCase(createAttendance.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Update
      .addCase(updateAttendance.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateAttendance.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        if (action.payload.data) {
          state.records = state.records.map((item) =>
            item._id === action.payload.data._id ? action.payload.data : item
          );
        }
      })
      .addCase(updateAttendance.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Delete
      .addCase(deleteAttendance.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteAttendance.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.records = state.records.filter(
          (item) => item._id !== action.payload
        );
        state.pagination.total -= 1;
      })
      .addCase(deleteAttendance.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = attendanceSlice.actions;
export default attendanceSlice.reducer;
