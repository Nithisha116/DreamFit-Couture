// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import * as embroideryWorkerApi from "./embroideryWorkerApi";

// // ===== ASYNC THUNKS =====

// // ✅ FETCH ALL EMBROIDERY_WORKERS (with pagination & sorting)
// export const fetchAllEmbroideryWorkers = createAsyncThunk(
//   "embroideryWorker/fetchAll",
//   async (params = {}, { rejectWithValue }) => {
//     try {
//       const response = await embroideryWorkerApi.getAllEmbroideryWorkersApi(params);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch embroideryWorkers");
//     }
//   }
// );

// export const fetchEmbroideryWorkerById = createAsyncThunk(
//   "embroideryWorker/fetchById",
//   async (id, { rejectWithValue }) => {
//     try {
//       const response = await embroideryWorkerApi.getEmbroideryWorkerByIdApi(id);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch embroideryWorker");
//     }
//   }
// );

// // ===== CREATE EMBROIDERY_WORKER - UPDATED WITH DEBUG LOGS =====
// export const createEmbroideryWorker = createAsyncThunk(
//   "embroideryWorker/create",
//   async (embroideryWorkerData, { rejectWithValue }) => {
//     try {
//       // DEBUG: Log the data received in thunk
//       console.log("🔵 [Redux Thunk] createEmbroideryWorker received:", {
//         ...embroideryWorkerData,
//         password: embroideryWorkerData.password ? `✅ PRESENT (${embroideryWorkerData.password.length} chars)` : "❌ MISSING",
//         passwordFirstChars: embroideryWorkerData.password ? embroideryWorkerData.password.substring(0, 3) + '...' : null
//       });

//       // CRITICAL CHECK: Verify password exists
//       if (!embroideryWorkerData.password) {
//         console.error("🔴 [Redux Thunk] CRITICAL: Password is missing in thunk!");
        
//         // Check if password might be in a different property
//         const possiblePasswordProps = ['password', 'pass', 'pwd', 'Password'];
//         const foundProps = possiblePasswordProps.filter(prop => embroideryWorkerData[prop]);
        
//         if (foundProps.length > 0) {
//           console.log("🔵 [Redux Thunk] Found password in alternative property:", foundProps[0]);
//           // Use the found password property
//           embroideryWorkerData.password = embroideryWorkerData[foundProps[0]];
//         } else {
//           return rejectWithValue({ 
//             message: "Password is required but was not provided in the request data" 
//           });
//         }
//       }

//       // Ensure all required fields are present
//       const apiData = {
//         name: embroideryWorkerData.name,
//         phone: embroideryWorkerData.phone,
//         email: embroideryWorkerData.email || undefined,
//         password: embroideryWorkerData.password, // Explicitly include password
//         experience: embroideryWorkerData.experience || 0,
//         specialization: Array.isArray(embroideryWorkerData.specialization) ? embroideryWorkerData.specialization : [],
//         address: embroideryWorkerData.address || {}
//       };

//       // DEBUG: Log the data being sent to API
//       console.log("🔵 [Redux Thunk] Sending to API:", {
//         ...apiData,
//         password: apiData.password ? `✅ PRESENT (${apiData.password.length} chars)` : "❌ MISSING",
//         passwordPreview: apiData.password ? apiData.password.substring(0, 3) + '...' : null
//       });

//       // Make the API call
//       const response = await embroideryWorkerApi.createEmbroideryWorkerApi(apiData);
      
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
//         "Failed to create embroideryWorker"
//       );
//     }
//   }
// );

// export const updateEmbroideryWorker = createAsyncThunk(
//   "embroideryWorker/update",
//   async ({ id, embroideryWorkerData }, { rejectWithValue }) => {
//     try {
//       const response = await embroideryWorkerApi.updateEmbroideryWorkerApi(id, embroideryWorkerData);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to update embroideryWorker");
//     }
//   }
// );

// export const updateLeaveStatus = createAsyncThunk(
//   "embroideryWorker/updateLeave",
//   async ({ id, leaveData }, { rejectWithValue }) => {
//     try {
//       const response = await embroideryWorkerApi.updateLeaveStatusApi(id, leaveData);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to update leave status");
//     }
//   }
// );

// // ✅ NEW: TOGGLE EMBROIDERY_WORKER STATUS (Activate/Deactivate)
// export const toggleEmbroideryWorkerStatus = createAsyncThunk(
//   "embroideryWorker/toggleStatus",
//   async (id, { rejectWithValue }) => {
//     try {
//       const response = await embroideryWorkerApi.toggleEmbroideryWorkerStatusApi(id);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to toggle status");
//     }
//   }
// );

// export const deleteEmbroideryWorker = createAsyncThunk(
//   "embroideryWorker/delete",
//   async (id, { rejectWithValue }) => {
//     try {
//       await embroideryWorkerApi.deleteEmbroideryWorkerApi(id);
//       return id;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to delete embroideryWorker");
//     }
//   }
// );

// export const fetchEmbroideryWorkerStats = createAsyncThunk(
//   "embroideryWorker/fetchStats",
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await embroideryWorkerApi.getEmbroideryWorkerStatsApi();
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch stats");
//     }
//   }
// );

// const embroideryWorkerSlice = createSlice({
//   name: "embroideryWorker",
//   initialState: {
//     embroideryWorkers: [],
//     currentEmbroideryWorker: null,
//     works: [],
//     workStats: {},
//     embroideryWorkerStats: {},
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
//     clearCurrentEmbroideryWorker: (state) => {
//       state.currentEmbroideryWorker = null;
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
//       // ===== FETCH ALL EMBROIDERY_WORKERS =====
//       .addCase(fetchAllEmbroideryWorkers.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchAllEmbroideryWorkers.fulfilled, (state, action) => {
//         state.loading = false;
        
//         // ✅ Handle both array and paginated responses
//         if (Array.isArray(action.payload)) {
//           state.embroideryWorkers = action.payload;
//           state.pagination.total = action.payload.length;
//           state.pagination.pages = 1;
//         } else {
//           state.embroideryWorkers = action.payload.embroideryWorkers || action.payload;
//           state.pagination = {
//             ...state.pagination,
//             ...(action.payload.pagination || {})
//           };
//         }
//       })
//       .addCase(fetchAllEmbroideryWorkers.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== FETCH EMBROIDERY_WORKER BY ID =====
//       .addCase(fetchEmbroideryWorkerById.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchEmbroideryWorkerById.fulfilled, (state, action) => {
//         state.loading = false;
//         state.currentEmbroideryWorker = action.payload.embroideryWorker;
//         state.works = action.payload.works;
//         state.workStats = action.payload.workStats;
//       })
//       .addCase(fetchEmbroideryWorkerById.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== CREATE EMBROIDERY_WORKER =====
//       .addCase(createEmbroideryWorker.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//         console.log("🟡 [Redux] createEmbroideryWorker pending");
//       })
//       .addCase(createEmbroideryWorker.fulfilled, (state, action) => {
//         state.loading = false;
//         console.log("🟢 [Redux] createEmbroideryWorker fulfilled:", action.payload);
//         state.embroideryWorkers = [action.payload.embroideryWorker, ...state.embroideryWorkers];
//         state.pagination.total += 1;
//       })
//       .addCase(createEmbroideryWorker.rejected, (state, action) => {
//         state.loading = false;
//         console.error("🔴 [Redux] createEmbroideryWorker rejected:", action.payload);
//         state.error = action.payload;
//       })

//       // ===== UPDATE EMBROIDERY_WORKER =====
//       .addCase(updateEmbroideryWorker.fulfilled, (state, action) => {
//         const updatedEmbroideryWorker = action.payload.embroideryWorker;
//         const index = state.embroideryWorkers.findIndex(t => t._id === updatedEmbroideryWorker._id);
//         if (index !== -1) {
//           state.embroideryWorkers[index] = updatedEmbroideryWorker;
//         }
//         if (state.currentEmbroideryWorker?._id === updatedEmbroideryWorker._id) {
//           state.currentEmbroideryWorker = updatedEmbroideryWorker;
//         }
//       })

