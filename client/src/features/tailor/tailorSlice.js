// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import * as tailorApi from "./tailorApi";

// // ===== ASYNC THUNKS =====

// // ✅ FETCH ALL TAILORS (with pagination & sorting)
// export const fetchAllTailors = createAsyncThunk(
//   "tailor/fetchAll",
//   async (params = {}, { rejectWithValue }) => {
//     try {
//       const response = await tailorApi.getAllTailorsApi(params);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch tailors");
//     }
//   }
// );

// export const fetchTailorById = createAsyncThunk(
//   "tailor/fetchById",
//   async (id, { rejectWithValue }) => {
//     try {
//       const response = await tailorApi.getTailorByIdApi(id);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch tailor");
//     }
//   }
// );

// // ===== CREATE TAILOR - UPDATED WITH DEBUG LOGS =====
// export const createTailor = createAsyncThunk(
//   "tailor/create",
//   async (tailorData, { rejectWithValue }) => {
//     try {
//       // DEBUG: Log the data received in thunk
//       console.log("🔵 [Redux Thunk] createTailor received:", {
//         ...tailorData,
//         password: tailorData.password ? `✅ PRESENT (${tailorData.password.length} chars)` : "❌ MISSING",
//         passwordFirstChars: tailorData.password ? tailorData.password.substring(0, 3) + '...' : null
//       });

//       // CRITICAL CHECK: Verify password exists
//       if (!tailorData.password) {
//         console.error("🔴 [Redux Thunk] CRITICAL: Password is missing in thunk!");
        
//         // Check if password might be in a different property
//         const possiblePasswordProps = ['password', 'pass', 'pwd', 'Password'];
//         const foundProps = possiblePasswordProps.filter(prop => tailorData[prop]);
        
//         if (foundProps.length > 0) {
//           console.log("🔵 [Redux Thunk] Found password in alternative property:", foundProps[0]);
//           // Use the found password property
//           tailorData.password = tailorData[foundProps[0]];
//         } else {
//           return rejectWithValue({ 
//             message: "Password is required but was not provided in the request data" 
//           });
//         }
//       }

//       // Ensure all required fields are present
//       const apiData = {
//         name: tailorData.name,
//         phone: tailorData.phone,
//         email: tailorData.email || undefined,
//         password: tailorData.password, // Explicitly include password
//         experience: tailorData.experience || 0,
//         specialization: Array.isArray(tailorData.specialization) ? tailorData.specialization : [],
//         address: tailorData.address || {}
//       };

//       // DEBUG: Log the data being sent to API
//       console.log("🔵 [Redux Thunk] Sending to API:", {
//         ...apiData,
//         password: apiData.password ? `✅ PRESENT (${apiData.password.length} chars)` : "❌ MISSING",
//         passwordPreview: apiData.password ? apiData.password.substring(0, 3) + '...' : null
//       });

//       // Make the API call
//       const response = await tailorApi.createTailorApi(apiData);
      
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
//         "Failed to create tailor"
//       );
//     }
//   }
// );

// export const updateTailor = createAsyncThunk(
//   "tailor/update",
//   async ({ id, tailorData }, { rejectWithValue }) => {
//     try {
//       const response = await tailorApi.updateTailorApi(id, tailorData);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to update tailor");
//     }
//   }
// );

// export const updateLeaveStatus = createAsyncThunk(
//   "tailor/updateLeave",
//   async ({ id, leaveData }, { rejectWithValue }) => {
//     try {
//       const response = await tailorApi.updateLeaveStatusApi(id, leaveData);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to update leave status");
//     }
//   }
// );

// // ✅ NEW: TOGGLE TAILOR STATUS (Activate/Deactivate)
// export const toggleTailorStatus = createAsyncThunk(
//   "tailor/toggleStatus",
//   async (id, { rejectWithValue }) => {
//     try {
//       const response = await tailorApi.toggleTailorStatusApi(id);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to toggle status");
//     }
//   }
// );

// export const deleteTailor = createAsyncThunk(
//   "tailor/delete",
//   async (id, { rejectWithValue }) => {
//     try {
//       await tailorApi.deleteTailorApi(id);
//       return id;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to delete tailor");
//     }
//   }
// );

// export const fetchTailorStats = createAsyncThunk(
//   "tailor/fetchStats",
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await tailorApi.getTailorStatsApi();
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch stats");
//     }
//   }
// );

// const tailorSlice = createSlice({
//   name: "tailor",
//   initialState: {
//     tailors: [],
//     currentTailor: null,
//     works: [],
//     workStats: {},
//     tailorStats: {},
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
//     clearCurrentTailor: (state) => {
//       state.currentTailor = null;
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
//       // ===== FETCH ALL TAILORS =====
//       .addCase(fetchAllTailors.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchAllTailors.fulfilled, (state, action) => {
//         state.loading = false;
        
//         // ✅ Handle both array and paginated responses
//         if (Array.isArray(action.payload)) {
//           state.tailors = action.payload;
//           state.pagination.total = action.payload.length;
//           state.pagination.pages = 1;
//         } else {
//           state.tailors = action.payload.tailors || action.payload;
//           state.pagination = {
//             ...state.pagination,
//             ...(action.payload.pagination || {})
//           };
//         }
//       })
//       .addCase(fetchAllTailors.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== FETCH TAILOR BY ID =====
//       .addCase(fetchTailorById.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchTailorById.fulfilled, (state, action) => {
//         state.loading = false;
//         state.currentTailor = action.payload.tailor;
//         state.works = action.payload.works;
//         state.workStats = action.payload.workStats;
//       })
//       .addCase(fetchTailorById.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== CREATE TAILOR =====
//       .addCase(createTailor.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//         console.log("🟡 [Redux] createTailor pending");
//       })
//       .addCase(createTailor.fulfilled, (state, action) => {
//         state.loading = false;
//         console.log("🟢 [Redux] createTailor fulfilled:", action.payload);
//         state.tailors = [action.payload.tailor, ...state.tailors];
//         state.pagination.total += 1;
//       })
//       .addCase(createTailor.rejected, (state, action) => {
//         state.loading = false;
//         console.error("🔴 [Redux] createTailor rejected:", action.payload);
//         state.error = action.payload;
//       })

//       // ===== UPDATE TAILOR =====
//       .addCase(updateTailor.fulfilled, (state, action) => {
//         const updatedTailor = action.payload.tailor;
//         const index = state.tailors.findIndex(t => t._id === updatedTailor._id);
//         if (index !== -1) {
//           state.tailors[index] = updatedTailor;
//         }
//         if (state.currentTailor?._id === updatedTailor._id) {
//           state.currentTailor = updatedTailor;
//         }
//       })

