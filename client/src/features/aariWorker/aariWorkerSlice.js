// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import * as aariWorkerApi from "./aariWorkerApi";

// // ===== ASYNC THUNKS =====

// // ✅ FETCH ALL AARI_WORKERS (with pagination & sorting)
// export const fetchAllAariWorkers = createAsyncThunk(
//   "aariWorker/fetchAll",
//   async (params = {}, { rejectWithValue }) => {
//     try {
//       const response = await aariWorkerApi.getAllAariWorkersApi(params);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch aariWorkers");
//     }
//   }
// );

// export const fetchAariWorkerById = createAsyncThunk(
//   "aariWorker/fetchById",
//   async (id, { rejectWithValue }) => {
//     try {
//       const response = await aariWorkerApi.getAariWorkerByIdApi(id);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch aariWorker");
//     }
//   }
// );

// // ===== CREATE AARI_WORKER - UPDATED WITH DEBUG LOGS =====
// export const createAariWorker = createAsyncThunk(
//   "aariWorker/create",
//   async (aariWorkerData, { rejectWithValue }) => {
//     try {
//       // DEBUG: Log the data received in thunk
//       console.log("🔵 [Redux Thunk] createAariWorker received:", {
//         ...aariWorkerData,
//         password: aariWorkerData.password ? `✅ PRESENT (${aariWorkerData.password.length} chars)` : "❌ MISSING",
//         passwordFirstChars: aariWorkerData.password ? aariWorkerData.password.substring(0, 3) + '...' : null
//       });

//       // CRITICAL CHECK: Verify password exists
//       if (!aariWorkerData.password) {
//         console.error("🔴 [Redux Thunk] CRITICAL: Password is missing in thunk!");
        
//         // Check if password might be in a different property
//         const possiblePasswordProps = ['password', 'pass', 'pwd', 'Password'];
//         const foundProps = possiblePasswordProps.filter(prop => aariWorkerData[prop]);
        
//         if (foundProps.length > 0) {
//           console.log("🔵 [Redux Thunk] Found password in alternative property:", foundProps[0]);
//           // Use the found password property
//           aariWorkerData.password = aariWorkerData[foundProps[0]];
//         } else {
//           return rejectWithValue({ 
//             message: "Password is required but was not provided in the request data" 
//           });
//         }
//       }

//       // Ensure all required fields are present
//       const apiData = {
//         name: aariWorkerData.name,
//         phone: aariWorkerData.phone,
//         email: aariWorkerData.email || undefined,
//         password: aariWorkerData.password, // Explicitly include password
//         experience: aariWorkerData.experience || 0,
//         specialization: Array.isArray(aariWorkerData.specialization) ? aariWorkerData.specialization : [],
//         address: aariWorkerData.address || {}
//       };

//       // DEBUG: Log the data being sent to API
//       console.log("🔵 [Redux Thunk] Sending to API:", {
//         ...apiData,
//         password: apiData.password ? `✅ PRESENT (${apiData.password.length} chars)` : "❌ MISSING",
//         passwordPreview: apiData.password ? apiData.password.substring(0, 3) + '...' : null
//       });

//       // Make the API call
//       const response = await aariWorkerApi.createAariWorkerApi(apiData);
      
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
//         "Failed to create aariWorker"
//       );
//     }
//   }
// );

// export const updateAariWorker = createAsyncThunk(
//   "aariWorker/update",
//   async ({ id, aariWorkerData }, { rejectWithValue }) => {
//     try {
//       const response = await aariWorkerApi.updateAariWorkerApi(id, aariWorkerData);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to update aariWorker");
//     }
//   }
// );

// export const updateLeaveStatus = createAsyncThunk(
//   "aariWorker/updateLeave",
//   async ({ id, leaveData }, { rejectWithValue }) => {
//     try {
//       const response = await aariWorkerApi.updateLeaveStatusApi(id, leaveData);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to update leave status");
//     }
//   }
// );

// // ✅ NEW: TOGGLE AARI_WORKER STATUS (Activate/Deactivate)
// export const toggleAariWorkerStatus = createAsyncThunk(
//   "aariWorker/toggleStatus",
//   async (id, { rejectWithValue }) => {
//     try {
//       const response = await aariWorkerApi.toggleAariWorkerStatusApi(id);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to toggle status");
//     }
//   }
// );

// export const deleteAariWorker = createAsyncThunk(
//   "aariWorker/delete",
//   async (id, { rejectWithValue }) => {
//     try {
//       await aariWorkerApi.deleteAariWorkerApi(id);
//       return id;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to delete aariWorker");
//     }
//   }
// );

// export const fetchAariWorkerStats = createAsyncThunk(
//   "aariWorker/fetchStats",
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await aariWorkerApi.getAariWorkerStatsApi();
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch stats");
//     }
//   }
// );

// const aariWorkerSlice = createSlice({
//   name: "aariWorker",
//   initialState: {
//     aariWorkers: [],
//     currentAariWorker: null,
//     works: [],
//     workStats: {},
//     aariWorkerStats: {},
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
//     clearCurrentAariWorker: (state) => {
//       state.currentAariWorker = null;
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
//       // ===== FETCH ALL AARI_WORKERS =====
//       .addCase(fetchAllAariWorkers.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchAllAariWorkers.fulfilled, (state, action) => {
//         state.loading = false;
        
//         // ✅ Handle both array and paginated responses
//         if (Array.isArray(action.payload)) {
//           state.aariWorkers = action.payload;
//           state.pagination.total = action.payload.length;
//           state.pagination.pages = 1;
//         } else {
//           state.aariWorkers = action.payload.aariWorkers || action.payload;
//           state.pagination = {
//             ...state.pagination,
//             ...(action.payload.pagination || {})
//           };
//         }
//       })
//       .addCase(fetchAllAariWorkers.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== FETCH AARI_WORKER BY ID =====
//       .addCase(fetchAariWorkerById.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchAariWorkerById.fulfilled, (state, action) => {
//         state.loading = false;
//         state.currentAariWorker = action.payload.aariWorker;
//         state.works = action.payload.works;
//         state.workStats = action.payload.workStats;
//       })
//       .addCase(fetchAariWorkerById.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== CREATE AARI_WORKER =====
//       .addCase(createAariWorker.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//         console.log("🟡 [Redux] createAariWorker pending");
//       })
//       .addCase(createAariWorker.fulfilled, (state, action) => {
//         state.loading = false;
//         console.log("🟢 [Redux] createAariWorker fulfilled:", action.payload);
//         state.aariWorkers = [action.payload.aariWorker, ...state.aariWorkers];
//         state.pagination.total += 1;
//       })
//       .addCase(createAariWorker.rejected, (state, action) => {
//         state.loading = false;
//         console.error("🔴 [Redux] createAariWorker rejected:", action.payload);
//         state.error = action.payload;
//       })

//       // ===== UPDATE AARI_WORKER =====
//       .addCase(updateAariWorker.fulfilled, (state, action) => {
//         const updatedAariWorker = action.payload.aariWorker;
//         const index = state.aariWorkers.findIndex(t => t._id === updatedAariWorker._id);
//         if (index !== -1) {
//           state.aariWorkers[index] = updatedAariWorker;
//         }
//         if (state.currentAariWorker?._id === updatedAariWorker._id) {
//           state.currentAariWorker = updatedAariWorker;
//         }
//       })

