// // Pages/banking/BankingOverview.jsx - FULLY RESPONSIVE WITH EXPORT
// import React, { useState, useEffect, useMemo } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { Link, useNavigate } from 'react-router-dom';
// import {
//   Wallet,
//   Landmark,
//   TrendingUp,
//   TrendingDown,
//   RefreshCw,
//   ArrowRight,
//   Download,
//   ArrowUpCircle,
//   ArrowDownCircle,
//   DollarSign,
//   ShoppingBag,
//   Users,
//   Clock,
//   Menu,
//   X,
//   Home,
//   Package,
//   LayoutGrid,
//   Filter,
//   Calendar
// } from 'lucide-react';
// import { 
//   fetchAllTransactions,
//   fetchTransactionSummary,
//   selectAllTransactions,
//   selectTransactionSummary,
//   selectTransactionLoading
// } from '../../features/transaction/transactionSlice';
// import StatCard from '../../components/common/StatCard';
// import ExportTransactions from '../../components/Banking/ExportTransactions';
// import showToast from '../../utils/toast';

// export default function BankingOverview() {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const summary = useSelector(selectTransactionSummary);
//   const loading = useSelector(selectTransactionLoading);
//   const allTransactions = useSelector(selectAllTransactions);
//   const { user } = useSelector((state) => state.auth);
  
//   // Mobile state
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
//   const [filteredTransactions, setFilteredTransactions] = useState([]);
  
//   // Get base path based on user role
//   const isAdmin = user?.role === "ADMIN";
//   const isStoreKeeper = user?.role === "STORE_KEEPER";
  
//   const basePath = useMemo(() => {
//     if (isAdmin) return "/admin";
//     if (isStoreKeeper) return "/storekeeper";
//     return "/cuttingmaster";
//   }, [isAdmin, isStoreKeeper]);

//   const [period, setPeriod] = useState('month');
//   const [recentAutoIncome, setRecentAutoIncome] = useState([]);
//   const [recentExpense, setRecentExpense] = useState([]);
//   const [stats, setStats] = useState({
//     income: {
//       handCash: 0,
//       bank: 0,
//       total: 0,
//       count: 0,
//       autoIncome: 0,
//       autoCount: 0,
//       autoHandCash: 0,
//       autoBank: 0
//     },
//     expense: {
//       handCash: 0,
//       bank: 0,
//       total: 0,
//       count: 0
//     },
//     netAmount: 0
//   });
//   const [isLoading, setIsLoading] = useState(false);
//   const [isInitialLoad, setIsInitialLoad] = useState(true);

//   // Navigation handlers for mobile menu
//   const handleNavigateToDashboard = () => {
//     navigate(`${basePath}/dashboard`);
//     setMobileMenuOpen(false);
//   };

//   const handleNavigateToBanking = () => {
//     navigate(`${basePath}/banking/overview`);
//     setMobileMenuOpen(false);
//   };

//   const handleNavigateToOrders = () => {
//     navigate(`${basePath}/orders`);
//     setMobileMenuOpen(false);
//   };

//   const handleNavigateToWorks = () => {
//     navigate(`${basePath}/works`);
//     setMobileMenuOpen(false);
//   };

//   const handleNavigateToCustomers = () => {
//     navigate(`${basePath}/customers`);
//     setMobileMenuOpen(false);
//   };

//   // Load data
//   useEffect(() => {
//     loadData(false);
//   }, [period]);

//   // Recalculate stats whenever allTransactions changes
//   useEffect(() => {
//     if (allTransactions.length > 0) {
//       calculateStats();
//       filterTransactionsByPeriod();
//     } else {
//       setStats({
//         income: {
//           handCash: 0,
//           bank: 0,
//           total: 0,
//           count: 0,
//           autoIncome: 0,
//           autoCount: 0,
//           autoHandCash: 0,
//           autoBank: 0
//         },
//         expense: {
//           handCash: 0,
//           bank: 0,
//           total: 0,
//           count: 0
//         },
//         netAmount: 0
//       });
//       setFilteredTransactions([]);
//     }
//   }, [allTransactions, period]);

//   const loadData = async (showToastMessage = false) => {
//     setIsLoading(true);
//     try {
//       await dispatch(fetchAllTransactions({ limit: 500 }));
//       await dispatch(fetchTransactionSummary(period));
      
//       if (!isInitialLoad && showToastMessage) {
//         showToast.success('Data refreshed successfully');
//       }
      