//       // ===== UPDATE LEAVE STATUS =====
//       .addCase(updateLeaveStatus.fulfilled, (state, action) => {
//         const updatedTailor = action.payload.tailor;
//         const index = state.tailors.findIndex(t => t._id === updatedTailor._id);
//         if (index !== -1) {
//           state.tailors[index] = updatedTailor;
//         }
//         if (state.currentTailor?._id === updatedTailor._id) {
//           state.currentTailor = updatedTailor;
//         }
//       })

//       // ===== TOGGLE TAILOR STATUS =====
//       .addCase(toggleTailorStatus.fulfilled, (state, action) => {
//         const updatedTailor = action.payload.tailor;
//         const index = state.tailors.findIndex(t => t._id === updatedTailor._id);
//         if (index !== -1) {
//           state.tailors[index] = updatedTailor;
//         }
//         if (state.currentTailor?._id === updatedTailor._id) {
//           state.currentTailor = updatedTailor;
//         }
//       })

//       // ===== DELETE TAILOR =====
//       .addCase(deleteTailor.fulfilled, (state, action) => {
//         state.tailors = state.tailors.filter(t => t._id !== action.payload);
//         state.pagination.total -= 1;
//         if (state.currentTailor?._id === action.payload) {
//           state.currentTailor = null;
//           state.works = [];
//           state.workStats = {};
//         }
//       })

//       // ===== FETCH TAILOR STATS =====
//       .addCase(fetchTailorStats.fulfilled, (state, action) => {
//         state.tailorStats = action.payload.tailorStats;
//         state.workDistribution = action.payload.workDistribution;
//       });
//   },
// });

// export const { 
//   clearCurrentTailor, 
//   clearError,
//   setPage,
//   setLimit,
//   setSorting,
//   setSearchTerm,
//   setSearchFilter,
//   resetSearch
// } = tailorSlice.actions;

// export default tailorSlice.reducer;








// // frontend/src/features/tailor/tailorSlice.js - COMPLETE FIXED VERSION
// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import * as tailorApi from "./tailorApi";

// // ===== ASYNC THUNKS =====

// // ✅ FETCH ALL TAILORS (with pagination & sorting)
// export const fetchAllTailors = createAsyncThunk(
//   "tailor/fetchAll",
//   async (params = {}, { rejectWithValue }) => {
//     try {
//       const response = await tailorApi.getAllTailorsApi(params);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch tailors");
//     }
//   }
// );

// export const fetchTailorById = createAsyncThunk(
//   "tailor/fetchById",
//   async (id, { rejectWithValue }) => {
//     try {
//       const response = await tailorApi.getTailorByIdApi(id);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch tailor");
//     }
//   }
// );

// // ✅ NEW: FETCH TOP TAILORS for dashboard
// export const fetchTopTailors = createAsyncThunk(
//   "tailor/fetchTop",
//   async ({ limit = 5 } = {}, { rejectWithValue }) => {
//     try {
//       const response = await tailorApi.getTopTailorsApi(limit);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch top tailors");
//     }
//   }
// );

// // ✅ FETCH TAILOR STATS
// export const fetchTailorStats = createAsyncThunk(
//   "tailor/fetchStats",
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await tailorApi.getTailorStatsApi();
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch stats");
//     }
//   }
// );

// // ===== CREATE TAILOR - UPDATED WITH DEBUG LOGS =====
// export const createTailor = createAsyncThunk(
//   "tailor/create",
//   async (tailorData, { rejectWithValue }) => {
//     try {
//       // DEBUG: Log the data received in thunk
//       console.log("🔵 [Redux Thunk] createTailor received:", {
//         ...tailorData,
//         password: tailorData.password ? `✅ PRESENT (${tailorData.password.length} chars)` : "❌ MISSING",
//         passwordFirstChars: tailorData.password ? tailorData.password.substring(0, 3) + '...' : null
//       });

//       // CRITICAL CHECK: Verify password exists
//       if (!tailorData.password) {
//         console.error("🔴 [Redux Thunk] CRITICAL: Password is missing in thunk!");
        
//         // Check if password might be in a different property
//         const possiblePasswordProps = ['password', 'pass', 'pwd', 'Password'];
//         const foundProps = possiblePasswordProps.filter(prop => tailorData[prop]);
        
//         if (foundProps.length > 0) {
//           console.log("🔵 [Redux Thunk] Found password in alternative property:", foundProps[0]);
//           // Use the found password property
//           tailorData.password = tailorData[foundProps[0]];
//         } else {
//           return rejectWithValue({ 
//             message: "Password is required but was not provided in the request data" 
//           });
//         }
//       }

//       // Ensure all required fields are present
//       const apiData = {
//         name: tailorData.name,
//         phone: tailorData.phone,
//         email: tailorData.email || undefined,
//         password: tailorData.password, // Explicitly include password
//         experience: tailorData.experience || 0,
//         specialization: Array.isArray(tailorData.specialization) ? tailorData.specialization : [],
//         address: tailorData.address || {}
//       };

//       // DEBUG: Log the data being sent to API
//       console.log("🔵 [Redux Thunk] Sending to API:", {
//         ...apiData,
//         password: apiData.password ? `✅ PRESENT (${apiData.password.length} chars)` : "❌ MISSING",
//         passwordPreview: apiData.password ? apiData.password.substring(0, 3) + '...' : null
//       });

//       // Make the API call
//       const response = await tailorApi.createTailorApi(apiData);
      
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
//         "Failed to create tailor"
//       );
//     }
//   }
// );

// export const updateTailor = createAsyncThunk(
//   "tailor/update",
//   async ({ id, tailorData }, { rejectWithValue }) => {
//     try {
//       const response = await tailorApi.updateTailorApi(id, tailorData);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to update tailor");
//     }
//   }
// );

// export const updateLeaveStatus = createAsyncThunk(
//   "tailor/updateLeave",
//   async ({ id, leaveData }, { rejectWithValue }) => {
//     try {
//       const response = await tailorApi.updateLeaveStatusApi(id, leaveData);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to update leave status");
//     }
//   }
// );

// // ✅ NEW: TOGGLE TAILOR STATUS (Activate/Deactivate)
// export const toggleTailorStatus = createAsyncThunk(
//   "tailor/toggleStatus",
//   async (id, { rejectWithValue }) => {
//     try {
//       const response = await tailorApi.toggleTailorStatusApi(id);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to toggle status");
//     }
//   }
// );

// export const deleteTailor = createAsyncThunk(
//   "tailor/delete",
//   async (id, { rejectWithValue }) => {
//     try {
//       await tailorApi.deleteTailorApi(id);
//       return id;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to delete tailor");
//     }
//   }
// );

