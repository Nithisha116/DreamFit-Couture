// import { useState, useEffect, useRef } from "react";
// import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
// import { 
//   LayoutDashboard, ShoppingCart, Scissors, Users, Landmark, 
//   Package, Settings, Bell, Search, ChevronDown, 
//   ChevronRight, LogOut, UserCircle, Briefcase, Store, Ruler, X,
//   Calendar, Clock, CheckSquare, BarChart3, FileText, Truck,
//   HelpCircle, BookOpen, Award, Gift, CreditCard, Shield,
//   Flag, Target, TrendingUp, UserPlus, UserCheck, UserX,
//   HardHat, ClipboardList, Wallet, IndianRupee, Download, Filter,
//   PieChart, Activity, DollarSign, Receipt, Banknote, PiggyBank,
//   Menu, ChevronLeft
// } from "lucide-react";
// import { useSelector, useDispatch } from "react-redux";
// import { logout } from "../../features/auth/authSlice";
// import { fetchNotifications } from "../../features/notification/notificationSlice";
// import NotificationBell from "../common/NotificationBell";
// import logo from "../../assets/logo.png";

// export default function MainLayout() {
//   const { user } = useSelector((state) => state.auth);
//   const dispatch = useDispatch();
  
//   const [bankingOpen, setBankingOpen] = useState(false);
//   const [reportsOpen, setReportsOpen] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  
//   const navigate = useNavigate();
//   const location = useLocation();
//   const activeLinkRef = useRef(null);

//   const userId = user?._id || user?.id;

//   useEffect(() => {
//     if (userId) {
//       console.log("🔔 MainLayout - Fetching notifications for:", userId);
//       dispatch(fetchNotifications());
//     }
//   }, [dispatch, userId]);

//   useEffect(() => {
//     const handleFocus = () => {
//       if (userId) {
//         console.log("🔔 MainLayout - Page focused, syncing state");
//         dispatch(fetchNotifications());
//       }
//     };

//     window.addEventListener('focus', handleFocus);
//     return () => window.removeEventListener('focus', handleFocus);
//   }, [dispatch, userId]);

//   useEffect(() => {
//     const handleResize = () => {
//       if (window.innerWidth >= 1024) {
//         setSidebarOpen(false);
//         setDesktopSidebarOpen(true);
//       } else if (window.innerWidth >= 768) {
//         setSidebarOpen(false);
//         setDesktopSidebarOpen(false);
//       } else {
//         setDesktopSidebarOpen(false);
//         setSidebarOpen(false);
//       }
//     };

//     handleResize();
//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, []);

//   useEffect(() => {
//     setTimeout(() => {
//       if (activeLinkRef.current) {
//         activeLinkRef.current.scrollIntoView({
//           behavior: "smooth",
//           block: "nearest",
//         });
//       }
//     }, 100);
//   }, [location.pathname]);

//   const handleLogout = () => {
//     if (window.confirm("Are you sure you want to logout?")) {
//       dispatch(logout());
//       navigate("/");
//     }
//   };

//   const isAdmin = user?.role === "ADMIN";
//   const isStoreKeeper = user?.role === "STORE_KEEPER";
//   const isCuttingMaster = user?.role === "CUTTING_MASTER";
  
//   const canViewBanking = isAdmin || isStoreKeeper;
//   const canViewCustomers = isAdmin || isStoreKeeper;
//   const canViewStaff = isAdmin;
//   const canViewProducts = isAdmin || isStoreKeeper;
//   const canViewOrders = isAdmin || isStoreKeeper;
//   const canViewWorks = true;
//   const canViewMeasurement = isAdmin || isStoreKeeper;
//   const canViewTailors = true;
//   const canViewReports = isAdmin || isStoreKeeper;
//   const canViewSettings = isAdmin;
//   const canViewCuttingMasters = isAdmin;
//   const canViewStoreKeepers = isAdmin;

//   const isActive = (path) => {
//     if (path === '#') return false;
//     return location.pathname.includes(path);
//   };

//   const rolePath = user?.role === "ADMIN" ? "admin" : 
//                    user?.role === "STORE_KEEPER" ? "storekeeper" : 
//                    "cuttingmaster";

//   const bankingItems = [
//     { id: 'overview', label: 'Overview', icon: Wallet, path: `/${rolePath}/banking/overview` },
//     { id: 'income', label: 'Income', icon: TrendingUp, path: `/${rolePath}/banking/income` },
//     { id: 'expense', label: 'Expenses', icon: Receipt, path: `/${rolePath}/banking/expense` }
//   ];

//   const reportsItems = [
//     { id: 'sales', label: 'Sales Report', icon: TrendingUp, path: `/${rolePath}/reports/sales` },
//     { id: 'production', label: 'Production Report', icon: Briefcase, path: `/${rolePath}/reports/production` },
//     { id: 'inventory', label: 'Inventory Report', icon: Package, path: `/${rolePath}/reports/inventory` },
//   ];

//   const getNavigationItems = () => {
//     const items = [
//       { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', path: `/${rolePath}/dashboard`, show: true },
//       { id: 'customers', icon: Users, label: 'Customers', path: `/${rolePath}/customers`, show: canViewCustomers },
//       { id: 'orders', icon: ShoppingCart, label: 'Orders', path: `/${rolePath}/orders`, show: canViewOrders },
//       { id: 'works', icon: Briefcase, label: 'Works', path: `/${rolePath}/works`, show: canViewWorks },
//       { id: 'tailors', icon: Scissors, label: 'Tailors', path: `/${rolePath}/tailors`, show: canViewTailors },
//       { id: 'cutting-masters', icon: HardHat, label: 'Cutting Masters', path: `/${rolePath}/cutting-masters`, show: canViewCuttingMasters },
//       { id: 'store-keepers', icon: Store, label: 'Store Keepers', path: `/${rolePath}/store-keepers`, show: canViewStoreKeepers },
//       { id: 'measurements', icon: Ruler, label: 'Measurements', path: `/${rolePath}/measurements`, show: canViewMeasurement },
//       { id: 'products', icon: Package, label: 'Products', path: `/${rolePath}/products`, show: canViewProducts },
//       { id: 'banking', icon: Landmark, label: 'Banking', path: '#', show: canViewBanking, isDropdown: true },
//       { id: 'staff', icon: UserCircle, label: 'Staff', path: `/${rolePath}/staff`, show: canViewStaff },
//     ];
//     return items.filter(item => item.show);
//   };