//       if (isInitialLoad) {
//         setIsInitialLoad(false);
//       }
//     } catch (error) {
//       console.error('Failed to load data:', error);
//       if (!isInitialLoad && showToastMessage) {
//         showToast.error('Failed to load data');
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleRefresh = () => {
//     loadData(true);
//   };

//   const getDateRangeForPeriod = () => {
//     const now = new Date();
//     const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
//     switch(period) {
//       case 'today':
//         return {
//           start: today,
//           end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
//         };
//       case 'week':
//         const weekStart = new Date(today);
//         weekStart.setDate(today.getDate() - today.getDay());
//         return {
//           start: weekStart,
//           end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
//         };
//       case 'month':
//         const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
//         return {
//           start: monthStart,
//           end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
//         };
//       case 'year':
//         const yearStart = new Date(today.getFullYear(), 0, 1);
//         return {
//           start: yearStart,
//           end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
//         };
//       case 'all':
//       default:
//         return {
//           start: new Date(0),
//           end: new Date(8640000000000000)
//         };
//     }
//   };

//   const isTransactionInPeriod = (transactionDate) => {
//     if (period === 'all') return true;
    
//     const { start, end } = getDateRangeForPeriod();
//     const transDate = new Date(transactionDate);
//     return transDate >= start && transDate <= end;
//   };

//   const filterTransactionsByPeriod = () => {
//     if (!allTransactions || allTransactions.length === 0) {
//       setRecentAutoIncome([]);
//       setRecentExpense([]);
//       setFilteredTransactions([]);
//       return;
//     }

//     const filtered = allTransactions.filter(t => 
//       isTransactionInPeriod(t.transactionDate)
//     );
//     setFilteredTransactions(filtered);

//     const sortedTransactions = [...filtered].sort(
//       (a, b) => new Date(b.transactionDate) - new Date(a.transactionDate)
//     );

//     // Show only AUTO income (from orders)
//     const autoIncomeList = sortedTransactions
//       .filter(t => t.type === 'income' && t.order)
//       .slice(0, 5);
    
//     const expenseList = sortedTransactions
//       .filter(t => t.type === 'expense')
//       .slice(0, 5);

//     setRecentAutoIncome(autoIncomeList);
//     setRecentExpense(expenseList);
//   };

//   const calculateStats = () => {
//     if (!allTransactions || allTransactions.length === 0) {
//       setStats({
//         income: {
//           handCash: 0,
//           bank: 0,
//           total: 0,
//           count: 0,
//           autoIncome: 0,
//           autoCount: 0,
//           autoHandCash: 0,
//           autoBank: 0
//         },
//         expense: {
//           handCash: 0,
//           bank: 0,
//           total: 0,
//           count: 0
//         },
//         netAmount: 0
//       });
//       return;
//     }

//     const periodTransactions = allTransactions.filter(t => 
//       isTransactionInPeriod(t.transactionDate)
//     );

//     // Separate AUTO income (with order) and other income
//     const autoIncomeTransactions = periodTransactions.filter(t => 
//       t.type === 'income' && t.order
//     );
    
//     const expenseTransactions = periodTransactions.filter(t => t.type === 'expense');

//     // Auto income calculations
//     const autoHandCash = autoIncomeTransactions
//       .filter(t => t.accountType === 'hand-cash')
//       .reduce((sum, t) => sum + (t.amount || 0), 0);
    
//     const autoBank = autoIncomeTransactions
//       .filter(t => t.accountType === 'bank')
//       .reduce((sum, t) => sum + (t.amount || 0), 0);
    
//     const autoTotal = autoHandCash + autoBank;
//     const autoCount = autoIncomeTransactions.length;

//     // Total income (including auto)
//     const totalHandCashIncome = periodTransactions
//       .filter(t => t.type === 'income' && t.accountType === 'hand-cash')
//       .reduce((sum, t) => sum + (t.amount || 0), 0);
    
//     const totalBankIncome = periodTransactions
//       .filter(t => t.type === 'income' && t.accountType === 'bank')
//       .reduce((sum, t) => sum + (t.amount || 0), 0);
    
//     const totalIncomeCount = periodTransactions.filter(t => t.type === 'income').length;

//     // Expense calculations
//     const handCashExpense = expenseTransactions
//       .filter(t => t.accountType === 'hand-cash')
//       .reduce((sum, t) => sum + (t.amount || 0), 0);
    
//     const bankExpense = expenseTransactions
//       .filter(t => t.accountType === 'bank')
//       .reduce((sum, t) => sum + (t.amount || 0), 0);
    
//     const expenseCount = expenseTransactions.length;

//     const totalIncome = totalHandCashIncome + totalBankIncome;
//     const totalExpense = handCashExpense + bankExpense;

//     setStats({
//       income: {
//         handCash: totalHandCashIncome,
//         bank: totalBankIncome,
//         total: totalIncome,
//         count: totalIncomeCount,
//         autoIncome: autoTotal,
//         autoCount: autoCount,
//         autoHandCash: autoHandCash,
//         autoBank: autoBank
//       },
//       expense: {
//         handCash: handCashExpense,
//         bank: bankExpense,
//         total: totalExpense,
//         count: expenseCount
//       },
//       netAmount: totalIncome - totalExpense
//     });
//   };

//   const formatDate = (date) => {
//     return new Date(date).toLocaleDateString('en-IN', {
//       day: '2-digit',
//       month: 'short',
//       year: 'numeric'
//     });
//   };

//   const formatTime = (date) => {
//     return new Date(date).toLocaleTimeString('en-IN', {
//       hour: '2-digit',
//       minute: '2-digit',
//       hour12: true
//     });
//   };

//   const getCategoryLabel = (category, customCategory, type) => {
//     const incomeCategories = {
//       'customer-advance': 'Advance Payment',
//       'full-payment': 'Full Payment',
//       'fabric-sale': 'Fabric Sale',
//       'project-payment': 'Project Payment',
//       'other-income': customCategory || 'Other Income'
//     };
    
//     const expenseCategories = {
//       'salary': 'Employee Salary',
//       'electricity': 'Electricity Bill',
//       'travel': 'Travel',
//       'material-purchase': 'Material Purchase',
//       'rent': 'Rent',
//       'maintenance': 'Maintenance',
//       'other-expense': customCategory || 'Other Expense'
//     };

//     if (type === 'income') {
//       return incomeCategories[category] || category;
//     } else {
//       return expenseCategories[category] || category;
//     }
//   };

//   // Safe formatting helper
//   const safeToLocale = (value) => {
//     return (value || 0).toLocaleString('en-IN');
//   };

//   return (
//     <div className="min-h-screen bg-slate-50">
//       {/* ===== MOBILE HEADER ===== */}
//       <div className="lg:hidden bg-white border-b border-slate-200 sticky top-0 z-30">
//         <div className="flex items-center justify-between px-4 py-3">
//           <div className="flex items-center gap-2">
//             <Landmark size={20} className="text-blue-600" />
//             <h1 className="text-lg font-black text-slate-800">Banking</h1>
//           </div>
//           <div className="flex items-center gap-2">
//             <button
//               onClick={handleRefresh}
//               className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition flex items-center justify-center"
//               style={{ minWidth: '36px', minHeight: '36px' }}
//             >
//               <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
//             </button>
//             <button
//               onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
//               className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition flex items-center justify-center"
//               style={{ minWidth: '36px', minHeight: '36px' }}
//             >
//               <Filter size={18} />
//             </button>
//             <button
//               onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//               className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition flex items-center justify-center"
//               style={{ minWidth: '36px', minHeight: '36px' }}
//             >
//               <Menu size={18} />
//             </button>
//           </div>
//         </div>

//         {/* Mobile Filters Panel */}
//         {mobileFiltersOpen && (
//           <div className="absolute top-full left-4 right-4 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 p-4 z-40">
//             <div className="flex items-center justify-between mb-3">
//               <h3 className="font-bold text-slate-800 flex items-center gap-2">
//                 <Calendar size={16} className="text-blue-600" />
//                 Select Period
//               </h3>
//               <button
//                 onClick={() => setMobileFiltersOpen(false)}
//                 className="p-1 hover:bg-slate-100 rounded-lg"
//               >
//                 <X size={16} />
//               </button>
//             </div>
//             <div className="grid grid-cols-2 gap-2">
//               {['today', 'week', 'month', 'year', 'all'].map((p) => (
//                 <button
//                   key={p}
//                   onClick={() => {
//                     setPeriod(p);
//                     setMobileFiltersOpen(false);
//                   }}
//                   className={`px-3 py-2 rounded-lg font-medium text-sm transition-all ${
//                     period === p
//                       ? 'bg-blue-600 text-white'
//                       : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
//                   }`}
//                 >
//                   {p === 'all' ? 'All Time' : p.charAt(0).toUpperCase() + p.slice(1)}
//                 </button>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Mobile Menu - Role-based navigation */}
//         {mobileMenuOpen && (
//           <div className="absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-lg p-4 z-40 max-h-[80vh] overflow-y-auto">
//             <div className="space-y-2">
//               {/* Dashboard */}
//               <button
//                 onClick={handleNavigateToDashboard}
//                 className="w-full text-left px-4 py-3 hover:bg-slate-100 rounded-xl font-medium flex items-center gap-3"
//               >
//                 <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
//                   <Home size={16} className="text-blue-600" />
//                 </span>
//                 Dashboard
//               </button>

//               {/* Banking - Current Page */}
//               <button
//                 onClick={handleNavigateToBanking}
//                 className="w-full text-left px-4 py-3 bg-blue-50 text-blue-600 rounded-xl font-medium flex items-center gap-3"
//               >
//                 <span className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
//                   <Landmark size={16} className="text-white" />
//                 </span>
//                 Banking
//               </button>

//               {/* Orders */}
//               <button
//                 onClick={handleNavigateToOrders}
//                 className="w-full text-left px-4 py-3 hover:bg-slate-100 rounded-xl font-medium flex items-center gap-3"
//               >
//                 <span className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
//                   <ShoppingBag size={16} className="text-green-600" />
//                 </span>
//                 Orders
//               </button>

//               {/* Works */}
//               <button
//                 onClick={handleNavigateToWorks}
//                 className="w-full text-left px-4 py-3 hover:bg-slate-100 rounded-xl font-medium flex items-center gap-3"
//               >
//                 <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
//                   <LayoutGrid size={16} className="text-purple-600" />
//                 </span>
//                 Works
//               </button>

//               {/* Customers */}
//               <button
//                 onClick={handleNavigateToCustomers}
//                 className="w-full text-left px-4 py-3 hover:bg-slate-100 rounded-xl font-medium flex items-center gap-3"
//               >
//                 <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
//                   <Users size={16} className="text-orange-600" />
//                 </span>
//                 Customers
//               </button>
//             </div>
//           </div>
//         )}
//       </div>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
//         {/* Desktop Header - Hidden on Mobile */}
//         <div className="hidden lg:flex items-center justify-between mb-8">
//           <div>
//             <h1 className="text-3xl font-black text-slate-800 mb-2 flex items-center gap-3">
//               <Landmark size={32} className="text-blue-600" />
//               Banking Overview
//             </h1>
//             <p className="text-slate-600">Track auto income from orders and expenses</p>
//             <p className="text-xs text-slate-400 mt-1">
//               Last updated: {new Date().toLocaleTimeString()} • Showing: {
//                 period === 'today' ? 'Today' :
//                 period === 'week' ? 'This Week' :
//                 period === 'month' ? 'This Month' :
//                 period === 'year' ? 'This Year' : 'All Time'
//               }
//             </p>
//           </div>
//           <div className="flex gap-3">
//             {/* ✅ Export Component Integrated */}
//             <ExportTransactions 
//               transactions={filteredTransactions}
//               period={period}
//             />
//             <button
//               onClick={handleRefresh}
//               className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all"
//               title="Refresh"
//             >
//               <RefreshCw size={20} className={isLoading ? 'animate-spin text-blue-600' : 'text-slate-600'} />
//             </button>
//           </div>
//         </div>

//         {/* Period Selector - Desktop */}
//         <div className="hidden lg:flex gap-2 mt-4 mb-6">
//           {['today', 'week', 'month', 'year', 'all'].map((p) => (
//             <button
//               key={p}
//               onClick={() => setPeriod(p)}
//               className={`px-4 py-2 rounded-lg font-medium transition-all ${
//                 period === p
//                   ? 'bg-blue-600 text-white shadow-md'
//                   : 'bg-white text-slate-600 hover:bg-slate-100'
//               }`}
//             >
//               {p === 'all' ? 'All Time' : p.charAt(0).toUpperCase() + p.slice(1)}
//             </button>
//           ))}
//         </div>

//         {/* Mobile Period Indicator */}
//         <div className="lg:hidden mb-4">
//           <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-2">
//                 <Calendar size={16} className="text-blue-600" />
//                 <span className="text-sm font-medium text-blue-700">Period:</span>
//               </div>
//               <span className="text-sm font-bold text-blue-800">
//                 {period === 'today' ? 'Today' :
//                  period === 'week' ? 'This Week' :
//                  period === 'month' ? 'This Month' :
//                  period === 'year' ? 'This Year' : 'All Time'}
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* Auto Income Summary Card - Mobile Optimized */}
//         <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 lg:mb-8 text-white shadow-xl">
//           <div className="flex items-center justify-between mb-3 sm:mb-4">
//             <div>
//               <h2 className="text-sm sm:text-base font-medium opacity-90 flex items-center gap-2">
//                 <ShoppingBag size={16} className="sm:w-5 sm:h-5" />
//                 Auto Income from Orders
//               </h2>
//               <p className="text-2xl sm:text-3xl lg:text-4xl font-black mb-1 sm:mb-2">
//                 ₹{safeToLocale(stats.income.autoIncome)}
//               </p>
//               <p className="text-xs sm:text-sm opacity-75">
//                 {stats.income.autoCount || 0} order payments
//               </p>
//             </div>
//             <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center">
//               <TrendingUp size={20} className="sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-white" />
//             </div>
//           </div>
//           <div className="grid grid-cols-2 gap-2 sm:gap-4">
//             <div className="bg-orange-500/20 rounded-lg p-2 sm:p-3">
//               <p className="text-[10px] sm:text-xs opacity-75 flex items-center gap-1">
//                 <Wallet size={10} className="sm:w-3 sm:h-3" /> Hand Cash
//               </p>
//               <p className="text-sm sm:text-base lg:text-xl font-bold">+ ₹{safeToLocale(stats.income.autoHandCash)}</p>
//             </div>
//             <div className="bg-blue-500/20 rounded-lg p-2 sm:p-3">
//               <p className="text-[10px] sm:text-xs opacity-75 flex items-center gap-1">
//                 <Landmark size={10} className="sm:w-3 sm:h-3" /> Bank
//               </p>
//               <p className="text-sm sm:text-base lg:text-xl font-bold">+ ₹{safeToLocale(stats.income.autoBank)}</p>
//             </div>
//           </div>
//         </div>

