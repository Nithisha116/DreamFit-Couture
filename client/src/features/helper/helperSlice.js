// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import * as helperApi from "./helperApi";

// // ===== ASYNC THUNKS =====

// // ✅ FETCH ALL HELPERS (with pagination & sorting)
// export const fetchAllHelpers = createAsyncThunk(
//   "helper/fetchAll",
//   async (params = {}, { rejectWithValue }) => {
//     try {
//       const response = await helperApi.getAllHelpersApi(params);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch helpers");
//     }
//   }
// );

// export const fetchHelperById = createAsyncThunk(
//   "helper/fetchById",
//   async (id, { rejectWithValue }) => {
//     try {
//       const response = await helperApi.getHelperByIdApi(id);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch helper");
//     }
//   }
// );

// // ===== CREATE HELPER - UPDATED WITH DEBUG LOGS =====
// export const createHelper = createAsyncThunk(
//   "helper/create",
//   async (helperData, { rejectWithValue }) => {
//     try {
//       // DEBUG: Log the data received in thunk
//       console.log("🔵 [Redux Thunk] createHelper received:", {
//         ...helperData,
//         password: helperData.password ? `✅ PRESENT (${helperData.password.length} chars)` : "❌ MISSING",
//         passwordFirstChars: helperData.password ? helperData.password.substring(0, 3) + '...' : null
//       });

//       // CRITICAL CHECK: Verify password exists
//       if (!helperData.password) {
//         console.error("🔴 [Redux Thunk] CRITICAL: Password is missing in thunk!");
        
//         // Check if password might be in a different property
//         const possiblePasswordProps = ['password', 'pass', 'pwd', 'Password'];
//         const foundProps = possiblePasswordProps.filter(prop => helperData[prop]);
        
//         if (foundProps.length > 0) {
//           console.log("🔵 [Redux Thunk] Found password in alternative property:", foundProps[0]);
//           // Use the found password property
//           helperData.password = helperData[foundProps[0]];
//         } else {
//           return rejectWithValue({ 
//             message: "Password is required but was not provided in the request data" 
//           });
//         }
//       }

//       // Ensure all required fields are present
//       const apiData = {
//         name: helperData.name,
//         phone: helperData.phone,
//         email: helperData.email || undefined,
//         password: helperData.password, // Explicitly include password
//         experience: helperData.experience || 0,
//         specialization: Array.isArray(helperData.specialization) ? helperData.specialization : [],
//         address: helperData.address || {}
//       };

//       // DEBUG: Log the data being sent to API
//       console.log("🔵 [Redux Thunk] Sending to API:", {
//         ...apiData,
//         password: apiData.password ? `✅ PRESENT (${apiData.password.length} chars)` : "❌ MISSING",
//         passwordPreview: apiData.password ? apiData.password.substring(0, 3) + '...' : null
//       });

//       // Make the API call
//       const response = await helperApi.createHelperApi(apiData);
      
//       // DEBUG: Log the API response
//       console.log("🔵 [Redux Thunk] API Response:", response);
      
//       return response;
//     } catch (error) {
//       console.error("🔴 [Redux Thunk] Error:", {
//         message: error.message,
//         response: error.response?.data,
//         status: error.response?.status
//       });
      
//       return rejectWithValue(
//         error.response?.data?.message || 
//         error.message || 
//         "Failed to create helper"
//       );
//     }
//   }
// );

// export const updateHelper = createAsyncThunk(
//   "helper/update",
//   async ({ id, helperData }, { rejectWithValue }) => {
//     try {
//       const response = await helperApi.updateHelperApi(id, helperData);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to update helper");
//     }
//   }
// );

// export const updateLeaveStatus = createAsyncThunk(
//   "helper/updateLeave",
//   async ({ id, leaveData }, { rejectWithValue }) => {
//     try {
//       const response = await helperApi.updateLeaveStatusApi(id, leaveData);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to update leave status");
//     }
//   }
// );

// // ✅ NEW: TOGGLE HELPER STATUS (Activate/Deactivate)
// export const toggleHelperStatus = createAsyncThunk(
//   "helper/toggleStatus",
//   async (id, { rejectWithValue }) => {
//     try {
//       const response = await helperApi.toggleHelperStatusApi(id);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to toggle status");
//     }
//   }
// );

// export const deleteHelper = createAsyncThunk(
//   "helper/delete",
//   async (id, { rejectWithValue }) => {
//     try {
//       await helperApi.deleteHelperApi(id);
//       return id;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to delete helper");
//     }
//   }
// );

// export const fetchHelperStats = createAsyncThunk(
//   "helper/fetchStats",
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await helperApi.getHelperStatsApi();
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch stats");
//     }
//   }
// );

// const helperSlice = createSlice({
//   name: "helper",
//   initialState: {
//     helpers: [],
//     currentHelper: null,
//     works: [],
//     workStats: {},
//     helperStats: {},
//     workDistribution: {},
//     loading: false,
//     error: null,
    
//     // ✅ NEW: Pagination state
//     pagination: {
//       page: 1,
//       limit: 10,
//       total: 0,
//       pages: 1
//     },
    
//     // ✅ NEW: Sorting state
//     sorting: {
//       field: "createdAt",
//       order: "desc" // 'asc' or 'desc'
//     },
    
//     // ✅ NEW: Search state
//     search: {
//       term: "",
//       filters: {
//         status: "all",
//         availability: "all"
//       }
//     }
//   },
//   reducers: {
//     clearCurrentHelper: (state) => {
//       state.currentHelper = null;
//       state.works = [];
//       state.workStats = {};
//     },
//     clearError: (state) => {
//       state.error = null;
//     },
    
//     // ✅ NEW: Pagination actions
//     setPage: (state, action) => {
//       state.pagination.page = action.payload;
//     },
//     setLimit: (state, action) => {
//       state.pagination.limit = action.payload;
//       state.pagination.page = 1; // Reset to first page
//     },
    
//     // ✅ NEW: Sorting actions
//     setSorting: (state, action) => {
//       state.sorting = { ...state.sorting, ...action.payload };
//     },
    
//     // ✅ NEW: Search actions
//     setSearchTerm: (state, action) => {
//       state.search.term = action.payload;
//       state.pagination.page = 1; // Reset to first page
//     },
//     setSearchFilter: (state, action) => {
//       state.search.filters = { ...state.search.filters, ...action.payload };
//       state.pagination.page = 1; // Reset to first page
//     },
//     resetSearch: (state) => {
//       state.search = {
//         term: "",
//         filters: {
//           status: "all",
//           availability: "all"
//         }
//       };
//       state.pagination.page = 1;
//     }
//   },
//   extraReducers: (builder) => {
//     builder
//       // ===== FETCH ALL HELPERS =====
//       .addCase(fetchAllHelpers.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchAllHelpers.fulfilled, (state, action) => {
//         state.loading = false;
        
