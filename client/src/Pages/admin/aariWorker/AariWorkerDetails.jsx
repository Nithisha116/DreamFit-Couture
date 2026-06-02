// // pages/aari-workers/AariWorkerDetails.jsx
// import React, { useState, useEffect, useMemo } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   ArrowLeft,
//   Edit,
//   Trash2,
//   Calendar,
//   Phone,
//   Mail,
//   MapPin,
//   Briefcase,
//   Wand2,
//   CheckCircle,
//   Clock,
//   AlertCircle,
//   UserCheck,
//   UserX,
//   Coffee,
//   Star,
//   MessageCircle,
//   Download,
//   TrendingUp,
//   Award,
//   Target,
//   Zap,
//   PieChart,
//   BarChart3,
//   ChevronRight,
//   Menu,
//   X
// } from "lucide-react";
// import { fetchAariWorkerById, deleteAariWorker } from "../../../features/aariWorker/aariWorkerSlice";
// import showToast from "../../../utils/toast";
// import StatusBadge from "../../../components/common/StatusBadge";
// import LeaveStatusModal from "../../../components/modals/LeaveStatusModal";

// export default function AariWorkerDetails() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
  
//   const { currentAariWorker, works, workStats, loading } = useSelector((state) => state.aariWorker);
//   const { user } = useSelector((state) => state.auth);

//   // Mobile menu state
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

//   // ✅ Get base path based on user role
//   const basePath = user?.role === "ADMIN" ? "/admin" : 
//                    user?.role === "STORE_KEEPER" ? "/storekeeper" : 
//                    "/cuttingmaster";

//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [showLeaveModal, setShowLeaveModal] = useState(false);
//   const [activeTab, setActiveTab] = useState("overview"); // overview, works, performance
//   const [selectedWorkStatus, setSelectedWorkStatus] = useState("all");
//   const [workPage, setWorkPage] = useState(1);
//   const worksPerPage = 5;

//   const isAdmin = user?.role === "ADMIN";
//   const isStoreKeeper = user?.role === "STORE_KEEPER";
//   const isCuttingMaster = user?.role === "CUTTING_MASTER";
//   const isAariWorkerSelf = user?.aariWorkerId === id;
  
//   const canEdit = isAdmin || isStoreKeeper || isAariWorkerSelf;
//   const canDelete = isAdmin;
//   const canUpdateLeave = isAdmin || isStoreKeeper || isCuttingMaster || isAariWorkerSelf;

//   useEffect(() => {
//     if (id) {
//       dispatch(fetchAariWorkerById(id));
//     }
//   }, [dispatch, id]);

//   // ✅ Handle Back - with basePath
//   const handleBack = () => {
//     navigate(`${basePath}/aari-workers`);
//   };

//   // ✅ Handle Edit - with basePath
//   const handleEdit = () => {
//     if (canEdit) {
//       navigate(`${basePath}/aari-workers/edit/${id}`);
//     } else {
//       showToast.error("You don't have permission to edit this aariWorker");
//     }
//   };

//   const handleDelete = async () => {
//     try {
//       await dispatch(deleteAariWorker(id)).unwrap();
//       showToast.success("Aari Worker deleted successfully");
//       navigate(`${basePath}/aari-workers`);
//     } catch (error) {
//       showToast.error(error || "Failed to Delete Aari Worker");
//     }
//   };

//   const getLeaveStatusIcon = (status) => {
//     switch(status) {
//       case "present": return <UserCheck size={20} className="text-green-600" />;
//       case "leave": return <UserX size={20} className="text-red-600" />;
//       case "half-day": return <Coffee size={20} className="text-orange-600" />;
//       case "holiday": return <Calendar size={20} className="text-purple-600" />;
//       default: return <UserCheck size={20} className="text-green-600" />;
//     }
//   };

//   const getStatusColor = (status) => {
//     switch(status) {
//       case "present": return "text-green-600 bg-green-100";
//       case "leave": return "text-red-600 bg-red-100";
//       case "half-day": return "text-orange-600 bg-orange-100";
//       case "holiday": return "text-purple-600 bg-purple-100";
//       default: return "text-green-600 bg-green-100";
//     }
//   };

//   const getWorkStatusBadge = (status) => {
//     const statusConfig = {
//       'pending': { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' },
//       'accepted': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Accepted' },
//       'cutting-started': { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Cutting Started' },
//       'cutting-completed': { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'Cutting Completed' },
//       'sewing-started': { bg: 'bg-pink-100', text: 'text-pink-700', label: 'Sewing Started' },
//       'sewing-completed': { bg: 'bg-teal-100', text: 'text-teal-700', label: 'Sewing Completed' },
//       'ironing': { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Ironing' },
//       'ready-to-deliver': { bg: 'bg-green-100', text: 'text-green-700', label: 'Ready to Deliver' }
//     };
//     return statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-700', label: status };
//   };

//   const formatDate = (date) => {
//     if (!date) return 'N/A';
//     return new Date(date).toLocaleDateString('en-IN', {
//       day: '2-digit',
//       month: 'short',
//       year: 'numeric'
//     });
//   };

//   const formatDateTime = (date) => {
//     if (!date) return 'N/A';
//     return new Date(date).toLocaleDateString('en-IN', {
//       day: '2-digit',
//       month: 'short',
//       year: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   // ✅ Handle Work click - with basePath
//   const handleWorkClick = (workId) => {
//     navigate(`${basePath}/works/${workId}`);
//   };

//   // ✅ Calculate performance metrics from workStats
//   const performanceMetrics = useMemo(() => {
//     // Get values from workStats with proper fallbacks
//     const totalAssigned = workStats?.totalAssigned || 0;
//     const completed = workStats?.completed || 0;
//     const inProgress = workStats?.inProgress || 0;
//     const pending = workStats?.pending || 0;
    
//     // Calculate total from individual stats to verify
//     const calculatedTotal = completed + inProgress + pending;
//     const displayTotal = totalAssigned > 0 ? totalAssigned : calculatedTotal;
    
//     const completionRate = displayTotal > 0 ? Math.round((completed / displayTotal) * 100) : 0;
//     const efficiency = displayTotal > 0 ? Math.round((completed / displayTotal) * 100) : 0;
    
//     return {
//       total: displayTotal,
//       completed,
//       inProgress,
//       pending,
//       completionRate,
//       efficiency
//     };
//   }, [workStats]);

//   // ✅ Filter works by status
//   const filteredWorks = useMemo(() => {
//     if (!works) return [];
//     if (selectedWorkStatus === 'all') return works;
//     return works.filter(work => work.status === selectedWorkStatus);
//   }, [works, selectedWorkStatus]);

//   // ✅ Paginate works
//   const paginatedWorks = useMemo(() => {
//     const start = (workPage - 1) * worksPerPage;
//     const end = start + worksPerPage;
//     return filteredWorks.slice(start, end);
//   }, [filteredWorks, workPage]);

//   const totalPages = Math.ceil(filteredWorks.length / worksPerPage);

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center min-h-[400px]">
//         <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
//       </div>
//     );
//   }

//   if (!currentAariWorker) {
//     return (
//       <div className="text-center py-8 sm:py-16 bg-white rounded-2xl sm:rounded-3xl shadow-sm px-4">
//         <Wand2 size={48} className="mx-auto text-slate-300 mb-4 sm:w-16 sm:h-16" />
//         <h2 className="text-xl sm:text-2xl font-black text-slate-800 mb-2">AariWorker Not Found</h2>
//         <p className="text-sm sm:text-base text-slate-500 mb-6">The aariWorker you're looking for doesn't exist.</p>
//         <button
//           onClick={handleBack}
//           className="bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base"
//         >
//           Back to Aari Workers
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-500 px-4 sm:px-0">
//       {/* Header with Actions - Mobile Responsive */}
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
//         <button
//           onClick={handleBack}
//           className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors group self-start"
//         >
//           <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
//           <span className="font-bold text-sm sm:text-base">Back to Aari Workers</span>
//         </button>

//         {/* Mobile Menu Button */}
//         <div className="sm:hidden">
//           <button
//             onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
//             className="w-full flex items-center justify-between bg-slate-100 px-4 py-3 rounded-xl"
//           >
//             <span className="font-bold text-slate-700">Actions</span>
//             {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
//           </button>
          
