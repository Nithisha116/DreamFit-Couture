// // frontend/src/features/orders/orderApi.js
// import API from "../../app/axios";

// // ============================================
// // 📦 ORDER API - All API calls
// // ============================================

// const ORDER_BASE = "/orders";

// /**
//  * Get order statistics for dashboard
//  * @returns {Promise} - Stats data
//  */
// export const getOrderStats = async () => {
//   try {
//     const response = await API.get(`${ORDER_BASE}/stats`);
//     return response.data;
//   } catch (error) {
//     console.error("❌ Error fetching order stats:", error);
//     throw error;
//   }
// };

// /**
//  * Get dashboard data (today's orders, pending deliveries, collection)
//  * @returns {Promise} - Dashboard data
//  */
// export const getDashboardData = async () => {
//   try {
//     const response = await API.get(`${ORDER_BASE}/dashboard`);
//     return response.data;
//   } catch (error) {
//     console.error("❌ Error fetching dashboard data:", error);
//     throw error;
//   }
// };

// /**
//  * Create new order with payments
//  * @param {Object} orderData - Order data with payments array
//  * @returns {Promise} - Created order
//  */
// export const createOrder = async (orderData) => {
//   try {
//     console.log("📦 Creating order with data:", orderData);
//     const response = await API.post(ORDER_BASE, orderData);
//     return response.data;
//   } catch (error) {
//     console.error("❌ Error creating order:", error);
//     throw error;
//   }
// };

// /**
//  * Get all orders with filters
//  * @param {Object} params - Query params (page, limit, search, status, paymentStatus, timeFilter)
//  * @returns {Promise} - Paginated orders
//  */
// export const getAllOrders = async (params = {}) => {
//   try {
//     const response = await API.get(ORDER_BASE, { params });
//     return response.data;
//   } catch (error) {
//     console.error("❌ Error fetching orders:", error);
//     throw error;
//   }
// };

// /**
//  * ✅ NEW: Get orders by customer ID
//  * @param {string} customerId - Customer ID
//  * @returns {Promise} - Customer's orders
//  */
// export const getOrdersByCustomer = async (customerId) => {
//   try {
//     console.log(`🔍 Fetching orders for customer: ${customerId}`);
//     const response = await API.get(`${ORDER_BASE}/customer/${customerId}`);
//     return response.data;
//   } catch (error) {
//     console.error(`❌ Error fetching orders for customer ${customerId}:`, error);
//     throw error;
//   }
// };

// /**
//  * Get single order by ID (includes payments & works)
//  * @param {string} id - Order ID
//  * @returns {Promise} - Order details
//  */
// export const getOrderById = async (id) => {
//   try {
//     const response = await API.get(`${ORDER_BASE}/${id}`);
//     return response.data;
//   } catch (error) {
//     console.error(`❌ Error fetching order ${id}:`, error);
//     throw error;
//   }
// };

// /**
//  * Update order details
//  * @param {string} id - Order ID
//  * @param {Object} updateData - Data to update
//  * @returns {Promise} - Updated order
//  */
// export const updateOrder = async (id, updateData) => {
//   try {
//     const response = await API.put(`${ORDER_BASE}/${id}`, updateData);
//     return response.data;
//   } catch (error) {
//     console.error(`❌ Error updating order ${id}:`, error);
//     throw error;
//   }
// };

// /**
//  * Update order status only
//  * @param {string} id - Order ID
//  * @param {string} status - New status
//  * @returns {Promise} - Updated order
//  */
// export const updateOrderStatus = async (id, status) => {
//   try {
//     const response = await API.patch(`${ORDER_BASE}/${id}/status`, { status });
//     return response.data;
//   } catch (error) {
//     console.error(`❌ Error updating order status ${id}:`, error);
//     throw error;
//   }
// };

// /**
//  * Delete order (soft delete)
//  * @param {string} id - Order ID
//  * @returns {Promise} - Deletion confirmation
//  */
// export const deleteOrder = async (id) => {
//   try {
//     const response = await API.delete(`${ORDER_BASE}/${id}`);
//     return response.data;
//   } catch (error) {
//     console.error(`❌ Error deleting order ${id}:`, error);
//     throw error;
//   }
// };

// // ============================================
// // 💰 PAYMENT ROUTES (Specific to order)
// // ============================================

// /**
//  * Add payment to existing order
//  * @param {string} orderId - Order ID
//  * @param {Object} paymentData - Payment details
//  * @returns {Promise} - Created payment
//  */
// export const addPaymentToOrder = async (orderId, paymentData) => {
//   try {
//     console.log(`💰 Adding payment to order ${orderId}:`, paymentData);
//     const response = await API.post(`${ORDER_BASE}/${orderId}/payments`, paymentData);
//     return response.data;
//   } catch (error) {
//     console.error(`❌ Error adding payment to order ${orderId}:`, error);
//     throw error;
//   }
// };

// /**
//  * Get all payments for an order
//  * @param {string} orderId - Order ID
//  * @returns {Promise} - List of payments
//  */
// export const getOrderPayments = async (orderId) => {
//   try {
//     const response = await API.get(`${ORDER_BASE}/${orderId}/payments`);
//     return response.data;
//   } catch (error) {
//     console.error(`❌ Error fetching payments for order ${orderId}:`, error);
//     throw error;
//   }
// };

// // ============================================
// // 📊 EXPORT ALL FUNCTIONS
// // ============================================
// const orderApi = {
//   getOrderStats,
//   getDashboardData,
//   createOrder,
//   getAllOrders,
//   getOrdersByCustomer, // ✅ Added new function
//   getOrderById,
//   updateOrder,
//   updateOrderStatus,
//   deleteOrder,
//   addPaymentToOrder,
//   getOrderPayments
// };

// export default orderApi;







// // frontend/src/features/orders/orderApi.js
// import API from "../../app/axios";

// // ============================================
// // 📦 ORDER API - All API calls
// // ============================================

// const ORDER_BASE = "/orders";

// /**
//  * Get order statistics for dashboard
//  * @param {Object} params - Optional params (period, startDate, endDate)
//  * @returns {Promise} - Stats data
//  */
// export const getOrderStats = async (params = {}) => {
//   try {
//     const queryParams = new URLSearchParams();
    
//     Object.entries(params).forEach(([key, value]) => {
//       if (value) queryParams.append(key, value);
//     });

//     const response = await API.get(`${ORDER_BASE}/stats?${queryParams}`);
//     return response.data;
//   } catch (error) {
//     console.error("❌ Error fetching order stats:", error);
//     throw error;
//   }
// };

// /**
//  * Get dashboard data (today's orders, pending deliveries, collection)
//  * @returns {Promise} - Dashboard data
//  */
// export const getDashboardData = async () => {
//   try {
//     const response = await API.get(`${ORDER_BASE}/dashboard`);
//     return response.data;
//   } catch (error) {
//     console.error("❌ Error fetching dashboard data:", error);
//     throw error;
//   }
// };

// /**
//  * ✅ NEW: Get ready to delivery orders
//  * @returns {Promise} - Ready to delivery orders
//  */
// export const getReadyToDeliveryOrders = async () => {
//   try {
//     const response = await API.get(`${ORDER_BASE}/ready-to-delivery`);
//     return response.data;
//   } catch (error) {
//     console.error("❌ Error fetching ready to delivery orders:", error);
//     throw error;
//   }
// };

