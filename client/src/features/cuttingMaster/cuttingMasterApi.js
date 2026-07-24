// // src/features/cuttingMaster/cuttingMasterApi.js
// import API from "../../app/axios";

// // ===== GET ALL CUTTING MASTERS =====
// export const getAllCuttingMastersApi = async (params = {}) => {
//   const { search, availability, page, limit } = params;
//   let url = "/cutting-masters";
//   const queryParams = [];
  
//   if (search) queryParams.push(`search=${encodeURIComponent(search)}`);
//   if (availability && availability !== 'all') queryParams.push(`availability=${availability}`);
//   if (page) queryParams.push(`page=${page}`);
//   if (limit) queryParams.push(`limit=${limit}`);
  
//   if (queryParams.length > 0) {
//     url += `?${queryParams.join('&')}`;
//   }
  
//   console.log("📡 API Request:", url);
//   const response = await API.get(url);
//   return response.data;
// };

// // ===== GET CUTTING MASTER BY ID =====
// export const getCuttingMasterByIdApi = async (id) => {
//   console.log(`📡 Fetching cutting master: ${id}`);
//   const response = await API.get(`/cutting-masters/${id}`);
//   return response.data;
// };

// // ===== CREATE CUTTING MASTER =====
// export const createCuttingMasterApi = async (data) => {
//   console.log("📝 Creating cutting master:", data);
//   const response = await API.post("/cutting-masters", data);
//   return response.data;
// };

// // ===== UPDATE CUTTING MASTER =====
// export const updateCuttingMasterApi = async (id, data) => {
//   console.log(`📝 Updating cutting master: ${id}`, data);
//   const response = await API.put(`/cutting-masters/${id}`, data);
//   return response.data;
// };

// // ===== DELETE CUTTING MASTER =====
// export const deleteCuttingMasterApi = async (id) => {
//   console.log(`🗑️ Deleting cutting master: ${id}`);
//   const response = await API.delete(`/cutting-masters/${id}`);
//   return response.data;
// };

// // ===== GET CUTTING MASTER STATS =====
// export const getCuttingMasterStatsApi = async () => {
//   console.log("📡 Fetching cutting master stats");
//   const response = await API.get("/cutting-masters/stats");
//   return response.data;
// };











// // src/features/cuttingMaster/cuttingMasterApi.js
// import API from "../../app/axios";

// // ============================================
// // 🔧 CRUD OPERATIONS (Admin/Store Keeper)
// // ============================================

// // ===== GET ALL CUTTING MASTERS =====
// export const getAllCuttingMastersApi = async (params = {}) => {
//   const { search, availability, page, limit } = params;
//   let url = "/cutting-masters";
//   const queryParams = [];
  
//   if (search) queryParams.push(`search=${encodeURIComponent(search)}`);
//   if (availability && availability !== 'all') queryParams.push(`availability=${availability}`);
//   if (page) queryParams.push(`page=${page}`);
//   if (limit) queryParams.push(`limit=${limit}`);
  
//   if (queryParams.length > 0) {
//     url += `?${queryParams.join('&')}`;
//   }
  
//   console.log("📡 API Request:", url);
//   const response = await API.get(url);
//   return response.data;
// };

// // ===== GET CUTTING MASTER BY ID =====
// export const getCuttingMasterByIdApi = async (id) => {
//   console.log(`📡 Fetching cutting master: ${id}`);
//   const response = await API.get(`/cutting-masters/${id}`);
//   return response.data;
// };

// // ===== CREATE CUTTING MASTER =====
// export const createCuttingMasterApi = async (data) => {
//   console.log("📝 Creating cutting master:", data);
//   const response = await API.post("/cutting-masters", data);
//   return response.data;
// };

// // ===== UPDATE CUTTING MASTER =====
// export const updateCuttingMasterApi = async (id, data) => {
//   console.log(`📝 Updating cutting master: ${id}`, data);
//   const response = await API.put(`/cutting-masters/${id}`, data);
//   return response.data;
// };

// // ===== DELETE CUTTING MASTER =====
// export const deleteCuttingMasterApi = async (id) => {
//   console.log(`🗑️ Deleting cutting master: ${id}`);
//   const response = await API.delete(`/cutting-masters/${id}`);
//   return response.data;
// };

// // ===== GET CUTTING MASTER STATS =====
// export const getCuttingMasterStatsApi = async () => {
//   console.log("📡 Fetching cutting master stats");
//   const response = await API.get("/cutting-masters/stats");
//   return response.data;
// };

