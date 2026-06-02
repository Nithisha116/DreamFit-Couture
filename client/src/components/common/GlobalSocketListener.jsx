import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getSocket } from '../../utils/socket';
import { fetchOrders, fetchOrderStats, fetchDashboardData, fetchReadyToDeliveryOrders } from '../../features/order/orderSlice';
import { fetchWorkflowJobs } from '../../features/work/workSlice';
import { addNotification } from '../../features/notification/notificationSlice';
import showToast from '../../utils/toast';

const GlobalSocketListener = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const socket = getSocket();

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
      if (user && data.recipient === currentUserId) {
        dispatch(addNotification(data));
        showToast.success(data.message);
      }
    };

    socket.on('workflow:updated', handleWorkflowUpdated);
    socket.on('notification:new', handleNewNotification);

    return () => {
      socket.off('workflow:updated', handleWorkflowUpdated);
      socket.off('notification:new', handleNewNotification);
    };
  }, [dispatch, user]);

  return null; // This component doesn't render anything
};

export default GlobalSocketListener;