// /**
//  * Create new order with payments
//  * @param {Object} orderData - Order data with payments array
//  * @returns {Promise} - Created order
//  */
// export const createOrder = async (orderData) => {
//   try {
//     console.log("📦 Creating order with data:", orderData);
//     const response = await API.post(ORDER_BASE, orderData);
//     return response.data;
//   } catch (error) {
//     console.error("❌ Error creating order:", error);
//     throw error;
//   }
// };

// /**
//  * Get all orders with filters
//  * @param {Object} params - Query params (page, limit, search, status, paymentStatus, timeFilter)
//  * @returns {Promise} - Paginated orders
//  */
// export const getAllOrders = async (params = {}) => {
//   try {
//     const response = await API.get(ORDER_BASE, { params });
//     return response.data;
//   } catch (error) {
//     console.error("❌ Error fetching orders:", error);
//     throw error;
//   }
// };

// /**
//  * Get orders by customer ID
//  * @param {string} customerId - Customer ID
//  * @returns {Promise} - Customer's orders
//  */
// export const getOrdersByCustomer = async (customerId) => {
//   try {
//     console.log(`🔍 Fetching orders for customer: ${customerId}`);
//     const response = await API.get(`${ORDER_BASE}/customer/${customerId}`);
//     return response.data;
//   } catch (error) {
//     console.error(`❌ Error fetching orders for customer ${customerId}:`, error);
//     throw error;
//   }
// };

// /**
//  * Get single order by ID (includes payments & works)
//  * @param {string} id - Order ID
//  * @returns {Promise} - Order details
//  */
// export const getOrderById = async (id) => {
//   try {
//     const response = await API.get(`${ORDER_BASE}/${id}`);
//     return response.data;
//   } catch (error) {
//     console.error(`❌ Error fetching order ${id}:`, error);
//     throw error;
//   }
// };

// /**
//  * Update order details
//  * @param {string} id - Order ID
//  * @param {Object} updateData - Data to update
//  * @returns {Promise} - Updated order
//  */
// export const updateOrder = async (id, updateData) => {
//   try {
//     const response = await API.put(`${ORDER_BASE}/${id}`, updateData);
//     return response.data;
//   } catch (error) {
//     console.error(`❌ Error updating order ${id}:`, error);
//     throw error;
//   }
// };

// /**
//  * Update order status only
//  * @param {string} id - Order ID
//  * @param {string} status - New status
//  * @returns {Promise} - Updated order
//  */
// export const updateOrderStatus = async (id, status) => {
//   try {
//     const response = await API.patch(`${ORDER_BASE}/${id}/status`, { status });
//     return response.data;
//   } catch (error) {
//     console.error(`❌ Error updating order status ${id}:`, error);
//     throw error;
//   }
// };

// /**
//  * Delete order (soft delete)
//  * @param {string} id - Order ID
//  * @returns {Promise} - Deletion confirmation
//  */
// export const deleteOrder = async (id) => {
//   try {
//     const response = await API.delete(`${ORDER_BASE}/${id}`);
//     return response.data;
//   } catch (error) {
//     console.error(`❌ Error deleting order ${id}:`, error);
//     throw error;
//   }
// };

// // ============================================
// // 💰 PAYMENT ROUTES (Specific to order)
// // ============================================

// /**
//  * Add payment to existing order
//  * @param {string} orderId - Order ID
//  * @param {Object} paymentData - Payment details
//  * @returns {Promise} - Created payment
//  */
// export const addPaymentToOrder = async (orderId, paymentData) => {
//   try {
//     console.log(`💰 Adding payment to order ${orderId}:`, paymentData);
//     const response = await API.post(`${ORDER_BASE}/${orderId}/payments`, paymentData);
//     return response.data;
//   } catch (error) {
//     console.error(`❌ Error adding payment to order ${orderId}:`, error);
//     throw error;
//   }
// };

// /**
//  * Get all payments for an order
//  * @param {string} orderId - Order ID
//  * @returns {Promise} - List of payments
//  */
// export const getOrderPayments = async (orderId) => {
//   try {
//     const response = await API.get(`${ORDER_BASE}/${orderId}/payments`);
//     return response.data;
//   } catch (error) {
//     console.error(`❌ Error fetching payments for order ${orderId}:`, error);
//     throw error;
//   }
// };

// // ============================================
// // 📊 EXPORT ALL FUNCTIONS
// // ============================================
// const orderApi = {
//   getOrderStats,
//   getDashboardData,
//   getReadyToDeliveryOrders, // ✅ NEW
//   createOrder,
//   getAllOrders,
//   getOrdersByCustomer,
//   getOrderById,
//   updateOrder,
//   updateOrderStatus,
//   deleteOrder,
//   addPaymentToOrder,
//   getOrderPayments
// };

// export default orderApi;





// // frontend/src/features/orders/orderApi.js
// import API from "../../app/axios";

// // ============================================
// // 📦 ORDER API - All API calls with DATE FILTER SUPPORT
// // ============================================

// const ORDER_BASE = "/orders";

// /**
//  * Helper function to build query string with filters
//  * @param {Object} params - Query parameters
//  * @returns {string} - Query string
//  */
// const buildQueryString = (params = {}) => {
//   const queryParams = new URLSearchParams();
  
//   Object.entries(params).forEach(([key, value]) => {
//     if (value !== undefined && value !== null && value !== '') {
//       queryParams.append(key, value);
//     }
//   });
  
//   const queryString = queryParams.toString();
//   return queryString ? `?${queryString}` : '';
// };

// // ============================================
// // 📊 STATS & DASHBOARD
// // ============================================

// /**
//  * Get order statistics for dashboard with date filters
//  * @param {Object} params - Optional params (period, startDate, endDate)
//  * @returns {Promise} - Stats data
//  */
// export const getOrderStats = async (params = {}) => {
//   try {
//     console.log('📊 Fetching order stats with params:', params);
//     const queryString = buildQueryString(params);
//     const response = await API.get(`${ORDER_BASE}/stats${queryString}`);
//     return response.data;
//   } catch (error) {
//     console.error("❌ Error fetching order stats:", error);
//     throw error;
//   }
// };

// /**
//  * Get dashboard data (today's orders, pending deliveries, collection)
//  * @returns {Promise} - Dashboard data
//  */
// export const getDashboardData = async () => {
//   try {
//     const response = await API.get(`${ORDER_BASE}/dashboard`);
//     return response.data;
//   } catch (error) {
//     console.error("❌ Error fetching dashboard data:", error);
//     throw error;
//   }
// };

// /**
//  * ✅ NEW: Get recent orders with date filters (for dashboard)
//  * @param {Object} params - { limit, startDate, endDate, period }
//  * @returns {Promise} - Recent orders
//  */
// export const getRecentOrders = async (params = {}) => {
//   try {
//     console.log('📋 Fetching recent orders with params:', params);
//     const queryString = buildQueryString(params);
//     const response = await API.get(`${ORDER_BASE}/recent${queryString}`);
//     return response.data;
//   } catch (error) {
//     console.error("❌ Error fetching recent orders:", error);
//     throw error;
//   }
// };

// /**
//  * ✅ NEW: Get filtered orders with pagination
//  * @param {Object} params - { page, limit, status, startDate, endDate, period }
//  * @returns {Promise} - Filtered orders with pagination
//  */
// export const getFilteredOrders = async (params = {}) => {
//   try {
//     console.log('🔍 Fetching filtered orders with params:', params);
//     const queryString = buildQueryString(params);
//     const response = await API.get(`${ORDER_BASE}${queryString}`);
//     return response.data;
//   } catch (error) {
//     console.error("❌ Error fetching filtered orders:", error);
//     throw error;
//   }
// };