//           {/* Mobile Action Menu */}
//           {isMobileMenuOpen && (
//             <div className="absolute right-4 left-4 mt-2 bg-white rounded-xl shadow-lg border border-slate-200 z-10">
//               <div className="p-2 space-y-1">
//                 {canUpdateLeave && (
//                   <button
//                     onClick={() => {
//                       setShowLeaveModal(true);
//                       setIsMobileMenuOpen(false);
//                     }}
//                     className="w-full text-left px-4 py-3 hover:bg-orange-50 rounded-lg text-orange-600 font-bold flex items-center gap-2"
//                   >
//                     <Calendar size={18} />
//                     Update Leave
//                   </button>
//                 )}
//                 {canEdit && (
//                   <button
//                     onClick={() => {
//                       handleEdit();
//                       setIsMobileMenuOpen(false);
//                     }}
//                     className="w-full text-left px-4 py-3 hover:bg-blue-50 rounded-lg text-blue-600 font-bold flex items-center gap-2"
//                   >
//                     <Edit size={18} />
//                     Edit
//                   </button>
//                 )}
//                 {canDelete && (
//                   <button
//                     onClick={() => {
//                       setShowDeleteModal(true);
//                       setIsMobileMenuOpen(false);
//                     }}
//                     className="w-full text-left px-4 py-3 hover:bg-red-50 rounded-lg text-red-600 font-bold flex items-center gap-2"
//                   >
//                     <Trash2 size={18} />
//                     Delete
//                   </button>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Desktop Action Buttons */}
//         <div className="hidden sm:flex items-center gap-3">
//           {canUpdateLeave && (
//             <button
//               onClick={() => setShowLeaveModal(true)}
//               className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 text-sm"
//             >
//               <Calendar size={18} />
//               Update Leave
//             </button>
//           )}

//           {canEdit && (
//             <button
//               onClick={handleEdit}
//               className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 text-sm"
//             >
//               <Edit size={18} />
//               Edit
//             </button>
//           )}

//           {canDelete && (
//             <button
//               onClick={() => setShowDeleteModal(true)}
//               className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 text-sm"
//             >
//               <Trash2 size={18} />
//               Delete
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
//         {/* Header with Avatar and Basic Info - Mobile Responsive */}
//         <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 sm:px-8 py-4 sm:py-6">
//           <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
//             <div className="flex items-center gap-4 sm:gap-6">
//               <div className="w-16 h-16 sm:w-24 sm:h-24 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center text-white border-2 border-white/30 flex-shrink-0">
//                 <span className="text-3xl sm:text-5xl font-black">
//                   {currentAariWorker.name?.charAt(0)}
//                 </span>
//               </div>
//               <div className="text-white flex-1 min-w-0">
//                 <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
//                   <h1 className="text-xl sm:text-3xl font-black truncate">{currentAariWorker.name}</h1>
//                   <span className="self-start sm:self-auto px-2 sm:px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs sm:text-sm font-bold w-fit">
//                     {currentAariWorker.aariWorkerId}
//                   </span>
//                 </div>
//                 <div className="flex flex-wrap items-center gap-3 sm:gap-4">
//                   <div className="flex items-center gap-1 sm:gap-2">
//                     {getLeaveStatusIcon(currentAariWorker.leaveStatus)}
//                     <span className="text-xs sm:text-sm font-medium capitalize">
//                       {currentAariWorker.leaveStatus?.replace('-', ' ')}
//                     </span>
//                   </div>
//                   <div className="flex items-center gap-1 sm:gap-2">
//                     <Briefcase size={14} className="sm:w-4 sm:h-4" />
//                     <span className="text-xs sm:text-sm font-medium">{currentAariWorker.experience || 0} years exp</span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//             <div className="sm:text-right">
//               <p className="text-white/80 text-xs sm:text-sm">Joined on</p>
//               <p className="text-white font-bold text-sm sm:text-base">{formatDate(currentAariWorker.joiningDate)}</p>
//             </div>
//           </div>
//         </div>

//         {/* Tabs - Mobile Responsive (Scrollable) */}
//         <div className="border-b border-slate-200 px-4 sm:px-8 overflow-x-auto">
//           <div className="flex gap-4 sm:gap-8 min-w-max sm:min-w-0">
//             <button
//               onClick={() => setActiveTab("overview")}
//               className={`py-3 sm:py-4 font-bold text-xs sm:text-sm border-b-2 transition-colors ${
//                 activeTab === "overview"
//                   ? "border-blue-600 text-blue-600"
//                   : "border-transparent text-slate-500 hover:text-slate-700"
//               }`}
//             >
//               Overview
//             </button>
//             <button
//               onClick={() => setActiveTab("works")}
//               className={`py-3 sm:py-4 font-bold text-xs sm:text-sm border-b-2 transition-colors ${
//                 activeTab === "works"
//                   ? "border-blue-600 text-blue-600"
//                   : "border-transparent text-slate-500 hover:text-slate-700"
//               }`}
//             >
//               Work History ({works?.length || 0})
//             </button>
//             <button
//               onClick={() => setActiveTab("performance")}
//               className={`py-3 sm:py-4 font-bold text-xs sm:text-sm border-b-2 transition-colors ${
//                 activeTab === "performance"
//                   ? "border-blue-600 text-blue-600"
//                   : "border-transparent text-slate-500 hover:text-slate-700"
//               }`}
//             >
//               Performance
//             </button>
//           </div>
//         </div>

//         {/* Tab Content */}
//         <div className="p-4 sm:p-8">
//           {activeTab === "overview" && (
//             <div className="space-y-6 sm:space-y-8">
//               {/* Stats Cards - Mobile Responsive Grid */}
//               <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
//                 <div className="bg-blue-50 p-3 sm:p-6 rounded-xl border border-blue-100">
//                   <div className="flex items-center justify-between mb-1 sm:mb-2">
//                     <Briefcase size={18} className="text-blue-600 sm:w-6 sm:h-6" />
//                     <span className="text-[10px] sm:text-xs font-bold text-blue-600 uppercase">Total</span>
//                   </div>
//                   <p className="text-xl sm:text-3xl font-black text-blue-700">{workStats?.totalAssigned || 0}</p>
//                   <p className="text-[10px] sm:text-xs text-blue-600 mt-0.5 sm:mt-1">Works Assigned</p>
//                 </div>
                
//                 <div className="bg-green-50 p-3 sm:p-6 rounded-xl border border-green-100">
//                   <div className="flex items-center justify-between mb-1 sm:mb-2">
//                     <CheckCircle size={18} className="text-green-600 sm:w-6 sm:h-6" />
//                     <span className="text-[10px] sm:text-xs font-bold text-green-600 uppercase">Done</span>
//                   </div>
//                   <p className="text-xl sm:text-3xl font-black text-green-700">{workStats?.completed || 0}</p>
//                   <p className="text-[10px] sm:text-xs text-green-600 mt-0.5 sm:mt-1">Completed Works</p>
//                 </div>
                
//                 <div className="bg-orange-50 p-3 sm:p-6 rounded-xl border border-orange-100">
//                   <div className="flex items-center justify-between mb-1 sm:mb-2">
//                     <Clock size={18} className="text-orange-600 sm:w-6 sm:h-6" />
//                     <span className="text-[10px] sm:text-xs font-bold text-orange-600 uppercase">Current</span>
//                   </div>
//                   <p className="text-xl sm:text-3xl font-black text-orange-700">{workStats?.inProgress || 0}</p>
//                   <p className="text-[10px] sm:text-xs text-orange-600 mt-0.5 sm:mt-1">In Progress</p>
//                 </div>
                
//                 <div className="bg-yellow-50 p-3 sm:p-6 rounded-xl border border-yellow-100">
//                   <div className="flex items-center justify-between mb-1 sm:mb-2">
//                     <AlertCircle size={18} className="text-yellow-600 sm:w-6 sm:h-6" />
//                     <span className="text-[10px] sm:text-xs font-bold text-yellow-600 uppercase">Queue</span>
//                   </div>
//                   <p className="text-xl sm:text-3xl font-black text-yellow-700">{workStats?.pending || 0}</p>
//                   <p className="text-[10px] sm:text-xs text-yellow-600 mt-0.5 sm:mt-1">Pending Works</p>
//                 </div>
//               </div>

//               {/* Performance Overview - Mobile Responsive */}
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
//                 <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 sm:p-6 rounded-xl border border-purple-100">
//                   <h3 className="font-black text-purple-800 mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
//                     <Award size={18} className="sm:w-5 sm:h-5" />
//                     Performance Overview
//                   </h3>
//                   <div className="space-y-3 sm:space-y-4">
//                     <div>
//                       <div className="flex justify-between text-xs sm:text-sm mb-1">
//                         <span className="text-purple-700">Completion Rate</span>
//                         <span className="font-bold text-purple-800">{performanceMetrics.completionRate}%</span>
//                       </div>
//                       <div className="w-full bg-purple-200 rounded-full h-1.5 sm:h-2">
//                         <div 
//                           className="bg-purple-600 h-1.5 sm:h-2 rounded-full transition-all duration-500"
//                           style={{ width: `${performanceMetrics.completionRate}%` }}
//                         ></div>
//                       </div>
//                     </div>
//                     <div>
//                       <div className="flex justify-between text-xs sm:text-sm mb-1">
//                         <span className="text-indigo-700">Efficiency Score</span>
//                         <span className="font-bold text-indigo-800">{performanceMetrics.efficiency}%</span>
//                       </div>
//                       <div className="w-full bg-indigo-200 rounded-full h-1.5 sm:h-2">
//                         <div 
//                           className="bg-indigo-600 h-1.5 sm:h-2 rounded-full transition-all duration-500"
//                           style={{ width: `${performanceMetrics.efficiency}%` }}
//                         ></div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 sm:p-6 rounded-xl border border-blue-100">
//                   <h3 className="font-black text-blue-800 mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
//                     <Target size={18} className="sm:w-5 sm:h-5" />
//                     Quick Stats
//                   </h3>
//                   <div className="grid grid-cols-2 gap-3 sm:gap-4">
//                     <div>
//                       <p className="text-xs text-blue-600">Total Works</p>
//                       <p className="text-xl sm:text-2xl font-black text-blue-800">{performanceMetrics.total}</p>
//                     </div>
//                     <div>
//                       <p className="text-xs text-cyan-600">Success Rate</p>
//                       <p className="text-xl sm:text-2xl font-black text-cyan-800">{performanceMetrics.completionRate}%</p>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Contact Information - Mobile Responsive */}
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
//                 <div className="space-y-3 sm:space-y-4">
//                   <h3 className="font-black text-slate-800 text-sm sm:text-base">Contact Information</h3>
                  