// const tailorSlice = createSlice({
//   name: "tailor",
//   initialState: {
//     tailors: [],
//     currentTailor: null,
//     works: [],
//     workStats: {},
//     tailorStats: {},
//     workDistribution: {},
    
//     // ✅ NEW: Top tailors for dashboard
//     topTailors: [],
//     topTailorsSummary: {},
//     topTailorsLoading: false,
    
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
//     clearCurrentTailor: (state) => {
//       state.currentTailor = null;
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
    
//     // ✅ NEW: Clear top tailors
//     clearTopTailors: (state) => {
//       state.topTailors = [];
//       state.topTailorsSummary = {};
//     }
//   },
//   extraReducers: (builder) => {
//     builder
//       // ===== FETCH ALL TAILORS =====
//       .addCase(fetchAllTailors.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchAllTailors.fulfilled, (state, action) => {
//         state.loading = false;
        
//         // Handle both array and paginated responses
//         if (Array.isArray(action.payload)) {
//           state.tailors = action.payload;
//           state.pagination.total = action.payload.length;
//           state.pagination.pages = 1;
//         } else {
//           state.tailors = action.payload.tailors || action.payload;
//           state.pagination = {
//             ...state.pagination,
//             ...(action.payload.pagination || {})
//           };
//         }
//       })
//       .addCase(fetchAllTailors.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== FETCH TAILOR BY ID =====
//       .addCase(fetchTailorById.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchTailorById.fulfilled, (state, action) => {
//         state.loading = false;
//         state.currentTailor = action.payload.tailor;
//         state.works = action.payload.works;
//         state.workStats = action.payload.workStats;
//       })
//       .addCase(fetchTailorById.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== FETCH TOP TAILORS (NEW) =====
//       .addCase(fetchTopTailors.pending, (state) => {
//         state.topTailorsLoading = true;
//         state.error = null;
//       })
//       .addCase(fetchTopTailors.fulfilled, (state, action) => {
//         state.topTailorsLoading = false;
//         state.topTailors = action.payload.topTailors || [];
//         state.topTailorsSummary = action.payload.summary || {};
//       })
//       .addCase(fetchTopTailors.rejected, (state, action) => {
//         state.topTailorsLoading = false;
//         state.error = action.payload;
//       })

//       // ===== CREATE TAILOR =====
//       .addCase(createTailor.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//         console.log("🟡 [Redux] createTailor pending");
//       })
//       .addCase(createTailor.fulfilled, (state, action) => {
//         state.loading = false;
//         console.log("🟢 [Redux] createTailor fulfilled:", action.payload);
//         state.tailors = [action.payload.tailor, ...state.tailors];
//         state.pagination.total += 1;
//       })
//       .addCase(createTailor.rejected, (state, action) => {
//         state.loading = false;
//         console.error("🔴 [Redux] createTailor rejected:", action.payload);
//         state.error = action.payload;
//       })

//       // ===== UPDATE TAILOR =====
//       .addCase(updateTailor.fulfilled, (state, action) => {
//         const updatedTailor = action.payload.tailor;
//         const index = state.tailors.findIndex(t => t._id === updatedTailor._id);
//         if (index !== -1) {
//           state.tailors[index] = updatedTailor;
//         }
//         if (state.currentTailor?._id === updatedTailor._id) {
//           state.currentTailor = updatedTailor;
//         }
//       })

//       // ===== UPDATE LEAVE STATUS =====
//       .addCase(updateLeaveStatus.fulfilled, (state, action) => {
//         const updatedTailor = action.payload.tailor;
//         const index = state.tailors.findIndex(t => t._id === updatedTailor._id);
//         if (index !== -1) {
//           state.tailors[index] = updatedTailor;
//         }
//         if (state.currentTailor?._id === updatedTailor._id) {
//           state.currentTailor = updatedTailor;
//         }
//       })

//       // ===== TOGGLE TAILOR STATUS =====
//       .addCase(toggleTailorStatus.fulfilled, (state, action) => {
//         const updatedTailor = action.payload.tailor;
//         const index = state.tailors.findIndex(t => t._id === updatedTailor._id);
//         if (index !== -1) {
//           state.tailors[index] = updatedTailor;
//         }
//         if (state.currentTailor?._id === updatedTailor._id) {
//           state.currentTailor = updatedTailor;
//         }
//       })

//       // ===== DELETE TAILOR =====
//       .addCase(deleteTailor.fulfilled, (state, action) => {
//         state.tailors = state.tailors.filter(t => t._id !== action.payload);
//         state.pagination.total -= 1;
//         if (state.currentTailor?._id === action.payload) {
//           state.currentTailor = null;
//           state.works = [];
//           state.workStats = {};
//         }
//       })

//       // ===== FETCH TAILOR STATS =====
//       .addCase(fetchTailorStats.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchTailorStats.fulfilled, (state, action) => {
//         state.loading = false;
//         state.tailorStats = action.payload.tailorStats;
//         state.workDistribution = action.payload.workDistribution;
//       })
//       .addCase(fetchTailorStats.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       });
//   },
// });

// export const { 
//   clearCurrentTailor, 
//   clearError,
//   setPage,
//   setLimit,
//   setSorting,
//   setSearchTerm,
//   setSearchFilter,
//   resetSearch,
//   clearTopTailors // ✅ NEW
// } = tailorSlice.actions;

// // ============================================
// // SELECTORS
// // ============================================

// export const selectAllTailors = (state) => state.tailor.tailors;
// export const selectCurrentTailor = (state) => state.tailor.currentTailor;
// export const selectTailorWorks = (state) => state.tailor.works;
// export const selectTailorWorkStats = (state) => state.tailor.workStats;
// export const selectTailorStats = (state) => state.tailor.tailorStats;
// export const selectWorkDistribution = (state) => state.tailor.workDistribution;
// export const selectTailorLoading = (state) => state.tailor.loading;
// export const selectTailorError = (state) => state.tailor.error;

// // ✅ NEW: Top tailors selectors
// export const selectTopTailors = (state) => state.tailor.topTailors;
// export const selectTopTailorsSummary = (state) => state.tailor.topTailorsSummary;
// export const selectTopTailorsLoading = (state) => state.tailor.topTailorsLoading;

// // Pagination selectors
// export const selectTailorPagination = (state) => state.tailor.pagination;
// export const selectTailorSorting = (state) => state.tailor.sorting;
// export const selectTailorSearch = (state) => state.tailor.search;

// export default tailorSlice.reducer;






// // frontend/src/features/tailor/tailorSlice.js - COMPLETE FIXED VERSION WITH DASHBOARD
// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import * as tailorApi from "./tailorApi";