// /**
//  * Get ready to delivery orders
//  * @param {Object} params - Optional filters
//  * @returns {Promise} - Ready to delivery orders
//  */
// export const getReadyToDeliveryOrders = async (params = {}) => {
//   try {
//     const queryString = buildQueryString(params);
//     const response = await API.get(`${ORDER_BASE}/ready-to-delivery${queryString}`);
//     return response.data;
//   } catch (error) {
//     console.error("❌ Error fetching ready to delivery orders:", error);
//     throw error;
//   }
// };

// // ============================================
// // 📝 CRUD OPERATIONS
// // ============================================

// /**
//  * Create new order with payments
//  * @param {Object} orderData - Order data with payments array
//  * @returns {Promise} - Created order
//  */
// export const createOrder = async (orderData) => {
//   try {
//     console.log("📦 Creating order with data:", orderData);
//     const response = await API.post(ORDER_BASE, orderData);
//     return response.data;
//   } catch (error) {
//     console.error("❌ Error creating order:", error);
//     throw error;
//   }
// };

// /**
//  * Get all orders with filters (alias for getFilteredOrders)
//  * @param {Object} params - Query params
//  * @returns {Promise} - Paginated orders
//  */
// export const getAllOrders = async (params = {}) => {
//   try {
//     return await getFilteredOrders(params);
//   } catch (error) {
//     console.error("❌ Error fetching orders:", error);
//     throw error;
//   }
// };

// /**
//  * Get orders by customer ID
//  * @param {string} customerId - Customer ID
//  * @param {Object} params - Optional filters
//  * @returns {Promise} - Customer's orders
//  */
// export const getOrdersByCustomer = async (customerId, params = {}) => {
//   try {
//     console.log(`🔍 Fetching orders for customer: ${customerId}`);
//     const queryString = buildQueryString(params);
//     const response = await API.get(`${ORDER_BASE}/customer/${customerId}${queryString}`);
//     return response.data;
//   } catch (error) {
//     console.error(`❌ Error fetching orders for customer ${customerId}:`, error);
//     throw error;
//   }
// };

// /**
//  * Get single order by ID (includes payments & works)
//  * @param {string} id - Order ID
//  * @returns {Promise} - Order details
//  */
// export const getOrderById = async (id) => {
//   try {
//     const response = await API.get(`${ORDER_BASE}/${id}`);
//     return response.data;
//   } catch (error) {
//     console.error(`❌ Error fetching order ${id}:`, error);
//     throw error;
//   }
// };

// /**
//  * Update order details
//  * @param {string} id - Order ID
//  * @param {Object} updateData - Data to update
//  * @returns {Promise} - Updated order
//  */
// export const updateOrder = async (id, updateData) => {
//   try {
//     const response = await API.put(`${ORDER_BASE}/${id}`, updateData);
//     return response.data;
//   } catch (error) {
//     console.error(`❌ Error updating order ${id}:`, error);
//     throw error;
//   }
// };

// /**
//  * Update order status only
//  * @param {string} id - Order ID
//  * @param {string} status - New status
//  * @returns {Promise} - Updated order
//  */
// export const updateOrderStatus = async (id, status) => {
//   try {
//     const response = await API.patch(`${ORDER_BASE}/${id}/status`, { status });
//     return response.data;
//   } catch (error) {
//     console.error(`❌ Error updating order status ${id}:`, error);
//     throw error;
//   }
// };

// /**
//  * Delete order (soft delete)
//  * @param {string} id - Order ID
//  * @returns {Promise} - Deletion confirmation
//  */
// export const deleteOrder = async (id) => {
//   try {
//     const response = await API.delete(`${ORDER_BASE}/${id}`);
//     return response.data;
//   } catch (error) {
//     console.error(`❌ Error deleting order ${id}:`, error);
//     throw error;
//   }
// };

// // ============================================
// // 💰 PAYMENT ROUTES
// // ============================================

// /**
//  * Add payment to existing order
//  * @param {string} orderId - Order ID
//  * @param {Object} paymentData - Payment details
//  * @returns {Promise} - Created payment
//  */
// export const addPaymentToOrder = async (orderId, paymentData) => {
//   try {
//     console.log(`💰 Adding payment to order ${orderId}:`, paymentData);
//     const response = await API.post(`${ORDER_BASE}/${orderId}/payments`, paymentData);
//     return response.data;
//   } catch (error) {
//     console.error(`❌ Error adding payment to order ${orderId}:`, error);
//     throw error;
//   }
// };

// /**
//  * Get all payments for an order
//  * @param {string} orderId - Order ID
//  * @returns {Promise} - List of payments
//  */
// export const getOrderPayments = async (orderId) => {
//   try {
//     const response = await API.get(`${ORDER_BASE}/${orderId}/payments`);
//     return response.data;
//   } catch (error) {
//     console.error(`❌ Error fetching payments for order ${orderId}:`, error);
//     throw error;
//   }
// };




// // ============================================
// // 🟢 NEW: ORDER DATES ROUTE (SIMPLE - JUST DATES WITH ORDERS)
// // ============================================

// /**
//  * Get dates that have orders (for calendar green dots)
//  * @param {Object} params - { month, year }
//  * @returns {Promise} - Array of dates with orders ["2026-03-19", "2026-03-23", "2026-03-29"]
//  */
// export const getOrderDates = async (params = {}) => {
//   try {
//     const { month, year } = params;
    
//     if (month === undefined || year === undefined) {
//       throw new Error("Month and year are required");
//     }
    
//     console.log(`🟢 Fetching order dates for month: ${month}, year: ${year}`);
    
//     const queryString = buildQueryString({ month, year });
//     const response = await API.get(`${ORDER_BASE}/order-dates${queryString}`);
    
//     console.log(`✅ Found ${response.data?.dates?.length || 0} dates with orders`);
    
//     return response.data;
//   } catch (error) {
//     console.error("❌ Error fetching order dates:", error);
//     throw error;
//   }
// };

// // ============================================
// // 📊 EXPORT ALL FUNCTIONS
// // ============================================
// const orderApi = {
//   // Stats & Dashboard
//   getOrderStats,
//   getDashboardData,
//   getRecentOrders,           // ✅ NEW
//   getFilteredOrders,         // ✅ NEW
//   getReadyToDeliveryOrders,
  
//   // CRUD
//   createOrder,
//   getAllOrders,
//   getOrdersByCustomer,
//   getOrderById,
//   updateOrder,
//   updateOrderStatus,
//   deleteOrder,
  
//   // Payments
//   addPaymentToOrder,
//   getOrderPayments,
//   getOrderDates
// };

// export default orderApi;




//clander 
// frontend/src/features/orders/orderApi.js
// import API from "../../app/axios";

// // ============================================
// // 📦 ORDER API - All API calls with DATE FILTER SUPPORT
// // ============================================

// const ORDER_BASE = "/orders";

// /**
//  * Helper function to build query string with filters
//  * @param {Object} params - Query parameters
//  * @returns {string} - Query string
//  */
// const buildQueryString = (params = {}) => {
//   const queryParams = new URLSearchParams();
  
//   Object.entries(params).forEach(([key, value]) => {
//     if (value !== undefined && value !== null && value !== '') {
//       queryParams.append(key, value);
//     }
//   });
  
