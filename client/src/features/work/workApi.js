// // features/work/workApi.js
// import API from "../../app/axios";

// // Get all works (with filters)
// export const getWorks = async (filters = {}) => {
//   const queryParams = new URLSearchParams();
  
//   Object.entries(filters).forEach(([key, value]) => {
//     if (value !== '' && value !== null && value !== undefined) {
//       queryParams.append(key, value);
//     }
//   });

//   const response = await API.get(`/works?${queryParams}`);
//   return response.data;
// };

// // Get work by ID
// export const getWorkById = async (id) => {
//   const response = await API.get(`/works/${id}`);
//   return response.data;
// };

// // Get works by cutting master
// export const getMyWorks = async (filters = {}) => {
//   const queryParams = new URLSearchParams(filters);
//   const response = await API.get(`/works/my-works?${queryParams}`);
//   return response.data;
// };

// // Get works by tailor
// export const getTailorWorks = async (filters = {}) => {
//   const queryParams = new URLSearchParams(filters);
//   const response = await API.get(`/works/tailor-works?${queryParams}`);
//   return response.data;
// };

// // Get work statistics
// export const getWorkStats = async () => {
//   const response = await API.get('/works/stats');
//   return response.data;
// };

// // Accept work (Cutting Master only)
// export const acceptWork = async (id) => {
//   const response = await API.patch(`/works/${id}/accept`);
//   return response.data;
// };

// // Assign tailor (Cutting Master only)
// export const assignTailor = async (id, tailorId) => {
//   const response = await API.patch(`/works/${id}/assign-tailor`, { tailorId });
//   return response.data;
// };

// // Update work status (Cutting Master only)
// export const updateWorkStatus = async (id, statusData) => {
//   const response = await API.patch(`/works/${id}/status`, statusData);
//   return response.data;
// };

// // Delete work (Admin only)
// export const deleteWork = async (id) => {
//   const response = await API.delete(`/works/${id}`);
//   return response.data;
// };




// features/work/workApi.js - UPDATED WITH DASHBOARD FUNCTIONS
import API from "../../app/axios";

// ============================================
// ✅ DASHBOARD APIs (NEW)
// ============================================

// Get work stats for dashboard (with date filters)
export const getDashboardWorkStats = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) {
      queryParams.append(key, value);
    }
  });

  const response = await API.get(`/works/dashboard/stats?${queryParams}`);
  return response.data;
};

// Get recent works for dashboard
export const getRecentWorks = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) {
      queryParams.append(key, value);
    }
  });

  const response = await API.get(`/works/dashboard/recent?${queryParams}`);
  return response.data;
};

// Get work status breakdown for pie chart
export const getWorkStatusBreakdown = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) {
      queryParams.append(key, value);
    }
  });

  const response = await API.get(`/works/dashboard/breakdown?${queryParams}`);
  return response.data;
};

// ============================================
// ✅ ADMIN UTILITY APIs
// ============================================

// Recalculate stats for a specific tailor
export const recalculateTailorStats = async (tailorId) => {
  const response = await API.post(`/works/recalculate-tailor-stats/${tailorId}`);
  return response.data;
};

// Recalculate stats for all tailors
export const recalculateAllTailorStats = async () => {
  const response = await API.post('/works/recalculate-all-tailor-stats');
  return response.data;
};

// ============================================
// ✅ EXISTING APIs
// ============================================

// Get all works (with filters)
export const getWorks = async (filters = {}) => {
  const queryParams = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) {
      queryParams.append(key, value);
    }
  });

  const response = await API.get(`/works?${queryParams}`);
  return response.data;
};

// Get work by ID
export const getWorkById = async (id) => {
  const response = await API.get(`/works/${id}`);
  return response.data;
};

// Get works by cutting master
export const getMyWorks = async (filters = {}) => {
  const queryParams = new URLSearchParams(filters);
  const response = await API.get(`/works/my-works?${queryParams}`);
  return response.data;
};

// Get works by tailor
export const getTailorWorks = async (filters = {}) => {
  const queryParams = new URLSearchParams(filters);
  const response = await API.get(`/works/tailor-works?${queryParams}`);
  return response.data;
};

// Get work statistics
export const getWorkStats = async () => {
  const response = await API.get('/works/stats');
  return response.data;
};

// Accept work (Cutting Master only)
export const acceptWork = async (id) => {
  const response = await API.patch(`/works/${id}/accept`);
  return response.data;
};

// Assign tailor (Cutting Master only)
export const assignTailor = async (id, tailorId) => {
  const response = await API.patch(`/works/${id}/assign-tailor`, { tailorId });
  return response.data;
};

// Assign cutting master (Admin/Store Keeper)
export const assignCuttingMaster = async (id, cuttingMasterId) => {
  const response = await API.patch(`/works/${id}/assign-cutting-master`, { cuttingMasterId });
  return response.data;
};

// Update work status (Cutting Master only)
export const updateWorkStatus = async (id, statusData) => {
  const response = await API.patch(`/works/${id}/status`, statusData);
  return response.data;
};

// Delete work (Admin only)
export const deleteWork = async (id) => {
  const response = await API.delete(`/works/${id}`);
  return response.data;
};

// Get backend-synthesized workflow jobs (MongoDB SSOT)
export const getWorkflowJobs = async () => {
  const response = await API.get('/workflow/jobs');
  return response.data;
};

/** Complete active stage and advance pipeline (same as QR scan) */
export const completeWorkflowStage = async (workId) => {
  const response = await API.post(`/workflow/works/${workId}/scan`, {});
  return response.data;
};
