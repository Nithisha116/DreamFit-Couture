// // features/work/workSlice.js - UPDATED WITH DASHBOARD FUNCTIONS
// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import showToast from '../../utils/toast';
// import * as workApi from './workApi';

// const initialState = {
//   works: [],
//   myWorks: [], // For cutting master
//   tailorWorks: [], // For tailor
//   currentWork: null,
  
//   // ✅ Dashboard specific states
//   dashboardStats: {
//     totalWork: 0,
//     completedWork: 0,
//     inProgressWork: 0,
//     overdueWork: 0,
//     todayWorks: 0,
//     loading: false
//   },
  
//   recentWorks: [], // For dashboard recent works list
  
//   statusBreakdown: {
//     breakdown: [],
//     pieData: [],
//     total: 0,
//     loading: false
//   },
  
//   stats: {
//     totalWorks: 0,
//     pendingWorks: 0,
//     acceptedWorks: 0,
//     cuttingStarted: 0,
//     cuttingCompleted: 0,
//     sewingStarted: 0,
//     sewingCompleted: 0,
//     ironing: 0,
//     readyToDeliver: 0,
//     todayWorks: 0,
//     overdueWorks: 0
//   },
  
//   pagination: {
//     page: 1,
//     limit: 20,
//     total: 0,
//     pages: 0
//   },
  
//   loading: false,
//   error: null,
  
//   filters: {
//     status: '',
//     search: '',
//     startDate: '',
//     endDate: '',
//     page: 1,
//     limit: 20
//   }
// };

// // ============================================
// // ✅ DASHBOARD THUNKS
// // ============================================

// // Fetch work stats for dashboard (with date filters)
// export const fetchDashboardWorkStats = createAsyncThunk(
//   'work/fetchDashboardWorkStats',
//   async (params = {}, { rejectWithValue }) => {
//     console.log('📊 [fetchDashboardWorkStats] called with params:', params);
//     try {
//       const response = await workApi.getDashboardWorkStats(params);
//       console.log('📊 [fetchDashboardWorkStats] response:', response);
//       return response.data;
//     } catch (error) {
//       console.error('❌ [fetchDashboardWorkStats] error:', error);
//       return rejectWithValue(error.response?.data?.message || 'Failed to fetch work stats');
//     }
//   }
// );

// // Fetch recent works for dashboard
// export const fetchRecentWorks = createAsyncThunk(
//   'work/fetchRecentWorks',
//   async (params = {}, { rejectWithValue }) => {
//     console.log('📋 [fetchRecentWorks] called with params:', params);
//     try {
//       const response = await workApi.getRecentWorks(params);
//       console.log('📋 [fetchRecentWorks] response:', response);
//       return response.data;
//     } catch (error) {
//       console.error('❌ [fetchRecentWorks] error:', error);
//       return rejectWithValue(error.response?.data?.message || 'Failed to fetch recent works');
//     }
//   }
// );

// // Fetch work status breakdown for pie chart
// export const fetchWorkStatusBreakdown = createAsyncThunk(
//   'work/fetchWorkStatusBreakdown',
//   async (params = {}, { rejectWithValue }) => {
//     console.log('🥧 [fetchWorkStatusBreakdown] called with params:', params);
//     try {
//       const response = await workApi.getWorkStatusBreakdown(params);
//       console.log('🥧 [fetchWorkStatusBreakdown] response:', response);
//       return response.data;
//     } catch (error) {
//       console.error('❌ [fetchWorkStatusBreakdown] error:', error);
//       return rejectWithValue(error.response?.data?.message || 'Failed to fetch status breakdown');
//     }
//   }
// );

// // ============================================
// // ✅ EXISTING THUNKS
// // ============================================

// export const fetchWorks = createAsyncThunk(
//   'work/fetchWorks',
//   async (filters = {}, { rejectWithValue, getState }) => {
//     console.log('📋 [fetchWorks] called with filters:', filters);
//     try {
//       const { work } = getState();
//       const currentFilters = { ...work.filters, ...filters };
//       console.log('📋 [fetchWorks] current filters:', currentFilters);
      
//       const response = await workApi.getWorks(currentFilters);
//       console.log('📋 [fetchWorks] response:', response);
//       return response.data;
//     } catch (error) {
//       console.error('❌ [fetchWorks] error:', error);
//       return rejectWithValue(error.response?.data?.message || 'Failed to fetch works');
//     }
//   }
// );