// // ===== ASYNC THUNKS =====

// // ✅ FETCH ALL TAILORS (with pagination & sorting)
// export const fetchAllTailors = createAsyncThunk(
//   "tailor/fetchAll",
//   async (params = {}, { rejectWithValue }) => {
//     try {
//       const response = await tailorApi.getAllTailorsApi(params);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch tailors");
//     }
//   }
// );

// export const fetchTailorById = createAsyncThunk(
//   "tailor/fetchById",
//   async (id, { rejectWithValue }) => {
//     try {
//       const response = await tailorApi.getTailorByIdApi(id);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch tailor");
//     }
//   }
// );

// // ✅ FETCH TOP TAILORS for dashboard
// export const fetchTopTailors = createAsyncThunk(
//   "tailor/fetchTop",
//   async ({ limit = 5, period = 'month' } = {}, { rejectWithValue }) => {
//     try {
//       console.log(`🏆 Fetching top ${limit} tailors for period: ${period}`);
//       const response = await tailorApi.getTopTailorsApi(limit, period);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch top tailors");
//     }
//   }
// );

// // ✅ FETCH TAILOR PERFORMANCE for dashboard
// export const fetchTailorPerformance = createAsyncThunk(
//   "tailor/fetchPerformance",
//   async ({ period = 'month', tailorId } = {}, { rejectWithValue }) => {
//     try {
//       console.log(`📈 Fetching tailor performance for period: ${period}`);
//       const response = await tailorApi.getTailorPerformanceApi(period, tailorId);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch tailor performance");
//     }
//   }
// );

// // ✅ FETCH TAILOR STATS
// export const fetchTailorStats = createAsyncThunk(
//   "tailor/fetchStats",
//   async (_, { rejectWithValue }) => {
//     try {
//       console.log('📊 Fetching tailor stats');
//       const response = await tailorApi.getTailorStatsApi();
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch stats");
//     }
//   }
// );

// // ===== CREATE TAILOR - UPDATED WITH DEBUG LOGS =====
// export const createTailor = createAsyncThunk(
//   "tailor/create",
//   async (tailorData, { rejectWithValue }) => {
//     try {
//       // DEBUG: Log the data received in thunk
//       console.log("🔵 [Redux Thunk] createTailor received:", {
//         ...tailorData,
//         password: tailorData.password ? `✅ PRESENT (${tailorData.password.length} chars)` : "❌ MISSING",
//         passwordFirstChars: tailorData.password ? tailorData.password.substring(0, 3) + '...' : null
//       });

//       // CRITICAL CHECK: Verify password exists
//       if (!tailorData.password) {
//         console.error("🔴 [Redux Thunk] CRITICAL: Password is missing in thunk!");
        
//         // Check if password might be in a different property
//         const possiblePasswordProps = ['password', 'pass', 'pwd', 'Password'];
//         const foundProps = possiblePasswordProps.filter(prop => tailorData[prop]);
        
//         if (foundProps.length > 0) {
//           console.log("🔵 [Redux Thunk] Found password in alternative property:", foundProps[0]);
//           // Use the found password property
//           tailorData.password = tailorData[foundProps[0]];
//         } else {
//           return rejectWithValue({ 
//             message: "Password is required but was not provided in the request data" 
//           });
//         }
//       }

//       // Ensure all required fields are present
//       const apiData = {
//         name: tailorData.name,
//         phone: tailorData.phone,
//         email: tailorData.email || undefined,
//         password: tailorData.password, // Explicitly include password
//         experience: tailorData.experience || 0,
//         specialization: Array.isArray(tailorData.specialization) ? tailorData.specialization : [],
//         address: tailorData.address || {}
//       };

//       // DEBUG: Log the data being sent to API
//       console.log("🔵 [Redux Thunk] Sending to API:", {
//         ...apiData,
//         password: apiData.password ? `✅ PRESENT (${apiData.password.length} chars)` : "❌ MISSING",
//         passwordPreview: apiData.password ? apiData.password.substring(0, 3) + '...' : null
//       });

//       // Make the API call
//       const response = await tailorApi.createTailorApi(apiData);
      
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
//         "Failed to create tailor"
//       );
//     }
//   }
// );

// export const updateTailor = createAsyncThunk(
//   "tailor/update",
//   async ({ id, tailorData }, { rejectWithValue }) => {
//     try {
//       const response = await tailorApi.updateTailorApi(id, tailorData);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to update tailor");
//     }
//   }
// );

// export const updateLeaveStatus = createAsyncThunk(
//   "tailor/updateLeave",
//   async ({ id, leaveData }, { rejectWithValue }) => {
//     try {
//       const response = await tailorApi.updateLeaveStatusApi(id, leaveData);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to update leave status");
//     }
//   }
// );

// // ✅ TOGGLE TAILOR STATUS (Activate/Deactivate)
// export const toggleTailorStatus = createAsyncThunk(
//   "tailor/toggleStatus",
//   async (id, { rejectWithValue }) => {
//     try {
//       const response = await tailorApi.toggleTailorStatusApi(id);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to toggle status");
//     }
//   }
// );

// export const deleteTailor = createAsyncThunk(
//   "tailor/delete",
//   async (id, { rejectWithValue }) => {
//     try {
//       await tailorApi.deleteTailorApi(id);
//       return id;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to delete tailor");
//     }
//   }
// );

// const tailorSlice = createSlice({
//   name: "tailor",
//   initialState: {
//     tailors: [],
//     currentTailor: null,
//     works: [],
//     workStats: {},
//     tailorStats: {},
//     workDistribution: {},
    
//     // ✅ Top tailors for dashboard
//     topTailors: [],
//     topTailorsSummary: {},
//     topTailorsLoading: false,
    
//     // ✅ Tailor performance for dashboard
//     tailorPerformance: {
//       data: [],
//       summary: {
//         totalCompleted: 0,
//         activeTailors: 0,
//         avgPerTailor: 0
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
//     clearCurrentTailor: (state) => {
//       state.currentTailor = null;
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
    
//     // ✅ Clear top tailors
//     clearTopTailors: (state) => {
//       state.topTailors = [];
//       state.topTailorsSummary = {};
//     },
    
//     // ✅ Clear tailor performance
//     clearTailorPerformance: (state) => {
//       state.tailorPerformance = {
//         data: [],
//         summary: {
//           totalCompleted: 0,
//           activeTailors: 0,
//           avgPerTailor: 0
//         },
//         loading: false
//       };
//     }
//   },
//   extraReducers: (builder) => {
//     builder
//       // ===== FETCH ALL TAILORS =====
//       .addCase(fetchAllTailors.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchAllTailors.fulfilled, (state, action) => {
//         state.loading = false;
        
