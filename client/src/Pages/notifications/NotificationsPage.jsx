// // Pages/notifications/NotificationsPage.jsx
// import React, { useState, useEffect, useMemo } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { Link, useNavigate } from 'react-router-dom';
// import {
//   Bell,
//   Check,
//   RefreshCw,
//   Trash2,
//   CheckCheck,
//   Clock,
//   Scissors,
//   Briefcase,
//   CheckCircle,
//   Package,
//   AlertCircle,
//   X,
//   Eye,
//   ArrowLeft,
//   ChevronLeft,
//   ChevronRight,
//   Inbox,
//   Mail,
//   MailOpen,
//   Flag,
//   Search
// } from 'lucide-react';
// import {
//   fetchNotifications,
//   markAsRead,
//   markAllAsRead,
//   deleteNotification,
//   fetchUnreadCount,
//   selectNotifications,
//   selectUnreadCount,
//   selectNotificationsLoading,
//   selectNotificationsError
// } from '../../features/notification/notificationSlice';
// import showToast from '../../utils/toast';

// // ============================================
// // 🎨 NOTIFICATION ICON COMPONENT
// // ============================================
// const NotificationIcon = ({ type, isRead }) => {
//   const iconProps = { size: 20 };
  
//   if (isRead) {
//     switch(type) {
//       case 'work-available': return <Package className="text-gray-400" {...iconProps} />;
//       case 'work-assigned': return <Briefcase className="text-gray-400" {...iconProps} />;
//       case 'work-accepted': return <CheckCircle className="text-gray-400" {...iconProps} />;
//       case 'tailor-assigned': return <Scissors className="text-gray-400" {...iconProps} />;
//       case 'order-ready':
//       case 'order-delivered': return <CheckCircle className="text-gray-400" {...iconProps} />;
//       case 'order-cancelled': return <AlertCircle className="text-gray-400" {...iconProps} />;
//       default: return <Bell className="text-gray-400" {...iconProps} />;
//     }
//   } else {
//     switch(type) {
//       case 'work-available': return <Package className="text-purple-600" {...iconProps} />;
//       case 'work-assigned': return <Briefcase className="text-blue-600" {...iconProps} />;
//       case 'work-accepted': return <CheckCircle className="text-green-600" {...iconProps} />;
//       case 'tailor-assigned': return <Scissors className="text-orange-600" {...iconProps} />;
//       case 'order-ready':
//       case 'order-delivered': return <CheckCircle className="text-green-600" {...iconProps} />;
//       case 'order-cancelled': return <AlertCircle className="text-red-600" {...iconProps} />;
//       default: return <Bell className="text-blue-600" {...iconProps} />;
//     }
//   }
// };

// // ============================================
// // 🏷️ NOTIFICATION BADGE COMPONENT
// // ============================================
// const NotificationBadge = ({ type, priority, isRead }) => {
//   if (isRead) return null;
  
//   return (
//     <div className="flex gap-2">
//       {priority === 'high' && (
//         <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full font-medium flex items-center gap-1">
//           <Flag size={10} />
//           High Priority
//         </span>
//       )}
//       {type === 'work-available' && (
//         <span className="px-2 py-0.5 bg-purple-100 text-purple-600 text-xs rounded-full font-medium">
//           New Work
//         </span>
//       )}
//       {type === 'work-assigned' && (
//         <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full font-medium">
//           Assigned
//         </span>
//       )}
//       {type === 'work-accepted' && (
//         <span className="px-2 py-0.5 bg-green-100 text-green-600 text-xs rounded-full font-medium">
//           Accepted
//         </span>
//       )}
//     </div>
//   );
// };

// // ============================================
// // ⏱️ TIME FORMATTER
// // ============================================
// const formatTimeAgo = (dateString) => {
//   if (!dateString) return 'Unknown';
  
//   try {
//     const date = new Date(dateString);
//     const now = new Date();
//     const diffInSeconds = Math.floor((now - date) / 1000);
    
//     if (diffInSeconds < 60) return 'Just now';
//     if (diffInSeconds < 3600) {
//       const mins = Math.floor(diffInSeconds / 60);
//       return `${mins} min${mins > 1 ? 's' : ''} ago`;
//     }
//     if (diffInSeconds < 86400) {
//       const hours = Math.floor(diffInSeconds / 3600);
//       return `${hours} hour${hours > 1 ? 's' : ''} ago`;
//     }
//     if (diffInSeconds < 604800) {
//       const days = Math.floor(diffInSeconds / 86400);
//       return `${days} day${days > 1 ? 's' : ''} ago`;
//     }
    
//     return date.toLocaleDateString('en-US', { 
//       month: 'short', 
//       day: 'numeric',
//       year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
//     });
    
//   } catch {
//     return 'Invalid date';
//   }
// };

// // ============================================
// // 📄 EMPTY STATE COMPONENT
// // ============================================
// const EmptyState = ({ filter, onViewAll }) => {
//   const getIcon = () => {
//     switch(filter) {
//       case 'unread': return <Mail className="text-gray-300" size={48} />;
//       case 'read': return <MailOpen className="text-gray-300" size={48} />;
//       default: return <Inbox className="text-gray-300" size={48} />;
//     }
//   };

//   const getMessage = () => {
//     switch(filter) {
//       case 'unread':
//         return "You have no unread notifications.";
//       case 'read':
//         return "You have no read notifications.";
//       default:
//         return "You're all caught up! Check back later for updates.";
//     }
//   };

//   return (
//     <div className="bg-white rounded-xl shadow-sm p-16 text-center">
//       <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
//         {getIcon()}
//       </div>
//       <h3 className="text-xl font-bold text-gray-800 mb-2">No notifications</h3>
//       <p className="text-gray-500 mb-6">{getMessage()}</p>
//       {filter !== 'all' && (
//         <button
//           onClick={onViewAll}
//           className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium shadow-lg shadow-blue-500/20"
//         >
//           View All Notifications
//         </button>
//       )}
//     </div>
//   );
// };

// // ============================================
// // 📊 STATS CARD COMPONENT
// // ============================================
// const StatsCard = ({ icon: Icon, label, value, color }) => (
//   <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
//     <div className="flex items-center gap-3">
//       <div className={`w-10 h-10 rounded-lg bg-${color}-100 flex items-center justify-center`}>
//         <Icon size={20} className={`text-${color}-600`} />
//       </div>
//       <div>
//         <p className="text-sm text-gray-500">{label}</p>
//         <p className="text-xl font-bold text-gray-800">{value}</p>
//       </div>
//     </div>
//   </div>
// );

// // ============================================
// // 🎯 MAIN COMPONENT
// // ============================================
// export default function NotificationsPage() {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
  
//   // Redux state
//   const allNotifications = useSelector(selectNotifications) || [];
//   const unreadCount = useSelector(selectUnreadCount) || 0;
//   const loading = useSelector(selectNotificationsLoading) || false;
//   const error = useSelector(selectNotificationsError) || null;
//   const { user } = useSelector((state) => state.auth);

//   // Local state
//   const [filter, setFilter] = useState('all');
//   const [page, setPage] = useState(1);
//   const [limit, setLimit] = useState(10);
//   const [selectedNotifications, setSelectedNotifications] = useState([]);
//   const [selectMode, setSelectMode] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');

//   // Filter notifications based on current filter
//   const filteredNotifications = useMemo(() => {
//     let filtered = [...allNotifications];
    
//     // Apply read/unread filter
//     if (filter === 'unread') {
//       filtered = filtered.filter(n => !n.isRead);
//     } else if (filter === 'read') {
//       filtered = filtered.filter(n => n.isRead);
//     }
    
//     // Apply search filter
//     if (searchTerm.trim()) {
//       const term = searchTerm.toLowerCase();
//       filtered = filtered.filter(n => 
//         n.title?.toLowerCase().includes(term) ||
//         n.message?.toLowerCase().includes(term) ||
//         n.type?.toLowerCase().includes(term)
//       );
//     }
    
//     return filtered;
//   }, [allNotifications, filter, searchTerm]);

//   // Paginate notifications
//   const paginatedNotifications = useMemo(() => {
//     const start = (page - 1) * limit;
//     const end = start + limit;
//     return filteredNotifications.slice(start, end);
//   }, [filteredNotifications, page, limit]);

//   const totalPages = Math.ceil(filteredNotifications.length / limit);

//   // Get base path for navigation
//   const basePath = useMemo(() => {
//     if (!user?.role) return '/dashboard';
//     return user.role === 'ADMIN' ? '/admin' :
//            user.role === 'STORE_KEEPER' ? '/storekeeper' :
//            user.role === 'CUTTING_MASTER' ? '/cuttingmaster' : '/dashboard';
//   }, [user]);

//   // Load notifications on mount and filter change
//   useEffect(() => {
//     loadNotifications();
//   }, [filter, page, dispatch]);

//   // Load unread count periodically
//   useEffect(() => {
//     dispatch(fetchUnreadCount());
    
//     const interval = setInterval(() => {
//       dispatch(fetchUnreadCount());
//       loadNotifications(true);
//     }, 30000);
    
//     return () => clearInterval(interval);
//   }, [dispatch]);

//   const loadNotifications = async (silent = false) => {
//     if (!silent) setRefreshing(true);
    
//     try {
//       const params = {
//         page,
//         limit: 50,
//         ...(filter !== 'all' && { unreadOnly: filter === 'unread' ? 'true' : 'false' })
//       };
      
//       await dispatch(fetchNotifications(params)).unwrap();
      
//     } catch (err) {
//       if (!silent) showToast.error(err || 'Failed to load notifications');
//     } finally {
//       if (!silent) setRefreshing(false);
//     }
//   };

//   const handleMarkAsRead = async (id) => {
//     try {
//       await dispatch(markAsRead(id)).unwrap();
//       showToast.success('Marked as read');
//       dispatch(fetchUnreadCount());
//     } catch (error) {
//       showToast.error(error || 'Failed to mark as read');
//     }
//   };

