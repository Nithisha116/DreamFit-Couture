// // // features/transaction/transactionSlice.js
// // import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// // import showToast from '../../utils/toast';
// // import * as transactionApi from './transactionApi';

// // const initialState = {
// //   // Separate states for different views
// //   allTransactions: [],        // For overview (both income & expense)
// //   incomeTransactions: [],     // For income page
// //   expenseTransactions: [],    // For expense page
// //   currentTransaction: null,
  
// //   summary: {
// //     totalIncome: 0,
// //     totalExpense: 0,
// //     netBalance: 0,
// //     handCash: {
// //       income: 0,
// //       expense: 0,
// //       balance: 0
// //     },
// //     bank: {
// //       income: 0,
// //       expense: 0,
// //       balance: 0
// //     },
// //     totalBalance: 0
// //   },
  
// //   pagination: {
// //     page: 1,
// //     limit: 20,
// //     total: 0,
// //     pages: 0
// //   },
  
// //   loading: false,
// //   error: null,
  
// //   filters: {
// //     type: '',
// //     accountType: '',
// //     category: '',
// //     startDate: '',
// //     endDate: '',
// //     page: 1,
// //     limit: 20,
// //     sortBy: 'transactionDate',
// //     sortOrder: 'desc'
// //   }
// // };

// // // ✅ Fetch ALL transactions (for overview - no type filter)
// // export const fetchAllTransactions = createAsyncThunk(
// //   'transaction/fetchAllTransactions',
// //   async (params = {}, { rejectWithValue }) => {
// //     try {
// //       const response = await transactionApi.getTransactions({ 
// //         ...params,
// //         limit: params.limit || 20 
// //       });
// //       return response.data;
// //     } catch (error) {
// //       return rejectWithValue(error.response?.data?.message || 'Failed to fetch transactions');
// //     }
// //   }
// // );

// // // ✅ Fetch ONLY income transactions
// // export const fetchIncomeTransactions = createAsyncThunk(
// //   'transaction/fetchIncomeTransactions',
// //   async (filters = {}, { rejectWithValue, getState }) => {
// //     try {
// //       const { transaction } = getState();
// //       const currentFilters = { 
// //         ...transaction.filters, 
// //         ...filters, 
// //         type: 'income' 
// //       };
// //       const response = await transactionApi.getTransactions(currentFilters);
// //       return response.data;
// //     } catch (error) {
// //       return rejectWithValue(error.response?.data?.message || 'Failed to fetch income');
// //     }
// //   }
// // );

// // // ✅ Fetch ONLY expense transactions
// // export const fetchExpenseTransactions = createAsyncThunk(
// //   'transaction/fetchExpenseTransactions',
// //   async (filters = {}, { rejectWithValue, getState }) => {
// //     try {
// //       const { transaction } = getState();
// //       const currentFilters = { 
// //         ...transaction.filters, 
// //         ...filters, 
// //         type: 'expense' 
// //       };
// //       const response = await transactionApi.getTransactions(currentFilters);
// //       return response.data;
// //     } catch (error) {
// //       return rejectWithValue(error.response?.data?.message || 'Failed to fetch expense');
// //     }
// //   }
// // );

// // // ✅ Fetch transaction summary
// // export const fetchTransactionSummary = createAsyncThunk(
// //   'transaction/fetchTransactionSummary',
// //   async (period = 'month', { rejectWithValue }) => {
// //     try {
// //       const response = await transactionApi.getTransactionSummary(period);
// //       return response.data;
// //     } catch (error) {
// //       return rejectWithValue(error.response?.data?.message);
// //     }
// //   }
// // );

// // // ✅ Create new transaction
// // export const createNewTransaction = createAsyncThunk(
// //   'transaction/createNewTransaction',
// //   async (transactionData, { rejectWithValue, dispatch }) => {
// //     try {
// //       const response = await transactionApi.createTransaction(transactionData);
// //       showToast.success(response.message);
      
// //       // Refresh all relevant data
// //       dispatch(fetchAllTransactions({ limit: 20 }));
// //       dispatch(fetchTransactionSummary());
      
// //       // Also refresh specific type if needed
// //       if (transactionData.type === 'income') {
// //         dispatch(fetchIncomeTransactions());
// //       } else if (transactionData.type === 'expense') {
// //         dispatch(fetchExpenseTransactions());
// //       }
      
// //       return response.data;
// //     } catch (error) {
// //       showToast.error(error.response?.data?.message || 'Failed to create transaction');
// //       return rejectWithValue(error.response?.data?.message);
// //     }
// //   }
// // );

// // // ✅ Delete transaction
// // export const deleteExistingTransaction = createAsyncThunk(
// //   'transaction/deleteExistingTransaction',
// //   async (id, { rejectWithValue, dispatch, getState }) => {
// //     try {
// //       const response = await transactionApi.deleteTransaction(id);
// //       showToast.success(response.message);
      
// //       // Get current type from state or fetch both
// //       const { transaction } = getState();
      
// //       // Refresh all data
// //       dispatch(fetchAllTransactions({ limit: 20 }));
// //       dispatch(fetchTransactionSummary());
      
// //       // Also refresh specific lists
// //       dispatch(fetchIncomeTransactions());
// //       dispatch(fetchExpenseTransactions());
      
// //       return id;
// //     } catch (error) {
// //       showToast.error(error.response?.data?.message || 'Failed to delete transaction');
// //       return rejectWithValue(error.response?.data?.message);
// //     }
// //   }
// // );

// // const transactionSlice = createSlice({
// //   name: 'transaction',
// //   initialState,
// //   reducers: {
// //     setFilters: (state, action) => {
// //       state.filters = { ...state.filters, ...action.payload };
// //     },
// //     resetFilters: (state) => {
// //       state.filters = initialState.filters;
// //     },
// //     clearTransactions: (state) => {
// //       state.allTransactions = [];
// //       state.incomeTransactions = [];
// //       state.expenseTransactions = [];
// //     }
// //   },
// //   extraReducers: (builder) => {
// //     builder
// //       // Fetch All Transactions
// //       .addCase(fetchAllTransactions.pending, (state) => {
// //         state.loading = true;
// //         state.error = null;
// //       })
// //       .addCase(fetchAllTransactions.fulfilled, (state, action) => {
// //         state.loading = false;
// //         state.allTransactions = action.payload.transactions || [];
// //         state.pagination = action.payload.pagination || initialState.pagination;
// //       })
// //       .addCase(fetchAllTransactions.rejected, (state, action) => {
// //         state.loading = false;
// //         state.error = action.payload;
// //       })
      
// //       // Fetch Income Transactions
// //       .addCase(fetchIncomeTransactions.pending, (state) => {
// //         state.loading = true;
// //         state.error = null;
// //       })
// //       .addCase(fetchIncomeTransactions.fulfilled, (state, action) => {
// //         state.loading = false;
// //         state.incomeTransactions = action.payload.transactions || [];
// //         state.pagination = action.payload.pagination || initialState.pagination;
// //       })
// //       .addCase(fetchIncomeTransactions.rejected, (state, action) => {
// //         state.loading = false;
// //         state.error = action.payload;
// //       })
      
// //       // Fetch Expense Transactions
// //       .addCase(fetchExpenseTransactions.pending, (state) => {
// //         state.loading = true;
// //         state.error = null;
// //       })
// //       .addCase(fetchExpenseTransactions.fulfilled, (state, action) => {
// //         state.loading = false;
// //         state.expenseTransactions = action.payload.transactions || [];
// //         state.pagination = action.payload.pagination || initialState.pagination;
// //       })
// //       .addCase(fetchExpenseTransactions.rejected, (state, action) => {
// //         state.loading = false;
// //         state.error = action.payload;
// //       })
      
// //       // Create Transaction
// //       .addCase(createNewTransaction.pending, (state) => {
// //         state.loading = true;
// //       })
// //       .addCase(createNewTransaction.fulfilled, (state) => {
// //         state.loading = false;
// //       })
// //       .addCase(createNewTransaction.rejected, (state) => {
// //         state.loading = false;
// //       })
      
// //       // Delete Transaction
// //       .addCase(deleteExistingTransaction.pending, (state) => {
// //         state.loading = true;
// //       })
// //       .addCase(deleteExistingTransaction.fulfilled, (state) => {
// //         state.loading = false;
// //       })
// //       .addCase(deleteExistingTransaction.rejected, (state) => {
// //         state.loading = false;
// //       })
      
// //       // Fetch Summary
// //       .addCase(fetchTransactionSummary.pending, (state) => {
// //         state.loading = true;
// //       })
// //       .addCase(fetchTransactionSummary.fulfilled, (state, action) => {
// //         state.loading = false;
// //         state.summary = { ...state.summary, ...action.payload };
// //       })
// //       .addCase(fetchTransactionSummary.rejected, (state) => {
// //         state.loading = false;
// //       });
// //   }
// // });

// // export const { setFilters, resetFilters, clearTransactions } = transactionSlice.actions;

// // // Selectors
// // export const selectAllTransactions = (state) => state.transaction.allTransactions;
// // export const selectIncomeTransactions = (state) => state.transaction.incomeTransactions;
// // export const selectExpenseTransactions = (state) => state.transaction.expenseTransactions;
// // export const selectTransactionSummary = (state) => state.transaction.summary;
// // export const selectTransactionFilters = (state) => state.transaction.filters;
// // export const selectTransactionPagination = (state) => state.transaction.pagination;
// // export const selectTransactionLoading = (state) => state.transaction.loading;

// // export default transactionSlice.reducer;
















// // features/transaction/transactionSlice.js - UPDATED VERSION
// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import showToast from '../../utils/toast';
// import * as transactionApi from './transactionApi';

// const initialState = {
//   // Separate states for different views
//   allTransactions: [],        // For overview (both income & expense)
//   incomeTransactions: [],     // For income page
//   expenseTransactions: [],    // For expense page
//   currentTransaction: null,
  
//   // 👇 NEW: Auto-income states
//   autoIncomes: [],            // List of auto-income schedules
//   currentAutoIncome: null,    // Selected auto-income for edit
//   upcomingAutoIncomes: [],    // Next 30 days auto incomes
//   autoIncomeStats: {},        // Stats for auto incomes
  
//   summary: {
//     totalIncome: 0,
//     totalExpense: 0,
//     netBalance: 0,
//     handCash: {
//       income: 0,
//       expense: 0,
//       balance: 0
//     },
//     bank: {
//       income: 0,
//       expense: 0,
//       balance: 0
//     },
//     totalBalance: 0
//   },
  
//   pagination: {
//     page: 1,
//     limit: 20,
//     total: 0,
//     pages: 0
//   },
  
//   loading: false,
//   autoIncomeLoading: false,   // 👈 NEW: Separate loading for auto-income
//   error: null,
  
//   filters: {
//     type: '',
//     accountType: '',
//     category: '',
//     startDate: '',
//     endDate: '',
//     page: 1,
//     limit: 20,
//     sortBy: 'transactionDate',
//     sortOrder: 'desc'
//   }
// };

// // ============================================
// // ✅ EXISTING TRANSACTION ACTIONS
// // ============================================

// // Fetch ALL transactions (for overview - no type filter)
// export const fetchAllTransactions = createAsyncThunk(
//   'transaction/fetchAllTransactions',
//   async (params = {}, { rejectWithValue }) => {
//     try {
//       const response = await transactionApi.getTransactions({ 
//         ...params,
//         limit: params.limit || 20 
//       });
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Failed to fetch transactions');
//     }
//   }
// );

// // Fetch ONLY income transactions
// export const fetchIncomeTransactions = createAsyncThunk(
//   'transaction/fetchIncomeTransactions',
//   async (filters = {}, { rejectWithValue, getState }) => {
//     try {
//       const { transaction } = getState();
//       const currentFilters = { 
//         ...transaction.filters, 
//         ...filters, 
//         type: 'income' 
//       };
//       const response = await transactionApi.getTransactions(currentFilters);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Failed to fetch income');
//     }
//   }
// );

// // Fetch ONLY expense transactions
// export const fetchExpenseTransactions = createAsyncThunk(
//   'transaction/fetchExpenseTransactions',
//   async (filters = {}, { rejectWithValue, getState }) => {
//     try {
//       const { transaction } = getState();
//       const currentFilters = { 
//         ...transaction.filters, 
//         ...filters, 
//         type: 'expense' 
//       };
//       const response = await transactionApi.getTransactions(currentFilters);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Failed to fetch expense');
//     }
//   }
// );

// // Fetch transaction summary
// export const fetchTransactionSummary = createAsyncThunk(
//   'transaction/fetchTransactionSummary',
//   async (period = 'month', { rejectWithValue }) => {
//     try {
//       const response = await transactionApi.getTransactionSummary(period);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message);
//     }
//   }
// );

// // Create new transaction
// export const createNewTransaction = createAsyncThunk(
//   'transaction/createNewTransaction',
//   async (transactionData, { rejectWithValue, dispatch }) => {
//     try {
//       const response = await transactionApi.createTransaction(transactionData);
//       showToast.success(response.message);
      
//       // Refresh all relevant data
//       dispatch(fetchAllTransactions({ limit: 20 }));
//       dispatch(fetchTransactionSummary());
      
//       // Also refresh specific type if needed
//       if (transactionData.type === 'income') {
//         dispatch(fetchIncomeTransactions());
//       } else if (transactionData.type === 'expense') {
//         dispatch(fetchExpenseTransactions());
//       }
      
//       return response.data;
//     } catch (error) {
//       showToast.error(error.response?.data?.message || 'Failed to create transaction');
//       return rejectWithValue(error.response?.data?.message);
//     }
//   }
// );

// // Delete transaction
// export const deleteExistingTransaction = createAsyncThunk(
//   'transaction/deleteExistingTransaction',
//   async (id, { rejectWithValue, dispatch, getState }) => {
//     try {
//       const response = await transactionApi.deleteTransaction(id);
//       showToast.success(response.message);
      
//       // Get current type from state or fetch both
//       const { transaction } = getState();
      
//       // Refresh all data
//       dispatch(fetchAllTransactions({ limit: 20 }));
//       dispatch(fetchTransactionSummary());
      
//       // Also refresh specific lists
//       dispatch(fetchIncomeTransactions());
//       dispatch(fetchExpenseTransactions());
      
//       return id;
//     } catch (error) {
//       showToast.error(error.response?.data?.message || 'Failed to delete transaction');
//       return rejectWithValue(error.response?.data?.message);
//     }
//   }
// );

// // ============================================
// // ✅ NEW: AUTO-INCOME ACTIONS
// // ============================================

// // Fetch all auto incomes
// export const fetchAutoIncomes = createAsyncThunk(
//   'transaction/fetchAutoIncomes',
//   async (params = {}, { rejectWithValue }) => {
//     try {
//       const response = await transactionApi.getAutoIncomes(params);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Failed to fetch auto incomes');
//     }
//   }
// );

// // Setup new auto income
// export const setupNewAutoIncome = createAsyncThunk(
//   'transaction/setupNewAutoIncome',
//   async (autoIncomeData, { rejectWithValue, dispatch }) => {
//     try {
//       const response = await transactionApi.setupAutoIncome(autoIncomeData);
//       showToast.success('Auto income setup successfully');
      
//       // Refresh auto incomes list
//       dispatch(fetchAutoIncomes());
      
//       return response.data;
//     } catch (error) {
//       showToast.error(error.response?.data?.message || 'Failed to setup auto income');
//       return rejectWithValue(error.response?.data?.message);
//     }
//   }
// );

// // Update auto income
// export const updateAutoIncome = createAsyncThunk(
//   'transaction/updateAutoIncome',
//   async ({ id, data }, { rejectWithValue, dispatch }) => {
//     try {
//       const response = await transactionApi.updateAutoIncome(id, data);
//       showToast.success('Auto income updated successfully');
      
//       // Refresh auto incomes list
//       dispatch(fetchAutoIncomes());
      
//       return response.data;
//     } catch (error) {
//       showToast.error(error.response?.data?.message || 'Failed to update auto income');
//       return rejectWithValue(error.response?.data?.message);
//     }
//   }
// );

// // Delete auto income
// export const deleteAutoIncome = createAsyncThunk(
//   'transaction/deleteAutoIncome',
//   async (id, { rejectWithValue, dispatch }) => {
//     try {
//       const response = await transactionApi.deleteAutoIncome(id);
//       showToast.success('Auto income deleted successfully');
      
//       // Refresh auto incomes list
//       dispatch(fetchAutoIncomes());
      
//       return id;
//     } catch (error) {
//       showToast.error(error.response?.data?.message || 'Failed to delete auto income');
//       return rejectWithValue(error.response?.data?.message);
//     }
//   }
// );

// // Pause auto income
// export const pauseAutoIncome = createAsyncThunk(
//   'transaction/pauseAutoIncome',
//   async (id, { rejectWithValue, dispatch }) => {
//     try {
//       const response = await transactionApi.pauseAutoIncome(id);
//       showToast.success('Auto income paused successfully');
      
//       // Refresh auto incomes list
//       dispatch(fetchAutoIncomes());
      
//       return response.data;
//     } catch (error) {
//       showToast.error(error.response?.data?.message || 'Failed to pause auto income');
//       return rejectWithValue(error.response?.data?.message);
//     }
//   }
// );

