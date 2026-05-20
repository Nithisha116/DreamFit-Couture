import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Helper function for API URL
const getApiUrl = () => {
  return import.meta.env.VITE_API_URL || "http://localhost:5000";
};

// Async Thunks
export const fetchAppointments = createAsyncThunk(
  "appointment/fetchAll",
  async (filters = {}, thunkAPI) => {
    try {
      const { auth } = thunkAPI.getState();
      const config = {
        headers: {
          Authorization: `Bearer ${auth.user.token}`,
        },
        params: filters, // passed filters (start, end, status, etc)
      };
      const response = await axios.get(`${getApiUrl()}/api/appointments`, config);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

export const fetchUpcomingAppointments = createAsyncThunk(
  "appointment/fetchUpcoming",
  async (_, thunkAPI) => {
    try {
      const { auth } = thunkAPI.getState();
      const config = {
        headers: {
          Authorization: `Bearer ${auth.user.token}`,
        },
      };
      const response = await axios.get(`${getApiUrl()}/api/appointments/dashboard/upcoming`, config);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

export const createAppointment = createAsyncThunk(
  "appointment/create",
  async (appointmentData, thunkAPI) => {
    try {
      const { auth } = thunkAPI.getState();
      const config = {
        headers: {
          Authorization: `Bearer ${auth.user.token}`,
          "Content-Type": "application/json",
        },
      };
      const response = await axios.post(`${getApiUrl()}/api/appointments`, appointmentData, config);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

export const updateAppointment = createAsyncThunk(
  "appointment/update",
  async ({ id, appointmentData }, thunkAPI) => {
    try {
      const { auth } = thunkAPI.getState();
      const config = {
        headers: {
          Authorization: `Bearer ${auth.user.token}`,
          "Content-Type": "application/json",
        },
      };
      const response = await axios.put(
        `${getApiUrl()}/api/appointments/${id}`,
        appointmentData,
        config
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

export const deleteAppointment = createAsyncThunk(
  "appointment/delete",
  async (id, thunkAPI) => {
    try {
      const { auth } = thunkAPI.getState();
      const config = {
        headers: {
          Authorization: `Bearer ${auth.user.token}`,
        },
      };
      await axios.delete(`${getApiUrl()}/api/appointments/${id}`, config);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

const initialState = {
  appointments: [],
  upcomingAppointments: [],
  currentAppointment: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: "",
};

export const appointmentSlice = createSlice({
  name: "appointment",
  initialState,
  reducers: {
    reset: (state) => {
      state.isError = false;
      state.isLoading = false;
      state.isSuccess = false;
      state.message = "";
    },
    setCurrentAppointment: (state, action) => {
      state.currentAppointment = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchAppointments.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.appointments = action.payload;
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Fetch Upcoming
      .addCase(fetchUpcomingAppointments.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUpcomingAppointments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.upcomingAppointments = action.payload;
      })
      .addCase(fetchUpcomingAppointments.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Create
      .addCase(createAppointment.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createAppointment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.appointments.push(action.payload);
        
        // Also add to upcoming if applicable
        const today = new Date();
        const appDate = new Date(action.payload.startTime);
        if (appDate >= today) {
           state.upcomingAppointments.push(action.payload);
        }
      })
      .addCase(createAppointment.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Update
      .addCase(updateAppointment.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateAppointment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.appointments = state.appointments.map((appt) =>
          appt._id === action.payload._id ? action.payload : appt
        );
        state.upcomingAppointments = state.upcomingAppointments.map((appt) =>
          appt._id === action.payload._id ? action.payload : appt
        );
      })
      .addCase(updateAppointment.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Delete
      .addCase(deleteAppointment.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteAppointment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.appointments = state.appointments.filter(
          (appt) => appt._id !== action.payload
        );
        state.upcomingAppointments = state.upcomingAppointments.filter(
          (appt) => appt._id !== action.payload
        );
      })
      .addCase(deleteAppointment.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset, setCurrentAppointment } = appointmentSlice.actions;
export default appointmentSlice.reducer;
