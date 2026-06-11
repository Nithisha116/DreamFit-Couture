// // Pages/works/WorkDetailsPage.jsx
// import React, { useState, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useParams, useNavigate } from 'react-router-dom';
// import {
//   Briefcase,
//   Calendar,
//   Clock,
//   User,
//   Scissors,
//   Ruler,
//   Truck,
//   CheckCircle,
//   XCircle,
//   Download,
//   Eye,
//   ArrowLeft,
//   RefreshCw,
//   UserPlus,
//   FileText,
//   Image as ImageIcon,
//   Mail,
//   Phone,
//   MapPin,
//   AlertCircle,
//   ChevronDown,
//   Menu
// } from 'lucide-react';
// import {
//   fetchWorkById,
//   acceptWorkById,
//   assignTailorToWork,
//   updateWorkStatusById,
//   selectCurrentWork,
//   selectWorkLoading,
//   clearCurrentWork
// } from '../../features/work/workSlice';
// import { fetchAllTailors } from '../../features/tailor/tailorSlice';
// import AssignTailorModal from '../../components/works/AssignTailorModal';
// import UpdateStatusModal from '../../components/works/UpdateStatusModal';
// import ImagePreviewModal from '../../components/ImagePreviewModal';
// import showToast from '../../utils/toast';

// export default function WorkDetailsPage() {
//   const { id } = useParams();
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const work = useSelector(selectCurrentWork);
//   const loading = useSelector(selectWorkLoading);
//   const { user } = useSelector((state) => state.auth);

//   const [showAssignModal, setShowAssignModal] = useState(false);
//   const [showStatusModal, setShowStatusModal] = useState(false);
//   const [activeTab, setActiveTab] = useState('details');
//   const [showMobileMenu, setShowMobileMenu] = useState(false);

//   // Image preview states
//   const [showImagePreview, setShowImagePreview] = useState(false);
//   const [previewImages, setPreviewImages] = useState([]);
//   const [previewTitle, setPreviewTitle] = useState('');

//   const isAdmin = user?.role === 'ADMIN';
//   const isStoreKeeper = user?.role === 'STORE_KEEPER';
//   const isCuttingMaster = user?.role === 'CUTTING_MASTER';

//   // Check if user can view work details (all roles except maybe tailor)
//   const canViewWork = isAdmin || isStoreKeeper || isCuttingMaster;

//   // Check if user can perform actions (only cutting master)
//   const canPerformActions = isCuttingMaster;

//   useEffect(() => {
//     loadWork();
//     return () => {
//       dispatch(clearCurrentWork());
//     };
//   }, [id]);

//   const loadWork = () => {
//     dispatch(fetchWorkById(id));
//   };

//   const handleRefresh = () => {
//     loadWork();
//     showToast.success('Data refreshed');
//   };

//   const handleAcceptWork = () => {
//     if (window.confirm('Accept this work?')) {
//       dispatch(acceptWorkById(id)).then(() => {
//         loadWork();
//       });
//     }
//   };

//   const handleAssignTailor = (tailorId) => {
//     dispatch(assignTailorToWork({ id, tailorId })).then(() => {
//       loadWork();
//     });
//   };

//   const handleUpdateStatus = async (newStatus, notes) => {
//     console.log('📤 Updating work status:', {
//       workId: id,
//       newStatus,
//       notes
//     });

//     try {
//       const result = await dispatch(updateWorkStatusById({
//         id,
//         status: newStatus,
//         notes
//       })).unwrap();

//       console.log('✅ Update successful:', result);
//       showToast.success(`Status updated to ${newStatus.replace(/-/g, ' ')}`);
//       loadWork();
//       setShowStatusModal(false);

//     } catch (error) {
//       console.error('❌ Update failed:', error);
//       showToast.error(error || 'Failed to update status');
//     }
//   };

//   const handleGoBack = () => {
//     navigate(-1);
//   };

//   const handleViewImages = (images, title) => {
//     console.log(`👁️ Opening image preview: ${title} with ${images.length} images`);

//     if (images && images.length > 0) {
//       const imageUrls = images.map(img => img.url || img);
//       setPreviewImages(imageUrls);
//       setPreviewTitle(title);
//       setShowImagePreview(true);
//     } else {
//       showToast.warning('No images to display');
//     }
//   };

//   const handleClosePreview = () => {
//     setShowImagePreview(false);
//     setPreviewImages([]);
//     setPreviewTitle('');
//   };

//   const formatDate = (date) => {
//     if (!date) return 'Not set';
//     return new Date(date).toLocaleDateString('en-IN', {
//       day: '2-digit',
//       month: 'long',
//       year: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   const getStatusColor = (status) => {
//     const colors = {
//       'pending': 'bg-yellow-100 text-yellow-700 border-yellow-200',
//       'accepted': 'bg-blue-100 text-blue-700 border-blue-200',
//       'cutting-started': 'bg-purple-100 text-purple-700 border-purple-200',
//       'cutting-completed': 'bg-indigo-100 text-indigo-700 border-indigo-200',
//       'sewing-started': 'bg-pink-100 text-pink-700 border-pink-200',
//       'sewing-completed': 'bg-teal-100 text-teal-700 border-teal-200',
//       'ironing': 'bg-orange-100 text-orange-700 border-orange-200',
//       'ready-to-deliver': 'bg-green-100 text-green-700 border-green-200'
//     };
//     return colors[work?.status] || 'bg-slate-100 text-slate-700 border-slate-200';
//   };

//   const getStatusIcon = (status) => {
//     switch(status) {
//       case 'pending': return <Clock size={20} />;
//       case 'accepted': return <CheckCircle size={20} />;
//       case 'cutting-started': return <Scissors size={20} />;
//       case 'cutting-completed': return <Scissors size={20} />;
//       case 'sewing-started': return <Ruler size={20} />;
//       case 'sewing-completed': return <Ruler size={20} />;
//       case 'ironing': return <Truck size={20} />;
//       case 'ready-to-deliver': return <CheckCircle size={20} />;
//       default: return <Briefcase size={20} />;
//     }
//   };

//   const isOverdue = () => {
//     return work?.estimatedDelivery && new Date(work.estimatedDelivery) < new Date() && work?.status !== 'ready-to-deliver';
//   };

//   // If user doesn't have permission to view work
//   if (!canViewWork) {
//     return (
//       <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
//         <div className="text-center max-w-md mx-auto">
//           <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
//           <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">Access Denied</h2>
//           <p className="text-sm sm:text-base text-slate-600 mb-4">You don't have permission to view work details.</p>
//           <button
//             onClick={handleGoBack}
//             className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
//           >
//             Go Back
//           </button>
//         </div>
//       </div>
//     );
//   }