// // Resume auto income
// export const resumeAutoIncome = createAsyncThunk(
//   'transaction/resumeAutoIncome',
//   async (id, { rejectWithValue, dispatch }) => {
//     try {
//       const response = await transactionApi.resumeAutoIncome(id);
//       showToast.success('Auto income resumed successfully');
      
//       // Refresh auto incomes list
//       dispatch(fetchAutoIncomes());
      
//       return response.data;
//     } catch (error) {
//       showToast.error(error.response?.data?.message || 'Failed to resume auto income');
//       return rejectWithValue(error.response?.data?.message);
//     }
//   }
// );

// // Get upcoming auto incomes
// export const fetchUpcomingAutoIncomes = createAsyncThunk(
//   'transaction/fetchUpcomingAutoIncomes',
//   async (days = 30, { rejectWithValue }) => {
//     try {
//       const response = await transactionApi.getUpcomingAutoIncomes(days);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Failed to fetch upcoming incomes');
//     }
//   }
// );

// // Get auto income stats
// export const fetchAutoIncomeStats = createAsyncThunk(
//   'transaction/fetchAutoIncomeStats',
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await transactionApi.getAutoIncomeStats();
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Failed to fetch auto income stats');
//     }
//   }
// );

// // ============================================
// // ✅ NEW: TRANSACTION DETAIL ACTIONS
// // ============================================

// // Fetch transaction by ID
// export const fetchTransactionById = createAsyncThunk(
//   'transaction/fetchTransactionById',
//   async (id, { rejectWithValue }) => {
//     try {
//       const response = await transactionApi.getTransactionById(id);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Failed to fetch transaction');
//     }
//   }
// );

// // Fetch transactions by order
// export const fetchTransactionsByOrder = createAsyncThunk(
//   'transaction/fetchTransactionsByOrder',
//   async (orderId, { rejectWithValue }) => {
//     try {
//       const response = await transactionApi.getTransactionsByOrder(orderId);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Failed to fetch order transactions');
//     }
//   }
// );

// // Fetch transactions by customer
// export const fetchTransactionsByCustomer = createAsyncThunk(
//   'transaction/fetchTransactionsByCustomer',
//   async ({ customerId, params }, { rejectWithValue }) => {
//     try {
//       const response = await transactionApi.getTransactionsByCustomer(customerId, params);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Failed to fetch customer transactions');
//     }
//   }
// );

// // Export transactions
// export const exportTransactions = createAsyncThunk(
//   'transaction/exportTransactions',
//   async (filters = {}, { rejectWithValue }) => {
//     try {
//       const response = await transactionApi.exportTransactions(filters);
//       showToast.success('Transactions exported successfully');
//       return response.data;
//     } catch (error) {
//       showToast.error(error.response?.data?.message || 'Failed to export transactions');
//       return rejectWithValue(error.response?.data?.message);
//     }
//   }
// );

// const transactionSlice = createSlice({
//   name: 'transaction',
//   initialState,
//   reducers: {
//     setFilters: (state, action) => {
//       state.filters = { ...state.filters, ...action.payload };
//     },
//     resetFilters: (state) => {
//       state.filters = initialState.filters;
//     },
//     clearTransactions: (state) => {
//       state.allTransactions = [];
//       state.incomeTransactions = [];
//       state.expenseTransactions = [];
//     },
//     // 👇 NEW: Clear auto incomes
//     clearAutoIncomes: (state) => {
//       state.autoIncomes = [];
//       state.upcomingAutoIncomes = [];
//     },
//     // 👇 NEW: Set current auto income
//     setCurrentAutoIncome: (state, action) => {
//       state.currentAutoIncome = action.payload;
//     }
//   },
//   extraReducers: (builder) => {
//     builder
//       // ============================================
//       // EXISTING REDUCERS
//       // ============================================
      
//       // Fetch All Transactions
//       .addCase(fetchAllTransactions.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchAllTransactions.fulfilled, (state, action) => {
//         state.loading = false;
//         state.allTransactions = action.payload.transactions || [];
//         state.pagination = action.payload.pagination || initialState.pagination;
//       })
//       .addCase(fetchAllTransactions.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })
      
//       // Fetch Income Transactions
//       .addCase(fetchIncomeTransactions.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchIncomeTransactions.fulfilled, (state, action) => {
//         state.loading = false;
//         state.incomeTransactions = action.payload.transactions || [];
//         state.pagination = action.payload.pagination || initialState.pagination;
//       })
//       .addCase(fetchIncomeTransactions.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })
      
//       // Fetch Expense Transactions
//       .addCase(fetchExpenseTransactions.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchExpenseTransactions.fulfilled, (state, action) => {
//         state.loading = false;
//         state.expenseTransactions = action.payload.transactions || [];
//         state.pagination = action.payload.pagination || initialState.pagination;
//       })
//       .addCase(fetchExpenseTransactions.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })
      
//       // Create Transaction
//       .addCase(createNewTransaction.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(createNewTransaction.fulfilled, (state) => {
//         state.loading = false;
//       })
//       .addCase(createNewTransaction.rejected, (state) => {
//         state.loading = false;
//       })
      
//       // Delete Transaction
//       .addCase(deleteExistingTransaction.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(deleteExistingTransaction.fulfilled, (state) => {
//         state.loading = false;
//       })
//       .addCase(deleteExistingTransaction.rejected, (state) => {
//         state.loading = false;
//       })
      
//       // Fetch Summary
//       .addCase(fetchTransactionSummary.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(fetchTransactionSummary.fulfilled, (state, action) => {
//         state.loading = false;
//         state.summary = { ...state.summary, ...action.payload };
//       })
//       .addCase(fetchTransactionSummary.rejected, (state) => {
//         state.loading = false;
//       })
      
//       // ============================================
//       // NEW: AUTO-INCOME REDUCERS
//       // ============================================
      
//       // Fetch Auto Incomes
//       .addCase(fetchAutoIncomes.pending, (state) => {
//         state.autoIncomeLoading = true;
//         state.error = null;
//       })
//       .addCase(fetchAutoIncomes.fulfilled, (state, action) => {
//         state.autoIncomeLoading = false;
//         state.autoIncomes = action.payload.autoIncomes || [];
//       })
//       .addCase(fetchAutoIncomes.rejected, (state, action) => {
//         state.autoIncomeLoading = false;
//         state.error = action.payload;
//       })
      
//       // Setup Auto Income
//       .addCase(setupNewAutoIncome.pending, (state) => {
//         state.autoIncomeLoading = true;
//       })
//       .addCase(setupNewAutoIncome.fulfilled, (state) => {
//         state.autoIncomeLoading = false;
//       })
//       .addCase(setupNewAutoIncome.rejected, (state) => {
//         state.autoIncomeLoading = false;
//       })
      
//       // Update Auto Income
//       .addCase(updateAutoIncome.pending, (state) => {
//         state.autoIncomeLoading = true;
//       })
//       .addCase(updateAutoIncome.fulfilled, (state) => {
//         state.autoIncomeLoading = false;
//       })
//       .addCase(updateAutoIncome.rejected, (state) => {
//         state.autoIncomeLoading = false;
//       })
      
//       // Delete Auto Income
//       .addCase(deleteAutoIncome.pending, (state) => {
//         state.autoIncomeLoading = true;
//       })
//       .addCase(deleteAutoIncome.fulfilled, (state) => {
//         state.autoIncomeLoading = false;
//       })
//       .addCase(deleteAutoIncome.rejected, (state) => {
//         state.autoIncomeLoading = false;
//       })
      
//       // Pause Auto Income
//       .addCase(pauseAutoIncome.pending, (state) => {
//         state.autoIncomeLoading = true;
//       })
//       .addCase(pauseAutoIncome.fulfilled, (state) => {
//         state.autoIncomeLoading = false;
//       })
//       .addCase(pauseAutoIncome.rejected, (state) => {
//         state.autoIncomeLoading = false;
//       })
      
//       // Resume Auto Income
//       .addCase(resumeAutoIncome.pending, (state) => {
//         state.autoIncomeLoading = true;
//       })
//       .addCase(resumeAutoIncome.fulfilled, (state) => {
//         state.autoIncomeLoading = false;
//       })
//       .addCase(resumeAutoIncome.rejected, (state) => {
//         state.autoIncomeLoading = false;
//       })
      
//       // Fetch Upcoming Auto Incomes
//       .addCase(fetchUpcomingAutoIncomes.pending, (state) => {
//         state.autoIncomeLoading = true;
//       })
//       .addCase(fetchUpcomingAutoIncomes.fulfilled, (state, action) => {
//         state.autoIncomeLoading = false;
//         state.upcomingAutoIncomes = action.payload.upcoming || [];
//       })
//       .addCase(fetchUpcomingAutoIncomes.rejected, (state) => {
//         state.autoIncomeLoading = false;
//       })
      
//       // Fetch Auto Income Stats
//       .addCase(fetchAutoIncomeStats.pending, (state) => {
//         state.autoIncomeLoading = true;
//       })
//       .addCase(fetchAutoIncomeStats.fulfilled, (state, action) => {
//         state.autoIncomeLoading = false;
//         state.autoIncomeStats = action.payload;
//       })
//       .addCase(fetchAutoIncomeStats.rejected, (state) => {
//         state.autoIncomeLoading = false;
//       })
      
//       // ============================================
//       // NEW: TRANSACTION DETAIL REDUCERS
//       // ============================================
      
//       // Fetch Transaction By ID
//       .addCase(fetchTransactionById.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(fetchTransactionById.fulfilled, (state, action) => {
//         state.loading = false;
//         state.currentTransaction = action.payload;
//       })
//       .addCase(fetchTransactionById.rejected, (state) => {
//         state.loading = false;
//       })
      
//       // Fetch Transactions By Order
//       .addCase(fetchTransactionsByOrder.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(fetchTransactionsByOrder.fulfilled, (state, action) => {
//         state.loading = false;
//         // Store in allTransactions for now
//         state.allTransactions = action.payload.transactions || [];
//       })
//       .addCase(fetchTransactionsByOrder.rejected, (state) => {
//         state.loading = false;
//       });
//   }
// });

// export const { 
//   setFilters, 
//   resetFilters, 
//   clearTransactions,
//   clearAutoIncomes,
//   setCurrentAutoIncome
// } = transactionSlice.actions;

// // ============================================
// // SELECTORS
// // ============================================

// // Existing selectors
// export const selectAllTransactions = (state) => state.transaction.allTransactions;
// export const selectIncomeTransactions = (state) => state.transaction.incomeTransactions;
// export const selectExpenseTransactions = (state) => state.transaction.expenseTransactions;
// export const selectTransactionSummary = (state) => state.transaction.summary;
// export const selectTransactionFilters = (state) => state.transaction.filters;
// export const selectTransactionPagination = (state) => state.transaction.pagination;
// export const selectTransactionLoading = (state) => state.transaction.loading;
// export const selectCurrentTransaction = (state) => state.transaction.currentTransaction;

// // 👇 NEW: Auto-income selectors
// export const selectAutoIncomes = (state) => state.transaction.autoIncomes;
// export const selectCurrentAutoIncome = (state) => state.transaction.currentAutoIncome;
// export const selectUpcomingAutoIncomes = (state) => state.transaction.upcomingAutoIncomes;
// export const selectAutoIncomeStats = (state) => state.transaction.autoIncomeStats;
// export const selectAutoIncomeLoading = (state) => state.transaction.autoIncomeLoading;

// export default transactionSlice.reducer;







// // features/transaction/transactionSlice.js - COMPLETE FIXED VERSION
// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import showToast from '../../utils/toast';
// import * as transactionApi from './transactionApi';

// const initialState = {
//   // Separate states for different views
//   allTransactions: [],        // For overview (both income & expense)
//   incomeTransactions: [],     // For income page
//   expenseTransactions: [],    // For expense page
//   currentTransaction: null,
  
//   // 👇 NEW: Today's transactions for dashboard
//   todayTransactions: {
//     transactions: [],
//     summary: {
//       totalIncome: 0,
//       totalExpense: 0,
//       netAmount: 0,
//       count: 0,
//       handCash: { income: 0, expense: 0, balance: 0 },
//       bank: { income: 0, expense: 0, balance: 0 }
//     },
//     loading: false
//   },
  
//   // Auto-income states
//   autoIncomes: [],            // List of auto-income schedules
//   currentAutoIncome: null,    // Selected auto-income for edit
//   upcomingAutoIncomes: [],    // Next 30 days auto incomes
//   autoIncomeStats: {},        // Stats for auto incomes
  
//   summary: {
//     totalIncome: 0,
//     totalExpense: 0,
//     netBalance: 0,
//     handCash: {
//       income: 0,
//       expense: 0,
//       balance: 0
//     },
//     bank: {
//       income: 0,
//       expense: 0,
//       balance: 0
//     },
//     totalBalance: 0
//   },
  
//   pagination: {
//     page: 1,
//     limit: 20,
//     total: 0,
//     pages: 0
//   },
  
//   loading: false,
//   autoIncomeLoading: false,
//   error: null,
  
//   filters: {
//     type: '',
//     accountType: '',
//     category: '',
//     startDate: '',
//     endDate: '',
//     page: 1,
//     limit: 20,
//     sortBy: 'transactionDate',
//     sortOrder: 'desc'
//   }
// };

// // ============================================
// // ✅ EXISTING TRANSACTION ACTIONS
// // ============================================

// // Fetch ALL transactions (for overview - no type filter)
// export const fetchAllTransactions = createAsyncThunk(
//   'transaction/fetchAllTransactions',
//   async (params = {}, { rejectWithValue }) => {
//     try {
//       const response = await transactionApi.getTransactions({ 
//         ...params,
//         limit: params.limit || 20 
//       });
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Failed to fetch transactions');
//     }
//   }
// );

// // Fetch ONLY income transactions
// export const fetchIncomeTransactions = createAsyncThunk(
//   'transaction/fetchIncomeTransactions',
//   async (filters = {}, { rejectWithValue, getState }) => {
//     try {
//       const { transaction } = getState();
//       const currentFilters = { 
//         ...transaction.filters, 
//         ...filters, 
//         type: 'income' 
//       };
//       const response = await transactionApi.getTransactions(currentFilters);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Failed to fetch income');
//     }
//   }
// );

// // Fetch ONLY expense transactions
// export const fetchExpenseTransactions = createAsyncThunk(
//   'transaction/fetchExpenseTransactions',
//   async (filters = {}, { rejectWithValue, getState }) => {
//     try {
//       const { transaction } = getState();
//       const currentFilters = { 
//         ...transaction.filters, 
//         ...filters, 
//         type: 'expense' 
//       };
//       const response = await transactionApi.getTransactions(currentFilters);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Failed to fetch expense');
//     }
//   }
// );

// // Fetch transaction summary
// export const fetchTransactionSummary = createAsyncThunk(
//   'transaction/fetchTransactionSummary',
//   async (period = 'month', { rejectWithValue }) => {
//     try {
//       const response = await transactionApi.getTransactionSummary(period);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message);
//     }
//   }
// );

// // ✅ NEW: Fetch today's transactions for dashboard
// export const fetchTodayTransactions = createAsyncThunk(
//   'transaction/fetchTodayTransactions',
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await transactionApi.getTodayTransactions();
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Failed to fetch today\'s transactions');
//     }
//   }
// );

// // Create new transaction
// export const createNewTransaction = createAsyncThunk(
//   'transaction/createNewTransaction',
//   async (transactionData, { rejectWithValue, dispatch }) => {
//     try {
//       const response = await transactionApi.createTransaction(transactionData);
//       showToast.success(response.message);
      
//       // Refresh all relevant data
//       dispatch(fetchAllTransactions({ limit: 20 }));
//       dispatch(fetchTransactionSummary());
//       dispatch(fetchTodayTransactions()); // ✅ Refresh today's transactions
      
//       // Also refresh specific type if needed
//       if (transactionData.type === 'income') {
//         dispatch(fetchIncomeTransactions());
//       } else if (transactionData.type === 'expense') {
//         dispatch(fetchExpenseTransactions());
//       }
      
//       return response.data;
//     } catch (error) {
//       showToast.error(error.response?.data?.message || 'Failed to create transaction');
//       return rejectWithValue(error.response?.data?.message);
//     }
//   }
// );

// // Delete transaction
// export const deleteExistingTransaction = createAsyncThunk(
//   'transaction/deleteExistingTransaction',
//   async (id, { rejectWithValue, dispatch, getState }) => {
//     try {
//       const response = await transactionApi.deleteTransaction(id);
//       showToast.success(response.message);
      
//       // Get current type from state or fetch both
//       const { transaction } = getState();
      
//       // Refresh all data
//       dispatch(fetchAllTransactions({ limit: 20 }));
//       dispatch(fetchTransactionSummary());
//       dispatch(fetchTodayTransactions()); // ✅ Refresh today's transactions
      
//       // Also refresh specific lists
//       dispatch(fetchIncomeTransactions());
//       dispatch(fetchExpenseTransactions());
      
//       return id;
//     } catch (error) {
//       showToast.error(error.response?.data?.message || 'Failed to delete transaction');
//       return rejectWithValue(error.response?.data?.message);
//     }
//   }
// );

// // ============================================
// // ✅ AUTO-INCOME ACTIONS
// // ============================================

