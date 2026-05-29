import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../app/axios";

// ==================== ASYNC THUNKS ====================

export const fetchVendors = createAsyncThunk(
  "outsourcingVendor/fetchAll",
  async (params = {}, thunkAPI) => {
    try {
      const response = await API.get(`/outsourcing-vendors`, { params });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

export const createVendor = createAsyncThunk(
  "outsourcingVendor/create",
  async (data, thunkAPI) => {
    try {
      const response = await API.post(`/outsourcing-vendors`, data);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

export const updateVendor = createAsyncThunk(
  "outsourcingVendor/update",
  async ({ id, data }, thunkAPI) => {
    try {
      const response = await API.put(`/outsourcing-vendors/${id}`, data);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

export const deleteVendor = createAsyncThunk(
  "outsourcingVendor/delete",
  async (id, thunkAPI) => {
    try {
      await API.delete(`/outsourcing-vendors/${id}`);
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
  vendors: [],
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: "",
};

export const outsourcingVendorSlice = createSlice({
  name: "outsourcingVendor",
  initialState,
  reducers: {
    resetVendorState: (state) => {
      state.isError = false;
      state.isLoading = false;
      state.isSuccess = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchVendors.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchVendors.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.vendors = action.payload.data || [];
      })
      .addCase(fetchVendors.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Create
      .addCase(createVendor.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createVendor.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        if (action.payload.data) {
          state.vendors.unshift(action.payload.data);
        }
      })
      .addCase(createVendor.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Update
      .addCase(updateVendor.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateVendor.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        if (action.payload.data) {
          state.vendors = state.vendors.map((item) =>
            item._id === action.payload.data._id ? action.payload.data : item
          );
        }
      })
      .addCase(updateVendor.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Delete
      .addCase(deleteVendor.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteVendor.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.vendors = state.vendors.filter(
          (item) => item._id !== action.payload
        );
      })
      .addCase(deleteVendor.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { resetVendorState } = outsourcingVendorSlice.actions;
export default outsourcingVendorSlice.reducer;