//       // ===== UPDATE LEAVE STATUS =====
//       .addCase(updateLeaveStatus.fulfilled, (state, action) => {
//         const updatedAariWorker = action.payload.aariWorker;
//         const index = state.aariWorkers.findIndex(t => t._id === updatedAariWorker._id);
//         if (index !== -1) {
//           state.aariWorkers[index] = updatedAariWorker;
//         }
//         if (state.currentAariWorker?._id === updatedAariWorker._id) {
//           state.currentAariWorker = updatedAariWorker;
//         }
//       })

//       // ===== TOGGLE AARI_WORKER STATUS =====
//       .addCase(toggleAariWorkerStatus.fulfilled, (state, action) => {
//         const updatedAariWorker = action.payload.aariWorker;
//         const index = state.aariWorkers.findIndex(t => t._id === updatedAariWorker._id);
//         if (index !== -1) {
//           state.aariWorkers[index] = updatedAariWorker;
//         }
//         if (state.currentAariWorker?._id === updatedAariWorker._id) {
//           state.currentAariWorker = updatedAariWorker;
//         }
//       })

//       // ===== DELETE AARI_WORKER =====
//       .addCase(deleteAariWorker.fulfilled, (state, action) => {
//         state.aariWorkers = state.aariWorkers.filter(t => t._id !== action.payload);
//         state.pagination.total -= 1;
//         if (state.currentAariWorker?._id === action.payload) {
//           state.currentAariWorker = null;
//           state.works = [];
//           state.workStats = {};
//         }
//       })

//       // ===== FETCH AARI_WORKER STATS =====
//       .addCase(fetchAariWorkerStats.fulfilled, (state, action) => {
//         state.aariWorkerStats = action.payload.aariWorkerStats;
//         state.workDistribution = action.payload.workDistribution;
//       });
//   },
// });

// export const { 
//   clearCurrentAariWorker, 
//   clearError,
//   setPage,
//   setLimit,
//   setSorting,
//   setSearchTerm,
//   setSearchFilter,
//   resetSearch
// } = aariWorkerSlice.actions;

// export default aariWorkerSlice.reducer;








// // frontend/src/features/aariWorker/aariWorkerSlice.js - COMPLETE FIXED VERSION
// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import * as aariWorkerApi from "./aariWorkerApi";

// // ===== ASYNC THUNKS =====

// // ✅ FETCH ALL AARI_WORKERS (with pagination & sorting)
// export const fetchAllAariWorkers = createAsyncThunk(
//   "aariWorker/fetchAll",
//   async (params = {}, { rejectWithValue }) => {
//     try {
//       const response = await aariWorkerApi.getAllAariWorkersApi(params);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch aariWorkers");
//     }
//   }
// );

// export const fetchAariWorkerById = createAsyncThunk(
//   "aariWorker/fetchById",
//   async (id, { rejectWithValue }) => {
//     try {
//       const response = await aariWorkerApi.getAariWorkerByIdApi(id);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch aariWorker");
//     }
//   }
// );

// // ✅ NEW: FETCH TOP AARI_WORKERS for dashboard
// export const fetchTopAariWorkers = createAsyncThunk(
//   "aariWorker/fetchTop",
//   async ({ limit = 5 } = {}, { rejectWithValue }) => {
//     try {
//       const response = await aariWorkerApi.getTopAariWorkersApi(limit);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch top aariWorkers");
//     }
//   }
// );

// // ✅ FETCH AARI_WORKER STATS
// export const fetchAariWorkerStats = createAsyncThunk(
//   "aariWorker/fetchStats",
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await aariWorkerApi.getAariWorkerStatsApi();
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch stats");
//     }
//   }
// );

// // ===== CREATE AARI_WORKER - UPDATED WITH DEBUG LOGS =====
// export const createAariWorker = createAsyncThunk(
//   "aariWorker/create",
//   async (aariWorkerData, { rejectWithValue }) => {
//     try {
//       // DEBUG: Log the data received in thunk
//       console.log("🔵 [Redux Thunk] createAariWorker received:", {
//         ...aariWorkerData,
//         password: aariWorkerData.password ? `✅ PRESENT (${aariWorkerData.password.length} chars)` : "❌ MISSING",
//         passwordFirstChars: aariWorkerData.password ? aariWorkerData.password.substring(0, 3) + '...' : null
//       });

//       // CRITICAL CHECK: Verify password exists
//       if (!aariWorkerData.password) {
//         console.error("🔴 [Redux Thunk] CRITICAL: Password is missing in thunk!");
        
//         // Check if password might be in a different property
//         const possiblePasswordProps = ['password', 'pass', 'pwd', 'Password'];
//         const foundProps = possiblePasswordProps.filter(prop => aariWorkerData[prop]);
        
//         if (foundProps.length > 0) {
//           console.log("🔵 [Redux Thunk] Found password in alternative property:", foundProps[0]);
//           // Use the found password property
//           aariWorkerData.password = aariWorkerData[foundProps[0]];
//         } else {
//           return rejectWithValue({ 
//             message: "Password is required but was not provided in the request data" 
//           });
//         }
//       }

//       // Ensure all required fields are present
//       const apiData = {
//         name: aariWorkerData.name,
//         phone: aariWorkerData.phone,
//         email: aariWorkerData.email || undefined,
//         password: aariWorkerData.password, // Explicitly include password
//         experience: aariWorkerData.experience || 0,
//         specialization: Array.isArray(aariWorkerData.specialization) ? aariWorkerData.specialization : [],
//         address: aariWorkerData.address || {}
//       };

//       // DEBUG: Log the data being sent to API
//       console.log("🔵 [Redux Thunk] Sending to API:", {
//         ...apiData,
//         password: apiData.password ? `✅ PRESENT (${apiData.password.length} chars)` : "❌ MISSING",
//         passwordPreview: apiData.password ? apiData.password.substring(0, 3) + '...' : null
//       });

//       // Make the API call
//       const response = await aariWorkerApi.createAariWorkerApi(apiData);
      
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
//         "Failed to create aariWorker"
//       );
//     }
//   }
// );

// export const updateAariWorker = createAsyncThunk(
//   "aariWorker/update",
//   async ({ id, aariWorkerData }, { rejectWithValue }) => {
//     try {
//       const response = await aariWorkerApi.updateAariWorkerApi(id, aariWorkerData);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to update aariWorker");
//     }
//   }
// );

// export const updateLeaveStatus = createAsyncThunk(
//   "aariWorker/updateLeave",
//   async ({ id, leaveData }, { rejectWithValue }) => {
//     try {
//       const response = await aariWorkerApi.updateLeaveStatusApi(id, leaveData);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to update leave status");
//     }
//   }
// );

// // ✅ NEW: TOGGLE AARI_WORKER STATUS (Activate/Deactivate)
// export const toggleAariWorkerStatus = createAsyncThunk(
//   "aariWorker/toggleStatus",
//   async (id, { rejectWithValue }) => {
//     try {
//       const response = await aariWorkerApi.toggleAariWorkerStatusApi(id);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to toggle status");
//     }
//   }
// );

// export const deleteAariWorker = createAsyncThunk(
//   "aariWorker/delete",
//   async (id, { rejectWithValue }) => {
//     try {
//       await aariWorkerApi.deleteAariWorkerApi(id);
//       return id;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to delete aariWorker");
//     }
//   }
// );