//                   <div className="bg-slate-50 p-3 sm:p-4 rounded-xl">
//                     <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
//                       <Phone size={16} className="text-blue-600 sm:w-[18px] sm:h-[18px]" />
//                       <span className="text-xs sm:text-sm font-medium text-slate-600">Phone</span>
//                     </div>
//                     <p className="text-sm sm:text-lg font-bold text-slate-800 ml-6 sm:ml-8 break-all">{currentAariWorker.phone}</p>
//                   </div>

//                   {currentAariWorker.email && (
//                     <div className="bg-slate-50 p-3 sm:p-4 rounded-xl">
//                       <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
//                         <Mail size={16} className="text-purple-600 sm:w-[18px] sm:h-[18px]" />
//                         <span className="text-xs sm:text-sm font-medium text-slate-600">Email</span>
//                       </div>
//                       <p className="text-sm sm:text-lg font-bold text-slate-800 ml-6 sm:ml-8 break-all">{currentAariWorker.email}</p>
//                     </div>
//                   )}

//                   {currentAariWorker.address && (
//                     <div className="bg-slate-50 p-3 sm:p-4 rounded-xl">
//                       <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
//                         <MapPin size={16} className="text-green-600 sm:w-[18px] sm:h-[18px]" />
//                         <span className="text-xs sm:text-sm font-medium text-slate-600">Address</span>
//                       </div>
//                       <p className="text-sm sm:text-lg font-bold text-slate-800 ml-6 sm:ml-8">
//                         {currentAariWorker.address.street && <>{currentAariWorker.address.street}<br /></>}
//                         {[currentAariWorker.address.city, currentAariWorker.address.state, currentAariWorker.address.pincode]
//                           .filter(Boolean).join(', ')}
//                       </p>
//                     </div>
//                   )}
//                 </div>

//                 <div className="space-y-3 sm:space-y-4">
//                   <h3 className="font-black text-slate-800 text-sm sm:text-base">Professional Information</h3>
                  
//                   <div className="bg-slate-50 p-3 sm:p-4 rounded-xl">
//                     <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
//                       <Wand2 size={16} className="text-indigo-600 sm:w-[18px] sm:h-[18px]" />
//                       <span className="text-xs sm:text-sm font-medium text-slate-600">Specialization</span>
//                     </div>
//                     <div className="ml-6 sm:ml-8 flex flex-wrap gap-1 sm:gap-2">
//                       {currentAariWorker.specialization?.length > 0 ? (
//                         currentAariWorker.specialization.map((spec, idx) => (
//                           <span key={idx} className="px-2 sm:px-3 py-0.5 sm:py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
//                             {spec}
//                           </span>
//                         ))
//                       ) : (
//                         <p className="text-slate-500 text-xs sm:text-sm">No specialization specified</p>
//                       )}
//                     </div>
//                   </div>

//                   <div className="bg-slate-50 p-3 sm:p-4 rounded-xl">
//                     <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
//                       <Star size={16} className="text-yellow-600 sm:w-[18px] sm:h-[18px]" />
//                       <span className="text-xs sm:text-sm font-medium text-slate-600">Performance Rating</span>
//                     </div>
//                     <div className="ml-6 sm:ml-8">
//                       <div className="flex items-center gap-1 sm:gap-2">
//                         <span className="text-xl sm:text-2xl font-black text-yellow-600">
//                           {currentAariWorker.performance?.rating || 0}
//                         </span>
//                         <span className="text-xs sm:text-sm text-slate-400">/ 5</span>
//                       </div>
//                       <p className="text-xs text-slate-500 mt-0.5 sm:mt-1">
//                         Based on {currentAariWorker.performance?.feedback?.length || 0} reviews
//                       </p>
//                     </div>
//                   </div>

//                   {currentAariWorker.leaveStatus !== 'present' && (
//                     <div className="bg-orange-50 p-3 sm:p-4 rounded-xl border border-orange-200">
//                       <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
//                         <AlertCircle size={16} className="text-orange-600 sm:w-[18px] sm:h-[18px]" />
//                         <span className="text-xs sm:text-sm font-bold text-orange-600">Leave Information</span>
//                       </div>
//                       <div className="ml-6 sm:ml-8 space-y-0.5 sm:space-y-1 text-xs sm:text-sm">
//                         <p><span className="font-medium">Status:</span> {currentAariWorker.leaveStatus}</p>
//                         {currentAariWorker.leaveFrom && (
//                           <p><span className="font-medium">From:</span> {formatDate(currentAariWorker.leaveFrom)}</p>
//                         )}
//                         {currentAariWorker.leaveTo && (
//                           <p><span className="font-medium">To:</span> {formatDate(currentAariWorker.leaveTo)}</p>
//                         )}
//                         {currentAariWorker.leaveReason && (
//                           <p className="break-words"><span className="font-medium">Reason:</span> {currentAariWorker.leaveReason}</p>
//                         )}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           )}

//           {activeTab === "works" && (
//             <div>
//               {/* Work Status Filter - Mobile Responsive */}
//               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
//                 <h3 className="font-black text-slate-800 text-sm sm:text-base">Work History</h3>
//                 <select
//                   value={selectedWorkStatus}
//                   onChange={(e) => {
//                     setSelectedWorkStatus(e.target.value);
//                     setWorkPage(1);
//                   }}
//                   className="w-full sm:w-auto px-3 sm:px-4 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
//                 >
//                   <option value="all">All Status</option>
//                   <option value="pending">Pending</option>
//                   <option value="accepted">Accepted</option>
//                   <option value="cutting-started">Cutting Started</option>
//                   <option value="cutting-completed">Cutting Completed</option>
//                   <option value="sewing-started">Sewing Started</option>
//                   <option value="sewing-completed">Sewing Completed</option>
//                   <option value="ironing">Ironing</option>
//                   <option value="ready-to-deliver">Ready to Deliver</option>
//                 </select>
//               </div>

//               {filteredWorks?.length > 0 ? (
//                 <>
//                   <div className="space-y-3">
//                     {paginatedWorks.map((work) => {
//                       const statusBadge = getWorkStatusBadge(work.status);
//                       return (
//                         <div
//                           key={work._id}
//                           className="bg-slate-50 rounded-xl p-3 sm:p-4 border border-slate-200 hover:shadow-md transition-all cursor-pointer group"
//                           onClick={() => handleWorkClick(work._id)}
//                         >
//                           <div className="flex items-start justify-between gap-2">
//                             <div className="flex-1 min-w-0">
//                               <div className="flex flex-wrap items-center gap-2 mb-2 sm:mb-3">
//                                 <span className="font-mono font-bold text-blue-600 text-xs sm:text-sm">{work.workId}</span>
//                                 <span className={`px-2 py-0.5 sm:px-2 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold ${statusBadge.bg} ${statusBadge.text}`}>
//                                   {statusBadge.label}
//                                 </span>
//                               </div>
                              
//                               <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm">
//                                 <div className="min-w-0">
//                                   <p className="text-[10px] sm:text-xs text-slate-400 mb-0.5">Order</p>
//                                   <p className="font-medium text-slate-800 truncate">{work.order?.orderId || 'N/A'}</p>
//                                 </div>
//                                 <div className="min-w-0">
//                                   <p className="text-[10px] sm:text-xs text-slate-400 mb-0.5">Garment</p>
//                                   <p className="font-medium text-slate-800 truncate">{work.garment?.name || 'N/A'}</p>
//                                 </div>
//                                 <div className="min-w-0">
//                                   <p className="text-[10px] sm:text-xs text-slate-400 mb-0.5">Assigned</p>
//                                   <p className="text-slate-600 truncate">{formatDate(work.createdAt)}</p>
//                                 </div>
//                                 <div className="min-w-0">
//                                   <p className="text-[10px] sm:text-xs text-slate-400 mb-0.5">Delivery</p>
//                                   <p className="text-slate-600 truncate">{formatDate(work.estimatedDelivery)}</p>
//                                 </div>
//                               </div>

