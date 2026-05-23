// // frontend/src/features/orders/orderSlice.js
// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import * as orderApi from "./orderApi";

// // ============================================
// // 🔄 ASYNC THUNKS
// // ============================================

// // Get order stats
// export const fetchOrderStats = createAsyncThunk(
//   "orders/fetchStats",
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await orderApi.getOrderStats();
//       return response.stats;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch stats");
//     }
//   }
// );

// // Get dashboard data
// export const fetchDashboardData = createAsyncThunk(
//   "orders/fetchDashboard",
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await orderApi.getDashboardData();
//       return response.dashboard;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch dashboard");
//     }
//   }
// );

// // ✅ NEW: Get ready to delivery orders
// export const fetchReadyToDeliveryOrders = createAsyncThunk(
//   "orders/fetchReadyToDelivery",
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await orderApi.getReadyToDeliveryOrders();
//       return {
//         orders: response.orders || [],
//         count: response.count || 0
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch ready to delivery orders");
//     }
//   }
// );

// // Create new order
// export const createNewOrder = createAsyncThunk(
//   "orders/create",
//   async (orderData, { rejectWithValue }) => {
//     try {
//       const response = await orderApi.createOrder(orderData);
//       return response.order;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to create order");
//     }
//   }
// );

// // Get all orders
// export const fetchOrders = createAsyncThunk(
//   "orders/fetchAll",
//   async (params = {}, { rejectWithValue }) => {
//     try {
//       const response = await orderApi.getAllOrders(params);
//       return {
//         orders: response.orders,
//         pagination: response.pagination
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch orders");
//     }
//   }
// );

// // Get orders by customer ID
// export const fetchOrdersByCustomer = createAsyncThunk(
//   "orders/fetchByCustomer",
//   async (customerId, { rejectWithValue }) => {
//     try {
//       const response = await orderApi.getOrdersByCustomer(customerId);
//       return {
//         customerId,
//         orders: response.orders || []
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch customer orders");
//     }
//   }
// );

// // Get single order
// export const fetchOrderById = createAsyncThunk(
//   "orders/fetchById",
//   async (id, { rejectWithValue }) => {
//     try {
//       const response = await orderApi.getOrderById(id);
//       return {
//         order: response.order,
//         payments: response.payments,
//         works: response.works
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch order");
//     }
//   }
// );

// // Update order
// export const updateExistingOrder = createAsyncThunk(
//   "orders/update",
//   async ({ id, data }, { rejectWithValue }) => {
//     try {
//       const response = await orderApi.updateOrder(id, data);
//       return response.order;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to update order");
//     }
//   }
// );

// // Update order status
// export const updateOrderStatusThunk = createAsyncThunk(
//   "orders/updateStatus",
//   async ({ id, status }, { rejectWithValue }) => {
//     try {
//       const response = await orderApi.updateOrderStatus(id, status);
//       return response.order;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to update status");
//     }
//   }
// );

// // Delete order
// export const deleteExistingOrder = createAsyncThunk(
//   "orders/delete",
//   async (id, { rejectWithValue }) => {
//     try {
//       await orderApi.deleteOrder(id);
//       return id;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to delete order");
//     }
//   }
// );

// // Add payment to order
// export const addPayment = createAsyncThunk(
//   "orders/addPayment",
//   async ({ orderId, paymentData }, { rejectWithValue }) => {
//     try {
//       const response = await orderApi.addPaymentToOrder(orderId, paymentData);
//       return {
//         orderId,
//         payment: response.payment
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to add payment");
//     }
//   }
// );

// // Get order payments
// export const fetchOrderPayments = createAsyncThunk(
//   "orders/fetchPayments",
//   async (orderId, { rejectWithValue }) => {
//     try {
//       const response = await orderApi.getOrderPayments(orderId);
//       return {
//         orderId,
//         payments: response.payments
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch payments");
//     }
//   }
// );

// // ============================================
// // 📊 INITIAL STATE (UPDATED with readyToDelivery)
// // ============================================
// const initialState = {
//   orders: [],
//   currentOrder: null,
//   currentPayments: [],
//   currentWorks: [],
//   customerOrders: {}, // Store orders by customer ID
//   // ✅ NEW: Ready to delivery orders
//   readyToDelivery: {
//     orders: [],
//     count: 0,
//     loading: false
//   },
//   stats: {
//     today: 0,
//     thisWeek: 0,
//     thisMonth: 0,
//     total: 0,
//     statusBreakdown: [],
//     paymentBreakdown: []
//   },
//   dashboard: {
//     todayOrders: { count: 0, orders: [] },
//     pendingDeliveries: { count: 0, orders: [] },
//     // ✅ NEW: Ready for delivery in dashboard
//     readyForDelivery: { count: 0, orders: [] },
//     recentOrders: [],
//     todayCollection: 0
//   },
//   pagination: {
//     page: 1,
//     limit: 10,
//     total: 0,
//     pages: 1
//   },
//   loading: false,
//   error: null,
//   success: false
// };

// // ============================================
// // 🎯 ORDER SLICE
// // ============================================
// const orderSlice = createSlice({
//   name: "orders",
//   initialState,
//   reducers: {
//     clearOrderError: (state) => {
//       state.error = null;
//     },
//     clearCurrentOrder: (state) => {
//       state.currentOrder = null;
//       state.currentPayments = [];
//       state.currentWorks = [];
//     },
//     clearCustomerOrders: (state, action) => {
//       const { customerId } = action.payload;
//       if (customerId) {
//         delete state.customerOrders[customerId];
//       } else {
//         state.customerOrders = {};
//       }
//     },
//     // ✅ NEW: Clear ready to delivery orders
//     clearReadyToDelivery: (state) => {
//       state.readyToDelivery = {
//         orders: [],
//         count: 0,
//         loading: false
//       };
//     },
//     setPagination: (state, action) => {
//       state.pagination = { ...state.pagination, ...action.payload };
//     },
//     resetOrderState: () => initialState
//   },
//   extraReducers: (builder) => {
//     builder
//       // ===== FETCH STATS =====
//       .addCase(fetchOrderStats.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchOrderStats.fulfilled, (state, action) => {
//         state.loading = false;
//         state.stats = action.payload;
//       })
//       .addCase(fetchOrderStats.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== FETCH DASHBOARD =====
//       .addCase(fetchDashboardData.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchDashboardData.fulfilled, (state, action) => {
//         state.loading = false;
//         state.dashboard = action.payload;
//       })
//       .addCase(fetchDashboardData.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== FETCH READY TO DELIVERY ORDERS (NEW) =====
//       .addCase(fetchReadyToDeliveryOrders.pending, (state) => {
//         state.readyToDelivery.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchReadyToDeliveryOrders.fulfilled, (state, action) => {
//         state.readyToDelivery.loading = false;
//         state.readyToDelivery.orders = action.payload.orders;
//         state.readyToDelivery.count = action.payload.count;
//       })
//       .addCase(fetchReadyToDeliveryOrders.rejected, (state, action) => {
//         state.readyToDelivery.loading = false;
//         state.error = action.payload;
//       })

//       // ===== CREATE ORDER =====
//       .addCase(createNewOrder.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//         state.success = false;
//       })
//       .addCase(createNewOrder.fulfilled, (state, action) => {
//         state.loading = false;
//         state.orders.unshift(action.payload);
//         state.success = true;
        
//         // Add to customerOrders if customer exists
//         if (action.payload.customer) {
//           const customerId = action.payload.customer._id || action.payload.customer;
//           if (!state.customerOrders[customerId]) {
//             state.customerOrders[customerId] = [];
//           }
//           state.customerOrders[customerId].unshift(action.payload);
//         }

//         // ✅ If order is ready-to-delivery, add to readyToDelivery list
//         if (action.payload.status === 'ready-to-delivery') {
//           state.readyToDelivery.orders.unshift(action.payload);
//           state.readyToDelivery.count += 1;
//         }
//       })
//       .addCase(createNewOrder.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//         state.success = false;
//       })

//       // ===== FETCH ALL ORDERS =====
//       .addCase(fetchOrders.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchOrders.fulfilled, (state, action) => {
//         state.loading = false;
//         state.orders = action.payload.orders;
//         state.pagination = action.payload.pagination;
//       })
//       .addCase(fetchOrders.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== FETCH ORDERS BY CUSTOMER =====
//       .addCase(fetchOrdersByCustomer.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchOrdersByCustomer.fulfilled, (state, action) => {
//         state.loading = false;
//         const { customerId, orders } = action.payload;
//         state.customerOrders[customerId] = orders;
//       })
//       .addCase(fetchOrdersByCustomer.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== FETCH ORDER BY ID =====
//       .addCase(fetchOrderById.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchOrderById.fulfilled, (state, action) => {
//         state.loading = false;
//         state.currentOrder = action.payload.order;
//         state.currentPayments = action.payload.payments || [];
//         state.currentWorks = action.payload.works || [];
//       })
//       .addCase(fetchOrderById.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== UPDATE ORDER =====
//       .addCase(updateExistingOrder.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(updateExistingOrder.fulfilled, (state, action) => {
//         state.loading = false;
        
//         // Update in main orders array
//         const index = state.orders.findIndex(o => o._id === action.payload._id);
//         if (index !== -1) {
//           state.orders[index] = action.payload;
//         }
        
//         // Update in customerOrders if customer exists
//         if (action.payload.customer) {
//           const customerId = action.payload.customer._id || action.payload.customer;
//           if (state.customerOrders[customerId]) {
//             const custIndex = state.customerOrders[customerId].findIndex(o => o._id === action.payload._id);
//             if (custIndex !== -1) {
//               state.customerOrders[customerId][custIndex] = action.payload;
//             }
//           }
//         }
        
//         // ✅ Update in readyToDelivery list if needed
//         const readyIndex = state.readyToDelivery.orders.findIndex(o => o._id === action.payload._id);
//         if (action.payload.status === 'ready-to-delivery') {
//           if (readyIndex === -1) {
//             state.readyToDelivery.orders.unshift(action.payload);
//             state.readyToDelivery.count += 1;
//           } else {
//             state.readyToDelivery.orders[readyIndex] = action.payload;
//           }
//         } else if (readyIndex !== -1) {
//           // If status changed from ready-to-delivery to something else, remove from list
//           state.readyToDelivery.orders.splice(readyIndex, 1);
//           state.readyToDelivery.count -= 1;
//         }
        
//         // Update currentOrder if it's the same
//         if (state.currentOrder?._id === action.payload._id) {
//           state.currentOrder = action.payload;
//         }
//         state.success = true;
//       })
//       .addCase(updateExistingOrder.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== UPDATE ORDER STATUS =====
//       .addCase(updateOrderStatusThunk.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(updateOrderStatusThunk.fulfilled, (state, action) => {
//         state.loading = false;
        
//         // Update in main orders array
//         const index = state.orders.findIndex(o => o._id === action.payload._id);
//         if (index !== -1) {
//           state.orders[index] = action.payload;
//         }
        
//         // Update in customerOrders if customer exists
//         if (action.payload.customer) {
//           const customerId = action.payload.customer._id || action.payload.customer;
//           if (state.customerOrders[customerId]) {
//             const custIndex = state.customerOrders[customerId].findIndex(o => o._id === action.payload._id);
//             if (custIndex !== -1) {
//               state.customerOrders[customerId][custIndex] = action.payload;
//             }
//           }
//         }
        
//         // ✅ Update in readyToDelivery list based on status
//         const readyIndex = state.readyToDelivery.orders.findIndex(o => o._id === action.payload._id);
//         if (action.payload.status === 'ready-to-delivery') {
//           if (readyIndex === -1) {
//             state.readyToDelivery.orders.unshift(action.payload);
//             state.readyToDelivery.count += 1;
//           } else {
//             state.readyToDelivery.orders[readyIndex] = action.payload;
//           }
//         } else if (readyIndex !== -1) {
//           // If status changed from ready-to-delivery to something else
//           state.readyToDelivery.orders.splice(readyIndex, 1);
//           state.readyToDelivery.count -= 1;
//         }
        
//         // Update currentOrder if it's the same
//         if (state.currentOrder?._id === action.payload._id) {
//           state.currentOrder = action.payload;
//         }
//       })
//       .addCase(updateOrderStatusThunk.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== DELETE ORDER =====
//       .addCase(deleteExistingOrder.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(deleteExistingOrder.fulfilled, (state, action) => {
//         state.loading = false;
        
//         // Remove from main orders array
//         state.orders = state.orders.filter(o => o._id !== action.payload);
        
//         // Remove from all customerOrders entries
//         Object.keys(state.customerOrders).forEach(customerId => {
//           state.customerOrders[customerId] = state.customerOrders[customerId].filter(
//             o => o._id !== action.payload
//           );
//         });
        
//         // ✅ Remove from readyToDelivery list
//         const readyIndex = state.readyToDelivery.orders.findIndex(o => o._id === action.payload);
//         if (readyIndex !== -1) {
//           state.readyToDelivery.orders.splice(readyIndex, 1);
//           state.readyToDelivery.count -= 1;
//         }
        
//         // Clear currentOrder if it's the deleted one
//         if (state.currentOrder?._id === action.payload) {
//           state.currentOrder = null;
//           state.currentPayments = [];
//           state.currentWorks = [];
//         }
//         state.success = true;
//       })
//       .addCase(deleteExistingOrder.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== ADD PAYMENT =====
//       .addCase(addPayment.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(addPayment.fulfilled, (state, action) => {
//         state.loading = false;
//         // Will be refreshed by fetch
//         state.success = true;
//       })
//       .addCase(addPayment.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== FETCH ORDER PAYMENTS =====
//       .addCase(fetchOrderPayments.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchOrderPayments.fulfilled, (state, action) => {
//         state.loading = false;
//         if (state.currentOrder?._id === action.payload.orderId) {
//           state.currentPayments = action.payload.payments;
//         }
//       })
//       .addCase(fetchOrderPayments.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       });
//   }
// });

// // ============================================
// // 📤 EXPORT ACTIONS & REDUCER
// // ============================================
// export const { 
//   clearOrderError, 
//   clearCurrentOrder,
//   clearCustomerOrders,
//   clearReadyToDelivery, // ✅ NEW
//   setPagination, 
//   resetOrderState 
// } = orderSlice.actions;

// export default orderSlice.reducer;





// // frontend/src/features/orders/orderSlice.js - COMPLETE FIXED VERSION
// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import * as orderApi from "./orderApi";

// // ============================================
// // 🔄 ASYNC THUNKS
// // ============================================

// // Get order stats
// export const fetchOrderStats = createAsyncThunk(
//   "orders/fetchStats",
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await orderApi.getOrderStats();
//       return response.stats;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch stats");
//     }
//   }
// );

// // Get dashboard data
// export const fetchDashboardData = createAsyncThunk(
//   "orders/fetchDashboard",
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await orderApi.getDashboardData();
//       return response.dashboard;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch dashboard");
//     }
//   }
// );

// // ✅ FIX: Add fetchRecentOrders for dashboard
// export const fetchRecentOrders = createAsyncThunk(
//   "orders/fetchRecent",
//   async ({ limit = 10 } = {}, { rejectWithValue }) => {
//     try {
//       const response = await orderApi.getAllOrders({ limit, page: 1, sort: '-createdAt' });
//       return {
//         orders: response.orders || [],
//         pagination: response.pagination
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch recent orders");
//     }
//   }
// );

// // Get ready to delivery orders
// export const fetchReadyToDeliveryOrders = createAsyncThunk(
//   "orders/fetchReadyToDelivery",
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await orderApi.getReadyToDeliveryOrders();
//       return {
//         orders: response.orders || [],
//         count: response.count || 0
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch ready to delivery orders");
//     }
//   }
// );

// // Create new order
// export const createNewOrder = createAsyncThunk(
//   "orders/create",
//   async (orderData, { rejectWithValue }) => {
//     try {
//       const response = await orderApi.createOrder(orderData);
//       return response.order;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to create order");
//     }
//   }
// );

// // Get all orders
// export const fetchOrders = createAsyncThunk(
//   "orders/fetchAll",
//   async (params = {}, { rejectWithValue }) => {
//     try {
//       const response = await orderApi.getAllOrders(params);
//       return {
//         orders: response.orders,
//         pagination: response.pagination
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch orders");
//     }
//   }
// );

// // Get orders by customer ID
// export const fetchOrdersByCustomer = createAsyncThunk(
//   "orders/fetchByCustomer",
//   async (customerId, { rejectWithValue }) => {
//     try {
//       const response = await orderApi.getOrdersByCustomer(customerId);
//       return {
//         customerId,
//         orders: response.orders || []
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch customer orders");
//     }
//   }
// );

// // Get single order
// export const fetchOrderById = createAsyncThunk(
//   "orders/fetchById",
//   async (id, { rejectWithValue }) => {
//     try {
//       const response = await orderApi.getOrderById(id);
//       return {
//         order: response.order,
//         payments: response.payments,
//         works: response.works
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch order");
//     }
//   }
// );

// // Update order
// export const updateExistingOrder = createAsyncThunk(
//   "orders/update",
//   async ({ id, data }, { rejectWithValue }) => {
//     try {
//       const response = await orderApi.updateOrder(id, data);
//       return response.order;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to update order");
//     }
//   }
// );

// // Update order status
// export const updateOrderStatusThunk = createAsyncThunk(
//   "orders/updateStatus",
//   async ({ id, status }, { rejectWithValue }) => {
//     try {
//       const response = await orderApi.updateOrderStatus(id, status);
//       return response.order;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to update status");
//     }
//   }
// );

// // Delete order
// export const deleteExistingOrder = createAsyncThunk(
//   "orders/delete",
//   async (id, { rejectWithValue }) => {
//     try {
//       await orderApi.deleteOrder(id);
//       return id;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to delete order");
//     }
//   }
// );

// // Add payment to order
// export const addPayment = createAsyncThunk(
//   "orders/addPayment",
//   async ({ orderId, paymentData }, { rejectWithValue }) => {
//     try {
//       const response = await orderApi.addPaymentToOrder(orderId, paymentData);
//       return {
//         orderId,
//         payment: response.payment
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to add payment");
//     }
//   }
// );

// // Get order payments
// export const fetchOrderPayments = createAsyncThunk(
//   "orders/fetchPayments",
//   async (orderId, { rejectWithValue }) => {
//     try {
//       const response = await orderApi.getOrderPayments(orderId);
//       return {
//         orderId,
//         payments: response.payments
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch payments");
//     }
//   }
// );

// // ============================================
// // 📊 INITIAL STATE (UPDATED with recentOrders)
// // ============================================
// const initialState = {
//   orders: [],
//   recentOrders: [], // ✅ ADDED for dashboard
//   currentOrder: null,
//   currentPayments: [],
//   currentWorks: [],
//   customerOrders: {}, // Store orders by customer ID
//   // Ready to delivery orders
//   readyToDelivery: {
//     orders: [],
//     count: 0,
//     loading: false
//   },
//   stats: {
//     today: 0,
//     thisWeek: 0,
//     thisMonth: 0,
//     total: 0,
//     statusBreakdown: [],
//     paymentBreakdown: []
//   },
//   dashboard: {
//     todayOrders: { count: 0, orders: [] },
//     pendingDeliveries: { count: 0, orders: [] },
//     readyForDelivery: { count: 0, orders: [] },
//     recentOrders: [],
//     todayCollection: 0
//   },
//   pagination: {
//     page: 1,
//     limit: 10,
//     total: 0,
//     pages: 1
//   },
//   loading: false,
//   error: null,
//   success: false
// };

// // ============================================
// // 🎯 ORDER SLICE
// // ============================================
// const orderSlice = createSlice({
//   name: "orders",
//   initialState,
//   reducers: {
//     clearOrderError: (state) => {
//       state.error = null;
//     },
//     clearCurrentOrder: (state) => {
//       state.currentOrder = null;
//       state.currentPayments = [];
//       state.currentWorks = [];
//     },
//     clearCustomerOrders: (state, action) => {
//       const { customerId } = action.payload;
//       if (customerId) {
//         delete state.customerOrders[customerId];
//       } else {
//         state.customerOrders = {};
//       }
//     },
//     clearReadyToDelivery: (state) => {
//       state.readyToDelivery = {
//         orders: [],
//         count: 0,
//         loading: false
//       };
//     },
//     setPagination: (state, action) => {
//       state.pagination = { ...state.pagination, ...action.payload };
//     },
//     resetOrderState: () => initialState
//   },
//   extraReducers: (builder) => {
//     builder
//       // ===== FETCH STATS =====
//       .addCase(fetchOrderStats.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchOrderStats.fulfilled, (state, action) => {
//         state.loading = false;
//         state.stats = action.payload;
//       })
//       .addCase(fetchOrderStats.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== FETCH DASHBOARD =====
//       .addCase(fetchDashboardData.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchDashboardData.fulfilled, (state, action) => {
//         state.loading = false;
//         state.dashboard = action.payload;
//       })
//       .addCase(fetchDashboardData.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== FETCH RECENT ORDERS (NEW) =====
//       .addCase(fetchRecentOrders.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchRecentOrders.fulfilled, (state, action) => {
//         state.loading = false;
//         state.recentOrders = action.payload.orders;
//       })
//       .addCase(fetchRecentOrders.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== FETCH READY TO DELIVERY ORDERS =====
//       .addCase(fetchReadyToDeliveryOrders.pending, (state) => {
//         state.readyToDelivery.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchReadyToDeliveryOrders.fulfilled, (state, action) => {
//         state.readyToDelivery.loading = false;
//         state.readyToDelivery.orders = action.payload.orders;
//         state.readyToDelivery.count = action.payload.count;
//       })
//       .addCase(fetchReadyToDeliveryOrders.rejected, (state, action) => {
//         state.readyToDelivery.loading = false;
//         state.error = action.payload;
//       })

//       // ===== CREATE ORDER =====
//       .addCase(createNewOrder.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//         state.success = false;
//       })
//       .addCase(createNewOrder.fulfilled, (state, action) => {
//         state.loading = false;
//         state.orders.unshift(action.payload);
//         state.recentOrders.unshift(action.payload); // ✅ Add to recent orders
//         state.success = true;
        
//         // Add to customerOrders if customer exists
//         if (action.payload.customer) {
//           const customerId = action.payload.customer._id || action.payload.customer;
//           if (!state.customerOrders[customerId]) {
//             state.customerOrders[customerId] = [];
//           }
//           state.customerOrders[customerId].unshift(action.payload);
//         }

//         // If order is ready-to-delivery, add to readyToDelivery list
//         if (action.payload.status === 'ready-to-delivery') {
//           state.readyToDelivery.orders.unshift(action.payload);
//           state.readyToDelivery.count += 1;
//         }
//       })
//       .addCase(createNewOrder.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//         state.success = false;
//       })

//       // ===== FETCH ALL ORDERS =====
//       .addCase(fetchOrders.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchOrders.fulfilled, (state, action) => {
//         state.loading = false;
//         state.orders = action.payload.orders;
//         state.pagination = action.payload.pagination;
//       })
//       .addCase(fetchOrders.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== FETCH ORDERS BY CUSTOMER =====
//       .addCase(fetchOrdersByCustomer.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchOrdersByCustomer.fulfilled, (state, action) => {
//         state.loading = false;
//         const { customerId, orders } = action.payload;
//         state.customerOrders[customerId] = orders;
//       })
//       .addCase(fetchOrdersByCustomer.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== FETCH ORDER BY ID =====
//       .addCase(fetchOrderById.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchOrderById.fulfilled, (state, action) => {
//         state.loading = false;
//         state.currentOrder = action.payload.order;
//         state.currentPayments = action.payload.payments || [];
//         state.currentWorks = action.payload.works || [];
//       })
//       .addCase(fetchOrderById.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== UPDATE ORDER =====
//       .addCase(updateExistingOrder.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(updateExistingOrder.fulfilled, (state, action) => {
//         state.loading = false;
        
//         // Update in main orders array
//         const index = state.orders.findIndex(o => o._id === action.payload._id);
//         if (index !== -1) {
//           state.orders[index] = action.payload;
//         }
        
//         // Update in recent orders
//         const recentIndex = state.recentOrders.findIndex(o => o._id === action.payload._id);
//         if (recentIndex !== -1) {
//           state.recentOrders[recentIndex] = action.payload;
//         }
        
//         // Update in customerOrders if customer exists
//         if (action.payload.customer) {
//           const customerId = action.payload.customer._id || action.payload.customer;
//           if (state.customerOrders[customerId]) {
//             const custIndex = state.customerOrders[customerId].findIndex(o => o._id === action.payload._id);
//             if (custIndex !== -1) {
//               state.customerOrders[customerId][custIndex] = action.payload;
//             }
//           }
//         }
        
//         // Update in readyToDelivery list if needed
//         const readyIndex = state.readyToDelivery.orders.findIndex(o => o._id === action.payload._id);
//         if (action.payload.status === 'ready-to-delivery') {
//           if (readyIndex === -1) {
//             state.readyToDelivery.orders.unshift(action.payload);
//             state.readyToDelivery.count += 1;
//           } else {
//             state.readyToDelivery.orders[readyIndex] = action.payload;
//           }
//         } else if (readyIndex !== -1) {
//           // If status changed from ready-to-delivery to something else, remove from list
//           state.readyToDelivery.orders.splice(readyIndex, 1);
//           state.readyToDelivery.count -= 1;
//         }
        
//         // Update currentOrder if it's the same
//         if (state.currentOrder?._id === action.payload._id) {
//           state.currentOrder = action.payload;
//         }
//         state.success = true;
//       })
//       .addCase(updateExistingOrder.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== UPDATE ORDER STATUS =====
//       .addCase(updateOrderStatusThunk.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(updateOrderStatusThunk.fulfilled, (state, action) => {
//         state.loading = false;
        
//         // Update in main orders array
//         const index = state.orders.findIndex(o => o._id === action.payload._id);
//         if (index !== -1) {
//           state.orders[index] = action.payload;
//         }
        
//         // Update in recent orders
//         const recentIndex = state.recentOrders.findIndex(o => o._id === action.payload._id);
//         if (recentIndex !== -1) {
//           state.recentOrders[recentIndex] = action.payload;
//         }
        
//         // Update in customerOrders if customer exists
//         if (action.payload.customer) {
//           const customerId = action.payload.customer._id || action.payload.customer;
//           if (state.customerOrders[customerId]) {
//             const custIndex = state.customerOrders[customerId].findIndex(o => o._id === action.payload._id);
//             if (custIndex !== -1) {
//               state.customerOrders[customerId][custIndex] = action.payload;
//             }
//           }
//         }
        
//         // Update in readyToDelivery list based on status
//         const readyIndex = state.readyToDelivery.orders.findIndex(o => o._id === action.payload._id);
//         if (action.payload.status === 'ready-to-delivery') {
//           if (readyIndex === -1) {
//             state.readyToDelivery.orders.unshift(action.payload);
//             state.readyToDelivery.count += 1;
//           } else {
//             state.readyToDelivery.orders[readyIndex] = action.payload;
//           }
//         } else if (readyIndex !== -1) {
//           // If status changed from ready-to-delivery to something else
//           state.readyToDelivery.orders.splice(readyIndex, 1);
//           state.readyToDelivery.count -= 1;
//         }
        
//         // Update currentOrder if it's the same
//         if (state.currentOrder?._id === action.payload._id) {
//           state.currentOrder = action.payload;
//         }
//       })
//       .addCase(updateOrderStatusThunk.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== DELETE ORDER =====
//       .addCase(deleteExistingOrder.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(deleteExistingOrder.fulfilled, (state, action) => {
//         state.loading = false;
        
//         // Remove from main orders array
//         state.orders = state.orders.filter(o => o._id !== action.payload);
        
//         // Remove from recent orders
//         state.recentOrders = state.recentOrders.filter(o => o._id !== action.payload);
        
//         // Remove from all customerOrders entries
//         Object.keys(state.customerOrders).forEach(customerId => {
//           state.customerOrders[customerId] = state.customerOrders[customerId].filter(
//             o => o._id !== action.payload
//           );
//         });
        
//         // Remove from readyToDelivery list
//         const readyIndex = state.readyToDelivery.orders.findIndex(o => o._id === action.payload);
//         if (readyIndex !== -1) {
//           state.readyToDelivery.orders.splice(readyIndex, 1);
//           state.readyToDelivery.count -= 1;
//         }
        
//         // Clear currentOrder if it's the deleted one
//         if (state.currentOrder?._id === action.payload) {
//           state.currentOrder = null;
//           state.currentPayments = [];
//           state.currentWorks = [];
//         }
//         state.success = true;
//       })
//       .addCase(deleteExistingOrder.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== ADD PAYMENT =====
//       .addCase(addPayment.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(addPayment.fulfilled, (state, action) => {
//         state.loading = false;
//         // Will be refreshed by fetch
//         state.success = true;
//       })
//       .addCase(addPayment.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== FETCH ORDER PAYMENTS =====
//       .addCase(fetchOrderPayments.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchOrderPayments.fulfilled, (state, action) => {
//         state.loading = false;
//         if (state.currentOrder?._id === action.payload.orderId) {
//           state.currentPayments = action.payload.payments;
//         }
//       })
//       .addCase(fetchOrderPayments.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       });
//   }
// });

// // ============================================
// // 📤 EXPORT ACTIONS & REDUCER
// // ============================================
// export const { 
//   clearOrderError, 
//   clearCurrentOrder,
//   clearCustomerOrders,
//   clearReadyToDelivery,
//   setPagination, 
//   resetOrderState 
// } = orderSlice.actions;

// export default orderSlice.reducer;












// // frontend/src/features/orders/orderSlice.js - COMPLETE FIXED VERSION
// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import * as orderApi from "./orderApi";

// // ============================================
// // 🔄 ASYNC THUNKS
// // ============================================

// // Get order stats - WITH DATE FILTER SUPPORT ✅
// export const fetchOrderStats = createAsyncThunk(
//   "orders/fetchStats",
//   async (params = {}, { rejectWithValue }) => {
//     try {
//       // params can be { period: 'month' } or { startDate, endDate }
//       const response = await orderApi.getOrderStats(params);
//       return response.stats;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch stats");
//     }
//   }
// );

// // Get dashboard data
// export const fetchDashboardData = createAsyncThunk(
//   "orders/fetchDashboard",
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await orderApi.getDashboardData();
//       return response.dashboard;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch dashboard");
//     }
//   }
// );

// // ✅ FIXED: fetchRecentOrders with date filter support
// export const fetchRecentOrders = createAsyncThunk(
//   "orders/fetchRecent",
//   async (params = {}, { rejectWithValue }) => {
//     try {
//       // params can include: { limit, startDate, endDate, period }
//       const { limit = 10, startDate, endDate, period } = params;
      
//       console.log('📋 Fetching recent orders with:', { limit, startDate, endDate, period });
      
//       const response = await orderApi.getRecentOrders({ 
//         limit, 
//         startDate, 
//         endDate, 
//         period 
//       });
      
//       return {
//         orders: response.orders || [],
//         count: response.count || response.orders?.length || 0,
//         filter: response.filter || params
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch recent orders");
//     }
//   }
// );

// // Get ready to delivery orders
// export const fetchReadyToDeliveryOrders = createAsyncThunk(
//   "orders/fetchReadyToDelivery",
//   async (params = {}, { rejectWithValue }) => {
//     try {
//       const response = await orderApi.getReadyToDeliveryOrders(params);
//       return {
//         orders: response.orders || [],
//         count: response.count || 0
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch ready to delivery orders");
//     }
//   }
// );

// // Create new order
// export const createNewOrder = createAsyncThunk(
//   "orders/create",
//   async (orderData, { rejectWithValue }) => {
//     try {
//       const response = await orderApi.createOrder(orderData);
//       return response.order;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to create order");
//     }
//   }
// );

// // Get all orders - WITH FILTER SUPPORT ✅
// export const fetchOrders = createAsyncThunk(
//   "orders/fetchAll",
//   async (params = {}, { rejectWithValue }) => {
//     try {
//       // params can include: { page, limit, status, startDate, endDate, period }
//       const response = await orderApi.getAllOrders(params);
//       return {
//         orders: response.orders || [],
//         pagination: response.pagination || {
//           page: params.page || 1,
//           limit: params.limit || 10,
//           total: response.total || 0,
//           pages: Math.ceil((response.total || 0) / (params.limit || 10))
//         }
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch orders");
//     }
//   }
// );

// // Get orders by customer ID
// export const fetchOrdersByCustomer = createAsyncThunk(
//   "orders/fetchByCustomer",
//   async (customerId, { rejectWithValue }) => {
//     try {
//       const response = await orderApi.getOrdersByCustomer(customerId);
//       return {
//         customerId,
//         orders: response.orders || []
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch customer orders");
//     }
//   }
// );

// // Get single order
// export const fetchOrderById = createAsyncThunk(
//   "orders/fetchById",
//   async (id, { rejectWithValue }) => {
//     try {
//       const response = await orderApi.getOrderById(id);
//       return {
//         order: response.order,
//         payments: response.payments || [],
//         works: response.works || []
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch order");
//     }
//   }
// );

// // Update order
// export const updateExistingOrder = createAsyncThunk(
//   "orders/update",
//   async ({ id, data }, { rejectWithValue }) => {
//     try {
//       const response = await orderApi.updateOrder(id, data);
//       return response.order;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to update order");
//     }
//   }
// );

// // Update order status
// export const updateOrderStatusThunk = createAsyncThunk(
//   "orders/updateStatus",
//   async ({ id, status }, { rejectWithValue }) => {
//     try {
//       const response = await orderApi.updateOrderStatus(id, status);
//       return response.order;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to update status");
//     }
//   }
// );

// // Delete order
// export const deleteExistingOrder = createAsyncThunk(
//   "orders/delete",
//   async (id, { rejectWithValue }) => {
//     try {
//       await orderApi.deleteOrder(id);
//       return id;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to delete order");
//     }
//   }
// );

// // Add payment to order
// export const addPayment = createAsyncThunk(
//   "orders/addPayment",
//   async ({ orderId, paymentData }, { rejectWithValue }) => {
//     try {
//       const response = await orderApi.addPaymentToOrder(orderId, paymentData);
//       return {
//         orderId,
//         payment: response.payment,
//         updatedOrder: response.order
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to add payment");
//     }
//   }
// );

// // Get order payments
// export const fetchOrderPayments = createAsyncThunk(
//   "orders/fetchPayments",
//   async (orderId, { rejectWithValue }) => {
//     try {
//       const response = await orderApi.getOrderPayments(orderId);
//       return {
//         orderId,
//         payments: response.payments || []
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch payments");
//     }
//   }
// );

// // ============================================
// // 📊 INITIAL STATE (UPDATED with recentOrders)
// // ============================================
// const initialState = {
//   // Main orders list
//   orders: [],
//   recentOrders: [], // ✅ For dashboard
//   currentOrder: null,
//   currentPayments: [],
//   currentWorks: [],
  
//   // Customer-specific orders
//   customerOrders: {}, // Store orders by customer ID
  
//   // Ready to delivery orders
//   readyToDelivery: {
//     orders: [],
//     count: 0,
//     loading: false
//   },
  
//   // Statistics
//   stats: {
//     today: 0,
//     pending: 0,
//     cutting: 0,
//     stitching: 0,
//     ready: 0,
//     delivered: 0,
//     cancelled: 0,
//     total: 0,
//     inProgress: 0,
//     deliveries: {
//       today: 0,
//       tomorrow: 0,
//       late: 0,
//       total: 0
//     },
//     filterPeriod: 'month',
//     startDate: null,
//     endDate: null
//   },
  
//   // Dashboard data
//   dashboard: {
//     todayOrders: { count: 0, orders: [] },
//     pendingDeliveries: { count: 0, orders: [] },
//     readyForDelivery: { count: 0, orders: [] },
//     recentOrders: [],
//     todayCollection: 0
//   },
  
//   // Pagination
//   pagination: {
//     page: 1,
//     limit: 10,
//     total: 0,
//     pages: 1
//   },
  
//   // UI states
//   loading: false,
//   error: null,
//   success: false,
  
//   // Filter info (for debugging)
//   currentFilter: null
// };

// // ============================================
// // 🎯 ORDER SLICE
// // ============================================
// const orderSlice = createSlice({
//   name: "orders",
//   initialState,
//   reducers: {
//     clearOrderError: (state) => {
//       state.error = null;
//     },
//     clearCurrentOrder: (state) => {
//       state.currentOrder = null;
//       state.currentPayments = [];
//       state.currentWorks = [];
//     },
//     clearCustomerOrders: (state, action) => {
//       const { customerId } = action.payload || {};
//       if (customerId) {
//         delete state.customerOrders[customerId];
//       } else {
//         state.customerOrders = {};
//       }
//     },
//     clearReadyToDelivery: (state) => {
//       state.readyToDelivery = {
//         orders: [],
//         count: 0,
//         loading: false
//       };
//     },
//     setPagination: (state, action) => {
//       state.pagination = { ...state.pagination, ...action.payload };
//     },
//     resetOrderState: () => initialState,
    
//     // ✅ NEW: Clear recent orders (useful when changing filters)
//     clearRecentOrders: (state) => {
//       state.recentOrders = [];
//     },
    
//     // ✅ NEW: Set current filter (for debugging)
//     setCurrentFilter: (state, action) => {
//       state.currentFilter = action.payload;
//     }
//   },
//   extraReducers: (builder) => {
//     builder
//       // ===== FETCH STATS =====
//       .addCase(fetchOrderStats.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchOrderStats.fulfilled, (state, action) => {
//         state.loading = false;
//         state.stats = {
//           ...state.stats,
//           ...action.payload,
//           // Ensure all fields exist
//           today: action.payload.today || 0,
//           pending: action.payload.pending || 0,
//           cutting: action.payload.cutting || 0,
//           stitching: action.payload.stitching || 0,
//           ready: action.payload.ready || 0,
//           delivered: action.payload.delivered || 0,
//           total: action.payload.total || 0
//         };
//       })
//       .addCase(fetchOrderStats.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== FETCH DASHBOARD =====
//       .addCase(fetchDashboardData.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchDashboardData.fulfilled, (state, action) => {
//         state.loading = false;
//         state.dashboard = {
//           ...state.dashboard,
//           ...action.payload
//         };
//       })
//       .addCase(fetchDashboardData.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== FETCH RECENT ORDERS (FIXED) =====
//       .addCase(fetchRecentOrders.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchRecentOrders.fulfilled, (state, action) => {
//         state.loading = false;
//         state.recentOrders = action.payload.orders || [];
//         state.currentFilter = action.payload.filter || null;
        
//         // Also update dashboard.recentOrders for backward compatibility
//         state.dashboard.recentOrders = action.payload.orders || [];
//       })
//       .addCase(fetchRecentOrders.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//         state.recentOrders = []; // Clear on error
//       })

//       // ===== FETCH READY TO DELIVERY ORDERS =====
//       .addCase(fetchReadyToDeliveryOrders.pending, (state) => {
//         state.readyToDelivery.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchReadyToDeliveryOrders.fulfilled, (state, action) => {
//         state.readyToDelivery.loading = false;
//         state.readyToDelivery.orders = action.payload.orders || [];
//         state.readyToDelivery.count = action.payload.count || 0;
//       })
//       .addCase(fetchReadyToDeliveryOrders.rejected, (state, action) => {
//         state.readyToDelivery.loading = false;
//         state.error = action.payload;
//       })

//       // ===== CREATE ORDER =====
//       .addCase(createNewOrder.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//         state.success = false;
//       })
//       .addCase(createNewOrder.fulfilled, (state, action) => {
//         state.loading = false;
//         state.orders.unshift(action.payload);
//         state.recentOrders.unshift(action.payload); // ✅ Add to recent orders
//         state.success = true;
        
