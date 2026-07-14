// import API from "../../app/axios";

// // ===== GET ALL TAILORS =====
// export const getAllTailorsApi = async (params = {}) => {
//   const { 
//     search, 
//     status, 
//     availability,
//     page,
//     limit,
//     sortField,
//     sortOrder
//   } = params;
  
//   let url = "/tailors";
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

// // ===== GET TAILOR BY ID =====
// export const getTailorByIdApi = async (id) => {
//   console.log(`📡 Fetching tailor: ${id}`);
//   const response = await API.get(`/tailors/${id}`);
//   return response.data;
// };

// // ===== CREATE TAILOR =====
// export const createTailorApi = async (tailorData) => {
//   console.log("📝 Creating tailor:", tailorData);
//   const response = await API.post("/tailors", tailorData);
//   return response.data;
// };

// // ===== UPDATE TAILOR =====
// export const updateTailorApi = async (id, tailorData) => {
//   console.log(`📝 Updating tailor: ${id}`, tailorData);
//   const response = await API.put(`/tailors/${id}`, tailorData);
//   return response.data;
// };

// // ===== UPDATE LEAVE STATUS =====
// export const updateLeaveStatusApi = async (id, leaveData) => {
//   console.log(`📝 Updating leave status: ${id}`, leaveData);
//   const response = await API.patch(`/tailors/${id}/leave`, leaveData);
//   return response.data;
// };

// // ✅ NEW: TOGGLE TAILOR STATUS
// export const toggleTailorStatusApi = async (id) => {
//   console.log(`🔄 Toggling tailor status: ${id}`);
//   const response = await API.patch(`/tailors/${id}/toggle-status`);
//   return response.data;
// };

// // ===== DELETE TAILOR =====
// export const deleteTailorApi = async (id) => {
//   console.log(`🗑️ Deleting tailor: ${id}`);
//   const response = await API.delete(`/tailors/${id}`);
//   return response.data;
// };

// // ===== GET TAILOR STATS =====
// export const getTailorStatsApi = async () => {
//   console.log("📡 Fetching tailor stats");
//   const response = await API.get("/tailors/stats");
//   return response.data;
// };

// // ✅ NEW: BULK OPERATIONS (Optional)
// export const bulkDeleteTailorsApi = async (ids) => {
//   console.log(`🗑️ Bulk deleting tailors:`, ids);
//   const response = await API.post("/tailors/bulk-delete", { ids });
//   return response.data;
// };

// export const bulkUpdateStatusApi = async (ids, isActive) => {
//   console.log(`🔄 Bulk updating status:`, { ids, isActive });
//   const response = await API.post("/tailors/bulk-status", { ids, isActive });
//   return response.data;
// };



import API from "../../app/axios";

// ===== GET ALL TAILORS =====
export const getAllTailorsApi = async (params = {}) => {
  const { 
    search, 
    status, 
    availability,
    page,
    limit,
    sortField,
    sortOrder,
    isActive
  } = params;
  
  let url = "/tailors";
  const queryParams = [];
  
  // Search & Filters
  if (search) queryParams.push(`search=${encodeURIComponent(search)}`);
  if (status && status !== 'all') queryParams.push(`status=${status}`);
  if (availability && availability !== 'all') queryParams.push(`availability=${availability}`);
  if (isActive) queryParams.push(`isActive=${isActive}`);
  
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

// ===== GET TAILOR BY ID =====
export const getTailorByIdApi = async (id) => {
  console.log(`📡 Fetching tailor: ${id}`);
  const response = await API.get(`/tailors/${id}`);
  return response.data;
};

// ===== CREATE TAILOR =====
export const createTailorApi = async (tailorData) => {
  console.log("📝 Creating tailor:", tailorData);
  const response = await API.post("/tailors", tailorData);
  return response.data;
};

// ===== UPDATE TAILOR =====
export const updateTailorApi = async (id, tailorData) => {
  console.log(`📝 Updating tailor: ${id}`, tailorData);
  const response = await API.put(`/tailors/${id}`, tailorData);
  return response.data;
};

// ===== UPDATE LEAVE STATUS =====
export const updateLeaveStatusApi = async (id, leaveData) => {
  console.log(`📝 Updating leave status: ${id}`, leaveData);
  const response = await API.patch(`/tailors/${id}/leave`, leaveData);
  return response.data;
};

// ✅ TOGGLE TAILOR STATUS
export const toggleTailorStatusApi = async (id) => {
  console.log(`🔄 Toggling tailor status: ${id}`);
  const response = await API.patch(`/tailors/${id}/toggle-status`);
  return response.data;
};

// ===== DELETE TAILOR =====
export const deleteTailorApi = async (id) => {
  console.log(`🗑️ Deleting tailor: ${id}`);
  const response = await API.delete(`/tailors/${id}`);
  return response.data;
};

// ============================================
// ✅ DASHBOARD APIS (NEW)
// ============================================

// ===== GET TAILOR STATS =====
export const getTailorStatsApi = async () => {
  console.log("📊 Fetching tailor stats for dashboard");
  const response = await API.get("/tailors/stats");
  return response.data;
};

// ===== GET TOP TAILORS =====
export const getTopTailorsApi = async (limit = 5, period = 'month') => {
  console.log(`🏆 Fetching top ${limit} tailors for period: ${period}`);
  const response = await API.get(`/tailors/top?limit=${limit}&period=${period}`);
  return response.data;
};

// ===== GET TAILOR PERFORMANCE =====
export const getTailorPerformanceApi = async (period = 'month', tailorId = null) => {
  let url = `/tailors/performance?period=${period}`;
  if (tailorId) {
    url += `&tailorId=${tailorId}`;
  }
  console.log(`📈 Fetching tailor performance: ${url}`);
  const response = await API.get(url);
  return response.data;
};

// ============================================
// ✅ ADMIN UTILITY APIS
// ============================================

// ===== FIX ALL TAILOR STATS =====
export const fixAllTailorStatsApi = async () => {
  console.log("🔧 Fixing all tailor stats");
  const response = await API.post("/tailors/fix-stats");
  return response.data;
};

// ===== BULK OPERATIONS =====
export const bulkDeleteTailorsApi = async (ids) => {
  console.log(`🗑️ Bulk deleting tailors:`, ids);
  const response = await API.post("/tailors/bulk-delete", { ids });
  return response.data;
};

export const bulkUpdateStatusApi = async (ids, isActive) => {
  console.log(`🔄 Bulk updating status:`, { ids, isActive });
  const response = await API.post("/tailors/bulk-status", { ids, isActive });
  return response.data;
};