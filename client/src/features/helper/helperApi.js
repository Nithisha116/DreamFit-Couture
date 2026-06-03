// import API from "../../app/axios";

// // ===== GET ALL HELPERS =====
// export const getAllHelpersApi = async (params = {}) => {
//   const { 
//     search, 
//     status, 
//     availability,
//     page,
//     limit,
//     sortField,
//     sortOrder
//   } = params;
  
//   let url = "/helpers";
//   const queryParams = [];
  
//   // Search & Filters
//   if (search) queryParams.push(`search=${encodeURIComponent(search)}`);
//   if (status && status !== 'all') queryParams.push(`status=${status}`);
//   if (availability && availability !== 'all') queryParams.push(`availability=${availability}`);
  
//   // ✅ Pagination
//   if (page) queryParams.push(`page=${page}`);
//   if (limit) queryParams.push(`limit=${limit}`);
  
//   // ✅ Sorting
//   if (sortField) queryParams.push(`sortField=${sortField}`);
//   if (sortOrder) queryParams.push(`sortOrder=${sortOrder}`);
  
//   if (queryParams.length > 0) {
//     url += `?${queryParams.join('&')}`;
//   }
  
//   console.log("📡 API Request:", url);
  
//   const response = await API.get(url);
//   return response.data;
// };

// // ===== GET HELPER BY ID =====
// export const getHelperByIdApi = async (id) => {
//   console.log(`📡 Fetching helper: ${id}`);
//   const response = await API.get(`/helpers/${id}`);
//   return response.data;
// };

// // ===== CREATE HELPER =====
// export const createHelperApi = async (helperData) => {
//   console.log("📝 Creating helper:", helperData);
//   const response = await API.post("/helpers", helperData);
//   return response.data;
// };

// // ===== UPDATE HELPER =====
// export const updateHelperApi = async (id, helperData) => {
//   console.log(`📝 Updating helper: ${id}`, helperData);
//   const response = await API.put(`/helpers/${id}`, helperData);
//   return response.data;
// };

// // ===== UPDATE LEAVE STATUS =====
// export const updateLeaveStatusApi = async (id, leaveData) => {
//   console.log(`📝 Updating leave status: ${id}`, leaveData);
//   const response = await API.patch(`/helpers/${id}/leave`, leaveData);
//   return response.data;
// };

// // ✅ NEW: TOGGLE HELPER STATUS
// export const toggleHelperStatusApi = async (id) => {
//   console.log(`🔄 Toggling helper status: ${id}`);
//   const response = await API.patch(`/helpers/${id}/toggle-status`);
//   return response.data;
// };

// // ===== DELETE HELPER =====
// export const deleteHelperApi = async (id) => {
//   console.log(`🗑️ Deleting helper: ${id}`);
//   const response = await API.delete(`/helpers/${id}`);
//   return response.data;
// };

// // ===== GET HELPER STATS =====
// export const getHelperStatsApi = async () => {
//   console.log("📡 Fetching helper stats");
//   const response = await API.get("/helpers/stats");
//   return response.data;
// };

// // ✅ NEW: BULK OPERATIONS (Optional)
// export const bulkDeleteHelpersApi = async (ids) => {
//   console.log(`🗑️ Bulk deleting helpers:`, ids);
//   const response = await API.post("/helpers/bulk-delete", { ids });
//   return response.data;
// };

// export const bulkUpdateStatusApi = async (ids, isActive) => {
//   console.log(`🔄 Bulk updating status:`, { ids, isActive });
//   const response = await API.post("/helpers/bulk-status", { ids, isActive });
//   return response.data;
// };





import API from "../../app/axios";