// export const fetchMyWorks = createAsyncThunk(
//   'work/fetchMyWorks',
//   async (filters = {}, { rejectWithValue }) => {
//     console.log('📋 [fetchMyWorks] called with filters:', filters);
//     try {
//       const response = await workApi.getMyWorks(filters);
//       console.log('📋 [fetchMyWorks] response:', response);
//       return response.data;
//     } catch (error) {
//       console.error('❌ [fetchMyWorks] error:', error);
//       return rejectWithValue(error.response?.data?.message || 'Failed to fetch your works');
//     }
//   }
// );

// export const fetchWorkById = createAsyncThunk(
//   'work/fetchWorkById',
//   async (id, { rejectWithValue }) => {
//     console.log('📋 [fetchWorkById] called with id:', id);
//     try {
//       const response = await workApi.getWorkById(id);
//       console.log('📋 [fetchWorkById] response:', response);
//       return response.data;
//     } catch (error) {
//       console.error('❌ [fetchWorkById] error:', error);
//       return rejectWithValue(error.response?.data?.message || 'Failed to fetch work');
//     }
//   }
// );

// export const fetchWorkStats = createAsyncThunk(
//   'work/fetchWorkStats',
//   async (_, { rejectWithValue }) => {
//     console.log('📊 [fetchWorkStats] called');
//     try {
//       const response = await workApi.getWorkStats();
//       console.log('📊 [fetchWorkStats] response:', response);
//       return response.data;
//     } catch (error) {
//       console.error('❌ [fetchWorkStats] error:', error);
//       return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats');
//     }
//   }
// );

// export const acceptWorkById = createAsyncThunk(
//   'work/acceptWorkById',
//   async (id, { rejectWithValue, dispatch }) => {
//     console.log('✅ [acceptWorkById] called with id:', id);
//     try {
//       const response = await workApi.acceptWork(id);
//       console.log('✅ [acceptWorkById] response:', response);
      
//       showToast.success('Work accepted successfully');
      
//       await dispatch(fetchMyWorks());
//       await dispatch(fetchWorkById(id));
      
//       return response.data;
//     } catch (error) {
//       console.error('❌ [acceptWorkById] error:', error);
//       showToast.error(error.response?.data?.message || 'Failed to accept work');
//       return rejectWithValue(error.response?.data?.message);
//     }
//   }
// );

// export const assignTailorToWork = createAsyncThunk(
//   'work/assignTailorToWork',
//   async ({ id, tailorId }, { rejectWithValue, dispatch }) => {
//     console.log('👔 [assignTailorToWork] called with:', { id, tailorId });
//     try {
//       const response = await workApi.assignTailor(id, tailorId);
//       console.log('👔 [assignTailorToWork] response:', response);
      
//       showToast.success('Tailor assigned successfully');
//       dispatch(fetchMyWorks());
//       dispatch(fetchWorkById(id));
//       return response.data;
//     } catch (error) {
//       console.error('❌ [assignTailorToWork] error:', error);
//       showToast.error(error.response?.data?.message || 'Failed to assign tailor');
//       return rejectWithValue(error.response?.data?.message);
//     }
//   }
// );

// export const updateWorkStatusById = createAsyncThunk(
//   'work/updateWorkStatusById',
//   async ({ id, status, notes }, { rejectWithValue, dispatch }) => {
//     console.log('\n🔄 ===== UPDATE WORK STATUS THUNK STARTED =====');
//     console.log('📦 Input values:', { 
//       id, 
//       status, 
//       notes: notes || '(empty)'
//     });
    
//     if (!id) {
//       console.error('❌ No work ID provided');
//       showToast.error('Work ID is missing');
//       return rejectWithValue('Work ID is required');
//     }
    
//     if (!status) {
//       console.error('❌ No status provided');
//       showToast.error('Please select a status');
//       return rejectWithValue('Status is required');
//     }
    
//     try {
//       console.log('📤 Calling workApi.updateWorkStatus with:', { 
//         id, 
//         statusData: { 
//           status: status, 
//           notes: notes || '' 
//         } 
//       });
      
//       const response = await workApi.updateWorkStatus(id, { 
//         status: status, 
//         notes: notes || '' 
//       });
      
//       console.log('✅ API Response:', response);
      
//       if (response && response.success) {
//         const statusDisplay = status.replace(/-/g, ' ');
//         showToast.success(`Work status updated to ${statusDisplay}`);
//       }
      
//       // Refresh data
//       await dispatch(fetchMyWorks());
//       await dispatch(fetchWorkById(id));
      
//       return response.data;
      