//         // ✅ Handle both array and paginated responses
//         if (Array.isArray(action.payload)) {
//           state.helpers = action.payload;
//           state.pagination.total = action.payload.length;
//           state.pagination.pages = 1;
//         } else {
//           state.helpers = action.payload.helpers || action.payload;
//           state.pagination = {
//             ...state.pagination,
//             ...(action.payload.pagination || {})
//           };
//         }
//       })
//       .addCase(fetchAllHelpers.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== FETCH HELPER BY ID =====
//       .addCase(fetchHelperById.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchHelperById.fulfilled, (state, action) => {
//         state.loading = false;
//         state.currentHelper = action.payload.helper;
//         state.works = action.payload.works;
//         state.workStats = action.payload.workStats;
//       })
//       .addCase(fetchHelperById.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== CREATE HELPER =====
//       .addCase(createHelper.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//         console.log("🟡 [Redux] createHelper pending");
//       })
//       .addCase(createHelper.fulfilled, (state, action) => {
//         state.loading = false;
//         console.log("🟢 [Redux] createHelper fulfilled:", action.payload);
//         state.helpers = [action.payload.helper, ...state.helpers];
//         state.pagination.total += 1;
//       })
//       .addCase(createHelper.rejected, (state, action) => {
//         state.loading = false;
//         console.error("🔴 [Redux] createHelper rejected:", action.payload);
//         state.error = action.payload;
//       })

//       // ===== UPDATE HELPER =====
//       .addCase(updateHelper.fulfilled, (state, action) => {
//         const updatedHelper = action.payload.helper;
//         const index = state.helpers.findIndex(t => t._id === updatedHelper._id);
//         if (index !== -1) {
//           state.helpers[index] = updatedHelper;
//         }
//         if (state.currentHelper?._id === updatedHelper._id) {
//           state.currentHelper = updatedHelper;
//         }
//       })

//       // ===== UPDATE LEAVE STATUS =====
//       .addCase(updateLeaveStatus.fulfilled, (state, action) => {
//         const updatedHelper = action.payload.helper;
//         const index = state.helpers.findIndex(t => t._id === updatedHelper._id);
//         if (index !== -1) {
//           state.helpers[index] = updatedHelper;
//         }
//         if (state.currentHelper?._id === updatedHelper._id) {
//           state.currentHelper = updatedHelper;
//         }
//       })

//       // ===== TOGGLE HELPER STATUS =====
//       .addCase(toggleHelperStatus.fulfilled, (state, action) => {
//         const updatedHelper = action.payload.helper;
//         const index = state.helpers.findIndex(t => t._id === updatedHelper._id);
//         if (index !== -1) {
//           state.helpers[index] = updatedHelper;
//         }
//         if (state.currentHelper?._id === updatedHelper._id) {
//           state.currentHelper = updatedHelper;
//         }
//       })

//       // ===== DELETE HELPER =====
//       .addCase(deleteHelper.fulfilled, (state, action) => {
//         state.helpers = state.helpers.filter(t => t._id !== action.payload);
//         state.pagination.total -= 1;
//         if (state.currentHelper?._id === action.payload) {
//           state.currentHelper = null;
//           state.works = [];
//           state.workStats = {};
//         }
//       })

//       // ===== FETCH HELPER STATS =====
//       .addCase(fetchHelperStats.fulfilled, (state, action) => {
//         state.helperStats = action.payload.helperStats;
//         state.workDistribution = action.payload.workDistribution;
//       });
//   },
// });

// export const { 
//   clearCurrentHelper, 
//   clearError,
//   setPage,
//   setLimit,
//   setSorting,
//   setSearchTerm,
//   setSearchFilter,
//   resetSearch
// } = helperSlice.actions;

// export default helperSlice.reducer;








// // frontend/src/features/helper/helperSlice.js - COMPLETE FIXED VERSION
// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import * as helperApi from "./helperApi";

// // ===== ASYNC THUNKS =====

// // ✅ FETCH ALL HELPERS (with pagination & sorting)
// export const fetchAllHelpers = createAsyncThunk(
//   "helper/fetchAll",
//   async (params = {}, { rejectWithValue }) => {
//     try {
//       const response = await helperApi.getAllHelpersApi(params);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch helpers");
//     }
//   }
// );

// export const fetchHelperById = createAsyncThunk(
//   "helper/fetchById",
//   async (id, { rejectWithValue }) => {
//     try {
//       const response = await helperApi.getHelperByIdApi(id);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch helper");
//     }
//   }
// );

// // ✅ NEW: FETCH TOP HELPERS for dashboard
// export const fetchTopHelpers = createAsyncThunk(
//   "helper/fetchTop",
//   async ({ limit = 5 } = {}, { rejectWithValue }) => {
//     try {
//       const response = await helperApi.getTopHelpersApi(limit);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch top helpers");
//     }
//   }
// );

// // ✅ FETCH HELPER STATS
// export const fetchHelperStats = createAsyncThunk(
//   "helper/fetchStats",
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await helperApi.getHelperStatsApi();
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch stats");
//     }
//   }
// );

// // ===== CREATE HELPER - UPDATED WITH DEBUG LOGS =====
// export const createHelper = createAsyncThunk(
//   "helper/create",
//   async (helperData, { rejectWithValue }) => {
//     try {
//       // DEBUG: Log the data received in thunk
//       console.log("🔵 [Redux Thunk] createHelper received:", {
//         ...helperData,
//         password: helperData.password ? `✅ PRESENT (${helperData.password.length} chars)` : "❌ MISSING",
//         passwordFirstChars: helperData.password ? helperData.password.substring(0, 3) + '...' : null
//       });

//       // CRITICAL CHECK: Verify password exists
//       if (!helperData.password) {
//         console.error("🔴 [Redux Thunk] CRITICAL: Password is missing in thunk!");
        
//         // Check if password might be in a different property
//         const possiblePasswordProps = ['password', 'pass', 'pwd', 'Password'];
//         const foundProps = possiblePasswordProps.filter(prop => helperData[prop]);
        
//         if (foundProps.length > 0) {
//           console.log("🔵 [Redux Thunk] Found password in alternative property:", foundProps[0]);
//           // Use the found password property
//           helperData.password = helperData[foundProps[0]];
//         } else {
//           return rejectWithValue({ 
//             message: "Password is required but was not provided in the request data" 
//           });
//         }
//       }

//       // Ensure all required fields are present
//       const apiData = {
//         name: helperData.name,
//         phone: helperData.phone,
//         email: helperData.email || undefined,
//         password: helperData.password, // Explicitly include password
//         experience: helperData.experience || 0,
//         specialization: Array.isArray(helperData.specialization) ? helperData.specialization : [],
//         address: helperData.address || {}
//       };

//       // DEBUG: Log the data being sent to API
//       console.log("🔵 [Redux Thunk] Sending to API:", {
//         ...apiData,
//         password: apiData.password ? `✅ PRESENT (${apiData.password.length} chars)` : "❌ MISSING",
//         passwordPreview: apiData.password ? apiData.password.substring(0, 3) + '...' : null
//       });

//       // Make the API call
//       const response = await helperApi.createHelperApi(apiData);
      
//       // DEBUG: Log the API response
//       console.log("🔵 [Redux Thunk] API Response:", response);
      
//       return response;
//     } catch (error) {
//       console.error("🔴 [Redux Thunk] Error:", {
//         message: error.message,
//         response: error.response?.data,
//         status: error.response?.status
//       });
      
//       return rejectWithValue(
//         error.response?.data?.message || 
//         error.message || 
//         "Failed to create helper"
//       );
//     }
//   }
// );

// export const updateHelper = createAsyncThunk(
//   "helper/update",
//   async ({ id, helperData }, { rejectWithValue }) => {
//     try {
//       const response = await helperApi.updateHelperApi(id, helperData);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to update helper");
//     }
//   }
// );

