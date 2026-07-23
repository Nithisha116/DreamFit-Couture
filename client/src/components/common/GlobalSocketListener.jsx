import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getSocket } from '../../utils/socket';
import { fetchOrders, fetchOrderStats, fetchDashboardData, fetchReadyToDeliveryOrders } from '../../features/order/orderSlice';
import { fetchWorkflowJobs } from '../../features/work/workSlice';
import { addNotification, fetchNotifications, fetchUnreadCount } from '../../features/notification/notificationSlice';
import showToast from '../../utils/toast';

const GlobalSocketListener = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const socket = getSocket();

    // Event-driven updates only — no polling. This fires on the initial
    // connection (covers "initial page load") and again on every reconnect
    // (covers "reconnection synchronization"), fetching whatever might have
    // been missed while offline instead of re-querying on a timer.
    const handleConnect = () => {
      if (!user) return;
      console.log('📡 [WebSocket] connected — syncing notifications');
      dispatch(fetchNotifications());
      dispatch(fetchUnreadCount());
    };

    const handleWorkflowUpdated = (data) => {
      console.log('📡 [WebSocket] workflow:updated received:', data);
      
      // If the user is logged in, silently refresh Redux states
      if (user) {
        // Refresh orders list silently
        dispatch(fetchOrders({ page: 1, limit: 10 }));
        
        // Refresh order stats (updates the badges & metrics)
        dispatch(fetchOrderStats());
        
        // Refresh dashboard statistics
        dispatch(fetchDashboardData());
        
        // Refresh Tasks list for the admin / storekeeper jobs view
        dispatch(fetchWorkflowJobs());
        
        // Trigger local storage refresh for workflow jobs
        window.dispatchEvent(new Event("dreamfit-workflow-refresh"));
        window.dispatchEvent(new Event("dreamfit-workflow-changed"));
        
        // If it was packed/ready, refresh the Ready to Deliver list
        if (data.currentStage === 'completed' || data.status === 'ready-to-deliver') {
          dispatch(fetchReadyToDeliveryOrders());
        }
      }
    };


    const handleNewNotification = (data) => {
      console.log('📡 [WebSocket] notification:new received:', data);
      const currentUserId = user?._id || user?.id;
      // Compare as strings — recipient arrives as a serialized ObjectId hex
      // string over the socket, and currentUserId may come from either shape.
      if (user && currentUserId && String(data.recipient) === String(currentUserId)) {
        dispatch(addNotification(data));
        showToast.success(data.message);
      }
    };

    socket.on('connect', handleConnect);
    socket.on('workflow:updated', handleWorkflowUpdated);
    socket.on('notification:new', handleNewNotification);

    // The socket may already be connected by the time this effect runs
    // (e.g. it was created earlier by another mount of this listener).
    if (socket.connected) handleConnect();

    return () => {
      socket.off('connect', handleConnect);
      socket.off('workflow:updated', handleWorkflowUpdated);
      socket.off('notification:new', handleNewNotification);
    };
  }, [dispatch, user]);

  return null; // This component doesn't render anything
};

export default GlobalSocketListener;