//         // Update stats (increment counts)
//         if (action.payload.status) {
//           const status = action.payload.status;
//           if (status === 'confirmed') state.stats.pending += 1;
//           else if (status === 'in-progress') state.stats.inProgress += 1;
//           else if (status === 'ready-to-delivery') state.stats.ready += 1;
//           else if (status === 'delivered') state.stats.delivered += 1;
//         }
//         state.stats.total += 1;
        
//         // Add to customerOrders if customer exists
//         if (action.payload.customer) {
//           const customerId = action.payload.customer._id || action.payload.customer;
//           if (!state.customerOrders[customerId]) {
//             state.customerOrders[customerId] = [];
//           }
//           state.customerOrders[customerId].unshift(action.payload);
//         }

//         // If order is ready-to-delivery, add to readyToDelivery list
//         if (action.payload.status === 'ready-to-delivery') {
//           state.readyToDelivery.orders.unshift(action.payload);
//           state.readyToDelivery.count += 1;
//         }
//       })
//       .addCase(createNewOrder.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//         state.success = false;
//       })

//       // ===== FETCH ALL ORDERS =====
//       .addCase(fetchOrders.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchOrders.fulfilled, (state, action) => {
//         state.loading = false;
//         state.orders = action.payload.orders || [];
//         state.pagination = action.payload.pagination || state.pagination;
//       })
//       .addCase(fetchOrders.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== FETCH ORDERS BY CUSTOMER =====
//       .addCase(fetchOrdersByCustomer.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchOrdersByCustomer.fulfilled, (state, action) => {
//         state.loading = false;
//         const { customerId, orders } = action.payload;
//         state.customerOrders[customerId] = orders || [];
//       })
//       .addCase(fetchOrdersByCustomer.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== FETCH ORDER BY ID =====
//       .addCase(fetchOrderById.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchOrderById.fulfilled, (state, action) => {
//         state.loading = false;
//         state.currentOrder = action.payload.order;
//         state.currentPayments = action.payload.payments || [];
//         state.currentWorks = action.payload.works || [];
//       })
//       .addCase(fetchOrderById.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== UPDATE ORDER =====
//       .addCase(updateExistingOrder.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(updateExistingOrder.fulfilled, (state, action) => {
//         state.loading = false;
//         const updatedOrder = action.payload;
        
//         // Update in main orders array
//         const index = state.orders.findIndex(o => o?._id === updatedOrder?._id);
//         if (index !== -1) {
//           state.orders[index] = updatedOrder;
//         }
        
//         // Update in recent orders
//         const recentIndex = state.recentOrders.findIndex(o => o?._id === updatedOrder?._id);
//         if (recentIndex !== -1) {
//           state.recentOrders[recentIndex] = updatedOrder;
//         }
        
//         // Update in customerOrders if customer exists
//         if (updatedOrder?.customer) {
//           const customerId = updatedOrder.customer._id || updatedOrder.customer;
//           if (state.customerOrders[customerId]) {
//             const custIndex = state.customerOrders[customerId].findIndex(o => o?._id === updatedOrder?._id);
//             if (custIndex !== -1) {
//               state.customerOrders[customerId][custIndex] = updatedOrder;
//             }
//           }
//         }
        
//         // Update in readyToDelivery list if needed
//         const readyIndex = state.readyToDelivery.orders.findIndex(o => o?._id === updatedOrder?._id);
//         if (updatedOrder?.status === 'ready-to-delivery') {
//           if (readyIndex === -1) {
//             state.readyToDelivery.orders.unshift(updatedOrder);
//             state.readyToDelivery.count += 1;
//           } else {
//             state.readyToDelivery.orders[readyIndex] = updatedOrder;
//           }
//         } else if (readyIndex !== -1) {
//           // If status changed from ready-to-delivery to something else, remove from list
//           state.readyToDelivery.orders.splice(readyIndex, 1);
//           state.readyToDelivery.count -= 1;
//         }
        
//         // Update currentOrder if it's the same
//         if (state.currentOrder?._id === updatedOrder?._id) {
//           state.currentOrder = updatedOrder;
//         }
//         state.success = true;
//       })
//       .addCase(updateExistingOrder.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== UPDATE ORDER STATUS =====
//       .addCase(updateOrderStatusThunk.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(updateOrderStatusThunk.fulfilled, (state, action) => {
//         state.loading = false;
//         const updatedOrder = action.payload;
        
//         // Update in main orders array
//         const index = state.orders.findIndex(o => o?._id === updatedOrder?._id);
//         if (index !== -1) {
//           state.orders[index] = updatedOrder;
//         }
        
//         // Update in recent orders
//         const recentIndex = state.recentOrders.findIndex(o => o?._id === updatedOrder?._id);
//         if (recentIndex !== -1) {
//           state.recentOrders[recentIndex] = updatedOrder;
//         }
        
//         // Update in customerOrders if customer exists
//         if (updatedOrder?.customer) {
//           const customerId = updatedOrder.customer._id || updatedOrder.customer;
//           if (state.customerOrders[customerId]) {
//             const custIndex = state.customerOrders[customerId].findIndex(o => o?._id === updatedOrder?._id);
//             if (custIndex !== -1) {
//               state.customerOrders[customerId][custIndex] = updatedOrder;
//             }
//           }
//         }
        
//         // Update in readyToDelivery list based on status
//         const readyIndex = state.readyToDelivery.orders.findIndex(o => o?._id === updatedOrder?._id);
//         if (updatedOrder?.status === 'ready-to-delivery') {
//           if (readyIndex === -1) {
//             state.readyToDelivery.orders.unshift(updatedOrder);
//             state.readyToDelivery.count += 1;
//           } else {
//             state.readyToDelivery.orders[readyIndex] = updatedOrder;
//           }
//         } else if (readyIndex !== -1) {
//           // If status changed from ready-to-delivery to something else
//           state.readyToDelivery.orders.splice(readyIndex, 1);
//           state.readyToDelivery.count -= 1;
//         }
        
//         // Update currentOrder if it's the same
//         if (state.currentOrder?._id === updatedOrder?._id) {
//           state.currentOrder = updatedOrder;
//         }
//       })
//       .addCase(updateOrderStatusThunk.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== DELETE ORDER =====
//       .addCase(deleteExistingOrder.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(deleteExistingOrder.fulfilled, (state, action) => {
//         state.loading = false;
//         const deletedId = action.payload;
        
//         // Remove from main orders array
//         state.orders = state.orders.filter(o => o?._id !== deletedId);
        
//         // Remove from recent orders
//         state.recentOrders = state.recentOrders.filter(o => o?._id !== deletedId);
        
//         // Remove from all customerOrders entries
//         Object.keys(state.customerOrders).forEach(customerId => {
//           state.customerOrders[customerId] = state.customerOrders[customerId].filter(
//             o => o?._id !== deletedId
//           );
//         });
        
//         // Remove from readyToDelivery list
//         const readyIndex = state.readyToDelivery.orders.findIndex(o => o?._id === deletedId);
//         if (readyIndex !== -1) {
//           state.readyToDelivery.orders.splice(readyIndex, 1);
//           state.readyToDelivery.count -= 1;
//         }
        
//         // Clear currentOrder if it's the deleted one
//         if (state.currentOrder?._id === deletedId) {
//           state.currentOrder = null;
//           state.currentPayments = [];
//           state.currentWorks = [];
//         }
        
//         // Update stats
//         state.stats.total = Math.max(0, state.stats.total - 1);
//         state.success = true;
//       })
//       .addCase(deleteExistingOrder.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== ADD PAYMENT =====
//       .addCase(addPayment.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(addPayment.fulfilled, (state, action) => {
//         state.loading = false;
//         const { orderId, payment, updatedOrder } = action.payload;
        
//         // Update currentOrder if it matches
//         if (state.currentOrder?._id === orderId) {
//           state.currentOrder = updatedOrder || state.currentOrder;
//           state.currentPayments.push(payment);
//         }
        
//         // Update in orders list
//         const orderIndex = state.orders.findIndex(o => o?._id === orderId);
//         if (orderIndex !== -1 && updatedOrder) {
//           state.orders[orderIndex] = updatedOrder;
//         }
        
//         // Update in recent orders
//         const recentIndex = state.recentOrders.findIndex(o => o?._id === orderId);
//         if (recentIndex !== -1 && updatedOrder) {
//           state.recentOrders[recentIndex] = updatedOrder;
//         }
        
//         state.success = true;
//       })
//       .addCase(addPayment.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== FETCH ORDER PAYMENTS =====
//       .addCase(fetchOrderPayments.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchOrderPayments.fulfilled, (state, action) => {
//         state.loading = false;
//         if (state.currentOrder?._id === action.payload.orderId) {
//           state.currentPayments = action.payload.payments || [];
//         }
//       })
//       .addCase(fetchOrderPayments.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       });
//   }
// });

// // ============================================
// // 📤 EXPORT ACTIONS & REDUCER
// // ============================================
// export const { 
//   clearOrderError, 
//   clearCurrentOrder,
//   clearCustomerOrders,
//   clearReadyToDelivery,
//   clearRecentOrders,
//   setCurrentFilter,
//   setPagination, 
//   resetOrderState 
// } = orderSlice.actions;

// // ============================================
// // ✅ SELECTORS
// // ============================================
// export const selectAllOrders = (state) => state.orders.orders;
// export const selectRecentOrders = (state) => state.orders.recentOrders;
// export const selectOrderStats = (state) => state.orders.stats;
// export const selectCurrentOrder = (state) => state.orders.currentOrder;
// export const selectOrderLoading = (state) => state.orders.loading;
// export const selectOrderError = (state) => state.orders.error;
// export const selectReadyToDelivery = (state) => state.orders.readyToDelivery;
// export const selectOrdersByCustomer = (customerId) => (state) => 
//   state.orders.customerOrders[customerId] || [];

// export default orderSlice.reducer;




// /// frontend/src/features/orders/orderSlice.js - COMPLETE FIXED VERSION
// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import * as orderApi from "./orderApi";

// // ============================================
// // 🔄 ASYNC THUNKS
// // ============================================

// // Get order stats - WITH DATE FILTER SUPPORT ✅
// export const fetchOrderStats = createAsyncThunk(
//   "orders/fetchStats",
//   async (params = {}, { rejectWithValue }) => {
//     try {
//       // params can be { period: 'month' } or { startDate, endDate }
//       console.log('📊 Fetching order stats with params:', params);
//       const response = await orderApi.getOrderStats(params);
//       return response.stats;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch stats");
//     }
//   }
// );

// // Get dashboard data
// export const fetchDashboardData = createAsyncThunk(
//   "orders/fetchDashboard",
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await orderApi.getDashboardData();
//       return response.dashboard;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch dashboard");
//     }
//   }
// );

// // ✅ FIXED: fetchRecentOrders with date filter support
// export const fetchRecentOrders = createAsyncThunk(
//   "orders/fetchRecent",
//   async (params = {}, { rejectWithValue }) => {
//     try {
//       // params can include: { limit, startDate, endDate, period }
//       const { limit = 10, startDate, endDate, period } = params;
      
//       console.log('📋 Fetching recent orders with:', { limit, startDate, endDate, period });
      
//       const response = await orderApi.getRecentOrders({ 
//         limit, 
//         startDate, 
//         endDate, 
//         period 
//       });
      
//       return {
//         orders: response.orders || [],
//         count: response.count || response.orders?.length || 0,
//         filter: response.filter || params
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch recent orders");
//     }
//   }
// );

// // Get ready to delivery orders
// export const fetchReadyToDeliveryOrders = createAsyncThunk(
//   "orders/fetchReadyToDelivery",
//   async (params = {}, { rejectWithValue }) => {
//     try {
//       const response = await orderApi.getReadyToDeliveryOrders(params);
//       return {
//         orders: response.orders || [],
//         count: response.count || 0
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch ready to delivery orders");
//     }
//   }
// );

// // Create new order
// export const createNewOrder = createAsyncThunk(
//   "orders/create",
//   async (orderData, { rejectWithValue }) => {
//     try {
//       const response = await orderApi.createOrder(orderData);
//       return response.order;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to create order");
//     }
//   }
// );

// // Get all orders - WITH FILTER SUPPORT ✅
// export const fetchOrders = createAsyncThunk(
//   "orders/fetchAll",
//   async (params = {}, { rejectWithValue }) => {
//     try {
//       // params can include: { page, limit, status, startDate, endDate, period }
//       const response = await orderApi.getAllOrders(params);
//       return {
//         orders: response.orders || [],
//         pagination: response.pagination || {
//           page: params.page || 1,
//           limit: params.limit || 10,
//           total: response.total || 0,
//           pages: Math.ceil((response.total || 0) / (params.limit || 10))
//         }
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch orders");
//     }
//   }
// );

// // Get orders by customer ID
// export const fetchOrdersByCustomer = createAsyncThunk(
//   "orders/fetchByCustomer",
//   async (customerId, { rejectWithValue }) => {
//     try {
//       const response = await orderApi.getOrdersByCustomer(customerId);
//       return {
//         customerId,
//         orders: response.orders || []
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch customer orders");
//     }
//   }
// );

// // Get single order
// export const fetchOrderById = createAsyncThunk(
//   "orders/fetchById",
//   async (id, { rejectWithValue }) => {
//     try {
//       const response = await orderApi.getOrderById(id);
//       return {
//         order: response.order,
//         payments: response.payments || [],
//         works: response.works || []
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch order");
//     }
//   }
// );

// // Update order
// export const updateExistingOrder = createAsyncThunk(
//   "orders/update",
//   async ({ id, data }, { rejectWithValue }) => {
//     try {
//       const response = await orderApi.updateOrder(id, data);
//       return response.order;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to update order");
//     }
//   }
// );

// // Update order status
// export const updateOrderStatusThunk = createAsyncThunk(
//   "orders/updateStatus",
//   async ({ id, status }, { rejectWithValue }) => {
//     try {
//       const response = await orderApi.updateOrderStatus(id, status);
//       return response.order;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to update status");
//     }
//   }
// );

// // Delete order
// export const deleteExistingOrder = createAsyncThunk(
//   "orders/delete",
//   async (id, { rejectWithValue }) => {
//     try {
//       await orderApi.deleteOrder(id);
//       return id;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to delete order");
//     }
//   }
// );

// // Add payment to order
// export const addPayment = createAsyncThunk(
//   "orders/addPayment",
//   async ({ orderId, paymentData }, { rejectWithValue }) => {
//     try {
//       const response = await orderApi.addPaymentToOrder(orderId, paymentData);
//       return {
//         orderId,
//         payment: response.payment,
//         updatedOrder: response.order
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to add payment");
//     }
//   }
// );

// // Get order payments
// export const fetchOrderPayments = createAsyncThunk(
//   "orders/fetchPayments",
//   async (orderId, { rejectWithValue }) => {
//     try {
//       const response = await orderApi.getOrderPayments(orderId);
//       return {
//         orderId,
//         payments: response.payments || []
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch payments");
//     }
//   }
// );

// // ============================================
// // 📊 INITIAL STATE (UPDATED with recentOrders)
// // ============================================
// const initialState = {
//   // Main orders list
//   orders: [],
//   recentOrders: [], // ✅ For dashboard
//   currentOrder: null,
//   currentPayments: [],
//   currentWorks: [],
  
//   // Customer-specific orders
//   customerOrders: {}, // Store orders by customer ID
  
//   // Ready to delivery orders
//   readyToDelivery: {
//     orders: [],
//     count: 0,
//     loading: false
//   },
  
//   // Statistics
//   stats: {
//     today: 0,
//     pending: 0,
//     cutting: 0,
//     stitching: 0,
//     ready: 0,
//     delivered: 0,
//     cancelled: 0,
//     total: 0,
//     inProgress: 0,
//     deliveries: {
//       today: 0,
//       tomorrow: 0,
//       late: 0,
//       total: 0
//     },
//     filterPeriod: 'month',
//     startDate: null,
//     endDate: null
//   },
  
//   // Dashboard data
//   dashboard: {
//     todayOrders: { count: 0, orders: [] },
//     pendingDeliveries: { count: 0, orders: [] },
//     readyForDelivery: { count: 0, orders: [] },
//     recentOrders: [],
//     todayCollection: 0
//   },
  
//   // Pagination
//   pagination: {
//     page: 1,
//     limit: 10,
//     total: 0,
//     pages: 1
//   },
  
//   // UI states
//   loading: false,
//   error: null,
//   success: false,
  
//   // Filter info (for debugging)
//   currentFilter: null
// };

// // ============================================
// // 🎯 ORDER SLICE
// // ============================================
// const orderSlice = createSlice({
//   name: "orders",
//   initialState,
//   reducers: {
//     clearOrderError: (state) => {
//       state.error = null;
//     },
//     clearCurrentOrder: (state) => {
//       state.currentOrder = null;
//       state.currentPayments = [];
//       state.currentWorks = [];
//     },
//     clearCustomerOrders: (state, action) => {
//       const { customerId } = action.payload || {};
//       if (customerId) {
//         delete state.customerOrders[customerId];
//       } else {
//         state.customerOrders = {};
//       }
//     },
//     clearReadyToDelivery: (state) => {
//       state.readyToDelivery = {
//         orders: [],
//         count: 0,
//         loading: false
//       };
//     },
//     setPagination: (state, action) => {
//       state.pagination = { ...state.pagination, ...action.payload };
//     },
//     resetOrderState: () => initialState,
    
//     // ✅ NEW: Clear recent orders (useful when changing filters)
//     clearRecentOrders: (state) => {
//       state.recentOrders = [];
//     },
    
//     // ✅ NEW: Set current filter (for debugging)
//     setCurrentFilter: (state, action) => {
//       state.currentFilter = action.payload;
//     }
//   },
//   extraReducers: (builder) => {
//     builder
//       // ===== FETCH STATS =====
//       .addCase(fetchOrderStats.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchOrderStats.fulfilled, (state, action) => {
//         state.loading = false;
//         state.stats = {
//           ...state.stats,
//           ...action.payload,
//           // Ensure all fields exist
//           today: action.payload.today || 0,
//           pending: action.payload.pending || 0,
//           cutting: action.payload.cutting || 0,
//           stitching: action.payload.stitching || 0,
//           ready: action.payload.ready || 0,
//           delivered: action.payload.delivered || 0,
//           total: action.payload.total || 0
//         };
//       })
//       .addCase(fetchOrderStats.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== FETCH DASHBOARD =====
//       .addCase(fetchDashboardData.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchDashboardData.fulfilled, (state, action) => {
//         state.loading = false;
//         state.dashboard = {
//           ...state.dashboard,
//           ...action.payload
//         };
//       })
//       .addCase(fetchDashboardData.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== FETCH RECENT ORDERS (FIXED) =====
//       .addCase(fetchRecentOrders.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchRecentOrders.fulfilled, (state, action) => {
//         state.loading = false;
//         state.recentOrders = action.payload.orders || [];
//         state.currentFilter = action.payload.filter || null;
        
//         // Also update dashboard.recentOrders for backward compatibility
//         state.dashboard.recentOrders = action.payload.orders || [];
//       })
//       .addCase(fetchRecentOrders.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//         state.recentOrders = []; // Clear on error
//       })

//       // ===== FETCH READY TO DELIVERY ORDERS =====
//       .addCase(fetchReadyToDeliveryOrders.pending, (state) => {
//         state.readyToDelivery.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchReadyToDeliveryOrders.fulfilled, (state, action) => {
//         state.readyToDelivery.loading = false;
//         state.readyToDelivery.orders = action.payload.orders || [];
//         state.readyToDelivery.count = action.payload.count || 0;
//       })
//       .addCase(fetchReadyToDeliveryOrders.rejected, (state, action) => {
//         state.readyToDelivery.loading = false;
//         state.error = action.payload;
//       })

//       // ===== CREATE ORDER =====
//       .addCase(createNewOrder.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//         state.success = false;
//       })
//       .addCase(createNewOrder.fulfilled, (state, action) => {
//         state.loading = false;
//         state.orders.unshift(action.payload);
//         state.recentOrders.unshift(action.payload); // ✅ Add to recent orders
//         state.success = true;
        
//         // Update stats (increment counts)
//         if (action.payload.status) {
//           const status = action.payload.status;
//           if (status === 'confirmed') state.stats.pending += 1;
//           else if (status === 'in-progress') state.stats.inProgress += 1;
//           else if (status === 'ready-to-delivery') state.stats.ready += 1;
//           else if (status === 'delivered') state.stats.delivered += 1;
//         }
//         state.stats.total += 1;
        
//         // Add to customerOrders if customer exists
//         if (action.payload.customer) {
//           const customerId = action.payload.customer._id || action.payload.customer;
//           if (!state.customerOrders[customerId]) {
//             state.customerOrders[customerId] = [];
//           }
//           state.customerOrders[customerId].unshift(action.payload);
//         }

//         // If order is ready-to-delivery, add to readyToDelivery list
//         if (action.payload.status === 'ready-to-delivery') {
//           state.readyToDelivery.orders.unshift(action.payload);
//           state.readyToDelivery.count += 1;
//         }
//       })
//       .addCase(createNewOrder.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//         state.success = false;
//       })

//       // ===== FETCH ALL ORDERS =====
//       .addCase(fetchOrders.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchOrders.fulfilled, (state, action) => {
//         state.loading = false;
//         state.orders = action.payload.orders || [];
//         state.pagination = action.payload.pagination || state.pagination;
//       })
//       .addCase(fetchOrders.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== FETCH ORDERS BY CUSTOMER =====
//       .addCase(fetchOrdersByCustomer.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchOrdersByCustomer.fulfilled, (state, action) => {
//         state.loading = false;
//         const { customerId, orders } = action.payload;
//         state.customerOrders[customerId] = orders || [];
//       })
//       .addCase(fetchOrdersByCustomer.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== FETCH ORDER BY ID =====
//       .addCase(fetchOrderById.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchOrderById.fulfilled, (state, action) => {
//         state.loading = false;
//         state.currentOrder = action.payload.order;
//         state.currentPayments = action.payload.payments || [];
//         state.currentWorks = action.payload.works || [];
//       })
//       .addCase(fetchOrderById.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== UPDATE ORDER =====
//       .addCase(updateExistingOrder.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(updateExistingOrder.fulfilled, (state, action) => {
//         state.loading = false;
//         const updatedOrder = action.payload;
        
//         // Update in main orders array
//         const index = state.orders.findIndex(o => o?._id === updatedOrder?._id);
//         if (index !== -1) {
//           state.orders[index] = updatedOrder;
//         }
        
//         // Update in recent orders
//         const recentIndex = state.recentOrders.findIndex(o => o?._id === updatedOrder?._id);
//         if (recentIndex !== -1) {
//           state.recentOrders[recentIndex] = updatedOrder;
//         }
        
//         // Update in customerOrders if customer exists
//         if (updatedOrder?.customer) {
//           const customerId = updatedOrder.customer._id || updatedOrder.customer;
//           if (state.customerOrders[customerId]) {
//             const custIndex = state.customerOrders[customerId].findIndex(o => o?._id === updatedOrder?._id);
//             if (custIndex !== -1) {
//               state.customerOrders[customerId][custIndex] = updatedOrder;
//             }
//           }
//         }
        
//         // Update in readyToDelivery list if needed
//         const readyIndex = state.readyToDelivery.orders.findIndex(o => o?._id === updatedOrder?._id);
//         if (updatedOrder?.status === 'ready-to-delivery') {
//           if (readyIndex === -1) {
//             state.readyToDelivery.orders.unshift(updatedOrder);
//             state.readyToDelivery.count += 1;
//           } else {
//             state.readyToDelivery.orders[readyIndex] = updatedOrder;
//           }
//         } else if (readyIndex !== -1) {
//           // If status changed from ready-to-delivery to something else, remove from list
//           state.readyToDelivery.orders.splice(readyIndex, 1);
//           state.readyToDelivery.count -= 1;
//         }
        
//         // Update currentOrder if it's the same
//         if (state.currentOrder?._id === updatedOrder?._id) {
//           state.currentOrder = updatedOrder;
//         }
//         state.success = true;
//       })
//       .addCase(updateExistingOrder.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== UPDATE ORDER STATUS =====
//       .addCase(updateOrderStatusThunk.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(updateOrderStatusThunk.fulfilled, (state, action) => {
//         state.loading = false;
//         const updatedOrder = action.payload;
        
//         // Update in main orders array
//         const index = state.orders.findIndex(o => o?._id === updatedOrder?._id);
//         if (index !== -1) {
//           state.orders[index] = updatedOrder;
//         }
        
//         // Update in recent orders
//         const recentIndex = state.recentOrders.findIndex(o => o?._id === updatedOrder?._id);
//         if (recentIndex !== -1) {
//           state.recentOrders[recentIndex] = updatedOrder;
//         }
        
//         // Update in customerOrders if customer exists
//         if (updatedOrder?.customer) {
//           const customerId = updatedOrder.customer._id || updatedOrder.customer;
//           if (state.customerOrders[customerId]) {
//             const custIndex = state.customerOrders[customerId].findIndex(o => o?._id === updatedOrder?._id);
//             if (custIndex !== -1) {
//               state.customerOrders[customerId][custIndex] = updatedOrder;
//             }
//           }
//         }
        
//         // Update in readyToDelivery list based on status
//         const readyIndex = state.readyToDelivery.orders.findIndex(o => o?._id === updatedOrder?._id);
//         if (updatedOrder?.status === 'ready-to-delivery') {
//           if (readyIndex === -1) {
//             state.readyToDelivery.orders.unshift(updatedOrder);
//             state.readyToDelivery.count += 1;
//           } else {
//             state.readyToDelivery.orders[readyIndex] = updatedOrder;
//           }
//         } else if (readyIndex !== -1) {
//           // If status changed from ready-to-delivery to something else
//           state.readyToDelivery.orders.splice(readyIndex, 1);
//           state.readyToDelivery.count -= 1;
//         }
        
//         // Update currentOrder if it's the same
//         if (state.currentOrder?._id === updatedOrder?._id) {
//           state.currentOrder = updatedOrder;
//         }
//       })
//       .addCase(updateOrderStatusThunk.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== DELETE ORDER =====
//       .addCase(deleteExistingOrder.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(deleteExistingOrder.fulfilled, (state, action) => {
//         state.loading = false;
//         const deletedId = action.payload;
        
//         // Remove from main orders array
//         state.orders = state.orders.filter(o => o?._id !== deletedId);
        
//         // Remove from recent orders
//         state.recentOrders = state.recentOrders.filter(o => o?._id !== deletedId);
        
//         // Remove from all customerOrders entries
//         Object.keys(state.customerOrders).forEach(customerId => {
//           state.customerOrders[customerId] = state.customerOrders[customerId].filter(
//             o => o?._id !== deletedId
//           );
//         });
        
//         // Remove from readyToDelivery list
//         const readyIndex = state.readyToDelivery.orders.findIndex(o => o?._id === deletedId);
//         if (readyIndex !== -1) {
//           state.readyToDelivery.orders.splice(readyIndex, 1);
//           state.readyToDelivery.count -= 1;
//         }
        
//         // Clear currentOrder if it's the deleted one
//         if (state.currentOrder?._id === deletedId) {
//           state.currentOrder = null;
//           state.currentPayments = [];
//           state.currentWorks = [];
//         }
        
//         // Update stats
//         state.stats.total = Math.max(0, state.stats.total - 1);
//         state.success = true;
//       })
//       .addCase(deleteExistingOrder.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== ADD PAYMENT =====
//       .addCase(addPayment.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(addPayment.fulfilled, (state, action) => {
//         state.loading = false;
//         const { orderId, payment, updatedOrder } = action.payload;
        
//         // Update currentOrder if it matches
//         if (state.currentOrder?._id === orderId) {
//           state.currentOrder = updatedOrder || state.currentOrder;
//           state.currentPayments.push(payment);
//         }
        
//         // Update in orders list
//         const orderIndex = state.orders.findIndex(o => o?._id === orderId);
//         if (orderIndex !== -1 && updatedOrder) {
//           state.orders[orderIndex] = updatedOrder;
//         }
        
//         // Update in recent orders
//         const recentIndex = state.recentOrders.findIndex(o => o?._id === orderId);
//         if (recentIndex !== -1 && updatedOrder) {
//           state.recentOrders[recentIndex] = updatedOrder;
//         }
        
//         state.success = true;
//       })
//       .addCase(addPayment.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== FETCH ORDER PAYMENTS =====
//       .addCase(fetchOrderPayments.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchOrderPayments.fulfilled, (state, action) => {
//         state.loading = false;
//         if (state.currentOrder?._id === action.payload.orderId) {
//           state.currentPayments = action.payload.payments || [];
//         }
//       })
//       .addCase(fetchOrderPayments.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       });
//   }
// });

// // ============================================
// // 📤 EXPORT ACTIONS & REDUCER
// // ============================================
// export const { 
//   clearOrderError, 
//   clearCurrentOrder,
//   clearCustomerOrders,
//   clearReadyToDelivery,
//   clearRecentOrders,
//   setCurrentFilter,
//   setPagination, 
//   resetOrderState 
// } = orderSlice.actions;

// // ============================================
// // ✅ FIXED SELECTORS - Using 'order' (singular) to match store
// // ============================================

// // Helper to get order state (works with both 'order' and 'orders')
// const getOrderState = (state) => {
//   // Your store uses 'order' (singular)
//   return state.order || state.orders || {};
// };

// export const selectAllOrders = (state) => {
//   const orderState = getOrderState(state);
//   return orderState.orders || [];
// };

// export const selectRecentOrders = (state) => {
//   const orderState = getOrderState(state);
//   console.log('🔍 Selector - orderState:', orderState);
//   console.log('🔍 Selector - recentOrders:', orderState.recentOrders);
//   return orderState.recentOrders || [];
// };

// export const selectOrderStats = (state) => {
//   const orderState = getOrderState(state);
//   return orderState.stats || {
//     today: 0,
//     pending: 0,
//     cutting: 0,
//     stitching: 0,
//     ready: 0,
//     delivered: 0,
//     cancelled: 0,
//     total: 0,
//     inProgress: 0,
//     deliveries: {
//       today: 0,
//       tomorrow: 0,
//       late: 0,
//       total: 0
//     }
//   };
// };

// export const selectCurrentOrder = (state) => {
//   const orderState = getOrderState(state);
//   return orderState.currentOrder || null;
// };

// export const selectOrderLoading = (state) => {
//   const orderState = getOrderState(state);
//   return orderState.loading || false;
// };

// export const selectOrderError = (state) => {
//   const orderState = getOrderState(state);
//   return orderState.error || null;
// };

// export const selectReadyToDelivery = (state) => {
//   const orderState = getOrderState(state);
//   return orderState.readyToDelivery || {
//     orders: [],
//     count: 0,
//     loading: false
//   };
// };

// export const selectOrdersByCustomer = (customerId) => (state) => {
//   const orderState = getOrderState(state);
//   return orderState.customerOrders?.[customerId] || [];
// };

// export const selectOrderPagination = (state) => {
//   const orderState = getOrderState(state);
//   return orderState.pagination || {
//     page: 1,
//     limit: 10,
//     total: 0,
//     pages: 1
//   };
// };

// export const selectDashboardData = (state) => {
//   const orderState = getOrderState(state);
//   return orderState.dashboard || {
//     todayOrders: { count: 0, orders: [] },
//     pendingDeliveries: { count: 0, orders: [] },
//     readyForDelivery: { count: 0, orders: [] },
//     recentOrders: [],
//     todayCollection: 0
//   };
// };

// // ============================================
// // ✅ DEFAULT EXPORT
// // ============================================
// export default orderSlice.reducer;






// // frontend/src/features/orders/orderSlice.js - COMPLETE FIXED VERSION
// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import * as orderApi from "./orderApi";

// // ============================================
// // 🔄 ASYNC THUNKS


// // ============================================

// // Get order stats - WITH DATE FILTER SUPPORT ✅
// export const fetchOrderStats = createAsyncThunk(
//   "orders/fetchStats",
//   async (params = {}, { rejectWithValue }) => {
//     try {
//       // params can be { period: 'month' } or { startDate, endDate }
//       console.log('📊 Fetching order stats with params:', params);
//       const response = await orderApi.getOrderStats(params);
      
//       // Handle different response structures
//       if (response.data) {
//         return response.data; // If response has data wrapper
//       } else if (response.stats) {
//         return response.stats; // If response has stats wrapper
//       }
//       return response; // If response is directly the stats
//     } catch (error) {
//       console.error('❌ fetchOrderStats error:', error);
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch stats");
//     }
//   }
// );

// // Get dashboard data
// export const fetchDashboardData = createAsyncThunk(
//   "orders/fetchDashboard",
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await orderApi.getDashboardData();
//       return response.dashboard || response.data || response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch dashboard");
//     }
//   }
// );

// // ✅ FIXED: fetchRecentOrders with date filter support
// export const fetchRecentOrders = createAsyncThunk(
//   "orders/fetchRecent",
//   async (params = {}, { rejectWithValue }) => {
//     try {
//       // params can include: { limit, startDate, endDate, period }
//       const { limit = 10, startDate, endDate, period } = params;
      
//       console.log('📋 Fetching recent orders with:', { limit, startDate, endDate, period });
      
//       const response = await orderApi.getRecentOrders({ 
//         limit, 
//         startDate, 
//         endDate, 
//         period 
//       });
      
//       // Handle different response structures
//       let orders = [];
//       if (response.orders) {
//         orders = response.orders;
//       } else if (response.data) {
//         orders = response.data;
//       } else if (Array.isArray(response)) {
//         orders = response;
//       }
      
//       return {
//         orders: orders,
//         count: orders.length,
//         filter: params
//       };
//     } catch (error) {
//       console.error('❌ fetchRecentOrders error:', error);
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch recent orders");
//     }
//   }
// );

// // Get ready to delivery orders
// export const fetchReadyToDeliveryOrders = createAsyncThunk(
//   "orders/fetchReadyToDelivery",
//   async (params = {}, { rejectWithValue }) => {
//     try {
//       const response = await orderApi.getReadyToDeliveryOrders(params);
      
//       let orders = [];
//       if (response.orders) {
//         orders = response.orders;
//       } else if (response.data) {
//         orders = response.data;
//       } else if (Array.isArray(response)) {
//         orders = response;
//       }
      
//       return {
//         orders: orders,
//         count: orders.length
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch ready to delivery orders");
//     }
//   }
// );

// // Create new order
// export const createNewOrder = createAsyncThunk(
//   "orders/create",
//   async (orderData, { rejectWithValue }) => {
//     try {
//       const response = await orderApi.createOrder(orderData);
//       return response.order || response.data || response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to create order");
//     }
//   }
// );

// // Get all orders - WITH FILTER SUPPORT ✅
// export const fetchOrders = createAsyncThunk(
//   "orders/fetchAll",
//   async (params = {}, { rejectWithValue }) => {
//     try {
//       // params can include: { page, limit, status, startDate, endDate, period }
//       const response = await orderApi.getAllOrders(params);
      
//       let orders = [];
//       let pagination = {
//         page: params.page || 1,
//         limit: params.limit || 10,
//         total: 0,
//         pages: 1
//       };
      
//       if (response.orders) {
//         orders = response.orders;
//         pagination = response.pagination || pagination;
//       } else if (response.data) {
//         orders = response.data;
//       } else if (Array.isArray(response)) {
//         orders = response;
//       }
      
//       return {
//         orders: orders,
//         pagination: pagination
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch orders");
//     }
//   }
// );

// // Get orders by customer ID
// export const fetchOrdersByCustomer = createAsyncThunk(
//   "orders/fetchByCustomer",
//   async (customerId, { rejectWithValue }) => {
//     try {
//       const response = await orderApi.getOrdersByCustomer(customerId);
      
//       let orders = [];
//       if (response.orders) {
//         orders = response.orders;
//       } else if (response.data) {
//         orders = response.data;
//       } else if (Array.isArray(response)) {
//         orders = response;
//       }
      
//       return {
//         customerId,
//         orders: orders
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch customer orders");
//     }
//   }
// );

// // Get single order
// export const fetchOrderById = createAsyncThunk(
//   "orders/fetchById",
//   async (id, { rejectWithValue }) => {
//     try {
//       const response = await orderApi.getOrderById(id);
      
//       return {
//         order: response.order || response.data || response,
//         payments: response.payments || [],
//         works: response.works || []
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch order");
//     }
//   }
// );

// // Update order
// export const updateExistingOrder = createAsyncThunk(
//   "orders/update",
//   async ({ id, data }, { rejectWithValue }) => {
//     try {
//       const response = await orderApi.updateOrder(id, data);
//       return response.order || response.data || response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to update order");
//     }
//   }
// );

// // Update order status
// export const updateOrderStatusThunk = createAsyncThunk(
//   "orders/updateStatus",
//   async ({ id, status }, { rejectWithValue }) => {
//     try {
//       const response = await orderApi.updateOrderStatus(id, status);
//       return response.order || response.data || response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to update status");
//     }
//   }
// );

// // Delete order
// export const deleteExistingOrder = createAsyncThunk(
//   "orders/delete",
//   async (id, { rejectWithValue }) => {
//     try {
//       await orderApi.deleteOrder(id);
//       return id;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to delete order");
//     }
//   }
// );

// // Add payment to order
// export const addPayment = createAsyncThunk(
//   "orders/addPayment",
//   async ({ orderId, paymentData }, { rejectWithValue }) => {
//     try {
//       const response = await orderApi.addPaymentToOrder(orderId, paymentData);
//       return {
//         orderId,
//         payment: response.payment || response.data,
//         updatedOrder: response.order || response
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to add payment");
//     }
//   }
// );

// // Get order payments
// export const fetchOrderPayments = createAsyncThunk(
//   "orders/fetchPayments",
//   async (orderId, { rejectWithValue }) => {
//     try {
//       const response = await orderApi.getOrderPayments(orderId);
      
//       let payments = [];
//       if (response.payments) {
//         payments = response.payments;
//       } else if (response.data) {
//         payments = response.data;
//       } else if (Array.isArray(response)) {
//         payments = response;
//       }
      
//       return {
//         orderId,
//         payments: payments
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch payments");
//     }
//   }
// );

// // ============================================
// // 📊 INITIAL STATE
// // ============================================
// const initialState = {
//   // Main orders list
//   orders: [],
//   recentOrders: [], // ✅ For dashboard
//   currentOrder: null,
//   currentPayments: [],
//   currentWorks: [],
  
//   // Customer-specific orders
//   customerOrders: {}, // Store orders by customer ID
  
//   // Ready to delivery orders
//   readyToDelivery: {
//     orders: [],
//     count: 0,
//     loading: false
//   },
  
//   // Statistics - MATCHES YOUR FRONTEND EXPECTATIONS
//   stats: {
//     total: 0,
//     pending: 0,
//     cutting: 0,
//     stitching: 0,
//     ready: 0,
//     delivered: 0,
//     cancelled: 0,
//     draft: 0,
//     confirmed: 0,
//     'in-progress': 0,
//     'ready-to-delivery': 0,
//     today: 0,
//     thisWeek: 0,
//     thisMonth: 0,
//     inProgress: 0,
//     deliveries: {
//       today: 0,
//       tomorrow: 0,
//       late: 0,
//       total: 0
//     },
//     filterPeriod: 'month',
//     startDate: null,
//     endDate: null
//   },
  
//   // Dashboard data
//   dashboard: {
//     todayOrders: { count: 0, orders: [] },
//     pendingDeliveries: { count: 0, orders: [] },
//     readyForDelivery: { count: 0, orders: [] },
//     recentOrders: [],
//     todayCollection: 0,
//     totalIncomeToday: 0,
//     incomeBreakdown: {
//       handCash: 0,
//       bank: 0
//     }
//   },
  