//   const handleMarkAllAsRead = async () => {
//     if (unreadCount === 0) {
//       showToast.info('No unread notifications');
//       return;
//     }
    
//     if (window.confirm(`Mark all ${unreadCount} notifications as read?`)) {
//       try {
//         await dispatch(markAllAsRead()).unwrap();
//         showToast.success('All notifications marked as read');
//         dispatch(fetchUnreadCount());
//       } catch (error) {
//         showToast.error(error || 'Failed to mark all as read');
//       }
//     }
//   };

//   const handleDelete = async (id) => {
//     if (window.confirm('Delete this notification?')) {
//       try {
//         await dispatch(deleteNotification(id)).unwrap();
//         showToast.success('Notification deleted');
//         dispatch(fetchUnreadCount());
//       } catch (error) {
//         showToast.error(error || 'Failed to delete notification');
//       }
//     }
//   };

//   const handleDeleteSelected = async () => {
//     if (selectedNotifications.length === 0) return;
    
//     if (window.confirm(`Delete ${selectedNotifications.length} notifications?`)) {
//       try {
//         await Promise.all(selectedNotifications.map(id => 
//           dispatch(deleteNotification(id)).unwrap()
//         ));
//         showToast.success(`${selectedNotifications.length} notifications deleted`);
//         setSelectedNotifications([]);
//         setSelectMode(false);
//         dispatch(fetchUnreadCount());
//       } catch (error) {
//         showToast.error(error || 'Failed to delete notifications');
//       }
//     }
//   };

//   const handleSelectAll = () => {
//     if (selectedNotifications.length === paginatedNotifications.length) {
//       setSelectedNotifications([]);
//     } else {
//       setSelectedNotifications(paginatedNotifications.map(n => n._id));
//     }
//   };

//   const handleSelect = (id) => {
//     setSelectedNotifications(prev =>
//       prev.includes(id)
//         ? prev.filter(i => i !== id)
//         : [...prev, id]
//     );
//   };

//   const handleRefresh = () => {
//     loadNotifications();
//     dispatch(fetchUnreadCount());
//     showToast.success('Notifications refreshed');
//   };

//   const handleBack = () => {
//     navigate(basePath);
//   };

//   const handleFilterChange = (newFilter) => {
//     setFilter(newFilter);
//     setPage(1);
//     setSelectedNotifications([]);
//     setSelectMode(false);
//   };

//   const handleLimitChange = (e) => {
//     setLimit(Number(e.target.value));
//     setPage(1);
//   };

//   // 🔥 FIXED: getNotificationLink with proper ID extraction
//   const getNotificationLink = (notification) => {
//     const rolePath = basePath;
    
//     // Check if reference exists
//     const ref = notification.reference || {};

//     // 🔥 Extract only the ID string if it's an object
//     const workId = ref.workId?._id || ref.workId;
//     const orderId = ref.orderId?._id || ref.orderId;
//     const garmentId = ref.garmentId?._id || ref.garmentId;

//     if (workId && typeof workId === 'string') {
//       return `${rolePath}/works/${workId}`;
//     }
//     if (orderId && typeof orderId === 'string') {
//       return `${rolePath}/orders/${orderId}`;
//     }
//     if (garmentId && typeof garmentId === 'string') {
//       return `${rolePath}/garments/${garmentId}`;
//     }
    
//     return '#';
//   };

//   const getNotificationBg = (type, isRead) => {
//     if (isRead) return 'bg-white hover:bg-gray-50';
    
//     switch(type) {
//       case 'work-available': return 'bg-purple-50 hover:bg-purple-100';
//       case 'work-assigned': return 'bg-blue-50 hover:bg-blue-100';
//       case 'work-accepted': return 'bg-green-50 hover:bg-green-100';
//       case 'tailor-assigned': return 'bg-orange-50 hover:bg-orange-100';
//       case 'order-cancelled': return 'bg-red-50 hover:bg-red-100';
//       default: return 'bg-gray-50 hover:bg-gray-100';
//     }
//   };

//   const isLoading = loading || refreshing;

//   // Calculate stats
//   const stats = {
//     total: allNotifications.length,
//     unread: unreadCount,
//     read: allNotifications.length - unreadCount
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Fixed Header */}
//       <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          
//           {/* Top Row */}
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-4">
//               <button
//                 onClick={handleBack}
//                 className="p-2 hover:bg-gray-100 rounded-lg transition-all"
//               >
//                 <ArrowLeft size={20} className="text-gray-600" />
//               </button>
//               <div>
//                 <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
//                 <p className="text-sm text-gray-500">
//                   {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
//                   {filter !== 'all' && ` (${filter})`}
//                 </p>
//               </div>
//             </div>

//             <div className="flex items-center gap-3">
//               {/* Search */}
//               <div className="relative">
//                 <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
//                 <input
//                   type="text"
//                   placeholder="Search..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-64 bg-white"
//                 />
//                 {searchTerm && (
//                   <button
//                     onClick={() => setSearchTerm('')}
//                     className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
//                   >
//                     <X size={16} />
//                   </button>
//                 )}
//               </div>

//               {/* Actions */}
//               <button
//                 onClick={() => setSelectMode(!selectMode)}
//                 className={`p-2 rounded-lg transition-all ${
//                   selectMode ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'
//                 }`}
//               >
//                 <CheckCheck size={20} />
//               </button>

//               <button
//                 onClick={handleRefresh}
//                 disabled={isLoading}
//                 className="p-2 hover:bg-gray-100 rounded-lg transition-all disabled:opacity-50"
//               >
//                 <RefreshCw size={20} className={isLoading ? 'animate-spin text-blue-600' : 'text-gray-600'} />
//               </button>

//               {unreadCount > 0 && (
//                 <button
//                   onClick={handleMarkAllAsRead}
//                   className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2 text-sm font-medium shadow-lg"
//                 >
//                   <CheckCheck size={18} />
//                   Mark Read ({unreadCount})
//                 </button>
//               )}

//               {selectMode && selectedNotifications.length > 0 && (
//                 <button
//                   onClick={handleDeleteSelected}
//                   className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all flex items-center gap-2 text-sm font-medium shadow-lg"
//                 >
//                   <Trash2 size={18} />
//                   Delete ({selectedNotifications.length})
//                 </button>
//               )}
//             </div>
//           </div>

//           {/* Stats */}
//           <div className="grid grid-cols-3 gap-4 mt-6">
//             <StatsCard icon={Inbox} label="Total" value={stats.total} color="blue" />
//             <StatsCard icon={Mail} label="Unread" value={stats.unread} color="green" />
//             <StatsCard icon={MailOpen} label="Read" value={stats.read} color="gray" />
//           </div>

//           {/* Filter Tabs */}
//           <div className="bg-white py-3 mt-2 border-t border-gray-100">
//             <div className="flex items-center gap-2">
//               <button
//                 onClick={() => handleFilterChange('all')}
//                 className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
//                   filter === 'all'
//                     ? 'bg-blue-600 text-white shadow-md'
//                     : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
//                 }`}
//               >
//                 All ({stats.total})
//               </button>
//               <button
//                 onClick={() => handleFilterChange('unread')}
//                 className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
//                   filter === 'unread'
//                     ? 'bg-green-600 text-white shadow-md'
//                     : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
//                 }`}
//               >
//                 Unread ({stats.unread})
//               </button>
//               <button
//                 onClick={() => handleFilterChange('read')}
//                 className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
//                   filter === 'read'
//                     ? 'bg-gray-600 text-white shadow-md'
//                     : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
//                 }`}
//               >
//                 Read ({stats.read})
//               </button>
//             </div>
//           </div>

//           {/* Select Mode */}
//           {selectMode && paginatedNotifications.length > 0 && (
//             <div className="bg-gray-50 rounded-lg p-3 mt-2 border border-gray-200">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-4">
//                   <label className="flex items-center gap-2 cursor-pointer">
//                     <input
//                       type="checkbox"
//                       checked={selectedNotifications.length === paginatedNotifications.length}
//                       onChange={handleSelectAll}
//                       className="w-4 h-4 text-blue-600 rounded"
//                     />
//                     <span className="text-sm font-medium text-gray-700">
//                       {selectedNotifications.length === paginatedNotifications.length
//                         ? 'Deselect all'
//                         : 'Select all'
//                       }
//                     </span>
//                   </label>
//                   <span className="text-sm text-gray-500">
//                     {selectedNotifications.length} selected
//                   </span>
//                 </div>
//                 <button
//                   onClick={() => setSelectMode(false)}
//                   className="text-sm text-gray-500 hover:text-gray-700 font-medium"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Loading */}
//         {isLoading && paginatedNotifications.length === 0 && (
//           <div className="bg-white rounded-xl shadow-sm p-12 text-center">
//             <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto"></div>
//             <p className="mt-4 text-gray-600">Loading notifications...</p>
//           </div>
//         )}

//         {/* Error */}
//         {error && !isLoading && (
//           <div className="bg-white rounded-xl shadow-sm p-12 text-center">
//             <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
//             <h3 className="text-lg font-bold text-red-600 mb-2">Failed to load notifications</h3>
//             <p className="text-gray-500 mb-4">{error}</p>
//             <button
//               onClick={handleRefresh}
//               className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
//             >
//               Try Again
//             </button>
//           </div>
//         )}

//         {/* Empty */}
//         {!isLoading && !error && filteredNotifications.length === 0 && (
//           <EmptyState filter={filter} onViewAll={() => handleFilterChange('all')} />
//         )}

//         {/* Notifications List */}
//         {!isLoading && !error && filteredNotifications.length > 0 && (
//           <>
//             <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
//               <div className="divide-y divide-gray-100">
//                 {paginatedNotifications.map((notification) => (
//                   <div
//                     key={notification._id}
//                     className={`p-4 ${getNotificationBg(notification.type, notification.isRead)} transition-all ${
//                       selectMode ? 'pl-6' : ''
//                     } ${!notification.isRead ? 'border-l-4 border-l-blue-500' : ''}`}
//                   >
//                     <div className="flex items-start gap-4">
//                       {/* Select checkbox */}
//                       {selectMode && (
//                         <div className="pt-2">
//                           <input
//                             type="checkbox"
//                             checked={selectedNotifications.includes(notification._id)}
//                             onChange={() => handleSelect(notification._id)}
//                             className="w-4 h-4 text-blue-600 rounded"
//                           />
//                         </div>
//                       )}

