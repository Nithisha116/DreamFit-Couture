// // pages/helpers/Helpers.jsx
// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   Plus,
//   Search,
//   Filter,
//   Eye,
//   Edit,
//   Trash2,
//   Calendar,
//   CheckCircle,
//   XCircle,
//   AlertCircle,
//   Clock,
//   Users,
//   UserCog,
//   UserCheck,
//   UserX,
//   Coffee,
//   ChevronLeft,
//   ChevronRight,
//   Menu,
//   Grid,
//   X
// } from "lucide-react";
// import { fetchAllHelpers, deleteHelper, fetchHelperStats } from "../../../features/helper/helperSlice";
// import showToast from "../../../utils/toast";
// import StatusBadge from "../../../components/common/StatusBadge";
// import LeaveStatusModal from "../../../components/modals/LeaveStatusModal";

// export default function Helpers() {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
  
//   const { helpers, helperStats, loading, pagination } = useSelector((state) => state.helper);
//   const { user } = useSelector((state) => state.auth);

//   // Get base path based on user role
//   const basePath = user?.role === "ADMIN" ? "/admin" : 
//                    user?.role === "STORE_KEEPER" ? "/storekeeper" : 
//                    "/cuttingmaster";

//   // Pagination state
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage, setItemsPerPage] = useState(10);
  
//   // Filter states
//   const [searchTerm, setSearchTerm] = useState("");
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [availabilityFilter, setAvailabilityFilter] = useState("all");
  
//   // Modal states
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [selectedHelper, setSelectedHelper] = useState(null);
//   const [showLeaveModal, setShowLeaveModal] = useState(false);
  
//   // Mobile state
//   const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
//   const [mobileView, setMobileView] = useState("grid"); // 'grid' or 'list'

//   const isAdmin = user?.role === "ADMIN";
//   const isStoreKeeper = user?.role === "STORE_KEEPER";
//   const isCuttingMaster = user?.role === "CUTTING_MASTER";
//   const canEdit = isAdmin || isStoreKeeper;
//   const canDelete = isAdmin;
//   const canAdd = isAdmin || isStoreKeeper;

//   // Fetch helpers with pagination
//   useEffect(() => {
//     dispatch(fetchAllHelpers({ 
//       page: currentPage,
//       limit: itemsPerPage,
//       search: searchTerm, 
//       status: statusFilter,
//       availability: availabilityFilter 
//     }));
//     dispatch(fetchHelperStats());
//   }, [dispatch, currentPage, itemsPerPage, searchTerm, statusFilter, availabilityFilter]);

//   // Handle Add Helper - with basePath
//   const handleAddHelper = () => {
//     navigate(`${basePath}/helpers/add`);
//   };

//   // Handle View Helper - with basePath
//   const handleViewHelper = (id) => {
//     navigate(`${basePath}/helpers/${id}`);
//   };

//   // Handle Edit Helper - with basePath
//   const handleEditHelper = (id) => {
//     if (canEdit) {
//       navigate(`${basePath}/helpers/edit/${id}`);
//     } else {
//       showToast.error("You don't have permission to Edit Helpers");
//     }
//   };

//   const handleDeleteClick = (helper) => {
//     setSelectedHelper(helper);
//     setShowDeleteModal(true);
//   };

//   const handleDeleteConfirm = async () => {
//     try {
//       await dispatch(deleteHelper(selectedHelper._id)).unwrap();
//       showToast.success("Helper deleted successfully");
//       setShowDeleteModal(false);
//       setSelectedHelper(null);
//     } catch (error) {
//       showToast.error(error || "Failed to Delete Helper");
//     }
//   };

//   const handleLeaveUpdate = (helper) => {
//     setSelectedHelper(helper);
//     setShowLeaveModal(true);
//   };

//   const handleLeaveStatusUpdated = () => {
//     dispatch(fetchAllHelpers({ 
//       page: currentPage,
//       limit: itemsPerPage,
//       search: searchTerm, 
//       status: statusFilter,
//       availability: availabilityFilter 
//     }));
//   };

//   // Handle page change
//   const handlePageChange = (newPage) => {
//     if (newPage >= 1 && newPage <= (pagination?.pages || 1)) {
//       setCurrentPage(newPage);
//     }
//   };

//   // Handle items per page change
//   const handleItemsPerPageChange = (e) => {
//     setItemsPerPage(Number(e.target.value));
//     setCurrentPage(1); // Reset to first page
//   };

//   const getLeaveStatusIcon = (status) => {
//     switch(status) {
//       case "present": return <UserCheck size={14} className="text-green-600" />;
//       case "leave": return <UserX size={14} className="text-red-600" />;
//       case "half-day": return <Coffee size={14} className="text-orange-600" />;
//       case "holiday": return <Calendar size={14} className="text-purple-600" />;
//       default: return <UserCheck size={14} className="text-green-600" />;
//     }
//   };

//   const getLeaveStatusColor = (status) => {
//     switch(status) {
//       case "present": return "bg-green-100 text-green-800 border-green-200";
//       case "leave": return "bg-red-100 text-red-800 border-red-200";
//       case "half-day": return "bg-orange-100 text-orange-800 border-orange-200";
//       case "holiday": return "bg-purple-100 text-purple-800 border-purple-200";
//       default: return "bg-green-100 text-green-800 border-green-200";
//     }
//   };

//   const statusOptions = [
//     { value: "all", label: "All Status" },
//     { value: "present", label: "Present" },
//     { value: "leave", label: "On Leave" },
//     { value: "half-day", label: "Half Day" },
//     { value: "holiday", label: "Holiday" },
//   ];

//   const availabilityOptions = [
//     { value: "all", label: "All" },
//     { value: "available", label: "Available" },
//     { value: "unavailable", label: "Unavailable" },
//   ];

//   // Items per page options
//   const itemsPerPageOptions = [5, 10, 25, 50, 100];

//   return (
//     <div className="min-h-screen bg-slate-50">
//       {/* ===== MOBILE HEADER ===== */}
//       <div className="lg:hidden bg-white border-b border-slate-200 sticky top-0 z-30">
//         <div className="flex items-center justify-between px-4 py-3">
//           <h1 className="text-lg font-black text-slate-800">Helpers</h1>
//           <div className="flex items-center gap-2">
//             {canAdd && (
//               <button
//                 onClick={handleAddHelper}
//                 className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center"
//                 style={{ minWidth: '36px', minHeight: '36px' }}
//               >
//                 <Plus size={18} />
//               </button>
//             )}
//             <button
//               onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
//               className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition flex items-center justify-center"
//               style={{ minWidth: '36px', minHeight: '36px' }}
//             >
//               <Filter size={18} />
//             </button>
//           </div>
//         </div>

