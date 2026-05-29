import React from 'react';

// Maps backend enum status to pretty display names and colors for premium cards
export const STATUS_CONFIG = {
  'scheduled': { label: 'Pending', color: 'bg-orange-50 text-orange-700 border-orange-200', bar: 'bg-orange-500', shadow: 'hover:shadow-[0_0_12px_rgba(249,115,22,0.4)] hover:border-orange-400' },
  'confirmed': { label: 'Confirmed', color: 'bg-blue-50 text-blue-700 border-blue-200', bar: 'bg-blue-500', shadow: 'hover:shadow-[0_0_12px_rgba(59,130,246,0.4)] hover:border-blue-400' },
  'in-progress': { label: 'In Progress', color: 'bg-indigo-50 text-indigo-700 border-indigo-200', bar: 'bg-indigo-500', shadow: 'hover:shadow-[0_0_12px_rgba(99,102,241,0.4)] hover:border-indigo-400' },
  'completed': { label: 'Completed', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', bar: 'bg-emerald-500', shadow: 'hover:shadow-[0_0_12px_rgba(16,185,129,0.4)] hover:border-emerald-400' },
  'cancelled': { label: 'Cancelled', color: 'bg-red-50 text-red-700 border-red-200', bar: 'bg-red-500', shadow: 'hover:shadow-[0_0_12px_rgba(239,68,68,0.4)] hover:border-red-400' },
  'missed': { label: 'No Show', color: 'bg-slate-50 text-slate-700 border-slate-200', bar: 'bg-slate-500', shadow: 'hover:shadow-[0_0_12px_rgba(100,116,139,0.4)] hover:border-slate-400' },
  'rescheduled': { label: 'Rescheduled', color: 'bg-purple-50 text-purple-700 border-purple-200', bar: 'bg-purple-500', shadow: 'hover:shadow-[0_0_12px_rgba(168,85,247,0.4)] hover:border-purple-400' },
};

export default function StatusBadge({ status, className = "" }) {
  const config = STATUS_CONFIG[status] || { label: status, color: 'bg-gray-100 text-gray-700 border-gray-200' };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${config.color} ${className}`}>
      {config.label}
    </span>
  );
}