//       // ===== UPDATE LEAVE STATUS =====
//       .addCase(updateLeaveStatus.fulfilled, (state, action) => {
//         const updatedEmbroideryWorker = action.payload.embroideryWorker;
//         const index = state.embroideryWorkers.findIndex(t => t._id === updatedEmbroideryWorker._id);
//         if (index !== -1) {
//           state.embroideryWorkers[index] = updatedEmbroideryWorker;
//         }
//         if (state.currentEmbroideryWorker?._id === updatedEmbroideryWorker._id) {
//           state.currentEmbroideryWorker = updatedEmbroideryWorker;
//         }
//       })

//       // ===== TOGGLE EMBROIDERY_WORKER STATUS =====
//       .addCase(toggleEmbroideryWorkerStatus.fulfilled, (state, action) => {
//         const updatedEmbroideryWorker = action.payload.embroideryWorker;
//         const index = state.embroideryWorkers.findIndex(t => t._id === updatedEmbroideryWorker._id);
//         if (index !== -1) {
//           state.embroideryWorkers[index] = updatedEmbroideryWorker;
//         }
//         if (state.currentEmbroideryWorker?._id === updatedEmbroideryWorker._id) {
//           state.currentEmbroideryWorker = updatedEmbroideryWorker;
//         }
//       })

//       // ===== DELETE EMBROIDERY_WORKER =====
//       .addCase(deleteEmbroideryWorker.fulfilled, (state, action) => {
//         state.embroideryWorkers = state.embroideryWorkers.filter(t => t._id !== action.payload);
//         state.pagination.total -= 1;
//         if (state.currentEmbroideryWorker?._id === action.payload) {
//           state.currentEmbroideryWorker = null;
//           state.works = [];
//           state.workStats = {};
//         }
//       })

//       // ===== FETCH EMBROIDERY_WORKER STATS =====
//       .addCase(fetchEmbroideryWorkerStats.fulfilled, (state, action) => {
//         state.embroideryWorkerStats = action.payload.embroideryWorkerStats;
//         state.workDistribution = action.payload.workDistribution;
//       });
//   },
// });

// export const { 
//   clearCurrentEmbroideryWorker, 
//   clearError,
//   setPage,
//   setLimit,
//   setSorting,
//   setSearchTerm,
//   setSearchFilter,
//   resetSearch
// } = embroideryWorkerSlice.actions;

// export default embroideryWorkerSlice.reducer;








// // frontend/src/features/embroideryWorker/embroideryWorkerSlice.js - COMPLETE FIXED VERSION
// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import * as embroideryWorkerApi from "./embroideryWorkerApi";

// // ===== ASYNC THUNKS =====

// // ✅ FETCH ALL EMBROIDERY_WORKERS (with pagination & sorting)
// export const fetchAllEmbroideryWorkers = createAsyncThunk(
//   "embroideryWorker/fetchAll",
//   async (params = {}, { rejectWithValue }) => {
//     try {
//       const response = await embroideryWorkerApi.getAllEmbroideryWorkersApi(params);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch embroideryWorkers");
//     }
//   }
// );

// export const fetchEmbroideryWorkerById = createAsyncThunk(
//   "embroideryWorker/fetchById",
//   async (id, { rejectWithValue }) => {
//     try {
//       const response = await embroideryWorkerApi.getEmbroideryWorkerByIdApi(id);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch embroideryWorker");
//     }
//   }
// );

// // ✅ NEW: FETCH TOP EMBROIDERY_WORKERS for dashboard
// export const fetchTopEmbroideryWorkers = createAsyncThunk(
//   "embroideryWorker/fetchTop",
//   async ({ limit = 5 } = {}, { rejectWithValue }) => {
//     try {
//       const response = await embroideryWorkerApi.getTopEmbroideryWorkersApi(limit);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch top embroideryWorkers");
//     }
//   }
// );

// // ✅ FETCH EMBROIDERY_WORKER STATS
// export const fetchEmbroideryWorkerStats = createAsyncThunk(
//   "embroideryWorker/fetchStats",
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await embroideryWorkerApi.getEmbroideryWorkerStatsApi();
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch stats");
//     }
//   }
// );

// // ===== CREATE EMBROIDERY_WORKER - UPDATED WITH DEBUG LOGS =====
// export const createEmbroideryWorker = createAsyncThunk(
//   "embroideryWorker/create",
//   async (embroideryWorkerData, { rejectWithValue }) => {
//     try {
//       // DEBUG: Log the data received in thunk
//       console.log("🔵 [Redux Thunk] createEmbroideryWorker received:", {
//         ...embroideryWorkerData,
//         password: embroideryWorkerData.password ? `✅ PRESENT (${embroideryWorkerData.password.length} chars)` : "❌ MISSING",
//         passwordFirstChars: embroideryWorkerData.password ? embroideryWorkerData.password.substring(0, 3) + '...' : null
//       });

//       // CRITICAL CHECK: Verify password exists
//       if (!embroideryWorkerData.password) {
//         console.error("🔴 [Redux Thunk] CRITICAL: Password is missing in thunk!");
        
//         // Check if password might be in a different property
//         const possiblePasswordProps = ['password', 'pass', 'pwd', 'Password'];
//         const foundProps = possiblePasswordProps.filter(prop => embroideryWorkerData[prop]);
        
//         if (foundProps.length > 0) {
//           console.log("🔵 [Redux Thunk] Found password in alternative property:", foundProps[0]);
//           // Use the found password property
//           embroideryWorkerData.password = embroideryWorkerData[foundProps[0]];
//         } else {
//           return rejectWithValue({ 
//             message: "Password is required but was not provided in the request data" 
//           });
//         }
//       }

//       // Ensure all required fields are present
//       const apiData = {
//         name: embroideryWorkerData.name,
//         phone: embroideryWorkerData.phone,
//         email: embroideryWorkerData.email || undefined,
//         password: embroideryWorkerData.password, // Explicitly include password
//         experience: embroideryWorkerData.experience || 0,
//         specialization: Array.isArray(embroideryWorkerData.specialization) ? embroideryWorkerData.specialization : [],
//         address: embroideryWorkerData.address || {}
//       };

//       // DEBUG: Log the data being sent to API
//       console.log("🔵 [Redux Thunk] Sending to API:", {
//         ...apiData,
//         password: apiData.password ? `✅ PRESENT (${apiData.password.length} chars)` : "❌ MISSING",
//         passwordPreview: apiData.password ? apiData.password.substring(0, 3) + '...' : null
//       });

//       // Make the API call
//       const response = await embroideryWorkerApi.createEmbroideryWorkerApi(apiData);
      
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
//         "Failed to create embroideryWorker"
//       );
//     }
//   }
// );

// export const updateEmbroideryWorker = createAsyncThunk(
//   "embroideryWorker/update",
//   async ({ id, embroideryWorkerData }, { rejectWithValue }) => {
//     try {
//       const response = await embroideryWorkerApi.updateEmbroideryWorkerApi(id, embroideryWorkerData);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to update embroideryWorker");
//     }
//   }
// );

// export const updateLeaveStatus = createAsyncThunk(
//   "embroideryWorker/updateLeave",
//   async ({ id, leaveData }, { rejectWithValue }) => {
//     try {
//       const response = await embroideryWorkerApi.updateLeaveStatusApi(id, leaveData);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to update leave status");
//     }
//   }
// );

// // ✅ NEW: TOGGLE EMBROIDERY_WORKER STATUS (Activate/Deactivate)
// export const toggleEmbroideryWorkerStatus = createAsyncThunk(
//   "embroideryWorker/toggleStatus",
//   async (id, { rejectWithValue }) => {
//     try {
//       const response = await embroideryWorkerApi.toggleEmbroideryWorkerStatusApi(id);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to toggle status");
//     }
//   }
// );

// export const deleteEmbroideryWorker = createAsyncThunk(
//   "embroideryWorker/delete",
//   async (id, { rejectWithValue }) => {
//     try {
//       await embroideryWorkerApi.deleteEmbroideryWorkerApi(id);
//       return id;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to delete embroideryWorker");
//     }
//   }
// );

// const embroideryWorkerSlice = createSlice({
//   name: "embroideryWorker",
//   initialState: {
//     embroideryWorkers: [],
//     currentEmbroideryWorker: null,
//     works: [],
//     workStats: {},
//     embroideryWorkerStats: {},
//     workDistribution: {},
    