//                       {/* Icon */}
//                       <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
//                         notification.isRead ? 'bg-gray-100' : 'bg-gradient-to-br from-blue-50 to-indigo-50 shadow-sm'
//                       }`}>
//                         <NotificationIcon type={notification.type} isRead={notification.isRead} />
//                       </div>

//                       {/* Content */}
//                       <div className="flex-1 min-w-0">
//                         <div className="flex items-start justify-between gap-4">
//                           <div className="flex-1">
//                             <div className="flex items-center gap-2 mb-1 flex-wrap">
//                               <h3 className={`font-semibold ${
//                                 notification.isRead ? 'text-gray-700' : 'text-gray-900'
//                               }`}>
//                                 {notification.title}
//                               </h3>
//                               <NotificationBadge 
//                                 type={notification.type} 
//                                 priority={notification.priority}
//                                 isRead={notification.isRead}
//                               />
//                             </div>
                            
//                             <p className={`text-sm mb-2 ${
//                               notification.isRead ? 'text-gray-500' : 'text-gray-600'
//                             }`}>
//                               {notification.message}
//                             </p>
                            
//                             <div className="flex items-center gap-3 text-xs">
//                               <span className="text-gray-400 flex items-center gap-1">
//                                 <Clock size={12} />
//                                 {formatTimeAgo(notification.createdAt)}
//                               </span>
                              
//                               {(notification.reference?.orderId || 
//                                 notification.reference?.workId || 
//                                 notification.reference?.garmentId) && (
//                                 <>
//                                   <span className="text-gray-300">•</span>
//                                   {/* 🔥 FIXED: Link with NO onClick - just navigation */}
//                                   <Link
//                                     to={getNotificationLink(notification)}
//                                     className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
//                                   >
//                                     View Details
//                                     <Eye size={12} />
//                                   </Link>
//                                 </>
//                               )}
//                             </div>
//                           </div>

//                           {/* Actions - ONLY here we have mark as read button */}
//                           {!selectMode && (
//                             <div className="flex items-center gap-2">
//                               {!notification.isRead && (
//                                 <button
//                                   onClick={() => handleMarkAsRead(notification._id)}
//                                   className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all"
//                                   title="Mark as read"
//                                 >
//                                   <Check size={16} />
//                                 </button>
//                               )}
//                               <button
//                                 onClick={() => handleDelete(notification._id)}
//                                 className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
//                                 title="Delete"
//                               >
//                                 <Trash2 size={16} />
//                               </button>
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Pagination */}
//             {totalPages > 1 && (
//               <div className="mt-6 flex items-center justify-between bg-white rounded-xl shadow-sm px-4 py-3 border border-gray-200">
//                 <div className="flex items-center gap-2">
//                   <button
//                     onClick={() => setPage(p => Math.max(1, p - 1))}
//                     disabled={page === 1}
//                     className="p-2 hover:bg-gray-100 rounded-lg transition-all disabled:opacity-50"
//                   >
//                     <ChevronLeft size={16} />
//                   </button>
//                   <span className="text-sm text-gray-600">
//                     Page {page} of {totalPages}
//                   </span>
//                   <button
//                     onClick={() => setPage(p => Math.min(totalPages, p + 1))}
//                     disabled={page === totalPages}
//                     className="p-2 hover:bg-gray-100 rounded-lg transition-all disabled:opacity-50"
//                   >
//                     <ChevronRight size={16} />
//                   </button>
//                 </div>
//                 <div className="flex items-center gap-2 text-sm">
//                   <span className="text-gray-500">
//                     Showing {((page - 1) * limit) + 1} - {Math.min(page * limit, filteredNotifications.length)} of {filteredNotifications.length}
//                   </span>
//                   <select
//                     value={limit}
//                     onChange={handleLimitChange}
//                     className="border border-gray-200 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
//                   >
//                     <option value={10}>10 per page</option>
//                     <option value={20}>20 per page</option>
//                     <option value={50}>50 per page</option>
//                   </select>
//                 </div>
//               </div>
//             )}
//           </>
//         )}
//       </div>

//       {/* Scroll to Top */}
//       {!selectMode && filteredNotifications.length > 0 && (
//         <button
//           onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
//           className="fixed bottom-6 right-6 p-3 bg-blue-600 rounded-full shadow-lg hover:shadow-xl transition-all text-white z-40"
//           title="Scroll to top"
//         >
//           <ChevronLeft size={20} className="rotate-90" />
//         </button>
//       )}
//     </div>
//   );
// }













// // Pages/notifications/NotificationsPage.jsx
// import React, { useState, useEffect, useMemo } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { Link, useNavigate } from 'react-router-dom';
// import {
//   Bell,
//   Check,
//   RefreshCw,
//   Trash2,
//   CheckCheck,
//   Clock,
//   Scissors,
//   Briefcase,
//   CheckCircle,
//   Package,
//   AlertCircle,
//   X,
//   Eye,
//   ArrowLeft,
//   ChevronLeft,
//   ChevronRight,
//   Inbox,
//   Mail,
//   MailOpen,
//   Flag,
//   Search,
//   Menu
// } from 'lucide-react';
// import {
//   fetchNotifications,
//   markAsRead,
//   markAllAsRead,
//   deleteNotification,
//   fetchUnreadCount,
//   selectNotifications,
//   selectUnreadCount,
//   selectNotificationsLoading,
//   selectNotificationsError
// } from '../../features/notification/notificationSlice';
// import showToast from '../../utils/toast';

// // ============================================
// // 🎨 NOTIFICATION ICON COMPONENT
// // ============================================
// const NotificationIcon = ({ type, isRead }) => {
//   const iconProps = { size: 20 };
  
//   if (isRead) {
//     switch(type) {
//       case 'work-available': return <Package className="text-gray-400" {...iconProps} />;
//       case 'work-assigned': return <Briefcase className="text-gray-400" {...iconProps} />;
//       case 'work-accepted': return <CheckCircle className="text-gray-400" {...iconProps} />;
//       case 'tailor-assigned': return <Scissors className="text-gray-400" {...iconProps} />;
//       case 'order-ready':
//       case 'order-delivered': return <CheckCircle className="text-gray-400" {...iconProps} />;
//       case 'order-cancelled': return <AlertCircle className="text-gray-400" {...iconProps} />;
//       default: return <Bell className="text-gray-400" {...iconProps} />;
//     }
//   } else {
//     switch(type) {
//       case 'work-available': return <Package className="text-purple-600" {...iconProps} />;
//       case 'work-assigned': return <Briefcase className="text-blue-600" {...iconProps} />;
//       case 'work-accepted': return <CheckCircle className="text-green-600" {...iconProps} />;
//       case 'tailor-assigned': return <Scissors className="text-orange-600" {...iconProps} />;
//       case 'order-ready':
//       case 'order-delivered': return <CheckCircle className="text-green-600" {...iconProps} />;
//       case 'order-cancelled': return <AlertCircle className="text-red-600" {...iconProps} />;
//       default: return <Bell className="text-blue-600" {...iconProps} />;
//     }
//   }
// };

// // ============================================
// // 🏷️ NOTIFICATION BADGE COMPONENT (MOBILE RESPONSIVE)
// // ============================================
// const NotificationBadge = ({ type, priority, isRead }) => {
//   if (isRead) return null;
  
//   return (
//     <div className="flex flex-wrap gap-1 sm:gap-2">
//       {priority === 'high' && (
//         <span className="px-1.5 sm:px-2 py-0.5 bg-red-100 text-red-600 text-[10px] sm:text-xs rounded-full font-medium flex items-center gap-0.5 sm:gap-1">
//           <Flag size={8} className="sm:w-3 sm:h-3" />
//           <span className="hidden sm:inline">High Priority</span>
//           <span className="sm:hidden">High</span>
//         </span>
//       )}
//       {type === 'work-available' && (
//         <span className="px-1.5 sm:px-2 py-0.5 bg-purple-100 text-purple-600 text-[10px] sm:text-xs rounded-full font-medium">
//           <span className="hidden sm:inline">New Work</span>
//           <span className="sm:hidden">New</span>
//         </span>
//       )}
//       {type === 'work-assigned' && (
//         <span className="px-1.5 sm:px-2 py-0.5 bg-blue-100 text-blue-600 text-[10px] sm:text-xs rounded-full font-medium">
//           <span className="hidden sm:inline">Assigned</span>
//           <span className="sm:hidden">Asgn</span>
//         </span>
//       )}
//       {type === 'work-accepted' && (
//         <span className="px-1.5 sm:px-2 py-0.5 bg-green-100 text-green-600 text-[10px] sm:text-xs rounded-full font-medium">
//           <span className="hidden sm:inline">Accepted</span>
//           <span className="sm:hidden">Acc</span>
//         </span>
//       )}
//     </div>
//   );
// };

// // ============================================
// // ⏱️ TIME FORMATTER (MOBILE FRIENDLY)
// // ============================================
// const formatTimeAgo = (dateString) => {
//   if (!dateString) return 'Unknown';
  
//   try {
//     const date = new Date(dateString);
//     const now = new Date();
//     const diffInSeconds = Math.floor((now - date) / 1000);
    
//     if (diffInSeconds < 60) return 'Just now';
//     if (diffInSeconds < 3600) {
//       const mins = Math.floor(diffInSeconds / 60);
//       return `${mins}m ago`;
//     }
//     if (diffInSeconds < 86400) {
//       const hours = Math.floor(diffInSeconds / 3600);
//       return `${hours}h ago`;
//     }
//     if (diffInSeconds < 604800) {
//       const days = Math.floor(diffInSeconds / 86400);
//       return `${days}d ago`;
//     }
    
//     return date.toLocaleDateString('en-US', { 
//       month: 'short', 
//       day: 'numeric',
//       year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
//     });
    
