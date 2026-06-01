import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { WORKFLOW_CHANGED_EVENT, WORKFLOW_LS_KEY } from "../workflow/workflowConstants";
import {
  fetchWorkflowJobs,
  selectWorkflowJobs,
  selectWorkflowJobsLoading,
} from "../features/work/workSlice";
import { emitWorkflowChanged } from "../workflow/workflowStorage";

/**
 * Workflow jobs: MongoDB via GET /api/workflow/jobs (Redux cache).
 * Stage advances and assignments persist through workflow API routes.
 */
export function useWorkflowJobs() {
  const dispatch = useDispatch();
  const jobs = useSelector(selectWorkflowJobs);
  const loading = useSelector(selectWorkflowJobsLoading);

  const refresh = useCallback(async () => {
    try {
      await dispatch(fetchWorkflowJobs()).unwrap();
    } catch {
      /* keep last Redux state when API unavailable */
    }
  }, [dispatch]);

  useEffect(() => {
    try {
      localStorage.removeItem(WORKFLOW_LS_KEY);
      localStorage.removeItem("dreamfit_boutique_tasks_v1");
    } catch {
      /* ignore */
    }
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onChange = () => {
      dispatch(fetchWorkflowJobs());
    };
    window.addEventListener(WORKFLOW_CHANGED_EVENT, onChange);
    return () => window.removeEventListener(WORKFLOW_CHANGED_EVENT, onChange);
  }, [dispatch]);

  return { jobs, refresh, loading, version: jobs.length };
}

export default useWorkflowJobs;
