// import API from "../../app/axios";

// // ===== GET ALL EMBROIDERY_WORKERS =====
// export const getAllEmbroideryWorkersApi = async (params = {}) => {
//   const { 
//     search, 
//     status, 
//     availability,
//     page,
//     limit,
//     sortField,
//     sortOrder
//   } = params;
  
//   let url = "/embroidery-workers";
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

// // ===== GET EMBROIDERY_WORKER BY ID =====
// export const getEmbroideryWorkerByIdApi = async (id) => {
//   console.log(`📡 Fetching embroideryWorker: ${id}`);
//   const response = await API.get(`/embroidery-workers/${id}`);
//   return response.data;
// };

// // ===== CREATE EMBROIDERY_WORKER =====
// export const createEmbroideryWorkerApi = async (embroideryWorkerData) => {
//   console.log("📝 Creating embroideryWorker:", embroideryWorkerData);
//   const response = await API.post("/embroidery-workers", embroideryWorkerData);
//   return response.data;
// };

// // ===== UPDATE EMBROIDERY_WORKER =====
// export const updateEmbroideryWorkerApi = async (id, embroideryWorkerData) => {
//   console.log(`📝 Updating embroideryWorker: ${id}`, embroideryWorkerData);
//   const response = await API.put(`/embroidery-workers/${id}`, embroideryWorkerData);
//   return response.data;
// };

// // ===== UPDATE LEAVE STATUS =====
// export const updateLeaveStatusApi = async (id, leaveData) => {
//   console.log(`📝 Updating leave status: ${id}`, leaveData);
//   const response = await API.patch(`/embroidery-workers/${id}/leave`, leaveData);
//   return response.data;
// };

// // ✅ NEW: TOGGLE EMBROIDERY_WORKER STATUS
// export const toggleEmbroideryWorkerStatusApi = async (id) => {
//   console.log(`🔄 Toggling embroideryWorker status: ${id}`);
//   const response = await API.patch(`/embroidery-workers/${id}/toggle-status`);
//   return response.data;
// };

// // ===== DELETE EMBROIDERY_WORKER =====
// export const deleteEmbroideryWorkerApi = async (id) => {
//   console.log(`🗑️ Deleting embroideryWorker: ${id}`);
//   const response = await API.delete(`/embroidery-workers/${id}`);
//   return response.data;
// };

// // ===== GET EMBROIDERY_WORKER STATS =====
// export const getEmbroideryWorkerStatsApi = async () => {
//   console.log("📡 Fetching embroideryWorker stats");
//   const response = await API.get("/embroidery-workers/stats");
//   return response.data;
// };

// // ✅ NEW: BULK OPERATIONS (Optional)
// export const bulkDeleteEmbroideryWorkersApi = async (ids) => {
//   console.log(`🗑️ Bulk deleting embroideryWorkers:`, ids);
//   const response = await API.post("/embroidery-workers/bulk-delete", { ids });
//   return response.data;
// };

// export const bulkUpdateStatusApi = async (ids, isActive) => {
//   console.log(`🔄 Bulk updating status:`, { ids, isActive });
//   const response = await API.post("/embroidery-workers/bulk-status", { ids, isActive });
//   return response.data;
// };





import API from "../../app/axios";

// ===== GET ALL EMBROIDERY_WORKERS =====
export const getAllEmbroideryWorkersApi = async (params = {}) => {
  const { 
    search, 
    status, 
    availability,
    page,
    limit,
    sortField,
    sortOrder
  } = params;
  
  let url = "/embroidery-workers";
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

// ===== GET EMBROIDERY_WORKER BY ID =====
export const getEmbroideryWorkerByIdApi = async (id) => {
  console.log(`📡 Fetching embroideryWorker: ${id}`);
  const response = await API.get(`/embroidery-workers/${id}`);
  return response.data;
};

// ===== CREATE EMBROIDERY_WORKER =====
export const createEmbroideryWorkerApi = async (embroideryWorkerData) => {
  console.log("📝 Creating embroideryWorker:", embroideryWorkerData);
  const response = await API.post("/embroidery-workers", embroideryWorkerData);
  return response.data;
};

// ===== UPDATE EMBROIDERY_WORKER =====
export const updateEmbroideryWorkerApi = async (id, embroideryWorkerData) => {
  console.log(`📝 Updating embroideryWorker: ${id}`, embroideryWorkerData);
  const response = await API.put(`/embroidery-workers/${id}`, embroideryWorkerData);
  return response.data;
};

// ===== UPDATE LEAVE STATUS =====
export const updateLeaveStatusApi = async (id, leaveData) => {
  console.log(`📝 Updating leave status: ${id}`, leaveData);
  const response = await API.patch(`/embroidery-workers/${id}/leave`, leaveData);
  return response.data;
};

// ✅ TOGGLE EMBROIDERY_WORKER STATUS
export const toggleEmbroideryWorkerStatusApi = async (id) => {
  console.log(`🔄 Toggling embroideryWorker status: ${id}`);
  const response = await API.patch(`/embroidery-workers/${id}/toggle-status`);
  return response.data;
};

// ===== DELETE EMBROIDERY_WORKER =====
export const deleteEmbroideryWorkerApi = async (id) => {
  console.log(`🗑️ Deleting embroideryWorker: ${id}`);
  const response = await API.delete(`/embroidery-workers/${id}`);
  return response.data;
};

// ============================================
// ✅ DASHBOARD APIS (NEW)
// ============================================

// ===== GET EMBROIDERY_WORKER STATS =====
export const getEmbroideryWorkerStatsApi = async () => {
  console.log("📊 Fetching embroideryWorker stats for dashboard");
  const response = await API.get("/embroidery-workers/stats");
  return response.data;
};

// ===== GET TOP EMBROIDERY_WORKERS =====
export const getTopEmbroideryWorkersApi = async (limit = 5, period = 'month') => {
  console.log(`🏆 Fetching top ${limit} embroideryWorkers for period: ${period}`);
  const response = await API.get(`/embroidery-workers/top?limit=${limit}&period=${period}`);
  return response.data;
};

// ===== GET EMBROIDERY_WORKER PERFORMANCE =====
export const getEmbroideryWorkerPerformanceApi = async (period = 'month', embroideryWorkerId = null) => {
  let url = `/embroidery-workers/performance?period=${period}`;
  if (embroideryWorkerId) {
    url += `&embroideryWorkerId=${embroideryWorkerId}`;
  }
  console.log(`📈 Fetching embroideryWorker performance: ${url}`);
  const response = await API.get(url);
  return response.data;
};

// ============================================
// ✅ ADMIN UTILITY APIS
// ============================================

// ===== FIX ALL EMBROIDERY_WORKER STATS =====
export const fixAllEmbroideryWorkerStatsApi = async () => {
  console.log("🔧 Fixing all embroideryWorker stats");
  const response = await API.post("/embroidery-workers/fix-stats");
  return response.data;
};

// ===== BULK OPERATIONS =====
export const bulkDeleteEmbroideryWorkersApi = async (ids) => {
  console.log(`🗑️ Bulk deleting embroideryWorkers:`, ids);
  const response = await API.post("/embroidery-workers/bulk-delete", { ids });
  return response.data;
};

export const bulkUpdateStatusApi = async (ids, isActive) => {
  console.log(`🔄 Bulk updating status:`, { ids, isActive });
  const response = await API.post("/embroidery-workers/bulk-status", { ids, isActive });
  return response.data;
};