// // Fetch all auto incomes
// export const fetchAutoIncomes = createAsyncThunk(
//   'transaction/fetchAutoIncomes',
//   async (params = {}, { rejectWithValue }) => {
//     try {
//       const response = await transactionApi.getAutoIncomes(params);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Failed to fetch auto incomes');
//     }
//   }
// );

// // Setup new auto income
// export const setupNewAutoIncome = createAsyncThunk(
//   'transaction/setupNewAutoIncome',
//   async (autoIncomeData, { rejectWithValue, dispatch }) => {
//     try {
//       const response = await transactionApi.setupAutoIncome(autoIncomeData);
//       showToast.success('Auto income setup successfully');
      
//       // Refresh auto incomes list
//       dispatch(fetchAutoIncomes());
      
//       return response.data;
//     } catch (error) {
//       showToast.error(error.response?.data?.message || 'Failed to setup auto income');
//       return rejectWithValue(error.response?.data?.message);
//     }
//   }
// );

// // Update auto income
// export const updateAutoIncome = createAsyncThunk(
//   'transaction/updateAutoIncome',
//   async ({ id, data }, { rejectWithValue, dispatch }) => {
//     try {
//       const response = await transactionApi.updateAutoIncome(id, data);
//       showToast.success('Auto income updated successfully');
      
//       // Refresh auto incomes list
//       dispatch(fetchAutoIncomes());
      
//       return response.data;
//     } catch (error) {
//       showToast.error(error.response?.data?.message || 'Failed to update auto income');
//       return rejectWithValue(error.response?.data?.message);
//     }
//   }
// );

// // Delete auto income
// export const deleteAutoIncome = createAsyncThunk(
//   'transaction/deleteAutoIncome',
//   async (id, { rejectWithValue, dispatch }) => {
//     try {
//       const response = await transactionApi.deleteAutoIncome(id);
//       showToast.success('Auto income deleted successfully');
      
//       // Refresh auto incomes list
//       dispatch(fetchAutoIncomes());
      
//       return id;
//     } catch (error) {
//       showToast.error(error.response?.data?.message || 'Failed to delete auto income');
//       return rejectWithValue(error.response?.data?.message);
//     }
//   }
// );

// // Pause auto income
// export const pauseAutoIncome = createAsyncThunk(
//   'transaction/pauseAutoIncome',
//   async (id, { rejectWithValue, dispatch }) => {
//     try {
//       const response = await transactionApi.pauseAutoIncome(id);
//       showToast.success('Auto income paused successfully');
      
//       // Refresh auto incomes list
//       dispatch(fetchAutoIncomes());
      
//       return response.data;
//     } catch (error) {
//       showToast.error(error.response?.data?.message || 'Failed to pause auto income');
//       return rejectWithValue(error.response?.data?.message);
//     }
//   }
// );

// // Resume auto income
// export const resumeAutoIncome = createAsyncThunk(
//   'transaction/resumeAutoIncome',
//   async (id, { rejectWithValue, dispatch }) => {
//     try {
//       const response = await transactionApi.resumeAutoIncome(id);
//       showToast.success('Auto income resumed successfully');
      
//       // Refresh auto incomes list
//       dispatch(fetchAutoIncomes());
      
//       return response.data;
//     } catch (error) {
//       showToast.error(error.response?.data?.message || 'Failed to resume auto income');
//       return rejectWithValue(error.response?.data?.message);
//     }
//   }
// );

// // Get upcoming auto incomes
// export const fetchUpcomingAutoIncomes = createAsyncThunk(
//   'transaction/fetchUpcomingAutoIncomes',
//   async (days = 30, { rejectWithValue }) => {
//     try {
//       const response = await transactionApi.getUpcomingAutoIncomes(days);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Failed to fetch upcoming incomes');
//     }
//   }
// );

// // Get auto income stats
// export const fetchAutoIncomeStats = createAsyncThunk(
//   'transaction/fetchAutoIncomeStats',
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await transactionApi.getAutoIncomeStats();
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Failed to fetch auto income stats');
//     }
//   }
// );

// // ============================================
// // ✅ TRANSACTION DETAIL ACTIONS
// // ============================================

// // Fetch transaction by ID
// export const fetchTransactionById = createAsyncThunk(
//   'transaction/fetchTransactionById',
//   async (id, { rejectWithValue }) => {
//     try {
//       const response = await transactionApi.getTransactionById(id);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Failed to fetch transaction');
//     }
//   }
// );

// // Fetch transactions by order
// export const fetchTransactionsByOrder = createAsyncThunk(
//   'transaction/fetchTransactionsByOrder',
//   async (orderId, { rejectWithValue }) => {
//     try {
//       const response = await transactionApi.getTransactionsByOrder(orderId);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Failed to fetch order transactions');
//     }
//   }
// );

// // Fetch transactions by customer
// export const fetchTransactionsByCustomer = createAsyncThunk(
//   'transaction/fetchTransactionsByCustomer',
//   async ({ customerId, params }, { rejectWithValue }) => {
//     try {
//       const response = await transactionApi.getTransactionsByCustomer(customerId, params);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Failed to fetch customer transactions');
//     }
//   }
// );

// // Export transactions
// export const exportTransactions = createAsyncThunk(
//   'transaction/exportTransactions',
//   async (filters = {}, { rejectWithValue }) => {
//     try {
//       const response = await transactionApi.exportTransactions(filters);
//       showToast.success('Transactions exported successfully');
//       return response.data;
//     } catch (error) {
//       showToast.error(error.response?.data?.message || 'Failed to export transactions');
//       return rejectWithValue(error.response?.data?.message);
//     }
//   }
// );

// const transactionSlice = createSlice({
//   name: 'transaction',
//   initialState,
//   reducers: {
//     setFilters: (state, action) => {
//       state.filters = { ...state.filters, ...action.payload };
//     },
//     resetFilters: (state) => {
//       state.filters = initialState.filters;
//     },
//     clearTransactions: (state) => {
//       state.allTransactions = [];
//       state.incomeTransactions = [];
//       state.expenseTransactions = [];
//     },
//     clearAutoIncomes: (state) => {
//       state.autoIncomes = [];
//       state.upcomingAutoIncomes = [];
//     },
//     setCurrentAutoIncome: (state, action) => {
//       state.currentAutoIncome = action.payload;
//     },
//     // ✅ NEW: Clear today's transactions
//     clearTodayTransactions: (state) => {
//       state.todayTransactions = {
//         transactions: [],
//         summary: {
//           totalIncome: 0,
//           totalExpense: 0,
//           netAmount: 0,
//           count: 0,
//           handCash: { income: 0, expense: 0, balance: 0 },
//           bank: { income: 0, expense: 0, balance: 0 }
//         },
//         loading: false
//       };
//     }
//   },
//   extraReducers: (builder) => {
//     builder
//       // ============================================
//       // EXISTING REDUCERS
//       // ============================================
      
//       // Fetch All Transactions
//       .addCase(fetchAllTransactions.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchAllTransactions.fulfilled, (state, action) => {
//         state.loading = false;
//         state.allTransactions = action.payload.transactions || [];
//         state.pagination = action.payload.pagination || initialState.pagination;
//       })
//       .addCase(fetchAllTransactions.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })
      
//       // Fetch Income Transactions
//       .addCase(fetchIncomeTransactions.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchIncomeTransactions.fulfilled, (state, action) => {
//         state.loading = false;
//         state.incomeTransactions = action.payload.transactions || [];
//         state.pagination = action.payload.pagination || initialState.pagination;
//       })
//       .addCase(fetchIncomeTransactions.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })
      
//       // Fetch Expense Transactions
//       .addCase(fetchExpenseTransactions.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchExpenseTransactions.fulfilled, (state, action) => {
//         state.loading = false;
//         state.expenseTransactions = action.payload.transactions || [];
//         state.pagination = action.payload.pagination || initialState.pagination;
//       })
//       .addCase(fetchExpenseTransactions.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })
      
//       // ✅ NEW: Fetch Today's Transactions
//       .addCase(fetchTodayTransactions.pending, (state) => {
//         state.todayTransactions.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchTodayTransactions.fulfilled, (state, action) => {
//         state.todayTransactions.loading = false;
//         state.todayTransactions.transactions = action.payload.transactions || [];
//         state.todayTransactions.summary = action.payload.summary || {
//           totalIncome: 0,
//           totalExpense: 0,
//           netAmount: 0,
//           count: 0,
//           handCash: { income: 0, expense: 0, balance: 0 },
//           bank: { income: 0, expense: 0, balance: 0 }
//         };
//       })
//       .addCase(fetchTodayTransactions.rejected, (state, action) => {
//         state.todayTransactions.loading = false;
//         state.error = action.payload;
//       })
      
//       // Create Transaction
//       .addCase(createNewTransaction.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(createNewTransaction.fulfilled, (state) => {
//         state.loading = false;
//       })
//       .addCase(createNewTransaction.rejected, (state) => {
//         state.loading = false;
//       })
      
//       // Delete Transaction
//       .addCase(deleteExistingTransaction.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(deleteExistingTransaction.fulfilled, (state) => {
//         state.loading = false;
//       })
//       .addCase(deleteExistingTransaction.rejected, (state) => {
//         state.loading = false;
//       })
      
//       // Fetch Summary
//       .addCase(fetchTransactionSummary.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(fetchTransactionSummary.fulfilled, (state, action) => {
//         state.loading = false;
//         state.summary = { ...state.summary, ...action.payload };
//       })
//       .addCase(fetchTransactionSummary.rejected, (state) => {
//         state.loading = false;
//       })
      
//       // ============================================
//       // AUTO-INCOME REDUCERS
//       // ============================================
      
//       // Fetch Auto Incomes
//       .addCase(fetchAutoIncomes.pending, (state) => {
//         state.autoIncomeLoading = true;
//         state.error = null;
//       })
//       .addCase(fetchAutoIncomes.fulfilled, (state, action) => {
//         state.autoIncomeLoading = false;
//         state.autoIncomes = action.payload.autoIncomes || [];
//       })
//       .addCase(fetchAutoIncomes.rejected, (state, action) => {
//         state.autoIncomeLoading = false;
//         state.error = action.payload;
//       })
      
//       // Setup Auto Income
//       .addCase(setupNewAutoIncome.pending, (state) => {
//         state.autoIncomeLoading = true;
//       })
//       .addCase(setupNewAutoIncome.fulfilled, (state) => {
//         state.autoIncomeLoading = false;
//       })
//       .addCase(setupNewAutoIncome.rejected, (state) => {
//         state.autoIncomeLoading = false;
//       })
      
//       // Update Auto Income
//       .addCase(updateAutoIncome.pending, (state) => {
//         state.autoIncomeLoading = true;
//       })
//       .addCase(updateAutoIncome.fulfilled, (state) => {
//         state.autoIncomeLoading = false;
//       })
//       .addCase(updateAutoIncome.rejected, (state) => {
//         state.autoIncomeLoading = false;
//       })
      
//       // Delete Auto Income
//       .addCase(deleteAutoIncome.pending, (state) => {
//         state.autoIncomeLoading = true;
//       })
//       .addCase(deleteAutoIncome.fulfilled, (state) => {
//         state.autoIncomeLoading = false;
//       })
//       .addCase(deleteAutoIncome.rejected, (state) => {
//         state.autoIncomeLoading = false;
//       })
      
//       // Pause Auto Income
//       .addCase(pauseAutoIncome.pending, (state) => {
//         state.autoIncomeLoading = true;
//       })
//       .addCase(pauseAutoIncome.fulfilled, (state) => {
//         state.autoIncomeLoading = false;
//       })
//       .addCase(pauseAutoIncome.rejected, (state) => {
//         state.autoIncomeLoading = false;
//       })
      
//       // Resume Auto Income
//       .addCase(resumeAutoIncome.pending, (state) => {
//         state.autoIncomeLoading = true;
//       })
//       .addCase(resumeAutoIncome.fulfilled, (state) => {
//         state.autoIncomeLoading = false;
//       })
//       .addCase(resumeAutoIncome.rejected, (state) => {
//         state.autoIncomeLoading = false;
//       })
      
//       // Fetch Upcoming Auto Incomes
//       .addCase(fetchUpcomingAutoIncomes.pending, (state) => {
//         state.autoIncomeLoading = true;
//       })
//       .addCase(fetchUpcomingAutoIncomes.fulfilled, (state, action) => {
//         state.autoIncomeLoading = false;
//         state.upcomingAutoIncomes = action.payload.upcoming || [];
//       })
//       .addCase(fetchUpcomingAutoIncomes.rejected, (state) => {
//         state.autoIncomeLoading = false;
//       })
      
//       // Fetch Auto Income Stats
//       .addCase(fetchAutoIncomeStats.pending, (state) => {
//         state.autoIncomeLoading = true;
//       })
//       .addCase(fetchAutoIncomeStats.fulfilled, (state, action) => {
//         state.autoIncomeLoading = false;
//         state.autoIncomeStats = action.payload;
//       })
//       .addCase(fetchAutoIncomeStats.rejected, (state) => {
//         state.autoIncomeLoading = false;
//       })
      
//       // ============================================
//       // TRANSACTION DETAIL REDUCERS
//       // ============================================
      
//       // Fetch Transaction By ID
//       .addCase(fetchTransactionById.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(fetchTransactionById.fulfilled, (state, action) => {
//         state.loading = false;
//         state.currentTransaction = action.payload;
//       })
//       .addCase(fetchTransactionById.rejected, (state) => {
//         state.loading = false;
//       })
      
//       // Fetch Transactions By Order
//       .addCase(fetchTransactionsByOrder.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(fetchTransactionsByOrder.fulfilled, (state, action) => {
//         state.loading = false;
//         state.allTransactions = action.payload.transactions || [];
//       })
//       .addCase(fetchTransactionsByOrder.rejected, (state) => {
//         state.loading = false;
//       });
//   }
// });

// export const { 
//   setFilters, 
//   resetFilters, 
//   clearTransactions,
//   clearAutoIncomes,
//   setCurrentAutoIncome,
//   clearTodayTransactions // ✅ NEW
// } = transactionSlice.actions;

// // ============================================
// // SELECTORS
// // ============================================

// // Existing selectors
// export const selectAllTransactions = (state) => state.transaction.allTransactions;
// export const selectIncomeTransactions = (state) => state.transaction.incomeTransactions;
// export const selectExpenseTransactions = (state) => state.transaction.expenseTransactions;
// export const selectTransactionSummary = (state) => state.transaction.summary;
// export const selectTransactionFilters = (state) => state.transaction.filters;
// export const selectTransactionPagination = (state) => state.transaction.pagination;
// export const selectTransactionLoading = (state) => state.transaction.loading;
// export const selectCurrentTransaction = (state) => state.transaction.currentTransaction;

// // ✅ NEW: Today's transactions selectors
// export const selectTodayTransactions = (state) => state.transaction.todayTransactions.transactions;
// export const selectTodaySummary = (state) => state.transaction.todayTransactions.summary;
// export const selectTodayLoading = (state) => state.transaction.todayTransactions.loading;

// // Auto-income selectors
// export const selectAutoIncomes = (state) => state.transaction.autoIncomes;
// export const selectCurrentAutoIncome = (state) => state.transaction.currentAutoIncome;
// export const selectUpcomingAutoIncomes = (state) => state.transaction.upcomingAutoIncomes;
// export const selectAutoIncomeStats = (state) => state.transaction.autoIncomeStats;
// export const selectAutoIncomeLoading = (state) => state.transaction.autoIncomeLoading;

// export default transactionSlice.reducer;













// // features/transaction/transactionSlice.js - COMPLETE FIXED VERSION WITH DAILY REVENUE
// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import showToast from '../../utils/toast';
// import * as transactionApi from './transactionApi';

// const initialState = {
//   // Separate states for different views
//   allTransactions: [],        // For overview (both income & expense)
//   incomeTransactions: [],     // For income page
//   expenseTransactions: [],    // For expense page
//   currentTransaction: null,
  
//   // 👇 Today's transactions for dashboard
//   todayTransactions: {
//     transactions: [],
//     summary: {
//       totalIncome: 0,
//       totalExpense: 0,
//       netAmount: 0,
//       count: 0,
//       handCash: { income: 0, expense: 0, balance: 0 },
//       bank: { income: 0, expense: 0, balance: 0 }
//     },
//     loading: false
//   },
  
//   // ✅ NEW: Daily revenue stats for charts
//   dailyRevenue: {
//     chartData: [],
//     summary: {
//       totalRevenue: 0,
//       totalExpense: 0,
//       netProfit: 0,
//       period: 'month',
//       dateRange: { start: null, end: null }
//     },
//     loading: false
//   },
  
//   // Auto-income states
//   autoIncomes: [],            // List of auto-income schedules
//   currentAutoIncome: null,    // Selected auto-income for edit
//   upcomingAutoIncomes: [],    // Next 30 days auto incomes
//   autoIncomeStats: {},        // Stats for auto incomes
  
//   summary: {
//     totalIncome: 0,
//     totalExpense: 0,
//     netBalance: 0,
//     handCash: {
//       income: 0,
//       expense: 0,
//       balance: 0
//     },
//     bank: {
//       income: 0,
//       expense: 0,
//       balance: 0
//     },
//     totalBalance: 0
//   },
  