//     } catch (error) {
//       console.error('❌ [updateWorkStatusById] error:', error);
//       const errorMessage = error.response?.data?.message || error.message || 'Failed to update status';
//       showToast.error(errorMessage);
//       return rejectWithValue(errorMessage);
//     }
//   }
// );

// export const deleteWorkById = createAsyncThunk(
//   'work/deleteWorkById',
//   async (id, { rejectWithValue, dispatch }) => {
//     console.log('🗑️ [deleteWorkById] called with id:', id);
//     try {
//       const response = await workApi.deleteWork(id);
//       console.log('🗑️ [deleteWorkById] response:', response);
      
//       showToast.success('Work deleted successfully');
//       dispatch(fetchWorks());
//       return id;
//     } catch (error) {
//       console.error('❌ [deleteWorkById] error:', error);
//       showToast.error(error.response?.data?.message || 'Failed to delete work');
//       return rejectWithValue(error.response?.data?.message);
//     }
//   }
// );

// export const assignCuttingMasterToWork = createAsyncThunk(
//   'work/assignCuttingMasterToWork',
//   async ({ id, cuttingMasterId }, { rejectWithValue, dispatch }) => {
//     console.log('✂️ [assignCuttingMasterToWork] called with:', { id, cuttingMasterId });
//     try {
//       const response = await workApi.assignCuttingMaster(id, cuttingMasterId);
//       console.log('✂️ [assignCuttingMasterToWork] response:', response);
      
//       showToast.success('Cutting master assigned successfully');
//       dispatch(fetchMyWorks());
//       dispatch(fetchWorkById(id));
//       return response.data;
//     } catch (error) {
//       console.error('❌ [assignCuttingMasterToWork] error:', error);
//       showToast.error(error.response?.data?.message || 'Failed to assign cutting master');
//       return rejectWithValue(error.response?.data?.message);
//     }
//   }
// );

// // ============================================
// // ✅ WORK SLICE
// // ============================================
// const workSlice = createSlice({
//   name: 'work',
//   initialState,
//   reducers: {
//     setFilters: (state, action) => {
//       console.log('🎯 [setFilters]', action.payload);
//       state.filters = { ...state.filters, ...action.payload };
//     },
//     resetFilters: (state) => {
//       console.log('🔄 [resetFilters]');
//       state.filters = initialState.filters;
//     },
//     clearCurrentWork: (state) => {
//       console.log('🧹 [clearCurrentWork]');
//       state.currentWork = null;
//     },
//     // Clear dashboard data
//     clearDashboardData: (state) => {
//       state.dashboardStats = initialState.dashboardStats;
//       state.recentWorks = [];
//       state.statusBreakdown = initialState.statusBreakdown;
//     }
//   },
//   extraReducers: (builder) => {
//     builder
//       // ============================================
//       // ✅ DASHBOARD REDUCERS
//       // ============================================
      
//       // Fetch Dashboard Work Stats
//       .addCase(fetchDashboardWorkStats.pending, (state) => {
//         state.dashboardStats.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchDashboardWorkStats.fulfilled, (state, action) => {
//         state.dashboardStats.loading = false;
//         // Map API response to dashboard stats format
//         state.dashboardStats = {
//           totalWork: action.payload.total || 0,
//           completedWork: action.payload.completed || 0,
//           inProgressWork: action.payload.inProgress || 0,
//           overdueWork: action.payload.overdueWorks || 0,
//           todayWorks: action.payload.todayWorks || 0,
//           loading: false
//         };
//         console.log('✅ Dashboard work stats updated:', state.dashboardStats);
//       })
//       .addCase(fetchDashboardWorkStats.rejected, (state, action) => {
//         state.dashboardStats.loading = false;
//         state.error = action.payload;
//         console.error('❌ Dashboard work stats rejected:', action.payload);
//       })
      
//       // Fetch Recent Works
//       .addCase(fetchRecentWorks.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchRecentWorks.fulfilled, (state, action) => {
//         state.loading = false;
//         state.recentWorks = action.payload.works || [];
//         console.log('✅ Recent works updated:', state.recentWorks.length);
//       })
//       .addCase(fetchRecentWorks.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })
      
//       // Fetch Status Breakdown
//       .addCase(fetchWorkStatusBreakdown.pending, (state) => {
//         state.statusBreakdown.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchWorkStatusBreakdown.fulfilled, (state, action) => {
//         state.statusBreakdown.loading = false;
//         state.statusBreakdown.breakdown = action.payload.breakdown || [];
//         state.statusBreakdown.pieData = action.payload.pieData || [];
//         state.statusBreakdown.total = action.payload.total || 0;
//         console.log('✅ Status breakdown updated:', state.statusBreakdown);
//       })
//       .addCase(fetchWorkStatusBreakdown.rejected, (state, action) => {
//         state.statusBreakdown.loading = false;
//         state.error = action.payload;
//       })
      