// export const updateLeaveStatus = createAsyncThunk(
//   "helper/updateLeave",
//   async ({ id, leaveData }, { rejectWithValue }) => {
//     try {
//       const response = await helperApi.updateLeaveStatusApi(id, leaveData);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to update leave status");
//     }
//   }
// );

// // ✅ NEW: TOGGLE HELPER STATUS (Activate/Deactivate)
// export const toggleHelperStatus = createAsyncThunk(
//   "helper/toggleStatus",
//   async (id, { rejectWithValue }) => {
//     try {
//       const response = await helperApi.toggleHelperStatusApi(id);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to toggle status");
//     }
//   }
// );

// export const deleteHelper = createAsyncThunk(
//   "helper/delete",
//   async (id, { rejectWithValue }) => {
//     try {
//       await helperApi.deleteHelperApi(id);
//       return id;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to delete helper");
//     }
//   }
// );

// const helperSlice = createSlice({
//   name: "helper",
//   initialState: {
//     helpers: [],
//     currentHelper: null,
//     works: [],
//     workStats: {},
//     helperStats: {},
//     workDistribution: {},
    
//     // ✅ NEW: Top helpers for dashboard
//     topHelpers: [],
//     topHelpersSummary: {},
//     topHelpersLoading: false,
    
//     loading: false,
//     error: null,
    
//     // Pagination state
//     pagination: {
//       page: 1,
//       limit: 10,
//       total: 0,
//       pages: 1
//     },
    
//     // Sorting state
//     sorting: {
//       field: "createdAt",
//       order: "desc" // 'asc' or 'desc'
//     },
    
//     // Search state
//     search: {
//       term: "",
//       filters: {
//         status: "all",
//         availability: "all"
//       }
//     }
//   },
//   reducers: {
//     clearCurrentHelper: (state) => {
//       state.currentHelper = null;
//       state.works = [];
//       state.workStats = {};
//     },
//     clearError: (state) => {
//       state.error = null;
//     },
    
//     // Pagination actions
//     setPage: (state, action) => {
//       state.pagination.page = action.payload;
//     },
//     setLimit: (state, action) => {
//       state.pagination.limit = action.payload;
//       state.pagination.page = 1; // Reset to first page
//     },
    
//     // Sorting actions
//     setSorting: (state, action) => {
//       state.sorting = { ...state.sorting, ...action.payload };
//     },
    
//     // Search actions
//     setSearchTerm: (state, action) => {
//       state.search.term = action.payload;
//       state.pagination.page = 1; // Reset to first page
//     },
//     setSearchFilter: (state, action) => {
//       state.search.filters = { ...state.search.filters, ...action.payload };
//       state.pagination.page = 1; // Reset to first page
//     },
//     resetSearch: (state) => {
//       state.search = {
//         term: "",
//         filters: {
//           status: "all",
//           availability: "all"
//         }
//       };
//       state.pagination.page = 1;
//     },
    
//     // ✅ NEW: Clear top helpers
//     clearTopHelpers: (state) => {
//       state.topHelpers = [];
//       state.topHelpersSummary = {};
//     }
//   },
//   extraReducers: (builder) => {
//     builder
//       // ===== FETCH ALL HELPERS =====
//       .addCase(fetchAllHelpers.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchAllHelpers.fulfilled, (state, action) => {
//         state.loading = false;
        
//         // Handle both array and paginated responses
//         if (Array.isArray(action.payload)) {
//           state.helpers = action.payload;
//           state.pagination.total = action.payload.length;
//           state.pagination.pages = 1;
//         } else {
//           state.helpers = action.payload.helpers || action.payload;
//           state.pagination = {
//             ...state.pagination,
//             ...(action.payload.pagination || {})
//           };
//         }
//       })
//       .addCase(fetchAllHelpers.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== FETCH HELPER BY ID =====
//       .addCase(fetchHelperById.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchHelperById.fulfilled, (state, action) => {
//         state.loading = false;
//         state.currentHelper = action.payload.helper;
//         state.works = action.payload.works;
//         state.workStats = action.payload.workStats;
//       })
//       .addCase(fetchHelperById.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== FETCH TOP HELPERS (NEW) =====
//       .addCase(fetchTopHelpers.pending, (state) => {
//         state.topHelpersLoading = true;
//         state.error = null;
//       })
//       .addCase(fetchTopHelpers.fulfilled, (state, action) => {
//         state.topHelpersLoading = false;
//         state.topHelpers = action.payload.topHelpers || [];
//         state.topHelpersSummary = action.payload.summary || {};
//       })
//       .addCase(fetchTopHelpers.rejected, (state, action) => {
//         state.topHelpersLoading = false;
//         state.error = action.payload;
//       })

//       // ===== CREATE HELPER =====
//       .addCase(createHelper.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//         console.log("🟡 [Redux] createHelper pending");
//       })
//       .addCase(createHelper.fulfilled, (state, action) => {
//         state.loading = false;
//         console.log("🟢 [Redux] createHelper fulfilled:", action.payload);
//         state.helpers = [action.payload.helper, ...state.helpers];
//         state.pagination.total += 1;
//       })
//       .addCase(createHelper.rejected, (state, action) => {
//         state.loading = false;
//         console.error("🔴 [Redux] createHelper rejected:", action.payload);
//         state.error = action.payload;
//       })

//       // ===== UPDATE HELPER =====
//       .addCase(updateHelper.fulfilled, (state, action) => {
//         const updatedHelper = action.payload.helper;
//         const index = state.helpers.findIndex(t => t._id === updatedHelper._id);
//         if (index !== -1) {
//           state.helpers[index] = updatedHelper;
//         }
//         if (state.currentHelper?._id === updatedHelper._id) {
//           state.currentHelper = updatedHelper;
//         }
//       })

//       // ===== UPDATE LEAVE STATUS =====
//       .addCase(updateLeaveStatus.fulfilled, (state, action) => {
//         const updatedHelper = action.payload.helper;
//         const index = state.helpers.findIndex(t => t._id === updatedHelper._id);
//         if (index !== -1) {
//           state.helpers[index] = updatedHelper;
//         }
//         if (state.currentHelper?._id === updatedHelper._id) {
//           state.currentHelper = updatedHelper;
//         }
//       })

//       // ===== TOGGLE HELPER STATUS =====
//       .addCase(toggleHelperStatus.fulfilled, (state, action) => {
//         const updatedHelper = action.payload.helper;
//         const index = state.helpers.findIndex(t => t._id === updatedHelper._id);
//         if (index !== -1) {
//           state.helpers[index] = updatedHelper;
//         }
//         if (state.currentHelper?._id === updatedHelper._id) {
//           state.currentHelper = updatedHelper;
//         }
//       })

//       // ===== DELETE HELPER =====
//       .addCase(deleteHelper.fulfilled, (state, action) => {
//         state.helpers = state.helpers.filter(t => t._id !== action.payload);
//         state.pagination.total -= 1;
//         if (state.currentHelper?._id === action.payload) {
//           state.currentHelper = null;
//           state.works = [];
//           state.workStats = {};
//         }
//       })

//       // ===== FETCH HELPER STATS =====
//       .addCase(fetchHelperStats.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchHelperStats.fulfilled, (state, action) => {
//         state.loading = false;
//         state.helperStats = action.payload.helperStats;
//         state.workDistribution = action.payload.workDistribution;
//       })
//       .addCase(fetchHelperStats.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       });
//   },
// });