//   pagination: {
//     page: 1,
//     limit: 20,
//     total: 0,
//     pages: 0
//   },
  
//   loading: false,
//   autoIncomeLoading: false,
//   error: null,
  
//   filters: {
//     type: '',
//     accountType: '',
//     category: '',
//     startDate: '',
//     endDate: '',
//     page: 1,
//     limit: 20,
//     sortBy: 'transactionDate',
//     sortOrder: 'desc'
//   }
// };

// // ============================================
// // ✅ EXISTING TRANSACTION ACTIONS
// // ============================================

// // Fetch ALL transactions (for overview - no type filter)
// export const fetchAllTransactions = createAsyncThunk(
//   'transaction/fetchAllTransactions',
//   async (params = {}, { rejectWithValue }) => {
//     try {
//       const response = await transactionApi.getTransactions({ 
//         ...params,
//         limit: params.limit || 20 
//       });
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Failed to fetch transactions');
//     }
//   }
// );

// // Fetch ONLY income transactions
// export const fetchIncomeTransactions = createAsyncThunk(
//   'transaction/fetchIncomeTransactions',
//   async (filters = {}, { rejectWithValue, getState }) => {
//     try {
//       const { transaction } = getState();
//       const currentFilters = { 
//         ...transaction.filters, 
//         ...filters, 
//         type: 'income' 
//       };
//       const response = await transactionApi.getTransactions(currentFilters);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Failed to fetch income');
//     }
//   }
// );

// // Fetch ONLY expense transactions
// export const fetchExpenseTransactions = createAsyncThunk(
//   'transaction/fetchExpenseTransactions',
//   async (filters = {}, { rejectWithValue, getState }) => {
//     try {
//       const { transaction } = getState();
//       const currentFilters = { 
//         ...transaction.filters, 
//         ...filters, 
//         type: 'expense' 
//       };
//       const response = await transactionApi.getTransactions(currentFilters);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Failed to fetch expense');
//     }
//   }
// );

// // Fetch transaction summary
// export const fetchTransactionSummary = createAsyncThunk(
//   'transaction/fetchTransactionSummary',
//   async (period = 'month', { rejectWithValue }) => {
//     try {
//       const response = await transactionApi.getTransactionSummary(period);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message);
//     }
//   }
// );

// // ✅ Fetch today's transactions for dashboard
// export const fetchTodayTransactions = createAsyncThunk(
//   'transaction/fetchTodayTransactions',
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await transactionApi.getTodayTransactions();
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Failed to fetch today\'s transactions');
//     }
//   }
// );

// // ✅ NEW: Fetch daily revenue stats for charts
// export const fetchDailyRevenueStats = createAsyncThunk(
//   'transaction/fetchDailyRevenueStats',
//   async (params = {}, { rejectWithValue }) => {
//     try {
//       console.log('📊 Fetching daily revenue stats with:', params);
//       const response = await transactionApi.getDailyRevenueStats(params);
//       return response.data;
//     } catch (error) {
//       console.error('❌ Error fetching daily revenue:', error);
//       return rejectWithValue(error.response?.data?.message || 'Failed to fetch daily revenue stats');
//     }
//   }
// );

// // Create new transaction
// export const createNewTransaction = createAsyncThunk(
//   'transaction/createNewTransaction',
//   async (transactionData, { rejectWithValue, dispatch }) => {
//     try {
//       const response = await transactionApi.createTransaction(transactionData);
//       showToast.success(response.message);
      
//       // Refresh all relevant data
//       dispatch(fetchAllTransactions({ limit: 20 }));
//       dispatch(fetchTransactionSummary());
//       dispatch(fetchTodayTransactions());
      
//       // Also refresh specific type if needed
//       if (transactionData.type === 'income') {
//         dispatch(fetchIncomeTransactions());
//       } else if (transactionData.type === 'expense') {
//         dispatch(fetchExpenseTransactions());
//       }
      
//       return response.data;
//     } catch (error) {
//       showToast.error(error.response?.data?.message || 'Failed to create transaction');
//       return rejectWithValue(error.response?.data?.message);
//     }
//   }
// );

// // Delete transaction
// export const deleteExistingTransaction = createAsyncThunk(
//   'transaction/deleteExistingTransaction',
//   async (id, { rejectWithValue, dispatch, getState }) => {
//     try {
//       const response = await transactionApi.deleteTransaction(id);
//       showToast.success(response.message);
      
//       // Get current type from state or fetch both
//       const { transaction } = getState();
      
//       // Refresh all data
//       dispatch(fetchAllTransactions({ limit: 20 }));
//       dispatch(fetchTransactionSummary());
//       dispatch(fetchTodayTransactions());
      
//       // Also refresh specific lists
//       dispatch(fetchIncomeTransactions());
//       dispatch(fetchExpenseTransactions());
      
//       return id;
//     } catch (error) {
//       showToast.error(error.response?.data?.message || 'Failed to delete transaction');
//       return rejectWithValue(error.response?.data?.message);
//     }
//   }
// );

// // ============================================
// // ✅ AUTO-INCOME ACTIONS
// // ============================================

// // Fetch all auto incomes
// export const fetchAutoIncomes = createAsyncThunk(
//   'transaction/fetchAutoIncomes',
//   async (params = {}, { rejectWithValue }) => {
//     try {
//       const response = await transactionApi.getAutoIncomes(params);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Failed to fetch auto incomes');
//     }
//   }
// );

// // Setup new auto income
// export const setupNewAutoIncome = createAsyncThunk(
//   'transaction/setupNewAutoIncome',
//   async (autoIncomeData, { rejectWithValue, dispatch }) => {
//     try {
//       const response = await transactionApi.setupAutoIncome(autoIncomeData);
//       showToast.success('Auto income setup successfully');
      
//       // Refresh auto incomes list
//       dispatch(fetchAutoIncomes());
      
//       return response.data;
//     } catch (error) {
//       showToast.error(error.response?.data?.message || 'Failed to setup auto income');
//       return rejectWithValue(error.response?.data?.message);
//     }
//   }
// );

// // Update auto income
// export const updateAutoIncome = createAsyncThunk(
//   'transaction/updateAutoIncome',
//   async ({ id, data }, { rejectWithValue, dispatch }) => {
//     try {
//       const response = await transactionApi.updateAutoIncome(id, data);
//       showToast.success('Auto income updated successfully');
      
//       // Refresh auto incomes list
//       dispatch(fetchAutoIncomes());
      
//       return response.data;
//     } catch (error) {
//       showToast.error(error.response?.data?.message || 'Failed to update auto income');
//       return rejectWithValue(error.response?.data?.message);
//     }
//   }
// );

// // Delete auto income
// export const deleteAutoIncome = createAsyncThunk(
//   'transaction/deleteAutoIncome',
//   async (id, { rejectWithValue, dispatch }) => {
//     try {
//       const response = await transactionApi.deleteAutoIncome(id);
//       showToast.success('Auto income deleted successfully');
      
//       // Refresh auto incomes list
//       dispatch(fetchAutoIncomes());
      
//       return id;
//     } catch (error) {
//       showToast.error(error.response?.data?.message || 'Failed to delete auto income');
//       return rejectWithValue(error.response?.data?.message);
//     }
//   }
// );

// // Pause auto income
// export const pauseAutoIncome = createAsyncThunk(
//   'transaction/pauseAutoIncome',
//   async (id, { rejectWithValue, dispatch }) => {
//     try {
//       const response = await transactionApi.pauseAutoIncome(id);
//       showToast.success('Auto income paused successfully');
      
//       // Refresh auto incomes list
//       dispatch(fetchAutoIncomes());
      
//       return response.data;
//     } catch (error) {
//       showToast.error(error.response?.data?.message || 'Failed to pause auto income');
//       return rejectWithValue(error.response?.data?.message);
//     }
//   }
// );

// // Resume auto income
// export const resumeAutoIncome = createAsyncThunk(
//   'transaction/resumeAutoIncome',
//   async (id, { rejectWithValue, dispatch }) => {
//     try {
//       const response = await transactionApi.resumeAutoIncome(id);
//       showToast.success('Auto income resumed successfully');
      
//       // Refresh auto incomes list
//       dispatch(fetchAutoIncomes());
      
//       return response.data;
//     } catch (error) {
//       showToast.error(error.response?.data?.message || 'Failed to resume auto income');
//       return rejectWithValue(error.response?.data?.message);
//     }
//   }
// );

// // Get upcoming auto incomes
// export const fetchUpcomingAutoIncomes = createAsyncThunk(
//   'transaction/fetchUpcomingAutoIncomes',
//   async (days = 30, { rejectWithValue }) => {
//     try {
//       const response = await transactionApi.getUpcomingAutoIncomes(days);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Failed to fetch upcoming incomes');
//     }
//   }
// );

// // Get auto income stats
// export const fetchAutoIncomeStats = createAsyncThunk(
//   'transaction/fetchAutoIncomeStats',
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await transactionApi.getAutoIncomeStats();
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Failed to fetch auto income stats');
//     }
//   }
// );

// // ============================================
// // ✅ TRANSACTION DETAIL ACTIONS
// // ============================================

// // Fetch transaction by ID
// export const fetchTransactionById = createAsyncThunk(
//   'transaction/fetchTransactionById',
//   async (id, { rejectWithValue }) => {
//     try {
//       const response = await transactionApi.getTransactionById(id);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Failed to fetch transaction');
//     }
//   }
// );

// // Fetch transactions by order
// export const fetchTransactionsByOrder = createAsyncThunk(
//   'transaction/fetchTransactionsByOrder',
//   async (orderId, { rejectWithValue }) => {
//     try {
//       const response = await transactionApi.getTransactionsByOrder(orderId);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Failed to fetch order transactions');
//     }
//   }
// );

// // Fetch transactions by customer
// export const fetchTransactionsByCustomer = createAsyncThunk(
//   'transaction/fetchTransactionsByCustomer',
//   async ({ customerId, params }, { rejectWithValue }) => {
//     try {
//       const response = await transactionApi.getTransactionsByCustomer(customerId, params);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Failed to fetch customer transactions');
//     }
//   }
// );

// // Export transactions
// export const exportTransactions = createAsyncThunk(
//   'transaction/exportTransactions',
//   async (filters = {}, { rejectWithValue }) => {
//     try {
//       const response = await transactionApi.exportTransactions(filters);
//       showToast.success('Transactions exported successfully');
//       return response.data;
//     } catch (error) {
//       showToast.error(error.response?.data?.message || 'Failed to export transactions');
//       return rejectWithValue(error.response?.data?.message);
//     }
//   }
// );

// const transactionSlice = createSlice({
//   name: 'transaction',
//   initialState,
//   reducers: {
//     setFilters: (state, action) => {
//       state.filters = { ...state.filters, ...action.payload };
//     },
//     resetFilters: (state) => {
//       state.filters = initialState.filters;
//     },
//     clearTransactions: (state) => {
//       state.allTransactions = [];
//       state.incomeTransactions = [];
//       state.expenseTransactions = [];
//     },
//     clearAutoIncomes: (state) => {
//       state.autoIncomes = [];
//       state.upcomingAutoIncomes = [];
//     },
//     setCurrentAutoIncome: (state, action) => {
//       state.currentAutoIncome = action.payload;
//     },
//     // ✅ Clear today's transactions
//     clearTodayTransactions: (state) => {
//       state.todayTransactions = {
//         transactions: [],
//         summary: {
//           totalIncome: 0,
//           totalExpense: 0,
//           netAmount: 0,
//           count: 0,
//           handCash: { income: 0, expense: 0, balance: 0 },
//           bank: { income: 0, expense: 0, balance: 0 }
//         },
//         loading: false
//       };
//     },
//     // ✅ NEW: Clear daily revenue data
//     clearDailyRevenue: (state) => {
//       state.dailyRevenue = {
//         chartData: [],
//         summary: {
//           totalRevenue: 0,
//           totalExpense: 0,
//           netProfit: 0,
//           period: 'month',
//           dateRange: { start: null, end: null }
//         },
//         loading: false
//       };
//     }
//   },
//   extraReducers: (builder) => {
//     builder
//       // ============================================
//       // EXISTING REDUCERS
//       // ============================================
      
//       // Fetch All Transactions
//       .addCase(fetchAllTransactions.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchAllTransactions.fulfilled, (state, action) => {
//         state.loading = false;
//         state.allTransactions = action.payload.transactions || [];
//         state.pagination = action.payload.pagination || initialState.pagination;
//       })
//       .addCase(fetchAllTransactions.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })
      
//       // Fetch Income Transactions
//       .addCase(fetchIncomeTransactions.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchIncomeTransactions.fulfilled, (state, action) => {
//         state.loading = false;
//         state.incomeTransactions = action.payload.transactions || [];
//         state.pagination = action.payload.pagination || initialState.pagination;
//       })
//       .addCase(fetchIncomeTransactions.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })
      
//       // Fetch Expense Transactions
//       .addCase(fetchExpenseTransactions.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchExpenseTransactions.fulfilled, (state, action) => {
//         state.loading = false;
//         state.expenseTransactions = action.payload.transactions || [];
//         state.pagination = action.payload.pagination || initialState.pagination;
//       })
//       .addCase(fetchExpenseTransactions.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })
      
//       // Fetch Today's Transactions
//       .addCase(fetchTodayTransactions.pending, (state) => {
//         state.todayTransactions.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchTodayTransactions.fulfilled, (state, action) => {
//         state.todayTransactions.loading = false;
//         state.todayTransactions.transactions = action.payload.transactions || [];
//         state.todayTransactions.summary = action.payload.summary || {
//           totalIncome: 0,
//           totalExpense: 0,
//           netAmount: 0,
//           count: 0,
//           handCash: { income: 0, expense: 0, balance: 0 },
//           bank: { income: 0, expense: 0, balance: 0 }
//         };
//       })
//       .addCase(fetchTodayTransactions.rejected, (state, action) => {
//         state.todayTransactions.loading = false;
//         state.error = action.payload;
//       })
      
//       // ✅ NEW: Fetch Daily Revenue Stats
//       .addCase(fetchDailyRevenueStats.pending, (state) => {
//         state.dailyRevenue.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchDailyRevenueStats.fulfilled, (state, action) => {
//         state.dailyRevenue.loading = false;
//         state.dailyRevenue.chartData = action.payload.chartData || [];
//         state.dailyRevenue.summary = action.payload.summary || {
//           totalRevenue: 0,
//           totalExpense: 0,
//           netProfit: 0,
//           period: 'month',
//           dateRange: { start: null, end: null }
//         };
//         console.log('✅ Daily revenue stats updated:', state.dailyRevenue);
//       })
//       .addCase(fetchDailyRevenueStats.rejected, (state, action) => {
//         state.dailyRevenue.loading = false;
//         state.error = action.payload;
//         console.error('❌ Daily revenue stats rejected:', action.payload);
//       })
      
//       // Create Transaction
//       .addCase(createNewTransaction.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(createNewTransaction.fulfilled, (state) => {
//         state.loading = false;
//       })
//       .addCase(createNewTransaction.rejected, (state) => {
//         state.loading = false;
//       })
      
//       // Delete Transaction
//       .addCase(deleteExistingTransaction.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(deleteExistingTransaction.fulfilled, (state) => {
//         state.loading = false;
//       })
//       .addCase(deleteExistingTransaction.rejected, (state) => {
//         state.loading = false;
//       })
      
//       // Fetch Summary
//       .addCase(fetchTransactionSummary.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(fetchTransactionSummary.fulfilled, (state, action) => {
//         state.loading = false;
//         state.summary = { ...state.summary, ...action.payload };
//       })
//       .addCase(fetchTransactionSummary.rejected, (state) => {
//         state.loading = false;
//       })
      
//       // ============================================
//       // AUTO-INCOME REDUCERS
//       // ============================================
      
//       // Fetch Auto Incomes
//       .addCase(fetchAutoIncomes.pending, (state) => {
//         state.autoIncomeLoading = true;
//         state.error = null;
//       })
//       .addCase(fetchAutoIncomes.fulfilled, (state, action) => {
//         state.autoIncomeLoading = false;
//         state.autoIncomes = action.payload.autoIncomes || [];
//       })
//       .addCase(fetchAutoIncomes.rejected, (state, action) => {
//         state.autoIncomeLoading = false;
//         state.error = action.payload;
//       })
      
//       // Setup Auto Income
//       .addCase(setupNewAutoIncome.pending, (state) => {
//         state.autoIncomeLoading = true;
//       })
//       .addCase(setupNewAutoIncome.fulfilled, (state) => {
//         state.autoIncomeLoading = false;
//       })
//       .addCase(setupNewAutoIncome.rejected, (state) => {
//         state.autoIncomeLoading = false;
//       })
      
//       // Update Auto Income
//       .addCase(updateAutoIncome.pending, (state) => {
//         state.autoIncomeLoading = true;
//       })
//       .addCase(updateAutoIncome.fulfilled, (state) => {
//         state.autoIncomeLoading = false;
//       })
//       .addCase(updateAutoIncome.rejected, (state) => {
//         state.autoIncomeLoading = false;
//       })
      
//       // Delete Auto Income
//       .addCase(deleteAutoIncome.pending, (state) => {
//         state.autoIncomeLoading = true;
//       })
//       .addCase(deleteAutoIncome.fulfilled, (state) => {
//         state.autoIncomeLoading = false;
//       })
//       .addCase(deleteAutoIncome.rejected, (state) => {
//         state.autoIncomeLoading = false;
//       })
      