//   if (loading && !work) {
//     return (
//       <div className="min-h-screen bg-slate-50 p-4 sm:p-8 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <p className="text-sm sm:text-base text-slate-600">Loading work details...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!work) {
//     return (
//       <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
//         <div className="text-center max-w-md mx-auto">
//           <Briefcase size={48} className="text-slate-300 mx-auto mb-4" />
//           <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">Work Not Found</h2>
//           <p className="text-sm sm:text-base text-slate-600 mb-4">The work you're looking for doesn't exist.</p>
//           <button
//             onClick={handleGoBack}
//             className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
//           >
//             Go Back
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-slate-50 p-3 sm:p-4 md:p-6">
//       {/* Image Preview Modal */}
//       {showImagePreview && (
//         <ImagePreviewModal
//           images={previewImages}
//           title={previewTitle}
//           onClose={handleClosePreview}
//         />
//       )}

//       {/* Header - Mobile Optimized */}
//       <div className="mb-4 sm:mb-6">
//         <button
//           onClick={handleGoBack}
//           className="flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-3 sm:mb-4 transition-all text-sm sm:text-base"
//         >
//           <ArrowLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
//           <span>Back</span>
//         </button>

//         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
//           <div>
//             <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-800 mb-1">Work Details</h1>
//             <p className="text-xs sm:text-sm text-slate-600">Work ID: {work.workId}</p>
//           </div>
//           <div className="flex gap-2">
//             <button
//               onClick={handleRefresh}
//               className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all touch-manipulation"
//               title="Refresh"
//             >
//               <RefreshCw size={18} className={loading ? 'animate-spin text-blue-600' : 'text-slate-600'} />
//             </button>

//             {/* View Only Badge for Store Keepers */}
//             {isStoreKeeper && (
//               <div className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium flex items-center gap-2">
//                 <Eye size={18} />
//                 <span className="hidden sm:inline">View Only</span>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Status Banner - Mobile Optimized */}
//       <div className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl border ${getStatusColor(work.status)} flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3`}>
//         <div className="flex items-center gap-3">
//           <div className="flex-shrink-0">
//             {getStatusIcon(work.status)}
//           </div>
//           <div className="min-w-0 flex-1">
//             <p className="text-xs sm:text-sm font-medium">Current Status</p>
//             <p className="text-base sm:text-lg font-bold capitalize truncate">{work.status?.replace(/-/g, ' ')}</p>
//           </div>
//         </div>
//         {isOverdue() && (
//           <div className="flex items-center gap-2 text-red-700 bg-red-100 px-3 py-2 rounded-lg text-sm sm:text-base w-full sm:w-auto justify-center sm:justify-start">
//             <AlertCircle size={16} className="flex-shrink-0" />
//             <span className="font-medium">Overdue</span>
//           </div>
//         )}
//       </div>

//       {/* Action Buttons - Only for Cutting Masters */}
//       {canPerformActions && (
//         <div className="mb-4 sm:mb-6">
//           {/* Desktop View */}
//           <div className="hidden sm:flex gap-3">
//             {work.status === 'pending' && (
//               <button
//                 onClick={handleAcceptWork}
//                 className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all flex items-center gap-2"
//               >
//                 <CheckCircle size={18} />
//                 Accept Work
//               </button>
//             )}

//             {work.status !== 'pending' && !work.tailor && (
//               <button
//                 onClick={() => setShowAssignModal(true)}
//                 className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all flex items-center gap-2"
//               >
//                 <UserPlus size={18} />
//                 Assign Tailor
//               </button>
//             )}

//             {work.tailor && work.status !== 'ready-to-deliver' && (
//               <button
//                 onClick={() => setShowStatusModal(true)}
//                 className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-all flex items-center gap-2"
//               >
//                 <Clock size={18} />
//                 Update Status
//               </button>
//             )}
//           </div>

//           {/* Mobile View - Dropdown Menu */}
//           <div className="sm:hidden relative">
//             <button
//               onClick={() => setShowMobileMenu(!showMobileMenu)}
//               className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-700 font-medium"
//             >
//               <span className="flex items-center gap-2">
//                 <Menu size={18} />
//                 Actions
//               </span>
//               <ChevronDown size={18} className={`transition-transform ${showMobileMenu ? 'rotate-180' : ''}`} />
//             </button>

//             {showMobileMenu && (
//               <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
//                 {work.status === 'pending' && (
//                   <button
//                     onClick={() => {
//                       handleAcceptWork();
//                       setShowMobileMenu(false);
//                     }}
//                     className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-slate-50 border-b border-slate-100 last:border-0"
//                   >
//                     <CheckCircle size={18} className="text-green-600" />
//                     <span>Accept Work</span>
//                   </button>
//                 )}

//                 {work.status !== 'pending' && !work.tailor && (
//                   <button
//                     onClick={() => {
//                       setShowAssignModal(true);
//                       setShowMobileMenu(false);
//                     }}
//                     className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-slate-50 border-b border-slate-100 last:border-0"
//                   >
//                     <UserPlus size={18} className="text-blue-600" />
//                     <span>Assign Tailor</span>
//                   </button>
//                 )}

//                 {work.tailor && work.status !== 'ready-to-deliver' && (
//                   <button
//                     onClick={() => {
//                       setShowStatusModal(true);
//                       setShowMobileMenu(false);
//                     }}
//                     className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-slate-50"
//                   >
//                     <Clock size={18} className="text-purple-600" />
//                     <span>Update Status</span>
//                   </button>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       {/* View Only Message for Store Keepers */}
//       {isStoreKeeper && (
//         <div className="mb-4 sm:mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
//           <p className="text-sm text-blue-700 flex items-center gap-2">
//             <Eye size={18} />
//             You are in view-only mode. You can see all work details but cannot make changes.
//           </p>
//         </div>
//       )}

