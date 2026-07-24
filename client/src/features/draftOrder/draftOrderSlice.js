// features/draftOrder/draftOrderSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as draftOrderApi from "./draftOrderApi";

const DRAFT_ALREADY_CONVERTED_MESSAGE =
  "This draft has already been converted into an order and can no longer be edited as a draft. Please edit the created order instead.";

const errMsg = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

export const createDraftOrder = createAsyncThunk(
  "draftOrder/create",
  async (draftData, { rejectWithValue }) => {
    try {
      const response = await draftOrderApi.createDraft(draftData);
      return response.draft;
    } catch (error) {
      return rejectWithValue({ message: errMsg(error, "Failed to save draft"), status: error?.response?.status });
    }
  }
);

export const updateDraftOrder = createAsyncThunk(
  "draftOrder/update",
  async ({ id, draftData }, { rejectWithValue }) => {
    try {
      const response = await draftOrderApi.updateDraft(id, draftData);
      return response.draft;
    } catch (error) {
      const status = error?.response?.status;
      const code = error?.response?.data?.code;
      return rejectWithValue({
        message: errMsg(error, "Failed to save draft"),
        status,
        alreadyConverted: status === 409 && code === "DRAFT_ALREADY_CONVERTED",
      });
    }
  }
);

export const fetchDrafts = createAsyncThunk(
  "draftOrder/list",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await draftOrderApi.getDrafts(params);
    } catch (error) {
      return rejectWithValue(errMsg(error, "Failed to load drafts"));
    }
  }
);

export const fetchDraftById = createAsyncThunk(
  "draftOrder/getById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await draftOrderApi.getDraftById(id);
      return response.draft;
    } catch (error) {
      const status = error?.response?.status;
      const code = error?.response?.data?.code;
      return rejectWithValue({
        message: errMsg(error, "Failed to load draft"),
        status,
        alreadyConverted: status === 409 && code === "DRAFT_ALREADY_CONVERTED",
      });
    }
  }
);

export const deleteDraftOrder = createAsyncThunk(
  "draftOrder/delete",
  async (id, { rejectWithValue }) => {
    try {
      await draftOrderApi.deleteDraft(id);
      return id;
    } catch (error) {
      return rejectWithValue(errMsg(error, "Failed to delete draft"));
    }
  }
);

export const duplicateDraftOrder = createAsyncThunk(
  "draftOrder/duplicate",
  async (id, { rejectWithValue }) => {
    try {
      const response = await draftOrderApi.duplicateDraft(id);
      return response.draft;
    } catch (error) {
      return rejectWithValue(errMsg(error, "Failed to duplicate draft"));
    }
  }
);

// Reuses the exact FormData-building convention from orderSlice.js's createNewOrder
// thunk (same garments[i].referenceImages/customerImages/customerClothImages field
// naming) since this also posts to a multipart endpoint (convertDraft on the backend).
export const convertDraftToOrder = createAsyncThunk(
  "draftOrder/convert",
  async ({ id, orderData }, { rejectWithValue }) => {
    try {
      const hasFiles = (orderData.garments || []).some(
        (g) =>
          (g.referenceImages && g.referenceImages.some((img) => img instanceof File)) ||
          (g.customerImages && g.customerImages.some((img) => img instanceof File)) ||
          (g.customerClothImages && g.customerClothImages.some((img) => img instanceof File))
      );

      let dataToSend = orderData;

      if (hasFiles) {
        const fd = new FormData();
        fd.append("customer", orderData.customer);
        fd.append("deliveryDate", orderData.deliveryDate);
        fd.append("specialNotes", orderData.specialNotes || "");
        if (orderData.workflowStages?.length) fd.append("workflowStages", JSON.stringify(orderData.workflowStages));
        if (orderData.orderDate) fd.append("orderDate", orderData.orderDate);
        if (orderData.status) fd.append("status", orderData.status);
        if (orderData.balanceAmount !== undefined) fd.append("balanceAmount", orderData.balanceAmount);
        if (orderData.payments?.length) fd.append("payments", JSON.stringify(orderData.payments));
        if (orderData.priceSummary) fd.append("priceSummary", JSON.stringify(orderData.priceSummary));

        const garmentsWithoutFiles = (orderData.garments || []).map((g) => {
          const copy = { ...g };
          delete copy.referenceImages;
          delete copy.customerImages;
          delete copy.customerClothImages;
          if (copy.priceRange) {
            copy.priceRange = { min: Number(copy.priceRange.min) || 0, max: Number(copy.priceRange.max) || 0 };
          }
          return copy;
        });
        fd.append("garments", JSON.stringify(garmentsWithoutFiles));

        (orderData.garments || []).forEach((garment, index) => {
          ["referenceImages", "customerImages", "customerClothImages"].forEach((field) => {
            (garment[field] || []).forEach((file) => {
              if (file instanceof File) fd.append(`garments[${index}].${field}`, file);
            });
          });
        });

        dataToSend = fd;
      }

      const response = await draftOrderApi.convertDraft(id, dataToSend);
      return response.order;
    } catch (error) {
      const status = error?.response?.status;
      const code = error?.response?.data?.code;
      return rejectWithValue({
        message: errMsg(error, "Failed to create order from draft"),
        status,
        alreadyConverted: status === 409 && code === "DRAFT_ALREADY_CONVERTED",
      });
    }
  }
);