//   } catch {
//     return 'Invalid date';
//   }
// };

// // ============================================
// // 📄 EMPTY STATE COMPONENT (MOBILE RESPONSIVE)
// // ============================================
// const EmptyState = ({ filter, onViewAll }) => {
//   const getIcon = () => {
//     switch(filter) {
//       case 'unread': return <Mail className="text-gray-300" size={40} />;
//       case 'read': return <MailOpen className="text-gray-300" size={40} />;
//       default: return <Inbox className="text-gray-300" size={40} />;
//     }
//   };

//   const getMessage = () => {
//     switch(filter) {
//       case 'unread':
//         return "You have no unread notifications.";
//       case 'read':
//         return "You have no read notifications.";
//       default:
//         return "You're all caught up! Check back later for updates.";
//     }
//   };

//   return (
//     <div className="bg-white rounded-xl shadow-sm p-8 sm:p-16 text-center">
//       <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
//         {getIcon()}
//       </div>
//       <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">No notifications</h3>
//       <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6 px-4">{getMessage()}</p>
//       {filter !== 'all' && (
//         <button
//           onClick={onViewAll}
//           className="px-4 sm:px-6 py-2 sm:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium shadow-lg shadow-blue-500/20 text-sm sm:text-base"
//         >
//           View All Notifications
//         </button>
//       )}
//     </div>
//   );
// };

// // ============================================
// // 📊 STATS CARD COMPONENT (MOBILE RESPONSIVE)
// // ============================================
// const StatsCard = ({ icon: Icon, label, value, color }) => (
//   <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 border border-gray-100">
//     <div className="flex items-center gap-2 sm:gap-3">
//       <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-${color}-100 flex items-center justify-center flex-shrink-0`}>
//         <Icon size={16} className={`text-${color}-600 sm:w-5 sm:h-5`} />
//       </div>
//       <div className="min-w-0">
//         <p className="text-xs text-gray-500 truncate">{label}</p>
//         <p className="text-lg sm:text-xl font-bold text-gray-800">{value}</p>
//       </div>
//     </div>
//   </div>
// );

// // ============================================
// // 🎯 MAIN COMPONENT
// // ============================================
// export default function NotificationsPage() {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
  
//   // Redux state
//   const allNotifications = useSelector(selectNotifications) || [];
//   const unreadCount = useSelector(selectUnreadCount) || 0;
//   const loading = useSelector(selectNotificationsLoading) || false;
//   const error = useSelector(selectNotificationsError) || null;
//   const { user } = useSelector((state) => state.auth);

//   // Local state
//   const [filter, setFilter] = useState('all');
//   const [page, setPage] = useState(1);
//   const [limit, setLimit] = useState(10);
//   const [selectedNotifications, setSelectedNotifications] = useState([]);
//   const [selectMode, setSelectMode] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [showMobileSearch, setShowMobileSearch] = useState(false);
//   const [showMobileActions, setShowMobileActions] = useState(false);

//   // Filter notifications based on current filter
//   const filteredNotifications = useMemo(() => {
//     let filtered = [...allNotifications];
    
//     // Apply read/unread filter
//     if (filter === 'unread') {
//       filtered = filtered.filter(n => !n.isRead);
//     } else if (filter === 'read') {
//       filtered = filtered.filter(n => n.isRead);
//     }
    
//     // Apply search filter
//     if (searchTerm.trim()) {
//       const term = searchTerm.toLowerCase();
//       filtered = filtered.filter(n => 
//         n.title?.toLowerCase().includes(term) ||
//         n.message?.toLowerCase().includes(term) ||
//         n.type?.toLowerCase().includes(term)
//       );
//     }
    
//     return filtered;
//   }, [allNotifications, filter, searchTerm]);

//   // Paginate notifications
//   const paginatedNotifications = useMemo(() => {
//     const start = (page - 1) * limit;
//     const end = start + limit;
//     return filteredNotifications.slice(start, end);
//   }, [filteredNotifications, page, limit]);

//   const totalPages = Math.ceil(filteredNotifications.length / limit);

//   // Get base path for navigation
//   const basePath = useMemo(() => {
//     if (!user?.role) return '/dashboard';
//     return user.role === 'ADMIN' ? '/admin' :
//            user.role === 'STORE_KEEPER' ? '/storekeeper' :
//            user.role === 'CUTTING_MASTER' ? '/cuttingmaster' : '/dashboard';
//   }, [user]);

//   // Load notifications on mount and filter change
//   useEffect(() => {
//     loadNotifications();
//   }, [filter, page, dispatch]);

//   // Load unread count periodically
//   useEffect(() => {
//     dispatch(fetchUnreadCount());
    
//     const interval = setInterval(() => {
//       dispatch(fetchUnreadCount());
//       loadNotifications(true);
//     }, 30000);
    
//     return () => clearInterval(interval);
//   }, [dispatch]);

//   const loadNotifications = async (silent = false) => {
//     if (!silent) setRefreshing(true);
    
//     try {
//       const params = {
//         page,
//         limit: 50,
//         ...(filter !== 'all' && { unreadOnly: filter === 'unread' ? 'true' : 'false' })
//       };
      
//       await dispatch(fetchNotifications(params)).unwrap();
      
//     } catch (err) {
//       if (!silent) showToast.error(err || 'Failed to load notifications');
//     } finally {
//       if (!silent) setRefreshing(false);
//     }
//   };

//   const handleMarkAsRead = async (id) => {
//     try {
//       await dispatch(markAsRead(id)).unwrap();
//       showToast.success('Marked as read');
//       dispatch(fetchUnreadCount());
//     } catch (error) {
//       showToast.error(error || 'Failed to mark as read');
//     }
//   };

//   const handleMarkAllAsRead = async () => {
//     if (unreadCount === 0) {
//       showToast.info('No unread notifications');
//       return;
//     }
    
//     if (window.confirm(`Mark all ${unreadCount} notifications as read?`)) {
//       try {
//         await dispatch(markAllAsRead()).unwrap();
//         showToast.success('All notifications marked as read');
//         dispatch(fetchUnreadCount());
//         setShowMobileActions(false);
//       } catch (error) {
//         showToast.error(error || 'Failed to mark all as read');
//       }
//     }
//   };

//   const handleDelete = async (id) => {
//     if (window.confirm('Delete this notification?')) {
//       try {
//         await dispatch(deleteNotification(id)).unwrap();
//         showToast.success('Notification deleted');
//         dispatch(fetchUnreadCount());
//       } catch (error) {
//         showToast.error(error || 'Failed to delete notification');
//       }
//     }
//   };

//   const handleDeleteSelected = async () => {
//     if (selectedNotifications.length === 0) return;
    
//     if (window.confirm(`Delete ${selectedNotifications.length} notifications?`)) {
//       try {
//         await Promise.all(selectedNotifications.map(id => 
//           dispatch(deleteNotification(id)).unwrap()
//         ));
//         showToast.success(`${selectedNotifications.length} notifications deleted`);
//         setSelectedNotifications([]);
//         setSelectMode(false);
//         dispatch(fetchUnreadCount());
//         setShowMobileActions(false);
//       } catch (error) {
//         showToast.error(error || 'Failed to delete notifications');
//       }
//     }
//   };

//   const handleSelectAll = () => {
//     if (selectedNotifications.length === paginatedNotifications.length) {
//       setSelectedNotifications([]);
//     } else {
//       setSelectedNotifications(paginatedNotifications.map(n => n._id));
//     }
//   };

//   const handleSelect = (id) => {
//     setSelectedNotifications(prev =>
//       prev.includes(id)
//         ? prev.filter(i => i !== id)
//         : [...prev, id]
//     );
//   };

//   const handleRefresh = () => {
//     loadNotifications();
//     dispatch(fetchUnreadCount());
//     showToast.success('Notifications refreshed');
//     setShowMobileActions(false);
//   };

//   const handleBack = () => {
//     navigate(basePath);
//   };

//   const handleFilterChange = (newFilter) => {
//     setFilter(newFilter);
//     setPage(1);
//     setSelectedNotifications([]);
//     setSelectMode(false);
//     setShowMobileActions(false);
//   };

//   const handleLimitChange = (e) => {
//     setLimit(Number(e.target.value));
//     setPage(1);
//   };

//   // 🔥 FIXED: getNotificationLink with proper ID extraction
//   const getNotificationLink = (notification) => {
//     const rolePath = basePath;
    
//     // Check if reference exists
//     const ref = notification.reference || {};

//     // 🔥 Extract only the ID string if it's an object
//     const workId = ref.workId?._id || ref.workId;
//     const orderId = ref.orderId?._id || ref.orderId;
//     const garmentId = ref.garmentId?._id || ref.garmentId;

//     if (workId && typeof workId === 'string') {
//       return `${rolePath}/works/${workId}`;
//     }
//     if (orderId && typeof orderId === 'string') {
//       return `${rolePath}/orders/${orderId}`;
//     }
//     if (garmentId && typeof garmentId === 'string') {
//       return `${rolePath}/garments/${garmentId}`;
//     }
    
//     return '#';
//   };

//   const getNotificationBg = (type, isRead) => {
//     if (isRead) return 'bg-white hover:bg-gray-50';
    
//     switch(type) {
//       case 'work-available': return 'bg-purple-50 hover:bg-purple-100';
//       case 'work-assigned': return 'bg-blue-50 hover:bg-blue-100';
//       case 'work-accepted': return 'bg-green-50 hover:bg-green-100';
//       case 'tailor-assigned': return 'bg-orange-50 hover:bg-orange-100';
//       case 'order-cancelled': return 'bg-red-50 hover:bg-red-100';
//       default: return 'bg-gray-50 hover:bg-gray-100';
//     }
//   };

//   const isLoading = loading || refreshing;

//   // Calculate stats
//   const stats = {
//     total: allNotifications.length,
//     unread: unreadCount,
//     read: allNotifications.length - unreadCount
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Fixed Header - Mobile Responsive */}
//       <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
//         <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
          
