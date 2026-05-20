import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../app/axios";

const initialState = {
  leaves: [],
  pagination: {
    totalPages: 0,
    currentPage: 1,
    totalRecords: 0,
  },
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: "",
};

// Fetch all leaves
export const fetchLeaves = createAsyncThunk(
  "leave/fetchAll",
  async (params, thunkAPI) => {
    try {
      const response = await API.get("/leaves", { params });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create leave request
export const createLeaveRequest = createAsyncThunk(
  "leave/create",
  async (leaveData, thunkAPI) => {
    try {
      const response = await API.post("/leaves", leaveData);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update leave status
export const updateLeaveStatus = createAsyncThunk(
  "leave/updateStatus",
  async ({ id, status, adminNotes }, thunkAPI) => {
    try {
      const response = await API.patch(`/leaves/${id}/status`, { status, adminNotes });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const leaveSlice = createSlice({
  name: "leave",
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchLeaves
      .addCase(fetchLeaves.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchLeaves.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.leaves = action.payload.data.leaves;
        state.pagination = {
          totalPages: action.payload.data.totalPages,
          currentPage: action.payload.data.currentPage,
          totalRecords: action.payload.data.totalRecords,
        };
      })
      .addCase(fetchLeaves.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // createLeaveRequest
      .addCase(createLeaveRequest.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createLeaveRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.leaves.unshift(action.payload.data);
      })
      .addCase(createLeaveRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // updateLeaveStatus
      .addCase(updateLeaveStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateLeaveStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const index = state.leaves.findIndex((l) => l._id === action.payload.data._id);
        if (index !== -1) {
          state.leaves[index] = action.payload.data;
        }
      })
      .addCase(updateLeaveStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = leaveSlice.actions;
export default leaveSlice.reducer;
