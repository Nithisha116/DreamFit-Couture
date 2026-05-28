import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { WORKFLOW_CHANGED_EVENT } from "../workflow/workflowConstants";
import { fetchWorkflowJobs } from "../features/work/workSlice";
import { loadWorkflowJobs, upsertWorkflowJob } from "../workflow/workflowStorage";

/**
 * Workflow jobs: localStorage is the live SSOT for QR/assign/advance.
 * API jobs are merged into localStorage on refresh (no wipe of local progress).
 */
export function useWorkflowJobs() {
  const dispatch = useDispatch();
  const apiLoading = useSelector((state) => state.work?.workflowJobsLoading);
  const [jobs, setJobs] = useState(() => loadWorkflowJobs());
  const [version, setVersion] = useState(0);

  const reloadFromStorage = useCallback(() => {
    const next = loadWorkflowJobs();
    setJobs(next);
    setVersion((v) => v + 1);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const apiJobs = await dispatch(fetchWorkflowJobs()).unwrap();
      if (Array.isArray(apiJobs)) {
        for (const raw of apiJobs) {
          upsertWorkflowJob(raw);
        }
      }
    } catch {
      /* keep local jobs when API unavailable */
    }
    reloadFromStorage();
  }, [dispatch, reloadFromStorage]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
  const onChange = () => reloadFromStorage();

  window.addEventListener(WORKFLOW_CHANGED_EVENT, onChange);

  // Sync updates across tabs/windows
  window.addEventListener("storage", onChange);

  return () => {
    window.removeEventListener(WORKFLOW_CHANGED_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}, [reloadFromStorage]);

  return { jobs, refresh, loading: apiLoading, version };
}

export default useWorkflowJobs;