// // ============================================
// // 📊 DASHBOARD APIs (Cutting Master Self)
// // ============================================

// /**
//  * 📊 1. GET DASHBOARD STATS - KPI Boxes
//  * GET /api/cutting-masters/dashboard/stats
//  * @param {Object} params - { startDate, endDate }
//  */
// export const getDashboardStatsApi = async (params = {}) => {
//   const { startDate, endDate } = params;
//   let url = "/cutting-masters/dashboard/stats";
//   const queryParams = [];
  
//   if (startDate) queryParams.push(`startDate=${startDate}`);
//   if (endDate) queryParams.push(`endDate=${endDate}`);
  
//   if (queryParams.length > 0) {
//     url += `?${queryParams.join('&')}`;
//   }
  
//   console.log("📡 Fetching dashboard stats:", url);
//   const response = await API.get(url);
//   return response.data;
// };

// /**
//  * 📈 2. GET WORK STATUS BREAKDOWN - Pie Chart
//  * GET /api/cutting-masters/dashboard/work-status
//  * @param {Object} params - { startDate, endDate }
//  */
// export const getWorkStatusBreakdownApi = async (params = {}) => {
//   const { startDate, endDate } = params;
//   let url = "/cutting-masters/dashboard/work-status";
//   const queryParams = [];
  
//   if (startDate) queryParams.push(`startDate=${startDate}`);
//   if (endDate) queryParams.push(`endDate=${endDate}`);
  
//   if (queryParams.length > 0) {
//     url += `?${queryParams.join('&')}`;
//   }
  
//   console.log("📡 Fetching work status breakdown:", url);
//   const response = await API.get(url);
//   return response.data;
// };

// /**
//  * 👥 3. GET TAILOR PERFORMANCE
//  * GET /api/cutting-masters/dashboard/tailor-performance
//  */
// export const getTailorPerformanceApi = async () => {
//   console.log("📡 Fetching tailor performance");
//   const response = await API.get("/cutting-masters/dashboard/tailor-performance");
//   return response.data;
// };

// /**
//  * 🟢 4. GET AVAILABLE TAILORS SUMMARY
//  * GET /api/cutting-masters/dashboard/available-tailors
//  */
// export const getAvailableTailorsApi = async () => {
//   console.log("📡 Fetching available tailors");
//   const response = await API.get("/cutting-masters/dashboard/available-tailors");
//   return response.data;
// };

// /**
//  * 📋 5. GET WORK QUEUE
//  * GET /api/cutting-masters/dashboard/work-queue
//  * @param {Object} params - { status, search }
//  */
// export const getWorkQueueApi = async (params = {}) => {
//   const { status, search } = params;
//   let url = "/cutting-masters/dashboard/work-queue";
//   const queryParams = [];
  
//   if (status && status !== 'all') queryParams.push(`status=${status}`);
//   if (search) queryParams.push(`search=${encodeURIComponent(search)}`);
  
//   if (queryParams.length > 0) {
//     url += `?${queryParams.join('&')}`;
//   }
  
//   console.log("📡 Fetching work queue:", url);
//   const response = await API.get(url);
//   return response.data;
// };

// /**
//  * ✅ 6. UPDATE WORK STATUS
//  * PUT /api/cutting-masters/dashboard/update-status/:workId
//  * @param {string} workId - Work ID
//  * @param {Object} data - { status, notes }
//  */
// export const updateWorkStatusApi = async (workId, data) => {
//   console.log(`📝 Updating work status: ${workId}`, data);
//   const response = await API.put(`/cutting-masters/dashboard/update-status/${workId}`, data);
//   return response.data;
// };

// /**
//  * 📊 7. GET TODAY'S SUMMARY
//  * GET /api/cutting-masters/dashboard/today-summary
//  */
// export const getTodaySummaryApi = async () => {
//   console.log("📡 Fetching today's summary");
//   const response = await API.get("/cutting-masters/dashboard/today-summary");
//   return response.data;
// };

// /**
//  * 🔴 8. GET HIGH PRIORITY WORKS
//  * GET /api/cutting-masters/dashboard/high-priority
//  */
// export const getHighPriorityWorksApi = async () => {
//   console.log("📡 Fetching high priority works");
//   const response = await API.get("/cutting-masters/dashboard/high-priority");
//   return response.data;
// };