//   const queryString = queryParams.toString();
//   return queryString ? `?${queryString}` : '';
// };

// // ============================================
// // 📊 STATS & DASHBOARD
// // ============================================

// /**
//  * Get order statistics for dashboard with date filters
//  * @param {Object} params - Optional params (period, startDate, endDate)
//  * @returns {Promise} - Stats data
//  */
// export const getOrderStats = async (params = {}) => {
//   try {
//     console.log('📊 Fetching order stats with params:', params);
//     const queryString = buildQueryString(params);
//     const response = await API.get(`${ORDER_BASE}/stats${queryString}`);
//     return response.data;
//   } catch (error) {
//     console.error("❌ Error fetching order stats:", error);
//     throw error;
//   }
// };

// /**
//  * Get dashboard data (today's orders, pending deliveries, collection)
//  * @returns {Promise} - Dashboard data
//  */
// export const getDashboardData = async () => {
//   try {
//     const response = await API.get(`${ORDER_BASE}/dashboard`);
//     return response.data;
//   } catch (error) {
//     console.error("❌ Error fetching dashboard data:", error);
//     throw error;
//   }
// };

// /**
//  * ✅ NEW: Get recent orders with date filters (for dashboard)
//  * @param {Object} params - { limit, startDate, endDate, period }
//  * @returns {Promise} - Recent orders
//  */
// export const getRecentOrders = async (params = {}) => {
//   try {
//     console.log('📋 Fetching recent orders with params:', params);
//     const queryString = buildQueryString(params);
//     const response = await API.get(`${ORDER_BASE}/recent${queryString}`);
//     return response.data;
//   } catch (error) {
//     console.error("❌ Error fetching recent orders:", error);
//     throw error;
//   }
// };

// /**
//  * ✅ NEW: Get filtered orders with pagination
//  * @param {Object} params - { page, limit, status, startDate, endDate, period }
//  * @returns {Promise} - Filtered orders with pagination
//  */
// export const getFilteredOrders = async (params = {}) => {
//   try {
//     console.log('🔍 Fetching filtered orders with params:', params);
//     const queryString = buildQueryString(params);
//     const response = await API.get(`${ORDER_BASE}${queryString}`);
//     return response.data;
//   } catch (error) {
//     console.error("❌ Error fetching filtered orders:", error);
//     throw error;
//   }
// };

// /**
//  * Get ready to delivery orders
//  * @param {Object} params - Optional filters
//  * @returns {Promise} - Ready to delivery orders
//  */
// export const getReadyToDeliveryOrders = async (params = {}) => {
//   try {
//     const queryString = buildQueryString(params);
//     const response = await API.get(`${ORDER_BASE}/ready-to-delivery${queryString}`);
//     return response.data;
//   } catch (error) {
//     console.error("❌ Error fetching ready to delivery orders:", error);
//     throw error;
//   }
// };

// // ============================================
// // 📝 CRUD OPERATIONS
// // ============================================

// /**
//  * Create new order with payments
//  * @param {Object} orderData - Order data with payments array
//  * @returns {Promise} - Created order
//  */
// export const createOrder = async (orderData) => {
//   try {
//     console.log("📦 Creating order with data:", orderData);
//     const response = await API.post(ORDER_BASE, orderData);
//     return response.data;
//   } catch (error) {
//     console.error("❌ Error creating order:", error);
//     throw error;
//   }
// };

// /**
//  * Get all orders with filters (alias for getFilteredOrders)
//  * @param {Object} params - Query params
//  * @returns {Promise} - Paginated orders
//  */
// export const getAllOrders = async (params = {}) => {
//   try {
//     return await getFilteredOrders(params);
//   } catch (error) {
//     console.error("❌ Error fetching orders:", error);
//     throw error;
//   }
// };

// /**
//  * Get orders by customer ID
//  * @param {string} customerId - Customer ID
//  * @param {Object} params - Optional filters
//  * @returns {Promise} - Customer's orders
//  */
// export const getOrdersByCustomer = async (customerId, params = {}) => {
//   try {
//     console.log(`🔍 Fetching orders for customer: ${customerId}`);
//     const queryString = buildQueryString(params);
//     const response = await API.get(`${ORDER_BASE}/customer/${customerId}${queryString}`);
//     return response.data;
//   } catch (error) {
//     console.error(`❌ Error fetching orders for customer ${customerId}:`, error);
//     throw error;
//   }
// };

// /**
//  * Get single order by ID (includes payments & works)
//  * @param {string} id - Order ID
//  * @returns {Promise} - Order details
//  */
// export const getOrderById = async (id) => {
//   try {
//     const response = await API.get(`${ORDER_BASE}/${id}`);
//     return response.data;
//   } catch (error) {
//     console.error(`❌ Error fetching order ${id}:`, error);
//     throw error;
//   }
// };

// /**
//  * Update order details
//  * @param {string} id - Order ID
//  * @param {Object} updateData - Data to update
//  * @returns {Promise} - Updated order
//  */
// export const updateOrder = async (id, updateData) => {
//   try {
//     const response = await API.put(`${ORDER_BASE}/${id}`, updateData);
//     return response.data;
//   } catch (error) {
//     console.error(`❌ Error updating order ${id}:`, error);
//     throw error;
//   }
// };

// /**
//  * Update order status only
//  * @param {string} id - Order ID
//  * @param {string} status - New status
//  * @returns {Promise} - Updated order
//  */
// export const updateOrderStatus = async (id, status) => {
//   try {
//     const response = await API.patch(`${ORDER_BASE}/${id}/status`, { status });
//     return response.data;
//   } catch (error) {
//     console.error(`❌ Error updating order status ${id}:`, error);
//     throw error;
//   }
// };

// /**
//  * Delete order (soft delete)
//  * @param {string} id - Order ID
//  * @returns {Promise} - Deletion confirmation
//  */
// export const deleteOrder = async (id) => {
//   try {
//     const response = await API.delete(`${ORDER_BASE}/${id}`);
//     return response.data;
//   } catch (error) {
//     console.error(`❌ Error deleting order ${id}:`, error);
//     throw error;
//   }
// };

// // ============================================
// // 💰 PAYMENT ROUTES
// // ============================================

// /**
//  * Add payment to existing order
//  * @param {string} orderId - Order ID
//  * @param {Object} paymentData - Payment details
//  * @returns {Promise} - Created payment
//  */
// export const addPaymentToOrder = async (orderId, paymentData) => {
//   try {
//     console.log(`💰 Adding payment to order ${orderId}:`, paymentData);
//     const response = await API.post(`${ORDER_BASE}/${orderId}/payments`, paymentData);
//     return response.data;
//   } catch (error) {
//     console.error(`❌ Error adding payment to order ${orderId}:`, error);
//     throw error;
//   }
// };

// /**
//  * Get all payments for an order
//  * @param {string} orderId - Order ID
//  * @returns {Promise} - List of payments
//  */
// export const getOrderPayments = async (orderId) => {
//   try {
//     const response = await API.get(`${ORDER_BASE}/${orderId}/payments`);
//     return response.data;
//   } catch (error) {
//     console.error(`❌ Error fetching payments for order ${orderId}:`, error);
//     throw error;
//   }
// };

// // ============================================
// // 🟢 NEW: ORDER DATES ROUTE (SIMPLE - JUST DATES WITH ORDERS)
// // ============================================