//     // ✅ NEW: Top embroideryWorkers for dashboard
//     topEmbroideryWorkers: [],
//     topEmbroideryWorkersSummary: {},
//     topEmbroideryWorkersLoading: false,
    
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
//     clearCurrentEmbroideryWorker: (state) => {
//       state.currentEmbroideryWorker = null;
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
    
//     // ✅ NEW: Clear top embroideryWorkers
//     clearTopEmbroideryWorkers: (state) => {
//       state.topEmbroideryWorkers = [];
//       state.topEmbroideryWorkersSummary = {};
//     }
//   },
//   extraReducers: (builder) => {
//     builder
//       // ===== FETCH ALL EMBROIDERY_WORKERS =====
//       .addCase(fetchAllEmbroideryWorkers.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchAllEmbroideryWorkers.fulfilled, (state, action) => {
//         state.loading = false;
        
//         // Handle both array and paginated responses
//         if (Array.isArray(action.payload)) {
//           state.embroideryWorkers = action.payload;
//           state.pagination.total = action.payload.length;
//           state.pagination.pages = 1;
//         } else {
//           state.embroideryWorkers = action.payload.embroideryWorkers || action.payload;
//           state.pagination = {
//             ...state.pagination,
//             ...(action.payload.pagination || {})
//           };
//         }
//       })
//       .addCase(fetchAllEmbroideryWorkers.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== FETCH EMBROIDERY_WORKER BY ID =====
//       .addCase(fetchEmbroideryWorkerById.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchEmbroideryWorkerById.fulfilled, (state, action) => {
//         state.loading = false;
//         state.currentEmbroideryWorker = action.payload.embroideryWorker;
//         state.works = action.payload.works;
//         state.workStats = action.payload.workStats;
//       })
//       .addCase(fetchEmbroideryWorkerById.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== FETCH TOP EMBROIDERY_WORKERS (NEW) =====
//       .addCase(fetchTopEmbroideryWorkers.pending, (state) => {
//         state.topEmbroideryWorkersLoading = true;
//         state.error = null;
//       })
//       .addCase(fetchTopEmbroideryWorkers.fulfilled, (state, action) => {
//         state.topEmbroideryWorkersLoading = false;
//         state.topEmbroideryWorkers = action.payload.topEmbroideryWorkers || [];
//         state.topEmbroideryWorkersSummary = action.payload.summary || {};
//       })
//       .addCase(fetchTopEmbroideryWorkers.rejected, (state, action) => {
//         state.topEmbroideryWorkersLoading = false;
//         state.error = action.payload;
//       })

//       // ===== CREATE EMBROIDERY_WORKER =====
//       .addCase(createEmbroideryWorker.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//         console.log("🟡 [Redux] createEmbroideryWorker pending");
//       })
//       .addCase(createEmbroideryWorker.fulfilled, (state, action) => {
//         state.loading = false;
//         console.log("🟢 [Redux] createEmbroideryWorker fulfilled:", action.payload);
//         state.embroideryWorkers = [action.payload.embroideryWorker, ...state.embroideryWorkers];
//         state.pagination.total += 1;
//       })
//       .addCase(createEmbroideryWorker.rejected, (state, action) => {
//         state.loading = false;
//         console.error("🔴 [Redux] createEmbroideryWorker rejected:", action.payload);
//         state.error = action.payload;
//       })

//       // ===== UPDATE EMBROIDERY_WORKER =====
//       .addCase(updateEmbroideryWorker.fulfilled, (state, action) => {
//         const updatedEmbroideryWorker = action.payload.embroideryWorker;
//         const index = state.embroideryWorkers.findIndex(t => t._id === updatedEmbroideryWorker._id);
//         if (index !== -1) {
//           state.embroideryWorkers[index] = updatedEmbroideryWorker;
//         }
//         if (state.currentEmbroideryWorker?._id === updatedEmbroideryWorker._id) {
//           state.currentEmbroideryWorker = updatedEmbroideryWorker;
//         }
//       })

//       // ===== UPDATE LEAVE STATUS =====
//       .addCase(updateLeaveStatus.fulfilled, (state, action) => {
//         const updatedEmbroideryWorker = action.payload.embroideryWorker;
//         const index = state.embroideryWorkers.findIndex(t => t._id === updatedEmbroideryWorker._id);
//         if (index !== -1) {
//           state.embroideryWorkers[index] = updatedEmbroideryWorker;
//         }
//         if (state.currentEmbroideryWorker?._id === updatedEmbroideryWorker._id) {
//           state.currentEmbroideryWorker = updatedEmbroideryWorker;
//         }
//       })

//       // ===== TOGGLE EMBROIDERY_WORKER STATUS =====
//       .addCase(toggleEmbroideryWorkerStatus.fulfilled, (state, action) => {
//         const updatedEmbroideryWorker = action.payload.embroideryWorker;
//         const index = state.embroideryWorkers.findIndex(t => t._id === updatedEmbroideryWorker._id);
//         if (index !== -1) {
//           state.embroideryWorkers[index] = updatedEmbroideryWorker;
//         }
//         if (state.currentEmbroideryWorker?._id === updatedEmbroideryWorker._id) {
//           state.currentEmbroideryWorker = updatedEmbroideryWorker;
//         }
//       })

//       // ===== DELETE EMBROIDERY_WORKER =====
//       .addCase(deleteEmbroideryWorker.fulfilled, (state, action) => {
//         state.embroideryWorkers = state.embroideryWorkers.filter(t => t._id !== action.payload);
//         state.pagination.total -= 1;
//         if (state.currentEmbroideryWorker?._id === action.payload) {
//           state.currentEmbroideryWorker = null;
//           state.works = [];
//           state.workStats = {};
//         }
//       })

//       // ===== FETCH EMBROIDERY_WORKER STATS =====
//       .addCase(fetchEmbroideryWorkerStats.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchEmbroideryWorkerStats.fulfilled, (state, action) => {
//         state.loading = false;
//         state.embroideryWorkerStats = action.payload.embroideryWorkerStats;
//         state.workDistribution = action.payload.workDistribution;
//       })
//       .addCase(fetchEmbroideryWorkerStats.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       });
//   },
// });

// export const { 
//   clearCurrentEmbroideryWorker, 
//   clearError,
//   setPage,
//   setLimit,
//   setSorting,
//   setSearchTerm,
//   setSearchFilter,
//   resetSearch,
//   clearTopEmbroideryWorkers // ✅ NEW
// } = embroideryWorkerSlice.actions;

// // ============================================
// // SELECTORS
// // ============================================

// export const selectAllEmbroideryWorkers = (state) => state.embroideryWorker.embroideryWorkers;
// export const selectCurrentEmbroideryWorker = (state) => state.embroideryWorker.currentEmbroideryWorker;
// export const selectEmbroideryWorkerWorks = (state) => state.embroideryWorker.works;
// export const selectEmbroideryWorkerWorkStats = (state) => state.embroideryWorker.workStats;
// export const selectEmbroideryWorkerStats = (state) => state.embroideryWorker.embroideryWorkerStats;
// export const selectWorkDistribution = (state) => state.embroideryWorker.workDistribution;
// export const selectEmbroideryWorkerLoading = (state) => state.embroideryWorker.loading;
// export const selectEmbroideryWorkerError = (state) => state.embroideryWorker.error;

// // ✅ NEW: Top embroideryWorkers selectors
// export const selectTopEmbroideryWorkers = (state) => state.embroideryWorker.topEmbroideryWorkers;
// export const selectTopEmbroideryWorkersSummary = (state) => state.embroideryWorker.topEmbroideryWorkersSummary;
// export const selectTopEmbroideryWorkersLoading = (state) => state.embroideryWorker.topEmbroideryWorkersLoading;

// // Pagination selectors
// export const selectEmbroideryWorkerPagination = (state) => state.embroideryWorker.pagination;
// export const selectEmbroideryWorkerSorting = (state) => state.embroideryWorker.sorting;
// export const selectEmbroideryWorkerSearch = (state) => state.embroideryWorker.search;

// export default embroideryWorkerSlice.reducer;






// // frontend/src/features/embroideryWorker/embroideryWorkerSlice.js - COMPLETE FIXED VERSION WITH DASHBOARD
// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import * as embroideryWorkerApi from "./embroideryWorkerApi";

// // ===== ASYNC THUNKS =====