// /**
//  * 🚀 9. GET COMPLETE DASHBOARD SUMMARY
//  * GET /api/cutting-masters/dashboard/summary
//  * @param {Object} params - { startDate, endDate }
//  */
// export const getDashboardSummaryApi = async (params = {}) => {
//   const { startDate, endDate } = params;
//   let url = "/cutting-masters/dashboard/summary";
//   const queryParams = [];
  
//   if (startDate) queryParams.push(`startDate=${startDate}`);
//   if (endDate) queryParams.push(`endDate=${endDate}`);
  
//   if (queryParams.length > 0) {
//     url += `?${queryParams.join('&')}`;
//   }
  
//   console.log("📡 Fetching complete dashboard summary:", url);
//   const response = await API.get(url);
//   return response.data;
// };

// // ============================================
// // 📦 EXPORT ALL APIs AS SINGLE OBJECT
// // ============================================

// const cuttingMasterApi = {
//   // CRUD Operations
//   getAllCuttingMasters: getAllCuttingMastersApi,
//   getCuttingMasterById: getCuttingMasterByIdApi,
//   createCuttingMaster: createCuttingMasterApi,
//   updateCuttingMaster: updateCuttingMasterApi,
//   deleteCuttingMaster: deleteCuttingMasterApi,
//   getCuttingMasterStats: getCuttingMasterStatsApi,
  
//   // Dashboard Operations
//   getDashboardStats: getDashboardStatsApi,
//   getWorkStatusBreakdown: getWorkStatusBreakdownApi,
//   getTailorPerformance: getTailorPerformanceApi,
//   getAvailableTailors: getAvailableTailorsApi,
//   getWorkQueue: getWorkQueueApi,
//   updateWorkStatus: updateWorkStatusApi,
//   getTodaySummary: getTodaySummaryApi,
//   getHighPriorityWorks: getHighPriorityWorksApi,
//   getDashboardSummary: getDashboardSummaryApi
// };

// export default cuttingMasterApi;














// // src/features/cuttingMaster/cuttingMasterApi.js
// import API from "../../app/axios";

// // ============================================
// // 🔧 CRUD OPERATIONS (Admin/Store Keeper)
// // ============================================

// // ===== GET ALL CUTTING MASTERS =====
// export const getAllCuttingMastersApi = async (params = {}) => {
//   const { search, availability, page, limit } = params;
//   let url = "/cutting-masters";
//   const queryParams = [];
  
//   if (search) queryParams.push(`search=${encodeURIComponent(search)}`);
//   if (availability && availability !== 'all') queryParams.push(`availability=${availability}`);
//   if (page) queryParams.push(`page=${page}`);
//   if (limit) queryParams.push(`limit=${limit}`);
  
//   if (queryParams.length > 0) {
//     url += `?${queryParams.join('&')}`;
//   }
  
//   console.log("📡 API Request:", url);
//   const response = await API.get(url);
//   return response.data;
// };

// // ===== GET CUTTING MASTER BY ID =====
// export const getCuttingMasterByIdApi = async (id) => {
//   console.log(`📡 Fetching cutting master: ${id}`);
//   const response = await API.get(`/cutting-masters/${id}`);
//   return response.data;
// };

// // ===== CREATE CUTTING MASTER =====
// export const createCuttingMasterApi = async (data) => {
//   console.log("📝 Creating cutting master:", data);
//   const response = await API.post("/cutting-masters", data);
//   return response.data;
// };

// // ===== UPDATE CUTTING MASTER =====
// export const updateCuttingMasterApi = async (id, data) => {
//   console.log(`📝 Updating cutting master: ${id}`, data);
//   const response = await API.put(`/cutting-masters/${id}`, data);
//   return response.data;
// };

// // ===== DELETE CUTTING MASTER =====
// export const deleteCuttingMasterApi = async (id) => {
//   console.log(`🗑️ Deleting cutting master: ${id}`);
//   const response = await API.delete(`/cutting-masters/${id}`);
//   return response.data;
// };

// // ===== GET CUTTING MASTER STATS =====
// export const getCuttingMasterStatsApi = async () => {
//   console.log("📡 Fetching cutting master stats");
//   const response = await API.get("/cutting-masters/stats");
//   return response.data;
// };

// // ============================================
// // 📊 DASHBOARD APIs (Cutting Master Self)
// // ============================================

