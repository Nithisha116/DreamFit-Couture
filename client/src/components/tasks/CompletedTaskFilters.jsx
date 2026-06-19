import React, { useRef } from "react";
import GarmentPDF from "./GarmentPDF";
import { Search } from "lucide-react";
import { OUTFIT_TYPES } from "./taskConstants";

export default function CompletedTaskFilters({
  departmentEmployees,
  employeeFilter,
  setEmployeeFilter,
  outfitFilter,
  setOutfitFilter,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  search,
  setSearch,
  garment,
  order,
  job
}) {
  // Setup reference instance to link the download triggers cleanly
  const printEngineRef = useRef(null);

  return (
    <div className="rounded-2xl bg-white border border-slate-200/80 p-4 sm:p-5 mb-6 shadow-sm">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <div className="relative xl:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search task, customer, or order ID…"
            className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all"
          />
        </div>
        <select
          value={employeeFilter}
          onChange={(e) => setEmployeeFilter(e.target.value)}
          className="py-2.5 px-3 rounded-xl border border-slate-200 text-sm font-medium bg-white focus:ring-2 focus:ring-blue-500/30 outline-none"
        >
          <option value="">All employees</option>
          {departmentEmployees.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <select
          value={outfitFilter}
          onChange={(e) => setOutfitFilter(e.target.value)}
          className="py-2.5 px-3 rounded-xl border border-slate-200 text-sm font-medium bg-white focus:ring-2 focus:ring-blue-500/30 outline-none"
        >
          <option value="">All outfit types</option>
          {OUTFIT_TYPES.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="py-2.5 px-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/30 outline-none"
          aria-label="Completed from date"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="py-2.5 px-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/30 outline-none"
          aria-label="Completed to date"
        />
      </div>
      <p className="text-[11px] text-slate-400 mt-3">
        Date filters apply to completion date (UI only; refine with your backend
        later).
      </p>

      {/* Hidden layout printing target wrapper mapped context node definitions */}
      <GarmentPDF 
        ref={printEngineRef} 
        garment={garment} 
        order={order} 
        job={job} 
      />
    </div>
  );
}