// const aariWorkerSlice = createSlice({
//   name: "aariWorker",
//   initialState: {
//     aariWorkers: [],
//     currentAariWorker: null,
//     works: [],
//     workStats: {},
//     aariWorkerStats: {},
//     workDistribution: {},
    
//     // ✅ NEW: Top aariWorkers for dashboard
//     topAariWorkers: [],
//     topAariWorkersSummary: {},
//     topAariWorkersLoading: false,
    
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
//     clearCurrentAariWorker: (state) => {
//       state.currentAariWorker = null;
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
    
//     // ✅ NEW: Clear top aariWorkers
//     clearTopAariWorkers: (state) => {
//       state.topAariWorkers = [];
//       state.topAariWorkersSummary = {};
//     }
//   },
//   extraReducers: (builder) => {
//     builder
//       // ===== FETCH ALL AARI_WORKERS =====
//       .addCase(fetchAllAariWorkers.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchAllAariWorkers.fulfilled, (state, action) => {
//         state.loading = false;
        
//         // Handle both array and paginated responses
//         if (Array.isArray(action.payload)) {
//           state.aariWorkers = action.payload;
//           state.pagination.total = action.payload.length;
//           state.pagination.pages = 1;
//         } else {
//           state.aariWorkers = action.payload.aariWorkers || action.payload;
//           state.pagination = {
//             ...state.pagination,
//             ...(action.payload.pagination || {})
//           };
//         }
//       })
//       .addCase(fetchAllAariWorkers.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== FETCH AARI_WORKER BY ID =====
//       .addCase(fetchAariWorkerById.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchAariWorkerById.fulfilled, (state, action) => {
//         state.loading = false;
//         state.currentAariWorker = action.payload.aariWorker;
//         state.works = action.payload.works;
//         state.workStats = action.payload.workStats;
//       })
//       .addCase(fetchAariWorkerById.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== FETCH TOP AARI_WORKERS (NEW) =====
//       .addCase(fetchTopAariWorkers.pending, (state) => {
//         state.topAariWorkersLoading = true;
//         state.error = null;
//       })
//       .addCase(fetchTopAariWorkers.fulfilled, (state, action) => {
//         state.topAariWorkersLoading = false;
//         state.topAariWorkers = action.payload.topAariWorkers || [];
//         state.topAariWorkersSummary = action.payload.summary || {};
//       })
//       .addCase(fetchTopAariWorkers.rejected, (state, action) => {
//         state.topAariWorkersLoading = false;
//         state.error = action.payload;
//       })

//       // ===== CREATE AARI_WORKER =====
//       .addCase(createAariWorker.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//         console.log("🟡 [Redux] createAariWorker pending");
//       })
//       .addCase(createAariWorker.fulfilled, (state, action) => {
//         state.loading = false;
//         console.log("🟢 [Redux] createAariWorker fulfilled:", action.payload);
//         state.aariWorkers = [action.payload.aariWorker, ...state.aariWorkers];
//         state.pagination.total += 1;
//       })
//       .addCase(createAariWorker.rejected, (state, action) => {
//         state.loading = false;
//         console.error("🔴 [Redux] createAariWorker rejected:", action.payload);
//         state.error = action.payload;
//       })

//       // ===== UPDATE AARI_WORKER =====
//       .addCase(updateAariWorker.fulfilled, (state, action) => {
//         const updatedAariWorker = action.payload.aariWorker;
//         const index = state.aariWorkers.findIndex(t => t._id === updatedAariWorker._id);
//         if (index !== -1) {
//           state.aariWorkers[index] = updatedAariWorker;
//         }
//         if (state.currentAariWorker?._id === updatedAariWorker._id) {
//           state.currentAariWorker = updatedAariWorker;
//         }
//       })

//       // ===== UPDATE LEAVE STATUS =====
//       .addCase(updateLeaveStatus.fulfilled, (state, action) => {
//         const updatedAariWorker = action.payload.aariWorker;
//         const index = state.aariWorkers.findIndex(t => t._id === updatedAariWorker._id);
//         if (index !== -1) {
//           state.aariWorkers[index] = updatedAariWorker;
//         }
//         if (state.currentAariWorker?._id === updatedAariWorker._id) {
//           state.currentAariWorker = updatedAariWorker;
//         }
//       })

//       // ===== TOGGLE AARI_WORKER STATUS =====
//       .addCase(toggleAariWorkerStatus.fulfilled, (state, action) => {
//         const updatedAariWorker = action.payload.aariWorker;
//         const index = state.aariWorkers.findIndex(t => t._id === updatedAariWorker._id);
//         if (index !== -1) {
//           state.aariWorkers[index] = updatedAariWorker;
//         }
//         if (state.currentAariWorker?._id === updatedAariWorker._id) {
//           state.currentAariWorker = updatedAariWorker;
//         }
//       })

//       // ===== DELETE AARI_WORKER =====
//       .addCase(deleteAariWorker.fulfilled, (state, action) => {
//         state.aariWorkers = state.aariWorkers.filter(t => t._id !== action.payload);
//         state.pagination.total -= 1;
//         if (state.currentAariWorker?._id === action.payload) {
//           state.currentAariWorker = null;
//           state.works = [];
//           state.workStats = {};
//         }
//       })

//       // ===== FETCH AARI_WORKER STATS =====
//       .addCase(fetchAariWorkerStats.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchAariWorkerStats.fulfilled, (state, action) => {
//         state.loading = false;
//         state.aariWorkerStats = action.payload.aariWorkerStats;
//         state.workDistribution = action.payload.workDistribution;
//       })
//       .addCase(fetchAariWorkerStats.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       });
//   },
// });

// export const { 
//   clearCurrentAariWorker, 
//   clearError,
//   setPage,
//   setLimit,
//   setSorting,
//   setSearchTerm,
//   setSearchFilter,
//   resetSearch,
//   clearTopAariWorkers // ✅ NEW
// } = aariWorkerSlice.actions;

// // ============================================
// // SELECTORS
// // ============================================

// export const selectAllAariWorkers = (state) => state.aariWorker.aariWorkers;
// export const selectCurrentAariWorker = (state) => state.aariWorker.currentAariWorker;
// export const selectAariWorkerWorks = (state) => state.aariWorker.works;
// export const selectAariWorkerWorkStats = (state) => state.aariWorker.workStats;
// export const selectAariWorkerStats = (state) => state.aariWorker.aariWorkerStats;
// export const selectWorkDistribution = (state) => state.aariWorker.workDistribution;
// export const selectAariWorkerLoading = (state) => state.aariWorker.loading;
// export const selectAariWorkerError = (state) => state.aariWorker.error;

// // ✅ NEW: Top aariWorkers selectors
// export const selectTopAariWorkers = (state) => state.aariWorker.topAariWorkers;
// export const selectTopAariWorkersSummary = (state) => state.aariWorker.topAariWorkersSummary;
// export const selectTopAariWorkersLoading = (state) => state.aariWorker.topAariWorkersLoading;

// // Pagination selectors
// export const selectAariWorkerPagination = (state) => state.aariWorker.pagination;
// export const selectAariWorkerSorting = (state) => state.aariWorker.sorting;
// export const selectAariWorkerSearch = (state) => state.aariWorker.search;

// export default aariWorkerSlice.reducer;






// // frontend/src/features/aariWorker/aariWorkerSlice.js - COMPLETE FIXED VERSION WITH DASHBOARD
// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import * as aariWorkerApi from "./aariWorkerApi";