//       // Pause Auto Income
//       .addCase(pauseAutoIncome.pending, (state) => {
//         state.autoIncomeLoading = true;
//       })
//       .addCase(pauseAutoIncome.fulfilled, (state) => {
//         state.autoIncomeLoading = false;
//       })
//       .addCase(pauseAutoIncome.rejected, (state) => {
//         state.autoIncomeLoading = false;
//       })
      
//       // Resume Auto Income
//       .addCase(resumeAutoIncome.pending, (state) => {
//         state.autoIncomeLoading = true;
//       })
//       .addCase(resumeAutoIncome.fulfilled, (state) => {
//         state.autoIncomeLoading = false;
//       })
//       .addCase(resumeAutoIncome.rejected, (state) => {
//         state.autoIncomeLoading = false;
//       })
      
//       // Fetch Upcoming Auto Incomes
//       .addCase(fetchUpcomingAutoIncomes.pending, (state) => {
//         state.autoIncomeLoading = true;
//       })
//       .addCase(fetchUpcomingAutoIncomes.fulfilled, (state, action) => {
//         state.autoIncomeLoading = false;
//         state.upcomingAutoIncomes = action.payload.upcoming || [];
//       })
//       .addCase(fetchUpcomingAutoIncomes.rejected, (state) => {
//         state.autoIncomeLoading = false;
//       })
      
//       // Fetch Auto Income Stats
//       .addCase(fetchAutoIncomeStats.pending, (state) => {
//         state.autoIncomeLoading = true;
//       })
//       .addCase(fetchAutoIncomeStats.fulfilled, (state, action) => {
//         state.autoIncomeLoading = false;
//         state.autoIncomeStats = action.payload;
//       })
//       .addCase(fetchAutoIncomeStats.rejected, (state) => {
//         state.autoIncomeLoading = false;
//       })
      
//       // ============================================
//       // TRANSACTION DETAIL REDUCERS
//       // ============================================
      
//       // Fetch Transaction By ID
//       .addCase(fetchTransactionById.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(fetchTransactionById.fulfilled, (state, action) => {
//         state.loading = false;
//         state.currentTransaction = action.payload;
//       })
//       .addCase(fetchTransactionById.rejected, (state) => {
//         state.loading = false;
//       })
      
//       // Fetch Transactions By Order
//       .addCase(fetchTransactionsByOrder.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(fetchTransactionsByOrder.fulfilled, (state, action) => {
//         state.loading = false;
//         state.allTransactions = action.payload.transactions || [];
//       })
//       .addCase(fetchTransactionsByOrder.rejected, (state) => {
//         state.loading = false;
//       });
//   }
// });

// export const { 
//   setFilters, 
//   resetFilters, 
//   clearTransactions,
//   clearAutoIncomes,
//   setCurrentAutoIncome,
//   clearTodayTransactions,
//   clearDailyRevenue // ✅ NEW
// } = transactionSlice.actions;

// // ============================================
// // SELECTORS
// // ============================================

// // Existing selectors
// export const selectAllTransactions = (state) => state.transaction.allTransactions;
// export const selectIncomeTransactions = (state) => state.transaction.incomeTransactions;
// export const selectExpenseTransactions = (state) => state.transaction.expenseTransactions;
// export const selectTransactionSummary = (state) => state.transaction.summary;
// export const selectTransactionFilters = (state) => state.transaction.filters;
// export const selectTransactionPagination = (state) => state.transaction.pagination;
// export const selectTransactionLoading = (state) => state.transaction.loading;
// export const selectCurrentTransaction = (state) => state.transaction.currentTransaction;

// // Today's transactions selectors
// export const selectTodayTransactions = (state) => state.transaction.todayTransactions.transactions;
// export const selectTodaySummary = (state) => state.transaction.todayTransactions.summary;
// export const selectTodayLoading = (state) => state.transaction.todayTransactions.loading;

// // ✅ NEW: Daily revenue selectors
// export const selectDailyRevenueData = (state) => state.transaction.dailyRevenue.chartData;
// export const selectDailyRevenueSummary = (state) => state.transaction.dailyRevenue.summary;
// export const selectDailyRevenueLoading = (state) => state.transaction.dailyRevenue.loading;

// // Auto-income selectors
// export const selectAutoIncomes = (state) => state.transaction.autoIncomes;
// export const selectCurrentAutoIncome = (state) => state.transaction.currentAutoIncome;
// export const selectUpcomingAutoIncomes = (state) => state.transaction.upcomingAutoIncomes;
// export const selectAutoIncomeStats = (state) => state.transaction.autoIncomeStats;
// export const selectAutoIncomeLoading = (state) => state.transaction.autoIncomeLoading;

// export default transactionSlice.reducer;














// // features/transaction/transactionSlice.js - UPDATED WITH IST DATE HANDLING

// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import showToast from '../../utils/toast';
// import * as transactionApi from './transactionApi';

// const initialState = {
//   // Separate states for different views
//   allTransactions: [],        // For overview (both income & expense)
//   incomeTransactions: [],     // For income page
//   expenseTransactions: [],    // For expense page
//   currentTransaction: null,
  
//   // 👇 Today's transactions for dashboard
//   todayTransactions: {
//     transactions: [],
//     summary: {
//       totalIncome: 0,
//       totalExpense: 0,
//       netAmount: 0,
//       count: 0,
//       handCash: { income: 0, expense: 0, balance: 0 },
//       bank: { income: 0, expense: 0, balance: 0 }
//     },
//     loading: false
//   },
  
//   // ✅ NEW: Daily revenue stats for charts
//   dailyRevenue: {
//     chartData: [],
//     summary: {
//       totalRevenue: 0,
//       totalExpense: 0,
//       netProfit: 0,
//       period: 'month',
//       dateRange: { start: null, end: null }
//     },
//     loading: false
//   },
  
//   // Auto-income states
//   autoIncomes: [],
//   currentAutoIncome: null,
//   upcomingAutoIncomes: [],
//   autoIncomeStats: {},
  
//   summary: {
//     totalIncome: 0,
//     totalExpense: 0,
//     netBalance: 0,
//     handCash: {
//       income: 0,
//       expense: 0,
//       balance: 0
//     },
//     bank: {
//       income: 0,
//       expense: 0,
//       balance: 0
//     },
//     totalBalance: 0
//   },
  
//   pagination: {
//     page: 1,
//     limit: 20,
//     total: 0,
//     pages: 0
//   },
  
//   loading: false,
//   autoIncomeLoading: false,
//   error: null,
  
//   filters: {
//     type: '',
//     accountType: '',
//     category: '',
//     startDate: '',
//     endDate: '',
//     page: 1,
//     limit: 20,
//     sortBy: 'transactionDate',
//     sortOrder: 'desc'
//   }
// };

// // ============================================
// // HELPER: Process transactions with IST dates
// // ============================================
// const processTransactions = (transactions) => {
//   if (!transactions || !Array.isArray(transactions)) return [];
  
//   return transactions.map(t => {
//     // If backend already provided IST formatted dates, use them
//     if (t.transactionDateIST) {
//       return t;
//     }
    
//     // Otherwise, format it manually
//     const date = new Date(t.transactionDate);
//     return {
//       ...t,
//       transactionDateIST: date.toLocaleString('en-IN', {
//         timeZone: 'Asia/Kolkata',
//         day: '2-digit',
//         month: 'short',
//         year: 'numeric',
//         hour: '2-digit',
//         minute: '2-digit',
//         hour12: true
//       }),
//       transactionDateOnlyIST: date.toLocaleDateString('en-IN', {
//         timeZone: 'Asia/Kolkata',
//         day: '2-digit',
//         month: 'short',
//         year: 'numeric'
//       }),
//       transactionTimeOnlyIST: date.toLocaleTimeString('en-IN', {
//         timeZone: 'Asia/Kolkata',
//         hour: '2-digit',
//         minute: '2-digit',
//         hour12: true
//       })
//     };
//   });
// };

// // ============================================
// // ✅ EXISTING TRANSACTION ACTIONS
// // ============================================

// // Fetch ALL transactions (for overview - no type filter)
// export const fetchAllTransactions = createAsyncThunk(
//   'transaction/fetchAllTransactions',
//   async (params = {}, { rejectWithValue }) => {
//     try {
//       const response = await transactionApi.getTransactions({ 
//         ...params,
//         limit: params.limit || 20 
//       });
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Failed to fetch transactions');
//     }
//   }
// );

// // Fetch ONLY income transactions
// export const fetchIncomeTransactions = createAsyncThunk(
//   'transaction/fetchIncomeTransactions',
//   async (filters = {}, { rejectWithValue, getState }) => {
//     try {
//       const { transaction } = getState();
//       const currentFilters = { 
//         ...transaction.filters, 
//         ...filters, 
//         type: 'income' 
//       };
//       const response = await transactionApi.getTransactions(currentFilters);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Failed to fetch income');
//     }
//   }
// );

// // Fetch ONLY expense transactions
// export const fetchExpenseTransactions = createAsyncThunk(
//   'transaction/fetchExpenseTransactions',
//   async (filters = {}, { rejectWithValue, getState }) => {
//     try {
//       const { transaction } = getState();
//       const currentFilters = { 
//         ...transaction.filters, 
//         ...filters, 
//         type: 'expense' 
//       };
//       const response = await transactionApi.getTransactions(currentFilters);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Failed to fetch expense');
//     }
//   }
// );

// // Fetch transaction summary
// export const fetchTransactionSummary = createAsyncThunk(
//   'transaction/fetchTransactionSummary',
//   async (period = 'month', { rejectWithValue }) => {
//     try {
//       const response = await transactionApi.getTransactionSummary(period);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message);
//     }
//   }
// );

// // ✅ Fetch today's transactions for dashboard
// export const fetchTodayTransactions = createAsyncThunk(
//   'transaction/fetchTodayTransactions',
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await transactionApi.getTodayTransactions();
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Failed to fetch today\'s transactions');
//     }
//   }
// );

// // ✅ Fetch daily revenue stats for charts
// export const fetchDailyRevenueStats = createAsyncThunk(
//   'transaction/fetchDailyRevenueStats',
//   async (params = {}, { rejectWithValue }) => {
//     try {
//       console.log('📊 Fetching daily revenue stats with:', params);
//       const response = await transactionApi.getDailyRevenueStats(params);
//       return response.data;
//     } catch (error) {
//       console.error('❌ Error fetching daily revenue:', error);
//       return rejectWithValue(error.response?.data?.message || 'Failed to fetch daily revenue stats');
//     }
//   }
// );

// // Create new transaction
// export const createNewTransaction = createAsyncThunk(
//   'transaction/createNewTransaction',
//   async (transactionData, { rejectWithValue, dispatch }) => {
//     try {
//       const response = await transactionApi.createTransaction(transactionData);
//       showToast.success(response.message);
      
//       // Refresh all relevant data
//       dispatch(fetchAllTransactions({ limit: 20 }));
//       dispatch(fetchTransactionSummary());
//       dispatch(fetchTodayTransactions());
      
//       // Also refresh specific type if needed
//       if (transactionData.type === 'income') {
//         dispatch(fetchIncomeTransactions());
//       } else if (transactionData.type === 'expense') {
//         dispatch(fetchExpenseTransactions());
//       }
      
//       return response.data;
//     } catch (error) {
//       showToast.error(error.response?.data?.message || 'Failed to create transaction');
//       return rejectWithValue(error.response?.data?.message);
//     }
//   }
// );

// // Delete transaction
// export const deleteExistingTransaction = createAsyncThunk(
//   'transaction/deleteExistingTransaction',
//   async (id, { rejectWithValue, dispatch, getState }) => {
//     try {
//       const response = await transactionApi.deleteTransaction(id);
//       showToast.success(response.message);
      
//       // Refresh all data
//       dispatch(fetchAllTransactions({ limit: 20 }));
//       dispatch(fetchTransactionSummary());
//       dispatch(fetchTodayTransactions());
      
//       // Also refresh specific lists
//       dispatch(fetchIncomeTransactions());
//       dispatch(fetchExpenseTransactions());
      
//       return id;
//     } catch (error) {
//       showToast.error(error.response?.data?.message || 'Failed to delete transaction');
//       return rejectWithValue(error.response?.data?.message);
//     }
//   }
// );

// // ============================================
// // AUTO-INCOME ACTIONS (keeping existing ones)
// // ============================================

// // Fetch all auto incomes
// export const fetchAutoIncomes = createAsyncThunk(
//   'transaction/fetchAutoIncomes',
//   async (params = {}, { rejectWithValue }) => {
//     try {
//       const response = await transactionApi.getAutoIncomes(params);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Failed to fetch auto incomes');
//     }
//   }
// );

// // Setup new auto income
// export const setupNewAutoIncome = createAsyncThunk(
//   'transaction/setupNewAutoIncome',
//   async (autoIncomeData, { rejectWithValue, dispatch }) => {
//     try {
//       const response = await transactionApi.setupAutoIncome(autoIncomeData);
//       showToast.success('Auto income setup successfully');
//       dispatch(fetchAutoIncomes());
//       return response.data;
//     } catch (error) {
//       showToast.error(error.response?.data?.message || 'Failed to setup auto income');
//       return rejectWithValue(error.response?.data?.message);
//     }
//   }
// );

// // Update auto income
// export const updateAutoIncome = createAsyncThunk(
//   'transaction/updateAutoIncome',
//   async ({ id, data }, { rejectWithValue, dispatch }) => {
//     try {
//       const response = await transactionApi.updateAutoIncome(id, data);
//       showToast.success('Auto income updated successfully');
//       dispatch(fetchAutoIncomes());
//       return response.data;
//     } catch (error) {
//       showToast.error(error.response?.data?.message || 'Failed to update auto income');
//       return rejectWithValue(error.response?.data?.message);
//     }
//   }
// );

// // Delete auto income
// export const deleteAutoIncome = createAsyncThunk(
//   'transaction/deleteAutoIncome',
//   async (id, { rejectWithValue, dispatch }) => {
//     try {
//       const response = await transactionApi.deleteAutoIncome(id);
//       showToast.success('Auto income deleted successfully');
//       dispatch(fetchAutoIncomes());
//       return id;
//     } catch (error) {
//       showToast.error(error.response?.data?.message || 'Failed to delete auto income');
//       return rejectWithValue(error.response?.data?.message);
//     }
//   }
// );

// // Pause auto income
// export const pauseAutoIncome = createAsyncThunk(
//   'transaction/pauseAutoIncome',
//   async (id, { rejectWithValue, dispatch }) => {
//     try {
//       const response = await transactionApi.pauseAutoIncome(id);
//       showToast.success('Auto income paused successfully');
//       dispatch(fetchAutoIncomes());
//       return response.data;
//     } catch (error) {
//       showToast.error(error.response?.data?.message || 'Failed to pause auto income');
//       return rejectWithValue(error.response?.data?.message);
//     }
//   }
// );

// // Resume auto income
// export const resumeAutoIncome = createAsyncThunk(
//   'transaction/resumeAutoIncome',
//   async (id, { rejectWithValue, dispatch }) => {
//     try {
//       const response = await transactionApi.resumeAutoIncome(id);
//       showToast.success('Auto income resumed successfully');
//       dispatch(fetchAutoIncomes());
//       return response.data;
//     } catch (error) {
//       showToast.error(error.response?.data?.message || 'Failed to resume auto income');
//       return rejectWithValue(error.response?.data?.message);
//     }
//   }
// );

// // Get upcoming auto incomes
// export const fetchUpcomingAutoIncomes = createAsyncThunk(
//   'transaction/fetchUpcomingAutoIncomes',
//   async (days = 30, { rejectWithValue }) => {
//     try {
//       const response = await transactionApi.getUpcomingAutoIncomes(days);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Failed to fetch upcoming incomes');
//     }
//   }
// );

// // Get auto income stats
// export const fetchAutoIncomeStats = createAsyncThunk(
//   'transaction/fetchAutoIncomeStats',
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await transactionApi.getAutoIncomeStats();
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Failed to fetch auto income stats');
//     }
//   }
// );

// // ============================================
// // TRANSACTION DETAIL ACTIONS
// // ============================================

// // Fetch transaction by ID
// export const fetchTransactionById = createAsyncThunk(
//   'transaction/fetchTransactionById',
//   async (id, { rejectWithValue }) => {
//     try {
//       const response = await transactionApi.getTransactionById(id);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Failed to fetch transaction');
//     }
//   }
// );

// // Fetch transactions by order
// export const fetchTransactionsByOrder = createAsyncThunk(
//   'transaction/fetchTransactionsByOrder',
//   async (orderId, { rejectWithValue }) => {
//     try {
//       const response = await transactionApi.getTransactionsByOrder(orderId);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Failed to fetch order transactions');
//     }
//   }
// );

// // Fetch transactions by customer
// export const fetchTransactionsByCustomer = createAsyncThunk(
//   'transaction/fetchTransactionsByCustomer',
//   async ({ customerId, params }, { rejectWithValue }) => {
//     try {
//       const response = await transactionApi.getTransactionsByCustomer(customerId, params);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Failed to fetch customer transactions');
//     }
//   }
// );