//         // Handle both array and paginated responses
//         if (Array.isArray(action.payload)) {
//           state.tailors = action.payload;
//           state.pagination.total = action.payload.length;
//           state.pagination.pages = 1;
//         } else {
//           state.tailors = action.payload.tailors || action.payload;
//           state.pagination = {
//             ...state.pagination,
//             ...(action.payload.pagination || {})
//           };
//         }
//       })
//       .addCase(fetchAllTailors.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== FETCH TAILOR BY ID =====
//       .addCase(fetchTailorById.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchTailorById.fulfilled, (state, action) => {
//         state.loading = false;
//         state.currentTailor = action.payload.tailor;
//         state.works = action.payload.works;
//         state.workStats = action.payload.workStats;
//       })
//       .addCase(fetchTailorById.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== FETCH TOP TAILORS =====
//       .addCase(fetchTopTailors.pending, (state) => {
//         state.topTailorsLoading = true;
//         state.error = null;
//       })
//       .addCase(fetchTopTailors.fulfilled, (state, action) => {
//         state.topTailorsLoading = false;
//         state.topTailors = action.payload.topTailors || [];
//         state.topTailorsSummary = action.payload.summary || {};
//         console.log('✅ Top tailors loaded:', state.topTailors.length);
//       })
//       .addCase(fetchTopTailors.rejected, (state, action) => {
//         state.topTailorsLoading = false;
//         state.error = action.payload;
//       })

//       // ===== FETCH TAILOR PERFORMANCE =====
//       .addCase(fetchTailorPerformance.pending, (state) => {
//         state.tailorPerformance.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchTailorPerformance.fulfilled, (state, action) => {
//         state.tailorPerformance.loading = false;
//         state.tailorPerformance.data = action.payload.performance || [];
//         state.tailorPerformance.summary = action.payload.summary || {
//           totalCompleted: 0,
//           activeTailors: 0,
//           avgPerTailor: 0
//         };
//         console.log('✅ Tailor performance loaded:', state.tailorPerformance.data.length);
//       })
//       .addCase(fetchTailorPerformance.rejected, (state, action) => {
//         state.tailorPerformance.loading = false;
//         state.error = action.payload;
//       })

//       // ===== CREATE TAILOR =====
//       .addCase(createTailor.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//         console.log("🟡 [Redux] createTailor pending");
//       })
//       .addCase(createTailor.fulfilled, (state, action) => {
//         state.loading = false;
//         console.log("🟢 [Redux] createTailor fulfilled:", action.payload);
//         state.tailors = [action.payload.tailor, ...state.tailors];
//         state.pagination.total += 1;
//       })
//       .addCase(createTailor.rejected, (state, action) => {
//         state.loading = false;
//         console.error("🔴 [Redux] createTailor rejected:", action.payload);
//         state.error = action.payload;
//       })

//       // ===== UPDATE TAILOR =====
//       .addCase(updateTailor.fulfilled, (state, action) => {
//         const updatedTailor = action.payload.tailor;
//         const index = state.tailors.findIndex(t => t._id === updatedTailor._id);
//         if (index !== -1) {
//           state.tailors[index] = updatedTailor;
//         }
//         if (state.currentTailor?._id === updatedTailor._id) {
//           state.currentTailor = updatedTailor;
//         }
//       })

//       // ===== UPDATE LEAVE STATUS =====
//       .addCase(updateLeaveStatus.fulfilled, (state, action) => {
//         const updatedTailor = action.payload.tailor;
//         const index = state.tailors.findIndex(t => t._id === updatedTailor._id);
//         if (index !== -1) {
//           state.tailors[index] = updatedTailor;
//         }
//         if (state.currentTailor?._id === updatedTailor._id) {
//           state.currentTailor = updatedTailor;
//         }
//       })

//       // ===== TOGGLE TAILOR STATUS =====
//       .addCase(toggleTailorStatus.fulfilled, (state, action) => {
//         const updatedTailor = action.payload.tailor;
//         const index = state.tailors.findIndex(t => t._id === updatedTailor._id);
//         if (index !== -1) {
//           state.tailors[index] = updatedTailor;
//         }
//         if (state.currentTailor?._id === updatedTailor._id) {
//           state.currentTailor = updatedTailor;
//         }
//       })

//       // ===== DELETE TAILOR =====
//       .addCase(deleteTailor.fulfilled, (state, action) => {
//         state.tailors = state.tailors.filter(t => t._id !== action.payload);
//         state.pagination.total -= 1;
//         if (state.currentTailor?._id === action.payload) {
//           state.currentTailor = null;
//           state.works = [];
//           state.workStats = {};
//         }
//       })

//       // ===== FETCH TAILOR STATS =====
//       .addCase(fetchTailorStats.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchTailorStats.fulfilled, (state, action) => {
//         state.loading = false;
//         state.tailorStats = action.payload.tailorStats;
//         state.workDistribution = action.payload.workDistribution;
//         console.log('✅ Tailor stats loaded:', state.tailorStats);
//       })
//       .addCase(fetchTailorStats.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       });
//   },
// });

// export const { 
//   clearCurrentTailor, 
//   clearError,
//   setPage,
//   setLimit,
//   setSorting,
//   setSearchTerm,
//   setSearchFilter,
//   resetSearch,
//   clearTopTailors,
//   clearTailorPerformance // ✅ NEW
// } = tailorSlice.actions;

// // ============================================
// // SELECTORS
// // ============================================

// export const selectAllTailors = (state) => state.tailor.tailors;
// export const selectCurrentTailor = (state) => state.tailor.currentTailor;
// export const selectTailorWorks = (state) => state.tailor.works;
// export const selectTailorWorkStats = (state) => state.tailor.workStats;
// export const selectTailorStats = (state) => state.tailor.tailorStats;
// export const selectWorkDistribution = (state) => state.tailor.workDistribution;
// export const selectTailorLoading = (state) => state.tailor.loading;
// export const selectTailorError = (state) => state.tailor.error;

// // ✅ Top tailors selectors
// export const selectTopTailors = (state) => state.tailor.topTailors;
// export const selectTopTailorsSummary = (state) => state.tailor.topTailorsSummary;
// export const selectTopTailorsLoading = (state) => state.tailor.topTailorsLoading;

// // ✅ Tailor performance selectors
// export const selectTailorPerformance = (state) => state.tailor.tailorPerformance.data;
// export const selectTailorPerformanceSummary = (state) => state.tailor.tailorPerformance.summary;
// export const selectTailorPerformanceLoading = (state) => state.tailor.tailorPerformance.loading;