//       {/* Tabs - Mobile Optimized (Horizontal Scroll) */}
//       <div className="bg-white rounded-t-xl border-b border-slate-200 overflow-x-auto hide-scrollbar">
//         <div className="flex gap-1 p-1 min-w-max sm:min-w-0">
//           <button
//             onClick={() => setActiveTab('details')}
//             className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium transition-all text-sm sm:text-base whitespace-nowrap ${
//               activeTab === 'details' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
//             }`}
//           >
//             <Briefcase size={16} className="inline mr-1.5 sm:mr-2" />
//             Details
//           </button>
//           <button
//             onClick={() => setActiveTab('measurements')}
//             className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium transition-all text-sm sm:text-base whitespace-nowrap ${
//               activeTab === 'measurements' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
//             }`}
//           >
//             <Ruler size={16} className="inline mr-1.5 sm:mr-2" />
//             Measurements
//           </button>
//           <button
//             onClick={() => setActiveTab('images')}
//             className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium transition-all text-sm sm:text-base whitespace-nowrap ${
//               activeTab === 'images' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
//             }`}
//           >
//             <ImageIcon size={16} className="inline mr-1.5 sm:mr-2" />
//             Images
//           </button>
//         </div>
//       </div>

//       {/* Tab Content - Mobile Optimized */}
//       <div className="bg-white rounded-b-xl p-4 sm:p-6 shadow-sm">
//         {activeTab === 'details' && (
//           <div className="space-y-4 sm:space-y-6">
//             {/* Order Information - Stack on mobile */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
//               <div className="bg-slate-50 rounded-xl p-3 sm:p-4">
//                 <h3 className="font-bold text-slate-800 mb-3 text-sm sm:text-base">Order Information</h3>
//                 <div className="space-y-2.5 sm:space-y-3">
//                   <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
//                     <span className="text-xs sm:text-sm text-slate-500">Order ID</span>
//                     <span className="text-xs sm:text-sm font-medium text-blue-600 break-all">{work.order?.orderId || 'N/A'}</span>
//                   </div>
//                   <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
//                     <span className="text-xs sm:text-sm text-slate-500">Order Date</span>
//                     <span className="text-xs sm:text-sm text-slate-800">{formatDate(work.order?.orderDate)}</span>
//                   </div>
//                   <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
//                     <span className="text-xs sm:text-sm text-slate-500">Delivery Date</span>
//                     <span className="text-xs sm:text-sm text-slate-800">{formatDate(work.order?.deliveryDate)}</span>
//                   </div>
//                 </div>
//               </div>

//               {/* Customer Information */}
//               <div className="bg-slate-50 rounded-xl p-3 sm:p-4">
//                 <h3 className="font-bold text-slate-800 mb-3 text-sm sm:text-base">Customer Details</h3>
//                 <div className="flex items-center gap-3">
//                   <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
//                     <User size={18} className="sm:w-6 sm:h-6 text-blue-600" />
//                   </div>
//                   <div className="min-w-0 flex-1">
//                     <p className="text-xs text-slate-500 mb-0.5">Customer Name</p>
//                     <p className="font-medium text-base sm:text-xl text-slate-800 truncate">
//                       {work.order?.customer?.name || 'N/A'}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Garment Information */}
//             <div className="bg-slate-50 rounded-xl p-3 sm:p-4">
//               <h3 className="font-bold text-slate-800 mb-3 text-sm sm:text-base">Garment Details</h3>
//               <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
//                 <div>
//                   <p className="text-xs text-slate-500 mb-1">Garment Name</p>
//                   <p className="font-medium text-slate-800 text-sm sm:text-base break-words">{work.garment?.name || 'N/A'}</p>
//                 </div>
//                 <div>
//                   <p className="text-xs text-slate-500 mb-1">Garment ID</p>
//                   <p className="font-mono text-xs sm:text-sm text-blue-600 break-all">{work.garment?.garmentId || 'N/A'}</p>
//                 </div>
//                 <div>
//                   <p className="text-xs text-slate-500 mb-1">Priority</p>
//                   <p className="font-medium capitalize text-slate-800 text-sm sm:text-base">{work.garment?.priority || 'N/A'}</p>
//                 </div>
//               </div>

//               {/* Additional Information */}
//               {work.garment?.additionalInfo && (
//                 <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-blue-50 border border-blue-100 rounded-xl">
//                   <div className="flex items-center gap-2 mb-2 text-blue-700">
//                     <FileText size={14} className="sm:w-4 sm:h-4" />
//                     <h4 className="text-xs font-black uppercase tracking-wider">Additional Information</h4>
//                   </div>
//                   <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium break-words">
//                     {work.garment.additionalInfo}
//                   </p>
//                 </div>
//               )}
//             </div>

//             {/* Work Assignment */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
//               <div className="bg-slate-50 rounded-xl p-3 sm:p-4">
//                 <h3 className="font-bold text-slate-800 mb-3 text-sm sm:text-base">Cutting Master</h3>
//                 {work.cuttingMaster ? (
//                   <div className="flex items-center gap-3">
//                     <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
//                       <User size={14} className="sm:w-[18px] sm:h-[18px] text-blue-600" />
//                     </div>
//                     <div className="min-w-0 flex-1">
//                       <p className="font-medium text-slate-800 text-sm sm:text-base truncate">{work.cuttingMaster.name}</p>
//                       <p className="text-xs text-slate-500 truncate">Assigned on {formatDate(work.acceptedAt)}</p>
//                     </div>
//                   </div>
//                 ) : (
//                   <p className="text-sm text-slate-500">Not assigned yet</p>
//                 )}
//               </div>

//               <div className="bg-slate-50 rounded-xl p-3 sm:p-4">
//                 <h3 className="font-bold text-slate-800 mb-3 text-sm sm:text-base">Tailor</h3>
//                 {work.tailor ? (
//                   <div className="flex items-center gap-3">
//                     <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
//                       <Scissors size={14} className="sm:w-[18px] sm:h-[18px] text-green-600" />
//                     </div>
//                     <div className="min-w-0 flex-1">
//                       <p className="font-medium text-slate-800 text-sm sm:text-base truncate">{work.tailor.name}</p>
//                       <p className="text-xs text-slate-500 truncate">{work.tailor.employeeId || 'N/A'}</p>
//                     </div>
//                   </div>
//                 ) : (
//                   <p className="text-sm text-slate-500">Not assigned yet</p>
//                 )}
//               </div>
//             </div>