// export const { 
//   clearCurrentHelper, 
//   clearError,
//   setPage,
//   setLimit,
//   setSorting,
//   setSearchTerm,
//   setSearchFilter,
//   resetSearch,
//   clearTopHelpers // ✅ NEW
// } = helperSlice.actions;

// // ============================================
// // SELECTORS
// // ============================================

// export const selectAllHelpers = (state) => state.helper.helpers;
// export const selectCurrentHelper = (state) => state.helper.currentHelper;
// export const selectHelperWorks = (state) => state.helper.works;
// export const selectHelperWorkStats = (state) => state.helper.workStats;
// export const selectHelperStats = (state) => state.helper.helperStats;
// export const selectWorkDistribution = (state) => state.helper.workDistribution;
// export const selectHelperLoading = (state) => state.helper.loading;
// export const selectHelperError = (state) => state.helper.error;

// // ✅ NEW: Top helpers selectors
// export const selectTopHelpers = (state) => state.helper.topHelpers;
// export const selectTopHelpersSummary = (state) => state.helper.topHelpersSummary;
// export const selectTopHelpersLoading = (state) => state.helper.topHelpersLoading;

// // Pagination selectors
// export const selectHelperPagination = (state) => state.helper.pagination;
// export const selectHelperSorting = (state) => state.helper.sorting;
// export const selectHelperSearch = (state) => state.helper.search;

// export default helperSlice.reducer;






// // frontend/src/features/helper/helperSlice.js - COMPLETE FIXED VERSION WITH DASHBOARD
// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import * as helperApi from "./helperApi";

// // ===== ASYNC THUNKS =====

// // ✅ FETCH ALL HELPERS (with pagination & sorting)
// export const fetchAllHelpers = createAsyncThunk(
//   "helper/fetchAll",
//   async (params = {}, { rejectWithValue }) => {
//     try {
//       const response = await helperApi.getAllHelpersApi(params);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch helpers");
//     }
//   }
// );

// export const fetchHelperById = createAsyncThunk(
//   "helper/fetchById",
//   async (id, { rejectWithValue }) => {
//     try {
//       const response = await helperApi.getHelperByIdApi(id);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch helper");
//     }
//   }
// );

// // ✅ FETCH TOP HELPERS for dashboard
// export const fetchTopHelpers = createAsyncThunk(
//   "helper/fetchTop",
//   async ({ limit = 5, period = 'month' } = {}, { rejectWithValue }) => {
//     try {
//       console.log(`🏆 Fetching top ${limit} helpers for period: ${period}`);
//       const response = await helperApi.getTopHelpersApi(limit, period);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch top helpers");
//     }
//   }
// );

// // ✅ FETCH HELPER PERFORMANCE for dashboard
// export const fetchHelperPerformance = createAsyncThunk(
//   "helper/fetchPerformance",
//   async ({ period = 'month', helperId } = {}, { rejectWithValue }) => {
//     try {
//       console.log(`📈 Fetching helper performance for period: ${period}`);
//       const response = await helperApi.getHelperPerformanceApi(period, helperId);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch helper performance");
//     }
//   }
// );

// // ✅ FETCH HELPER STATS
// export const fetchHelperStats = createAsyncThunk(
//   "helper/fetchStats",
//   async (_, { rejectWithValue }) => {
//     try {
//       console.log('📊 Fetching helper stats');
//       const response = await helperApi.getHelperStatsApi();
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch stats");
//     }
//   }
// );

// // ===== CREATE HELPER - UPDATED WITH DEBUG LOGS =====
// export const createHelper = createAsyncThunk(
//   "helper/create",
//   async (helperData, { rejectWithValue }) => {
//     try {
//       // DEBUG: Log the data received in thunk
//       console.log("🔵 [Redux Thunk] createHelper received:", {
//         ...helperData,
//         password: helperData.password ? `✅ PRESENT (${helperData.password.length} chars)` : "❌ MISSING",
//         passwordFirstChars: helperData.password ? helperData.password.substring(0, 3) + '...' : null
//       });

//       // CRITICAL CHECK: Verify password exists
//       if (!helperData.password) {
//         console.error("🔴 [Redux Thunk] CRITICAL: Password is missing in thunk!");
        
//         // Check if password might be in a different property
//         const possiblePasswordProps = ['password', 'pass', 'pwd', 'Password'];
//         const foundProps = possiblePasswordProps.filter(prop => helperData[prop]);
        
//         if (foundProps.length > 0) {
//           console.log("🔵 [Redux Thunk] Found password in alternative property:", foundProps[0]);
//           // Use the found password property
//           helperData.password = helperData[foundProps[0]];
//         } else {
//           return rejectWithValue({ 
//             message: "Password is required but was not provided in the request data" 
//           });
//         }
//       }

//       // Ensure all required fields are present
//       const apiData = {
//         name: helperData.name,
//         phone: helperData.phone,
//         email: helperData.email || undefined,
//         password: helperData.password, // Explicitly include password
//         experience: helperData.experience || 0,
//         specialization: Array.isArray(helperData.specialization) ? helperData.specialization : [],
//         address: helperData.address || {}
//       };

//       // DEBUG: Log the data being sent to API
//       console.log("🔵 [Redux Thunk] Sending to API:", {
//         ...apiData,
//         password: apiData.password ? `✅ PRESENT (${apiData.password.length} chars)` : "❌ MISSING",
//         passwordPreview: apiData.password ? apiData.password.substring(0, 3) + '...' : null
//       });

//       // Make the API call
//       const response = await helperApi.createHelperApi(apiData);
      
//       // DEBUG: Log the API response
//       console.log("🔵 [Redux Thunk] API Response:", response);
      
//       return response;
//     } catch (error) {
//       console.error("🔴 [Redux Thunk] Error:", {
//         message: error.message,
//         response: error.response?.data,
//         status: error.response?.status
//       });
      
//       return rejectWithValue(
//         error.response?.data?.message || 
//         error.message || 
//         "Failed to create helper"
//       );
//     }
//   }
// );

// export const updateHelper = createAsyncThunk(
//   "helper/update",
//   async ({ id, helperData }, { rejectWithValue }) => {
//     try {
//       const response = await helperApi.updateHelperApi(id, helperData);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to update helper");
//     }
//   }
// );

// export const updateLeaveStatus = createAsyncThunk(
//   "helper/updateLeave",
//   async ({ id, leaveData }, { rejectWithValue }) => {
//     try {
//       const response = await helperApi.updateLeaveStatusApi(id, leaveData);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to update leave status");
//     }
//   }
// );

// // ✅ TOGGLE HELPER STATUS (Activate/Deactivate)
// export const toggleHelperStatus = createAsyncThunk(
//   "helper/toggleStatus",
//   async (id, { rejectWithValue }) => {
//     try {
//       const response = await helperApi.toggleHelperStatusApi(id);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to toggle status");
//     }
//   }
// );

// export const deleteHelper = createAsyncThunk(
//   "helper/delete",
//   async (id, { rejectWithValue }) => {
//     try {
//       await helperApi.deleteHelperApi(id);
//       return id;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to delete helper");
//     }
//   }
// );

// const helperSlice = createSlice({
//   name: "helper",
//   initialState: {
//     helpers: [],
//     currentHelper: null,
//     works: [],
//     workStats: {},
//     helperStats: {},
//     workDistribution: {},
    
//     // ✅ Top helpers for dashboard
//     topHelpers: [],
//     topHelpersSummary: {},
//     topHelpersLoading: false,
    
