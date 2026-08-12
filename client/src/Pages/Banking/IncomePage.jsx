// Pages/banking/IncomePage.jsx - FULLY RESPONSIVE with Role-Based Navigation
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Wallet,
  Landmark,
  Search,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  Download,
  RefreshCw,
  Filter,
  X,
  ShoppingBag,
  Clock,
  User,
  Menu
} from 'lucide-react';
import { 
  fetchIncomeTransactions,
  setFilters,
  resetFilters,
  selectIncomeTransactions,
  selectTransactionPagination,
  selectTransactionLoading,
  selectTransactionFilters
} from '../../features/transaction/transactionSlice';
import TransactionDetailsModal from '../../components/Banking/TransactionDetailsModal';
import showToast from '../../utils/toast';
import { exportToExcel } from '../../utils/exportToExcel';

export default function IncomePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const accountFilter = searchParams.get('account');
  
  const transactions = useSelector(selectIncomeTransactions);
  const pagination = useSelector(selectTransactionPagination);
  const filters = useSelector(selectTransactionFilters);
  const loading = useSelector(selectTransactionLoading);
  const { user } = useSelector((state) => state.auth);

  // ✅ Get base path based on user role
  const basePath = user?.role === "ADMIN" ? "/admin" : 
                   user?.role === "STORE_KEEPER" ? "/storekeeper" : 
                   "/cuttingmaster";

  // Mobile state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [dateRange, setDateRange] = useState('month');
  const [customDates, setCustomDates] = useState({ start: '', end: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(accountFilter || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeView, setActiveView] = useState('all');
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false); // New state for custom date picker

  // 🔍 DEBUG: Log all transactions to see categories
  useEffect(() => {
    if (transactions.length > 0) {
      console.log("💰 ALL TRANSACTIONS RECEIVED:", transactions);
      console.log("📊 UNIQUE CATEGORIES:", [...new Set(transactions.map(t => t.category))]);
      console.log("📊 UNIQUE TYPES:", [...new Set(transactions.map(t => t.type))]);
      
      // Count by category
      const categoryCount = transactions.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + 1;
        return acc;
      }, {});
      console.log("📊 TRANSACTIONS BY CATEGORY:", categoryCount);
    }
  }, [transactions]);

  // Calculate totals based on ALL income transactions
  const totalIncome = transactions.reduce((sum, t) => sum + t.amount, 0);
  
  const handCashTotal = transactions
    .filter(t => t.accountType === 'hand-cash')
    .reduce((sum, t) => sum + t.amount, 0);

  const bankTotal = transactions
    .filter(t => t.accountType === 'bank')
    .reduce((sum, t) => sum + t.amount, 0);

  // Auto income count (transactions with order reference)
  const autoIncomeCount = transactions.filter(t => t.order).length;

  // 🔥 FIXED: Get filtered transactions based on active view - SHOW ALL
  const getFilteredTransactions = () => {
    let filtered = transactions;
    
    // Filter by account type if view is specific
    if (activeView === 'hand-cash') {
      filtered = filtered.filter(t => t.accountType === 'hand-cash');
    } else if (activeView === 'bank') {
      filtered = filtered.filter(t => t.accountType === 'bank');
    }
    
    // 🔥 NO CATEGORY FILTERING - Show ALL income types
    // This includes: customer-advance, full-payment, part-payment, fabric-sale, etc.
    
    return filtered;
  };

  const displayedTransactions = getFilteredTransactions();

  useEffect(() => {
    if (accountFilter && accountFilter !== 'all') {
      dispatch(setFilters({ 
        type: 'income',
        accountType: accountFilter === 'hand-cash' ? 'hand-cash' : 'bank',
        page: 1
      }));
      setSelectedAccount(accountFilter);
      setActiveView(accountFilter);
    } else {
      dispatch(setFilters({ 
        type: 'income',
        page: 1 
      }));
    }
  }, [accountFilter, dispatch]);

  useEffect(() => {
    loadTransactions();
  }, [filters, dispatch]);

  const loadTransactions = async (showToastMessage = false) => {
    try {
      await dispatch(fetchIncomeTransactions(filters)).unwrap();
      if (!isInitialLoad && showToastMessage) {
        showToast.success('Data refreshed successfully');
      }
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
    } catch (error) {
      console.error('Failed to load transactions:', error);
      if (!isInitialLoad && showToastMessage) {
        showToast.error('Failed to load transactions');
      }
    }
  };

  const handleDateRangeChange = (range) => {
    setDateRange(range);
    let startDate = '';
    let endDate = '';

    const today = new Date();
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);
    
    if (range === 'today') {
      startDate = today.toISOString().split('T')[0];
      endDate = endOfDay.toISOString().split('T')[0];
      setShowCustomDatePicker(false);
    } else if (range === 'week') {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      weekStart.setHours(0, 0, 0, 0);
      startDate = weekStart.toISOString().split('T')[0];
      endDate = endOfDay.toISOString().split('T')[0];
      setShowCustomDatePicker(false);
    } else if (range === 'month') {
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      monthStart.setHours(0, 0, 0, 0);
      startDate = monthStart.toISOString().split('T')[0];
      endDate = endOfDay.toISOString().split('T')[0];
      setShowCustomDatePicker(false);
    } else if (range === 'year') {
      const yearStart = new Date(today.getFullYear(), 0, 1);
      yearStart.setHours(0, 0, 0, 0);
      startDate = yearStart.toISOString().split('T')[0];
      endDate = endOfDay.toISOString().split('T')[0];
      setShowCustomDatePicker(false);
    } else if (range === 'custom') {
      setShowCustomDatePicker(true);
      // Only apply custom dates if both are selected
      if (customDates.start && customDates.end) {
        startDate = customDates.start;
        endDate = customDates.end;
      } else {
        // Don't apply filter if custom dates are not selected
        return;
      }
    }

    if (startDate && endDate) {
      dispatch(setFilters({ startDate, endDate, page: 1 }));
    }
  };

  const handleCustomDateApply = () => {
    if (customDates.start && customDates.end) {
      handleDateRangeChange('custom');
    } else {
      showToast.error('Please select both start and end dates');
    }
  };

  const handleCustomDateClear = () => {
    setCustomDates({ start: '', end: '' });
    setShowCustomDatePicker(false);
    setDateRange('month');
    handleDateRangeChange('month');
  };

  const handleAccountFilter = (account) => {
    setSelectedAccount(account);
    setActiveView(account);
    
    if (account === 'all') {
      dispatch(setFilters({ accountType: '', page: 1 }));
    } else {
      dispatch(setFilters({ 
        accountType: account === 'hand-cash' ? 'hand-cash' : 'bank',
        page: 1 
      }));
    }
  };

  const handleCardClick = (accountType) => {
    setActiveView(accountType);
    setSelectedAccount(accountType);
    dispatch(setFilters({ 
      accountType: accountType === 'hand-cash' ? 'hand-cash' : accountType === 'bank' ? 'bank' : '',
      page: 1 
    }));
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Debounce the customer search so it updates as the user types without
  // firing a request on every keystroke.
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      dispatch(setFilters({ search: searchQuery.trim(), page: 1 }));
    }, 400);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, dispatch]);

  const handlePageChange = (newPage) => {
    dispatch(setFilters({ page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRefresh = () => {
    loadTransactions(true);
  };

  const handleExport = () => {
    exportToExcel(displayedTransactions, 'all_income_transactions', 'income');
  };

  const handleViewDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailsModal(true);
  };

  // const formatDate = (dateString) => {
  //   return new Date(dateString).toLocaleDateString('en-IN', {
  //     day: '2-digit',
  //     month: 'short',
  //     year: 'numeric'
  //   });
  // };

  // ✅ FIXED: Proper IST date formatting
const formatDate = (dateString) => {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    
    return date.toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch (error) {
    return '-';
  }
};
  // const formatTime = (dateString) => {
  //   return new Date(dateString).toLocaleTimeString('en-IN', {
  //     hour: '2-digit',
  //     minute: '2-digit',
  //     hour12: true
  //   });
  // };

  // 🔥 FIXED: Get category label for ALL payment types
  // ✅ FIXED: Proper IST time formatting
const formatTime = (dateString) => {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    
    return date.toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    return '-';
  }
};
  const getCategoryLabel = (category, customCategory) => {
    const categories = {
      // Payment-related categories
      'customer-advance': 'Advance Payment',
      'full-payment': 'Full Payment',
      'part-payment': 'Partial Payment',
      'fabric-sale': 'Fabric Sale (Extra)',
      
      // Other categories
      'project-payment': 'Project Payment',
      'other-income': customCategory || 'Other Income'
    };
    
    // Log for debugging
    if (category && !categories[category] && !category.includes('other')) {
      console.log("⚠️ Unknown category:", category);
    }
    
    return categories[category] || category || 'Income';
  };

  const getPaymentMethodLabel = (method) => {
    const methods = {
      'cash': 'Cash',
      'upi': 'UPI',
      'bank-transfer': 'Bank Transfer',
      'card': 'Card',
      'cheque': 'Cheque'
    };
    return methods[method] || method;
  };

  // Calculate pagination display values
  const startEntry = pagination.total > 0 ? ((pagination.page - 1) * pagination.limit) + 1 : 0;
  const endEntry = Math.min(pagination.page * pagination.limit, pagination.total);

  // Safe formatting function
  const safeToLocale = (value) => {
    return (value || 0).toLocaleString('en-IN');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <TrendingUp size={20} className="text-purple-600" />
            <span>Income</span>
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-all flex items-center justify-center"
              style={{ minWidth: '36px', minHeight: '36px' }}
              title="Refresh"
              disabled={loading}
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-all flex items-center justify-center"
              style={{ minWidth: '36px', minHeight: '36px' }}
            >
              <Filter size={18} />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-all flex items-center justify-center"
              style={{ minWidth: '36px', minHeight: '36px' }}
            >
              <Menu size={18} />
            </button>
          </div>
        </div>

        {/* Mobile Filters Dropdown */}
        {mobileFiltersOpen && (
          <div className="absolute top-full left-4 right-4 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 p-4 z-40 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800">Filters</h3>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-lg flex items-center justify-center"
                style={{ minWidth: '28px', minHeight: '28px' }}
              >
                <X size={18} className="text-slate-500" />
              </button>
            </div>
            
            {/* Account Type Filter */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-500 mb-2">Account Type</label>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    handleAccountFilter('all');
                    setMobileFiltersOpen(false);
                  }}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium ${
                    selectedAccount === 'all' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => {
                    handleAccountFilter('hand-cash');
                    setMobileFiltersOpen(false);
                  }}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1 ${
                    selectedAccount === 'hand-cash' 
                      ? 'bg-orange-600 text-white' 
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Wallet size={12} /> Cash
                </button>
                <button
                  onClick={() => {
                    handleAccountFilter('bank');
                    setMobileFiltersOpen(false);
                  }}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1 ${
                    selectedAccount === 'bank' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Landmark size={12} /> Bank
                </button>
              </div>
            </div>

            {/* Date Range */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-500 mb-2">Date Range</label>
              <select
                value={dateRange}
                onChange={(e) => {
                  handleDateRangeChange(e.target.value);
                  setMobileFiltersOpen(false);
                }}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            {/* Custom Date Picker for Mobile */}
            {dateRange === 'custom' && (
              <div className="mb-4 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={customDates.start}
                    onChange={(e) => setCustomDates({ ...customDates, start: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">End Date</label>
                  <input
                    type="date"
                    value={customDates.end}
                    onChange={(e) => setCustomDates({ ...customDates, end: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      handleCustomDateApply();
                      setMobileFiltersOpen(false);
                    }}
                    className="flex-1 px-3 py-2 bg-purple-600 text-white rounded-lg text-xs font-medium hover:bg-purple-700"
                  >
                    Apply
                  </button>
                  <button
                    onClick={() => {
                      handleCustomDateClear();
                      setMobileFiltersOpen(false);
                    }}
                    className="flex-1 px-3 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-200"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}

            {/* Clear Filters */}
            <button
              onClick={() => {
                dispatch(resetFilters());
                setSelectedAccount('all');
                setActiveView('all');
                setDateRange('month');
                setSearchQuery('');
                setCustomDates({ start: '', end: '' });
                setShowCustomDatePicker(false);
                setMobileFiltersOpen(false);
              }}
              className="w-full px-3 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-200 transition-all"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* ✅ FIXED: Mobile Menu with Role-Based Navigation */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-lg p-4 z-40 animate-in slide-in-from-top-2 duration-200">
            <div className="space-y-2">
              <button
                onClick={() => {
                  navigate(`${basePath}/banking/overview`);
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 hover:bg-slate-100 rounded-xl font-medium"
              >
                Banking Overview
              </button>
              <button
                onClick={() => {
                  navigate(`${basePath}/banking/income`);
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 bg-purple-50 text-purple-600 rounded-xl font-medium"
              >
                Income
              </button>
              <button
                onClick={() => {
                  navigate(`${basePath}/banking/expense`);
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 hover:bg-slate-100 rounded-xl font-medium"
              >
                Expense
              </button>
              <button
                onClick={() => {
                  navigate(`${basePath}/orders`);
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 hover:bg-slate-100 rounded-xl font-medium"
              >
                Orders
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* ✅ FIXED: Desktop Header with Role-Based Links */}
        <div className="hidden lg:block mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-slate-800 mb-2">Income Tracker</h1>
              <p className="text-slate-600">All income from orders including advance, full, partial, and extra payments</p>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <Clock size={12} />
                Last updated: {new Date().toLocaleTimeString()} • {transactions.length} total transactions
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                to={`${basePath}/orders`}
                className="px-4 py-2 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-all flex items-center gap-2"
              >
                <ShoppingBag size={18} />
                View Orders
              </Link>
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2"
              >
                <Download size={18} />
                Export
              </button>
              <button
                onClick={handleRefresh}
                className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all"
                title="Refresh"
                disabled={loading}
              >
                <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Header Info */}
        <div className="lg:hidden mb-4">
          <h1 className="text-xl font-black text-slate-800 mb-1">Income Tracker</h1>
          <p className="text-xs text-slate-500">All income from orders</p>
          <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
            <Clock size={10} />
            {new Date().toLocaleTimeString()} • {transactions.length} transactions
          </p>
        </div>

        {/* ✅ FIXED: Info Banner with Role-Based Link */}
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-purple-50 border border-purple-200 rounded-lg sm:rounded-xl">
          <p className="text-xs sm:text-sm text-purple-700 flex items-center gap-2">
            <ShoppingBag size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="flex-1">
              Income includes: Advance, Full, Partial, and Extra payments.
            </span>
            <Link to={`${basePath}/orders/new`} className="font-medium underline whitespace-nowrap text-[10px] sm:text-xs">
              New Order →
            </Link>
          </p>
        </div>

        {/* Summary Cards - Fully Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          {/* Total Income Card */}
          <div 
            onClick={() => handleCardClick('all')}
            className={`bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm border-l-4 border-purple-500 cursor-pointer transform transition-all hover:scale-105 hover:shadow-md ${
              activeView === 'all' ? 'ring-2 ring-purple-500 ring-offset-2' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs text-slate-500">Total Income</p>
                <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-black text-purple-600 break-words">
                  ₹{safeToLocale(totalIncome)}
                </p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-purple-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 ml-2">
                <TrendingUp size={14} className="text-purple-600 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-[8px] sm:text-xs text-slate-400">From orders: {autoIncomeCount} payments</p>
              <span className="text-[8px] sm:text-xs font-medium text-purple-600">
                {activeView === 'all' ? 'Viewing' : 'View'}
              </span>
            </div>
          </div>

          {/* Hand Cash Income Card */}
          <div 
            onClick={() => handleCardClick('hand-cash')}
            className={`bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm border-l-4 border-orange-500 cursor-pointer transform transition-all hover:scale-105 hover:shadow-md ${
              activeView === 'hand-cash' ? 'ring-2 ring-orange-500 ring-offset-2' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs text-slate-500">Hand Cash Income</p>
                <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-black text-orange-600 break-words">
                  ₹{safeToLocale(handCashTotal)}
                </p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-orange-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 ml-2">
                <Wallet size={14} className="text-orange-600 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-[8px] sm:text-xs text-slate-400">
                {transactions.filter(t => t.accountType === 'hand-cash').length} transactions
              </p>
              <span className="text-[8px] sm:text-xs font-medium text-orange-600">
                {activeView === 'hand-cash' ? 'Viewing' : 'View'}
              </span>
            </div>
          </div>

          {/* Bank Income Card */}
          <div 
            onClick={() => handleCardClick('bank')}
            className={`bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm border-l-4 border-blue-500 cursor-pointer transform transition-all hover:scale-105 hover:shadow-md ${
              activeView === 'bank' ? 'ring-2 ring-blue-500 ring-offset-2' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs text-slate-500">Bank Income</p>
                <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-black text-blue-600 break-words">
                  ₹{safeToLocale(bankTotal)}
                </p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 ml-2">
                <Landmark size={14} className="text-blue-600 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-[8px] sm:text-xs text-slate-400">
                {transactions.filter(t => t.accountType === 'bank').length} transactions
              </p>
              <span className="text-[8px] sm:text-xs font-medium text-blue-600">
                {activeView === 'bank' ? 'Viewing' : 'View'}
              </span>
            </div>
          </div>
        </div>

        {/* Active View Indicator - Mobile/Desktop */}
        <div className="mb-4 flex items-center gap-2">
          <span className="text-xs sm:text-sm font-medium text-slate-600">Showing:</span>
          <span className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium ${
            activeView === 'all' ? 'bg-purple-100 text-purple-700' :
            activeView === 'hand-cash' ? 'bg-orange-100 text-orange-700' :
            'bg-blue-100 text-blue-700'
          }`}>
            {activeView === 'all' ? 'All Income' : activeView === 'hand-cash' ? 'Hand Cash' : 'Bank'}
          </span>
          <span className="text-[10px] sm:text-sm text-slate-500">
            ({displayedTransactions.length} of {pagination.total || 0})
          </span>
        </div>

        {/* Desktop Filters Bar - Hidden on Mobile */}
        <div className="hidden lg:block bg-white rounded-xl p-4 mb-6 shadow-sm">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            {/* Account Type Tabs */}
            <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => handleAccountFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedAccount === 'all'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-slate-600 hover:text-purple-600'
                }`}
              >
                All Income
              </button>
              <button
                onClick={() => handleAccountFilter('hand-cash')}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  selectedAccount === 'hand-cash'
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-slate-600 hover:text-orange-600'
                }`}
              >
                <Wallet size={16} />
                Hand Cash
              </button>
              <button
                onClick={() => handleAccountFilter('bank')}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  selectedAccount === 'bank'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-blue-600'
                }`}
              >
                <Landmark size={16} />
                Bank
              </button>
            </div>

            {/* Date Range and Search */}
            <div className="flex gap-3">
              <select
                value={dateRange}
                onChange={(e) => handleDateRangeChange(e.target.value)}
                className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
                <option value="custom">Custom Range</option>
              </select>

              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearch}
                  placeholder="Search by customer..."
                  className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none w-64"
                />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg border transition-all ${
                  showFilters 
                    ? 'bg-purple-50 border-purple-200 text-purple-600' 
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Filter size={18} />
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-2">Category</label>
                  <select
                    value={filters.category || ''}
                    onChange={(e) => dispatch(setFilters({ category: e.target.value, page: 1 }))}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    <option value="">All Categories</option>
                    <option value="customer-advance">Advance Payment</option>
                    <option value="full-payment">Full Payment</option>
                    <option value="part-payment">Partial Payment</option>
                    <option value="fabric-sale">Fabric Sale (Extra)</option>
                    <option value="project-payment">Project Payment</option>
                    <option value="other-income">Other Income</option>
                  </select>
                </div>

                {/* Payment Method Filter */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-2">Payment Method</label>
                  <select
                    value={filters.paymentMethod || ''}
                    onChange={(e) => dispatch(setFilters({ paymentMethod: e.target.value, page: 1 }))}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    <option value="">All Methods</option>
                    <option value="cash">Cash</option>
                    <option value="upi">UPI</option>
                    <option value="bank-transfer">Bank Transfer</option>
                    <option value="card">Card</option>
                  </select>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      dispatch(resetFilters());
                      setSelectedAccount('all');
                      setActiveView('all');
                      setDateRange('month');
                      setSearchQuery('');
                      setCustomDates({ start: '', end: '' });
                      setShowCustomDatePicker(false);
                    }}
                    className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg font-medium hover:bg-slate-200 transition-all flex items-center gap-2"
                  >
                    <X size={16} />
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Custom Date Picker - Desktop */}
          {dateRange === 'custom' && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="flex flex-wrap gap-4 items-end">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={customDates.start}
                    onChange={(e) => setCustomDates({ ...customDates, start: e.target.value })}
                    className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-2">End Date</label>
                  <input
                    type="date"
                    value={customDates.end}
                    onChange={(e) => setCustomDates({ ...customDates, end: e.target.value })}
                    className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCustomDateApply}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-all"
                  >
                    Apply Range
                  </button>
                  <button
                    onClick={handleCustomDateClear}
                    className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg font-medium hover:bg-slate-200 transition-all"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Search Bar */}
        <div className="lg:hidden mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search by customer..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && transactions.length === 0 && (
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-8 sm:p-12 text-center">
            <div className="flex flex-col items-center">
              <RefreshCw size={32} className="text-slate-300 animate-spin mb-3 sm:w-12 sm:h-12" />
              <p className="text-sm sm:text-base text-slate-500 font-medium">Loading income transactions...</p>
            </div>
          </div>
        )}

        {/* Income Table - Desktop */}
        {!loading && (
          <div className="hidden lg:block bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase">Date & Time</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase">Order Details</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase">Customer</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase">Payment Method</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase">Account</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-slate-500 uppercase">Amount</th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-slate-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayedTransactions.map((transaction) => (
                    <tr key={transaction._id} className="hover:bg-slate-50 transition-all">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-slate-800">{formatDate(transaction.transactionDate)}</div>
                          <div className="text-xs text-slate-500">{formatTime(transaction.transactionDate)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {transaction.order ? (
                          <div>
                            <Link 
                              to={`${basePath}/orders/${transaction.order._id || transaction.order}`}
                              className="text-sm font-medium text-purple-600 hover:text-purple-700 flex items-center gap-1"
                            >
                              <ShoppingBag size={14} />
                              Order #{transaction.order.orderId || 'N/A'}
                            </Link>
                            <span className="text-xs text-slate-500">
                              {getCategoryLabel(transaction.category, transaction.customCategory)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {transaction.customerDetails ? (
                          <div>
                            <div className="text-sm font-medium text-slate-800 flex items-center gap-1">
                              <User size={14} className="text-slate-400" />
                              {transaction.customerDetails.name}
                            </div>
                            <div className="text-xs text-slate-500">{transaction.customerDetails.phone}</div>
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-800">
                          {getPaymentMethodLabel(transaction.paymentMethod)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          transaction.accountType === 'hand-cash'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {transaction.accountType === 'hand-cash' ? 'Hand Cash' : 'Bank'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-lg font-bold text-purple-600">
                          + ₹{safeToLocale(transaction.amount)}
                        </span>
                        {transaction.description && (
                          <div className="text-xs text-slate-500 truncate max-w-[150px]" title={transaction.description}>
                            {transaction.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => handleViewDetails(transaction)}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-all flex items-center justify-center"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {displayedTransactions.length === 0 && (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <ShoppingBag size={48} className="text-slate-300 mb-3" />
                          <p className="text-slate-500 font-medium">No income transactions found</p>
                          <p className="text-sm text-slate-400 mt-1">
                            {activeView === 'all' 
                              ? 'Create orders or add payments to see income here'
                              : activeView === 'hand-cash'
                              ? 'No hand cash payments found'
                              : 'No bank payments found'}
                          </p>
                          <Link
                            to={`${basePath}/orders/new`}
                            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-all"
                          >
                            Create New Order
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Desktop Pagination */}
            {pagination.pages > 1 && (
              <div className="px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-slate-600">
                  Showing {startEntry} to {endEntry} of {pagination.total} entries
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1 || loading}
                    className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  
                  <div className="flex gap-1">
                    {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                      let pageNum;
                      if (pagination.pages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page >= pagination.pages - 2) {
                        pageNum = pagination.pages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          disabled={loading}
                          className={`w-10 h-10 rounded-lg font-medium transition-all flex items-center justify-center ${
                            pagination.page === pageNum
                              ? 'bg-purple-600 text-white'
                              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages || loading}
                    className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Income Cards - Mobile View */}
        {!loading && (
          <div className="lg:hidden space-y-3">
            {displayedTransactions.length > 0 ? (
              displayedTransactions.map((transaction) => (
                <div key={transaction._id} className="bg-white rounded-lg p-4 shadow-sm border border-slate-200 hover:shadow-md transition-all">
                  {/* Header with Amount and Account Type */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-lg font-bold text-purple-600">
                        + ₹{safeToLocale(transaction.amount)}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          transaction.accountType === 'hand-cash'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {transaction.accountType === 'hand-cash' ? 'Hand Cash' : 'Bank'}
                        </span>
                        {transaction.order && (
                          <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                            Order
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewDetails(transaction)}
                      className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                    >
                      <Eye size={16} />
                    </button>
                  </div>

                  {/* Date and Time */}
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                    <Clock size={12} />
                    <span>{formatDate(transaction.transactionDate)} at {formatTime(transaction.transactionDate)}</span>
                  </div>

                  {/* Order Details */}
                  {transaction.order ? (
                    <div className="bg-purple-50 p-2 rounded-lg mb-2">
                      <Link 
                        to={`${basePath}/orders/${transaction.order._id || transaction.order}`}
                        className="text-xs font-medium text-purple-600 hover:text-purple-700 flex items-center gap-1"
                      >
                        <ShoppingBag size={12} />
                        Order #{transaction.order.orderId || 'N/A'}
                      </Link>
                      <span className="text-[10px] text-slate-500">
                        {getCategoryLabel(transaction.category, transaction.customCategory)}
                      </span>
                    </div>
                  ) : (
                    <div className="bg-slate-50 p-2 rounded-lg mb-2">
                      <span className="text-xs font-medium text-slate-600">
                        {getCategoryLabel(transaction.category, transaction.customCategory)}
                      </span>
                    </div>
                  )}

                  {/* Customer Details */}
                  {transaction.customerDetails ? (
                    <div className="flex items-center gap-2 text-xs">
                      <User size={12} className="text-slate-400" />
                      <span className="font-medium text-slate-800">{transaction.customerDetails.name}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-500">{transaction.customerDetails.phone}</span>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400">No customer details</div>
                  )}

                  {/* Payment Method */}
                  <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-500">
                    Payment: {getPaymentMethodLabel(transaction.paymentMethod)}
                  </div>

                  {/* Description */}
                  {transaction.description && (
                    <div className="mt-1 text-[10px] text-slate-500 italic truncate" title={transaction.description}>
                      {transaction.description}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="bg-white rounded-lg p-8 text-center">
                <ShoppingBag size={32} className="text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium text-sm">No income transactions found</p>
                <p className="text-xs text-slate-400 mt-1 mb-4">
                  {activeView === 'all' 
                    ? 'Create orders or add payments'
                    : activeView === 'hand-cash'
                    ? 'No hand cash payments'
                    : 'No bank payments'}
                </p>
                <Link
                  to={`${basePath}/orders/new`}
                  className="inline-block px-4 py-2 bg-purple-600 text-white rounded-lg text-xs font-medium hover:bg-purple-700 transition-all"
                >
                  Create New Order
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Mobile Pagination */}
        {!loading && pagination.pages > 1 && (
          <div className="lg:hidden mt-4 flex flex-col items-center gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1 || loading}
                className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="px-4 py-1 bg-purple-50 text-purple-600 rounded-lg text-xs font-medium">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages || loading}
                className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50"
              >
                <ChevronRight size={16} />
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Showing {startEntry} to {endEntry} of {pagination.total}
            </p>
          </div>
        )}
      </div>

      {/* Transaction Details Modal */}
      {showDetailsModal && selectedTransaction && (
        <TransactionDetailsModal
          transaction={selectedTransaction}
          type="income"
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedTransaction(null);
          }}
        />
      )}
    </div>
  );
}














