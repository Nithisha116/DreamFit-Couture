import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchWorkflowJobs,
  selectWorkflowJobs,
  selectWorkflowJobsLoading,
} from "../features/work/workSlice";

/**
 * Reactive workflow job list — backed by Redux + backend API.
 * Replaces the old localStorage-based engine with a single fetch from
 * GET /api/workflow/jobs which synthesises jobs server-side.
 */
export function useWorkflowJobs() {
  const dispatch = useDispatch();
  const jobs = useSelector(selectWorkflowJobs);
  const loading = useSelector(selectWorkflowJobsLoading);

  useEffect(() => {
    dispatch(fetchWorkflowJobs());
  }, [dispatch]);

  const refresh = useCallback(() => {
    dispatch(fetchWorkflowJobs());
  }, [dispatch]);

  return { jobs, refresh, loading };
}

export default useWorkflowJobs;