//     // ✅ Helper performance for dashboard
//     helperPerformance: {
//       data: [],
//       summary: {
//         totalCompleted: 0,
//         activeHelpers: 0,
//         avgPerHelper: 0
//       },
//       loading: false
//     },
    
//     loading: false,
//     error: null,
    
//     // Pagination state
//     pagination: {
//       page: 1,
//       limit: 10,
//       total: 0,
//       pages: 1
//     },
    
//     // Sorting state
//     sorting: {
//       field: "createdAt",
//       order: "desc" // 'asc' or 'desc'
//     },
    
//     // Search state
//     search: {
//       term: "",
//       filters: {
//         status: "all",
//         availability: "all"
//       }
//     }
//   },
//   reducers: {
//     clearCurrentHelper: (state) => {
//       state.currentHelper = null;
//       state.works = [];
//       state.workStats = {};
//     },
//     clearError: (state) => {
//       state.error = null;
//     },
    
//     // Pagination actions
//     setPage: (state, action) => {
//       state.pagination.page = action.payload;
//     },
//     setLimit: (state, action) => {
//       state.pagination.limit = action.payload;
//       state.pagination.page = 1; // Reset to first page
//     },
    
//     // Sorting actions
//     setSorting: (state, action) => {
//       state.sorting = { ...state.sorting, ...action.payload };
//     },
    
//     // Search actions
//     setSearchTerm: (state, action) => {
//       state.search.term = action.payload;
//       state.pagination.page = 1; // Reset to first page
//     },
//     setSearchFilter: (state, action) => {
//       state.search.filters = { ...state.search.filters, ...action.payload };
//       state.pagination.page = 1; // Reset to first page
//     },
//     resetSearch: (state) => {
//       state.search = {
//         term: "",
//         filters: {
//           status: "all",
//           availability: "all"
//         }
//       };
//       state.pagination.page = 1;
//     },
    
//     // ✅ Clear top helpers
//     clearTopHelpers: (state) => {
//       state.topHelpers = [];
//       state.topHelpersSummary = {};
//     },
    
//     // ✅ Clear helper performance
//     clearHelperPerformance: (state) => {
//       state.helperPerformance = {
//         data: [],
//         summary: {
//           totalCompleted: 0,
//           activeHelpers: 0,
//           avgPerHelper: 0
//         },
//         loading: false
//       };
//     }
//   },
//   extraReducers: (builder) => {
//     builder
//       // ===== FETCH ALL HELPERS =====
//       .addCase(fetchAllHelpers.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchAllHelpers.fulfilled, (state, action) => {
//         state.loading = false;
        
//         // Handle both array and paginated responses
//         if (Array.isArray(action.payload)) {
//           state.helpers = action.payload;
//           state.pagination.total = action.payload.length;
//           state.pagination.pages = 1;
//         } else {
//           state.helpers = action.payload.helpers || action.payload;
//           state.pagination = {
//             ...state.pagination,
//             ...(action.payload.pagination || {})
//           };
//         }
//       })
//       .addCase(fetchAllHelpers.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== FETCH HELPER BY ID =====
//       .addCase(fetchHelperById.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchHelperById.fulfilled, (state, action) => {
//         state.loading = false;
//         state.currentHelper = action.payload.helper;
//         state.works = action.payload.works;
//         state.workStats = action.payload.workStats;
//       })
//       .addCase(fetchHelperById.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== FETCH TOP HELPERS =====
//       .addCase(fetchTopHelpers.pending, (state) => {
//         state.topHelpersLoading = true;
//         state.error = null;
//       })
//       .addCase(fetchTopHelpers.fulfilled, (state, action) => {
//         state.topHelpersLoading = false;
//         state.topHelpers = action.payload.topHelpers || [];
//         state.topHelpersSummary = action.payload.summary || {};
//         console.log('✅ Top helpers loaded:', state.topHelpers.length);
//       })
//       .addCase(fetchTopHelpers.rejected, (state, action) => {
//         state.topHelpersLoading = false;
//         state.error = action.payload;
//       })

//       // ===== FETCH HELPER PERFORMANCE =====
//       .addCase(fetchHelperPerformance.pending, (state) => {
//         state.helperPerformance.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchHelperPerformance.fulfilled, (state, action) => {
//         state.helperPerformance.loading = false;
//         state.helperPerformance.data = action.payload.performance || [];
//         state.helperPerformance.summary = action.payload.summary || {
//           totalCompleted: 0,
//           activeHelpers: 0,
//           avgPerHelper: 0
//         };
//         console.log('✅ Helper performance loaded:', state.helperPerformance.data.length);
//       })
//       .addCase(fetchHelperPerformance.rejected, (state, action) => {
//         state.helperPerformance.loading = false;
//         state.error = action.payload;
//       })

//       // ===== CREATE HELPER =====
//       .addCase(createHelper.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//         console.log("🟡 [Redux] createHelper pending");
//       })
//       .addCase(createHelper.fulfilled, (state, action) => {
//         state.loading = false;
//         console.log("🟢 [Redux] createHelper fulfilled:", action.payload);
//         state.helpers = [action.payload.helper, ...state.helpers];
//         state.pagination.total += 1;
//       })
//       .addCase(createHelper.rejected, (state, action) => {
//         state.loading = false;
//         console.error("🔴 [Redux] createHelper rejected:", action.payload);
//         state.error = action.payload;
//       })

//       // ===== UPDATE HELPER =====
//       .addCase(updateHelper.fulfilled, (state, action) => {
//         const updatedHelper = action.payload.helper;
//         const index = state.helpers.findIndex(t => t._id === updatedHelper._id);
//         if (index !== -1) {
//           state.helpers[index] = updatedHelper;
//         }
//         if (state.currentHelper?._id === updatedHelper._id) {
//           state.currentHelper = updatedHelper;
//         }
//       })

//       // ===== UPDATE LEAVE STATUS =====
//       .addCase(updateLeaveStatus.fulfilled, (state, action) => {
//         const updatedHelper = action.payload.helper;
//         const index = state.helpers.findIndex(t => t._id === updatedHelper._id);
//         if (index !== -1) {
//           state.helpers[index] = updatedHelper;
//         }
//         if (state.currentHelper?._id === updatedHelper._id) {
//           state.currentHelper = updatedHelper;
//         }
//       })

//       // ===== TOGGLE HELPER STATUS =====
//       .addCase(toggleHelperStatus.fulfilled, (state, action) => {
//         const updatedHelper = action.payload.helper;
//         const index = state.helpers.findIndex(t => t._id === updatedHelper._id);
//         if (index !== -1) {
//           state.helpers[index] = updatedHelper;
//         }
//         if (state.currentHelper?._id === updatedHelper._id) {
//           state.currentHelper = updatedHelper;
//         }
//       })

//       // ===== DELETE HELPER =====
//       .addCase(deleteHelper.fulfilled, (state, action) => {
//         state.helpers = state.helpers.filter(t => t._id !== action.payload);
//         state.pagination.total -= 1;
//         if (state.currentHelper?._id === action.payload) {
//           state.currentHelper = null;
//           state.works = [];
//           state.workStats = {};
//         }
//       })

//       // ===== FETCH HELPER STATS =====
//       .addCase(fetchHelperStats.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchHelperStats.fulfilled, (state, action) => {
//         state.loading = false;
//         state.helperStats = action.payload.helperStats;
//         state.workDistribution = action.payload.workDistribution;
//         console.log('✅ Helper stats loaded:', state.helperStats);
//       })
//       .addCase(fetchHelperStats.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       });
//   },
// });