//             {/* Timeline */}
//             <div className="bg-slate-50 rounded-xl p-3 sm:p-4">
//               <h3 className="font-bold text-slate-800 mb-3 text-sm sm:text-base">Work Timeline</h3>
//               <div className="space-y-2.5 sm:space-y-3">
//                 {work.acceptedAt && (
//                   <div className="flex items-center gap-3">
//                     <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full flex-shrink-0"></div>
//                     <span className="text-xs sm:text-sm text-slate-600 break-words">Accepted: {formatDate(work.acceptedAt)}</span>
//                   </div>
//                 )}
//                 {work.cuttingStartedAt && (
//                   <div className="flex items-center gap-3">
//                     <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
//                     <span className="text-xs sm:text-sm text-slate-600 break-words">Cutting Started: {formatDate(work.cuttingStartedAt)}</span>
//                   </div>
//                 )}
//                 {work.cuttingCompletedAt && (
//                   <div className="flex items-center gap-3">
//                     <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-indigo-500 rounded-full flex-shrink-0"></div>
//                     <span className="text-xs sm:text-sm text-slate-600 break-words">Cutting Completed: {formatDate(work.cuttingCompletedAt)}</span>
//                   </div>
//                 )}
//                 {work.sewingStartedAt && (
//                   <div className="flex items-center gap-3">
//                     <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-pink-500 rounded-full flex-shrink-0"></div>
//                     <span className="text-xs sm:text-sm text-slate-600 break-words">Sewing Started: {formatDate(work.sewingStartedAt)}</span>
//                   </div>
//                 )}
//                 {work.sewingCompletedAt && (
//                   <div className="flex items-center gap-3">
//                     <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-teal-500 rounded-full flex-shrink-0"></div>
//                     <span className="text-xs sm:text-sm text-slate-600 break-words">Sewing Completed: {formatDate(work.sewingCompletedAt)}</span>
//                   </div>
//                 )}
//                 {work.ironingAt && (
//                   <div className="flex items-center gap-3">
//                     <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-500 rounded-full flex-shrink-0"></div>
//                     <span className="text-xs sm:text-sm text-slate-600 break-words">Ironing: {formatDate(work.ironingAt)}</span>
//                   </div>
//                 )}
//                 {work.readyAt && (
//                   <div className="flex items-center gap-3">
//                     <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full flex-shrink-0"></div>
//                     <span className="text-xs sm:text-sm text-slate-600 break-words">Ready to Deliver: {formatDate(work.readyAt)}</span>
//                   </div>
//                 )}
//                 {!work.acceptedAt && !work.cuttingStartedAt && !work.cuttingCompletedAt &&
//                  !work.sewingStartedAt && !work.sewingCompletedAt && !work.ironingAt && !work.readyAt && (
//                   <p className="text-sm text-slate-500 text-center py-2">No timeline events yet</p>
//                 )}
//               </div>
//             </div>

//             {/* Notes */}
//             {(work.cuttingNotes || work.tailorNotes) && (
//               <div className="bg-slate-50 rounded-xl p-3 sm:p-4">
//                 <h3 className="font-bold text-slate-800 mb-3 text-sm sm:text-base">Notes</h3>
//                 {work.cuttingNotes && (
//                   <div className="mb-3">
//                     <p className="text-xs text-slate-500 mb-1">Cutting Notes:</p>
//                     <p className="text-xs sm:text-sm text-slate-700 bg-white p-2.5 sm:p-3 rounded-lg break-words">{work.cuttingNotes}</p>
//                   </div>
//                 )}
//                 {work.tailorNotes && (
//                   <div>
//                     <p className="text-xs text-slate-500 mb-1">Tailor Notes:</p>
//                     <p className="text-xs sm:text-sm text-slate-700 bg-white p-2.5 sm:p-3 rounded-lg break-words">{work.tailorNotes}</p>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         )}

//         {activeTab === 'measurements' && (
//           <div>
//             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
//               <h3 className="font-bold text-slate-800 text-sm sm:text-base">Garment Measurements</h3>
//               {work.measurementPdf && (
//                 <a
//                   href={work.measurementPdf}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-all flex items-center justify-center sm:justify-start gap-2 text-sm"
//                 >
//                   <Download size={16} />
//                   Download PDF
//                 </a>
//               )}
//             </div>

//             {work.garment?.measurements && work.garment.measurements.length > 0 ? (
//               <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
//                 {work.garment.measurements.map((measurement, index) => (
//                   <div key={index} className="bg-slate-50 rounded-xl p-3 sm:p-4">
//                     <p className="text-xs text-slate-500 mb-1 capitalize truncate">{measurement.name}</p>
//                     <p className="text-base sm:text-xl font-bold text-slate-800 break-words">
//                       {measurement.value} <span className="text-xs font-normal text-slate-500">{measurement.unit}</span>
//                     </p>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div className="text-center py-8 sm:py-12 bg-slate-50 rounded-xl">
//                 <Ruler size={32} className="sm:w-12 sm:h-12 text-slate-300 mx-auto mb-3 sm:mb-4" />
//                 <p className="text-sm sm:text-base text-slate-500">No measurements available</p>
//               </div>
//             )}
//           </div>
//         )}

//         {activeTab === 'images' && (
//           <div className="space-y-4 sm:space-y-6">
//             {/* Reference Images */}
//             {work.garment?.referenceImages?.length > 0 && (
//               <div>
//                 <h3 className="font-bold text-slate-800 mb-3 text-sm sm:text-base">Reference Images</h3>
//                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
//                   {work.garment.referenceImages.map((img, index) => (
//                     <button
//                       key={index}
//                       onClick={() => handleViewImages(work.garment.referenceImages, 'Reference Images')}
//                       className="relative group aspect-square w-full touch-manipulation"
//                     >
//                       <img
//                         src={img.url}
//                         alt={`Reference ${index + 1}`}
//                         className="w-full h-full object-cover rounded-lg border-2 border-indigo-200 hover:border-indigo-500 transition-all"
//                         loading="lazy"
//                       />
//                       <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
//                         <Eye size={20} className="sm:w-6 sm:h-6 text-white" />
//                       </div>
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Customer Images */}
//             {work.garment?.customerImages?.length > 0 && (
//               <div>
//                 <h3 className="font-bold text-slate-800 mb-3 text-sm sm:text-base">Customer Images</h3>
//                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
//                   {work.garment.customerImages.map((img, index) => (
//                     <button
//                       key={index}
//                       onClick={() => handleViewImages(work.garment.customerImages, 'Customer Images')}
//                       className="relative group aspect-square w-full touch-manipulation"
//                     >
//                       <img
//                         src={img.url}
//                         alt={`Customer ${index + 1}`}
//                         className="w-full h-full object-cover rounded-lg border-2 border-green-200 hover:border-green-500 transition-all"
//                         loading="lazy"
//                       />
//                       <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
//                         <Eye size={20} className="sm:w-6 sm:h-6 text-white" />
//                       </div>
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Cloth Images */}
//             {work.garment?.customerClothImages?.length > 0 && (
//               <div>
//                 <h3 className="font-bold text-slate-800 mb-3 text-sm sm:text-base">Cloth Images</h3>
//                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
//                   {work.garment.customerClothImages.map((img, index) => (
//                     <button
//                       key={index}
//                       onClick={() => handleViewImages(work.garment.customerClothImages, 'Cloth Images')}
//                       className="relative group aspect-square w-full touch-manipulation"
//                     >
//                       <img
//                         src={img.url}
//                         alt={`Cloth ${index + 1}`}
//                         className="w-full h-full object-cover rounded-lg border-2 border-orange-200 hover:border-orange-500 transition-all"
//                         loading="lazy"
//                       />
//                       <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
//                         <Eye size={20} className="sm:w-6 sm:h-6 text-white" />
//                       </div>
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {!work.garment?.referenceImages?.length &&
//              !work.garment?.customerImages?.length &&
//              !work.garment?.customerClothImages?.length && (
//               <div className="text-center py-8 sm:py-12">
//                 <ImageIcon size={32} className="sm:w-12 sm:h-12 text-slate-300 mx-auto mb-3 sm:mb-4" />
//                 <p className="text-sm sm:text-base text-slate-500">No images available</p>
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Modals */}
//       {showAssignModal && (
//         <AssignTailorModal
//           work={work}
//           onClose={() => setShowAssignModal(false)}
//           onAssign={handleAssignTailor}
//         />
//       )}