// /**
//  * Get dates that have orders (for calendar green dots)
//  * @param {Object} params - { month, year }
//  * @returns {Promise} - Array of dates with orders ["2026-03-19", "2026-03-23", "2026-03-29"]
//  */
// export const getOrderDates = async (params = {}) => {
//   try {
//     const { month, year } = params;
    
//     if (month === undefined || year === undefined) {
//       throw new Error("Month and year are required");
//     }
    
//     console.log(`🟢 Fetching order dates for month: ${month}, year: ${year}`);
    
//     const queryString = buildQueryString({ month, year });
//     const response = await API.get(`${ORDER_BASE}/order-dates${queryString}`);
    
//     console.log(`✅ Found ${response.data?.dates?.length || 0} dates with orders`);
    
//     return response.data;
//   } catch (error) {
//     console.error("❌ Error fetching order dates:", error);
//     throw error;
//   }
// };

// // ============================================
// // 📊 EXPORT ALL FUNCTIONS
// // ============================================
// const orderApi = {
//   // Stats & Dashboard
//   getOrderStats,
//   getDashboardData,
//   getRecentOrders,
//   getFilteredOrders,
//   getReadyToDeliveryOrders,
  
//   // CRUD
//   createOrder,
//   getAllOrders,
//   getOrdersByCustomer,
//   getOrderById,
//   updateOrder,
//   updateOrderStatus,
//   deleteOrder,
  
//   // Payments
//   addPaymentToOrder,
//   getOrderPayments,
  
//   // 🟢 NEW: Order Dates (for calendar green dots)
//   getOrderDates
// };

// export default orderApi;


// frontend/src/features/orders/orderApi.js
import API from "../../app/axios";

// ============================================
// 📦 ORDER API - All API calls with DATE FILTER SUPPORT
// ============================================

// const ORDER_BASE = "/orders";

// /**
//  * Helper function to build query string with filters
//  * @param {Object} params - Query parameters
//  * @returns {string} - Query string
//  */
// const buildQueryString = (params = {}) => {
//   const queryParams = new URLSearchParams();
  
//   Object.entries(params).forEach(([key, value]) => {
//     if (value !== undefined && value !== null && value !== '') {
//       queryParams.append(key, value);
//     }
//   });
  
//   const queryString = queryParams.toString();
//   return queryString ? `?${queryString}` : '';
// };

// // ============================================
// // 📊 STATS & DASHBOARD
// // ============================================

// /**
//  * Get order statistics for dashboard with date filters
//  * @param {Object} params - Optional params (period, startDate, endDate)
//  * @returns {Promise} - Stats data
//  */
// export const getOrderStats = async (params = {}) => {
//   try {
//     console.log('📊 [API] getOrderStats called with params:', params);
//     const queryString = buildQueryString(params);
//     console.log('📊 [API] getOrderStats query string:', queryString);
//     const response = await API.get(`${ORDER_BASE}/stats${queryString}`);
//     console.log('📊 [API] getOrderStats response:', response.data);
//     return response.data;
//   } catch (error) {
//     console.error("❌ [API] Error fetching order stats:", {
//       message: error.message,
//       response: error.response?.data,
//       status: error.response?.status
//     });
//     throw error;
//   }
// };

// /**
//  * Get dashboard data (today's orders, pending deliveries, collection)
//  * @returns {Promise} - Dashboard data
//  */
// export const getDashboardData = async () => {
//   try {
//     console.log('📊 [API] getDashboardData called');
//     const response = await API.get(`${ORDER_BASE}/dashboard`);
//     console.log('📊 [API] getDashboardData response:', response.data);
//     return response.data;
//   } catch (error) {
//     console.error("❌ [API] Error fetching dashboard data:", error);
//     throw error;
//   }
// };

// /**
//  * Get recent orders with date filters (for dashboard)
//  * @param {Object} params - { limit, startDate, endDate, period }
//  * @returns {Promise} - Recent orders
//  */
// export const getRecentOrders = async (params = {}) => {
//   try {
//     console.log('📋 [API] getRecentOrders called with params:', params);
//     const queryString = buildQueryString(params);
//     console.log('📋 [API] getRecentOrders query string:', queryString);
//     const response = await API.get(`${ORDER_BASE}/recent${queryString}`);
//     console.log('📋 [API] getRecentOrders response:', response.data);
//     return response.data;
//   } catch (error) {
//     console.error("❌ [API] Error fetching recent orders:", error);
//     throw error;
//   }
// };

// /**
//  * Get filtered orders with pagination
//  * @param {Object} params - { page, limit, status, startDate, endDate, period }
//  * @returns {Promise} - Filtered orders with pagination
//  */
// export const getFilteredOrders = async (params = {}) => {
//   try {
//     console.log('🔍 [API] getFilteredOrders called with params:', params);
//     const queryString = buildQueryString(params);
//     console.log('🔍 [API] getFilteredOrders query string:', queryString);
//     const response = await API.get(`${ORDER_BASE}${queryString}`);
//     console.log('🔍 [API] getFilteredOrders response:', response.data);
//     return response.data;
//   } catch (error) {
//     console.error("❌ [API] Error fetching filtered orders:", error);
//     throw error;
//   }
// };

// /**
//  * Get ready to delivery orders
//  * @param {Object} params - Optional filters
//  * @returns {Promise} - Ready to delivery orders
//  */
// export const getReadyToDeliveryOrders = async (params = {}) => {
//   try {
//     console.log('🚚 [API] getReadyToDeliveryOrders called with params:', params);
//     const queryString = buildQueryString(params);
//     const response = await API.get(`${ORDER_BASE}/ready-to-delivery${queryString}`);
//     console.log('🚚 [API] getReadyToDeliveryOrders response:', response.data);
//     return response.data;
//   } catch (error) {
//     console.error("❌ [API] Error fetching ready to delivery orders:", error);
//     throw error;
//   }
// };

// // ============================================
// // 📝 CRUD OPERATIONS
// // ============================================

// /**
//  * Create new order with payments
//  * @param {Object} orderData - Order data with payments array
//  * @returns {Promise} - Created order
//  */
// export const createOrder = async (orderData) => {
//   console.log("\n========== 🚀 [API] createOrder START ==========");
//   console.log("📦 [API] createOrder called with data:", JSON.stringify(orderData, null, 2));
  
//   // Validate required fields before sending
//   const requiredFields = ['customer', 'orderDate', 'deliveryDate', 'garments'];
//   const missingFields = requiredFields.filter(field => !orderData[field]);
  
//   if (missingFields.length > 0) {
//     console.error("❌ [API] Missing required fields:", missingFields);
//     throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
//   }
  
//   // Validate garments array
//   if (!Array.isArray(orderData.garments) || orderData.garments.length === 0) {
//     console.error("❌ [API] Garments must be a non-empty array");
//     throw new Error("At least one garment is required");
//   }
  
//   // Validate each garment - UPDATED to match your data structure
//   orderData.garments.forEach((garment, index) => {
//     console.log(`📦 [API] Garment ${index + 1}:`, JSON.stringify(garment, null, 2));
    
//     // Check for garmentType (more flexible validation)
//     const hasGarmentType = garment.garmentType || garment.item || garment.itemName || garment.name;
//     if (!hasGarmentType) {
//       console.error(`❌ [API] Garment ${index + 1} missing type information`);
//       throw new Error(`Garment ${index + 1} is missing type information`);
//     }
    
//     // Check for price information
//     const hasPrice = garment.priceRange?.min !== undefined || garment.price?.min !== undefined;
//     if (!hasPrice) {
//       console.error(`❌ [API] Garment ${index + 1} missing price information`);
//       throw new Error(`Garment ${index + 1} must have price information`);
//     }
//   });
  