//         {/* Income and Expense Summary Cards - Mobile Optimized */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
//           {/* Auto Income Card */}
//           <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 shadow-sm border-l-4 border-purple-500 hover:shadow-lg transition-all">
//             <div className="flex items-center justify-between mb-3 sm:mb-4">
//               <div>
//                 <h3 className="text-xs sm:text-sm font-medium text-slate-500">Auto Income (from Orders)</h3>
//                 <p className="text-xl sm:text-2xl lg:text-3xl font-black text-purple-600">
//                   + ₹{safeToLocale(stats.income.autoIncome)}
//                 </p>
//               </div>
//               <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-purple-100 rounded-lg sm:rounded-xl flex items-center justify-center">
//                 <ShoppingBag size={18} className="sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-purple-600" />
//               </div>
//             </div>
            
//             <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4 mb-3 sm:mb-4">
//               <div className="bg-orange-50 p-2 sm:p-3 rounded-lg">
//                 <p className="text-[10px] sm:text-xs text-orange-600 font-medium flex items-center gap-1">
//                   <Wallet size={10} className="sm:w-3 sm:h-3" /> Hand Cash
//                 </p>
//                 <p className="text-sm sm:text-base font-bold text-orange-700">
//                   + ₹{safeToLocale(stats.income.autoHandCash)}
//                 </p>
//               </div>
//               <div className="bg-blue-50 p-2 sm:p-3 rounded-lg">
//                 <p className="text-[10px] sm:text-xs text-blue-600 font-medium flex items-center gap-1">
//                   <Landmark size={10} className="sm:w-3 sm:h-3" /> Bank
//                 </p>
//                 <p className="text-sm sm:text-base font-bold text-blue-700">
//                   + ₹{safeToLocale(stats.income.autoBank)}
//                 </p>
//               </div>
//             </div>

//             <div className="flex gap-2">
//               <Link
//                 to={`${basePath}/orders?payment=advance`}
//                 className="flex-1 text-center py-2 sm:py-2.5 bg-purple-50 text-purple-600 rounded-lg text-xs sm:text-sm font-medium hover:bg-purple-100 transition-all flex items-center justify-center gap-1 sm:gap-2"
//               >
//                 <ShoppingBag size={12} className="sm:w-4 sm:h-4" />
//                 <span className="hidden xs:inline">View Orders</span>
//                 <span className="xs:hidden">Orders</span>
//                 <ArrowRight size={12} className="sm:w-4 sm:h-4" />
//               </Link>
//             </div>
//             <Link
//               to={`${basePath}/banking/income`}
//               className="mt-2 sm:mt-3 block text-center py-2 bg-purple-50 text-purple-600 rounded-lg text-xs sm:text-sm font-medium hover:bg-purple-100 transition-all"
//             >
//               View All Auto Income ({stats.income.autoCount || 0} payments) →
//             </Link>
//           </div>

//           {/* Expense Summary Card */}
//           <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 shadow-sm border-l-4 border-red-500 hover:shadow-lg transition-all">
//             <div className="flex items-center justify-between mb-3 sm:mb-4">
//               <div>
//                 <h3 className="text-xs sm:text-sm font-medium text-slate-500">Total Expense</h3>
//                 <p className="text-xl sm:text-2xl lg:text-3xl font-black text-red-600">
//                   - ₹{safeToLocale(stats.expense.total)}
//                 </p>
//               </div>
//               <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-red-100 rounded-lg sm:rounded-xl flex items-center justify-center">
//                 <TrendingDown size={18} className="sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-red-600" />
//               </div>
//             </div>
            
//             <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4 mb-3 sm:mb-4">
//               <div className="bg-orange-50 p-2 sm:p-3 rounded-lg">
//                 <p className="text-[10px] sm:text-xs text-orange-600 font-medium flex items-center gap-1">
//                   <Wallet size={10} className="sm:w-3 sm:h-3" /> Hand Cash
//                 </p>
//                 <p className="text-sm sm:text-base font-bold text-orange-700">
//                   - ₹{safeToLocale(stats.expense.handCash)}
//                 </p>
//               </div>
//               <div className="bg-blue-50 p-2 sm:p-3 rounded-lg">
//                 <p className="text-[10px] sm:text-xs text-blue-600 font-medium flex items-center gap-1">
//                   <Landmark size={10} className="sm:w-3 sm:h-3" /> Bank
//                 </p>
//                 <p className="text-sm sm:text-base font-bold text-blue-700">
//                   - ₹{safeToLocale(stats.expense.bank)}
//                 </p>
//               </div>
//             </div>

