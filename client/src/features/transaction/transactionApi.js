// // features/transaction/transactionApi.js
// import API from "../../app/axios";

// // Get all transactions with filters
// export const getTransactions = async (filters = {}) => {
//   const queryParams = new URLSearchParams();
  
//   Object.entries(filters).forEach(([key, value]) => {
//     if (value !== '' && value !== null && value !== undefined) {
//       queryParams.append(key, value);
//     }
//   });

//   const response = await API.get(`/transactions?${queryParams}`);
//   return response.data;
// };

// // Create new transaction
// export const createTransaction = async (transactionData) => {
//   const response = await API.post('/transactions', transactionData);
//   return response.data;
// };

// // Delete transaction (Admin only)
// export const deleteTransaction = async (id) => {
//   const response = await API.delete(`/transactions/${id}`);
//   return response.data;
// };

// // Get transaction summary
// export const getTransactionSummary = async (period = 'month') => {
//   const response = await API.get(`/transactions/summary?period=${period}`);
//   return response.data;
// };









// // features/transaction/transactionApi.js - COMPLETE UPDATED VERSION
// import API from "../../app/axios";

// // ============================================
// // ✅ BASIC TRANSACTION APIs
// // ============================================

// // Get all transactions with filters
// export const getTransactions = async (filters = {}) => {
//   const queryParams = new URLSearchParams();
  
//   Object.entries(filters).forEach(([key, value]) => {
//     if (value !== '' && value !== null && value !== undefined) {
//       queryParams.append(key, value);
//     }
//   });

//   const response = await API.get(`/transactions?${queryParams}`);
//   return response.data;
// };

// // Get transaction by ID
// export const getTransactionById = async (id) => {
//   const response = await API.get(`/transactions/${id}`);
//   return response.data;
// };

// // Create new transaction
// export const createTransaction = async (transactionData) => {
//   const response = await API.post('/transactions', transactionData);
//   return response.data;
// };

// // Update transaction (Admin only)
// export const updateTransaction = async (id, transactionData) => {
//   const response = await API.put(`/transactions/${id}`, transactionData);
//   return response.data;
// };

// // Delete transaction (Admin only)
// export const deleteTransaction = async (id) => {
//   const response = await API.delete(`/transactions/${id}`);
//   return response.data;
// };

// // Get transaction summary
// export const getTransactionSummary = async (period = 'month') => {
//   const response = await API.get(`/transactions/summary?period=${period}`);
//   return response.data;
// };

// // Get transaction statistics
// export const getTransactionStats = async () => {
//   const response = await API.get('/transactions/stats');
//   return response.data;
// };

// // ============================================
// // ✅ ORDER-SPECIFIC APIs
// // ============================================

// // Get transactions by order ID
// export const getTransactionsByOrder = async (orderId) => {
//   const response = await API.get(`/transactions/order/${orderId}`);
//   return response.data;
// };

// // ============================================
// // ✅ CUSTOMER-SPECIFIC APIs
// // ============================================

// // Get transactions by customer ID
// export const getTransactionsByCustomer = async (customerId, params = {}) => {
//   const queryParams = new URLSearchParams();
  
//   Object.entries(params).forEach(([key, value]) => {
//     if (value !== '' && value !== null && value !== undefined) {
//       queryParams.append(key, value);
//     }
//   });

//   const response = await API.get(`/transactions/customer/${customerId}?${queryParams}`);
//   return response.data;
// };

// // ============================================
// // ✅ DATE RANGE APIs
// // ============================================

// // Get transactions by date range
// export const getTransactionsByDateRange = async (start, end, params = {}) => {
//   const queryParams = new URLSearchParams();
  
//   Object.entries(params).forEach(([key, value]) => {
//     if (value !== '' && value !== null && value !== undefined) {
//       queryParams.append(key, value);
//     }
//   });

//   const response = await API.get(`/transactions/range/${start}/${end}?${queryParams}`);
//   return response.data;
// };

// // ============================================
// // ✅ EXPORT APIs
// // ============================================

// // Export transactions
// export const exportTransactions = async (filters = {}) => {
//   const queryParams = new URLSearchParams();
  