//           {/* Top Row - Mobile Responsive */}
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-2 sm:gap-4 min-w-0">
//               <button
//                 onClick={handleBack}
//                 className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-all flex-shrink-0"
//               >
//                 <ArrowLeft size={18} className="text-gray-600 sm:w-5 sm:h-5" />
//               </button>
//               <div className="min-w-0">
//                 <h1 className="text-lg sm:text-2xl font-bold text-gray-800 truncate">Notifications</h1>
//                 <p className="text-xs sm:text-sm text-gray-500 truncate">
//                   {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
//                   {filter !== 'all' && ` (${filter})`}
//                 </p>
//               </div>
//             </div>

//             {/* Desktop Actions - Hidden on Mobile */}
//             <div className="hidden sm:flex items-center gap-3">
//               {/* Search */}
//               <div className="relative">
//                 <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
//                 <input
//                   type="text"
//                   placeholder="Search..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-64 bg-white text-sm"
//                 />
//                 {searchTerm && (
//                   <button
//                     onClick={() => setSearchTerm('')}
//                     className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
//                   >
//                     <X size={16} />
//                   </button>
//                 )}
//               </div>

//               {/* Actions */}
//               <button
//                 onClick={() => setSelectMode(!selectMode)}
//                 className={`p-2 rounded-lg transition-all ${
//                   selectMode ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'
//                 }`}
//               >
//                 <CheckCheck size={20} />
//               </button>

//               <button
//                 onClick={handleRefresh}
//                 disabled={isLoading}
//                 className="p-2 hover:bg-gray-100 rounded-lg transition-all disabled:opacity-50"
//               >
//                 <RefreshCw size={20} className={isLoading ? 'animate-spin text-blue-600' : 'text-gray-600'} />
//               </button>

//               {unreadCount > 0 && (
//                 <button
//                   onClick={handleMarkAllAsRead}
//                   className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2 text-sm font-medium shadow-lg"
//                 >
//                   <CheckCheck size={18} />
//                   Mark Read ({unreadCount})
//                 </button>
//               )}

//               {selectMode && selectedNotifications.length > 0 && (
//                 <button
//                   onClick={handleDeleteSelected}
//                   className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all flex items-center gap-2 text-sm font-medium shadow-lg"
//                 >
//                   <Trash2 size={18} />
//                   Delete ({selectedNotifications.length})
//                 </button>
//               )}
//             </div>

//             {/* Mobile Actions Menu */}
//             <div className="sm:hidden">
//               <button
//                 onClick={() => setShowMobileActions(!showMobileActions)}
//                 className="p-2 hover:bg-gray-100 rounded-lg"
//               >
//                 <Menu size={20} className="text-gray-600" />
//               </button>
              
//               {showMobileActions && (
//                 <div className="absolute right-3 top-14 mt-1 w-56 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
//                   <div className="p-2 space-y-1">
//                     {/* Mobile Search Toggle */}
//                     <button
//                       onClick={() => {
//                         setShowMobileSearch(true);
//                         setShowMobileActions(false);
//                       }}
//                       className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-lg text-gray-700 font-medium flex items-center gap-2 text-sm"
//                     >
//                       <Search size={16} />
//                       Search
//                     </button>

//                     {/* Mobile Select Mode */}
//                     <button
//                       onClick={() => {
//                         setSelectMode(!selectMode);
//                         setShowMobileActions(false);
//                       }}
//                       className={`w-full text-left px-4 py-3 hover:bg-gray-50 rounded-lg flex items-center gap-2 text-sm ${
//                         selectMode ? 'text-blue-600 font-medium' : 'text-gray-700'
//                       }`}
//                     >
//                       <CheckCheck size={16} />
//                       {selectMode ? 'Exit Select Mode' : 'Select Multiple'}
//                     </button>

//                     {/* Mobile Refresh */}
//                     <button
//                       onClick={handleRefresh}
//                       disabled={isLoading}
//                       className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-lg text-gray-700 font-medium flex items-center gap-2 text-sm disabled:opacity-50"
//                     >
//                       <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
//                       Refresh
//                     </button>

//                     {/* Mobile Mark All Read */}
//                     {unreadCount > 0 && (
//                       <button
//                         onClick={handleMarkAllAsRead}
//                         className="w-full text-left px-4 py-3 hover:bg-blue-50 rounded-lg text-blue-600 font-medium flex items-center gap-2 text-sm"
//                       >
//                         <CheckCheck size={16} />
//                         Mark All Read ({unreadCount})
//                       </button>
//                     )}

//                     {/* Mobile Delete Selected */}
//                     {selectMode && selectedNotifications.length > 0 && (
//                       <button
//                         onClick={handleDeleteSelected}
//                         className="w-full text-left px-4 py-3 hover:bg-red-50 rounded-lg text-red-600 font-medium flex items-center gap-2 text-sm"
//                       >
//                         <Trash2 size={16} />
//                         Delete ({selectedNotifications.length})
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Mobile Search Bar */}
//           {showMobileSearch && (
//             <div className="sm:hidden mt-3 relative">
//               <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
//               <input
//                 type="text"
//                 placeholder="Search notifications..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
//                 autoFocus
//               />
//               {searchTerm && (
//                 <button
//                   onClick={() => setSearchTerm('')}
//                   className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
//                 >
//                   <X size={16} />
//                 </button>
//               )}
//               <button
//                 onClick={() => setShowMobileSearch(false)}
//                 className="absolute right-10 top-2.5 text-gray-400 hover:text-gray-600"
//               >
//                 <X size={16} />
//               </button>
//             </div>
//           )}

//           {/* Stats - Mobile Responsive Grid */}
//           <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-4 sm:mt-6">
//             <StatsCard icon={Inbox} label="Total" value={stats.total} color="blue" />
//             <StatsCard icon={Mail} label="Unread" value={stats.unread} color="green" />
//             <StatsCard icon={MailOpen} label="Read" value={stats.read} color="gray" />
//           </div>

//           {/* Filter Tabs - Scrollable on Mobile */}
//           <div className="bg-white py-2 sm:py-3 mt-2 border-t border-gray-100 overflow-x-auto">
//             <div className="flex items-center gap-1 sm:gap-2 min-w-max sm:min-w-0">
//               <button
//                 onClick={() => handleFilterChange('all')}
//                 className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium text-xs sm:text-sm transition-all whitespace-nowrap ${
//                   filter === 'all'
//                     ? 'bg-blue-600 text-white shadow-md'
//                     : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
//                 }`}
//               >
//                 All ({stats.total})
//               </button>
//               <button
//                 onClick={() => handleFilterChange('unread')}
//                 className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium text-xs sm:text-sm transition-all whitespace-nowrap ${
//                   filter === 'unread'
//                     ? 'bg-green-600 text-white shadow-md'
//                     : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
//                 }`}
//               >
//                 Unread ({stats.unread})
//               </button>
//               <button
//                 onClick={() => handleFilterChange('read')}
//                 className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium text-xs sm:text-sm transition-all whitespace-nowrap ${
//                   filter === 'read'
//                     ? 'bg-gray-600 text-white shadow-md'
//                     : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
//                 }`}
//               >
//                 Read ({stats.read})
//               </button>
//             </div>
//           </div>

//           {/* Select Mode - Mobile Responsive */}
//           {selectMode && paginatedNotifications.length > 0 && (
//             <div className="bg-gray-50 rounded-lg p-2 sm:p-3 mt-2 border border-gray-200">
//               <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
//                 <div className="flex items-center gap-2 sm:gap-4">
//                   <label className="flex items-center gap-1.5 sm:gap-2 cursor-pointer">
//                     <input
//                       type="checkbox"
//                       checked={selectedNotifications.length === paginatedNotifications.length}
//                       onChange={handleSelectAll}
//                       className="w-4 h-4 text-blue-600 rounded"
//                     />
//                     <span className="text-xs sm:text-sm font-medium text-gray-700">
//                       {selectedNotifications.length === paginatedNotifications.length
//                         ? 'Deselect all'
//                         : 'Select all'
//                       }
//                     </span>
//                   </label>
//                   <span className="text-xs sm:text-sm text-gray-500">
//                     {selectedNotifications.length} selected
//                   </span>
//                 </div>
//                 <button
//                   onClick={() => {
//                     setSelectMode(false);
//                     setSelectedNotifications([]);
//                   }}
//                   className="text-xs sm:text-sm text-gray-500 hover:text-gray-700 font-medium self-end sm:self-auto"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Main Content - Mobile Responsive */}
//       <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
//         {/* Loading */}
//         {isLoading && paginatedNotifications.length === 0 && (
//           <div className="bg-white rounded-xl shadow-sm p-8 sm:p-12 text-center">
//             <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-2 border-blue-600 border-t-transparent mx-auto"></div>
//             <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-600">Loading notifications...</p>
//           </div>
//         )}

//         {/* Error */}
//         {error && !isLoading && (
//           <div className="bg-white rounded-xl shadow-sm p-8 sm:p-12 text-center">
//             <AlertCircle size={36} className="text-red-400 mx-auto mb-3 sm:w-12 sm:h-12" />
//             <h3 className="text-base sm:text-lg font-bold text-red-600 mb-2">Failed to load notifications</h3>
//             <p className="text-sm sm:text-base text-gray-500 mb-4">{error}</p>
//             <button
//               onClick={handleRefresh}
//               className="px-4 sm:px-6 py-2 sm:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm sm:text-base"
//             >
//               Try Again
//             </button>
//           </div>
//         )}

//         {/* Empty */}
//         {!isLoading && !error && filteredNotifications.length === 0 && (
//           <EmptyState filter={filter} onViewAll={() => handleFilterChange('all')} />
//         )}