// // Pagination selectors
// export const selectTailorPagination = (state) => state.tailor.pagination;
// export const selectTailorSorting = (state) => state.tailor.sorting;
// export const selectTailorSearch = (state) => state.tailor.search;

// export default tailorSlice.reducer;










// frontend/src/features/tailor/tailorSlice.js - WITH COMPREHENSIVE DEBUGGING
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as tailorApi from "./tailorApi";

// ===== ASYNC THUNKS =====

// ✅ FETCH ALL TAILORS (with pagination & sorting)
export const fetchAllTailors = createAsyncThunk(
  "tailor/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      console.log('🔵 [fetchAllTailors] Request with params:', params);
      const response = await tailorApi.getAllTailorsApi(params);
      console.log('🔵 [fetchAllTailors] Response:', response);
      return response;
    } catch (error) {
      console.error('🔴 [fetchAllTailors] Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      return rejectWithValue(error.response?.data?.message || "Failed to fetch tailors");
    }
  }
);

export const fetchTailorById = createAsyncThunk(
  "tailor/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      console.log('🔵 [fetchTailorById] Request for ID:', id);
      const response = await tailorApi.getTailorByIdApi(id);
      console.log('🔵 [fetchTailorById] Response:', response);
      return response;
    } catch (error) {
      console.error('🔴 [fetchTailorById] Error:', error);
      return rejectWithValue(error.response?.data?.message || "Failed to fetch tailor");
    }
  }
);

// ✅ FETCH TOP TAILORS for dashboard
export const fetchTopTailors = createAsyncThunk(
  "tailor/fetchTop",
  async ({ limit = 5, period = 'month' } = {}, { rejectWithValue }) => {
    try {
      console.log(`🏆 [fetchTopTailors] Fetching top ${limit} tailors for period: ${period}`);
      const response = await tailorApi.getTopTailorsApi(limit, period);
      console.log('🏆 [fetchTopTailors] Full Response:', response);
      console.log('🏆 [fetchTopTailors] Top tailors data:', response.topTailors);
      console.log('🏆 [fetchTopTailors] Summary:', response.summary);
      return response;
    } catch (error) {
      console.error('🔴 [fetchTopTailors] Error:', error);
      return rejectWithValue(error.response?.data?.message || "Failed to fetch top tailors");
    }
  }
);

// ✅ FETCH TAILOR PERFORMANCE for dashboard
export const fetchTailorPerformance = createAsyncThunk(
  "tailor/fetchPerformance",
  async ({ period = 'month', tailorId } = {}, { rejectWithValue }) => {
    try {
      console.log(`📈 [fetchTailorPerformance] Fetching tailor performance for period: ${period}`, tailorId ? `tailorId: ${tailorId}` : 'all tailors');
      const response = await tailorApi.getTailorPerformanceApi(period, tailorId);
      console.log('📈 [fetchTailorPerformance] Full Response:', response);
      console.log('📈 [fetchTailorPerformance] Performance data:', response.performance);
      console.log('📈 [fetchTailorPerformance] Summary:', response.summary);
      return response;
    } catch (error) {
      console.error('🔴 [fetchTailorPerformance] Error:', error);
      return rejectWithValue(error.response?.data?.message || "Failed to fetch tailor performance");
    }
  }
);

// ✅ FETCH TAILOR STATS
export const fetchTailorStats = createAsyncThunk(
  "tailor/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      console.log('📊 [fetchTailorStats] Fetching tailor stats');
      const response = await tailorApi.getTailorStatsApi();
      console.log('📊 [fetchTailorStats] Full Response:', response);
      console.log('📊 [fetchTailorStats] Tailor Stats:', response.tailorStats);
      console.log('📊 [fetchTailorStats] Work Distribution:', response.workDistribution);
      return response;
    } catch (error) {
      console.error('🔴 [fetchTailorStats] Error:', error);
      return rejectWithValue(error.response?.data?.message || "Failed to fetch stats");
    }
  }
);

// ===== CREATE TAILOR - UPDATED WITH DEBUG LOGS =====
export const createTailor = createAsyncThunk(
  "tailor/create",
  async (tailorData, { rejectWithValue }) => {
    try {
      // DEBUG: Log the data received in thunk
      console.log("🔵 [createTailor] Received:", {
        ...tailorData,
        password: tailorData.password ? `✅ PRESENT (${tailorData.password.length} chars)` : "❌ MISSING",
        passwordFirstChars: tailorData.password ? tailorData.password.substring(0, 3) + '...' : null
      });

      // CRITICAL CHECK: Verify password exists
      if (!tailorData.password) {
        console.error("🔴 [createTailor] CRITICAL: Password is missing!");
        
        // Check if password might be in a different property
        const possiblePasswordProps = ['password', 'pass', 'pwd', 'Password'];
        const foundProps = possiblePasswordProps.filter(prop => tailorData[prop]);
        
        if (foundProps.length > 0) {
          console.log("🔵 [createTailor] Found password in alternative property:", foundProps[0]);
          tailorData.password = tailorData[foundProps[0]];
        } else {
          return rejectWithValue({ 
            message: "Password is required but was not provided in the request data" 
          });
        }
      }

      // Ensure all required fields are present
      const apiData = {
        name: tailorData.name,
        phone: tailorData.phone,
        email: tailorData.email || undefined,
        password: tailorData.password,
        experience: tailorData.experience || 0,
        specialization: Array.isArray(tailorData.specialization) ? tailorData.specialization : [],
        address: tailorData.address || {}
      };

      console.log("🔵 [createTailor] Sending to API:", {
        ...apiData,
        password: apiData.password ? `✅ PRESENT (${apiData.password.length} chars)` : "❌ MISSING"
      });

      const response = await tailorApi.createTailorApi(apiData);
      console.log("🔵 [createTailor] API Response:", response);
      return response;
    } catch (error) {
      console.error("🔴 [createTailor] Error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        "Failed to create tailor"
      );
    }
  }
);

export const updateTailor = createAsyncThunk(
  "tailor/update",
  async ({ id, tailorData }, { rejectWithValue }) => {
    try {
      console.log('🔵 [updateTailor] Updating tailor:', id, tailorData);
      const response = await tailorApi.updateTailorApi(id, tailorData);
      console.log('🔵 [updateTailor] Response:', response);
      return response;
    } catch (error) {
      console.error('🔴 [updateTailor] Error:', error);
      return rejectWithValue(error.response?.data?.message || "Failed to update tailor");
    }
  }
);