//       // ============================================
//       // ✅ EXISTING REDUCERS
//       // ============================================
      
//       // Fetch Works
//       .addCase(fetchWorks.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(fetchWorks.fulfilled, (state, action) => {
//         state.loading = false;
//         state.works = action.payload.works || [];
//         state.pagination = action.payload.pagination || initialState.pagination;
//         if (action.payload.statusCounts) {
//           state.stats = { ...state.stats, ...action.payload.statusCounts };
//         }
//       })
//       .addCase(fetchWorks.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })
      
//       // Fetch My Works (Cutting Master)
//       .addCase(fetchMyWorks.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(fetchMyWorks.fulfilled, (state, action) => {
//         state.loading = false;
//         state.myWorks = action.payload.works || [];
//         state.pagination = action.payload.pagination || initialState.pagination;
//       })
//       .addCase(fetchMyWorks.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })
      
//       // Fetch Work By ID
//       .addCase(fetchWorkById.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(fetchWorkById.fulfilled, (state, action) => {
//         state.loading = false;
//         state.currentWork = action.payload;
//       })
//       .addCase(fetchWorkById.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })
      
//       // ============================================
//       // ✅ FETCH WORK STATS - FIXED
//       // ============================================
//       .addCase(fetchWorkStats.fulfilled, (state, action) => {
//         console.log('✅ fetchWorkStats response:', action.payload);
        
//         // ✅ FIXED: Properly map all possible field names
//         state.stats = { 
//           ...state.stats,
//           // Total works - try multiple possible field names
//           totalWorks: action.payload.totalWorks || 
//                       action.payload.total || 
//                       action.payload.totalWork || 
//                       0,
          
//           // Pending works
//           pendingWorks: action.payload.pendingWorks || 
//                         action.payload.pending || 
//                         0,
          
//           // Accepted works
//           acceptedWorks: action.payload.acceptedWorks || 
//                          action.payload.accepted || 
//                          0,
          
//           // Cutting stages
//           cuttingStarted: action.payload.cuttingStarted || 
//                           action.payload.cutting_started || 
//                           0,
//           cuttingCompleted: action.payload.cuttingCompleted || 
//                             action.payload.cutting_completed || 
//                             0,
          
//           // Sewing stages
//           sewingStarted: action.payload.sewingStarted || 
//                          action.payload.sewing_started || 
//                          0,
//           sewingCompleted: action.payload.sewingCompleted || 
//                            action.payload.sewing_completed || 
//                            0,
          
//           // Other stages
//           ironing: action.payload.ironing || 0,
//           readyToDeliver: action.payload.readyToDeliver || 
//                           action.payload.completed || 
//                           action.payload.ready || 
//                           0,
          
//           // Date based
//           todayWorks: action.payload.todayWorks || 
//                       action.payload.today || 
//                       0,
//           overdueWorks: action.payload.overdueWorks || 
//                         action.payload.overdue || 
//                         0
//         };
        
//         console.log('✅ Updated workStats:', state.stats);
//       })
      
//       // Accept Work
//       .addCase(acceptWorkById.fulfilled, (state, action) => {
//         // Update the work in myWorks if present
//         if (action.payload && state.myWorks.length > 0) {
//           const index = state.myWorks.findIndex(w => w._id === action.payload._id);
//           if (index !== -1) {
//             state.myWorks[index] = action.payload;
//           }
//         }
//       });
//   }
// });

// // ============================================
// // ✅ EXPORT ACTIONS
// // ============================================
// export const { 
//   setFilters, 
//   resetFilters, 
//   clearCurrentWork,
//   clearDashboardData 
// } = workSlice.actions;

// // ============================================
// // ✅ SELECTORS
// // ============================================

// // Existing selectors
// export const selectAllWorks = (state) => state.work.works;
// export const selectMyWorks = (state) => state.work.myWorks;
// export const selectCurrentWork = (state) => state.work.currentWork;
// export const selectWorkStats = (state) => state.work.stats;
// export const selectWorkPagination = (state) => state.work.pagination;
// export const selectWorkFilters = (state) => state.work.filters;
// export const selectWorkLoading = (state) => state.work.loading;

// // ✅ Dashboard selectors - FIXED to match component expectations
// export const selectDashboardStats = (state) => state.work.dashboardStats;
// export const selectRecentWorks = (state) => state.work.recentWorks;
// export const selectWorkStatusBreakdown = (state) => state.work.statusBreakdown;