//             <div className="flex gap-2">
//               <Link
//                 to={`${basePath}/banking/expense?account=hand-cash`}
//                 className="flex-1 text-center py-2 sm:py-2.5 bg-orange-50 text-orange-600 rounded-lg text-xs sm:text-sm font-medium hover:bg-orange-100 transition-all flex items-center justify-center gap-1 sm:gap-2"
//               >
//                 <Wallet size={12} className="sm:w-4 sm:h-4" />
//                 <span className="hidden xs:inline">Hand Cash</span>
//                 <span className="xs:hidden">Cash</span>
//                 <ArrowRight size={12} className="sm:w-4 sm:h-4" />
//               </Link>
//               <Link
//                 to={`${basePath}/banking/expense?account=bank`}
//                 className="flex-1 text-center py-2 sm:py-2.5 bg-blue-50 text-blue-600 rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-100 transition-all flex items-center justify-center gap-1 sm:gap-2"
//               >
//                 <Landmark size={12} className="sm:w-4 sm:h-4" />
//                 Bank
//                 <ArrowRight size={12} className="sm:w-4 sm:h-4" />
//               </Link>
//             </div>
//             <Link
//               to={`${basePath}/banking/expense`}
//               className="mt-2 sm:mt-3 block text-center py-2 bg-red-50 text-red-600 rounded-lg text-xs sm:text-sm font-medium hover:bg-red-100 transition-all"
//             >
//               View All Expenses ({stats.expense.count || 0} transactions) →
//             </Link>
//           </div>
//         </div>

//         {/* Quick Stats - Mobile Optimized */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
//           <StatCard
//             title="Auto Income"
//             value={`+ ₹${safeToLocale(stats.income.autoIncome)}`}
//             icon={<ShoppingBag className="text-purple-600" size={20} />}
//             bgColor="bg-purple-50"
//             borderColor="border-purple-200"
//             linkTo={`${basePath}/banking/income`}
//             linkText="View all"
//             subtext={`${stats.income.autoCount || 0} payments`}
//             compact={true}
//           />
//           <StatCard
//             title="Total Expense"
//             value={`- ₹${safeToLocale(stats.expense.total)}`}
//             icon={<ArrowDownCircle className="text-red-600" size={20} />}
//             bgColor="bg-red-50"
//             borderColor="border-red-200"
//             linkTo={`${basePath}/banking/expense`}
//             linkText="View all"
//             subtext={`${stats.expense.count || 0} transactions`}
//             compact={true}
//           />
//           <StatCard
//             title="Net Amount"
//             value={`₹${safeToLocale(stats.netAmount)}`}
//             icon={<DollarSign className="text-green-600" size={20} />}
//             bgColor="bg-green-50"
//             borderColor="border-green-200"
//             subtext={`${(stats.income.autoCount || 0) + (stats.expense.count || 0)} total`}
//             compact={true}
//           />
//         </div>

//         {/* Recent Transactions - Mobile Optimized */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
//           {/* Recent Auto Income */}
//           <div className="bg-white rounded-lg sm:rounded-xl shadow-sm overflow-hidden">
//             <div className="p-3 sm:p-4 lg:p-6 border-b border-slate-100 flex items-center justify-between">
//               <div className="flex items-center gap-1 sm:gap-2">
//                 <ShoppingBag size={16} className="sm:w-5 sm:h-5 text-purple-600" />
//                 <h3 className="font-bold text-slate-800 text-sm sm:text-base">Recent Order Payments</h3>
//               </div>
//               <Link 
//                 to={`${basePath}/orders?payment=recent`}
//                 className="text-purple-600 hover:text-purple-700 text-xs sm:text-sm font-medium flex items-center gap-1"
//               >
//                 View all <ArrowRight size={12} className="sm:w-4 sm:h-4" />
//               </Link>
//             </div>
//             <div className="divide-y divide-slate-100">
//               {recentAutoIncome.length > 0 ? (
//                 recentAutoIncome.map((transaction) => (
//                   <div key={transaction._id} className="p-3 sm:p-4 hover:bg-slate-50 transition-all">
//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
//                         <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
//                           <TrendingUp size={14} className="sm:w-5 sm:h-5 text-purple-600" />
//                         </div>
//                         <div className="min-w-0 flex-1">
//                           <p className="font-medium text-slate-800 text-xs sm:text-sm truncate">
//                             {transaction.customerDetails?.name || 'Customer'}
//                           </p>
//                           <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-[10px] sm:text-xs">
//                             <span className="text-purple-600 font-medium truncate max-w-[100px] sm:max-w-[150px]">
//                               {getCategoryLabel(transaction.category, transaction.customCategory, 'income')}
//                             </span>
//                             <span className="text-slate-300 hidden xs:inline">•</span>
//                             <span className="text-slate-500">{formatDate(transaction.transactionDate)}</span>
//                           </div>
//                           {transaction.order && (
//                             <p className="text-[8px] sm:text-xs text-slate-400 mt-0.5 truncate">
//                               Order: {transaction.order.orderId?.slice(-8) || 'N/A'}
//                             </p>
//                           )}
//                         </div>
//                       </div>
//                       <div className="text-right ml-2 flex-shrink-0">
//                         <p className="text-sm sm:text-base font-bold text-purple-600">
//                           + ₹{safeToLocale(transaction.amount)}
//                         </p>
//                         <span className={`text-[8px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap ${
//                           transaction.accountType === 'hand-cash' 
//                             ? 'bg-orange-100 text-orange-600'
//                             : 'bg-blue-100 text-blue-600'
//                         }`}>
//                           {transaction.accountType === 'hand-cash' ? 'Cash' : 'Bank'}
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 ))
//               ) : (
//                 <div className="p-6 sm:p-8 text-center">
//                   <ShoppingBag size={24} className="sm:w-8 sm:h-8 text-slate-300 mx-auto mb-2" />
//                   <p className="text-xs sm:text-sm text-slate-500">No order payments</p>
//                   <Link
//                     to={`${basePath}/orders`}
//                     className="text-purple-600 text-[10px] sm:text-xs hover:text-purple-700 mt-2 inline-block"
//                   >
//                     Create Order →
//                   </Link>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Recent Expense */}
//           <div className="bg-white rounded-lg sm:rounded-xl shadow-sm overflow-hidden">
//             <div className="p-3 sm:p-4 lg:p-6 border-b border-slate-100 flex items-center justify-between">
//               <div className="flex items-center gap-1 sm:gap-2">
//                 <ArrowDownCircle size={16} className="sm:w-5 sm:h-5 text-red-600" />
//                 <h3 className="font-bold text-slate-800 text-sm sm:text-base">Recent Expense</h3>
//               </div>
//               <Link 
//                 to={`${basePath}/banking/expense`}
//                 className="text-red-600 hover:text-red-700 text-xs sm:text-sm font-medium flex items-center gap-1"
//               >
//                 View all ({stats.expense.count || 0}) <ArrowRight size={12} className="sm:w-4 sm:h-4" />
//               </Link>
//             </div>
//             <div className="divide-y divide-slate-100">
//               {recentExpense.length > 0 ? (
//                 recentExpense.map((transaction) => (
//                   <div key={transaction._id} className="p-3 sm:p-4 hover:bg-slate-50 transition-all">
//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
//                         <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
//                           <TrendingDown size={14} className="sm:w-5 sm:h-5 text-red-600" />
//                         </div>
//                         <div className="min-w-0 flex-1">
//                           <p className="font-medium text-slate-800 text-xs sm:text-sm truncate">
//                             {getCategoryLabel(transaction.category, transaction.customCategory, 'expense')}
//                           </p>
//                           <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-slate-500">
//                             <span>{formatDate(transaction.transactionDate)}</span>
//                             <span className="text-slate-300 hidden xs:inline">•</span>
//                             <span className="hidden xs:inline">{formatTime(transaction.transactionDate)}</span>
//                           </div>
//                         </div>
//                       </div>
//                       <div className="text-right ml-2 flex-shrink-0">
//                         <p className="text-sm sm:text-base font-bold text-red-600">
//                           - ₹{safeToLocale(transaction.amount)}
//                         </p>
//                         <span className={`text-[8px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap ${
//                           transaction.accountType === 'hand-cash' 
//                             ? 'bg-orange-100 text-orange-600'
//                             : 'bg-blue-100 text-blue-600'
//                         }`}>
//                           {transaction.accountType === 'hand-cash' ? 'Cash' : 'Bank'}
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 ))
//               ) : (
//                 <div className="p-6 sm:p-8 text-center">
//                   <TrendingDown size={24} className="sm:w-8 sm:h-8 text-slate-300 mx-auto mb-2" />
//                   <p className="text-xs sm:text-sm text-slate-500">No expense transactions</p>
//                   <Link
//                     to={`${basePath}/banking/expense`}
//                     className="text-red-600 text-[10px] sm:text-xs hover:text-red-700 mt-2 inline-block"
//                   >
//                     Add Expense →
//                   </Link>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Quick Actions - Mobile Optimized */}
//         <div className="mt-4 sm:mt-5 lg:mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
//           <Link
//             to={`${basePath}/orders/new`}
//             className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg sm:rounded-xl p-4 sm:p-5 text-white hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg"
//           >
//             <div className="flex items-center justify-between">
//               <div>
//                 <ShoppingBag size={24} className="sm:w-8 sm:h-8 mb-2 opacity-90" />
//                 <h3 className="text-base sm:text-lg font-bold mb-1">Create New Order</h3>
//                 <p className="text-xs sm:text-sm text-purple-100">Add advance payment</p>
//                 <p className="text-[10px] sm:text-xs text-purple-200 mt-2">
//                   Current auto: + ₹{safeToLocale(stats.income.autoIncome)}
//                 </p>
//               </div>
//               <ArrowRight size={20} className="sm:w-6 sm:h-6 opacity-75 flex-shrink-0" />
//             </div>
//           </Link>

