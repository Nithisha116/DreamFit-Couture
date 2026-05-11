import { DEPARTMENT_TABS } from "./taskConstants";

export default function DepartmentTabs({ activeDept, setActiveDept }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-thin -mx-1 px-1">
      {DEPARTMENT_TABS.map(({ tab }) => (
        <button
          key={tab}
          type="button"
          onClick={() => setActiveDept(tab)}
          className={`shrink-0 px-4 py-2 rounded-xl text-xs font-black tracking-wide transition-all duration-300 border ${
            activeDept === tab
              ? "bg-slate-900 text-white border-slate-900 shadow-lg"
              : "bg-white text-slate-500 border-slate-200 hover:border-blue-300 hover:text-blue-700"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