// export default workSlice.reducer;









// features/work/workSlice.js - COMPLETE CORRECTED VERSION
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import showToast from '../../utils/toast';
import * as workApi from './workApi';

const initialState = {
  works: [],
  myWorks: [],
  tailorWorks: [],
  currentWork: null,
  
  // Dashboard specific states
  dashboardStats: {
    totalWork: 0,
    completedWork: 0,
    inProgressWork: 0,
    overdueWork: 0,
    todayWorks: 0,
    loading: false
  },
  
  recentWorks: [],
  workflowJobs: [],
  workflowJobsLoading: false,
  
  statusBreakdown: {
    breakdown: [],
    pieData: [],
    total: 0,
    loading: false
  },
  
  stats: {
    totalWorks: 0,
    pendingWorks: 0,
    acceptedWorks: 0,
    cuttingStarted: 0,
    cuttingCompleted: 0,
    sewingStarted: 0,
    sewingCompleted: 0,
    ironing: 0,
    readyToDeliver: 0,
    todayWorks: 0,
    overdueWorks: 0
  },
  
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  },
  
  loading: false,
  error: null,
  
  filters: {
    status: '',
    search: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 20
  }
};

// ============================================
// ✅ HELPER FUNCTION TO TRANSFORM WORK DATA
// ============================================
const transformWorkData = (work) => {
  if (!work) return work;
  
  const transformed = { ...work };
  
  // Transform garment data to include category and item names
  if (transformed.garment) {
    // Get category name from populated category object
    if (transformed.garment.category) {
      if (typeof transformed.garment.category === 'object') {
        transformed.garment.categoryName = transformed.garment.category.name || 
                                           transformed.garment.category.categoryName || 
                                           'N/A';
      } else {
        transformed.garment.categoryName = 'N/A';
      }
    } else if (transformed.garment.categoryName) {
      // Already have categoryName
      transformed.garment.categoryName = transformed.garment.categoryName;
    } else {
      transformed.garment.categoryName = 'N/A';
    }
    
    // Get item name from populated item object
    if (transformed.garment.item) {
      if (typeof transformed.garment.item === 'object') {
        transformed.garment.itemName = transformed.garment.item.name || 
                                       transformed.garment.item.itemName || 
                                       'N/A';
      } else {
        transformed.garment.itemName = 'N/A';
      }
    } else if (transformed.garment.itemName) {
      // Already have itemName
      transformed.garment.itemName = transformed.garment.itemName;
    } else {
      transformed.garment.itemName = 'N/A';
    }
    
    // Ensure priceRange exists
    if (!transformed.garment.priceRange) {
      transformed.garment.priceRange = { min: 0, max: 0 };
    }
    
    // Ensure measurements is an array
    if (!transformed.garment.measurements) {
      transformed.garment.measurements = [];
    }
    
    // Ensure images arrays exist
    if (!transformed.garment.referenceImages) transformed.garment.referenceImages = [];
    if (!transformed.garment.customerImages) transformed.garment.customerImages = [];
    if (!transformed.garment.customerClothImages) transformed.garment.customerClothImages = [];
  }
  
  return transformed;
};

// Transform array of works
const transformWorksData = (works) => {
  if (!works || !Array.isArray(works)) return [];
  return works.map(work => transformWorkData(work));
};

// ============================================
// ✅ DASHBOARD THUNKS
// ============================================

export const fetchDashboardWorkStats = createAsyncThunk(
  'work/fetchDashboardWorkStats',
  async (params = {}, { rejectWithValue }) => {
    console.log('📊 [fetchDashboardWorkStats] called with params:', params);
    try {
      const response = await workApi.getDashboardWorkStats(params);
      console.log('📊 [fetchDashboardWorkStats] response:', response);
      return response.data;
    } catch (error) {
      console.error('❌ [fetchDashboardWorkStats] error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch work stats');
    }
  }
);

export const fetchRecentWorks = createAsyncThunk(
  'work/fetchRecentWorks',
  async (params = {}, { rejectWithValue }) => {
    console.log('📋 [fetchRecentWorks] called with params:', params);
    try {
      const response = await workApi.getRecentWorks(params);
      console.log('📋 [fetchRecentWorks] response:', response);
      return response.data;
    } catch (error) {
      console.error('❌ [fetchRecentWorks] error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch recent works');
    }
  }
);