// // ===== ASYNC THUNKS =====

// // ✅ FETCH ALL AARI_WORKERS (with pagination & sorting)
// export const fetchAllAariWorkers = createAsyncThunk(
//   "aariWorker/fetchAll",
//   async (params = {}, { rejectWithValue }) => {
//     try {
//       const response = await aariWorkerApi.getAllAariWorkersApi(params);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch aariWorkers");
//     }
//   }
// );

// export const fetchAariWorkerById = createAsyncThunk(
//   "aariWorker/fetchById",
//   async (id, { rejectWithValue }) => {
//     try {
//       const response = await aariWorkerApi.getAariWorkerByIdApi(id);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch aariWorker");
//     }
//   }
// );

// // ✅ FETCH TOP AARI_WORKERS for dashboard
// export const fetchTopAariWorkers = createAsyncThunk(
//   "aariWorker/fetchTop",
//   async ({ limit = 5, period = 'month' } = {}, { rejectWithValue }) => {
//     try {
//       console.log(`🏆 Fetching top ${limit} aariWorkers for period: ${period}`);
//       const response = await aariWorkerApi.getTopAariWorkersApi(limit, period);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch top aariWorkers");
//     }
//   }
// );

// // ✅ FETCH AARI_WORKER PERFORMANCE for dashboard
// export const fetchAariWorkerPerformance = createAsyncThunk(
//   "aariWorker/fetchPerformance",
//   async ({ period = 'month', aariWorkerId } = {}, { rejectWithValue }) => {
//     try {
//       console.log(`📈 Fetching aariWorker performance for period: ${period}`);
//       const response = await aariWorkerApi.getAariWorkerPerformanceApi(period, aariWorkerId);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch aariWorker performance");
//     }
//   }
// );

// // ✅ FETCH AARI_WORKER STATS
// export const fetchAariWorkerStats = createAsyncThunk(
//   "aariWorker/fetchStats",
//   async (_, { rejectWithValue }) => {
//     try {
//       console.log('📊 Fetching aariWorker stats');
//       const response = await aariWorkerApi.getAariWorkerStatsApi();
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch stats");
//     }
//   }
// );

// // ===== CREATE AARI_WORKER - UPDATED WITH DEBUG LOGS =====
// export const createAariWorker = createAsyncThunk(
//   "aariWorker/create",
//   async (aariWorkerData, { rejectWithValue }) => {
//     try {
//       // DEBUG: Log the data received in thunk
//       console.log("🔵 [Redux Thunk] createAariWorker received:", {
//         ...aariWorkerData,
//         password: aariWorkerData.password ? `✅ PRESENT (${aariWorkerData.password.length} chars)` : "❌ MISSING",
//         passwordFirstChars: aariWorkerData.password ? aariWorkerData.password.substring(0, 3) + '...' : null
//       });

//       // CRITICAL CHECK: Verify password exists
//       if (!aariWorkerData.password) {
//         console.error("🔴 [Redux Thunk] CRITICAL: Password is missing in thunk!");
        
//         // Check if password might be in a different property
//         const possiblePasswordProps = ['password', 'pass', 'pwd', 'Password'];
//         const foundProps = possiblePasswordProps.filter(prop => aariWorkerData[prop]);
        
//         if (foundProps.length > 0) {
//           console.log("🔵 [Redux Thunk] Found password in alternative property:", foundProps[0]);
//           // Use the found password property
//           aariWorkerData.password = aariWorkerData[foundProps[0]];
//         } else {
//           return rejectWithValue({ 
//             message: "Password is required but was not provided in the request data" 
//           });
//         }
//       }

//       // Ensure all required fields are present
//       const apiData = {
//         name: aariWorkerData.name,
//         phone: aariWorkerData.phone,
//         email: aariWorkerData.email || undefined,
//         password: aariWorkerData.password, // Explicitly include password
//         experience: aariWorkerData.experience || 0,
//         specialization: Array.isArray(aariWorkerData.specialization) ? aariWorkerData.specialization : [],
//         address: aariWorkerData.address || {}
//       };

//       // DEBUG: Log the data being sent to API
//       console.log("🔵 [Redux Thunk] Sending to API:", {
//         ...apiData,
//         password: apiData.password ? `✅ PRESENT (${apiData.password.length} chars)` : "❌ MISSING",
//         passwordPreview: apiData.password ? apiData.password.substring(0, 3) + '...' : null
//       });

//       // Make the API call
//       const response = await aariWorkerApi.createAariWorkerApi(apiData);
      
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
//         "Failed to create aariWorker"
//       );
//     }
//   }
// );

// export const updateAariWorker = createAsyncThunk(
//   "aariWorker/update",
//   async ({ id, aariWorkerData }, { rejectWithValue }) => {
//     try {
//       const response = await aariWorkerApi.updateAariWorkerApi(id, aariWorkerData);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to update aariWorker");
//     }
//   }
// );

// export const updateLeaveStatus = createAsyncThunk(
//   "aariWorker/updateLeave",
//   async ({ id, leaveData }, { rejectWithValue }) => {
//     try {
//       const response = await aariWorkerApi.updateLeaveStatusApi(id, leaveData);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to update leave status");
//     }
//   }
// );

// // ✅ TOGGLE AARI_WORKER STATUS (Activate/Deactivate)
// export const toggleAariWorkerStatus = createAsyncThunk(
//   "aariWorker/toggleStatus",
//   async (id, { rejectWithValue }) => {
//     try {
//       const response = await aariWorkerApi.toggleAariWorkerStatusApi(id);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to toggle status");
//     }
//   }
// );

// export const deleteAariWorker = createAsyncThunk(
//   "aariWorker/delete",
//   async (id, { rejectWithValue }) => {
//     try {
//       await aariWorkerApi.deleteAariWorkerApi(id);
//       return id;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to delete aariWorker");
//     }
//   }
// );

// const aariWorkerSlice = createSlice({
//   name: "aariWorker",
//   initialState: {
//     aariWorkers: [],
//     currentAariWorker: null,
//     works: [],
//     workStats: {},
//     aariWorkerStats: {},
//     workDistribution: {},
    
//     // ✅ Top aariWorkers for dashboard
//     topAariWorkers: [],
//     topAariWorkersSummary: {},
//     topAariWorkersLoading: false,
    
//     // ✅ AariWorker performance for dashboard
//     aariWorkerPerformance: {
//       data: [],
//       summary: {
//         totalCompleted: 0,
//         activeAariWorkers: 0,
//         avgPerAariWorker: 0
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
//     clearCurrentAariWorker: (state) => {
//       state.currentAariWorker = null;
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
    
//     // ✅ Clear top aariWorkers
//     clearTopAariWorkers: (state) => {
//       state.topAariWorkers = [];
//       state.topAariWorkersSummary = {};
//     },
    
//     // ✅ Clear aariWorker performance
//     clearAariWorkerPerformance: (state) => {
//       state.aariWorkerPerformance = {
//         data: [],
//         summary: {
//           totalCompleted: 0,
//           activeAariWorkers: 0,
//           avgPerAariWorker: 0
//         },
//         loading: false
//       };
//     }
//   },
//   extraReducers: (builder) => {
//     builder
//       // ===== FETCH ALL AARI_WORKERS =====
//       .addCase(fetchAllAariWorkers.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchAllAariWorkers.fulfilled, (state, action) => {
//         state.loading = false;
        
