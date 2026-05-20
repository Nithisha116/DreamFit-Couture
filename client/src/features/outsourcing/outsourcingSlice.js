import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../app/axios";

// ==================== ASYNC THUNKS ====================

export const fetchOutsourcing = createAsyncThunk(
  "outsourcing/fetchAll",
  async (params = {}, thunkAPI) => {
    try {
      const response = await API.get(`/outsourcing`, { params });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

export const createOutsourcing = createAsyncThunk(
  "outsourcing/create",
  async (data, thunkAPI) => {
    try {
      const response = await API.post(`/outsourcing`, data);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

export const updateOutsourcing = createAsyncThunk(
  "outsourcing/update",
  async ({ id, data }, thunkAPI) => {
    try {
      const response = await API.put(`/outsourcing/${id}`, data);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

export const deleteOutsourcing = createAsyncThunk(
  "outsourcing/delete",
  async (id, thunkAPI) => {
    try {
      await API.delete(`/outsourcing/${id}`);
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
  outsourcings: [],
  employees: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 5,
    totalPages: 0,
  },
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: "",
};

export const outsourcingSlice = createSlice({
  name: "outsourcing",
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
      .addCase(fetchOutsourcing.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchOutsourcing.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.outsourcings = action.payload.data || [];
        state.employees = action.payload.employees || [];
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(fetchOutsourcing.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Create
      .addCase(createOutsourcing.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createOutsourcing.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        if (action.payload.data) {
          state.outsourcings.unshift(action.payload.data);
          state.pagination.total += 1;
        }
      })
      .addCase(createOutsourcing.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Update
      .addCase(updateOutsourcing.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateOutsourcing.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        if (action.payload.data) {
          state.outsourcings = state.outsourcings.map((item) =>
            item._id === action.payload.data._id ? action.payload.data : item
          );
        }
      })
      .addCase(updateOutsourcing.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Delete
      .addCase(deleteOutsourcing.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteOutsourcing.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.outsourcings = state.outsourcings.filter(
          (item) => item._id !== action.payload
        );
        state.pagination.total -= 1;
      })
      .addCase(deleteOutsourcing.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = outsourcingSlice.actions;
export default outsourcingSlice.reducer;