//         {/* Mobile Search Bar */}
//         <div className="px-4 pb-3">
//           <div className="relative">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
//             <input
//               type="text"
//               placeholder="Search helpers..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
//             />
//           </div>
//         </div>

//         {/* Mobile Stats Row */}
//         <div className="grid grid-cols-5 gap-1 px-4 pb-3">
//           <div className="text-center">
//             <div className="text-xs font-bold text-blue-600">{helperStats?.total || 0}</div>
//             <div className="text-[10px] text-slate-500 truncate">Total</div>
//           </div>
//           <div className="text-center">
//             <div className="text-xs font-bold text-green-600">{helperStats?.present || 0}</div>
//             <div className="text-[10px] text-slate-500 truncate">Present</div>
//           </div>
//           <div className="text-center">
//             <div className="text-xs font-bold text-red-600">{helperStats?.onLeave || 0}</div>
//             <div className="text-[10px] text-slate-500 truncate">Leave</div>
//           </div>
//           <div className="text-center">
//             <div className="text-xs font-bold text-orange-600">{helperStats?.halfDay || 0}</div>
//             <div className="text-[10px] text-slate-500 truncate">Half Day</div>
//           </div>
//           <div className="text-center">
//             <div className="text-xs font-bold text-purple-600">{helperStats?.available || 0}</div>
//             <div className="text-[10px] text-slate-500 truncate">Available</div>
//           </div>
//         </div>

//         {/* Mobile Filters Dropdown */}
//         {mobileFiltersOpen && (
//           <div className="absolute top-full left-4 right-4 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 p-4 z-40">
//             <div className="flex items-center justify-between mb-3">
//               <h3 className="font-bold text-slate-800">Filters</h3>
//               <button
//                 onClick={() => setMobileFiltersOpen(false)}
//                 className="p-1 hover:bg-slate-100 rounded-lg flex items-center justify-center"
//                 style={{ minWidth: '28px', minHeight: '28px' }}
//               >
//                 <X size={16} />
//               </button>
//             </div>
//             <div className="space-y-3">
//               <div>
//                 <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
//                 <select
//                   value={statusFilter}
//                   onChange={(e) => setStatusFilter(e.target.value)}
//                   className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
//                 >
//                   {statusOptions.map(option => (
//                     <option key={option.value} value={option.value}>{option.label}</option>
//                   ))}
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-xs font-medium text-slate-500 mb-1">Availability</label>
//                 <select
//                   value={availabilityFilter}
//                   onChange={(e) => setAvailabilityFilter(e.target.value)}
//                   className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
//                 >
//                   {availabilityOptions.map(option => (
//                     <option key={option.value} value={option.value}>{option.label}</option>
//                   ))}
//                 </select>
//               </div>
//               <div className="flex gap-2 pt-2">
//                 <button
//                   onClick={() => {
//                     setStatusFilter("all");
//                     setAvailabilityFilter("all");
//                   }}
//                   className="flex-1 px-3 py-2.5 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-200 transition"
//                 >
//                   Reset
//                 </button>
//                 <button
//                   onClick={() => setMobileFiltersOpen(false)}
//                   className="flex-1 px-3 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
//                 >
//                   Apply
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* ===== DESKTOP HEADER (Hidden on mobile) ===== */}
//       <div className="hidden lg:block max-w-7xl mx-auto px-8 py-8">
//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
//           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-slate-500">Total Helpers</p>
//                 <p className="text-3xl font-black text-slate-800">{helperStats?.total || 0}</p>
//               </div>
//               <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
//                 <UserCog size={24} className="text-blue-600" />
//               </div>
//             </div>
//           </div>

//           <div className="bg-green-50 p-6 rounded-2xl shadow-sm border border-green-100">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-green-600">Present</p>
//                 <p className="text-3xl font-black text-green-700">{helperStats?.present || 0}</p>
//               </div>
//               <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
//                 <UserCheck size={24} className="text-green-600" />
//               </div>
//             </div>
//           </div>

//           <div className="bg-red-50 p-6 rounded-2xl shadow-sm border border-red-100">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-red-600">On Leave</p>
//                 <p className="text-3xl font-black text-red-700">{helperStats?.onLeave || 0}</p>
//               </div>
//               <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
//                 <UserX size={24} className="text-red-600" />
//               </div>
//             </div>
//           </div>

//           <div className="bg-orange-50 p-6 rounded-2xl shadow-sm border border-orange-100">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-orange-600">Half Day</p>
//                 <p className="text-3xl font-black text-orange-700">{helperStats?.halfDay || 0}</p>
//               </div>
//               <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
//                 <Coffee size={24} className="text-orange-600" />
//               </div>
//             </div>
//           </div>

//           <div className="bg-purple-50 p-6 rounded-2xl shadow-sm border border-purple-100">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-purple-600">Available</p>
//                 <p className="text-3xl font-black text-purple-700">{helperStats?.available || 0}</p>
//               </div>
//               <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
//                 <CheckCircle size={24} className="text-purple-600" />
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Header */}
//         <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between mb-6">
//           <div>
//             <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">
//               Helpers Management
//             </h1>
//             <p className="text-slate-500 font-medium">Manage all Helpers and their work assignments</p>
//           </div>
//           {canAdd && (
//             <button
//               onClick={handleAddHelper}
//               className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2"
//             >
//               <Plus size={20} />
//               Add Helper
//             </button>
//           )}
//         </div>

//         {/* Filters */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
//           <div className="relative md:col-span-2">
//             <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
//             <input
//               type="text"
//               placeholder="Search by name, phone, ID..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
//             />
//           </div>

//           <select
//             value={statusFilter}
//             onChange={(e) => setStatusFilter(e.target.value)}
//             className="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
//           >
//             {statusOptions.map(option => (
//               <option key={option.value} value={option.value}>{option.label}</option>
//             ))}
//           </select>