//   // Validate payments if any
//   if (orderData.payments && orderData.payments.length > 0) {
//     orderData.payments.forEach((payment, index) => {
//       console.log(`💰 [API] Payment ${index + 1}:`, payment);
      
//       if (!payment.amount || payment.amount <= 0) {
//         console.error(`❌ [API] Payment ${index + 1} invalid amount:`, payment.amount);
//         throw new Error(`Payment ${index + 1} must have a valid amount`);
//       }
      
//       if (!payment.method) {
//         console.error(`❌ [API] Payment ${index + 1} missing method`);
//         throw new Error(`Payment ${index + 1} must have a payment method`);
//       }
//     });
//   }
  
//   try {
//     console.log("📡 [API] Sending POST request to:", `${ORDER_BASE}`);
//     console.log("📡 [API] Request headers:", API.defaults.headers);
    
//     const response = await API.post(ORDER_BASE, orderData);
    
//     console.log("✅ [API] createOrder SUCCESS!");
//     console.log("📦 [API] Response status:", response.status);
//     console.log("📦 [API] Response data:", JSON.stringify(response.data, null, 2));
//     console.log("========== 🎉 [API] createOrder END ==========\n");
    
//     return response.data;
//   } catch (error) {
//     console.error("\n========== ❌ [API] createOrder ERROR ==========");
//     console.error("❌ [API] Error message:", error.message);
//     console.error("❌ [API] Error response:", error.response?.data);
//     console.error("❌ [API] Error status:", error.response?.status);
//     console.error("❌ [API] Error headers:", error.response?.headers);
    
//     if (error.response?.data?.errors) {
//       console.error("❌ [API] Validation errors:", error.response.data.errors);
//     }
    
//     if (error.response?.data?.message) {
//       console.error("❌ [API] Error message from server:", error.response.data.message);
//     }
    
//     console.error("========== 🔴 [API] createOrder ERROR END ==========\n");
//     throw error;
//   }
// };

// /**
//  * Get all orders with filters (alias for getFilteredOrders)
//  * @param {Object} params - Query params
//  * @returns {Promise} - Paginated orders
//  */
// export const getAllOrders = async (params = {}) => {
//   try {
//     console.log('📋 [API] getAllOrders called with params:', params);
//     return await getFilteredOrders(params);
//   } catch (error) {
//     console.error("❌ [API] Error fetching orders:", error);
//     throw error;
//   }
// };

// /**
//  * Get orders by customer ID
//  * @param {string} customerId - Customer ID
//  * @param {Object} params - Optional filters
//  * @returns {Promise} - Customer's orders
//  */
// export const getOrdersByCustomer = async (customerId, params = {}) => {
//   try {
//     console.log(`🔍 [API] getOrdersByCustomer called for customer: ${customerId}`, params);
//     const queryString = buildQueryString(params);
//     console.log(`🔍 [API] getOrdersByCustomer query string:`, queryString);
//     const response = await API.get(`${ORDER_BASE}/customer/${customerId}${queryString}`);
//     console.log(`🔍 [API] getOrdersByCustomer response:`, response.data);
//     return response.data;
//   } catch (error) {
//     console.error(`❌ [API] Error fetching orders for customer ${customerId}:`, error);
//     throw error;
//   }
// };

// /**
//  * Get single order by ID (includes payments & works)
//  * @param {string} id - Order ID
//  * @returns {Promise} - Order details
//  */
// export const getOrderById = async (id) => {
//   try {
//     console.log(`🔍 [API] getOrderById called for ID: ${id}`);
//     const response = await API.get(`${ORDER_BASE}/${id}`);
//     console.log(`🔍 [API] getOrderById response:`, response.data);
//     return response.data;
//   } catch (error) {
//     console.error(`❌ [API] Error fetching order ${id}:`, error);
//     throw error;
//   }
// };

// /**
//  * Update order details
//  * @param {string} id - Order ID
//  * @param {Object} updateData - Data to update
//  * @returns {Promise} - Updated order
//  */
// export const updateOrder = async (id, updateData) => {
//   try {
//     console.log(`✏️ [API] updateOrder called for ID: ${id}`, updateData);
//     const response = await API.put(`${ORDER_BASE}/${id}`, updateData);
//     console.log(`✏️ [API] updateOrder response:`, response.data);
//     return response.data;
//   } catch (error) {
//     console.error(`❌ [API] Error updating order ${id}:`, error);
//     throw error;
//   }
// };

// /**
//  * Update order status only
//  * @param {string} id - Order ID
//  * @param {string} status - New status
//  * @returns {Promise} - Updated order
//  */
// export const updateOrderStatus = async (id, status) => {
//   try {
//     console.log(`🔄 [API] updateOrderStatus called for ID: ${id} with status: ${status}`);
//     const response = await API.patch(`${ORDER_BASE}/${id}/status`, { status });
//     console.log(`🔄 [API] updateOrderStatus response:`, response.data);
//     return response.data;
//   } catch (error) {
//     console.error(`❌ [API] Error updating order status ${id}:`, error);
//     throw error;
//   }
// };

// /**
//  * Delete order (soft delete)
//  * @param {string} id - Order ID
//  * @returns {Promise} - Deletion confirmation
//  */
// export const deleteOrder = async (id) => {
//   try {
//     console.log(`🗑️ [API] deleteOrder called for ID: ${id}`);
//     const response = await API.delete(`${ORDER_BASE}/${id}`);
//     console.log(`🗑️ [API] deleteOrder response:`, response.data);
//     return response.data;
//   } catch (error) {
//     console.error(`❌ [API] Error deleting order ${id}:`, error);
//     throw error;
//   }
// };

// // ============================================
// // 💰 PAYMENT ROUTES
// // ============================================

// /**
//  * Add payment to existing order
//  * @param {string} orderId - Order ID
//  * @param {Object} paymentData - Payment details
//  * @returns {Promise} - Created payment
//  */
// export const addPaymentToOrder = async (orderId, paymentData) => {
//   try {
//     console.log(`💰 [API] addPaymentToOrder called for order ${orderId}:`, paymentData);
//     const response = await API.post(`${ORDER_BASE}/${orderId}/payments`, paymentData);
//     console.log(`💰 [API] addPaymentToOrder response:`, response.data);
//     return response.data;
//   } catch (error) {
//     console.error(`❌ [API] Error adding payment to order ${orderId}:`, error);
//     throw error;
//   }
// };

// /**
//  * Get all payments for an order
//  * @param {string} orderId - Order ID
//  * @returns {Promise} - List of payments
//  */
// export const getOrderPayments = async (orderId) => {
//   try {
//     console.log(`💰 [API] getOrderPayments called for order ${orderId}`);
//     const response = await API.get(`${ORDER_BASE}/${orderId}/payments`);
//     console.log(`💰 [API] getOrderPayments response:`, response.data);
//     return response.data;
//   } catch (error) {
//     console.error(`❌ [API] Error fetching payments for order ${orderId}:`, error);
//     throw error;
//   }
// };

// // ============================================
// // 🟢 ORDER DATES ROUTE (for calendar green dots)
// // ============================================

// /**
//  * Get dates that have orders (for calendar green dots)
//  * @param {Object} params - { month, year }
//  * @returns {Promise} - Array of dates with orders ["2026-03-19", "2026-03-23", "2026-03-29"]
//  */
// export const getOrderDates = async (params = {}) => {
//   try {
//     const { month, year } = params;
    