//   Object.entries(filters).forEach(([key, value]) => {
//     if (value !== '' && value !== null && value !== undefined) {
//       queryParams.append(key, value);
//     }
//   });

//   const response = await API.get(`/transactions/export/all?${queryParams}`);
//   return response.data;
// };

// // ============================================
// // ✅ AUTO-INCOME APIs (NEW)
// // ============================================

// // Get all auto incomes
// export const getAutoIncomes = async (filters = {}) => {
//   const queryParams = new URLSearchParams();
  
//   Object.entries(filters).forEach(([key, value]) => {
//     if (value !== '' && value !== null && value !== undefined) {
//       queryParams.append(key, value);
//     }
//   });

//   const response = await API.get(`/transactions/auto-income?${queryParams}`);
//   return response.data;
// };

// // Setup new auto income
// export const setupAutoIncome = async (autoIncomeData) => {
//   const response = await API.post('/transactions/auto-income/setup', autoIncomeData);
//   return response.data;
// };

// // Update auto income
// export const updateAutoIncome = async (id, autoIncomeData) => {
//   const response = await API.put(`/transactions/auto-income/${id}`, autoIncomeData);
//   return response.data;
// };

// // Delete auto income
// export const deleteAutoIncome = async (id) => {
//   const response = await API.delete(`/transactions/auto-income/${id}`);
//   return response.data;
// };

// // Pause auto income
// export const pauseAutoIncome = async (id) => {
//   const response = await API.patch(`/transactions/auto-income/${id}/pause`);
//   return response.data;
// };

// // Resume auto income
// export const resumeAutoIncome = async (id) => {
//   const response = await API.patch(`/transactions/auto-income/${id}/resume`);
//   return response.data;
// };

// // Get upcoming auto incomes
// export const getUpcomingAutoIncomes = async (days = 30) => {
//   const response = await API.get(`/transactions/auto-income/upcoming?days=${days}`);
//   return response.data;
// };

// // Get auto income statistics
// export const getAutoIncomeStats = async () => {
//   const response = await API.get('/transactions/auto-income/stats');
//   return response.data;
// };

// // ============================================
// // ✅ BULK OPERATIONS APIs
// // ============================================

// // Bulk delete transactions (Admin only)
// export const bulkDeleteTransactions = async (ids) => {
//   const response = await API.delete('/transactions/bulk/delete', { data: { ids } });
//   return response.data;
// };

// // ============================================
// // ✅ DASHBOARD API
// // ============================================

// // Get dashboard data
// export const getDashboardData = async () => {
//   const response = await API.get('/transactions/dashboard');
//   return response.data;
// };




















// features/transaction/transactionApi.js - COMPLETE UPDATED VERSION
import API from "../../app/axios";

// ============================================
// ✅ BASIC TRANSACTION APIs
// ============================================

// Get all transactions with filters
export const getTransactions = async (filters = {}) => {
  const queryParams = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) {
      queryParams.append(key, value);
    }
  });

  const response = await API.get(`/transactions?${queryParams}`);
  return response.data;
};

export const getTodayTransactions = async () => {
  // Use the working summary endpoint with period=today
  const response = await API.get('/transactions/summary', { 
    params: { period: 'today' } 
  });
  return response.data;
};

// Get transaction by ID
export const getTransactionById = async (id) => {
  const response = await API.get(`/transactions/${id}`);
  return response.data;
};

// Create new transaction
export const createTransaction = async (transactionData) => {
  const response = await API.post('/transactions', transactionData);
  return response.data;
};

// Update transaction (Admin only)
export const updateTransaction = async (id, transactionData) => {
  const response = await API.put(`/transactions/${id}`, transactionData);
  return response.data;
};

// Delete transaction (Admin only)
export const deleteTransaction = async (id) => {
  const response = await API.delete(`/transactions/${id}`);
  return response.data;
};

// Get transaction summary
export const getTransactionSummary = async (period = 'month') => {
  const response = await API.get(`/transactions/summary?period=${period}`);
  return response.data;
};