// // Export transactions
// export const exportTransactions = createAsyncThunk(
//   'transaction/exportTransactions',
//   async (filters = {}, { rejectWithValue }) => {
//     try {
//       const response = await transactionApi.exportTransactions(filters);
//       showToast.success('Transactions exported successfully');
//       return response.data;
//     } catch (error) {
//       showToast.error(error.response?.data?.message || 'Failed to export transactions');
//       return rejectWithValue(error.response?.data?.message);
//     }
//   }
// );

// const transactionSlice = createSlice({
//   name: 'transaction',
//   initialState,
//   reducers: {
//     setFilters: (state, action) => {
//       state.filters = { ...state.filters, ...action.payload };
//     },
//     resetFilters: (state) => {
//       state.filters = initialState.filters;
//     },
//     clearTransactions: (state) => {
//       state.allTransactions = [];
//       state.incomeTransactions = [];
//       state.expenseTransactions = [];
//     },
//     clearAutoIncomes: (state) => {
//       state.autoIncomes = [];
//       state.upcomingAutoIncomes = [];
//     },
//     setCurrentAutoIncome: (state, action) => {
//       state.currentAutoIncome = action.payload;
//     },
//     clearTodayTransactions: (state) => {
//       state.todayTransactions = {
//         transactions: [],
//         summary: {
//           totalIncome: 0,
//           totalExpense: 0,
//           netAmount: 0,
//           count: 0,
//           handCash: { income: 0, expense: 0, balance: 0 },
//           bank: { income: 0, expense: 0, balance: 0 }
//         },
//         loading: false
//       };
//     },
//     clearDailyRevenue: (state) => {
//       state.dailyRevenue = {
//         chartData: [],
//         summary: {
//           totalRevenue: 0,
//           totalExpense: 0,
//           netProfit: 0,
//           period: 'month',
//           dateRange: { start: null, end: null }
//         },
//         loading: false
//       };
//     }
//   },
//   extraReducers: (builder) => {
//     builder
//       // ============================================
//       // FETCH ALL TRANSACTIONS
//       // ============================================
//       .addCase(fetchAllTransactions.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchAllTransactions.fulfilled, (state, action) => {
//         state.loading = false;
//         // ✅ Process transactions with IST dates
//         state.allTransactions = processTransactions(action.payload.transactions || []);
//         state.pagination = action.payload.pagination || initialState.pagination;
//       })
//       .addCase(fetchAllTransactions.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })
      
//       // ============================================
//       // FETCH INCOME TRANSACTIONS
//       // ============================================
//       .addCase(fetchIncomeTransactions.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchIncomeTransactions.fulfilled, (state, action) => {
//         state.loading = false;
//         // ✅ Process transactions with IST dates
//         state.incomeTransactions = processTransactions(action.payload.transactions || []);
//         state.pagination = action.payload.pagination || initialState.pagination;
//       })
//       .addCase(fetchIncomeTransactions.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })
      
//       // ============================================
//       // FETCH EXPENSE TRANSACTIONS
//       // ============================================
//       .addCase(fetchExpenseTransactions.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchExpenseTransactions.fulfilled, (state, action) => {
//         state.loading = false;
//         // ✅ Process transactions with IST dates
//         state.expenseTransactions = processTransactions(action.payload.transactions || []);
//         state.pagination = action.payload.pagination || initialState.pagination;
//       })
//       .addCase(fetchExpenseTransactions.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })
      
//       // ============================================
//       // FETCH TODAY'S TRANSACTIONS
//       // ============================================
//       .addCase(fetchTodayTransactions.pending, (state) => {
//         state.todayTransactions.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchTodayTransactions.fulfilled, (state, action) => {
//         state.todayTransactions.loading = false;
//         // ✅ Process transactions with IST dates
//         state.todayTransactions.transactions = processTransactions(action.payload.transactions || []);
//         state.todayTransactions.summary = action.payload.summary || {
//           totalIncome: 0,
//           totalExpense: 0,
//           netAmount: 0,
//           count: 0,
//           handCash: { income: 0, expense: 0, balance: 0 },
//           bank: { income: 0, expense: 0, balance: 0 }
//         };
//       })
//       .addCase(fetchTodayTransactions.rejected, (state, action) => {
//         state.todayTransactions.loading = false;
//         state.error = action.payload;
//       })
      
//       // ============================================
//       // FETCH DAILY REVENUE STATS
//       // ============================================
//       .addCase(fetchDailyRevenueStats.pending, (state) => {
//         state.dailyRevenue.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchDailyRevenueStats.fulfilled, (state, action) => {
//         state.dailyRevenue.loading = false;
//         state.dailyRevenue.chartData = action.payload.chartData || [];
//         state.dailyRevenue.summary = action.payload.summary || {
//           totalRevenue: 0,
//           totalExpense: 0,
//           netProfit: 0,
//           period: 'month',
//           dateRange: { start: null, end: null }
//         };
//       })
//       .addCase(fetchDailyRevenueStats.rejected, (state, action) => {
//         state.dailyRevenue.loading = false;
//         state.error = action.payload;
//       })
      
//       // ============================================
//       // CREATE TRANSACTION
//       // ============================================
//       .addCase(createNewTransaction.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(createNewTransaction.fulfilled, (state) => {
//         state.loading = false;
//       })
//       .addCase(createNewTransaction.rejected, (state) => {
//         state.loading = false;
//       })
      
//       // ============================================
//       // DELETE TRANSACTION
//       // ============================================
//       .addCase(deleteExistingTransaction.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(deleteExistingTransaction.fulfilled, (state) => {
//         state.loading = false;
//       })
//       .addCase(deleteExistingTransaction.rejected, (state) => {
//         state.loading = false;
//       })
      
//       // ============================================
//       // FETCH SUMMARY
//       // ============================================
//       .addCase(fetchTransactionSummary.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(fetchTransactionSummary.fulfilled, (state, action) => {
//         state.loading = false;
//         state.summary = { ...state.summary, ...action.payload };
//       })
//       .addCase(fetchTransactionSummary.rejected, (state) => {
//         state.loading = false;
//       })
      
//       // ============================================
//       // FETCH TRANSACTION BY ID
//       // ============================================
//       .addCase(fetchTransactionById.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(fetchTransactionById.fulfilled, (state, action) => {
//         state.loading = false;
//         const transaction = action.payload;
//         const date = new Date(transaction.transactionDate);
//         state.currentTransaction = {
//           ...transaction,
//           transactionDateIST: date.toLocaleString('en-IN', {
//             timeZone: 'Asia/Kolkata',
//             day: '2-digit',
//             month: 'short',
//             year: 'numeric',
//             hour: '2-digit',
//             minute: '2-digit',
//             hour12: true
//           })
//         };
//       })
//       .addCase(fetchTransactionById.rejected, (state) => {
//         state.loading = false;
//       })
      
//       // ============================================
//       // FETCH TRANSACTIONS BY ORDER
//       // ============================================
//       .addCase(fetchTransactionsByOrder.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(fetchTransactionsByOrder.fulfilled, (state, action) => {
//         state.loading = false;
//         state.allTransactions = processTransactions(action.payload.transactions || []);
//       })
//       .addCase(fetchTransactionsByOrder.rejected, (state) => {
//         state.loading = false;
//       })
      
//       // ============================================
//       // AUTO-INCOME REDUCERS (keep existing)
//       // ============================================
//       .addCase(fetchAutoIncomes.pending, (state) => {
//         state.autoIncomeLoading = true;
//         state.error = null;
//       })
//       .addCase(fetchAutoIncomes.fulfilled, (state, action) => {
//         state.autoIncomeLoading = false;
//         state.autoIncomes = action.payload.autoIncomes || [];
//       })
//       .addCase(fetchAutoIncomes.rejected, (state, action) => {
//         state.autoIncomeLoading = false;
//         state.error = action.payload;
//       })
      
//       .addCase(setupNewAutoIncome.pending, (state) => {
//         state.autoIncomeLoading = true;
//       })
//       .addCase(setupNewAutoIncome.fulfilled, (state) => {
//         state.autoIncomeLoading = false;
//       })
//       .addCase(setupNewAutoIncome.rejected, (state) => {
//         state.autoIncomeLoading = false;
//       })
      
//       .addCase(updateAutoIncome.pending, (state) => {
//         state.autoIncomeLoading = true;
//       })
//       .addCase(updateAutoIncome.fulfilled, (state) => {
//         state.autoIncomeLoading = false;
//       })
//       .addCase(updateAutoIncome.rejected, (state) => {
//         state.autoIncomeLoading = false;
//       })
      
//       .addCase(deleteAutoIncome.pending, (state) => {
//         state.autoIncomeLoading = true;
//       })
//       .addCase(deleteAutoIncome.fulfilled, (state) => {
//         state.autoIncomeLoading = false;
//       })
//       .addCase(deleteAutoIncome.rejected, (state) => {
//         state.autoIncomeLoading = false;
//       })
      
//       .addCase(pauseAutoIncome.pending, (state) => {
//         state.autoIncomeLoading = true;
//       })
//       .addCase(pauseAutoIncome.fulfilled, (state) => {
//         state.autoIncomeLoading = false;
//       })
//       .addCase(pauseAutoIncome.rejected, (state) => {
//         state.autoIncomeLoading = false;
//       })
      
//       .addCase(resumeAutoIncome.pending, (state) => {
//         state.autoIncomeLoading = true;
//       })
//       .addCase(resumeAutoIncome.fulfilled, (state) => {
//         state.autoIncomeLoading = false;
//       })
//       .addCase(resumeAutoIncome.rejected, (state) => {
//         state.autoIncomeLoading = false;
//       })
      
//       .addCase(fetchUpcomingAutoIncomes.pending, (state) => {
//         state.autoIncomeLoading = true;
//       })
//       .addCase(fetchUpcomingAutoIncomes.fulfilled, (state, action) => {
//         state.autoIncomeLoading = false;
//         state.upcomingAutoIncomes = action.payload.upcoming || [];
//       })
//       .addCase(fetchUpcomingAutoIncomes.rejected, (state) => {
//         state.autoIncomeLoading = false;
//       })
      
//       .addCase(fetchAutoIncomeStats.pending, (state) => {
//         state.autoIncomeLoading = true;
//       })
//       .addCase(fetchAutoIncomeStats.fulfilled, (state, action) => {
//         state.autoIncomeLoading = false;
//         state.autoIncomeStats = action.payload;
//       })
//       .addCase(fetchAutoIncomeStats.rejected, (state) => {
//         state.autoIncomeLoading = false;
//       });
//   }
// });

// export const { 
//   setFilters, 
//   resetFilters, 
//   clearTransactions,
//   clearAutoIncomes,
//   setCurrentAutoIncome,
//   clearTodayTransactions,
//   clearDailyRevenue
// } = transactionSlice.actions;

// // ============================================
// // SELECTORS
// // ============================================

// // Existing selectors
// export const selectAllTransactions = (state) => state.transaction.allTransactions;
// export const selectIncomeTransactions = (state) => state.transaction.incomeTransactions;
// export const selectExpenseTransactions = (state) => state.transaction.expenseTransactions;
// export const selectTransactionSummary = (state) => state.transaction.summary;
// export const selectTransactionFilters = (state) => state.transaction.filters;
// export const selectTransactionPagination = (state) => state.transaction.pagination;
// export const selectTransactionLoading = (state) => state.transaction.loading;
// export const selectCurrentTransaction = (state) => state.transaction.currentTransaction;

// // Today's transactions selectors
// export const selectTodayTransactions = (state) => state.transaction.todayTransactions.transactions;
// export const selectTodaySummary = (state) => state.transaction.todayTransactions.summary;
// export const selectTodayLoading = (state) => state.transaction.todayTransactions.loading;

// // Daily revenue selectors
// export const selectDailyRevenueData = (state) => state.transaction.dailyRevenue.chartData;
// export const selectDailyRevenueSummary = (state) => state.transaction.dailyRevenue.summary;
// export const selectDailyRevenueLoading = (state) => state.transaction.dailyRevenue.loading;

// // Auto-income selectors
// export const selectAutoIncomes = (state) => state.transaction.autoIncomes;
// export const selectCurrentAutoIncome = (state) => state.transaction.currentAutoIncome;
// export const selectUpcomingAutoIncomes = (state) => state.transaction.upcomingAutoIncomes;
// export const selectAutoIncomeStats = (state) => state.transaction.autoIncomeStats;
// export const selectAutoIncomeLoading = (state) => state.transaction.autoIncomeLoading;

// export default transactionSlice.reducer;




















// features/transaction/transactionSlice.js - COMPLETE FIXED VERSION
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import showToast from '../../utils/toast';
import * as transactionApi from './transactionApi';

const initialState = {
  // Separate states for different views
  allTransactions: [],
  incomeTransactions: [],
  expenseTransactions: [],
  currentTransaction: null,
  
  // Today's transactions for dashboard
  todayTransactions: {
    transactions: [],
    summary: {
      totalIncome: 0,
      totalExpense: 0,
      netAmount: 0,
      count: 0,
      handCash: { income: 0, expense: 0, balance: 0 },
      bank: { income: 0, expense: 0, balance: 0 }
    },
    loading: false
  },
  
  // Daily revenue stats for charts
  dailyRevenue: {
    chartData: [],
    summary: {
      totalRevenue: 0,
      totalExpense: 0,
      netProfit: 0,
      period: 'month',
      dateRange: { start: null, end: null }
    },
    loading: false
  },
  
  // Auto-income states
  autoIncomes: [],
  currentAutoIncome: null,
  upcomingAutoIncomes: [],
  autoIncomeStats: {},
  
  summary: {
    totalIncome: 0,
    totalExpense: 0,
    netBalance: 0,
    handCash: {
      income: 0,
      expense: 0,
      balance: 0
    },
    bank: {
      income: 0,
      expense: 0,
      balance: 0
    },
    totalBalance: 0
  },
  
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  },

  // Distinct months with real transaction data, for the dynamic month filter
  availableMonths: [],

  loading: false,
  autoIncomeLoading: false,
  error: null,
  
  filters: {
    type: '',
    accountType: '',
    category: '',
    search: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 20,
    sortBy: 'transactionDate',
    sortOrder: 'desc'
  }
};

// ============================================
// HELPER: Process transactions with IST dates
// ============================================
const processTransactions = (transactions) => {
  if (!transactions || !Array.isArray(transactions)) return [];
  
  return transactions.map(t => {
    if (t.transactionDateIST) return t;
    
    const date = new Date(t.transactionDate);
    return {
      ...t,
      transactionDateIST: date.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      transactionDateOnlyIST: date.toLocaleDateString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      transactionTimeOnlyIST: date.toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    };
  });
};

// ============================================
// ✅ EXISTING TRANSACTION ACTIONS
// ============================================

// Fetch ALL transactions
export const fetchAllTransactions = createAsyncThunk(
  'transaction/fetchAllTransactions',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await transactionApi.getTransactions({ 
        ...params,
        limit: params.limit || 20 
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch transactions');
    }
  }
);

// Fetch ONLY income transactions
export const fetchIncomeTransactions = createAsyncThunk(
  'transaction/fetchIncomeTransactions',
  async (filters = {}, { rejectWithValue, getState }) => {
    try {
      const { transaction } = getState();
      const currentFilters = { 
        ...transaction.filters, 
        ...filters, 
        type: 'income' 
      };
      const response = await transactionApi.getTransactions(currentFilters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch income');
    }
  }
);

// Fetch ONLY expense transactions
export const fetchExpenseTransactions = createAsyncThunk(
  'transaction/fetchExpenseTransactions',
  async (filters = {}, { rejectWithValue, getState }) => {
    try {
      const { transaction } = getState();
      const currentFilters = { 
        ...transaction.filters, 
        ...filters, 
        type: 'expense' 
      };
      const response = await transactionApi.getTransactions(currentFilters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch expense');
    }
  }
);

// Fetch transaction summary
export const fetchTransactionSummary = createAsyncThunk(
  'transaction/fetchTransactionSummary',
  async (period = 'month', { rejectWithValue }) => {
    try {
      const response = await transactionApi.getTransactionSummary(period);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Fetch distinct months that actually have transaction data (dynamic month filter)
export const fetchTransactionMonths = createAsyncThunk(
  'transaction/fetchTransactionMonths',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await transactionApi.getTransactionMonths(params);
      return response.months || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch available months');
    }
  }
);

// Fetch today's transactions for dashboard
// export const fetchTodayTransactions = createAsyncThunk(
//   'transaction/fetchTodayTransactions',
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await transactionApi.getTodayTransactions();
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Failed to fetch today\'s transactions');
//     }
//   }
// );

// features/transaction/transactionSlice.js

// features/transaction/transactionSlice.js

// ✅ FIXED: Fetch today's transactions for dashboard
export const fetchTodayTransactions = createAsyncThunk(
  'transaction/fetchTodayTransactions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await transactionApi.getTodayTransactions();
      console.log('📊 API Response from /summary:', response);
      
      // ✅ Transform the response to match expected format
      if (response?.data) {
        // Extract from the correct structure
        const handCashIncome = response.data.handCash?.income || 0;
        const bankIncome = response.data.bank?.income || 0;
        const handCashExpense = response.data.handCash?.expense || 0;
        const bankExpense = response.data.bank?.expense || 0;
        
        const totalIncome = handCashIncome + bankIncome;
        const totalExpense = handCashExpense + bankExpense;
        
        const transformedResponse = {
          transactions: response.data.recentTransactions || [],
          summary: {
            totalIncome: totalIncome,
            totalExpense: totalExpense,
            netAmount: totalIncome - totalExpense,
            count: (response.data.handCash?.count || 0) + (response.data.bank?.count || 0),
            handCash: {
              income: handCashIncome,
              expense: handCashExpense,
              balance: handCashIncome - handCashExpense
            },
            bank: {
              income: bankIncome,
              expense: bankExpense,
              balance: bankIncome - bankExpense
            }
          }
        };
        
        console.log('✅ Transformed Summary:', transformedResponse.summary);
        return transformedResponse;
      }
      
      return response.data;
      
    } catch (error) {
      console.error('❌ Error fetching today transactions:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch today\'s transactions');
    }
  }
);