//         // Handle both array and paginated responses
//         if (Array.isArray(action.payload)) {
//           state.aariWorkers = action.payload;
//           state.pagination.total = action.payload.length;
//           state.pagination.pages = 1;
//         } else {
//           state.aariWorkers = action.payload.aariWorkers || action.payload;
//           state.pagination = {
//             ...state.pagination,
//             ...(action.payload.pagination || {})
//           };
//         }
//       })
//       .addCase(fetchAllAariWorkers.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== FETCH AARI_WORKER BY ID =====
//       .addCase(fetchAariWorkerById.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchAariWorkerById.fulfilled, (state, action) => {
//         state.loading = false;
//         state.currentAariWorker = action.payload.aariWorker;
//         state.works = action.payload.works;
//         state.workStats = action.payload.workStats;
//       })
//       .addCase(fetchAariWorkerById.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== FETCH TOP AARI_WORKERS =====
//       .addCase(fetchTopAariWorkers.pending, (state) => {
//         state.topAariWorkersLoading = true;
//         state.error = null;
//       })
//       .addCase(fetchTopAariWorkers.fulfilled, (state, action) => {
//         state.topAariWorkersLoading = false;
//         state.topAariWorkers = action.payload.topAariWorkers || [];
//         state.topAariWorkersSummary = action.payload.summary || {};
//         console.log('✅ Top aariWorkers loaded:', state.topAariWorkers.length);
//       })
//       .addCase(fetchTopAariWorkers.rejected, (state, action) => {
//         state.topAariWorkersLoading = false;
//         state.error = action.payload;
//       })

//       // ===== FETCH AARI_WORKER PERFORMANCE =====
//       .addCase(fetchAariWorkerPerformance.pending, (state) => {
//         state.aariWorkerPerformance.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchAariWorkerPerformance.fulfilled, (state, action) => {
//         state.aariWorkerPerformance.loading = false;
//         state.aariWorkerPerformance.data = action.payload.performance || [];
//         state.aariWorkerPerformance.summary = action.payload.summary || {
//           totalCompleted: 0,
//           activeAariWorkers: 0,
//           avgPerAariWorker: 0
//         };
//         console.log('✅ AariWorker performance loaded:', state.aariWorkerPerformance.data.length);
//       })
//       .addCase(fetchAariWorkerPerformance.rejected, (state, action) => {
//         state.aariWorkerPerformance.loading = false;
//         state.error = action.payload;
//       })

//       // ===== CREATE AARI_WORKER =====
//       .addCase(createAariWorker.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//         console.log("🟡 [Redux] createAariWorker pending");
//       })
//       .addCase(createAariWorker.fulfilled, (state, action) => {
//         state.loading = false;
//         console.log("🟢 [Redux] createAariWorker fulfilled:", action.payload);
//         state.aariWorkers = [action.payload.aariWorker, ...state.aariWorkers];
//         state.pagination.total += 1;
//       })
//       .addCase(createAariWorker.rejected, (state, action) => {
//         state.loading = false;
//         console.error("🔴 [Redux] createAariWorker rejected:", action.payload);
//         state.error = action.payload;
//       })

//       // ===== UPDATE AARI_WORKER =====
//       .addCase(updateAariWorker.fulfilled, (state, action) => {
//         const updatedAariWorker = action.payload.aariWorker;
//         const index = state.aariWorkers.findIndex(t => t._id === updatedAariWorker._id);
//         if (index !== -1) {
//           state.aariWorkers[index] = updatedAariWorker;
//         }
//         if (state.currentAariWorker?._id === updatedAariWorker._id) {
//           state.currentAariWorker = updatedAariWorker;
//         }
//       })

//       // ===== UPDATE LEAVE STATUS =====
//       .addCase(updateLeaveStatus.fulfilled, (state, action) => {
//         const updatedAariWorker = action.payload.aariWorker;
//         const index = state.aariWorkers.findIndex(t => t._id === updatedAariWorker._id);
//         if (index !== -1) {
//           state.aariWorkers[index] = updatedAariWorker;
//         }
//         if (state.currentAariWorker?._id === updatedAariWorker._id) {
//           state.currentAariWorker = updatedAariWorker;
//         }
//       })

//       // ===== TOGGLE AARI_WORKER STATUS =====
//       .addCase(toggleAariWorkerStatus.fulfilled, (state, action) => {
//         const updatedAariWorker = action.payload.aariWorker;
//         const index = state.aariWorkers.findIndex(t => t._id === updatedAariWorker._id);
//         if (index !== -1) {
//           state.aariWorkers[index] = updatedAariWorker;
//         }
//         if (state.currentAariWorker?._id === updatedAariWorker._id) {
//           state.currentAariWorker = updatedAariWorker;
//         }
//       })

//       // ===== DELETE AARI_WORKER =====
//       .addCase(deleteAariWorker.fulfilled, (state, action) => {
//         state.aariWorkers = state.aariWorkers.filter(t => t._id !== action.payload);
//         state.pagination.total -= 1;
//         if (state.currentAariWorker?._id === action.payload) {
//           state.currentAariWorker = null;
//           state.works = [];
//           state.workStats = {};
//         }
//       })

//       // ===== FETCH AARI_WORKER STATS =====
//       .addCase(fetchAariWorkerStats.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchAariWorkerStats.fulfilled, (state, action) => {
//         state.loading = false;
//         state.aariWorkerStats = action.payload.aariWorkerStats;
//         state.workDistribution = action.payload.workDistribution;
//         console.log('✅ AariWorker stats loaded:', state.aariWorkerStats);
//       })
//       .addCase(fetchAariWorkerStats.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       });
//   },
// });

// export const { 
//   clearCurrentAariWorker, 
//   clearError,
//   setPage,
//   setLimit,
//   setSorting,
//   setSearchTerm,
//   setSearchFilter,
//   resetSearch,
//   clearTopAariWorkers,
//   clearAariWorkerPerformance // ✅ NEW
// } = aariWorkerSlice.actions;

// // ============================================
// // SELECTORS
// // ============================================

// export const selectAllAariWorkers = (state) => state.aariWorker.aariWorkers;
// export const selectCurrentAariWorker = (state) => state.aariWorker.currentAariWorker;
// export const selectAariWorkerWorks = (state) => state.aariWorker.works;
// export const selectAariWorkerWorkStats = (state) => state.aariWorker.workStats;
// export const selectAariWorkerStats = (state) => state.aariWorker.aariWorkerStats;
// export const selectWorkDistribution = (state) => state.aariWorker.workDistribution;
// export const selectAariWorkerLoading = (state) => state.aariWorker.loading;
// export const selectAariWorkerError = (state) => state.aariWorker.error;

// // ✅ Top aariWorkers selectors
// export const selectTopAariWorkers = (state) => state.aariWorker.topAariWorkers;
// export const selectTopAariWorkersSummary = (state) => state.aariWorker.topAariWorkersSummary;
// export const selectTopAariWorkersLoading = (state) => state.aariWorker.topAariWorkersLoading;

// // ✅ AariWorker performance selectors
// export const selectAariWorkerPerformance = (state) => state.aariWorker.aariWorkerPerformance.data;
// export const selectAariWorkerPerformanceSummary = (state) => state.aariWorker.aariWorkerPerformance.summary;
// export const selectAariWorkerPerformanceLoading = (state) => state.aariWorker.aariWorkerPerformance.loading;