// Get transaction statistics
export const getTransactionStats = async () => {
  const response = await API.get('/transactions/stats');
  return response.data;
};

// Get distinct months that actually have transaction data — powers the
// dynamic month filter dropdown (no hardcoded month list).
export const getTransactionMonths = async (params = {}) => {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) {
      queryParams.append(key, value);
    }
  });
  const response = await API.get(`/transactions/months?${queryParams}`);
  return response.data;
};

// ✅ NEW: Get daily revenue stats for charts
export const getDailyRevenueStats = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) {
      queryParams.append(key, value);
    }
  });

  const response = await API.get(`/transactions/daily-stats?${queryParams}`);
  return response.data;
};

// ============================================
// ✅ ORDER-SPECIFIC APIs
// ============================================

// Get transactions by order ID
export const getTransactionsByOrder = async (orderId) => {
  const response = await API.get(`/transactions/order/${orderId}`);
  return response.data;
};

// ============================================
// ✅ CUSTOMER-SPECIFIC APIs
// ============================================

// Get transactions by customer ID
export const getTransactionsByCustomer = async (customerId, params = {}) => {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) {
      queryParams.append(key, value);
    }
  });

  const response = await API.get(`/transactions/customer/${customerId}?${queryParams}`);
  return response.data;
};

// ============================================
// ✅ DATE RANGE APIs
// ============================================

// Get transactions by date range
export const getTransactionsByDateRange = async (start, end, params = {}) => {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) {
      queryParams.append(key, value);
    }
  });

  const response = await API.get(`/transactions/range/${start}/${end}?${queryParams}`);
  return response.data;
};

// ============================================
// ✅ EXPORT APIs
// ============================================

// Export transactions
export const exportTransactions = async (filters = {}) => {
  const queryParams = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) {
      queryParams.append(key, value);
    }
  });

  const response = await API.get(`/transactions/export/all?${queryParams}`);
  return response.data;
};

// ============================================
// ✅ AUTO-INCOME APIs
// ============================================



// Get all auto incomes
export const getAutoIncomes = async (filters = {}) => {
  const queryParams = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) {
      queryParams.append(key, value);
    }
  });

  const response = await API.get(`/transactions/auto-income?${queryParams}`);
  return response.data;
};

// Setup new auto income
export const setupAutoIncome = async (autoIncomeData) => {
  const response = await API.post('/transactions/auto-income/setup', autoIncomeData);
  return response.data;
};

// Update auto income
export const updateAutoIncome = async (id, autoIncomeData) => {
  const response = await API.put(`/transactions/auto-income/${id}`, autoIncomeData);
  return response.data;
};

// Delete auto income
export const deleteAutoIncome = async (id) => {
  const response = await API.delete(`/transactions/auto-income/${id}`);
  return response.data;
};

// Pause auto income
export const pauseAutoIncome = async (id) => {
  const response = await API.patch(`/transactions/auto-income/${id}/pause`);
  return response.data;
};

// Resume auto income
export const resumeAutoIncome = async (id) => {
  const response = await API.patch(`/transactions/auto-income/${id}/resume`);
  return response.data;
};

// Get upcoming auto incomes
export const getUpcomingAutoIncomes = async (days = 30) => {
  const response = await API.get(`/transactions/auto-income/upcoming?days=${days}`);
  return response.data;
};

// Get auto income statistics
export const getAutoIncomeStats = async () => {
  const response = await API.get('/transactions/auto-income/stats');
  return response.data;
};

// ============================================
// ✅ BULK OPERATIONS APIs
// ============================================

// Bulk delete transactions (Admin only)
export const bulkDeleteTransactions = async (ids) => {
  const response = await API.delete('/transactions/bulk/delete', { data: { ids } });
  return response.data;
};

// ============================================
// ✅ DASHBOARD APIs
// ============================================

// Get dashboard data
export const getDashboardData = async () => {
  const response = await API.get('/transactions/dashboard');
  return response.data;
};

// // ✅ NEW: Get today's transactions
// export const getTodayTransactions = async () => {
//   const response = await API.get('/transactions/summary/today');
//   return response.data;
// };

