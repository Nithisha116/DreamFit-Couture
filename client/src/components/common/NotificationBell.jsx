// import React, { useEffect, useState, useCallback, useRef } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// import { Bell, Bug, RefreshCw } from 'lucide-react';
// import {
//   fetchNotifications,
//   markAllAsRead,
//   resetNotifications,
//   selectNotifications,
//   selectUnreadCount,
//   selectNotificationsLoading,
//   selectNotificationsError
// } from '../../features/notification/notificationSlice';

// // ============================================
// // 🔍 DEBUG PANEL COMPONENT
// // ============================================
// const DebugBadge = ({ showDebug, setShowDebug, debugInfo }) => {
//   if (process.env.NODE_ENV !== 'development') return null;
  
//   return (
//     <div className="absolute -bottom-12 right-0 z-50">
//       <button
//         onClick={() => setShowDebug(!showDebug)}
//         className="flex items-center gap-1 px-2 py-1 bg-gray-800 text-gray-300 rounded-lg text-xs"
//       >
//         <Bug size={12} />
//         Debug
//       </button>
      
//       {showDebug && (
//         <div className="absolute top-6 right-0 mt-1 w-64 bg-gray-900 text-green-400 p-3 rounded-xl font-mono text-xs border border-green-500/30 z-50">
//           <div className="flex justify-between items-center mb-2">
//             <span className="font-bold text-yellow-400">🔍 NOTIFICATION DEBUG</span>
//           </div>
//           <div className="space-y-1">
//             <div className="flex justify-between">
//               <span>User ID:</span>
//               <span className="text-blue-400">{debugInfo.userId?.substring(0,8)}...</span>
//             </div>
//             <div className="flex justify-between">
//               <span>Unread Count:</span>
//               <span className="text-green-400 font-bold">{debugInfo.unreadCount}</span>
//             </div>
//             <div className="flex justify-between">
//               <span>Loading:</span>
//               <span className={debugInfo.loading ? 'text-yellow-400' : 'text-green-400'}>{debugInfo.loading ? 'Yes' : 'No'}</span>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // ============================================
// // ✅ MAIN NOTIFICATION BELL COMPONENT
// // ============================================
// export default function NotificationBell() {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const [showDebug, setShowDebug] = useState(false);
//   const [lastFetchTime, setLastFetchTime] = useState(null);
//   const [manualRefresh, setManualRefresh] = useState(false);
//   const [isHovering, setIsHovering] = useState(false);
  
//   const isMounted = useRef(true);
//   const isFetching = useRef(false);

//   const { user } = useSelector((state) => state.auth);
//   const userId = user?._id || user?.id;
  
//   const notifications = useSelector(selectNotifications) || [];
//   const unreadCount = useSelector(selectUnreadCount) || 0;
//   const loading = useSelector(selectNotificationsLoading) || false;
//   const error = useSelector(selectNotificationsError) || null;

//   const basePath = user?.role === "ADMIN" ? "/admin" : 
//                    user?.role === "STORE_KEEPER" ? "/storekeeper" : 
//                    "/cuttingmaster";

//   // 🔥 FIX 1: Only call fetchNotifications. 
//   // fetchNotifications.fulfilled in your slice should already update the count.
//   const fetchNotificationData = useCallback(async () => {
//     if (isFetching.current || !userId) return;

//     try {
//       isFetching.current = true;
//       setManualRefresh(true);
      
//       console.log("📥 Fetching notifications for user:", userId);
      
//       // We only call fetchNotifications to avoid state flickering between 0 and 8
//       await dispatch(fetchNotifications()).unwrap();
      
//       if (isMounted.current) {
//         setLastFetchTime(new Date().toLocaleTimeString());
//       }
//     } catch (err) {
//       console.error("❌ Error fetching notifications:", err);
//     } finally {
//       if (isMounted.current) {
//         setManualRefresh(false);
//       }
//       isFetching.current = false;
//     }
//   }, [dispatch, userId]);

//   useEffect(() => {
//     isMounted.current = true;
//     if (userId) {
//       fetchNotificationData();
//     } else {
//       dispatch(resetNotifications());
//     }
//     return () => { isMounted.current = false; };
//   }, [userId, dispatch, fetchNotificationData]);

//   useEffect(() => {
//     if (!userId) return;
//     const interval = setInterval(() => {
//       fetchNotificationData();
//     }, 30000);
//     return () => clearInterval(interval);
//   }, [userId, fetchNotificationData]);

//   const handleMarkAllAsRead = useCallback(async (e) => {
//     e.stopPropagation();
//     e.preventDefault();
//     if (unreadCount === 0) return;
    
//     try {
//       await dispatch(markAllAsRead()).unwrap();
//       console.log("✅ All notifications marked as read");
//     } catch (err) {
//       console.error("❌ Error marking all as read:", err);
//     }
//   }, [dispatch, unreadCount]);

//   const handleManualRefresh = useCallback((e) => {
//     e.stopPropagation();
//     fetchNotificationData();
//   }, [fetchNotificationData]);

//   const handleClick = useCallback(() => {
//     navigate(`${basePath}/notifications`);
//   }, [navigate, basePath]);

//   const isLoading = loading || manualRefresh;

//   return (
//     <div className="relative inline-flex items-center">
//       {/* 🔥 FIX 2: Outer wrapper is a DIV, not a button, to avoid nesting errors */}
//       <div
//         onClick={handleClick}
//         onMouseEnter={() => setIsHovering(true)}
//         onMouseLeave={() => setIsHovering(false)}
//         className="relative p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all group cursor-pointer"
//       >
//         <Bell size={20} className={isLoading ? 'animate-pulse' : ''} />
        