//           <select
//             value={availabilityFilter}
//             onChange={(e) => setAvailabilityFilter(e.target.value)}
//             className="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
//           >
//             {availabilityOptions.map(option => (
//               <option key={option.value} value={option.value}>{option.label}</option>
//             ))}
//           </select>
//         </div>
//       </div>

//       {/* ===== MAIN CONTENT ===== */}
//       <div className="max-w-7xl mx-auto px-4 lg:px-8 pb-8">
//         {/* Mobile View Toggle */}
//         <div className="lg:hidden flex items-center justify-between mb-3">
//           <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
//             <button
//               onClick={() => setMobileView("grid")}
//               className={`p-2 rounded-lg transition flex items-center justify-center ${
//                 mobileView === "grid" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"
//               }`}
//               style={{ minWidth: '36px', minHeight: '36px' }}
//             >
//               <Grid size={16} />
//             </button>
//             <button
//               onClick={() => setMobileView("list")}
//               className={`p-2 rounded-lg transition flex items-center justify-center ${
//                 mobileView === "list" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"
//               }`}
//               style={{ minWidth: '36px', minHeight: '36px' }}
//             >
//               <Menu size={16} />
//             </button>
//           </div>
//           <span className="text-xs text-slate-500">
//             {helpers?.length || 0} helpers
//           </span>
//         </div>

//         {/* Loading State */}
//         {loading ? (
//           <div className="bg-white rounded-xl p-8 text-center">
//             <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
//             <p className="mt-2 text-sm text-slate-500">Loading Helpers...</p>
//           </div>
//         ) : helpers?.length > 0 ? (
//           <>
//             {/* ===== MOBILE GRID VIEW - COMPLETELY CENTERED ===== */}
//             {mobileView === "grid" && (
//               <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-3">
//                 {helpers.map((helper) => (
//                   <div
//                     key={helper._id}
//                     className="bg-white rounded-xl border border-slate-200 p-3 hover:shadow-md transition-all"
//                   >
//                     {/* Header with Avatar and Status */}
//                     <div className="flex items-start justify-between mb-2">
//                       <div className="flex items-center gap-2">
//                         <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
//                           {helper.name?.charAt(0)}
//                         </div>
//                         <div className="min-w-0">
//                           <p className="font-medium text-slate-800 text-sm truncate max-w-[100px]">{helper.name}</p>
//                           <p className="text-[10px] text-slate-400 truncate">{helper.helperId}</p>
//                         </div>
//                       </div>
//                       <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap ${getLeaveStatusColor(helper.leaveStatus)}`}>
//                         {helper.leaveStatus}
//                       </span>
//                     </div>

//                     {/* Contact and Specialization */}
//                     <div className="space-y-1 mb-2">
//                       <p className="text-xs text-slate-600 truncate">{helper.phone}</p>
//                       <div className="flex flex-wrap gap-1">
//                         {helper.specialization?.slice(0, 2).map((spec, idx) => (
//                           <span key={idx} className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[8px]">
//                             {spec}
//                           </span>
//                         ))}
//                         {helper.specialization?.length > 2 && (
//                           <span className="text-[8px] text-slate-400">+{helper.specialization.length - 2}</span>
//                         )}
//                       </div>
//                     </div>

//                     {/* Work Stats */}
//                     <div className="grid grid-cols-3 gap-1 text-center mb-3 text-[10px]">
//                       <div>
//                         <div className="font-bold text-blue-600">{helper.workStats?.totalAssigned || 0}</div>
//                         <div className="text-slate-500">Total</div>
//                       </div>
//                       <div>
//                         <div className="font-bold text-green-600">{helper.workStats?.completed || 0}</div>
//                         <div className="text-slate-500">Done</div>
//                       </div>
//                       <div>
//                         <div className="font-bold text-orange-600">{helper.workStats?.inProgress || 0}</div>
//                         <div className="text-slate-500">Progress</div>
//                       </div>
//                     </div>

//                     {/* Action Icons - PERFECTLY CENTERED */}
//                     <div className="flex items-center justify-center gap-2 pt-2 border-t border-slate-100">
//                       <button
//                         onClick={() => handleViewHelper(helper._id)}
//                         className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-all flex items-center justify-center"
//                         title="View"
//                       >
//                         <Eye size={14} />
//                       </button>
//                       {canEdit && (
//                         <button
//                           onClick={() => handleLeaveUpdate(helper)}
//                           className="w-8 h-8 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-all flex items-center justify-center"
//                           title="Leave"
//                         >
//                           <Calendar size={14} />
//                         </button>
//                       )}
//                       {canEdit && (
//                         <button
//                           onClick={() => handleEditHelper(helper._id)}
//                           className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all flex items-center justify-center"
//                           title="Edit"
//                         >
//                           <Edit size={14} />
//                         </button>
//                       )}
//                       {canDelete && (
//                         <button
//                           onClick={() => handleDeleteClick(helper)}
//                           className="w-8 h-8 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all flex items-center justify-center"
//                           title="Delete"
//                         >
//                           <Trash2 size={14} />
//                         </button>
//                       )}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}

//             {/* ===== MOBILE LIST VIEW - COMPLETELY CENTERED ===== */}
//             {mobileView === "list" && (
//               <div className="lg:hidden space-y-2">
//                 {helpers.map((helper) => (
//                   <div
//                     key={helper._id}
//                     className="bg-white rounded-xl border border-slate-200 p-3 hover:shadow-md transition-all"
//                   >
//                     {/* Header with Avatar and Status */}
//                     <div className="flex items-center justify-between mb-2">
//                       <div className="flex items-center gap-2 flex-1 min-w-0">
//                         <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
//                           {helper.name?.charAt(0)}
//                         </div>
//                         <div className="min-w-0">
//                           <p className="font-medium text-slate-800 text-sm truncate">{helper.name}</p>
//                           <p className="text-xs text-slate-500 truncate">{helper.phone}</p>
//                         </div>
//                       </div>
//                       <div className="flex items-center gap-1 flex-shrink-0">
//                         <span className={`px-2 py-1 rounded-full text-[10px] font-medium whitespace-nowrap ${getLeaveStatusColor(helper.leaveStatus)}`}>
//                           {helper.leaveStatus}
//                         </span>
//                       </div>
//                     </div>

