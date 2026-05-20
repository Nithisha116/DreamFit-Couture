import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import invoiceAPI from "./invoiceapi";
import showToast from "../../utils/toast";

// Initial State
const initialState = {
  invoices: [],
  currentInvoice: null,
  billingStats: {
    totalRevenue: 0,
    totalDue: 0,
    todayCollection: 0,
    paymentMethods: { cash: 0, upi: 0, bankTransfer: 0, card: 0 }
  },
  loading: false,
  error: null
};

// ==================== ASYNC THUNKS ====================

// Fetch dashboard KPIs
export const fetchBillingStats = createAsyncThunk(
  "invoice/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await invoiceAPI.getBillingStats();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch metrics");
    }
  }
);

// Create dynamic Invoice
export const createInvoice = createAsyncThunk(
  "invoice/createInvoice",
  async ({ orderId, data }, { rejectWithValue }) => {
    try {
      const response = await invoiceAPI.createInvoice(orderId, data);
      showToast.success("Invoice generated successfully!");
      return response.data.data;
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to generate invoice";
      showToast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

// Fetch Invoice by associated Order ID
export const fetchInvoiceByOrderId = createAsyncThunk(
  "invoice/fetchByOrderId",
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await invoiceAPI.getInvoiceByOrderId(orderId);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "No invoice found for this order");
    }
  }
);

// Fetch single Invoice
export const fetchInvoice = createAsyncThunk(
  "invoice/fetchInvoice",
  async (id, { rejectWithValue }) => {
    try {
      const response = await invoiceAPI.getInvoice(id);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to load invoice");
    }
  }
);

// Record invoice payment
export const collectInvoicePayment = createAsyncThunk(
  "invoice/collectPayment",
  async ({ id, data }, { rejectWithValue, dispatch }) => {
    try {
      const response = await invoiceAPI.collectPayment(id, data);
      showToast.success("Payment recorded successfully!");
      dispatch(fetchInvoice(id)); // Hot reload active invoice details
      dispatch(fetchBillingStats()); // Refresh KPI stats
      return response.data.data;
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to register payment";
      showToast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

// Cancel Invoice
export const cancelInvoice = createAsyncThunk(
  "invoice/cancelInvoice",
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const response = await invoiceAPI.cancelInvoice(id);
      showToast.success("Invoice cancelled successfully!");
      dispatch(fetchInvoice(id)); // Hot reload active invoice details
      return response.data.data;
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to cancel invoice";
      showToast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

// List all active invoices
export const fetchInvoices = createAsyncThunk(
  "invoice/fetchAll",
  async (params, { rejectWithValue }) => {
    try {
      const response = await invoiceAPI.getInvoices(params);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch invoices");
    }
  }
);

// Soft Delete Invoice
export const deleteInvoice = createAsyncThunk(
  "invoice/deleteInvoice",
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await invoiceAPI.deleteInvoice(id);
      showToast.success("Invoice deleted successfully");
      dispatch(fetchInvoices());
      return id;
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to delete invoice";
      showToast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

// ==================== REDUX TOOLKIT SLICE ====================
const invoiceSlice = createSlice({
  name: "invoice",
  initialState,
  reducers: {
    clearCurrentInvoice: (state) => {
      state.currentInvoice = null;
    },
    clearInvoiceError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Stats
      .addCase(fetchBillingStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBillingStats.fulfilled, (state, action) => {
        state.loading = false;
        state.billingStats = action.payload;
      })
      .addCase(fetchBillingStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Invoice
      .addCase(createInvoice.pending, (state) => {
        state.loading = true;
      })
      .addCase(createInvoice.fulfilled, (state, action) => {
        state.loading = false;
        state.currentInvoice = action.payload;
      })
      .addCase(createInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch by Order ID
      .addCase(fetchInvoiceByOrderId.pending, (state) => {
        state.loading = true;
        state.currentInvoice = null;
      })
      .addCase(fetchInvoiceByOrderId.fulfilled, (state, action) => {
        state.loading = false;
        state.currentInvoice = action.payload;
      })
      .addCase(fetchInvoiceByOrderId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch single Invoice
      .addCase(fetchInvoice.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchInvoice.fulfilled, (state, action) => {
        state.loading = false;
        state.currentInvoice = action.payload;
      })
      .addCase(fetchInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch List
      .addCase(fetchInvoices.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices = action.payload;
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

// ==================== SELECTORS ====================
export const selectInvoices = (state) => state.invoice.invoices;
export const selectCurrentInvoice = (state) => state.invoice.currentInvoice;
export const selectBillingStats = (state) => state.invoice.billingStats;
export const selectInvoiceLoading = (state) => state.invoice.loading;
export const selectInvoiceError = (state) => state.invoice.error;

// ==================== ACTIONS ====================
export const { clearCurrentInvoice, clearInvoiceError } = invoiceSlice.actions;

export default invoiceSlice.reducer;
