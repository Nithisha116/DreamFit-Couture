import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { WORKFLOW_CHANGED_EVENT } from "../workflow/workflowConstants";
import {
  fetchOrdersPipeline,
  selectOrdersPipeline,
  selectOrdersPipelineLoading,
} from "../features/work/workSlice";

/**
 * Order-level Delivery Pipeline: MongoDB via GET /api/workflow/orders-pipeline
 * (Redux cache). One entry per Order, refreshed on workflow changes.
 */
export function useOrdersPipeline() {
  const dispatch = useDispatch();
  const orders = useSelector(selectOrdersPipeline);
  const loading = useSelector(selectOrdersPipelineLoading);

  const refresh = useCallback(async () => {
    try {
      await dispatch(fetchOrdersPipeline()).unwrap();
    } catch {
      /* keep last Redux state when API unavailable */
    }
  }, [dispatch]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onChange = () => {
      dispatch(fetchOrdersPipeline());
    };
    window.addEventListener(WORKFLOW_CHANGED_EVENT, onChange);
    return () => window.removeEventListener(WORKFLOW_CHANGED_EVENT, onChange);
  }, [dispatch]);

  return { orders, refresh, loading };
}

export default useOrdersPipeline;
