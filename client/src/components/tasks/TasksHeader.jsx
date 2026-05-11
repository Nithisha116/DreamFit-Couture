import { Plus, Sparkles } from "lucide-react";

export default function TasksHeader({ onAddTask }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-700 mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Production
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Tasks
        </h1>
        <p className="text-slate-500 mt-1 text-sm sm:text-base max-w-xl">
          Assign work by department, monitor workload, and complete the couture
          pipeline without leaving this view.
        </p>
      </div>
      <button
        type="button"
        onClick={onAddTask}
        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1E6BFF] text-white font-bold text-sm px-5 py-3 shadow-lg shadow-blue-600/25 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-300 active:scale-[0.98]"
      >
        <Plus className="w-5 h-5" />
        Add new task
      </button>
    </div>
  );
}