// /**
//  * 📊 1. GET DASHBOARD STATS - KPI Boxes
//  * GET /api/cutting-masters/dashboard/stats
//  * @param {Object} params - { startDate, endDate }
//  */
// export const getDashboardStatsApi = async (params = {}) => {
//   const { startDate, endDate } = params;
//   let url = "/cutting-masters/dashboard/stats";
//   const queryParams = [];
  
//   if (startDate) queryParams.push(`startDate=${startDate}`);
//   if (endDate) queryParams.push(`endDate=${endDate}`);
  
//   if (queryParams.length > 0) {
//     url += `?${queryParams.join('&')}`;
//   }
  
//   console.log("📡 Fetching dashboard stats:", url);
//   const response = await API.get(url);
//   return response.data;
// };

// /**
//  * 📈 2. GET WORK STATUS BREAKDOWN - Pie Chart
//  * GET /api/cutting-masters/dashboard/work-status
//  * @param {Object} params - { startDate, endDate }
//  */
// export const getWorkStatusBreakdownApi = async (params = {}) => {
//   const { startDate, endDate } = params;
//   let url = "/cutting-masters/dashboard/work-status";
//   const queryParams = [];
  
//   if (startDate) queryParams.push(`startDate=${startDate}`);
//   if (endDate) queryParams.push(`endDate=${endDate}`);
  
//   if (queryParams.length > 0) {
//     url += `?${queryParams.join('&')}`;
//   }
  
//   console.log("📡 Fetching work status breakdown:", url);
//   const response = await API.get(url);
//   return response.data;
// };

// /**
//  * 👥 3. GET TAILOR PERFORMANCE
//  * GET /api/cutting-masters/dashboard/tailor-performance
//  */
// export const getTailorPerformanceApi = async () => {
//   console.log("📡 Fetching tailor performance");
//   const response = await API.get("/cutting-masters/dashboard/tailor-performance");
//   return response.data;
// };

// /**
//  * 🟢 4. GET AVAILABLE TAILORS SUMMARY
//  * GET /api/cutting-masters/dashboard/available-tailors
//  */
// export const getAvailableTailorsApi = async () => {
//   console.log("📡 Fetching available tailors");
//   const response = await API.get("/cutting-masters/dashboard/available-tailors");
//   return response.data;
// };

// /**
//  * 📋 5. GET WORK QUEUE
//  * GET /api/cutting-masters/dashboard/work-queue
//  * @param {Object} params - { status, search }
//  */
// export const getWorkQueueApi = async (params = {}) => {
//   const { status, search } = params;
//   let url = "/cutting-masters/dashboard/work-queue";
//   const queryParams = [];
  
//   if (status && status !== 'all') queryParams.push(`status=${status}`);
//   if (search) queryParams.push(`search=${encodeURIComponent(search)}`);
  
//   if (queryParams.length > 0) {
//     url += `?${queryParams.join('&')}`;
//   }
  
//   console.log("📡 Fetching work queue:", url);
//   const response = await API.get(url);
//   return response.data;
// };

// /**
//  * ✅ 6. UPDATE WORK STATUS
//  * PUT /api/cutting-masters/dashboard/update-status/:workId
//  * @param {string} workId - Work ID
//  * @param {Object} data - { status, notes }
//  */
// export const updateWorkStatusApi = async (workId, data) => {
//   console.log(`📝 Updating work status: ${workId}`, data);
//   const response = await API.put(`/cutting-masters/dashboard/update-status/${workId}`, data);
//   return response.data;
// };

// /**
//  * 📊 7. GET TODAY'S SUMMARY
//  * GET /api/cutting-masters/dashboard/today-summary
//  */
// export const getTodaySummaryApi = async () => {
//   console.log("📡 Fetching today's summary");
//   const response = await API.get("/cutting-masters/dashboard/today-summary");
//   return response.data;
// };

// /**
//  * 🔴 8. GET HIGH PRIORITY WORKS
//  * GET /api/cutting-masters/dashboard/high-priority
//  */
// export const getHighPriorityWorksApi = async () => {
//   console.log("📡 Fetching high priority works");
//   const response = await API.get("/cutting-masters/dashboard/high-priority");
//   return response.data;
// };

// /**
//  * 🚀 9. GET COMPLETE DASHBOARD SUMMARY
//  * GET /api/cutting-masters/dashboard/summary
//  * @param {Object} params - { startDate, endDate }
//  */
// export const getDashboardSummaryApi = async (params = {}) => {
//   const { startDate, endDate } = params;
//   let url = "/cutting-masters/dashboard/summary";
//   const queryParams = [];
  