//   const filteredNavItems = getNavigationItems().filter(item => 
//     item.label.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   const toggleSidebar = () => {
//     if (window.innerWidth >= 1024) {
//       setDesktopSidebarOpen(!desktopSidebarOpen);
//     } else {
//       setSidebarOpen(!sidebarOpen);
//     }
//   };

//   const closeSidebar = () => {
//     if (window.innerWidth < 1024) {
//       setSidebarOpen(false);
//     }
//   };

//   const isBankingActive = () => {
//     return bankingItems.some(item => isActive(item.path));
//   };

//   const isReportsActive = () => {
//     return reportsItems.some(item => isActive(item.path));
//   };

//   useEffect(() => {
//     if (isBankingActive() && !bankingOpen) {
//       setBankingOpen(true);
//     }
//     if (isReportsActive() && !reportsOpen) {
//       setReportsOpen(true);
//     }
//   }, [location.pathname]);

//   // Sidebar content component
//   const SidebarContent = () => (
//     <>
//       {/* Sidebar Header */}
//       <div className={`border-b border-slate-800 bg-[#0F172A] flex items-center transition-all duration-300 ${
//         !desktopSidebarOpen && window.innerWidth >= 1024 ? 'justify-center px-0 py-4' : 'justify-between px-6 py-5'
//       }`}>
//         <div className={`flex items-center gap-4 transition-all duration-200 ${
//           !desktopSidebarOpen && window.innerWidth >= 1024 ? 'hidden' : 'flex'
//         }`}>
//           <img 
//             src={logo} 
//             alt="Dreamfit Couture Logo" 
//             className="w-12 h-12 object-contain rounded-lg"
//           />
//           <div className="flex flex-col">
//             <h2 className="text-xl font-black text-white tracking-wide uppercase leading-tight">
//               Dreamfit
//             </h2>
//             <h2 className="text-lg font-black text-blue-500 tracking-wide uppercase italic leading-tight -mt-1">
//               Couture
//             </h2>
//           </div>
//         </div>

//         {/* ✅ Mobile: Toggle button that shows X when sidebar open, Menu when closed */}
//         <button
//           onClick={toggleSidebar}
//           className="lg:hidden text-slate-400 hover:text-white p-2 rounded-lg transition-all"
//         >
//           {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
//         </button>

//         {/* Desktop: When sidebar is collapsed, show Menu button */}
//         {!desktopSidebarOpen && window.innerWidth >= 1024 && (
//           <button 
//             onClick={toggleSidebar}
//             className="p-2 text-blue-500 hover:bg-slate-800 rounded-xl transition-all"
//           >
//             <Menu size={24} />
//           </button>
//         )}
//       </div>

//       {/* User Profile Section */}
//       <div className={`py-5 flex items-center border-b border-slate-800 bg-[#1e293b]/30 transition-all duration-300 ${
//         !desktopSidebarOpen && window.innerWidth >= 1024 ? 'justify-center px-0' : 'justify-between px-6'
//       }`}>
//         <div className="flex items-center gap-3">
//           <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg border border-blue-400/20 flex-shrink-0">
//             <UserCircle size={24} />
//           </div>
//           {(desktopSidebarOpen || window.innerWidth < 1024) && (
//             <div className="flex flex-col min-w-0">
//               <span className="text-sm font-bold text-white truncate w-24 leading-none mb-1">
//                 {user?.name || "User"}
//               </span>
//               <div className="flex items-center gap-1">
//                 <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
//                 <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate">
//                   {user?.role?.replace('_', ' ')}
//                 </span>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Search */}
//       <div className={`px-4 py-5 transition-all duration-300 ${
//         !desktopSidebarOpen && window.innerWidth >= 1024 ? 'hidden' : 'block'
//       }`}>
//         <div className="relative group">
//           <Search className="absolute left-3 top-3 text-slate-500 group-focus-within:text-blue-400" size={18} />
//           <input 
//             type="text" 
//             placeholder="Search menu..." 
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="w-full bg-[#1e293b]/50 border border-slate-700 rounded-xl py-2.5 pl-10 pr-10 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all text-white placeholder:text-slate-500"
//           />
//         </div>
//       </div>

//       {/* Navigation */}
//       <nav className={`flex-1 px-3 space-y-1 overflow-y-auto mt-2 transition-all duration-300 ${
//         !desktopSidebarOpen && window.innerWidth >= 1024 ? 'px-2' : 'px-3'
//       }`}
//       style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
//         <style>{`
//           nav::-webkit-scrollbar {
//             display: none;
//           }
//         `}</style>
        
//         {filteredNavItems.map((item) => {
//           const isItemActive = item.isDropdown 
//             ? (item.id === 'banking' && isBankingActive()) || (item.id === 'reports' && isReportsActive())
//             : isActive(item.path);
          
//           return (
//             <div key={item.id} ref={isItemActive ? activeLinkRef : null}>
//               {item.isDropdown ? (
//                 <div>
//                   <button 
//                     onClick={() => {
//                       if (item.id === 'banking') setBankingOpen(!bankingOpen);
//                       if (item.id === 'reports') setReportsOpen(!reportsOpen);
//                     }}
//                     className={`w-full flex justify-between items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm cursor-pointer ${
//                       isItemActive 
//                         ? 'bg-blue-600 text-white shadow-lg' 
//                         : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
//                     } ${!desktopSidebarOpen && window.innerWidth >= 1024 ? 'justify-center px-2' : ''}`}
//                     title={!desktopSidebarOpen && window.innerWidth >= 1024 ? item.label : ""}
//                   >
//                     <div className={`flex items-center gap-3 ${!desktopSidebarOpen && window.innerWidth >= 1024 ? 'justify-center w-full' : ''}`}>
//                       <item.icon size={19} /> 
//                       <span className={`transition-all duration-300 ${
//                         !desktopSidebarOpen && window.innerWidth >= 1024 ? 'hidden' : 'inline'
//                       }`}>
//                         {item.label}
//                       </span>
//                     </div>
//                     {(item.id === 'banking' && bankingOpen) || (item.id === 'reports' && reportsOpen) ? (
//                       <ChevronDown size={14} className={`transition-all duration-300 ${
//                         !desktopSidebarOpen && window.innerWidth >= 1024 ? 'hidden' : 'block'
//                       }`} />
//                     ) : (
//                       <ChevronRight size={14} className={`transition-all duration-300 ${
//                         !desktopSidebarOpen && window.innerWidth >= 1024 ? 'hidden' : 'block'
//                       }`} />
//                     )}
//                   </button>
                  