// // Pagination selectors
// export const selectAariWorkerPagination = (state) => state.aariWorker.pagination;
// export const selectAariWorkerSorting = (state) => state.aariWorker.sorting;
// export const selectAariWorkerSearch = (state) => state.aariWorker.search;

// export default aariWorkerSlice.reducer;










// frontend/src/features/aariWorker/aariWorkerSlice.js - WITH COMPREHENSIVE DEBUGGING
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as aariWorkerApi from "./aariWorkerApi";

// ===== ASYNC THUNKS =====

// ✅ FETCH ALL AARI_WORKERS (with pagination & sorting)
export const fetchAllAariWorkers = createAsyncThunk(
  "aariWorker/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      console.log('🔵 [fetchAllAariWorkers] Request with params:', params);
      const response = await aariWorkerApi.getAllAariWorkersApi(params);
      console.log('🔵 [fetchAllAariWorkers] Response:', response);
      return response;
    } catch (error) {
      console.error('🔴 [fetchAllAariWorkers] Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      return rejectWithValue(error.response?.data?.message || "Failed to fetch aariWorkers");
    }
  }
);

export const fetchAariWorkerById = createAsyncThunk(
  "aariWorker/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      console.log('🔵 [fetchAariWorkerById] Request for ID:', id);
      const response = await aariWorkerApi.getAariWorkerByIdApi(id);
      console.log('🔵 [fetchAariWorkerById] Response:', response);
      return response;
    } catch (error) {
      console.error('🔴 [fetchAariWorkerById] Error:', error);
      return rejectWithValue(error.response?.data?.message || "Failed to fetch aariWorker");
    }
  }
);

// ✅ FETCH TOP AARI_WORKERS for dashboard
export const fetchTopAariWorkers = createAsyncThunk(
  "aariWorker/fetchTop",
  async ({ limit = 5, period = 'month' } = {}, { rejectWithValue }) => {
    try {
      console.log(`🏆 [fetchTopAariWorkers] Fetching top ${limit} aariWorkers for period: ${period}`);
      const response = await aariWorkerApi.getTopAariWorkersApi(limit, period);
      console.log('🏆 [fetchTopAariWorkers] Full Response:', response);
      console.log('🏆 [fetchTopAariWorkers] Top aariWorkers data:', response.topAariWorkers);
      console.log('🏆 [fetchTopAariWorkers] Summary:', response.summary);
      return response;
    } catch (error) {
      console.error('🔴 [fetchTopAariWorkers] Error:', error);
      return rejectWithValue(error.response?.data?.message || "Failed to fetch top aariWorkers");
    }
  }
);

// ✅ FETCH AARI_WORKER PERFORMANCE for dashboard
export const fetchAariWorkerPerformance = createAsyncThunk(
  "aariWorker/fetchPerformance",
  async ({ period = 'month', aariWorkerId } = {}, { rejectWithValue }) => {
    try {
      console.log(`📈 [fetchAariWorkerPerformance] Fetching aariWorker performance for period: ${period}`, aariWorkerId ? `aariWorkerId: ${aariWorkerId}` : 'all aariWorkers');
      const response = await aariWorkerApi.getAariWorkerPerformanceApi(period, aariWorkerId);
      console.log('📈 [fetchAariWorkerPerformance] Full Response:', response);
      console.log('📈 [fetchAariWorkerPerformance] Performance data:', response.performance);
      console.log('📈 [fetchAariWorkerPerformance] Summary:', response.summary);
      return response;
    } catch (error) {
      console.error('🔴 [fetchAariWorkerPerformance] Error:', error);
      return rejectWithValue(error.response?.data?.message || "Failed to fetch aariWorker performance");
    }
  }
);

// ✅ FETCH AARI_WORKER STATS
export const fetchAariWorkerStats = createAsyncThunk(
  "aariWorker/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      console.log('📊 [fetchAariWorkerStats] Fetching aariWorker stats');
      const response = await aariWorkerApi.getAariWorkerStatsApi();
      console.log('📊 [fetchAariWorkerStats] Full Response:', response);
      console.log('📊 [fetchAariWorkerStats] AariWorker Stats:', response.aariWorkerStats);
      console.log('📊 [fetchAariWorkerStats] Work Distribution:', response.workDistribution);
      return response;
    } catch (error) {
      console.error('🔴 [fetchAariWorkerStats] Error:', error);
      return rejectWithValue(error.response?.data?.message || "Failed to fetch stats");
    }
  }
);

// ===== CREATE AARI_WORKER - UPDATED WITH DEBUG LOGS =====
export const createAariWorker = createAsyncThunk(
  "aariWorker/create",
  async (aariWorkerData, { rejectWithValue }) => {
    try {
      // DEBUG: Log the data received in thunk
      console.log("🔵 [createAariWorker] Received:", {
        ...aariWorkerData,
        password: aariWorkerData.password ? `✅ PRESENT (${aariWorkerData.password.length} chars)` : "❌ MISSING",
        passwordFirstChars: aariWorkerData.password ? aariWorkerData.password.substring(0, 3) + '...' : null
      });

      // CRITICAL CHECK: Verify password exists
      if (!aariWorkerData.password) {
        console.error("🔴 [createAariWorker] CRITICAL: Password is missing!");
        
        // Check if password might be in a different property
        const possiblePasswordProps = ['password', 'pass', 'pwd', 'Password'];
        const foundProps = possiblePasswordProps.filter(prop => aariWorkerData[prop]);
        
        if (foundProps.length > 0) {
          console.log("🔵 [createAariWorker] Found password in alternative property:", foundProps[0]);
          aariWorkerData.password = aariWorkerData[foundProps[0]];
        } else {
          return rejectWithValue({ 
            message: "Password is required but was not provided in the request data" 
          });
        }
      }

      // Ensure all required fields are present
      const apiData = {
        name: aariWorkerData.name,
        phone: aariWorkerData.phone,
        email: aariWorkerData.email || undefined,
        password: aariWorkerData.password,
        experience: aariWorkerData.experience || 0,
        specialization: Array.isArray(aariWorkerData.specialization) ? aariWorkerData.specialization : [],
        address: aariWorkerData.address || {}
      };

      console.log("🔵 [createAariWorker] Sending to API:", {
        ...apiData,
        password: apiData.password ? `✅ PRESENT (${apiData.password.length} chars)` : "❌ MISSING"
      });

      const response = await aariWorkerApi.createAariWorkerApi(apiData);
      console.log("🔵 [createAariWorker] API Response:", response);
      return response;
    } catch (error) {
      console.error("🔴 [createAariWorker] Error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        "Failed to create aariWorker"
      );
    }
  }
);

export const updateAariWorker = createAsyncThunk(
  "aariWorker/update",
  async ({ id, aariWorkerData }, { rejectWithValue }) => {
    try {
      console.log('🔵 [updateAariWorker] Updating aariWorker:', id, aariWorkerData);
      const response = await aariWorkerApi.updateAariWorkerApi(id, aariWorkerData);
      console.log('🔵 [updateAariWorker] Response:', response);
      return response;
    } catch (error) {
      console.error('🔴 [updateAariWorker] Error:', error);
      return rejectWithValue(error.response?.data?.message || "Failed to update aariWorker");
    }
  }
);