// ✅ COMPLETE FIX: Fetch daily revenue stats for charts
// export const fetchDailyRevenueStats = createAsyncThunk(
//   'transaction/fetchDailyRevenueStats',
//   async (params = {}, { rejectWithValue }) => {
//     try {
//       console.log('📊 Fetching daily revenue stats with params:', params);
//       const response = await transactionApi.getDailyRevenueStats(params);
//       console.log('📊 Full API Response:', response);
      
//       // ✅ CORRECT PATH: API returns { success: true, data: { chartData, summary } }
//       // So response.data contains { chartData, summary }
//       const apiData = response?.data;
      
//       if (apiData && apiData.summary) {
//         console.log('✅ Found summary - Revenue:', apiData.summary.totalRevenue);
//         console.log('✅ Found summary - Expense:', apiData.summary.totalExpense);
        
//         return {
//           chartData: apiData.chartData || [],
//           summary: apiData.summary
//         };
//       }
      
//       console.warn('⚠️ No summary found in response');
//       return { 
//         chartData: [], 
//         summary: { 
//           totalRevenue: 0, 
//           totalExpense: 0, 
//           netProfit: 0, 
//           period: params.period || 'month', 
//           dateRange: {} 
//         } 
//       };
      
//     } catch (error) {
//       console.error('❌ Error fetching daily revenue:', error);
//       return rejectWithValue(error.response?.data?.message || 'Failed to fetch daily revenue stats');
//     }
//   }
// );

// features/transaction/transactionSlice.js

// ✅ FIXED: Fetch daily revenue stats for charts
// export const fetchDailyRevenueStats = createAsyncThunk(
//   'transaction/fetchDailyRevenueStats',
//   async (params = {}, { rejectWithValue }) => {
//     try {
//       console.log('📊 Fetching daily revenue stats with params:', params);
      
//       // If period is today, we can use the summary endpoint which is working
//       if (params.period === 'today') {
//         const response = await transactionApi.getTodayTransactions();
//         console.log('📊 Using summary endpoint for today:', response);
        
//         if (response?.data) {
//           const handCashIncome = response.data.handCash?.income || 0;
//           const bankIncome = response.data.bank?.income || 0;
//           const handCashExpense = response.data.handCash?.expense || 0;
//           const bankExpense = response.data.bank?.expense || 0;
          
//           const totalRevenue = handCashIncome + bankIncome;
//           const totalExpense = handCashExpense + bankExpense;
          
//           // For chart data, we still need to get from daily-stats
//           const chartResponse = await transactionApi.getDailyRevenueStats(params);
          
//           return {
//             chartData: chartResponse.data?.chartData || [],
//             summary: {
//               totalRevenue: totalRevenue,
//               totalExpense: totalExpense,
//               netProfit: totalRevenue - totalExpense,
//               period: 'today',
//               dateRange: { start: null, end: null }
//             }
//           };
//         }
//       }
      
//       // For other periods, use the daily-stats endpoint
//       const response = await transactionApi.getDailyRevenueStats(params);
//       return response.data;
      
//     } catch (error) {
//       console.error('❌ Error fetching daily revenue:', error);
//       return rejectWithValue(error.response?.data?.message || 'Failed to fetch daily revenue stats');
//     }
//   }
// );

// export const fetchDailyRevenueStats = createAsyncThunk(
//   'transaction/fetchDailyRevenueStats',
//   async (params = {}, { rejectWithValue }) => {
//     try {
//       console.log('📊 Fetching daily revenue stats with params:', params);
      
//       // If period is today, we can use the summary endpoint which is working
//       if (params.period === 'today') {
//         const response = await transactionApi.getTodayTransactions();
//         console.log('📊 Using summary endpoint for today:', response);
        
//         if (response?.data) {
//           const handCashIncome = response.data.handCash?.income || 0;
//           const bankIncome = response.data.bank?.income || 0;
//           const handCashExpense = response.data.handCash?.expense || 0;
//           const bankExpense = response.data.bank?.expense || 0;
          
//           const totalRevenue = handCashIncome + bankIncome;
//           const totalExpense = handCashExpense + bankExpense;
          
//           // ✅ CREATE CHART DATA FROM TRANSACTIONS INSTEAD OF CALLING BROKEN ENDPOINT
//           const transactions = response.data.recentTransactions || [];
          
//           // Create hourly buckets for 9 AM to 8 PM
//           const hourlyMap = {};
//           const hours = ['9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM', '7 PM', '8 PM'];
          
//           hours.forEach(hour => {
//             hourlyMap[hour] = { revenue: 0, expense: 0 };
//           });
          
//           // Group transactions by hour (IST)
//           transactions.forEach(t => {
//             const date = new Date(t.transactionDate);
//             const istHour = new Date(date.getTime() + (5.5 * 60 * 60 * 1000)).getHours();
            
//             let hourKey;
//             if (istHour === 9) hourKey = '9 AM';
//             else if (istHour === 10) hourKey = '10 AM';
//             else if (istHour === 11) hourKey = '11 AM';
//             else if (istHour === 12) hourKey = '12 PM';
//             else if (istHour === 13) hourKey = '1 PM';
//             else if (istHour === 14) hourKey = '2 PM';
//             else if (istHour === 15) hourKey = '3 PM';
//             else if (istHour === 16) hourKey = '4 PM';
//             else if (istHour === 17) hourKey = '5 PM';
//             else if (istHour === 18) hourKey = '6 PM';
//             else if (istHour === 19) hourKey = '7 PM';
//             else if (istHour === 20) hourKey = '8 PM';
//             else return; // Skip hours outside 9 AM - 8 PM
            
//             if (t.type === 'income') {
//               hourlyMap[hourKey].revenue += t.amount;
//             } else if (t.type === 'expense') {
//               hourlyMap[hourKey].expense += t.amount;
//             }
//           });
          
//           // Convert to array for chart
//           const chartData = hours.map(hour => ({
//             time: hour,
//             revenue: hourlyMap[hour].revenue,
//             expense: hourlyMap[hour].expense
//           }));
          
//           console.log('✅ Created chart data from transactions:', chartData);
          
//           return {
//             chartData: chartData,  // ✅ Use created chart data instead of broken endpoint
//             summary: {
//               totalRevenue: totalRevenue,
//               totalExpense: totalExpense,
//               netProfit: totalRevenue - totalExpense,
//               period: 'today',
//               dateRange: { start: null, end: null }
//             }
//           };
//         }
//       }
      
//       // For other periods, use the daily-stats endpoint
//       const response = await transactionApi.getDailyRevenueStats(params);
//       return response.data;
      
//     } catch (error) {
//       console.error('❌ Error fetching daily revenue:', error);
//       return rejectWithValue(error.response?.data?.message || 'Failed to fetch daily revenue stats');
//     }
//   }
// );

// features/transaction/transactionSlice.js

// features/transaction/transactionSlice.js

// export const fetchDailyRevenueStats = createAsyncThunk(
//   'transaction/fetchDailyRevenueStats',
//   async (params = {}, { rejectWithValue }) => {
//     try {
//       console.log('📊 Fetching daily revenue stats with params:', params);
      
//       // For today, use the working summary endpoint and create chart data from transactions
//       if (params.period === 'today') {
//         const response = await transactionApi.getTodayTransactions();
//         console.log('📊 Using summary endpoint for today:', response);
        
//         if (response?.data) {
//           const handCashIncome = response.data.handCash?.income || 0;
//           const bankIncome = response.data.bank?.income || 0;
//           const handCashExpense = response.data.handCash?.expense || 0;
//           const bankExpense = response.data.bank?.expense || 0;
          
//           const totalRevenue = handCashIncome + bankIncome;
//           const totalExpense = handCashExpense + bankExpense;
          
//           // ✅ CREATE CHART DATA FROM TRANSACTIONS
//           const transactions = response.data.recentTransactions || [];
          
//           // Create hourly buckets for 9 AM to 8 PM
//           const hourlyMap = {};
//           const hours = ['9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM', '7 PM', '8 PM'];
          
//           hours.forEach(hour => {
//             hourlyMap[hour] = { revenue: 0, expense: 0 };
//           });
          
//           // Group transactions by hour (IST)
//           transactions.forEach(t => {
//             const date = new Date(t.transactionDate);
//             // Convert UTC to IST by adding 5.5 hours
//             const istDate = new Date(date.getTime() + (5.5 * 60 * 60 * 1000));
//             const hour = istDate.getHours();
            
//             console.log(`📅 Transaction: ${t.type}, Amount: ₹${t.amount}, UTC: ${date.toISOString()}, IST Hour: ${hour}`);
            
//             let hourKey;
//             if (hour === 9) hourKey = '9 AM';
//             else if (hour === 10) hourKey = '10 AM';
//             else if (hour === 11) hourKey = '11 AM';
//             else if (hour === 12) hourKey = '12 PM';
//             else if (hour === 13) hourKey = '1 PM';
//             else if (hour === 14) hourKey = '2 PM';
//             else if (hour === 15) hourKey = '3 PM';
//             else if (hour === 16) hourKey = '4 PM';
//             else if (hour === 17) hourKey = '5 PM';
//             else if (hour === 18) hourKey = '6 PM';
//             else if (hour === 19) hourKey = '7 PM';
//             else if (hour === 20) hourKey = '8 PM';
//             else return; // Skip hours outside 9 AM - 8 PM
            
//             if (t.type === 'income') {
//               hourlyMap[hourKey].revenue += t.amount;
//               console.log(`  ✅ Added ₹${t.amount} to ${hourKey} (Income)`);
//             } else if (t.type === 'expense') {
//               hourlyMap[hourKey].expense += t.amount;
//               console.log(`  ✅ Added ₹${t.amount} to ${hourKey} (Expense)`);
//             }
//           });
          
//           // Convert to array for chart
//           const chartData = hours.map(hour => ({
//             time: hour,
//             revenue: hourlyMap[hour].revenue,
//             expense: hourlyMap[hour].expense
//           }));
          
//           console.log('\n📊 FINAL CHART DATA:');
//           chartData.forEach(item => {
//             if (item.revenue > 0 || item.expense > 0) {
//               console.log(`   ${item.time}: Revenue ₹${item.revenue}, Expense ₹${item.expense}`);
//             }
//           });
          
//           return {
//             chartData: chartData,
//             summary: {
//               totalRevenue: totalRevenue,
//               totalExpense: totalExpense,
//               netProfit: totalRevenue - totalExpense,
//               period: 'today',
//               dateRange: { start: null, end: null }
//             }
//           };
//         }
//       }
      
//       // For other periods (week, month), use the daily-stats endpoint
//       const response = await transactionApi.getDailyRevenueStats(params);
//       console.log('📊 Using daily-stats endpoint for period:', params.period);
      
//       return {
//         chartData: response?.data?.chartData || [],
//         summary: response?.data?.summary || {
//           totalRevenue: 0,
//           totalExpense: 0,
//           netProfit: 0,
//           period: params.period || 'month',
//           dateRange: {}
//         }
//       };
      
//     } catch (error) {
//       console.error('❌ Error fetching daily revenue:', error);
//       return rejectWithValue(error.response?.data?.message || 'Failed to fetch daily revenue stats');
//     }
//   }
// );

// features/transaction/transactionSlice.js

// ✅ FINAL WORKING VERSION - REPLACE ONLY THIS THUNK
// export const fetchDailyRevenueStats = createAsyncThunk(
//   'transaction/fetchDailyRevenueStats',
//   async (params = {}, { rejectWithValue }) => {
//     try {
//       console.log('📊 Fetching daily revenue stats with params:', params);
      
//       // For today - use summary endpoint which works
//       if (params.period === 'today') {
//         const response = await transactionApi.getTodayTransactions();
        
//         if (response?.data) {
//           // Get transactions to create chart data
//           const transactions = response.data.recentTransactions || [];
          
//           // Create hourly data (9 AM to 8 PM)
//           const hourlyData = {
//             '9 AM': 0, '10 AM': 0, '11 AM': 0, '12 PM': 0,
//             '1 PM': 0, '2 PM': 0, '3 PM': 0, '4 PM': 0,
//             '5 PM': 0, '6 PM': 0, '7 PM': 0, '8 PM': 0
//           };
          
//           const hourlyExpense = {
//             '9 AM': 0, '10 AM': 0, '11 AM': 0, '12 PM': 0,
//             '1 PM': 0, '2 PM': 0, '3 PM': 0, '4 PM': 0,
//             '5 PM': 0, '6 PM': 0, '7 PM': 0, '8 PM': 0
//           };
          
//           // Group transactions by hour
//           transactions.forEach(t => {
//             const utcDate = new Date(t.transactionDate);
//             const istHour = new Date(utcDate.getTime() + (5.5 * 60 * 60 * 1000)).getHours();
            
//             let hourKey;
//             if (istHour === 9) hourKey = '9 AM';
//             else if (istHour === 10) hourKey = '10 AM';
//             else if (istHour === 11) hourKey = '11 AM';
//             else if (istHour === 12) hourKey = '12 PM';
//             else if (istHour === 13) hourKey = '1 PM';
//             else if (istHour === 14) hourKey = '2 PM';
//             else if (istHour === 15) hourKey = '3 PM';
//             else if (istHour === 16) hourKey = '4 PM';
//             else if (istHour === 17) hourKey = '5 PM';
//             else if (istHour === 18) hourKey = '6 PM';
//             else if (istHour === 19) hourKey = '7 PM';
//             else if (istHour === 20) hourKey = '8 PM';
//             else return;
            
//             if (t.type === 'income') {
//               hourlyData[hourKey] += t.amount;
//             } else {
//               hourlyExpense[hourKey] += t.amount;
//             }
//           });
          
//           // Create chart data array
//           const chartData = Object.keys(hourlyData).map(time => ({
//             time: time,
//             revenue: hourlyData[time],
//             expense: hourlyExpense[time]
//           }));
          
//           // Calculate totals
//           const totalRevenue = Object.values(hourlyData).reduce((a, b) => a + b, 0);
//           const totalExpense = Object.values(hourlyExpense).reduce((a, b) => a + b, 0);
          
//           return {
//             chartData: chartData,
//             summary: {
//               totalRevenue: totalRevenue,
//               totalExpense: totalExpense,
//               netProfit: totalRevenue - totalExpense,
//               period: 'today',
//               dateRange: { start: null, end: null }
//             }
//           };
//         }
//       }
      
//       // For week/month - use daily-stats endpoint
//       const response = await transactionApi.getDailyRevenueStats(params);
//       return {
//         chartData: response?.data?.chartData || [],
//         summary: response?.data?.summary || {
//           totalRevenue: 0, totalExpense: 0, netProfit: 0, period: params.period
//         }
//       };
      
//     } catch (error) {
//       return rejectWithValue(error.message);
//     }
//   }
// );