//   // Pagination
//   pagination: {
//     page: 1,
//     limit: 10,
//     total: 0,
//     pages: 1
//   },
  
//   // UI states
//   loading: false,
//   error: null,
//   success: false,
  
//   // Filter info (for debugging)
//   currentFilter: null
// };

// // ============================================
// // 🎯 ORDER SLICE
// // ============================================
// const orderSlice = createSlice({
//   name: "orders",
//   initialState,
//   reducers: {
//     clearOrderError: (state) => {
//       state.error = null;
//     },
//     clearCurrentOrder: (state) => {
//       state.currentOrder = null;
//       state.currentPayments = [];
//       state.currentWorks = [];
//     },
//     clearCustomerOrders: (state, action) => {
//       const { customerId } = action.payload || {};
//       if (customerId) {
//         delete state.customerOrders[customerId];
//       } else {
//         state.customerOrders = {};
//       }
//     },
//     clearReadyToDelivery: (state) => {
//       state.readyToDelivery = {
//         orders: [],
//         count: 0,
//         loading: false
//       };
//     },
//     setPagination: (state, action) => {
//       state.pagination = { ...state.pagination, ...action.payload };
//     },
//     resetOrderState: () => initialState,
    
//     // ✅ Clear recent orders (useful when changing filters)
//     clearRecentOrders: (state) => {
//       state.recentOrders = [];
//     },
    
//     // ✅ Set current filter (for debugging)
//     setCurrentFilter: (state, action) => {
//       state.currentFilter = action.payload;
//     },
    
//     // ✅ Update stats manually (if needed)
//     updateStats: (state, action) => {
//       state.stats = { ...state.stats, ...action.payload };
//     }
//   },
//   extraReducers: (builder) => {
//     builder
//       // ===== FETCH STATS =====
//       .addCase(fetchOrderStats.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//         console.log('⏳ fetchOrderStats pending');
//       })
//       .addCase(fetchOrderStats.fulfilled, (state, action) => {
//         state.loading = false;
//         console.log('✅ fetchOrderStats fulfilled - payload:', action.payload);
        
//         // Merge with existing stats
//         state.stats = {
//           ...state.stats,
//           ...action.payload,
//           // Ensure all required fields exist
//           total: action.payload.total || 0,
//           pending: action.payload.pending || 0,
//           cutting: action.payload.cutting || 0,
//           stitching: action.payload.stitching || 0,
//           ready: action.payload.ready || 0,
//           delivered: action.payload.delivered || 0,
//           cancelled: action.payload.cancelled || 0,
//           draft: action.payload.draft || 0,
//           confirmed: action.payload.confirmed || 0,
//           'in-progress': action.payload['in-progress'] || 0,
//           'ready-to-delivery': action.payload['ready-to-delivery'] || 0,
//           today: action.payload.today || 0,
//           thisWeek: action.payload.thisWeek || 0,
//           thisMonth: action.payload.thisMonth || 0,
//           inProgress: action.payload.inProgress || action.payload.cutting || 0
//         };
        
//         console.log('📊 Updated stats in Redux:', state.stats);
//       })
//       .addCase(fetchOrderStats.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//         console.error('❌ fetchOrderStats rejected:', action.payload);
//       })

//       // ===== FETCH DASHBOARD =====
//       .addCase(fetchDashboardData.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchDashboardData.fulfilled, (state, action) => {
//         state.loading = false;
//         state.dashboard = {
//           ...state.dashboard,
//           ...action.payload
//         };
//       })
//       .addCase(fetchDashboardData.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== FETCH RECENT ORDERS (FIXED) =====
//       .addCase(fetchRecentOrders.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//         console.log('⏳ fetchRecentOrders pending');
//       })
//       .addCase(fetchRecentOrders.fulfilled, (state, action) => {
//         state.loading = false;
//         console.log('✅ fetchRecentOrders fulfilled - payload:', action.payload);
        
//         state.recentOrders = action.payload.orders || [];
//         state.currentFilter = action.payload.filter || null;
        
//         // Also update dashboard.recentOrders for backward compatibility
//         state.dashboard.recentOrders = action.payload.orders || [];
        
//         console.log('📋 Updated recentOrders in Redux:', state.recentOrders.length);
//       })
//       .addCase(fetchRecentOrders.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//         state.recentOrders = []; // Clear on error
//         console.error('❌ fetchRecentOrders rejected:', action.payload);
//       })

//       // ===== FETCH READY TO DELIVERY ORDERS =====
//       .addCase(fetchReadyToDeliveryOrders.pending, (state) => {
//         state.readyToDelivery.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchReadyToDeliveryOrders.fulfilled, (state, action) => {
//         state.readyToDelivery.loading = false;
//         state.readyToDelivery.orders = action.payload.orders || [];
//         state.readyToDelivery.count = action.payload.count || 0;
//       })
//       .addCase(fetchReadyToDeliveryOrders.rejected, (state, action) => {
//         state.readyToDelivery.loading = false;
//         state.error = action.payload;
//       })

//       // ===== CREATE ORDER =====
//       .addCase(createNewOrder.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//         state.success = false;
//       })
//       .addCase(createNewOrder.fulfilled, (state, action) => {
//         state.loading = false;
//         state.orders.unshift(action.payload);
//         state.recentOrders.unshift(action.payload); // ✅ Add to recent orders
//         state.success = true;
        
//         // Update stats (increment counts)
//         if (action.payload.status) {
//           const status = action.payload.status;
//           if (status === 'confirmed') state.stats.pending += 1;
//           else if (status === 'in-progress') {
//             state.stats.cutting += 1;
//             state.stats.stitching += 1;
//             state.stats.inProgress += 1;
//           }
//           else if (status === 'ready-to-delivery') state.stats.ready += 1;
//           else if (status === 'delivered') state.stats.delivered += 1;
//           else if (status === 'draft') state.stats.draft += 1;
//         }
//         state.stats.total += 1;
        
//         // Add to customerOrders if customer exists
//         if (action.payload.customer) {
//           const customerId = action.payload.customer._id || action.payload.customer;
//           if (!state.customerOrders[customerId]) {
//             state.customerOrders[customerId] = [];
//           }
//           state.customerOrders[customerId].unshift(action.payload);
//         }

//         // If order is ready-to-delivery, add to readyToDelivery list
//         if (action.payload.status === 'ready-to-delivery') {
//           state.readyToDelivery.orders.unshift(action.payload);
//           state.readyToDelivery.count += 1;
//         }
//       })
//       .addCase(createNewOrder.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//         state.success = false;
//       })

//       // ===== FETCH ALL ORDERS =====
//       .addCase(fetchOrders.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchOrders.fulfilled, (state, action) => {
//         state.loading = false;
//         state.orders = action.payload.orders || [];
//         state.pagination = action.payload.pagination || state.pagination;
//       })
//       .addCase(fetchOrders.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== FETCH ORDERS BY CUSTOMER =====
//       .addCase(fetchOrdersByCustomer.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchOrdersByCustomer.fulfilled, (state, action) => {
//         state.loading = false;
//         const { customerId, orders } = action.payload;
//         state.customerOrders[customerId] = orders || [];
//       })
//       .addCase(fetchOrdersByCustomer.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== FETCH ORDER BY ID =====
//       .addCase(fetchOrderById.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchOrderById.fulfilled, (state, action) => {
//         state.loading = false;
//         state.currentOrder = action.payload.order;
//         state.currentPayments = action.payload.payments || [];
//         state.currentWorks = action.payload.works || [];
//       })
//       .addCase(fetchOrderById.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== UPDATE ORDER =====
//       .addCase(updateExistingOrder.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(updateExistingOrder.fulfilled, (state, action) => {
//         state.loading = false;
//         const updatedOrder = action.payload;
        
//         // Update in main orders array
//         const index = state.orders.findIndex(o => o?._id === updatedOrder?._id);
//         if (index !== -1) {
//           state.orders[index] = updatedOrder;
//         }
        
//         // Update in recent orders
//         const recentIndex = state.recentOrders.findIndex(o => o?._id === updatedOrder?._id);
//         if (recentIndex !== -1) {
//           state.recentOrders[recentIndex] = updatedOrder;
//         }
        
//         // Update in customerOrders if customer exists
//         if (updatedOrder?.customer) {
//           const customerId = updatedOrder.customer._id || updatedOrder.customer;
//           if (state.customerOrders[customerId]) {
//             const custIndex = state.customerOrders[customerId].findIndex(o => o?._id === updatedOrder?._id);
//             if (custIndex !== -1) {
//               state.customerOrders[customerId][custIndex] = updatedOrder;
//             }
//           }
//         }
        
//         // Update in readyToDelivery list if needed
//         const readyIndex = state.readyToDelivery.orders.findIndex(o => o?._id === updatedOrder?._id);
//         if (updatedOrder?.status === 'ready-to-delivery') {
//           if (readyIndex === -1) {
//             state.readyToDelivery.orders.unshift(updatedOrder);
//             state.readyToDelivery.count += 1;
//           } else {
//             state.readyToDelivery.orders[readyIndex] = updatedOrder;
//           }
//         } else if (readyIndex !== -1) {
//           // If status changed from ready-to-delivery to something else, remove from list
//           state.readyToDelivery.orders.splice(readyIndex, 1);
//           state.readyToDelivery.count -= 1;
//         }
        
//         // Update currentOrder if it's the same
//         if (state.currentOrder?._id === updatedOrder?._id) {
//           state.currentOrder = updatedOrder;
//         }
//         state.success = true;
//       })
//       .addCase(updateExistingOrder.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== UPDATE ORDER STATUS =====
//       .addCase(updateOrderStatusThunk.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(updateOrderStatusThunk.fulfilled, (state, action) => {
//         state.loading = false;
//         const updatedOrder = action.payload;
        
//         // Update in main orders array
//         const index = state.orders.findIndex(o => o?._id === updatedOrder?._id);
//         if (index !== -1) {
//           state.orders[index] = updatedOrder;
//         }
        
//         // Update in recent orders
//         const recentIndex = state.recentOrders.findIndex(o => o?._id === updatedOrder?._id);
//         if (recentIndex !== -1) {
//           state.recentOrders[recentIndex] = updatedOrder;
//         }
        
//         // Update in customerOrders if customer exists
//         if (updatedOrder?.customer) {
//           const customerId = updatedOrder.customer._id || updatedOrder.customer;
//           if (state.customerOrders[customerId]) {
//             const custIndex = state.customerOrders[customerId].findIndex(o => o?._id === updatedOrder?._id);
//             if (custIndex !== -1) {
//               state.customerOrders[customerId][custIndex] = updatedOrder;
//             }
//           }
//         }
        
//         // Update in readyToDelivery list based on status
//         const readyIndex = state.readyToDelivery.orders.findIndex(o => o?._id === updatedOrder?._id);
//         if (updatedOrder?.status === 'ready-to-delivery') {
//           if (readyIndex === -1) {
//             state.readyToDelivery.orders.unshift(updatedOrder);
//             state.readyToDelivery.count += 1;
//           } else {
//             state.readyToDelivery.orders[readyIndex] = updatedOrder;
//           }
//         } else if (readyIndex !== -1) {
//           // If status changed from ready-to-delivery to something else
//           state.readyToDelivery.orders.splice(readyIndex, 1);
//           state.readyToDelivery.count -= 1;
//         }
        
//         // Update currentOrder if it's the same
//         if (state.currentOrder?._id === updatedOrder?._id) {
//           state.currentOrder = updatedOrder;
//         }
//       })
//       .addCase(updateOrderStatusThunk.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== DELETE ORDER =====
//       .addCase(deleteExistingOrder.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(deleteExistingOrder.fulfilled, (state, action) => {
//         state.loading = false;
//         const deletedId = action.payload;
        
//         // Remove from main orders array
//         state.orders = state.orders.filter(o => o?._id !== deletedId);
        
//         // Remove from recent orders
//         state.recentOrders = state.recentOrders.filter(o => o?._id !== deletedId);
        
//         // Remove from all customerOrders entries
//         Object.keys(state.customerOrders).forEach(customerId => {
//           state.customerOrders[customerId] = state.customerOrders[customerId].filter(
//             o => o?._id !== deletedId
//           );
//         });
        
//         // Remove from readyToDelivery list
//         const readyIndex = state.readyToDelivery.orders.findIndex(o => o?._id === deletedId);
//         if (readyIndex !== -1) {
//           state.readyToDelivery.orders.splice(readyIndex, 1);
//           state.readyToDelivery.count -= 1;
//         }
        
//         // Clear currentOrder if it's the deleted one
//         if (state.currentOrder?._id === deletedId) {
//           state.currentOrder = null;
//           state.currentPayments = [];
//           state.currentWorks = [];
//         }
        
//         // Update stats
//         state.stats.total = Math.max(0, state.stats.total - 1);
//         state.success = true;
//       })
//       .addCase(deleteExistingOrder.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== ADD PAYMENT =====
//       .addCase(addPayment.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(addPayment.fulfilled, (state, action) => {
//         state.loading = false;
//         const { orderId, payment, updatedOrder } = action.payload;
        
//         // Update currentOrder if it matches
//         if (state.currentOrder?._id === orderId) {
//           state.currentOrder = updatedOrder || state.currentOrder;
//           state.currentPayments.push(payment);
//         }
        
//         // Update in orders list
//         const orderIndex = state.orders.findIndex(o => o?._id === orderId);
//         if (orderIndex !== -1 && updatedOrder) {
//           state.orders[orderIndex] = updatedOrder;
//         }
        
//         // Update in recent orders
//         const recentIndex = state.recentOrders.findIndex(o => o?._id === orderId);
//         if (recentIndex !== -1 && updatedOrder) {
//           state.recentOrders[recentIndex] = updatedOrder;
//         }
        
//         state.success = true;
//       })
//       .addCase(addPayment.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== FETCH ORDER PAYMENTS =====
//       .addCase(fetchOrderPayments.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchOrderPayments.fulfilled, (state, action) => {
//         state.loading = false;
//         if (state.currentOrder?._id === action.payload.orderId) {
//           state.currentPayments = action.payload.payments || [];
//         }
//       })
//       .addCase(fetchOrderPayments.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       });
//   }
// });

// // ============================================
// // 📤 EXPORT ACTIONS & REDUCER
// // ============================================
// export const { 
//   clearOrderError, 
//   clearCurrentOrder,
//   clearCustomerOrders,
//   clearReadyToDelivery,
//   clearRecentOrders,
//   setCurrentFilter,
//   setPagination, 
//   resetOrderState,
//   updateStats
// } = orderSlice.actions;

// // ============================================
// // ✅ FIXED SELECTORS - Using 'order' (singular) to match store
// // ============================================

// // Helper to get order state (works with both 'order' and 'orders')
// const getOrderState = (state) => {
//   // Your store uses 'order' (singular)
//   return state.order || state.orders || {};
// };

// export const selectAllOrders = (state) => {
//   const orderState = getOrderState(state);
//   return orderState.orders || [];
// };

// export const selectRecentOrders = (state) => {
//   const orderState = getOrderState(state);
//   console.log('🔍 Selector - orderState:', orderState);
//   console.log('🔍 Selector - recentOrders:', orderState.recentOrders);
//   return orderState.recentOrders || [];
// };

// export const selectOrderStats = (state) => {
//   const orderState = getOrderState(state);
//   const stats = orderState.stats || {};
  
//   // Return with defaults to prevent undefined errors
//   return {
//     total: stats.total || 0,
//     pending: stats.pending || 0,
//     cutting: stats.cutting || 0,
//     stitching: stats.stitching || 0,
//     ready: stats.ready || 0,
//     delivered: stats.delivered || 0,
//     cancelled: stats.cancelled || 0,
//     draft: stats.draft || 0,
//     confirmed: stats.confirmed || 0,
//     'in-progress': stats['in-progress'] || 0,
//     'ready-to-delivery': stats['ready-to-delivery'] || 0,
//     today: stats.today || 0,
//     thisWeek: stats.thisWeek || 0,
//     thisMonth: stats.thisMonth || 0,
//     inProgress: stats.inProgress || stats.cutting || 0,
//     deliveries: stats.deliveries || {
//       today: 0,
//       tomorrow: 0,
//       late: 0,
//       total: 0
//     },
//     filterPeriod: stats.filterPeriod || 'month',
//     startDate: stats.startDate || null,
//     endDate: stats.endDate || null
//   };
// };

// export const selectCurrentOrder = (state) => {
//   const orderState = getOrderState(state);
//   return orderState.currentOrder || null;
// };

// export const selectOrderLoading = (state) => {
//   const orderState = getOrderState(state);
//   return orderState.loading || false;
// };

// export const selectOrderError = (state) => {
//   const orderState = getOrderState(state);
//   return orderState.error || null;
// };

// export const selectReadyToDelivery = (state) => {
//   const orderState = getOrderState(state);
//   return orderState.readyToDelivery || {
//     orders: [],
//     count: 0,
//     loading: false
//   };
// };

// export const selectOrdersByCustomer = (customerId) => (state) => {
//   const orderState = getOrderState(state);
//   return orderState.customerOrders?.[customerId] || [];
// };

// export const selectOrderPagination = (state) => {
//   const orderState = getOrderState(state);
//   return orderState.pagination || {
//     page: 1,
//     limit: 10,
//     total: 0,
//     pages: 1
//   };
// };

// export const selectDashboardData = (state) => {
//   const orderState = getOrderState(state);
//   return orderState.dashboard || {
//     todayOrders: { count: 0, orders: [] },
//     pendingDeliveries: { count: 0, orders: [] },
//     readyForDelivery: { count: 0, orders: [] },
//     recentOrders: [],
//     todayCollection: 0,
//     totalIncomeToday: 0,
//     incomeBreakdown: {
//       handCash: 0,
//       bank: 0
//     }
//   };
// };







// // ============================================
// // ✅ DEFAULT EXPORT
// // ============================================
// export default orderSlice.reducer;











//add leander 

//add leander 

// // frontend/src/features/orders/orderSlice.js - COMPLETE FIXED VERSION WITH GREEN CIRCLE CALENDAR
// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import * as orderApi from "./orderApi";

// // ============================================
// // 🔄 ASYNC THUNKS
// // ============================================

// // Get order stats - WITH DATE FILTER SUPPORT ✅
// export const fetchOrderStats = createAsyncThunk(
//   "orders/fetchStats",
//   async (params = {}, { rejectWithValue }) => {
//     try {
//       // params can be { period: 'month' } or { startDate, endDate }
//       console.log('📊 Fetching order stats with params:', params);
//       const response = await orderApi.getOrderStats(params);
      
//       // Handle different response structures
//       if (response.data) {
//         return response.data; // If response has data wrapper
//       } else if (response.stats) {
//         return response.stats; // If response has stats wrapper
//       }
//       return response; // If response is directly the stats
//     } catch (error) {
//       console.error('❌ fetchOrderStats error:', error);
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch stats");
//     }
//   }
// );

// // Get dashboard data
// export const fetchDashboardData = createAsyncThunk(
//   "orders/fetchDashboard",
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await orderApi.getDashboardData();
//       return response.dashboard || response.data || response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch dashboard");
//     }
//   }
// );

// // ✅ FIXED: fetchRecentOrders with date filter support
// export const fetchRecentOrders = createAsyncThunk(
//   "orders/fetchRecent",
//   async (params = {}, { rejectWithValue }) => {
//     try {
//       // params can include: { limit, startDate, endDate, period }
//       const { limit = 10, startDate, endDate, period } = params;
      
//       console.log('📋 Fetching recent orders with:', { limit, startDate, endDate, period });
      
//       const response = await orderApi.getRecentOrders({ 
//         limit, 
//         startDate, 
//         endDate, 
//         period 
//       });
      
//       // Handle different response structures
//       let orders = [];
//       if (response.orders) {
//         orders = response.orders;
//       } else if (response.data) {
//         orders = response.data;
//       } else if (Array.isArray(response)) {
//         orders = response;
//       }
      
//       return {
//         orders: orders,
//         count: orders.length,
//         filter: params
//       };
//     } catch (error) {
//       console.error('❌ fetchRecentOrders error:', error);
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch recent orders");
//     }
//   }
// );

// // Get ready to delivery orders
// export const fetchReadyToDeliveryOrders = createAsyncThunk(
//   "orders/fetchReadyToDelivery",
//   async (params = {}, { rejectWithValue }) => {
//     try {
//       const response = await orderApi.getReadyToDeliveryOrders(params);
      
//       let orders = [];
//       if (response.orders) {
//         orders = response.orders;
//       } else if (response.data) {
//         orders = response.data;
//       } else if (Array.isArray(response)) {
//         orders = response;
//       }
      
//       return {
//         orders: orders,
//         count: orders.length
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch ready to delivery orders");
//     }
//   }
// );

// // Create new order
// export const createNewOrder = createAsyncThunk(
//   "orders/create",
//   async (orderData, { rejectWithValue }) => {
//     try {
//       const response = await orderApi.createOrder(orderData);
//       return response.order || response.data || response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to create order");
//     }
//   }
// );

// // Get all orders - WITH FILTER SUPPORT ✅
// export const fetchOrders = createAsyncThunk(
//   "orders/fetchAll",
//   async (params = {}, { rejectWithValue }) => {
//     try {
//       // params can include: { page, limit, status, startDate, endDate, period }
//       const response = await orderApi.getAllOrders(params);
      
//       let orders = [];
//       let pagination = {
//         page: params.page || 1,
//         limit: params.limit || 10,
//         total: 0,
//         pages: 1
//       };
      
//       if (response.orders) {
//         orders = response.orders;
//         pagination = response.pagination || pagination;
//       } else if (response.data) {
//         orders = response.data;
//       } else if (Array.isArray(response)) {
//         orders = response;
//       }
      
//       return {
//         orders: orders,
//         pagination: pagination
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch orders");
//     }
//   }
// );

// // Get orders by customer ID
// export const fetchOrdersByCustomer = createAsyncThunk(
//   "orders/fetchByCustomer",
//   async (customerId, { rejectWithValue }) => {
//     try {
//       const response = await orderApi.getOrdersByCustomer(customerId);
      
//       let orders = [];
//       if (response.orders) {
//         orders = response.orders;
//       } else if (response.data) {
//         orders = response.data;
//       } else if (Array.isArray(response)) {
//         orders = response;
//       }
      
//       return {
//         customerId,
//         orders: orders
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch customer orders");
//     }
//   }
// );

// // Get single order
// export const fetchOrderById = createAsyncThunk(
//   "orders/fetchById",
//   async (id, { rejectWithValue }) => {
//     try {
//       const response = await orderApi.getOrderById(id);
      
//       return {
//         order: response.order || response.data || response,
//         payments: response.payments || [],
//         works: response.works || []
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch order");
//     }
//   }
// );

// // Update order
// export const updateExistingOrder = createAsyncThunk(
//   "orders/update",
//   async ({ id, data }, { rejectWithValue }) => {
//     try {
//       const response = await orderApi.updateOrder(id, data);
//       return response.order || response.data || response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to update order");
//     }
//   }
// );

// // Update order status
// export const updateOrderStatusThunk = createAsyncThunk(
//   "orders/updateStatus",
//   async ({ id, status }, { rejectWithValue }) => {
//     try {
//       const response = await orderApi.updateOrderStatus(id, status);
//       return response.order || response.data || response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to update status");
//     }
//   }
// );

// // Delete order
// export const deleteExistingOrder = createAsyncThunk(
//   "orders/delete",
//   async (id, { rejectWithValue }) => {
//     try {
//       await orderApi.deleteOrder(id);
//       return id;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to delete order");
//     }
//   }
// );

// // Add payment to order
// export const addPayment = createAsyncThunk(
//   "orders/addPayment",
//   async ({ orderId, paymentData }, { rejectWithValue }) => {
//     try {
//       const response = await orderApi.addPaymentToOrder(orderId, paymentData);
//       return {
//         orderId,
//         payment: response.payment || response.data,
//         updatedOrder: response.order || response
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to add payment");
//     }
//   }
// );

// // Get order payments
// export const fetchOrderPayments = createAsyncThunk(
//   "orders/fetchPayments",
//   async (orderId, { rejectWithValue }) => {
//     try {
//       const response = await orderApi.getOrderPayments(orderId);
      
//       let payments = [];
//       if (response.payments) {
//         payments = response.payments;
//       } else if (response.data) {
//         payments = response.data;
//       } else if (Array.isArray(response)) {
//         payments = response;
//       }
      
//       return {
//         orderId,
//         payments: payments
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch payments");
//     }
//   }
// );

// // ============================================
// // 🟢 NEW: Get dates that have orders (simple array for calendar green dots)
// // ============================================
// export const fetchOrderDates = createAsyncThunk(
//   "orders/fetchOrderDates",
//   async (params = {}, { rejectWithValue }) => {
//     try {
//       const { month, year } = params;
      
//       if (month === undefined || year === undefined) {
//         return rejectWithValue("Month and year are required");
//       }
      
//       console.log(`🟢 Fetching order dates for month: ${month}, year: ${year}`);
      
//       const response = await orderApi.getOrderDates({ month, year });
      
//       return {
//         dates: response.dates || [],
//         month,
//         year
//       };
//     } catch (error) {
//       console.error('❌ fetchOrderDates error:', error);
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch order dates");
//     }
//   }
// );

// // ============================================
// // 📊 INITIAL STATE
// // ============================================
// const initialState = {
//   // Main orders list
//   orders: [],
//   recentOrders: [], // ✅ For dashboard
//   currentOrder: null,
//   currentPayments: [],
//   currentWorks: [],
  
//   // Customer-specific orders
//   customerOrders: {}, // Store orders by customer ID
  
//   // Ready to delivery orders
//   readyToDelivery: {
//     orders: [],
//     count: 0,
//     loading: false
//   },
  
//   // Statistics - MATCHES YOUR FRONTEND EXPECTATIONS
//   stats: {
//     total: 0,
//     pending: 0,
//     cutting: 0,
//     stitching: 0,
//     ready: 0,
//     delivered: 0,
//     cancelled: 0,
//     draft: 0,
//     confirmed: 0,
//     'in-progress': 0,
//     'ready-to-delivery': 0,
//     today: 0,
//     thisWeek: 0,
//     thisMonth: 0,
//     inProgress: 0,
//     deliveries: {
//       today: 0,
//       tomorrow: 0,
//       late: 0,
//       total: 0
//     },
//     filterPeriod: 'month',
//     startDate: null,
//     endDate: null
//   },
  
//   // Dashboard data
//   dashboard: {
//     todayOrders: { count: 0, orders: [] },
//     pendingDeliveries: { count: 0, orders: [] },
//     readyForDelivery: { count: 0, orders: [] },
//     recentOrders: [],
//     todayCollection: 0,
//     totalIncomeToday: 0,
//     incomeBreakdown: {
//       handCash: 0,
//       bank: 0
//     }
//   },
  
//   // Pagination
//   pagination: {
//     page: 1,
//     limit: 10,
//     total: 0,
//     pages: 1
//   },
  
//   // UI states
//   loading: false,
//   error: null,
//   success: false,
  
//   // Filter info (for debugging)
//   currentFilter: null,
  
//   // 📅 NEW: Calendar state for green dots
//   calendar: {
//     orderDates: [], // Array of dates with orders ["2026-03-19", "2026-03-23", "2026-03-29"]
//     loading: false,
//     month: null,
//     year: null
//   }
// };

// // ============================================
// // 🎯 ORDER SLICE
// // ============================================
// const orderSlice = createSlice({
//   name: "orders",
//   initialState,
//   reducers: {
//     clearOrderError: (state) => {
//       state.error = null;
//     },
//     clearCurrentOrder: (state) => {
//       state.currentOrder = null;
//       state.currentPayments = [];
//       state.currentWorks = [];
//     },
//     clearCustomerOrders: (state, action) => {
//       const { customerId } = action.payload || {};
//       if (customerId) {
//         delete state.customerOrders[customerId];
//       } else {
//         state.customerOrders = {};
//       }
//     },
//     clearReadyToDelivery: (state) => {
//       state.readyToDelivery = {
//         orders: [],
//         count: 0,
//         loading: false
//       };
//     },
//     setPagination: (state, action) => {
//       state.pagination = { ...state.pagination, ...action.payload };
//     },
//     resetOrderState: () => initialState,
    
//     // ✅ Clear recent orders (useful when changing filters)
//     clearRecentOrders: (state) => {
//       state.recentOrders = [];
//     },
    
//     // ✅ Set current filter (for debugging)
//     setCurrentFilter: (state, action) => {
//       state.currentFilter = action.payload;
//     },
    
//     // ✅ Update stats manually (if needed)
//     updateStats: (state, action) => {
//       state.stats = { ...state.stats, ...action.payload };
//     },
    
//     // 📅 NEW: Calendar reducers
//     clearCalendarData: (state) => {
//       state.calendar = {
//         orderDates: [],
//         loading: false,
//         month: null,
//         year: null
//       };
//     },
//     setCalendarMonth: (state, action) => {
//       const { month, year } = action.payload;
//       state.calendar.month = month;
//       state.calendar.year = year;
//     }
//   },
//   extraReducers: (builder) => {
//     builder
//       // ===== FETCH STATS =====
//       .addCase(fetchOrderStats.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//         console.log('⏳ fetchOrderStats pending');
//       })
//       .addCase(fetchOrderStats.fulfilled, (state, action) => {
//         state.loading = false;
//         console.log('✅ fetchOrderStats fulfilled - payload:', action.payload);
        
//         // Merge with existing stats
//         state.stats = {
//           ...state.stats,
//           ...action.payload,
//           // Ensure all required fields exist
//           total: action.payload.total || 0,
//           pending: action.payload.pending || 0,
//           cutting: action.payload.cutting || 0,
//           stitching: action.payload.stitching || 0,
//           ready: action.payload.ready || 0,
//           delivered: action.payload.delivered || 0,
//           cancelled: action.payload.cancelled || 0,
//           draft: action.payload.draft || 0,
//           confirmed: action.payload.confirmed || 0,
//           'in-progress': action.payload['in-progress'] || 0,
//           'ready-to-delivery': action.payload['ready-to-delivery'] || 0,
//           today: action.payload.today || 0,
//           thisWeek: action.payload.thisWeek || 0,
//           thisMonth: action.payload.thisMonth || 0,
//           inProgress: action.payload.inProgress || action.payload.cutting || 0
//         };
        
//         console.log('📊 Updated stats in Redux:', state.stats);
//       })
//       .addCase(fetchOrderStats.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//         console.error('❌ fetchOrderStats rejected:', action.payload);
//       })

//       // ===== FETCH DASHBOARD =====
//       .addCase(fetchDashboardData.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchDashboardData.fulfilled, (state, action) => {
//         state.loading = false;
//         state.dashboard = {
//           ...state.dashboard,
//           ...action.payload
//         };
//       })
//       .addCase(fetchDashboardData.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== FETCH RECENT ORDERS (FIXED) =====
//       .addCase(fetchRecentOrders.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//         console.log('⏳ fetchRecentOrders pending');
//       })
//       .addCase(fetchRecentOrders.fulfilled, (state, action) => {
//         state.loading = false;
//         console.log('✅ fetchRecentOrders fulfilled - payload:', action.payload);
        
//         state.recentOrders = action.payload.orders || [];
//         state.currentFilter = action.payload.filter || null;
        
//         // Also update dashboard.recentOrders for backward compatibility
//         state.dashboard.recentOrders = action.payload.orders || [];
        
//         console.log('📋 Updated recentOrders in Redux:', state.recentOrders.length);
//       })
//       .addCase(fetchRecentOrders.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//         state.recentOrders = []; // Clear on error
//         console.error('❌ fetchRecentOrders rejected:', action.payload);
//       })

//       // ===== FETCH READY TO DELIVERY ORDERS =====
//       .addCase(fetchReadyToDeliveryOrders.pending, (state) => {
//         state.readyToDelivery.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchReadyToDeliveryOrders.fulfilled, (state, action) => {
//         state.readyToDelivery.loading = false;
//         state.readyToDelivery.orders = action.payload.orders || [];
//         state.readyToDelivery.count = action.payload.count || 0;
//       })
//       .addCase(fetchReadyToDeliveryOrders.rejected, (state, action) => {
//         state.readyToDelivery.loading = false;
//         state.error = action.payload;
//       })

//       // ===== CREATE ORDER =====
//       .addCase(createNewOrder.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//         state.success = false;
//       })
//       .addCase(createNewOrder.fulfilled, (state, action) => {
//         state.loading = false;
//         state.orders.unshift(action.payload);
//         state.recentOrders.unshift(action.payload); // ✅ Add to recent orders
//         state.success = true;
        
//         // Update stats (increment counts)
//         if (action.payload.status) {
//           const status = action.payload.status;
//           if (status === 'confirmed') state.stats.pending += 1;
//           else if (status === 'in-progress') {
//             state.stats.cutting += 1;
//             state.stats.stitching += 1;
//             state.stats.inProgress += 1;
//           }
//           else if (status === 'ready-to-delivery') state.stats.ready += 1;
//           else if (status === 'delivered') state.stats.delivered += 1;
//           else if (status === 'draft') state.stats.draft += 1;
//         }
//         state.stats.total += 1;
        
//         // Add to customerOrders if customer exists
//         if (action.payload.customer) {
//           const customerId = action.payload.customer._id || action.payload.customer;
//           if (!state.customerOrders[customerId]) {
//             state.customerOrders[customerId] = [];
//           }
//           state.customerOrders[customerId].unshift(action.payload);
//         }

//         // If order is ready-to-delivery, add to readyToDelivery list
//         if (action.payload.status === 'ready-to-delivery') {
//           state.readyToDelivery.orders.unshift(action.payload);
//           state.readyToDelivery.count += 1;
//         }
//       })
//       .addCase(createNewOrder.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//         state.success = false;
//       })

//       // ===== FETCH ALL ORDERS =====
//       .addCase(fetchOrders.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchOrders.fulfilled, (state, action) => {
//         state.loading = false;
//         state.orders = action.payload.orders || [];
//         state.pagination = action.payload.pagination || state.pagination;
//       })
//       .addCase(fetchOrders.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== FETCH ORDERS BY CUSTOMER =====
//       .addCase(fetchOrdersByCustomer.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchOrdersByCustomer.fulfilled, (state, action) => {
//         state.loading = false;
//         const { customerId, orders } = action.payload;
//         state.customerOrders[customerId] = orders || [];
//       })
//       .addCase(fetchOrdersByCustomer.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== FETCH ORDER BY ID =====
//       .addCase(fetchOrderById.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchOrderById.fulfilled, (state, action) => {
//         state.loading = false;
//         state.currentOrder = action.payload.order;
//         state.currentPayments = action.payload.payments || [];
//         state.currentWorks = action.payload.works || [];
//       })
//       .addCase(fetchOrderById.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== UPDATE ORDER =====
//       .addCase(updateExistingOrder.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(updateExistingOrder.fulfilled, (state, action) => {
//         state.loading = false;
//         const updatedOrder = action.payload;
        
//         // Update in main orders array
//         const index = state.orders.findIndex(o => o?._id === updatedOrder?._id);
//         if (index !== -1) {
//           state.orders[index] = updatedOrder;
//         }
        
//         // Update in recent orders
//         const recentIndex = state.recentOrders.findIndex(o => o?._id === updatedOrder?._id);
//         if (recentIndex !== -1) {
//           state.recentOrders[recentIndex] = updatedOrder;
//         }
        
//         // Update in customerOrders if customer exists
//         if (updatedOrder?.customer) {
//           const customerId = updatedOrder.customer._id || updatedOrder.customer;
//           if (state.customerOrders[customerId]) {
//             const custIndex = state.customerOrders[customerId].findIndex(o => o?._id === updatedOrder?._id);
//             if (custIndex !== -1) {
//               state.customerOrders[customerId][custIndex] = updatedOrder;
//             }
//           }
//         }
        
//         // Update in readyToDelivery list if needed
//         const readyIndex = state.readyToDelivery.orders.findIndex(o => o?._id === updatedOrder?._id);
//         if (updatedOrder?.status === 'ready-to-delivery') {
//           if (readyIndex === -1) {
//             state.readyToDelivery.orders.unshift(updatedOrder);
//             state.readyToDelivery.count += 1;
//           } else {
//             state.readyToDelivery.orders[readyIndex] = updatedOrder;
//           }
//         } else if (readyIndex !== -1) {
//           // If status changed from ready-to-delivery to something else, remove from list
//           state.readyToDelivery.orders.splice(readyIndex, 1);
//           state.readyToDelivery.count -= 1;
//         }
        
//         // Update currentOrder if it's the same
//         if (state.currentOrder?._id === updatedOrder?._id) {
//           state.currentOrder = updatedOrder;
//         }
//         state.success = true;
//       })
//       .addCase(updateExistingOrder.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== UPDATE ORDER STATUS =====
//       .addCase(updateOrderStatusThunk.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(updateOrderStatusThunk.fulfilled, (state, action) => {
//         state.loading = false;
//         const updatedOrder = action.payload;
        
//         // Update in main orders array
//         const index = state.orders.findIndex(o => o?._id === updatedOrder?._id);
//         if (index !== -1) {
//           state.orders[index] = updatedOrder;
//         }
        
//         // Update in recent orders
//         const recentIndex = state.recentOrders.findIndex(o => o?._id === updatedOrder?._id);
//         if (recentIndex !== -1) {
//           state.recentOrders[recentIndex] = updatedOrder;
//         }
        
//         // Update in customerOrders if customer exists
//         if (updatedOrder?.customer) {
//           const customerId = updatedOrder.customer._id || updatedOrder.customer;
//           if (state.customerOrders[customerId]) {
//             const custIndex = state.customerOrders[customerId].findIndex(o => o?._id === updatedOrder?._id);
//             if (custIndex !== -1) {
//               state.customerOrders[customerId][custIndex] = updatedOrder;
//             }
//           }
//         }
        
//         // Update in readyToDelivery list based on status
//         const readyIndex = state.readyToDelivery.orders.findIndex(o => o?._id === updatedOrder?._id);
//         if (updatedOrder?.status === 'ready-to-delivery') {
//           if (readyIndex === -1) {
//             state.readyToDelivery.orders.unshift(updatedOrder);
//             state.readyToDelivery.count += 1;
//           } else {
//             state.readyToDelivery.orders[readyIndex] = updatedOrder;
//           }
//         } else if (readyIndex !== -1) {
//           // If status changed from ready-to-delivery to something else
//           state.readyToDelivery.orders.splice(readyIndex, 1);
//           state.readyToDelivery.count -= 1;
//         }
        
//         // Update currentOrder if it's the same
//         if (state.currentOrder?._id === updatedOrder?._id) {
//           state.currentOrder = updatedOrder;
//         }
//       })
//       .addCase(updateOrderStatusThunk.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== DELETE ORDER =====
//       .addCase(deleteExistingOrder.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(deleteExistingOrder.fulfilled, (state, action) => {
//         state.loading = false;
//         const deletedId = action.payload;
        
//         // Remove from main orders array
//         state.orders = state.orders.filter(o => o?._id !== deletedId);
        
//         // Remove from recent orders
//         state.recentOrders = state.recentOrders.filter(o => o?._id !== deletedId);
        
//         // Remove from all customerOrders entries
//         Object.keys(state.customerOrders).forEach(customerId => {
//           state.customerOrders[customerId] = state.customerOrders[customerId].filter(
//             o => o?._id !== deletedId
//           );
//         });
        