//         {/* Notifications List */}
//         {!isLoading && !error && filteredNotifications.length > 0 && (
//           <>
//             <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
//               <div className="divide-y divide-gray-100">
//                 {paginatedNotifications.map((notification) => (
//                   <div
//                     key={notification._id}
//                     className={`p-3 sm:p-4 ${getNotificationBg(notification.type, notification.isRead)} transition-all ${
//                       selectMode ? 'pl-4 sm:pl-6' : ''
//                     } ${!notification.isRead ? 'border-l-3 sm:border-l-4 border-l-blue-500' : ''}`}
//                   >
//                     <div className="flex items-start gap-2 sm:gap-4">
//                       {/* Select checkbox */}
//                       {selectMode && (
//                         <div className="pt-1 sm:pt-2">
//                           <input
//                             type="checkbox"
//                             checked={selectedNotifications.includes(notification._id)}
//                             onChange={() => handleSelect(notification._id)}
//                             className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 rounded"
//                           />
//                         </div>
//                       )}

//                       {/* Icon */}
//                       <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
//                         notification.isRead ? 'bg-gray-100' : 'bg-gradient-to-br from-blue-50 to-indigo-50 shadow-sm'
//                       }`}>
//                         <NotificationIcon type={notification.type} isRead={notification.isRead} />
//                       </div>

//                       {/* Content */}
//                       <div className="flex-1 min-w-0">
//                         <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
//                           <div className="flex-1 min-w-0">
//                             <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
//                               <h3 className={`text-xs sm:text-sm font-semibold truncate ${
//                                 notification.isRead ? 'text-gray-700' : 'text-gray-900'
//                               }`}>
//                                 {notification.title}
//                               </h3>
//                               <NotificationBadge 
//                                 type={notification.type} 
//                                 priority={notification.priority}
//                                 isRead={notification.isRead}
//                               />
//                             </div>
                            
//                             <p className={`text-xs sm:text-sm mb-1.5 sm:mb-2 line-clamp-2 ${
//                               notification.isRead ? 'text-gray-500' : 'text-gray-600'
//                             }`}>
//                               {notification.message}
//                             </p>
                            
//                             <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] sm:text-xs">
//                               <span className="text-gray-400 flex items-center gap-0.5 sm:gap-1">
//                                 <Clock size={10} className="sm:w-3 sm:h-3" />
//                                 {formatTimeAgo(notification.createdAt)}
//                               </span>
                              
//                               {(notification.reference?.orderId || 
//                                 notification.reference?.workId || 
//                                 notification.reference?.garmentId) && (
//                                 <>
//                                   <span className="text-gray-300 hidden sm:inline">•</span>
//                                   <Link
//                                     to={getNotificationLink(notification)}
//                                     className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-0.5 sm:gap-1"
//                                     onClick={() => setShowMobileActions(false)}
//                                   >
//                                     <span className="hidden sm:inline">View Details</span>
//                                     <span className="sm:hidden">View</span>
//                                     <Eye size={10} className="sm:w-3 sm:h-3" />
//                                   </Link>
//                                 </>
//                               )}
//                             </div>
//                           </div>

//                           {/* Actions - Mobile Responsive */}
//                           {!selectMode && (
//                             <div className="flex items-center gap-1 sm:gap-2 self-end sm:self-start">
//                               {!notification.isRead && (
//                                 <button
//                                   onClick={() => handleMarkAsRead(notification._id)}
//                                   className="p-1.5 sm:p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all"
//                                   title="Mark as read"
//                                 >
//                                   <Check size={14} className="sm:w-4 sm:h-4" />
//                                 </button>
//                               )}
//                               <button
//                                 onClick={() => handleDelete(notification._id)}
//                                 className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
//                                 title="Delete"
//                               >
//                                 <Trash2 size={14} className="sm:w-4 sm:h-4" />
//                               </button>
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Pagination - Mobile Responsive */}
//             {totalPages > 1 && (
//               <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white rounded-xl shadow-sm px-3 sm:px-4 py-2 sm:py-3 border border-gray-200">
//                 <div className="flex items-center justify-center sm:justify-start gap-2">
//                   <button
//                     onClick={() => setPage(p => Math.max(1, p - 1))}
//                     disabled={page === 1}
//                     className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-all disabled:opacity-50"
//                   >
//                     <ChevronLeft size={14} className="sm:w-4 sm:h-4" />
//                   </button>
//                   <span className="text-xs sm:text-sm text-gray-600">
//                     <span className="hidden sm:inline">Page </span>
//                     {page} / {totalPages}
//                   </span>
//                   <button
//                     onClick={() => setPage(p => Math.min(totalPages, p + 1))}
//                     disabled={page === totalPages}
//                     className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-all disabled:opacity-50"
//                   >
//                     <ChevronRight size={14} className="sm:w-4 sm:h-4" />
//                   </button>
//                 </div>
                
//                 <div className="flex items-center justify-between sm:justify-end gap-2 text-xs sm:text-sm">
//                   <span className="text-gray-500 hidden sm:inline">
//                     Showing {((page - 1) * limit) + 1} - {Math.min(page * limit, filteredNotifications.length)} of {filteredNotifications.length}
//                   </span>
//                   <span className="text-gray-500 sm:hidden">
//                     {((page - 1) * limit) + 1}-{Math.min(page * limit, filteredNotifications.length)} of {filteredNotifications.length}
//                   </span>
//                   <select
//                     value={limit}
//                     onChange={handleLimitChange}
//                     className="border border-gray-200 rounded-lg px-1.5 sm:px-2 py-1 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
//                   >
//                     <option value={10}>10</option>
//                     <option value={20}>20</option>
//                     <option value={50}>50</option>
//                   </select>
//                 </div>
//               </div>
//             )}
//           </>
//         )}
//       </div>

//       {/* Scroll to Top - Mobile Responsive */}
//       {!selectMode && filteredNotifications.length > 0 && (
//         <button
//           onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
//           className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 p-2 sm:p-3 bg-blue-600 rounded-full shadow-lg hover:shadow-xl transition-all text-white z-40"
//           title="Scroll to top"
//         >
//           <ChevronLeft size={16} className="rotate-90 sm:w-5 sm:h-5" />
//         </button>
//       )}
//     </div>
//   );
// }













// Pages/notifications/NotificationsPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  Check,
  RefreshCw,
  Trash2,
  CheckCheck,
  Clock,
  Scissors,
  Briefcase,
  CheckCircle,
  Package,
  AlertCircle,
  X,
  Eye,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Mail,
  MailOpen,
  Flag,
  Search,
  Menu
} from 'lucide-react';
import {
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  fetchUnreadCount,
  selectNotifications,
  selectUnreadCount,
  selectTotalCount,
  selectNotificationsLoading,
  selectNotificationsError
} from '../../features/notification/notificationSlice';
import showToast from '../../utils/toast';

// ============================================
// 🎨 NOTIFICATION ICON COMPONENT
// ============================================
const NotificationIcon = ({ type, isRead }) => {
  const iconProps = { size: 20 };
  
  if (isRead) {
    switch(type) {
      case 'work-available': return <Package className="text-gray-400" {...iconProps} />;
      case 'work-assigned': return <Briefcase className="text-gray-400" {...iconProps} />;
      case 'work-accepted': return <CheckCircle className="text-gray-400" {...iconProps} />;
      case 'tailor-assigned': return <Scissors className="text-gray-400" {...iconProps} />;
      case 'order-ready':
      case 'order-delivered': return <CheckCircle className="text-gray-400" {...iconProps} />;
      case 'order-cancelled': return <AlertCircle className="text-gray-400" {...iconProps} />;
      case 'birthday': return <span className="text-xl opacity-50 grayscale">🎂</span>;
      default: return <Bell className="text-gray-400" {...iconProps} />;
    }
  } else {
    switch(type) {
      case 'work-available': return <Package className="text-purple-600" {...iconProps} />;
      case 'work-assigned': return <Briefcase className="text-blue-600" {...iconProps} />;
      case 'work-accepted': return <CheckCircle className="text-green-600" {...iconProps} />;
      case 'tailor-assigned': return <Scissors className="text-orange-600" {...iconProps} />;
      case 'order-ready':
      case 'order-delivered': return <CheckCircle className="text-green-600" {...iconProps} />;
      case 'order-cancelled': return <AlertCircle className="text-red-600" {...iconProps} />;
      case 'birthday': return <span className="text-xl animate-bounce">🎂</span>;
      default: return <Bell className="text-blue-600" {...iconProps} />;
    }
  }
};

// ============================================
// 🏷️ NOTIFICATION BADGE COMPONENT (MOBILE RESPONSIVE)
// ============================================
const NotificationBadge = ({ type, priority, isRead }) => {
  if (isRead) return null;
  
  return (
    <div className="flex flex-wrap gap-1 sm:gap-2">
      {priority === 'high' && (
        <span className="px-1.5 sm:px-2 py-0.5 bg-red-100 text-red-600 text-[10px] sm:text-xs rounded-full font-medium flex items-center gap-0.5 sm:gap-1">
          <Flag size={8} className="sm:w-3 sm:h-3" />
          <span className="hidden sm:inline">High Priority</span>
          <span className="sm:hidden">High</span>
        </span>
      )}
      {type === 'work-available' && (
        <span className="px-1.5 sm:px-2 py-0.5 bg-purple-100 text-purple-600 text-[10px] sm:text-xs rounded-full font-medium">
          <span className="hidden sm:inline">New Work</span>
          <span className="sm:hidden">New</span>
        </span>
      )}
      {type === 'work-assigned' && (
        <span className="px-1.5 sm:px-2 py-0.5 bg-blue-100 text-blue-600 text-[10px] sm:text-xs rounded-full font-medium">
          <span className="hidden sm:inline">Assigned</span>
          <span className="sm:hidden">Asgn</span>
        </span>
      )}
      {type === 'work-accepted' && (
        <span className="px-1.5 sm:px-2 py-0.5 bg-green-100 text-green-600 text-[10px] sm:text-xs rounded-full font-medium">
          <span className="hidden sm:inline">Accepted</span>
          <span className="sm:hidden">Acc</span>
        </span>
      )}
      {type === 'birthday' && (
        <span className="px-1.5 sm:px-2 py-0.5 bg-pink-100 text-pink-600 text-[10px] sm:text-xs rounded-full font-medium shadow-sm border border-pink-200">
          <span className="hidden sm:inline">Birthday</span>
          <span className="sm:hidden">Bday</span>
        </span>
      )}
    </div>
  );
};