// ===== GET ALL HELPERS =====
export const getAllHelpersApi = async (params = {}) => {
  const { 
    search, 
    status, 
    availability,
    page,
    limit,
    sortField,
    sortOrder
  } = params;
  
  let url = "/helpers";
  const queryParams = [];
  
  // Search & Filters
  if (search) queryParams.push(`search=${encodeURIComponent(search)}`);
  if (status && status !== 'all') queryParams.push(`status=${status}`);
  if (availability && availability !== 'all') queryParams.push(`availability=${availability}`);
  
  // Pagination
  if (page) queryParams.push(`page=${page}`);
  if (limit) queryParams.push(`limit=${limit}`);
  
  // Sorting
  if (sortField) queryParams.push(`sortField=${sortField}`);
  if (sortOrder) queryParams.push(`sortOrder=${sortOrder}`);
  
  if (queryParams.length > 0) {
    url += `?${queryParams.join('&')}`;
  }
  
  console.log("📡 API Request:", url);
  
  const response = await API.get(url);
  return response.data;
};

// ===== GET HELPER BY ID =====
export const getHelperByIdApi = async (id) => {
  console.log(`📡 Fetching helper: ${id}`);
  const response = await API.get(`/helpers/${id}`);
  return response.data;
};

// ===== CREATE HELPER =====
export const createHelperApi = async (helperData) => {
  console.log("📝 Creating helper:", helperData);
  const response = await API.post("/helpers", helperData);
  return response.data;
};

// ===== UPDATE HELPER =====
export const updateHelperApi = async (id, helperData) => {
  console.log(`📝 Updating helper: ${id}`, helperData);
  const response = await API.put(`/helpers/${id}`, helperData);
  return response.data;
};

// ===== UPDATE LEAVE STATUS =====
export const updateLeaveStatusApi = async (id, leaveData) => {
  console.log(`📝 Updating leave status: ${id}`, leaveData);
  const response = await API.patch(`/helpers/${id}/leave`, leaveData);
  return response.data;
};

// ✅ TOGGLE HELPER STATUS
export const toggleHelperStatusApi = async (id) => {
  console.log(`🔄 Toggling helper status: ${id}`);
  const response = await API.patch(`/helpers/${id}/toggle-status`);
  return response.data;
};

// ===== DELETE HELPER =====
export const deleteHelperApi = async (id) => {
  console.log(`🗑️ Deleting helper: ${id}`);
  const response = await API.delete(`/helpers/${id}`);
  return response.data;
};

// ============================================
// ✅ DASHBOARD APIS (NEW)
// ============================================

// ===== GET HELPER STATS =====
export const getHelperStatsApi = async () => {
  console.log("📊 Fetching helper stats for dashboard");
  const response = await API.get("/helpers/stats");
  return response.data;
};

// ===== GET TOP HELPERS =====
export const getTopHelpersApi = async (limit = 5, period = 'month') => {
  console.log(`🏆 Fetching top ${limit} helpers for period: ${period}`);
  const response = await API.get(`/helpers/top?limit=${limit}&period=${period}`);
  return response.data;
};

// ===== GET HELPER PERFORMANCE =====
export const getHelperPerformanceApi = async (period = 'month', helperId = null) => {
  let url = `/helpers/performance?period=${period}`;
  if (helperId) {
    url += `&helperId=${helperId}`;
  }
  console.log(`📈 Fetching helper performance: ${url}`);
  const response = await API.get(url);
  return response.data;
};

// ============================================
// ✅ ADMIN UTILITY APIS
// ============================================

// ===== FIX ALL HELPER STATS =====
export const fixAllHelperStatsApi = async () => {
  console.log("🔧 Fixing all helper stats");
  const response = await API.post("/helpers/fix-stats");
  return response.data;
};

// ===== BULK OPERATIONS =====
export const bulkDeleteHelpersApi = async (ids) => {
  console.log(`🗑️ Bulk deleting helpers:`, ids);
  const response = await API.post("/helpers/bulk-delete", { ids });
  return response.data;
};

export const bulkUpdateStatusApi = async (ids, isActive) => {
  console.log(`🔄 Bulk updating status:`, { ids, isActive });
  const response = await API.post("/helpers/bulk-status", { ids, isActive });
  return response.data;
};
