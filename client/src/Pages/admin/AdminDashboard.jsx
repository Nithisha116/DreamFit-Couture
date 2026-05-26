// Pages/Dashboard/AdminDashboard.jsx - Role-Based Dashboard for Admin & Store Keeper
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  ShoppingBag,
  Clock,
  CheckCircle,
  IndianRupee,
  Layers,
  Search,
  Calendar,
  ChevronDown,
  Filter,
  X,
  AlertCircle,
  Truck,
  Landmark,
  Scissors,
  TrendingUp,
  ArrowRight,
  RefreshCw,
  Eye,
  Package,
  UserCheck,
  UserX,
  Award,
  Users,
  XCircle,
  Loader,
  Plus,
  UserPlus,
  Receipt,
  DollarSign,
  HardHat,
  Store,
  Briefcase,
  Shield,
  Wallet,
  TrendingDown,
  Flag,
  Target,
  ChevronRight,
  Zap,
  BarChart3,
  PieChart,
  Activity,
  Grid,
  List,
  ChevronsRight,
  User as UserIcon,
  Bell,
  UserCheck as UserCheckIcon,
  Menu,
  ChevronLeft
} from 'lucide-react';
import {
  PieChart as RePieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar
} from 'recharts';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

// IMPORT from orderSlice
import { 
  fetchOrderStats, 
  fetchRecentOrders,
  selectOrderStats,
  selectRecentOrders 
} from '../../features/order/orderSlice';

// IMPORT from workSlice
import {
  fetchWorkStats,
  fetchRecentWorks,
  selectWorkStats,
  selectRecentWorks
} from '../../features/work/workSlice';

// IMPORT from tailorSlice
import {
  fetchTailorStats,
  fetchTailorPerformance,
  fetchTopTailors,
  selectTailorStats,
  selectTailorPerformance,
  selectTailorPerformanceSummary,
  selectTailorPerformanceLoading,
  selectTopTailors,
  selectTopTailorsLoading
} from '../../features/tailor/tailorSlice';

// IMPORT from transactionSlice
import {
  fetchDailyRevenueStats,
  selectDailyRevenueData,
  selectDailyRevenueSummary,
  selectDailyRevenueLoading,
  fetchTodayTransactions,
  selectTodaySummary,
  selectTodayLoading
} from '../../features/transaction/transactionSlice';