// ✅ FINAL WORKING VERSION - REPLACE ONLY THIS THUNK
export const fetchDailyRevenueStats = createAsyncThunk(
  'transaction/fetchDailyRevenueStats',
  async (params = {}, { rejectWithValue }) => {
    try {
      console.log('📊 Fetching daily revenue stats with params:', params);
      
      // For today - use summary endpoint which works
      if (params.period === 'today') {
        const response = await transactionApi.getTodayTransactions();
        
        if (response?.data) {
          // Get transactions to create chart data
          const transactions = response.data.recentTransactions || [];
          
          // Create hourly data (9 AM to 8 PM)
          const hourlyData = {
            '9 AM': 0, '10 AM': 0, '11 AM': 0, '12 PM': 0,
            '1 PM': 0, '2 PM': 0, '3 PM': 0, '4 PM': 0,
            '5 PM': 0, '6 PM': 0, '7 PM': 0, '8 PM': 0
          };
          
          const hourlyExpense = {
            '9 AM': 0, '10 AM': 0, '11 AM': 0, '12 PM': 0,
            '1 PM': 0, '2 PM': 0, '3 PM': 0, '4 PM': 0,
            '5 PM': 0, '6 PM': 0, '7 PM': 0, '8 PM': 0
          };
          
          // Group transactions by hour
          transactions.forEach(t => {
            const utcDate = new Date(t.transactionDate);
            const istHour = new Date(utcDate.getTime() + (5.5 * 60 * 60 * 1000)).getHours();
            
            let hourKey;
            if (istHour === 9) hourKey = '9 AM';
            else if (istHour === 10) hourKey = '10 AM';
            else if (istHour === 11) hourKey = '11 AM';
            else if (istHour === 12) hourKey = '12 PM';
            else if (istHour === 13) hourKey = '1 PM';
            else if (istHour === 14) hourKey = '2 PM';
            else if (istHour === 15) hourKey = '3 PM';
            else if (istHour === 16) hourKey = '4 PM';
            else if (istHour === 17) hourKey = '5 PM';
            else if (istHour === 18) hourKey = '6 PM';
            else if (istHour === 19) hourKey = '7 PM';
            else if (istHour === 20) hourKey = '8 PM';
            else return;
            
            if (t.type === 'income') {
              hourlyData[hourKey] += t.amount;
            } else {
              hourlyExpense[hourKey] += t.amount;
            }
          });
          
          // Create chart data array
          const chartData = Object.keys(hourlyData).map(time => ({
            time: time,
            revenue: hourlyData[time],
            expense: hourlyExpense[time]
          }));
          
          // Calculate totals
          const totalRevenue = Object.values(hourlyData).reduce((a, b) => a + b, 0);
          const totalExpense = Object.values(hourlyExpense).reduce((a, b) => a + b, 0);
          
          return {
            chartData: chartData,
            summary: {
              totalRevenue: totalRevenue,
              totalExpense: totalExpense,
              netProfit: totalRevenue - totalExpense,
              period: 'today',
              dateRange: { start: null, end: null }
            }
          };
        }
      }
      
      // For week/month - use daily-stats endpoint
      const response = await transactionApi.getDailyRevenueStats(params);
      return {
        chartData: response?.data?.chartData || [],
        summary: response?.data?.summary || {
          totalRevenue: 0, totalExpense: 0, netProfit: 0, period: params.period
        }
      };
      
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Create new transaction
export const createNewTransaction = createAsyncThunk(
  'transaction/createNewTransaction',
  async (transactionData, { rejectWithValue, dispatch }) => {
    try {
      const response = await transactionApi.createTransaction(transactionData);
      showToast.success(response.message);
      
      dispatch(fetchAllTransactions({ limit: 20 }));
      dispatch(fetchTransactionSummary());
      dispatch(fetchTodayTransactions());
      dispatch(fetchDailyRevenueStats({ period: 'today' }));
      
      if (transactionData.type === 'income') {
        dispatch(fetchIncomeTransactions());
      } else if (transactionData.type === 'expense') {
        dispatch(fetchExpenseTransactions());
      }
      
      return response.data;
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Failed to create transaction');
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Delete transaction
export const deleteExistingTransaction = createAsyncThunk(
  'transaction/deleteExistingTransaction',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const response = await transactionApi.deleteTransaction(id);
      showToast.success(response.message);
      
      dispatch(fetchAllTransactions({ limit: 20 }));
      dispatch(fetchTransactionSummary());
      dispatch(fetchTodayTransactions());
      dispatch(fetchDailyRevenueStats({ period: 'today' }));
      dispatch(fetchIncomeTransactions());
      dispatch(fetchExpenseTransactions());
      
      return id;
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Failed to delete transaction');
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// ============================================
// AUTO-INCOME ACTIONS (Keeping existing)
// ============================================

export const fetchAutoIncomes = createAsyncThunk(
  'transaction/fetchAutoIncomes',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await transactionApi.getAutoIncomes(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch auto incomes');
    }
  }
);

export const setupNewAutoIncome = createAsyncThunk(
  'transaction/setupNewAutoIncome',
  async (autoIncomeData, { rejectWithValue, dispatch }) => {
    try {
      const response = await transactionApi.setupAutoIncome(autoIncomeData);
      showToast.success('Auto income setup successfully');
      dispatch(fetchAutoIncomes());
      return response.data;
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Failed to setup auto income');
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const updateAutoIncome = createAsyncThunk(
  'transaction/updateAutoIncome',
  async ({ id, data }, { rejectWithValue, dispatch }) => {
    try {
      const response = await transactionApi.updateAutoIncome(id, data);
      showToast.success('Auto income updated successfully');
      dispatch(fetchAutoIncomes());
      return response.data;
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Failed to update auto income');
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const deleteAutoIncome = createAsyncThunk(
  'transaction/deleteAutoIncome',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const response = await transactionApi.deleteAutoIncome(id);
      showToast.success('Auto income deleted successfully');
      dispatch(fetchAutoIncomes());
      return id;
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Failed to delete auto income');
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const pauseAutoIncome = createAsyncThunk(
  'transaction/pauseAutoIncome',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const response = await transactionApi.pauseAutoIncome(id);
      showToast.success('Auto income paused successfully');
      dispatch(fetchAutoIncomes());
      return response.data;
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Failed to pause auto income');
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const resumeAutoIncome = createAsyncThunk(
  'transaction/resumeAutoIncome',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const response = await transactionApi.resumeAutoIncome(id);
      showToast.success('Auto income resumed successfully');
      dispatch(fetchAutoIncomes());
      return response.data;
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Failed to resume auto income');
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const fetchUpcomingAutoIncomes = createAsyncThunk(
  'transaction/fetchUpcomingAutoIncomes',
  async (days = 30, { rejectWithValue }) => {
    try {
      const response = await transactionApi.getUpcomingAutoIncomes(days);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch upcoming incomes');
    }
  }
);

export const fetchAutoIncomeStats = createAsyncThunk(
  'transaction/fetchAutoIncomeStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await transactionApi.getAutoIncomeStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch auto income stats');
    }
  }
);

// ============================================
// TRANSACTION DETAIL ACTIONS
// ============================================

export const fetchTransactionById = createAsyncThunk(
  'transaction/fetchTransactionById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await transactionApi.getTransactionById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch transaction');
    }
  }
);

export const fetchTransactionsByOrder = createAsyncThunk(
  'transaction/fetchTransactionsByOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await transactionApi.getTransactionsByOrder(orderId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch order transactions');
    }
  }
);

export const fetchTransactionsByCustomer = createAsyncThunk(
  'transaction/fetchTransactionsByCustomer',
  async ({ customerId, params }, { rejectWithValue }) => {
    try {
      const response = await transactionApi.getTransactionsByCustomer(customerId, params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch customer transactions');
    }
  }
);

export const exportTransactions = createAsyncThunk(
  'transaction/exportTransactions',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await transactionApi.exportTransactions(filters);
      showToast.success('Transactions exported successfully');
      return response.data;
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Failed to export transactions');
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const transactionSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearTransactions: (state) => {
      state.allTransactions = [];
      state.incomeTransactions = [];
      state.expenseTransactions = [];
    },
    clearAutoIncomes: (state) => {
      state.autoIncomes = [];
      state.upcomingAutoIncomes = [];
    },
    setCurrentAutoIncome: (state, action) => {
      state.currentAutoIncome = action.payload;
    },
    clearTodayTransactions: (state) => {
      state.todayTransactions = {
        transactions: [],
        summary: {
          totalIncome: 0,
          totalExpense: 0,
          netAmount: 0,
          count: 0,
          handCash: { income: 0, expense: 0, balance: 0 },
          bank: { income: 0, expense: 0, balance: 0 }
        },
        loading: false
      };
    },
    clearDailyRevenue: (state) => {
      state.dailyRevenue = {
        chartData: [],
        summary: {
          totalRevenue: 0,
          totalExpense: 0,
          netProfit: 0,
          period: 'month',
          dateRange: { start: null, end: null }
        },
        loading: false
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // FETCH ALL TRANSACTIONS
      .addCase(fetchAllTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.allTransactions = processTransactions(action.payload.transactions || []);
        state.pagination = action.payload.pagination || initialState.pagination;
      })
      .addCase(fetchAllTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // FETCH INCOME TRANSACTIONS
      .addCase(fetchIncomeTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchIncomeTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.incomeTransactions = processTransactions(action.payload.transactions || []);
        state.pagination = action.payload.pagination || initialState.pagination;
      })
      .addCase(fetchIncomeTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // FETCH EXPENSE TRANSACTIONS
      .addCase(fetchExpenseTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExpenseTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.expenseTransactions = processTransactions(action.payload.transactions || []);
        state.pagination = action.payload.pagination || initialState.pagination;
        // ✅ FIX: the backend already computes totals across ALL matching
        // records via an aggregate query (not just this page) — store it
        // instead of leaving summary cards to be reduced from the current
        // page only.
        state.summary = action.payload.summary || initialState.summary;
      })
      .addCase(fetchExpenseTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // FETCH AVAILABLE TRANSACTION MONTHS (dynamic month filter)
      .addCase(fetchTransactionMonths.fulfilled, (state, action) => {
        state.availableMonths = action.payload || [];
      })
      .addCase(fetchTransactionMonths.rejected, (state, action) => {
        console.error('Failed to fetch available months:', action.payload);
      })

      // FETCH TODAY'S TRANSACTIONS
      .addCase(fetchTodayTransactions.pending, (state) => {
        state.todayTransactions.loading = true;
        state.error = null;
      })
      .addCase(fetchTodayTransactions.fulfilled, (state, action) => {
        state.todayTransactions.loading = false;
        state.todayTransactions.transactions = processTransactions(action.payload.transactions || []);
        state.todayTransactions.summary = action.payload.summary || {
          totalIncome: 0,
          totalExpense: 0,
          netAmount: 0,
          count: 0,
          handCash: { income: 0, expense: 0, balance: 0 },
          bank: { income: 0, expense: 0, balance: 0 }
        };
      })
      .addCase(fetchTodayTransactions.rejected, (state, action) => {
        state.todayTransactions.loading = false;
        state.error = action.payload;
      })
      
      // ✅ FETCH DAILY REVENUE STATS - CORRECTED PATH
      .addCase(fetchDailyRevenueStats.pending, (state) => {
        state.dailyRevenue.loading = true;
        state.error = null;
      })
      .addCase(fetchDailyRevenueStats.fulfilled, (state, action) => {
        state.dailyRevenue.loading = false;
        
        // ✅ action.payload already contains { chartData, summary }
        const summaryData = action.payload?.summary || {};
        
        state.dailyRevenue.summary = {
          totalRevenue: summaryData.totalRevenue || 0,
          totalExpense: summaryData.totalExpense || 0,
          netProfit: summaryData.netProfit || 0,
          period: summaryData.period || 'today',
          dateRange: summaryData.dateRange || { start: null, end: null }
        };
        
        state.dailyRevenue.chartData = action.payload?.chartData || [];
        
        console.log('✅✅✅ REDUX UPDATED - Revenue:', state.dailyRevenue.summary.totalRevenue);
        console.log('✅✅✅ REDUX UPDATED - Expense:', state.dailyRevenue.summary.totalExpense);
        console.log('✅✅✅ REDUX UPDATED - Net Profit:', state.dailyRevenue.summary.netProfit);
      })
      .addCase(fetchDailyRevenueStats.rejected, (state, action) => {
        state.dailyRevenue.loading = false;
        state.error = action.payload;
        console.error('❌ Daily revenue stats rejected:', action.payload);
      })
      
      // CREATE TRANSACTION
      .addCase(createNewTransaction.pending, (state) => {
        state.loading = true;
      })
      .addCase(createNewTransaction.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createNewTransaction.rejected, (state) => {
        state.loading = false;
      })
      
      // DELETE TRANSACTION
      .addCase(deleteExistingTransaction.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteExistingTransaction.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deleteExistingTransaction.rejected, (state) => {
        state.loading = false;
      })
      
      // FETCH SUMMARY
      .addCase(fetchTransactionSummary.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTransactionSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = { ...state.summary, ...action.payload };
      })
      .addCase(fetchTransactionSummary.rejected, (state) => {
        state.loading = false;
      })
      
      // FETCH TRANSACTION BY ID
      .addCase(fetchTransactionById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTransactionById.fulfilled, (state, action) => {
        state.loading = false;
        const transaction = action.payload;
        const date = new Date(transaction.transactionDate);
        state.currentTransaction = {
          ...transaction,
          transactionDateIST: date.toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          })
        };
      })
      .addCase(fetchTransactionById.rejected, (state) => {
        state.loading = false;
      })
      
      // FETCH TRANSACTIONS BY ORDER
      .addCase(fetchTransactionsByOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTransactionsByOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.allTransactions = processTransactions(action.payload.transactions || []);
      })
      .addCase(fetchTransactionsByOrder.rejected, (state) => {
        state.loading = false;
      })
      
      // AUTO-INCOME REDUCERS
      .addCase(fetchAutoIncomes.pending, (state) => {
        state.autoIncomeLoading = true;
        state.error = null;
      })
      .addCase(fetchAutoIncomes.fulfilled, (state, action) => {
        state.autoIncomeLoading = false;
        state.autoIncomes = action.payload.autoIncomes || [];
      })
      .addCase(fetchAutoIncomes.rejected, (state, action) => {
        state.autoIncomeLoading = false;
        state.error = action.payload;
      })
      
      .addCase(setupNewAutoIncome.pending, (state) => {
        state.autoIncomeLoading = true;
      })
      .addCase(setupNewAutoIncome.fulfilled, (state) => {
        state.autoIncomeLoading = false;
      })
      .addCase(setupNewAutoIncome.rejected, (state) => {
        state.autoIncomeLoading = false;
      })
      
      .addCase(updateAutoIncome.pending, (state) => {
        state.autoIncomeLoading = true;
      })
      .addCase(updateAutoIncome.fulfilled, (state) => {
        state.autoIncomeLoading = false;
      })
      .addCase(updateAutoIncome.rejected, (state) => {
        state.autoIncomeLoading = false;
      })
      
      .addCase(deleteAutoIncome.pending, (state) => {
        state.autoIncomeLoading = true;
      })
      .addCase(deleteAutoIncome.fulfilled, (state) => {
        state.autoIncomeLoading = false;
      })
      .addCase(deleteAutoIncome.rejected, (state) => {
        state.autoIncomeLoading = false;
      })
      
      .addCase(pauseAutoIncome.pending, (state) => {
        state.autoIncomeLoading = true;
      })
      .addCase(pauseAutoIncome.fulfilled, (state) => {
        state.autoIncomeLoading = false;
      })
      .addCase(pauseAutoIncome.rejected, (state) => {
        state.autoIncomeLoading = false;
      })
      
      .addCase(resumeAutoIncome.pending, (state) => {
        state.autoIncomeLoading = true;
      })
      .addCase(resumeAutoIncome.fulfilled, (state) => {
        state.autoIncomeLoading = false;
      })
      .addCase(resumeAutoIncome.rejected, (state) => {
        state.autoIncomeLoading = false;
      })
      
      .addCase(fetchUpcomingAutoIncomes.pending, (state) => {
        state.autoIncomeLoading = true;
      })
      .addCase(fetchUpcomingAutoIncomes.fulfilled, (state, action) => {
        state.autoIncomeLoading = false;
        state.upcomingAutoIncomes = action.payload.upcoming || [];
      })
      .addCase(fetchUpcomingAutoIncomes.rejected, (state) => {
        state.autoIncomeLoading = false;
      })
      
      .addCase(fetchAutoIncomeStats.pending, (state) => {
        state.autoIncomeLoading = true;
      })
      .addCase(fetchAutoIncomeStats.fulfilled, (state, action) => {
        state.autoIncomeLoading = false;
        state.autoIncomeStats = action.payload;
      })
      .addCase(fetchAutoIncomeStats.rejected, (state) => {
        state.autoIncomeLoading = false;
      });
  }
});

export const { 
  setFilters, 
  resetFilters, 
  clearTransactions,
  clearAutoIncomes,
  setCurrentAutoIncome,
  clearTodayTransactions,
  clearDailyRevenue
} = transactionSlice.actions;

// ============================================
// SELECTORS
// ============================================

export const selectAllTransactions = (state) => state.transaction.allTransactions;
export const selectIncomeTransactions = (state) => state.transaction.incomeTransactions;
export const selectExpenseTransactions = (state) => state.transaction.expenseTransactions;
export const selectTransactionSummary = (state) => state.transaction.summary;
export const selectTransactionFilters = (state) => state.transaction.filters;
export const selectTransactionPagination = (state) => state.transaction.pagination;
export const selectAvailableMonths = (state) => state.transaction.availableMonths;
export const selectTransactionLoading = (state) => state.transaction.loading;
export const selectCurrentTransaction = (state) => state.transaction.currentTransaction;

export const selectTodayTransactions = (state) => state.transaction.todayTransactions.transactions;
export const selectTodaySummary = (state) => state.transaction.todayTransactions.summary;
export const selectTodayLoading = (state) => state.transaction.todayTransactions.loading;

export const selectDailyRevenueData = (state) => state.transaction.dailyRevenue.chartData;
export const selectDailyRevenueSummary = (state) => state.transaction.dailyRevenue.summary;
export const selectDailyRevenueLoading = (state) => state.transaction.dailyRevenue.loading;

export const selectAutoIncomes = (state) => state.transaction.autoIncomes;
export const selectCurrentAutoIncome = (state) => state.transaction.currentAutoIncome;
export const selectUpcomingAutoIncomes = (state) => state.transaction.upcomingAutoIncomes;
export const selectAutoIncomeStats = (state) => state.transaction.autoIncomeStats;
export const selectAutoIncomeLoading = (state) => state.transaction.autoIncomeLoading;

export default transactionSlice.reducer;