//         {unreadCount > 0 && (
//           <span className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full px-1.5 border-2 border-white animate-in zoom-in duration-300">
//             {unreadCount > 99 ? '99+' : unreadCount}
//           </span>
//         )}

//         {/* Hover Dropdown */}
//         {isHovering && unreadCount > 0 && (
//           <div className="absolute top-full right-0 mt-2 bg-white shadow-xl rounded-lg py-2 px-3 text-xs whitespace-nowrap border border-slate-200 z-[100]">
//             <div className="flex items-center gap-3">
//               <span className="text-slate-700 font-semibold">{unreadCount} unread</span>
//               <button
//                 onClick={handleMarkAllAsRead}
//                 className="text-blue-600 hover:text-blue-700 text-[10px] font-bold bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-colors"
//               >
//                 Mark all read
//               </button>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Manual Refresh (Development Only) */}
//       {process.env.NODE_ENV === 'development' && (
//         <button
//           onClick={handleManualRefresh}
//           className="ml-1 p-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-slate-500 transition-colors"
//           title="Manual Refresh"
//         >
//           <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
//         </button>
//       )}

//       <DebugBadge 
//         showDebug={showDebug} 
//         setShowDebug={setShowDebug} 
//         debugInfo={{ userId, unreadCount, loading, lastFetchTime }}
//       />
//     </div>
//   );
// }







import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Bell, RefreshCw } from 'lucide-react';
import {
  fetchNotifications,
  markAllAsRead,
  resetNotifications,
  selectNotifications,
  selectUnreadCount,
  selectNotificationsLoading,
  selectNotificationsError
} from '../../features/notification/notificationSlice';

// ============================================
// ✅ MAIN NOTIFICATION BELL COMPONENT
// ============================================
export default function NotificationBell() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [lastFetchTime, setLastFetchTime] = useState(null);
  const [manualRefresh, setManualRefresh] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  
  const isMounted = useRef(true);
  const isFetching = useRef(false);
  const menuRef = useRef(null);

  const { user } = useSelector((state) => state.auth);
  const userId = user?._id || user?.id;
  
  const notifications = useSelector(selectNotifications) || [];
  const unreadCount = useSelector(selectUnreadCount) || 0;
  const loading = useSelector(selectNotificationsLoading) || false;
  const error = useSelector(selectNotificationsError) || null;

  const basePath = user?.role === "ADMIN" ? "/admin" : 
                   user?.role === "STORE_KEEPER" ? "/storekeeper" : 
                   "/cuttingmaster";

  // Fetch notification data
  const fetchNotificationData = useCallback(async () => {
    if (isFetching.current || !userId) return;

    try {
      isFetching.current = true;
      setManualRefresh(true);
      
      console.log("📥 Fetching notifications for user:", userId);
      
      await dispatch(fetchNotifications()).unwrap();
      
      if (isMounted.current) {
        setLastFetchTime(new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.error("❌ Error fetching notifications:", err);
    } finally {
      if (isMounted.current) {
        setManualRefresh(false);
      }
      isFetching.current = false;
    }
  }, [dispatch, userId]);

  // Initial fetch
  useEffect(() => {
    isMounted.current = true;
    if (userId) {
      fetchNotificationData();
    } else {
      dispatch(resetNotifications());
    }
    return () => { isMounted.current = false; };
  }, [userId, dispatch, fetchNotificationData]);

  // No periodic polling — GlobalSocketListener pushes new notifications into
  // this same Redux state in real time via the notification:new socket event,
  // and re-syncs on every (re)connect. This selector-driven bell updates
  // automatically whenever that state changes.

  // Mark all as read
  const handleMarkAllAsRead = useCallback(async (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (unreadCount === 0) return;
    
    try {
      await dispatch(markAllAsRead()).unwrap();
      console.log("✅ All notifications marked as read");
    } catch (err) {
      console.error("❌ Error marking all as read:", err);
    }
  }, [dispatch, unreadCount]);

  // Manual refresh
  const handleManualRefresh = useCallback((e) => {
    e.stopPropagation();
    fetchNotificationData();
  }, [fetchNotificationData]);

  // Navigate to notifications page
  const handleClick = useCallback(() => {
    navigate(`${basePath}/notifications`);
  }, [navigate, basePath]);

  const isLoading = loading || manualRefresh;

  return (
    <div className="relative inline-flex items-center">
      {/* 🔥 FIXED: Flex container for perfect alignment */}
      <div className="flex items-center gap-1">
        {/* Main Bell Icon */}
        <div
          onClick={handleClick}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          className="relative p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all group cursor-pointer"
        >
          <Bell size={20} className={isLoading ? 'animate-pulse' : ''} />
          
          {/* Unread Count Badge */}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full px-1.5 border-2 border-white animate-in zoom-in duration-300">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>

        {/* 🔥 Refresh button - Always visible, perfectly centered */}
        <button
          onClick={handleManualRefresh}
          disabled={isLoading}
          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all flex items-center justify-center"
          title="Refresh notifications"
          aria-label="Refresh notifications"
        >
          <RefreshCw 
            size={18} 
            className={isLoading ? 'animate-spin text-blue-600' : ''} 
          />
        </button>
      </div>

      {/* Desktop Hover Dropdown - Only shows on desktop hover */}
      {isHovering && unreadCount > 0 && (
        <div className="absolute top-full right-0 mt-2 bg-white shadow-xl rounded-lg py-2 px-3 text-xs whitespace-nowrap border border-slate-200 z-[100] hidden sm:block">
          <div className="flex items-center gap-3">
            <span className="text-slate-700 font-semibold">{unreadCount} unread</span>
            <button
              onClick={handleMarkAllAsRead}
              className="text-blue-600 hover:text-blue-700 text-[10px] font-bold bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-colors"
            >
              Mark all read
            </button>
          </div>
        </div>
      )}
    </div>
  );
}