//                               {/* Show timestamps if available - Mobile Responsive */}
//                               {(work.cuttingStartedAt || work.sewingStartedAt || work.readyAt) && (
//                                 <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-slate-200 flex flex-wrap gap-2 sm:gap-4 text-[10px] sm:text-xs">
//                                   {work.cuttingStartedAt && (
//                                     <span className="text-purple-600 flex items-center gap-1">
//                                       <span>✂️</span>
//                                       <span className="truncate">Cutting: {formatDateTime(work.cuttingStartedAt)}</span>
//                                     </span>
//                                   )}
//                                   {work.sewingStartedAt && (
//                                     <span className="text-pink-600 flex items-center gap-1">
//                                       <span>🪡</span>
//                                       <span className="truncate">Sewing: {formatDateTime(work.sewingStartedAt)}</span>
//                                     </span>
//                                   )}
//                                   {work.readyAt && (
//                                     <span className="text-green-600 flex items-center gap-1">
//                                       <span>✅</span>
//                                       <span className="truncate">Ready: {formatDateTime(work.readyAt)}</span>
//                                     </span>
//                                   )}
//                                 </div>
//                               )}
//                             </div>
//                             <ChevronRight size={16} className="text-slate-400 group-hover:text-blue-600 transition-colors flex-shrink-0 sm:w-5 sm:h-5" />
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>

//                   {/* Pagination - Mobile Responsive */}
//                   {totalPages > 1 && (
//                     <div className="flex items-center justify-center gap-1 sm:gap-2 mt-4 sm:mt-6">
//                       <button
//                         onClick={() => setWorkPage(p => Math.max(1, p - 1))}
//                         disabled={workPage === 1}
//                         className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-slate-100 text-slate-600 disabled:opacity-50 text-xs sm:text-sm"
//                       >
//                         Previous
//                       </button>
//                       <span className="px-2 sm:px-4 py-1 sm:py-1.5 bg-blue-600 text-white rounded-lg text-xs sm:text-sm">
//                         {workPage} / {totalPages}
//                       </span>
//                       <button
//                         onClick={() => setWorkPage(p => Math.min(totalPages, p + 1))}
//                         disabled={workPage === totalPages}
//                         className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-slate-100 text-slate-600 disabled:opacity-50 text-xs sm:text-sm"
//                       >
//                         Next
//                       </button>
//                     </div>
//                   )}
//                 </>
//               ) : (
//                 <div className="text-center py-8 sm:py-12 bg-slate-50 rounded-xl">
//                   <Clock size={36} className="mx-auto text-slate-300 mb-2 sm:w-12 sm:h-12" />
//                   <p className="text-slate-500 text-base sm:text-lg font-medium">No works found</p>
//                   <p className="text-xs sm:text-sm text-slate-400 mt-1 px-4">
//                     {selectedWorkStatus !== 'all' 
//                       ? `No works with status "${selectedWorkStatus}"` 
//                       : 'This aariWorker has not been assigned any works yet'}
//                   </p>
//                 </div>
//               )}
//             </div>
//           )}

//           {activeTab === "performance" && (
//             <div className="space-y-4 sm:space-y-6">
//               {/* Performance Metrics - Mobile Responsive */}
//               <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
//                 <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 sm:p-6 rounded-xl border border-green-200">
//                   <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
//                     <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-200 rounded-full flex items-center justify-center flex-shrink-0">
//                       <CheckCircle size={16} className="text-green-700 sm:w-5 sm:h-5" />
//                     </div>
//                     <div className="min-w-0">
//                       <p className="text-xs text-green-600">Completion Rate</p>
//                       <p className="text-lg sm:text-2xl font-black text-green-700">{performanceMetrics.completionRate}%</p>
//                     </div>
//                   </div>
//                   <div className="w-full bg-green-200 rounded-full h-1.5 sm:h-2 mt-1 sm:mt-2">
//                     <div 
//                       className="bg-green-600 h-1.5 sm:h-2 rounded-full"
//                       style={{ width: `${performanceMetrics.completionRate}%` }}
//                     ></div>
//                   </div>
//                   <p className="text-xs text-green-600 mt-1 sm:mt-2">
//                     {performanceMetrics.completed} of {performanceMetrics.total} completed
//                   </p>
//                 </div>

//                 <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 sm:p-6 rounded-xl border border-blue-200">
//                   <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
//                     <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0">
//                       <Target size={16} className="text-blue-700 sm:w-5 sm:h-5" />
//                     </div>
//                     <div className="min-w-0">
//                       <p className="text-xs text-blue-600">Efficiency</p>
//                       <p className="text-lg sm:text-2xl font-black text-blue-700">{performanceMetrics.efficiency}%</p>
//                     </div>
//                   </div>
//                   <p className="text-xs text-blue-600 mt-1 sm:mt-2">
//                     {performanceMetrics.completed} of {performanceMetrics.total} works completed
//                   </p>
//                 </div>

//                 <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 sm:p-6 rounded-xl border border-purple-200">
//                   <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
//                     <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-200 rounded-full flex items-center justify-center flex-shrink-0">
//                       <Star size={16} className="text-purple-700 sm:w-5 sm:h-5" />
//                     </div>
//                     <div className="min-w-0">
//                       <p className="text-xs text-purple-600">Rating</p>
//                       <p className="text-lg sm:text-2xl font-black text-purple-700">
//                         {currentAariWorker.performance?.rating || 0}
//                         <span className="text-xs sm:text-sm font-normal text-purple-400">/5</span>
//                       </p>
//                     </div>
//                   </div>
//                   <p className="text-xs text-purple-600 mt-1 sm:mt-2">
//                     Based on {currentAariWorker.performance?.feedback?.length || 0} reviews
//                   </p>
//                 </div>
//               </div>

//               {/* Work Distribution - Mobile Responsive */}
//               <div className="bg-slate-50 p-4 sm:p-6 rounded-xl border border-slate-200">
//                 <h3 className="font-black text-slate-800 mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
//                   <PieChart size={16} className="sm:w-[18px] sm:h-[18px]" />
//                   Work Distribution
//                 </h3>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
//                   <div className="space-y-2 sm:space-y-3">
//                     <div>
//                       <div className="flex justify-between text-xs sm:text-sm mb-1">
//                         <span className="text-green-600">Completed</span>
//                         <span className="font-bold">{performanceMetrics.completed}</span>
//                       </div>
//                       <div className="w-full bg-slate-200 rounded-full h-1.5 sm:h-2">
//                         <div 
//                           className="bg-green-600 h-1.5 sm:h-2 rounded-full"
//                           style={{ width: `${(performanceMetrics.completed / (performanceMetrics.total || 1)) * 100}%` }}
//                         ></div>
//                       </div>
//                     </div>
//                     <div>
//                       <div className="flex justify-between text-xs sm:text-sm mb-1">
//                         <span className="text-orange-600">In Progress</span>
//                         <span className="font-bold">{performanceMetrics.inProgress}</span>
//                       </div>
//                       <div className="w-full bg-slate-200 rounded-full h-1.5 sm:h-2">
//                         <div 
//                           className="bg-orange-600 h-1.5 sm:h-2 rounded-full"
//                           style={{ width: `${(performanceMetrics.inProgress / (performanceMetrics.total || 1)) * 100}%` }}
//                         ></div>
//                       </div>
//                     </div>
//                     <div>
//                       <div className="flex justify-between text-xs sm:text-sm mb-1">
//                         <span className="text-yellow-600">Pending</span>
//                         <span className="font-bold">{performanceMetrics.pending}</span>
//                       </div>
//                       <div className="w-full bg-slate-200 rounded-full h-1.5 sm:h-2">
//                         <div 
//                           className="bg-yellow-600 h-1.5 sm:h-2 rounded-full"
//                           style={{ width: `${(performanceMetrics.pending / (performanceMetrics.total || 1)) * 100}%` }}
//                         ></div>
//                       </div>
//                     </div>
//                   </div>
                  
