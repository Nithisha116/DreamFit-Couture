import { useCallback, useEffect, useState } from "react";
import { WORKFLOW_CHANGED_EVENT } from "../workflow/workflowConstants";
import { syncWorksToWorkflowJobs } from "../workflow/workflowEngine";
import { loadWorkflowJobs } from "../workflow/workflowStorage";
import { loadBoutiqueTasks } from "../utils/deliveryPipelineUtils";

/**
 * Reactive workflow job list — SSOT for Tasks + Delivery Pipeline.
 */
export function useWorkflowJobs(works = []) {
  const [jobs, setJobs] = useState(() => loadWorkflowJobs());
  const [version, setVersion] = useState(0);

  const refresh = useCallback(() => {
    const boutiqueTasks = loadBoutiqueTasks();
    if (works?.length) {
      syncWorksToWorkflowJobs(works, boutiqueTasks);
    }
    setJobs(loadWorkflowJobs());
    setVersion((v) => v + 1);
  }, [works]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onChange = () => {
      setJobs(loadWorkflowJobs());
      setVersion((v) => v + 1);
    };
    window.addEventListener(WORKFLOW_CHANGED_EVENT, onChange);
    return () => window.removeEventListener(WORKFLOW_CHANGED_EVENT, onChange);
  }, []);

  return { jobs, refresh, version };
}

export default useWorkflowJobs;