//         // Remove from readyToDelivery list
//         const readyIndex = state.readyToDelivery.orders.findIndex(o => o?._id === deletedId);
//         if (readyIndex !== -1) {
//           state.readyToDelivery.orders.splice(readyIndex, 1);
//           state.readyToDelivery.count -= 1;
//         }
        
//         // Clear currentOrder if it's the deleted one
//         if (state.currentOrder?._id === deletedId) {
//           state.currentOrder = null;
//           state.currentPayments = [];
//           state.currentWorks = [];
//         }
        
//         // Update stats
//         state.stats.total = Math.max(0, state.stats.total - 1);
//         state.success = true;
//       })
//       .addCase(deleteExistingOrder.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== ADD PAYMENT =====
//       .addCase(addPayment.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(addPayment.fulfilled, (state, action) => {
//         state.loading = false;
//         const { orderId, payment, updatedOrder } = action.payload;
        
//         // Update currentOrder if it matches
//         if (state.currentOrder?._id === orderId) {
//           state.currentOrder = updatedOrder || state.currentOrder;
//           state.currentPayments.push(payment);
//         }
        
//         // Update in orders list
//         const orderIndex = state.orders.findIndex(o => o?._id === orderId);
//         if (orderIndex !== -1 && updatedOrder) {
//           state.orders[orderIndex] = updatedOrder;
//         }
        
//         // Update in recent orders
//         const recentIndex = state.recentOrders.findIndex(o => o?._id === orderId);
//         if (recentIndex !== -1 && updatedOrder) {
//           state.recentOrders[recentIndex] = updatedOrder;
//         }
        
//         state.success = true;
//       })
//       .addCase(addPayment.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== FETCH ORDER PAYMENTS =====
//       .addCase(fetchOrderPayments.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchOrderPayments.fulfilled, (state, action) => {
//         state.loading = false;
//         if (state.currentOrder?._id === action.payload.orderId) {
//           state.currentPayments = action.payload.payments || [];
//         }
//       })
//       .addCase(fetchOrderPayments.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== 🟢 FETCH ORDER DATES (SIMPLE) =====
//       .addCase(fetchOrderDates.pending, (state) => {
//         state.calendar.loading = true;
//         state.error = null;
//         console.log('⏳ fetchOrderDates pending');
//       })
//       .addCase(fetchOrderDates.fulfilled, (state, action) => {
//         state.calendar.loading = false;
//         console.log('✅ fetchOrderDates fulfilled - dates:', action.payload.dates);
        
//         state.calendar.orderDates = action.payload.dates || [];
//         state.calendar.month = action.payload.month;
//         state.calendar.year = action.payload.year;
//       })
//       .addCase(fetchOrderDates.rejected, (state, action) => {
//         state.calendar.loading = false;
//         state.error = action.payload;
//         state.calendar.orderDates = [];
//         console.error('❌ fetchOrderDates rejected:', action.payload);
//       });
//   }
// });

// // ============================================
// // 📤 EXPORT ACTIONS & REDUCER
// // ============================================
// export const { 
//   clearOrderError, 
//   clearCurrentOrder,
//   clearCustomerOrders,
//   clearReadyToDelivery,
//   clearRecentOrders,
//   setCurrentFilter,
//   setPagination, 
//   resetOrderState,
//   updateStats,
//   // 📅 NEW: Calendar actions
//   clearCalendarData,
//   setCalendarMonth
// } = orderSlice.actions;


// // ============================================
// // ✅ FIXED SELECTORS - Using 'order' (singular) to match store
// // ============================================

// // Helper to get order state (works with both 'order' and 'orders')
// const getOrderState = (state) => {
//   // Your store uses 'order' (singular)
//   return state.order || state.orders || {};
// };

// export const selectAllOrders = (state) => {
//   const orderState = getOrderState(state);
//   return orderState.orders || [];
// };

// export const selectRecentOrders = (state) => {
//   const orderState = getOrderState(state);
//   console.log('🔍 Selector - orderState:', orderState);
//   console.log('🔍 Selector - recentOrders:', orderState.recentOrders);
//   return orderState.recentOrders || [];
// };

// export const selectOrderStats = (state) => {
//   const orderState = getOrderState(state);
//   const stats = orderState.stats || {};
  
//   // Return with defaults to prevent undefined errors
//   return {
//     total: stats.total || 0,
//     pending: stats.pending || 0,
//     cutting: stats.cutting || 0,
//     stitching: stats.stitching || 0,
//     ready: stats.ready || 0,
//     delivered: stats.delivered || 0,
//     cancelled: stats.cancelled || 0,
//     draft: stats.draft || 0,
//     confirmed: stats.confirmed || 0,
//     'in-progress': stats['in-progress'] || 0,
//     'ready-to-delivery': stats['ready-to-delivery'] || 0,
//     today: stats.today || 0,
//     thisWeek: stats.thisWeek || 0,
//     thisMonth: stats.thisMonth || 0,
//     inProgress: stats.inProgress || stats.cutting || 0,
//     deliveries: stats.deliveries || {
//       today: 0,
//       tomorrow: 0,
//       late: 0,
//       total: 0
//     },
//     filterPeriod: stats.filterPeriod || 'month',
//     startDate: stats.startDate || null,
//     endDate: stats.endDate || null
//   };
// };

// export const selectCurrentOrder = (state) => {
//   const orderState = getOrderState(state);
//   return orderState.currentOrder || null;
// };

// export const selectOrderLoading = (state) => {
//   const orderState = getOrderState(state);
//   return orderState.loading || false;
// };

// export const selectOrderError = (state) => {
//   const orderState = getOrderState(state);
//   return orderState.error || null;
// };

// export const selectReadyToDelivery = (state) => {
//   const orderState = getOrderState(state);
//   return orderState.readyToDelivery || {
//     orders: [],
//     count: 0,
//     loading: false
//   };
// };

// export const selectOrdersByCustomer = (customerId) => (state) => {
//   const orderState = getOrderState(state);
//   return orderState.customerOrders?.[customerId] || [];
// };

// export const selectOrderPagination = (state) => {
//   const orderState = getOrderState(state);
//   return orderState.pagination || {
//     page: 1,
//     limit: 10,
//     total: 0,
//     pages: 1
//   };
// };

// export const selectDashboardData = (state) => {
//   const orderState = getOrderState(state);
//   return orderState.dashboard || {
//     todayOrders: { count: 0, orders: [] },
//     pendingDeliveries: { count: 0, orders: [] },
//     readyForDelivery: { count: 0, orders: [] },
//     recentOrders: [],
//     todayCollection: 0,
//     totalIncomeToday: 0,
//     incomeBreakdown: {
//       handCash: 0,
//       bank: 0
//     }
//   };
// };

// // ============================================
// // 🟢 NEW: ORDER DATES SELECTORS - For Calendar Green Dots
// // ============================================

// export const selectOrderDates = (state) => {
//   const orderState = getOrderState(state);
//   return orderState.calendar?.orderDates || [];
// };

// export const selectCalendarLoading = (state) => {
//   const orderState = getOrderState(state);
//   return orderState.calendar?.loading || false;
// };

// export const selectCalendarMonth = (state) => {
//   const orderState = getOrderState(state);
//   return {
//     month: orderState.calendar?.month,
//     year: orderState.calendar?.year
//   };
// };

// // ============================================
// // ✅ DEFAULT EXPORT
// // ============================================
// export default orderSlice.reducer;




// // frontend/src/features/orders/orderSlice.js - WITH DEBUG LOGS ADDED
// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import * as orderApi from "./orderApi";

// // ============================================
// // 🔄 ASYNC THUNKS
// // ============================================

// // Get order stats - WITH DATE FILTER SUPPORT ✅
// export const fetchOrderStats = createAsyncThunk(
//   "orders/fetchStats",
//   async (params = {}, { rejectWithValue }) => {
//     console.log("\n========== 📊 [Thunk] fetchOrderStats START ==========");
//     console.log("📊 [Thunk] Params received:", params);
    
//     try {
//       // params can be { period: 'month' } or { startDate, endDate }
//       console.log('📊 [Thunk] Fetching order stats with params:', params);
//       const response = await orderApi.getOrderStats(params);
//       console.log('📊 [Thunk] Raw API response:', response);
      
//       // Handle different response structures
//       let result;
//       if (response.data) {
//         result = response.data; // If response has data wrapper
//         console.log('📊 [Thunk] Using response.data');
//       } else if (response.stats) {
//         result = response.stats; // If response has stats wrapper
//         console.log('📊 [Thunk] Using response.stats');
//       } else {
//         result = response; // If response is directly the stats
//         console.log('📊 [Thunk] Using response directly');
//       }
      
//       console.log('📊 [Thunk] Result to return:', result);
//       console.log("========== ✅ [Thunk] fetchOrderStats END ==========\n");
//       return result;
//     } catch (error) {
//       console.error('❌ [Thunk] fetchOrderStats error:', error);
//       console.error('❌ [Thunk] Error response:', error.response?.data);
//       console.error('❌ [Thunk] Error status:', error.response?.status);
//       console.error("========== ❌ [Thunk] fetchOrderStats END ==========\n");
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch stats");
//     }
//   }
// );

// // Get dashboard data
// export const fetchDashboardData = createAsyncThunk(
//   "orders/fetchDashboard",
//   async (_, { rejectWithValue }) => {
//     console.log("\n========== 📊 [Thunk] fetchDashboardData START ==========");
    
//     try {
//       const response = await orderApi.getDashboardData();
//       console.log('📊 [Thunk] Dashboard response:', response);
      
//       const result = response.dashboard || response.data || response;
//       console.log('📊 [Thunk] Result to return:', result);
//       console.log("========== ✅ [Thunk] fetchDashboardData END ==========\n");
//       return result;
//     } catch (error) {
//       console.error('❌ [Thunk] fetchDashboardData error:', error);
//       console.error("========== ❌ [Thunk] fetchDashboardData END ==========\n");
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch dashboard");
//     }
//   }
// );

// // ✅ FIXED: fetchRecentOrders with date filter support
// export const fetchRecentOrders = createAsyncThunk(
//   "orders/fetchRecent",
//   async (params = {}, { rejectWithValue }) => {
//     console.log("\n========== 📋 [Thunk] fetchRecentOrders START ==========");
//     console.log('📋 [Thunk] Params received:', params);
    
//     try {
//       // params can include: { limit, startDate, endDate, period }
//       const { limit = 10, startDate, endDate, period } = params;
      
//       console.log('📋 [Thunk] Fetching recent orders with:', { limit, startDate, endDate, period });
      
//       const response = await orderApi.getRecentOrders({ 
//         limit, 
//         startDate, 
//         endDate, 
//         period 
//       });
      
//       console.log('📋 [Thunk] Raw API response:', response);
      
//       // Handle different response structures
//       let orders = [];
//       if (response.orders) {
//         orders = response.orders;
//         console.log('📋 [Thunk] Using response.orders');
//       } else if (response.data) {
//         orders = response.data;
//         console.log('📋 [Thunk] Using response.data');
//       } else if (Array.isArray(response)) {
//         orders = response;
//         console.log('📋 [Thunk] Using response as array');
//       }
      
//       console.log('📋 [Thunk] Orders found:', orders.length);
      
//       const result = {
//         orders: orders,
//         count: orders.length,
//         filter: params
//       };
      
//       console.log('📋 [Thunk] Result to return:', result);
//       console.log("========== ✅ [Thunk] fetchRecentOrders END ==========\n");
//       return result;
//     } catch (error) {
//       console.error('❌ [Thunk] fetchRecentOrders error:', error);
//       console.error('❌ [Thunk] Error response:', error.response?.data);
//       console.error('❌ [Thunk] Error status:', error.response?.status);
//       console.error("========== ❌ [Thunk] fetchRecentOrders END ==========\n");
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch recent orders");
//     }
//   }
// );

// // Get ready to delivery orders
// export const fetchReadyToDeliveryOrders = createAsyncThunk(
//   "orders/fetchReadyToDelivery",
//   async (params = {}, { rejectWithValue }) => {
//     console.log("\n========== 🚚 [Thunk] fetchReadyToDelivery START ==========");
//     console.log('🚚 [Thunk] Params:', params);
    
//     try {
//       const response = await orderApi.getReadyToDeliveryOrders(params);
//       console.log('🚚 [Thunk] Raw response:', response);
      
//       let orders = [];
//       if (response.orders) {
//         orders = response.orders;
//       } else if (response.data) {
//         orders = response.data;
//       } else if (Array.isArray(response)) {
//         orders = response;
//       }
      
//       const result = {
//         orders: orders,
//         count: orders.length
//       };
      
//       console.log('🚚 [Thunk] Ready orders:', orders.length);
//       console.log("========== ✅ [Thunk] fetchReadyToDelivery END ==========\n");
//       return result;
//     } catch (error) {
//       console.error('❌ [Thunk] fetchReadyToDelivery error:', error);
//       console.error("========== ❌ [Thunk] fetchReadyToDelivery END ==========\n");
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch ready to delivery orders");
//     }
//   }
// );

// // Create new order - WITH DEBUG LOGS
// export const createNewOrder = createAsyncThunk(
//   "orders/create",
//   async (orderData, { rejectWithValue }) => {
//     console.log("\n========== 🚀 [Thunk] createNewOrder START ==========");
//     console.log("📦 [Thunk] Order data received:", JSON.stringify(orderData, null, 2));
    
//     // Validate required fields
//     if (!orderData.customer) {
//       console.error("❌ [Thunk] Missing customer");
//       return rejectWithValue("Customer is required");
//     }
    
//     if (!orderData.garments || orderData.garments.length === 0) {
//       console.error("❌ [Thunk] No garments");
//       return rejectWithValue("At least one garment is required");
//     }
    
//     try {
//       console.log("📦 [Thunk] Calling orderApi.createOrder...");
//       const response = await orderApi.createOrder(orderData);
//       console.log("✅ [Thunk] createOrder response:", JSON.stringify(response, null, 2));
      
//       const result = response.order || response.data || response;
//       console.log("📦 [Thunk] Result to store:", result);
//       console.log("========== ✅ [Thunk] createNewOrder END ==========\n");
//       return result;
//     } catch (error) {
//       console.error("❌ [Thunk] createNewOrder error:", error);
//       console.error("❌ [Thunk] Error response:", error.response?.data);
//       console.error("❌ [Thunk] Error status:", error.response?.status);
//       console.error("========== ❌ [Thunk] createNewOrder END ==========\n");
//       return rejectWithValue(error.response?.data?.message || "Failed to create order");
//     }
//   }
// );

// // Get all orders - WITH FILTER SUPPORT ✅
// export const fetchOrders = createAsyncThunk(
//   "orders/fetchAll",
//   async (params = {}, { rejectWithValue }) => {
//     console.log("\n========== 📋 [Thunk] fetchOrders START ==========");
//     console.log('📋 [Thunk] Params:', params);
    
//     try {
//       // params can include: { page, limit, status, startDate, endDate, period }
//       const response = await orderApi.getAllOrders(params);
//       console.log('📋 [Thunk] Raw response:', response);
      
//       let orders = [];
//       let pagination = {
//         page: params.page || 1,
//         limit: params.limit || 10,
//         total: 0,
//         pages: 1
//       };
      
//       if (response.orders) {
//         orders = response.orders;
//         pagination = response.pagination || pagination;
//         console.log('📋 [Thunk] Using response.orders');
//       } else if (response.data) {
//         orders = response.data;
//         console.log('📋 [Thunk] Using response.data');
//       } else if (Array.isArray(response)) {
//         orders = response;
//         console.log('📋 [Thunk] Using response as array');
//       }
      
//       const result = {
//         orders: orders,
//         pagination: pagination
//       };
      
//       console.log('📋 [Thunk] Orders found:', orders.length);
//       console.log('📋 [Thunk] Pagination:', pagination);
//       console.log("========== ✅ [Thunk] fetchOrders END ==========\n");
//       return result;
//     } catch (error) {
//       console.error('❌ [Thunk] fetchOrders error:', error);
//       console.error("========== ❌ [Thunk] fetchOrders END ==========\n");
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch orders");
//     }
//   }
// );

// // Get orders by customer ID
// export const fetchOrdersByCustomer = createAsyncThunk(
//   "orders/fetchByCustomer",
//   async (customerId, { rejectWithValue }) => {
//     console.log("\n========== 👤 [Thunk] fetchOrdersByCustomer START ==========");
//     console.log('👤 [Thunk] Customer ID:', customerId);
    
//     try {
//       const response = await orderApi.getOrdersByCustomer(customerId);
//       console.log('👤 [Thunk] Raw response:', response);
      
//       let orders = [];
//       if (response.orders) {
//         orders = response.orders;
//       } else if (response.data) {
//         orders = response.data;
//       } else if (Array.isArray(response)) {
//         orders = response;
//       }
      
//       const result = {
//         customerId,
//         orders: orders
//       };
      
//       console.log('👤 [Thunk] Orders found:', orders.length);
//       console.log("========== ✅ [Thunk] fetchOrdersByCustomer END ==========\n");
//       return result;
//     } catch (error) {
//       console.error('❌ [Thunk] fetchOrdersByCustomer error:', error);
//       console.error("========== ❌ [Thunk] fetchOrdersByCustomer END ==========\n");
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch customer orders");
//     }
//   }
// );

// // Get single order
// export const fetchOrderById = createAsyncThunk(
//   "orders/fetchById",
//   async (id, { rejectWithValue }) => {
//     console.log("\n========== 🔍 [Thunk] fetchOrderById START ==========");
//     console.log('🔍 [Thunk] Order ID:', id);
    
//     try {
//       const response = await orderApi.getOrderById(id);
//       console.log('🔍 [Thunk] Raw response:', response);
      
//       const result = {
//         order: response.order || response.data || response,
//         payments: response.payments || [],
//         works: response.works || []
//       };
      
//       console.log('🔍 [Thunk] Order found:', result.order?._id);
//       console.log('🔍 [Thunk] Payments:', result.payments.length);
//       console.log('🔍 [Thunk] Works:', result.works.length);
//       console.log("========== ✅ [Thunk] fetchOrderById END ==========\n");
//       return result;
//     } catch (error) {
//       console.error('❌ [Thunk] fetchOrderById error:', error);
//       console.error("========== ❌ [Thunk] fetchOrderById END ==========\n");
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch order");
//     }
//   }
// );

// // Update order
// export const updateExistingOrder = createAsyncThunk(
//   "orders/update",
//   async ({ id, data }, { rejectWithValue }) => {
//     console.log("\n========== ✏️ [Thunk] updateExistingOrder START ==========");
//     console.log('✏️ [Thunk] Order ID:', id);
//     console.log('✏️ [Thunk] Update data:', data);
    
//     try {
//       const response = await orderApi.updateOrder(id, data);
//       console.log('✏️ [Thunk] Response:', response);
      
//       const result = response.order || response.data || response;
//       console.log('✏️ [Thunk] Updated order:', result);
//       console.log("========== ✅ [Thunk] updateExistingOrder END ==========\n");
//       return result;
//     } catch (error) {
//       console.error('❌ [Thunk] updateExistingOrder error:', error);
//       console.error("========== ❌ [Thunk] updateExistingOrder END ==========\n");
//       return rejectWithValue(error.response?.data?.message || "Failed to update order");
//     }
//   }
// );

// // Update order status
// export const updateOrderStatusThunk = createAsyncThunk(
//   "orders/updateStatus",
//   async ({ id, status }, { rejectWithValue }) => {
//     console.log("\n========== 🔄 [Thunk] updateOrderStatus START ==========");
//     console.log('🔄 [Thunk] Order ID:', id);
//     console.log('🔄 [Thunk] New status:', status);
    
//     try {
//       const response = await orderApi.updateOrderStatus(id, status);
//       console.log('🔄 [Thunk] Response:', response);
      
//       const result = response.order || response.data || response;
//       console.log('🔄 [Thunk] Updated order:', result);
//       console.log("========== ✅ [Thunk] updateOrderStatus END ==========\n");
//       return result;
//     } catch (error) {
//       console.error('❌ [Thunk] updateOrderStatus error:', error);
//       console.error("========== ❌ [Thunk] updateOrderStatus END ==========\n");
//       return rejectWithValue(error.response?.data?.message || "Failed to update status");
//     }
//   }
// );

// // Delete order
// export const deleteExistingOrder = createAsyncThunk(
//   "orders/delete",
//   async (id, { rejectWithValue }) => {
//     console.log("\n========== 🗑️ [Thunk] deleteExistingOrder START ==========");
//     console.log('🗑️ [Thunk] Order ID:', id);
    
//     try {
//       await orderApi.deleteOrder(id);
//       console.log('🗑️ [Thunk] Order deleted successfully');
//       console.log("========== ✅ [Thunk] deleteExistingOrder END ==========\n");
//       return id;
//     } catch (error) {
//       console.error('❌ [Thunk] deleteExistingOrder error:', error);
//       console.error("========== ❌ [Thunk] deleteExistingOrder END ==========\n");
//       return rejectWithValue(error.response?.data?.message || "Failed to delete order");
//     }
//   }
// );

// // Add payment to order
// export const addPayment = createAsyncThunk(
//   "orders/addPayment",
//   async ({ orderId, paymentData }, { rejectWithValue }) => {
//     console.log("\n========== 💰 [Thunk] addPayment START ==========");
//     console.log('💰 [Thunk] Order ID:', orderId);
//     console.log('💰 [Thunk] Payment data:', paymentData);
    
//     try {
//       const response = await orderApi.addPaymentToOrder(orderId, paymentData);
//       console.log('💰 [Thunk] Response:', response);
      
//       const result = {
//         orderId,
//         payment: response.payment || response.data,
//         updatedOrder: response.order || response
//       };
      
//       console.log('💰 [Thunk] Payment added:', result.payment);
//       console.log("========== ✅ [Thunk] addPayment END ==========\n");
//       return result;
//     } catch (error) {
//       console.error('❌ [Thunk] addPayment error:', error);
//       console.error("========== ❌ [Thunk] addPayment END ==========\n");
//       return rejectWithValue(error.response?.data?.message || "Failed to add payment");
//     }
//   }
// );

// // Get order payments
// export const fetchOrderPayments = createAsyncThunk(
//   "orders/fetchPayments",
//   async (orderId, { rejectWithValue }) => {
//     console.log("\n========== 💰 [Thunk] fetchOrderPayments START ==========");
//     console.log('💰 [Thunk] Order ID:', orderId);
    
//     try {
//       const response = await orderApi.getOrderPayments(orderId);
//       console.log('💰 [Thunk] Response:', response);
      
//       let payments = [];
//       if (response.payments) {
//         payments = response.payments;
//       } else if (response.data) {
//         payments = response.data;
//       } else if (Array.isArray(response)) {
//         payments = response;
//       }
      
//       const result = {
//         orderId,
//         payments: payments
//       };
      
//       console.log('💰 [Thunk] Payments found:', payments.length);
//       console.log("========== ✅ [Thunk] fetchOrderPayments END ==========\n");
//       return result;
//     } catch (error) {
//       console.error('❌ [Thunk] fetchOrderPayments error:', error);
//       console.error("========== ❌ [Thunk] fetchOrderPayments END ==========\n");
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch payments");
//     }
//   }
// );

// // ============================================
// // 🟢 NEW: Get dates that have orders (simple array for calendar green dots)
// // ============================================
// export const fetchOrderDates = createAsyncThunk(
//   "orders/fetchOrderDates",
//   async (params = {}, { rejectWithValue }) => {
//     console.log("\n========== 🟢 [Thunk] fetchOrderDates START ==========");
//     console.log('🟢 [Thunk] Params:', params);
    
//     try {
//       const { month, year } = params;
      
//       if (month === undefined || year === undefined) {
//         console.error('🟢 [Thunk] Missing month or year');
//         return rejectWithValue("Month and year are required");
//       }
      
//       console.log(`🟢 [Thunk] Fetching order dates for month: ${month}, year: ${year}`);
      
//       const response = await orderApi.getOrderDates({ month, year });
//       console.log('🟢 [Thunk] Response:', response);
      
//       const result = {
//         dates: response.dates || [],
//         month,
//         year
//       };
      
//       console.log('🟢 [Thunk] Dates found:', result.dates.length);
//       console.log('🟢 [Thunk] First few dates:', result.dates.slice(0, 5));
//       console.log("========== ✅ [Thunk] fetchOrderDates END ==========\n");
//       return result;
//     } catch (error) {
//       console.error('❌ [Thunk] fetchOrderDates error:', error);
//       console.error('❌ [Thunk] Error response:', error.response?.data);
//       console.error("========== ❌ [Thunk] fetchOrderDates END ==========\n");
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch order dates");
//     }
//   }
// );

// // ============================================
// // 📊 INITIAL STATE
// // ============================================
// const initialState = {
//   // Main orders list
//   orders: [],
//   recentOrders: [], // ✅ For dashboard
//   currentOrder: null,
//   currentPayments: [],
//   currentWorks: [],
  
//   // Customer-specific orders
//   customerOrders: {}, // Store orders by customer ID
  
//   // Ready to delivery orders
//   readyToDelivery: {
//     orders: [],
//     count: 0,
//     loading: false
//   },
  
//   // Statistics - MATCHES YOUR FRONTEND EXPECTATIONS
//   stats: {
//     total: 0,
//     pending: 0,
//     cutting: 0,
//     stitching: 0,
//     ready: 0,
//     delivered: 0,
//     cancelled: 0,
//     draft: 0,
//     confirmed: 0,
//     'in-progress': 0,
//     'ready-to-delivery': 0,
//     today: 0,
//     thisWeek: 0,
//     thisMonth: 0,
//     inProgress: 0,
//     deliveries: {
//       today: 0,
//       tomorrow: 0,
//       late: 0,
//       total: 0
//     },
//     filterPeriod: 'month',
//     startDate: null,
//     endDate: null
//   },
  
//   // Dashboard data
//   dashboard: {
//     todayOrders: { count: 0, orders: [] },
//     pendingDeliveries: { count: 0, orders: [] },
//     readyForDelivery: { count: 0, orders: [] },
//     recentOrders: [],
//     todayCollection: 0,
//     totalIncomeToday: 0,
//     incomeBreakdown: {
//       handCash: 0,
//       bank: 0
//     }
//   },
  
//   // Pagination
//   pagination: {
//     page: 1,
//     limit: 10,
//     total: 0,
//     pages: 1
//   },
  
//   // UI states
//   loading: false,
//   error: null,
//   success: false,
  
//   // Filter info (for debugging)
//   currentFilter: null,
  
//   // 📅 NEW: Calendar state for green dots
//   calendar: {
//     orderDates: [], // Array of dates with orders ["2026-03-19", "2026-03-23", "2026-03-29"]
//     loading: false,
//     month: null,
//     year: null
//   }
// };

// // ============================================
// // 🎯 ORDER SLICE
// // ============================================
// const orderSlice = createSlice({
//   name: "orders",
//   initialState,
//   reducers: {
//     clearOrderError: (state) => {
//       console.log('🧹 [Reducer] clearOrderError');
//       state.error = null;
//     },
//     clearCurrentOrder: (state) => {
//       console.log('🧹 [Reducer] clearCurrentOrder');
//       state.currentOrder = null;
//       state.currentPayments = [];
//       state.currentWorks = [];
//     },
//     clearCustomerOrders: (state, action) => {
//       const { customerId } = action.payload || {};
//       console.log('🧹 [Reducer] clearCustomerOrders for:', customerId || 'all');
//       if (customerId) {
//         delete state.customerOrders[customerId];
//       } else {
//         state.customerOrders = {};
//       }
//     },
//     clearReadyToDelivery: (state) => {
//       console.log('🧹 [Reducer] clearReadyToDelivery');
//       state.readyToDelivery = {
//         orders: [],
//         count: 0,
//         loading: false
//       };
//     },
//     setPagination: (state, action) => {
//       console.log('📄 [Reducer] setPagination:', action.payload);
//       state.pagination = { ...state.pagination, ...action.payload };
//     },
//     resetOrderState: () => {
//       console.log('🔄 [Reducer] resetOrderState');
//       return initialState;
//     },
    
//     // ✅ Clear recent orders (useful when changing filters)
//     clearRecentOrders: (state) => {
//       console.log('🧹 [Reducer] clearRecentOrders');
//       state.recentOrders = [];
//     },
    
//     // ✅ Set current filter (for debugging)
//     setCurrentFilter: (state, action) => {
//       console.log('🔍 [Reducer] setCurrentFilter:', action.payload);
//       state.currentFilter = action.payload;
//     },
    
//     // ✅ Update stats manually (if needed)
//     updateStats: (state, action) => {
//       console.log('📊 [Reducer] updateStats:', action.payload);
//       state.stats = { ...state.stats, ...action.payload };
//     },
    