//                   {/* Submenus */}
//                   {item.id === 'banking' && (bankingOpen || sidebarSearchNorm) && (
//                     <div className={`ml-9 mt-1 space-y-1 border-l border-slate-700 pl-4 py-1 transition-all duration-300 ${
//                       !desktopSidebarOpen && window.innerWidth >= 1024 ? 'ml-0 pl-0 border-l-0' : ''
//                     }`}>
//                       {getVisibleSubItems('Banking', 'banking', bankingItems).map(sub => {
//                         const isSubActive = isActive(sub.path);
//                         return (
//                           <Link 
//                             key={sub.id} 
//                             to={sub.path} 
//                             className={`flex items-center gap-2 py-2 text-sm transition-all duration-300 ${
//                               isSubActive 
//                                 ? 'text-blue-600 font-bold' 
//                                 : 'text-slate-800 font-semibold hover:text-blue-600'
//                             } ${!desktopSidebarOpen && window.innerWidth >= 1024 ? 'justify-center' : ''}`}
//                             onClick={closeSidebar}
//                             title={!desktopSidebarOpen && window.innerWidth >= 1024 ? sub.label : ""}
//                           >
//                             <sub.icon size={14} className="flex-shrink-0" />
//                             <span className={`transition-all duration-300 ${
//                               !desktopSidebarOpen && window.innerWidth >= 1024 ? 'hidden' : 'inline'
//                             }`}>
//                               {sub.label}
//                             </span>
//                           </Link>
//                         );
//                       })}
//                     </div>
//                   )}

//                   {item.id === 'reports' && reportsOpen && (
//                     <div className={`ml-9 mt-1 space-y-1 border-l border-slate-700 pl-4 py-1 transition-all duration-300 ${
//                       !desktopSidebarOpen && window.innerWidth >= 1024 ? 'ml-0 pl-0 border-l-0' : ''
//                     }`}>
//                       {reportsItems.map(sub => {
//                         const isSubActive = isActive(sub.path);
//                         return (
//                           <Link 
//                             key={sub.id} 
//                             to={sub.path} 
//                             className={`flex items-center gap-2 py-2 text-sm transition-all duration-300 ${
//                               isSubActive 
//                                 ? 'text-blue-600 font-bold' 
//                                 : 'text-slate-800 font-semibold hover:text-blue-600'
//                             } ${!desktopSidebarOpen && window.innerWidth >= 1024 ? 'justify-center' : ''}`}
//                             onClick={closeSidebar}
//                             title={!desktopSidebarOpen && window.innerWidth >= 1024 ? sub.label : ""}
//                           >
//                             <sub.icon size={14} className="flex-shrink-0" />
//                             <span className={`transition-all duration-300 ${
//                               !desktopSidebarOpen && window.innerWidth >= 1024 ? 'hidden' : 'inline'
//                             }`}>
//                               {sub.label}
//                             </span>
//                           </Link>
//                         );
//                       })}
//                     </div>
//                   )}
//                 </div>
//               ) : (
//                 <Link 
//                   to={item.path} 
//                   className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm ${
//                     isActive(item.path) 
//                       ? 'bg-blue-600 text-white shadow-lg' 
//                       : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
//                   } ${!desktopSidebarOpen && window.innerWidth >= 1024 ? 'justify-center px-2' : ''}`}
//                   onClick={closeSidebar}
//                   title={!desktopSidebarOpen && window.innerWidth >= 1024 ? item.label : ""}
//                 >
//                   <item.icon size={19} /> 
//                   <span className={`transition-all duration-300 ${
//                     !desktopSidebarOpen && window.innerWidth >= 1024 ? 'hidden' : 'inline'
//                   }`}>
//                     {item.label}
//                   </span>
//                   {isActive(item.path) && (
//                     <span className={`ml-auto w-1.5 h-1.5 bg-white rounded-full transition-all duration-300 ${
//                       !desktopSidebarOpen && window.innerWidth >= 1024 ? 'hidden' : 'block'
//                     }`}></span>
//                   )}
//                 </Link>
//               )}
//             </div>
//           );
//         })}
//       </nav>

//       {/* Footer */}
//       <div className={`px-4 py-3 border-t border-slate-800 bg-[#0F172A] transition-all duration-300 ${
//         !desktopSidebarOpen && window.innerWidth >= 1024 ? 'hidden' : 'block'
//       }`}>
//         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-500 gap-2">
//           <div className="flex items-center gap-1"><Clock size={12} /><span>{new Date().toLocaleTimeString()}</span></div>
//           <div className="flex items-center gap-1"><Calendar size={12} /><span>{new Date().toLocaleDateString()}</span></div>
//         </div>
//       </div>

//       {/* Logout Button */}
//       <div className={`p-4 border-t border-slate-800 bg-[#0F172A] transition-all duration-300 ${
//         !desktopSidebarOpen && window.innerWidth >= 1024 ? 'px-2' : 'p-4'
//       }`}>
//         <button 
//           onClick={handleLogout} 
//           className={`flex items-center gap-3 text-slate-500 hover:text-red-400 w-full p-3 rounded-xl transition-all hover:bg-red-400/10 font-bold ${
//             !desktopSidebarOpen && window.innerWidth >= 1024 ? 'justify-center' : ''
//           }`}
//           title={!desktopSidebarOpen && window.innerWidth >= 1024 ? "Log Out" : ""}
//         >
//           <LogOut size={19} /> 
//           <span className={`transition-all duration-300 ${
//             !desktopSidebarOpen && window.innerWidth >= 1024 ? 'hidden' : 'inline'
//           }`}>
//             Log Out System
//           </span>
//         </button>
//       </div>
//     </>
//   );

//   return (
//     <div className="flex h-screen bg-[#F1F5F9] overflow-hidden font-sans relative">
//       {/* ✅ Mobile Header with Hamburger Menu - User Profile Removed */}
//       <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-20 shadow-sm">
//         {/* Left: Hamburger Menu Button */}
//         <button
//           onClick={toggleSidebar}
//           className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
//         >
//           <Menu size={24} />
//         </button>
        
//         {/* Center: Title */}
//         <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest truncate max-w-[200px]">
//           {user?.role?.replace('_', ' ')} Panel
//         </h2>
        
//         {/* Right: Only Notification Bell (User Icon Removed) */}
//         <NotificationBell />
//       </div>

//       {/* Desktop Toggle Button - Hidden on mobile */}
//       <div className={`hidden lg:block fixed top-4 z-50 transition-all duration-300 ${
//         desktopSidebarOpen ? 'left-[265px]' : 'left-4'
//       }`}>
//         <button
//           onClick={toggleSidebar}
//           className="p-2 bg-white border border-slate-200 rounded-lg shadow-md hover:bg-slate-50 text-blue-600 transition-all"
//           title={desktopSidebarOpen ? "Close sidebar" : "Open sidebar"}
//         >
//           {desktopSidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
//         </button>
//       </div>