//                     {/* Footer with ID and View Button */}
//                     <div className="flex items-center justify-between text-xs">
//                       <div className="text-slate-500 truncate max-w-[100px]">ID: {helper.helperId}</div>
//                       <div className="flex items-center gap-2">
//                         <span className="text-blue-600 font-medium">{helper.workStats?.totalAssigned || 0} works</span>
//                         <button
//                           onClick={() => handleViewHelper(helper._id)}
//                           className="w-7 h-7 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-all flex items-center justify-center"
//                           title="View"
//                         >
//                           <Eye size={12} />
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}

//             {/* ===== DESKTOP TABLE VIEW (Hidden on mobile) ===== */}
//             <div className="hidden lg:block bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
//               <div className="overflow-x-auto">
//                 <table className="w-full">
//                   <thead className="bg-slate-50 border-b border-slate-200">
//                     <tr>
//                       <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">
//                         Helper ID
//                       </th>
//                       <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">
//                         Name
//                       </th>
//                       <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">
//                         Phone
//                       </th>
//                       <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">
//                         Specialization
//                       </th>
//                       <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">
//                         Experience
//                       </th>
//                       <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">
//                         Status
//                       </th>
//                       <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">
//                         Work Stats
//                       </th>
//                       <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">
//                         Actions
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-slate-100">
//                     {helpers.map((helper) => (
//                       <tr key={helper._id} className="hover:bg-slate-50 transition-all">
//                         <td className="px-6 py-4 font-mono font-bold text-blue-600">
//                           {helper.helperId}
//                         </td>
//                         <td className="px-6 py-4">
//                           <div className="flex items-center gap-3">
//                             <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
//                               {helper.name?.charAt(0)}
//                             </div>
//                             <div className="min-w-0">
//                               <p className="font-medium text-slate-800 truncate max-w-[150px]">{helper.name}</p>
//                               <p className="text-xs text-slate-400 truncate">{helper.email || 'No email'}</p>
//                             </div>
//                           </div>
//                         </td>
//                         <td className="px-6 py-4 text-slate-600">
//                           {helper.phone}
//                         </td>
//                         <td className="px-6 py-4">
//                           <div className="flex flex-wrap gap-1">
//                             {helper.specialization?.slice(0, 2).map((spec, idx) => (
//                               <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium whitespace-nowrap">
//                                 {spec}
//                               </span>
//                             ))}
//                             {helper.specialization?.length > 2 && (
//                               <span className="text-xs text-slate-400">+{helper.specialization.length - 2}</span>
//                             )}
//                           </div>
//                         </td>
//                         <td className="px-6 py-4">
//                           <span className="font-medium">{helper.experience || 0} years</span>
//                         </td>
//                         <td className="px-6 py-4">
//                           <div className="flex items-center gap-2">
//                             {getLeaveStatusIcon(helper.leaveStatus)}
//                             <span className={`text-sm font-medium ${
//                               helper.leaveStatus === 'present' ? 'text-green-600' :
//                               helper.leaveStatus === 'leave' ? 'text-red-600' :
//                               helper.leaveStatus === 'half-day' ? 'text-orange-600' :
//                               'text-purple-600'
//                             }`}>
//                               {helper.leaveStatus?.replace('-', ' ')}
//                             </span>
//                           </div>
//                           {!helper.isAvailable && (
//                             <span className="text-xs text-red-500 block mt-1">Unavailable</span>
//                           )}
//                         </td>
//                         <td className="px-6 py-4">
//                           <div className="space-y-1">
//                             <div className="flex items-center gap-2 text-xs">
//                               <span className="text-slate-400">Total:</span>
//                               <span className="font-bold">{helper.workStats?.totalAssigned || 0}</span>
//                             </div>
//                             <div className="flex items-center gap-2 text-xs">
//                               <span className="text-green-600">✓ Completed:</span>
//                               <span className="font-bold">{helper.workStats?.completed || 0}</span>
//                             </div>
//                             <div className="flex items-center gap-2 text-xs">
//                               <span className="text-orange-600">⚡ In Progress:</span>
//                               <span className="font-bold">{helper.workStats?.inProgress || 0}</span>
//                             </div>
//                             <div className="flex items-center gap-2 text-xs">
//                               <span className="text-yellow-600">⏳ Pending:</span>
//                               <span className="font-bold">{helper.workStats?.pending || 0}</span>
//                             </div>
//                           </div>
//                         </td>
//                         <td className="px-6 py-4">
//                           <div className="flex items-center gap-2">
//                             <button
//                               onClick={() => handleViewHelper(helper._id)}
//                               className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-all flex items-center justify-center"
//                               title="View Details"
//                             >
//                               <Eye size={16} />
//                             </button>
                            
//                             {(canEdit || helper._id === user?.helperId) && (
//                               <button
//                                 onClick={() => handleLeaveUpdate(helper)}
//                                 className="w-8 h-8 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-all flex items-center justify-center"
//                                 title="Update Leave Status"
//                               >
//                                 <Calendar size={16} />
//                               </button>
//                             )}

//                             {canEdit && (
//                               <button
//                                 onClick={() => handleEditHelper(helper._id)}
//                                 className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all flex items-center justify-center"
//                                 title="Edit"
//                               >
//                                 <Edit size={16} />
//                               </button>
//                             )}

//                             {canDelete && (
//                               <button
//                                 onClick={() => handleDeleteClick(helper)}
//                                 className="w-8 h-8 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all flex items-center justify-center"
//                                 title="Delete"
//                               >
//                                 <Trash2 size={16} />
//                               </button>
//                             )}
//                           </div>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </>
//         ) : (
//           // Empty State
//           <div className="bg-white rounded-xl p-8 text-center">
//             <UserCog size={40} className="text-slate-300 mx-auto mb-4" />
//             <p className="text-slate-500 text-base">No Helpers found</p>
//             {canAdd && (
//               <button
//                 onClick={handleAddHelper}
//                 className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold inline-flex items-center justify-center gap-2 text-sm"
//               >
//                 <Plus size={16} />
//                 Add Your First Helper
//               </button>
//             )}
//           </div>
//         )}

//         {/* Pagination Section - Responsive */}
//         {pagination?.pages > 1 && (
//           <div className="mt-4 lg:mt-6 bg-white rounded-xl p-4 lg:p-6">
//             <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
//               {/* Mobile Pagination Info */}
//               <div className="lg:hidden text-xs text-slate-600 text-center">
//                 Showing {(pagination.page - 1) * pagination.limit + 1} -{' '}
//                 {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
//                 {pagination.total}
//               </div>