// export const { 
//   clearCurrentHelper, 
//   clearError,
//   setPage,
//   setLimit,
//   setSorting,
//   setSearchTerm,
//   setSearchFilter,
//   resetSearch,
//   clearTopHelpers,
//   clearHelperPerformance // ✅ NEW
// } = helperSlice.actions;

// // ============================================
// // SELECTORS
// // ============================================

// export const selectAllHelpers = (state) => state.helper.helpers;
// export const selectCurrentHelper = (state) => state.helper.currentHelper;
// export const selectHelperWorks = (state) => state.helper.works;
// export const selectHelperWorkStats = (state) => state.helper.workStats;
// export const selectHelperStats = (state) => state.helper.helperStats;
// export const selectWorkDistribution = (state) => state.helper.workDistribution;
// export const selectHelperLoading = (state) => state.helper.loading;
// export const selectHelperError = (state) => state.helper.error;

// // ✅ Top helpers selectors
// export const selectTopHelpers = (state) => state.helper.topHelpers;
// export const selectTopHelpersSummary = (state) => state.helper.topHelpersSummary;
// export const selectTopHelpersLoading = (state) => state.helper.topHelpersLoading;

// // ✅ Helper performance selectors
// export const selectHelperPerformance = (state) => state.helper.helperPerformance.data;
// export const selectHelperPerformanceSummary = (state) => state.helper.helperPerformance.summary;
// export const selectHelperPerformanceLoading = (state) => state.helper.helperPerformance.loading;

// // Pagination selectors
// export const selectHelperPagination = (state) => state.helper.pagination;
// export const selectHelperSorting = (state) => state.helper.sorting;
// export const selectHelperSearch = (state) => state.helper.search;

// export default helperSlice.reducer;










// frontend/src/features/helper/helperSlice.js - WITH COMPREHENSIVE DEBUGGING
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as helperApi from "./helperApi";

// ===== ASYNC THUNKS =====

// ✅ FETCH ALL HELPERS (with pagination & sorting)
export const fetchAllHelpers = createAsyncThunk(
  "helper/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      console.log('🔵 [fetchAllHelpers] Request with params:', params);
      const response = await helperApi.getAllHelpersApi(params);
      console.log('🔵 [fetchAllHelpers] Response:', response);
      return response;
    } catch (error) {
      console.error('🔴 [fetchAllHelpers] Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      return rejectWithValue(error.response?.data?.message || "Failed to fetch helpers");
    }
  }
);

export const fetchHelperById = createAsyncThunk(
  "helper/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      console.log('🔵 [fetchHelperById] Request for ID:', id);
      const response = await helperApi.getHelperByIdApi(id);
      console.log('🔵 [fetchHelperById] Response:', response);
      return response;
    } catch (error) {
      console.error('🔴 [fetchHelperById] Error:', error);
      return rejectWithValue(error.response?.data?.message || "Failed to fetch helper");
    }
  }
);

// ✅ FETCH TOP HELPERS for dashboard
export const fetchTopHelpers = createAsyncThunk(
  "helper/fetchTop",
  async ({ limit = 5, period = 'month' } = {}, { rejectWithValue }) => {
    try {
      console.log(`🏆 [fetchTopHelpers] Fetching top ${limit} helpers for period: ${period}`);
      const response = await helperApi.getTopHelpersApi(limit, period);
      console.log('🏆 [fetchTopHelpers] Full Response:', response);
      console.log('🏆 [fetchTopHelpers] Top helpers data:', response.topHelpers);
      console.log('🏆 [fetchTopHelpers] Summary:', response.summary);
      return response;
    } catch (error) {
      console.error('🔴 [fetchTopHelpers] Error:', error);
      return rejectWithValue(error.response?.data?.message || "Failed to fetch top helpers");
    }
  }
);

// ✅ FETCH HELPER PERFORMANCE for dashboard
export const fetchHelperPerformance = createAsyncThunk(
  "helper/fetchPerformance",
  async ({ period = 'month', helperId } = {}, { rejectWithValue }) => {
    try {
      console.log(`📈 [fetchHelperPerformance] Fetching helper performance for period: ${period}`, helperId ? `helperId: ${helperId}` : 'all helpers');
      const response = await helperApi.getHelperPerformanceApi(period, helperId);
      console.log('📈 [fetchHelperPerformance] Full Response:', response);
      console.log('📈 [fetchHelperPerformance] Performance data:', response.performance);
      console.log('📈 [fetchHelperPerformance] Summary:', response.summary);
      return response;
    } catch (error) {
      console.error('🔴 [fetchHelperPerformance] Error:', error);
      return rejectWithValue(error.response?.data?.message || "Failed to fetch helper performance");
    }
  }
);

// ✅ FETCH HELPER STATS
export const fetchHelperStats = createAsyncThunk(
  "helper/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      console.log('📊 [fetchHelperStats] Fetching helper stats');
      const response = await helperApi.getHelperStatsApi();
      console.log('📊 [fetchHelperStats] Full Response:', response);
      console.log('📊 [fetchHelperStats] Helper Stats:', response.helperStats);
      console.log('📊 [fetchHelperStats] Work Distribution:', response.workDistribution);
      return response;
    } catch (error) {
      console.error('🔴 [fetchHelperStats] Error:', error);
      return rejectWithValue(error.response?.data?.message || "Failed to fetch stats");
    }
  }
);

// ===== CREATE HELPER - UPDATED WITH DEBUG LOGS =====
export const createHelper = createAsyncThunk(
  "helper/create",
  async (helperData, { rejectWithValue }) => {
    try {
      // DEBUG: Log the data received in thunk
      console.log("🔵 [createHelper] Received:", {
        ...helperData,
        password: helperData.password ? `✅ PRESENT (${helperData.password.length} chars)` : "❌ MISSING",
        passwordFirstChars: helperData.password ? helperData.password.substring(0, 3) + '...' : null
      });

      // CRITICAL CHECK: Verify password exists
      if (!helperData.password) {
        console.error("🔴 [createHelper] CRITICAL: Password is missing!");
        
        // Check if password might be in a different property
        const possiblePasswordProps = ['password', 'pass', 'pwd', 'Password'];
        const foundProps = possiblePasswordProps.filter(prop => helperData[prop]);
        
        if (foundProps.length > 0) {
          console.log("🔵 [createHelper] Found password in alternative property:", foundProps[0]);
          helperData.password = helperData[foundProps[0]];
        } else {
          return rejectWithValue({ 
            message: "Password is required but was not provided in the request data" 
          });
        }
      }

      // Ensure all required fields are present
      const apiData = {
        name: helperData.name,
        phone: helperData.phone,
        email: helperData.email || undefined,
        password: helperData.password,
        experience: helperData.experience || 0,
        specialization: Array.isArray(helperData.specialization) ? helperData.specialization : [],
        address: helperData.address || {}
      };

      console.log("🔵 [createHelper] Sending to API:", {
        ...apiData,
        password: apiData.password ? `✅ PRESENT (${apiData.password.length} chars)` : "❌ MISSING"
      });

      const response = await helperApi.createHelperApi(apiData);
      console.log("🔵 [createHelper] API Response:", response);
      return response;
    } catch (error) {
      console.error("🔴 [createHelper] Error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        "Failed to create helper"
      );
    }
  }
);

