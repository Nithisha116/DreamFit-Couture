import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "/api/customer-size/";

// Get all profiles for a customer
export const fetchCustomerProfiles = createAsyncThunk(
  "customerSize/fetchAll",
  async (customerId, thunkAPI) => {
    try {
      const response = await axios.get(API_URL + "customer/" + customerId, {
        withCredentials: true,
      });
      return response.data.data;
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create new profile
export const createCustomerProfile = createAsyncThunk(
  "customerSize/create",
  async (profileData, thunkAPI) => {
    try {
      const response = await axios.post(API_URL, profileData, {
        withCredentials: true,
      });
      return response.data.data;
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update measurements
export const updateCustomerProfile = createAsyncThunk(
  "customerSize/update",
  async ({ id, measurements, reason, notes }, thunkAPI) => {
    try {
      const response = await axios.put(API_URL + id + "/measurements", {
        measurements,
        reason,
        notes
      }, {
        withCredentials: true,
      });
      return response.data.data;
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete/Deactivate profile
export const deleteCustomerProfile = createAsyncThunk(
  "customerSize/delete",
  async (id, thunkAPI) => {
    try {
      await axios.delete(API_URL + id, {
        withCredentials: true,
      });
      return id;
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const initialState = {
  profiles: [],
  currentProfile: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: "",
};

export const customerSizeSlice = createSlice({
  name: "customerSize",
  initialState,
  reducers: {
    reset: (state) => {
      state.isError = false;
      state.isSuccess = false;
      state.isLoading = false;
      state.message = "";
    },
    clearProfiles: (state) => {
      state.profiles = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Profiles
      .addCase(fetchCustomerProfiles.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCustomerProfiles.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.profiles = action.payload;
      })
      .addCase(fetchCustomerProfiles.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.profiles = [];
      })
      // Create Profile
      .addCase(createCustomerProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createCustomerProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.profiles.unshift(action.payload);
      })
      .addCase(createCustomerProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Update Profile
      .addCase(updateCustomerProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateCustomerProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const index = state.profiles.findIndex((p) => p._id === action.payload._id);
        if (index !== -1) {
          state.profiles[index] = action.payload;
        }
      })
      .addCase(updateCustomerProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Delete Profile
      .addCase(deleteCustomerProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteCustomerProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.profiles = state.profiles.filter((p) => p._id !== action.payload);
      })
      .addCase(deleteCustomerProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset, clearProfiles } = customerSizeSlice.actions;
export default customerSizeSlice.reducer;