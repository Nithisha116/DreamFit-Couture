import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getSocket } from '../../utils/socket';
import { fetchOrders, fetchOrderStats, fetchDashboardData, fetchReadyToDeliveryOrders } from '../../features/order/orderSlice';
import { selectWorkflowJobPatch, selectWorkflowScanInFlight } from '../../features/work/workSlice';
import { store } from '../../app/store';
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

        // workflow:updated is broadcast to every client, including the one that
        // just completed the stage. That client already holds the updated job
        // from the scan response (patched in via workflowJobUpserted), so this
        // is an echo of its own change — skip it rather than refetch every
        // active work. Compared by resulting stage, not by a timer: an update
        // from another user/device lands on a different stage and still
        // refreshes normally.
        const state = store.getState();
        const patch = selectWorkflowJobPatch(state, data?.workId);
        const isOwnEcho =
          // Still awaiting our own scan's response (the server emits before it
          // replies, so this is the usual case), or already patched in.
          selectWorkflowScanInFlight(state, data?.workId) ||
          (!!patch &&
            (patch.job?.currentStageKey === data?.currentStage ||
              (data?.currentStage === 'completed' &&
                patch.job?.lifecycleStatus === 'completed')));

        if (!isOwnEcho) {
          // One path only: useWorkflowJobs listens for this and refetches the
          // jobs list, and WorkflowScanPage reloads its own view. Dispatching
          // fetchWorkflowJobs() here as well used to double every refresh.
          window.dispatchEvent(new CustomEvent("dreamfit-workflow-changed"));
        }

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
