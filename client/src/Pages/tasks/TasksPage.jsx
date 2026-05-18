import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import TasksHeader from "../../components/tasks/TasksHeader";
import TaskViewToggle from "../../components/tasks/TaskViewToggle";
import DepartmentTabs from "../../components/tasks/DepartmentTabs";
import TasksTable from "../../components/tasks/TasksTable";
import WorkloadPanel from "../../components/tasks/WorkloadPanel";
import AddTaskDrawer from "../../components/tasks/AddTaskDrawer";
import CompletedTaskFilters from "../../components/tasks/CompletedTaskFilters";
import {
  TAB_TO_KEY,
  EMPLOYEES_BY_DEPARTMENT,
} from "../../components/tasks/taskConstants";
import { buildInitialTasks } from "../../components/tasks/taskSeedData";
import { matchesCompletedTaskSearch } from "../../components/tasks/taskUtils";
import showToast from "../../utils/toast";

const LS_KEY = "dreamfit_boutique_tasks_v1";

const SEED_ORDER_IDS = {
  "seed-done-1": "#2026051210",
  "seed-done-2": "#2026051214",
  "seed-done-3": "#2026051215",
};

function hydrateTaskOrderIds(tasks) {
  return tasks.map((t, idx) => {
    if (t.orderId) return t;
    if (SEED_ORDER_IDS[t.id]) return { ...t, orderId: SEED_ORDER_IDS[t.id] };
    if (t.completed) {
      const d = t.completedAt ? new Date(t.completedAt) : new Date();
      const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
      return { ...t, orderId: `#${ymd}${String(idx + 1).padStart(2, "0")}` };
    }
    return { ...t, orderId: "" };
  });
}

function mergeMissingSeedTasks(tasks) {
  const seed = buildInitialTasks();
  const ids = new Set(tasks.map((t) => t.id));
  const missing = seed.filter((t) => !ids.has(t.id));
  if (!missing.length) return tasks;
  return [...tasks, ...missing];
}

function loadTasks() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return hydrateTaskOrderIds(mergeMissingSeedTasks(parsed));
    }
  } catch {
    /* ignore */
  }
  const seed = hydrateTaskOrderIds(buildInitialTasks());
  localStorage.setItem(LS_KEY, JSON.stringify(seed));
  return seed;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState(loadTasks);
  const [view, setView] = useState("today");
  const [activeDept, setActiveDept] = useState("EMBROIDERY");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchToday, setSearchToday] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [outfitFilter, setOutfitFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [searchCompleted, setSearchCompleted] = useState("");
  const [completingIds, setCompletingIds] = useState(() => new Set());
  const [justCompletedIds, setJustCompletedIds] = useState(() => new Set());
  const timersRef = useRef(new Map());

  const deptKey = TAB_TO_KEY[activeDept];
  const departmentEmployees = EMPLOYEES_BY_DEPARTMENT[deptKey] || [];

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((id) => clearTimeout(id));
      timersRef.current.clear();
    };
  }, []);

  const persist = useCallback((updater) => {
    setTasks((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      return next;
    });
  }, []);

  const onAssignChange = (taskId, name) => {
    persist((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              assignedTo: name,
              status: name ? "ASSIGNED" : "UNASSIGNED",
            }
          : t,
      ),
    );
  };

  const onMarkComplete = (taskId) => {
    if (completingIds.has(taskId)) return;
    setCompletingIds((s) => new Set(s).add(taskId));
    setJustCompletedIds((s) => new Set(s).add(taskId));
    showToast.success("Marked complete on floor");

    const t1 = setTimeout(() => {
      persist((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, completed: true, completedAt: Date.now() }
            : t,
        ),
      );
      setJustCompletedIds((s) => {
        const n = new Set(s);
        n.delete(taskId);
        return n;
      });
      setCompletingIds((s) => {
        const n = new Set(s);
        n.delete(taskId);
        return n;
      });
    }, 2000);
    timersRef.current.set(taskId, t1);
  };

  const onSaveNew = (payload) => {
    const id = `t-${Date.now()}`;
    persist((prev) => [
      {
        id,
        customerName: payload.customerName,
        outfitType: payload.outfitType,
        title: payload.title,
        description: payload.description || "",
        departmentKey: payload.departmentKey,
        status: payload.assignedTo ? "ASSIGNED" : "UNASSIGNED",
        assignedTo: payload.assignedTo || "",
        previousTaskStatus: "New intake",
        estimatedHours: payload.estimatedHours,
        priority: payload.priority,
        completed: false,
        completedAt: null,
        deadline: payload.deadline,
        orderId: payload.orderId || "",
        notes: payload.notes || "",
      },
      ...prev,
    ]);
    showToast.success("Task created");
  };

  const matchesDate = (ts) => {
    if (!ts) return true;
    const d = new Date(ts);
    if (dateFrom) {
      const from = new Date(dateFrom);
      from.setHours(0, 0, 0, 0);
      if (d < from) return false;
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      if (d > to) return false;
    }
    return true;
  };

  const filteredRows = useMemo(() => {
    const inDept = tasks.filter((t) => t.departmentKey === deptKey);
    if (view === "today") {
      return inDept.filter(
        (t) =>
          (!t.completed || justCompletedIds.has(t.id)) &&
          `${t.title} ${t.customerName}`
            .toLowerCase()
            .includes(searchToday.trim().toLowerCase()),
      );
    }
    return inDept.filter((t) => {
      if (!t.completed) return false;
      if (employeeFilter && t.assignedTo !== employeeFilter) return false;
      if (outfitFilter && t.outfitType !== outfitFilter) return false;
      if (!matchesDate(t.completedAt)) return false;
      return matchesCompletedTaskSearch(t, searchCompleted);
    });
  }, [
    tasks,
    deptKey,
    view,
    employeeFilter,
    outfitFilter,
    dateFrom,
    dateTo,
    searchCompleted,
    searchToday,
    justCompletedIds,
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 lg:py-8">
        <TasksHeader onAddTask={() => setDrawerOpen(true)} />

        <TaskViewToggle view={view} setView={setView} />

        <DepartmentTabs activeDept={activeDept} setActiveDept={setActiveDept} />

        {view === "today" && (
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={searchToday}
                onChange={(e) => setSearchToday(e.target.value)}
                placeholder="Filter today's tasks…"
                className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm text-sm focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400 outline-none transition-all"
              />
              <SlidersHorizontal className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
            </div>
          </div>
        )}

        {view === "completed" && (
          <CompletedTaskFilters
            departmentEmployees={departmentEmployees}
            employeeFilter={employeeFilter}
            setEmployeeFilter={setEmployeeFilter}
            outfitFilter={outfitFilter}
            setOutfitFilter={setOutfitFilter}
            dateFrom={dateFrom}
            setDateFrom={setDateFrom}
            dateTo={dateTo}
            setDateTo={setDateTo}
            search={searchCompleted}
            setSearch={setSearchCompleted}
          />
        )}

        <div className="flex flex-col xl:flex-row gap-6 items-start">
          <TasksTable
            rows={filteredRows}
            departmentKey={deptKey}
            departmentEmployees={departmentEmployees}
            allTasks={tasks}
            onAssignChange={onAssignChange}
            onMarkComplete={onMarkComplete}
            completingIds={completingIds}
            justCompletedIds={justCompletedIds}
            view={view}
          />
          <WorkloadPanel
            departmentKey={deptKey}
            employees={departmentEmployees}
            tasks={tasks}
          />
        </div>
      </div>

      <AddTaskDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSave={onSaveNew}
      />
    </div>
  );
}
