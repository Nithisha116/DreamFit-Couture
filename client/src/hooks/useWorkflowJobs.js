import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { WORKFLOW_CHANGED_EVENT } from "../workflow/workflowConstants";
import { fetchWorkflowJobs } from "../features/work/workSlice";
import { loadWorkflowJobs, upsertWorkflowJob } from "../workflow/workflowStorage";

/**
 * Workflow jobs: localStorage is the live SSOT for QR/assign/advance.
 * API jobs are merged into localStorage on refresh (no wipe of local progress).
 *
 * ✅ KEY FIX: We track a "suppressUntil" timestamp.  When the user clicks
 * "Finish Stage", advanceStageByTrackingId() writes to localStorage and
 * immediately fires WORKFLOW_CHANGED_EVENT — that is fine and updates the UI.
 *
 * But then handleCompleteStage() also calls refreshWorkflowJobs(), which
 * dispatches fetchWorkflowJobs() → calls GET /api/workflow/jobs → the API
 * response arrives ~200-500 ms later.  At that point upsertWorkflowJob()
 * merges the API job into localStorage.  If the API hasn't persisted the
 * new currentStage yet (race condition), the API returns the OLD stage and
 * mergeStageKeysPreferCustom re-activates the wrong stage — this is the
 * visual "revert" the user sees.
 *
 * The fix: after a local advance, suppress the API-triggered upsert for
 * SUPPRESS_MS (1 500 ms).  The localStorage already has the correct state;
 * the suppression window gives MongoDB time to persist the write before we
 * allow the API response to merge back in.
 */

const SUPPRESS_MS = 1500; // ms to hold off API merge after a local advance

export function useWorkflowJobs() {
  const dispatch              = useDispatch();
  const apiLoading            = useSelector((state) => state.work?.workflowJobsLoading);
  const [jobs, setJobs]       = useState(() => loadWorkflowJobs());
  const [version, setVersion] = useState(0);

  // Timestamp after which API merges are allowed again
  const suppressUntilRef = useRef(0);

  const reloadFromStorage = useCallback(() => {
    const next = loadWorkflowJobs();
    setJobs(next);
    setVersion((v) => v + 1);
  }, []);

  /**
   * Called after a local stage advance so the next API refresh doesn't
   * immediately overwrite our optimistic localStorage state.
   */
  const suppressNextApiMerge = useCallback(() => {
    suppressUntilRef.current = Date.now() + SUPPRESS_MS;
  }, []);

  const refresh = useCallback(async () => {
    try {
      const apiJobs = await dispatch(fetchWorkflowJobs()).unwrap();
      if (Array.isArray(apiJobs)) {
        // ✅ Skip merge if we're inside the suppression window
        if (Date.now() < suppressUntilRef.current) {
          console.debug('[useWorkflowJobs] API merge suppressed — waiting for Mongo to settle');
          // Still reload from localStorage so any local writes are visible
          reloadFromStorage();
          return;
        }
        for (const raw of apiJobs) {
          upsertWorkflowJob(raw);
        }
      }
    } catch {
      /* keep local jobs when API unavailable */
    }
    reloadFromStorage();
  }, [dispatch, reloadFromStorage]);

  // Initial load
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Live-update from localStorage changes (including cross-tab via storage event)
  useEffect(() => {
    const onChange = () => reloadFromStorage();
    window.addEventListener(WORKFLOW_CHANGED_EVENT, onChange);
    window.addEventListener('storage', onChange);
    window.addEventListener('dreamfit-workflow-refresh', refresh);
    return () => {
      window.removeEventListener(WORKFLOW_CHANGED_EVENT, onChange);
      window.removeEventListener('storage', onChange);
      window.removeEventListener('dreamfit-workflow-refresh', refresh);
    };
  }, [reloadFromStorage]);

  return { jobs, refresh, loading: apiLoading, version, suppressNextApiMerge };
}

export default useWorkflowJobs;