export const fetchWorkStatusBreakdown = createAsyncThunk(
  'work/fetchWorkStatusBreakdown',
  async (params = {}, { rejectWithValue }) => {
    console.log('🥧 [fetchWorkStatusBreakdown] called with params:', params);
    try {
      const response = await workApi.getWorkStatusBreakdown(params);
      console.log('🥧 [fetchWorkStatusBreakdown] response:', response);
      return response.data;
    } catch (error) {
      console.error('❌ [fetchWorkStatusBreakdown] error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch status breakdown');
    }
  }
);

// Fetch backend-synthesized workflow jobs (replaces localStorage engine)
export const fetchWorkflowJobs = createAsyncThunk(
  'work/fetchWorkflowJobs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await workApi.getWorkflowJobs();
      return response.data || [];
    } catch (error) {
      console.error('❌ [fetchWorkflowJobs] error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch workflow jobs');
    }
  }
);

// ============================================
// ✅ EXISTING THUNKS
// ============================================

export const fetchWorks = createAsyncThunk(
  'work/fetchWorks',
  async (filters = {}, { rejectWithValue, getState }) => {
    console.log('📋 [fetchWorks] called with filters:', filters);
    try {
      const { work } = getState();
      const currentFilters = { ...work.filters, ...filters };
      console.log('📋 [fetchWorks] current filters:', currentFilters);
      
      const response = await workApi.getWorks(currentFilters);
      console.log('📋 [fetchWorks] response:', response);
      return response.data;
    } catch (error) {
      console.error('❌ [fetchWorks] error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch works');
    }
  }
);

export const fetchMyWorks = createAsyncThunk(
  'work/fetchMyWorks',
  async (filters = {}, { rejectWithValue }) => {
    console.log('📋 [fetchMyWorks] called with filters:', filters);
    try {
      const response = await workApi.getMyWorks(filters);
      console.log('📋 [fetchMyWorks] response:', response);
      return response.data;
    } catch (error) {
      console.error('❌ [fetchMyWorks] error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch your works');
    }
  }
);

export const fetchWorkById = createAsyncThunk(
  'work/fetchWorkById',
  async (id, { rejectWithValue }) => {
    console.log('📋 [fetchWorkById] called with id:', id);
    try {
      const response = await workApi.getWorkById(id);
      console.log('📋 [fetchWorkById] response:', response);
      
      // ✅ Transform the work data to ensure category and item names
      const transformedWork = transformWorkData(response.data);
      console.log('📋 [fetchWorkById] transformed garment:', {
        name: transformedWork?.garment?.name,
        categoryName: transformedWork?.garment?.categoryName,
        itemName: transformedWork?.garment?.itemName
      });
      
      return transformedWork;
    } catch (error) {
      console.error('❌ [fetchWorkById] error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch work');
    }
  }
);

export const fetchWorkStats = createAsyncThunk(
  'work/fetchWorkStats',
  async (_, { rejectWithValue }) => {
    console.log('📊 [fetchWorkStats] called');
    try {
      const response = await workApi.getWorkStats();
      console.log('📊 [fetchWorkStats] response:', response);
      return response.data;
    } catch (error) {
      console.error('❌ [fetchWorkStats] error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats');
    }
  }
);

