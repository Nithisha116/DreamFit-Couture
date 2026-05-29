// // src/features/cuttingMaster/cuttingMasterSlice.js
// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import * as cuttingMasterApi from "./cuttingMasterApi";

// // ===== ASYNC THUNKS =====
// export const fetchAllCuttingMasters = createAsyncThunk(
//   "cuttingMaster/fetchAll",
//   async (params = {}, { rejectWithValue }) => {
//     try {
//       const response = await cuttingMasterApi.getAllCuttingMastersApi(params);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch cutting masters");
//     }
//   }
// );

// export const fetchCuttingMasterById = createAsyncThunk(
//   "cuttingMaster/fetchById",
//   async (id, { rejectWithValue }) => {
//     try {
//       const response = await cuttingMasterApi.getCuttingMasterByIdApi(id);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch cutting master");
//     }
//   }
// );

// export const createCuttingMaster = createAsyncThunk(
//   "cuttingMaster/create",
//   async (cuttingMasterData, { rejectWithValue }) => {
//     try {
//       const response = await cuttingMasterApi.createCuttingMasterApi(cuttingMasterData);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to create cutting master");
//     }
//   }
// );

// export const updateCuttingMaster = createAsyncThunk(
//   "cuttingMaster/update",
//   async ({ id, cuttingMasterData }, { rejectWithValue }) => {
//     try {
//       const response = await cuttingMasterApi.updateCuttingMasterApi(id, cuttingMasterData);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to update cutting master");
//     }
//   }
// );

// export const deleteCuttingMaster = createAsyncThunk(
//   "cuttingMaster/delete",
//   async (id, { rejectWithValue }) => {
//     try {
//       await cuttingMasterApi.deleteCuttingMasterApi(id);
//       return id;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to delete cutting master");
//     }
//   }
// );

// export const fetchCuttingMasterStats = createAsyncThunk(
//   "cuttingMaster/fetchStats",
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await cuttingMasterApi.getCuttingMasterStatsApi();
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch stats");
//     }
//   }
// );

// const cuttingMasterSlice = createSlice({
//   name: "cuttingMaster",
//   initialState: {
//     cuttingMasters: [],
//     currentCuttingMaster: null,
//     works: [],
//     workStats: {},
//     stats: {},
//     loading: false,
//     error: null,
//     pagination: {
//       page: 1,
//       limit: 10,
//       total: 0,
//       pages: 1
//     }
//   },
//   reducers: {
//     clearCurrentCuttingMaster: (state) => {
//       state.currentCuttingMaster = null;
//       state.works = [];
//       state.workStats = {};
//     },
//     clearError: (state) => {
//       state.error = null;
//     },
//     setPage: (state, action) => {
//       state.pagination.page = action.payload;
//     },
//     setLimit: (state, action) => {
//       state.pagination.limit = action.payload;
//       state.pagination.page = 1;
//     }
//   },
//   extraReducers: (builder) => {
//     builder
//       // ===== FETCH ALL =====
//       .addCase(fetchAllCuttingMasters.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchAllCuttingMasters.fulfilled, (state, action) => {
//         state.loading = false;
//         if (Array.isArray(action.payload)) {
//           state.cuttingMasters = action.payload;
//         } else {
//           state.cuttingMasters = action.payload.cuttingMasters || action.payload;
//           state.pagination = { ...state.pagination, ...(action.payload.pagination || {}) };
//         }
//       })
//       .addCase(fetchAllCuttingMasters.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== FETCH BY ID =====
//       .addCase(fetchCuttingMasterById.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchCuttingMasterById.fulfilled, (state, action) => {
//         state.loading = false;
//         state.currentCuttingMaster = action.payload.cuttingMaster;
//         state.works = action.payload.works || [];
//         state.workStats = action.payload.workStats || {};
//       })
//       .addCase(fetchCuttingMasterById.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== CREATE =====
//       .addCase(createCuttingMaster.fulfilled, (state, action) => {
//         state.cuttingMasters = [action.payload.cuttingMaster, ...state.cuttingMasters];
//       })

//       // ===== UPDATE =====
//       .addCase(updateCuttingMaster.fulfilled, (state, action) => {
//         const updated = action.payload.cuttingMaster;
//         const index = state.cuttingMasters.findIndex(c => c._id === updated._id);
//         if (index !== -1) state.cuttingMasters[index] = updated;
//         if (state.currentCuttingMaster?._id === updated._id) {
//           state.currentCuttingMaster = updated;
//         }
//       })

//       // ===== DELETE =====
//       .addCase(deleteCuttingMaster.fulfilled, (state, action) => {
//         state.cuttingMasters = state.cuttingMasters.filter(c => c._id !== action.payload);
//         if (state.currentCuttingMaster?._id === action.payload) {
//           state.currentCuttingMaster = null;
//           state.works = [];
//           state.workStats = {};
//         }
//       })

//       // ===== FETCH STATS =====
//       .addCase(fetchCuttingMasterStats.fulfilled, (state, action) => {
//         state.stats = action.payload.cuttingMasterStats || {};
//       });
//   }
// });

// export const { clearCurrentCuttingMaster, clearError, setPage, setLimit } = cuttingMasterSlice.actions;
// export default cuttingMasterSlice.reducer;

