import StatCard from '../../components/common/StatCard';
import DeliveryPipelineSection from '../../components/dashboard/DeliveryPipelineSection';
import showToast from '../../utils/toast';
import { fetchAppointments } from '../../features/appointment/appointmentSlice';
import CountUp from 'react-countup';

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  // Mobile state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  
  // ===== ROLE-BASED CONFIGURATION =====
  const isAdmin = user?.role === "ADMIN";
  const isStoreKeeper = user?.role === "STORE_KEEPER";
  
  // ✅ Get base path based on user role - using useMemo for performance
  const basePath = useMemo(() => {
    if (isAdmin) return "/admin";
    if (isStoreKeeper) return "/storekeeper";
    return "/cuttingmaster";
  }, [isAdmin, isStoreKeeper]);
  
  // Dashboard title based on role
  const dashboardTitle = isAdmin ? "Admin Dashboard" : 
                        isStoreKeeper ? "Store Keeper Dashboard" : 
                        "Dashboard";
  
  // ===== DEBUG: Check user info =====
  console.log('👤 Current User:', user);
  console.log('📍 Base Path:', basePath);
  console.log('🎯 Dashboard Title:', dashboardTitle);
  
  // ===== GET ORDER DATA =====
  const orderStats = useSelector(selectOrderStats) || {
    total: 0,
    pending: 0,
    cutting: 0,
    stitching: 0,
    ready: 0,
    delivered: 0,
    cancelled: 0
  };
  
  const recentOrders = useSelector(selectRecentOrders) || [];
  
  // ===== GET WORK DATA =====
  const workStats = useSelector(selectWorkStats) || {
    total: 0,
    pending: 0,
    accepted: 0,
    cuttingStarted: 0,
    cuttingCompleted: 0,
    sewingStarted: 0,
    sewingCompleted: 0,
    ironing: 0,
    readyToDeliver: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0
  };
  
  const recentWorks = useSelector(selectRecentWorks) || [];
  
  // ===== GET TAILOR DATA =====
  const tailorStats = useSelector(selectTailorStats) || {
    total: 0,
    active: 0,
    busy: 0,
    idle: 0,
    onLeave: 0
  };
  
  // ✅ Get tailor performance data
  const tailorPerformance = useSelector(selectTailorPerformance) || [];
  const performanceSummary = useSelector(selectTailorPerformanceSummary) || {
    totalCompleted: 0,
    activeTailors: 0,
    avgPerTailor: 0
  };
  const topTailors = useSelector(selectTopTailors) || [];
  const performanceLoading = useSelector(selectTailorPerformanceLoading);
  const topTailorsLoading = useSelector(selectTopTailorsLoading);
  
  // ===== GET REVENUE DATA =====
  const dailyRevenueData = useSelector(selectDailyRevenueData) || [];
  const dailyRevenueSummary = useSelector(selectDailyRevenueSummary) || {
    totalRevenue: 0,
    totalExpense: 0,
    netProfit: 0,
    period: 'month',
    dateRange: { start: null, end: null }
  };
  const revenueLoading = useSelector(selectDailyRevenueLoading);
  
  // ===== GET APPOINTMENTS DATA =====
  const appointmentsState = useSelector((state) => state.appointment) || {};
  const appointments = appointmentsState.appointments || [];
  const appointmentsLoading = appointmentsState.isLoading || false;
  
  // ✅ Ithu thaan Graph-la peak vara vaikum
  const formattedChartData = useMemo(() => {
    // Data check
    if (!dailyRevenueData || dailyRevenueData.length === 0) return [];

    return dailyRevenueData.map(item => ({
      // Backend-la 'time' (today) illa 'day' (week/month) nu anupuvom
      name: item.time || item.day || '', 
      // 🔴 MUKKIAM: Data string-ah irunthaal Number-ah mathanum
      revenue: Number(item.revenue) || 0,
      expense: Number(item.expense) || 0
    }));
  }, [dailyRevenueData]);
  // ===== GET TODAY'S TRANSACTIONS SUMMARY =====
  const todaySummary = useSelector(selectTodaySummary) || {
    totalIncome: 0,
    totalExpense: 0,
    netAmount: 0
  };
  const todayLoading = useSelector(selectTodayLoading);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [dateRange, setDateRange] = useState('month');
  const [customStartDate, setCustomStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [customEndDate, setCustomEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [workViewMode, setWorkViewMode] = useState('grid'); // 'grid' or 'list'
  
  // ===== WORK QUEUE STATE (from Cutting Master Works) =====
  const [queueSearch, setQueueSearch] = useState("");
  const [queueStatus, setQueueStatus] = useState("all");
  const [sortBy, setSortBy] = useState("priority");
  const [selectedView, setSelectedView] = useState("all"); // all, new, need-tailor

  // ===== STATUS COLORS =====
  const STATUS_CONFIG = {
    'draft': { color: '#94a3b8', label: 'Draft', bg: 'bg-slate-100' },
    'confirmed': { color: '#f59e0b', label: 'Confirmed', bg: 'bg-amber-100' },
    'in-progress': { color: '#3b82f6', label: 'In Progress', bg: 'bg-blue-100' },
    'ready-to-delivery': { color: '#10b981', label: 'Ready', bg: 'bg-emerald-100' },
    'delivered': { color: '#6b7280', label: 'Delivered', bg: 'bg-gray-100' },
    'cancelled': { color: '#ef4444', label: 'Cancelled', bg: 'bg-red-100' }
  };

  // ===== WORK STATUS CONFIG (Matching Cutting Master Dashboard) =====
  const WORK_STATUS_CONFIG = {
    'pending': { 
      color: '#f59e0b', 
      label: '⏳ Pending', 
      bg: 'bg-yellow-100', 
      text: 'text-yellow-800',
      border: 'border-yellow-200',
      icon: '⏳'
    },
    'accepted': { 
      color: '#3b82f6', 
      label: '✅ Accepted', 
      bg: 'bg-blue-100', 
      text: 'text-blue-800',
      border: 'border-blue-200',
      icon: '✅'
    },
    'cutting-started': { 
      color: '#8b5cf6', 
      label: '✂️ Cutting Started', 
      bg: 'bg-purple-100', 
      text: 'text-purple-800',
      border: 'border-purple-200',
      icon: '✂️'
    },
    'cutting-completed': { 
      color: '#6366f1', 
      label: '✔️ Cutting Completed', 
      bg: 'bg-indigo-100', 
      text: 'text-indigo-800',
      border: 'border-indigo-200',
      icon: '✔️'
    },
    'sewing-started': { 
      color: '#ec4899', 
      label: '🧵 Sewing Started', 
      bg: 'bg-pink-100', 
      text: 'text-pink-800',
      border: 'border-pink-200',
      icon: '🧵'
    },
    'sewing-completed': { 
      color: '#14b8a6', 
      label: '🧵 Sewing Completed', 
      bg: 'bg-teal-100', 
      text: 'text-teal-800',
      border: 'border-teal-200',
      icon: '🧵'
    },
    'ironing': { 
      color: '#f97316', 
      label: '🔥 Ironing', 
      bg: 'bg-orange-100', 
      text: 'text-orange-800',
      border: 'border-orange-200',
      icon: '🔥'
    },
    'ready-to-deliver': { 
      color: '#22c55e', 
      label: '📦 Ready to Deliver', 
      bg: 'bg-green-100', 
      text: 'text-green-800',
      border: 'border-green-200',
      icon: '📦'
    }
  };

  // ===== DEBUG: Check garment data when works load =====
  useEffect(() => {
    if (recentWorks?.length > 0) {
      console.log("%c🔍 GARMENT DATA DEBUG - Admin Dashboard", "background: red; color: white; font-size: 16px");
      console.log("=".repeat(80));
      
      recentWorks.forEach((work, index) => {
        console.log(`\n📦 Work ${index + 1}: ${work.workId}`);
        console.log("  garment type:", typeof work.garment);
        console.log("  garment value:", work.garment);
        console.log("  is garment populated?", typeof work.garment === 'object' && work.garment !== null);
        
        if (typeof work.garment === 'object' && work.garment !== null) {
          console.log("  ✅ Garment is populated!");
          console.log("  garment priority:", work.garment.priority);
          console.log("  garment name:", work.garment.name);
          console.log("  garment ID:", work.garment.garmentId);
        } else if (typeof work.garment === 'string') {
          console.log("  ❌ Garment is just an ID - NOT POPULATED!");
          console.log("  garment ID (string):", work.garment);
        } else {
          console.log("  ❌ Garment is missing or null!");
        }
      });
      
      console.log("=".repeat(80));
    }
  }, [recentWorks]);

  // ============================================
  // 🎯 FIXED: PRIORITY FUNCTIONS with better error handling
  // ============================================
  
  /**
   * ✅ FIXED: Priority always comes from garment
   * Work-ல priority இல்ல - garment-ல தான் இருக்கு!
   */
  const getWorkPriority = useCallback((work) => {
    if (!work) return 'normal';
    
    // ✅ Check if garment is populated (object) or just an ID (string)
    if (work.garment && typeof work.garment === 'object') {
      // Garment is populated - we can get priority
      return work.garment.priority || 'normal';
    } else if (work.garment && typeof work.garment === 'string') {
      // Garment is just an ID - not populated!
      console.warn(`⚠️ Garment not populated for work ${work.workId}. Please fix backend population.`);
      return 'normal';
    }
    
    return 'normal';
  }, []);

  // ✅ Get priority display with emoji
  const getPriorityDisplay = useCallback((work) => {
    const priority = getWorkPriority(work);
    const displays = {
      'high': '🔴 High',
      'normal': '🟠 Normal',
      'low': '🟢 Low'
    };
    return displays[priority] || '🟠 Normal';
  }, [getWorkPriority]);

  // ✅ Get priority color for border
  const getPriorityColor = useCallback((work) => {
    const priority = getWorkPriority(work);
    const colors = {
      'high': 'border-l-4 border-l-red-500 bg-red-50',
      'normal': 'border-l-4 border-l-orange-400 bg-orange-50',
      'low': 'border-l-4 border-l-green-500 bg-green-50'
    };
    return colors[priority] || 'border-l-4 border-l-orange-400 bg-orange-50';
  }, [getWorkPriority]);

  // ✅ Get priority badge component
  const getPriorityBadge = useCallback((work) => {
    const priority = getWorkPriority(work);
    if (priority === 'high') {
      return (
        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold flex items-center gap-1">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          🔴 High Priority
        </span>
      );
    }
    if (priority === 'normal') {
      return (
        <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs flex items-center gap-1">
          <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
          🟠 Normal
        </span>
      );
    }
    return (
      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs flex items-center gap-1">
        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
        🟢 Low
      </span>
    );
  }, [getWorkPriority]);

  // ===== LOAD DATA WHEN FILTER CHANGES =====
  useEffect(() => {
    console.log('🔄 Date range changed to:', dateRange);
    loadDashboardData();
  }, [dateRange, customStartDate, customEndDate]);

//   const loadDashboardData = async () => {
//     console.log('🚀 ===== LOADING DASHBOARD DATA STARTED =====');
//     console.log('📅 Selected date range:', dateRange);
//     setIsLoading(true);
    
//     try {
//       // Get date parameters based on filter
//       const params = getDateParams();
//       console.log('📅 Date params being sent:', params);
      
//       // Build promises array - Store Keeper has limited access to some features
//       const promises = [
//         dispatch(fetchOrderStats(params)),
//         dispatch(fetchRecentOrders({ ...params, limit: 10 })),
//         dispatch(fetchWorkStats(params)),
//         dispatch(fetchRecentWorks({ ...params, limit: 20 })),
//         dispatch(fetchTailorStats()),
//         dispatch(fetchDailyRevenueStats(params)),
//         dispatch(fetchTodayTransactions())
//       ];
      
//       // // Add admin-only data fetches
//       // if (isAdmin) {
//       //   promises.push(
//       //     dispatch(fetchTailorPerformance({ period: dateRange })),
//       //     dispatch(fetchTopTailors({ limit: 10, period: dateRange }))
//       //   );
//       // }
      
// // ✅ Corrected: Fetch data if user is ADMIN OR STORE_KEEPER
// if (isAdmin || isStoreKeeper) {
//   promises.push(
//     dispatch(fetchTailorPerformance({ period: dateRange })),
//     dispatch(fetchTopTailors({ limit: 10, period: dateRange }))
//   );
// }

//       const startTime = Date.now();
//       const results = await Promise.allSettled(promises);
//       const endTime = Date.now();
      
//       console.log(`⏱️ API calls completed in ${endTime - startTime}ms`);
      
//       // Check results
//       const apiNames = isAdmin 
//         ? ['Order Stats', 'Recent Orders', 'Work Stats', 'Recent Works', 'Tailor Stats', 'Daily Revenue', 'Today Transactions', 'Tailor Performance', 'Top Tailors']
//         : ['Order Stats', 'Recent Orders', 'Work Stats', 'Recent Works', 'Tailor Stats', 'Daily Revenue', 'Today Transactions'];
      
//       results.forEach((result, index) => {
//         if (result.status === 'fulfilled') {
//           console.log(`✅ ${apiNames[index]} successful:`, result.value);
//         } else {
//           console.error(`❌ ${apiNames[index]} failed:`, result.reason);
//         }
//       });
      
//       setLastRefreshed(new Date());
      
//     } catch (error) {
//       console.error('❌ Error loading dashboard:', error);
//       showToast.error('Failed to load dashboard data');
//     } finally {
//       setIsLoading(false);
//       console.log('🏁 ===== LOADING DASHBOARD DATA COMPLETED =====');
//     }
//   };

  // const getDateParams = () => {
  //   const today = new Date();
    
  //   switch(dateRange) {
  //     case 'today':
  //       return { 
  //         period: 'today',
  //         startDate: format(today, 'yyyy-MM-dd'),
  //         endDate: format(today, 'yyyy-MM-dd')
  //       };
  //     case 'week':
  //       const weekStart = startOfWeek(today);
  //       const weekEnd = endOfWeek(today);
  //       return {
  //         period: 'week',
  //         startDate: format(weekStart, 'yyyy-MM-dd'),
  //         endDate: format(weekEnd, 'yyyy-MM-dd')
  //       };
  //     case 'month':
  //       return { 
  //         period: 'month',
  //         startDate: format(startOfMonth(today), 'yyyy-MM-dd'),
  //         endDate: format(endOfMonth(today), 'yyyy-MM-dd')
  //       };
  //     case 'custom':
  //       return {
  //         period: 'custom',
  //         startDate: customStartDate,
  //         endDate: customEndDate
  //       };
  //     default:
  //       return { period: 'month' };
  //   }
  // };

  // ===== APPLY CUSTOM DATE RANGE =====
//   const loadDashboardData = async () => {
//   console.log('🚀 ===== LOADING DASHBOARD DATA STARTED =====');
//   console.log('📅 Selected date range:', dateRange);
//   setIsLoading(true);
  
//   try {
//     // Get date parameters based on filter (for orders, works, etc.)
//     const params = getDateParams();
//     console.log('📅 Date params being sent:', params);
    
//     // ✅ FIXED: For daily revenue stats, send just the period
//     const revenueParams = {
//       period: dateRange // 'today', 'week', 'month', 'custom'
//     };
    
//     // If custom range, also send startDate and endDate
//     if (dateRange === 'custom') {
//       revenueParams.startDate = customStartDate;
//       revenueParams.endDate = customEndDate;
//     }
    
//     console.log('📊 Revenue API params:', revenueParams);
    
//     // Build promises array
//     const promises = [
//       dispatch(fetchOrderStats(params)),
//       dispatch(fetchRecentOrders({ ...params, limit: 10 })),
//       dispatch(fetchWorkStats(params)),
//       dispatch(fetchRecentWorks({ ...params, limit: 20 })),
//       dispatch(fetchTailorStats()),
//       dispatch(fetchDailyRevenueStats(revenueParams)), // ✅ FIXED: Use revenueParams
//       dispatch(fetchTodayTransactions())
//     ];
    
//     // Add admin/store keeper data
//     if (isAdmin || isStoreKeeper) {
//       promises.push(
//         dispatch(fetchTailorPerformance({ period: dateRange })),
//         dispatch(fetchTopTailors({ limit: 10, period: dateRange }))
//       );
//     }
    
//     const startTime = Date.now();
//     const results = await Promise.allSettled(promises);
//     const endTime = Date.now();
    
//     console.log(`⏱️ API calls completed in ${endTime - startTime}ms`);
    
//     // Check results
//     const apiNames = (isAdmin || isStoreKeeper) 
//       ? ['Order Stats', 'Recent Orders', 'Work Stats', 'Recent Works', 'Tailor Stats', 'Daily Revenue', 'Today Transactions', 'Tailor Performance', 'Top Tailors']
//       : ['Order Stats', 'Recent Orders', 'Work Stats', 'Recent Works', 'Tailor Stats', 'Daily Revenue', 'Today Transactions'];
    
//     results.forEach((result, index) => {
//       if (result.status === 'fulfilled') {
//         console.log(`✅ ${apiNames[index]} successful:`, result.value);
//       } else {
//         console.error(`❌ ${apiNames[index]} failed:`, result.reason);
//       }
//     });
    
//     setLastRefreshed(new Date());
    
//   } catch (error) {
//     console.error('❌ Error loading dashboard:', error);
//     showToast.error('Failed to load dashboard data');
//   } finally {
//     setIsLoading(false);
//     console.log('🏁 ===== LOADING DASHBOARD DATA COMPLETED =====');
//   }
// };
  const loadDashboardData = () => { // ✅ Remove 'async' to avoid blocking
  console.log('🚀 ===== LOADING DASHBOARD DATA STARTED (OPTIMIZED) =====');
  setIsLoading(true);
  
  try {
    const params = getDateParams();
    
    // ✅ FIX: Today date boundary issue solve panna startDate/endDate renduமே anupuvom
    const revenueParams = {
      period: dateRange,
      startDate: params.startDate, 
      endDate: params.endDate
    };

    console.log('📊 Dispatching APIs in Parallel...');

    // ✅ Parallel Dispatches: Don't 'await' them individually. 
    // This allows UI to show data as soon as each API responds.
    dispatch(fetchOrderStats(params));
    dispatch(fetchRecentOrders({ ...params, limit: 10 }));
    dispatch(fetchWorkStats(params));
    dispatch(fetchRecentWorks({ ...params, limit: 20 }));
    dispatch(fetchTailorStats());
    dispatch(fetchDailyRevenueStats(revenueParams));
    dispatch(fetchTodayTransactions());
    dispatch(fetchAppointments());
    
    if (isAdmin || isStoreKeeper) {
      dispatch(fetchTailorPerformance({ period: dateRange }));
      dispatch(fetchTopTailors({ limit: 10, period: dateRange }));
    }

    setLastRefreshed(new Date());
    
    // Fast experience-kaga loading-ah konjam seekiramae off pannidalam
    // Redux selectors will handle individual loading states for cards
    setTimeout(() => setIsLoading(false), 300);

  } catch (error) {
    console.error('❌ Error loading dashboard:', error);
    showToast.error('Failed to load dashboard data');
    setIsLoading(false);
  }
};
  const getDateParams = () => {
  // ✅ Get current date in IST
  const now = new Date();
  const istDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const todayStr = format(istDate, 'yyyy-MM-dd');
  
  switch(dateRange) {
    case 'today':
      return { 
        period: 'today',
        startDate: todayStr,
        endDate: todayStr
      };
      
    case 'yesterday':
      const yesterday = new Date(istDate);
      yesterday.setDate(yesterday.getDate() - 1);
      return {
        period: 'yesterday',
        startDate: format(yesterday, 'yyyy-MM-dd'),
        endDate: format(yesterday, 'yyyy-MM-dd')
      };
      
    case 'week':
      const weekStart = startOfWeek(istDate);
      const weekEnd = endOfWeek(istDate);
      return {
        period: 'week',
        startDate: format(weekStart, 'yyyy-MM-dd'),
        endDate: format(weekEnd, 'yyyy-MM-dd')
      };
      
    case 'last-week':
      const lastWeekStart = startOfWeek(subWeeks(istDate, 1));
      const lastWeekEnd = endOfWeek(subWeeks(istDate, 1));
      return {
        period: 'last-week',
        startDate: format(lastWeekStart, 'yyyy-MM-dd'),
        endDate: format(lastWeekEnd, 'yyyy-MM-dd')
      };
      
    case 'month':
      return { 
        period: 'month',
        startDate: format(startOfMonth(istDate), 'yyyy-MM-dd'),
        endDate: format(endOfMonth(istDate), 'yyyy-MM-dd')
      };
      
    case 'last-month':
      const lastMonth = subMonths(istDate, 1);
      return {
        period: 'last-month',
        startDate: format(startOfMonth(lastMonth), 'yyyy-MM-dd'),
        endDate: format(endOfMonth(lastMonth), 'yyyy-MM-dd')
      };
      
    case 'quarter':
      const quarterStart = startOfQuarter(istDate);
      const quarterEnd = endOfQuarter(istDate);
      return {
        period: 'quarter',
        startDate: format(quarterStart, 'yyyy-MM-dd'),
        endDate: format(quarterEnd, 'yyyy-MM-dd')
      };
      
    case 'year':
      return {
        period: 'year',
        startDate: format(startOfYear(istDate), 'yyyy-MM-dd'),
        endDate: format(endOfYear(istDate), 'yyyy-MM-dd')
      };
      
    case 'custom':
      return {
        period: 'custom',
        startDate: customStartDate,
        endDate: customEndDate
      };
      
    default:
      return { 
        period: 'month',
        startDate: format(startOfMonth(istDate), 'yyyy-MM-dd'),
        endDate: format(endOfMonth(istDate), 'yyyy-MM-dd')
      };
  }
};
  
  const handleApplyCustomRange = () => {
    if (!customStartDate || !customEndDate) {
      showToast.error('Please select both start and end dates');
      return;
    }
    
    if (new Date(customStartDate) > new Date(customEndDate)) {
      showToast.error('Start date cannot be after end date');
      return;
    }
    
    setDateRange('custom');
    setShowCustomPicker(false);
    loadDashboardData();
    showToast.success(`Showing data from ${customStartDate} to ${customEndDate}`);
  };


  // ===== PREPARE ORDER STATUS DATA =====
  // const getOrderStatusData = () => {
  //   const data = [];
    
  //   if (orderStats.confirmed > 0) {
  //     data.push({ 
  //       name: 'Confirmed', 
  //       value: orderStats.confirmed, 
  //       color: STATUS_CONFIG.confirmed.color 
  //     });
  //   }
    
  //   if (orderStats['in-progress'] > 0) {
  //     data.push({ 
  //       name: 'In Progress', 
  //       value: orderStats['in-progress'], 
  //       color: STATUS_CONFIG['in-progress'].color 
  //     });
  //   }
    
  //   if (orderStats['ready-to-delivery'] > 0) {
  //     data.push({ 
  //       name: 'Ready', 
  //       value: orderStats['ready-to-delivery'], 
  //       color: STATUS_CONFIG['ready-to-delivery'].color 
  //     });
  //   }
    
  //   if (orderStats.delivered > 0) {
  //     data.push({ 
  //       name: 'Delivered', 
  //       value: orderStats.delivered, 
  //       color: STATUS_CONFIG.delivered.color 
  //     });
  //   }
    
  //   if (orderStats.cancelled > 0) {
  //     data.push({ 
  //       name: 'Cancelled', 
  //       value: orderStats.cancelled, 
  //       color: STATUS_CONFIG.cancelled.color 
  //     });
  //   }
    
  //   if (orderStats.draft > 0) {
  //     data.push({ 
  //       name: 'Draft', 
  //       value: orderStats.draft, 
  //       color: STATUS_CONFIG.draft.color 
  //     });
  //   }
    
  //   return data;
  // };
// ✅ Using useMemo to prevent unnecessary recalculations and UI hanging
const orderStatusData = useMemo(() => {
  const data = [];
  
  // Safety check to avoid "undefined" errors
  if (!orderStats) return data;

  // Clean mapping array for better performance
  const statusKeys = [
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'in-progress', label: 'In Progress' },
    { id: 'ready-to-delivery', label: 'Ready' },
    { id: 'delivered', label: 'Delivered' },
    { id: 'cancelled', label: 'Cancelled' },
    { id: 'draft', label: 'Draft' }
  ];

  statusKeys.forEach(({ id, label }) => {
    const val = orderStats[id] || 0;
    if (val > 0) {
      data.push({
        name: label,
        value: val,
        color: STATUS_CONFIG[id]?.color || '#94a3b8'
      });
    }
  });

  return data;
}, [orderStats]); // ✅ ONLY recalculate when actual order data changes
  

  // const orderStatusData = getOrderStatusData();
  const hasOrderData = orderStatusData.length > 0;

  // ===== PREPARE WORK STATUS DATA (UPDATED with all 8 statuses) =====
  const getWorkStatusData = () => {
    return [
      { name: 'Pending', value: workStats.pending || 0, color: WORK_STATUS_CONFIG.pending.color, status: 'pending' },
      { name: 'Accepted', value: workStats.accepted || 0, color: WORK_STATUS_CONFIG.accepted.color, status: 'accepted' },
      { name: 'Cutting Started', value: workStats.cuttingStarted || 0, color: WORK_STATUS_CONFIG['cutting-started'].color, status: 'cutting-started' },
      { name: 'Cutting Completed', value: workStats.cuttingCompleted || 0, color: WORK_STATUS_CONFIG['cutting-completed'].color, status: 'cutting-completed' },
      { name: 'Sewing Started', value: workStats.sewingStarted || 0, color: WORK_STATUS_CONFIG['sewing-started'].color, status: 'sewing-started' },
      { name: 'Sewing Completed', value: workStats.sewingCompleted || 0, color: WORK_STATUS_CONFIG['sewing-completed'].color, status: 'sewing-completed' },
      { name: 'Ironing', value: workStats.ironing || 0, color: WORK_STATUS_CONFIG.ironing.color, status: 'ironing' },
      { name: 'Ready to Deliver', value: workStats.readyToDeliver || 0, color: WORK_STATUS_CONFIG['ready-to-deliver'].color, status: 'ready-to-deliver' }
    ].filter(item => item.value > 0);
  };

  const workStatusData = getWorkStatusData();
  const hasWorkData = workStatusData.length > 0;

  // ===== GET WORK STATUS BADGE =====
  const getWorkStatusBadge = (status) => {
    const config = WORK_STATUS_CONFIG[status] || WORK_STATUS_CONFIG.pending;
    return `${config.bg} ${config.text} px-2 py-1 rounded-full text-xs font-medium`;
  };

  const getWorkStatusDisplay = (status) => {
    const config = WORK_STATUS_CONFIG[status] || WORK_STATUS_CONFIG.pending;
    return config.label;
  };

  // ===== WORK QUEUE FUNCTIONS (from Cutting Master Works) =====
  
  // Due status helper
  const getDueStatus = (date) => {
    if (!date)
      return {
        label: "No due date",
        color: "text-gray-600",
        icon: <Calendar className="w-4 h-4 text-gray-400" />,
      };

    const diff = new Date(date) - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return {
        label: "Due Today 🚨",
        color: "text-red-600 font-bold",
        icon: <Bell className="w-4 h-4 text-red-500 animate-pulse" />,
      };
    }
    if (days < 0) {
      return {
        label: `Overdue by ${Math.abs(days)} days ⚠️`,
        color: "text-gray-900 font-bold",
        icon: <AlertCircle className="w-4 h-4 text-gray-700" />,
      };
    }
    if (days === 1) {
      return {
        label: "Due Tomorrow",
        color: "text-orange-600",
        icon: <Clock className="w-4 h-4 text-orange-500" />,
      };
    }
    return {
      label: `Due in ${days} days`,
      color: "text-green-600",
      icon: <Calendar className="w-4 h-4 text-green-500" />,
    };
  };

  // Filter works based on current filter and search
  const filteredWorks = useMemo(() => {
    console.log("%c🔍 FILTERING WORKS", "background: orange; color: white; font-size: 12px");
    console.log("Filter params:", { queueSearch, queueStatus, selectedView });
    
    let filtered = recentWorks || [];

    // Apply search
    if (queueSearch) {
      const searchTerm = queueSearch.toLowerCase().trim();
      filtered = filtered.filter(
        (item) =>
          item.workId?.toLowerCase().includes(searchTerm) ||
          (typeof item.garment === 'object' && item.garment?.garmentId?.toLowerCase().includes(searchTerm)) ||
          (typeof item.garment === 'object' && item.garment?.name?.toLowerCase().includes(searchTerm)) ||
          item.order?.customer?.name?.toLowerCase().includes(searchTerm) ||
          item.order?.orderId?.toLowerCase().includes(searchTerm),
      );
    }

    // Apply queue status filter
    if (queueStatus !== "all") {
      filtered = filtered.filter((item) => item.status === queueStatus);
    }

    // Apply view filter
    if (selectedView === "new") {
      filtered = filtered.filter((item) => item.status === "pending");
    }
    if (selectedView === "need-tailor") {
      filtered = filtered.filter(
        (item) => item.status === "accepted" && !item.tailor,
      );
    }

    console.log(`✅ After filtering: ${filtered.length} works`);
    return filtered;
  }, [recentWorks, queueSearch, queueStatus, selectedView]);

  // Sorting logic - FIXED to use garment priority
  const prioritizedQueue = useMemo(() => {
    if (!filteredWorks.length) {
      console.log("⚠️ No works to sort");
      return [];
    }

    console.log(`\n%c🔍 SORTING BY: ${sortBy === "priority" ? "PRIORITY" : "DUE DATE"}`, "background: purple; color: white; font-size: 14px");
    
    const sorted = [...filteredWorks].sort((a, b) => {
      // ✅ FIXED: Priority weights from garment only
      const priorityWeight = { high: 1, normal: 2, low: 3 };
      
      const aPri = priorityWeight[a.garment?.priority] || 2;
      const bPri = priorityWeight[b.garment?.priority] || 2;

      const dateA = a.estimatedDelivery ? new Date(a.estimatedDelivery).getTime() : 9999999999999;
      const dateB = b.estimatedDelivery ? new Date(b.estimatedDelivery).getTime() : 9999999999999;

      if (sortBy === "priority") {
        // Sort by priority first
        if (aPri !== bPri) {
          return aPri - bPri;
        }
        // Then by due date
        return dateA - dateB;
      } else {
        // Sort by due date first
        if (dateA !== dateB) {
          return dateA - dateB;
        }
        // Then by priority
        return aPri - bPri;
      }
    });

    return sorted;
  }, [filteredWorks, sortBy]);

  // Safe formatting
  const safeFormat = (value) => {
    return (value || 0).toLocaleString('en-IN');
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
    return `${config.bg} text-gray-700 px-2 py-1 text-xs rounded-full`;
  };

  // Debug logs
  console.log('📊 Order Stats:', orderStats);
  console.log('📊 Work Stats:', workStats);
  console.log('📊 Tailor Stats:', tailorStats);
  console.log('📊 Revenue Summary:', dailyRevenueSummary);

  // // Prepare data for top performers display (Admin only)
  // const displayPerformers = isAdmin ? (topTailors.length > 0 ? topTailors : tailorPerformance) : [];

