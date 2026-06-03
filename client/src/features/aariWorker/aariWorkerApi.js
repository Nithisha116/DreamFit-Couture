// import API from "../../app/axios";

// // ===== GET ALL AARI_WORKERS =====
// export const getAllAariWorkersApi = async (params = {}) => {
//   const { 
//     search, 
//     status, 
//     availability,
//     page,
//     limit,
//     sortField,
//     sortOrder
//   } = params;
  
//   let url = "/aari-workers";
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

// // ===== GET AARI_WORKER BY ID =====
// export const getAariWorkerByIdApi = async (id) => {
//   console.log(`📡 Fetching aariWorker: ${id}`);
//   const response = await API.get(`/aari-workers/${id}`);
//   return response.data;
// };

// // ===== CREATE AARI_WORKER =====
// export const createAariWorkerApi = async (aariWorkerData) => {
//   console.log("📝 Creating aariWorker:", aariWorkerData);
//   const response = await API.post("/aari-workers", aariWorkerData);
//   return response.data;
// };

// // ===== UPDATE AARI_WORKER =====
// export const updateAariWorkerApi = async (id, aariWorkerData) => {
//   console.log(`📝 Updating aariWorker: ${id}`, aariWorkerData);
//   const response = await API.put(`/aari-workers/${id}`, aariWorkerData);
//   return response.data;
// };

// // ===== UPDATE LEAVE STATUS =====
// export const updateLeaveStatusApi = async (id, leaveData) => {
//   console.log(`📝 Updating leave status: ${id}`, leaveData);
//   const response = await API.patch(`/aari-workers/${id}/leave`, leaveData);
//   return response.data;
// };

// // ✅ NEW: TOGGLE AARI_WORKER STATUS
// export const toggleAariWorkerStatusApi = async (id) => {
//   console.log(`🔄 Toggling aariWorker status: ${id}`);
//   const response = await API.patch(`/aari-workers/${id}/toggle-status`);
//   return response.data;
// };

// // ===== DELETE AARI_WORKER =====
// export const deleteAariWorkerApi = async (id) => {
//   console.log(`🗑️ Deleting aariWorker: ${id}`);
//   const response = await API.delete(`/aari-workers/${id}`);
//   return response.data;
// };

// // ===== GET AARI_WORKER STATS =====
// export const getAariWorkerStatsApi = async () => {
//   console.log("📡 Fetching aariWorker stats");
//   const response = await API.get("/aari-workers/stats");
//   return response.data;
// };

// // ✅ NEW: BULK OPERATIONS (Optional)
// export const bulkDeleteAariWorkersApi = async (ids) => {
//   console.log(`🗑️ Bulk deleting aariWorkers:`, ids);
//   const response = await API.post("/aari-workers/bulk-delete", { ids });
//   return response.data;
// };

// export const bulkUpdateStatusApi = async (ids, isActive) => {
//   console.log(`🔄 Bulk updating status:`, { ids, isActive });
//   const response = await API.post("/aari-workers/bulk-status", { ids, isActive });
//   return response.data;
// };





import API from "../../app/axios";

// ===== GET ALL AARI_WORKERS =====
export const getAllAariWorkersApi = async (params = {}) => {
  const { 
    search, 
    status, 
    availability,
    page,
    limit,
    sortField,
    sortOrder
  } = params;
  
  let url = "/aari-workers";
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

// ===== GET AARI_WORKER BY ID =====
export const getAariWorkerByIdApi = async (id) => {
  console.log(`📡 Fetching aariWorker: ${id}`);
  const response = await API.get(`/aari-workers/${id}`);
  return response.data;
};

// ===== CREATE AARI_WORKER =====
export const createAariWorkerApi = async (aariWorkerData) => {
  console.log("📝 Creating aariWorker:", aariWorkerData);
  const response = await API.post("/aari-workers", aariWorkerData);
  return response.data;
};

// ===== UPDATE AARI_WORKER =====
export const updateAariWorkerApi = async (id, aariWorkerData) => {
  console.log(`📝 Updating aariWorker: ${id}`, aariWorkerData);
  const response = await API.put(`/aari-workers/${id}`, aariWorkerData);
  return response.data;
};

// ===== UPDATE LEAVE STATUS =====
export const updateLeaveStatusApi = async (id, leaveData) => {
  console.log(`📝 Updating leave status: ${id}`, leaveData);
  const response = await API.patch(`/aari-workers/${id}/leave`, leaveData);
  return response.data;
};

// ✅ TOGGLE AARI_WORKER STATUS
export const toggleAariWorkerStatusApi = async (id) => {
  console.log(`🔄 Toggling aariWorker status: ${id}`);
  const response = await API.patch(`/aari-workers/${id}/toggle-status`);
  return response.data;
};

// ===== DELETE AARI_WORKER =====
export const deleteAariWorkerApi = async (id) => {
  console.log(`🗑️ Deleting aariWorker: ${id}`);
  const response = await API.delete(`/aari-workers/${id}`);
  return response.data;
};

// ============================================
// ✅ DASHBOARD APIS (NEW)
// ============================================

// ===== GET AARI_WORKER STATS =====
export const getAariWorkerStatsApi = async () => {
  console.log("📊 Fetching aariWorker stats for dashboard");
  const response = await API.get("/aari-workers/stats");
  return response.data;
};

// ===== GET TOP AARI_WORKERS =====
export const getTopAariWorkersApi = async (limit = 5, period = 'month') => {
  console.log(`🏆 Fetching top ${limit} aariWorkers for period: ${period}`);
  const response = await API.get(`/aari-workers/top?limit=${limit}&period=${period}`);
  return response.data;
};

// ===== GET AARI_WORKER PERFORMANCE =====
export const getAariWorkerPerformanceApi = async (period = 'month', aariWorkerId = null) => {
  let url = `/aari-workers/performance?period=${period}`;
  if (aariWorkerId) {
    url += `&aariWorkerId=${aariWorkerId}`;
  }
  console.log(`📈 Fetching aariWorker performance: ${url}`);
  const response = await API.get(url);
  return response.data;
};

// ============================================
// ✅ ADMIN UTILITY APIS
// ============================================

// ===== FIX ALL AARI_WORKER STATS =====
export const fixAllAariWorkerStatsApi = async () => {
  console.log("🔧 Fixing all aariWorker stats");
  const response = await API.post("/aari-workers/fix-stats");
  return response.data;
};

// ===== BULK OPERATIONS =====
export const bulkDeleteAariWorkersApi = async (ids) => {
  console.log(`🗑️ Bulk deleting aariWorkers:`, ids);
  const response = await API.post("/aari-workers/bulk-delete", { ids });
  return response.data;
};

export const bulkUpdateStatusApi = async (ids, isActive) => {
  console.log(`🔄 Bulk updating status:`, { ids, isActive });
  const response = await API.post("/aari-workers/bulk-status", { ids, isActive });
  return response.data;
};