//                   <div className="flex items-center justify-center">
//                     <div className="text-center">
//                       <p className="text-3xl sm:text-4xl font-black text-blue-600">{performanceMetrics.total}</p>
//                       <p className="text-xs sm:text-sm text-slate-500">Total Works Assigned</p>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Feedback Section - Mobile Responsive */}
//               <div>
//                 <h3 className="font-black text-slate-800 mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
//                   <MessageCircle size={16} className="sm:w-[18px] sm:h-[18px]" />
//                   Recent Feedback
//                 </h3>
//                 {currentAariWorker.performance?.feedback?.length > 0 ? (
//                   <div className="space-y-3 sm:space-y-4">
//                     {currentAariWorker.performance.feedback.slice(0, 5).map((fb, idx) => (
//                       <div key={idx} className="bg-slate-50 rounded-xl p-3 sm:p-4 border border-slate-200">
//                         <div className="flex flex-wrap items-center justify-between gap-2 mb-1 sm:mb-2">
//                           <div className="flex items-center gap-1">
//                             {[1,2,3,4,5].map((star) => (
//                               <Star 
//                                 key={star}
//                                 size={14} 
//                                 className={star <= fb.rating ? "text-yellow-500 fill-yellow-500" : "text-slate-300"} 
//                               />
//                             ))}
//                           </div>
//                           <span className="text-[10px] sm:text-xs text-slate-400">{formatDate(fb.date)}</span>
//                         </div>
//                         <p className="text-xs sm:text-sm text-slate-700 italic">"{fb.comment}"</p>
//                         <p className="text-[10px] sm:text-xs text-slate-400 mt-1 sm:mt-2">- {fb.from?.name || 'Anonymous'}</p>
//                       </div>
//                     ))}
//                   </div>
//                 ) : (
//                   <div className="text-center py-6 sm:py-8 bg-slate-50 rounded-xl">
//                     <MessageCircle size={32} className="mx-auto text-slate-300 mb-2 sm:w-10 sm:h-10" />
//                     <p className="text-slate-500 text-sm sm:text-base">No feedback available yet</p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Delete Confirmation Modal - Mobile Responsive */}
//       {showDeleteModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
//           <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl animate-in zoom-in duration-300 mx-4">
//             <div className="p-4 sm:p-6">
//               <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
//                 <AlertCircle size={24} className="text-red-600 sm:w-8 sm:h-8" />
//               </div>
//               <h2 className="text-xl sm:text-2xl font-black text-center text-slate-800 mb-2">Delete Aari Worker</h2>
//               <p className="text-sm sm:text-base text-center text-slate-500 mb-4 sm:mb-6">
//                 Are you sure you want to delete <span className="font-black text-slate-700">{currentAariWorker.name}</span>?
//                 This action cannot be undone.
//               </p>
//               <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
//                 <button
//                   onClick={() => setShowDeleteModal(false)}
//                   className="flex-1 px-4 sm:px-6 py-3 sm:py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-black transition-all text-sm sm:text-base order-2 sm:order-1"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleDelete}
//                   className="flex-1 px-4 sm:px-6 py-3 sm:py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black transition-all text-sm sm:text-base order-1 sm:order-2"
//                 >
//                   Delete
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Leave Status Modal */}
//       {showLeaveModal && (
//         <LeaveStatusModal
//           aariWorker={currentAariWorker}
//           onClose={() => setShowLeaveModal(false)}
//           onUpdate={() => dispatch(fetchAariWorkerById(id))}
//         />
//       )}
//     </div>
//   );
// }






// pages/aari-workers/AariWorkerDetails.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Wand2,
  CheckCircle,
  Clock,
  AlertCircle,
  UserCheck,
  UserX,
  Coffee,
  Star,
  MessageCircle,
  Download,
  TrendingUp,
  Award,
  Target,
  Zap,
  PieChart,
  BarChart3,
  ChevronRight,
  Menu,
  X
} from "lucide-react";
import { fetchAariWorkerById, deleteAariWorker } from "../../../features/aariWorker/aariWorkerSlice";
import showToast from "../../../utils/toast";
import StatusBadge from "../../../components/common/StatusBadge";
import LeaveStatusModal from "../../../components/modals/LeaveStatusModal";