//               {/* Desktop Pagination */}
//               <div className="hidden lg:flex items-center gap-4">
//                 {/* Items per page selector */}
//                 <div className="flex items-center gap-2">
//                   <span className="text-sm text-slate-500">Show</span>
//                   <select
//                     value={itemsPerPage}
//                     onChange={handleItemsPerPageChange}
//                     className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
//                   >
//                     {itemsPerPageOptions.map(option => (
//                       <option key={option} value={option}>{option}</option>
//                     ))}
//                   </select>
//                   <span className="text-sm text-slate-500">entries</span>
//                 </div>

//                 {/* Showing info */}
//                 <div className="text-sm text-slate-500">
//                   Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
//                   {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
//                   {pagination.total} entries
//                 </div>
//               </div>

//               {/* Page navigation - Works on both mobile and desktop */}
//               <div className="flex items-center gap-2">
//                 <button
//                   onClick={() => handlePageChange(currentPage - 1)}
//                   disabled={currentPage === 1}
//                   className={`w-8 h-8 rounded-lg transition-all flex items-center justify-center ${
//                     currentPage === 1
//                       ? 'text-slate-300 cursor-not-allowed'
//                       : 'text-slate-600 hover:bg-slate-100'
//                   }`}
//                 >
//                   <ChevronLeft size={16} />
//                 </button>

//                 {/* Page numbers - Hidden on mobile */}
//                 <div className="hidden lg:flex items-center gap-1">
//                   {[...Array(pagination.pages)].map((_, i) => {
//                     const pageNum = i + 1;
                    
//                     if (
//                       pageNum === 1 ||
//                       pageNum === pagination.pages ||
//                       (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
//                     ) {
//                       return (
//                         <button
//                           key={pageNum}
//                           onClick={() => handlePageChange(pageNum)}
//                           className={`w-8 h-8 rounded-lg font-bold text-sm transition-all flex items-center justify-center ${
//                             currentPage === pageNum
//                               ? 'bg-blue-600 text-white'
//                               : 'text-slate-600 hover:bg-slate-100'
//                           }`}
//                         >
//                           {pageNum}
//                         </button>
//                       );
//                     } else if (
//                       pageNum === currentPage - 2 ||
//                       pageNum === currentPage + 2
//                     ) {
//                       return <span key={pageNum} className="text-slate-400">...</span>;
//                     }
//                     return null;
//                   })}
//                 </div>

//                 {/* Mobile current page indicator */}
//                 <span className="lg:hidden text-xs font-medium">
//                   {currentPage}/{pagination.pages}
//                 </span>

//                 <button
//                   onClick={() => handlePageChange(currentPage + 1)}
//                   disabled={currentPage === pagination.pages}
//                   className={`w-8 h-8 rounded-lg transition-all flex items-center justify-center ${
//                     currentPage === pagination.pages
//                       ? 'text-slate-300 cursor-not-allowed'
//                       : 'text-slate-600 hover:bg-slate-100'
//                   }`}
//                 >
//                   <ChevronRight size={16} />
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Delete Confirmation Modal - Responsive */}
//       {showDeleteModal && selectedHelper && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
//           <div className="bg-white w-full max-w-md rounded-xl lg:rounded-2xl shadow-2xl animate-in zoom-in duration-300">
//             <div className="p-4 lg:p-6">
//               <div className="w-12 h-12 lg:w-16 lg:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 lg:mb-4">
//                 <AlertCircle size={24} className="text-red-600" />
//               </div>
//               <h2 className="text-xl lg:text-2xl font-black text-center text-slate-800 mb-2">Delete Helper</h2>
//               <p className="text-sm lg:text-base text-center text-slate-500 mb-4 lg:mb-6">
//                 Are you sure you want to delete <span className="font-black text-slate-700">{selectedHelper.name}</span>?
//                 This action cannot be undone.
//               </p>
//               <div className="flex gap-2 lg:gap-3">
//                 <button
//                   onClick={() => setShowDeleteModal(false)}
//                   className="flex-1 px-4 lg:px-6 py-3 lg:py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg lg:rounded-xl font-black transition-all text-sm lg:text-base flex items-center justify-center"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleDeleteConfirm}
//                   className="flex-1 px-4 lg:px-6 py-3 lg:py-4 bg-red-600 hover:bg-red-700 text-white rounded-lg lg:rounded-xl font-black transition-all text-sm lg:text-base flex items-center justify-center"
//                 >
//                   Delete
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Leave Status Modal */}
//       {showLeaveModal && selectedHelper && (
//         <LeaveStatusModal
//           helper={selectedHelper}
//           onClose={() => {
//             setShowLeaveModal(false);
//             setSelectedHelper(null);
//           }}
//           onUpdate={handleLeaveStatusUpdated}
//         />
//       )}
//     </div>
//   );
// }
























// pages/helpers/Helpers.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Users,
  UserCog,
  UserCheck,
  UserX,
  Coffee,
  ChevronLeft,
  ChevronRight,
  Menu,
  Grid,
  X
} from "lucide-react";
import { fetchAllHelpers, deleteHelper, fetchHelperStats } from "../../../features/helper/helperSlice";
import showToast from "../../../utils/toast";
import StatusBadge from "../../../components/common/StatusBadge";
import LeaveStatusModal from "../../../components/modals/LeaveStatusModal";

// 🚀 OPTIMIZED: Skeleton Loader Component
const SkeletonRow = () => (
  <div className="animate-pulse">
    <div className="flex items-center space-x-4">
      <div className="w-10 h-10 bg-slate-200 rounded-lg"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
        <div className="h-3 bg-slate-200 rounded w-1/2"></div>
      </div>
    </div>
  </div>
);

const SkeletonTable = () => (
  <div className="space-y-4 p-4">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="border-b border-slate-100 pb-4">
        <SkeletonRow />
      </div>
    ))}
  </div>
);

