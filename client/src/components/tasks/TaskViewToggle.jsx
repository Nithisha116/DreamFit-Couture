export default function TaskViewToggle({ view, setView }) {
  return (
    <div className="flex justify-center mb-6">
      <div
        className="inline-flex p-1 rounded-2xl bg-white/90 backdrop-blur border border-slate-200/80 shadow-sm"
        role="tablist"
        aria-label="Task view"
      >
        {[
          { id: "today", label: "Today's tasks" },
          { id: "completed", label: "Completed tasks" },
        ].map(({ id, label }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={view === id}
            onClick={() => setView(id)}
            className={`min-w-[140px] sm:min-w-[180px] px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
              view === id
                ? "bg-gradient-to-r from-[#1E6BFF] to-blue-600 text-white shadow-md"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