export default function AariWorkerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { currentAariWorker, works, workStats, loading } = useSelector((state) => state.aariWorker);
  const { user } = useSelector((state) => state.auth);

  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Get base path based on user role
  const basePath = user?.role === "ADMIN" ? "/admin" : 
                   user?.role === "STORE_KEEPER" ? "/storekeeper" : 
                   "/cuttingmaster";

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [activeTab, setActiveTab] = useState("overview"); // overview, works, performance
  const [selectedWorkStatus, setSelectedWorkStatus] = useState("all");
  const [workPage, setWorkPage] = useState(1);
  const worksPerPage = 5;

  const isAdmin = user?.role === "ADMIN";
  const isStoreKeeper = user?.role === "STORE_KEEPER";
  const isCuttingMaster = user?.role === "CUTTING_MASTER";
  const isAariWorkerSelf = user?.aariWorkerId === id;
  
  const canEdit = isAdmin || isStoreKeeper || isAariWorkerSelf;
  const canDelete = isAdmin;
  const canUpdateLeave = isAdmin || isStoreKeeper || isCuttingMaster || isAariWorkerSelf;

  useEffect(() => {
    if (id) {
      dispatch(fetchAariWorkerById(id));
    }
  }, [dispatch, id]);

  // Handle Back - with basePath
  const handleBack = () => {
    navigate(`${basePath}/aari-workers`);
  };

  // Handle Edit - with basePath
  const handleEdit = () => {
    if (canEdit) {
      navigate(`${basePath}/aari-workers/edit/${id}`);
    } else {
      showToast.error("You don't have permission to edit this aariWorker");
    }
  };

  const handleDelete = async () => {
    try {
      await dispatch(deleteAariWorker(id)).unwrap();
      showToast.success("Aari Worker deleted successfully");
      navigate(`${basePath}/aari-workers`);
    } catch (error) {
      showToast.error(error || "Failed to Delete Aari Worker");
    }
  };

  const getLeaveStatusIcon = (status) => {
    switch(status) {
      case "present": return <UserCheck size={16} className="text-green-600 sm:w-5 sm:h-5" />;
      case "leave": return <UserX size={16} className="text-red-600 sm:w-5 sm:h-5" />;
      case "half-day": return <Coffee size={16} className="text-orange-600 sm:w-5 sm:h-5" />;
      case "holiday": return <Calendar size={16} className="text-purple-600 sm:w-5 sm:h-5" />;
      default: return <UserCheck size={16} className="text-green-600 sm:w-5 sm:h-5" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "present": return "text-green-600 bg-green-100";
      case "leave": return "text-red-600 bg-red-100";
      case "half-day": return "text-orange-600 bg-orange-100";
      case "holiday": return "text-purple-600 bg-purple-100";
      default: return "text-green-600 bg-green-100";
    }
  };

  const getWorkStatusBadge = (status) => {
    const statusConfig = {
      'pending': { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' },
      'accepted': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Accepted' },
      'cutting-started': { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Cutting Started' },
      'cutting-completed': { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'Cutting Completed' },
      'sewing-started': { bg: 'bg-pink-100', text: 'text-pink-700', label: 'Sewing Started' },
      'sewing-completed': { bg: 'bg-teal-100', text: 'text-teal-700', label: 'Sewing Completed' },
      'ironing': { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Ironing' },
      'ready-to-deliver': { bg: 'bg-green-100', text: 'text-green-700', label: 'Ready to Deliver' }
    };
    return statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-700', label: status };
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle Work click - with basePath
  const handleWorkClick = (workId) => {
    navigate(`${basePath}/works/${workId}`);
  };

  // Calculate performance metrics from workStats
  const performanceMetrics = useMemo(() => {
    const totalAssigned = workStats?.totalAssigned || 0;
    const completed = workStats?.completed || 0;
    const inProgress = workStats?.inProgress || 0;
    const pending = workStats?.pending || 0;
    
    const calculatedTotal = completed + inProgress + pending;
    const displayTotal = totalAssigned > 0 ? totalAssigned : calculatedTotal;
    
    const completionRate = displayTotal > 0 ? Math.round((completed / displayTotal) * 100) : 0;
    const efficiency = displayTotal > 0 ? Math.round((completed / displayTotal) * 100) : 0;
    
    return {
      total: displayTotal,
      completed,
      inProgress,
      pending,
      completionRate,
      efficiency
    };
  }, [workStats]);

  // Filter works by status
  const filteredWorks = useMemo(() => {
    if (!works) return [];
    if (selectedWorkStatus === 'all') return works;
    return works.filter(work => work.status === selectedWorkStatus);
  }, [works, selectedWorkStatus]);

  // Paginate works
  const paginatedWorks = useMemo(() => {
    const start = (workPage - 1) * worksPerPage;
    const end = start + worksPerPage;
    return filteredWorks.slice(start, end);
  }, [filteredWorks, workPage]);

  const totalPages = Math.ceil(filteredWorks.length / worksPerPage);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-sm sm:text-base text-slate-600">Loading Aari Worker Details...</p>
        </div>
      </div>
    );
  }

  if (!currentAariWorker) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 max-w-md w-full text-center">
          <Wand2 size={48} className="mx-auto text-slate-300 mb-4" />
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 mb-2">AariWorker Not Found</h2>
          <p className="text-sm sm:text-base text-slate-500 mb-6">The aariWorker you're looking for doesn't exist.</p>
          <button
            onClick={handleBack}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base"
          >
            Back to Aari Workers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-8">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-slate-600"
          >
            <ArrowLeft size={18} />
            <span className="font-bold text-sm">Back</span>
          </button>
          <h1 className="text-base font-black text-slate-800 truncate max-w-[150px]">
            {currentAariWorker.name}
          </h1>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 hover:bg-slate-100 rounded-xl transition-all"
          >
            {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
        
        {/* Mobile Action Menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-lg p-4 z-40">
            <div className="space-y-2">
              {canUpdateLeave && (
                <button
                  onClick={() => {
                    setShowLeaveModal(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-orange-50 text-orange-600 rounded-lg font-bold"
                >
                  <Calendar size={18} />
                  Update Leave
                </button>
              )}
              {canEdit && (
                <button
                  onClick={() => {
                    handleEdit();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-600 rounded-lg font-bold"
                >
                  <Edit size={18} />
                  Edit
                </button>
              )}
              {canDelete && (
                <button
                  onClick={() => {
                    setShowDeleteModal(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-red-50 text-red-600 rounded-lg font-bold"
                >
                  <Trash2 size={18} />
                  Delete
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8">
        {/* Desktop Header with Actions - Hidden on Mobile */}
        <div className="hidden lg:flex items-center justify-between mb-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold">Back to Aari Workers</span>
          </button>

          <div className="flex items-center gap-3">
            {canUpdateLeave && (
              <button
                onClick={() => setShowLeaveModal(true)}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 text-sm"
              >
                <Calendar size={18} />
                Update Leave
              </button>
            )}

            {canEdit && (
              <button
                onClick={handleEdit}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 text-sm"
              >
                <Edit size={18} />
                Edit
              </button>
            )}

            {canDelete && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 text-sm"
              >
                <Trash2 size={18} />
                Delete
              </button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Header with Avatar and Basic Info - Mobile Responsive */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3 sm:gap-4 lg:gap-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center text-white border-2 border-white/30 flex-shrink-0">
                  <span className="text-xl sm:text-2xl lg:text-3xl font-black">
                    {currentAariWorker.name?.charAt(0)}
                  </span>
                </div>
                <div className="text-white flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                    <h1 className="text-base sm:text-lg lg:text-2xl font-black truncate">{currentAariWorker.name}</h1>
                    <span className="self-start sm:self-auto px-2 py-0.5 sm:px-3 sm:py-1 bg-white/20 backdrop-blur-sm rounded-full text-[10px] sm:text-xs lg:text-sm font-bold w-fit">
                      {currentAariWorker.aariWorkerId}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <div className="flex items-center gap-1">
                      {getLeaveStatusIcon(currentAariWorker.leaveStatus)}
                      <span className="text-[10px] sm:text-xs lg:text-sm font-medium capitalize">
                        {currentAariWorker.leaveStatus?.replace('-', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Briefcase size={12} className="sm:w-3 sm:h-3 lg:w-4 lg:h-4" />
                      <span className="text-[10px] sm:text-xs lg:text-sm font-medium">{currentAariWorker.experience || 0} years exp</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="sm:text-right">
                <p className="text-white/80 text-[10px] sm:text-xs lg:text-sm">Joined on</p>
                <p className="text-white font-bold text-xs sm:text-sm lg:text-base">{formatDate(currentAariWorker.joiningDate)}</p>
              </div>
            </div>
          </div>

          {/* Tabs - Mobile Responsive (Scrollable) */}
          <div className="border-b border-slate-200 px-4 sm:px-6 lg:px-8 overflow-x-auto">
            <div className="flex gap-4 sm:gap-6 lg:gap-8 min-w-max sm:min-w-0">
              <button
                onClick={() => setActiveTab("overview")}
                className={`py-2 sm:py-3 lg:py-4 font-bold text-xs sm:text-sm lg:text-base border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "overview"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("works")}
                className={`py-2 sm:py-3 lg:py-4 font-bold text-xs sm:text-sm lg:text-base border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "works"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                Work History ({works?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab("performance")}
                className={`py-2 sm:py-3 lg:py-4 font-bold text-xs sm:text-sm lg:text-base border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "performance"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                Performance
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-4 sm:p-6 lg:p-8">
            {activeTab === "overview" && (
              <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                {/* Stats Cards - Mobile Responsive Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
                  <div className="bg-blue-50 p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl border border-blue-100">
                    <div className="flex items-center justify-between mb-1 sm:mb-2">
                      <Briefcase size={16} className="text-blue-600 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                      <span className="text-[8px] sm:text-[10px] lg:text-xs font-bold text-blue-600 uppercase">Total</span>
                    </div>
                    <p className="text-base sm:text-lg lg:text-2xl font-black text-blue-700">{workStats?.totalAssigned || 0}</p>
                    <p className="text-[8px] sm:text-[10px] lg:text-xs text-blue-600 mt-0.5">Works Assigned</p>
                  </div>
                  
                  <div className="bg-green-50 p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl border border-green-100">
                    <div className="flex items-center justify-between mb-1 sm:mb-2">
                      <CheckCircle size={16} className="text-green-600 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                      <span className="text-[8px] sm:text-[10px] lg:text-xs font-bold text-green-600 uppercase">Done</span>
                    </div>
                    <p className="text-base sm:text-lg lg:text-2xl font-black text-green-700">{workStats?.completed || 0}</p>
                    <p className="text-[8px] sm:text-[10px] lg:text-xs text-green-600 mt-0.5">Completed Works</p>
                  </div>
                  
                  <div className="bg-orange-50 p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl border border-orange-100">
                    <div className="flex items-center justify-between mb-1 sm:mb-2">
                      <Clock size={16} className="text-orange-600 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                      <span className="text-[8px] sm:text-[10px] lg:text-xs font-bold text-orange-600 uppercase">Current</span>
                    </div>
                    <p className="text-base sm:text-lg lg:text-2xl font-black text-orange-700">{workStats?.inProgress || 0}</p>
                    <p className="text-[8px] sm:text-[10px] lg:text-xs text-orange-600 mt-0.5">In Progress</p>
                  </div>
                  
                  <div className="bg-yellow-50 p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl border border-yellow-100">
                    <div className="flex items-center justify-between mb-1 sm:mb-2">
                      <AlertCircle size={16} className="text-yellow-600 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                      <span className="text-[8px] sm:text-[10px] lg:text-xs font-bold text-yellow-600 uppercase">Queue</span>
                    </div>
                    <p className="text-base sm:text-lg lg:text-2xl font-black text-yellow-700">{workStats?.pending || 0}</p>
                    <p className="text-[8px] sm:text-[10px] lg:text-xs text-yellow-600 mt-0.5">Pending Works</p>
                  </div>
                </div>

                {/* Performance Overview - Mobile Responsive */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 sm:p-5 lg:p-6 rounded-lg sm:rounded-xl border border-purple-100">
                    <h3 className="font-black text-purple-800 mb-2 sm:mb-3 lg:mb-4 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm lg:text-base">
                      <Award size={14} className="sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                      Performance Overview
                    </h3>
                    <div className="space-y-2 sm:space-y-3 lg:space-y-4">
                      <div>
                        <div className="flex justify-between text-[10px] sm:text-xs lg:text-sm mb-1">
                          <span className="text-purple-700">Completion Rate</span>
                          <span className="font-bold text-purple-800">{performanceMetrics.completionRate}%</span>
                        </div>
                        <div className="w-full bg-purple-200 rounded-full h-1 sm:h-1.5 lg:h-2">
                          <div 
                            className="bg-purple-600 h-1 sm:h-1.5 lg:h-2 rounded-full transition-all duration-500"
                            style={{ width: `${performanceMetrics.completionRate}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[10px] sm:text-xs lg:text-sm mb-1">
                          <span className="text-indigo-700">Efficiency Score</span>
                          <span className="font-bold text-indigo-800">{performanceMetrics.efficiency}%</span>
                        </div>
                        <div className="w-full bg-indigo-200 rounded-full h-1 sm:h-1.5 lg:h-2">
                          <div 
                            className="bg-indigo-600 h-1 sm:h-1.5 lg:h-2 rounded-full transition-all duration-500"
                            style={{ width: `${performanceMetrics.efficiency}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 sm:p-5 lg:p-6 rounded-lg sm:rounded-xl border border-blue-100">
                    <h3 className="font-black text-blue-800 mb-2 sm:mb-3 lg:mb-4 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm lg:text-base">
                      <Target size={14} className="sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                      Quick Stats
                    </h3>
                    <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
                      <div>
                        <p className="text-[8px] sm:text-[10px] lg:text-xs text-blue-600">Total Works</p>
                        <p className="text-base sm:text-lg lg:text-xl font-black text-blue-800">{performanceMetrics.total}</p>
                      </div>
                      <div>
                        <p className="text-[8px] sm:text-[10px] lg:text-xs text-cyan-600">Success Rate</p>
                        <p className="text-base sm:text-lg lg:text-xl font-black text-cyan-800">{performanceMetrics.completionRate}%</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Information - Mobile Responsive */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="font-black text-slate-800 text-xs sm:text-sm lg:text-base">Contact Information</h3>
                    
                    <div className="bg-slate-50 p-3 sm:p-3.5 lg:p-4 rounded-lg sm:rounded-xl">
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                        <Phone size={14} className="text-blue-600 sm:w-4 sm:h-4 lg:w-[18px] lg:h-[18px]" />
                        <span className="text-[10px] sm:text-xs lg:text-sm font-medium text-slate-600">Phone</span>
                      </div>
                      <p className="text-xs sm:text-sm lg:text-base font-bold text-slate-800 ml-5 sm:ml-6 lg:ml-7 break-all">{currentAariWorker.phone}</p>
                    </div>

                    {currentAariWorker.email && (
                      <div className="bg-slate-50 p-3 sm:p-3.5 lg:p-4 rounded-lg sm:rounded-xl">
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                          <Mail size={14} className="text-purple-600 sm:w-4 sm:h-4 lg:w-[18px] lg:h-[18px]" />
                          <span className="text-[10px] sm:text-xs lg:text-sm font-medium text-slate-600">Email</span>
                        </div>
                        <p className="text-xs sm:text-sm lg:text-base font-bold text-slate-800 ml-5 sm:ml-6 lg:ml-7 break-all">{currentAariWorker.email}</p>
                      </div>
                    )}

                    {currentAariWorker.address && (
                      <div className="bg-slate-50 p-3 sm:p-3.5 lg:p-4 rounded-lg sm:rounded-xl">
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                          <MapPin size={14} className="text-green-600 sm:w-4 sm:h-4 lg:w-[18px] lg:h-[18px]" />
                          <span className="text-[10px] sm:text-xs lg:text-sm font-medium text-slate-600">Address</span>
                        </div>
                        <p className="text-xs sm:text-sm lg:text-base font-bold text-slate-800 ml-5 sm:ml-6 lg:ml-7">
                          {currentAariWorker.address.street && <>{currentAariWorker.address.street}<br /></>}
                          {[currentAariWorker.address.city, currentAariWorker.address.state, currentAariWorker.address.pincode]
                            .filter(Boolean).join(', ')}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="font-black text-slate-800 text-xs sm:text-sm lg:text-base">Professional Information</h3>
                    
                    <div className="bg-slate-50 p-3 sm:p-3.5 lg:p-4 rounded-lg sm:rounded-xl">
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                        <Wand2 size={14} className="text-indigo-600 sm:w-4 sm:h-4 lg:w-[18px] lg:h-[18px]" />
                        <span className="text-[10px] sm:text-xs lg:text-sm font-medium text-slate-600">Specialization</span>
                      </div>
                      <div className="ml-5 sm:ml-6 lg:ml-7 flex flex-wrap gap-1 sm:gap-1.5">
                        {currentAariWorker.specialization?.length > 0 ? (
                          currentAariWorker.specialization.map((spec, idx) => (
                            <span key={idx} className="px-1.5 sm:px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-[8px] sm:text-[10px] lg:text-xs font-medium">
                              {spec}
                            </span>
                          ))
                        ) : (
                          <p className="text-slate-500 text-[10px] sm:text-xs lg:text-sm">No specialization specified</p>
                        )}
                      </div>
                    </div>

                    <div className="bg-slate-50 p-3 sm:p-3.5 lg:p-4 rounded-lg sm:rounded-xl">
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                        <Star size={14} className="text-yellow-600 sm:w-4 sm:h-4 lg:w-[18px] lg:h-[18px]" />
                        <span className="text-[10px] sm:text-xs lg:text-sm font-medium text-slate-600">Performance Rating</span>
                      </div>
                      <div className="ml-5 sm:ml-6 lg:ml-7">
                        <div className="flex items-center gap-1">
                          <span className="text-sm sm:text-base lg:text-lg font-black text-yellow-600">
                            {currentAariWorker.performance?.rating || 0}
                          </span>
                          <span className="text-[8px] sm:text-[10px] lg:text-xs text-slate-400">/ 5</span>
                        </div>
                        <p className="text-[8px] sm:text-[10px] lg:text-xs text-slate-500 mt-0.5">
                          Based on {currentAariWorker.performance?.feedback?.length || 0} reviews
                        </p>
                      </div>
                    </div>

                    {currentAariWorker.leaveStatus !== 'present' && (
                      <div className="bg-orange-50 p-3 sm:p-3.5 lg:p-4 rounded-lg sm:rounded-xl border border-orange-200">
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                          <AlertCircle size={14} className="text-orange-600 sm:w-4 sm:h-4 lg:w-[18px] lg:h-[18px]" />
                          <span className="text-[10px] sm:text-xs lg:text-sm font-bold text-orange-600">Leave Information</span>
                        </div>
                        <div className="ml-5 sm:ml-6 lg:ml-7 space-y-0.5 text-[10px] sm:text-xs lg:text-sm">
                          <p><span className="font-medium">Status:</span> {currentAariWorker.leaveStatus}</p>
                          {currentAariWorker.leaveFrom && (
                            <p><span className="font-medium">From:</span> {formatDate(currentAariWorker.leaveFrom)}</p>
                          )}
                          {currentAariWorker.leaveTo && (
                            <p><span className="font-medium">To:</span> {formatDate(currentAariWorker.leaveTo)}</p>
                          )}
                          {currentAariWorker.leaveReason && (
                            <p className="break-words"><span className="font-medium">Reason:</span> {currentAariWorker.leaveReason}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "works" && (
              <div>
                {/* Work Status Filter - Mobile Responsive */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-5 lg:mb-6">
                  <h3 className="font-black text-slate-800 text-xs sm:text-sm lg:text-base">Work History</h3>
                  <select
                    value={selectedWorkStatus}
                    onChange={(e) => {
                      setSelectedWorkStatus(e.target.value);
                      setWorkPage(1);
                    }}
                    className="w-full sm:w-auto px-3 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="cutting-started">Cutting Started</option>
                    <option value="cutting-completed">Cutting Completed</option>
                    <option value="sewing-started">Sewing Started</option>
                    <option value="sewing-completed">Sewing Completed</option>
                    <option value="ironing">Ironing</option>
                    <option value="ready-to-deliver">Ready to Deliver</option>
                  </select>
                </div>

                {filteredWorks?.length > 0 ? (
                  <>
                    <div className="space-y-2 sm:space-y-3">
                      {paginatedWorks.map((work) => {
                        const statusBadge = getWorkStatusBadge(work.status);
                        return (
                          <div
                            key={work._id}
                            className="bg-slate-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-slate-200 hover:shadow-md transition-all cursor-pointer group"
                            onClick={() => handleWorkClick(work._id)}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                                  <span className="font-mono font-bold text-blue-600 text-[10px] sm:text-xs lg:text-sm">{work.workId}</span>
                                  <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] lg:text-xs font-bold ${statusBadge.bg} ${statusBadge.text}`}>
                                    {statusBadge.label}
                                  </span>
                                </div>
                                
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 lg:gap-3 text-[10px] sm:text-xs lg:text-sm">
                                  <div className="min-w-0">
                                    <p className="text-[8px] sm:text-[10px] lg:text-xs text-slate-400 mb-0.5">Order</p>
                                    <p className="font-medium text-slate-800 truncate">{work.order?.orderId || 'N/A'}</p>
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-[8px] sm:text-[10px] lg:text-xs text-slate-400 mb-0.5">Garment</p>
                                    <p className="font-medium text-slate-800 truncate">{work.garment?.name || 'N/A'}</p>
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-[8px] sm:text-[10px] lg:text-xs text-slate-400 mb-0.5">Assigned</p>
                                    <p className="text-slate-600 truncate">{formatDate(work.createdAt)}</p>
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-[8px] sm:text-[10px] lg:text-xs text-slate-400 mb-0.5">Delivery</p>
                                    <p className="text-slate-600 truncate">{formatDate(work.estimatedDelivery)}</p>
                                  </div>
                                </div>

                                {/* Show timestamps if available - Mobile Responsive */}
                                {(work.cuttingStartedAt || work.sewingStartedAt || work.readyAt) && (
                                  <div className="mt-1.5 sm:mt-2 pt-1.5 sm:pt-2 border-t border-slate-200 flex flex-wrap gap-1.5 sm:gap-2 lg:gap-3 text-[8px] sm:text-[10px] lg:text-xs">
                                    {work.cuttingStartedAt && (
                                      <span className="text-purple-600 flex items-center gap-1">
                                        <span>✂️</span>
                                        <span className="truncate max-w-[80px] sm:max-w-[120px] lg:max-w-[150px]">
                                          Cut: {formatDateTime(work.cuttingStartedAt)}
                                        </span>
                                      </span>
                                    )}
                                    {work.sewingStartedAt && (
                                      <span className="text-pink-600 flex items-center gap-1">
                                        <span>🪡</span>
                                        <span className="truncate max-w-[80px] sm:max-w-[120px] lg:max-w-[150px]">
                                          Sew: {formatDateTime(work.sewingStartedAt)}
                                        </span>
                                      </span>
                                    )}
                                    {work.readyAt && (
                                      <span className="text-green-600 flex items-center gap-1">
                                        <span>✅</span>
                                        <span className="truncate max-w-[80px] sm:max-w-[120px] lg:max-w-[150px]">
                                          Ready: {formatDateTime(work.readyAt)}
                                        </span>
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                              <ChevronRight size={14} className="text-slate-400 group-hover:text-blue-600 transition-colors flex-shrink-0 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Pagination - Mobile Responsive */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-1 sm:gap-2 mt-4 sm:mt-5 lg:mt-6">
                        <button
                          onClick={() => setWorkPage(p => Math.max(1, p - 1))}
                          disabled={workPage === 1}
                          className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-slate-100 text-slate-600 disabled:opacity-50 text-[10px] sm:text-xs lg:text-sm"
                        >
                          Prev
                        </button>
                        <span className="px-2 sm:px-3 py-1 sm:py-1.5 bg-blue-600 text-white rounded-lg text-[10px] sm:text-xs lg:text-sm font-bold">
                          {workPage} / {totalPages}
                        </span>
                        <button
                          onClick={() => setWorkPage(p => Math.min(totalPages, p + 1))}
                          disabled={workPage === totalPages}
                          className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-slate-100 text-slate-600 disabled:opacity-50 text-[10px] sm:text-xs lg:text-sm"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-6 sm:py-8 lg:py-12 bg-slate-50 rounded-lg sm:rounded-xl">
                    <Clock size={24} className="mx-auto text-slate-300 mb-2 sm:w-8 sm:h-8 lg:w-10 lg:h-10" />
                    <p className="text-slate-500 text-xs sm:text-sm lg:text-base font-medium">No works found</p>
                    <p className="text-[10px] sm:text-xs lg:text-sm text-slate-400 mt-1 px-4">
                      {selectedWorkStatus !== 'all' 
                        ? `No works with status "${selectedWorkStatus}"` 
                        : 'This aariWorker has not been assigned any works yet'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "performance" && (
              <div className="space-y-4 sm:space-y-5 lg:space-y-6">
                {/* Performance Metrics - Mobile Responsive */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 sm:p-4 lg:p-5 rounded-lg sm:rounded-xl border border-green-200">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-green-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle size={12} className="text-green-700 sm:w-3 sm:h-3 lg:w-4 lg:h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[8px] sm:text-[10px] lg:text-xs text-green-600">Completion Rate</p>
                        <p className="text-sm sm:text-base lg:text-lg font-black text-green-700">{performanceMetrics.completionRate}%</p>
                      </div>
                    </div>
                    <div className="w-full bg-green-200 rounded-full h-1 sm:h-1.5 lg:h-2 mt-1">
                      <div 
                        className="bg-green-600 h-1 sm:h-1.5 lg:h-2 rounded-full"
                        style={{ width: `${performanceMetrics.completionRate}%` }}
                      ></div>
                    </div>
                    <p className="text-[8px] sm:text-[10px] lg:text-xs text-green-600 mt-1">
                      {performanceMetrics.completed} of {performanceMetrics.total} completed
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 sm:p-4 lg:p-5 rounded-lg sm:rounded-xl border border-blue-200">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <Target size={12} className="text-blue-700 sm:w-3 sm:h-3 lg:w-4 lg:h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[8px] sm:text-[10px] lg:text-xs text-blue-600">Efficiency</p>
                        <p className="text-sm sm:text-base lg:text-lg font-black text-blue-700">{performanceMetrics.efficiency}%</p>
                      </div>
                    </div>
                    <p className="text-[8px] sm:text-[10px] lg:text-xs text-blue-600 mt-1">
                      {performanceMetrics.completed} of {performanceMetrics.total} works completed
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-3 sm:p-4 lg:p-5 rounded-lg sm:rounded-xl border border-purple-200 sm:col-span-2 lg:col-span-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-purple-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <Star size={12} className="text-purple-700 sm:w-3 sm:h-3 lg:w-4 lg:h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[8px] sm:text-[10px] lg:text-xs text-purple-600">Rating</p>
                        <p className="text-sm sm:text-base lg:text-lg font-black text-purple-700">
                          {currentAariWorker.performance?.rating || 0}
                          <span className="text-[8px] sm:text-[10px] lg:text-xs font-normal text-purple-400">/5</span>
                        </p>
                      </div>
                    </div>
                    <p className="text-[8px] sm:text-[10px] lg:text-xs text-purple-600 mt-1">
                      Based on {currentAariWorker.performance?.feedback?.length || 0} reviews
                    </p>
                  </div>
                </div>

                {/* Work Distribution - Mobile Responsive */}
                <div className="bg-slate-50 p-3 sm:p-4 lg:p-5 rounded-lg sm:rounded-xl border border-slate-200">
                  <h3 className="font-black text-slate-800 mb-2 sm:mb-3 flex items-center gap-1.5 text-xs sm:text-sm lg:text-base">
                    <PieChart size={14} className="sm:w-4 sm:h-4 lg:w-[18px] lg:h-[18px]" />
                    Work Distribution
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-[8px] sm:text-[10px] lg:text-xs mb-1">
                          <span className="text-green-600">Completed</span>
                          <span className="font-bold">{performanceMetrics.completed}</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1 sm:h-1.5">
                          <div 
                            className="bg-green-600 h-1 sm:h-1.5 rounded-full"
                            style={{ width: `${(performanceMetrics.completed / (performanceMetrics.total || 1)) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[8px] sm:text-[10px] lg:text-xs mb-1">
                          <span className="text-orange-600">In Progress</span>
                          <span className="font-bold">{performanceMetrics.inProgress}</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1 sm:h-1.5">
                          <div 
                            className="bg-orange-600 h-1 sm:h-1.5 rounded-full"
                            style={{ width: `${(performanceMetrics.inProgress / (performanceMetrics.total || 1)) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[8px] sm:text-[10px] lg:text-xs mb-1">
                          <span className="text-yellow-600">Pending</span>
                          <span className="font-bold">{performanceMetrics.pending}</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1 sm:h-1.5">
                          <div 
                            className="bg-yellow-600 h-1 sm:h-1.5 rounded-full"
                            style={{ width: `${(performanceMetrics.pending / (performanceMetrics.total || 1)) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-xl sm:text-2xl lg:text-3xl font-black text-blue-600">{performanceMetrics.total}</p>
                        <p className="text-[8px] sm:text-[10px] lg:text-xs text-slate-500">Total Works Assigned</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Feedback Section - Mobile Responsive */}
                <div>
                  <h3 className="font-black text-slate-800 mb-2 sm:mb-3 flex items-center gap-1.5 text-xs sm:text-sm lg:text-base">
                    <MessageCircle size={14} className="sm:w-4 sm:h-4 lg:w-[18px] lg:h-[18px]" />
                    Recent Feedback
                  </h3>
                  {currentAariWorker.performance?.feedback?.length > 0 ? (
                    <div className="space-y-2 sm:space-y-3">
                      {currentAariWorker.performance.feedback.slice(0, 5).map((fb, idx) => (
                        <div key={idx} className="bg-slate-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-slate-200">
                          <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                            <div className="flex items-center gap-0.5">
                              {[1,2,3,4,5].map((star) => (
                                <Star 
                                  key={star}
                                  size={12} 
                                  className={star <= fb.rating ? "text-yellow-500 fill-yellow-500" : "text-slate-300"} 
                                />
                              ))}
                            </div>
                            <span className="text-[8px] sm:text-[10px] lg:text-xs text-slate-400">{formatDate(fb.date)}</span>
                          </div>
                          <p className="text-[10px] sm:text-xs lg:text-sm text-slate-700 italic">"{fb.comment}"</p>
                          <p className="text-[8px] sm:text-[10px] lg:text-xs text-slate-400 mt-1">- {fb.from?.name || 'Anonymous'}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 sm:py-6 lg:py-8 bg-slate-50 rounded-lg sm:rounded-xl">
                      <MessageCircle size={20} className="mx-auto text-slate-300 mb-1 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
                      <p className="text-slate-500 text-xs sm:text-sm lg:text-base">No feedback available yet</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal - Mobile Responsive */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-xl lg:rounded-2xl shadow-2xl animate-in zoom-in duration-300 mx-4">
            <div className="p-4 sm:p-5 lg:p-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 lg:mb-4">
                <AlertCircle size={20} className="text-red-600 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
              </div>
              <h2 className="text-base sm:text-lg lg:text-xl font-black text-center text-slate-800 mb-1 sm:mb-2">Delete Aari Worker</h2>
              <p className="text-xs sm:text-sm lg:text-sm text-center text-slate-500 mb-3 sm:mb-4 lg:mb-5">
                Are you sure you want to delete <span className="font-black text-slate-700">{currentAariWorker.name}</span>?
                This action cannot be undone.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 sm:py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg lg:rounded-xl font-black transition-all text-xs sm:text-sm order-2 sm:order-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 sm:py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg lg:rounded-xl font-black transition-all text-xs sm:text-sm order-1 sm:order-2"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leave Status Modal */}
      {showLeaveModal && (
        <LeaveStatusModal
          aariWorker={currentAariWorker}
          onClose={() => setShowLeaveModal(false)}
          onUpdate={() => dispatch(fetchAariWorkerById(id))}
        />
      )}
    </div>
  );
}