export default function Helpers() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { helpers, helperStats, loading, pagination } = useSelector((state) => state.helper);
  const { user } = useSelector((state) => state.auth);

  // Get base path based on user role
  const basePath = user?.role === "ADMIN" ? "/admin" : 
                   user?.role === "STORE_KEEPER" ? "/storekeeper" : 
                   "/cuttingmaster";

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  
  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedHelper, setSelectedHelper] = useState(null);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  
  // Mobile state
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [mobileView, setMobileView] = useState("grid"); // 'grid' or 'list'

  const isAdmin = user?.role === "ADMIN";
  const isStoreKeeper = user?.role === "STORE_KEEPER";
  const isCuttingMaster = user?.role === "CUTTING_MASTER";
  const canEdit = isAdmin || isStoreKeeper;
  const canDelete = isAdmin;
  const canAdd = isAdmin || isStoreKeeper;

  // 🚀 OPTIMIZED: Debounced search - prevents API calls on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 400); // 400ms delay: Type panni mudicha appuram dhaan API call pogum

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 🚀 OPTIMIZED: Fetch helpers with pagination - only when debounced search changes
  useEffect(() => {
    dispatch(fetchAllHelpers({ 
      page: currentPage,
      limit: itemsPerPage,
      search: debouncedSearchTerm, 
      status: statusFilter,
      availability: availabilityFilter 
    }));
  }, [dispatch, currentPage, itemsPerPage, debouncedSearchTerm, statusFilter, availabilityFilter]);

  // 🚀 OPTIMIZED: Stats fetch only once on mount and when filters change
  useEffect(() => {
    dispatch(fetchHelperStats());
  }, [dispatch]);

  // Handle Add Helper - with basePath
  const handleAddHelper = useCallback(() => {
    navigate(`${basePath}/helpers/add`);
  }, [navigate, basePath]);

  // Handle View Helper - with basePath
  const handleViewHelper = useCallback((id) => {
    navigate(`${basePath}/helpers/${id}`);
  }, [navigate, basePath]);

  // Handle Edit Helper - with basePath
  const handleEditHelper = useCallback((id) => {
    if (canEdit) {
      navigate(`${basePath}/helpers/edit/${id}`);
    } else {
      showToast.error("You don't have permission to Edit Helpers");
    }
  }, [canEdit, navigate, basePath]);

  const handleDeleteClick = useCallback((helper) => {
    setSelectedHelper(helper);
    setShowDeleteModal(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    try {
      await dispatch(deleteHelper(selectedHelper._id)).unwrap();
      showToast.success("Helper deleted successfully");
      setShowDeleteModal(false);
      setSelectedHelper(null);
    } catch (error) {
      showToast.error(error || "Failed to Delete Helper");
    }
  }, [dispatch, selectedHelper]);

  const handleLeaveUpdate = useCallback((helper) => {
    setSelectedHelper(helper);
    setShowLeaveModal(true);
  }, []);

  const handleLeaveStatusUpdated = useCallback(() => {
    dispatch(fetchAllHelpers({ 
      page: currentPage,
      limit: itemsPerPage,
      search: debouncedSearchTerm, 
      status: statusFilter,
      availability: availabilityFilter 
    }));
  }, [dispatch, currentPage, itemsPerPage, debouncedSearchTerm, statusFilter, availabilityFilter]);

  // Handle page change
  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= (pagination?.pages || 1)) {
      setCurrentPage(newPage);
    }
  }, [pagination?.pages]);

  // Handle items per page change
  const handleItemsPerPageChange = useCallback((e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page
  }, []);

  // 🚀 OPTIMIZED: Memoized functions to prevent re-renders
  const getLeaveStatusIcon = useCallback((status) => {
    switch(status) {
      case "present": return <UserCheck size={14} className="text-green-600" />;
      case "leave": return <UserX size={14} className="text-red-600" />;
      case "half-day": return <Coffee size={14} className="text-orange-600" />;
      case "holiday": return <Calendar size={14} className="text-purple-600" />;
      default: return <UserCheck size={14} className="text-green-600" />;
    }
  }, []);

  const getLeaveStatusColor = useCallback((status) => {
    switch(status) {
      case "present": return "bg-green-100 text-green-800 border-green-200";
      case "leave": return "bg-red-100 text-red-800 border-red-200";
      case "half-day": return "bg-orange-100 text-orange-800 border-orange-200";
      case "holiday": return "bg-purple-100 text-purple-800 border-purple-200";
      default: return "bg-green-100 text-green-800 border-green-200";
    }
  }, []);

  // 🚀 OPTIMIZED: Memoized options arrays
  const statusOptions = useMemo(() => [
    { value: "all", label: "All Status" },
    { value: "present", label: "Present" },
    { value: "leave", label: "On Leave" },
    { value: "half-day", label: "Half Day" },
    { value: "holiday", label: "Holiday" },
  ], []);

  const availabilityOptions = useMemo(() => [
    { value: "all", label: "All" },
    { value: "available", label: "Available" },
    { value: "unavailable", label: "Unavailable" },
  ], []);

  const itemsPerPageOptions = useMemo(() => [5, 10, 25, 50, 100], []);

  // 🚀 OPTIMIZED: Check if data is loading
  const isLoading = loading && helpers?.length === 0;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ===== MOBILE HEADER ===== */}
      <div className="lg:hidden bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-black text-slate-800">Helpers</h1>
          <div className="flex items-center gap-2">
            {canAdd && (
              <button
                onClick={handleAddHelper}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center"
                style={{ minWidth: '36px', minHeight: '36px' }}
              >
                <Plus size={18} />
              </button>
            )}
            <button
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition flex items-center justify-center"
              style={{ minWidth: '36px', minHeight: '36px' }}
            >
              <Filter size={18} />
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search helpers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Mobile Stats Row */}
        <div className="grid grid-cols-5 gap-1 px-4 pb-3">
          <div className="text-center">
            <div className="text-xs font-bold text-blue-600">{helperStats?.total || 0}</div>
            <div className="text-[10px] text-slate-500 truncate">Total</div>
          </div>
          <div className="text-center">
            <div className="text-xs font-bold text-green-600">{helperStats?.present || 0}</div>
            <div className="text-[10px] text-slate-500 truncate">Present</div>
          </div>
          <div className="text-center">
            <div className="text-xs font-bold text-red-600">{helperStats?.onLeave || 0}</div>
            <div className="text-[10px] text-slate-500 truncate">Leave</div>
          </div>
          <div className="text-center">
            <div className="text-xs font-bold text-orange-600">{helperStats?.halfDay || 0}</div>
            <div className="text-[10px] text-slate-500 truncate">Half Day</div>
          </div>
          <div className="text-center">
            <div className="text-xs font-bold text-purple-600">{helperStats?.available || 0}</div>
            <div className="text-[10px] text-slate-500 truncate">Available</div>
          </div>
        </div>

        {/* Mobile Filters Dropdown */}
        {mobileFiltersOpen && (
          <div className="absolute top-full left-4 right-4 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 p-4 z-40">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-800">Filters</h3>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-lg flex items-center justify-center"
                style={{ minWidth: '28px', minHeight: '28px' }}
              >
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Availability</label>
                <select
                  value={availabilityFilter}
                  onChange={(e) => setAvailabilityFilter(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {availabilityOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    setStatusFilter("all");
                    setAvailabilityFilter("all");
                  }}
                  className="flex-1 px-3 py-2.5 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-200 transition"
                >
                  Reset
                </button>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="flex-1 px-3 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ===== DESKTOP HEADER (Hidden on mobile) ===== */}
      <div className="hidden lg:block max-w-7xl mx-auto px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Helpers</p>
                <p className="text-3xl font-black text-slate-800">{helperStats?.total || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <UserCog size={24} className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-6 rounded-2xl shadow-sm border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Present</p>
                <p className="text-3xl font-black text-green-700">{helperStats?.present || 0}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <UserCheck size={24} className="text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-red-50 p-6 rounded-2xl shadow-sm border border-red-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600">On Leave</p>
                <p className="text-3xl font-black text-red-700">{helperStats?.onLeave || 0}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <UserX size={24} className="text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-orange-50 p-6 rounded-2xl shadow-sm border border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600">Half Day</p>
                <p className="text-3xl font-black text-orange-700">{helperStats?.halfDay || 0}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Coffee size={24} className="text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-purple-50 p-6 rounded-2xl shadow-sm border border-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600">Available</p>
                <p className="text-3xl font-black text-purple-700">{helperStats?.available || 0}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <CheckCircle size={24} className="text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">
              Helpers Management
            </h1>
            <p className="text-slate-500 font-medium">Manage all Helpers and their work assignments</p>
          </div>
          {canAdd && (
            <button
              onClick={handleAddHelper}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2"
            >
              <Plus size={20} />
              Add Helper
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="relative md:col-span-2">
            <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, phone, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>

          <select
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
            className="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
          >
            {availabilityOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 pb-8">
        {/* Mobile View Toggle */}
        <div className="lg:hidden flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setMobileView("grid")}
              className={`p-2 rounded-lg transition flex items-center justify-center ${
                mobileView === "grid" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"
              }`}
              style={{ minWidth: '36px', minHeight: '36px' }}
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setMobileView("list")}
              className={`p-2 rounded-lg transition flex items-center justify-center ${
                mobileView === "list" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"
              }`}
              style={{ minWidth: '36px', minHeight: '36px' }}
            >
              <Menu size={16} />
            </button>
          </div>
          <span className="text-xs text-slate-500">
            {helpers?.length || 0} helpers
          </span>
        </div>

        {/* 🚀 OPTIMIZED: Skeleton Loader for better UX */}
        {isLoading ? (
          <div className="bg-white rounded-xl p-4">
            <SkeletonTable />
          </div>
        ) : helpers?.length > 0 ? (
          <>
            {/* ===== MOBILE GRID VIEW ===== */}
            {mobileView === "grid" && (
              <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-3">
                {helpers.map((helper) => (
                  <div
                    key={helper._id}
                    className="bg-white rounded-xl border border-slate-200 p-3 hover:shadow-md transition-all"
                  >
                    {/* Header with Avatar and Status */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {helper.name?.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-800 text-sm truncate max-w-[100px]">{helper.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">{helper.helperId}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap ${getLeaveStatusColor(helper.leaveStatus)}`}>
                        {helper.leaveStatus}
                      </span>
                    </div>

                    {/* Contact and Specialization */}
                    <div className="space-y-1 mb-2">
                      <p className="text-xs text-slate-600 truncate">{helper.phone}</p>
                      <div className="flex flex-wrap gap-1">
                        {helper.specialization?.slice(0, 2).map((spec, idx) => (
                          <span key={idx} className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[8px]">
                            {spec}
                          </span>
                        ))}
                        {helper.specialization?.length > 2 && (
                          <span className="text-[8px] text-slate-400">+{helper.specialization.length - 2}</span>
                        )}
                      </div>
                    </div>

                    {/* Work Stats */}
                    <div className="grid grid-cols-3 gap-1 text-center mb-3 text-[10px]">
                      <div>
                        <div className="font-bold text-blue-600">{helper.workStats?.totalAssigned || 0}</div>
                        <div className="text-slate-500">Total</div>
                      </div>
                      <div>
                        <div className="font-bold text-green-600">{helper.workStats?.completed || 0}</div>
                        <div className="text-slate-500">Done</div>
                      </div>
                      <div>
                        <div className="font-bold text-orange-600">{helper.workStats?.inProgress || 0}</div>
                        <div className="text-slate-500">Progress</div>
                      </div>
                    </div>

                    {/* Action Icons */}
                    <div className="flex items-center justify-center gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => handleViewHelper(helper._id)}
                        className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-all flex items-center justify-center"
                        title="View"
                      >
                        <Eye size={14} />
                      </button>
                      {canEdit && (
                        <button
                          onClick={() => handleLeaveUpdate(helper)}
                          className="w-8 h-8 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-all flex items-center justify-center"
                          title="Leave"
                        >
                          <Calendar size={14} />
                        </button>
                      )}
                      {canEdit && (
                        <button
                          onClick={() => handleEditHelper(helper._id)}
                          className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all flex items-center justify-center"
                          title="Edit"
                        >
                          <Edit size={14} />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => handleDeleteClick(helper)}
                          className="w-8 h-8 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all flex items-center justify-center"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ===== MOBILE LIST VIEW ===== */}
            {mobileView === "list" && (
              <div className="lg:hidden space-y-2">
                {helpers.map((helper) => (
                  <div
                    key={helper._id}
                    className="bg-white rounded-xl border border-slate-200 p-3 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {helper.name?.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-800 text-sm truncate">{helper.name}</p>
                          <p className="text-xs text-slate-500 truncate">{helper.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-medium whitespace-nowrap ${getLeaveStatusColor(helper.leaveStatus)}`}>
                          {helper.leaveStatus}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div className="text-slate-500 truncate max-w-[100px]">ID: {helper.helperId}</div>
                      <div className="flex items-center gap-2">
                        <span className="text-blue-600 font-medium">{helper.workStats?.totalAssigned || 0} works</span>
                        <button
                          onClick={() => handleViewHelper(helper._id)}
                          className="w-7 h-7 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-all flex items-center justify-center"
                          title="View"
                        >
                          <Eye size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ===== DESKTOP TABLE VIEW ===== */}
            <div className="hidden lg:block bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Helper ID</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Phone</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Specialization</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Experience</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Work Stats</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {helpers.map((helper) => (
                      <tr key={helper._id} className="hover:bg-slate-50 transition-all">
                        <td className="px-6 py-4 font-mono font-bold text-blue-600">{helper.helperId}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
                              {helper.name?.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-slate-800 truncate max-w-[150px]">{helper.name}</p>
                              <p className="text-xs text-slate-400 truncate">{helper.email || 'No email'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{helper.phone}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {helper.specialization?.slice(0, 2).map((spec, idx) => (
                              <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium whitespace-nowrap">
                                {spec}
                              </span>
                            ))}
                            {helper.specialization?.length > 2 && (
                              <span className="text-xs text-slate-400">+{helper.specialization.length - 2}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium">{helper.experience || 0} years</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {getLeaveStatusIcon(helper.leaveStatus)}
                            <span className={`text-sm font-medium ${
                              helper.leaveStatus === 'present' ? 'text-green-600' :
                              helper.leaveStatus === 'leave' ? 'text-red-600' :
                              helper.leaveStatus === 'half-day' ? 'text-orange-600' :
                              'text-purple-600'
                            }`}>
                              {helper.leaveStatus?.replace('-', ' ')}
                            </span>
                          </div>
                          {!helper.isAvailable && (
                            <span className="text-xs text-red-500 block mt-1">Unavailable</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-slate-400">Total:</span>
                              <span className="font-bold">{helper.workStats?.totalAssigned || 0}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-green-600">✓ Completed:</span>
                              <span className="font-bold">{helper.workStats?.completed || 0}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-orange-600">⚡ In Progress:</span>
                              <span className="font-bold">{helper.workStats?.inProgress || 0}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-yellow-600">⏳ Pending:</span>
                              <span className="font-bold">{helper.workStats?.pending || 0}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewHelper(helper._id)}
                              className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-all flex items-center justify-center"
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                            
                            {(canEdit || helper._id === user?.helperId) && (
                              <button
                                onClick={() => handleLeaveUpdate(helper)}
                                className="w-8 h-8 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-all flex items-center justify-center"
                                title="Update Leave Status"
                              >
                                <Calendar size={16} />
                              </button>
                            )}

                            {canEdit && (
                              <button
                                onClick={() => handleEditHelper(helper._id)}
                                className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all flex items-center justify-center"
                                title="Edit"
                              >
                                <Edit size={16} />
                              </button>
                            )}

                            {canDelete && (
                              <button
                                onClick={() => handleDeleteClick(helper)}
                                className="w-8 h-8 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all flex items-center justify-center"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          // Empty State
          <div className="bg-white rounded-xl p-8 text-center">
            <UserCog size={40} className="text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-base">No Helpers found</p>
            {canAdd && (
              <button
                onClick={handleAddHelper}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold inline-flex items-center justify-center gap-2 text-sm"
              >
                <Plus size={16} />
                Add Your First Helper
              </button>
            )}
          </div>
        )}

        {/* Pagination Section */}
        {pagination?.pages > 1 && (
          <div className="mt-4 lg:mt-6 bg-white rounded-xl p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="lg:hidden text-xs text-slate-600 text-center">
                Showing {(pagination.page - 1) * pagination.limit + 1} -{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total}
              </div>

              <div className="hidden lg:flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">Show</span>
                  <select
                    value={itemsPerPage}
                    onChange={handleItemsPerPageChange}
                    className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {itemsPerPageOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  <span className="text-sm text-slate-500">entries</span>
                </div>

                <div className="text-sm text-slate-500">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} entries
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`w-8 h-8 rounded-lg transition-all flex items-center justify-center ${
                    currentPage === 1
                      ? 'text-slate-300 cursor-not-allowed'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <ChevronLeft size={16} />
                </button>

                <div className="hidden lg:flex items-center gap-1">
                  {[...Array(pagination.pages)].map((_, i) => {
                    const pageNum = i + 1;
                    
                    if (
                      pageNum === 1 ||
                      pageNum === pagination.pages ||
                      (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-8 h-8 rounded-lg font-bold text-sm transition-all flex items-center justify-center ${
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (
                      pageNum === currentPage - 2 ||
                      pageNum === currentPage + 2
                    ) {
                      return <span key={pageNum} className="text-slate-400">...</span>;
                    }
                    return null;
                  })}
                </div>

                <span className="lg:hidden text-xs font-medium">
                  {currentPage}/{pagination.pages}
                </span>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.pages}
                  className={`w-8 h-8 rounded-lg transition-all flex items-center justify-center ${
                    currentPage === pagination.pages
                      ? 'text-slate-300 cursor-not-allowed'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedHelper && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-xl lg:rounded-2xl shadow-2xl animate-in zoom-in duration-300">
            <div className="p-4 lg:p-6">
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 lg:mb-4">
                <AlertCircle size={24} className="text-red-600" />
              </div>
              <h2 className="text-xl lg:text-2xl font-black text-center text-slate-800 mb-2">Delete Helper</h2>
              <p className="text-sm lg:text-base text-center text-slate-500 mb-4 lg:mb-6">
                Are you sure you want to delete <span className="font-black text-slate-700">{selectedHelper.name}</span>?
                This action cannot be undone.
              </p>
              <div className="flex gap-2 lg:gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 lg:px-6 py-3 lg:py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg lg:rounded-xl font-black transition-all text-sm lg:text-base flex items-center justify-center"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 px-4 lg:px-6 py-3 lg:py-4 bg-red-600 hover:bg-red-700 text-white rounded-lg lg:rounded-xl font-black transition-all text-sm lg:text-base flex items-center justify-center"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leave Status Modal */}
      {showLeaveModal && selectedHelper && (
        <LeaveStatusModal
          helper={selectedHelper}
          onClose={() => {
            setShowLeaveModal(false);
            setSelectedHelper(null);
          }}
          onUpdate={handleLeaveStatusUpdated}
        />
      )}
    </div>
  );
}