// // ✅ FETCH ALL EMBROIDERY_WORKERS (with pagination & sorting)
// export const fetchAllEmbroideryWorkers = createAsyncThunk(
//   "embroideryWorker/fetchAll",
//   async (params = {}, { rejectWithValue }) => {
//     try {
//       const response = await embroideryWorkerApi.getAllEmbroideryWorkersApi(params);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch embroideryWorkers");
//     }
//   }
// );

// export const fetchEmbroideryWorkerById = createAsyncThunk(
//   "embroideryWorker/fetchById",
//   async (id, { rejectWithValue }) => {
//     try {
//       const response = await embroideryWorkerApi.getEmbroideryWorkerByIdApi(id);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch embroideryWorker");
//     }
//   }
// );

// // ✅ FETCH TOP EMBROIDERY_WORKERS for dashboard
// export const fetchTopEmbroideryWorkers = createAsyncThunk(
//   "embroideryWorker/fetchTop",
//   async ({ limit = 5, period = 'month' } = {}, { rejectWithValue }) => {
//     try {
//       console.log(`🏆 Fetching top ${limit} embroideryWorkers for period: ${period}`);
//       const response = await embroideryWorkerApi.getTopEmbroideryWorkersApi(limit, period);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch top embroideryWorkers");
//     }
//   }
// );

// // ✅ FETCH EMBROIDERY_WORKER PERFORMANCE for dashboard
// export const fetchEmbroideryWorkerPerformance = createAsyncThunk(
//   "embroideryWorker/fetchPerformance",
//   async ({ period = 'month', embroideryWorkerId } = {}, { rejectWithValue }) => {
//     try {
//       console.log(`📈 Fetching embroideryWorker performance for period: ${period}`);
//       const response = await embroideryWorkerApi.getEmbroideryWorkerPerformanceApi(period, embroideryWorkerId);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch embroideryWorker performance");
//     }
//   }
// );

// // ✅ FETCH EMBROIDERY_WORKER STATS
// export const fetchEmbroideryWorkerStats = createAsyncThunk(
//   "embroideryWorker/fetchStats",
//   async (_, { rejectWithValue }) => {
//     try {
//       console.log('📊 Fetching embroideryWorker stats');
//       const response = await embroideryWorkerApi.getEmbroideryWorkerStatsApi();
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch stats");
//     }
//   }
// );

// // ===== CREATE EMBROIDERY_WORKER - UPDATED WITH DEBUG LOGS =====
// export const createEmbroideryWorker = createAsyncThunk(
//   "embroideryWorker/create",
//   async (embroideryWorkerData, { rejectWithValue }) => {
//     try {
//       // DEBUG: Log the data received in thunk
//       console.log("🔵 [Redux Thunk] createEmbroideryWorker received:", {
//         ...embroideryWorkerData,
//         password: embroideryWorkerData.password ? `✅ PRESENT (${embroideryWorkerData.password.length} chars)` : "❌ MISSING",
//         passwordFirstChars: embroideryWorkerData.password ? embroideryWorkerData.password.substring(0, 3) + '...' : null
//       });

//       // CRITICAL CHECK: Verify password exists
//       if (!embroideryWorkerData.password) {
//         console.error("🔴 [Redux Thunk] CRITICAL: Password is missing in thunk!");
        
//         // Check if password might be in a different property
//         const possiblePasswordProps = ['password', 'pass', 'pwd', 'Password'];
//         const foundProps = possiblePasswordProps.filter(prop => embroideryWorkerData[prop]);
        
//         if (foundProps.length > 0) {
//           console.log("🔵 [Redux Thunk] Found password in alternative property:", foundProps[0]);
//           // Use the found password property
//           embroideryWorkerData.password = embroideryWorkerData[foundProps[0]];
//         } else {
//           return rejectWithValue({ 
//             message: "Password is required but was not provided in the request data" 
//           });
//         }
//       }

//       // Ensure all required fields are present
//       const apiData = {
//         name: embroideryWorkerData.name,
//         phone: embroideryWorkerData.phone,
//         email: embroideryWorkerData.email || undefined,
//         password: embroideryWorkerData.password, // Explicitly include password
//         experience: embroideryWorkerData.experience || 0,
//         specialization: Array.isArray(embroideryWorkerData.specialization) ? embroideryWorkerData.specialization : [],
//         address: embroideryWorkerData.address || {}
//       };

//       // DEBUG: Log the data being sent to API
//       console.log("🔵 [Redux Thunk] Sending to API:", {
//         ...apiData,
//         password: apiData.password ? `✅ PRESENT (${apiData.password.length} chars)` : "❌ MISSING",
//         passwordPreview: apiData.password ? apiData.password.substring(0, 3) + '...' : null
//       });

//       // Make the API call
//       const response = await embroideryWorkerApi.createEmbroideryWorkerApi(apiData);
      
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
//         "Failed to create embroideryWorker"
//       );
//     }
//   }
// );

// export const updateEmbroideryWorker = createAsyncThunk(
//   "embroideryWorker/update",
//   async ({ id, embroideryWorkerData }, { rejectWithValue }) => {
//     try {
//       const response = await embroideryWorkerApi.updateEmbroideryWorkerApi(id, embroideryWorkerData);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to update embroideryWorker");
//     }
//   }
// );

// export const updateLeaveStatus = createAsyncThunk(
//   "embroideryWorker/updateLeave",
//   async ({ id, leaveData }, { rejectWithValue }) => {
//     try {
//       const response = await embroideryWorkerApi.updateLeaveStatusApi(id, leaveData);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to update leave status");
//     }
//   }
// );

// // ✅ TOGGLE EMBROIDERY_WORKER STATUS (Activate/Deactivate)
// export const toggleEmbroideryWorkerStatus = createAsyncThunk(
//   "embroideryWorker/toggleStatus",
//   async (id, { rejectWithValue }) => {
//     try {
//       const response = await embroideryWorkerApi.toggleEmbroideryWorkerStatusApi(id);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to toggle status");
//     }
//   }
// );

// export const deleteEmbroideryWorker = createAsyncThunk(
//   "embroideryWorker/delete",
//   async (id, { rejectWithValue }) => {
//     try {
//       await embroideryWorkerApi.deleteEmbroideryWorkerApi(id);
//       return id;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to delete embroideryWorker");
//     }
//   }
// );

// const embroideryWorkerSlice = createSlice({
//   name: "embroideryWorker",
//   initialState: {
//     embroideryWorkers: [],
//     currentEmbroideryWorker: null,
//     works: [],
//     workStats: {},
//     embroideryWorkerStats: {},
//     workDistribution: {},
    
//     // ✅ Top embroideryWorkers for dashboard
//     topEmbroideryWorkers: [],
//     topEmbroideryWorkersSummary: {},
//     topEmbroideryWorkersLoading: false,
    
//     // ✅ EmbroideryWorker performance for dashboard
//     embroideryWorkerPerformance: {
//       data: [],
//       summary: {
//         totalCompleted: 0,
//         activeEmbroideryWorkers: 0,
//         avgPerEmbroideryWorker: 0
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
//     clearCurrentEmbroideryWorker: (state) => {
//       state.currentEmbroideryWorker = null;
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
    
//     // ✅ Clear top embroideryWorkers
//     clearTopEmbroideryWorkers: (state) => {
//       state.topEmbroideryWorkers = [];
//       state.topEmbroideryWorkersSummary = {};
//     },
    
//     // ✅ Clear embroideryWorker performance
//     clearEmbroideryWorkerPerformance: (state) => {
//       state.embroideryWorkerPerformance = {
//         data: [],
//         summary: {
//           totalCompleted: 0,
//           activeEmbroideryWorkers: 0,
//           avgPerEmbroideryWorker: 0
//         },
//         loading: false
//       };
//     }
//   },
//   extraReducers: (builder) => {
//     builder
//       // ===== FETCH ALL EMBROIDERY_WORKERS =====
//       .addCase(fetchAllEmbroideryWorkers.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchAllEmbroideryWorkers.fulfilled, (state, action) => {
//         state.loading = false;
        