//       {showStatusModal && (
//         <UpdateStatusModal
//           work={work}
//           onClose={() => setShowStatusModal(false)}
//           onUpdate={handleUpdateStatus}
//         />
//       )}

//       {/* CSS for hiding scrollbar */}
//       <style jsx>{`
//         .hide-scrollbar::-webkit-scrollbar {
//           display: none;
//         }
//         .hide-scrollbar {
//           -ms-overflow-style: none;
//           scrollbar-width: none;
//         }
//       `}</style>
//     </div>
//   );
// }




// Pages/works/WorkDetailsPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  Briefcase,
  Calendar,
  Clock,
  User,
  Scissors,
  Ruler,
  Truck,
  CheckCircle,
  XCircle,
  Download,
  Eye,
  ArrowLeft,
  RefreshCw,
  UserPlus,
  FileText,
  Image as ImageIcon,
  Mail,
  Phone,
  MapPin,
  AlertCircle,
  ChevronDown,
  Menu,
  Printer,
} from "lucide-react";
import {
  fetchWorkById,
  acceptWorkById,
  assignTailorToWork,
  updateWorkStatusById,
  selectCurrentWork,
  selectWorkLoading,
  clearCurrentWork,
} from "../../features/work/workSlice";
import { fetchAllTailors } from "../../features/tailor/tailorSlice";
import AssignTailorModal from "../../components/works/AssignTailorModal";
import UpdateStatusModal from "../../components/works/UpdateStatusModal";
import ImagePreviewModal from "../../components/ImagePreviewModal";
import GarmentPDF from "../../components/GarmentPDF";
import ImageWithFallback from "../../components/common/ImageWithFallback";
import showToast from "../../utils/toast";