export const updateHelper = createAsyncThunk(
  "helper/update",
  async ({ id, helperData }, { rejectWithValue }) => {
    try {
      console.log('🔵 [updateHelper] Updating helper:', id, helperData);
      const response = await helperApi.updateHelperApi(id, helperData);
      console.log('🔵 [updateHelper] Response:', response);
      return response;
    } catch (error) {
      console.error('🔴 [updateHelper] Error:', error);
      return rejectWithValue(error.response?.data?.message || "Failed to update helper");
    }
  }
);

export const updateLeaveStatus = createAsyncThunk(
  "helper/updateLeave",
  async ({ id, leaveData }, { rejectWithValue }) => {
    try {
      console.log('🔵 [updateLeaveStatus] Updating leave for helper:', id, leaveData);
      const response = await helperApi.updateLeaveStatusApi(id, leaveData);
      console.log('🔵 [updateLeaveStatus] Response:', response);
      return response;
    } catch (error) {
      console.error('🔴 [updateLeaveStatus] Error:', error);
      return rejectWithValue(error.response?.data?.message || "Failed to update leave status");
    }
  }
);

// ✅ TOGGLE HELPER STATUS (Activate/Deactivate)
export const toggleHelperStatus = createAsyncThunk(
  "helper/toggleStatus",
  async (id, { rejectWithValue }) => {
    try {
      console.log('🔵 [toggleHelperStatus] Toggling status for helper:', id);
      const response = await helperApi.toggleHelperStatusApi(id);
      console.log('🔵 [toggleHelperStatus] Response:', response);
      return response;
    } catch (error) {
      console.error('🔴 [toggleHelperStatus] Error:', error);
      return rejectWithValue(error.response?.data?.message || "Failed to toggle status");
    }
  }
);

export const deleteHelper = createAsyncThunk(
  "helper/delete",
  async (id, { rejectWithValue }) => {
    try {
      console.log('🔵 [deleteHelper] Deleting helper:', id);
      await helperApi.deleteHelperApi(id);
      console.log('🔵 [deleteHelper] Deleted successfully:', id);
      return id;
    } catch (error) {
      console.error('🔴 [deleteHelper] Error:', error);
      return rejectWithValue(error.response?.data?.message || "Failed to delete helper");
    }
  }
);