//       {/* Overlay */}
//       {sidebarOpen && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
//           onClick={() => setSidebarOpen(false)}
//         />
//       )}

//       {/* Sidebar */}
//       <aside className={`
//         fixed lg:relative top-0 bottom-0 z-40
//         ${desktopSidebarOpen ? 'w-72' : 'lg:w-20'} 
//         bg-[#0F172A] text-slate-300 flex flex-col shadow-2xl
//         transition-all duration-300 ease-in-out
//         ${sidebarOpen ? 'translate-x-0' : (window.innerWidth < 1024 ? '-translate-x-full' : 'translate-x-0')}
//       `}>
//         <SidebarContent />
//       </aside>

//       {/* Main Content */}
//       <main className="flex-1 flex flex-col relative overflow-hidden">
//         {/* Desktop Header */}
//         <header className="hidden md:flex h-16 bg-white border-b border-slate-200 px-8 items-center justify-between shadow-sm sticky top-0 z-10 flex-shrink-0">
//           <div className={`flex items-center gap-3 transition-all duration-300 ${!desktopSidebarOpen ? 'ml-12' : ''}`}>
//             <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>
//             <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">
//               {user?.role?.replace('_', ' ')} Control Panel
//             </h2>
//           </div>
//           <div className="flex items-center gap-4">
//             <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-600">
//               <HelpCircle size={18} />
//             </button>
//             <div className="w-px h-6 bg-slate-200"></div>
//             <div className="text-[11px] font-black text-slate-400 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100 uppercase">
//               {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
//             </div>
//           </div>
//         </header>
        
//         {/* Scrollable Content */}
//         <div className="flex-1 overflow-y-auto overflow-x-hidden pt-16 md:pt-0">
//           <div className="p-4 sm:p-6 md:p-8 w-full max-w-full">
//             <Outlet />
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }



import { useState, useEffect, useRef } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, ShoppingCart, Scissors, Users, Landmark, 
  Package, Settings, Bell, Search, ChevronDown, 
  ChevronRight, LogOut, UserCircle, Briefcase, Store, Ruler, X,
  Calendar, Clock, CheckSquare, BarChart3, FileText, Truck,
  HelpCircle, BookOpen, Award, Gift, CreditCard, Shield,
  Flag, Target, TrendingUp, UserPlus, UserCheck, UserX,
  HardHat, ClipboardList, Wallet, IndianRupee, Download, Filter,
  PieChart, Activity, DollarSign, Receipt, Banknote, PiggyBank,
  Menu, ChevronLeft, Gauge, CalendarRange, PackageSearch, Handshake,
  CalendarPlus, PackagePlus, Wand2, Palette, UserCog
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../features/auth/authSlice";
import { fetchNotifications } from "../../features/notification/notificationSlice";
import NotificationBell from "../common/NotificationBell";
import logo from "../../assets/logo.png";