export const updateLeaveStatus = createAsyncThunk(
  "aariWorker/updateLeave",
  async ({ id, leaveData }, { rejectWithValue }) => {
    try {
      console.log('🔵 [updateLeaveStatus] Updating leave for aariWorker:', id, leaveData);
      const response = await aariWorkerApi.updateLeaveStatusApi(id, leaveData);
      console.log('🔵 [updateLeaveStatus] Response:', response);
      return response;
    } catch (error) {
      console.error('🔴 [updateLeaveStatus] Error:', error);
      return rejectWithValue(error.response?.data?.message || "Failed to update leave status");
    }
  }
);

// ✅ TOGGLE AARI_WORKER STATUS (Activate/Deactivate)
export const toggleAariWorkerStatus = createAsyncThunk(
  "aariWorker/toggleStatus",
  async (id, { rejectWithValue }) => {
    try {
      console.log('🔵 [toggleAariWorkerStatus] Toggling status for aariWorker:', id);
      const response = await aariWorkerApi.toggleAariWorkerStatusApi(id);
      console.log('🔵 [toggleAariWorkerStatus] Response:', response);
      return response;
    } catch (error) {
      console.error('🔴 [toggleAariWorkerStatus] Error:', error);
      return rejectWithValue(error.response?.data?.message || "Failed to toggle status");
    }
  }
);

export const deleteAariWorker = createAsyncThunk(
  "aariWorker/delete",
  async (id, { rejectWithValue }) => {
    try {
      console.log('🔵 [deleteAariWorker] Deleting aariWorker:', id);
      await aariWorkerApi.deleteAariWorkerApi(id);
      console.log('🔵 [deleteAariWorker] Deleted successfully:', id);
      return id;
    } catch (error) {
      console.error('🔴 [deleteAariWorker] Error:', error);
      return rejectWithValue(error.response?.data?.message || "Failed to delete aariWorker");
    }
  }
);