export const updateLeaveStatus = createAsyncThunk(
  "tailor/updateLeave",
  async ({ id, leaveData }, { rejectWithValue }) => {
    try {
      console.log('🔵 [updateLeaveStatus] Updating leave for tailor:', id, leaveData);
      const response = await tailorApi.updateLeaveStatusApi(id, leaveData);
      console.log('🔵 [updateLeaveStatus] Response:', response);
      return response;
    } catch (error) {
      console.error('🔴 [updateLeaveStatus] Error:', error);
      return rejectWithValue(error.response?.data?.message || "Failed to update leave status");
    }
  }
);

// ✅ TOGGLE TAILOR STATUS (Activate/Deactivate)
export const toggleTailorStatus = createAsyncThunk(
  "tailor/toggleStatus",
  async (id, { rejectWithValue }) => {
    try {
      console.log('🔵 [toggleTailorStatus] Toggling status for tailor:', id);
      const response = await tailorApi.toggleTailorStatusApi(id);
      console.log('🔵 [toggleTailorStatus] Response:', response);
      return response;
    } catch (error) {
      console.error('🔴 [toggleTailorStatus] Error:', error);
      return rejectWithValue(error.response?.data?.message || "Failed to toggle status");
    }
  }
);

export const deleteTailor = createAsyncThunk(
  "tailor/delete",
  async (id, { rejectWithValue }) => {
    try {
      console.log('🔵 [deleteTailor] Deleting tailor:', id);
      await tailorApi.deleteTailorApi(id);
      console.log('🔵 [deleteTailor] Deleted successfully:', id);
      return id;
    } catch (error) {
      console.error('🔴 [deleteTailor] Error:', error);
      return rejectWithValue(error.response?.data?.message || "Failed to delete tailor");
    }
  }
);