export default function WorkDetailsPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const work = useSelector(selectCurrentWork);
  const loading = useSelector(selectWorkLoading);
  const { user } = useSelector((state) => state.auth);

  const pdfRef = useRef(null);

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Image preview states
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const [previewTitle, setPreviewTitle] = useState("");

  const isAdmin = user?.role === "ADMIN";
  const isStoreKeeper = user?.role === "STORE_KEEPER";
  const isCuttingMaster = user?.role === "CUTTING_MASTER";

  const canViewWork = isAdmin || isStoreKeeper || isCuttingMaster;
  const canPerformActions = isCuttingMaster;

  useEffect(() => {
    loadWork();
    return () => {
      dispatch(clearCurrentWork());
    };
  }, [id]);

  const loadWork = () => {
    dispatch(fetchWorkById(id));
  };

  const handleRefresh = () => {
    loadWork();
    showToast.success("Data refreshed");
  };

  const handleAcceptWork = () => {
    if (window.confirm("Accept this work?")) {
      dispatch(acceptWorkById(id)).then(() => {
        loadWork();
      });
    }
  };

  const handleAssignTailor = (tailorId) => {
    dispatch(assignTailorToWork({ id, tailorId })).then(() => {
      loadWork();
    });
  };

  const handleUpdateStatus = async (newStatus, notes) => {
    console.log("📤 Updating work status:", { workId: id, newStatus, notes });

    try {
      const result = await dispatch(
        updateWorkStatusById({
          id,
          status: newStatus,
          notes,
        }),
      ).unwrap();

      console.log("✅ Update successful:", result);
      showToast.success(`Status updated to ${newStatus.replace(/-/g, " ")}`);
      loadWork();
      setShowStatusModal(false);
    } catch (error) {
      console.error("❌ Update failed:", error);
      showToast.error(error || "Failed to update status");
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handlePrint = () => {
    // Just download the PDF - user can print from PDF viewer
    pdfRef.current?.handleDownload();
    showToast.info("PDF downloaded. Open it and press Ctrl+P (Cmd+P) to print.");
  };

  const handleViewImages = (images, title) => {
    console.log(
      `👁️ Opening image preview: ${title} with ${images.length} images`,
    );

    if (images && images.length > 0) {
      const imageUrls = images.map((img) => img.url || img);
      setPreviewImages(imageUrls);
      setPreviewTitle(title);
      setShowImagePreview(true);
    } else {
      showToast.warning("No images to display");
    }
  };

  const handleClosePreview = () => {
    setShowImagePreview(false);
    setPreviewImages([]);
    setPreviewTitle("");
  };

  const formatDate = (date) => {
    if (!date) return "Not set";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
      accepted: "bg-blue-100 text-blue-700 border-blue-200",
      "cutting-started": "bg-purple-100 text-purple-700 border-purple-200",
      "cutting-completed": "bg-indigo-100 text-indigo-700 border-indigo-200",
      "sewing-started": "bg-pink-100 text-pink-700 border-pink-200",
      "sewing-completed": "bg-teal-100 text-teal-700 border-teal-200",
      ironing: "bg-orange-100 text-orange-700 border-orange-200",
      "ready-to-deliver": "bg-green-100 text-green-700 border-green-200",
    };
    return (
      colors[work?.status] || "bg-slate-100 text-slate-700 border-slate-200"
    );
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock size={20} />;
      case "accepted":
        return <CheckCircle size={20} />;
      case "cutting-started":
        return <Scissors size={20} />;
      case "cutting-completed":
        return <Scissors size={20} />;
      case "sewing-started":
        return <Ruler size={20} />;
      case "sewing-completed":
        return <Ruler size={20} />;
      case "ironing":
        return <Truck size={20} />;
      case "ready-to-deliver":
        return <CheckCircle size={20} />;
      default:
        return <Briefcase size={20} />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "#ef4444";
      case "low":
        return "#10b981";
      default:
        return "#f59e0b";
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case "high":
        return "High";
      case "low":
        return "Low";
      default:
        return "Normal";
    }
  };

  const isOverdue = () => {
    return (
      work?.estimatedDelivery &&
      new Date(work.estimatedDelivery) < new Date() &&
      work?.status !== "ready-to-deliver"
    );
  };

  // Get category name from garment
  const getCategoryName = () => {
    const garment = work?.garment;
    if (!garment) return "N/A";
    if (garment.categoryName) return garment.categoryName;
    if (garment.category?.name) return garment.category.name;
    if (garment.category?.categoryName) return garment.category.categoryName;
    return "N/A";
  };

  // Get item name from garment
  const getItemName = () => {
    const garment = work?.garment;
    if (!garment) return "N/A";
    if (garment.itemName) return garment.itemName;
    if (garment.item?.name) return garment.item.name;
    if (garment.item?.itemName) return garment.item.itemName;
    return "N/A";
  };

  if (!canViewWork) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
        <div className="text-center max-w-md mx-auto">
          <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">
            Access Denied
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mb-4">
            You don't have permission to view work details.
          </p>
          <button
            onClick={handleGoBack}
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (loading && !work) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-sm sm:text-base text-slate-600">
            Loading work details...
          </p>
        </div>
      </div>
    );
  }

  if (!work) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
        <div className="text-center max-w-md mx-auto">
          <Briefcase size={48} className="text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">
            Work Not Found
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mb-4">
            The work you're looking for doesn't exist.
          </p>
          <button
            onClick={handleGoBack}
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-3 sm:p-4 md:p-6">
      {/* Hidden PDF Component */}
      <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
        <GarmentPDF ref={pdfRef} garment={work?.garment} order={work?.order} />
      </div>

      {/* Image Preview Modal */}
      {showImagePreview && (
        <ImagePreviewModal
          images={previewImages}
          title={previewTitle}
          onClose={handleClosePreview}
        />
      )}

      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <button
          onClick={handleGoBack}
          className="flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-3 sm:mb-4 transition-all text-sm sm:text-base"
        >
          <ArrowLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
          <span>Back</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-800 mb-1">
              Work Details
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Work ID: {work.workId}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all touch-manipulation"
              title="Refresh"
            >
              <RefreshCw
                size={18}
                className={
                  loading ? "animate-spin text-blue-600" : "text-slate-600"
                }
              />
            </button>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all touch-manipulation"
              title="Print Garment Details"
            >
              <Printer size={18} />
              <span className="hidden sm:inline">Print</span>
            </button>

            {/* Download PDF Button */}
            <button
              onClick={() => pdfRef.current?.handleDownload()}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all touch-manipulation"
              title="Download Garment PDF"
            >
              <Download size={18} />
              <span className="hidden sm:inline">PDF</span>
            </button>

            {/* View Only Badge */}
            {isStoreKeeper && (
              <div className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium flex items-center gap-2">
                <Eye size={18} />
                <span className="hidden sm:inline">View Only</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Banner */}
      <div
        className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl border ${getStatusColor(work.status)} flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3`}
      >
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">{getStatusIcon(work.status)}</div>
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-medium">Current Status</p>
            <p className="text-base sm:text-lg font-bold capitalize truncate">
              {work.status?.replace(/-/g, " ")}
            </p>
          </div>
        </div>
        {isOverdue() && (
          <div className="flex items-center gap-2 text-red-700 bg-red-100 px-3 py-2 rounded-lg text-sm sm:text-base w-full sm:w-auto justify-center sm:justify-start">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span className="font-medium">Overdue</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {canPerformActions && (
        <div className="mb-4 sm:mb-6">
          <div className="hidden sm:flex gap-3">
            {work.status === "pending" && (
              <button
                onClick={handleAcceptWork}
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all flex items-center gap-2"
              >
                <CheckCircle size={18} />
                Accept Work
              </button>
            )}

            {work.status !== "pending" && !work.tailor && (
              <button
                onClick={() => setShowAssignModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all flex items-center gap-2"
              >
                <UserPlus size={18} />
                Assign Tailor
              </button>
            )}

            {work.tailor && work.status !== "ready-to-deliver" && (
              <button
                onClick={() => setShowStatusModal(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-all flex items-center gap-2"
              >
                <Clock size={18} />
                Update Status
              </button>
            )}
          </div>

          <div className="sm:hidden relative">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-700 font-medium"
            >
              <span className="flex items-center gap-2">
                <Menu size={18} />
                Actions
              </span>
              <ChevronDown
                size={18}
                className={`transition-transform ${showMobileMenu ? "rotate-180" : ""}`}
              />
            </button>

            {showMobileMenu && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
                {work.status === "pending" && (
                  <button
                    onClick={() => {
                      handleAcceptWork();
                      setShowMobileMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-slate-50 border-b border-slate-100 last:border-0"
                  >
                    <CheckCircle size={18} className="text-green-600" />
                    <span>Accept Work</span>
                  </button>
                )}

                {work.status !== "pending" && !work.tailor && (
                  <button
                    onClick={() => {
                      setShowAssignModal(true);
                      setShowMobileMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-slate-50 border-b border-slate-100 last:border-0"
                  >
                    <UserPlus size={18} className="text-blue-600" />
                    <span>Assign Tailor</span>
                  </button>
                )}

                {work.tailor && work.status !== "ready-to-deliver" && (
                  <button
                    onClick={() => {
                      setShowStatusModal(true);
                      setShowMobileMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-slate-50"
                  >
                    <Clock size={18} className="text-purple-600" />
                    <span>Update Status</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* View Only Message */}
      {isStoreKeeper && (
        <div className="mb-4 sm:mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700 flex items-center gap-2">
            <Eye size={18} />
            You are in view-only mode. You can see all work details but cannot
            make changes.
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-t-xl border-b border-slate-200 overflow-x-auto hide-scrollbar">
        <div className="flex gap-1 p-1 min-w-max sm:min-w-0">
          <button
            onClick={() => setActiveTab("details")}
            className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium transition-all text-sm sm:text-base whitespace-nowrap ${
              activeTab === "details"
                ? "bg-blue-50 text-blue-600"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Briefcase size={16} className="inline mr-1.5 sm:mr-2" />
            Details
          </button>
          <button
            onClick={() => setActiveTab("measurements")}
            className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium transition-all text-sm sm:text-base whitespace-nowrap ${
              activeTab === "measurements"
                ? "bg-blue-50 text-blue-600"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Ruler size={16} className="inline mr-1.5 sm:mr-2" />
            Measurements
          </button>
          <button
            onClick={() => setActiveTab("images")}
            className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium transition-all text-sm sm:text-base whitespace-nowrap ${
              activeTab === "images"
                ? "bg-blue-50 text-blue-600"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <ImageIcon size={16} className="inline mr-1.5 sm:mr-2" />
            Images
          </button>
        </div>
      </div>

      {/* Tab Content - The rest remains the same */}
      <div className="bg-white rounded-b-xl p-4 sm:p-6 shadow-sm">
        {activeTab === "details" && (
          <div className="space-y-4 sm:space-y-6">
            {/* Order Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-slate-50 rounded-xl p-3 sm:p-4">
                <h3 className="font-bold text-slate-800 mb-3 text-sm sm:text-base">
                  Order Information
                </h3>
                <div className="space-y-2.5 sm:space-y-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                    <span className="text-xs sm:text-sm text-slate-500">
                      Order ID
                    </span>
                    <span className="text-xs sm:text-sm font-medium text-blue-600 break-all">
                      {work.order?.orderId || "N/A"}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                    <span className="text-xs sm:text-sm text-slate-500">
                      Order Date
                    </span>
                    <span className="text-xs sm:text-sm text-slate-800">
                      {formatDate(work.order?.orderDate)}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                    <span className="text-xs sm:text-sm text-slate-500">
                      Delivery Date
                    </span>
                    <span className="text-xs sm:text-sm text-slate-800">
                      {formatDate(work.order?.deliveryDate)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Information - Simple N/A */}
              <div className="bg-slate-50 rounded-xl p-3 sm:p-4">
                <h3 className="font-bold text-slate-800 mb-3 text-sm sm:text-base">
                  Customer Details
                </h3>
                <div className="flex items-center gap-2 text-slate-400">
                  <User size={16} />
                  <p className="text-sm">N/A</p>
                </div>
              </div>
            </div>

            {/* Garment Information */}
            <div className="bg-slate-50 rounded-xl p-3 sm:p-4">
              <h3 className="font-bold text-slate-800 mb-3 text-sm sm:text-base">
                Garment Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Garment Name</p>
                  <p className="font-medium text-slate-800 text-sm sm:text-base break-words">
                    {work.garment?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Garment ID</p>
                  <p className="font-mono text-xs sm:text-sm text-blue-600 break-all">
                    {work.garment?.garmentId || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Category</p>
                  <p className="font-medium text-slate-800 text-sm sm:text-base">
                    {getCategoryName()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Item</p>
                  <p className="font-medium text-slate-800 text-sm sm:text-base">
                    {getItemName()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Priority</p>
                  <p
                    className="font-medium capitalize"
                    style={{ color: getPriorityColor(work.garment?.priority) }}
                  >
                    {getPriorityLabel(work.garment?.priority)}
                  </p>
                </div>
                {/* {work.garment?.priceRange && (
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Price Range</p>
                    <p className="font-medium text-slate-800 text-sm sm:text-base">
                      ₹{work.garment.priceRange.min || 0} - ₹{work.garment.priceRange.max || 0}
                    </p>
                  </div>
                )} */}
                {work.garment?.fabricPrice > 0 && (
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Fabric Price</p>
                    <p className="font-medium text-green-600">
                      ₹{work.garment.fabricPrice}
                    </p>
                  </div>
                )}
              </div>

              {/* Additional Information */}
              {work.garment?.additionalInfo && (
                <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-blue-50 border border-blue-100 rounded-xl">
                  <div className="flex items-center gap-2 mb-2 text-blue-700">
                    <FileText size={14} className="sm:w-4 sm:h-4" />
                    <h4 className="text-xs font-black uppercase tracking-wider">
                      Additional Information
                    </h4>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium break-words">
                    {work.garment.additionalInfo}
                  </p>
                </div>
              )}
            </div>

            {/* Work Assignment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-slate-50 rounded-xl p-3 sm:p-4">
                <h3 className="font-bold text-slate-800 mb-3 text-sm sm:text-base">
                  Cutting Master
                </h3>
                {work.cuttingMaster ? (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User
                        size={14}
                        className="sm:w-[18px] sm:h-[18px] text-blue-600"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-800 text-sm sm:text-base truncate">
                        {work.cuttingMaster.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        Assigned on {formatDate(work.acceptedAt)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">Not assigned yet</p>
                )}
              </div>

              <div className="bg-slate-50 rounded-xl p-3 sm:p-4">
                <h3 className="font-bold text-slate-800 mb-3 text-sm sm:text-base">
                  Tailor
                </h3>
                {work.tailor ? (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Scissors
                        size={14}
                        className="sm:w-[18px] sm:h-[18px] text-green-600"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-800 text-sm sm:text-base truncate">
                        {work.tailor.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {work.tailor.employeeId || "N/A"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">Not assigned yet</p>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-slate-50 rounded-xl p-3 sm:p-4">
              <h3 className="font-bold text-slate-800 mb-3 text-sm sm:text-base">
                Work Timeline
              </h3>
              <div className="space-y-2.5 sm:space-y-3">
                {work.acceptedAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                    <span className="text-xs sm:text-sm text-slate-600 break-words">
                      Accepted: {formatDate(work.acceptedAt)}
                    </span>
                  </div>
                )}
                {work.cuttingStartedAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                    <span className="text-xs sm:text-sm text-slate-600 break-words">
                      Cutting Started: {formatDate(work.cuttingStartedAt)}
                    </span>
                  </div>
                )}
                {work.cuttingCompletedAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-indigo-500 rounded-full flex-shrink-0"></div>
                    <span className="text-xs sm:text-sm text-slate-600 break-words">
                      Cutting Completed: {formatDate(work.cuttingCompletedAt)}
                    </span>
                  </div>
                )}
                {work.sewingStartedAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-pink-500 rounded-full flex-shrink-0"></div>
                    <span className="text-xs sm:text-sm text-slate-600 break-words">
                      Sewing Started: {formatDate(work.sewingStartedAt)}
                    </span>
                  </div>
                )}
                {work.sewingCompletedAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-teal-500 rounded-full flex-shrink-0"></div>
                    <span className="text-xs sm:text-sm text-slate-600 break-words">
                      Sewing Completed: {formatDate(work.sewingCompletedAt)}
                    </span>
                  </div>
                )}
                {work.ironingAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-500 rounded-full flex-shrink-0"></div>
                    <span className="text-xs sm:text-sm text-slate-600 break-words">
                      Ironing: {formatDate(work.ironingAt)}
                    </span>
                  </div>
                )}
                {work.readyAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                    <span className="text-xs sm:text-sm text-slate-600 break-words">
                      Ready to Deliver: {formatDate(work.readyAt)}
                    </span>
                  </div>
                )}
                {!work.acceptedAt &&
                  !work.cuttingStartedAt &&
                  !work.cuttingCompletedAt &&
                  !work.sewingStartedAt &&
                  !work.sewingCompletedAt &&
                  !work.ironingAt &&
                  !work.readyAt && (
                    <p className="text-sm text-slate-500 text-center py-2">
                      No timeline events yet
                    </p>
                  )}
              </div>
            </div>

            {/* Notes */}
            {(work.cuttingNotes || work.tailorNotes) && (
              <div className="bg-slate-50 rounded-xl p-3 sm:p-4">
                <h3 className="font-bold text-slate-800 mb-3 text-sm sm:text-base">
                  Notes
                </h3>
                {work.cuttingNotes && (
                  <div className="mb-3">
                    <p className="text-xs text-slate-500 mb-1">
                      Cutting Notes:
                    </p>
                    <p className="text-xs sm:text-sm text-slate-700 bg-white p-2.5 sm:p-3 rounded-lg break-words">
                      {work.cuttingNotes}
                    </p>
                  </div>
                )}
                {work.tailorNotes && (
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Tailor Notes:</p>
                    <p className="text-xs sm:text-sm text-slate-700 bg-white p-2.5 sm:p-3 rounded-lg break-words">
                      {work.tailorNotes}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "measurements" && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                Garment Measurements
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => pdfRef.current?.handleDownload()}
                  className="px-4 py-2.5 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <Download size={16} />
                  Download PDF
                </button>
              </div>
            </div>

            {work.garment?.measurements &&
            work.garment.measurements.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {work.garment.measurements.map((measurement, index) => (
                  <div
                    key={index}
                    className="bg-slate-50 rounded-xl p-3 sm:p-4"
                  >
                    <p className="text-xs text-slate-500 mb-1 capitalize truncate">
                      {measurement.name}
                    </p>
                    <p className="text-base sm:text-xl font-bold text-slate-800 break-words">
                      {measurement.value}{" "}
                      <span className="text-xs font-normal text-slate-500">
                        {measurement.unit}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12 bg-slate-50 rounded-xl">
                <Ruler
                  size={32}
                  className="sm:w-12 sm:h-12 text-slate-300 mx-auto mb-3 sm:mb-4"
                />
                <p className="text-sm sm:text-base text-slate-500">
                  No measurements available
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "images" && (
          <div className="space-y-4 sm:space-y-6">
            {/* Reference Images */}
            {work.garment?.referenceImages?.length > 0 && (
              <div>
                <h3 className="font-bold text-slate-800 mb-3 text-sm sm:text-base">
                  Reference Images
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  {work.garment.referenceImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() =>
                        handleViewImages(
                          work.garment.referenceImages,
                          "Reference Images",
                        )
                      }
                      className="relative group aspect-square w-full touch-manipulation"
                    >
                      <ImageWithFallback
                        src={img.url}
                        alt={`Reference ${index + 1}`}
                        className="w-full h-full rounded-lg border-2 border-indigo-200 group-hover:border-indigo-500 transition-all"
                        useProxy={true}
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <Eye size={20} className="sm:w-6 sm:h-6 text-white" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Customer Images */}
            {work.garment?.customerImages?.length > 0 && (
              <div>
                <h3 className="font-bold text-slate-800 mb-3 text-sm sm:text-base">
                  Customer Images
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  {work.garment.customerImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() =>
                        handleViewImages(
                          work.garment.customerImages,
                          "Customer Images",
                        )
                      }
                      className="relative group aspect-square w-full touch-manipulation"
                    >
                      <ImageWithFallback
                        src={img.url}
                        alt={`Customer ${index + 1}`}
                        className="w-full h-full rounded-lg border-2 border-green-200 group-hover:border-green-500 transition-all"
                        useProxy={true}
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <Eye size={20} className="sm:w-6 sm:h-6 text-white" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Cloth Images */}
            {work.garment?.customerClothImages?.length > 0 && (
              <div>
                <h3 className="font-bold text-slate-800 mb-3 text-sm sm:text-base">
                  Cloth Images
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  {work.garment.customerClothImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() =>
                        handleViewImages(
                          work.garment.customerClothImages,
                          "Cloth Images",
                        )
                      }
                      className="relative group aspect-square w-full touch-manipulation"
                    >
                      <ImageWithFallback
                        src={img.url}
                        alt={`Cloth ${index + 1}`}
                        className="w-full h-full rounded-lg border-2 border-orange-200 group-hover:border-orange-500 transition-all"
                        useProxy={true}
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <Eye size={20} className="sm:w-6 sm:h-6 text-white" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!work.garment?.referenceImages?.length &&
              !work.garment?.customerImages?.length &&
              !work.garment?.customerClothImages?.length && (
                <div className="text-center py-8 sm:py-12">
                  <ImageIcon
                    size={32}
                    className="sm:w-12 sm:h-12 text-slate-300 mx-auto mb-3 sm:mb-4"
                  />
                  <p className="text-sm sm:text-base text-slate-500">
                    No images available
                  </p>
                </div>
              )}
          </div>
        )}
      </div>

      {/* Modals */}
      {showAssignModal && (
        <AssignTailorModal
          work={work}
          onClose={() => setShowAssignModal(false)}
          onAssign={handleAssignTailor}
        />
      )}

      {showStatusModal && (
        <UpdateStatusModal
          work={work}
          onClose={() => setShowStatusModal(false)}
          onUpdate={handleUpdateStatus}
        />
      )}

      {/* CSS for hiding scrollbar */}
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}