// ============================================
// ⏱️ TIME FORMATTER (MOBILE FRIENDLY)
// ============================================
const formatTimeAgo = (dateString) => {
  if (!dateString) return 'Unknown';
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) {
      const mins = Math.floor(diffInSeconds / 60);
      return `${mins}m ago`;
    }
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    }
    if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d ago`;
    }
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
    
  } catch {
    return 'Invalid date';
  }
};

// ============================================
// 📄 EMPTY STATE COMPONENT (MOBILE RESPONSIVE)
// ============================================
const EmptyState = ({ filter, onViewAll }) => {
  const getIcon = () => {
    switch(filter) {
      case 'unread': return <Mail className="text-gray-300" size={40} />;
      case 'read': return <MailOpen className="text-gray-300" size={40} />;
      default: return <Inbox className="text-gray-300" size={40} />;
    }
  };

  const getMessage = () => {
    switch(filter) {
      case 'unread':
        return "You have no unread notifications.";
      case 'read':
        return "You have no read notifications.";
      default:
        return "You're all caught up! Check back later for updates.";
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-8 sm:p-16 text-center">
      <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
        {getIcon()}
      </div>
      <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">No notifications</h3>
      <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6 px-4">{getMessage()}</p>
      {filter !== 'all' && (
        <button
          onClick={onViewAll}
          className="px-4 sm:px-6 py-2 sm:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium shadow-lg shadow-blue-500/20 text-sm sm:text-base"
        >
          View All Notifications
        </button>
      )}
    </div>
  );
};

// ============================================
// 📊 STATS CARD COMPONENT (MOBILE RESPONSIVE)
// ============================================
const StatsCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 border border-gray-100">
    <div className="flex items-center gap-2 sm:gap-3">
      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-${color}-100 flex items-center justify-center flex-shrink-0`}>
        <Icon size={16} className={`text-${color}-600 sm:w-5 sm:h-5`} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 truncate">{label}</p>
        <p className="text-lg sm:text-xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  </div>
);