//           <Link
//             to={`${basePath}/banking/expense`}
//             className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg sm:rounded-xl p-4 sm:p-5 text-white hover:from-red-600 hover:to-red-700 transition-all shadow-lg"
//           >
//             <div className="flex items-center justify-between">
//               <div>
//                 <TrendingDown size={24} className="sm:w-8 sm:h-8 mb-2 opacity-90" />
//                 <h3 className="text-base sm:text-lg font-bold mb-1">Add Expense</h3>
//                 <p className="text-xs sm:text-sm text-red-100">Record new expenses</p>
//                 <p className="text-[10px] sm:text-xs text-red-200 mt-2">
//                   Total: - ₹{safeToLocale(stats.expense.total)}
//                 </p>
//               </div>
//               <ArrowRight size={20} className="sm:w-6 sm:h-6 opacity-75 flex-shrink-0" />
//             </div>
//           </Link>
//         </div>

//         {/* Info Note - Mobile Optimized */}
//         <div className="mt-4 sm:mt-5 lg:mt-6 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
//           <p className="text-xs sm:text-sm text-blue-700 flex items-start gap-2">
//             <Clock size={14} className="sm:w-4 sm:h-4 mt-0.5 flex-shrink-0" />
//             <span>Income is automatically added when you create orders with advance payment or add payments to existing orders. No manual income entry needed!</span>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }






// Pages/banking/BankingOverview.jsx - FULLY RESPONSIVE WITH EXPORT
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  Wallet,
  Landmark,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  ArrowRight,
  Download,
  ArrowUpCircle,
  ArrowDownCircle,
  DollarSign,
  ShoppingBag,
  Users,
  Clock,
  Menu,
  X,
  Home,
  Package,
  LayoutGrid,
  Filter,
  Calendar
} from 'lucide-react';
import { 
  fetchAllTransactions,
  fetchTransactionSummary,
  selectAllTransactions,
  selectTransactionSummary,
  selectTransactionLoading
} from '../../features/transaction/transactionSlice';
import StatCard from '../../components/common/StatCard';
import ExportTransactions from '../../components/Banking/ExportTransactions';
import showToast from '../../utils/toast';

// 🚀 OPTIMIZED: Skeleton Loader Component
const SkeletonCard = () => (
  <div className="bg-white rounded-xl p-4 animate-pulse">
    <div className="flex items-center justify-between mb-3">
      <div className="h-4 bg-slate-200 rounded w-24"></div>
      <div className="w-10 h-10 bg-slate-200 rounded-lg"></div>
    </div>
    <div className="h-8 bg-slate-200 rounded w-32 mb-2"></div>
    <div className="h-3 bg-slate-200 rounded w-20"></div>
  </div>
);

const SkeletonTableRow = () => (
  <div className="p-4 border-b border-slate-100 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-slate-200 rounded-lg"></div>
        <div className="space-y-2">
          <div className="h-4 bg-slate-200 rounded w-32"></div>
          <div className="h-3 bg-slate-200 rounded w-24"></div>
        </div>
      </div>
      <div className="h-5 bg-slate-200 rounded w-20"></div>
    </div>
  </div>
);