// src/features/cuttingMaster/cuttingMasterSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as cuttingMasterApi from "./cuttingMasterApi";

// ===== ASYNC THUNKS =====

// 📋 CRUD Operations
export const fetchAllCuttingMasters = createAsyncThunk(
  "cuttingMaster/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await cuttingMasterApi.getAllCuttingMastersApi(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch cutting masters");
    }
  }
);

export const fetchCuttingMasterById = createAsyncThunk(
  "cuttingMaster/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await cuttingMasterApi.getCuttingMasterByIdApi(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch cutting master");
    }
  }
);

export const createCuttingMaster = createAsyncThunk(
  "cuttingMaster/create",
  async (cuttingMasterData, { rejectWithValue }) => {
    try {
      const response = await cuttingMasterApi.createCuttingMasterApi(cuttingMasterData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create cutting master");
    }
  }
);

export const updateCuttingMaster = createAsyncThunk(
  "cuttingMaster/update",
  async ({ id, cuttingMasterData }, { rejectWithValue }) => {
    try {
      const response = await cuttingMasterApi.updateCuttingMasterApi(id, cuttingMasterData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update cutting master");
    }
  }
);

export const deleteCuttingMaster = createAsyncThunk(
  "cuttingMaster/delete",
  async (id, { rejectWithValue }) => {
    try {
      await cuttingMasterApi.deleteCuttingMasterApi(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete cutting master");
    }
  }
);

export const fetchCuttingMasterStats = createAsyncThunk(
  "cuttingMaster/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await cuttingMasterApi.getCuttingMasterStatsApi();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch stats");
    }
  }
);


// ============================================
// 📊 INITIAL STATE
// ============================================
const initialState = {
  // CRUD Data
  cuttingMasters: [],
  currentCuttingMaster: null,
  works: [],
  workStats: {},
  stats: {},
  


  // UI State
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  }
};

// ============================================
// 📊 SLICE
// ============================================
const cuttingMasterSlice = createSlice({
  name: "cuttingMaster",
  initialState,
  reducers: {
    clearCurrentCuttingMaster: (state) => {
      state.currentCuttingMaster = null;
      state.works = [];
      state.workStats = {};
    },
    clearError: (state) => {
      state.error = null;
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // ===== FETCH ALL CUTTING MASTERS =====
      .addCase(fetchAllCuttingMasters.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllCuttingMasters.fulfilled, (state, action) => {
        state.loading = false;
        if (Array.isArray(action.payload)) {
          state.cuttingMasters = action.payload;
        } else {
          state.cuttingMasters = action.payload.cuttingMasters || action.payload;
          state.pagination = { ...state.pagination, ...(action.payload.pagination || {}) };
        }
      })
      .addCase(fetchAllCuttingMasters.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ===== FETCH BY ID =====
      .addCase(fetchCuttingMasterById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCuttingMasterById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCuttingMaster = action.payload.cuttingMaster;
        state.works = action.payload.works || [];
        state.workStats = action.payload.workStats || {};
      })
      .addCase(fetchCuttingMasterById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ===== CREATE =====
      .addCase(createCuttingMaster.fulfilled, (state, action) => {
        state.cuttingMasters = [action.payload.cuttingMaster, ...state.cuttingMasters];
      })

      // ===== UPDATE =====
      .addCase(updateCuttingMaster.fulfilled, (state, action) => {
        const updated = action.payload.cuttingMaster;
        const index = state.cuttingMasters.findIndex(c => c._id === updated._id);
        if (index !== -1) state.cuttingMasters[index] = updated;
        if (state.currentCuttingMaster?._id === updated._id) {
          state.currentCuttingMaster = updated;
        }
      })

      // ===== DELETE =====
      .addCase(deleteCuttingMaster.fulfilled, (state, action) => {
        state.cuttingMasters = state.cuttingMasters.filter(c => c._id !== action.payload);
        if (state.currentCuttingMaster?._id === action.payload) {
          state.currentCuttingMaster = null;
          state.works = [];
          state.workStats = {};
        }
      })

      // ===== FETCH STATS =====
      .addCase(fetchCuttingMasterStats.fulfilled, (state, action) => {
        state.stats = action.payload.cuttingMasterStats || {};
      });
  }
});

// ============================================
// 📊 SELECTORS
// ============================================

// CRUD Selectors
export const selectAllCuttingMasters = (state) => state.cuttingMaster.cuttingMasters;
export const selectCurrentCuttingMaster = (state) => state.cuttingMaster.currentCuttingMaster;
export const selectCuttingMasterWorks = (state) => state.cuttingMaster.works;
export const selectCuttingMasterWorkStats = (state) => state.cuttingMaster.workStats;
export const selectCuttingMasterStats = (state) => state.cuttingMaster.stats;


// UI State Selectors
export const selectCuttingMasterLoading = (state) => state.cuttingMaster.loading;
export const selectCuttingMasterError = (state) => state.cuttingMaster.error;
export const selectCuttingMasterPagination = (state) => state.cuttingMaster.pagination;

// ============================================
// 📊 ACTIONS EXPORT
// ============================================
export const { 
  clearCurrentCuttingMaster, 
  clearError, 
  setPage, 
  setLimit
} = cuttingMasterSlice.actions;

export default cuttingMasterSlice.reducer;