// ============================================
// 🎯 MAIN COMPONENT
// ============================================
export default function NotificationsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Redux state
  const allNotifications = useSelector(selectNotifications) || [];
  const unreadCount = useSelector(selectUnreadCount) || 0;
  const totalCount = useSelector(selectTotalCount) || 0;
  const loading = useSelector(selectNotificationsLoading) || false;
  const error = useSelector(selectNotificationsError) || null;
  const { user } = useSelector((state) => state.auth);

  // Local state
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [selectMode, setSelectMode] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showMobileActions, setShowMobileActions] = useState(false);

  // 🔥 FIXED: Role-based dashboard path
  const getDashboardPath = () => {
    if (!user?.role) return '/dashboard';
    
    switch(user.role) {
      case 'ADMIN':
        return '/admin/dashboard';
      case 'STORE_KEEPER':
        return '/storekeeper/dashboard';
      case 'CUTTING_MASTER':
        return '/cuttingmaster/works';
      case 'TAILOR':
        return '/tailor/dashboard';
      default:
        return '/dashboard';
    }
  };

  // Filter notifications based on current filter
  const filteredNotifications = useMemo(() => {
    let filtered = [...allNotifications];
    
    // Apply read/unread filter
    if (filter === 'unread') {
      filtered = filtered.filter(n => !n.isRead);
    } else if (filter === 'read') {
      filtered = filtered.filter(n => n.isRead);
    }
    
    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(n => 
        n.title?.toLowerCase().includes(term) ||
        n.message?.toLowerCase().includes(term) ||
        n.type?.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  }, [allNotifications, filter, searchTerm]);

  // Paginate notifications
  const paginatedNotifications = useMemo(() => {
    const start = (page - 1) * limit;
    const end = start + limit;
    return filteredNotifications.slice(start, end);
  }, [filteredNotifications, page, limit]);

  const totalPages = Math.ceil(filteredNotifications.length / limit);

  // Load notifications on mount and filter change
  useEffect(() => {
    loadNotifications();
  }, [filter, page, dispatch]);

  // Initial unread count load. No polling from here on — GlobalSocketListener
  // pushes new notifications into the same Redux state in real time and
  // re-syncs on every (re)connect, so this page updates automatically.
  useEffect(() => {
    dispatch(fetchUnreadCount());
  }, [dispatch]);

  const loadNotifications = async (silent = false) => {
    if (!silent) setRefreshing(true);
    
    try {
      const params = {
        page,
        limit: 50,
        ...(filter !== 'all' && { unreadOnly: filter === 'unread' ? 'true' : 'false' })
      };
      
      await dispatch(fetchNotifications(params)).unwrap();
      
    } catch (err) {
      if (!silent) showToast.error(err || 'Failed to load notifications');
    } finally {
      if (!silent) setRefreshing(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await dispatch(markAsRead(id)).unwrap();
      showToast.success('Marked as read');
      dispatch(fetchUnreadCount());
    } catch (error) {
      showToast.error(error || 'Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) {
      showToast.info('No unread notifications');
      return;
    }
    
    if (window.confirm(`Mark all ${unreadCount} notifications as read?`)) {
      try {
        await dispatch(markAllAsRead()).unwrap();
        showToast.success('All notifications marked as read');
        dispatch(fetchUnreadCount());
        setShowMobileActions(false);
      } catch (error) {
        showToast.error(error || 'Failed to mark all as read');
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this notification?')) {
      try {
        await dispatch(deleteNotification(id)).unwrap();
        showToast.success('Notification deleted');
        dispatch(fetchUnreadCount());
      } catch (error) {
        showToast.error(error || 'Failed to delete notification');
      }
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedNotifications.length === 0) return;
    
    if (window.confirm(`Delete ${selectedNotifications.length} notifications?`)) {
      try {
        await Promise.all(selectedNotifications.map(id => 
          dispatch(deleteNotification(id)).unwrap()
        ));
        showToast.success(`${selectedNotifications.length} notifications deleted`);
        setSelectedNotifications([]);
        setSelectMode(false);
        dispatch(fetchUnreadCount());
        setShowMobileActions(false);
      } catch (error) {
        showToast.error(error || 'Failed to delete notifications');
      }
    }
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === paginatedNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(paginatedNotifications.map(n => n._id));
    }
  };

  const handleSelect = (id) => {
    setSelectedNotifications(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const handleRefresh = () => {
    loadNotifications();
    dispatch(fetchUnreadCount());
    showToast.success('Notifications refreshed');
    setShowMobileActions(false);
  };

  // 🔥 FIXED: Back button navigates to role-based dashboard
  const handleBack = () => {
    navigate(getDashboardPath());
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setPage(1);
    setSelectedNotifications([]);
    setSelectMode(false);
    setShowMobileActions(false);
  };

  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    setPage(1);
  };

  // 🔥 FIXED: getNotificationLink with proper ID extraction
  const getNotificationLink = (notification) => {
    const dashboardPath = getDashboardPath().replace('/dashboard', '');
    
    // Check if reference exists
    const ref = notification.reference || {};

    // 🔥 Extract only the ID string if it's an object
    const workId = ref.workId?._id || ref.workId;
    const orderId = ref.orderId?._id || ref.orderId;
    const garmentId = ref.garmentId?._id || ref.garmentId;

    if (workId && typeof workId === 'string') {
      return `${dashboardPath}/works/${workId}`;
    }
    if (orderId && typeof orderId === 'string') {
      return `${dashboardPath}/orders/${orderId}`;
    }
    if (garmentId && typeof garmentId === 'string') {
      return `${dashboardPath}/garments/${garmentId}`;
    }
    
    return '#';
  };

  const getNotificationBg = (type, isRead) => {
    if (isRead) return 'bg-white hover:bg-gray-50';
    
    switch(type) {
      case 'work-available': return 'bg-purple-50 hover:bg-purple-100';
      case 'work-assigned': return 'bg-blue-50 hover:bg-blue-100';
      case 'work-accepted': return 'bg-green-50 hover:bg-green-100';
      case 'tailor-assigned': return 'bg-orange-50 hover:bg-orange-100';
      case 'order-cancelled': return 'bg-red-50 hover:bg-red-100';
      case 'birthday': return 'bg-pink-50 hover:bg-pink-100 border-pink-100';
      default: return 'bg-gray-50 hover:bg-gray-100';
    }
  };

  const isLoading = loading || refreshing;

  // Calculate stats
  const stats = {
    total: totalCount,
    unread: unreadCount,
    read: Math.max(0, totalCount - unreadCount)
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header - Mobile Responsive */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
          
          {/* Top Row - Mobile Responsive */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              {/* 🔥 FIXED: Back button now goes to role-based dashboard */}
              <button
                onClick={handleBack}
                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-all flex-shrink-0"
                title="Back to Dashboard"
              >
                <ArrowLeft size={18} className="text-gray-600 sm:w-5 sm:h-5" />
              </button>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold text-gray-800 truncate">Notifications</h1>
                <p className="text-xs sm:text-sm text-gray-500 truncate">
                  {totalCount} notification{totalCount !== 1 ? 's' : ''}
                  {filter !== 'all' && ` (${filter})`}
                </p>
              </div>
            </div>

            {/* Desktop Actions - Hidden on Mobile */}
            <div className="hidden sm:flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-64 bg-white text-sm"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Actions */}
              <button
                onClick={() => setSelectMode(!selectMode)}
                className={`p-2 rounded-lg transition-all ${
                  selectMode ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <CheckCheck size={20} />
              </button>

              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all disabled:opacity-50"
              >
                <RefreshCw size={20} className={isLoading ? 'animate-spin text-blue-600' : 'text-gray-600'} />
              </button>

              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2 text-sm font-medium shadow-lg"
                >
                  <CheckCheck size={18} />
                  Mark Read ({unreadCount})
                </button>
              )}

              {selectMode && selectedNotifications.length > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all flex items-center gap-2 text-sm font-medium shadow-lg"
                >
                  <Trash2 size={18} />
                  Delete ({selectedNotifications.length})
                </button>
              )}
            </div>

            {/* Mobile Actions Menu */}
            <div className="sm:hidden">
              <button
                onClick={() => setShowMobileActions(!showMobileActions)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <Menu size={20} className="text-gray-600" />
              </button>
              
              {showMobileActions && (
                <div className="absolute right-3 top-14 mt-1 w-56 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                  <div className="p-2 space-y-1">
                    {/* Mobile Search Toggle */}
                    <button
                      onClick={() => {
                        setShowMobileSearch(true);
                        setShowMobileActions(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-lg text-gray-700 font-medium flex items-center gap-2 text-sm"
                    >
                      <Search size={16} />
                      Search
                    </button>

                    {/* Mobile Select Mode */}
                    <button
                      onClick={() => {
                        setSelectMode(!selectMode);
                        setShowMobileActions(false);
                      }}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 rounded-lg flex items-center gap-2 text-sm ${
                        selectMode ? 'text-blue-600 font-medium' : 'text-gray-700'
                      }`}
                    >
                      <CheckCheck size={16} />
                      {selectMode ? 'Exit Select Mode' : 'Select Multiple'}
                    </button>

                    {/* Mobile Refresh */}
                    <button
                      onClick={handleRefresh}
                      disabled={isLoading}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-lg text-gray-700 font-medium flex items-center gap-2 text-sm disabled:opacity-50"
                    >
                      <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                      Refresh
                    </button>

                    {/* Mobile Mark All Read */}
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 rounded-lg text-blue-600 font-medium flex items-center gap-2 text-sm"
                      >
                        <CheckCheck size={16} />
                        Mark All Read ({unreadCount})
                      </button>
                    )}

                    {/* Mobile Delete Selected */}
                    {selectMode && selectedNotifications.length > 0 && (
                      <button
                        onClick={handleDeleteSelected}
                        className="w-full text-left px-4 py-3 hover:bg-red-50 rounded-lg text-red-600 font-medium flex items-center gap-2 text-sm"
                      >
                        <Trash2 size={16} />
                        Delete ({selectedNotifications.length})
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Search Bar */}
          {showMobileSearch && (
            <div className="sm:hidden mt-3 relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
                autoFocus
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
              <button
                onClick={() => setShowMobileSearch(false)}
                className="absolute right-10 top-2.5 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Stats - Mobile Responsive Grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-4 sm:mt-6">
            <StatsCard icon={Inbox} label="Total" value={stats.total} color="blue" />
            <StatsCard icon={Mail} label="Unread" value={stats.unread} color="green" />
            <StatsCard icon={MailOpen} label="Read" value={stats.read} color="gray" />
          </div>

          {/* Filter Tabs - Scrollable on Mobile */}
          <div className="bg-white py-2 sm:py-3 mt-2 border-t border-gray-100 overflow-x-auto">
            <div className="flex items-center gap-1 sm:gap-2 min-w-max sm:min-w-0">
              <button
                onClick={() => handleFilterChange('all')}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium text-xs sm:text-sm transition-all whitespace-nowrap ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All ({stats.total})
              </button>
              <button
                onClick={() => handleFilterChange('unread')}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium text-xs sm:text-sm transition-all whitespace-nowrap ${
                  filter === 'unread'
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Unread ({stats.unread})
              </button>
              <button
                onClick={() => handleFilterChange('read')}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium text-xs sm:text-sm transition-all whitespace-nowrap ${
                  filter === 'read'
                    ? 'bg-gray-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Read ({stats.read})
              </button>
            </div>
          </div>

          {/* Select Mode - Mobile Responsive */}
          {selectMode && paginatedNotifications.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-2 sm:p-3 mt-2 border border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-2 sm:gap-4">
                  <label className="flex items-center gap-1.5 sm:gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedNotifications.length === paginatedNotifications.length}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-xs sm:text-sm font-medium text-gray-700">
                      {selectedNotifications.length === paginatedNotifications.length
                        ? 'Deselect all'
                        : 'Select all'
                      }
                    </span>
                  </label>
                  <span className="text-xs sm:text-sm text-gray-500">
                    {selectedNotifications.length} selected
                  </span>
                </div>
                <button
                  onClick={() => {
                    setSelectMode(false);
                    setSelectedNotifications([]);
                  }}
                  className="text-xs sm:text-sm text-gray-500 hover:text-gray-700 font-medium self-end sm:self-auto"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content - Mobile Responsive */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Loading */}
        {isLoading && paginatedNotifications.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-8 sm:p-12 text-center">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-2 border-blue-600 border-t-transparent mx-auto"></div>
            <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-600">Loading notifications...</p>
          </div>
        )}

        {/* Error */}
        {error && !isLoading && (
          <div className="bg-white rounded-xl shadow-sm p-8 sm:p-12 text-center">
            <AlertCircle size={36} className="text-red-400 mx-auto mb-3 sm:w-12 sm:h-12" />
            <h3 className="text-base sm:text-lg font-bold text-red-600 mb-2">Failed to load notifications</h3>
            <p className="text-sm sm:text-base text-gray-500 mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              className="px-4 sm:px-6 py-2 sm:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm sm:text-base"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !error && filteredNotifications.length === 0 && (
          <EmptyState filter={filter} onViewAll={() => handleFilterChange('all')} />
        )}

        {/* Notifications List */}
        {!isLoading && !error && filteredNotifications.length > 0 && (
          <>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
              <div className="divide-y divide-gray-100">
                {paginatedNotifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-3 sm:p-4 ${getNotificationBg(notification.type, notification.isRead)} transition-all ${
                      selectMode ? 'pl-4 sm:pl-6' : ''
                    } ${!notification.isRead ? 'border-l-3 sm:border-l-4 border-l-blue-500' : ''}`}
                  >
                    <div className="flex items-start gap-2 sm:gap-4">
                      {/* Select checkbox */}
                      {selectMode && (
                        <div className="pt-1 sm:pt-2">
                          <input
                            type="checkbox"
                            checked={selectedNotifications.includes(notification._id)}
                            onChange={() => handleSelect(notification._id)}
                            className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 rounded"
                          />
                        </div>
                      )}

                      {/* Icon */}
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        notification.isRead ? 'bg-gray-100' : 'bg-gradient-to-br from-blue-50 to-indigo-50 shadow-sm'
                      }`}>
                        <NotificationIcon type={notification.type} isRead={notification.isRead} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                              <h3 className={`text-xs sm:text-sm font-semibold truncate ${
                                notification.isRead ? 'text-gray-700' : 'text-gray-900'
                              }`}>
                                {notification.title}
                              </h3>
                              <NotificationBadge 
                                type={notification.type} 
                                priority={notification.priority}
                                isRead={notification.isRead}
                              />
                            </div>
                            
                            <p className={`text-xs sm:text-sm mb-1.5 sm:mb-2 line-clamp-2 ${
                              notification.isRead ? 'text-gray-500' : 'text-gray-600'
                            }`}>
                              {notification.message}
                            </p>
                            
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] sm:text-xs">
                              <span className="text-gray-400 flex items-center gap-0.5 sm:gap-1">
                                <Clock size={10} className="sm:w-3 sm:h-3" />
                                {formatTimeAgo(notification.createdAt)}
                              </span>
                              
                              {(notification.reference?.orderId || 
                                notification.reference?.workId || 
                                notification.reference?.garmentId) && (
                                <>
                                  <span className="text-gray-300 hidden sm:inline">•</span>
                                  <Link
                                    to={getNotificationLink(notification)}
                                    className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-0.5 sm:gap-1"
                                    onClick={() => setShowMobileActions(false)}
                                  >
                                    <span className="hidden sm:inline">View Details</span>
                                    <span className="sm:hidden">View</span>
                                    <Eye size={10} className="sm:w-3 sm:h-3" />
                                  </Link>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Actions - Mobile Responsive */}
                          {!selectMode && (
                            <div className="flex items-center gap-1 sm:gap-2 self-end sm:self-start">
                              {!notification.isRead && (
                                <button
                                  onClick={() => handleMarkAsRead(notification._id)}
                                  className="p-1.5 sm:p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                  title="Mark as read"
                                >
                                  <Check size={14} className="sm:w-4 sm:h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(notification._id)}
                                className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                title="Delete"
                              >
                                <Trash2 size={14} className="sm:w-4 sm:h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination - Mobile Responsive */}
            {totalPages > 1 && (
              <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white rounded-xl shadow-sm px-3 sm:px-4 py-2 sm:py-3 border border-gray-200">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-all disabled:opacity-50"
                  >
                    <ChevronLeft size={14} className="sm:w-4 sm:h-4" />
                  </button>
                  <span className="text-xs sm:text-sm text-gray-600">
                    <span className="hidden sm:inline">Page </span>
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-all disabled:opacity-50"
                  >
                    <ChevronRight size={14} className="sm:w-4 sm:h-4" />
                  </button>
                </div>
                
                <div className="flex items-center justify-between sm:justify-end gap-2 text-xs sm:text-sm">
                  <span className="text-gray-500 hidden sm:inline">
                    Showing {((page - 1) * limit) + 1} - {Math.min(page * limit, filteredNotifications.length)} of {filteredNotifications.length}
                  </span>
                  <span className="text-gray-500 sm:hidden">
                    {((page - 1) * limit) + 1}-{Math.min(page * limit, filteredNotifications.length)} of {filteredNotifications.length}
                  </span>
                  <select
                    value={limit}
                    onChange={handleLimitChange}
                    className="border border-gray-200 rounded-lg px-1.5 sm:px-2 py-1 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Scroll to Top - Mobile Responsive */}
      {!selectMode && filteredNotifications.length > 0 && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 p-2 sm:p-3 bg-blue-600 rounded-full shadow-lg hover:shadow-xl transition-all text-white z-40"
          title="Scroll to top"
        >
          <ChevronLeft size={16} className="rotate-90 sm:w-5 sm:h-5" />
        </button>
      )}
    </div>
  );
}