const tailorSlice = createSlice({
  name: "tailor",
  initialState: {
    tailors: [],
    currentTailor: null,
    works: [],
    workStats: {},
    tailorStats: {},
    workDistribution: {},
    
    // ✅ Top tailors for dashboard
    topTailors: [],
    topTailorsSummary: {},
    topTailorsLoading: false,
    
    // ✅ Tailor performance for dashboard
    tailorPerformance: {
      data: [],
      summary: {
        totalCompleted: 0,
        activeTailors: 0,
        avgPerTailor: 0
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
    clearCurrentTailor: (state) => {
      state.currentTailor = null;
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
    
    clearTopTailors: (state) => {
      state.topTailors = [];
      state.topTailorsSummary = {};
    },
    
    clearTailorPerformance: (state) => {
      state.tailorPerformance = {
        data: [],
        summary: {
          totalCompleted: 0,
          activeTailors: 0,
          avgPerTailor: 0
        },
        loading: false
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // ===== FETCH ALL TAILORS =====
      .addCase(fetchAllTailors.pending, (state) => {
        console.log('🟡 [Reducer] fetchAllTailors pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllTailors.fulfilled, (state, action) => {
        console.log('🟢 [Reducer] fetchAllTailors fulfilled:', action.payload);
        state.loading = false;
        
        if (Array.isArray(action.payload)) {
          state.tailors = action.payload;
          state.pagination.total = action.payload.length;
          state.pagination.pages = 1;
        } else {
          state.tailors = action.payload.tailors || action.payload;
          state.pagination = {
            ...state.pagination,
            ...(action.payload.pagination || {})
          };
        }
        console.log('🟢 [Reducer] Tailors loaded:', state.tailors.length);
      })
      .addCase(fetchAllTailors.rejected, (state, action) => {
        console.error('🔴 [Reducer] fetchAllTailors rejected:', action.payload);
        state.loading = false;
        state.error = action.payload;
      })

      // ===== FETCH TAILOR BY ID =====
      .addCase(fetchTailorById.pending, (state) => {
        console.log('🟡 [Reducer] fetchTailorById pending');
        state.loading = true;
        state.error = null;
        state.currentTailor = null;
      })
      .addCase(fetchTailorById.fulfilled, (state, action) => {
        console.log('🟢 [Reducer] fetchTailorById fulfilled:', action.payload);
        state.loading = false;
        state.currentTailor = action.payload.tailor;
        state.works = action.payload.works;
        state.workStats = action.payload.workStats;
      })
      .addCase(fetchTailorById.rejected, (state, action) => {
        console.error('🔴 [Reducer] fetchTailorById rejected:', action.payload);
        state.loading = false;
        state.error = action.payload;
      })

      // ===== FETCH TOP TAILORS =====
      .addCase(fetchTopTailors.pending, (state) => {
        console.log('🟡 [Reducer] fetchTopTailors pending');
        state.topTailorsLoading = true;
        state.error = null;
      })
      .addCase(fetchTopTailors.fulfilled, (state, action) => {
        console.log('🟢 [Reducer] fetchTopTailors fulfilled:', action.payload);
        state.topTailorsLoading = false;
        state.topTailors = action.payload.topTailors || [];
        state.topTailorsSummary = action.payload.summary || {};
        console.log('🟢 [Reducer] Top tailors loaded:', state.topTailors.length);
        console.log('🟢 [Reducer] Top tailors data:', state.topTailors);
      })
      .addCase(fetchTopTailors.rejected, (state, action) => {
        console.error('🔴 [Reducer] fetchTopTailors rejected:', action.payload);
        state.topTailorsLoading = false;
        state.error = action.payload;
      })

      // ===== FETCH TAILOR PERFORMANCE =====
      .addCase(fetchTailorPerformance.pending, (state) => {
        console.log('🟡 [Reducer] fetchTailorPerformance pending');
        state.tailorPerformance.loading = true;
        state.error = null;
      })
      .addCase(fetchTailorPerformance.fulfilled, (state, action) => {
        console.log('🟢 [Reducer] fetchTailorPerformance fulfilled:', action.payload);
        state.tailorPerformance.loading = false;
        state.tailorPerformance.data = action.payload.performance || [];
        state.tailorPerformance.summary = action.payload.summary || {
          totalCompleted: 0,
          activeTailors: 0,
          avgPerTailor: 0
        };
        console.log('🟢 [Reducer] Performance data loaded:', state.tailorPerformance.data.length);
        console.log('🟢 [Reducer] Performance data:', state.tailorPerformance.data);
        console.log('🟢 [Reducer] Performance summary:', state.tailorPerformance.summary);
      })
      .addCase(fetchTailorPerformance.rejected, (state, action) => {
        console.error('🔴 [Reducer] fetchTailorPerformance rejected:', action.payload);
        state.tailorPerformance.loading = false;
        state.error = action.payload;
      })

      // ===== CREATE TAILOR =====
      .addCase(createTailor.pending, (state) => {
        console.log("🟡 [Reducer] createTailor pending");
        state.loading = true;
        state.error = null;
      })
      .addCase(createTailor.fulfilled, (state, action) => {
        console.log("🟢 [Reducer] createTailor fulfilled:", action.payload);
        state.loading = false;
        state.tailors = [action.payload.tailor, ...state.tailors];
        state.pagination.total += 1;
      })
      .addCase(createTailor.rejected, (state, action) => {
        console.error("🔴 [Reducer] createTailor rejected:", action.payload);
        state.loading = false;
        state.error = action.payload;
      })

      // ===== UPDATE TAILOR =====
      .addCase(updateTailor.fulfilled, (state, action) => {
        console.log('🟢 [Reducer] updateTailor fulfilled:', action.payload);
        const updatedTailor = action.payload.tailor;
        const index = state.tailors.findIndex(t => t._id === updatedTailor._id);
        if (index !== -1) {
          state.tailors[index] = updatedTailor;
        }
        if (state.currentTailor?._id === updatedTailor._id) {
          state.currentTailor = updatedTailor;
        }
      })

      // ===== UPDATE LEAVE STATUS =====
      .addCase(updateLeaveStatus.fulfilled, (state, action) => {
        console.log('🟢 [Reducer] updateLeaveStatus fulfilled:', action.payload);
        const updatedTailor = action.payload.tailor;
        const index = state.tailors.findIndex(t => t._id === updatedTailor._id);
        if (index !== -1) {
          state.tailors[index] = updatedTailor;
        }
        if (state.currentTailor?._id === updatedTailor._id) {
          state.currentTailor = updatedTailor;
        }
      })

      // ===== TOGGLE TAILOR STATUS =====
      .addCase(toggleTailorStatus.fulfilled, (state, action) => {
        console.log('🟢 [Reducer] toggleTailorStatus fulfilled:', action.payload);
        const updatedTailor = action.payload.tailor;
        const index = state.tailors.findIndex(t => t._id === updatedTailor._id);
        if (index !== -1) {
          state.tailors[index] = updatedTailor;
        }
        if (state.currentTailor?._id === updatedTailor._id) {
          state.currentTailor = updatedTailor;
        }
      })

      // ===== DELETE TAILOR =====
      .addCase(deleteTailor.fulfilled, (state, action) => {
        console.log('🟢 [Reducer] deleteTailor fulfilled:', action.payload);
        state.tailors = state.tailors.filter(t => t._id !== action.payload);
        state.pagination.total -= 1;
        if (state.currentTailor?._id === action.payload) {
          state.currentTailor = null;
          state.works = [];
          state.workStats = {};
        }
      })

      // ===== FETCH TAILOR STATS =====
      .addCase(fetchTailorStats.pending, (state) => {
        console.log('🟡 [Reducer] fetchTailorStats pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTailorStats.fulfilled, (state, action) => {
        console.log('🟢 [Reducer] fetchTailorStats fulfilled:', action.payload);
        state.loading = false;
        state.tailorStats = action.payload.tailorStats;
        state.workDistribution = action.payload.workDistribution;
        console.log('🟢 [Reducer] Tailor stats loaded:', state.tailorStats);
      })
      .addCase(fetchTailorStats.rejected, (state, action) => {
        console.error('🔴 [Reducer] fetchTailorStats rejected:', action.payload);
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  clearCurrentTailor, 
  clearError,
  setPage,
  setLimit,
  setSorting,
  setSearchTerm,
  setSearchFilter,
  resetSearch,
  clearTopTailors,
  clearTailorPerformance
} = tailorSlice.actions;

// ============================================
// SELECTORS
// ============================================

export const selectAllTailors = (state) => {
  console.log('🔍 [Selector] selectAllTailors:', state.tailor?.tailors?.length);
  return state.tailor.tailors;
};

export const selectCurrentTailor = (state) => {
  console.log('🔍 [Selector] selectCurrentTailor:', state.tailor.currentTailor?._id);
  return state.tailor.currentTailor;
};

export const selectTailorWorks = (state) => {
  console.log('🔍 [Selector] selectTailorWorks:', state.tailor.works?.length);
  return state.tailor.works;
};

export const selectTailorWorkStats = (state) => {
  console.log('🔍 [Selector] selectTailorWorkStats:', state.tailor.workStats);
  return state.tailor.workStats;
};

export const selectTailorStats = (state) => {
  console.log('🔍 [Selector] selectTailorStats:', state.tailor.tailorStats);
  return state.tailor.tailorStats;
};

export const selectWorkDistribution = (state) => {
  console.log('🔍 [Selector] selectWorkDistribution:', state.tailor.workDistribution);
  return state.tailor.workDistribution;
};

export const selectTailorLoading = (state) => {
  console.log('🔍 [Selector] selectTailorLoading:', state.tailor.loading);
  return state.tailor.loading;
};

export const selectTailorError = (state) => {
  console.log('🔍 [Selector] selectTailorError:', state.tailor.error);
  return state.tailor.error;
};

// ✅ Top tailors selectors
export const selectTopTailors = (state) => {
  console.log('🔍 [Selector] selectTopTailors:', state.tailor.topTailors?.length);
  return state.tailor.topTailors;
};

export const selectTopTailorsSummary = (state) => {
  console.log('🔍 [Selector] selectTopTailorsSummary:', state.tailor.topTailorsSummary);
  return state.tailor.topTailorsSummary;
};

export const selectTopTailorsLoading = (state) => {
  console.log('🔍 [Selector] selectTopTailorsLoading:', state.tailor.topTailorsLoading);
  return state.tailor.topTailorsLoading;
};

// ✅ Tailor performance selectors
export const selectTailorPerformance = (state) => {
  console.log('🔍 [Selector] selectTailorPerformance:', state.tailor.tailorPerformance?.data?.length);
  return state.tailor.tailorPerformance?.data || [];
};

export const selectTailorPerformanceSummary = (state) => {
  console.log('🔍 [Selector] selectTailorPerformanceSummary:', state.tailor.tailorPerformance?.summary);
  return state.tailor.tailorPerformance?.summary || {
    totalCompleted: 0,
    activeTailors: 0,
    avgPerTailor: 0
  };
};

export const selectTailorPerformanceLoading = (state) => {
  console.log('🔍 [Selector] selectTailorPerformanceLoading:', state.tailor.tailorPerformance?.loading);
  return state.tailor.tailorPerformance?.loading || false;
};

// Pagination selectors
export const selectTailorPagination = (state) => {
  return state.tailor.pagination;
};

export const selectTailorSorting = (state) => {
  return state.tailor.sorting;
};

export const selectTailorSearch = (state) => {
  return state.tailor.search;
};

export default tailorSlice.reducer;