//     if (month === undefined || year === undefined) {
//       throw new Error("Month and year are required");
//     }
    
//     console.log(`🟢 [API] getOrderDates called for month: ${month}, year: ${year}`);
    
//     const queryString = buildQueryString({ month, year });
//     console.log(`🟢 [API] getOrderDates query string:`, queryString);
    
//     const response = await API.get(`${ORDER_BASE}/order-dates${queryString}`);
    
//     console.log(`✅ [API] Found ${response.data?.dates?.length || 0} dates with orders:`, response.data?.dates);
    
//     return response.data;
//   } catch (error) {
//     console.error("❌ [API] Error fetching order dates:", error);
//     throw error;
//   }
// };

// // ============================================
// // 📊 EXPORT ALL FUNCTIONS
// // ============================================
// const orderApi = {
//   // Stats & Dashboard
//   getOrderStats,
//   getDashboardData,
//   getRecentOrders,
//   getFilteredOrders,
//   getReadyToDeliveryOrders,
  
//   // CRUD
//   createOrder,
//   getAllOrders,
//   getOrdersByCustomer,
//   getOrderById,
//   updateOrder,
//   updateOrderStatus,
//   deleteOrder,
  
//   // Payments
//   addPaymentToOrder,
//   getOrderPayments,
  
//   // 🟢 Order Dates (for calendar green dots)
//   getOrderDates
// };

// export default orderApi;


















// // frontend/src/features/orders/orderApi.js
// import axiosInstance from "../../app/axios"; // 1. Renamed import to avoid conflict

// // ============================================
// // 📦 ORDER API - All API calls with DATE FILTER SUPPORT
// // ============================================

// const ORDER_BASE = "/orders";

// /**
//  * Helper function to build query string with filters
//  * @param {Object} params - Query parameters
//  * @returns {string} - Query string
//  */
// const buildQueryString = (params = {}) => {
//   const queryParams = new URLSearchParams();
  
//   Object.entries(params).forEach(([key, value]) => {
//     if (value !== undefined && value !== null && value !== '') {
//       queryParams.append(key, value);
//     }
//   });
  
//   const queryString = queryParams.toString();
//   return queryString ? `?${queryString}` : '';
// };

// // ============================================
// // 📊 STATS & DASHBOARD
// // ============================================

// export const getOrderStats = async (params = {}) => {
//   try {
//     const queryString = buildQueryString(params);
//     const response = await axiosInstance.get(`${ORDER_BASE}/stats${queryString}`);
//     return response.data;
//   } catch (error) {
//     console.error("❌ [API] Error fetching order stats:", error);
//     throw error;
//   }
// };

// export const getDashboardData = async () => {
//   try {
//     const response = await axiosInstance.get(`${ORDER_BASE}/dashboard`);
//     return response.data;
//   } catch (error) {
//     console.error("❌ [API] Error fetching dashboard data:", error);
//     throw error;
//   }
// };

// export const getRecentOrders = async (params = {}) => {
//   try {
//     const queryString = buildQueryString(params);
//     const response = await axiosInstance.get(`${ORDER_BASE}/recent${queryString}`);
//     return response.data;
//   } catch (error) {
//     console.error("❌ [API] Error fetching recent orders:", error);
//     throw error;
//   }
// };

// export const getFilteredOrders = async (params = {}) => {
//   try {
//     const queryString = buildQueryString(params);
//     const response = await axiosInstance.get(`${ORDER_BASE}${queryString}`);
//     return response.data;
//   } catch (error) {
//     console.error("❌ [API] Error fetching filtered orders:", error);
//     throw error;
//   }
// };

// export const getReadyToDeliveryOrders = async (params = {}) => {
//   try {
//     const queryString = buildQueryString(params);
//     const response = await axiosInstance.get(`${ORDER_BASE}/ready-to-delivery${queryString}`);
//     return response.data;
//   } catch (error) {
//     console.error("❌ [API] Error fetching ready to delivery orders:", error);
//     throw error;
//   }
// };

// // ============================================
// // 📝 CRUD OPERATIONS
// // ============================================

// /**
//  * Create new order with payments and images
//  * @param {FormData|Object} orderData - Order data (Supports both JSON and FormData)
//  */
// export const createOrder = async (orderData) => {
//   console.log("\n========== 🚀 [API] createOrder START ==========");
  
//   const isFormData = orderData instanceof FormData;
  
//   try {
//     const config = {
//       headers: {
//         // 🔥 Set header dynamically: browser handles boundary for FormData automatically
//         'Content-Type': isFormData ? 'multipart/form-data' : 'application/json',
//       }
//     };

//     const response = await axiosInstance.post(ORDER_BASE, orderData, config);
    
//     console.log("✅ [API] createOrder SUCCESS!");
//     return response.data;
//   } catch (error) {
//     console.error("\n========== ❌ [API] createOrder ERROR ==========");
//     console.error("❌ Message:", error.response?.data?.message || error.message);
//     throw error;
//   }
// };

// export const getAllOrders = async (params = {}) => {
//   return await getFilteredOrders(params);
// };

// export const getOrdersByCustomer = async (customerId, params = {}) => {
//   try {
//     const queryString = buildQueryString(params);
//     const response = await axiosInstance.get(`${ORDER_BASE}/customer/${customerId}${queryString}`);
//     return response.data;
//   } catch (error) {
//     console.error(`❌ Error fetching customer orders:`, error);
//     throw error;
//   }
// };

// export const getOrderById = async (id) => {
//   try {
//     const response = await axiosInstance.get(`${ORDER_BASE}/${id}`);
//     return response.data;
//   } catch (error) {
//     console.error(`❌ Error fetching order ${id}:`, error);
//     throw error;
//   }
// };

// export const updateOrder = async (id, updateData) => {
//   try {
//     const response = await axiosInstance.put(`${ORDER_BASE}/${id}`, updateData);
//     return response.data;
//   } catch (error) {
//     console.error(`❌ Error updating order:`, error);
//     throw error;
//   }
// };

// export const updateOrderStatus = async (id, status) => {
//   try {
//     const response = await axiosInstance.patch(`${ORDER_BASE}/${id}/status`, { status });
//     return response.data;
//   } catch (error) {
//     console.error(`❌ Error updating status:`, error);
//     throw error;
//   }
// };

// export const deleteOrder = async (id) => {
//   try {
//     const response = await axiosInstance.delete(`${ORDER_BASE}/${id}`);
//     return response.data;
//   } catch (error) {
//     console.error(`❌ Error deleting order:`, error);
//     throw error;
//   }
// };

// // ============================================
// // 💰 PAYMENT ROUTES
// // ============================================

// export const addPaymentToOrder = async (orderId, paymentData) => {
//   try {
//     const response = await axiosInstance.post(`${ORDER_BASE}/${orderId}/payments`, paymentData);
//     return response.data;
//   } catch (error) {
//     console.error(`❌ Error adding payment:`, error);
//     throw error;
//   }
// };

// export const getOrderPayments = async (orderId) => {
//   try {
//     const response = await axiosInstance.get(`${ORDER_BASE}/${orderId}/payments`);
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

// // ============================================
// // 🟢 ORDER DATES ROUTE (for calendar)
// // ============================================

