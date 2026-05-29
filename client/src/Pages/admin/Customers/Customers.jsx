
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { 
  Search, UserPlus, ShoppingBag, User, MapPin, Phone, Mail, 
  Calendar, PlusCircle, Eye, Hash, IndianRupee, CreditCard, 
  TrendingUp, Package, Download, Upload, FileSpreadsheet,
  ChevronLeft, ChevronRight 
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { 
  searchCustomerByPhone, 
  searchCustomerByCustomerId,
  clearCustomerState, 
  fetchAllCustomers,
  fetchCustomersWithPayments,
  importCustomers,
  exportCustomers
} from "../../../features/customer/customerSlice";
import { fetchOrdersByCustomer } from "../../../features/order/orderSlice";
import { useNavigate } from "react-router-dom";
import showToast from "../../../utils/toast";

export default function Customers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showPaymentInfo, setShowPaymentInfo] = useState({});
  const [customerOrders, setCustomerOrders] = useState({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { customers, loading, error, importExportLoading } = useSelector((state) => state.customer);
  const { user } = useSelector((state) => state.auth);
  
  // Get orders from Redux
  const ordersState = useSelector((state) => {
    const state1 = state.order?.customerOrders;
    const state2 = state.orders?.customerOrders;
    return state1 || state2 || {};
  });

  // Get base path based on user role
  const rolePath = user?.role === "ADMIN" ? "/admin" : 
                   user?.role === "STORE_KEEPER" ? "/storekeeper" : 
                   "/cuttingmaster";

  // 🚀 OPTIMIZED: Fetch all customers with payment data on component mount (ONLY ONCE)
  useEffect(() => {
    dispatch(fetchCustomersWithPayments());
  }, [dispatch]);

  // ❌ REMOVED: The problematic loop that was causing 30+ API calls
  // No more fetching orders for each customer individually
  // Orders data should come from backend aggregation in fetchCustomersWithPayments

  // Process orders data when ordersState changes (from aggregated data)
  useEffect(() => {
    if (ordersState && Object.keys(ordersState).length > 0) {
      const ordersMap = {};
      
      Object.keys(ordersState).forEach(customerId => {
        let customerOrderData = [];
        
        if (Array.isArray(ordersState[customerId])) {
          customerOrderData = ordersState[customerId];
        } else if (ordersState[customerId]?.orders) {
          customerOrderData = ordersState[customerId].orders;
        }
        
        ordersMap[customerId] = {
          count: customerOrderData.length || 0,
          orders: customerOrderData,
          totalValue: customerOrderData.reduce((sum, order) => 
            sum + (order.priceSummary?.totalMax || 0), 0
          ),
          completedOrders: customerOrderData.filter(o => o?.status === 'delivered').length,
          pendingOrders: customerOrderData.filter(o => 
            ['draft', 'confirmed', 'in-progress'].includes(o?.status)
          ).length
        };
      });
      
      setCustomerOrders(prev => ({ ...prev, ...ordersMap }));
    }
  }, [ordersState]);

  // Handle errors
  useEffect(() => {
    if (error) {
      showToast.error(error);
    }
  }, [error]);

  // Reset to first page when search results change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, customers]);

  // 🚀 OPTIMIZED: Debounced Search - Removed API calls for search since all customers are loaded
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (!searchTerm) {
        dispatch(clearCustomerState());
        dispatch(fetchCustomersWithPayments());
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, dispatch]);

  // 🚀 OPTIMIZED: Handle input change
  const handleInputChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  // 🚀 OPTIMIZED: Search handler removed - now using debounced effect
  const handleSearch = useCallback((e) => {
    e.preventDefault();
    // Search is now handled by debounced useEffect
  }, []);

  // 🚀 OPTIMIZED: Filter customers using useMemo by Name, Phone, and ID
  const filteredCustomers = useMemo(() => {
    if (searchTerm && customers?.length > 0) {
      const lowerSearch = searchTerm.toLowerCase();
      return customers.filter(c => {
        const fullName = `${c.firstName || ''} ${c.lastName || ''}`.toLowerCase();
        return (
          c.phone?.includes(searchTerm) ||
          c.customerId?.toLowerCase().includes(lowerSearch) ||
          fullName.includes(lowerSearch) ||
          c.firstName?.toLowerCase().includes(lowerSearch) ||
          c.lastName?.toLowerCase().includes(lowerSearch)
        );
      });
    }
    return customers;
  }, [customers, searchTerm]);

  // 🚀 OPTIMIZED: Pagination calculations using useMemo
  const totalItems = useMemo(() => filteredCustomers?.length || 0, [filteredCustomers]);
  const totalPages = useMemo(() => Math.ceil(totalItems / itemsPerPage), [totalItems, itemsPerPage]);
  const startIndex = useMemo(() => (currentPage - 1) * itemsPerPage, [currentPage, itemsPerPage]);
  const endIndex = useMemo(() => startIndex + itemsPerPage, [startIndex, itemsPerPage]);
  
  // 🚀 OPTIMIZED: Current customers using useMemo
  const currentCustomers = useMemo(() => 
    filteredCustomers?.slice(startIndex, endIndex) || [], 
    [filteredCustomers, startIndex, endIndex]
  );

  // Pagination handlers
  const goToPage = useCallback((page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  const handleItemsPerPageChange = useCallback((e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  }, []);

  // Format date
  const formatDate = useCallback((dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }, []);

  // Get customer full name
  const getCustomerName = useCallback((customer) => {
    if (customer.name) return customer.name;
    return `${customer.salutation || ''} ${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Unknown';
  }, []);

  // Navigate to customer details
  const viewCustomerDetails = useCallback((customerId) => {
    navigate(`${rolePath}/customers/${customerId}`);
  }, [navigate, rolePath]);

  // Navigate to add customer page
  const goToAddCustomer = useCallback(() => {
    navigate(`${rolePath}/add-customer`);
  }, [navigate, rolePath]);

  // Navigate to create order
  const goToCreateOrder = useCallback((customer) => {
    navigate(`${rolePath}/orders/new`, { state: { customer } });
  }, [navigate, rolePath]);

  // Toggle payment info display
  const togglePaymentInfo = useCallback((customerId, e) => {
    e.stopPropagation();
    setShowPaymentInfo(prev => ({
      ...prev,
      [customerId]: !prev[customerId]
    }));
  }, []);

  // Format currency
  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  }, []);

  // Handle Export Customers
  const handleExport = useCallback(async () => {
    try {
      await dispatch(exportCustomers()).unwrap();
    } catch (error) {
      console.error("Export failed:", error);
    }
  }, [dispatch]);

  // Handle Import Customers
  const handleImport = useCallback(async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
    if (!validTypes.includes(file.type)) {
      showToast.error('Please upload a valid Excel file (.xlsx or .xls)');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      showToast.error('File size should be less than 5MB');
      return;
    }
    
    setImporting(true);
    try {
      await dispatch(importCustomers(file)).unwrap();
      dispatch(fetchCustomersWithPayments());
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error("Import failed:", error);
    } finally {
      setImporting(false);
    }
  }, [dispatch]);

  // Get payment data from customer.paymentSummary
  const getPaymentData = useCallback((customer) => {
    if (customer.paymentSummary) {
      return {
        totalPaid: customer.paymentSummary.totalPaid || 0,
        lastPayment: customer.paymentSummary.lastPayment?.amount || 0,
        paymentCount: customer.paymentSummary.paymentCount || 0,
        pendingAmount: customer.paymentSummary.pendingOrders || 0,
        byMethod: customer.paymentSummary.byMethod || {}
      };
    }
    return {
      totalPaid: 0,
      lastPayment: 0,
      paymentCount: 0,
      pendingAmount: 0,
      byMethod: {}
    };
  }, []);

  // Get order data for a customer - now uses aggregated data from paymentSummary
  const getOrderData = useCallback((customerId) => {
    // 🚀 OPTIMIZED: Check if customer has order count from paymentSummary first
    const customerData = customers?.find(c => c._id === customerId);
    if (customerData?.paymentSummary?.orderCount !== undefined) {
      return {
        count: customerData.paymentSummary.orderCount || 0,
        orders: [],
        totalValue: 0,
        completedOrders: 0,
        pendingOrders: customerData.paymentSummary.pendingOrders || 0
      };
    }
    
    return customerOrders[customerId] || {
      count: 0,
      orders: [],
      totalValue: 0,
      completedOrders: 0,
      pendingOrders: 0
    };
  }, [customerOrders, customers]);

  // 🚀 OPTIMIZED: Removed ordersLoading state - no more individual order fetches

  // 🚀 OPTIMIZED: Check if this is initial load
  const isInitialLoading = loading && customers?.length === 0;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-black text-slate-800 tracking-tighter">Customers</h1>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 hover:bg-slate-100 rounded-xl transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-lg p-4">
            <div className="space-y-2">
              <button
                onClick={() => {
                  navigate(rolePath);
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 hover:bg-slate-100 rounded-xl font-medium"
              >
                Dashboard
              </button>
              <button
                onClick={() => {
                  navigate(`${rolePath}/orders`);
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 hover:bg-slate-100 rounded-xl font-medium"
              >
                Orders
              </button>
              <button
                onClick={() => {
                  navigate(`${rolePath}/payments`);
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 hover:bg-slate-100 rounded-xl font-medium"
              >
                Payments
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header Section */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 lg:mb-8">
          <div className="space-y-4 lg:space-y-0 lg:flex lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tighter uppercase">
                Customers
              </h1>
              <p className="text-sm sm:text-base text-slate-500 font-medium mt-1">
                Search, view, and manage your customers
              </p>
            </div>

            <div className="space-y-3 sm:space-y-4 lg:space-y-0 lg:flex lg:items-center lg:gap-3">
              {/* Search Form */}
              <form onSubmit={handleSearch} className="flex gap-2 w-full lg:w-auto">
                <div className="relative flex-1 lg:w-80">
                  <Search className="absolute left-3 sm:left-4 top-2.5 sm:top-3.5 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search by Name, Phone or ID..."
                    className="w-full pl-9 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 text-sm sm:text-base"
                    value={searchTerm} 
                    onChange={handleInputChange}
                  />
                </div>
                <button 
                  type="submit" 
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 whitespace-nowrap"
                  disabled={loading}
                >
                  {loading ? "..." : "Search"}
                </button>
              </form>
              
              {/* Action Buttons */}
              <div className="flex gap-2 w-full lg:w-auto">
                <button
                  onClick={handleExport}
                  disabled={importExportLoading}
                  className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base transition-all shadow-lg shadow-green-500/25 disabled:opacity-50"
                  title="Export customers to Excel"
                >
                  <Download size={18} />
                  <span className="hidden xs:inline">Export</span>
                </button>
                
                <label
                  className={`flex-1 lg:flex-none flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base transition-all shadow-lg shadow-purple-500/25 cursor-pointer ${importing ? 'opacity-50' : ''}`}
                  title="Import customers from Excel"
                >
                  <Upload size={18} />
                  <span className="hidden xs:inline">Import</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleImport}
                    className="hidden"
                    disabled={importing}
                  />
                </label>
                
                <button
                  onClick={goToAddCustomer}
                  className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base transition-all shadow-lg shadow-blue-500/25"
                >
                  <PlusCircle size={18} />
                  <span className="hidden xs:inline">Add New</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Search Result Info */}
        {searchTerm && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
            <div className="flex items-center gap-2">
              <Search size={16} className="text-blue-600" />
              <span className="text-xs sm:text-sm font-medium text-slate-700">
                Search results for <span className="font-black text-blue-600">{searchTerm}</span>
              </span>
            </div>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 sm:px-3 py-1 rounded-full font-bold self-start sm:self-auto">
              {filteredCustomers?.length || 0} found
            </span>
          </div>
        )}

        {/* 🚀 OPTIMIZED: Customers List with Ghosting Effect during loading */}
        <div className={`bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 overflow-hidden transition-all duration-300 ${
          loading && !isInitialLoading ? 'opacity-50 pointer-events-none grayscale' : 'opacity-100'
        }`}>
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <User size={20} className="text-blue-600" />
              <h2 className="text-lg sm:text-xl font-black text-slate-800 uppercase tracking-tight">
                All Customers
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="bg-slate-100 text-slate-600 px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-bold">
                {totalItems} Total
              </span>
              {/* Items per page selector */}
              <select
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="bg-slate-100 text-slate-700 px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-xs sm:text-sm font-medium border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>
          </div>

          {/* Loading State - Skeleton for initial load */}
          {isInitialLoading ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16">
              <div className="w-8 h-8 sm:w-10 sm:h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3 sm:mb-4"></div>
              <p className="text-sm sm:text-base text-slate-500 font-medium">Loading customers...</p>
            </div>
          ) : currentCustomers.length > 0 ? (
            <>
              <div className="divide-y divide-slate-100">
                {currentCustomers.map((customer) => {
                  const customerName = getCustomerName(customer);
                  const showPayment = showPaymentInfo[customer._id];
                  const paymentData = getPaymentData(customer);
                  const orderData = getOrderData(customer._id);
                  
                  return (
                    <div 
                      key={customer._id} 
                      className="p-3 sm:p-4 lg:p-5 hover:bg-slate-50 transition-all cursor-pointer"
                      onClick={() => viewCustomerDetails(customer._id)}
                    >
                      <div className="space-y-3 sm:space-y-4">
                        {/* Main Row */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                          <div className="flex items-start gap-3 sm:gap-4 w-full">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 flex-shrink-0">
                              <span className="text-base sm:text-lg lg:text-xl font-black">
                                {customerName?.charAt(0) || 'C'}
                              </span>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h3 className="font-black text-slate-800 text-sm sm:text-base lg:text-lg mb-1 truncate">
                                {customerName}
                              </h3>
                              
                              {customer.customerId && (
                                <div className="flex items-center gap-1 mb-2">
                                  <Hash size={10} className="text-blue-500" />
                                  <span className="text-[10px] sm:text-xs font-mono text-blue-600 bg-blue-50 px-1.5 sm:px-2 py-0.5 rounded-full truncate max-w-[150px] sm:max-w-none">
                                    {customer.customerId}
                                  </span>
                                </div>
                              )}
                              
                              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                <span className="inline-flex items-center gap-1 bg-slate-100 px-2 sm:px-3 py-1 rounded-full">
                                  <Phone size={10} className="text-blue-600" />
                                  <span className="text-[10px] sm:text-xs font-medium text-slate-700">
                                    {customer.phone}
                                  </span>
                                </span>
                                
                                <span className="inline-flex items-center gap-1 bg-purple-50 px-2 sm:px-3 py-1 rounded-full">
                                  <Package size={10} className="text-purple-600" />
                                  <span className="text-[10px] sm:text-xs font-medium text-purple-700">
                                    {orderData.count}
                                  </span>
                                </span>
                                
                                <button
                                  onClick={(e) => togglePaymentInfo(customer._id, e)}
                                  className="inline-flex items-center gap-1 bg-green-50 px-2 sm:px-3 py-1 rounded-full hover:bg-green-100"
                                >
                                  <IndianRupee size={10} className="text-green-600" />
                                  <span className="text-[10px] sm:text-xs font-medium text-green-700">
                                    {formatCurrency(paymentData.totalPaid)}
                                  </span>
                                </button>
                                
                                <span className="hidden xs:flex items-center gap-1 text-[10px] sm:text-xs text-slate-400">
                                  <Calendar size={10} />
                                  {formatDate(customer.createdAt)}
                                </span>
                              </div>
                              
                              {customer.address && (
                                <p className="hidden sm:flex text-[10px] sm:text-xs text-slate-400 mt-2 items-center gap-1 truncate">
                                  <MapPin size={10} className="flex-shrink-0" />
                                  <span className="truncate">{customer.address}</span>
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 sm:self-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                goToCreateOrder(customer);
                              }}
                              className="flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 text-white px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-bold transition-all shadow-lg text-xs sm:text-sm whitespace-nowrap"
                            >
                              <ShoppingBag size={12} />
                              <span className="hidden xs:inline">New</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                viewCustomerDetails(customer._id);
                              }}
                              className="flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-bold transition-all shadow-lg text-xs sm:text-sm"
                            >
                              <Eye size={12} />
                              <span className="hidden xs:inline">View</span>
                            </button>
                          </div>
                        </div>

                        {/* Payment Details Dropdown */}
                        {showPayment && (
                          <div className="mt-3 pt-3 border-t border-slate-100">
                            {Object.keys(paymentData.byMethod).length > 0 && (
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 mb-3">
                                {Object.entries(paymentData.byMethod).map(([method, amount]) => (
                                  amount > 0 && (
                                    <div key={method} className="bg-slate-50 p-1.5 sm:p-2 rounded-lg">
                                      <p className="text-[10px] text-slate-500 capitalize">{method}</p>
                                      <p className="text-xs sm:text-sm font-bold text-slate-700">{formatCurrency(amount)}</p>
                                    </div>
                                  )
                                ))}
                              </div>
                            )}
                            
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                              <div className="bg-blue-50 p-2 sm:p-3 rounded-lg sm:rounded-xl">
                                <p className="text-[10px] text-blue-600 font-bold mb-0.5">Total Paid</p>
                                <p className="text-sm sm:text-base font-black text-blue-700">{formatCurrency(paymentData.totalPaid)}</p>
                              </div>
                              <div className="bg-green-50 p-2 sm:p-3 rounded-lg sm:rounded-xl">
                                <p className="text-[10px] text-green-600 font-bold mb-0.5">Last Payment</p>
                                <p className="text-sm sm:text-base font-black text-green-700">{formatCurrency(paymentData.lastPayment)}</p>
                              </div>
                              <div className="bg-purple-50 p-2 sm:p-3 rounded-lg sm:rounded-xl">
                                <p className="text-[10px] text-purple-600 font-bold mb-0.5">Payments</p>
                                <p className="text-sm sm:text-base font-black text-purple-700">{paymentData.paymentCount}</p>
                              </div>
                              <div className="bg-orange-50 p-2 sm:p-3 rounded-lg sm:rounded-xl">
                                <p className="text-[10px] text-orange-600 font-bold mb-0.5">Pending</p>
                                <p className="text-sm sm:text-base font-black text-orange-700">{orderData.pendingOrders}</p>
                              </div>
                            </div>

                            {orderData.orders.length > 0 && (
                              <div className="hidden sm:block mt-4">
                                <p className="text-xs font-bold text-slate-500 mb-2 flex items-center gap-1">
                                  <Package size={12} />
                                  Recent Orders
                                </p>
                                <div className="space-y-2">
                                  {orderData.orders.slice(0, 2).map(order => (
                                    <div key={order._id} className="flex items-center justify-between bg-slate-50 p-2 rounded-lg text-xs">
                                      <div className="flex items-center gap-2">
                                        <span className="font-mono font-bold text-indigo-600">{order.orderId}</span>
                                        <span className={`px-1.5 py-0.5 rounded-full ${
                                          order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                          order.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                                          order.status === 'in-progress' ? 'bg-orange-100 text-orange-700' :
                                          'bg-slate-100 text-slate-700'
                                        }`}>
                                          {order.status}
                                        </span>
                                      </div>
                                      <span className="font-bold text-blue-600">
                                        ₹{(order.priceSummary?.totalMax || 0).toLocaleString('en-IN')}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-4 sm:px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs sm:text-sm text-slate-500">
                    Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                    <span className="font-medium">{Math.min(endIndex, totalItems)}</span> of{" "}
                    <span className="font-medium">{totalItems}</span> customers
                  </div>
                  
                  <div className="flex items-center gap-1 sm:gap-2">
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-1.5 sm:p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => goToPage(pageNum)}
                            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg font-medium text-sm transition-all ${
                              currentPage === pageNum
                                ? "bg-blue-600 text-white shadow-md"
                                : "hover:bg-slate-100 text-slate-600"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-1.5 sm:p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Empty State */
            <div className="text-center py-12 sm:py-16 px-4">
              <User size={40} className="text-slate-300 mx-auto mb-3 sm:mb-4" />
              <p className="text-lg sm:text-xl font-black text-slate-400">No Customers Found</p>
              <p className="text-sm sm:text-base text-slate-300 mt-2 max-w-sm mx-auto">
                {searchTerm 
                  ? `No customer matches "${searchTerm}"` 
                  : 'Register your first customer to get started'}
              </p>
              <button
                onClick={goToAddCustomer}
                className="mt-4 sm:mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold uppercase tracking-wider shadow-lg shadow-blue-500/30 transition-all text-sm sm:text-base"
              >
                Add New Customer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}




