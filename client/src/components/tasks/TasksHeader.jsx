import { Sparkles } from "lucide-react";

export default function TasksHeader() {
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
          Unassigned and assigned workflow jobs from real orders — assign workers and
          track stages through the couture pipeline.
        </p>
      </div>
    </div>
  );
}