// export const getOrderDates = async (params = {}) => {
//   try {
//     const queryString = buildQueryString(params);
//     const response = await axiosInstance.get(`${ORDER_BASE}/order-dates${queryString}`);
//     return response.data;
//   } catch (error) {
//     console.error("❌ Error fetching order dates:", error);
//     throw error;
//   }
// };

// // 2. Exporting as 'orderApi' as intended
// const orderApi = {
//   getOrderStats,
//   getDashboardData,
//   getRecentOrders,
//   getFilteredOrders,
//   getReadyToDeliveryOrders,
//   createOrder,
//   getAllOrders,
//   getOrdersByCustomer,
//   getOrderById,
//   updateOrder,
//   updateOrderStatus,
//   deleteOrder,
//   addPaymentToOrder,
//   getOrderPayments,
//   getOrderDates
// };

// export default orderApi;

















// frontend/src/features/orders/orderApi.js
import axiosInstance from "../../app/axios";

// ============================================
// 📦 ORDER API - All API calls with DATE FILTER SUPPORT
// ============================================

const ORDER_BASE = "/orders";

/**
 * Helper function to build query string with filters
 * @param {Object} params - Query parameters
 * @returns {string} - Query string
 */
const buildQueryString = (params = {}) => {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value);
    }
  });
  
  const queryString = queryParams.toString();
  return queryString ? `?${queryString}` : '';
};

// ============================================
// 📊 STATS & DASHBOARD
// ============================================

export const getOrderStats = async (params = {}) => {
  try {
    const queryString = buildQueryString(params);
    const response = await axiosInstance.get(`${ORDER_BASE}/stats${queryString}`);
    return response.data;
  } catch (error) {
    console.error("❌ [API] Error fetching order stats:", error);
    throw error;
  }
};

export const getDashboardData = async () => {
  try {
    const response = await axiosInstance.get(`${ORDER_BASE}/dashboard`);
    return response.data;
  } catch (error) {
    console.error("❌ [API] Error fetching dashboard data:", error);
    throw error;
  }
};

export const getRecentOrders = async (params = {}) => {
  try {
    const queryString = buildQueryString(params);
    const response = await axiosInstance.get(`${ORDER_BASE}/recent${queryString}`);
    return response.data;
  } catch (error) {
    console.error("❌ [API] Error fetching recent orders:", error);
    throw error;
  }
};

export const getFilteredOrders = async (params = {}) => {
  try {
    const queryString = buildQueryString(params);
    const response = await axiosInstance.get(`${ORDER_BASE}${queryString}`);
    return response.data;
  } catch (error) {
    console.error("❌ [API] Error fetching filtered orders:", error);
    throw error;
  }
};

export const getReadyToDeliveryOrders = async (params = {}) => {
  try {
    // We use the main order endpoint with status filter instead of a dedicated endpoint
    // since the backend might not have /ready-to-delivery route implemented
    const queryString = buildQueryString({ ...params, status: 'ready-to-delivery' });
    const response = await axiosInstance.get(`${ORDER_BASE}${queryString}`);
    return response.data;
  } catch (error) {
    console.error("❌ [API] Error fetching ready to delivery orders:", error);
    throw error;
  }
};

// ============================================
// 📝 CRUD OPERATIONS
// ============================================

/**
 * Create new order with payments and images
 * @param {FormData|Object} orderData - Order data (Supports both JSON and FormData)
 */
export const createOrder = async (orderData) => {
  console.log("\n========== 🚀 [API] createOrder START ==========");
  
  const isFormData = orderData instanceof FormData;
  
  try {
    const config = {
      headers: {
        'Content-Type': isFormData ? 'multipart/form-data' : 'application/json',
      }
    };

    const response = await axiosInstance.post(ORDER_BASE, orderData, config);
    
    console.log("✅ [API] createOrder SUCCESS!");
    return response.data;
  } catch (error) {
    console.error("\n========== ❌ [API] createOrder ERROR ==========");
    console.error("❌ Message:", error.response?.data?.message || error.message);
    throw error;
  }
};

export const getAllOrders = async (params = {}) => {
  return await getFilteredOrders(params);
};

export const getOrdersByCustomer = async (customerId, params = {}) => {
  try {
    const queryString = buildQueryString(params);
    const response = await axiosInstance.get(`${ORDER_BASE}/customer/${customerId}${queryString}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Error fetching customer orders:`, error);
    throw error;
  }
};

export const getOrderById = async (id) => {
  try {
    const response = await axiosInstance.get(`${ORDER_BASE}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Error fetching order ${id}:`, error);
    throw error;
  }
};

export const updateOrder = async (id, updateData) => {
  try {
    const response = await axiosInstance.put(`${ORDER_BASE}/${id}`, updateData);
    return response.data;
  } catch (error) {
    console.error(`❌ Error updating order:`, error);
    throw error;
  }
};

export const updateOrderStatus = async (id, status) => {
  try {
    const response = await axiosInstance.patch(`${ORDER_BASE}/${id}/status`, { status });
    return response.data;
  } catch (error) {
    console.error(`❌ Error updating status:`, error);
    throw error;
  }
};

export const deleteOrder = async (id) => {
  try {
    const response = await axiosInstance.delete(`${ORDER_BASE}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Error deleting order:`, error);
    throw error;
  }
};

// ============================================
// 💰 PAYMENT ROUTES
// ============================================

export const addPaymentToOrder = async (orderId, paymentData) => {
  try {
    const response = await axiosInstance.post(`${ORDER_BASE}/${orderId}/payments`, paymentData);
    return response.data;
  } catch (error) {
    console.error(`❌ Error adding payment:`, error);
    throw error;
  }
};

export const getOrderPayments = async (orderId) => {
  try {
    const response = await axiosInstance.get(`${ORDER_BASE}/${orderId}/payments`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ============================================
// 🟢 ORDER DATES ROUTE (for calendar green dots)
// ============================================

export const getOrderDates = async (params = {}) => {
  try {
    const queryString = buildQueryString(params);
    const response = await axiosInstance.get(`${ORDER_BASE}/order-dates${queryString}`);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching order dates:", error);
    throw error;
  }
};

// ============================================
// 📅 DELIVERY DATES ROUTE (for calendar red dots - all customers)
// ============================================

export const getDeliveryDates = async (params = {}) => {
  try {
    const { month, year } = params;
    
    if (!month || !year) {
      console.error("❌ [API] Month and year are required for getDeliveryDates");
      throw new Error("Month and year are required");
    }
    
    console.log(`📅 [API] Fetching delivery dates for month: ${month}, year: ${year}`);
    
    const queryString = buildQueryString({ month, year });
    const response = await axiosInstance.get(`${ORDER_BASE}/delivery-dates${queryString}`);
    
    console.log("✅ [API] Delivery dates response:", response.data);
    return response.data; // Should return { success: true, allDates: [{ _id: "2026-03-05", count: 4 }] }
  } catch (error) {
    console.error("❌ [API] Error fetching delivery dates:", error);
    throw error;
  }
};

// ============================================
// 📤 EXPORT
// ============================================

const orderApi = {
  getOrderStats,
  getDashboardData,
  getRecentOrders,
  getFilteredOrders,
  getReadyToDeliveryOrders,
  createOrder,
  getAllOrders,
  getOrdersByCustomer,
  getOrderById,
  updateOrder,
  updateOrderStatus,
  deleteOrder,
  addPaymentToOrder,
  getOrderPayments,
  getOrderDates,      // 🟢 For green dots
  getDeliveryDates    // 🔴 NEW: For red dots (all customers)
};

export default orderApi;