//         // Handle both array and paginated responses
//         if (Array.isArray(action.payload)) {
//           state.embroideryWorkers = action.payload;
//           state.pagination.total = action.payload.length;
//           state.pagination.pages = 1;
//         } else {
//           state.embroideryWorkers = action.payload.embroideryWorkers || action.payload;
//           state.pagination = {
//             ...state.pagination,
//             ...(action.payload.pagination || {})
//           };
//         }
//       })
//       .addCase(fetchAllEmbroideryWorkers.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== FETCH EMBROIDERY_WORKER BY ID =====
//       .addCase(fetchEmbroideryWorkerById.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchEmbroideryWorkerById.fulfilled, (state, action) => {
//         state.loading = false;
//         state.currentEmbroideryWorker = action.payload.embroideryWorker;
//         state.works = action.payload.works;
//         state.workStats = action.payload.workStats;
//       })
//       .addCase(fetchEmbroideryWorkerById.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== FETCH TOP EMBROIDERY_WORKERS =====
//       .addCase(fetchTopEmbroideryWorkers.pending, (state) => {
//         state.topEmbroideryWorkersLoading = true;
//         state.error = null;
//       })
//       .addCase(fetchTopEmbroideryWorkers.fulfilled, (state, action) => {
//         state.topEmbroideryWorkersLoading = false;
//         state.topEmbroideryWorkers = action.payload.topEmbroideryWorkers || [];
//         state.topEmbroideryWorkersSummary = action.payload.summary || {};
//         console.log('✅ Top embroideryWorkers loaded:', state.topEmbroideryWorkers.length);
//       })
//       .addCase(fetchTopEmbroideryWorkers.rejected, (state, action) => {
//         state.topEmbroideryWorkersLoading = false;
//         state.error = action.payload;
//       })

//       // ===== FETCH EMBROIDERY_WORKER PERFORMANCE =====
//       .addCase(fetchEmbroideryWorkerPerformance.pending, (state) => {
//         state.embroideryWorkerPerformance.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchEmbroideryWorkerPerformance.fulfilled, (state, action) => {
//         state.embroideryWorkerPerformance.loading = false;
//         state.embroideryWorkerPerformance.data = action.payload.performance || [];
//         state.embroideryWorkerPerformance.summary = action.payload.summary || {
//           totalCompleted: 0,
//           activeEmbroideryWorkers: 0,
//           avgPerEmbroideryWorker: 0
//         };
//         console.log('✅ EmbroideryWorker performance loaded:', state.embroideryWorkerPerformance.data.length);
//       })
//       .addCase(fetchEmbroideryWorkerPerformance.rejected, (state, action) => {
//         state.embroideryWorkerPerformance.loading = false;
//         state.error = action.payload;
//       })

//       // ===== CREATE EMBROIDERY_WORKER =====
//       .addCase(createEmbroideryWorker.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//         console.log("🟡 [Redux] createEmbroideryWorker pending");
//       })
//       .addCase(createEmbroideryWorker.fulfilled, (state, action) => {
//         state.loading = false;
//         console.log("🟢 [Redux] createEmbroideryWorker fulfilled:", action.payload);
//         state.embroideryWorkers = [action.payload.embroideryWorker, ...state.embroideryWorkers];
//         state.pagination.total += 1;
//       })
//       .addCase(createEmbroideryWorker.rejected, (state, action) => {
//         state.loading = false;
//         console.error("🔴 [Redux] createEmbroideryWorker rejected:", action.payload);
//         state.error = action.payload;
//       })

//       // ===== UPDATE EMBROIDERY_WORKER =====
//       .addCase(updateEmbroideryWorker.fulfilled, (state, action) => {
//         const updatedEmbroideryWorker = action.payload.embroideryWorker;
//         const index = state.embroideryWorkers.findIndex(t => t._id === updatedEmbroideryWorker._id);
//         if (index !== -1) {
//           state.embroideryWorkers[index] = updatedEmbroideryWorker;
//         }
//         if (state.currentEmbroideryWorker?._id === updatedEmbroideryWorker._id) {
//           state.currentEmbroideryWorker = updatedEmbroideryWorker;
//         }
//       })

//       // ===== UPDATE LEAVE STATUS =====
//       .addCase(updateLeaveStatus.fulfilled, (state, action) => {
//         const updatedEmbroideryWorker = action.payload.embroideryWorker;
//         const index = state.embroideryWorkers.findIndex(t => t._id === updatedEmbroideryWorker._id);
//         if (index !== -1) {
//           state.embroideryWorkers[index] = updatedEmbroideryWorker;
//         }
//         if (state.currentEmbroideryWorker?._id === updatedEmbroideryWorker._id) {
//           state.currentEmbroideryWorker = updatedEmbroideryWorker;
//         }
//       })

//       // ===== TOGGLE EMBROIDERY_WORKER STATUS =====
//       .addCase(toggleEmbroideryWorkerStatus.fulfilled, (state, action) => {
//         const updatedEmbroideryWorker = action.payload.embroideryWorker;
//         const index = state.embroideryWorkers.findIndex(t => t._id === updatedEmbroideryWorker._id);
//         if (index !== -1) {
//           state.embroideryWorkers[index] = updatedEmbroideryWorker;
//         }
//         if (state.currentEmbroideryWorker?._id === updatedEmbroideryWorker._id) {
//           state.currentEmbroideryWorker = updatedEmbroideryWorker;
//         }
//       })

//       // ===== DELETE EMBROIDERY_WORKER =====
//       .addCase(deleteEmbroideryWorker.fulfilled, (state, action) => {
//         state.embroideryWorkers = state.embroideryWorkers.filter(t => t._id !== action.payload);
//         state.pagination.total -= 1;
//         if (state.currentEmbroideryWorker?._id === action.payload) {
//           state.currentEmbroideryWorker = null;
//           state.works = [];
//           state.workStats = {};
//         }
//       })

//       // ===== FETCH EMBROIDERY_WORKER STATS =====
//       .addCase(fetchEmbroideryWorkerStats.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchEmbroideryWorkerStats.fulfilled, (state, action) => {
//         state.loading = false;
//         state.embroideryWorkerStats = action.payload.embroideryWorkerStats;
//         state.workDistribution = action.payload.workDistribution;
//         console.log('✅ EmbroideryWorker stats loaded:', state.embroideryWorkerStats);
//       })
//       .addCase(fetchEmbroideryWorkerStats.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       });
//   },
// });

// export const { 
//   clearCurrentEmbroideryWorker, 
//   clearError,
//   setPage,
//   setLimit,
//   setSorting,
//   setSearchTerm,
//   setSearchFilter,
//   resetSearch,
//   clearTopEmbroideryWorkers,
//   clearEmbroideryWorkerPerformance // ✅ NEW
// } = embroideryWorkerSlice.actions;

// // ============================================
// // SELECTORS
// // ============================================

// export const selectAllEmbroideryWorkers = (state) => state.embroideryWorker.embroideryWorkers;
// export const selectCurrentEmbroideryWorker = (state) => state.embroideryWorker.currentEmbroideryWorker;
// export const selectEmbroideryWorkerWorks = (state) => state.embroideryWorker.works;
// export const selectEmbroideryWorkerWorkStats = (state) => state.embroideryWorker.workStats;
// export const selectEmbroideryWorkerStats = (state) => state.embroideryWorker.embroideryWorkerStats;
// export const selectWorkDistribution = (state) => state.embroideryWorker.workDistribution;
// export const selectEmbroideryWorkerLoading = (state) => state.embroideryWorker.loading;
// export const selectEmbroideryWorkerError = (state) => state.embroideryWorker.error;

// // ✅ Top embroideryWorkers selectors
// export const selectTopEmbroideryWorkers = (state) => state.embroideryWorker.topEmbroideryWorkers;
// export const selectTopEmbroideryWorkersSummary = (state) => state.embroideryWorker.topEmbroideryWorkersSummary;
// export const selectTopEmbroideryWorkersLoading = (state) => state.embroideryWorker.topEmbroideryWorkersLoading;

// // ✅ EmbroideryWorker performance selectors
// export const selectEmbroideryWorkerPerformance = (state) => state.embroideryWorker.embroideryWorkerPerformance.data;
// export const selectEmbroideryWorkerPerformanceSummary = (state) => state.embroideryWorker.embroideryWorkerPerformance.summary;
// export const selectEmbroideryWorkerPerformanceLoading = (state) => state.embroideryWorker.embroideryWorkerPerformance.loading;