const helperSlice = createSlice({
  name: "helper",
  initialState: {
    helpers: [],
    currentHelper: null,
    works: [],
    workStats: {},
    helperStats: {},
    workDistribution: {},
    
    // ✅ Top helpers for dashboard
    topHelpers: [],
    topHelpersSummary: {},
    topHelpersLoading: false,
    
    // ✅ Helper performance for dashboard
    helperPerformance: {
      data: [],
      summary: {
        totalCompleted: 0,
        activeHelpers: 0,
        avgPerHelper: 0
      },
      loading: false
    },
    
    loading: false,
    error: null,
    
    // Pagination state
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      pages: 1
    },
    
    // Sorting state
    sorting: {
      field: "createdAt",
      order: "desc" // 'asc' or 'desc'
    },
    
    // Search state
    search: {
      term: "",
      filters: {
        status: "all",
        availability: "all"
      }
    }
  },
  reducers: {
    clearCurrentHelper: (state) => {
      state.currentHelper = null;
      state.works = [];
      state.workStats = {};
    },
    clearError: (state) => {
      state.error = null;
    },
    
    // Pagination actions
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    setLimit: (state, action) => {
      state.pagination.limit = action.payload;
      state.pagination.page = 1;
    },
    
    // Sorting actions
    setSorting: (state, action) => {
      state.sorting = { ...state.sorting, ...action.payload };
    },
    
    // Search actions
    setSearchTerm: (state, action) => {
      state.search.term = action.payload;
      state.pagination.page = 1;
    },
    setSearchFilter: (state, action) => {
      state.search.filters = { ...state.search.filters, ...action.payload };
      state.pagination.page = 1;
    },
    resetSearch: (state) => {
      state.search = {
        term: "",
        filters: {
          status: "all",
          availability: "all"
        }
      };
      state.pagination.page = 1;
    },
    
    clearTopHelpers: (state) => {
      state.topHelpers = [];
      state.topHelpersSummary = {};
    },
    
    clearHelperPerformance: (state) => {
      state.helperPerformance = {
        data: [],
        summary: {
          totalCompleted: 0,
          activeHelpers: 0,
          avgPerHelper: 0
        },
        loading: false
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // ===== FETCH ALL HELPERS =====
      .addCase(fetchAllHelpers.pending, (state) => {
        console.log('🟡 [Reducer] fetchAllHelpers pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllHelpers.fulfilled, (state, action) => {
        console.log('🟢 [Reducer] fetchAllHelpers fulfilled:', action.payload);
        state.loading = false;
        
        if (Array.isArray(action.payload)) {
          state.helpers = action.payload;
          state.pagination.total = action.payload.length;
          state.pagination.pages = 1;
        } else {
          state.helpers = action.payload.helpers || action.payload;
          state.pagination = {
            ...state.pagination,
            ...(action.payload.pagination || {})
          };
        }
        console.log('🟢 [Reducer] Helpers loaded:', state.helpers.length);
      })
      .addCase(fetchAllHelpers.rejected, (state, action) => {
        console.error('🔴 [Reducer] fetchAllHelpers rejected:', action.payload);
        state.loading = false;
        state.error = action.payload;
      })

      // ===== FETCH HELPER BY ID =====
      .addCase(fetchHelperById.pending, (state) => {
        console.log('🟡 [Reducer] fetchHelperById pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHelperById.fulfilled, (state, action) => {
        console.log('🟢 [Reducer] fetchHelperById fulfilled:', action.payload);
        state.loading = false;
        state.currentHelper = action.payload.helper;
        state.works = action.payload.works;
        state.workStats = action.payload.workStats;
      })
      .addCase(fetchHelperById.rejected, (state, action) => {
        console.error('🔴 [Reducer] fetchHelperById rejected:', action.payload);
        state.loading = false;
        state.error = action.payload;
      })

      // ===== FETCH TOP HELPERS =====
      .addCase(fetchTopHelpers.pending, (state) => {
        console.log('🟡 [Reducer] fetchTopHelpers pending');
        state.topHelpersLoading = true;
        state.error = null;
      })
      .addCase(fetchTopHelpers.fulfilled, (state, action) => {
        console.log('🟢 [Reducer] fetchTopHelpers fulfilled:', action.payload);
        state.topHelpersLoading = false;
        state.topHelpers = action.payload.topHelpers || [];
        state.topHelpersSummary = action.payload.summary || {};
        console.log('🟢 [Reducer] Top helpers loaded:', state.topHelpers.length);
        console.log('🟢 [Reducer] Top helpers data:', state.topHelpers);
      })
      .addCase(fetchTopHelpers.rejected, (state, action) => {
        console.error('🔴 [Reducer] fetchTopHelpers rejected:', action.payload);
        state.topHelpersLoading = false;
        state.error = action.payload;
      })

      // ===== FETCH HELPER PERFORMANCE =====
      .addCase(fetchHelperPerformance.pending, (state) => {
        console.log('🟡 [Reducer] fetchHelperPerformance pending');
        state.helperPerformance.loading = true;
        state.error = null;
      })
      .addCase(fetchHelperPerformance.fulfilled, (state, action) => {
        console.log('🟢 [Reducer] fetchHelperPerformance fulfilled:', action.payload);
        state.helperPerformance.loading = false;
        state.helperPerformance.data = action.payload.performance || [];
        state.helperPerformance.summary = action.payload.summary || {
          totalCompleted: 0,
          activeHelpers: 0,
          avgPerHelper: 0
        };
        console.log('🟢 [Reducer] Performance data loaded:', state.helperPerformance.data.length);
        console.log('🟢 [Reducer] Performance data:', state.helperPerformance.data);
        console.log('🟢 [Reducer] Performance summary:', state.helperPerformance.summary);
      })
      .addCase(fetchHelperPerformance.rejected, (state, action) => {
        console.error('🔴 [Reducer] fetchHelperPerformance rejected:', action.payload);
        state.helperPerformance.loading = false;
        state.error = action.payload;
      })

      // ===== CREATE HELPER =====
      .addCase(createHelper.pending, (state) => {
        console.log("🟡 [Reducer] createHelper pending");
        state.loading = true;
        state.error = null;
      })
      .addCase(createHelper.fulfilled, (state, action) => {
        console.log("🟢 [Reducer] createHelper fulfilled:", action.payload);
        state.loading = false;
        state.helpers = [action.payload.helper, ...state.helpers];
        state.pagination.total += 1;
      })
      .addCase(createHelper.rejected, (state, action) => {
        console.error("🔴 [Reducer] createHelper rejected:", action.payload);
        state.loading = false;
        state.error = action.payload;
      })

      // ===== UPDATE HELPER =====
      .addCase(updateHelper.fulfilled, (state, action) => {
        console.log('🟢 [Reducer] updateHelper fulfilled:', action.payload);
        const updatedHelper = action.payload.helper;
        const index = state.helpers.findIndex(t => t._id === updatedHelper._id);
        if (index !== -1) {
          state.helpers[index] = updatedHelper;
        }
        if (state.currentHelper?._id === updatedHelper._id) {
          state.currentHelper = updatedHelper;
        }
      })

      // ===== UPDATE LEAVE STATUS =====
      .addCase(updateLeaveStatus.fulfilled, (state, action) => {
        console.log('🟢 [Reducer] updateLeaveStatus fulfilled:', action.payload);
        const updatedHelper = action.payload.helper;
        const index = state.helpers.findIndex(t => t._id === updatedHelper._id);
        if (index !== -1) {
          state.helpers[index] = updatedHelper;
        }
        if (state.currentHelper?._id === updatedHelper._id) {
          state.currentHelper = updatedHelper;
        }
      })

      // ===== TOGGLE HELPER STATUS =====
      .addCase(toggleHelperStatus.fulfilled, (state, action) => {
        console.log('🟢 [Reducer] toggleHelperStatus fulfilled:', action.payload);
        const updatedHelper = action.payload.helper;
        const index = state.helpers.findIndex(t => t._id === updatedHelper._id);
        if (index !== -1) {
          state.helpers[index] = updatedHelper;
        }
        if (state.currentHelper?._id === updatedHelper._id) {
          state.currentHelper = updatedHelper;
        }
      })

      // ===== DELETE HELPER =====
      .addCase(deleteHelper.fulfilled, (state, action) => {
        console.log('🟢 [Reducer] deleteHelper fulfilled:', action.payload);
        state.helpers = state.helpers.filter(t => t._id !== action.payload);
        state.pagination.total -= 1;
        if (state.currentHelper?._id === action.payload) {
          state.currentHelper = null;
          state.works = [];
          state.workStats = {};
        }
      })

      // ===== FETCH HELPER STATS =====
      .addCase(fetchHelperStats.pending, (state) => {
        console.log('🟡 [Reducer] fetchHelperStats pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHelperStats.fulfilled, (state, action) => {
        console.log('🟢 [Reducer] fetchHelperStats fulfilled:', action.payload);
        state.loading = false;
        state.helperStats = action.payload.helperStats;
        state.workDistribution = action.payload.workDistribution;
        console.log('🟢 [Reducer] Helper stats loaded:', state.helperStats);
      })
      .addCase(fetchHelperStats.rejected, (state, action) => {
        console.error('🔴 [Reducer] fetchHelperStats rejected:', action.payload);
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  clearCurrentHelper, 
  clearError,
  setPage,
  setLimit,
  setSorting,
  setSearchTerm,
  setSearchFilter,
  resetSearch,
  clearTopHelpers,
  clearHelperPerformance
} = helperSlice.actions;

// ============================================
// SELECTORS
// ============================================

export const selectAllHelpers = (state) => {
  console.log('🔍 [Selector] selectAllHelpers:', state.helper?.helpers?.length);
  return state.helper.helpers;
};

export const selectCurrentHelper = (state) => {
  console.log('🔍 [Selector] selectCurrentHelper:', state.helper.currentHelper?._id);
  return state.helper.currentHelper;
};

export const selectHelperWorks = (state) => {
  console.log('🔍 [Selector] selectHelperWorks:', state.helper.works?.length);
  return state.helper.works;
};

export const selectHelperWorkStats = (state) => {
  console.log('🔍 [Selector] selectHelperWorkStats:', state.helper.workStats);
  return state.helper.workStats;
};

export const selectHelperStats = (state) => {
  console.log('🔍 [Selector] selectHelperStats:', state.helper.helperStats);
  return state.helper.helperStats;
};

export const selectWorkDistribution = (state) => {
  console.log('🔍 [Selector] selectWorkDistribution:', state.helper.workDistribution);
  return state.helper.workDistribution;
};

export const selectHelperLoading = (state) => {
  console.log('🔍 [Selector] selectHelperLoading:', state.helper.loading);
  return state.helper.loading;
};

export const selectHelperError = (state) => {
  console.log('🔍 [Selector] selectHelperError:', state.helper.error);
  return state.helper.error;
};

// ✅ Top helpers selectors
export const selectTopHelpers = (state) => {
  console.log('🔍 [Selector] selectTopHelpers:', state.helper.topHelpers?.length);
  return state.helper.topHelpers;
};

export const selectTopHelpersSummary = (state) => {
  console.log('🔍 [Selector] selectTopHelpersSummary:', state.helper.topHelpersSummary);
  return state.helper.topHelpersSummary;
};

export const selectTopHelpersLoading = (state) => {
  console.log('🔍 [Selector] selectTopHelpersLoading:', state.helper.topHelpersLoading);
  return state.helper.topHelpersLoading;
};

// ✅ Helper performance selectors
export const selectHelperPerformance = (state) => {
  console.log('🔍 [Selector] selectHelperPerformance:', state.helper.helperPerformance?.data?.length);
  return state.helper.helperPerformance?.data || [];
};

export const selectHelperPerformanceSummary = (state) => {
  console.log('🔍 [Selector] selectHelperPerformanceSummary:', state.helper.helperPerformance?.summary);
  return state.helper.helperPerformance?.summary || {
    totalCompleted: 0,
    activeHelpers: 0,
    avgPerHelper: 0
  };
};

export const selectHelperPerformanceLoading = (state) => {
  console.log('🔍 [Selector] selectHelperPerformanceLoading:', state.helper.helperPerformance?.loading);
  return state.helper.helperPerformance?.loading || false;
};

// Pagination selectors
export const selectHelperPagination = (state) => {
  return state.helper.pagination;
};

export const selectHelperSorting = (state) => {
  return state.helper.sorting;
};

export const selectHelperSearch = (state) => {
  return state.helper.search;
};

export default helperSlice.reducer;