//     // 📅 NEW: Calendar reducers
//     clearCalendarData: (state) => {
//       console.log('🧹 [Reducer] clearCalendarData');
//       state.calendar = {
//         orderDates: [],
//         loading: false,
//         month: null,
//         year: null
//       };
//     },
//     setCalendarMonth: (state, action) => {
//       const { month, year } = action.payload;
//       console.log('📅 [Reducer] setCalendarMonth:', { month, year });
//       state.calendar.month = month;
//       state.calendar.year = year;
//     }
//   },
//   extraReducers: (builder) => {
//     builder
//       // ===== FETCH STATS =====
//       .addCase(fetchOrderStats.pending, (state) => {
//         console.log('⏳ [Reducer] fetchOrderStats pending');
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchOrderStats.fulfilled, (state, action) => {
//         console.log('✅ [Reducer] fetchOrderStats fulfilled');
//         console.log('✅ [Reducer] Payload:', action.payload);
//         state.loading = false;
        
//         // Merge with existing stats
//         state.stats = {
//           ...state.stats,
//           ...action.payload,
//           // Ensure all required fields exist
//           total: action.payload.total || 0,
//           pending: action.payload.pending || 0,
//           cutting: action.payload.cutting || 0,
//           stitching: action.payload.stitching || 0,
//           ready: action.payload.ready || 0,
//           delivered: action.payload.delivered || 0,
//           cancelled: action.payload.cancelled || 0,
//           draft: action.payload.draft || 0,
//           confirmed: action.payload.confirmed || 0,
//           'in-progress': action.payload['in-progress'] || 0,
//           'ready-to-delivery': action.payload['ready-to-delivery'] || 0,
//           today: action.payload.today || 0,
//           thisWeek: action.payload.thisWeek || 0,
//           thisMonth: action.payload.thisMonth || 0,
//           inProgress: action.payload.inProgress || action.payload.cutting || 0
//         };
        
//         console.log('📊 [Reducer] Updated stats:', state.stats);
//       })
//       .addCase(fetchOrderStats.rejected, (state, action) => {
//         console.error('❌ [Reducer] fetchOrderStats rejected:', action.payload);
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== FETCH DASHBOARD =====
//       .addCase(fetchDashboardData.pending, (state) => {
//         console.log('⏳ [Reducer] fetchDashboardData pending');
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchDashboardData.fulfilled, (state, action) => {
//         console.log('✅ [Reducer] fetchDashboardData fulfilled:', action.payload);
//         state.loading = false;
//         state.dashboard = {
//           ...state.dashboard,
//           ...action.payload
//         };
//       })
//       .addCase(fetchDashboardData.rejected, (state, action) => {
//         console.error('❌ [Reducer] fetchDashboardData rejected:', action.payload);
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== FETCH RECENT ORDERS (FIXED) =====
//       .addCase(fetchRecentOrders.pending, (state) => {
//         console.log('⏳ [Reducer] fetchRecentOrders pending');
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchRecentOrders.fulfilled, (state, action) => {
//         console.log('✅ [Reducer] fetchRecentOrders fulfilled');
//         console.log('✅ [Reducer] Payload:', action.payload);
//         state.loading = false;
        
//         state.recentOrders = action.payload.orders || [];
//         state.currentFilter = action.payload.filter || null;
        
//         // Also update dashboard.recentOrders for backward compatibility
//         state.dashboard.recentOrders = action.payload.orders || [];
        
//         console.log('📋 [Reducer] Updated recentOrders count:', state.recentOrders.length);
//         if (state.recentOrders.length > 0) {
//           console.log('📋 [Reducer] First recent order:', state.recentOrders[0]);
//         }
//       })
//       .addCase(fetchRecentOrders.rejected, (state, action) => {
//         console.error('❌ [Reducer] fetchRecentOrders rejected:', action.payload);
//         state.loading = false;
//         state.error = action.payload;
//         state.recentOrders = []; // Clear on error
//       })

//       // ===== FETCH READY TO DELIVERY ORDERS =====
//       .addCase(fetchReadyToDeliveryOrders.pending, (state) => {
//         console.log('⏳ [Reducer] fetchReadyToDeliveryOrders pending');
//         state.readyToDelivery.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchReadyToDeliveryOrders.fulfilled, (state, action) => {
//         console.log('✅ [Reducer] fetchReadyToDeliveryOrders fulfilled:', action.payload);
//         state.readyToDelivery.loading = false;
//         state.readyToDelivery.orders = action.payload.orders || [];
//         state.readyToDelivery.count = action.payload.count || 0;
//       })
//       .addCase(fetchReadyToDeliveryOrders.rejected, (state, action) => {
//         console.error('❌ [Reducer] fetchReadyToDeliveryOrders rejected:', action.payload);
//         state.readyToDelivery.loading = false;
//         state.error = action.payload;
//       })

//       // ===== CREATE ORDER =====
//       .addCase(createNewOrder.pending, (state) => {
//         console.log('⏳ [Reducer] createNewOrder pending');
//         state.loading = true;
//         state.error = null;
//         state.success = false;
//       })
//       .addCase(createNewOrder.fulfilled, (state, action) => {
//         console.log('✅ [Reducer] createNewOrder fulfilled');
//         console.log('✅ [Reducer] New order:', action.payload);
//         state.loading = false;
//         state.orders.unshift(action.payload);
//         state.recentOrders.unshift(action.payload); // ✅ Add to recent orders
//         state.success = true;
        
//         // Update stats (increment counts)
//         if (action.payload.status) {
//           const status = action.payload.status;
//           if (status === 'confirmed') state.stats.pending += 1;
//           else if (status === 'in-progress') {
//             state.stats.cutting += 1;
//             state.stats.stitching += 1;
//             state.stats.inProgress += 1;
//           }
//           else if (status === 'ready-to-delivery') state.stats.ready += 1;
//           else if (status === 'delivered') state.stats.delivered += 1;
//           else if (status === 'draft') state.stats.draft += 1;
//         }
//         state.stats.total += 1;
        
//         // Add to customerOrders if customer exists
//         if (action.payload.customer) {
//           const customerId = action.payload.customer._id || action.payload.customer;
//           if (!state.customerOrders[customerId]) {
//             state.customerOrders[customerId] = [];
//           }
//           state.customerOrders[customerId].unshift(action.payload);
//         }

//         // If order is ready-to-delivery, add to readyToDelivery list
//         if (action.payload.status === 'ready-to-delivery') {
//           state.readyToDelivery.orders.unshift(action.payload);
//           state.readyToDelivery.count += 1;
//         }
        
//         console.log('📊 [Reducer] Updated stats after create:', state.stats);
//       })
//       .addCase(createNewOrder.rejected, (state, action) => {
//         console.error('❌ [Reducer] createNewOrder rejected:', action.payload);
//         state.loading = false;
//         state.error = action.payload;
//         state.success = false;
//       })

//       // ===== FETCH ALL ORDERS =====
//       .addCase(fetchOrders.pending, (state) => {
//         console.log('⏳ [Reducer] fetchOrders pending');
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchOrders.fulfilled, (state, action) => {
//         console.log('✅ [Reducer] fetchOrders fulfilled');
//         console.log('✅ [Reducer] Orders count:', action.payload.orders?.length);
//         state.loading = false;
//         state.orders = action.payload.orders || [];
//         state.pagination = action.payload.pagination || state.pagination;
//       })
//       .addCase(fetchOrders.rejected, (state, action) => {
//         console.error('❌ [Reducer] fetchOrders rejected:', action.payload);
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== FETCH ORDERS BY CUSTOMER =====
//       .addCase(fetchOrdersByCustomer.pending, (state) => {
//         console.log('⏳ [Reducer] fetchOrdersByCustomer pending');
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchOrdersByCustomer.fulfilled, (state, action) => {
//         console.log('✅ [Reducer] fetchOrdersByCustomer fulfilled for customer:', action.payload.customerId);
//         console.log('✅ [Reducer] Orders found:', action.payload.orders?.length);
//         state.loading = false;
//         const { customerId, orders } = action.payload;
//         state.customerOrders[customerId] = orders || [];
//       })
//       .addCase(fetchOrdersByCustomer.rejected, (state, action) => {
//         console.error('❌ [Reducer] fetchOrdersByCustomer rejected:', action.payload);
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== FETCH ORDER BY ID =====
//       .addCase(fetchOrderById.pending, (state) => {
//         console.log('⏳ [Reducer] fetchOrderById pending');
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchOrderById.fulfilled, (state, action) => {
//         console.log('✅ [Reducer] fetchOrderById fulfilled for order:', action.payload.order?._id);
//         console.log('✅ [Reducer] Payments:', action.payload.payments?.length);
//         console.log('✅ [Reducer] Works:', action.payload.works?.length);
//         state.loading = false;
//         state.currentOrder = action.payload.order;
//         state.currentPayments = action.payload.payments || [];
//         state.currentWorks = action.payload.works || [];
//       })
//       .addCase(fetchOrderById.rejected, (state, action) => {
//         console.error('❌ [Reducer] fetchOrderById rejected:', action.payload);
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== UPDATE ORDER =====
//       .addCase(updateExistingOrder.pending, (state) => {
//         console.log('⏳ [Reducer] updateExistingOrder pending');
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(updateExistingOrder.fulfilled, (state, action) => {
//         console.log('✅ [Reducer] updateExistingOrder fulfilled');
//         console.log('✅ [Reducer] Updated order:', action.payload?._id);
//         state.loading = false;
//         const updatedOrder = action.payload;
        
//         // Update in main orders array
//         const index = state.orders.findIndex(o => o?._id === updatedOrder?._id);
//         if (index !== -1) {
//           state.orders[index] = updatedOrder;
//           console.log('✅ [Reducer] Updated in main orders');
//         }
        
//         // Update in recent orders
//         const recentIndex = state.recentOrders.findIndex(o => o?._id === updatedOrder?._id);
//         if (recentIndex !== -1) {
//           state.recentOrders[recentIndex] = updatedOrder;
//           console.log('✅ [Reducer] Updated in recent orders');
//         }
        
//         // Update in customerOrders if customer exists
//         if (updatedOrder?.customer) {
//           const customerId = updatedOrder.customer._id || updatedOrder.customer;
//           if (state.customerOrders[customerId]) {
//             const custIndex = state.customerOrders[customerId].findIndex(o => o?._id === updatedOrder?._id);
//             if (custIndex !== -1) {
//               state.customerOrders[customerId][custIndex] = updatedOrder;
//               console.log('✅ [Reducer] Updated in customer orders');
//             }
//           }
//         }
        
//         // Update in readyToDelivery list if needed
//         const readyIndex = state.readyToDelivery.orders.findIndex(o => o?._id === updatedOrder?._id);
//         if (updatedOrder?.status === 'ready-to-delivery') {
//           if (readyIndex === -1) {
//             state.readyToDelivery.orders.unshift(updatedOrder);
//             state.readyToDelivery.count += 1;
//             console.log('✅ [Reducer] Added to readyToDelivery');
//           } else {
//             state.readyToDelivery.orders[readyIndex] = updatedOrder;
//             console.log('✅ [Reducer] Updated in readyToDelivery');
//           }
//         } else if (readyIndex !== -1) {
//           // If status changed from ready-to-delivery to something else, remove from list
//           state.readyToDelivery.orders.splice(readyIndex, 1);
//           state.readyToDelivery.count -= 1;
//           console.log('✅ [Reducer] Removed from readyToDelivery');
//         }
        
//         // Update currentOrder if it's the same
//         if (state.currentOrder?._id === updatedOrder?._id) {
//           state.currentOrder = updatedOrder;
//           console.log('✅ [Reducer] Updated currentOrder');
//         }
//         state.success = true;
//       })
//       .addCase(updateExistingOrder.rejected, (state, action) => {
//         console.error('❌ [Reducer] updateExistingOrder rejected:', action.payload);
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== UPDATE ORDER STATUS =====
//       .addCase(updateOrderStatusThunk.pending, (state) => {
//         console.log('⏳ [Reducer] updateOrderStatusThunk pending');
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(updateOrderStatusThunk.fulfilled, (state, action) => {
//         console.log('✅ [Reducer] updateOrderStatusThunk fulfilled');
//         console.log('✅ [Reducer] Updated order status:', action.payload?.status);
//         state.loading = false;
//         const updatedOrder = action.payload;
        
//         // Update in main orders array
//         const index = state.orders.findIndex(o => o?._id === updatedOrder?._id);
//         if (index !== -1) {
//           state.orders[index] = updatedOrder;
//         }
        
//         // Update in recent orders
//         const recentIndex = state.recentOrders.findIndex(o => o?._id === updatedOrder?._id);
//         if (recentIndex !== -1) {
//           state.recentOrders[recentIndex] = updatedOrder;
//         }
        
//         // Update in customerOrders if customer exists
//         if (updatedOrder?.customer) {
//           const customerId = updatedOrder.customer._id || updatedOrder.customer;
//           if (state.customerOrders[customerId]) {
//             const custIndex = state.customerOrders[customerId].findIndex(o => o?._id === updatedOrder?._id);
//             if (custIndex !== -1) {
//               state.customerOrders[customerId][custIndex] = updatedOrder;
//             }
//           }
//         }
        
//         // Update in readyToDelivery list based on status
//         const readyIndex = state.readyToDelivery.orders.findIndex(o => o?._id === updatedOrder?._id);
//         if (updatedOrder?.status === 'ready-to-delivery') {
//           if (readyIndex === -1) {
//             state.readyToDelivery.orders.unshift(updatedOrder);
//             state.readyToDelivery.count += 1;
//           } else {
//             state.readyToDelivery.orders[readyIndex] = updatedOrder;
//           }
//         } else if (readyIndex !== -1) {
//           // If status changed from ready-to-delivery to something else
//           state.readyToDelivery.orders.splice(readyIndex, 1);
//           state.readyToDelivery.count -= 1;
//         }
        
//         // Update currentOrder if it's the same
//         if (state.currentOrder?._id === updatedOrder?._id) {
//           state.currentOrder = updatedOrder;
//         }
        
//         console.log('✅ [Reducer] Status update complete');
//       })
//       .addCase(updateOrderStatusThunk.rejected, (state, action) => {
//         console.error('❌ [Reducer] updateOrderStatusThunk rejected:', action.payload);
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== DELETE ORDER =====
//       .addCase(deleteExistingOrder.pending, (state) => {
//         console.log('⏳ [Reducer] deleteExistingOrder pending');
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(deleteExistingOrder.fulfilled, (state, action) => {
//         console.log('✅ [Reducer] deleteExistingOrder fulfilled for ID:', action.payload);
//         state.loading = false;
//         const deletedId = action.payload;
        
//         // Remove from main orders array
//         const beforeCount = state.orders.length;
//         state.orders = state.orders.filter(o => o?._id !== deletedId);
//         console.log('✅ [Reducer] Removed from orders:', beforeCount - state.orders.length);
        
//         // Remove from recent orders
//         state.recentOrders = state.recentOrders.filter(o => o?._id !== deletedId);
        
//         // Remove from all customerOrders entries
//         Object.keys(state.customerOrders).forEach(customerId => {
//           state.customerOrders[customerId] = state.customerOrders[customerId].filter(
//             o => o?._id !== deletedId
//           );
//         });
        
//         // Remove from readyToDelivery list
//         const readyIndex = state.readyToDelivery.orders.findIndex(o => o?._id === deletedId);
//         if (readyIndex !== -1) {
//           state.readyToDelivery.orders.splice(readyIndex, 1);
//           state.readyToDelivery.count -= 1;
//         }
        
//         // Clear currentOrder if it's the deleted one
//         if (state.currentOrder?._id === deletedId) {
//           state.currentOrder = null;
//           state.currentPayments = [];
//           state.currentWorks = [];
//         }
        
//         // Update stats
//         state.stats.total = Math.max(0, state.stats.total - 1);
//         state.success = true;
//       })
//       .addCase(deleteExistingOrder.rejected, (state, action) => {
//         console.error('❌ [Reducer] deleteExistingOrder rejected:', action.payload);
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== ADD PAYMENT =====
//       .addCase(addPayment.pending, (state) => {
//         console.log('⏳ [Reducer] addPayment pending');
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(addPayment.fulfilled, (state, action) => {
//         console.log('✅ [Reducer] addPayment fulfilled');
//         console.log('✅ [Reducer] Payment:', action.payload.payment);
//         state.loading = false;
//         const { orderId, payment, updatedOrder } = action.payload;
        
//         // Update currentOrder if it matches
//         if (state.currentOrder?._id === orderId) {
//           state.currentOrder = updatedOrder || state.currentOrder;
//           state.currentPayments.push(payment);
//           console.log('✅ [Reducer] Updated currentOrder with payment');
//         }
        
//         // Update in orders list
//         const orderIndex = state.orders.findIndex(o => o?._id === orderId);
//         if (orderIndex !== -1 && updatedOrder) {
//           state.orders[orderIndex] = updatedOrder;
//         }
        
//         // Update in recent orders
//         const recentIndex = state.recentOrders.findIndex(o => o?._id === orderId);
//         if (recentIndex !== -1 && updatedOrder) {
//           state.recentOrders[recentIndex] = updatedOrder;
//         }
        
//         state.success = true;
//       })
//       .addCase(addPayment.rejected, (state, action) => {
//         console.error('❌ [Reducer] addPayment rejected:', action.payload);
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== FETCH ORDER PAYMENTS =====
//       .addCase(fetchOrderPayments.pending, (state) => {
//         console.log('⏳ [Reducer] fetchOrderPayments pending');
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchOrderPayments.fulfilled, (state, action) => {
//         console.log('✅ [Reducer] fetchOrderPayments fulfilled for order:', action.payload.orderId);
//         console.log('✅ [Reducer] Payments found:', action.payload.payments?.length);
//         state.loading = false;
//         if (state.currentOrder?._id === action.payload.orderId) {
//           state.currentPayments = action.payload.payments || [];
//         }
//       })
//       .addCase(fetchOrderPayments.rejected, (state, action) => {
//         console.error('❌ [Reducer] fetchOrderPayments rejected:', action.payload);
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== 🟢 FETCH ORDER DATES (SIMPLE) =====
//       .addCase(fetchOrderDates.pending, (state) => {
//         console.log('⏳ [Reducer] fetchOrderDates pending');
//         state.calendar.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchOrderDates.fulfilled, (state, action) => {
//         console.log('✅ [Reducer] fetchOrderDates fulfilled');
//         console.log('✅ [Reducer] Dates received:', action.payload.dates?.length);
//         console.log('✅ [Reducer] First few dates:', action.payload.dates?.slice(0, 5));
//         state.calendar.loading = false;
//         state.calendar.orderDates = action.payload.dates || [];
//         state.calendar.month = action.payload.month;
//         state.calendar.year = action.payload.year;
//       })
//       .addCase(fetchOrderDates.rejected, (state, action) => {
//         console.error('❌ [Reducer] fetchOrderDates rejected:', action.payload);
//         state.calendar.loading = false;
//         state.error = action.payload;
//         state.calendar.orderDates = [];
//       });
//   }
// });

// // ============================================
// // 📤 EXPORT ACTIONS & REDUCER
// // ============================================
// export const { 
//   clearOrderError, 
//   clearCurrentOrder,
//   clearCustomerOrders,
//   clearReadyToDelivery,
//   clearRecentOrders,
//   setCurrentFilter,
//   setPagination, 
//   resetOrderState,
//   updateStats,
//   // 📅 NEW: Calendar actions
//   clearCalendarData,
//   setCalendarMonth
// } = orderSlice.actions;


// // ============================================
// // ✅ FIXED SELECTORS - Using 'order' (singular) to match store
// // ============================================

// // Helper to get order state (works with both 'order' and 'orders')
// const getOrderState = (state) => {
//   // Your store uses 'order' (singular)
//   const orderState = state.order || state.orders || {};
//   console.log('🔍 [Selector] getOrderState:', { 
//     hasOrder: !!state.order, 
//     hasOrders: !!state.orders,
//     recentOrdersCount: orderState.recentOrders?.length 
//   });
//   return orderState;
// };

// export const selectAllOrders = (state) => {
//   const orderState = getOrderState(state);
//   const orders = orderState.orders || [];
//   console.log('🔍 [Selector] selectAllOrders:', orders.length);
//   return orders;
// };

// export const selectRecentOrders = (state) => {
//   const orderState = getOrderState(state);
//   console.log('🔍 [Selector] selectRecentOrders - orderState:', {
//     recentOrders: orderState.recentOrders,
//     length: orderState.recentOrders?.length
//   });
//   return orderState.recentOrders || [];
// };

// export const selectOrderStats = (state) => {
//   const orderState = getOrderState(state);
//   const stats = orderState.stats || {};
  
//   console.log('🔍 [Selector] selectOrderStats:', stats);
  
//   // Return with defaults to prevent undefined errors
//   return {
//     total: stats.total || 0,
//     pending: stats.pending || 0,
//     cutting: stats.cutting || 0,
//     stitching: stats.stitching || 0,
//     ready: stats.ready || 0,
//     delivered: stats.delivered || 0,
//     cancelled: stats.cancelled || 0,
//     draft: stats.draft || 0,
//     confirmed: stats.confirmed || 0,
//     'in-progress': stats['in-progress'] || 0,
//     'ready-to-delivery': stats['ready-to-delivery'] || 0,
//     today: stats.today || 0,
//     thisWeek: stats.thisWeek || 0,
//     thisMonth: stats.thisMonth || 0,
//     inProgress: stats.inProgress || stats.cutting || 0,
//     deliveries: stats.deliveries || {
//       today: 0,
//       tomorrow: 0,
//       late: 0,
//       total: 0
//     },
//     filterPeriod: stats.filterPeriod || 'month',
//     startDate: stats.startDate || null,
//     endDate: stats.endDate || null
//   };
// };

// export const selectCurrentOrder = (state) => {
//   const orderState = getOrderState(state);
//   console.log('🔍 [Selector] selectCurrentOrder:', orderState.currentOrder?._id);
//   return orderState.currentOrder || null;
// };

// export const selectOrderLoading = (state) => {
//   const orderState = getOrderState(state);
//   console.log('🔍 [Selector] selectOrderLoading:', orderState.loading);
//   return orderState.loading || false;
// };

// export const selectOrderError = (state) => {
//   const orderState = getOrderState(state);
//   console.log('🔍 [Selector] selectOrderError:', orderState.error);
//   return orderState.error || null;
// };

// export const selectReadyToDelivery = (state) => {
//   const orderState = getOrderState(state);
//   const ready = orderState.readyToDelivery || {
//     orders: [],
//     count: 0,
//     loading: false
//   };
//   console.log('🔍 [Selector] selectReadyToDelivery count:', ready.count);
//   return ready;
// };

// export const selectOrdersByCustomer = (customerId) => (state) => {
//   const orderState = getOrderState(state);
//   const orders = orderState.customerOrders?.[customerId] || [];
//   console.log(`🔍 [Selector] selectOrdersByCustomer for ${customerId}:`, orders.length);
//   return orders;
// };

// export const selectOrderPagination = (state) => {
//   const orderState = getOrderState(state);
//   const pagination = orderState.pagination || {
//     page: 1,
//     limit: 10,
//     total: 0,
//     pages: 1
//   };
//   console.log('🔍 [Selector] selectOrderPagination:', pagination);
//   return pagination;
// };

// export const selectDashboardData = (state) => {
//   const orderState = getOrderState(state);
//   const dashboard = orderState.dashboard || {
//     todayOrders: { count: 0, orders: [] },
//     pendingDeliveries: { count: 0, orders: [] },
//     readyForDelivery: { count: 0, orders: [] },
//     recentOrders: [],
//     todayCollection: 0,
//     totalIncomeToday: 0,
//     incomeBreakdown: {
//       handCash: 0,
//       bank: 0
//     }
//   };
//   console.log('🔍 [Selector] selectDashboardData - todayCollection:', dashboard.todayCollection);
//   return dashboard;
// };

// // ============================================
// // 🟢 NEW: ORDER DATES SELECTORS - For Calendar Green Dots
// // ============================================

// export const selectOrderDates = (state) => {
//   const orderState = getOrderState(state);
//   const dates = orderState.calendar?.orderDates || [];
//   console.log('🔍 [Selector] selectOrderDates:', dates.length);
//   return dates;
// };

// export const selectCalendarLoading = (state) => {
//   const orderState = getOrderState(state);
//   const loading = orderState.calendar?.loading || false;
//   console.log('🔍 [Selector] selectCalendarLoading:', loading);
//   return loading;
// };

// export const selectCalendarMonth = (state) => {
//   const orderState = getOrderState(state);
//   const monthInfo = {
//     month: orderState.calendar?.month,
//     year: orderState.calendar?.year
//   };
//   console.log('🔍 [Selector] selectCalendarMonth:', monthInfo);
//   return monthInfo;
// };

// // ============================================
// // ✅ DEFAULT EXPORT
// // ============================================
// export default orderSlice.reducer;




// // frontend/src/features/orders/orderSlice.js - COMPLETE FIXED VERSION WITH DUPLICATE PREVENTION
// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import * as orderApi from "./orderApi";

// // ============================================
// // 🔄 ASYNC THUNKS
// // ============================================

// // Get order stats - WITH DATE FILTER SUPPORT ✅
// export const fetchOrderStats = createAsyncThunk(
//   "orders/fetchStats",
//   async (params = {}, { rejectWithValue }) => {
//     console.log("\n========== 📊 [Thunk] fetchOrderStats START ==========");
//     console.log("📊 [Thunk] Params received:", params);
    
//     try {
//       // params can be { period: 'month' } or { startDate, endDate }
//       console.log('📊 [Thunk] Fetching order stats with params:', params);
//       const response = await orderApi.getOrderStats(params);
//       console.log('📊 [Thunk] Raw API response:', response);
      
//       // Handle different response structures
//       let result;
//       if (response.data) {
//         result = response.data; // If response has data wrapper
//         console.log('📊 [Thunk] Using response.data');
//       } else if (response.stats) {
//         result = response.stats; // If response has stats wrapper
//         console.log('📊 [Thunk] Using response.stats');
//       } else {
//         result = response; // If response is directly the stats
//         console.log('📊 [Thunk] Using response directly');
//       }
      
//       console.log('📊 [Thunk] Result to return:', result);
//       console.log("========== ✅ [Thunk] fetchOrderStats END ==========\n");
//       return result;
//     } catch (error) {
//       console.error('❌ [Thunk] fetchOrderStats error:', error);
//       console.error('❌ [Thunk] Error response:', error.response?.data);
//       console.error('❌ [Thunk] Error status:', error.response?.status);
//       console.error("========== ❌ [Thunk] fetchOrderStats END ==========\n");
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch stats");
//     }
//   }
// );

// // Get dashboard data
// export const fetchDashboardData = createAsyncThunk(
//   "orders/fetchDashboard",
//   async (_, { rejectWithValue }) => {
//     console.log("\n========== 📊 [Thunk] fetchDashboardData START ==========");
    
//     try {
//       const response = await orderApi.getDashboardData();
//       console.log('📊 [Thunk] Dashboard response:', response);
      
//       const result = response.dashboard || response.data || response;
//       console.log('📊 [Thunk] Result to return:', result);
//       console.log("========== ✅ [Thunk] fetchDashboardData END ==========\n");
//       return result;
//     } catch (error) {
//       console.error('❌ [Thunk] fetchDashboardData error:', error);
//       console.error("========== ❌ [Thunk] fetchDashboardData END ==========\n");
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch dashboard");
//     }
//   }
// );

// // ✅ FIXED: fetchRecentOrders with date filter support
// export const fetchRecentOrders = createAsyncThunk(
//   "orders/fetchRecent",
//   async (params = {}, { rejectWithValue }) => {
//     console.log("\n========== 📋 [Thunk] fetchRecentOrders START ==========");
//     console.log('📋 [Thunk] Params received:', params);
    
//     try {
//       // params can include: { limit, startDate, endDate, period }
//       const { limit = 10, startDate, endDate, period } = params;
      
//       console.log('📋 [Thunk] Fetching recent orders with:', { limit, startDate, endDate, period });
      
//       const response = await orderApi.getRecentOrders({ 
//         limit, 
//         startDate, 
//         endDate, 
//         period 
//       });
      
//       console.log('📋 [Thunk] Raw API response:', response);
      
//       // Handle different response structures
//       let orders = [];
//       if (response.orders) {
//         orders = response.orders;
//         console.log('📋 [Thunk] Using response.orders');
//       } else if (response.data) {
//         orders = response.data;
//         console.log('📋 [Thunk] Using response.data');
//       } else if (Array.isArray(response)) {
//         orders = response;
//         console.log('📋 [Thunk] Using response as array');
//       }
      
//       console.log('📋 [Thunk] Orders found:', orders.length);
      
//       const result = {
//         orders: orders,
//         count: orders.length,
//         filter: params
//       };
      
//       console.log('📋 [Thunk] Result to return:', result);
//       console.log("========== ✅ [Thunk] fetchRecentOrders END ==========\n");
//       return result;
//     } catch (error) {
//       console.error('❌ [Thunk] fetchRecentOrders error:', error);
//       console.error('❌ [Thunk] Error response:', error.response?.data);
//       console.error('❌ [Thunk] Error status:', error.response?.status);
//       console.error("========== ❌ [Thunk] fetchRecentOrders END ==========\n");
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch recent orders");
//     }
//   }
// );

// // Get ready to delivery orders
// export const fetchReadyToDeliveryOrders = createAsyncThunk(
//   "orders/fetchReadyToDelivery",
//   async (params = {}, { rejectWithValue }) => {
//     console.log("\n========== 🚚 [Thunk] fetchReadyToDelivery START ==========");
//     console.log('🚚 [Thunk] Params:', params);
    
//     try {
//       const response = await orderApi.getReadyToDeliveryOrders(params);
//       console.log('🚚 [Thunk] Raw response:', response);
      
//       let orders = [];
//       if (response.orders) {
//         orders = response.orders;
//       } else if (response.data) {
//         orders = response.data;
//       } else if (Array.isArray(response)) {
//         orders = response;
//       }
      
//       const result = {
//         orders: orders,
//         count: orders.length
//       };
      
//       console.log('🚚 [Thunk] Ready orders:', orders.length);
//       console.log("========== ✅ [Thunk] fetchReadyToDelivery END ==========\n");
//       return result;
//     } catch (error) {
//       console.error('❌ [Thunk] fetchReadyToDelivery error:', error);
//       console.error("========== ❌ [Thunk] fetchReadyToDelivery END ==========\n");
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch ready to delivery orders");
//     }
//   }
// );

// // 🔥 FIXED: Create new order - WITH DUPLICATE PREVENTION
// export const createNewOrder = createAsyncThunk(
//   "orders/create",
//   async (orderData, { rejectWithValue, getState }) => {
//     console.log("\n========== 🚀 [Thunk] createNewOrder START ==========");
//     console.log("📦 [Thunk] Order data received:", JSON.stringify(orderData, null, 2));
    
//     // Check if this requestId already exists in state (prevent duplicate)
//     if (orderData.requestId) {
//       const state = getState();
//       const existingOrder = state.order?.orders?.find(o => o.metadata?.requestId === orderData.requestId);
//       if (existingOrder) {
//         console.log("⚠️ [Thunk] Duplicate request detected, returning existing order");
//         return existingOrder;
//       }
//     }
    
//     // Validate required fields
//     if (!orderData.customer) {
//       console.error("❌ [Thunk] Missing customer");
//       return rejectWithValue("Customer is required");
//     }
    
//     if (!orderData.garments || orderData.garments.length === 0) {
//       console.error("❌ [Thunk] No garments");
//       return rejectWithValue("At least one garment is required");
//     }
    
//     try {
//       console.log("📦 [Thunk] Calling orderApi.createOrder...");
//       const response = await orderApi.createOrder(orderData);
//       console.log("✅ [Thunk] createOrder response:", JSON.stringify(response, null, 2));
      
//       // Handle different response structures
//       const result = response.order || response.data || response;
      
//       // Validate response has ID
//       if (!result._id && !result.id) {
//         console.error("❌ [Thunk] Invalid response - missing order ID");
//         return rejectWithValue("Invalid response from server");
//       }
      
//       console.log("📦 [Thunk] Result to store:", result);
//       console.log("========== ✅ [Thunk] createNewOrder END ==========\n");
//       return result;
//     } catch (error) {
//       console.error("❌ [Thunk] createNewOrder error:", error);
//       console.error("❌ [Thunk] Error response:", error.response?.data);
//       console.error("❌ [Thunk] Error status:", error.response?.status);
//       console.error("========== ❌ [Thunk] createNewOrder END ==========\n");
//       return rejectWithValue(error.response?.data?.message || error.message || "Failed to create order");
//     }
//   }
// );

// // Get all orders - WITH FILTER SUPPORT ✅
// export const fetchOrders = createAsyncThunk(
//   "orders/fetchAll",
//   async (params = {}, { rejectWithValue }) => {
//     console.log("\n========== 📋 [Thunk] fetchOrders START ==========");
//     console.log('📋 [Thunk] Params:', params);
    
//     try {
//       // params can include: { page, limit, status, startDate, endDate, period }
//       const response = await orderApi.getAllOrders(params);
//       console.log('📋 [Thunk] Raw response:', response);
      
//       let orders = [];
//       let pagination = {
//         page: params.page || 1,
//         limit: params.limit || 10,
//         total: 0,
//         pages: 1
//       };
      
//       if (response.orders) {
//         orders = response.orders;
//         pagination = response.pagination || pagination;
//         console.log('📋 [Thunk] Using response.orders');
//       } else if (response.data) {
//         orders = response.data;
//         console.log('📋 [Thunk] Using response.data');
//       } else if (Array.isArray(response)) {
//         orders = response;
//         console.log('📋 [Thunk] Using response as array');
//       }
      
//       const result = {
//         orders: orders,
//         pagination: pagination
//       };
      
//       console.log('📋 [Thunk] Orders found:', orders.length);
//       console.log('📋 [Thunk] Pagination:', pagination);
//       console.log("========== ✅ [Thunk] fetchOrders END ==========\n");
//       return result;
//     } catch (error) {
//       console.error('❌ [Thunk] fetchOrders error:', error);
//       console.error("========== ❌ [Thunk] fetchOrders END ==========\n");
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch orders");
//     }
//   }
// );

// // Get orders by customer ID
// export const fetchOrdersByCustomer = createAsyncThunk(
//   "orders/fetchByCustomer",
//   async (customerId, { rejectWithValue }) => {
//     console.log("\n========== 👤 [Thunk] fetchOrdersByCustomer START ==========");
//     console.log('👤 [Thunk] Customer ID:', customerId);
    
//     try {
//       const response = await orderApi.getOrdersByCustomer(customerId);
//       console.log('👤 [Thunk] Raw response:', response);
      
//       let orders = [];
//       if (response.orders) {
//         orders = response.orders;
//       } else if (response.data) {
//         orders = response.data;
//       } else if (Array.isArray(response)) {
//         orders = response;
//       }
      
//       const result = {
//         customerId,
//         orders: orders
//       };
      
//       console.log('👤 [Thunk] Orders found:', orders.length);
//       console.log("========== ✅ [Thunk] fetchOrdersByCustomer END ==========\n");
//       return result;
//     } catch (error) {
//       console.error('❌ [Thunk] fetchOrdersByCustomer error:', error);
//       console.error("========== ❌ [Thunk] fetchOrdersByCustomer END ==========\n");
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch customer orders");
//     }
//   }
// );

// // Get single order
// export const fetchOrderById = createAsyncThunk(
//   "orders/fetchById",
//   async (id, { rejectWithValue }) => {
//     console.log("\n========== 🔍 [Thunk] fetchOrderById START ==========");
//     console.log('🔍 [Thunk] Order ID:', id);
    
//     try {
//       const response = await orderApi.getOrderById(id);
//       console.log('🔍 [Thunk] Raw response:', response);
      
//       const result = {
//         order: response.order || response.data || response,
//         payments: response.payments || [],
//         works: response.works || []
//       };
      
//       console.log('🔍 [Thunk] Order found:', result.order?._id);
//       console.log('🔍 [Thunk] Payments:', result.payments.length);
//       console.log('🔍 [Thunk] Works:', result.works.length);
//       console.log("========== ✅ [Thunk] fetchOrderById END ==========\n");
//       return result;
//     } catch (error) {
//       console.error('❌ [Thunk] fetchOrderById error:', error);
//       console.error("========== ❌ [Thunk] fetchOrderById END ==========\n");
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch order");
//     }
//   }
// );

// // Update order
// export const updateExistingOrder = createAsyncThunk(
//   "orders/update",
//   async ({ id, data }, { rejectWithValue }) => {
//     console.log("\n========== ✏️ [Thunk] updateExistingOrder START ==========");
//     console.log('✏️ [Thunk] Order ID:', id);
//     console.log('✏️ [Thunk] Update data:', data);
    
//     try {
//       const response = await orderApi.updateOrder(id, data);
//       console.log('✏️ [Thunk] Response:', response);
      
//       const result = response.order || response.data || response;
//       console.log('✏️ [Thunk] Updated order:', result);
//       console.log("========== ✅ [Thunk] updateExistingOrder END ==========\n");
//       return result;
//     } catch (error) {
//       console.error('❌ [Thunk] updateExistingOrder error:', error);
//       console.error("========== ❌ [Thunk] updateExistingOrder END ==========\n");
//       return rejectWithValue(error.response?.data?.message || "Failed to update order");
//     }
//   }
// );

// // Update order status
// export const updateOrderStatusThunk = createAsyncThunk(
//   "orders/updateStatus",
//   async ({ id, status }, { rejectWithValue }) => {
//     console.log("\n========== 🔄 [Thunk] updateOrderStatus START ==========");
//     console.log('🔄 [Thunk] Order ID:', id);
//     console.log('🔄 [Thunk] New status:', status);
    
//     try {
//       const response = await orderApi.updateOrderStatus(id, status);
//       console.log('🔄 [Thunk] Response:', response);
      
//       const result = response.order || response.data || response;
//       console.log('🔄 [Thunk] Updated order:', result);
//       console.log("========== ✅ [Thunk] updateOrderStatus END ==========\n");
//       return result;
//     } catch (error) {
//       console.error('❌ [Thunk] updateOrderStatus error:', error);
//       console.error("========== ❌ [Thunk] updateOrderStatus END ==========\n");
//       return rejectWithValue(error.response?.data?.message || "Failed to update status");
//     }
//   }
// );

// // Delete order
// export const deleteExistingOrder = createAsyncThunk(
//   "orders/delete",
//   async (id, { rejectWithValue }) => {
//     console.log("\n========== 🗑️ [Thunk] deleteExistingOrder START ==========");
//     console.log('🗑️ [Thunk] Order ID:', id);
    
//     try {
//       await orderApi.deleteOrder(id);
//       console.log('🗑️ [Thunk] Order deleted successfully');
//       console.log("========== ✅ [Thunk] deleteExistingOrder END ==========\n");
//       return id;
//     } catch (error) {
//       console.error('❌ [Thunk] deleteExistingOrder error:', error);
//       console.error("========== ❌ [Thunk] deleteExistingOrder END ==========\n");
//       return rejectWithValue(error.response?.data?.message || "Failed to delete order");
//     }
//   }
// );

// // Add payment to order
// export const addPayment = createAsyncThunk(
//   "orders/addPayment",
//   async ({ orderId, paymentData }, { rejectWithValue }) => {
//     console.log("\n========== 💰 [Thunk] addPayment START ==========");
//     console.log('💰 [Thunk] Order ID:', orderId);
//     console.log('💰 [Thunk] Payment data:', paymentData);
    
//     try {
//       const response = await orderApi.addPaymentToOrder(orderId, paymentData);
//       console.log('💰 [Thunk] Response:', response);
      
//       const result = {
//         orderId,
//         payment: response.payment || response.data,
//         updatedOrder: response.order || response
//       };
      
//       console.log('💰 [Thunk] Payment added:', result.payment);
//       console.log("========== ✅ [Thunk] addPayment END ==========\n");
//       return result;
//     } catch (error) {
//       console.error('❌ [Thunk] addPayment error:', error);
//       console.error("========== ❌ [Thunk] addPayment END ==========\n");
//       return rejectWithValue(error.response?.data?.message || "Failed to add payment");
//     }
//   }
// );

// // Get order payments
// export const fetchOrderPayments = createAsyncThunk(
//   "orders/fetchPayments",
//   async (orderId, { rejectWithValue }) => {
//     console.log("\n========== 💰 [Thunk] fetchOrderPayments START ==========");
//     console.log('💰 [Thunk] Order ID:', orderId);
    
//     try {
//       const response = await orderApi.getOrderPayments(orderId);
//       console.log('💰 [Thunk] Response:', response);
      
//       let payments = [];
//       if (response.payments) {
//         payments = response.payments;
//       } else if (response.data) {
//         payments = response.data;
//       } else if (Array.isArray(response)) {
//         payments = response;
//       }
      
//       const result = {
//         orderId,
//         payments: payments
//       };
      
//       console.log('💰 [Thunk] Payments found:', payments.length);
//       console.log("========== ✅ [Thunk] fetchOrderPayments END ==========\n");
//       return result;
//     } catch (error) {
//       console.error('❌ [Thunk] fetchOrderPayments error:', error);
//       console.error("========== ❌ [Thunk] fetchOrderPayments END ==========\n");
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch payments");
//     }
//   }
// );

// // ============================================
// // 🟢 NEW: Get dates that have orders (simple array for calendar green dots)
// // ============================================
// export const fetchOrderDates = createAsyncThunk(
//   "orders/fetchOrderDates",
//   async (params = {}, { rejectWithValue }) => {
//     console.log("\n========== 🟢 [Thunk] fetchOrderDates START ==========");
//     console.log('🟢 [Thunk] Params:', params);
    
//     try {
//       const { month, year } = params;
      
//       if (month === undefined || year === undefined) {
//         console.error('🟢 [Thunk] Missing month or year');
//         return rejectWithValue("Month and year are required");
//       }
      
//       console.log(`🟢 [Thunk] Fetching order dates for month: ${month}, year: ${year}`);
      
//       const response = await orderApi.getOrderDates({ month, year });
//       console.log('🟢 [Thunk] Response:', response);
      
//       const result = {
//         dates: response.dates || [],
//         month,
//         year
//       };
      
//       console.log('🟢 [Thunk] Dates found:', result.dates.length);
//       console.log('🟢 [Thunk] First few dates:', result.dates.slice(0, 5));
//       console.log("========== ✅ [Thunk] fetchOrderDates END ==========\n");
//       return result;
//     } catch (error) {
//       console.error('❌ [Thunk] fetchOrderDates error:', error);
//       console.error('❌ [Thunk] Error response:', error.response?.data);
//       console.error("========== ❌ [Thunk] fetchOrderDates END ==========\n");
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch order dates");
//     }
//   }
// );

// // ============================================
// // 📊 INITIAL STATE
// // ============================================
// const initialState = {
//   // Main orders list
//   orders: [],
//   recentOrders: [], // ✅ For dashboard
//   currentOrder: null,
//   currentPayments: [],
//   currentWorks: [],
  
//   // Customer-specific orders
//   customerOrders: {}, // Store orders by customer ID
  
//   // Ready to delivery orders
//   readyToDelivery: {
//     orders: [],
//     count: 0,
//     loading: false
//   },
  
//   // Statistics - MATCHES YOUR FRONTEND EXPECTATIONS
//   stats: {
//     total: 0,
//     pending: 0,
//     cutting: 0,
//     stitching: 0,
//     ready: 0,
//     delivered: 0,
//     cancelled: 0,
//     draft: 0,
//     confirmed: 0,
//     'in-progress': 0,
//     'ready-to-delivery': 0,
//     today: 0,
//     thisWeek: 0,
//     thisMonth: 0,
//     inProgress: 0,
//     deliveries: {
//       today: 0,
//       tomorrow: 0,
//       late: 0,
//       total: 0
//     },
//     filterPeriod: 'month',
//     startDate: null,
//     endDate: null
//   },
  
//   // Dashboard data
//   dashboard: {
//     todayOrders: { count: 0, orders: [] },
//     pendingDeliveries: { count: 0, orders: [] },
//     readyForDelivery: { count: 0, orders: [] },
//     recentOrders: [],
//     todayCollection: 0,
//     totalIncomeToday: 0,
//     incomeBreakdown: {
//       handCash: 0,
//       bank: 0
//     }
//   },
  
//   // Pagination
//   pagination: {
//     page: 1,
//     limit: 10,
//     total: 0,
//     pages: 1
//   },
  
//   // UI states
//   loading: false,
//   error: null,
//   success: false,
  
//   // Filter info (for debugging)
//   currentFilter: null,
  
//   // 📅 NEW: Calendar state for green dots
//   calendar: {
//     orderDates: [], // Array of dates with orders ["2026-03-19", "2026-03-23", "2026-03-29"]
//     loading: false,
//     month: null,
//     year: null
//   }
// };

// // ============================================
// // 🎯 ORDER SLICE
// // ============================================
// const orderSlice = createSlice({
//   name: "orders",
//   initialState,
//   reducers: {
//     clearOrderError: (state) => {
//       console.log('🧹 [Reducer] clearOrderError');
//       state.error = null;
//     },
//     clearCurrentOrder: (state) => {
//       console.log('🧹 [Reducer] clearCurrentOrder');
//       state.currentOrder = null;
//       state.currentPayments = [];
//       state.currentWorks = [];
//     },
//     clearCustomerOrders: (state, action) => {
//       const { customerId } = action.payload || {};
//       console.log('🧹 [Reducer] clearCustomerOrders for:', customerId || 'all');
//       if (customerId) {
//         delete state.customerOrders[customerId];
//       } else {
//         state.customerOrders = {};
//       }
//     },
//     clearReadyToDelivery: (state) => {
//       console.log('🧹 [Reducer] clearReadyToDelivery');
//       state.readyToDelivery = {
//         orders: [],
//         count: 0,
//         loading: false
//       };
//     },
//     setPagination: (state, action) => {
//       console.log('📄 [Reducer] setPagination:', action.payload);
//       state.pagination = { ...state.pagination, ...action.payload };
//     },
//     resetOrderState: () => {
//       console.log('🔄 [Reducer] resetOrderState');
//       return initialState;
//     },
    
//     // ✅ Clear recent orders (useful when changing filters)
//     clearRecentOrders: (state) => {
//       console.log('🧹 [Reducer] clearRecentOrders');
//       state.recentOrders = [];
//     },
    
//     // ✅ Set current filter (for debugging)
//     setCurrentFilter: (state, action) => {
//       console.log('🔍 [Reducer] setCurrentFilter:', action.payload);
//       state.currentFilter = action.payload;
//     },
    
//     // ✅ Update stats manually (if needed)
//     updateStats: (state, action) => {
//       console.log('📊 [Reducer] updateStats:', action.payload);
//       state.stats = { ...state.stats, ...action.payload };
//     },
    
//     // 📅 NEW: Calendar reducers
//     clearCalendarData: (state) => {
//       console.log('🧹 [Reducer] clearCalendarData');
//       state.calendar = {
//         orderDates: [],
//         loading: false,
//         month: null,
//         year: null
//       };
//     },
//     setCalendarMonth: (state, action) => {
//       const { month, year } = action.payload;
//       console.log('📅 [Reducer] setCalendarMonth:', { month, year });
//       state.calendar.month = month;
//       state.calendar.year = year;
//     }
//   },
//   extraReducers: (builder) => {
//     builder
//       // ===== FETCH STATS =====
//       .addCase(fetchOrderStats.pending, (state) => {
//         console.log('⏳ [Reducer] fetchOrderStats pending');
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchOrderStats.fulfilled, (state, action) => {
//         console.log('✅ [Reducer] fetchOrderStats fulfilled');
//         console.log('✅ [Reducer] Payload:', action.payload);
//         state.loading = false;
        
//         // Merge with existing stats
//         state.stats = {
//           ...state.stats,
//           ...action.payload,
//           // Ensure all required fields exist
//           total: action.payload.total || 0,
//           pending: action.payload.pending || 0,
//           cutting: action.payload.cutting || 0,
//           stitching: action.payload.stitching || 0,
//           ready: action.payload.ready || 0,
//           delivered: action.payload.delivered || 0,
//           cancelled: action.payload.cancelled || 0,
//           draft: action.payload.draft || 0,
//           confirmed: action.payload.confirmed || 0,
//           'in-progress': action.payload['in-progress'] || 0,
//           'ready-to-delivery': action.payload['ready-to-delivery'] || 0,
//           today: action.payload.today || 0,
//           thisWeek: action.payload.thisWeek || 0,
//           thisMonth: action.payload.thisMonth || 0,
//           inProgress: action.payload.inProgress || action.payload.cutting || 0
//         };
        
//         console.log('📊 [Reducer] Updated stats:', state.stats);
//       })
//       .addCase(fetchOrderStats.rejected, (state, action) => {
//         console.error('❌ [Reducer] fetchOrderStats rejected:', action.payload);
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== FETCH DASHBOARD =====
//       .addCase(fetchDashboardData.pending, (state) => {
//         console.log('⏳ [Reducer] fetchDashboardData pending');
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchDashboardData.fulfilled, (state, action) => {
//         console.log('✅ [Reducer] fetchDashboardData fulfilled:', action.payload);
//         state.loading = false;
//         state.dashboard = {
//           ...state.dashboard,
//           ...action.payload
//         };
//       })
//       .addCase(fetchDashboardData.rejected, (state, action) => {
//         console.error('❌ [Reducer] fetchDashboardData rejected:', action.payload);
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== FETCH RECENT ORDERS (FIXED) =====
//       .addCase(fetchRecentOrders.pending, (state) => {
//         console.log('⏳ [Reducer] fetchRecentOrders pending');
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchRecentOrders.fulfilled, (state, action) => {
//         console.log('✅ [Reducer] fetchRecentOrders fulfilled');
//         console.log('✅ [Reducer] Payload:', action.payload);
//         state.loading = false;
        
//         state.recentOrders = action.payload.orders || [];
//         state.currentFilter = action.payload.filter || null;
        
//         // Also update dashboard.recentOrders for backward compatibility
//         state.dashboard.recentOrders = action.payload.orders || [];
        
//         console.log('📋 [Reducer] Updated recentOrders count:', state.recentOrders.length);
//         if (state.recentOrders.length > 0) {
//           console.log('📋 [Reducer] First recent order:', state.recentOrders[0]);
//         }
//       })
//       .addCase(fetchRecentOrders.rejected, (state, action) => {
//         console.error('❌ [Reducer] fetchRecentOrders rejected:', action.payload);
//         state.loading = false;
//         state.error = action.payload;
//         state.recentOrders = []; // Clear on error
//       })

//       // ===== FETCH READY TO DELIVERY ORDERS =====
//       .addCase(fetchReadyToDeliveryOrders.pending, (state) => {
//         console.log('⏳ [Reducer] fetchReadyToDeliveryOrders pending');
//         state.readyToDelivery.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchReadyToDeliveryOrders.fulfilled, (state, action) => {
//         console.log('✅ [Reducer] fetchReadyToDeliveryOrders fulfilled:', action.payload);
//         state.readyToDelivery.loading = false;
//         state.readyToDelivery.orders = action.payload.orders || [];
//         state.readyToDelivery.count = action.payload.count || 0;
//       })
//       .addCase(fetchReadyToDeliveryOrders.rejected, (state, action) => {
//         console.error('❌ [Reducer] fetchReadyToDeliveryOrders rejected:', action.payload);
//         state.readyToDelivery.loading = false;
//         state.error = action.payload;
//       })

//       // ===== CREATE ORDER =====
//       .addCase(createNewOrder.pending, (state) => {
//         console.log('⏳ [Reducer] createNewOrder pending');
//         state.loading = true;
//         state.error = null;
//         state.success = false;
//       })
//       .addCase(createNewOrder.fulfilled, (state, action) => {
//         console.log('✅ [Reducer] createNewOrder fulfilled');
//         console.log('✅ [Reducer] New order:', action.payload);
//         state.loading = false;
        
//         // 🔥 FIX: Check if order already exists in state (prevent duplicates)
//         const exists = state.orders.some(o => o._id === action.payload._id);
//         if (!exists) {
//           state.orders.unshift(action.payload);
//           state.recentOrders.unshift(action.payload);
          
//           // Update stats (increment counts)
//           if (action.payload.status) {
//             const status = action.payload.status;
//             if (status === 'confirmed') state.stats.pending += 1;
//             else if (status === 'in-progress') {
//               state.stats.cutting += 1;
//               state.stats.stitching += 1;
//               state.stats.inProgress += 1;
//             }
//             else if (status === 'ready-to-delivery') state.stats.ready += 1;
//             else if (status === 'delivered') state.stats.delivered += 1;
//             else if (status === 'draft') state.stats.draft += 1;
//           }
//           state.stats.total += 1;
          
//           // Add to customerOrders if customer exists
//           if (action.payload.customer) {
//             const customerId = action.payload.customer._id || action.payload.customer;
//             if (!state.customerOrders[customerId]) {
//               state.customerOrders[customerId] = [];
//             }
//             state.customerOrders[customerId].unshift(action.payload);
//           }

//           // If order is ready-to-delivery, add to readyToDelivery list
//           if (action.payload.status === 'ready-to-delivery') {
//             state.readyToDelivery.orders.unshift(action.payload);
//             state.readyToDelivery.count += 1;
//           }
//         } else {
//           console.log('⚠️ [Reducer] Order already exists in state, skipping duplicate');
//         }
        
//         console.log('📊 [Reducer] Updated stats after create:', state.stats);
//         state.success = true;
//       })
//       .addCase(createNewOrder.rejected, (state, action) => {
//         console.error('❌ [Reducer] createNewOrder rejected:', action.payload);
//         state.loading = false;
//         state.error = action.payload;
//         state.success = false;
//       })

//       // ===== FETCH ALL ORDERS =====
//       .addCase(fetchOrders.pending, (state) => {
//         console.log('⏳ [Reducer] fetchOrders pending');
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchOrders.fulfilled, (state, action) => {
//         console.log('✅ [Reducer] fetchOrders fulfilled');
//         console.log('✅ [Reducer] Orders count:', action.payload.orders?.length);
//         state.loading = false;
//         state.orders = action.payload.orders || [];
//         state.pagination = action.payload.pagination || state.pagination;
//       })
//       .addCase(fetchOrders.rejected, (state, action) => {
//         console.error('❌ [Reducer] fetchOrders rejected:', action.payload);
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== FETCH ORDERS BY CUSTOMER =====
//       .addCase(fetchOrdersByCustomer.pending, (state) => {
//         console.log('⏳ [Reducer] fetchOrdersByCustomer pending');
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchOrdersByCustomer.fulfilled, (state, action) => {
//         console.log('✅ [Reducer] fetchOrdersByCustomer fulfilled for customer:', action.payload.customerId);
//         console.log('✅ [Reducer] Orders found:', action.payload.orders?.length);
//         state.loading = false;
//         const { customerId, orders } = action.payload;
//         state.customerOrders[customerId] = orders || [];
//       })
//       .addCase(fetchOrdersByCustomer.rejected, (state, action) => {
//         console.error('❌ [Reducer] fetchOrdersByCustomer rejected:', action.payload);
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== FETCH ORDER BY ID =====
//       .addCase(fetchOrderById.pending, (state) => {
//         console.log('⏳ [Reducer] fetchOrderById pending');
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchOrderById.fulfilled, (state, action) => {
//         console.log('✅ [Reducer] fetchOrderById fulfilled for order:', action.payload.order?._id);
//         console.log('✅ [Reducer] Payments:', action.payload.payments?.length);
//         console.log('✅ [Reducer] Works:', action.payload.works?.length);
//         state.loading = false;
//         state.currentOrder = action.payload.order;
//         state.currentPayments = action.payload.payments || [];
//         state.currentWorks = action.payload.works || [];
//       })
//       .addCase(fetchOrderById.rejected, (state, action) => {
//         console.error('❌ [Reducer] fetchOrderById rejected:', action.payload);
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== UPDATE ORDER =====
//       .addCase(updateExistingOrder.pending, (state) => {
//         console.log('⏳ [Reducer] updateExistingOrder pending');
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(updateExistingOrder.fulfilled, (state, action) => {
//         console.log('✅ [Reducer] updateExistingOrder fulfilled');
//         console.log('✅ [Reducer] Updated order:', action.payload?._id);
//         state.loading = false;
//         const updatedOrder = action.payload;
        
//         // Update in main orders array
//         const index = state.orders.findIndex(o => o?._id === updatedOrder?._id);
//         if (index !== -1) {
//           state.orders[index] = updatedOrder;
//           console.log('✅ [Reducer] Updated in main orders');
//         }
        
//         // Update in recent orders
//         const recentIndex = state.recentOrders.findIndex(o => o?._id === updatedOrder?._id);
//         if (recentIndex !== -1) {
//           state.recentOrders[recentIndex] = updatedOrder;
//           console.log('✅ [Reducer] Updated in recent orders');
//         }
        
//         // Update in customerOrders if customer exists
//         if (updatedOrder?.customer) {
//           const customerId = updatedOrder.customer._id || updatedOrder.customer;
//           if (state.customerOrders[customerId]) {
//             const custIndex = state.customerOrders[customerId].findIndex(o => o?._id === updatedOrder?._id);
//             if (custIndex !== -1) {
//               state.customerOrders[customerId][custIndex] = updatedOrder;
//               console.log('✅ [Reducer] Updated in customer orders');
//             }
//           }
//         }
        
//         // Update in readyToDelivery list if needed
//         const readyIndex = state.readyToDelivery.orders.findIndex(o => o?._id === updatedOrder?._id);
//         if (updatedOrder?.status === 'ready-to-delivery') {
//           if (readyIndex === -1) {
//             state.readyToDelivery.orders.unshift(updatedOrder);
//             state.readyToDelivery.count += 1;
//             console.log('✅ [Reducer] Added to readyToDelivery');
//           } else {
//             state.readyToDelivery.orders[readyIndex] = updatedOrder;
//             console.log('✅ [Reducer] Updated in readyToDelivery');
//           }
//         } else if (readyIndex !== -1) {
//           // If status changed from ready-to-delivery to something else, remove from list
//           state.readyToDelivery.orders.splice(readyIndex, 1);
//           state.readyToDelivery.count -= 1;
//           console.log('✅ [Reducer] Removed from readyToDelivery');
//         }
        
//         // Update currentOrder if it's the same
//         if (state.currentOrder?._id === updatedOrder?._id) {
//           state.currentOrder = updatedOrder;
//           console.log('✅ [Reducer] Updated currentOrder');
//         }
//         state.success = true;
//       })
//       .addCase(updateExistingOrder.rejected, (state, action) => {
//         console.error('❌ [Reducer] updateExistingOrder rejected:', action.payload);
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== UPDATE ORDER STATUS =====
//       .addCase(updateOrderStatusThunk.pending, (state) => {
//         console.log('⏳ [Reducer] updateOrderStatusThunk pending');
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(updateOrderStatusThunk.fulfilled, (state, action) => {
//         console.log('✅ [Reducer] updateOrderStatusThunk fulfilled');
//         console.log('✅ [Reducer] Updated order status:', action.payload?.status);
//         state.loading = false;
//         const updatedOrder = action.payload;
        
//         // Update in main orders array
//         const index = state.orders.findIndex(o => o?._id === updatedOrder?._id);
//         if (index !== -1) {
//           state.orders[index] = updatedOrder;
//         }
        
//         // Update in recent orders
//         const recentIndex = state.recentOrders.findIndex(o => o?._id === updatedOrder?._id);
//         if (recentIndex !== -1) {
//           state.recentOrders[recentIndex] = updatedOrder;
//         }
        
//         // Update in customerOrders if customer exists
//         if (updatedOrder?.customer) {
//           const customerId = updatedOrder.customer._id || updatedOrder.customer;
//           if (state.customerOrders[customerId]) {
//             const custIndex = state.customerOrders[customerId].findIndex(o => o?._id === updatedOrder?._id);
//             if (custIndex !== -1) {
//               state.customerOrders[customerId][custIndex] = updatedOrder;
//             }
//           }
//         }
        
//         // Update in readyToDelivery list based on status
//         const readyIndex = state.readyToDelivery.orders.findIndex(o => o?._id === updatedOrder?._id);
//         if (updatedOrder?.status === 'ready-to-delivery') {
//           if (readyIndex === -1) {
//             state.readyToDelivery.orders.unshift(updatedOrder);
//             state.readyToDelivery.count += 1;
//           } else {
//             state.readyToDelivery.orders[readyIndex] = updatedOrder;
//           }
//         } else if (readyIndex !== -1) {
//           // If status changed from ready-to-delivery to something else
//           state.readyToDelivery.orders.splice(readyIndex, 1);
//           state.readyToDelivery.count -= 1;
//         }
        
//         // Update currentOrder if it's the same
//         if (state.currentOrder?._id === updatedOrder?._id) {
//           state.currentOrder = updatedOrder;
//         }
        
//         console.log('✅ [Reducer] Status update complete');
//       })
//       .addCase(updateOrderStatusThunk.rejected, (state, action) => {
//         console.error('❌ [Reducer] updateOrderStatusThunk rejected:', action.payload);
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== DELETE ORDER =====
//       .addCase(deleteExistingOrder.pending, (state) => {
//         console.log('⏳ [Reducer] deleteExistingOrder pending');
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(deleteExistingOrder.fulfilled, (state, action) => {
//         console.log('✅ [Reducer] deleteExistingOrder fulfilled for ID:', action.payload);
//         state.loading = false;
//         const deletedId = action.payload;
        
//         // Remove from main orders array
//         const beforeCount = state.orders.length;
//         state.orders = state.orders.filter(o => o?._id !== deletedId);
//         console.log('✅ [Reducer] Removed from orders:', beforeCount - state.orders.length);
        
//         // Remove from recent orders
//         state.recentOrders = state.recentOrders.filter(o => o?._id !== deletedId);
        
//         // Remove from all customerOrders entries
//         Object.keys(state.customerOrders).forEach(customerId => {
//           state.customerOrders[customerId] = state.customerOrders[customerId].filter(
//             o => o?._id !== deletedId
//           );
//         });
        
//         // Remove from readyToDelivery list
//         const readyIndex = state.readyToDelivery.orders.findIndex(o => o?._id === deletedId);
//         if (readyIndex !== -1) {
//           state.readyToDelivery.orders.splice(readyIndex, 1);
//           state.readyToDelivery.count -= 1;
//         }
        
//         // Clear currentOrder if it's the deleted one
//         if (state.currentOrder?._id === deletedId) {
//           state.currentOrder = null;
//           state.currentPayments = [];
//           state.currentWorks = [];
//         }
        
//         // Update stats
//         state.stats.total = Math.max(0, state.stats.total - 1);
//         state.success = true;
//       })
//       .addCase(deleteExistingOrder.rejected, (state, action) => {
//         console.error('❌ [Reducer] deleteExistingOrder rejected:', action.payload);
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== ADD PAYMENT =====
//       .addCase(addPayment.pending, (state) => {
//         console.log('⏳ [Reducer] addPayment pending');
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(addPayment.fulfilled, (state, action) => {
//         console.log('✅ [Reducer] addPayment fulfilled');
//         console.log('✅ [Reducer] Payment:', action.payload.payment);
//         state.loading = false;
//         const { orderId, payment, updatedOrder } = action.payload;
        
//         // Update currentOrder if it matches
//         if (state.currentOrder?._id === orderId) {
//           state.currentOrder = updatedOrder || state.currentOrder;
//           state.currentPayments.push(payment);
//           console.log('✅ [Reducer] Updated currentOrder with payment');
//         }
        
//         // Update in orders list
//         const orderIndex = state.orders.findIndex(o => o?._id === orderId);
//         if (orderIndex !== -1 && updatedOrder) {
//           state.orders[orderIndex] = updatedOrder;
//         }
        
//         // Update in recent orders
//         const recentIndex = state.recentOrders.findIndex(o => o?._id === orderId);
//         if (recentIndex !== -1 && updatedOrder) {
//           state.recentOrders[recentIndex] = updatedOrder;
//         }
        
//         state.success = true;
//       })
//       .addCase(addPayment.rejected, (state, action) => {
//         console.error('❌ [Reducer] addPayment rejected:', action.payload);
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== FETCH ORDER PAYMENTS =====
//       .addCase(fetchOrderPayments.pending, (state) => {
//         console.log('⏳ [Reducer] fetchOrderPayments pending');
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchOrderPayments.fulfilled, (state, action) => {
//         console.log('✅ [Reducer] fetchOrderPayments fulfilled for order:', action.payload.orderId);
//         console.log('✅ [Reducer] Payments found:', action.payload.payments?.length);
//         state.loading = false;
//         if (state.currentOrder?._id === action.payload.orderId) {
//           state.currentPayments = action.payload.payments || [];
//         }
//       })
//       .addCase(fetchOrderPayments.rejected, (state, action) => {
//         console.error('❌ [Reducer] fetchOrderPayments rejected:', action.payload);
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== 🟢 FETCH ORDER DATES (SIMPLE) =====
//       .addCase(fetchOrderDates.pending, (state) => {
//         console.log('⏳ [Reducer] fetchOrderDates pending');
//         state.calendar.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchOrderDates.fulfilled, (state, action) => {
//         console.log('✅ [Reducer] fetchOrderDates fulfilled');
//         console.log('✅ [Reducer] Dates received:', action.payload.dates?.length);
//         console.log('✅ [Reducer] First few dates:', action.payload.dates?.slice(0, 5));
//         state.calendar.loading = false;
//         state.calendar.orderDates = action.payload.dates || [];
//         state.calendar.month = action.payload.month;
//         state.calendar.year = action.payload.year;
//       })
//       .addCase(fetchOrderDates.rejected, (state, action) => {
//         console.error('❌ [Reducer] fetchOrderDates rejected:', action.payload);
//         state.calendar.loading = false;
//         state.error = action.payload;
//         state.calendar.orderDates = [];
//       });
//   }
// });

// // ============================================
// // 📤 EXPORT ACTIONS & REDUCER
// // ============================================
// export const { 
//   clearOrderError, 
//   clearCurrentOrder,
//   clearCustomerOrders,
//   clearReadyToDelivery,
//   clearRecentOrders,
//   setCurrentFilter,
//   setPagination, 
//   resetOrderState,
//   updateStats,
//   // 📅 NEW: Calendar actions
//   clearCalendarData,
//   setCalendarMonth
// } = orderSlice.actions;


// // ============================================
// // ✅ FIXED SELECTORS - Using 'order' (singular) to match store
// // ============================================

// // Helper to get order state (works with both 'order' and 'orders')
// const getOrderState = (state) => {
//   // Your store uses 'order' (singular)
//   const orderState = state.order || state.orders || {};
//   console.log('🔍 [Selector] getOrderState:', { 
//     hasOrder: !!state.order, 
//     hasOrders: !!state.orders,
//     recentOrdersCount: orderState.recentOrders?.length 
//   });
//   return orderState;
// };

// export const selectAllOrders = (state) => {
//   const orderState = getOrderState(state);
//   const orders = orderState.orders || [];
//   console.log('🔍 [Selector] selectAllOrders:', orders.length);
//   return orders;
// };

// export const selectRecentOrders = (state) => {
//   const orderState = getOrderState(state);
//   console.log('🔍 [Selector] selectRecentOrders - orderState:', {
//     recentOrders: orderState.recentOrders,
//     length: orderState.recentOrders?.length
//   });
//   return orderState.recentOrders || [];
// };

// export const selectOrderStats = (state) => {
//   const orderState = getOrderState(state);
//   const stats = orderState.stats || {};
  
//   console.log('🔍 [Selector] selectOrderStats:', stats);
  
//   // Return with defaults to prevent undefined errors
//   return {
//     total: stats.total || 0,
//     pending: stats.pending || 0,
//     cutting: stats.cutting || 0,
//     stitching: stats.stitching || 0,
//     ready: stats.ready || 0,
//     delivered: stats.delivered || 0,
//     cancelled: stats.cancelled || 0,
//     draft: stats.draft || 0,
//     confirmed: stats.confirmed || 0,
//     'in-progress': stats['in-progress'] || 0,
//     'ready-to-delivery': stats['ready-to-delivery'] || 0,
//     today: stats.today || 0,
//     thisWeek: stats.thisWeek || 0,
//     thisMonth: stats.thisMonth || 0,
//     inProgress: stats.inProgress || stats.cutting || 0,
//     deliveries: stats.deliveries || {
//       today: 0,
//       tomorrow: 0,
//       late: 0,
//       total: 0
//     },
//     filterPeriod: stats.filterPeriod || 'month',
//     startDate: stats.startDate || null,
//     endDate: stats.endDate || null
//   };
// };

// export const selectCurrentOrder = (state) => {
//   const orderState = getOrderState(state);
//   console.log('🔍 [Selector] selectCurrentOrder:', orderState.currentOrder?._id);
//   return orderState.currentOrder || null;
// };

// export const selectOrderLoading = (state) => {
//   const orderState = getOrderState(state);
//   console.log('🔍 [Selector] selectOrderLoading:', orderState.loading);
//   return orderState.loading || false;
// };

// export const selectOrderError = (state) => {
//   const orderState = getOrderState(state);
//   console.log('🔍 [Selector] selectOrderError:', orderState.error);
//   return orderState.error || null;
// };

// export const selectReadyToDelivery = (state) => {
//   const orderState = getOrderState(state);
//   const ready = orderState.readyToDelivery || {
//     orders: [],
//     count: 0,
//     loading: false
//   };
//   console.log('🔍 [Selector] selectReadyToDelivery count:', ready.count);
//   return ready;
// };

// export const selectOrdersByCustomer = (customerId) => (state) => {
//   const orderState = getOrderState(state);
//   const orders = orderState.customerOrders?.[customerId] || [];
//   console.log(`🔍 [Selector] selectOrdersByCustomer for ${customerId}:`, orders.length);
//   return orders;
// };

// export const selectOrderPagination = (state) => {
//   const orderState = getOrderState(state);
//   const pagination = orderState.pagination || {
//     page: 1,
//     limit: 10,
//     total: 0,
//     pages: 1
//   };
//   console.log('🔍 [Selector] selectOrderPagination:', pagination);
//   return pagination;
// };

// export const selectDashboardData = (state) => {
//   const orderState = getOrderState(state);
//   const dashboard = orderState.dashboard || {
//     todayOrders: { count: 0, orders: [] },
//     pendingDeliveries: { count: 0, orders: [] },
//     readyForDelivery: { count: 0, orders: [] },
//     recentOrders: [],
//     todayCollection: 0,
//     totalIncomeToday: 0,
//     incomeBreakdown: {
//       handCash: 0,
//       bank: 0
//     }
//   };
//   console.log('🔍 [Selector] selectDashboardData - todayCollection:', dashboard.todayCollection);
//   return dashboard;
// };

// // ============================================
// // 🟢 NEW: ORDER DATES SELECTORS - For Calendar Green Dots
// // ============================================

// export const selectOrderDates = (state) => {
//   const orderState = getOrderState(state);
//   const dates = orderState.calendar?.orderDates || [];
//   console.log('🔍 [Selector] selectOrderDates:', dates.length);
//   return dates;
// };

// export const selectCalendarLoading = (state) => {
//   const orderState = getOrderState(state);
//   const loading = orderState.calendar?.loading || false;
//   console.log('🔍 [Selector] selectCalendarLoading:', loading);
//   return loading;
// };

// export const selectCalendarMonth = (state) => {
//   const orderState = getOrderState(state);
//   const monthInfo = {
//     month: orderState.calendar?.month,
//     year: orderState.calendar?.year
//   };
//   console.log('🔍 [Selector] selectCalendarMonth:', monthInfo);
//   return monthInfo;
// };

// // ============================================
// // ✅ DEFAULT EXPORT
// // ============================================
// export default orderSlice.reducer;





















// // frontend/src/features/orders/orderSlice.js - COMPLETE FIXED VERSION WITH IMAGE SUPPORT
// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import * as orderApi from "./orderApi";

// // ============================================
// // 🔄 ASYNC THUNKS
// // ============================================

// // Get order stats - WITH DATE FILTER SUPPORT ✅
// export const fetchOrderStats = createAsyncThunk(
//   "orders/fetchStats",
//   async (params = {}, { rejectWithValue }) => {
//     console.log("\n========== 📊 [Thunk] fetchOrderStats START ==========");
//     console.log("📊 [Thunk] Params received:", params);
    
//     try {
//       console.log('📊 [Thunk] Fetching order stats with params:', params);
//       const response = await orderApi.getOrderStats(params);
//       console.log('📊 [Thunk] Raw API response:', response);
      
//       // Handle different response structures
//       let result;
//       if (response.data) {
//         result = response.data;
//         console.log('📊 [Thunk] Using response.data');
//       } else if (response.stats) {
//         result = response.stats;
//         console.log('📊 [Thunk] Using response.stats');
//       } else {
//         result = response;
//         console.log('📊 [Thunk] Using response directly');
//       }
      
//       console.log('📊 [Thunk] Result to return:', result);
//       console.log("========== ✅ [Thunk] fetchOrderStats END ==========\n");
//       return result;
//     } catch (error) {
//       console.error('❌ [Thunk] fetchOrderStats error:', error);
//       console.error('❌ [Thunk] Error response:', error.response?.data);
//       console.error('❌ [Thunk] Error status:', error.response?.status);
//       console.error("========== ❌ [Thunk] fetchOrderStats END ==========\n");
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch stats");
//     }
//   }
// );

// // Get dashboard data
// export const fetchDashboardData = createAsyncThunk(
//   "orders/fetchDashboard",
//   async (_, { rejectWithValue }) => {
//     console.log("\n========== 📊 [Thunk] fetchDashboardData START ==========");
    
//     try {
//       const response = await orderApi.getDashboardData();
//       console.log('📊 [Thunk] Dashboard response:', response);
      
//       const result = response.dashboard || response.data || response;
//       console.log('📊 [Thunk] Result to return:', result);
//       console.log("========== ✅ [Thunk] fetchDashboardData END ==========\n");
//       return result;
//     } catch (error) {
//       console.error('❌ [Thunk] fetchDashboardData error:', error);
//       console.error("========== ❌ [Thunk] fetchDashboardData END ==========\n");
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch dashboard");
//     }
//   }
// );

// // Get recent orders with date filter support
// export const fetchRecentOrders = createAsyncThunk(
//   "orders/fetchRecent",
//   async (params = {}, { rejectWithValue }) => {
//     console.log("\n========== 📋 [Thunk] fetchRecentOrders START ==========");
//     console.log('📋 [Thunk] Params received:', params);
    
//     try {
//       const { limit = 10, startDate, endDate, period } = params;
      
//       console.log('📋 [Thunk] Fetching recent orders with:', { limit, startDate, endDate, period });
      
//       const response = await orderApi.getRecentOrders({ 
//         limit, 
//         startDate, 
//         endDate, 
//         period 
//       });
      
//       console.log('📋 [Thunk] Raw API response:', response);
      
//       let orders = [];
//       if (response.orders) {
//         orders = response.orders;
//         console.log('📋 [Thunk] Using response.orders');
//       } else if (response.data) {
//         orders = response.data;
//         console.log('📋 [Thunk] Using response.data');
//       } else if (Array.isArray(response)) {
//         orders = response;
//         console.log('📋 [Thunk] Using response as array');
//       }
      
//       console.log('📋 [Thunk] Orders found:', orders.length);
      
//       const result = {
//         orders: orders,
//         count: orders.length,
//         filter: params
//       };
      
//       console.log('📋 [Thunk] Result to return:', result);
//       console.log("========== ✅ [Thunk] fetchRecentOrders END ==========\n");
//       return result;
//     } catch (error) {
//       console.error('❌ [Thunk] fetchRecentOrders error:', error);
//       console.error('❌ [Thunk] Error response:', error.response?.data);
//       console.error('❌ [Thunk] Error status:', error.response?.status);
//       console.error("========== ❌ [Thunk] fetchRecentOrders END ==========\n");
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch recent orders");
//     }
//   }
// );

// // Get ready to delivery orders
// export const fetchReadyToDeliveryOrders = createAsyncThunk(
//   "orders/fetchReadyToDelivery",
//   async (params = {}, { rejectWithValue }) => {
//     console.log("\n========== 🚚 [Thunk] fetchReadyToDelivery START ==========");
//     console.log('🚚 [Thunk] Params:', params);
    
//     try {
//       const response = await orderApi.getReadyToDeliveryOrders(params);
//       console.log('🚚 [Thunk] Raw response:', response);
      
//       let orders = [];
//       if (response.orders) {
//         orders = response.orders;
//       } else if (response.data) {
//         orders = response.data;
//       } else if (Array.isArray(response)) {
//         orders = response;
//       }
      
//       const result = {
//         orders: orders,
//         count: orders.length
//       };
      
//       console.log('🚚 [Thunk] Ready orders:', orders.length);
//       console.log("========== ✅ [Thunk] fetchReadyToDelivery END ==========\n");
//       return result;
//     } catch (error) {
//       console.error('❌ [Thunk] fetchReadyToDelivery error:', error);
//       console.error("========== ❌ [Thunk] fetchReadyToDelivery END ==========\n");
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch ready to delivery orders");
//     }
//   }
// );

// // 🔥 FIXED: Create new order - WITH FORMDATA SUPPORT FOR IMAGES
// export const createNewOrder = createAsyncThunk(
//   "orders/create",
//   async (orderData, { rejectWithValue, getState }) => {
//     console.log("\n========== 🚀 [Thunk] createNewOrder START ==========");
//     console.log("📦 [Thunk] Order data received:", JSON.stringify(orderData, null, 2));
    
//     // Check if this requestId already exists in state (prevent duplicate)
//     if (orderData.requestId) {
//       const state = getState();
//       const existingOrder = state.order?.orders?.find(o => o.metadata?.requestId === orderData.requestId);
//       if (existingOrder) {
//         console.log("⚠️ [Thunk] Duplicate request detected, returning existing order");
//         return existingOrder;
//       }
//     }
    
//     // Validate required fields
//     if (!orderData.customer) {
//       console.error("❌ [Thunk] Missing customer");
//       return rejectWithValue("Customer is required");
//     }
    
//     if (!orderData.garments || orderData.garments.length === 0) {
//       console.error("❌ [Thunk] No garments");
//       return rejectWithValue("At least one garment is required");
//     }
    
//     try {
//       // 🔥 CRITICAL: Check if there are any File objects in the data
//       const hasFiles = orderData.garments.some(g => 
//         (g.referenceImages && g.referenceImages.some(img => img instanceof File)) ||
//         (g.customerImages && g.customerImages.some(img => img instanceof File)) ||
//         (g.customerClothImages && g.customerClothImages.some(img => img instanceof File))
//       );
      
//       console.log("📸 [Thunk] Has image files:", hasFiles);
      
//       let dataToSend = orderData;
      
//       // 🔥 FIX: If there are files, create FormData
//       if (hasFiles) {
//         console.log("📦 [Thunk] Creating FormData for image upload...");
//         const fd = new FormData();
        
//         // Add basic order fields
//         fd.append("customer", orderData.customer);
//         fd.append("deliveryDate", orderData.deliveryDate);
//         fd.append("specialNotes", orderData.specialNotes || "");
        
//         if (orderData.requestId) {
//           fd.append("requestId", orderData.requestId);
//         }
        
//         if (orderData.orderDate) {
//           fd.append("orderDate", orderData.orderDate);
//         }
        
//         if (orderData.status) {
//           fd.append("status", orderData.status);
//         }
        
//         if (orderData.createdBy) {
//           fd.append("createdBy", orderData.createdBy);
//         }
        
//         if (orderData.balanceAmount !== undefined) {
//           fd.append("balanceAmount", orderData.balanceAmount);
//         }
        
//         // Add payments as JSON string
//         if (orderData.payments && orderData.payments.length > 0) {
//           fd.append("payments", JSON.stringify(orderData.payments));
//         }
        
//         // Add advance payment as JSON string
//         if (orderData.advancePayment) {
//           fd.append("advancePayment", JSON.stringify(orderData.advancePayment));
//         }
        
//         // Add price summary as JSON string
//         if (orderData.priceSummary) {
//           fd.append("priceSummary", JSON.stringify(orderData.priceSummary));
//         }
        
//         // Add payment summary as JSON string
//         if (orderData.paymentSummary) {
//           fd.append("paymentSummary", JSON.stringify(orderData.paymentSummary));
//         }
        
//         // Prepare garments data WITHOUT files (to send as JSON)
//         const garmentsWithoutFiles = orderData.garments.map((g, index) => {
//           const garmentCopy = { ...g };
          
//           // Remove File arrays from the JSON data
//           delete garmentCopy.referenceImages;
//           delete garmentCopy.customerImages;
//           delete garmentCopy.customerClothImages;
          
//           // Ensure priceRange is proper
//           if (garmentCopy.priceRange) {
//             garmentCopy.priceRange = {
//               min: Number(garmentCopy.priceRange.min) || 0,
//               max: Number(garmentCopy.priceRange.max) || 0
//             };
//           }
          
//           // Ensure measurements is proper
//           if (garmentCopy.measurements && Array.isArray(garmentCopy.measurements)) {
//             garmentCopy.measurements = garmentCopy.measurements.map(m => ({
//               name: m.name,
//               value: Number(m.value) || 0,
//               unit: m.unit || 'inches'
//             }));
//           }
          
//           return garmentCopy;
//         });
        
//         fd.append("garments", JSON.stringify(garmentsWithoutFiles));
        
//         // 🔥 CRITICAL: Append image files with correct fieldnames for backend regex
//         // Format: garments[0].referenceImages
//         orderData.garments.forEach((garment, index) => {
//           // Reference Images
//           if (garment.referenceImages && garment.referenceImages.length > 0) {
//             garment.referenceImages.forEach(file => {
//               if (file instanceof File) {
//                 fd.append(`garments[${index}].referenceImages`, file);
//                 console.log(`  📸 Added reference image for garment ${index}: ${file.name}`);
//               }
//             });
//           }
          
//           // Customer Images
//           if (garment.customerImages && garment.customerImages.length > 0) {
//             garment.customerImages.forEach(file => {
//               if (file instanceof File) {
//                 fd.append(`garments[${index}].customerImages`, file);
//                 console.log(`  📸 Added customer image for garment ${index}: ${file.name}`);
//               }
//             });
//           }
          
//           // Cloth Images
//           if (garment.customerClothImages && garment.customerClothImages.length > 0) {
//             garment.customerClothImages.forEach(file => {
//               if (file instanceof File) {
//                 fd.append(`garments[${index}].customerClothImages`, file);
//                 console.log(`  📸 Added cloth image for garment ${index}: ${file.name}`);
//               }
//             });
//           }
//         });
        
//         dataToSend = fd;
//         console.log("📦 [Thunk] FormData created with files");
//       }
      
//       console.log("📦 [Thunk] Calling orderApi.createOrder...");
//       const response = await orderApi.createOrder(dataToSend);
//       console.log("✅ [Thunk] createOrder response:", JSON.stringify(response, null, 2));
      
//       // Handle different response structures
//       const result = response.order || response.data || response;
      
//       // Validate response has ID
//       if (!result._id && !result.id) {
//         console.error("❌ [Thunk] Invalid response - missing order ID");
//         return rejectWithValue("Invalid response from server");
//       }
      
//       console.log("📦 [Thunk] Result to store:", result);
//       console.log("========== ✅ [Thunk] createNewOrder END ==========\n");
//       return result;
//     } catch (error) {
//       console.error("❌ [Thunk] createNewOrder error:", error);
//       console.error("❌ [Thunk] Error response:", error.response?.data);
//       console.error("❌ [Thunk] Error status:", error.response?.status);
//       console.error("========== ❌ [Thunk] createNewOrder END ==========\n");
//       return rejectWithValue(error.response?.data?.message || error.message || "Failed to create order");
//     }
//   }
// );

// // Get all orders - WITH FILTER SUPPORT ✅
// export const fetchOrders = createAsyncThunk(
//   "orders/fetchAll",
//   async (params = {}, { rejectWithValue }) => {
//     console.log("\n========== 📋 [Thunk] fetchOrders START ==========");
//     console.log('📋 [Thunk] Params:', params);
    
//     try {
//       const response = await orderApi.getAllOrders(params);
//       console.log('📋 [Thunk] Raw response:', response);
      
//       let orders = [];
//       let pagination = {
//         page: params.page || 1,
//         limit: params.limit || 10,
//         total: 0,
//         pages: 1
//       };
      
//       if (response.orders) {
//         orders = response.orders;
//         pagination = response.pagination || pagination;
//         console.log('📋 [Thunk] Using response.orders');
//       } else if (response.data) {
//         orders = response.data;
//         console.log('📋 [Thunk] Using response.data');
//       } else if (Array.isArray(response)) {
//         orders = response;
//         console.log('📋 [Thunk] Using response as array');
//       }
      
//       const result = {
//         orders: orders,
//         pagination: pagination
//       };
      
//       console.log('📋 [Thunk] Orders found:', orders.length);
//       console.log('📋 [Thunk] Pagination:', pagination);
//       console.log("========== ✅ [Thunk] fetchOrders END ==========\n");
//       return result;
//     } catch (error) {
//       console.error('❌ [Thunk] fetchOrders error:', error);
//       console.error("========== ❌ [Thunk] fetchOrders END ==========\n");
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch orders");
//     }
//   }
// );

// // Get orders by customer ID
// export const fetchOrdersByCustomer = createAsyncThunk(
//   "orders/fetchByCustomer",
//   async (customerId, { rejectWithValue }) => {
//     console.log("\n========== 👤 [Thunk] fetchOrdersByCustomer START ==========");
//     console.log('👤 [Thunk] Customer ID:', customerId);
    
//     try {
//       const response = await orderApi.getOrdersByCustomer(customerId);
//       console.log('👤 [Thunk] Raw response:', response);
      
//       let orders = [];
//       if (response.orders) {
//         orders = response.orders;
//       } else if (response.data) {
//         orders = response.data;
//       } else if (Array.isArray(response)) {
//         orders = response;
//       }
      
//       const result = {
//         customerId,
//         orders: orders
//       };
      
//       console.log('👤 [Thunk] Orders found:', orders.length);
//       console.log("========== ✅ [Thunk] fetchOrdersByCustomer END ==========\n");
//       return result;
//     } catch (error) {
//       console.error('❌ [Thunk] fetchOrdersByCustomer error:', error);
//       console.error("========== ❌ [Thunk] fetchOrdersByCustomer END ==========\n");
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch customer orders");
//     }
//   }
// );

// // Get single order
// export const fetchOrderById = createAsyncThunk(
//   "orders/fetchById",
//   async (id, { rejectWithValue }) => {
//     console.log("\n========== 🔍 [Thunk] fetchOrderById START ==========");
//     console.log('🔍 [Thunk] Order ID:', id);
    
//     try {
//       const response = await orderApi.getOrderById(id);
//       console.log('🔍 [Thunk] Raw response:', response);
      
//       const result = {
//         order: response.order || response.data || response,
//         payments: response.payments || [],
//         works: response.works || []
//       };
      
//       console.log('🔍 [Thunk] Order found:', result.order?._id);
//       console.log('🔍 [Thunk] Payments:', result.payments.length);
//       console.log('🔍 [Thunk] Works:', result.works.length);
//       console.log("========== ✅ [Thunk] fetchOrderById END ==========\n");
//       return result;
//     } catch (error) {
//       console.error('❌ [Thunk] fetchOrderById error:', error);
//       console.error("========== ❌ [Thunk] fetchOrderById END ==========\n");
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch order");
//     }
//   }
// );

// // Update order
// export const updateExistingOrder = createAsyncThunk(
//   "orders/update",
//   async ({ id, data }, { rejectWithValue }) => {
//     console.log("\n========== ✏️ [Thunk] updateExistingOrder START ==========");
//     console.log('✏️ [Thunk] Order ID:', id);
//     console.log('✏️ [Thunk] Update data:', data);
    
//     try {
//       const response = await orderApi.updateOrder(id, data);
//       console.log('✏️ [Thunk] Response:', response);
      
//       const result = response.order || response.data || response;
//       console.log('✏️ [Thunk] Updated order:', result);
//       console.log("========== ✅ [Thunk] updateExistingOrder END ==========\n");
//       return result;
//     } catch (error) {
//       console.error('❌ [Thunk] updateExistingOrder error:', error);
//       console.error("========== ❌ [Thunk] updateExistingOrder END ==========\n");
//       return rejectWithValue(error.response?.data?.message || "Failed to update order");
//     }
//   }
// );

// // Update order status
// export const updateOrderStatusThunk = createAsyncThunk(
//   "orders/updateStatus",
//   async ({ id, status }, { rejectWithValue }) => {
//     console.log("\n========== 🔄 [Thunk] updateOrderStatus START ==========");
//     console.log('🔄 [Thunk] Order ID:', id);
//     console.log('🔄 [Thunk] New status:', status);
    
//     try {
//       const response = await orderApi.updateOrderStatus(id, status);
//       console.log('🔄 [Thunk] Response:', response);
      
//       const result = response.order || response.data || response;
//       console.log('🔄 [Thunk] Updated order:', result);
//       console.log("========== ✅ [Thunk] updateOrderStatus END ==========\n");
//       return result;
//     } catch (error) {
//       console.error('❌ [Thunk] updateOrderStatus error:', error);
//       console.error("========== ❌ [Thunk] updateOrderStatus END ==========\n");
//       return rejectWithValue(error.response?.data?.message || "Failed to update status");
//     }
//   }
// );

// // Delete order
// export const deleteExistingOrder = createAsyncThunk(
//   "orders/delete",
//   async (id, { rejectWithValue }) => {
//     console.log("\n========== 🗑️ [Thunk] deleteExistingOrder START ==========");
//     console.log('🗑️ [Thunk] Order ID:', id);
    
//     try {
//       await orderApi.deleteOrder(id);
//       console.log('🗑️ [Thunk] Order deleted successfully');
//       console.log("========== ✅ [Thunk] deleteExistingOrder END ==========\n");
//       return id;
//     } catch (error) {
//       console.error('❌ [Thunk] deleteExistingOrder error:', error);
//       console.error("========== ❌ [Thunk] deleteExistingOrder END ==========\n");
//       return rejectWithValue(error.response?.data?.message || "Failed to delete order");
//     }
//   }
// );

// // Add payment to order
// export const addPayment = createAsyncThunk(
//   "orders/addPayment",
//   async ({ orderId, paymentData }, { rejectWithValue }) => {
//     console.log("\n========== 💰 [Thunk] addPayment START ==========");
//     console.log('💰 [Thunk] Order ID:', orderId);
//     console.log('💰 [Thunk] Payment data:', paymentData);
    
//     try {
//       const response = await orderApi.addPaymentToOrder(orderId, paymentData);
//       console.log('💰 [Thunk] Response:', response);
      
//       const result = {
//         orderId,
//         payment: response.payment || response.data,
//         updatedOrder: response.order || response
//       };
      
//       console.log('💰 [Thunk] Payment added:', result.payment);
//       console.log("========== ✅ [Thunk] addPayment END ==========\n");
//       return result;
//     } catch (error) {
//       console.error('❌ [Thunk] addPayment error:', error);
//       console.error("========== ❌ [Thunk] addPayment END ==========\n");
//       return rejectWithValue(error.response?.data?.message || "Failed to add payment");
//     }
//   }
// );

// // Get order payments
// export const fetchOrderPayments = createAsyncThunk(
//   "orders/fetchPayments",
//   async (orderId, { rejectWithValue }) => {
//     console.log("\n========== 💰 [Thunk] fetchOrderPayments START ==========");
//     console.log('💰 [Thunk] Order ID:', orderId);
    
//     try {
//       const response = await orderApi.getOrderPayments(orderId);
//       console.log('💰 [Thunk] Response:', response);
      
//       let payments = [];
//       if (response.payments) {
//         payments = response.payments;
//       } else if (response.data) {
//         payments = response.data;
//       } else if (Array.isArray(response)) {
//         payments = response;
//       }
      
//       const result = {
//         orderId,
//         payments: payments
//       };
      
//       console.log('💰 [Thunk] Payments found:', payments.length);
//       console.log("========== ✅ [Thunk] fetchOrderPayments END ==========\n");
//       return result;
//     } catch (error) {
//       console.error('❌ [Thunk] fetchOrderPayments error:', error);
//       console.error("========== ❌ [Thunk] fetchOrderPayments END ==========\n");
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch payments");
//     }
//   }
// );

// // ============================================
// // 🟢 Get dates that have orders (simple array for calendar green dots)
// // ============================================
// export const fetchOrderDates = createAsyncThunk(
//   "orders/fetchOrderDates",
//   async (params = {}, { rejectWithValue }) => {
//     console.log("\n========== 🟢 [Thunk] fetchOrderDates START ==========");
//     console.log('🟢 [Thunk] Params:', params);
    
//     try {
//       const { month, year } = params;
      
//       if (month === undefined || year === undefined) {
//         console.error('🟢 [Thunk] Missing month or year');
//         return rejectWithValue("Month and year are required");
//       }
      
//       console.log(`🟢 [Thunk] Fetching order dates for month: ${month}, year: ${year}`);
      
//       const response = await orderApi.getOrderDates({ month, year });
//       console.log('🟢 [Thunk] Response:', response);
      
//       const result = {
//         dates: response.dates || [],
//         month,
//         year
//       };
      
//       console.log('🟢 [Thunk] Dates found:', result.dates.length);
//       console.log('🟢 [Thunk] First few dates:', result.dates.slice(0, 5));
//       console.log("========== ✅ [Thunk] fetchOrderDates END ==========\n");
//       return result;
//     } catch (error) {
//       console.error('❌ [Thunk] fetchOrderDates error:', error);
//       console.error('❌ [Thunk] Error response:', error.response?.data);
//       console.error("========== ❌ [Thunk] fetchOrderDates END ==========\n");
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch order dates");
//     }
//   }
// );

// // ============================================
// // 📊 INITIAL STATE
// // ============================================
// const initialState = {
//   // Main orders list
//   orders: [],
//   recentOrders: [], // ✅ For dashboard
//   currentOrder: null,
//   currentPayments: [],
//   currentWorks: [],
  
//   // Customer-specific orders
//   customerOrders: {}, // Store orders by customer ID
  
//   // Ready to delivery orders
//   readyToDelivery: {
//     orders: [],
//     count: 0,
//     loading: false
//   },
  
//   // Statistics - MATCHES YOUR FRONTEND EXPECTATIONS
//   stats: {
//     total: 0,
//     pending: 0,
//     cutting: 0,
//     stitching: 0,
//     ready: 0,
//     delivered: 0,
//     cancelled: 0,
//     draft: 0,
//     confirmed: 0,
//     'in-progress': 0,
//     'ready-to-delivery': 0,
//     today: 0,
//     thisWeek: 0,
//     thisMonth: 0,
//     inProgress: 0,
//     deliveries: {
//       today: 0,
//       tomorrow: 0,
//       late: 0,
//       total: 0
//     },
//     filterPeriod: 'month',
//     startDate: null,
//     endDate: null
//   },
  
//   // Dashboard data
//   dashboard: {
//     todayOrders: { count: 0, orders: [] },
//     pendingDeliveries: { count: 0, orders: [] },
//     readyForDelivery: { count: 0, orders: [] },
//     recentOrders: [],
//     todayCollection: 0,
//     totalIncomeToday: 0,
//     incomeBreakdown: {
//       handCash: 0,
//       bank: 0
//     }
//   },
  
//   // Pagination
//   pagination: {
//     page: 1,
//     limit: 10,
//     total: 0,
//     pages: 1
//   },
  
//   // UI states
//   loading: false,
//   error: null,
//   success: false,
  
//   // Filter info (for debugging)
//   currentFilter: null,
  
//   // 📅 NEW: Calendar state for green dots
//   calendar: {
//     orderDates: [], // Array of dates with orders ["2026-03-19", "2026-03-23", "2026-03-29"]
//     loading: false,
//     month: null,
//     year: null
//   }
// };

// // ============================================
// // 🎯 ORDER SLICE
// // ============================================
// const orderSlice = createSlice({
//   name: "orders",
//   initialState,
//   reducers: {
//     clearOrderError: (state) => {
//       console.log('🧹 [Reducer] clearOrderError');
//       state.error = null;
//     },
//     clearCurrentOrder: (state) => {
//       console.log('🧹 [Reducer] clearCurrentOrder');
//       state.currentOrder = null;
//       state.currentPayments = [];
//       state.currentWorks = [];
//     },
//     clearCustomerOrders: (state, action) => {
//       const { customerId } = action.payload || {};
//       console.log('🧹 [Reducer] clearCustomerOrders for:', customerId || 'all');
//       if (customerId) {
//         delete state.customerOrders[customerId];
//       } else {
//         state.customerOrders = {};
//       }
//     },
//     clearReadyToDelivery: (state) => {
//       console.log('🧹 [Reducer] clearReadyToDelivery');
//       state.readyToDelivery = {
//         orders: [],
//         count: 0,
//         loading: false
//       };
//     },
//     setPagination: (state, action) => {
//       console.log('📄 [Reducer] setPagination:', action.payload);
//       state.pagination = { ...state.pagination, ...action.payload };
//     },
//     resetOrderState: () => {
//       console.log('🔄 [Reducer] resetOrderState');
//       return initialState;
//     },
    
//     // ✅ Clear recent orders (useful when changing filters)
//     clearRecentOrders: (state) => {
//       console.log('🧹 [Reducer] clearRecentOrders');
//       state.recentOrders = [];
//     },
    
//     // ✅ Set current filter (for debugging)
//     setCurrentFilter: (state, action) => {
//       console.log('🔍 [Reducer] setCurrentFilter:', action.payload);
//       state.currentFilter = action.payload;
//     },
    
//     // ✅ Update stats manually (if needed)
//     updateStats: (state, action) => {
//       console.log('📊 [Reducer] updateStats:', action.payload);
//       state.stats = { ...state.stats, ...action.payload };
//     },
    
//     // 📅 NEW: Calendar reducers
//     clearCalendarData: (state) => {
//       console.log('🧹 [Reducer] clearCalendarData');
//       state.calendar = {
//         orderDates: [],
//         loading: false,
//         month: null,
//         year: null
//       };
//     },
//     setCalendarMonth: (state, action) => {
//       const { month, year } = action.payload;
//       console.log('📅 [Reducer] setCalendarMonth:', { month, year });
//       state.calendar.month = month;
//       state.calendar.year = year;
//     }
//   },
//   extraReducers: (builder) => {
//     builder
//       // ===== FETCH STATS =====
//       .addCase(fetchOrderStats.pending, (state) => {
//         console.log('⏳ [Reducer] fetchOrderStats pending');
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchOrderStats.fulfilled, (state, action) => {
//         console.log('✅ [Reducer] fetchOrderStats fulfilled');
//         console.log('✅ [Reducer] Payload:', action.payload);
//         state.loading = false;
        
//         // Merge with existing stats
//         state.stats = {
//           ...state.stats,
//           ...action.payload,
//           // Ensure all required fields exist
//           total: action.payload.total || 0,
//           pending: action.payload.pending || 0,
//           cutting: action.payload.cutting || 0,
//           stitching: action.payload.stitching || 0,
//           ready: action.payload.ready || 0,
//           delivered: action.payload.delivered || 0,
//           cancelled: action.payload.cancelled || 0,
//           draft: action.payload.draft || 0,
//           confirmed: action.payload.confirmed || 0,
//           'in-progress': action.payload['in-progress'] || 0,
//           'ready-to-delivery': action.payload['ready-to-delivery'] || 0,
//           today: action.payload.today || 0,
//           thisWeek: action.payload.thisWeek || 0,
//           thisMonth: action.payload.thisMonth || 0,
//           inProgress: action.payload.inProgress || action.payload.cutting || 0
//         };
        
//         console.log('📊 [Reducer] Updated stats:', state.stats);
//       })
//       .addCase(fetchOrderStats.rejected, (state, action) => {
//         console.error('❌ [Reducer] fetchOrderStats rejected:', action.payload);
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== FETCH DASHBOARD =====
//       .addCase(fetchDashboardData.pending, (state) => {
//         console.log('⏳ [Reducer] fetchDashboardData pending');
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchDashboardData.fulfilled, (state, action) => {
//         console.log('✅ [Reducer] fetchDashboardData fulfilled:', action.payload);
//         state.loading = false;
//         state.dashboard = {
//           ...state.dashboard,
//           ...action.payload
//         };
//       })
//       .addCase(fetchDashboardData.rejected, (state, action) => {
//         console.error('❌ [Reducer] fetchDashboardData rejected:', action.payload);
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== FETCH RECENT ORDERS =====
//       .addCase(fetchRecentOrders.pending, (state) => {
//         console.log('⏳ [Reducer] fetchRecentOrders pending');
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchRecentOrders.fulfilled, (state, action) => {
//         console.log('✅ [Reducer] fetchRecentOrders fulfilled');
//         console.log('✅ [Reducer] Payload:', action.payload);
//         state.loading = false;
        
//         state.recentOrders = action.payload.orders || [];
//         state.currentFilter = action.payload.filter || null;
        
//         // Also update dashboard.recentOrders for backward compatibility
//         state.dashboard.recentOrders = action.payload.orders || [];
        
//         console.log('📋 [Reducer] Updated recentOrders count:', state.recentOrders.length);
//         if (state.recentOrders.length > 0) {
//           console.log('📋 [Reducer] First recent order:', state.recentOrders[0]);
//         }
//       })
//       .addCase(fetchRecentOrders.rejected, (state, action) => {
//         console.error('❌ [Reducer] fetchRecentOrders rejected:', action.payload);
//         state.loading = false;
//         state.error = action.payload;
//         state.recentOrders = []; // Clear on error
//       })

//       // ===== FETCH READY TO DELIVERY ORDERS =====
//       .addCase(fetchReadyToDeliveryOrders.pending, (state) => {
//         console.log('⏳ [Reducer] fetchReadyToDeliveryOrders pending');
//         state.readyToDelivery.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchReadyToDeliveryOrders.fulfilled, (state, action) => {
//         console.log('✅ [Reducer] fetchReadyToDeliveryOrders fulfilled:', action.payload);
//         state.readyToDelivery.loading = false;
//         state.readyToDelivery.orders = action.payload.orders || [];
//         state.readyToDelivery.count = action.payload.count || 0;
//       })
//       .addCase(fetchReadyToDeliveryOrders.rejected, (state, action) => {
//         console.error('❌ [Reducer] fetchReadyToDeliveryOrders rejected:', action.payload);
//         state.readyToDelivery.loading = false;
//         state.error = action.payload;
//       })

//       // ===== CREATE ORDER =====
//       .addCase(createNewOrder.pending, (state) => {
//         console.log('⏳ [Reducer] createNewOrder pending');
//         state.loading = true;
//         state.error = null;
//         state.success = false;
//       })
//       .addCase(createNewOrder.fulfilled, (state, action) => {
//         console.log('✅ [Reducer] createNewOrder fulfilled');
//         console.log('✅ [Reducer] New order:', action.payload);
//         state.loading = false;
        
//         // 🔥 FIX: Check if order already exists in state (prevent duplicates)
//         const exists = state.orders.some(o => o._id === action.payload._id);
//         if (!exists) {
//           state.orders.unshift(action.payload);
//           state.recentOrders.unshift(action.payload);
          
//           // Update stats (increment counts)
//           if (action.payload.status) {
//             const status = action.payload.status;
//             if (status === 'confirmed') state.stats.pending += 1;
//             else if (status === 'in-progress') {
//               state.stats.cutting += 1;
//               state.stats.stitching += 1;
//               state.stats.inProgress += 1;
//             }
//             else if (status === 'ready-to-delivery') state.stats.ready += 1;
//             else if (status === 'delivered') state.stats.delivered += 1;
//             else if (status === 'draft') state.stats.draft += 1;
//           }
//           state.stats.total += 1;
          
//           // Add to customerOrders if customer exists
//           if (action.payload.customer) {
//             const customerId = action.payload.customer._id || action.payload.customer;
//             if (!state.customerOrders[customerId]) {
//               state.customerOrders[customerId] = [];
//             }
//             state.customerOrders[customerId].unshift(action.payload);
//           }

//           // If order is ready-to-delivery, add to readyToDelivery list
//           if (action.payload.status === 'ready-to-delivery') {
//             state.readyToDelivery.orders.unshift(action.payload);
//             state.readyToDelivery.count += 1;
//           }
//         } else {
//           console.log('⚠️ [Reducer] Order already exists in state, skipping duplicate');
//         }
        
//         console.log('📊 [Reducer] Updated stats after create:', state.stats);
//         state.success = true;
//       })
//       .addCase(createNewOrder.rejected, (state, action) => {
//         console.error('❌ [Reducer] createNewOrder rejected:', action.payload);
//         state.loading = false;
//         state.error = action.payload;
//         state.success = false;
//       })

//       // ===== FETCH ALL ORDERS =====
//       .addCase(fetchOrders.pending, (state) => {
//         console.log('⏳ [Reducer] fetchOrders pending');
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchOrders.fulfilled, (state, action) => {
//         console.log('✅ [Reducer] fetchOrders fulfilled');
//         console.log('✅ [Reducer] Orders count:', action.payload.orders?.length);
//         state.loading = false;
//         state.orders = action.payload.orders || [];
//         state.pagination = action.payload.pagination || state.pagination;
//       })
//       .addCase(fetchOrders.rejected, (state, action) => {
//         console.error('❌ [Reducer] fetchOrders rejected:', action.payload);
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== FETCH ORDERS BY CUSTOMER =====
//       .addCase(fetchOrdersByCustomer.pending, (state) => {
//         console.log('⏳ [Reducer] fetchOrdersByCustomer pending');
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchOrdersByCustomer.fulfilled, (state, action) => {
//         console.log('✅ [Reducer] fetchOrdersByCustomer fulfilled for customer:', action.payload.customerId);
//         console.log('✅ [Reducer] Orders found:', action.payload.orders?.length);
//         state.loading = false;
//         const { customerId, orders } = action.payload;
//         state.customerOrders[customerId] = orders || [];
//       })
//       .addCase(fetchOrdersByCustomer.rejected, (state, action) => {
//         console.error('❌ [Reducer] fetchOrdersByCustomer rejected:', action.payload);
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== FETCH ORDER BY ID =====
//       .addCase(fetchOrderById.pending, (state) => {
//         console.log('⏳ [Reducer] fetchOrderById pending');
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchOrderById.fulfilled, (state, action) => {
//         console.log('✅ [Reducer] fetchOrderById fulfilled for order:', action.payload.order?._id);
//         console.log('✅ [Reducer] Payments:', action.payload.payments?.length);
//         console.log('✅ [Reducer] Works:', action.payload.works?.length);
//         state.loading = false;
//         state.currentOrder = action.payload.order;
//         state.currentPayments = action.payload.payments || [];
//         state.currentWorks = action.payload.works || [];
//       })
//       .addCase(fetchOrderById.rejected, (state, action) => {
//         console.error('❌ [Reducer] fetchOrderById rejected:', action.payload);
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== UPDATE ORDER =====
//       .addCase(updateExistingOrder.pending, (state) => {
//         console.log('⏳ [Reducer] updateExistingOrder pending');
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(updateExistingOrder.fulfilled, (state, action) => {
//         console.log('✅ [Reducer] updateExistingOrder fulfilled');
//         console.log('✅ [Reducer] Updated order:', action.payload?._id);
//         state.loading = false;
//         const updatedOrder = action.payload;
        
//         // Update in main orders array
//         const index = state.orders.findIndex(o => o?._id === updatedOrder?._id);
//         if (index !== -1) {
//           state.orders[index] = updatedOrder;
//           console.log('✅ [Reducer] Updated in main orders');
//         }
        
//         // Update in recent orders
//         const recentIndex = state.recentOrders.findIndex(o => o?._id === updatedOrder?._id);
//         if (recentIndex !== -1) {
//           state.recentOrders[recentIndex] = updatedOrder;
//           console.log('✅ [Reducer] Updated in recent orders');
//         }
        
//         // Update in customerOrders if customer exists
//         if (updatedOrder?.customer) {
//           const customerId = updatedOrder.customer._id || updatedOrder.customer;
//           if (state.customerOrders[customerId]) {
//             const custIndex = state.customerOrders[customerId].findIndex(o => o?._id === updatedOrder?._id);
//             if (custIndex !== -1) {
//               state.customerOrders[customerId][custIndex] = updatedOrder;
//               console.log('✅ [Reducer] Updated in customer orders');
//             }
//           }
//         }
        
//         // Update in readyToDelivery list if needed
//         const readyIndex = state.readyToDelivery.orders.findIndex(o => o?._id === updatedOrder?._id);
//         if (updatedOrder?.status === 'ready-to-delivery') {
//           if (readyIndex === -1) {
//             state.readyToDelivery.orders.unshift(updatedOrder);
//             state.readyToDelivery.count += 1;
//             console.log('✅ [Reducer] Added to readyToDelivery');
//           } else {
//             state.readyToDelivery.orders[readyIndex] = updatedOrder;
//             console.log('✅ [Reducer] Updated in readyToDelivery');
//           }
//         } else if (readyIndex !== -1) {
//           // If status changed from ready-to-delivery to something else, remove from list
//           state.readyToDelivery.orders.splice(readyIndex, 1);
//           state.readyToDelivery.count -= 1;
//           console.log('✅ [Reducer] Removed from readyToDelivery');
//         }
        
//         // Update currentOrder if it's the same
//         if (state.currentOrder?._id === updatedOrder?._id) {
//           state.currentOrder = updatedOrder;
//           console.log('✅ [Reducer] Updated currentOrder');
//         }
//         state.success = true;
//       })
//       .addCase(updateExistingOrder.rejected, (state, action) => {
//         console.error('❌ [Reducer] updateExistingOrder rejected:', action.payload);
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== UPDATE ORDER STATUS =====
//       .addCase(updateOrderStatusThunk.pending, (state) => {
//         console.log('⏳ [Reducer] updateOrderStatusThunk pending');
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(updateOrderStatusThunk.fulfilled, (state, action) => {
//         console.log('✅ [Reducer] updateOrderStatusThunk fulfilled');
//         console.log('✅ [Reducer] Updated order status:', action.payload?.status);
//         state.loading = false;
//         const updatedOrder = action.payload;
        
//         // Update in main orders array
//         const index = state.orders.findIndex(o => o?._id === updatedOrder?._id);
//         if (index !== -1) {
//           state.orders[index] = updatedOrder;
//         }
        
//         // Update in recent orders
//         const recentIndex = state.recentOrders.findIndex(o => o?._id === updatedOrder?._id);
//         if (recentIndex !== -1) {
//           state.recentOrders[recentIndex] = updatedOrder;
//         }
        
//         // Update in customerOrders if customer exists
//         if (updatedOrder?.customer) {
//           const customerId = updatedOrder.customer._id || updatedOrder.customer;
//           if (state.customerOrders[customerId]) {
//             const custIndex = state.customerOrders[customerId].findIndex(o => o?._id === updatedOrder?._id);
//             if (custIndex !== -1) {
//               state.customerOrders[customerId][custIndex] = updatedOrder;
//             }
//           }
//         }
        
//         // Update in readyToDelivery list based on status
//         const readyIndex = state.readyToDelivery.orders.findIndex(o => o?._id === updatedOrder?._id);
//         if (updatedOrder?.status === 'ready-to-delivery') {
//           if (readyIndex === -1) {
//             state.readyToDelivery.orders.unshift(updatedOrder);
//             state.readyToDelivery.count += 1;
//           } else {
//             state.readyToDelivery.orders[readyIndex] = updatedOrder;
//           }
//         } else if (readyIndex !== -1) {
//           // If status changed from ready-to-delivery to something else
//           state.readyToDelivery.orders.splice(readyIndex, 1);
//           state.readyToDelivery.count -= 1;
//         }
        
//         // Update currentOrder if it's the same
//         if (state.currentOrder?._id === updatedOrder?._id) {
//           state.currentOrder = updatedOrder;
//         }
        
//         console.log('✅ [Reducer] Status update complete');
//       })
//       .addCase(updateOrderStatusThunk.rejected, (state, action) => {
//         console.error('❌ [Reducer] updateOrderStatusThunk rejected:', action.payload);
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== DELETE ORDER =====
//       .addCase(deleteExistingOrder.pending, (state) => {
//         console.log('⏳ [Reducer] deleteExistingOrder pending');
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(deleteExistingOrder.fulfilled, (state, action) => {
//         console.log('✅ [Reducer] deleteExistingOrder fulfilled for ID:', action.payload);
//         state.loading = false;
//         const deletedId = action.payload;
        
//         // Remove from main orders array
//         const beforeCount = state.orders.length;
//         state.orders = state.orders.filter(o => o?._id !== deletedId);
//         console.log('✅ [Reducer] Removed from orders:', beforeCount - state.orders.length);
        
//         // Remove from recent orders
//         state.recentOrders = state.recentOrders.filter(o => o?._id !== deletedId);
        
//         // Remove from all customerOrders entries
//         Object.keys(state.customerOrders).forEach(customerId => {
//           state.customerOrders[customerId] = state.customerOrders[customerId].filter(
//             o => o?._id !== deletedId
//           );
//         });
        
//         // Remove from readyToDelivery list
//         const readyIndex = state.readyToDelivery.orders.findIndex(o => o?._id === deletedId);
//         if (readyIndex !== -1) {
//           state.readyToDelivery.orders.splice(readyIndex, 1);
//           state.readyToDelivery.count -= 1;
//         }
        
//         // Clear currentOrder if it's the deleted one
//         if (state.currentOrder?._id === deletedId) {
//           state.currentOrder = null;
//           state.currentPayments = [];
//           state.currentWorks = [];
//         }
        
//         // Update stats
//         state.stats.total = Math.max(0, state.stats.total - 1);
//         state.success = true;
//       })
//       .addCase(deleteExistingOrder.rejected, (state, action) => {
//         console.error('❌ [Reducer] deleteExistingOrder rejected:', action.payload);
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== ADD PAYMENT =====
//       .addCase(addPayment.pending, (state) => {
//         console.log('⏳ [Reducer] addPayment pending');
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(addPayment.fulfilled, (state, action) => {
//         console.log('✅ [Reducer] addPayment fulfilled');
//         console.log('✅ [Reducer] Payment:', action.payload.payment);
//         state.loading = false;
//         const { orderId, payment, updatedOrder } = action.payload;
        
//         // Update currentOrder if it matches
//         if (state.currentOrder?._id === orderId) {
//           state.currentOrder = updatedOrder || state.currentOrder;
//           state.currentPayments.push(payment);
//           console.log('✅ [Reducer] Updated currentOrder with payment');
//         }
        
//         // Update in orders list
//         const orderIndex = state.orders.findIndex(o => o?._id === orderId);
//         if (orderIndex !== -1 && updatedOrder) {
//           state.orders[orderIndex] = updatedOrder;
//         }
        
//         // Update in recent orders
//         const recentIndex = state.recentOrders.findIndex(o => o?._id === orderId);
//         if (recentIndex !== -1 && updatedOrder) {
//           state.recentOrders[recentIndex] = updatedOrder;
//         }
        
//         state.success = true;
//       })
//       .addCase(addPayment.rejected, (state, action) => {
//         console.error('❌ [Reducer] addPayment rejected:', action.payload);
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== FETCH ORDER PAYMENTS =====
//       .addCase(fetchOrderPayments.pending, (state) => {
//         console.log('⏳ [Reducer] fetchOrderPayments pending');
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchOrderPayments.fulfilled, (state, action) => {
//         console.log('✅ [Reducer] fetchOrderPayments fulfilled for order:', action.payload.orderId);
//         console.log('✅ [Reducer] Payments found:', action.payload.payments?.length);
//         state.loading = false;
//         if (state.currentOrder?._id === action.payload.orderId) {
//           state.currentPayments = action.payload.payments || [];
//         }
//       })
//       .addCase(fetchOrderPayments.rejected, (state, action) => {
//         console.error('❌ [Reducer] fetchOrderPayments rejected:', action.payload);
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== 🟢 FETCH ORDER DATES (SIMPLE) =====
//       .addCase(fetchOrderDates.pending, (state) => {
//         console.log('⏳ [Reducer] fetchOrderDates pending');
//         state.calendar.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchOrderDates.fulfilled, (state, action) => {
//         console.log('✅ [Reducer] fetchOrderDates fulfilled');
//         console.log('✅ [Reducer] Dates received:', action.payload.dates?.length);
//         console.log('✅ [Reducer] First few dates:', action.payload.dates?.slice(0, 5));
//         state.calendar.loading = false;
//         state.calendar.orderDates = action.payload.dates || [];
//         state.calendar.month = action.payload.month;
//         state.calendar.year = action.payload.year;
//       })
//       .addCase(fetchOrderDates.rejected, (state, action) => {
//         console.error('❌ [Reducer] fetchOrderDates rejected:', action.payload);
//         state.calendar.loading = false;
//         state.error = action.payload;
//         state.calendar.orderDates = [];
//       });
//   }
// });

// // ============================================
// // 📤 EXPORT ACTIONS & REDUCER
// // ============================================
// export const { 
//   clearOrderError, 
//   clearCurrentOrder,
//   clearCustomerOrders,
//   clearReadyToDelivery,
//   clearRecentOrders,
//   setCurrentFilter,
//   setPagination, 
//   resetOrderState,
//   updateStats,
//   // 📅 NEW: Calendar actions
//   clearCalendarData,
//   setCalendarMonth
// } = orderSlice.actions;

// // ============================================
// // ✅ FIXED SELECTORS
// // ============================================

// // Helper to get order state
// const getOrderState = (state) => {
//   const orderState = state.order || state.orders || {};
//   return orderState;
// };

// export const selectAllOrders = (state) => {
//   const orderState = getOrderState(state);
//   return orderState.orders || [];
// };

// export const selectRecentOrders = (state) => {
//   const orderState = getOrderState(state);
//   return orderState.recentOrders || [];
// };

// export const selectOrderStats = (state) => {
//   const orderState = getOrderState(state);
//   const stats = orderState.stats || {};
  
//   return {
//     total: stats.total || 0,
//     pending: stats.pending || 0,
//     cutting: stats.cutting || 0,
//     stitching: stats.stitching || 0,
//     ready: stats.ready || 0,
//     delivered: stats.delivered || 0,
//     cancelled: stats.cancelled || 0,
//     draft: stats.draft || 0,
//     confirmed: stats.confirmed || 0,
//     'in-progress': stats['in-progress'] || 0,
//     'ready-to-delivery': stats['ready-to-delivery'] || 0,
//     today: stats.today || 0,
//     thisWeek: stats.thisWeek || 0,
//     thisMonth: stats.thisMonth || 0,
//     inProgress: stats.inProgress || stats.cutting || 0,
//     deliveries: stats.deliveries || {
//       today: 0,
//       tomorrow: 0,
//       late: 0,
//       total: 0
//     },
//     filterPeriod: stats.filterPeriod || 'month',
//     startDate: stats.startDate || null,
//     endDate: stats.endDate || null
//   };
// };

// export const selectCurrentOrder = (state) => {
//   const orderState = getOrderState(state);
//   return orderState.currentOrder || null;
// };

// export const selectOrderLoading = (state) => {
//   const orderState = getOrderState(state);
//   return orderState.loading || false;
// };

// export const selectOrderError = (state) => {
//   const orderState = getOrderState(state);
//   return orderState.error || null;
// };

// export const selectReadyToDelivery = (state) => {
//   const orderState = getOrderState(state);
//   return orderState.readyToDelivery || {
//     orders: [],
//     count: 0,
//     loading: false
//   };
// };

// export const selectOrdersByCustomer = (customerId) => (state) => {
//   const orderState = getOrderState(state);
//   return orderState.customerOrders?.[customerId] || [];
// };

// export const selectOrderPagination = (state) => {
//   const orderState = getOrderState(state);
//   return orderState.pagination || {
//     page: 1,
//     limit: 10,
//     total: 0,
//     pages: 1
//   };
// };

// export const selectDashboardData = (state) => {
//   const orderState = getOrderState(state);
//   return orderState.dashboard || {
//     todayOrders: { count: 0, orders: [] },
//     pendingDeliveries: { count: 0, orders: [] },
//     readyForDelivery: { count: 0, orders: [] },
//     recentOrders: [],
//     todayCollection: 0,
//     totalIncomeToday: 0,
//     incomeBreakdown: {
//       handCash: 0,
//       bank: 0
//     }
//   };
// };

// // ============================================
// // 🟢 ORDER DATES SELECTORS - For Calendar Green Dots
// // ============================================

// export const selectOrderDates = (state) => {
//   const orderState = getOrderState(state);
//   return orderState.calendar?.orderDates || [];
// };

// export const selectCalendarLoading = (state) => {
//   const orderState = getOrderState(state);
//   return orderState.calendar?.loading || false;
// };

// export const selectCalendarMonth = (state) => {
//   const orderState = getOrderState(state);
//   return {
//     month: orderState.calendar?.month,
//     year: orderState.calendar?.year
//   };
// };

// // ============================================
// // ✅ DEFAULT EXPORT
// // ============================================
// export default orderSlice.reducer;




















// frontend/src/features/orders/orderSlice.js - ONLY DELIVERY CALENDAR
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as orderApi from "./orderApi";

// ============================================
// 🔄 ASYNC THUNKS
// ============================================

// Get order stats - WITH DATE FILTER SUPPORT ✅
export const fetchOrderStats = createAsyncThunk(
  "orders/fetchStats",
  async (params = {}, { rejectWithValue }) => {
    console.log("\n========== 📊 [Thunk] fetchOrderStats START ==========");
    console.log("📊 [Thunk] Params received:", params);
    
    try {
      console.log('📊 [Thunk] Fetching order stats with params:', params);
      const response = await orderApi.getOrderStats(params);
      console.log('📊 [Thunk] Raw API response:', response);
      
      // Handle different response structures
      let result;
      if (response.data) {
        result = response.data;
        console.log('📊 [Thunk] Using response.data');
      } else if (response.stats) {
        result = response.stats;
        console.log('📊 [Thunk] Using response.stats');
      } else {
        result = response;
        console.log('📊 [Thunk] Using response directly');
      }
      
      console.log('📊 [Thunk] Result to return:', result);
      console.log("========== ✅ [Thunk] fetchOrderStats END ==========\n");
      return result;
    } catch (error) {
      console.error('❌ [Thunk] fetchOrderStats error:', error);
      console.error('❌ [Thunk] Error response:', error.response?.data);
      console.error('❌ [Thunk] Error status:', error.response?.status);
      console.error("========== ❌ [Thunk] fetchOrderStats END ==========\n");
      return rejectWithValue(error.response?.data?.message || "Failed to fetch stats");
    }
  }
);

// Get dashboard data
export const fetchDashboardData = createAsyncThunk(
  "orders/fetchDashboard",
  async (_, { rejectWithValue }) => {
    console.log("\n========== 📊 [Thunk] fetchDashboardData START ==========");
    
    try {
      const response = await orderApi.getDashboardData();
      console.log('📊 [Thunk] Dashboard response:', response);
      
      const result = response.dashboard || response.data || response;
      console.log('📊 [Thunk] Result to return:', result);
      console.log("========== ✅ [Thunk] fetchDashboardData END ==========\n");
      return result;
    } catch (error) {
      console.error('❌ [Thunk] fetchDashboardData error:', error);
      console.error("========== ❌ [Thunk] fetchDashboardData END ==========\n");
      return rejectWithValue(error.response?.data?.message || "Failed to fetch dashboard");
    }
  }
);

// Get recent orders with date filter support
export const fetchRecentOrders = createAsyncThunk(
  "orders/fetchRecent",
  async (params = {}, { rejectWithValue }) => {
    console.log("\n========== 📋 [Thunk] fetchRecentOrders START ==========");
    console.log('📋 [Thunk] Params received:', params);
    
    try {
      const { limit = 10, startDate, endDate, period } = params;
      
      console.log('📋 [Thunk] Fetching recent orders with:', { limit, startDate, endDate, period });
      
      const response = await orderApi.getRecentOrders({ 
        limit, 
        startDate, 
        endDate, 
        period 
      });
      
      console.log('📋 [Thunk] Raw API response:', response);
      
      let orders = [];
      if (response.orders) {
        orders = response.orders;
        console.log('📋 [Thunk] Using response.orders');
      } else if (response.data) {
        orders = response.data;
        console.log('📋 [Thunk] Using response.data');
      } else if (Array.isArray(response)) {
        orders = response;
        console.log('📋 [Thunk] Using response as array');
      }
      
      console.log('📋 [Thunk] Orders found:', orders.length);
      
      const result = {
        orders: orders,
        count: orders.length,
        filter: params
      };
      
      console.log('📋 [Thunk] Result to return:', result);
      console.log("========== ✅ [Thunk] fetchRecentOrders END ==========\n");
      return result;
    } catch (error) {
      console.error('❌ [Thunk] fetchRecentOrders error:', error);
      console.error('❌ [Thunk] Error response:', error.response?.data);
      console.error('❌ [Thunk] Error status:', error.response?.status);
      console.error("========== ❌ [Thunk] fetchRecentOrders END ==========\n");
      return rejectWithValue(error.response?.data?.message || "Failed to fetch recent orders");
    }
  }
);

// Get ready to delivery orders
export const fetchReadyToDeliveryOrders = createAsyncThunk(
  "orders/fetchReadyToDelivery",
  async (params = {}, { rejectWithValue }) => {
    console.log("\n========== 🚚 [Thunk] fetchReadyToDelivery START ==========");
    console.log('🚚 [Thunk] Params:', params);
    
    try {
      const response = await orderApi.getReadyToDeliveryOrders(params);
      console.log('🚚 [Thunk] Raw response:', response);
      
      let orders = [];
      if (response.orders) {
        orders = response.orders;
      } else if (response.data) {
        orders = response.data;
      } else if (Array.isArray(response)) {
        orders = response;
      }
      
      const result = {
        orders: orders,
        count: orders.length
      };
      
      console.log('🚚 [Thunk] Ready orders:', orders.length);
      console.log("========== ✅ [Thunk] fetchReadyToDelivery END ==========\n");
      return result;
    } catch (error) {
      console.error('❌ [Thunk] fetchReadyToDelivery error:', error);
      console.error("========== ❌ [Thunk] fetchReadyToDelivery END ==========\n");
      return rejectWithValue(error.response?.data?.message || "Failed to fetch ready to delivery orders");
    }
  }
);

// 🔥 FIXED: Create new order - WITH FORMDATA SUPPORT FOR IMAGES
export const createNewOrder = createAsyncThunk(
  "orders/create",
  async (orderData, { rejectWithValue, getState }) => {
    console.log("\n========== 🚀 [Thunk] createNewOrder START ==========");
    console.log("📦 [Thunk] Order data received:", JSON.stringify(orderData, null, 2));
    
    // Check if this requestId already exists in state (prevent duplicate)
    if (orderData.requestId) {
      const state = getState();
      const existingOrder = state.order?.orders?.find(o => o.metadata?.requestId === orderData.requestId);
      if (existingOrder) {
        console.log("⚠️ [Thunk] Duplicate request detected, returning existing order");
        return existingOrder;
      }
    }
    
    // Validate required fields
    if (!orderData.customer) {
      console.error("❌ [Thunk] Missing customer");
      return rejectWithValue("Customer is required");
    }
    
    if (!orderData.garments || orderData.garments.length === 0) {
      console.error("❌ [Thunk] No garments");
      return rejectWithValue("At least one garment is required");
    }
    
    try {
      // 🔥 CRITICAL: Check if there are any File objects in the data
      const hasFiles = orderData.garments.some(g => 
        (g.referenceImages && g.referenceImages.some(img => img instanceof File)) ||
        (g.customerImages && g.customerImages.some(img => img instanceof File)) ||
        (g.customerClothImages && g.customerClothImages.some(img => img instanceof File))
      );
      
      console.log("📸 [Thunk] Has image files:", hasFiles);
      
      let dataToSend = orderData;
      
      // 🔥 FIX: If there are files, create FormData
      if (hasFiles) {
        console.log("📦 [Thunk] Creating FormData for image upload...");
        const fd = new FormData();
        
        // Add basic order fields
        fd.append("customer", orderData.customer);
        fd.append("deliveryDate", orderData.deliveryDate);
        fd.append("specialNotes", orderData.specialNotes || "");
        if (orderData.workflowStages?.length) {
          fd.append("workflowStages", JSON.stringify(orderData.workflowStages));
        }
        
        if (orderData.requestId) {
          fd.append("requestId", orderData.requestId);
        }
        
        if (orderData.orderDate) {
          fd.append("orderDate", orderData.orderDate);
        }
        
        if (orderData.status) {
          fd.append("status", orderData.status);
        }
        
        if (orderData.createdBy) {
          fd.append("createdBy", orderData.createdBy);
        }
        
        if (orderData.balanceAmount !== undefined) {
          fd.append("balanceAmount", orderData.balanceAmount);
        }
        
        // Add payments as JSON string
        if (orderData.payments && orderData.payments.length > 0) {
          fd.append("payments", JSON.stringify(orderData.payments));
        }
        
        // Add advance payment as JSON string
        if (orderData.advancePayment) {
          fd.append("advancePayment", JSON.stringify(orderData.advancePayment));
        }
        
        // Add price summary as JSON string
        if (orderData.priceSummary) {
          fd.append("priceSummary", JSON.stringify(orderData.priceSummary));
        }
        
        // Add payment summary as JSON string
        if (orderData.paymentSummary) {
          fd.append("paymentSummary", JSON.stringify(orderData.paymentSummary));
        }
        
        // Prepare garments data WITHOUT files (to send as JSON)
        const garmentsWithoutFiles = orderData.garments.map((g, index) => {
          const garmentCopy = { ...g };
          
          // Remove File arrays from the JSON data
          delete garmentCopy.referenceImages;
          delete garmentCopy.customerImages;
          delete garmentCopy.customerClothImages;
          
          // Ensure priceRange is proper
          if (garmentCopy.priceRange) {
            garmentCopy.priceRange = {
              min: Number(garmentCopy.priceRange.min) || 0,
              max: Number(garmentCopy.priceRange.max) || 0
            };
          }
          
          // Ensure measurements is proper
          if (garmentCopy.measurements && Array.isArray(garmentCopy.measurements)) {
            garmentCopy.measurements = garmentCopy.measurements.map(m => ({
              name: m.name,
              value: Number(m.value) || 0,
              unit: m.unit || 'inches'
            }));
          }
          
          return garmentCopy;
        });
        
        fd.append("garments", JSON.stringify(garmentsWithoutFiles));
        
        // 🔥 CRITICAL: Append image files with correct fieldnames for backend regex
        // Format: garments[0].referenceImages
        orderData.garments.forEach((garment, index) => {
          // Reference Images
          if (garment.referenceImages && garment.referenceImages.length > 0) {
            garment.referenceImages.forEach(file => {
              if (file instanceof File) {
                fd.append(`garments[${index}].referenceImages`, file);
                console.log(`  📸 Added reference image for garment ${index}: ${file.name}`);
              }
            });
          }
          
          // Customer Images
          if (garment.customerImages && garment.customerImages.length > 0) {
            garment.customerImages.forEach(file => {
              if (file instanceof File) {
                fd.append(`garments[${index}].customerImages`, file);
                console.log(`  📸 Added customer image for garment ${index}: ${file.name}`);
              }
            });
          }
          
          // Cloth Images
          if (garment.customerClothImages && garment.customerClothImages.length > 0) {
            garment.customerClothImages.forEach(file => {
              if (file instanceof File) {
                fd.append(`garments[${index}].customerClothImages`, file);
                console.log(`  📸 Added cloth image for garment ${index}: ${file.name}`);
              }
            });
          }
        });
        
        dataToSend = fd;
        console.log("📦 [Thunk] FormData created with files");
      }
      
      console.log("📦 [Thunk] Calling orderApi.createOrder...");
      const response = await orderApi.createOrder(dataToSend);
      console.log("✅ [Thunk] createOrder response:", JSON.stringify(response, null, 2));
      
      // Handle different response structures
      const result = response.order || response.data || response;
      
      // Validate response has ID
      if (!result._id && !result.id) {
        console.error("❌ [Thunk] Invalid response - missing order ID");
        return rejectWithValue("Invalid response from server");
      }
      
      console.log("📦 [Thunk] Result to store:", result);
      console.log("========== ✅ [Thunk] createNewOrder END ==========\n");
      return result;
    } catch (error) {
      console.error("❌ [Thunk] createNewOrder error:", error);
      console.error("❌ [Thunk] Error response:", error.response?.data);
      console.error("❌ [Thunk] Error status:", error.response?.status);
      console.error("========== ❌ [Thunk] createNewOrder END ==========\n");
      return rejectWithValue(error.response?.data?.message || error.message || "Failed to create order");
    }
  }
);

// Get all orders - WITH FILTER SUPPORT ✅
export const fetchOrders = createAsyncThunk(
  "orders/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    console.log("\n========== 📋 [Thunk] fetchOrders START ==========");
    console.log('📋 [Thunk] Params:', params);
    
    try {
      const response = await orderApi.getAllOrders(params);
      console.log('📋 [Thunk] Raw response:', response);
      
      let orders = [];
      let pagination = {
        page: params.page || 1,
        limit: params.limit || 10,
        total: 0,
        pages: 1
      };
      
      if (response.orders) {
        orders = response.orders;
        pagination = response.pagination || pagination;
        console.log('📋 [Thunk] Using response.orders');
      } else if (response.data) {
        orders = response.data;
        console.log('📋 [Thunk] Using response.data');
      } else if (Array.isArray(response)) {
        orders = response;
        console.log('📋 [Thunk] Using response as array');
      }
      
      const result = {
        orders: orders,
        pagination: pagination
      };
      
      console.log('📋 [Thunk] Orders found:', orders.length);
      console.log('📋 [Thunk] Pagination:', pagination);
      console.log("========== ✅ [Thunk] fetchOrders END ==========\n");
      return result;
    } catch (error) {
      console.error('❌ [Thunk] fetchOrders error:', error);
      console.error("========== ❌ [Thunk] fetchOrders END ==========\n");
      return rejectWithValue(error.response?.data?.message || "Failed to fetch orders");
    }
  }
);

// Get orders by customer ID
export const fetchOrdersByCustomer = createAsyncThunk(
  "orders/fetchByCustomer",
  async (customerId, { rejectWithValue }) => {
    console.log("\n========== 👤 [Thunk] fetchOrdersByCustomer START ==========");
    console.log('👤 [Thunk] Customer ID:', customerId);
    
    try {
      const response = await orderApi.getOrdersByCustomer(customerId);
      console.log('👤 [Thunk] Raw response:', response);
      
      let orders = [];
      if (response.orders) {
        orders = response.orders;
      } else if (response.data) {
        orders = response.data;
      } else if (Array.isArray(response)) {
        orders = response;
      }
      
      const result = {
        customerId,
        orders: orders
      };
      
      console.log('👤 [Thunk] Orders found:', orders.length);
      console.log("========== ✅ [Thunk] fetchOrdersByCustomer END ==========\n");
      return result;
    } catch (error) {
      console.error('❌ [Thunk] fetchOrdersByCustomer error:', error);
      console.error("========== ❌ [Thunk] fetchOrdersByCustomer END ==========\n");
      return rejectWithValue(error.response?.data?.message || "Failed to fetch customer orders");
    }
  }
);

// Get single order
export const fetchOrderById = createAsyncThunk(
  "orders/fetchById",
  async (id, { rejectWithValue }) => {
    console.log("\n========== 🔍 [Thunk] fetchOrderById START ==========");
    console.log('🔍 [Thunk] Order ID:', id);
    
    try {
      const response = await orderApi.getOrderById(id);
      console.log('🔍 [Thunk] Raw response:', response);
      
      const result = {
        order: response.order || response.data || response,
        payments: response.payments || [],
        works: response.works || []
      };
      
      console.log('🔍 [Thunk] Order found:', result.order?._id);
      console.log('🔍 [Thunk] Payments:', result.payments.length);
      console.log('🔍 [Thunk] Works:', result.works.length);
      console.log("========== ✅ [Thunk] fetchOrderById END ==========\n");
      return result;
    } catch (error) {
      console.error('❌ [Thunk] fetchOrderById error:', error);
      console.error("========== ❌ [Thunk] fetchOrderById END ==========\n");
      return rejectWithValue(error.response?.data?.message || "Failed to fetch order");
    }
  }
);

// Update order
export const updateExistingOrder = createAsyncThunk(
  "orders/update",
  async ({ id, data }, { rejectWithValue }) => {
    console.log("\n========== ✏️ [Thunk] updateExistingOrder START ==========");
    console.log('✏️ [Thunk] Order ID:', id);
    console.log('✏️ [Thunk] Update data:', data);
    
    try {
      const response = await orderApi.updateOrder(id, data);
      console.log('✏️ [Thunk] Response:', response);
      
      const result = response.order || response.data || response;
      console.log('✏️ [Thunk] Updated order:', result);
      console.log("========== ✅ [Thunk] updateExistingOrder END ==========\n");
      return result;
    } catch (error) {
      console.error('❌ [Thunk] updateExistingOrder error:', error);
      console.error("========== ❌ [Thunk] updateExistingOrder END ==========\n");
      return rejectWithValue(error.response?.data?.message || "Failed to update order");
    }
  }
);

// Update order status
export const updateOrderStatusThunk = createAsyncThunk(
  "orders/updateStatus",
  async ({ id, status }, { rejectWithValue }) => {
    console.log("\n========== 🔄 [Thunk] updateOrderStatus START ==========");
    console.log('🔄 [Thunk] Order ID:', id);
    console.log('🔄 [Thunk] New status:', status);
    
    try {
      const response = await orderApi.updateOrderStatus(id, status);
      console.log('🔄 [Thunk] Response:', response);
      
      const result = response.order || response.data || response;
      console.log('🔄 [Thunk] Updated order:', result);
      console.log("========== ✅ [Thunk] updateOrderStatus END ==========\n");
      return result;
    } catch (error) {
      console.error('❌ [Thunk] updateOrderStatus error:', error);
      console.error("========== ❌ [Thunk] updateOrderStatus END ==========\n");
      return rejectWithValue(error.response?.data?.message || "Failed to update status");
    }
  }
);

// Delete order
export const deleteExistingOrder = createAsyncThunk(
  "orders/delete",
  async (id, { rejectWithValue }) => {
    console.log("\n========== 🗑️ [Thunk] deleteExistingOrder START ==========");
    console.log('🗑️ [Thunk] Order ID:', id);
    
    try {
      await orderApi.deleteOrder(id);
      console.log('🗑️ [Thunk] Order deleted successfully');
      console.log("========== ✅ [Thunk] deleteExistingOrder END ==========\n");
      return id;
    } catch (error) {
      console.error('❌ [Thunk] deleteExistingOrder error:', error);
      console.error("========== ❌ [Thunk] deleteExistingOrder END ==========\n");
      return rejectWithValue(error.response?.data?.message || "Failed to delete order");
    }
  }
);

// Add payment to order
export const addPayment = createAsyncThunk(
  "orders/addPayment",
  async ({ orderId, paymentData }, { rejectWithValue }) => {
    console.log("\n========== 💰 [Thunk] addPayment START ==========");
    console.log('💰 [Thunk] Order ID:', orderId);
    console.log('💰 [Thunk] Payment data:', paymentData);
    
    try {
      const response = await orderApi.addPaymentToOrder(orderId, paymentData);
      console.log('💰 [Thunk] Response:', response);
      
      const result = {
        orderId,
        payment: response.payment || response.data,
        updatedOrder: response.order || response
      };
      
      console.log('💰 [Thunk] Payment added:', result.payment);
      console.log("========== ✅ [Thunk] addPayment END ==========\n");
      return result;
    } catch (error) {
      console.error('❌ [Thunk] addPayment error:', error);
      console.error("========== ❌ [Thunk] addPayment END ==========\n");
      return rejectWithValue(error.response?.data?.message || "Failed to add payment");
    }
  }
);

// Get order payments
export const fetchOrderPayments = createAsyncThunk(
  "orders/fetchPayments",
  async (orderId, { rejectWithValue }) => {
    console.log("\n========== 💰 [Thunk] fetchOrderPayments START ==========");
    console.log('💰 [Thunk] Order ID:', orderId);
    
    try {
      const response = await orderApi.getOrderPayments(orderId);
      console.log('💰 [Thunk] Response:', response);
      
      let payments = [];
      if (response.payments) {
        payments = response.payments;
      } else if (response.data) {
        payments = response.data;
      } else if (Array.isArray(response)) {
        payments = response;
      }
      
      const result = {
        orderId,
        payments: payments
      };
      
      console.log('💰 [Thunk] Payments found:', payments.length);
      console.log("========== ✅ [Thunk] fetchOrderPayments END ==========\n");
      return result;
    } catch (error) {
      console.error('❌ [Thunk] fetchOrderPayments error:', error);
      console.error("========== ❌ [Thunk] fetchOrderPayments END ==========\n");
      return rejectWithValue(error.response?.data?.message || "Failed to fetch payments");
    }
  }
);

// ============================================
// 📅 NEW: Get delivery dates for calendar (RED DOTS - all customers)
// ============================================
export const fetchDeliveryDates = createAsyncThunk(
  "orders/fetchDeliveryDates",
  async ({ month, year }, { rejectWithValue }) => {
    console.log("\n========== 📅 [Thunk] fetchDeliveryDates START ==========");
    console.log('📅 [Thunk] Params:', { month, year });
    
    try {
      if (!month || !year) {
        return rejectWithValue("Month and year are required");
      }
      
      console.log(`📅 [Thunk] Fetching delivery dates for month: ${month}, year: ${year}`);
      
      const response = await orderApi.getDeliveryDates({ month, year });
      console.log('📅 [Thunk] Response:', response);
      
      const result = {
        allDates: response.allDates || [],  // [{ _id: "2026-03-05", count: 4 }]
        month,
        year
      };
      
      console.log('📅 [Thunk] Delivery dates found:', result.allDates.length);
      console.log('📅 [Thunk] First few dates:', result.allDates.slice(0, 3));
      console.log("========== ✅ [Thunk] fetchDeliveryDates END ==========\n");
      return result;
    } catch (error) {
      console.error('❌ [Thunk] fetchDeliveryDates error:', error);
      console.error('❌ [Thunk] Error response:', error.response?.data);
      console.error("========== ❌ [Thunk] fetchDeliveryDates END ==========\n");
      return rejectWithValue(error.response?.data?.message || "Failed to fetch delivery dates");
    }
  }
);

// ============================================
// 📊 INITIAL STATE
// ============================================
const initialState = {
  // Main orders list
  orders: [],
  recentOrders: [], // ✅ For dashboard
  currentOrder: null,
  currentPayments: [],
  currentWorks: [],
  
  // Customer-specific orders
  customerOrders: {}, // Store orders by customer ID
  
  // Ready to delivery orders
  readyToDelivery: {
    orders: [],
    count: 0,
    loading: false
  },
  
  // Statistics - MATCHES YOUR FRONTEND EXPECTATIONS
  stats: {
    total: 0,
    pending: 0,
    cutting: 0,
    stitching: 0,
    ready: 0,
    delivered: 0,
    cancelled: 0,
    draft: 0,
    confirmed: 0,
    'in-progress': 0,
    'ready-to-delivery': 0,
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    inProgress: 0,
    deliveries: {
      today: 0,
      tomorrow: 0,
      late: 0,
      total: 0
    },
    filterPeriod: 'month',
    startDate: null,
    endDate: null
  },
  
  // Dashboard data
  dashboard: {
    todayOrders: { count: 0, orders: [] },
    pendingDeliveries: { count: 0, orders: [] },
    readyForDelivery: { count: 0, orders: [] },
    recentOrders: [],
    todayCollection: 0,
    totalIncomeToday: 0,
    incomeBreakdown: {
      handCash: 0,
      bank: 0
    }
  },
  
  // Pagination
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  },
  
  // UI states
  loading: false,
  error: null,
  success: false,
  
  // Filter info (for debugging)
  currentFilter: null,
  
  // 📅 Calendar state for delivery dates (RED DOTS - all customers)
  deliveryCalendar: {
    deliveryDates: [], // Array of { _id: "2026-03-05", count: 4 }
    loading: false,
    month: null,
    year: null
  }
};

// ============================================
// 🎯 ORDER SLICE
// ============================================
const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    clearOrderError: (state) => {
      console.log('🧹 [Reducer] clearOrderError');
      state.error = null;
    },
    clearCurrentOrder: (state) => {
      console.log('🧹 [Reducer] clearCurrentOrder');
      state.currentOrder = null;
      state.currentPayments = [];
      state.currentWorks = [];
    },
    clearCustomerOrders: (state, action) => {
      const { customerId } = action.payload || {};
      console.log('🧹 [Reducer] clearCustomerOrders for:', customerId || 'all');
      if (customerId) {
        delete state.customerOrders[customerId];
      } else {
        state.customerOrders = {};
      }
    },
    clearReadyToDelivery: (state) => {
      console.log('🧹 [Reducer] clearReadyToDelivery');
      state.readyToDelivery = {
        orders: [],
        count: 0,
        loading: false
      };
    },
    setPagination: (state, action) => {
      console.log('📄 [Reducer] setPagination:', action.payload);
      state.pagination = { ...state.pagination, ...action.payload };
    },
    resetOrderState: () => {
      console.log('🔄 [Reducer] resetOrderState');
      return initialState;
    },
    
    // ✅ Clear recent orders (useful when changing filters)
    clearRecentOrders: (state) => {
      console.log('🧹 [Reducer] clearRecentOrders');
      state.recentOrders = [];
    },
    
    // ✅ Set current filter (for debugging)
    setCurrentFilter: (state, action) => {
      console.log('🔍 [Reducer] setCurrentFilter:', action.payload);
      state.currentFilter = action.payload;
    },
    
    // ✅ Update stats manually (if needed)
    updateStats: (state, action) => {
      console.log('📊 [Reducer] updateStats:', action.payload);
      state.stats = { ...state.stats, ...action.payload };
    },
    
    // 📅 NEW: Delivery calendar reducers (red dots)
    clearDeliveryCalendar: (state) => {
      console.log('🧹 [Reducer] clearDeliveryCalendar');
      state.deliveryCalendar = {
        deliveryDates: [],
        loading: false,
        month: null,
        year: null
      };
    },
    setDeliveryCalendarMonth: (state, action) => {
      const { month, year } = action.payload;
      console.log('📅 [Reducer] setDeliveryCalendarMonth:', { month, year });
      state.deliveryCalendar.month = month;
      state.deliveryCalendar.year = year;
    }
  },
  extraReducers: (builder) => {
    builder
      // ===== FETCH STATS =====
      .addCase(fetchOrderStats.pending, (state) => {
        console.log('⏳ [Reducer] fetchOrderStats pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderStats.fulfilled, (state, action) => {
        console.log('✅ [Reducer] fetchOrderStats fulfilled');
        console.log('✅ [Reducer] Payload:', action.payload);
        state.loading = false;
        
        const payloadData = action.payload || {};
        
        // Merge with existing stats
        state.stats = {
          ...state.stats,
          ...payloadData,
          // Ensure all required fields exist
          total: payloadData.total || payloadData.totalOrders || 0,
          pending: payloadData.pending || payloadData.pendingOrders || 0,
          cutting: payloadData.cutting || 0,
          stitching: payloadData.stitching || 0,
          ready: payloadData.ready || payloadData.readyOrders || 0,
          delivered: payloadData.delivered || payloadData.deliveredOrders || 0,
          cancelled: payloadData.cancelled || 0,
          draft: payloadData.draft || 0,
          trial: payloadData.trial || 0,
          confirmed: payloadData.confirmed || payloadData.confirmedOrders || 0,
          'in-progress': payloadData['in-progress'] || payloadData.inProductionOrders || 0,
          'ready-to-delivery': payloadData['ready-to-delivery'] || payloadData.readyOrders || 0,
          today: payloadData.today || 0,
          thisWeek: payloadData.thisWeek || 0,
          thisMonth: payloadData.thisMonth || 0,
          inProgress: payloadData.inProgress || payloadData.inProductionOrders || payloadData.cutting || 0,
          overdue: payloadData.overdue || payloadData.overdueOrders || 0,
          revenue: payloadData.revenue || payloadData.totalRevenue || 0
        };
        
        console.log('📊 [Reducer] Updated stats:', state.stats);
      })
      .addCase(fetchOrderStats.rejected, (state, action) => {
        console.error('❌ [Reducer] fetchOrderStats rejected:', action.payload);
        state.loading = false;
        state.error = action.payload;
      })

      // ===== FETCH DASHBOARD =====
      .addCase(fetchDashboardData.pending, (state) => {
        console.log('⏳ [Reducer] fetchDashboardData pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        console.log('✅ [Reducer] fetchDashboardData fulfilled:', action.payload);
        state.loading = false;
        state.dashboard = {
          ...state.dashboard,
          ...action.payload
        };
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        console.error('❌ [Reducer] fetchDashboardData rejected:', action.payload);
        state.loading = false;
        state.error = action.payload;
      })

      // ===== FETCH RECENT ORDERS =====
      .addCase(fetchRecentOrders.pending, (state) => {
        console.log('⏳ [Reducer] fetchRecentOrders pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecentOrders.fulfilled, (state, action) => {
        console.log('✅ [Reducer] fetchRecentOrders fulfilled');
        console.log('✅ [Reducer] Payload:', action.payload);
        state.loading = false;
        
        state.recentOrders = action.payload.orders || [];
        state.currentFilter = action.payload.filter || null;
        
        // Also update dashboard.recentOrders for backward compatibility
        state.dashboard.recentOrders = action.payload.orders || [];
        
        console.log('📋 [Reducer] Updated recentOrders count:', state.recentOrders.length);
        if (state.recentOrders.length > 0) {
          console.log('📋 [Reducer] First recent order:', state.recentOrders[0]);
        }
      })
      .addCase(fetchRecentOrders.rejected, (state, action) => {
        console.error('❌ [Reducer] fetchRecentOrders rejected:', action.payload);
        state.loading = false;
        state.error = action.payload;
        state.recentOrders = []; // Clear on error
      })

      // ===== FETCH READY TO DELIVERY ORDERS =====
      .addCase(fetchReadyToDeliveryOrders.pending, (state) => {
        console.log('⏳ [Reducer] fetchReadyToDeliveryOrders pending');
        state.readyToDelivery.loading = true;
        state.error = null;
      })
      .addCase(fetchReadyToDeliveryOrders.fulfilled, (state, action) => {
        console.log('✅ [Reducer] fetchReadyToDeliveryOrders fulfilled:', action.payload);
        state.readyToDelivery.loading = false;
        state.readyToDelivery.orders = action.payload.orders || [];
        state.readyToDelivery.count = action.payload.count || 0;
      })
      .addCase(fetchReadyToDeliveryOrders.rejected, (state, action) => {
        console.error('❌ [Reducer] fetchReadyToDeliveryOrders rejected:', action.payload);
        state.readyToDelivery.loading = false;
        state.error = action.payload;
      })

      // ===== CREATE ORDER =====
      .addCase(createNewOrder.pending, (state) => {
        console.log('⏳ [Reducer] createNewOrder pending');
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createNewOrder.fulfilled, (state, action) => {
        console.log('✅ [Reducer] createNewOrder fulfilled');
        console.log('✅ [Reducer] New order:', action.payload);
        state.loading = false;
        
        // 🔥 FIX: Check if order already exists in state (prevent duplicates)
        const exists = state.orders.some(o => o._id === action.payload._id);
        if (!exists) {
          state.orders.unshift(action.payload);
          state.recentOrders.unshift(action.payload);
          
          // Update stats (increment counts)
          if (action.payload.status) {
            const status = action.payload.status;
            if (status === 'confirmed') state.stats.pending += 1;
            else if (status === 'in-progress') {
              state.stats.cutting += 1;
              state.stats.stitching += 1;
              state.stats.inProgress += 1;
            }
            else if (status === 'ready-to-delivery') state.stats.ready += 1;
            else if (status === 'delivered') state.stats.delivered += 1;
            else if (status === 'draft') state.stats.draft += 1;
          }
          state.stats.total += 1;
          
          // Add to customerOrders if customer exists
          if (action.payload.customer) {
            const customerId = action.payload.customer._id || action.payload.customer;
            if (!state.customerOrders[customerId]) {
              state.customerOrders[customerId] = [];
            }
            state.customerOrders[customerId].unshift(action.payload);
          }

          // If order is ready-to-delivery, add to readyToDelivery list
          if (action.payload.status === 'ready-to-delivery') {
            state.readyToDelivery.orders.unshift(action.payload);
            state.readyToDelivery.count += 1;
          }
        } else {
          console.log('⚠️ [Reducer] Order already exists in state, skipping duplicate');
        }
        
        console.log('📊 [Reducer] Updated stats after create:', state.stats);
        state.success = true;
      })
      .addCase(createNewOrder.rejected, (state, action) => {
        console.error('❌ [Reducer] createNewOrder rejected:', action.payload);
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // ===== FETCH ALL ORDERS =====
      .addCase(fetchOrders.pending, (state) => {
        console.log('⏳ [Reducer] fetchOrders pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        console.log('✅ [Reducer] fetchOrders fulfilled');
        console.log('✅ [Reducer] Orders count:', action.payload.orders?.length);
        state.loading = false;
        state.orders = action.payload.orders || [];
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        console.error('❌ [Reducer] fetchOrders rejected:', action.payload);
        state.loading = false;
        state.error = action.payload;
      })

      // ===== FETCH ORDERS BY CUSTOMER =====
      .addCase(fetchOrdersByCustomer.pending, (state) => {
        console.log('⏳ [Reducer] fetchOrdersByCustomer pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrdersByCustomer.fulfilled, (state, action) => {
        console.log('✅ [Reducer] fetchOrdersByCustomer fulfilled for customer:', action.payload.customerId);
        console.log('✅ [Reducer] Orders found:', action.payload.orders?.length);
        state.loading = false;
        const { customerId, orders } = action.payload;
        state.customerOrders[customerId] = orders || [];
      })
      .addCase(fetchOrdersByCustomer.rejected, (state, action) => {
        console.error('❌ [Reducer] fetchOrdersByCustomer rejected:', action.payload);
        state.loading = false;
        state.error = action.payload;
      })

      // ===== FETCH ORDER BY ID =====
      .addCase(fetchOrderById.pending, (state) => {
        console.log('⏳ [Reducer] fetchOrderById pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        console.log('✅ [Reducer] fetchOrderById fulfilled for order:', action.payload.order?._id);
        console.log('✅ [Reducer] Payments:', action.payload.payments?.length);
        console.log('✅ [Reducer] Works:', action.payload.works?.length);
        state.loading = false;
        state.currentOrder = action.payload.order;
        state.currentPayments = action.payload.payments || [];
        state.currentWorks = action.payload.works || [];
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        console.error('❌ [Reducer] fetchOrderById rejected:', action.payload);
        state.loading = false;
        state.error = action.payload;
      })

      // ===== UPDATE ORDER =====
      .addCase(updateExistingOrder.pending, (state) => {
        console.log('⏳ [Reducer] updateExistingOrder pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(updateExistingOrder.fulfilled, (state, action) => {
        console.log('✅ [Reducer] updateExistingOrder fulfilled');
        console.log('✅ [Reducer] Updated order:', action.payload?._id);
        state.loading = false;
        const updatedOrder = action.payload;
        
        // Update in main orders array
        const index = state.orders.findIndex(o => o?._id === updatedOrder?._id);
        if (index !== -1) {
          state.orders[index] = updatedOrder;
          console.log('✅ [Reducer] Updated in main orders');
        }
        
        // Update in recent orders
        const recentIndex = state.recentOrders.findIndex(o => o?._id === updatedOrder?._id);
        if (recentIndex !== -1) {
          state.recentOrders[recentIndex] = updatedOrder;
          console.log('✅ [Reducer] Updated in recent orders');
        }
        
        // Update in customerOrders if customer exists
        if (updatedOrder?.customer) {
          const customerId = updatedOrder.customer._id || updatedOrder.customer;
          if (state.customerOrders[customerId]) {
            const custIndex = state.customerOrders[customerId].findIndex(o => o?._id === updatedOrder?._id);
            if (custIndex !== -1) {
              state.customerOrders[customerId][custIndex] = updatedOrder;
              console.log('✅ [Reducer] Updated in customer orders');
            }
          }
        }
        
        // Update in readyToDelivery list if needed
        const readyIndex = state.readyToDelivery.orders.findIndex(o => o?._id === updatedOrder?._id);
        if (updatedOrder?.status === 'ready-to-delivery') {
          if (readyIndex === -1) {
            state.readyToDelivery.orders.unshift(updatedOrder);
            state.readyToDelivery.count += 1;
            console.log('✅ [Reducer] Added to readyToDelivery');
          } else {
            state.readyToDelivery.orders[readyIndex] = updatedOrder;
            console.log('✅ [Reducer] Updated in readyToDelivery');
          }
        } else if (readyIndex !== -1) {
          // If status changed from ready-to-delivery to something else, remove from list
          state.readyToDelivery.orders.splice(readyIndex, 1);
          state.readyToDelivery.count -= 1;
          console.log('✅ [Reducer] Removed from readyToDelivery');
        }
        
        // Update currentOrder if it's the same
        if (state.currentOrder?._id === updatedOrder?._id) {
          state.currentOrder = updatedOrder;
          console.log('✅ [Reducer] Updated currentOrder');
        }
        state.success = true;
      })
      .addCase(updateExistingOrder.rejected, (state, action) => {
        console.error('❌ [Reducer] updateExistingOrder rejected:', action.payload);
        state.loading = false;
        state.error = action.payload;
      })

      // ===== UPDATE ORDER STATUS =====
      .addCase(updateOrderStatusThunk.pending, (state) => {
        console.log('⏳ [Reducer] updateOrderStatusThunk pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderStatusThunk.fulfilled, (state, action) => {
        console.log('✅ [Reducer] updateOrderStatusThunk fulfilled');
        console.log('✅ [Reducer] Updated order status:', action.payload?.status);
        state.loading = false;
        const updatedOrder = action.payload;
        
        // Update in main orders array
        const index = state.orders.findIndex(o => o?._id === updatedOrder?._id);
        if (index !== -1) {
          state.orders[index] = updatedOrder;
        }
        
        // Update in recent orders
        const recentIndex = state.recentOrders.findIndex(o => o?._id === updatedOrder?._id);
        if (recentIndex !== -1) {
          state.recentOrders[recentIndex] = updatedOrder;
        }
        
        // Update in customerOrders if customer exists
        if (updatedOrder?.customer) {
          const customerId = updatedOrder.customer._id || updatedOrder.customer;
          if (state.customerOrders[customerId]) {
            const custIndex = state.customerOrders[customerId].findIndex(o => o?._id === updatedOrder?._id);
            if (custIndex !== -1) {
              state.customerOrders[customerId][custIndex] = updatedOrder;
            }
          }
        }
        
        // Update in readyToDelivery list based on status
        const readyIndex = state.readyToDelivery.orders.findIndex(o => o?._id === updatedOrder?._id);
        if (updatedOrder?.status === 'ready-to-delivery') {
          if (readyIndex === -1) {
            state.readyToDelivery.orders.unshift(updatedOrder);
            state.readyToDelivery.count += 1;
          } else {
            state.readyToDelivery.orders[readyIndex] = updatedOrder;
          }
        } else if (readyIndex !== -1) {
          // If status changed from ready-to-delivery to something else
          state.readyToDelivery.orders.splice(readyIndex, 1);
          state.readyToDelivery.count -= 1;
        }
        
        // Update currentOrder if it's the same
        if (state.currentOrder?._id === updatedOrder?._id) {
          state.currentOrder = updatedOrder;
        }
        
        console.log('✅ [Reducer] Status update complete');
      })
      .addCase(updateOrderStatusThunk.rejected, (state, action) => {
        console.error('❌ [Reducer] updateOrderStatusThunk rejected:', action.payload);
        state.loading = false;
        state.error = action.payload;
      })

      // ===== DELETE ORDER =====
      .addCase(deleteExistingOrder.pending, (state) => {
        console.log('⏳ [Reducer] deleteExistingOrder pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteExistingOrder.fulfilled, (state, action) => {
        console.log('✅ [Reducer] deleteExistingOrder fulfilled for ID:', action.payload);
        state.loading = false;
        const deletedId = action.payload;
        
        // Remove from main orders array
        const beforeCount = state.orders.length;
        state.orders = state.orders.filter(o => o?._id !== deletedId);
        console.log('✅ [Reducer] Removed from orders:', beforeCount - state.orders.length);
        
        // Remove from recent orders
        state.recentOrders = state.recentOrders.filter(o => o?._id !== deletedId);
        
        // Remove from all customerOrders entries
        Object.keys(state.customerOrders).forEach(customerId => {
          state.customerOrders[customerId] = state.customerOrders[customerId].filter(
            o => o?._id !== deletedId
          );
        });
        
        // Remove from readyToDelivery list
        const readyIndex = state.readyToDelivery.orders.findIndex(o => o?._id === deletedId);
        if (readyIndex !== -1) {
          state.readyToDelivery.orders.splice(readyIndex, 1);
          state.readyToDelivery.count -= 1;
        }
        
        // Clear currentOrder if it's the deleted one
        if (state.currentOrder?._id === deletedId) {
          state.currentOrder = null;
          state.currentPayments = [];
          state.currentWorks = [];
        }
        
        // Update stats
        state.stats.total = Math.max(0, state.stats.total - 1);
        state.success = true;
      })
      .addCase(deleteExistingOrder.rejected, (state, action) => {
        console.error('❌ [Reducer] deleteExistingOrder rejected:', action.payload);
        state.loading = false;
        state.error = action.payload;
      })

      // ===== ADD PAYMENT =====
      .addCase(addPayment.pending, (state) => {
        console.log('⏳ [Reducer] addPayment pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(addPayment.fulfilled, (state, action) => {
        console.log('✅ [Reducer] addPayment fulfilled');
        console.log('✅ [Reducer] Payment:', action.payload.payment);
        state.loading = false;
        const { orderId, payment, updatedOrder } = action.payload;
        
        // Update currentOrder if it matches
        if (state.currentOrder?._id === orderId) {
          state.currentOrder = updatedOrder || state.currentOrder;
          state.currentPayments.push(payment);
          console.log('✅ [Reducer] Updated currentOrder with payment');
        }
        
        // Update in orders list
        const orderIndex = state.orders.findIndex(o => o?._id === orderId);
        if (orderIndex !== -1 && updatedOrder) {
          state.orders[orderIndex] = updatedOrder;
        }
        
        // Update in recent orders
        const recentIndex = state.recentOrders.findIndex(o => o?._id === orderId);
        if (recentIndex !== -1 && updatedOrder) {
          state.recentOrders[recentIndex] = updatedOrder;
        }
        
        state.success = true;
      })
      .addCase(addPayment.rejected, (state, action) => {
        console.error('❌ [Reducer] addPayment rejected:', action.payload);
        state.loading = false;
        state.error = action.payload;
      })

      // ===== FETCH ORDER PAYMENTS =====
      .addCase(fetchOrderPayments.pending, (state) => {
        console.log('⏳ [Reducer] fetchOrderPayments pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderPayments.fulfilled, (state, action) => {
        console.log('✅ [Reducer] fetchOrderPayments fulfilled for order:', action.payload.orderId);
        console.log('✅ [Reducer] Payments found:', action.payload.payments?.length);
        state.loading = false;
        if (state.currentOrder?._id === action.payload.orderId) {
          state.currentPayments = action.payload.payments || [];
        }
      })
      .addCase(fetchOrderPayments.rejected, (state, action) => {
        console.error('❌ [Reducer] fetchOrderPayments rejected:', action.payload);
        state.loading = false;
        state.error = action.payload;
      })

      // ===== 📅 FETCH DELIVERY DATES (RED DOTS - ALL CUSTOMERS) =====
      .addCase(fetchDeliveryDates.pending, (state) => {
        console.log('⏳ [Reducer] fetchDeliveryDates pending');
        state.deliveryCalendar.loading = true;
        state.error = null;
      })
      .addCase(fetchDeliveryDates.fulfilled, (state, action) => {
        console.log('✅ [Reducer] fetchDeliveryDates fulfilled');
        console.log('✅ [Reducer] Delivery dates received:', action.payload.allDates?.length);
        console.log('✅ [Reducer] First few dates:', action.payload.allDates?.slice(0, 3));
        state.deliveryCalendar.loading = false;
        state.deliveryCalendar.deliveryDates = action.payload.allDates || [];
        state.deliveryCalendar.month = action.payload.month;
        state.deliveryCalendar.year = action.payload.year;
      })
      .addCase(fetchDeliveryDates.rejected, (state, action) => {
        console.error('❌ [Reducer] fetchDeliveryDates rejected:', action.payload);
        state.deliveryCalendar.loading = false;
        state.error = action.payload;
        state.deliveryCalendar.deliveryDates = [];
      });
  }
});

// ============================================
// 📤 EXPORT ACTIONS & REDUCER
// ============================================
export const { 
  clearOrderError, 
  clearCurrentOrder,
  clearCustomerOrders,
  clearReadyToDelivery,
  clearRecentOrders,
  setCurrentFilter,
  setPagination, 
  resetOrderState,
  updateStats,
  // 📅 NEW: Delivery calendar actions (red dots)
  clearDeliveryCalendar,
  setDeliveryCalendarMonth
} = orderSlice.actions;

// ============================================
// ✅ FIXED SELECTORS
// ============================================

// Helper to get order state
const getOrderState = (state) => {
  const orderState = state.order || state.orders || {};
  return orderState;
};

export const selectAllOrders = (state) => {
  const orderState = getOrderState(state);
  return orderState.orders || [];
};

export const selectRecentOrders = (state) => {
  const orderState = getOrderState(state);
  return orderState.recentOrders || [];
};

export const selectOrderStats = (state) => {
  const orderState = getOrderState(state);
  const stats = orderState.stats || {};
  
  return {
    total: stats.total || 0,
    pending: stats.pending || 0,
    cutting: stats.cutting || 0,
    stitching: stats.stitching || 0,
    ready: stats.ready || 0,
    delivered: stats.delivered || 0,
    cancelled: stats.cancelled || 0,
    draft: stats.draft || 0,
    confirmed: stats.confirmed || 0,
    'in-progress': stats['in-progress'] || 0,
    'ready-to-delivery': stats['ready-to-delivery'] || 0,
    today: stats.today || 0,
    thisWeek: stats.thisWeek || 0,
    thisMonth: stats.thisMonth || 0,
    inProgress: stats.inProgress || stats.cutting || 0,
    deliveries: stats.deliveries || {
      today: 0,
      tomorrow: 0,
      late: 0,
      total: 0
    },
    filterPeriod: stats.filterPeriod || 'month',
    startDate: stats.startDate || null,
    endDate: stats.endDate || null
  };
};

export const selectCurrentOrder = (state) => {
  const orderState = getOrderState(state);
  return orderState.currentOrder || null;
};

export const selectOrderLoading = (state) => {
  const orderState = getOrderState(state);
  return orderState.loading || false;
};

export const selectOrderError = (state) => {
  const orderState = getOrderState(state);
  return orderState.error || null;
};

export const selectReadyToDelivery = (state) => {
  const orderState = getOrderState(state);
  return orderState.readyToDelivery || {
    orders: [],
    count: 0,
    loading: false
  };
};

export const selectOrdersByCustomer = (customerId) => (state) => {
  const orderState = getOrderState(state);
  return orderState.customerOrders?.[customerId] || [];
};

export const selectOrderPagination = (state) => {
  const orderState = getOrderState(state);
  return orderState.pagination || {
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  };
};

export const selectDashboardData = (state) => {
  const orderState = getOrderState(state);
  return orderState.dashboard || {
    todayOrders: { count: 0, orders: [] },
    pendingDeliveries: { count: 0, orders: [] },
    readyForDelivery: { count: 0, orders: [] },
    recentOrders: [],
    todayCollection: 0,
    totalIncomeToday: 0,
    incomeBreakdown: {
      handCash: 0,
      bank: 0
    }
  };
};

// ============================================
// 📅 DELIVERY DATES SELECTORS - For Calendar Red Dots
// ============================================

export const selectDeliveryDates = (state) => {
  const orderState = getOrderState(state);
  return orderState.deliveryCalendar?.deliveryDates || [];
};

export const selectDeliveryCalendarLoading = (state) => {
  const orderState = getOrderState(state);
  return orderState.deliveryCalendar?.loading || false;
};

export const selectDeliveryCalendarMonth = (state) => {
  const orderState = getOrderState(state);
  return {
    month: orderState.deliveryCalendar?.month,
    year: orderState.deliveryCalendar?.year
  };
};

// ============================================
// ✅ DEFAULT EXPORT
// ============================================
export default orderSlice.reducer;