// // Pagination selectors
// export const selectEmbroideryWorkerPagination = (state) => state.embroideryWorker.pagination;
// export const selectEmbroideryWorkerSorting = (state) => state.embroideryWorker.sorting;
// export const selectEmbroideryWorkerSearch = (state) => state.embroideryWorker.search;

// export default embroideryWorkerSlice.reducer;










// frontend/src/features/embroideryWorker/embroideryWorkerSlice.js - WITH COMPREHENSIVE DEBUGGING
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as embroideryWorkerApi from "./embroideryWorkerApi";

// ===== ASYNC THUNKS =====

// ✅ FETCH ALL EMBROIDERY_WORKERS (with pagination & sorting)
export const fetchAllEmbroideryWorkers = createAsyncThunk(
  "embroideryWorker/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      console.log('🔵 [fetchAllEmbroideryWorkers] Request with params:', params);
      const response = await embroideryWorkerApi.getAllEmbroideryWorkersApi(params);
      console.log('🔵 [fetchAllEmbroideryWorkers] Response:', response);
      return response;
    } catch (error) {
      console.error('🔴 [fetchAllEmbroideryWorkers] Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      return rejectWithValue(error.response?.data?.message || "Failed to fetch embroideryWorkers");
    }
  }
);

export const fetchEmbroideryWorkerById = createAsyncThunk(
  "embroideryWorker/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      console.log('🔵 [fetchEmbroideryWorkerById] Request for ID:', id);
      const response = await embroideryWorkerApi.getEmbroideryWorkerByIdApi(id);
      console.log('🔵 [fetchEmbroideryWorkerById] Response:', response);
      return response;
    } catch (error) {
      console.error('🔴 [fetchEmbroideryWorkerById] Error:', error);
      return rejectWithValue(error.response?.data?.message || "Failed to fetch embroideryWorker");
    }
  }
);

// ✅ FETCH TOP EMBROIDERY_WORKERS for dashboard
export const fetchTopEmbroideryWorkers = createAsyncThunk(
  "embroideryWorker/fetchTop",
  async ({ limit = 5, period = 'month' } = {}, { rejectWithValue }) => {
    try {
      console.log(`🏆 [fetchTopEmbroideryWorkers] Fetching top ${limit} embroideryWorkers for period: ${period}`);
      const response = await embroideryWorkerApi.getTopEmbroideryWorkersApi(limit, period);
      console.log('🏆 [fetchTopEmbroideryWorkers] Full Response:', response);
      console.log('🏆 [fetchTopEmbroideryWorkers] Top embroideryWorkers data:', response.topEmbroideryWorkers);
      console.log('🏆 [fetchTopEmbroideryWorkers] Summary:', response.summary);
      return response;
    } catch (error) {
      console.error('🔴 [fetchTopEmbroideryWorkers] Error:', error);
      return rejectWithValue(error.response?.data?.message || "Failed to fetch top embroideryWorkers");
    }
  }
);

// ✅ FETCH EMBROIDERY_WORKER PERFORMANCE for dashboard
export const fetchEmbroideryWorkerPerformance = createAsyncThunk(
  "embroideryWorker/fetchPerformance",
  async ({ period = 'month', embroideryWorkerId } = {}, { rejectWithValue }) => {
    try {
      console.log(`📈 [fetchEmbroideryWorkerPerformance] Fetching embroideryWorker performance for period: ${period}`, embroideryWorkerId ? `embroideryWorkerId: ${embroideryWorkerId}` : 'all embroideryWorkers');
      const response = await embroideryWorkerApi.getEmbroideryWorkerPerformanceApi(period, embroideryWorkerId);
      console.log('📈 [fetchEmbroideryWorkerPerformance] Full Response:', response);
      console.log('📈 [fetchEmbroideryWorkerPerformance] Performance data:', response.performance);
      console.log('📈 [fetchEmbroideryWorkerPerformance] Summary:', response.summary);
      return response;
    } catch (error) {
      console.error('🔴 [fetchEmbroideryWorkerPerformance] Error:', error);
      return rejectWithValue(error.response?.data?.message || "Failed to fetch embroideryWorker performance");
    }
  }
);

// ✅ FETCH EMBROIDERY_WORKER STATS
export const fetchEmbroideryWorkerStats = createAsyncThunk(
  "embroideryWorker/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      console.log('📊 [fetchEmbroideryWorkerStats] Fetching embroideryWorker stats');
      const response = await embroideryWorkerApi.getEmbroideryWorkerStatsApi();
      console.log('📊 [fetchEmbroideryWorkerStats] Full Response:', response);
      console.log('📊 [fetchEmbroideryWorkerStats] EmbroideryWorker Stats:', response.embroideryWorkerStats);
      console.log('📊 [fetchEmbroideryWorkerStats] Work Distribution:', response.workDistribution);
      return response;
    } catch (error) {
      console.error('🔴 [fetchEmbroideryWorkerStats] Error:', error);
      return rejectWithValue(error.response?.data?.message || "Failed to fetch stats");
    }
  }
);

// ===== CREATE EMBROIDERY_WORKER - UPDATED WITH DEBUG LOGS =====
export const createEmbroideryWorker = createAsyncThunk(
  "embroideryWorker/create",
  async (embroideryWorkerData, { rejectWithValue }) => {
    try {
      // DEBUG: Log the data received in thunk
      console.log("🔵 [createEmbroideryWorker] Received:", {
        ...embroideryWorkerData,
        password: embroideryWorkerData.password ? `✅ PRESENT (${embroideryWorkerData.password.length} chars)` : "❌ MISSING",
        passwordFirstChars: embroideryWorkerData.password ? embroideryWorkerData.password.substring(0, 3) + '...' : null
      });

      // CRITICAL CHECK: Verify password exists
      if (!embroideryWorkerData.password) {
        console.error("🔴 [createEmbroideryWorker] CRITICAL: Password is missing!");
        
        // Check if password might be in a different property
        const possiblePasswordProps = ['password', 'pass', 'pwd', 'Password'];
        const foundProps = possiblePasswordProps.filter(prop => embroideryWorkerData[prop]);
        
        if (foundProps.length > 0) {
          console.log("🔵 [createEmbroideryWorker] Found password in alternative property:", foundProps[0]);
          embroideryWorkerData.password = embroideryWorkerData[foundProps[0]];
        } else {
          return rejectWithValue({ 
            message: "Password is required but was not provided in the request data" 
          });
        }
      }

      // Ensure all required fields are present
      const apiData = {
        name: embroideryWorkerData.name,
        phone: embroideryWorkerData.phone,
        email: embroideryWorkerData.email || undefined,
        password: embroideryWorkerData.password,
        experience: embroideryWorkerData.experience || 0,
        specialization: Array.isArray(embroideryWorkerData.specialization) ? embroideryWorkerData.specialization : [],
        address: embroideryWorkerData.address || {}
      };

      console.log("🔵 [createEmbroideryWorker] Sending to API:", {
        ...apiData,
        password: apiData.password ? `✅ PRESENT (${apiData.password.length} chars)` : "❌ MISSING"
      });

      const response = await embroideryWorkerApi.createEmbroideryWorkerApi(apiData);
      console.log("🔵 [createEmbroideryWorker] API Response:", response);
      return response;
    } catch (error) {
      console.error("🔴 [createEmbroideryWorker] Error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        "Failed to create embroideryWorker"
      );
    }
  }
);

export const updateEmbroideryWorker = createAsyncThunk(
  "embroideryWorker/update",
  async ({ id, embroideryWorkerData }, { rejectWithValue }) => {
    try {
      console.log('🔵 [updateEmbroideryWorker] Updating embroideryWorker:', id, embroideryWorkerData);
      const response = await embroideryWorkerApi.updateEmbroideryWorkerApi(id, embroideryWorkerData);
      console.log('🔵 [updateEmbroideryWorker] Response:', response);
      return response;
    } catch (error) {
      console.error('🔴 [updateEmbroideryWorker] Error:', error);
      return rejectWithValue(error.response?.data?.message || "Failed to update embroideryWorker");
    }
  }
);