export default function MainLayout() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  
  const [bankingOpen, setBankingOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [ordersOutsourcingOpen, setOrdersOutsourcingOpen] = useState(false);
  const [employeeManagementOpen, setEmployeeManagementOpen] = useState(false);
  const [productionStaffOpen, setProductionStaffOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const [branchOpen, setBranchOpen] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const activeLinkRef = useRef(null);

  const userId = user?._id || user?.id;

  useEffect(() => {
    if (userId) {
      console.log("🔔 MainLayout - Fetching notifications for:", userId);
      dispatch(fetchNotifications());
    }
  }, [dispatch, userId]);

  useEffect(() => {
    const handleFocus = () => {
      if (userId) {
        console.log("🔔 MainLayout - Page focused, syncing state");
        dispatch(fetchNotifications());
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [dispatch, userId]);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
        setDesktopSidebarOpen(true);
      } else if (window.innerWidth >= 768) {
        setSidebarOpen(false);
        setDesktopSidebarOpen(false);
      } else {
        setDesktopSidebarOpen(false);
        setSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      if (activeLinkRef.current) {
        activeLinkRef.current.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    }, 100);
  }, [location.pathname]);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      dispatch(logout());
      navigate("/");
    }
  };

  const isAdmin = user?.role === "ADMIN";
  const isStoreKeeper = user?.role === "STORE_KEEPER";
  const isCuttingMaster = user?.role === "CUTTING_MASTER";
  
  const canViewBanking = isAdmin || isStoreKeeper;
  const canViewCustomers = isAdmin || isStoreKeeper;
  const canViewStaff = isAdmin;
  const canViewProducts = isAdmin || isStoreKeeper;
  const canViewOrders = isAdmin || isStoreKeeper;
  const canViewWorks = true;
  const canViewMeasurement = isAdmin || isStoreKeeper;
  const canViewTailors = true;
  const canViewReports = isAdmin || isStoreKeeper;
  const canViewSettings = isAdmin;
  const canViewCuttingMasters = isAdmin;
  const canViewStoreKeepers = isAdmin;
  const canViewBilling = isAdmin || isStoreKeeper;

  const isActive = (path) => {
    if (path === '#') return false;
    return location.pathname.includes(path);
  };

  const rolePath = user?.role === "ADMIN" ? "admin" : 
                   user?.role === "STORE_KEEPER" ? "storekeeper" : 
                   "cuttingmaster";

  const bankingItems = [
    { id: 'overview', label: 'Overview', icon: Wallet, path: `/${rolePath}/banking/overview` },
    { id: 'income', label: 'Income', icon: TrendingUp, path: `/${rolePath}/banking/income` },
    { id: 'expense', label: 'Expenses', icon: Receipt, path: `/${rolePath}/banking/expense` }
  ];

  const reportsItems = [
    { id: 'sales', label: 'Sales Report', icon: TrendingUp, path: `/${rolePath}/reports/sales` },
    { id: 'production', label: 'Production Report', icon: Briefcase, path: `/${rolePath}/reports/production` },
    { id: 'inventory', label: 'Inventory Report', icon: Package, path: `/${rolePath}/reports/inventory` },
  ];

  const ordersOutsourcingItems = [
    { id: 'orders-sub', label: 'Orders', icon: ShoppingCart, path: `/${rolePath}/orders` },
    { id: 'outsourcing-sub', label: 'Outsourcing', icon: Truck, path: `/${rolePath}/outsourcing` },
    { id: 'outsourcing-vendors-sub', label: 'Vendors', icon: Users, path: `/${rolePath}/outsourcing-vendors` },
  ];

  const employeeManagementItems = [
    { id: 'employees-sub', label: 'Employees', icon: UserCircle, path: `/${rolePath}/staff` },
    { id: 'attendance-sub', label: 'Attendance', icon: Clock, path: `/${rolePath}/attendance` },
    { id: 'leave-sub', label: 'Leave Management', icon: Calendar, path: `/${rolePath}/leave` },
    { id: 'salary-sub', label: 'Payroll & Salary', icon: Wallet, path: `/${rolePath}/salary` },
  ];

  const productionStaffItems = [
    { id: 'tailors-sub', label: 'Tailors', icon: Scissors, path: `/${rolePath}/tailors` },
    { id: 'cutting-masters-sub', label: 'Cutting Masters', icon: HardHat, path: `/${rolePath}/cutting-masters` },
    { id: 'aari-workers-sub', label: 'Aari Workers', icon: Wand2, path: `/${rolePath}/aari-workers` },
    { id: 'embroidery-workers-sub', label: 'Embroidery Workers', icon: Palette, path: `/${rolePath}/embroidery-workers` },
    { id: 'helpers-sub', label: 'Helpers', icon: UserCog, path: `/${rolePath}/helpers` },
    { id: 'store-keepers-sub', label: 'Store Keepers', icon: Store, path: `/${rolePath}/store-keepers` },
  ];

  const getNavigationItems = () => {
    const tasksOrWorks = isCuttingMaster
      ? { id: 'works', icon: Briefcase, label: 'Works', path: `/${rolePath}/works`, show: canViewWorks }
      : { id: 'tasks', icon: ClipboardList, label: 'Tasks', path: `/${rolePath}/tasks`, show: canViewWorks };

    const boutiqueModules = !isCuttingMaster
      ? [
          { id: 'check-availability', icon: Gauge, label: 'Check availability', path: `/${rolePath}/check-availability`, show: canViewOrders },
          { id: 'appointments', icon: CalendarRange, label: 'Appointments', path: `/${rolePath}/appointments`, show: canViewOrders },
          { id: 'crm', icon: Handshake, label: 'CRM', path: `/${rolePath}/crm`, show: canViewCustomers },
          { id: 'sourcing', icon: PackageSearch, label: 'Sourcing', path: `/${rolePath}/sourcing`, show: canViewOrders },
        ]
      : [];

    const items = [
      { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', path: `/${rolePath}/dashboard`, show: !isCuttingMaster },
      { id: 'customers', icon: Users, label: 'Customers', path: `/${rolePath}/customers`, show: canViewCustomers },
      { id: 'ordersOutsourcing', icon: ShoppingCart, label: 'Orders & Outsourcing', path: '#', show: canViewOrders, isDropdown: true },
      tasksOrWorks,
      ...boutiqueModules,
      { id: 'measurements', icon: Ruler, label: 'Measurements', path: `/${rolePath}/measurements`, show: canViewMeasurement },
      { id: 'products', icon: Package, label: 'Products', path: `/${rolePath}/products`, show: canViewProducts },
      { id: 'banking', icon: Landmark, label: 'Banking', path: '#', show: canViewBanking, isDropdown: true },
      { id: 'employeeManagement', icon: UserCircle, label: 'Employee Management', path: '#', show: canViewStaff, isDropdown: true },
      { id: 'billing', icon: Receipt, label: 'Billing & Invoicing', path: `/${rolePath}/billing`, show: canViewBilling },
      // Internal-only — never shown to the client's own Admin account, only
      // to an account explicitly flagged isInternalAdmin.
      { id: 'activityLog', icon: Shield, label: 'Activity Log', path: `/${rolePath}/activity-log`, show: !!user?.isInternalAdmin },
    ];
    return items.filter(item => item.show);
  };

  const sidebarSearchNorm = searchQuery.trim().toLowerCase();

  const navLabelMatches = (label, id) => {
    if (!sidebarSearchNorm) return true;
    const slug = (id || "").replace(/-/g, " ");
    return `${label} ${slug}`.toLowerCase().includes(sidebarSearchNorm);
  };

  const navItemMatchesSearch = (item) => {
    if (!sidebarSearchNorm) return true;
    if (navLabelMatches(item.label, item.id)) return true;
    if (item.id === "banking") {
      return bankingItems.some((sub) => navLabelMatches(sub.label, sub.id));
    }
    if (item.id === "reports") {
      return reportsItems.some((sub) => navLabelMatches(sub.label, sub.id));
    }
    return false;
  };

  const getVisibleSubItems = (parentLabel, parentId, items) => {
    if (!sidebarSearchNorm) return items;
    if (navLabelMatches(parentLabel, parentId)) return items;
    return items.filter((sub) => navLabelMatches(sub.label, sub.id));
  };

  const filteredNavItems = getNavigationItems().filter(navItemMatchesSearch);

  const toggleSidebar = () => {
    if (isDesktop) {
      setDesktopSidebarOpen(!desktopSidebarOpen);
    } else {
      setSidebarOpen(!sidebarOpen);
    }
  };

  const closeSidebar = () => {
    if (!isDesktop) {
      setSidebarOpen(false);
    }
  };

  const isBankingActive = () => {
    return bankingItems.some(item => isActive(item.path));
  };

  const isReportsActive = () => {
    return reportsItems.some(item => isActive(item.path));
  };

  const isOrdersOutsourcingActive = () => {
    return ordersOutsourcingItems.some(item => isActive(item.path));
  };

  const isEmployeeManagementActive = () => {
    return employeeManagementItems.some(item => isActive(item.path)) ||
      productionStaffItems.some(item => isActive(item.path));
  };

  const isProductionStaffActive = () => {
    return productionStaffItems.some(item => isActive(item.path));
  };

  useEffect(() => {
    if (isBankingActive() && !bankingOpen) {
      setBankingOpen(true);
    }
    if (isReportsActive() && !reportsOpen) {
      setReportsOpen(true);
    }
    if (isOrdersOutsourcingActive() && !ordersOutsourcingOpen) {
      setOrdersOutsourcingOpen(true);
    }
    if (isEmployeeManagementActive() && !employeeManagementOpen) {
      setEmployeeManagementOpen(true);
    }
    if (isProductionStaffActive() && !productionStaffOpen) {
      setProductionStaffOpen(true);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!sidebarSearchNorm) return;
    if (bankingItems.some((sub) => navLabelMatches(sub.label, sub.id))) {
      setBankingOpen(true);
    }
    if (reportsItems.some((sub) => navLabelMatches(sub.label, sub.id))) {
      setReportsOpen(true);
    }
  }, [sidebarSearchNorm]);

  return (
    <div className="flex h-screen bg-[#eff6ff] overflow-hidden font-sans relative">
      {/* ✅ Mobile Header - Only visible on mobile */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-20 shadow-sm">
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
        >
          <Menu size={24} />
        </button>
        
        <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest truncate max-w-[200px]">
          {user?.role?.replace('_', ' ')} Panel
        </h2>
        
        <NotificationBell />
      </div>

      {/* ✅ Desktop Toggle Button */}
      <div className={`hidden lg:block fixed top-4 z-50 transition-all duration-300 ${
        desktopSidebarOpen ? 'left-[265px]' : 'left-4'
      }`}>
        <button
          onClick={toggleSidebar}
          className="p-2 bg-white border border-slate-200 rounded-lg shadow-md hover:bg-slate-50 text-blue-600 transition-all"
          title={desktopSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {desktopSidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
         fixed lg:relative top-0 bottom-0 z-40
         ${desktopSidebarOpen ? "w-72" : "lg:w-20"}
         bg-white text-slate-600 border-r border-slate-100 flex flex-col shadow-2xl
         transition-all duration-300 ease-in-out
         ${
          sidebarOpen
          ? "translate-x-0"
          : !isDesktop
          ? "-translate-x-full"
          : "translate-x-0"
         }
        `}
      >
        {/* Sidebar Header */}
        <div className={`border-b border-slate-100 bg-white flex items-center transition-all duration-300 ${
          !desktopSidebarOpen && isDesktop ? 'justify-center px-0 py-4' : 'justify-between px-6 py-5'
        }`}>
          <div className={`flex items-center gap-4 transition-all duration-200 ${
            !desktopSidebarOpen && isDesktop ? 'hidden' : 'flex'
          }`}>
            <img 
              src={logo} 
              alt="Dreamfit Couture Logo" 
              className="w-12 h-12 object-contain rounded-lg"
            />
            <div className="flex flex-col">
              <h2 className="text-xl font-black text-slate-800 tracking-wide uppercase leading-tight">
                Dreamfit
              </h2>
              <h2 className="text-lg font-black text-indigo-600 tracking-wide uppercase italic leading-tight -mt-1">
                Couture
              </h2>
            </div>
          </div>

          {/* Mobile: Toggle button */}
          <button
            onClick={toggleSidebar}
            className="lg:hidden text-slate-400 hover:text-white p-2 rounded-lg transition-all"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Desktop: When sidebar is collapsed, show Menu button */}
          {!desktopSidebarOpen && isDesktop && (
            <button 
              onClick={toggleSidebar}
              className="p-2 text-blue-500 hover:bg-slate-800 rounded-xl transition-all"
            >
              <Menu size={24} />
            </button>
          )}
        </div>

        {/* User Profile Section */}
        <div className={`py-5 flex items-center border-b border-slate-100 bg-slate-50/50 transition-all duration-300 ${
          !desktopSidebarOpen && isDesktop ? 'justify-center px-0' : 'justify-between px-6'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg border border-blue-400/20 flex-shrink-0">
              <UserCircle size={24} />
            </div>
            {(desktopSidebarOpen || !isDesktop) && (
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-slate-800 truncate w-24 leading-none mb-1">
                  {user?.name || "User"}
                </span>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate">
                    {user?.role?.replace('_', ' ')}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Search */}
        <div className={`px-4 py-5 transition-all duration-300 ${
          !desktopSidebarOpen && isDesktop ? 'hidden' : 'block'
        }`}>
          <div className="relative group">
            <Search className="absolute left-3 top-3 text-slate-400 group-focus-within:text-indigo-500" size={18} />
            <input
              type="text"
              placeholder="Search menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoComplete="off"
              className="w-full bg-slate-100 border border-transparent rounded-xl py-2.5 pl-10 pr-10 text-sm focus:ring-2 focus:ring-indigo-500/30 outline-none transition-all text-slate-800 placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Clear menu search"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 px-3 space-y-1 overflow-y-auto mt-2 transition-all duration-300 ${
          !desktopSidebarOpen && isDesktop ? 'px-2' : 'px-3'
        }`}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <style>{`
            nav::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          {filteredNavItems.length === 0 && sidebarSearchNorm && (
            <p className="px-4 py-3 text-sm text-slate-500">No menu items match your search.</p>
          )}

          {filteredNavItems.map((item) => {
            const isItemActive = item.isDropdown
              ? (item.id === 'banking' && isBankingActive()) || 
                (item.id === 'reports' && isReportsActive()) ||
                (item.id === 'ordersOutsourcing' && isOrdersOutsourcingActive()) ||
                (item.id === 'employeeManagement' && isEmployeeManagementActive())
              : isActive(item.path);

            return (
              <div key={item.id} ref={isItemActive ? activeLinkRef : null}>
                {item.isDropdown ? (
                  <div>
                    <button
                      onClick={() => {
                       if (item.id === 'banking') setBankingOpen(!bankingOpen);
                       if (item.id === 'reports') setReportsOpen(!reportsOpen);
                       if (item.id === 'ordersOutsourcing') setOrdersOutsourcingOpen(!ordersOutsourcingOpen);
                       if (item.id === 'employeeManagement') setEmployeeManagementOpen(!employeeManagementOpen);
                      }}
                      className={`w-full flex justify-between items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-bold text-sm cursor-pointer ${
                        isItemActive
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                          : 'text-slate-900 hover:text-indigo-700 hover:bg-slate-200/80'
                      } ${!desktopSidebarOpen && isDesktop ? 'justify-center px-2' : ''}`}
                      title={!desktopSidebarOpen && isDesktop ? item.label : ""}
                    >
                      <div className={`flex items-center gap-3 ${!desktopSidebarOpen && isDesktop ? 'justify-center w-full' : ''}`}>
                        <item.icon size={19} /> 
                        <span className={`transition-all duration-300 ${
                          !desktopSidebarOpen && isDesktop ? 'hidden' : 'inline'
                        }`}>
                          {item.label}
                        </span>
                      </div>
                      {(item.id === 'banking' && bankingOpen) || 
                       (item.id === 'reports' && reportsOpen) ||
                       (item.id === 'ordersOutsourcing' && ordersOutsourcingOpen) ||
                       (item.id === 'employeeManagement' && employeeManagementOpen) ? (
                        <ChevronDown size={14} className={`transition-all duration-300 ${
                          !desktopSidebarOpen && isDesktop ? 'hidden' : 'block'
                        }`} />
                      ) : (
                        <ChevronRight size={14} className={`transition-all duration-300 ${
                          !desktopSidebarOpen && isDesktop ? 'hidden' : 'block'
                        }`} />
                      )}
                    </button>
                    
                    {/* Submenus */}
                    {item.id === 'banking' && (bankingOpen || sidebarSearchNorm) && (
                      <div className={`ml-9 mt-1 space-y-1 border-l border-slate-700 pl-4 py-1 transition-all duration-300 ${
                        !desktopSidebarOpen && isDesktop ? 'ml-0 pl-0 border-l-0' : ''
                      }`}>
                        {getVisibleSubItems('Banking', 'banking', bankingItems).map(sub => {
                          const isSubActive = isActive(sub.path);
                          return (
                            <Link 
                              key={sub.id} 
                              to={sub.path} 
                              className={`flex items-center gap-2 py-2 text-sm transition-all duration-300 ${
                                isSubActive 
                                  ? 'text-blue-600 font-bold' 
                                  : 'text-slate-800 font-semibold hover:text-blue-600'
                              } ${!desktopSidebarOpen && isDesktop ? 'justify-center' : ''}`}
                              onClick={closeSidebar}
                              title={!desktopSidebarOpen && isDesktop ? sub.label : ""}
                            >
                              <sub.icon size={14} className="flex-shrink-0" />
                              <span className={`transition-all duration-300 ${
                                !desktopSidebarOpen && isDesktop ? 'hidden' : 'inline'
                              }`}>
                                {sub.label}
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    )}

                    {item.id === 'reports' && reportsOpen && (
                      <div className={`ml-9 mt-1 space-y-1 border-l border-slate-700 pl-4 py-1 transition-all duration-300 ${
                        !desktopSidebarOpen && isDesktop ? 'ml-0 pl-0 border-l-0' : ''
                      }`}>
                        {reportsItems.map(sub => {
                          const isSubActive = isActive(sub.path);
                          return (
                            <Link 
                              key={sub.id} 
                              to={sub.path} 
                              className={`flex items-center gap-2 py-2 text-sm transition-all duration-300 ${
                                isSubActive 
                                  ? 'text-blue-600 font-bold' 
                                  : 'text-slate-800 font-semibold hover:text-blue-600'
                              } ${!desktopSidebarOpen && isDesktop ? 'justify-center' : ''}`}
                              onClick={closeSidebar}
                              title={!desktopSidebarOpen && isDesktop ? sub.label : ""}
                            >
                              <sub.icon size={14} className="flex-shrink-0" />
                              <span className={`transition-all duration-300 ${
                                !desktopSidebarOpen && isDesktop ? 'hidden' : 'inline'
                              }`}>
                                {sub.label}
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    )}

                    {item.id === 'ordersOutsourcing' && ordersOutsourcingOpen && (
                      <div className={`ml-9 mt-1 space-y-1 border-l border-slate-700 pl-4 py-1 transition-all duration-300 ${
                        !desktopSidebarOpen && isDesktop ? 'ml-0 pl-0 border-l-0' : ''
                      }`}>
                        {ordersOutsourcingItems.map(sub => {
                          const isSubActive = isActive(sub.path);
                          return (
                            <Link
                              key={sub.id}
                              to={sub.path}
                              className={`flex items-center gap-2 py-2 text-sm transition-all duration-300 ${
                                isSubActive
                                  ? 'text-blue-600 font-bold'
                                  : 'text-slate-800 font-semibold hover:text-blue-600'
                              } ${!desktopSidebarOpen && isDesktop ? 'justify-center' : ''}`}
                              onClick={closeSidebar}
                              title={!desktopSidebarOpen && isDesktop ? sub.label : ""}
                            >
                              <sub.icon size={14} className="flex-shrink-0" />
                              <span className={`transition-all duration-300 ${
                                !desktopSidebarOpen && isDesktop ? 'hidden' : 'inline'
                              }`}>
                                {sub.label}
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    )}

                    {item.id === 'employeeManagement' && employeeManagementOpen && (
                      <div className={`ml-9 mt-1 space-y-1 border-l border-slate-700 pl-4 py-1 transition-all duration-300 ${
                        !desktopSidebarOpen && isDesktop ? 'ml-0 pl-0 border-l-0' : ''
                      }`}>
                        {/* Core employee sub-items */}
                        {employeeManagementItems.map(sub => {
                          const isSubActive = isActive(sub.path);
                          return (
                            <Link
                              key={sub.id}
                              to={sub.path}
                              className={`flex items-center gap-2 py-2 text-sm transition-all duration-300 ${
                                isSubActive
                                  ? 'text-blue-600 font-bold'
                                  : 'text-slate-800 font-semibold hover:text-blue-600'
                              } ${!desktopSidebarOpen && isDesktop ? 'justify-center' : ''}`}
                              onClick={closeSidebar}
                              title={!desktopSidebarOpen && isDesktop ? sub.label : ""}
                            >
                              <sub.icon size={14} className="flex-shrink-0" />
                              <span className={`transition-all duration-300 ${
                                !desktopSidebarOpen && isDesktop ? 'hidden' : 'inline'
                              }`}>
                                {sub.label}
                              </span>
                            </Link>
                          );
                        })}

                        {/* Production Staff nested collapsible */}
                        {(!desktopSidebarOpen && isDesktop) ? null : (
                          <div className="pt-1">
                            <button
                              onClick={() => setProductionStaffOpen(!productionStaffOpen)}
                              className={`w-full flex items-center justify-between gap-2 py-2 text-sm transition-all duration-200 ${
                                isProductionStaffActive()
                                  ? 'text-blue-600 font-bold'
                                  : 'text-slate-800 font-semibold hover:text-blue-600'
                              }`}
                            >
                              <span className="flex items-center gap-2">
                                <Briefcase size={14} className="flex-shrink-0" />
                                <span>Production Staff</span>
                              </span>
                              {productionStaffOpen
                                ? <ChevronDown size={12} />
                                : <ChevronRight size={12} />
                              }
                            </button>

                            {productionStaffOpen && (
                              <div className="ml-4 mt-1 space-y-1 border-l border-slate-700/60 pl-3 py-1">
                                {productionStaffItems.map(sub => {
                                  const isSubActive = isActive(sub.path);
                                  return (
                                    <Link
                                      key={sub.id}
                                      to={sub.path}
                                      className={`flex items-center gap-2 py-1.5 text-sm transition-all duration-200 ${
                                        isSubActive
                                          ? 'text-blue-600 font-bold'
                                          : 'text-slate-800 font-semibold hover:text-blue-600'
                                      }`}
                                      onClick={closeSidebar}
                                    >
                                      <sub.icon size={13} className="flex-shrink-0" />
                                      <span>{sub.label}</span>
                                      {isSubActive && (
                                        <span className="ml-auto w-1.5 h-1.5 bg-blue-600 rounded-full" />
                                      )}
                                    </Link>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link 
                    to={item.path} 
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-bold text-sm ${
                      isActive(item.path) 
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md' 
                        : 'text-slate-900 hover:text-indigo-700 hover:bg-slate-200/80'
                    } ${!desktopSidebarOpen && isDesktop ? 'justify-center px-2' : ''}`}
                    onClick={closeSidebar}
                    title={!desktopSidebarOpen && isDesktop ? item.label : ""}
                  >
                    <item.icon size={19} /> 
                    <span className={`transition-all duration-300 ${
                      !desktopSidebarOpen && isDesktop ? 'hidden' : 'inline'
                    }`}>
                      {item.label}
                    </span>
                    {isActive(item.path) && (
                      <span className={`ml-auto w-1.5 h-1.5 bg-white rounded-full transition-all duration-300 ${
                        !desktopSidebarOpen && isDesktop ? 'hidden' : 'block'
                      }`}></span>
                    )}
                  </Link>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className={`px-4 py-3 border-t border-slate-100 bg-white transition-all duration-300 ${
          !desktopSidebarOpen && isDesktop ? 'hidden' : 'block'
        }`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-500 gap-2">
            <div className="flex items-center gap-1"><Clock size={12} /><span>{new Date().toLocaleTimeString()}</span></div>
            <div className="flex items-center gap-1"><Calendar size={12} /><span>{new Date().toLocaleDateString()}</span></div>
          </div>
        </div>

        {/* Logout Button */}
        <div className={`p-4 border-t border-slate-100 bg-slate-50/50 transition-all duration-300 ${
          !desktopSidebarOpen && isDesktop ? 'px-2' : 'p-4'
        }`}>
          <button 
            onClick={handleLogout} 
            className={`flex items-center gap-3 text-slate-500 hover:text-red-500 w-full p-3 rounded-xl transition-all hover:bg-red-50 font-bold ${
              !desktopSidebarOpen && isDesktop ? 'justify-center' : ''
            }`}
            title={!desktopSidebarOpen && isDesktop ? "Log Out" : ""}
          >
            <LogOut size={19} /> 
            <span className={`transition-all duration-300 ${
              !desktopSidebarOpen && isDesktop ? 'hidden' : 'inline'
            }`}>
              Log Out System
            </span>
          </button>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* ✅ Desktop Header - Bell Icon on RIGHT side */}
        <header className="hidden md:flex h-16 bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 items-center justify-between sticky top-0 z-10 flex-shrink-0">
          <div className={`flex items-center gap-3 transition-all duration-300 ${!desktopSidebarOpen ? 'ml-12' : ''}`}>
            <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>
            <h2 className="text-sm font-black text-slate-700 uppercase tracking-widest">
              {user?.role?.replace('_', ' ')} CONTROL PANEL
            </h2>
          </div>
          
          {/* ✅ Right side - Quick Actions, Notification Bell, Refresh, Branch, Help, Date */}
          <div className="flex items-center gap-3 lg:gap-5">
            {/* Quick Actions (Moved from Dashboard) */}
            <div className="hidden lg:flex items-center gap-2">
              <Link to={`/${rolePath}/add-customer`} className="flex items-center justify-center w-9 h-9 bg-white hover:bg-slate-50 hover:-translate-y-0.5 rounded-lg text-slate-500 hover:text-blue-600 transition-all border border-slate-200 shadow-sm hover:shadow-md relative group" title="Add Customer">
                <UserPlus size={16} />
              </Link>
              <Link to={`/${rolePath}/orders/new`} className="flex items-center justify-center w-9 h-9 bg-white hover:bg-slate-50 hover:-translate-y-0.5 rounded-lg text-slate-500 hover:text-blue-600 transition-all border border-slate-200 shadow-sm hover:shadow-md relative group" title="New Order">
                <ShoppingCart size={16} />
              </Link>
              <Link to={`/${rolePath}/appointments`} className="flex items-center justify-center w-9 h-9 bg-white hover:bg-slate-50 hover:-translate-y-0.5 rounded-lg text-slate-500 hover:text-blue-600 transition-all border border-slate-200 shadow-sm hover:shadow-md relative group" title="Add Appointment">
                <CalendarPlus size={16} />
              </Link>
              <Link to={`/${rolePath}/products/new`} className="flex items-center justify-center w-9 h-9 bg-white hover:bg-slate-50 hover:-translate-y-0.5 rounded-lg text-slate-500 hover:text-blue-600 transition-all border border-slate-200 shadow-sm hover:shadow-md relative group" title="Add Product">
                <PackagePlus size={16} />
              </Link>
            </div>
            
            {/* Divider */}
            <div className="w-px h-5 bg-slate-200 hidden lg:block"></div>

            <div className="flex items-center gap-3">
              {/* Notification Bell */}
              <NotificationBell />

              {/* Refresh Global Button */}
              <button className="p-1.5 hover:bg-slate-100 rounded-full text-slate-500 transition-colors" title="Refresh">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-refresh-cw"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
              </button>
            </div>
            
            {/* Divider */}
            <div className="w-px h-5 bg-slate-200 hidden sm:block"></div>

            {/* Branch Selector */}
            <div className="hidden lg:flex items-center gap-2 border border-slate-200 rounded-full px-4 py-1.5 cursor-pointer hover:bg-slate-50 transition-colors">
              <span className="text-[10px] font-black text-slate-400">BRANCH</span>
              <span className="text-xs font-bold text-slate-800">Urapakkam</span>
              <ChevronDown size={14} className="text-slate-400" />
            </div>
            
            {/* Help Button */}
            <button className="p-1.5 hover:bg-slate-100 rounded-full text-slate-500 transition-colors border border-slate-200 hidden sm:flex items-center justify-center">
              <HelpCircle size={16} />
            </button>
            
            {/* Date */}
            <div className="text-[11px] font-bold text-slate-500 bg-slate-50 px-4 py-1.5 rounded-full border border-slate-200 uppercase tracking-wide">
              {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </div>
          </div>
        </header>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden pt-16 md:pt-0">
          <div className="p-4 sm:p-6 md:p-8 w-full max-w-full">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