export const acceptWorkById = createAsyncThunk(
  'work/acceptWorkById',
  async (id, { rejectWithValue, dispatch }) => {
    console.log('✅ [acceptWorkById] called with id:', id);
    try {
      const response = await workApi.acceptWork(id);
      console.log('✅ [acceptWorkById] response:', response);
      
      showToast.success('Work accepted successfully');
      
      await dispatch(fetchMyWorks());
      await dispatch(fetchWorkById(id));
      
      return transformWorkData(response.data);
    } catch (error) {
      console.error('❌ [acceptWorkById] error:', error);
      showToast.error(error.response?.data?.message || 'Failed to accept work');
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const assignTailorToWork = createAsyncThunk(
  'work/assignTailorToWork',
  async ({ id, tailorId }, { rejectWithValue, dispatch }) => {
    console.log('👔 [assignTailorToWork] called with:', { id, tailorId });
    try {
      const response = await workApi.assignTailor(id, tailorId);
      console.log('👔 [assignTailorToWork] response:', response);
      
      showToast.success('Tailor assigned successfully');
      dispatch(fetchMyWorks());
      dispatch(fetchWorkById(id));
      return transformWorkData(response.data);
    } catch (error) {
      console.error('❌ [assignTailorToWork] error:', error);
      showToast.error(error.response?.data?.message || 'Failed to assign tailor');
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const updateWorkStatusById = createAsyncThunk(
  'work/updateWorkStatusById',
  async ({ id, status, notes }, { rejectWithValue, dispatch }) => {
    console.log('\n🔄 ===== UPDATE WORK STATUS THUNK STARTED =====');
    console.log('📦 Input values:', { id, status, notes: notes || '(empty)' });
    
    if (!id) {
      console.error('❌ No work ID provided');
      showToast.error('Work ID is missing');
      return rejectWithValue('Work ID is required');
    }
    
    if (!status) {
      console.error('❌ No status provided');
      showToast.error('Please select a status');
      return rejectWithValue('Status is required');
    }
    
    try {
      const response = await workApi.updateWorkStatus(id, { 
        status: status, 
        notes: notes || '' 
      });
      
      console.log('✅ API Response:', response);
      
      if (response && response.success) {
        const statusDisplay = status.replace(/-/g, ' ');
        showToast.success(`Work status updated to ${statusDisplay}`);
      }
      
      // Refresh data
      await dispatch(fetchMyWorks());
      await dispatch(fetchWorkById(id));
      
      return transformWorkData(response.data);
      
    } catch (error) {
      console.error('❌ [updateWorkStatusById] error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update status';
      showToast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteWorkById = createAsyncThunk(
  'work/deleteWorkById',
  async (id, { rejectWithValue, dispatch }) => {
    console.log('🗑️ [deleteWorkById] called with id:', id);
    try {
      const response = await workApi.deleteWork(id);
      console.log('🗑️ [deleteWorkById] response:', response);
      
      showToast.success('Work deleted successfully');
      dispatch(fetchWorks());
      return id;
    } catch (error) {
      console.error('❌ [deleteWorkById] error:', error);
      showToast.error(error.response?.data?.message || 'Failed to delete work');
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const assignCuttingMasterToWork = createAsyncThunk(
  'work/assignCuttingMasterToWork',
  async ({ id, cuttingMasterId }, { rejectWithValue, dispatch }) => {
    console.log('✂️ [assignCuttingMasterToWork] called with:', { id, cuttingMasterId });
    try {
      const response = await workApi.assignCuttingMaster(id, cuttingMasterId);
      console.log('✂️ [assignCuttingMasterToWork] response:', response);
      
      showToast.success('Cutting master assigned successfully');
      dispatch(fetchMyWorks());
      dispatch(fetchWorkById(id));
      return transformWorkData(response.data);
    } catch (error) {
      console.error('❌ [assignCuttingMasterToWork] error:', error);
      showToast.error(error.response?.data?.message || 'Failed to assign cutting master');
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// ============================================
// ✅ WORK SLICE
// ============================================
const workSlice = createSlice({
  name: 'work',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      console.log('🎯 [setFilters]', action.payload);
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      console.log('🔄 [resetFilters]');
      state.filters = initialState.filters;
    },
    clearCurrentWork: (state) => {
      console.log('🧹 [clearCurrentWork]');
      state.currentWork = null;
    },
    clearDashboardData: (state) => {
      state.dashboardStats = initialState.dashboardStats;
      state.recentWorks = [];
      state.statusBreakdown = initialState.statusBreakdown;
    }
  },
  extraReducers: (builder) => {
    builder
      // ============================================
      // ✅ DASHBOARD REDUCERS
      // ============================================
      .addCase(fetchDashboardWorkStats.pending, (state) => {
        state.dashboardStats.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardWorkStats.fulfilled, (state, action) => {
        state.dashboardStats.loading = false;
        state.dashboardStats = {
          totalWork: action.payload.total || 0,
          completedWork: action.payload.completed || 0,
          inProgressWork: action.payload.inProgress || 0,
          overdueWork: action.payload.overdueWorks || 0,
          todayWorks: action.payload.todayWorks || 0,
          loading: false
        };
        console.log('✅ Dashboard work stats updated:', state.dashboardStats);
      })
      .addCase(fetchDashboardWorkStats.rejected, (state, action) => {
        state.dashboardStats.loading = false;
        state.error = action.payload;
        console.error('❌ Dashboard work stats rejected:', action.payload);
      })
      
      // Fetch Recent Works
      .addCase(fetchRecentWorks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecentWorks.fulfilled, (state, action) => {
        state.loading = false;
        state.recentWorks = transformWorksData(action.payload.works || []);
        console.log('✅ Recent works updated:', state.recentWorks.length);
      })
      .addCase(fetchRecentWorks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Status Breakdown
      .addCase(fetchWorkStatusBreakdown.pending, (state) => {
        state.statusBreakdown.loading = true;
        state.error = null;
      })
      .addCase(fetchWorkStatusBreakdown.fulfilled, (state, action) => {
        state.statusBreakdown.loading = false;
        state.statusBreakdown.breakdown = action.payload.breakdown || [];
        state.statusBreakdown.pieData = action.payload.pieData || [];
        state.statusBreakdown.total = action.payload.total || 0;
        console.log('✅ Status breakdown updated:', state.statusBreakdown);
      })
      .addCase(fetchWorkStatusBreakdown.rejected, (state, action) => {
        state.statusBreakdown.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Works
      .addCase(fetchWorks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWorks.fulfilled, (state, action) => {
        state.loading = false;
        state.works = transformWorksData(action.payload.works || []);
        state.pagination = action.payload.pagination || initialState.pagination;
        if (action.payload.statusCounts) {
          state.stats = { ...state.stats, ...action.payload.statusCounts };
        }
      })
      .addCase(fetchWorks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch My Works (Cutting Master)
      .addCase(fetchMyWorks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyWorks.fulfilled, (state, action) => {
        state.loading = false;
        state.myWorks = transformWorksData(action.payload.works || []);
        state.pagination = action.payload.pagination || initialState.pagination;
      })
      .addCase(fetchMyWorks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Work By ID - Already transformed in thunk
      .addCase(fetchWorkById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWorkById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentWork = action.payload;
      })
      .addCase(fetchWorkById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Work Stats
      .addCase(fetchWorkStats.fulfilled, (state, action) => {
        console.log('✅ fetchWorkStats response:', action.payload);
        
        state.stats = { 
          ...state.stats,
          totalWorks: action.payload.totalWorks || action.payload.total || action.payload.totalWork || 0,
          pendingWorks: action.payload.pendingWorks || action.payload.pending || 0,
          acceptedWorks: action.payload.acceptedWorks || action.payload.accepted || 0,
          cuttingStarted: action.payload.cuttingStarted || action.payload.cutting_started || 0,
          cuttingCompleted: action.payload.cuttingCompleted || action.payload.cutting_completed || 0,
          sewingStarted: action.payload.sewingStarted || action.payload.sewing_started || 0,
          sewingCompleted: action.payload.sewingCompleted || action.payload.sewing_completed || 0,
          ironing: action.payload.ironing || 0,
          readyToDeliver: action.payload.readyToDeliver || action.payload.completed || action.payload.ready || 0,
          todayWorks: action.payload.todayWorks || action.payload.today || 0,
          overdueWorks: action.payload.overdueWorks || action.payload.overdue || 0
        };
        
        console.log('✅ Updated workStats:', state.stats);
      })
      
      // Accept Work
      .addCase(acceptWorkById.fulfilled, (state, action) => {
        if (action.payload && state.myWorks.length > 0) {
          const index = state.myWorks.findIndex(w => w._id === action.payload._id);
          if (index !== -1) {
            state.myWorks[index] = action.payload;
          }
        }
      })

      // Workflow jobs (backend-synthesized)
      .addCase(fetchWorkflowJobs.pending, (state) => {
        state.workflowJobsLoading = true;
      })
      .addCase(fetchWorkflowJobs.fulfilled, (state, action) => {
        state.workflowJobsLoading = false;
        state.workflowJobs = action.payload;
      })
      .addCase(fetchWorkflowJobs.rejected, (state) => {
        state.workflowJobsLoading = false;
      });
  }
});

// ============================================
// ✅ EXPORT ACTIONS
// ============================================
export const { 
  setFilters, 
  resetFilters, 
  clearCurrentWork,
  clearDashboardData 
} = workSlice.actions;

// ============================================
// ✅ SELECTORS
// ============================================

export const selectAllWorks = (state) => state.work.works;
export const selectMyWorks = (state) => state.work.myWorks;
export const selectCurrentWork = (state) => state.work.currentWork;
export const selectWorkStats = (state) => state.work.stats;
export const selectWorkPagination = (state) => state.work.pagination;
export const selectWorkFilters = (state) => state.work.filters;
export const selectWorkLoading = (state) => state.work.loading;
export const selectDashboardStats = (state) => state.work.dashboardStats;
export const selectRecentWorks = (state) => state.work.recentWorks;
export const selectWorkStatusBreakdown = (state) => state.work.statusBreakdown;
export const selectWorkflowJobs = (state) => state.work.workflowJobs || [];
export const selectWorkflowJobsLoading = (state) => state.work.workflowJobsLoading;

export default workSlice.reducer;