//   if (startDate) queryParams.push(`startDate=${startDate}`);
//   if (endDate) queryParams.push(`endDate=${endDate}`);
  
//   if (queryParams.length > 0) {
//     url += `?${queryParams.join('&')}`;
//   }
  
//   console.log("📡 Fetching complete dashboard summary:", url);
//   const response = await API.get(url);
//   return response.data;
// };

// // ============================================
// // 📦 EXPORT ALL APIs AS SINGLE OBJECT
// // ============================================

// const cuttingMasterApi = {
//   // CRUD Operations
//   getAllCuttingMasters: getAllCuttingMastersApi,
//   getCuttingMasterById: getCuttingMasterByIdApi,
//   createCuttingMaster: createCuttingMasterApi,
//   updateCuttingMaster: updateCuttingMasterApi,
//   deleteCuttingMaster: deleteCuttingMasterApi,
//   getCuttingMasterStats: getCuttingMasterStatsApi,
  
//   // Dashboard Operations
//   getDashboardStats: getDashboardStatsApi,
//   getWorkStatusBreakdown: getWorkStatusBreakdownApi,
//   getTailorPerformance: getTailorPerformanceApi,
//   getAvailableTailors: getAvailableTailorsApi,
//   getWorkQueue: getWorkQueueApi,
//   updateWorkStatus: updateWorkStatusApi,
//   getTodaySummary: getTodaySummaryApi,
//   getHighPriorityWorks: getHighPriorityWorksApi,
//   getDashboardSummary: getDashboardSummaryApi
// };

// export default cuttingMasterApi;












// src/features/cuttingMaster/cuttingMasterApi.js
import API from "../../app/axios";

// ============================================
// 🔧 CRUD OPERATIONS (Admin/Store Keeper)
// ============================================

// ===== GET ALL CUTTING MASTERS =====
export const getAllCuttingMastersApi = async (params = {}) => {
  const { search, availability, page, limit, isActive } = params;
  let url = "/cutting-masters";
  const queryParams = [];
  
  if (search) queryParams.push(`search=${encodeURIComponent(search)}`);
  if (availability && availability !== 'all') queryParams.push(`availability=${availability}`);
  if (isActive) queryParams.push(`isActive=${isActive}`);
  if (page) queryParams.push(`page=${page}`);
  if (limit) queryParams.push(`limit=${limit}`);
  
  if (queryParams.length > 0) {
    url += `?${queryParams.join('&')}`;
  }
  
  console.log("📡 API Request: GET", url);
  const response = await API.get(url);
  return response.data;
};

// ===== GET CUTTING MASTER BY ID =====
export const getCuttingMasterByIdApi = async (id) => {
  console.log(`📡 Fetching cutting master: ${id}`);
  const response = await API.get(`/cutting-masters/${id}`);
  return response.data;
};

// ===== CREATE CUTTING MASTER =====
export const createCuttingMasterApi = async (data) => {
  console.log("📝 Creating cutting master:", data);
  const response = await API.post("/cutting-masters", data);
  return response.data;
};

// ===== UPDATE CUTTING MASTER =====
export const updateCuttingMasterApi = async (id, data) => {
  console.log(`📝 Updating cutting master: ${id}`, data);
  const response = await API.put(`/cutting-masters/${id}`, data);
  return response.data;
};

// ===== DELETE CUTTING MASTER =====
export const deleteCuttingMasterApi = async (id) => {
  console.log(`🗑️ Deleting cutting master: ${id}`);
  const response = await API.delete(`/cutting-masters/${id}`);
  return response.data;
};

// ===== GET CUTTING MASTER STATS =====
export const getCuttingMasterStatsApi = async () => {
  console.log("📡 Fetching cutting master stats");
  const response = await API.get("/cutting-masters/stats");
  return response.data;
};



// ============================================
// 🎯 SINGLE DEFAULT EXPORT (RECOMMENDED)
// ============================================

const cuttingMasterApi = {
  getAllCuttingMasters: getAllCuttingMastersApi,
  getCuttingMasterById: getCuttingMasterByIdApi,
  createCuttingMaster: createCuttingMasterApi,
  updateCuttingMaster: updateCuttingMasterApi,
  deleteCuttingMaster: deleteCuttingMasterApi,
  getCuttingMasterStats: getCuttingMasterStatsApi,

};

export default cuttingMasterApi;