// ✅ Corrected: Let both roles see the list
const displayPerformers = (isAdmin || isStoreKeeper) 
  ? (topTailors.length > 0 ? topTailors : tailorPerformance) 
  : [];


  // ===== ROLE-BASED QUICK ACTIONS using basePath =====
  const getQuickActions = () => {
    const commonActions = [
      {
        label: 'Add Customer',
        icon: UserPlus,
        path: `${basePath}/add-customer`,
        color: 'green',
        description: 'Register new customer',
      },
      {
        label: 'New Order',
        icon: ShoppingCart,
        path: `${basePath}/orders/new`,
        color: 'blue',
        description: 'Create a new order',
      },
      {
        label: 'Add Appointment',
        icon: Calendar,
        path: `${basePath}/appointments`,
        color: 'orange',
        description: 'Schedule a new appointment',
      },
      {
        label: 'Add Product',
        icon: Package,
        path: `${basePath}/products`,
        color: 'purple',
        description: 'Add a new product to inventory',
      },
    ];

    const adminActions = [
      ...commonActions,
      {
        label: 'Add Staff',
        icon: Users,
        path: `${basePath}/add-staff`,
        color: 'pink',
        description: 'Add new staff member',
      },
      {
        label: 'Add Tailor',
        icon: Scissors,
        path: `${basePath}/tailors/add`,
        color: 'teal',
        description: 'Register new tailor',
      },
      {
        label: 'Add Expense',
        icon: Receipt,
        path: `${basePath}/banking/expense`,
        color: 'red',
        description: 'Record an expense',
      },
      {
        label: 'Add Income',
        icon: DollarSign,
        path: `${basePath}/banking/income`,
        color: 'green',
        description: 'Record an income',
      }
    ];

    const storeKeeperActions = [
      ...commonActions,
      {
        label: 'Add Expense',
        icon: Receipt,
        path: `${basePath}/banking/expense`,
        color: 'red',
        description: 'Record an expense',
      },
      {
        label: 'Add Income',
        icon: DollarSign,
        path: `${basePath}/banking/income`,
        color: 'green',
        description: 'Record an income',
      }
    ];

    if (isAdmin) return adminActions;
    if (isStoreKeeper) return storeKeeperActions;
    return [];
  };

  const quickActions = getQuickActions();

  // ===== HANDLE VIEW TAILOR using basePath =====
  const handleViewTailor = (tailorId) => {
    navigate(`${basePath}/tailors/${tailorId}`);
  };

  // ===== HANDLE VIEW WORK using basePath =====
  const handleViewWork = (workId) => {
    navigate(`${basePath}/works/${workId}`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-black text-slate-800 flex items-center gap-2">
            {isAdmin ? <Shield size={20} className="text-purple-600" /> : <Store size={20} className="text-green-600" />}
            <span className="truncate max-w-[150px]">{dashboardTitle}</span>
          </h1>
          <div className="flex items-center gap-2">
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
              <h3 className="font-bold text-slate-800">Date Range</h3>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-lg flex items-center justify-center"
                style={{ minWidth: '28px', minHeight: '28px' }}
              >
                <X size={16} className="text-slate-500" />
              </button>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setDateRange('today');
                  setMobileFiltersOpen(false);
                }}
                className={`w-full px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  dateRange === 'today' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => {
                  setDateRange('week');
                  setMobileFiltersOpen(false);
                }}
                className={`w-full px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  dateRange === 'week' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                This Week
              </button>
              <button
                onClick={() => {
                  setDateRange('month');
                  setMobileFiltersOpen(false);
                }}
                className={`w-full px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  dateRange === 'month' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                This Month
              </button>
              <button
                onClick={() => {
                  setShowCustomPicker(true);
                  setMobileFiltersOpen(false);
                }}
                className={`w-full px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  dateRange === 'custom' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                Custom Range
              </button>
            </div>
          </div>
        )}

        {/* ✅ FIXED: Mobile Menu with Role-Based Navigation using basePath */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-lg p-4 z-40 animate-in slide-in-from-top-2 duration-200">
            <div className="space-y-2">
              <button
                onClick={() => {
                  navigate(`${basePath}/dashboard`);
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 hover:bg-slate-100 rounded-xl font-medium"
              >
                Dashboard
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
              <button
                onClick={() => {
                  navigate(`${basePath}/customers`);
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 hover:bg-slate-100 rounded-xl font-medium"
              >
                Customers
              </button>
              <button
                onClick={() => {
                  navigate(`${basePath}/banking/overview`);
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 hover:bg-slate-100 rounded-xl font-medium"
              >
                Banking
              </button>
              <button
                onClick={() => {
                  navigate(`${basePath}/tailors`);
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 hover:bg-slate-100 rounded-xl font-medium"
              >
                Tailors
              </button>
              {isAdmin && (
                <button
                  onClick={() => {
                    navigate(`${basePath}/staff`);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-slate-100 rounded-xl font-medium"
                >
                  Staff
                </button>
              )}
            </div>
          </div>
        )}

        {/* Mobile Last Refreshed */}
        <div className="px-4 pb-3">
          <p className="text-[10px] text-slate-400 flex items-center gap-1">
            <Clock size={10} />
            Last updated: {format(lastRefreshed, 'hh:mm:ss a')}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* ===== DESKTOP HEADER (Hidden on Mobile) ===== */}
        <div className="hidden lg:block mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-black text-slate-800">
                  {dashboardTitle}
                </h1>
                {isStoreKeeper && (
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Store size={12} />
                    Store Keeper
                  </span>
                )}
                {isAdmin && (
                  <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Shield size={12} />
                    Admin
                  </span>
                )}
              </div>
              <p className="text-slate-600 flex items-center gap-2">
                <Clock size={16} />
                {format(new Date(), 'EEEE, MMMM do, yyyy')}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Last refreshed: {format(lastRefreshed, 'hh:mm:ss a')}
              </p>
            </div>

            {/* Desktop Filter Buttons */}
            <div className="flex flex-wrap gap-2 bg-white p-2 rounded-xl shadow-sm">
              <button
                onClick={() => {
                  setDateRange('today');
                  setShowCustomPicker(false);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  dateRange === 'today' && !showCustomPicker ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-slate-100'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => {
                  setDateRange('week');
                  setShowCustomPicker(false);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  dateRange === 'week' && !showCustomPicker ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-slate-100'
                }`}
              >
                This Week
              </button>
              <button
                onClick={() => {
                  setDateRange('month');
                  setShowCustomPicker(false);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  dateRange === 'month' && !showCustomPicker ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-slate-100'
                }`}
              >
                This Month
              </button>
              <button
                onClick={() => setShowCustomPicker(!showCustomPicker)}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-1 ${
                  showCustomPicker || dateRange === 'custom' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-slate-100'
                }`}
              >
                <Calendar size={16} />
                Custom
              </button>
              <button
                onClick={loadDashboardData}
                className="p-2 hover:bg-slate-100 rounded-lg transition-all"
                title="Refresh"
              >
                <RefreshCw size={18} className={isLoading ? 'animate-spin text-blue-600' : ''} />
              </button>
            </div>
          </div>

          {/* Desktop Custom Date Range Picker */}
          {showCustomPicker && (
            <div className="mt-4 bg-white p-4 rounded-xl shadow-sm border border-blue-100">
              <div className="flex flex-wrap items-end gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    max={customEndDate}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">End Date</label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    min={customStartDate}
                  />
                </div>
                <button
                  onClick={handleApplyCustomRange}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all"
                >
                  Apply Range
                </button>
                <button
                  onClick={() => setShowCustomPicker(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg font-medium hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Desktop Active Filter Indicator */}
          <p className="text-xs text-blue-600 mt-2">
            Showing: {
              dateRange === 'today' ? 'Today' :
              dateRange === 'week' ? 'This Week' :
              dateRange === 'month' ? 'This Month' :
              `Custom (${customStartDate} to ${customEndDate})`
            }
          </p>
        </div>

        {/* Mobile Custom Date Range Picker */}
        {showCustomPicker && (
          <div className="lg:hidden mb-4 bg-white p-4 rounded-xl shadow-sm border border-blue-100">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Start Date</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  max={customEndDate}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">End Date</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  min={customStartDate}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleApplyCustomRange}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm"
                >
                  Apply
                </button>
                <button
                  onClick={() => setShowCustomPicker(false)}
                  className="flex-1 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg font-medium text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Active Filter Indicator */}
        <div className="lg:hidden mb-4">
          <p className="text-xs text-blue-600">
            Showing: {
              dateRange === 'today' ? 'Today' :
              dateRange === 'week' ? 'This Week' :
              dateRange === 'month' ? 'This Month' :
              `Custom (${customStartDate} to ${customEndDate})`
            }
          </p>
        </div>
        {/* ===== QUICK ACTIONS ===== */}
<div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 lg:p-6 mb-6 lg:mb-8">
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-sm sm:text-base lg:text-lg font-bold text-slate-800 flex items-center gap-2">
      <Zap size={18} className="text-yellow-500" />
      Quick Actions
    </h2>
  </div>

  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3">
    {quickActions.slice(0, 4).map((action, index) => {
      const IconComponent = action.icon;

      return (
        <button
          key={index}
          onClick={() => navigate(action.path)}
          className="flex flex-col items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl p-4 transition-all duration-200 hover:shadow-md"
        >
          <div className="p-3 rounded-full bg-white shadow-sm">
            <IconComponent size={22} className="text-blue-600" />
          </div>

          <div className="text-center">
            <p className="text-sm font-semibold text-slate-800">
              {action.label}
            </p>

            <p className="text-[11px] text-slate-500 mt-1">
              {action.description}
            </p>
          </div>
        </button>
      );
    })}
  </div>
</div>
        {/* ===== KPI CARDS - Fully Responsive ===== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 lg:mb-8">
          {/* Card 1 - Total Orders */}
          <StatCard
            title="Total Orders"
            value={<CountUp end={orderStats?.total || 0} separator="," duration={1.5} />}
            icon={<ShoppingCart className="text-blue-600" size={20} />}
            bgColor="bg-blue-50"
            borderColor="border-blue-200"
            onClick={() => navigate(`${basePath}/orders`)}
            className="cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
          >
            <div className="mt-2 sm:mt-3 grid grid-cols-3 gap-1 sm:gap-2 text-[10px] sm:text-xs">
              <div className="bg-white p-1 sm:p-2 rounded-lg text-center">
                <span className="text-slate-500 block">Pending</span>
                <p className="font-bold text-orange-600 text-xs sm:text-sm">
                  {(orderStats?.confirmed || 0) + (orderStats?.draft || 0)}
                </p>
              </div>
              <div className="bg-white p-1 sm:p-2 rounded-lg text-center">
                <span className="text-slate-500 block">Progress</span>
                <p className="font-bold text-blue-600 text-xs sm:text-sm">
                  {(orderStats?.cutting || 0) + (orderStats?.stitching || 0) + (orderStats?.['in-progress'] || 0)}
                </p>
              </div>
              <div className="bg-white p-1 sm:p-2 rounded-lg text-center">
                <span className="text-slate-500 block">Completed</span>
                <p className="font-bold text-green-600 text-xs sm:text-sm">{orderStats?.delivered || 0}</p>
              </div>
            </div>
          </StatCard>

          {/* Card 2 - Revenue */}
          <StatCard
            title="Revenue"
            value={<CountUp end={dailyRevenueSummary?.totalRevenue || 0} prefix="₹" separator="," duration={1.5} />}
            icon={<IndianRupee className="text-green-600" size={20} />}
            bgColor="bg-green-50"
            borderColor="border-green-200"
            onClick={() => navigate(`${basePath}/banking/overview`)}
            className="cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
          >
            <div className="mt-2 sm:mt-3 flex gap-1 sm:gap-2 text-[10px] sm:text-xs">
              <div className="bg-white p-1 sm:p-2 rounded-lg flex-1 text-center">
                <span className="text-slate-500 block">Expense</span>
                <p className="font-bold text-red-600 text-xs sm:text-sm">₹{safeFormat(dailyRevenueSummary?.totalExpense || 0)}</p>
              </div>
              <div className="bg-white p-1 sm:p-2 rounded-lg flex-1 text-center">
                <span className="text-slate-500 block">Profit</span>
                <p className="font-bold text-green-600 text-xs sm:text-sm">₹{safeFormat(dailyRevenueSummary?.netProfit || 0)}</p>
              </div>
            </div>
          </StatCard>

          {/* Card 3 - Overdue Orders */}
          <StatCard
            title="Overdue Orders"
            value={<CountUp end={orderStats?.overdueOrders || 0} separator="," duration={1.5} />}
            icon={<AlertCircle className="text-red-600" size={20} />}
            bgColor="bg-red-50"
            borderColor="border-red-200"
            onClick={() => navigate(`${basePath}/orders?status=__overdue`)}
            className="cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
          >
            <div className="flex gap-2 text-[10px] sm:text-xs">
              <div className="bg-white p-1 rounded-lg text-center flex-1">
                <span className="text-slate-500 block">Status</span>
                <p className="font-bold text-red-600 text-xs">⚠️ High Priority</p>
              </div>
              <div className="bg-white p-1 rounded-lg text-center flex-1">
                <span className="text-slate-500 block">Action</span>
                <p className="font-bold text-red-600 text-xs">Needs Attention</p>
              </div>
            </div>
          </StatCard>

          {/* Card 4 - Appointments */}
          <StatCard
            title="Appointments"
            value={appointmentsLoading ? (
              <Loader className="w-5 h-5 animate-spin text-indigo-600" />
            ) : <CountUp end={appointments?.length || 0} separator="," duration={1.5} />}
            icon={<Calendar className="text-indigo-600" size={20} />}
            bgColor="bg-indigo-50"
            borderColor="border-indigo-200"
            onClick={() => navigate(`${basePath}/appointments`)}
            className="cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
          >
            <div className="mt-2 sm:mt-3 flex items-center justify-between text-[10px] sm:text-xs text-indigo-600 font-medium">
              <span>View Schedule</span>
              <ArrowRight size={14} />
            </div>
          </StatCard>
        </div>

        {/* ===== ROW 1: ORDERS OVERVIEW + RECENT ORDERS - Responsive ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 lg:gap-6 mb-6 lg:mb-8">
          {/* Orders Status Chart */}
          <div className="bg-white rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-sm sm:text-base lg:text-lg font-bold text-slate-800 flex items-center gap-2">
                <Package size={16} className="text-blue-600 sm:w-5 sm:h-5" />
                <span>Orders Overview</span>
                <span className="text-[8px] sm:text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                  {dateRange === 'today' ? 'Today' : 
                   dateRange === 'week' ? 'This Week' : 
                   dateRange === 'month' ? 'This Month' : 'Custom'}
                </span>
              </h2>
              <Link to={`${basePath}/orders`} className="text-blue-600 text-xs sm:text-sm hover:underline flex items-center gap-1">
                <span className="hidden xs:inline">View All</span>
                <ArrowRight size={12} className="sm:w-4 sm:h-4" />
              </Link>
            </div>
            
            {hasOrderData ? (
              <>
                {/* <div className="h-48 sm:h-56 lg:h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={orderStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={60}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {orderStatusData.map((entry) => (
                          <Cell key={`cell-${entry.name}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: '10px' }} />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
                 */}
                 <div className="h-48 sm:h-56 lg:h-64">
  <ResponsiveContainer width="100%" height="100%">
    <RePieChart>
      <Pie
        data={orderStatusData}
        cx="50%"
        cy="50%"
        innerRadius={40}
        outerRadius={60}
        paddingAngle={3}
        dataKey="value"
        // ✅ CRITICAL PERFORMANCE FIX: Disable animation to stop lagging
        isAnimationActive={false} 
        labelLine={false}
        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
      >
        {orderStatusData.map((entry, index) => (
          <Cell 
            key={`cell-${index}`} 
            fill={entry.color} 
            stroke="none" // Remove stroke for faster rendering
            style={{ outline: 'none' }}
          />
        ))}
      </Pie>
      
      {/* Tooltip lag fix */}
      <Tooltip isAnimationActive={false} />
      
      <Legend 
        wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} 
        iconType="circle"
      />
    </RePieChart>
  </ResponsiveContainer>
</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 sm:gap-2 mt-3 sm:mt-4">
                  {Object.entries(STATUS_CONFIG).map(([status, config]) => {
                    const count = orderStats[status] || 0;
                    if (count === 0) return null;
                    return (
                      <div key={status} className="flex items-center gap-1 text-[8px] sm:text-xs">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: config.color }}></span>
                        <span className="text-slate-600 truncate">{config.label}</span>
                        <span className="font-bold text-slate-800 ml-auto">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="h-48 sm:h-64 flex items-center justify-center text-slate-400">
                <Package size={32} className="opacity-30 sm:w-12 sm:h-12" />
                <p className="text-xs sm:text-sm ml-2">No orders for this period</p>
              </div>
            )}
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-4 sm:p-5 lg:p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-800 text-sm sm:text-base lg:text-lg flex items-center gap-2">
                <ShoppingCart size={14} className="text-blue-600 sm:w-5 sm:h-5" />
                <span>Recent Orders</span>
                <span className="text-[8px] sm:text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                  {dateRange === 'today' ? 'Today' : 
                   dateRange === 'week' ? 'This Week' : 
                   dateRange === 'month' ? 'This Month' : 'Custom'}
                </span>
              </h2>
              <Link to={`${basePath}/orders`} className="text-blue-600 text-xs sm:text-sm hover:underline">View All</Link>
            </div>
            
            {recentOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-[8px] sm:text-xs font-medium text-slate-500">Order ID</th>
                      <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-[8px] sm:text-xs font-medium text-slate-500">Customer</th>
                      <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-[8px] sm:text-xs font-medium text-slate-500">Items</th>
                      <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-[8px] sm:text-xs font-medium text-slate-500">Status</th>
                      <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-[8px] sm:text-xs font-medium text-slate-500">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentOrders.slice(0, 5).map((order) => (
                      <tr key={order._id} className="hover:bg-slate-50">
                        <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium">#{order.orderId}</td>
                        <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-xs sm:text-sm truncate max-w-[80px] sm:max-w-none">{order.customer?.name || 'N/A'}</td>
                        <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-xs sm:text-sm">{order.garments?.length || 0}</td>
                        <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3">
                          <span className={`${getStatusBadge(order.status)} text-[8px] sm:text-xs`}>
                            {STATUS_CONFIG[order.status]?.label || order.status}
                          </span>
                        </td>
                        <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3">
                          <Link to={`${basePath}/orders/${order._id}`} className="text-blue-600">
                            <Eye size={12} className="sm:w-4 sm:h-4" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 sm:p-8 text-center text-slate-400">
                <ShoppingCart size={24} className="mx-auto mb-2 opacity-30 sm:w-8 sm:h-8" />
                <p className="text-xs sm:text-sm">No recent orders</p>
              </div>
            )}
          </div>
        </div>

        {/* ===== ROW 2: REVENUE TREND CHART - Responsive ===== */}
        <div className="mb-6 lg:mb-8">
          <div className="bg-white rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
              <h2 className="text-sm sm:text-base lg:text-lg font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp size={16} className="text-green-600 sm:w-5 sm:h-5" />
                <span>Revenue Trend</span>
                <span className="text-[8px] sm:text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                  {dateRange === 'today' ? 'Today (Hourly)' : 
                   dateRange === 'week' ? 'Last 7 Days' : 
                   dateRange === 'month' ? 'This Month' : 'Custom'}
                </span>
              </h2>
              
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-1 sm:gap-2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-600 rounded-full"></div>
                  <span className="text-[8px] sm:text-xs text-slate-600">Revenue</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full"></div>
                  <span className="text-[8px] sm:text-xs text-slate-600">Expense</span>
                </div>
              </div>
            </div>
            
            {revenueLoading ? (
              <div className="h-48 sm:h-64 lg:h-80 flex items-center justify-center">
                <Loader size={20} className="animate-spin text-blue-600 sm:w-8 sm:h-8" />
                <span className="ml-2 text-xs sm:text-sm text-slate-600">Loading...</span>
              </div>
            ) : dailyRevenueData && dailyRevenueData.length > 0 ? (
              <>
                {/* <div className="h-48 sm:h-64 lg:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailyRevenueData}>
                   
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey={dateRange === 'today' ? 'time' : 'day'} tick={{ fontSize: 10 }} />
                      <YAxis tickFormatter={(value) => `₹${value/1000}K`} tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(value) => `₹${value}`} />
                      <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div> */}
   {/* 🔴 Intha block-ah mattum replace pannunga */}
<div className="h-48 sm:h-64 lg:h-80">
  <ResponsiveContainer width="100%" height="100%">
    {/* Number format mismatch solve panna .map() use panroam */}
    <LineChart data={dailyRevenueData.map(d => ({
      ...d,
      revenue: Number(d.revenue || 0), // 🔴 String-ah iruntha Number-ah mathum
      expense: Number(d.expense || 0)
    }))}>
      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
      
      <XAxis 
        dataKey={dateRange === 'today' ? 'time' : 'day'} 
        tick={{ fontSize: 10 }} 
      />
      
      <YAxis 
        tick={{ fontSize: 10 }}
        // Simple formatter to avoid 'K' issues for now
        tickFormatter={(val) => `₹${val}`} 
      />
      
      <Tooltip formatter={(value) => [`₹${value}`, 'Amount']} />
      <Legend verticalAlign="top" align="right" />

      {/* Blue Line - Revenue */}
      <Line 
        type="monotone" 
        dataKey="revenue" 
        name="Revenue"
        stroke="#3b82f6" 
        strokeWidth={3} 
        dot={{ r: 4, fill: '#3b82f6' }}
        isAnimationActive={true}
        connectNulls={true}
      />

      {/* Red Line - Expense */}
      <Line 
        type="monotone" 
        dataKey="expense" 
        name="Expense"
        stroke="#ef4444" 
        strokeWidth={3} 
        dot={{ r: 4, fill: '#ef4444' }}
        isAnimationActive={true}
        connectNulls={true}
      />
    </LineChart>
  </ResponsiveContainer>
</div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 lg:gap-6 mt-4 sm:mt-6 lg:mt-8">
                  <div className="bg-blue-50 p-2 sm:p-3 lg:p-4 rounded-lg">
                    <p className="text-[8px] sm:text-xs text-blue-600">Total Revenue</p>
                    <p className="text-sm sm:text-base lg:text-lg xl:text-xl font-bold text-blue-800 break-words">
                      ₹{safeFormat(dailyRevenueSummary?.totalRevenue || 0)}
                    </p>
                  </div>
                  <div className="bg-red-50 p-2 sm:p-3 lg:p-4 rounded-lg">
                    <p className="text-[8px] sm:text-xs text-red-600">Total Expense</p>
                    <p className="text-sm sm:text-base lg:text-lg xl:text-xl font-bold text-red-800 break-words">
                      ₹{safeFormat(dailyRevenueSummary?.totalExpense || 0)}
                    </p>
                  </div>
                  <div className="bg-green-50 p-2 sm:p-3 lg:p-4 rounded-lg">
                    <p className="text-[8px] sm:text-xs text-green-600">Net Profit</p>
                    <p className="text-sm sm:text-base lg:text-lg xl:text-xl font-bold text-green-800 break-words">
                      ₹{safeFormat(dailyRevenueSummary?.netProfit || 0)}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-48 sm:h-64 lg:h-80 flex items-center justify-center text-slate-400">
                <TrendingUp size={32} className="opacity-30 sm:w-12 sm:h-12" />
                <p className="text-xs sm:text-sm ml-2">No revenue data available</p>
              </div>
            )}
          </div>
        </div>


        {/* ===== DELIVERY PIPELINE ===== */}
        <DeliveryPipelineSection works={recentWorks} basePath={basePath} />

        {/* ===== ROW 4: WORK QUEUE - Responsive ===== */}
        <div className="mb-6 lg:mb-8">
          <div className="bg-white rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4 lg:mb-6">
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Layers size={16} className="text-purple-600 sm:w-5 sm:h-5" />
                  <span>Work Queue</span>
                </h2>
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-[8px] sm:text-xs rounded-full">
                  {prioritizedQueue.length} items
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {/* View Filters */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setSelectedView("all")}
                    className={`px-2 sm:px-3 py-1 text-[8px] sm:text-xs rounded-md transition ${
                      selectedView === "all" ? "bg-purple-600 text-white" : "text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    All ({recentWorks.length})
                  </button>
                  <button
                    onClick={() => setSelectedView("new")}
                    className={`px-2 sm:px-3 py-1 text-[8px] sm:text-xs rounded-md transition flex items-center gap-1 ${
                      selectedView === "new" ? "bg-yellow-500 text-white" : "text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <span className="hidden xs:inline">🆕</span>
                    <span className="xs:hidden">🆕</span>
                    <span
                      className={`ml-1 px-1 py-0.5 text-[8px] rounded-full ${
                        selectedView === "new" ? "bg-yellow-600 text-white" : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {workStats.pending || 0}
                    </span>
                  </button>
                  <button
                    onClick={() => setSelectedView("need-tailor")}
                    className={`px-2 sm:px-3 py-1 text-[8px] sm:text-xs rounded-md transition flex items-center gap-1 ${
                      selectedView === "need-tailor" ? "bg-orange-500 text-white" : "text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <span className="hidden xs:inline">👔</span>
                    <span className="xs:hidden">👔</span>
                    <span
                      className={`ml-1 px-1 py-0.5 text-[8px] rounded-full ${
                        selectedView === "need-tailor" ? "bg-orange-600 text-white" : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {recentWorks.filter(w => w.status === "accepted" && !w.tailor).length}
                    </span>
                  </button>
                </div>

                {/* ✅ FIXED: Search input with properly centered icon */}
                {/* ✅ FIXED: Search input with properly centered icon inside the input */}
        <div className="relative w-full">
  {/* Search Icon */}
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />

  {/* Input */}
  <input
    type="text"
    value={queueSearch}
    onChange={(e) => setQueueSearch(e.target.value)}
    placeholder="Search..."
    className="w-full h-9 sm:h-10 pl-9 pr-9 border border-gray-200 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-purple-500 outline-none"
  />

  {/* Clear Button */}
  {queueSearch && (
    <button
      onClick={() => setQueueSearch("")}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
    >
      <X className="w-4 h-4" />
    </button>
  )}
</div>
                {/* Status Filter */}
                <select
                  value={queueStatus}
                  onChange={(e) => setQueueStatus(e.target.value)}
                  className="px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg text-[8px] sm:text-xs focus:ring-2 focus:ring-purple-500 w-20 sm:w-24 lg:w-32"
                >
                  <option value="all">All</option>
                  <option value="pending">⏳ Pending</option>
                  <option value="accepted">✅ Accepted</option>
                  <option value="cutting-started">✂️ Cutting</option>
                </select>

                {/* Sort By */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg text-[8px] sm:text-xs focus:ring-2 focus:ring-purple-500"
                >
                  <option value="priority">Priority</option>
                  <option value="due">Due Date</option>
                </select>
              </div>
            </div>

            {/* Queue List - Responsive with properly centered action button */}
            <div className="space-y-2 sm:space-y-3 max-h-[400px] lg:max-h-[600px] overflow-y-auto pr-1 sm:pr-2">
              {prioritizedQueue.length > 0 ? (
                prioritizedQueue.slice(0, 5).map((work) => {
                  const dueStatus = getDueStatus(work.estimatedDelivery);
                  const priority = getWorkPriority(work);
                  const isHighPriority = priority === "high";

                  return (
                    <div
                      key={work._id}
                      className={`border-2 rounded-lg p-3 sm:p-4 transition-all hover:shadow-md ${getWorkStatusBadge(work.status)} ${
                        isHighPriority ? "border-l-8 border-l-red-500" : ""
                      }`}
                      onClick={() => handleViewWork(work._id)}
                    >
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                        <div className="flex-1">
                          {/* Top Row */}
                          <div className="flex items-center gap-1 sm:gap-2 mb-2 flex-wrap">
                            <span className="font-mono text-[10px] sm:text-xs font-bold text-purple-600 bg-white px-2 py-1 rounded">
                              #{work.workId}
                            </span>
                            <span
                              className={`px-2 py-1 rounded-full text-[8px] sm:text-xs font-medium ${getWorkStatusBadge(work.status)}`}
                            >
                              {getWorkStatusDisplay(work.status)}
                            </span>
                            {getPriorityBadge(work)}
                          </div>

                          <h3 className="font-bold text-gray-800 text-xs sm:text-sm mb-1">
                            {typeof work.garment === 'object' ? work.garment?.name : work.garmentName || "N/A"}
                          </h3>

                          <div className="grid grid-cols-1 xs:grid-cols-2 gap-1 sm:gap-2 text-[8px] sm:text-xs">
                            <div className="flex items-center gap-1">
                              <UserIcon size={10} className="text-gray-400 sm:w-3 sm:h-3" />
                              <span className="truncate">{work.order?.customer?.name || "Unknown"}</span>
                            </div>

                            <div className={`flex items-center gap-1 ${dueStatus.color}`}>
                              {dueStatus.icon}
                              <span className="truncate">{dueStatus.label}</span>
                            </div>

                            <div className="flex items-center gap-1">
                              <Package size={10} className="text-purple-500 sm:w-3 sm:h-3" />
                              <span className="truncate">
                                {typeof work.garment === 'object' ? work.garment?.garmentId : work.garmentId || "N/A"}
                              </span>
                            </div>

                            {work.tailor && (
                              <div className="flex items-center gap-1">
                                <UserCheckIcon size={10} className="text-green-500 sm:w-3 sm:h-3" />
                                <span className="truncate">Tailor: {work.tailor.name}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* ✅ FIXED: Action button with properly centered icon */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewWork(work._id);
                          }}
                          className="w-7 h-7 sm:w-8 sm:h-8 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center justify-center self-end md:self-center"
                          title="View Details"
                        >
                          <Eye size={12} className="sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 sm:py-12 text-gray-500">
                  <Layers className="w-8 h-8 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-xs sm:text-sm font-medium">No items in work queue</p>
                  <p className="text-[8px] sm:text-xs text-gray-400 mt-1">
                    Try adjusting your filters
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ===== ROW 5: TAILOR PERFORMANCE - Responsive ===== */}
        {/* <div className="mb-6 lg:mb-8">
          <div className="bg-white rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h2 className="text-sm sm:text-base lg:text-lg font-bold text-gray-800 flex items-center gap-2">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                <span>Tailor Performance</span>
              </h2>
              {tailorStats?.active > 0 && (
                <div className="flex items-center gap-2">
                  <span className="px-2 sm:px-3 py-1 bg-green-100 text-green-700 text-[8px] sm:text-xs rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse"></span>
                    {tailorStats?.active || 0} Available
                  </span>
                  <span className="px-2 sm:px-3 py-1 bg-orange-100 text-orange-700 text-[8px] sm:text-xs rounded-full">
                    {tailorStats?.onLeave || 0} On Leave
                  </span>
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] lg:min-w-0">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-2 sm:py-3 px-1 sm:px-2 text-[8px] sm:text-xs font-medium text-gray-500">Tailor</th>
                    <th className="text-center py-2 sm:py-3 px-1 sm:px-2 text-[8px] sm:text-xs font-medium text-gray-500">Assigned</th>
                    <th className="text-center py-2 sm:py-3 px-1 sm:px-2 text-[8px] sm:text-xs font-medium text-gray-500">Completed</th>
                    <th className="text-center py-2 sm:py-3 px-1 sm:px-2 text-[8px] sm:text-xs font-medium text-gray-500">Pending</th>
                    <th className="text-center py-2 sm:py-3 px-1 sm:px-2 text-[8px] sm:text-xs font-medium text-gray-500">In Progress</th>
                    <th className="text-center py-2 sm:py-3 px-1 sm:px-2 text-[8px] sm:text-xs font-medium text-gray-500">Efficiency</th>
                    <th className="text-center py-2 sm:py-3 px-1 sm:px-2 text-[8px] sm:text-xs font-medium text-gray-500">Status</th>
                    <th className="text-right py-2 sm:py-3 px-1 sm:px-2 text-[8px] sm:text-xs font-medium text-gray-500">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {performanceLoading ? (
                    <tr>
                      <td colSpan="8" className="text-center py-6 sm:py-8">
                        <Loader size={16} className="animate-spin text-purple-600 mx-auto sm:w-6 sm:h-6" />
                      </td>
                    </tr>
                  ) : displayPerformers.length > 0 ? (
                    displayPerformers.slice(0, 5).map((tailor, index) => {
                      const assigned = tailor.assignedWorks || tailor.assignedOrders || tailor.totalAssigned || 0;
                      const completed = tailor.completedWorks || tailor.completedOrders || tailor.totalCompleted || 0;
                      const inProgress = tailor.inProgressWorks || tailor.currentWorks || 0;
                      const pending = assigned - completed - inProgress;
                      const efficiency = assigned > 0 ? Math.round((completed / assigned) * 100) : 0;
                      
                      const isAvailable = tailor.status === 'available' || tailor.isAvailable === true;
                      const isBusy = tailor.status === 'busy' || tailor.isAvailable === false;
                      
                      return (
                        <tr key={tailor._id || index} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-2 sm:py-3 px-1 sm:px-2">
                            <div className="font-medium text-gray-800 text-[8px] sm:text-xs truncate max-w-[60px] sm:max-w-none">
                              {tailor.name || tailor.tailorName || 'Tailor'}
                            </div>
                            <div className="text-[6px] sm:text-[10px] text-gray-500 truncate max-w-[60px] sm:max-w-none">
                              {tailor.specialization || tailor.specializations?.join(', ') || 'General'}
                            </div>
                          </td>
                          <td className="text-center py-2 sm:py-3 px-1 sm:px-2 font-bold text-[8px] sm:text-xs">{assigned}</td>
                          <td className="text-center py-2 sm:py-3 px-1 sm:px-2 text-green-600 font-bold text-[8px] sm:text-xs">{completed}</td>
                          <td className="text-center py-2 sm:py-3 px-1 sm:px-2 text-yellow-600 font-bold text-[8px] sm:text-xs">{pending}</td>
                          <td className="text-center py-2 sm:py-3 px-1 sm:px-2 text-purple-600 font-bold text-[8px] sm:text-xs">{inProgress}</td>
                          <td className="text-center py-2 sm:py-3 px-1 sm:px-2">
                            <span className={`px-1 sm:px-2 py-0.5 rounded-full text-[6px] sm:text-[10px] font-medium ${
                              efficiency >= 80 ? 'bg-green-100 text-green-700' :
                              efficiency >= 60 ? 'bg-blue-100 text-blue-700' :
                              efficiency >= 40 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {efficiency}%
                            </span>
                          </td>
                          <td className="text-center py-2 sm:py-3 px-1 sm:px-2">
                            {isAvailable ? (
                              <span className="px-1 sm:px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[6px] sm:text-[10px] flex items-center justify-center gap-0.5">
                                <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                                <span className="hidden xs:inline">Available</span>
                              </span>
                            ) : isBusy ? (
                              <span className="px-1 sm:px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-[6px] sm:text-[10px]">
                                Busy
                              </span>
                            ) : (
                              <span className="px-1 sm:px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-[6px] sm:text-[10px]">
                                {tailor.status || 'Unknown'}
                              </span>
                            )}
                          </td>
                          <td className="text-right py-2 sm:py-3 px-1 sm:px-2">
                            <button
                              onClick={() => handleViewTailor(tailor._id)}
                              className="text-[6px] sm:text-[10px] px-1 sm:px-2 py-0.5 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center py-6 sm:py-8 text-gray-500">
                        <Scissors size={20} className="mx-auto mb-2 opacity-30 sm:w-8 sm:h-8" />
                        <p className="text-xs sm:text-sm">No tailors found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {tailorStats && (
              <div className="mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-gray-200 grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4 text-center text-[8px] sm:text-xs">
                <div className="bg-blue-50 p-1 sm:p-2 rounded-lg">
                  <span className="block font-bold text-blue-700 text-xs sm:text-sm">{tailorStats?.total || 0}</span>
                  <span className="text-gray-500 text-[6px] sm:text-xs">Total</span>
                </div>
                <div className="bg-green-50 p-1 sm:p-2 rounded-lg">
                  <span className="block font-bold text-green-600 text-xs sm:text-sm">{tailorStats?.active || 0}</span>
                  <span className="text-gray-500 text-[6px] sm:text-xs">Available</span>
                </div>
                <div className="bg-orange-50 p-1 sm:p-2 rounded-lg">
                  <span className="block font-bold text-orange-600 text-xs sm:text-sm">{tailorStats?.onLeave || 0}</span>
                  <span className="text-gray-500 text-[6px] sm:text-xs">On Leave</span>
                </div>
              </div>
            )}
          </div>
        </div> */}
{/* ===== ROW 5: TAILOR PERFORMANCE - Responsive with Full Width Table ===== */}
<div className="mb-6 lg:mb-8">
  <div className="bg-white rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
      <h2 className="text-sm sm:text-base lg:text-lg font-bold text-gray-800 flex items-center gap-2">
        <Users className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
        <span>Tailor Performance</span>
      </h2>
      {tailorStats?.active > 0 && (
        <div className="flex items-center gap-2">
          <span className="px-2 sm:px-3 py-1 bg-green-100 text-green-700 text-[8px] sm:text-xs rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse"></span>
            {tailorStats?.active || 0} Available
          </span>
          <span className="px-2 sm:px-3 py-1 bg-orange-100 text-orange-700 text-[8px] sm:text-xs rounded-full">
            {tailorStats?.onLeave || 0} On Leave
          </span>
        </div>
      )}
    </div>

    {/* ✅ FIXED: Full width table with proper scrolling */}
    <div className="overflow-x-auto overflow-y-hidden -mx-4 sm:-mx-5 lg:mx-0">
      <div className="min-w-[1000px] lg:min-w-full">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Tailor</th>
              <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Assigned</th>
              <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Completed</th>
              <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Pending</th>
              <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">In Progress</th>
              <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Efficiency</th>
              <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Action</th>
             </tr>
          </thead>
          <tbody>
            {performanceLoading ? (
              <tr>
                <td colSpan="8" className="text-center py-8">
                  <Loader size={20} className="animate-spin text-purple-600 mx-auto" />
                </td>
              </tr>
            ) : displayPerformers.length > 0 ? (
              displayPerformers.slice(0, 5).map((tailor, index) => {
                const assigned = tailor.assignedWorks || tailor.assignedOrders || tailor.totalAssigned || 0;
                const completed = tailor.completedWorks || tailor.completedOrders || tailor.totalCompleted || 0;
                const inProgress = tailor.inProgressWorks || tailor.currentWorks || 0;
                const pending = assigned - completed - inProgress;
                const efficiency = assigned > 0 ? Math.round((completed / assigned) * 100) : 0;
                
                const isAvailable = tailor.status === 'available' || tailor.isAvailable === true;
                const isBusy = tailor.status === 'busy' || tailor.isAvailable === false;
                
                return (
                  <tr key={tailor._id || index} className="border-b border-gray-100 hover:bg-gray-50 transition-all">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-medium text-gray-800 text-sm">
                        {tailor.name || tailor.tailorName || 'Tailor'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {tailor.specialization || tailor.specializations?.join(', ') || 'General'}
                      </div>
                    </td>
                    <td className="text-center py-3 px-4 font-bold text-sm whitespace-nowrap">{assigned}</td>
                    <td className="text-center py-3 px-4 text-green-600 font-bold text-sm whitespace-nowrap">{completed}</td>
                    <td className="text-center py-3 px-4 text-yellow-600 font-bold text-sm whitespace-nowrap">{pending}</td>
                    <td className="text-center py-3 px-4 text-purple-600 font-bold text-sm whitespace-nowrap">{inProgress}</td>
                    <td className="text-center py-3 px-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        efficiency >= 80 ? 'bg-green-100 text-green-700' :
                        efficiency >= 60 ? 'bg-blue-100 text-blue-700' :
                        efficiency >= 40 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {efficiency}%
                      </span>
                    </td>
                    <td className="text-center py-3 px-4 whitespace-nowrap">
                      {isAvailable ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs flex items-center justify-center gap-1">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                          <span>Available</span>
                        </span>
                      ) : isBusy ? (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                          Busy
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                          {tailor.status || 'Unknown'}
                        </span>
                      )}
                    </td>
                    <td className="text-right py-3 px-4 whitespace-nowrap">
                      <button
                        onClick={() => handleViewTailor(tailor._id)}
                        className="text-xs px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition whitespace-nowrap"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" className="text-center py-8 text-gray-500">
                  <Scissors size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No tailors found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>

    {/* Stats Summary */}
    {tailorStats && (
      <div className="mt-4 pt-3 border-t border-gray-200 grid grid-cols-3 gap-3 text-center">
        <div className="bg-blue-50 p-2 rounded-lg">
          <span className="block font-bold text-blue-700 text-base">{tailorStats?.total || 0}</span>
          <span className="text-gray-500 text-xs">Total</span>
        </div>
        <div className="bg-green-50 p-2 rounded-lg">
          <span className="block font-bold text-green-600 text-base">{tailorStats?.active || 0}</span>
          <span className="text-gray-500 text-xs">Available</span>
        </div>
        <div className="bg-orange-50 p-2 rounded-lg">
          <span className="block font-bold text-orange-600 text-base">{tailorStats?.onLeave || 0}</span>
          <span className="text-gray-500 text-xs">On Leave</span>
        </div>
      </div>
    )}
  </div>
</div>


        {/* ===== STORE KEEPER SECTION (if not admin) - Responsive ===== */}
       {/* ===== STORE KEEPER SECTION ===== */}
{!isAdmin && isStoreKeeper && (
  <div className="mb-6 lg:mb-8">
    <div className="bg-white rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h2 className="text-sm sm:text-base lg:text-lg font-bold text-slate-800 flex items-center gap-2">
          <Store size={16} className="text-green-600 sm:w-5 sm:h-5" />
          <span>Store Overview</span>
        </h2>
        <button
          onClick={loadDashboardData}
          className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-lg transition-all"
          title="Refresh"
          disabled={isLoading}
        >
          <RefreshCw size={12} className={isLoading ? 'animate-spin text-blue-600' : 'text-slate-400'} />
        </button>
      </div>

      {/* Today's Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
        {/* Today's Income Card */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 sm:p-5 rounded-xl border-l-4 border-green-500 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs sm:text-sm text-green-600 font-medium mb-1">Today's Income</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-black text-green-700">
                ₹{safeFormat(todaySummary?.totalIncome || 0)}
              </p>
              <p className="text-[10px] sm:text-xs text-green-500 mt-1">
                {dateRange === 'today' ? 'Today' : 
                 dateRange === 'week' ? 'This Week' : 
                 dateRange === 'month' ? 'This Month' : 'Custom Range'}
              </p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-200 rounded-xl flex items-center justify-center">
              <TrendingUp size={16} className="text-green-600 sm:w-5 sm:h-5" />
            </div>
          </div>
        </div>

        {/* Today's Expenses Card */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 sm:p-5 rounded-xl border-l-4 border-red-500 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs sm:text-sm text-red-600 font-medium mb-1">Today's Expenses</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-black text-red-700">
                ₹{safeFormat(todaySummary?.totalExpense || 0)}
              </p>
              <p className="text-[10px] sm:text-xs text-red-500 mt-1">
                {dateRange === 'today' ? 'Today' : 
                 dateRange === 'week' ? 'This Week' : 
                 dateRange === 'month' ? 'This Month' : 'Custom Range'}
              </p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-200 rounded-xl flex items-center justify-center">
              <TrendingDown size={16} className="text-red-600 sm:w-5 sm:h-5" />
            </div>
          </div>
        </div>

        {/* Net Today Card */}
        <div className={`bg-gradient-to-br p-4 sm:p-5 rounded-xl border-l-4 shadow-sm ${
          (todaySummary?.netAmount || 0) >= 0 
            ? 'from-blue-50 to-blue-100 border-blue-500' 
            : 'from-orange-50 to-orange-100 border-orange-500'
        }`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium mb-1 ${
                (todaySummary?.netAmount || 0) >= 0 ? 'text-blue-600' : 'text-orange-600'
              }">Net Today</p>
              <p className={`text-xl sm:text-2xl lg:text-3xl font-black ${
                (todaySummary?.netAmount || 0) >= 0 ? 'text-blue-700' : 'text-orange-700'
              }`}>
                ₹{safeFormat(todaySummary?.netAmount || 0)}
              </p>
              <p className="text-[10px] sm:text-xs text-slate-500 mt-1">
                Income - Expense
              </p>
            </div>
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center ${
              (todaySummary?.netAmount || 0) >= 0 ? 'bg-blue-200' : 'bg-orange-200'
            }`}>
              { (todaySummary?.netAmount || 0) >= 0 ? (
                <TrendingUp size={16} className="text-blue-600 sm:w-5 sm:h-5" />
              ) : (
                <TrendingDown size={16} className="text-orange-600 sm:w-5 sm:h-5" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cash & Bank Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
        {/* Hand Cash Summary */}
        <div className="bg-orange-50 rounded-lg p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <Wallet size={14} className="text-orange-600 sm:w-4 sm:h-4" />
            <h3 className="text-xs sm:text-sm font-semibold text-orange-800">Hand Cash</h3>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center">
            <div>
              <p className="text-[10px] sm:text-xs text-orange-600">Income</p>
              <p className="text-xs sm:text-sm font-bold text-orange-700">₹{safeFormat(todaySummary?.handCash?.income || 0)}</p>
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-orange-600">Expense</p>
              <p className="text-xs sm:text-sm font-bold text-orange-700">₹{safeFormat(todaySummary?.handCash?.expense || 0)}</p>
            </div>
            <div className="col-span-2 mt-1 pt-1 border-t border-orange-200">
              <p className="text-[10px] sm:text-xs text-orange-600">Balance</p>
              <p className={`text-xs sm:text-sm font-bold ${
                (todaySummary?.handCash?.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                ₹{safeFormat(todaySummary?.handCash?.balance || 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Bank Summary */}
        <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <Landmark size={14} className="text-blue-600 sm:w-4 sm:h-4" />
            <h3 className="text-xs sm:text-sm font-semibold text-blue-800">Bank Account</h3>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center">
            <div>
              <p className="text-[10px] sm:text-xs text-blue-600">Income</p>
              <p className="text-xs sm:text-sm font-bold text-blue-700">₹{safeFormat(todaySummary?.bank?.income || 0)}</p>
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-blue-600">Expense</p>
              <p className="text-xs sm:text-sm font-bold text-blue-700">₹{safeFormat(todaySummary?.bank?.expense || 0)}</p>
            </div>
            <div className="col-span-2 mt-1 pt-1 border-t border-blue-200">
              <p className="text-[10px] sm:text-xs text-blue-600">Balance</p>
              <p className={`text-xs sm:text-sm font-bold ${
                (todaySummary?.bank?.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                ₹{safeFormat(todaySummary?.bank?.balance || 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links for Store Keeper */}
      <div className="mt-4 sm:mt-6">
        <h3 className="text-xs sm:text-sm font-semibold text-slate-700 mb-3 sm:mb-4 flex items-center gap-2">
          <Zap size={12} className="text-yellow-500 sm:w-4 sm:h-4" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          <Link 
            to={`${basePath}/banking/income`}
            className="bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 p-3 sm:p-4 rounded-xl text-center transition-all border border-green-200 group"
          >
            <TrendingUp size={16} className="text-green-600 mx-auto mb-1.5 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] sm:text-xs font-medium text-green-700">Add Income</span>
          </Link>
          <Link 
            to={`${basePath}/banking/expense`}
            className="bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 p-3 sm:p-4 rounded-xl text-center transition-all border border-red-200 group"
          >
            <TrendingDown size={16} className="text-red-600 mx-auto mb-1.5 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] sm:text-xs font-medium text-red-700">Add Expense</span>
          </Link>
          <Link 
            to={`${basePath}/orders/new`}
            className="bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 p-3 sm:p-4 rounded-xl text-center transition-all border border-blue-200 group"
          >
            <ShoppingCart size={16} className="text-blue-600 mx-auto mb-1.5 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] sm:text-xs font-medium text-blue-700">New Order</span>
          </Link>
          <Link 
            to={`${basePath}/add-customer`}
            className="bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 p-3 sm:p-4 rounded-xl text-center transition-all border border-purple-200 group"
          >
            <UserPlus size={16} className="text-purple-600 mx-auto mb-1.5 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] sm:text-xs font-medium text-purple-700">Add Customer</span>
          </Link>
        </div>
      </div>

      {/* Today's Transactions Preview (if any) */}
      {todaySummary?.count > 0 && (
        <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Clock size={12} className="text-slate-500" />
              Today's Activity
              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">
                {todaySummary?.count || 0} transactions
              </span>
            </h3>
            <Link 
              to={`${basePath}/banking/overview`}
              className="text-[10px] sm:text-xs text-blue-600 hover:underline flex items-center gap-1"
            >
              View All <ArrowRight size={10} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px] sm:text-xs">
            <div className="flex items-center justify-between bg-green-50 p-2 rounded-lg">
              <span className="text-green-600">Income</span>
              <span className="font-bold text-green-700">+₹{safeFormat(todaySummary?.totalIncome || 0)}</span>
            </div>
            <div className="flex items-center justify-between bg-red-50 p-2 rounded-lg">
              <span className="text-red-600">Expense</span>
              <span className="font-bold text-red-700">-₹{safeFormat(todaySummary?.totalExpense || 0)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {todaySummary?.count === 0 && (
        <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-slate-100 text-center py-4 sm:py-6">
          <Store size={24} className="text-slate-300 mx-auto mb-2 sm:w-8 sm:h-8" />
          <p className="text-xs sm:text-sm text-slate-500">No transactions recorded today</p>
          <p className="text-[10px] sm:text-xs text-slate-400 mt-1">
            Add income or expense to see your daily summary
          </p>
          <div className="flex gap-2 justify-center mt-3">
            <Link 
              to={`${basePath}/banking/income`}
              className="text-[10px] sm:text-xs px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
            >
              Add Income
            </Link>
            <Link 
              to={`${basePath}/banking/expense`}
              className="text-[10px] sm:text-xs px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              Add Expense
            </Link>
          </div>
        </div>
      )}
    </div>
  </div>
)}

        {/* ===== ROLE-BASED QUICK ACTIONS FLOATING MENU - Responsive ===== */}
        <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50">
          <div className="relative group">
            {/* Main FAB Button */}
            <button className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg flex items-center justify-center text-white transition-all group-hover:scale-110 group-hover:shadow-xl">
              <Plus size={16} className="sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
            </button>
            
            {/* Quick Actions Menu - Appears on hover */}
            <div className="absolute bottom-12 sm:bottom-14 lg:bottom-16 right-0 bg-white rounded-xl shadow-xl p-2 min-w-[200px] sm:min-w-[220px] lg:min-w-[240px] hidden group-hover:block animate-fade-in-up">
              {/* Header */}
              <div className="text-xs sm:text-sm font-medium text-slate-700 px-2 sm:px-3 py-2 border-b border-slate-100 mb-1">
                Quick Actions
                {isStoreKeeper && (
                  <span className="ml-2 text-[8px] sm:text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
                    Store
                  </span>
                )}
                {isAdmin && (
                  <span className="ml-2 text-[8px] sm:text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">
                    Admin
                  </span>
                )}
              </div>
              
              {/* Menu Items - Dynamically generated based on role */}
              {quickActions.map((action, index) => (
                <Link 
                  key={index}
                  to={action.path} 
                  className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-2.5 hover:bg-slate-50 rounded-lg text-slate-600 transition-all group/item"
                >
                  <div className={`w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-${action.color}-100 rounded-lg flex items-center justify-center group-hover/item:bg-${action.color}-200 transition-all`}>
                    <action.icon size={12} className={`text-${action.color}-600 sm:w-4 sm:h-4`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs sm:text-sm font-medium block truncate">{action.label}</span>
                    <p className="text-[8px] sm:text-xs text-slate-400 truncate">{action.description}</p>
                  </div>
                </Link>
              ))}

              {/* Divider */}
              <div className="border-t border-slate-100 my-1"></div>

              {/* View All Link */}
              <Link 
                to={`${basePath}/quick-actions`} 
                className="flex items-center justify-between px-2 sm:px-3 py-2 hover:bg-slate-50 rounded-lg text-blue-600 text-xs sm:text-sm"
              >
                <span>View all actions</span>
                <ArrowRight size={10} className="sm:w-3 sm:h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-3 sm:p-4 flex items-center gap-2 sm:gap-3 shadow-xl">
              <RefreshCw size={14} className="animate-spin text-blue-600 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm">Loading dashboard...</span>
            </div>
          </div>
        )}
      </div>

      {/* Add animation styles */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}



















// // Pages/Dashboard/AdminDashboard.jsx - COMPLETE FIXED VERSION
// import React, { useState, useEffect, useMemo, useCallback } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { Link, useNavigate } from 'react-router-dom';
// import {
//   ShoppingCart,
//   IndianRupee,
//   Truck,
//   Landmark,
//   Scissors,
//   TrendingUp,
//   Clock,
//   ArrowRight,
//   RefreshCw,
//   Eye,
//   Package,
//   AlertCircle,
//   Filter,
//   Calendar,
//   UserCheck as UserCheckIcon,
//   Layers,
//   Loader,
//   Plus,
//   UserPlus,
//   Receipt,
//   DollarSign,
//   Users,
//   Store,
//   Shield,
//   Wallet,
//   TrendingDown,
//   ChevronRight,
//   Zap,
//   Activity,
//   Grid,
//   List,
//   User as UserIcon,
//   Bell,
//   Search,
//   X,
//   Menu
// } from 'lucide-react';
// import {
//   PieChart as RePieChart,
//   Pie,
//   Cell,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid
// } from 'recharts';
// import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, subMonths, startOfQuarter, endOfQuarter, startOfYear, endOfYear } from 'date-fns';

// import { 
//   fetchOrderStats, 
//   fetchRecentOrders,
//   selectOrderStats,
//   selectRecentOrders 
// } from '../../features/order/orderSlice';

// import {
//   fetchWorkStats,
//   fetchRecentWorks,
//   selectWorkStats,
//   selectRecentWorks
// } from '../../features/work/workSlice';

// import {
//   fetchTailorStats,
//   fetchTailorPerformance,
//   fetchTopTailors,
//   selectTailorStats,
//   selectTailorPerformance,
//   selectTailorPerformanceSummary,
//   selectTailorPerformanceLoading,
//   selectTopTailors,
//   selectTopTailorsLoading
// } from '../../features/tailor/tailorSlice';

// import {
//   fetchDailyRevenueStats,
//   selectDailyRevenueData,
//   selectDailyRevenueSummary,
//   selectDailyRevenueLoading,
//   fetchTodayTransactions,
//   selectTodaySummary,
//   selectTodayLoading
// } from '../../features/transaction/transactionSlice';

// import StatCard from '../../components/common/StatCard';
// import showToast from '../../utils/toast';

// export default function AdminDashboard() {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { user } = useSelector((state) => state.auth);
  
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  
//   const isAdmin = user?.role === "ADMIN";
//   const isStoreKeeper = user?.role === "STORE_KEEPER";
  
//   const basePath = useMemo(() => {
//     if (isAdmin) return "/admin";
//     if (isStoreKeeper) return "/storekeeper";
//     return "/cuttingmaster";
//   }, [isAdmin, isStoreKeeper]);
  
//   const dashboardTitle = isAdmin ? "Admin Dashboard" : isStoreKeeper ? "Store Keeper Dashboard" : "Dashboard";
  
//   // ===== REDUX SELECTORS =====
//   const orderStats = useSelector(selectOrderStats) || { total: 0, confirmed: 0, delivered: 0, cancelled: 0, draft: 0, 'in-progress': 0, 'ready-to-delivery': 0 };
//   const recentOrders = useSelector(selectRecentOrders) || [];
//   const workStats = useSelector(selectWorkStats) || { total: 0, pending: 0, accepted: 0, cuttingStarted: 0, cuttingCompleted: 0, sewingStarted: 0, sewingCompleted: 0, ironing: 0, readyToDeliver: 0 };
//   const recentWorks = useSelector(selectRecentWorks) || [];
//   const tailorStats = useSelector(selectTailorStats) || { total: 0, active: 0, busy: 0, idle: 0, onLeave: 0 };
//   const tailorPerformance = useSelector(selectTailorPerformance) || [];
//   const topTailors = useSelector(selectTopTailors) || [];
//   const performanceLoading = useSelector(selectTailorPerformanceLoading);
//   const todaySummary = useSelector(selectTodaySummary) || { totalIncome: 0, totalExpense: 0, netAmount: 0 };
  
//   // ===== DIRECT API STATE (to bypass Redux issue) =====
//   const [directRevenue, setDirectRevenue] = useState({
//     totalRevenue: 0,
//     totalExpense: 0,
//     netProfit: 0
//   });
//   const [directChartData, setDirectChartData] = useState([]);
  
//   const [isLoading, setIsLoading] = useState(false);
//   const [dateRange, setDateRange] = useState('today');
//   const [customStartDate, setCustomStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
//   const [customEndDate, setCustomEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
//   const [showCustomPicker, setShowCustomPicker] = useState(false);
//   const [lastRefreshed, setLastRefreshed] = useState(new Date());
//   const [workViewMode, setWorkViewMode] = useState('grid');
  
//   const [queueSearch, setQueueSearch] = useState("");
//   const [queueStatus, setQueueStatus] = useState("all");
//   const [sortBy, setSortBy] = useState("priority");
//   const [selectedView, setSelectedView] = useState("all");

//   // ===== STATUS CONFIG =====
//   const STATUS_CONFIG = {
//     'draft': { color: '#94a3b8', label: 'Draft', bg: 'bg-slate-100' },
//     'confirmed': { color: '#f59e0b', label: 'Confirmed', bg: 'bg-amber-100' },
//     'in-progress': { color: '#3b82f6', label: 'In Progress', bg: 'bg-blue-100' },
//     'ready-to-delivery': { color: '#10b981', label: 'Ready', bg: 'bg-emerald-100' },
//     'delivered': { color: '#6b7280', label: 'Delivered', bg: 'bg-gray-100' },
//     'cancelled': { color: '#ef4444', label: 'Cancelled', bg: 'bg-red-100' }
//   };

//   const WORK_STATUS_CONFIG = {
//     'pending': { color: '#f59e0b', label: '⏳ Pending', bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '⏳' },
//     'accepted': { color: '#3b82f6', label: '✅ Accepted', bg: 'bg-blue-100', text: 'text-blue-800', icon: '✅' },
//     'cutting-started': { color: '#8b5cf6', label: '✂️ Cutting Started', bg: 'bg-purple-100', text: 'text-purple-800', icon: '✂️' },
//     'cutting-completed': { color: '#6366f1', label: '✔️ Cutting Completed', bg: 'bg-indigo-100', text: 'text-indigo-800', icon: '✔️' },
//     'sewing-started': { color: '#ec4899', label: '🧵 Sewing Started', bg: 'bg-pink-100', text: 'text-pink-800', icon: '🧵' },
//     'sewing-completed': { color: '#14b8a6', label: '🧵 Sewing Completed', bg: 'bg-teal-100', text: 'text-teal-800', icon: '🧵' },
//     'ironing': { color: '#f97316', label: '🔥 Ironing', bg: 'bg-orange-100', text: 'text-orange-800', icon: '🔥' },
//     'ready-to-deliver': { color: '#22c55e', label: '📦 Ready to Deliver', bg: 'bg-green-100', text: 'text-green-800', icon: '📦' }
//   };

//   // ===== PRIORITY FUNCTIONS =====
//   const getWorkPriority = useCallback((work) => {
//     if (!work) return 'normal';
//     if (work.garment && typeof work.garment === 'object') {
//       return work.garment.priority || 'normal';
//     }
//     return 'normal';
//   }, []);

//   const getPriorityBadge = useCallback((work) => {
//     const priority = getWorkPriority(work);
//     if (priority === 'high') {
//       return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold">🔴 High Priority</span>;
//     }
//     if (priority === 'normal') {
//       return <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">🟠 Normal</span>;
//     }
//     return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">🟢 Low</span>;
//   }, [getWorkPriority]);

//   // ===== FETCH REVENUE DIRECTLY FROM API =====
//   const fetchRevenueDirectly = useCallback(async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await fetch('/api/transactions/daily-stats?period=today', {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });
//       const data = await response.json();
      
//       if (data?.data?.summary) {
//         setDirectRevenue({
//           totalRevenue: data.data.summary.totalRevenue || 0,
//           totalExpense: data.data.summary.totalExpense || 0,
//           netProfit: data.data.summary.netProfit || 0
//         });
//         setDirectChartData(data.data.chartData || []);
//         console.log('✅ Revenue fetched directly:', data.data.summary.totalRevenue);
//       }
//     } catch (error) {
//       console.error('Error fetching revenue:', error);
//     }
//   }, []);

//   // ===== LOAD DASHBOARD DATA =====
//   const loadDashboardData = async () => {
//     setIsLoading(true);
//     try {
//       const params = getDateParams();
      
//       const revenueParams = { period: dateRange };
//       if (dateRange === 'custom') {
//         revenueParams.startDate = customStartDate;
//         revenueParams.endDate = customEndDate;
//       }
      
//       const promises = [
//         dispatch(fetchOrderStats(params)),
//         dispatch(fetchRecentOrders({ ...params, limit: 10 })),
//         dispatch(fetchWorkStats(params)),
//         dispatch(fetchRecentWorks({ ...params, limit: 20 })),
//         dispatch(fetchTailorStats()),
//         dispatch(fetchDailyRevenueStats(revenueParams)),
//         dispatch(fetchTodayTransactions())
//       ];
      
//       if (isAdmin || isStoreKeeper) {
//         promises.push(
//           dispatch(fetchTailorPerformance({ period: dateRange })),
//           dispatch(fetchTopTailors({ limit: 10, period: dateRange }))
//         );
//       }
      
//       await Promise.allSettled(promises);
//       await fetchRevenueDirectly(); // Fetch directly for reliable data
      
//       setLastRefreshed(new Date());
//     } catch (error) {
//       console.error('Error loading dashboard:', error);
//       showToast.error('Failed to load dashboard data');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const getDateParams = () => {
//     const now = new Date();
//     const istDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
//     const todayStr = format(istDate, 'yyyy-MM-dd');
    
//     switch(dateRange) {
//       case 'today': return { period: 'today', startDate: todayStr, endDate: todayStr };
//       case 'week': return { period: 'week', startDate: format(startOfWeek(istDate), 'yyyy-MM-dd'), endDate: format(endOfWeek(istDate), 'yyyy-MM-dd') };
//       case 'month': return { period: 'month', startDate: format(startOfMonth(istDate), 'yyyy-MM-dd'), endDate: format(endOfMonth(istDate), 'yyyy-MM-dd') };
//       case 'custom': return { period: 'custom', startDate: customStartDate, endDate: customEndDate };
//       default: return { period: 'month' };
//     }
//   };

//   useEffect(() => {
//     loadDashboardData();
//   }, [dateRange, customStartDate, customEndDate]);

//   useEffect(() => {
//     fetchRevenueDirectly();
//   }, [dateRange]);

//   // ===== HELPER FUNCTIONS =====
//   const safeFormat = (value) => (value || 0).toLocaleString('en-IN');
  
//   const getStatusBadge = (status) => {
//     const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
//     return `${config.bg} text-gray-700 px-2 py-1 text-xs rounded-full`;
//   };

//   const getWorkStatusBadge = (status) => {
//     const config = WORK_STATUS_CONFIG[status] || WORK_STATUS_CONFIG.pending;
//     return `${config.bg} ${config.text} px-2 py-1 rounded-full text-xs font-medium`;
//   };

//   const getWorkStatusDisplay = (status) => {
//     const config = WORK_STATUS_CONFIG[status] || WORK_STATUS_CONFIG.pending;
//     return config.label;
//   };

//   const getDueStatus = (date) => {
//     if (!date) return { label: "No due date", color: "text-gray-600", icon: <Calendar size={12} /> };
//     const diff = new Date(date) - new Date();
//     const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
//     if (days === 0) return { label: "Due Today 🚨", color: "text-red-600", icon: <Bell size={12} /> };
//     if (days < 0) return { label: `Overdue by ${Math.abs(days)} days`, color: "text-red-600", icon: <AlertCircle size={12} /> };
//     return { label: `Due in ${days} days`, color: "text-green-600", icon: <Calendar size={12} /> };
//   };

//   const filteredWorks = useMemo(() => {
//     let filtered = recentWorks || [];
//     if (queueSearch) {
//       const term = queueSearch.toLowerCase();
//       filtered = filtered.filter(w => w.workId?.toLowerCase().includes(term));
//     }
//     if (queueStatus !== "all") filtered = filtered.filter(w => w.status === queueStatus);
//     if (selectedView === "new") filtered = filtered.filter(w => w.status === "pending");
//     if (selectedView === "need-tailor") filtered = filtered.filter(w => w.status === "accepted" && !w.tailor);
//     return filtered;
//   }, [recentWorks, queueSearch, queueStatus, selectedView]);

//   const prioritizedQueue = useMemo(() => {
//     return [...filteredWorks].sort((a, b) => {
//       const priority = { high: 1, normal: 2, low: 3 };
//       const aPri = priority[a.garment?.priority] || 2;
//       const bPri = priority[b.garment?.priority] || 2;
//       const dateA = a.estimatedDelivery ? new Date(a.estimatedDelivery) : new Date(8640000000000000);
//       const dateB = b.estimatedDelivery ? new Date(b.estimatedDelivery) : new Date(8640000000000000);
//       if (sortBy === "priority") return aPri !== bPri ? aPri - bPri : dateA - dateB;
//       return dateA !== dateB ? dateA - dateB : aPri - bPri;
//     });
//   }, [filteredWorks, sortBy]);

//   const orderStatusData = Object.entries(STATUS_CONFIG).map(([key, config]) => ({
//     name: config.label, value: orderStats[key] || 0, color: config.color
//   })).filter(item => item.value > 0);

//   const displayPerformers = (isAdmin || isStoreKeeper) ? (topTailors.length > 0 ? topTailors : tailorPerformance) : [];

//   const quickActions = [
//     { label: 'New Order', icon: ShoppingCart, path: `${basePath}/orders/new`, color: 'blue', description: 'Create a new order' },
//     { label: 'Add Customer', icon: UserPlus, path: `${basePath}/add-customer`, color: 'green', description: 'Register new customer' },
//     { label: 'Add Expense', icon: Receipt, path: `${basePath}/banking/expense`, color: 'red', description: 'Record an expense' },
//     { label: 'Add Income', icon: DollarSign, path: `${basePath}/banking/income`, color: 'green', description: 'Record an income' }
//   ];

//   const handleViewTailor = (id) => navigate(`${basePath}/tailors/${id}`);
//   const handleViewWork = (id) => navigate(`${basePath}/works/${id}`);

//   return (
//     <div className="min-h-screen bg-slate-50">
//       {/* Mobile Header - Simplified */}
//       <div className="lg:hidden bg-white border-b sticky top-0 z-30">
//         <div className="flex items-center justify-between px-4 py-3">
//           <h1 className="text-lg font-black text-slate-800 flex items-center gap-2">
//             {isAdmin ? <Shield size={20} className="text-purple-600" /> : <Store size={20} className="text-green-600" />}
//             <span className="truncate max-w-[150px]">{dashboardTitle}</span>
//           </h1>
//           <div className="flex gap-2">
//             <button onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)} className="p-2 bg-slate-100 rounded-lg">
//               <Filter size={18} />
//             </button>
//             <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 bg-slate-100 rounded-lg">
//               <Menu size={18} />
//             </button>
//           </div>
//         </div>
        
//         {mobileFiltersOpen && (
//           <div className="absolute top-full left-4 right-4 mt-2 bg-white rounded-xl shadow-xl p-4 z-40">
//             <div className="space-y-2">
//               {['today', 'week', 'month'].map(range => (
//                 <button key={range} onClick={() => { setDateRange(range); setMobileFiltersOpen(false); }}
//                   className={`w-full px-4 py-3 rounded-lg text-sm font-medium ${dateRange === range ? 'bg-blue-600 text-white' : 'bg-slate-100'}`}>
//                   {range === 'today' ? 'Today' : range === 'week' ? 'This Week' : 'This Month'}
//                 </button>
//               ))}
//               <button onClick={() => { setShowCustomPicker(true); setMobileFiltersOpen(false); }}
//                 className={`w-full px-4 py-3 rounded-lg text-sm font-medium ${dateRange === 'custom' ? 'bg-blue-600 text-white' : 'bg-slate-100'}`}>
//                 Custom Range
//               </button>
//             </div>
//           </div>
//         )}
        
//         {mobileMenuOpen && (
//           <div className="absolute top-full left-0 right-0 bg-white shadow-lg p-4 z-40">
//             {['dashboard', 'orders', 'customers', 'banking/overview', 'tailors'].map(item => (
//               <button key={item} onClick={() => { navigate(`${basePath}/${item}`); setMobileMenuOpen(false); }}
//                 className="w-full text-left px-4 py-3 hover:bg-slate-100 rounded-xl font-medium">
//                 {item === 'dashboard' ? 'Dashboard' : item === 'banking/overview' ? 'Banking' : item.charAt(0).toUpperCase() + item.slice(1)}
//               </button>
//             ))}
//           </div>
//         )}
//       </div>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
//         {/* Desktop Header */}
//         <div className="hidden lg:flex lg:items-center justify-between mb-8">
//           <div>
//             <h1 className="text-3xl font-black text-slate-800">{dashboardTitle}</h1>
//             <p className="text-slate-600 mt-1">{format(new Date(), 'EEEE, MMMM do, yyyy')}</p>
//             <p className="text-xs text-gray-400">Last refreshed: {format(lastRefreshed, 'hh:mm:ss a')}</p>
//           </div>
//           <div className="flex gap-2 bg-white p-2 rounded-xl shadow-sm">
//             {['today', 'week', 'month'].map(range => (
//               <button key={range} onClick={() => { setDateRange(range); setShowCustomPicker(false); }}
//                 className={`px-4 py-2 rounded-lg font-medium ${dateRange === range ? 'bg-blue-600 text-white' : 'hover:bg-slate-100'}`}>
//                 {range === 'today' ? 'Today' : range === 'week' ? 'This Week' : 'This Month'}
//               </button>
//             ))}
//             <button onClick={() => setShowCustomPicker(!showCustomPicker)} className={`px-4 py-2 rounded-lg font-medium flex items-center gap-1 ${showCustomPicker ? 'bg-blue-600 text-white' : 'hover:bg-slate-100'}`}>
//               <Calendar size={16} /> Custom
//             </button>
//             <button onClick={loadDashboardData} className="p-2 hover:bg-slate-100 rounded-lg"><RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} /></button>
//           </div>
//         </div>

//         {showCustomPicker && (
//           <div className="mb-4 bg-white p-4 rounded-xl shadow-sm">
//             <div className="flex flex-wrap gap-4 items-end">
//               <div><label className="text-xs text-slate-500">Start Date</label><input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} className="px-3 py-2 border rounded-lg" /></div>
//               <div><label className="text-xs text-slate-500">End Date</label><input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} className="px-3 py-2 border rounded-lg" /></div>
//               <button onClick={() => { setDateRange('custom'); setShowCustomPicker(false); loadDashboardData(); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Apply</button>
//               <button onClick={() => setShowCustomPicker(false)} className="px-4 py-2 bg-slate-100 rounded-lg">Cancel</button>
//             </div>
//           </div>
//         )}

//         {/* KPI CARDS */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//           <StatCard title="Total Orders" value={safeFormat(orderStats?.total)} icon={<ShoppingCart size={20} />} bgColor="bg-blue-50">
//             <div className="grid grid-cols-3 gap-1 text-xs mt-2"><div className="bg-white p-1 rounded text-center"><span className="text-slate-500">Pending</span><p className="font-bold text-orange-600">{orderStats.confirmed + orderStats.draft}</p></div><div className="bg-white p-1 rounded text-center"><span className="text-slate-500">Progress</span><p className="font-bold text-blue-600">{orderStats['in-progress']}</p></div><div className="bg-white p-1 rounded text-center"><span className="text-slate-500">Completed</span><p className="font-bold text-green-600">{orderStats.delivered}</p></div></div>
//           </StatCard>
          
//           <StatCard title="Revenue" value={`₹${safeFormat(directRevenue.totalRevenue)}`} icon={<IndianRupee size={20} />} bgColor="bg-green-50">
//             <div className="flex gap-2 text-xs mt-2"><div className="bg-white p-1 flex-1 text-center"><span className="text-slate-500">Expense</span><p className="font-bold text-red-600">₹{safeFormat(directRevenue.totalExpense)}</p></div><div className="bg-white p-1 flex-1 text-center"><span className="text-slate-500">Profit</span><p className="font-bold text-green-600">₹{safeFormat(directRevenue.netProfit)}</p></div></div>
//           </StatCard>
          
//           <StatCard title="Total Works" value={safeFormat(workStats.total)} icon={<Layers size={20} />} bgColor="bg-purple-50">
//             <div className="grid grid-cols-4 gap-1 text-[10px] mt-2"><div className="bg-white p-1 text-center">⏳<p className="font-bold text-orange-600">{workStats.pending}</p></div><div className="bg-white p-1 text-center">✅<p className="font-bold text-blue-600">{workStats.accepted}</p></div><div className="bg-white p-1 text-center">✂️<p className="font-bold text-purple-600">{workStats.cuttingStarted + workStats.cuttingCompleted}</p></div><div className="bg-white p-1 text-center">🧵<p className="font-bold text-pink-600">{workStats.sewingStarted + workStats.sewingCompleted}</p></div></div>
//           </StatCard>
          
//           <StatCard title="Active Tailors" value={safeFormat(tailorStats.active)} icon={<Scissors size={20} />} bgColor="bg-purple-50">
//             <div className="grid grid-cols-3 gap-1 text-xs mt-2"><div className="bg-white p-1 text-center">Working<p className="font-bold text-green-600">{tailorStats.busy}</p></div><div className="bg-white p-1 text-center">Idle<p className="font-bold text-slate-600">{tailorStats.idle}</p></div><div className="bg-white p-1 text-center">Leave<p className="font-bold text-orange-600">{tailorStats.onLeave}</p></div></div>
//           </StatCard>
//         </div>


//         {/* Revenue Trend Chart */}
//         <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
//           <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><TrendingUp size={20} className="text-green-600" />Revenue Trend <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">{dateRange === 'today' ? 'Today (Hourly)' : dateRange === 'week' ? 'Last 7 Days' : 'This Month'}</span></h2>
//           <div className="h-64">
//             <ResponsiveContainer width="100%" height="100%">
//               <LineChart data={directChartData}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey={dateRange === 'today' ? 'time' : 'day'} tick={{ fontSize: 12 }} />
//                 <YAxis tickFormatter={(v) => `₹${v/1000}K`} />
//                 <Tooltip formatter={(v) => `₹${v}`} />
//                 <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={false} />
//                 <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} dot={false} />
//               </LineChart>
//             </ResponsiveContainer>
//           </div>
//           <div className="grid grid-cols-3 gap-4 mt-4">
//             <div className="bg-blue-50 p-3 rounded-lg"><p className="text-xs text-blue-600">Total Revenue</p><p className="text-xl font-bold text-blue-800">₹{safeFormat(directRevenue.totalRevenue)}</p></div>
//             <div className="bg-red-50 p-3 rounded-lg"><p className="text-xs text-red-600">Total Expense</p><p className="text-xl font-bold text-red-800">₹{safeFormat(directRevenue.totalExpense)}</p></div>
//             <div className="bg-green-50 p-3 rounded-lg"><p className="text-xs text-green-600">Net Profit</p><p className="text-xl font-bold text-green-800">₹{safeFormat(directRevenue.netProfit)}</p></div>
//           </div>
//         </div>

//         {/* Production Status */}
//         <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
//           <div className="flex justify-between items-center mb-4">
//             <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Layers size={20} className="text-purple-600" />Production Status</h2>
//             <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
//               <button onClick={() => setWorkViewMode('grid')} className={`px-3 py-1 text-xs rounded-md ${workViewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-gray-600'}`}>Grid</button>
//               <button onClick={() => setWorkViewMode('list')} className={`px-3 py-1 text-xs rounded-md ${workViewMode === 'list' ? 'bg-purple-600 text-white' : 'text-gray-600'}`}>List</button>
//             </div>
//           </div>
          
//           <div className="grid grid-cols-4 gap-3 mb-4">
//             {Object.entries(WORK_STATUS_CONFIG).map(([status, config]) => {
//               let count = workStats[status.replace(/-/g, '')] || 0;
//               if (status === 'cutting-started') count = workStats.cuttingStarted;
//               if (status === 'cutting-completed') count = workStats.cuttingCompleted;
//               if (status === 'sewing-started') count = workStats.sewingStarted;
//               if (status === 'sewing-completed') count = workStats.sewingCompleted;
//               if (status === 'ready-to-deliver') count = workStats.readyToDeliver;
//               return (
//                 <div key={status} className="relative">
//                   <div className="flex justify-between text-xs"><span className="text-gray-600">{config.icon}</span><span className="font-bold">{count}</span></div>
//                   <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1"><div className="h-1.5 rounded-full" style={{ backgroundColor: config.color, width: workStats.total ? `${(count / workStats.total) * 100}%` : '0%' }} /></div>
//                 </div>
//               );
//             })}
//           </div>
          
//           <div className="flex items-center gap-2 text-xs justify-between mt-4 pt-3 border-t">
//             <span>Total: <strong className="text-purple-600">{workStats.total}</strong></span>
//             <span>Completed: <strong className="text-green-600">{workStats.readyToDeliver}</strong></span>
//             <span>In Progress: <strong className="text-blue-600">{workStats.cuttingStarted + workStats.cuttingCompleted + workStats.sewingStarted + workStats.sewingCompleted + workStats.ironing}</strong></span>
//           </div>
//         </div>

//         {/* Work Queue */}
//         <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
//           <div className="flex flex-wrap justify-between gap-4 mb-4">
//             <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Layers size={20} className="text-purple-600" />Work Queue <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">{prioritizedQueue.length} items</span></h2>
//             <div className="flex gap-2">
//               <div className="relative"><Search size={14} className="absolute left-3 top-2.5 text-gray-400" /><input type="text" value={queueSearch} onChange={(e) => setQueueSearch(e.target.value)} placeholder="Search..." className="pl-8 pr-3 py-1.5 border rounded-lg text-sm w-32" /></div>
//               <select value={queueStatus} onChange={(e) => setQueueStatus(e.target.value)} className="px-2 py-1.5 border rounded-lg text-sm"><option value="all">All</option><option value="pending">Pending</option><option value="accepted">Accepted</option></select>
//               <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-2 py-1.5 border rounded-lg text-sm"><option value="priority">Priority</option><option value="due">Due Date</option></select>
//             </div>
//           </div>
          
//           <div className="space-y-2 max-h-[400px] overflow-y-auto">
//             {prioritizedQueue.slice(0, 5).map(work => {
//               const due = getDueStatus(work.estimatedDelivery);
//               return (
//                 <div key={work._id} onClick={() => handleViewWork(work._id)} className={`border rounded-lg p-3 hover:shadow-md cursor-pointer ${getWorkStatusBadge(work.status)}`}>
//                   <div className="flex justify-between items-start">
//                     <div className="flex-1">
//                       <div className="flex items-center gap-2 mb-1"><span className="font-mono text-xs font-bold text-purple-600">#{work.workId}</span><span className={getWorkStatusBadge(work.status)}>{getWorkStatusDisplay(work.status)}</span>{getPriorityBadge(work)}</div>
//                       <h3 className="font-bold text-gray-800 text-sm">{typeof work.garment === 'object' ? work.garment?.name : 'Garment'}</h3>
//                       <div className="grid grid-cols-2 gap-2 text-xs mt-1"><span className="truncate">👤 {work.order?.customer?.name || 'Unknown'}</span><span className={`flex items-center gap-1 ${due.color}`}>{due.icon}{due.label}</span></div>
//                     </div>
//                     <Eye size={16} className="text-gray-400" />
//                   </div>
//                 </div>
//               );
//             })}
//             {prioritizedQueue.length === 0 && <div className="text-center py-8 text-gray-500"><Layers size={32} className="mx-auto mb-2 opacity-30" /><p>No items in work queue</p></div>}
//           </div>
//         </div>

//         {/* Tailor Performance */}
//         <div className="bg-white rounded-xl p-6 shadow-sm">
//           <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Users size={20} className="text-purple-600" />Tailor Performance</h2>
//           <div className="overflow-x-auto">
//             <table className="w-full min-w-[800px]">
//               <thead className="bg-gray-50"><tr><th className="text-left py-3 px-3 text-xs">Tailor</th><th className="text-center py-3 px-3 text-xs">Assigned</th><th className="text-center py-3 px-3 text-xs">Completed</th><th className="text-center py-3 px-3 text-xs">Pending</th><th className="text-center py-3 px-3 text-xs">Efficiency</th><th className="text-center py-3 px-3 text-xs">Status</th><th className="text-right py-3 px-3 text-xs">Action</th></tr></thead>
//               <tbody>
//                 {displayPerformers.slice(0, 5).map((tailor, idx) => {
//                   const assigned = tailor.assignedWorks || 0;
//                   const completed = tailor.completedWorks || 0;
//                   const efficiency = assigned ? Math.round((completed / assigned) * 100) : 0;
//                   return (
//                     <tr key={tailor._id || idx} className="border-b hover:bg-gray-50">
//                       <td className="py-3 px-3"><div className="font-medium">{tailor.name || 'Tailor'}</div><div className="text-xs text-gray-500">{tailor.specialization || 'General'}</div></td>
//                       <td className="text-center py-3 px-3 font-bold">{assigned}</td>
//                       <td className="text-center py-3 px-3 text-green-600 font-bold">{completed}</td>
//                       <td className="text-center py-3 px-3 text-yellow-600 font-bold">{assigned - completed}</td>
//                       <td className="text-center py-3 px-3"><span className={`px-2 py-1 rounded-full text-xs ${efficiency >= 80 ? 'bg-green-100 text-green-700' : efficiency >= 60 ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>{efficiency}%</span></td>
//                       <td className="text-center py-3 px-3"><span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Available</span></td>
//                       <td className="text-right py-3 px-3"><button onClick={() => handleViewTailor(tailor._id)} className="text-xs bg-purple-50 text-purple-600 px-3 py-1 rounded-lg">View</button></td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//           <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t text-center">
//             <div className="bg-blue-50 p-2 rounded"><p className="font-bold text-blue-700 text-lg">{tailorStats.total}</p><p className="text-xs text-gray-500">Total</p></div>
//             <div className="bg-green-50 p-2 rounded"><p className="font-bold text-green-600 text-lg">{tailorStats.active}</p><p className="text-xs text-gray-500">Available</p></div>
//             <div className="bg-orange-50 p-2 rounded"><p className="font-bold text-orange-600 text-lg">{tailorStats.onLeave}</p><p className="text-xs text-gray-500">On Leave</p></div>
//           </div>
//         </div>

//         {/* Store Keeper Section */}
//         {!isAdmin && isStoreKeeper && (
//           <div className="mt-6 bg-white rounded-xl p-6 shadow-sm">
//             <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Store size={20} className="text-green-600" />Store Overview</h2>
//             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
//               <div className="bg-green-50 p-4 rounded-xl border-l-4 border-green-500"><p className="text-sm text-green-600">Today's Income</p><p className="text-2xl font-bold text-green-700">₹{safeFormat(todaySummary.totalIncome)}</p></div>
//               <div className="bg-red-50 p-4 rounded-xl border-l-4 border-red-500"><p className="text-sm text-red-600">Today's Expenses</p><p className="text-2xl font-bold text-red-700">₹{safeFormat(todaySummary.totalExpense)}</p></div>
//               <div className="bg-blue-50 p-4 rounded-xl border-l-4 border-blue-500"><p className="text-sm text-blue-600">Net Today</p><p className="text-2xl font-bold text-blue-700">₹{safeFormat(todaySummary.netAmount)}</p></div>
//             </div>
//             <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
//               <Link to={`${basePath}/banking/income`} className="bg-green-50 p-3 rounded-xl text-center hover:bg-green-100"><TrendingUp size={20} className="text-green-600 mx-auto mb-1" /><span className="text-xs">Add Income</span></Link>
//               <Link to={`${basePath}/banking/expense`} className="bg-red-50 p-3 rounded-xl text-center hover:bg-red-100"><TrendingDown size={20} className="text-red-600 mx-auto mb-1" /><span className="text-xs">Add Expense</span></Link>
//               <Link to={`${basePath}/orders/new`} className="bg-blue-50 p-3 rounded-xl text-center hover:bg-blue-100"><ShoppingCart size={20} className="text-blue-600 mx-auto mb-1" /><span className="text-xs">New Order</span></Link>
//               <Link to={`${basePath}/add-customer`} className="bg-purple-50 p-3 rounded-xl text-center hover:bg-purple-100"><UserPlus size={20} className="text-purple-600 mx-auto mb-1" /><span className="text-xs">Add Customer</span></Link>
//             </div>
//           </div>
//         )}

//         {/* Floating Action Button */}
//         <div className="fixed bottom-6 right-6 z-50 group">
//           <button className="w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg flex items-center justify-center text-white transition-all group-hover:scale-110"><Plus size={20} /></button>
//           <div className="absolute bottom-14 right-0 bg-white rounded-xl shadow-xl p-2 min-w-[200px] hidden group-hover:block">
//             {quickActions.map((action, i) => (
//               <Link key={i} to={action.path} className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-lg"><div className={`w-8 h-8 bg-${action.color}-100 rounded-lg flex items-center justify-center`}><action.icon size={14} className={`text-${action.color}-600`} /></div><div><p className="text-sm font-medium">{action.label}</p><p className="text-xs text-slate-400">{action.description}</p></div></Link>
//             ))}
//           </div>
//         </div>

//         {isLoading && <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50"><div className="bg-white rounded-xl p-4 flex gap-2"><RefreshCw size={20} className="animate-spin text-blue-600" /><span>Loading...</span></div></div>}
//       </div>
//     </div>
//   );
// }