export default function BankingOverview() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const summary = useSelector(selectTransactionSummary);
  const loading = useSelector(selectTransactionLoading);
  const allTransactions = useSelector(selectAllTransactions);
  const { user } = useSelector((state) => state.auth);
  
  // Mobile state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [recentAutoIncome, setRecentAutoIncome] = useState([]);
  const [recentExpense, setRecentExpense] = useState([]);
  
  // Get base path based on user role
  const isAdmin = user?.role === "ADMIN";
  const isStoreKeeper = user?.role === "STORE_KEEPER";
  
  const basePath = useMemo(() => {
    if (isAdmin) return "/admin";
    if (isStoreKeeper) return "/storekeeper";
    return "/cuttingmaster";
  }, [isAdmin, isStoreKeeper]);

  const [period, setPeriod] = useState('month');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // 🚀 OPTIMIZATION 1: Memoized date range function
  const getDateRangeForPeriod = useCallback(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch(period) {
      case 'today':
        return {
          start: today,
          end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
        };
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        return {
          start: weekStart,
          end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
        };
      case 'month':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        return {
          start: monthStart,
          end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
        };
      case 'year':
        const yearStart = new Date(today.getFullYear(), 0, 1);
        return {
          start: yearStart,
          end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
        };
      case 'all':
      default:
        return {
          start: new Date(0),
          end: new Date(8640000000000000)
        };
    }
  }, [period]);

  // 🚀 OPTIMIZATION 2: Memoized transaction filtering by period
  const isTransactionInPeriod = useCallback((transactionDate) => {
    if (period === 'all') return true;
    const { start, end } = getDateRangeForPeriod();
    const transDate = new Date(transactionDate);
    return transDate >= start && transDate <= end;
  }, [period, getDateRangeForPeriod]);

  // 🚀 OPTIMIZATION 3: Memoized computed stats - NO useEffect needed!
  const computedStats = useMemo(() => {
    if (!allTransactions || allTransactions.length === 0) {
      return {
        income: {
          handCash: 0,
          bank: 0,
          total: 0,
          count: 0,
          autoIncome: 0,
          autoCount: 0,
          autoHandCash: 0,
          autoBank: 0
        },
        expense: {
          handCash: 0,
          bank: 0,
          total: 0,
          count: 0
        },
        netAmount: 0
      };
    }

    const periodTransactions = allTransactions.filter(t => 
      isTransactionInPeriod(t.transactionDate)
    );

    // Separate AUTO income (with order) and other income
    const autoIncomeTransactions = periodTransactions.filter(t => 
      t.type === 'income' && t.order
    );
    
    const expenseTransactions = periodTransactions.filter(t => t.type === 'expense');

    // Auto income calculations
    const autoHandCash = autoIncomeTransactions
      .filter(t => t.accountType === 'hand-cash')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    const autoBank = autoIncomeTransactions
      .filter(t => t.accountType === 'bank')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    const autoTotal = autoHandCash + autoBank;
    const autoCount = autoIncomeTransactions.length;

    // Total income (including auto)
    const totalHandCashIncome = periodTransactions
      .filter(t => t.type === 'income' && t.accountType === 'hand-cash')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    const totalBankIncome = periodTransactions
      .filter(t => t.type === 'income' && t.accountType === 'bank')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    const totalIncomeCount = periodTransactions.filter(t => t.type === 'income').length;

    // Expense calculations
    const handCashExpense = expenseTransactions
      .filter(t => t.accountType === 'hand-cash')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    const bankExpense = expenseTransactions
      .filter(t => t.accountType === 'bank')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    const expenseCount = expenseTransactions.length;

    const totalIncome = totalHandCashIncome + totalBankIncome;
    const totalExpense = handCashExpense + bankExpense;

    return {
      income: {
        handCash: totalHandCashIncome,
        bank: totalBankIncome,
        total: totalIncome,
        count: totalIncomeCount,
        autoIncome: autoTotal,
        autoCount: autoCount,
        autoHandCash: autoHandCash,
        autoBank: autoBank
      },
      expense: {
        handCash: handCashExpense,
        bank: bankExpense,
        total: totalExpense,
        count: expenseCount
      },
      netAmount: totalIncome - totalExpense
    };
  }, [allTransactions, period, isTransactionInPeriod]);

  // 🚀 OPTIMIZATION 4: Memoized recent transactions
  const computedRecentTransactions = useMemo(() => {
    if (!allTransactions || allTransactions.length === 0) {
      return { recentAutoIncome: [], recentExpense: [] };
    }

    const filtered = allTransactions.filter(t => 
      isTransactionInPeriod(t.transactionDate)
    );

    const sortedTransactions = [...filtered].sort(
      (a, b) => new Date(b.transactionDate) - new Date(a.transactionDate)
    );

    return {
      recentAutoIncome: sortedTransactions
        .filter(t => t.type === 'income' && t.order)
        .slice(0, 5),
      recentExpense: sortedTransactions
        .filter(t => t.type === 'expense')
        .slice(0, 5)
    };
  }, [allTransactions, period, isTransactionInPeriod]);

  // Update filtered transactions and recent lists when computed data changes
  useEffect(() => {
    if (allTransactions.length > 0) {
      const filtered = allTransactions.filter(t => 
        isTransactionInPeriod(t.transactionDate)
      );
      setFilteredTransactions(filtered);
      setRecentAutoIncome(computedRecentTransactions.recentAutoIncome);
      setRecentExpense(computedRecentTransactions.recentExpense);
    } else {
      setFilteredTransactions([]);
      setRecentAutoIncome([]);
      setRecentExpense([]);
    }
  }, [allTransactions, period, isTransactionInPeriod, computedRecentTransactions]);

  // 🚀 OPTIMIZATION 5: Parallel API fetching - NO sequential waiting!
  const loadData = useCallback(async (showToastMessage = false) => {
    setIsLoading(true);
    try {
      // 🔥 PARALLEL: Both API calls run simultaneously
      await Promise.all([
        dispatch(fetchAllTransactions({ limit: 500 })),
        dispatch(fetchTransactionSummary(period))
      ]);
      
      if (!isInitialLoad && showToastMessage) {
        showToast.success('Data refreshed successfully');
      }
      
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      if (!isInitialLoad && showToastMessage) {
        showToast.error('Failed to load data');
      }
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, period, isInitialLoad]);

  // Load data when period changes
  useEffect(() => {
    loadData(false);
  }, [period, loadData]);

  const handleRefresh = useCallback(() => {
    loadData(true);
  }, [loadData]);

  // Navigation handlers
  const handleNavigateToDashboard = useCallback(() => {
    navigate(`${basePath}/dashboard`);
    setMobileMenuOpen(false);
  }, [navigate, basePath]);

  const handleNavigateToBanking = useCallback(() => {
    navigate(`${basePath}/banking/overview`);
    setMobileMenuOpen(false);
  }, [navigate, basePath]);

  const handleNavigateToOrders = useCallback(() => {
    navigate(`${basePath}/orders`);
    setMobileMenuOpen(false);
  }, [navigate, basePath]);

  const handleNavigateToWorks = useCallback(() => {
    navigate(`${basePath}/tasks`);
    setMobileMenuOpen(false);
  }, [navigate, basePath]);

  const handleNavigateToCustomers = useCallback(() => {
    navigate(`${basePath}/customers`);
    setMobileMenuOpen(false);
  }, [navigate, basePath]);

  // Formatting functions
  const formatDate = useCallback((date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }, []);

  const formatTime = useCallback((date) => {
    return new Date(date).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }, []);

  const getCategoryLabel = useCallback((category, customCategory, type) => {
    const incomeCategories = {
      'customer-advance': 'Advance Payment',
      'full-payment': 'Full Payment',
      'fabric-sale': 'Fabric Sale',
      'project-payment': 'Project Payment',
      'other-income': customCategory || 'Other Income'
    };
    
    const expenseCategories = {
      'salary': 'Employee Salary',
      'electricity': 'Electricity Bill',
      'travel': 'Travel',
      'material-purchase': 'Material Purchase',
      'rent': 'Rent',
      'maintenance': 'Maintenance',
      'other-expense': customCategory || 'Other Expense'
    };

    if (type === 'income') {
      return incomeCategories[category] || category;
    } else {
      return expenseCategories[category] || category;
    }
  }, []);

  const safeToLocale = useCallback((value) => {
    return (value || 0).toLocaleString('en-IN');
  }, []);

  // Check if this is initial load
  const isInitialLoading = isLoading && isInitialLoad;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ===== MOBILE HEADER ===== */}
      <div className="lg:hidden bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Landmark size={20} className="text-blue-600" />
            <h1 className="text-lg font-black text-slate-800">Banking</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition flex items-center justify-center"
              style={{ minWidth: '36px', minHeight: '36px' }}
            >
              <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition flex items-center justify-center"
              style={{ minWidth: '36px', minHeight: '36px' }}
            >
              <Filter size={18} />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition flex items-center justify-center"
              style={{ minWidth: '36px', minHeight: '36px' }}
            >
              <Menu size={18} />
            </button>
          </div>
        </div>

        {/* Mobile Filters Panel */}
        {mobileFiltersOpen && (
          <div className="absolute top-full left-4 right-4 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 p-4 z-40">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Calendar size={16} className="text-blue-600" />
                Select Period
              </h3>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-lg"
              >
                <X size={16} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {['today', 'week', 'month', 'year', 'all'].map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setPeriod(p);
                    setMobileFiltersOpen(false);
                  }}
                  className={`px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                    period === p
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {p === 'all' ? 'All Time' : p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-lg p-4 z-40 max-h-[80vh] overflow-y-auto">
            <div className="space-y-2">
              <button
                onClick={handleNavigateToDashboard}
                className="w-full text-left px-4 py-3 hover:bg-slate-100 rounded-xl font-medium flex items-center gap-3"
              >
                <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Home size={16} className="text-blue-600" />
                </span>
                Dashboard
              </button>
              <button
                onClick={handleNavigateToBanking}
                className="w-full text-left px-4 py-3 bg-blue-50 text-blue-600 rounded-xl font-medium flex items-center gap-3"
              >
                <span className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Landmark size={16} className="text-white" />
                </span>
                Banking
              </button>
              <button
                onClick={handleNavigateToOrders}
                className="w-full text-left px-4 py-3 hover:bg-slate-100 rounded-xl font-medium flex items-center gap-3"
              >
                <span className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <ShoppingBag size={16} className="text-green-600" />
                </span>
                Orders
              </button>
              <button
                onClick={handleNavigateToWorks}
                className="w-full text-left px-4 py-3 hover:bg-slate-100 rounded-xl font-medium flex items-center gap-3"
              >
                <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <LayoutGrid size={16} className="text-purple-600" />
                </span>
                Works
              </button>
              <button
                onClick={handleNavigateToCustomers}
                className="w-full text-left px-4 py-3 hover:bg-slate-100 rounded-xl font-medium flex items-center gap-3"
              >
                <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Users size={16} className="text-orange-600" />
                </span>
                Customers
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 🚀 OPTIMIZATION 6: Ghosting Effect during loading */}
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 transition-all duration-300 ${isLoading && !isInitialLoading ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
        
        {/* Skeleton Loader for Initial Load */}
        {isInitialLoading ? (
          <>
            <div className="hidden lg:flex items-center justify-between mb-8">
              <div className="space-y-2">
                <div className="h-8 bg-slate-200 rounded w-48"></div>
                <div className="h-4 bg-slate-200 rounded w-64"></div>
              </div>
              <div className="h-10 bg-slate-200 rounded-lg w-32"></div>
            </div>
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-6 mb-8">
              <div className="h-6 bg-purple-400/50 rounded w-32 mb-3"></div>
              <div className="h-10 bg-white/20 rounded w-40 mb-2"></div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="h-16 bg-white/10 rounded-lg"></div>
                <div className="h-16 bg-white/10 rounded-lg"></div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <SkeletonCard />
              <SkeletonCard />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-4">
                <div className="h-6 bg-slate-200 rounded w-32 mb-4"></div>
                {[...Array(3)].map((_, i) => <SkeletonTableRow key={i} />)}
              </div>
              <div className="bg-white rounded-xl p-4">
                <div className="h-6 bg-slate-200 rounded w-32 mb-4"></div>
                {[...Array(3)].map((_, i) => <SkeletonTableRow key={i} />)}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Desktop Header */}
            <div className="hidden lg:flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-black text-slate-800 mb-2 flex items-center gap-3">
                  <Landmark size={32} className="text-blue-600" />
                  Banking Overview
                </h1>
                <p className="text-slate-600">Track auto income from orders and expenses</p>
                <p className="text-xs text-slate-400 mt-1">
                  Last updated: {new Date().toLocaleTimeString()} • Showing: {
                    period === 'today' ? 'Today' :
                    period === 'week' ? 'This Week' :
                    period === 'month' ? 'This Month' :
                    period === 'year' ? 'This Year' : 'All Time'
                  }
                </p>
              </div>
              <div className="flex gap-3">
                <ExportTransactions 
                  transactions={filteredTransactions}
                  period={period}
                />
                <button
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all"
                  title="Refresh"
                >
                  <RefreshCw size={20} className={isLoading ? 'animate-spin text-blue-600' : 'text-slate-600'} />
                </button>
              </div>
            </div>

            {/* Period Selector - Desktop */}
            <div className="hidden lg:flex gap-2 mt-4 mb-6">
              {['today', 'week', 'month', 'year', 'all'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    period === p
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {p === 'all' ? 'All Time' : p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>

            {/* Mobile Period Indicator */}
            <div className="lg:hidden mb-4">
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">Period:</span>
                  </div>
                  <span className="text-sm font-bold text-blue-800">
                    {period === 'today' ? 'Today' :
                     period === 'week' ? 'This Week' :
                     period === 'month' ? 'This Month' :
                     period === 'year' ? 'This Year' : 'All Time'}
                  </span>
                </div>
              </div>
            </div>

            {/* Auto Income Summary Card - Using computedStats */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 lg:mb-8 text-white shadow-xl">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div>
                  <h2 className="text-sm sm:text-base font-medium opacity-90 flex items-center gap-2">
                    <ShoppingBag size={16} className="sm:w-5 sm:h-5" />
                    Auto Income from Orders
                  </h2>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-black mb-1 sm:mb-2">
                    ₹{safeToLocale(computedStats.income.autoIncome)}
                  </p>
                  <p className="text-xs sm:text-sm opacity-75">
                    {computedStats.income.autoCount || 0} order payments
                  </p>
                </div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center">
                  <TrendingUp size={20} className="sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <div className="bg-orange-500/20 rounded-lg p-2 sm:p-3">
                  <p className="text-[10px] sm:text-xs opacity-75 flex items-center gap-1">
                    <Wallet size={10} className="sm:w-3 sm:h-3" /> Hand Cash
                  </p>
                  <p className="text-sm sm:text-base lg:text-xl font-bold">+ ₹{safeToLocale(computedStats.income.autoHandCash)}</p>
                </div>
                <div className="bg-blue-500/20 rounded-lg p-2 sm:p-3">
                  <p className="text-[10px] sm:text-xs opacity-75 flex items-center gap-1">
                    <Landmark size={10} className="sm:w-3 sm:h-3" /> Bank
                  </p>
                  <p className="text-sm sm:text-base lg:text-xl font-bold">+ ₹{safeToLocale(computedStats.income.autoBank)}</p>
                </div>
              </div>
            </div>

            {/* Income and Expense Summary Cards - Using computedStats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
              {/* Auto Income Card */}
              <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 shadow-sm border-l-4 border-purple-500 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div>
                    <h3 className="text-xs sm:text-sm font-medium text-slate-500">Auto Income (from Orders)</h3>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-black text-purple-600">
                      + ₹{safeToLocale(computedStats.income.autoIncome)}
                    </p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-purple-100 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <ShoppingBag size={18} className="sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-purple-600" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4 mb-3 sm:mb-4">
                  <div className="bg-orange-50 p-2 sm:p-3 rounded-lg">
                    <p className="text-[10px] sm:text-xs text-orange-600 font-medium flex items-center gap-1">
                      <Wallet size={10} className="sm:w-3 sm:h-3" /> Hand Cash
                    </p>
                    <p className="text-sm sm:text-base font-bold text-orange-700">
                      + ₹{safeToLocale(computedStats.income.autoHandCash)}
                    </p>
                  </div>
                  <div className="bg-blue-50 p-2 sm:p-3 rounded-lg">
                    <p className="text-[10px] sm:text-xs text-blue-600 font-medium flex items-center gap-1">
                      <Landmark size={10} className="sm:w-3 sm:h-3" /> Bank
                    </p>
                    <p className="text-sm sm:text-base font-bold text-blue-700">
                      + ₹{safeToLocale(computedStats.income.autoBank)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    to={`${basePath}/orders?payment=advance`}
                    className="flex-1 text-center py-2 sm:py-2.5 bg-purple-50 text-purple-600 rounded-lg text-xs sm:text-sm font-medium hover:bg-purple-100 transition-all flex items-center justify-center gap-1 sm:gap-2"
                  >
                    <ShoppingBag size={12} className="sm:w-4 sm:h-4" />
                    <span className="hidden xs:inline">View Orders</span>
                    <span className="xs:hidden">Orders</span>
                    <ArrowRight size={12} className="sm:w-4 sm:h-4" />
                  </Link>
                </div>
                <Link
                  to={`${basePath}/banking/income`}
                  className="mt-2 sm:mt-3 block text-center py-2 bg-purple-50 text-purple-600 rounded-lg text-xs sm:text-sm font-medium hover:bg-purple-100 transition-all"
                >
                  View All Auto Income ({computedStats.income.autoCount || 0} payments) →
                </Link>
              </div>

              {/* Expense Summary Card */}
              <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 shadow-sm border-l-4 border-red-500 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div>
                    <h3 className="text-xs sm:text-sm font-medium text-slate-500">Total Expense</h3>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-black text-red-600">
                      - ₹{safeToLocale(computedStats.expense.total)}
                    </p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-red-100 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <TrendingDown size={18} className="sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-red-600" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4 mb-3 sm:mb-4">
                  <div className="bg-orange-50 p-2 sm:p-3 rounded-lg">
                    <p className="text-[10px] sm:text-xs text-orange-600 font-medium flex items-center gap-1">
                      <Wallet size={10} className="sm:w-3 sm:h-3" /> Hand Cash
                    </p>
                    <p className="text-sm sm:text-base font-bold text-orange-700">
                      - ₹{safeToLocale(computedStats.expense.handCash)}
                    </p>
                  </div>
                  <div className="bg-blue-50 p-2 sm:p-3 rounded-lg">
                    <p className="text-[10px] sm:text-xs text-blue-600 font-medium flex items-center gap-1">
                      <Landmark size={10} className="sm:w-3 sm:h-3" /> Bank
                    </p>
                    <p className="text-sm sm:text-base font-bold text-blue-700">
                      - ₹{safeToLocale(computedStats.expense.bank)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    to={`${basePath}/banking/expense?account=hand-cash`}
                    className="flex-1 text-center py-2 sm:py-2.5 bg-orange-50 text-orange-600 rounded-lg text-xs sm:text-sm font-medium hover:bg-orange-100 transition-all flex items-center justify-center gap-1 sm:gap-2"
                  >
                    <Wallet size={12} className="sm:w-4 sm:h-4" />
                    <span className="hidden xs:inline">Hand Cash</span>
                    <span className="xs:hidden">Cash</span>
                    <ArrowRight size={12} className="sm:w-4 sm:h-4" />
                  </Link>
                  <Link
                    to={`${basePath}/banking/expense?account=bank`}
                    className="flex-1 text-center py-2 sm:py-2.5 bg-blue-50 text-blue-600 rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-100 transition-all flex items-center justify-center gap-1 sm:gap-2"
                  >
                    <Landmark size={12} className="sm:w-4 sm:h-4" />
                    Bank
                    <ArrowRight size={12} className="sm:w-4 sm:h-4" />
                  </Link>
                </div>
                <Link
                  to={`${basePath}/banking/expense`}
                  className="mt-2 sm:mt-3 block text-center py-2 bg-red-50 text-red-600 rounded-lg text-xs sm:text-sm font-medium hover:bg-red-100 transition-all"
                >
                  View All Expenses ({computedStats.expense.count || 0} transactions) →
                </Link>
              </div>
            </div>

            {/* Quick Stats - Using computedStats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
              <StatCard
                title="Auto Income"
                value={`+ ₹${safeToLocale(computedStats.income.autoIncome)}`}
                icon={<ShoppingBag className="text-purple-600" size={20} />}
                bgColor="bg-purple-50"
                borderColor="border-purple-200"
                linkTo={`${basePath}/banking/income`}
                linkText="View all"
                subtext={`${computedStats.income.autoCount || 0} payments`}
                compact={true}
              />
              <StatCard
                title="Total Expense"
                value={`- ₹${safeToLocale(computedStats.expense.total)}`}
                icon={<ArrowDownCircle className="text-red-600" size={20} />}
                bgColor="bg-red-50"
                borderColor="border-red-200"
                linkTo={`${basePath}/banking/expense`}
                linkText="View all"
                subtext={`${computedStats.expense.count || 0} transactions`}
                compact={true}
              />
              <StatCard
                title="Net Amount"
                value={`₹${safeToLocale(computedStats.netAmount)}`}
                icon={<DollarSign className="text-green-600" size={20} />}
                bgColor="bg-green-50"
                borderColor="border-green-200"
                subtext={`${(computedStats.income.autoCount || 0) + (computedStats.expense.count || 0)} total`}
                compact={true}
              />
            </div>

            {/* Recent Transactions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
              {/* Recent Auto Income */}
              <div className="bg-white rounded-lg sm:rounded-xl shadow-sm overflow-hidden">
                <div className="p-3 sm:p-4 lg:p-6 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <ShoppingBag size={16} className="sm:w-5 sm:h-5 text-purple-600" />
                    <h3 className="font-bold text-slate-800 text-sm sm:text-base">Recent Order Payments</h3>
                  </div>
                  <Link 
                    to={`${basePath}/orders?payment=recent`}
                    className="text-purple-600 hover:text-purple-700 text-xs sm:text-sm font-medium flex items-center gap-1"
                  >
                    View all <ArrowRight size={12} className="sm:w-4 sm:h-4" />
                  </Link>
                </div>
                <div className="divide-y divide-slate-100">
                  {recentAutoIncome.length > 0 ? (
                    recentAutoIncome.map((transaction) => (
                      <div key={transaction._id} className="p-3 sm:p-4 hover:bg-slate-50 transition-all">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                              <TrendingUp size={14} className="sm:w-5 sm:h-5 text-purple-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-slate-800 text-xs sm:text-sm truncate">
                                {transaction.customerDetails?.name || 'Customer'}
                              </p>
                              <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-[10px] sm:text-xs">
                                <span className="text-purple-600 font-medium truncate max-w-[100px] sm:max-w-[150px]">
                                  {getCategoryLabel(transaction.category, transaction.customCategory, 'income')}
                                </span>
                                <span className="text-slate-300 hidden xs:inline">•</span>
                                <span className="text-slate-500">{formatDate(transaction.transactionDate)}</span>
                              </div>
                              {transaction.order && (
                                <p className="text-[8px] sm:text-xs text-slate-400 mt-0.5 truncate">
                                  Order: {transaction.order.orderId?.slice(-8) || 'N/A'}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right ml-2 flex-shrink-0">
                            <p className="text-sm sm:text-base font-bold text-purple-600">
                              + ₹{safeToLocale(transaction.amount)}
                            </p>
                            <span className={`text-[8px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap ${
                              transaction.accountType === 'hand-cash' 
                                ? 'bg-orange-100 text-orange-600'
                                : 'bg-blue-100 text-blue-600'
                            }`}>
                              {transaction.accountType === 'hand-cash' ? 'Cash' : 'Bank'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 sm:p-8 text-center">
                      <ShoppingBag size={24} className="sm:w-8 sm:h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs sm:text-sm text-slate-500">No order payments</p>
                      <Link
                        to={`${basePath}/orders`}
                        className="text-purple-600 text-[10px] sm:text-xs hover:text-purple-700 mt-2 inline-block"
                      >
                        Create Order →
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Expense */}
              <div className="bg-white rounded-lg sm:rounded-xl shadow-sm overflow-hidden">
                <div className="p-3 sm:p-4 lg:p-6 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <ArrowDownCircle size={16} className="sm:w-5 sm:h-5 text-red-600" />
                    <h3 className="font-bold text-slate-800 text-sm sm:text-base">Recent Expense</h3>
                  </div>
                  <Link 
                    to={`${basePath}/banking/expense`}
                    className="text-red-600 hover:text-red-700 text-xs sm:text-sm font-medium flex items-center gap-1"
                  >
                    View all ({computedStats.expense.count || 0}) <ArrowRight size={12} className="sm:w-4 sm:h-4" />
                  </Link>
                </div>
                <div className="divide-y divide-slate-100">
                  {recentExpense.length > 0 ? (
                    recentExpense.map((transaction) => (
                      <div key={transaction._id} className="p-3 sm:p-4 hover:bg-slate-50 transition-all">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                              <TrendingDown size={14} className="sm:w-5 sm:h-5 text-red-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-slate-800 text-xs sm:text-sm truncate">
                                {getCategoryLabel(transaction.category, transaction.customCategory, 'expense')}
                              </p>
                              <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-slate-500">
                                <span>{formatDate(transaction.transactionDate)}</span>
                                <span className="text-slate-300 hidden xs:inline">•</span>
                                <span className="hidden xs:inline">{formatTime(transaction.transactionDate)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right ml-2 flex-shrink-0">
                            <p className="text-sm sm:text-base font-bold text-red-600">
                              - ₹{safeToLocale(transaction.amount)}
                            </p>
                            <span className={`text-[8px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap ${
                              transaction.accountType === 'hand-cash' 
                                ? 'bg-orange-100 text-orange-600'
                                : 'bg-blue-100 text-blue-600'
                            }`}>
                              {transaction.accountType === 'hand-cash' ? 'Cash' : 'Bank'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 sm:p-8 text-center">
                      <TrendingDown size={24} className="sm:w-8 sm:h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs sm:text-sm text-slate-500">No expense transactions</p>
                      <Link
                        to={`${basePath}/banking/expense`}
                        className="text-red-600 text-[10px] sm:text-xs hover:text-red-700 mt-2 inline-block"
                      >
                        Add Expense →
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-4 sm:mt-5 lg:mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Link
                to={`${basePath}/orders/new`}
                className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg sm:rounded-xl p-4 sm:p-5 text-white hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <ShoppingBag size={24} className="sm:w-8 sm:h-8 mb-2 opacity-90" />
                    <h3 className="text-base sm:text-lg font-bold mb-1">Create New Order</h3>
                    <p className="text-xs sm:text-sm text-purple-100">Add advance payment</p>
                    <p className="text-[10px] sm:text-xs text-purple-200 mt-2">
                      Current auto: + ₹{safeToLocale(computedStats.income.autoIncome)}
                    </p>
                  </div>
                  <ArrowRight size={20} className="sm:w-6 sm:h-6 opacity-75 flex-shrink-0" />
                </div>
              </Link>

              <Link
                to={`${basePath}/banking/expense`}
                className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg sm:rounded-xl p-4 sm:p-5 text-white hover:from-red-600 hover:to-red-700 transition-all shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <TrendingDown size={24} className="sm:w-8 sm:h-8 mb-2 opacity-90" />
                    <h3 className="text-base sm:text-lg font-bold mb-1">Add Expense</h3>
                    <p className="text-xs sm:text-sm text-red-100">Record new expenses</p>
                    <p className="text-[10px] sm:text-xs text-red-200 mt-2">
                      Total: - ₹{safeToLocale(computedStats.expense.total)}
                    </p>
                  </div>
                  <ArrowRight size={20} className="sm:w-6 sm:h-6 opacity-75 flex-shrink-0" />
                </div>
              </Link>
            </div>

            {/* Info Note */}
            <div className="mt-4 sm:mt-5 lg:mt-6 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs sm:text-sm text-blue-700 flex items-start gap-2">
                <Clock size={14} className="sm:w-4 sm:h-4 mt-0.5 flex-shrink-0" />
                <span>Income is automatically added when you create orders with advance payment or add payments to existing orders. No manual income entry needed!</span>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}