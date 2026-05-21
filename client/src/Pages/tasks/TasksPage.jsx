import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search, SlidersHorizontal } from "lucide-react";
import { useLocation } from "react-router-dom";
import TasksHeader from "../../components/tasks/TasksHeader";
import TaskViewToggle from "../../components/tasks/TaskViewToggle";
import DepartmentTabs from "../../components/tasks/DepartmentTabs";
import WorkloadPanel from "../../components/tasks/WorkloadPanel";
import UnassignedTaskCards from "../../components/workflow/UnassignedTaskCards";
import AssignedTaskCards from "../../components/workflow/AssignedTaskCards";
import AssignWorkerModal from "../../components/workflow/AssignWorkerModal";
import {
  TAB_TO_KEY,
  EMPLOYEES_BY_DEPARTMENT,
} from "../../components/tasks/taskConstants";
import { fetchRecentWorks, selectRecentWorks } from "../../features/work/workSlice";
import useWorkflowJobs from "../../hooks/useWorkflowJobs";
import { STAGE_TO_DEPARTMENT } from "../../workflow/workflowConstants";
import { getActiveStageKey } from "../../workflow/workflowEngine";
import {
  filterAssignedJobs,
  filterJobsByDepartment,
  filterUnassignedJobs,
  sortJobsForDisplay,
} from "../../workflow/workflowSelectors";
import showToast from "../../utils/toast";

export default function TasksPage() {
  const dispatch = useDispatch();
  const location = useLocation();
  const recentWorks = useSelector(selectRecentWorks) || [];
  const { user } = useSelector((state) => state.auth);
  const basePath = user?.role === "STORE_KEEPER" ? "/storekeeper" : "/admin";

  const { jobs, refresh, version } = useWorkflowJobs(recentWorks);

  const [view, setView] = useState(location.state?.view || "unassigned");
  const [activeDept, setActiveDept] = useState("ALL");
  const [search, setSearch] = useState("");
  const [assignJob, setAssignJob] = useState(null);

  const deptKey = TAB_TO_KEY[activeDept];
  const departmentEmployees = EMPLOYEES_BY_DEPARTMENT[deptKey] || [];

  useEffect(() => {
    dispatch(fetchRecentWorks({ limit: 200 }));
  }, [dispatch]);

  useEffect(() => {
    if (location.state?.view) setView(location.state.view);
    if (location.state?.refreshWorkflow) {
      dispatch(fetchRecentWorks({ limit: 200 })).then(() => refresh());
    }
  }, [location.state, dispatch, refresh]);

  const matchesSearch = (job) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return `${job.orderId} ${job.garmentName} ${job.customerName} ${job.workCode}`
      .toLowerCase()
      .includes(q);
  };

  const filteredJobs = useMemo(() => {
    let list = jobs;
    if (view === "unassigned") list = filterUnassignedJobs(jobs);
    else list = filterAssignedJobs(jobs);

    list = filterJobsByDepartment(list, deptKey);
    list = sortJobsForDisplay(list);
    return list.filter(matchesSearch);
  }, [jobs, view, deptKey, search, version]);

  const workloadTasks = useMemo(() => {
    return jobs
      .filter((j) => j.lifecycleStatus === "open")
      .filter((j) => !deptKey || deptKey === "all" || STAGE_TO_DEPARTMENT[getActiveStageKey(j)] === deptKey)
      .map((j) => {
        const assignee = j.stages?.[getActiveStageKey(j)]?.assignedTo;
        return {
          id: j.workflowTrackingId,
          departmentKey: deptKey || STAGE_TO_DEPARTMENT[getActiveStageKey(j)],
          completed: false,
          assignedTo: assignee?.name?.toLowerCase() || "",
          estimatedHours: 2,
        };
      });
  }, [jobs, deptKey, version]);

  const onAssigned = () => {
    refresh();
    showToast.success("Worker assigned — task moved to Assigned");
    setView("assigned");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 lg:py-8">
        <TasksHeader />

        <TaskViewToggle view={view} setView={setView} />

        <DepartmentTabs activeDept={activeDept} setActiveDept={setActiveDept} />

        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                view === "unassigned"
                  ? "Search unassigned tasks…"
                  : "Search assigned tasks…"
              }
              className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm text-sm focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400 outline-none transition-all"
            />
            <SlidersHorizontal className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-6 items-start">
          <div className="flex-1 min-w-0 w-full">
            {view === "unassigned" && (
              <UnassignedTaskCards
                jobs={filteredJobs}
                basePath={basePath}
                onAssign={(job) => setAssignJob(job)}
              />
            )}
            {view === "assigned" && (
              <AssignedTaskCards jobs={filteredJobs} basePath={basePath} />
            )}
          </div>
          <WorkloadPanel
            departmentKey={deptKey || "all"}
            employees={departmentEmployees}
            tasks={workloadTasks}
          />
        </div>
      </div>

      <AssignWorkerModal
        job={assignJob}
        open={Boolean(assignJob)}
        onClose={() => setAssignJob(null)}
        onAssigned={onAssigned}
      />
    </div>
  );
}