const initialState = {
  drafts: [],
  pagination: { page: 1, limit: 20, total: 0, pages: 1 },
  currentDraft: null,
  loading: false,
  error: null,
  autosaveStatus: "idle", // idle | saving | saved | error | locked
  lastSavedAt: null,
  lockMessage: null,
};

const draftOrderSlice = createSlice({
  name: "draftOrder",
  initialState,
  reducers: {
    clearCurrentDraft(state) {
      state.currentDraft = null;
      state.autosaveStatus = "idle";
      state.lastSavedAt = null;
      state.lockMessage = null;
    },
    resetAutosaveStatus(state) {
      state.autosaveStatus = "idle";
      state.lockMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createDraftOrder.pending, (state) => {
        state.autosaveStatus = "saving";
      })
      .addCase(createDraftOrder.fulfilled, (state, action) => {
        state.autosaveStatus = "saved";
        state.lastSavedAt = Date.now();
        state.currentDraft = action.payload;
      })
      .addCase(createDraftOrder.rejected, (state) => {
        state.autosaveStatus = "error";
      })

      .addCase(updateDraftOrder.pending, (state) => {
        state.autosaveStatus = "saving";
      })
      .addCase(updateDraftOrder.fulfilled, (state, action) => {
        state.autosaveStatus = "saved";
        state.lastSavedAt = Date.now();
        state.currentDraft = action.payload;
      })
      .addCase(updateDraftOrder.rejected, (state, action) => {
        if (action.payload?.alreadyConverted) {
          state.autosaveStatus = "locked";
          state.lockMessage = DRAFT_ALREADY_CONVERTED_MESSAGE;
        } else {
          state.autosaveStatus = "error";
        }
      })

      .addCase(fetchDrafts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDrafts.fulfilled, (state, action) => {
        state.loading = false;
        state.drafts = action.payload.drafts || [];
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(fetchDrafts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchDraftById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDraftById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDraft = action.payload;
      })
      .addCase(fetchDraftById.rejected, (state, action) => {
        state.loading = false;
        if (action.payload?.alreadyConverted) {
          state.autosaveStatus = "locked";
          state.lockMessage = DRAFT_ALREADY_CONVERTED_MESSAGE;
        }
        state.error = action.payload?.message;
      })

      .addCase(deleteDraftOrder.fulfilled, (state, action) => {
        state.drafts = state.drafts.filter((d) => d._id !== action.payload);
      })

      .addCase(duplicateDraftOrder.fulfilled, (state, action) => {
        state.drafts = [action.payload, ...state.drafts];
      })

      .addCase(convertDraftToOrder.rejected, (state, action) => {
        if (action.payload?.alreadyConverted) {
          state.autosaveStatus = "locked";
          state.lockMessage = DRAFT_ALREADY_CONVERTED_MESSAGE;
        }
      });
  },
});

export const { clearCurrentDraft, resetAutosaveStatus } = draftOrderSlice.actions;
export const DRAFT_LOCK_MESSAGE = DRAFT_ALREADY_CONVERTED_MESSAGE;
export default draftOrderSlice.reducer;