export const updateLeaveStatus = createAsyncThunk(
  "embroideryWorker/updateLeave",
  async ({ id, leaveData }, { rejectWithValue }) => {
    try {
      console.log('🔵 [updateLeaveStatus] Updating leave for embroideryWorker:', id, leaveData);
      const response = await embroideryWorkerApi.updateLeaveStatusApi(id, leaveData);
      console.log('🔵 [updateLeaveStatus] Response:', response);
      return response;
    } catch (error) {
      console.error('🔴 [updateLeaveStatus] Error:', error);
      return rejectWithValue(error.response?.data?.message || "Failed to update leave status");
    }
  }
);

// ✅ TOGGLE EMBROIDERY_WORKER STATUS (Activate/Deactivate)
export const toggleEmbroideryWorkerStatus = createAsyncThunk(
  "embroideryWorker/toggleStatus",
  async (id, { rejectWithValue }) => {
    try {
      console.log('🔵 [toggleEmbroideryWorkerStatus] Toggling status for embroideryWorker:', id);
      const response = await embroideryWorkerApi.toggleEmbroideryWorkerStatusApi(id);
      console.log('🔵 [toggleEmbroideryWorkerStatus] Response:', response);
      return response;
    } catch (error) {
      console.error('🔴 [toggleEmbroideryWorkerStatus] Error:', error);
      return rejectWithValue(error.response?.data?.message || "Failed to toggle status");
    }
  }
);

export const deleteEmbroideryWorker = createAsyncThunk(
  "embroideryWorker/delete",
  async (id, { rejectWithValue }) => {
    try {
      console.log('🔵 [deleteEmbroideryWorker] Deleting embroideryWorker:', id);
      await embroideryWorkerApi.deleteEmbroideryWorkerApi(id);
      console.log('🔵 [deleteEmbroideryWorker] Deleted successfully:', id);
      return id;
    } catch (error) {
      console.error('🔴 [deleteEmbroideryWorker] Error:', error);
      return rejectWithValue(error.response?.data?.message || "Failed to delete embroideryWorker");
    }
  }
);