const aariWorkerSlice = createSlice({
  name: "aariWorker",
  initialState: {
    aariWorkers: [],
    currentAariWorker: null,
    works: [],
    workStats: {},
    aariWorkerStats: {},
    workDistribution: {},
    
    // ✅ Top aariWorkers for dashboard
    topAariWorkers: [],
    topAariWorkersSummary: {},
    topAariWorkersLoading: false,
    
    // ✅ AariWorker performance for dashboard
    aariWorkerPerformance: {
      data: [],
      summary: {
        totalCompleted: 0,
        activeAariWorkers: 0,
        avgPerAariWorker: 0
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
    clearCurrentAariWorker: (state) => {
      state.currentAariWorker = null;
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
    
    clearTopAariWorkers: (state) => {
      state.topAariWorkers = [];
      state.topAariWorkersSummary = {};
    },
    
    clearAariWorkerPerformance: (state) => {
      state.aariWorkerPerformance = {
        data: [],
        summary: {
          totalCompleted: 0,
          activeAariWorkers: 0,
          avgPerAariWorker: 0
        },
        loading: false
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // ===== FETCH ALL AARI_WORKERS =====
      .addCase(fetchAllAariWorkers.pending, (state) => {
        console.log('🟡 [Reducer] fetchAllAariWorkers pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllAariWorkers.fulfilled, (state, action) => {
        console.log('🟢 [Reducer] fetchAllAariWorkers fulfilled:', action.payload);
        state.loading = false;
        
        if (Array.isArray(action.payload)) {
          state.aariWorkers = action.payload;
          state.pagination.total = action.payload.length;
          state.pagination.pages = 1;
        } else {
          state.aariWorkers = action.payload.aariWorkers || action.payload;
          state.pagination = {
            ...state.pagination,
            ...(action.payload.pagination || {})
          };
        }
        console.log('🟢 [Reducer] AariWorkers loaded:', state.aariWorkers.length);
      })
      .addCase(fetchAllAariWorkers.rejected, (state, action) => {
        console.error('🔴 [Reducer] fetchAllAariWorkers rejected:', action.payload);
        state.loading = false;
        state.error = action.payload;
      })

      // ===== FETCH AARI_WORKER BY ID =====
      .addCase(fetchAariWorkerById.pending, (state) => {
        console.log('🟡 [Reducer] fetchAariWorkerById pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAariWorkerById.fulfilled, (state, action) => {
        console.log('🟢 [Reducer] fetchAariWorkerById fulfilled:', action.payload);
        state.loading = false;
        state.currentAariWorker = action.payload.aariWorker;
        state.works = action.payload.works;
        state.workStats = action.payload.workStats;
      })
      .addCase(fetchAariWorkerById.rejected, (state, action) => {
        console.error('🔴 [Reducer] fetchAariWorkerById rejected:', action.payload);
        state.loading = false;
        state.error = action.payload;
      })

      // ===== FETCH TOP AARI_WORKERS =====
      .addCase(fetchTopAariWorkers.pending, (state) => {
        console.log('🟡 [Reducer] fetchTopAariWorkers pending');
        state.topAariWorkersLoading = true;
        state.error = null;
      })
      .addCase(fetchTopAariWorkers.fulfilled, (state, action) => {
        console.log('🟢 [Reducer] fetchTopAariWorkers fulfilled:', action.payload);
        state.topAariWorkersLoading = false;
        state.topAariWorkers = action.payload.topAariWorkers || [];
        state.topAariWorkersSummary = action.payload.summary || {};
        console.log('🟢 [Reducer] Top aariWorkers loaded:', state.topAariWorkers.length);
        console.log('🟢 [Reducer] Top aariWorkers data:', state.topAariWorkers);
      })
      .addCase(fetchTopAariWorkers.rejected, (state, action) => {
        console.error('🔴 [Reducer] fetchTopAariWorkers rejected:', action.payload);
        state.topAariWorkersLoading = false;
        state.error = action.payload;
      })

      // ===== FETCH AARI_WORKER PERFORMANCE =====
      .addCase(fetchAariWorkerPerformance.pending, (state) => {
        console.log('🟡 [Reducer] fetchAariWorkerPerformance pending');
        state.aariWorkerPerformance.loading = true;
        state.error = null;
      })
      .addCase(fetchAariWorkerPerformance.fulfilled, (state, action) => {
        console.log('🟢 [Reducer] fetchAariWorkerPerformance fulfilled:', action.payload);
        state.aariWorkerPerformance.loading = false;
        state.aariWorkerPerformance.data = action.payload.performance || [];
        state.aariWorkerPerformance.summary = action.payload.summary || {
          totalCompleted: 0,
          activeAariWorkers: 0,
          avgPerAariWorker: 0
        };
        console.log('🟢 [Reducer] Performance data loaded:', state.aariWorkerPerformance.data.length);
        console.log('🟢 [Reducer] Performance data:', state.aariWorkerPerformance.data);
        console.log('🟢 [Reducer] Performance summary:', state.aariWorkerPerformance.summary);
      })
      .addCase(fetchAariWorkerPerformance.rejected, (state, action) => {
        console.error('🔴 [Reducer] fetchAariWorkerPerformance rejected:', action.payload);
        state.aariWorkerPerformance.loading = false;
        state.error = action.payload;
      })

      // ===== CREATE AARI_WORKER =====
      .addCase(createAariWorker.pending, (state) => {
        console.log("🟡 [Reducer] createAariWorker pending");
        state.loading = true;
        state.error = null;
      })
      .addCase(createAariWorker.fulfilled, (state, action) => {
        console.log("🟢 [Reducer] createAariWorker fulfilled:", action.payload);
        state.loading = false;
        state.aariWorkers = [action.payload.aariWorker, ...state.aariWorkers];
        state.pagination.total += 1;
      })
      .addCase(createAariWorker.rejected, (state, action) => {
        console.error("🔴 [Reducer] createAariWorker rejected:", action.payload);
        state.loading = false;
        state.error = action.payload;
      })

      // ===== UPDATE AARI_WORKER =====
      .addCase(updateAariWorker.fulfilled, (state, action) => {
        console.log('🟢 [Reducer] updateAariWorker fulfilled:', action.payload);
        const updatedAariWorker = action.payload.aariWorker;
        const index = state.aariWorkers.findIndex(t => t._id === updatedAariWorker._id);
        if (index !== -1) {
          state.aariWorkers[index] = updatedAariWorker;
        }
        if (state.currentAariWorker?._id === updatedAariWorker._id) {
          state.currentAariWorker = updatedAariWorker;
        }
      })

      // ===== UPDATE LEAVE STATUS =====
      .addCase(updateLeaveStatus.fulfilled, (state, action) => {
        console.log('🟢 [Reducer] updateLeaveStatus fulfilled:', action.payload);
        const updatedAariWorker = action.payload.aariWorker;
        const index = state.aariWorkers.findIndex(t => t._id === updatedAariWorker._id);
        if (index !== -1) {
          state.aariWorkers[index] = updatedAariWorker;
        }
        if (state.currentAariWorker?._id === updatedAariWorker._id) {
          state.currentAariWorker = updatedAariWorker;
        }
      })

      // ===== TOGGLE AARI_WORKER STATUS =====
      .addCase(toggleAariWorkerStatus.fulfilled, (state, action) => {
        console.log('🟢 [Reducer] toggleAariWorkerStatus fulfilled:', action.payload);
        const updatedAariWorker = action.payload.aariWorker;
        const index = state.aariWorkers.findIndex(t => t._id === updatedAariWorker._id);
        if (index !== -1) {
          state.aariWorkers[index] = updatedAariWorker;
        }
        if (state.currentAariWorker?._id === updatedAariWorker._id) {
          state.currentAariWorker = updatedAariWorker;
        }
      })

      // ===== DELETE AARI_WORKER =====
      .addCase(deleteAariWorker.fulfilled, (state, action) => {
        console.log('🟢 [Reducer] deleteAariWorker fulfilled:', action.payload);
        state.aariWorkers = state.aariWorkers.filter(t => t._id !== action.payload);
        state.pagination.total -= 1;
        if (state.currentAariWorker?._id === action.payload) {
          state.currentAariWorker = null;
          state.works = [];
          state.workStats = {};
        }
      })

      // ===== FETCH AARI_WORKER STATS =====
      .addCase(fetchAariWorkerStats.pending, (state) => {
        console.log('🟡 [Reducer] fetchAariWorkerStats pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAariWorkerStats.fulfilled, (state, action) => {
        console.log('🟢 [Reducer] fetchAariWorkerStats fulfilled:', action.payload);
        state.loading = false;
        state.aariWorkerStats = action.payload.aariWorkerStats;
        state.workDistribution = action.payload.workDistribution;
        console.log('🟢 [Reducer] AariWorker stats loaded:', state.aariWorkerStats);
      })
      .addCase(fetchAariWorkerStats.rejected, (state, action) => {
        console.error('🔴 [Reducer] fetchAariWorkerStats rejected:', action.payload);
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  clearCurrentAariWorker, 
  clearError,
  setPage,
  setLimit,
  setSorting,
  setSearchTerm,
  setSearchFilter,
  resetSearch,
  clearTopAariWorkers,
  clearAariWorkerPerformance
} = aariWorkerSlice.actions;

// ============================================
// SELECTORS
// ============================================

export const selectAllAariWorkers = (state) => {
  console.log('🔍 [Selector] selectAllAariWorkers:', state.aariWorker?.aariWorkers?.length);
  return state.aariWorker.aariWorkers;
};

export const selectCurrentAariWorker = (state) => {
  console.log('🔍 [Selector] selectCurrentAariWorker:', state.aariWorker.currentAariWorker?._id);
  return state.aariWorker.currentAariWorker;
};

export const selectAariWorkerWorks = (state) => {
  console.log('🔍 [Selector] selectAariWorkerWorks:', state.aariWorker.works?.length);
  return state.aariWorker.works;
};

export const selectAariWorkerWorkStats = (state) => {
  console.log('🔍 [Selector] selectAariWorkerWorkStats:', state.aariWorker.workStats);
  return state.aariWorker.workStats;
};

export const selectAariWorkerStats = (state) => {
  console.log('🔍 [Selector] selectAariWorkerStats:', state.aariWorker.aariWorkerStats);
  return state.aariWorker.aariWorkerStats;
};

export const selectWorkDistribution = (state) => {
  console.log('🔍 [Selector] selectWorkDistribution:', state.aariWorker.workDistribution);
  return state.aariWorker.workDistribution;
};

export const selectAariWorkerLoading = (state) => {
  console.log('🔍 [Selector] selectAariWorkerLoading:', state.aariWorker.loading);
  return state.aariWorker.loading;
};

export const selectAariWorkerError = (state) => {
  console.log('🔍 [Selector] selectAariWorkerError:', state.aariWorker.error);
  return state.aariWorker.error;
};

// ✅ Top aariWorkers selectors
export const selectTopAariWorkers = (state) => {
  console.log('🔍 [Selector] selectTopAariWorkers:', state.aariWorker.topAariWorkers?.length);
  return state.aariWorker.topAariWorkers;
};

export const selectTopAariWorkersSummary = (state) => {
  console.log('🔍 [Selector] selectTopAariWorkersSummary:', state.aariWorker.topAariWorkersSummary);
  return state.aariWorker.topAariWorkersSummary;
};

export const selectTopAariWorkersLoading = (state) => {
  console.log('🔍 [Selector] selectTopAariWorkersLoading:', state.aariWorker.topAariWorkersLoading);
  return state.aariWorker.topAariWorkersLoading;
};

// ✅ AariWorker performance selectors
export const selectAariWorkerPerformance = (state) => {
  console.log('🔍 [Selector] selectAariWorkerPerformance:', state.aariWorker.aariWorkerPerformance?.data?.length);
  return state.aariWorker.aariWorkerPerformance?.data || [];
};

export const selectAariWorkerPerformanceSummary = (state) => {
  console.log('🔍 [Selector] selectAariWorkerPerformanceSummary:', state.aariWorker.aariWorkerPerformance?.summary);
  return state.aariWorker.aariWorkerPerformance?.summary || {
    totalCompleted: 0,
    activeAariWorkers: 0,
    avgPerAariWorker: 0
  };
};

export const selectAariWorkerPerformanceLoading = (state) => {
  console.log('🔍 [Selector] selectAariWorkerPerformanceLoading:', state.aariWorker.aariWorkerPerformance?.loading);
  return state.aariWorker.aariWorkerPerformance?.loading || false;
};

// Pagination selectors
export const selectAariWorkerPagination = (state) => {
  return state.aariWorker.pagination;
};

export const selectAariWorkerSorting = (state) => {
  return state.aariWorker.sorting;
};

export const selectAariWorkerSearch = (state) => {
  return state.aariWorker.search;
};

export default aariWorkerSlice.reducer;