const embroideryWorkerSlice = createSlice({
  name: "embroideryWorker",
  initialState: {
    embroideryWorkers: [],
    currentEmbroideryWorker: null,
    works: [],
    workStats: {},
    embroideryWorkerStats: {},
    workDistribution: {},
    
    // ✅ Top embroideryWorkers for dashboard
    topEmbroideryWorkers: [],
    topEmbroideryWorkersSummary: {},
    topEmbroideryWorkersLoading: false,
    
    // ✅ EmbroideryWorker performance for dashboard
    embroideryWorkerPerformance: {
      data: [],
      summary: {
        totalCompleted: 0,
        activeEmbroideryWorkers: 0,
        avgPerEmbroideryWorker: 0
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
    clearCurrentEmbroideryWorker: (state) => {
      state.currentEmbroideryWorker = null;
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
    
    clearTopEmbroideryWorkers: (state) => {
      state.topEmbroideryWorkers = [];
      state.topEmbroideryWorkersSummary = {};
    },
    
    clearEmbroideryWorkerPerformance: (state) => {
      state.embroideryWorkerPerformance = {
        data: [],
        summary: {
          totalCompleted: 0,
          activeEmbroideryWorkers: 0,
          avgPerEmbroideryWorker: 0
        },
        loading: false
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // ===== FETCH ALL EMBROIDERY_WORKERS =====
      .addCase(fetchAllEmbroideryWorkers.pending, (state) => {
        console.log('🟡 [Reducer] fetchAllEmbroideryWorkers pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllEmbroideryWorkers.fulfilled, (state, action) => {
        console.log('🟢 [Reducer] fetchAllEmbroideryWorkers fulfilled:', action.payload);
        state.loading = false;
        
        if (Array.isArray(action.payload)) {
          state.embroideryWorkers = action.payload;
          state.pagination.total = action.payload.length;
          state.pagination.pages = 1;
        } else {
          state.embroideryWorkers = action.payload.embroideryWorkers || action.payload;
          state.pagination = {
            ...state.pagination,
            ...(action.payload.pagination || {})
          };
        }
        console.log('🟢 [Reducer] EmbroideryWorkers loaded:', state.embroideryWorkers.length);
      })
      .addCase(fetchAllEmbroideryWorkers.rejected, (state, action) => {
        console.error('🔴 [Reducer] fetchAllEmbroideryWorkers rejected:', action.payload);
        state.loading = false;
        state.error = action.payload;
      })

      // ===== FETCH EMBROIDERY_WORKER BY ID =====
      .addCase(fetchEmbroideryWorkerById.pending, (state) => {
        console.log('🟡 [Reducer] fetchEmbroideryWorkerById pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmbroideryWorkerById.fulfilled, (state, action) => {
        console.log('🟢 [Reducer] fetchEmbroideryWorkerById fulfilled:', action.payload);
        state.loading = false;
        state.currentEmbroideryWorker = action.payload.embroideryWorker;
        state.works = action.payload.works;
        state.workStats = action.payload.workStats;
      })
      .addCase(fetchEmbroideryWorkerById.rejected, (state, action) => {
        console.error('🔴 [Reducer] fetchEmbroideryWorkerById rejected:', action.payload);
        state.loading = false;
        state.error = action.payload;
      })

      // ===== FETCH TOP EMBROIDERY_WORKERS =====
      .addCase(fetchTopEmbroideryWorkers.pending, (state) => {
        console.log('🟡 [Reducer] fetchTopEmbroideryWorkers pending');
        state.topEmbroideryWorkersLoading = true;
        state.error = null;
      })
      .addCase(fetchTopEmbroideryWorkers.fulfilled, (state, action) => {
        console.log('🟢 [Reducer] fetchTopEmbroideryWorkers fulfilled:', action.payload);
        state.topEmbroideryWorkersLoading = false;
        state.topEmbroideryWorkers = action.payload.topEmbroideryWorkers || [];
        state.topEmbroideryWorkersSummary = action.payload.summary || {};
        console.log('🟢 [Reducer] Top embroideryWorkers loaded:', state.topEmbroideryWorkers.length);
        console.log('🟢 [Reducer] Top embroideryWorkers data:', state.topEmbroideryWorkers);
      })
      .addCase(fetchTopEmbroideryWorkers.rejected, (state, action) => {
        console.error('🔴 [Reducer] fetchTopEmbroideryWorkers rejected:', action.payload);
        state.topEmbroideryWorkersLoading = false;
        state.error = action.payload;
      })

      // ===== FETCH EMBROIDERY_WORKER PERFORMANCE =====
      .addCase(fetchEmbroideryWorkerPerformance.pending, (state) => {
        console.log('🟡 [Reducer] fetchEmbroideryWorkerPerformance pending');
        state.embroideryWorkerPerformance.loading = true;
        state.error = null;
      })
      .addCase(fetchEmbroideryWorkerPerformance.fulfilled, (state, action) => {
        console.log('🟢 [Reducer] fetchEmbroideryWorkerPerformance fulfilled:', action.payload);
        state.embroideryWorkerPerformance.loading = false;
        state.embroideryWorkerPerformance.data = action.payload.performance || [];
        state.embroideryWorkerPerformance.summary = action.payload.summary || {
          totalCompleted: 0,
          activeEmbroideryWorkers: 0,
          avgPerEmbroideryWorker: 0
        };
        console.log('🟢 [Reducer] Performance data loaded:', state.embroideryWorkerPerformance.data.length);
        console.log('🟢 [Reducer] Performance data:', state.embroideryWorkerPerformance.data);
        console.log('🟢 [Reducer] Performance summary:', state.embroideryWorkerPerformance.summary);
      })
      .addCase(fetchEmbroideryWorkerPerformance.rejected, (state, action) => {
        console.error('🔴 [Reducer] fetchEmbroideryWorkerPerformance rejected:', action.payload);
        state.embroideryWorkerPerformance.loading = false;
        state.error = action.payload;
      })

      // ===== CREATE EMBROIDERY_WORKER =====
      .addCase(createEmbroideryWorker.pending, (state) => {
        console.log("🟡 [Reducer] createEmbroideryWorker pending");
        state.loading = true;
        state.error = null;
      })
      .addCase(createEmbroideryWorker.fulfilled, (state, action) => {
        console.log("🟢 [Reducer] createEmbroideryWorker fulfilled:", action.payload);
        state.loading = false;
        state.embroideryWorkers = [action.payload.embroideryWorker, ...state.embroideryWorkers];
        state.pagination.total += 1;
      })
      .addCase(createEmbroideryWorker.rejected, (state, action) => {
        console.error("🔴 [Reducer] createEmbroideryWorker rejected:", action.payload);
        state.loading = false;
        state.error = action.payload;
      })

      // ===== UPDATE EMBROIDERY_WORKER =====
      .addCase(updateEmbroideryWorker.fulfilled, (state, action) => {
        console.log('🟢 [Reducer] updateEmbroideryWorker fulfilled:', action.payload);
        const updatedEmbroideryWorker = action.payload.embroideryWorker;
        const index = state.embroideryWorkers.findIndex(t => t._id === updatedEmbroideryWorker._id);
        if (index !== -1) {
          state.embroideryWorkers[index] = updatedEmbroideryWorker;
        }
        if (state.currentEmbroideryWorker?._id === updatedEmbroideryWorker._id) {
          state.currentEmbroideryWorker = updatedEmbroideryWorker;
        }
      })

      // ===== UPDATE LEAVE STATUS =====
      .addCase(updateLeaveStatus.fulfilled, (state, action) => {
        console.log('🟢 [Reducer] updateLeaveStatus fulfilled:', action.payload);
        const updatedEmbroideryWorker = action.payload.embroideryWorker;
        const index = state.embroideryWorkers.findIndex(t => t._id === updatedEmbroideryWorker._id);
        if (index !== -1) {
          state.embroideryWorkers[index] = updatedEmbroideryWorker;
        }
        if (state.currentEmbroideryWorker?._id === updatedEmbroideryWorker._id) {
          state.currentEmbroideryWorker = updatedEmbroideryWorker;
        }
      })

      // ===== TOGGLE EMBROIDERY_WORKER STATUS =====
      .addCase(toggleEmbroideryWorkerStatus.fulfilled, (state, action) => {
        console.log('🟢 [Reducer] toggleEmbroideryWorkerStatus fulfilled:', action.payload);
        const updatedEmbroideryWorker = action.payload.embroideryWorker;
        const index = state.embroideryWorkers.findIndex(t => t._id === updatedEmbroideryWorker._id);
        if (index !== -1) {
          state.embroideryWorkers[index] = updatedEmbroideryWorker;
        }
        if (state.currentEmbroideryWorker?._id === updatedEmbroideryWorker._id) {
          state.currentEmbroideryWorker = updatedEmbroideryWorker;
        }
      })

      // ===== DELETE EMBROIDERY_WORKER =====
      .addCase(deleteEmbroideryWorker.fulfilled, (state, action) => {
        console.log('🟢 [Reducer] deleteEmbroideryWorker fulfilled:', action.payload);
        state.embroideryWorkers = state.embroideryWorkers.filter(t => t._id !== action.payload);
        state.pagination.total -= 1;
        if (state.currentEmbroideryWorker?._id === action.payload) {
          state.currentEmbroideryWorker = null;
          state.works = [];
          state.workStats = {};
        }
      })

      // ===== FETCH EMBROIDERY_WORKER STATS =====
      .addCase(fetchEmbroideryWorkerStats.pending, (state) => {
        console.log('🟡 [Reducer] fetchEmbroideryWorkerStats pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmbroideryWorkerStats.fulfilled, (state, action) => {
        console.log('🟢 [Reducer] fetchEmbroideryWorkerStats fulfilled:', action.payload);
        state.loading = false;
        state.embroideryWorkerStats = action.payload.embroideryWorkerStats;
        state.workDistribution = action.payload.workDistribution;
        console.log('🟢 [Reducer] EmbroideryWorker stats loaded:', state.embroideryWorkerStats);
      })
      .addCase(fetchEmbroideryWorkerStats.rejected, (state, action) => {
        console.error('🔴 [Reducer] fetchEmbroideryWorkerStats rejected:', action.payload);
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  clearCurrentEmbroideryWorker, 
  clearError,
  setPage,
  setLimit,
  setSorting,
  setSearchTerm,
  setSearchFilter,
  resetSearch,
  clearTopEmbroideryWorkers,
  clearEmbroideryWorkerPerformance
} = embroideryWorkerSlice.actions;

// ============================================
// SELECTORS
// ============================================

export const selectAllEmbroideryWorkers = (state) => {
  console.log('🔍 [Selector] selectAllEmbroideryWorkers:', state.embroideryWorker?.embroideryWorkers?.length);
  return state.embroideryWorker.embroideryWorkers;
};

export const selectCurrentEmbroideryWorker = (state) => {
  console.log('🔍 [Selector] selectCurrentEmbroideryWorker:', state.embroideryWorker.currentEmbroideryWorker?._id);
  return state.embroideryWorker.currentEmbroideryWorker;
};

export const selectEmbroideryWorkerWorks = (state) => {
  console.log('🔍 [Selector] selectEmbroideryWorkerWorks:', state.embroideryWorker.works?.length);
  return state.embroideryWorker.works;
};

export const selectEmbroideryWorkerWorkStats = (state) => {
  console.log('🔍 [Selector] selectEmbroideryWorkerWorkStats:', state.embroideryWorker.workStats);
  return state.embroideryWorker.workStats;
};

export const selectEmbroideryWorkerStats = (state) => {
  console.log('🔍 [Selector] selectEmbroideryWorkerStats:', state.embroideryWorker.embroideryWorkerStats);
  return state.embroideryWorker.embroideryWorkerStats;
};

export const selectWorkDistribution = (state) => {
  console.log('🔍 [Selector] selectWorkDistribution:', state.embroideryWorker.workDistribution);
  return state.embroideryWorker.workDistribution;
};

export const selectEmbroideryWorkerLoading = (state) => {
  console.log('🔍 [Selector] selectEmbroideryWorkerLoading:', state.embroideryWorker.loading);
  return state.embroideryWorker.loading;
};

export const selectEmbroideryWorkerError = (state) => {
  console.log('🔍 [Selector] selectEmbroideryWorkerError:', state.embroideryWorker.error);
  return state.embroideryWorker.error;
};

// ✅ Top embroideryWorkers selectors
export const selectTopEmbroideryWorkers = (state) => {
  console.log('🔍 [Selector] selectTopEmbroideryWorkers:', state.embroideryWorker.topEmbroideryWorkers?.length);
  return state.embroideryWorker.topEmbroideryWorkers;
};

export const selectTopEmbroideryWorkersSummary = (state) => {
  console.log('🔍 [Selector] selectTopEmbroideryWorkersSummary:', state.embroideryWorker.topEmbroideryWorkersSummary);
  return state.embroideryWorker.topEmbroideryWorkersSummary;
};

export const selectTopEmbroideryWorkersLoading = (state) => {
  console.log('🔍 [Selector] selectTopEmbroideryWorkersLoading:', state.embroideryWorker.topEmbroideryWorkersLoading);
  return state.embroideryWorker.topEmbroideryWorkersLoading;
};

// ✅ EmbroideryWorker performance selectors
export const selectEmbroideryWorkerPerformance = (state) => {
  console.log('🔍 [Selector] selectEmbroideryWorkerPerformance:', state.embroideryWorker.embroideryWorkerPerformance?.data?.length);
  return state.embroideryWorker.embroideryWorkerPerformance?.data || [];
};

export const selectEmbroideryWorkerPerformanceSummary = (state) => {
  console.log('🔍 [Selector] selectEmbroideryWorkerPerformanceSummary:', state.embroideryWorker.embroideryWorkerPerformance?.summary);
  return state.embroideryWorker.embroideryWorkerPerformance?.summary || {
    totalCompleted: 0,
    activeEmbroideryWorkers: 0,
    avgPerEmbroideryWorker: 0
  };
};

export const selectEmbroideryWorkerPerformanceLoading = (state) => {
  console.log('🔍 [Selector] selectEmbroideryWorkerPerformanceLoading:', state.embroideryWorker.embroideryWorkerPerformance?.loading);
  return state.embroideryWorker.embroideryWorkerPerformance?.loading || false;
};

// Pagination selectors
export const selectEmbroideryWorkerPagination = (state) => {
  return state.embroideryWorker.pagination;
};

export const selectEmbroideryWorkerSorting = (state) => {
  return state.embroideryWorker.sorting;
};

export const selectEmbroideryWorkerSearch = (state) => {
  return state.embroideryWorker.search;
};

export default embroideryWorkerSlice.reducer;